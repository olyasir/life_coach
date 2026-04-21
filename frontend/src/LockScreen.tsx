import { useEffect, useState } from "react";
import type { LockStatus, SessionUser } from "./api";
import { clearToken } from "./api";

interface Props {
  user: SessionUser;
  lock: LockStatus;
  onUnlocked: () => void;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "ready";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function LockScreen({ user, lock, onUnlocked }: Props) {
  const unlocksAt = lock.unlocksAt ? new Date(lock.unlocksAt).getTime() : 0;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (unlocksAt && now >= unlocksAt) onUnlocked();
  }, [now, unlocksAt, onUnlocked]);

  const remaining = unlocksAt - now;
  const unlocksAtLocal = unlocksAt
    ? new Date(unlocksAt).toLocaleString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf7f0",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "white",
          padding: "40px 32px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>🌱</div>
        <h1 style={{ margin: "0 0 8px", color: "#2a5d4e", fontSize: 22 }}>
          Session {lock.currentSession} opens soon
        </h1>
        <p
          style={{
            margin: "0 0 22px",
            color: "#666",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Hi{user.name ? `, ${user.name.split(" ")[0]}` : ""}. Coaching works
          best with space between sessions — time for the last one to land and
          for your homework to live in the week. Your next session unlocks{" "}
          <b style={{ color: "#2a5d4e" }}>{unlocksAtLocal}</b>.
        </p>

        <div
          style={{
            padding: "18px 20px",
            background: "#f5f1e6",
            border: "1px solid #d8d3c4",
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "#888",
              marginBottom: 6,
            }}
          >
            unlocks in
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#2a5d4e",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatRemaining(remaining)}
          </div>
        </div>

        <p
          style={{
            margin: "0 0 0",
            color: "#888",
            fontSize: 12,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          In the meantime — keep practicing what we named last time. The
          homework is where the real work happens.
        </p>

        <button
          onClick={() => {
            clearToken();
            window.location.reload();
          }}
          style={{
            marginTop: 24,
            padding: "6px 12px",
            background: "transparent",
            border: "1px solid #d8d3c4",
            borderRadius: 8,
            color: "#888",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          sign out
        </button>
      </div>
    </div>
  );
}
