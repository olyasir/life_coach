import { useEffect, useRef, useState } from "react";
import { getJournal, gotoSession, resetJournal, sendMessage, submitExercise } from "./api";
import WheelOfLife from "./exercises/WheelOfLife";
import Scale from "./exercises/Scale";
import CardSort from "./exercises/CardSort";
import IntakeForm from "./exercises/IntakeForm";
import LifeTimeline from "./exercises/LifeTimeline";
import type { ExercisePayload, Message } from "./types";

function getOrCreateUserId(): string {
  const KEY = "coach_user_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

const USER_ID = getOrCreateUserId();

function ExerciseRenderer({
  payload,
  onSubmit,
}: {
  payload: ExercisePayload;
  onSubmit: (data: unknown) => void;
}) {
  switch (payload.exerciseId) {
    case "intake_form":
      return (
        <IntakeForm
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "wheel_of_life":
      return (
        <WheelOfLife
          title={payload.title}
          instructions={payload.instructions}
          domains={payload.config?.domains as string[] | undefined}
          onSubmit={onSubmit}
        />
      );
    case "life_timeline":
      return (
        <LifeTimeline
          title={payload.title}
          instructions={payload.instructions}
          clientAge={payload.config?.clientAge as number | undefined}
          onSubmit={onSubmit}
        />
      );
    case "needs_scale":
      return (
        <Scale
          title={payload.title}
          instructions={payload.instructions}
          items={payload.config?.items as string[] | undefined}
          onSubmit={onSubmit}
        />
      );
    case "strengths_card_sort":
    case "values_card_sort":
      return (
        <CardSort
          title={payload.title}
          instructions={payload.instructions}
          items={payload.config?.items as string[] | undefined}
          maxPick={(payload.config?.maxPick as number) ?? 5}
          onSubmit={onSubmit}
        />
      );
    default:
      return (
        <div className="exercise-card">
          <h3>{payload.title}</h3>
          <p className="instructions">{payload.instructions}</p>
          <p style={{ color: "#999", fontSize: 13 }}>
            ({payload.exerciseId} — visual component not yet built; answer in chat for now)
          </p>
        </div>
      );
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getJournal(USER_ID)
      .then((j) => setCurrentSession(j.currentSession))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const res = await sendMessage(USER_ID, text);
      const newMsgs: Message[] = [];
      if (res.assistantText) {
        newMsgs.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.assistantText,
        });
      }
      for (const ex of res.exercises) {
        newMsgs.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          exercise: ex,
        });
      }
      setMessages((m) => [...m, ...newMsgs]);
      setCurrentSession(res.currentSession);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "(connection error — please try again)",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function onExerciseSubmit(exerciseId: string, data: unknown) {
    setSending(true);
    try {
      const res = await submitExercise(USER_ID, exerciseId, data);
      if (res.assistantText) {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "assistant", content: res.assistantText },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "(connection error — please try again)",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h2 style={{ margin: 0 }}>Coach</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={currentSession}
            onChange={async (e) => {
              const n = Number(e.target.value);
              await gotoSession(USER_ID, n);
              setCurrentSession(n);
              setMessages([]);
            }}
            style={{
              background: "#2a5d4e",
              color: "white",
              border: "none",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 13,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Session {n}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              if (!confirm("Reset everything for this user?")) return;
              await resetJournal(USER_ID);
              setCurrentSession(1);
              setMessages([]);
            }}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #d8d3c4",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            reset
          </button>
        </div>
      </div>

      <div className="chat">
        {messages.length === 0 && (
          <div className="bubble assistant">
            Welcome. When you're ready, say hello and we'll begin.
          </div>
        )}
        {messages.map((m) =>
          m.exercise ? (
            <ExerciseRenderer
              key={m.id}
              payload={m.exercise}
              onSubmit={(data) => onExerciseSubmit(m.exercise!.exerciseId, data)}
            />
          ) : (
            <div key={m.id} className={`bubble ${m.role}`}>
              {m.content}
            </div>
          ),
        )}
        {sending && (
          <div className="bubble assistant thinking">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type here..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(input);
              }
            }}
          />
          <button disabled={sending || !input.trim()} onClick={() => onSend(input)}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
