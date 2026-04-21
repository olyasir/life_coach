export interface ExercisePayload {
  exerciseId: string;
  title: string;
  instructions: string;
  config?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  exercise?: ExercisePayload;
  preview?: boolean;
}

export interface MessageResponse {
  assistantText: string;
  exercises: ExercisePayload[];
  sessionClosed: { summary: string; readyForNext: boolean } | null;
  currentSession: number;
}
