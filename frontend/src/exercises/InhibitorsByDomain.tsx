import { useState } from "react";

interface DomainPrompt {
  key: string;
  label: string;
  prompt: string;
}

const DOMAINS: DomainPrompt[] = [
  {
    key: "relationships",
    label: "Relationships",
    prompt:
      "In my relationships — with partner, family, close friends — what do I hold back? What am I afraid to say, ask for, or be?",
  },
  {
    key: "learning",
    label: "Learning & growth",
    prompt:
      "When it comes to learning something new or growing — what stops me? Where do I quit, flinch, or never start?",
  },
  {
    key: "daily",
    label: "Daily life & habits",
    prompt:
      "In my day-to-day — routines, habits, how I use time — what's the thing I keep meaning to change but don't?",
  },
  {
    key: "achievement",
    label: "Achievement & ambition",
    prompt:
      "In what I want to accomplish — at work, in projects, in goals — what keeps holding me back? Where does the ambition leak out?",
  },
  {
    key: "finance",
    label: "Money & resources",
    prompt:
      "Around money — earning, spending, saving, asking — what's the pattern that doesn't serve me?",
  },
  {
    key: "overall",
    label: "The overall life",
    prompt:
      "Standing back and looking at the whole life — what's the big inhibitor that shows up everywhere, in every area?",
  },
];

interface Output {
  answers: Record<string, string>;
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: Output) => void;
}

export default function InhibitorsByDomain({
  title,
  instructions,
  onSubmit,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(key: string, v: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [key]: v }));
  }

  const filled = DOMAINS.filter((d) => answers[d.key]?.trim()).length;
  const ready = filled >= 4;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Sometimes you can't find the inhibitor head-on. These 6 domain
        prompts surface it by asking: where, specifically, is this
        pattern showing up? Fill at least 4. Skip any that feel
        irrelevant right now.
      </p>

      <div
        style={{
          fontSize: 12,
          color: "#2a5d4e",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {filled} / 6 answered (at least 4)
      </div>

      {DOMAINS.map((d) => (
        <div
          key={d.key}
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
              fontSize: 13,
              fontWeight: 700,
              color: "#2a5d4e",
              marginBottom: 3,
            }}
          >
            {d.label}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
            {d.prompt}
          </div>
          <textarea
            disabled={submitted}
            value={answers[d.key] ?? ""}
            onChange={(e) => update(d.key, e.target.value)}
            rows={3}
            placeholder="Write freely…"
            style={ta}
          />
        </div>
      ))}

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ answers });
          }}
          style={{ marginTop: 6 }}
        >
          Share with coach
        </button>
      )}
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
