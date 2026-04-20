import type { MessageResponse } from "./types";

export async function sendMessage(userId: string, text: string): Promise<MessageResponse> {
  const res = await fetch(`/api/message/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`message failed: ${res.status}`);
  return res.json();
}

export async function submitExercise(
  userId: string,
  exerciseId: string,
  data: unknown,
): Promise<{ assistantText: string }> {
  const res = await fetch(`/api/exercise/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exerciseId, data }),
  });
  if (!res.ok) throw new Error(`exercise failed: ${res.status}`);
  return res.json();
}

export async function getJournal(userId: string): Promise<{
  currentSession: number;
  profile: { name?: string };
}> {
  const res = await fetch(`/api/journal/${userId}`);
  if (!res.ok) throw new Error(`journal failed: ${res.status}`);
  return res.json();
}

export async function gotoSession(userId: string, sessionNumber: number): Promise<void> {
  const res = await fetch(`/api/debug/goto/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionNumber }),
  });
  if (!res.ok) throw new Error(`goto failed: ${res.status}`);
}

export async function resetJournal(userId: string): Promise<void> {
  const res = await fetch(`/api/debug/reset/${userId}`, { method: "POST" });
  if (!res.ok) throw new Error(`reset failed: ${res.status}`);
}
