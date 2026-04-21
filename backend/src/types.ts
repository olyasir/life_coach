export type Role = "user" | "assistant";

export interface ChatTurn {
  role: Role;
  content: string;
  timestamp: string;
}

export interface ExerciseResult {
  exerciseId: string;
  sessionNumber: number;
  data: unknown;
  completedAt: string;
}

export type MemoryKind =
  | "fact"
  | "feeling"
  | "commitment"
  | "realization"
  | "person";

export interface Memory {
  id: string;
  kind: MemoryKind;
  sessionNumber: number;
  text: string;
  tags?: string[];
  createdAt: string;
  supersededBy?: string;
  commitment?: {
    followUpInSession?: number;
    status: "open" | "done" | "missed" | "dropped";
    resolvedAt?: string;
    resolvedNote?: string;
  };
}

export interface SessionReflection {
  summary: string;
  keyThemes: string[];
  threadsToExplore: string[];
  clientObservations: string[];
  nextSessionFocus: string;
  internalNotes?: string;
  createdAt: string;
}

export interface SessionBrief {
  openingMove: string;
  personalAdjustments: string[];
  watchFor: string[];
  callBacks: string[];
  exerciseConfigHints: string;
  coreIssueFrame?: string;
  createdAt: string;
}

export interface SessionRecord {
  sessionNumber: number;
  startedAt: string;
  completedAt?: string;
  summary?: string;
  reflection?: SessionReflection;
  preSessionBrief?: SessionBrief;
  turns: ChatTurn[];
}

export interface UserJournal {
  userId: string;
  createdAt: string;
  currentSession: number;
  sessions: SessionRecord[];
  exercises: ExerciseResult[];
  memories: Memory[];
  profile: {
    name?: string;
    language?: "en" | "he";
  };
}

export interface RenderExerciseArgs {
  exerciseId: string;
  title: string;
  instructions: string;
  config?: Record<string, unknown>;
}

export interface SaveMemoryArgs {
  kind: MemoryKind;
  text: string;
  tags?: string[];
  followUpInSession?: number;
  supersedesId?: string;
}

export interface ResolveCommitmentArgs {
  memoryId: string;
  status: "done" | "missed" | "dropped";
  note?: string;
}

export interface CompleteSessionArgs {
  summary: string;
  readyForNext: boolean;
}
