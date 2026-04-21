import { useState } from "react";

const INHIBITORS: string[] = [
  "Fear of failure",
  "Fear of success",
  "Self-doubt",
  "Perfectionism",
  "Procrastination",
  "Comparing to others",
  "Over-responsibility",
  "People-pleasing",
  "Fear of disappointing",
  "Rigidity",
  "Over-planning, under-acting",
  "Impatience",
  "Scattered attention",
  "Not asking for help",
  "Harsh self-criticism",
  "Fear of visibility",
  "Workaholism as avoidance",
  "Shame residue",
  "Cynicism",
  "All-or-nothing thinking",
  "Waiting for permission",
  "Low tolerance for discomfort",
  "Other-focus",
  "Avoiding conflict",
  "Catastrophizing",
  "Needing to be right",
];

interface Pick {
  name: string;
  definition: string;
  howShowsUp: string;
  howBlocks: string;
}

interface Output {
  picked: string[];
  topFive: string[];
  answers: Pick[];
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: Output) => void;
}

type Step = 1 | 2 | 3;

export default function InhibitorsBank({
  title,
  instructions,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [topFive, setTopFive] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, Pick>>({});
  const [submitted, setSubmitted] = useState(false);

  function togglePick(name: string) {
    if (submitted) return;
    if (picked.includes(name)) {
      setPicked(picked.filter((x) => x !== name));
      setTopFive(topFive.filter((x) => x !== name));
    } else {
      setPicked([...picked, name]);
    }
  }

  function toggleTop(name: string) {
    if (submitted) return;
    if (topFive.includes(name)) {
      setTopFive(topFive.filter((x) => x !== name));
    } else if (topFive.length < 5) {
      setTopFive([...topFive, name]);
    }
  }

  function updateAnswer(name: string, field: keyof Pick, value: string) {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [name]: {
        name,
        definition: prev[name]?.definition ?? "",
        howShowsUp: prev[name]?.howShowsUp ?? "",
        howBlocks: prev[name]?.howBlocks ?? "",
        [field]: value,
      },
    }));
  }

  const allAnswered = topFive.every((name) => {
    const a = answers[name];
    return (
      a?.definition?.trim() && a?.howShowsUp?.trim() && a?.howBlocks?.trim()
    );
  });

  const step1CanAdvance = picked.length > 0;
  const step2CanAdvance = topFive.length === 5;
  const step3CanSubmit = allAnswered;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>

      <StepIndicator step={step} />

      <p style={{ color: "#8a7d55", fontSize: 12, margin: "4px 0 14px", fontStyle: "italic" }}>
        Not sure what one of these means? Ask your coach in chat below — the exercise stays here while you ask.
      </p>

      {step === 1 && (
        <>
          <div style={stepHeader}>
            Step 1 of 3 — which ones echo for you? ({picked.length} picked)
          </div>
          <div style={stepHint}>
            Tap every inhibitor that genuinely resonates. You won't have all 26. Go with gut, not analysis.
          </div>
          <div style={chipRow}>
            {INHIBITORS.map((name) => {
              const on = picked.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  disabled={submitted}
                  onClick={() => togglePick(name)}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    borderRadius: 16,
                    border: `1px solid ${on ? "#b94b4b" : "#d8d3c4"}`,
                    background: on ? "#b94b4b" : "white",
                    color: on ? "white" : "#555",
                    cursor: submitted ? "default" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
          <NavRow>
            <div />
            <button
              className="submit-btn"
              disabled={!step1CanAdvance}
              onClick={() => setStep(2)}
            >
              Next → rank top 5
            </button>
          </NavRow>
        </>
      )}

      {step === 2 && (
        <>
          <div style={stepHeader}>
            Step 2 of 3 — mark your top 5 (the heaviest) — {topFive.length}/5
          </div>
          <div style={stepHint}>
            From the {picked.length} you picked, mark the 5 with the most weight right now.
          </div>
          <div style={chipRow}>
            {picked.map((name) => {
              const on = topFive.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  disabled={submitted}
                  onClick={() => toggleTop(name)}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    borderRadius: 16,
                    border: `2px solid ${on ? "#2a5d4e" : "#d8d3c4"}`,
                    background: on ? "#2a5d4e" : "white",
                    color: on ? "white" : "#555",
                    cursor: submitted ? "default" : "pointer",
                    fontFamily: "inherit",
                    fontWeight: on ? 700 : 400,
                  }}
                >
                  {on ? "★ " : ""}
                  {name}
                </button>
              );
            })}
          </div>
          <NavRow>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={backBtn}
            >
              ← back
            </button>
            <button
              className="submit-btn"
              disabled={!step2CanAdvance}
              onClick={() => setStep(3)}
            >
              Next → answer 3 on each
            </button>
          </NavRow>
        </>
      )}

      {step === 3 && (
        <>
          <div style={stepHeader}>
            Step 3 of 3 — 3 questions on each of your top 5
          </div>
          <div style={stepHint}>
            For each one: what it means to you, how it shows up, how it blocks you.
          </div>
          {topFive.map((name) => (
            <div
              key={name}
              style={{
                padding: 12,
                background: "#faf8f1",
                border: "1px solid #e5e1d6",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#2a5d4e",
                  marginBottom: 8,
                }}
              >
                {name}
              </div>
              <Field label="What does it mean for me? (my own definition)">
                <textarea
                  disabled={submitted}
                  value={answers[name]?.definition ?? ""}
                  onChange={(e) =>
                    updateAnswer(name, "definition", e.target.value)
                  }
                  rows={2}
                  style={ta}
                />
              </Field>
              <Field label="How does it show up in my life?">
                <textarea
                  disabled={submitted}
                  value={answers[name]?.howShowsUp ?? ""}
                  onChange={(e) =>
                    updateAnswer(name, "howShowsUp", e.target.value)
                  }
                  rows={2}
                  style={ta}
                />
              </Field>
              <Field label="How does it block me from my goal?">
                <textarea
                  disabled={submitted}
                  value={answers[name]?.howBlocks ?? ""}
                  onChange={(e) =>
                    updateAnswer(name, "howBlocks", e.target.value)
                  }
                  rows={2}
                  style={ta}
                />
              </Field>
            </div>
          ))}
          <NavRow>
            <button
              type="button"
              disabled={submitted}
              onClick={() => setStep(2)}
              style={backBtn}
            >
              ← back
            </button>
            {!submitted && (
              <button
                className="submit-btn"
                disabled={!step3CanSubmit}
                onClick={() => {
                  setSubmitted(true);
                  onSubmit({
                    picked,
                    topFive,
                    answers: topFive.map((n) => ({
                      name: n,
                      definition: answers[n]?.definition ?? "",
                      howShowsUp: answers[n]?.howShowsUp ?? "",
                      howBlocks: answers[n]?.howBlocks ?? "",
                    })),
                  });
                }}
              >
                Share with coach
              </button>
            )}
          </NavRow>
        </>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: n <= step ? "#2a5d4e" : "#e5e1d6",
          }}
        />
      ))}
    </div>
  );
}

function NavRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        gap: 8,
      }}
    >
      {children}
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
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  );
}

const stepHeader: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#2a5d4e",
  marginBottom: 4,
};

const stepHint: React.CSSProperties = {
  fontSize: 12,
  color: "#888",
  marginBottom: 10,
};

const chipRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 6,
};

const backBtn: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 12,
  background: "transparent",
  color: "#888",
  border: "1px solid #d8d3c4",
  borderRadius: 999,
  cursor: "pointer",
  fontFamily: "inherit",
};

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
