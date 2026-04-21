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

export default function InhibitorsBank({
  title,
  instructions,
  onSubmit,
}: Props) {
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
  const ready = topFive.length === 5 && allAnswered;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        26 common inhibitors (Reuven Katz). You don't have all of them.
        Step 1 — tap every one that genuinely echoes for you. Step 2 —
        mark your top 5. Step 3 — answer 3 questions on each of those 5.
      </p>

      <div style={{ fontSize: 13, fontWeight: 600, color: "#2a5d4e", marginBottom: 6 }}>
        Step 1 — which ones echo? ({picked.length} picked)
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 14,
        }}
      >
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

      {picked.length > 0 && (
        <>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#2a5d4e",
              marginBottom: 6,
            }}
          >
            Step 2 — mark your top 5 (the heaviest ones) — {topFive.length}/5
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 14,
            }}
          >
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
        </>
      )}

      {topFive.length > 0 && (
        <>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#2a5d4e",
              marginBottom: 8,
            }}
          >
            Step 3 — 3 questions on each of your top 5
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
        </>
      )}

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
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
          style={{ marginTop: 8 }}
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
    <div style={{ marginBottom: 8 }}>
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
