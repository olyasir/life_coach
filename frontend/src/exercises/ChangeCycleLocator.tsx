import { useState } from "react";

type Stage = "experience" | "insight" | "change" | "habit";

interface Output {
  stage: Stage;
  why: string;
  toAdvance: string;
}

interface Props {
  title: string;
  instructions: string;
  goal?: string;
  onSubmit: (data: Output) => void;
}

const STAGES: {
  key: Stage;
  label: string;
  hebrew: string;
  description: string;
  stuckSignal: string;
}[] = [
  {
    key: "experience",
    label: "Experience",
    hebrew: "חוויה",
    description:
      "Things are happening to you / around you. The raw material of life.",
    stuckSignal:
      "Stuck here = things happen but no learning sticks. Same situations recur, no pattern is named.",
  },
  {
    key: "insight",
    label: "Insight",
    hebrew: "תובנה",
    description:
      "You've SEEN something new — about yourself, about how the situation works.",
    stuckSignal:
      "Stuck here = lots of realizations, no action. You understand it. You're not moving on it. (Most common stuck.)",
  },
  {
    key: "change",
    label: "Change",
    hebrew: "שינוי",
    description: "You're acting differently. The new behavior is happening.",
    stuckSignal:
      "Stuck here = you did the new thing once or twice but couldn't sustain it. Willpower ran out.",
  },
  {
    key: "habit",
    label: "Habit",
    hebrew: "הרגל",
    description:
      "The new action is automatic. No willpower needed. It produces a NEW kind of experience — and the loop closes.",
    stuckSignal:
      "If you're here — you're not stuck. You're integrating. The work is to notice the new experience.",
  },
];

export default function ChangeCycleLocator({
  title,
  instructions,
  goal,
  onSubmit,
}: Props) {
  const [stage, setStage] = useState<Stage | "">("");
  const [why, setWhy] = useState("");
  const [toAdvance, setToAdvance] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready = stage !== "" && why.trim().length > 0 && toAdvance.trim().length > 0;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Every behavior change moves through four stages. People get stuck
        at different stages — and the right tool is different for each
        stuck-place. Find yours.
      </p>

      {goal && (
        <div
          style={{
            padding: "10px 12px",
            background: "#f5f1e6",
            border: "1px solid #d8d3c4",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: "#2a5d4e", marginBottom: 3 }}>
            For this goal:
          </div>
          <div>{goal}</div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {STAGES.map((s, i) => {
          const active = stage === s.key;
          return (
            <button
              type="button"
              key={s.key}
              disabled={submitted}
              onClick={() => setStage(s.key)}
              style={{
                textAlign: "left",
                padding: 12,
                background: active ? "#fff9f0" : "#faf8f1",
                border: `2px solid ${active ? "#b9883b" : "#e5e1d6"}`,
                borderRadius: 10,
                cursor: submitted ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#888",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Stage {i + 1} · {s.hebrew}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: active ? "#b9883b" : "#2a5d4e",
                  marginBottom: 4,
                }}
              >
                {active ? "✓ " : ""}
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>
                {s.description}
              </div>
              <div style={{ fontSize: 11, fontStyle: "italic", color: "#888" }}>
                {s.stuckSignal}
              </div>
            </button>
          );
        })}
      </div>

      <Field label="Why this stage? — what tells you you're here?">
        <textarea
          disabled={submitted}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={3}
          placeholder="What you're noticing in yourself that puts you in this stage…"
          style={ta}
        />
      </Field>

      <Field label="What would advancing to the next stage actually LOOK like? (concrete)">
        <textarea
          disabled={submitted}
          value={toAdvance}
          onChange={(e) => setToAdvance(e.target.value)}
          rows={3}
          placeholder="Not 'I'll just do it' — what specifically would change in your day or your behavior that would tell you you've moved on…"
          style={ta}
        />
      </Field>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              stage: stage as Stage,
              why,
              toAdvance,
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
