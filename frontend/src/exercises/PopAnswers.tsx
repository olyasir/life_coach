import { useState } from "react";

interface Q {
  key: string;
  prompt: string;
  hint: string;
}

const QUESTIONS: Q[] = [
  {
    key: "release",
    prompt: "What do I most need to LET GO of?",
    hint: "A belief, a habit, a grudge, an expectation, a role — the first thing that came to mind.",
  },
  {
    key: "self_confidence",
    prompt: "Where is my self-confidence weakest — and why?",
    hint: "Not the polite answer. The real one.",
  },
  {
    key: "image",
    prompt: "What image of myself am I most attached to — and what's it costing me?",
    hint: "The persona you perform — at work, with family, online. What does keeping it up cost?",
  },
  {
    key: "failures",
    prompt: "What failure am I still carrying — and what does it say about who I think I am?",
    hint: "The one you'd edit out of your life if you could. Why is it still here?",
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

export default function PopAnswers({ title, instructions, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(key: string, v: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [key]: v }));
  }

  const filled = QUESTIONS.filter((q) => answers[q.key]?.trim()).length;
  const ready = filled === 4;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Fast, honest, first-thought. Don't over-edit. The censor is the
        thing we're bypassing. 4 questions. One line each if that's what
        comes; more if more comes.
      </p>

      <div
        style={{
          fontSize: 12,
          color: "#2a5d4e",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {filled} / 4 answered
      </div>

      {QUESTIONS.map((q) => (
        <div
          key={q.key}
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
              marginBottom: 2,
            }}
          >
            {q.prompt}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#888",
              fontStyle: "italic",
              marginBottom: 6,
            }}
          >
            {q.hint}
          </div>
          <textarea
            disabled={submitted}
            value={answers[q.key] ?? ""}
            onChange={(e) => update(q.key, e.target.value)}
            rows={2}
            placeholder="First thing that came…"
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
