import { useEffect, useRef, useState } from "react";
import { getJournal, gotoSession, resetJournal, sendMessage, submitExercise } from "./api";
import WheelOfLife from "./exercises/WheelOfLife";
import Scale from "./exercises/Scale";
import CardSort from "./exercises/CardSort";
import IntakeForm from "./exercises/IntakeForm";
import LifeTimeline from "./exercises/LifeTimeline";
import DreamArchaeology from "./exercises/DreamArchaeology";
import DreamCanvas from "./exercises/DreamCanvas";
import AssetsBank from "./exercises/AssetsBank";
import StrengthsInventory from "./exercises/StrengthsInventory";
import ValuesBank from "./exercises/ValuesBank";
import ValuesAssessment from "./exercises/ValuesAssessment";
import SixNeedsReflection from "./exercises/SixNeedsReflection";
import YesICan from "./exercises/YesICan";
import GoalCanvas from "./exercises/GoalCanvas";
import TenReasons from "./exercises/TenReasons";
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

const PREVIEW_EXERCISES: Array<{ id: string; title: string; instructions: string }> = [
  { id: "intake_form", title: "Intake — who you are", instructions: "A few questions to start. Take your time." },
  { id: "wheel_of_life", title: "Wheel of life", instructions: "Score each domain 1-10 as it feels RIGHT NOW." },
  { id: "life_timeline", title: "Life timeline", instructions: "Title each 5-year chapter you've lived, and grade it." },
  { id: "dream_archaeology", title: "Dream archaeology — warm-up", instructions: "Answer quickly, don't overthink. First thing that comes." },
  { id: "dream_canvas", title: "Your dream", instructions: "Write your dream freely, then the doing / having / being triad." },
  { id: "assets_bank", title: "Assets & strengths bank", instructions: "Tap everything that applies to you. Go broad." },
  { id: "strengths_inventory", title: "Know your strengths — 34-item inventory", instructions: "Score each strength 1-4 as it shows up in you." },
  { id: "values_bank", title: "Values bank", instructions: "Tap every value that resonates. Go broad." },
  { id: "values_assessment", title: "Top 5 values — what they mean and how you live them", instructions: "For each of your top 5 values: what it means to you, how expressed 1-10, one action to live it more." },
  { id: "six_needs_reflection", title: "Six universal needs", instructions: "Robbins-Madanes needs. For each: how it shows up in you, importance + fulfillment 1-10." },
  { id: "yes_i_can", title: "Yes I can — the picture so far", instructions: "Everything we've named together (preview is empty — real view filled from memory in S7)." },
  { id: "goal_canvas", title: "Your goal — in your own hand", instructions: "The goal statement, the value it honors, the need it meets, target date, passion, price, and the three quality tests." },
  { id: "ten_reasons", title: "Ten reasons why I want this goal", instructions: "The first three are easy. The middle four make you think. The last three are the real ones." },
];

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
    case "dream_archaeology":
      return (
        <DreamArchaeology
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "dream_canvas":
      return (
        <DreamCanvas
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "assets_bank":
      return (
        <AssetsBank
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "strengths_inventory":
      return (
        <StrengthsInventory
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "values_bank":
      return (
        <ValuesBank
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "values_assessment":
      return (
        <ValuesAssessment
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "six_needs_reflection":
      return (
        <SixNeedsReflection
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "yes_i_can":
      return (
        <YesICan
          title={payload.title}
          instructions={payload.instructions}
          assets={payload.config?.assets as string[] | undefined}
          strengths={payload.config?.strengths as string[] | undefined}
          values={
            payload.config?.values as
              | Array<{ name: string; meaning?: string }>
              | undefined
          }
          needs={
            payload.config?.needs as
              | Array<{ name: string; gap: number }>
              | undefined
          }
          onSubmit={onSubmit}
        />
      );
    case "goal_canvas":
      return (
        <GoalCanvas
          title={payload.title}
          instructions={payload.instructions}
          goalDraft={payload.config?.goalDraft as string | undefined}
          topValues={payload.config?.topValues as string[] | undefined}
          topNeeds={payload.config?.topNeeds as string[] | undefined}
          biggestGap={payload.config?.biggestGap as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "ten_reasons":
      return (
        <TenReasons
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
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

  function previewExercise(id: string) {
    const def = PREVIEW_EXERCISES.find((e) => e.id === id);
    if (!def) return;
    const exercise: ExercisePayload = {
      exerciseId: def.id,
      title: def.title,
      instructions: def.instructions,
      config: def.id === "life_timeline" ? { clientAge: 40 } : {},
    };
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `[preview: ${def.id}]`,
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        exercise,
        preview: true,
      },
    ]);
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
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                previewExercise(e.target.value);
                e.target.value = "";
              }
            }}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #d8d3c4",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <option value="">preview exercise…</option>
            {PREVIEW_EXERCISES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id}
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
              onSubmit={(data) => {
                if (m.preview) {
                  console.log(`[preview ${m.exercise!.exerciseId}] submitted:`, data);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: `[preview submit received — see console. Payload keys: ${Object.keys(data as object ?? {}).join(", ") || "(raw)"}]`,
                    },
                  ]);
                  return;
                }
                onExerciseSubmit(m.exercise!.exerciseId, data);
              }}
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
