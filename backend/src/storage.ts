import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type {
  ExerciseResult,
  Memory,
  MemoryKind,
  SessionBrief,
  SessionRecord,
  SessionReflection,
  UserJournal,
} from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "../data");

function journalPath(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadJournal(userId: string): Promise<UserJournal> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(journalPath(userId), "utf8");
    return JSON.parse(raw) as UserJournal;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return createJournal(userId);
    }
    throw err;
  }
}

export async function saveJournal(journal: UserJournal): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    journalPath(journal.userId),
    JSON.stringify(journal, null, 2),
    "utf8",
  );
}

export function createJournal(userId: string): UserJournal {
  const now = new Date().toISOString();
  return {
    userId,
    createdAt: now,
    currentSession: 1,
    sessions: [
      {
        sessionNumber: 1,
        startedAt: now,
        turns: [],
      },
    ],
    exercises: [],
    memories: [],
    profile: {},
  };
}

export function currentSessionRecord(journal: UserJournal): SessionRecord {
  let rec = journal.sessions.find(
    (s) => s.sessionNumber === journal.currentSession,
  );
  if (!rec) {
    rec = {
      sessionNumber: journal.currentSession,
      startedAt: new Date().toISOString(),
      turns: [],
    };
    journal.sessions.push(rec);
  }
  return rec;
}

export function appendMemory(
  journal: UserJournal,
  args: {
    kind: MemoryKind;
    text: string;
    tags?: string[];
    followUpInSession?: number;
    supersedesId?: string;
  },
): Memory {
  const memory: Memory = {
    id: randomUUID(),
    kind: args.kind,
    sessionNumber: journal.currentSession,
    text: args.text,
    tags: args.tags,
    createdAt: new Date().toISOString(),
  };
  if (args.kind === "commitment") {
    memory.commitment = {
      followUpInSession: args.followUpInSession ?? journal.currentSession + 1,
      status: "open",
    };
  }
  if (args.supersedesId) {
    const prev = journal.memories.find((m) => m.id === args.supersedesId);
    if (prev) prev.supersededBy = memory.id;
  }
  journal.memories.push(memory);
  return memory;
}

export function resolveCommitment(
  journal: UserJournal,
  memoryId: string,
  status: "done" | "missed" | "dropped",
  note?: string,
): Memory | undefined {
  const mem = journal.memories.find((m) => m.id === memoryId);
  if (!mem || mem.kind !== "commitment" || !mem.commitment) return undefined;
  mem.commitment.status = status;
  mem.commitment.resolvedAt = new Date().toISOString();
  if (note) mem.commitment.resolvedNote = note;
  return mem;
}

export function openCommitments(journal: UserJournal): Memory[] {
  return journal.memories.filter(
    (m) => m.kind === "commitment" && m.commitment?.status === "open",
  );
}

export function activeMemories(journal: UserJournal): Memory[] {
  return journal.memories.filter((m) => !m.supersededBy);
}

export function appendExercise(
  journal: UserJournal,
  exerciseId: string,
  data: unknown,
): ExerciseResult {
  const result: ExerciseResult = {
    exerciseId,
    sessionNumber: journal.currentSession,
    data,
    completedAt: new Date().toISOString(),
  };
  journal.exercises.push(result);
  return result;
}

export function completeCurrentSession(
  journal: UserJournal,
  summary: string,
): SessionRecord {
  const rec = currentSessionRecord(journal);
  rec.completedAt = new Date().toISOString();
  rec.summary = summary;
  return rec;
}

export function advanceToNextSession(journal: UserJournal): void {
  if (journal.currentSession < 12) {
    journal.currentSession += 1;
    journal.sessions.push({
      sessionNumber: journal.currentSession,
      startedAt: new Date().toISOString(),
      turns: [],
    });
  }
}

export function attachReflection(
  rec: SessionRecord,
  reflection: SessionReflection,
): void {
  rec.reflection = reflection;
}

export function attachPreSessionBrief(
  rec: SessionRecord,
  brief: SessionBrief,
): void {
  rec.preSessionBrief = brief;
}
