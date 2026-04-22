import type { MessageResponse } from "./types";

const TOKEN_KEY = "coach_session_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface SessionUser {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  isTestUser: boolean;
}

export interface LockStatus {
  locked: boolean;
  currentSession: number;
  unlocksAt?: string;
  previousCompletedAt?: string;
}

export interface MeResponse {
  user: SessionUser;
  journal: {
    currentSession: number;
    profile: { name?: string };
  };
  lock: LockStatus;
}

export class UnauthorizedError extends Error {}
export class LockedError extends Error {
  constructor(public lock: LockStatus) {
    super("session locked");
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearToken();
    throw new UnauthorizedError("unauthorized");
  }
  if (res.status === 423) {
    const body = await res.json().catch(() => ({}));
    throw new LockedError(body.lock as LockStatus);
  }
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function authWithGoogle(idToken: string): Promise<{
  token: string;
  user: SessionUser;
}> {
  const res = await fetch(`/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error(`google auth failed: ${res.status}`);
  return res.json();
}

export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`/api/me`, { headers: authHeaders() });
  return handleResponse<MeResponse>(res);
}

export async function getLockStatus(): Promise<LockStatus> {
  const res = await fetch(`/api/lock-status`, { headers: authHeaders() });
  return handleResponse<LockStatus>(res);
}

export async function sendMessage(text: string): Promise<MessageResponse> {
  const res = await fetch(`/api/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ text }),
  });
  return handleResponse<MessageResponse>(res);
}

export async function submitExercise(
  exerciseId: string,
  data: unknown,
): Promise<{ assistantText: string }> {
  const res = await fetch(`/api/exercise`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ exerciseId, data }),
  });
  return handleResponse<{ assistantText: string }>(res);
}

export async function getJournal(): Promise<{
  currentSession: number;
  profile: { name?: string };
}> {
  const res = await fetch(`/api/journal`, { headers: authHeaders() });
  return handleResponse<{ currentSession: number; profile: { name?: string } }>(res);
}

export async function gotoSession(sessionNumber: number): Promise<void> {
  const res = await fetch(`/api/debug/goto`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ sessionNumber }),
  });
  if (!res.ok) throw new Error(`goto failed: ${res.status}`);
}

export async function resetJournal(): Promise<void> {
  const res = await fetch(`/api/debug/reset`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`reset failed: ${res.status}`);
}
