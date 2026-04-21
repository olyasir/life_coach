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
  if (exerciseId === "s5_assets_bank" && isObj(data) && Array.isArray((data as any).selected)) {
    const picks = (data as { selected: string[] }).selected;
    return `Client selected ${picks.length} assets/strengths from the bank:\n${picks.map((p) => `- ${p}`).join("\n")}`;
  }
  if (exerciseId === "s5_strengths_inventory" && isObj(data) && isObj((data as any).scores)) {
    const scores = (data as { scores: Record<string, number> }).scores;
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const byBand = (n: number) => entries.filter(([, v]) => v === n).map(([k]) => k);
    const four = byBand(4);
    const three = byBand(3);
    const two = byBand(2);
    const one = byBand(1);
    const lines: string[] = [];
    lines.push(`Client completed the 34-item Clifton strengths inventory.`);
    if (four.length) lines.push(`Score 4 (very strongly): ${four.join(", ")}`);
    if (three.length) lines.push(`Score 3 (strongly): ${three.join(", ")}`);
    if (two.length) lines.push(`Score 2 (somewhat): ${two.join(", ")}`);
    if (one.length) lines.push(`Score 1 (barely): ${one.join(", ")}`);
    return lines.join("\n");
  }
  if (exerciseId === "s6_values_bank" && isObj(data) && Array.isArray((data as any).selected)) {
    const picks = (data as { selected: string[] }).selected;
    return `Client selected ${picks.length} values from the bank:\n${picks.map((p) => `- ${p}`).join("\n")}`;
  }
  if (exerciseId === "s7_six_needs_reflection" && isObj(data) && Array.isArray((data as any).needs)) {
    const d = data as {
      needs: Array<{ name: string; manifestation: string; importance: number; fulfillment: number }>;
      mostImportant: string;
      leastImportant: string;
      learning?: string;
    };
    const withGap = d.needs.map((n) => ({ ...n, gap: n.importance - n.fulfillment }));
    const sortedByGap = [...withGap].sort((a, b) => b.gap - a.gap || b.importance - a.importance);
    const lines: string[] = [];
    lines.push(`Client completed the Robbins-Madanes six universal needs reflection.`);
    lines.push(``);
    lines.push(`How each need shows up in their life:`);
    for (const n of d.needs) {
      lines.push(`- ${n.name} (importance ${n.importance}/10, fulfilled ${n.fulfillment}/10, gap ${n.importance - n.fulfillment}):`);
      lines.push(`    ${n.manifestation}`);
    }
    lines.push(``);
    lines.push(`Most important to client: ${d.mostImportant}`);
    lines.push(`Least important to client: ${d.leastImportant}`);
    if (d.learning) lines.push(`Client's own learning: ${d.learning}`);
    lines.push(``);
    lines.push(`Needs sorted by gap (largest first — biggest gap is priority for homework):`);
    for (const n of sortedByGap) {
      lines.push(`- ${n.name}: gap ${n.gap} (imp ${n.importance}, got ${n.fulfillment})`);
    }
    return lines.join("\n");
  }
  if (exerciseId === "s7_yes_i_can") {
    return `Client acknowledged the Yes-I-Can integrating summary. Ask the landing question: "seeing all of this together — what do you notice?" Save their response as a realization memory.`;
  }
  if (exerciseId === "s8_goal_canvas" && isObj(data)) {
    const d = data as {
      goalStatement: string;
      valueHonored: string;
      needMet: string;
      targetDate: string;
      passion: number;
      willingToDo: string;
      priceWillingToPay: string;
      coreTest: { confirmed: boolean; note: string };
      ecologicalTest: { confirmed: boolean; note: string };
      realityTest: { confirmed: boolean; note: string };
    };
    const lines: string[] = [];
    lines.push(`Client finalized their S8 GOAL on the canvas.`);
    lines.push(``);
    lines.push(`GOAL STATEMENT: ${d.goalStatement}`);
    lines.push(`TARGET DATE: ${d.targetDate}`);
    lines.push(`VALUE HONORED: ${d.valueHonored}`);
    lines.push(`NEED MET: ${d.needMet}`);
    lines.push(`PASSION: ${d.passion}/10`);
    lines.push(``);
    lines.push(`WILLING TO DO: ${d.willingToDo}`);
    lines.push(`PRICE WILLING TO PAY: ${d.priceWillingToPay}`);
    lines.push(``);
    lines.push(`Quality tests:`);
    lines.push(`- CORE (values/beliefs): ${d.coreTest.confirmed ? "✓" : "✗"} — ${d.coreTest.note}`);
    lines.push(`- ECOLOGICAL (others affected): ${d.ecologicalTest.confirmed ? "✓" : "✗"} — ${d.ecologicalTest.note}`);
    lines.push(`- REALITY (resources): ${d.realityTest.confirmed ? "✓" : "✗"} — ${d.realityTest.note}`);
    lines.push(``);
    lines.push(`Save the final goal statement as a HIGH-CONFIDENCE fact memory. Then move into the s8_ten_reasons exercise.`);
    return lines.join("\n");
  }
  if (exerciseId === "s8_ten_reasons" && isObj(data) && Array.isArray((data as any).reasons)) {
    const d = data as { goal: string; reasons: string[] };
    const lines: string[] = [];
    lines.push(`Client completed the TEN REASONS exercise.`);
    if (d.goal) {
      lines.push(``);
      lines.push(`Goal: ${d.goal}`);
    }
    lines.push(``);
    lines.push(`Their ten reasons:`);
    d.reasons.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push(``);
    lines.push(`Read them carefully. Reflect back the PATTERN/theme across the ten (not a read-back). Then ask which reason has the most CHARGE — the one they'd put on their wall. Save that as a realization memory.`);
    return lines.join("\n");
  }
  if (exerciseId === "s6_values_assessment" && isObj(data) && Array.isArray((data as any).values)) {
    const values = (data as {
      values: Array<{ name: string; meaning: string; currentExpression: number; action: string }>;
    }).values;
    const sorted = [...values].sort((a, b) => a.currentExpression - b.currentExpression);
    const lines: string[] = [];
    lines.push(`Client's TOP 5 values (sorted by gap — lowest expressed first):`);
    for (const v of sorted) {
      lines.push(`- ${v.name} (${v.currentExpression}/10)`);
      lines.push(`    Means to them: ${v.meaning}`);
      lines.push(`    What they'd do to live it more: ${v.action}`);
    }
    const lowest = sorted[0];
    if (lowest) {
      lines.push(``);
      lines.push(`GAP: lowest-expressed top value is "${lowest.name}" at ${lowest.currentExpression}/10 — this is the priority for today's homework.`);
    }
    return lines.join("\n");
  }
  if (isObj(data)) {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `- ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("\n");
    }
  }
  return JSON.stringify(data, null, 2);
}

function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
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
