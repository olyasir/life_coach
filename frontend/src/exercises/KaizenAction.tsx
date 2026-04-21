import { useState } from "react";

type Principle =
  | "small_questions"
  | "small_thoughts"
  | "small_actions"
  | "small_problems"
  | "small_rewards"
  | "small_moments";

interface Output {
  principle: Principle;
  whyThis: string;
  tinyAction: string;
  whenToDo: string;
}

interface Props {
  title: string;
  instructions: string;
  stalledStep?: string;
  topStrengths?: string[];
  onSubmit: (data: Output) => void;
}

const PRINCIPLES: {
  key: Principle;
  num: number;
  label: string;
  description: string;
  example: string;
}[] = [
  {
    key: "small_questions",
    num: 1,
    label: "Ask small questions",
    description:
      "Dispel fear and open creativity. Small questions slip past the brain's threat response.",
    example:
      "'What's ONE small thing I could do today toward this?' instead of 'How will I change my whole life?'",
  },
  {
    key: "small_thoughts",
    num: 2,
    label: "Think small thoughts",
    description:
      "Mental rehearsal — develop new skills/habits without moving a muscle. The brain treats vivid imagining as practice.",
    example: "Visualize the action for 30 seconds daily before doing it.",
  },
  {
    key: "small_actions",
    num: 3,
    label: "Take small actions guaranteed to succeed",
    description:
      "So small you cannot fail. Success builds the neural pathway; size doesn't matter for that.",
    example: "Write 1 sentence. Walk 1 minute. Send 1 message. Floss 1 tooth.",
  },
  {
    key: "small_problems",
    num: 4,
    label: "Solve small problems",
    description:
      "Even when facing a big crisis. Chip the edges of the boulder — don't try to lift it.",
    example:
      "Don't fix the whole stuck project — fix the ONE confusing sentence in the plan.",
  },
  {
    key: "small_rewards",
    num: 5,
    label: "Give small rewards",
    description:
      "Lock in progress. The reward, more than the action, is what cements the habit.",
    example:
      "A check on the calendar. Naming the win out loud. A small treat tied to the action.",
  },
  {
    key: "small_moments",
    num: 6,
    label: "Notice small moments",
    description:
      "Everyone ignores them. The 30 seconds you started instead of scrolling — that IS the change.",
    example:
      "Catch the moment you ALMOST did the old behavior and chose differently. Name it.",
  },
];

export default function KaizenAction({
  title,
  instructions,
  stalledStep,
  topStrengths,
  onSubmit,
}: Props) {
  const [principle, setPrinciple] = useState<Principle | "">("");
  const [whyThis, setWhyThis] = useState("");
  const [tinyAction, setTinyAction] = useState("");
  const [whenToDo, setWhenToDo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready =
    principle !== "" &&
    whyThis.trim().length > 0 &&
    tinyAction.trim().length > 0 &&
    whenToDo.trim().length > 0;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        When change feels too big, the brain's amygdala fires — fight or
        flight kicks in, and the rational + creative brain shuts down. Big
        steps fire the amygdala. Tiny steps slip past it. Kaizen takes
        steps SO SMALL the brain doesn't register them as threat.
      </p>

      {stalledStep && (
        <div
          style={{
            padding: "10px 12px",
            background: "#fff1ee",
            border: "1px solid #b94b4b",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: "#b94b4b", marginBottom: 3 }}>
            The step that's stalled:
          </div>
          <div>{stalledStep}</div>
        </div>
      )}

      {topStrengths && topStrengths.length > 0 && (
        <div
          style={{
            padding: "8px 12px",
            background: "#f5f1e6",
            border: "1px solid #d8d3c4",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 14,
          }}
        >
          <span style={{ color: "#888" }}>Strengths to draw on: </span>
          <b style={{ color: "#2a5d4e" }}>{topStrengths.join(" · ")}</b>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2a5d4e",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          1 · Pick ONE principle (Maurer's six)
        </div>
        {PRINCIPLES.map((p) => {
          const active = principle === p.key;
          return (
            <button
              type="button"
              key={p.key}
              disabled={submitted}
              onClick={() => setPrinciple(p.key)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: 10,
                marginBottom: 6,
                background: active ? "#fff9f0" : "#faf8f1",
                border: `2px solid ${active ? "#b9883b" : "#e5e1d6"}`,
                borderRadius: 8,
                cursor: submitted ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: active ? "#b9883b" : "#2a5d4e",
                  marginBottom: 3,
                }}
              >
                {active ? "✓ " : ""}
                {p.num}. {p.label}
              </div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>
                {p.description}
              </div>
              <div style={{ fontSize: 11, fontStyle: "italic", color: "#888" }}>
                e.g. {p.example}
              </div>
            </button>
          );
        })}
      </div>

      <Field label="Why this principle for you, right now?">
        <textarea
          disabled={submitted}
          value={whyThis}
          onChange={(e) => setWhyThis(e.target.value)}
          rows={2}
          placeholder="What about your stuck-place makes this the right tool…"
          style={ta}
        />
      </Field>

      <Field label="The TINY action — embarrassingly small. If it sounds ambitious, shrink it.">
        <textarea
          disabled={submitted}
          value={tinyAction}
          onChange={(e) => setTinyAction(e.target.value)}
          rows={2}
          placeholder="One sentence. One minute. One question. One message…"
          style={ta}
        />
      </Field>

      <Field label="When will you do it? (specific day + time, or anchored to existing routine)">
        <textarea
          disabled={submitted}
          value={whenToDo}
          onChange={(e) => setWhenToDo(e.target.value)}
          rows={2}
          placeholder="Tuesday 8:00am after coffee / every weekday at lunch / right before bed…"
          style={ta}
        />
      </Field>

      <div
        style={{
          fontSize: 11,
          fontStyle: "italic",
          color: "#888",
          marginBottom: 12,
        }}
      >
        Lao Tzu: a journey of a thousand miles begins with a single step.
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              principle: principle as Principle,
              whyThis,
              tinyAction,
              whenToDo,
            });
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  );
}

const ta: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  border: "1px solid #d8d3c4",
  borderRadius: 8,
  fontFamily: "inherit",
  resize: "vertical",
  boxSizing: "border-box",
  background: "white",
};
