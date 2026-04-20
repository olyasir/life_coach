import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { reflectOnSession, runCoachTurn } from "./coach.js";
import {
  advanceToNextSession,
  appendExercise,
  appendMemory,
  attachReflection,
  completeCurrentSession,
  currentSessionRecord,
  loadJournal,
  resolveCommitment,
  saveJournal,
} from "./storage.js";
import type { ChatTurn } from "./types.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/journal/:userId", async (req, res) => {
  const journal = await loadJournal(req.params.userId);
  res.json(journal);
});

app.post("/api/debug/goto/:userId", async (req, res) => {
  const n = Number(req.body?.sessionNumber);
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    return res.status(400).json({ error: "sessionNumber must be 1-12" });
  }
  const journal = await loadJournal(req.params.userId);
  journal.currentSession = n;
  if (!journal.sessions.find((s) => s.sessionNumber === n)) {
    journal.sessions.push({
      sessionNumber: n,
      startedAt: new Date().toISOString(),
      turns: [],
    });
  }
  await saveJournal(journal);
  res.json({ currentSession: journal.currentSession });
});

app.post("/api/debug/reset/:userId", async (req, res) => {
  const journal = await loadJournal(req.params.userId);
  journal.currentSession = 1;
  journal.sessions = [
    { sessionNumber: 1, startedAt: new Date().toISOString(), turns: [] },
  ];
  journal.memories = [];
  journal.exercises = [];
  await saveJournal(journal);
  res.json({ ok: true });
});

app.post("/api/profile/:userId", async (req, res) => {
  const journal = await loadJournal(req.params.userId);
  const { name, language } = req.body ?? {};
  if (typeof name === "string") journal.profile.name = name;
  if (language === "en" || language === "he") journal.profile.language = language;
  await saveJournal(journal);
  res.json(journal);
});

app.post("/api/message/:userId", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  const journal = await loadJournal(req.params.userId);
  const sessionRec = currentSessionRecord(journal);

  const userTurn: ChatTurn = {
    role: "user",
    content: text,
    timestamp: new Date().toISOString(),
  };
  sessionRec.turns.push(userTurn);

  try {
    const result = await runCoachTurn(journal, sessionRec.turns);

    const exercisesToRender: Array<{
      exerciseId: string;
      title: string;
      instructions: string;
      config?: Record<string, unknown>;
    }> = [];

    let sessionClosed: { summary: string; readyForNext: boolean } | null = null;

    for (const call of result.toolCalls) {
      if (call.tool === "render_exercise") {
        exercisesToRender.push({
          exerciseId: call.args.exerciseId,
          title: call.args.title,
          instructions: call.args.instructions,
          config: call.args.config as Record<string, unknown> | undefined,
        });
      } else if (call.tool === "save_memory") {
        appendMemory(journal, call.args);
      } else if (call.tool === "resolve_commitment") {
        resolveCommitment(
          journal,
          call.args.memoryId,
          call.args.status,
          call.args.note,
        );
      } else if (call.tool === "complete_session") {
        sessionClosed = { summary: call.args.summary, readyForNext: call.args.readyForNext };
      }
    }

    if (result.assistantText) {
      sessionRec.turns.push({
        role: "assistant",
        content: result.assistantText,
        timestamp: new Date().toISOString(),
      });
    }

    if (sessionClosed) {
      const completedRec = completeCurrentSession(journal, sessionClosed.summary);
      try {
        const reflection = await reflectOnSession(journal, completedRec.turns);
        if (reflection) attachReflection(completedRec, reflection);
      } catch (err) {
        console.error("reflection failed", err);
      }
      advanceToNextSession(journal);
    }

    await saveJournal(journal);

    res.json({
      assistantText: result.assistantText,
      exercises: exercisesToRender,
      sessionClosed,
      currentSession: journal.currentSession,
    });
  } catch (err) {
    console.error("coach turn failed", err);
    res.status(500).json({ error: "coach turn failed" });
  }
});

app.post("/api/exercise/:userId", async (req, res) => {
  const { exerciseId, data } = req.body ?? {};
  if (typeof exerciseId !== "string") {
    return res.status(400).json({ error: "exerciseId required" });
  }
  const journal = await loadJournal(req.params.userId);
  const sessionRec = currentSessionRecord(journal);

  appendExercise(journal, exerciseId, data);

  const formatted = formatExerciseResults(exerciseId, data);
  const summary = `[The client just completed the "${exerciseId}" exercise. Their responses:

${formatted}

Read their responses carefully. Pick the one answer that feels most alive, revealing, or incomplete — and ask ONE open-ended follow-up question to explore it. Do not thank them or ask if they want to continue. Move straight into the work.]`;
  sessionRec.turns.push({
    role: "user",
    content: summary,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await runCoachTurn(journal, sessionRec.turns);
    if (result.assistantText) {
      sessionRec.turns.push({
        role: "assistant",
        content: result.assistantText,
        timestamp: new Date().toISOString(),
      });
    }
    for (const call of result.toolCalls) {
      if (call.tool === "save_memory") {
        appendMemory(journal, call.args);
      } else if (call.tool === "resolve_commitment") {
        resolveCommitment(
          journal,
          call.args.memoryId,
          call.args.status,
          call.args.note,
        );
      }
    }
    await saveJournal(journal);
    res.json({ assistantText: result.assistantText });
  } catch (err) {
    console.error("exercise follow-up failed", err);
    res.status(500).json({ error: "follow-up failed" });
  }
});

function formatExerciseResults(exerciseId: string, data: unknown): string {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `- ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("\n");
    }
  }
  return JSON.stringify(data, null, 2);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.resolve(__dirname, "../../frontend/dist");

import { existsSync } from "node:fs";
if (existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`coach backend listening on :${PORT}`);
  if (existsSync(FRONTEND_DIST)) {
    console.log(`serving frontend from ${FRONTEND_DIST}`);
  } else {
    console.log(`frontend/dist not found — run 'npm run build' in frontend/`);
  }
});
