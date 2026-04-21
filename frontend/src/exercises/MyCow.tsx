import { useState } from "react";

interface Output {
  cow: string;
  releaseAction: string;
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: Output) => void;
}

export default function MyCow({ title, instructions, onSubmit }: Props) {
  const [cow, setCow] = useState("");
  const [releaseAction, setReleaseAction] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready = cow.trim().length > 0 && releaseAction.trim().length > 0;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 14px" }}>
        The cow is the comfortable thing — the just-enough thing — that
        lets you avoid facing what would change if you let it go. A job, a
        relationship, a routine, an identity, a story you tell about
        yourself. It gives you SOMETHING. And exactly because it gives you
        something, you stay where you are.
      </p>

      <div
        style={{
          padding: "12px 14px",
          background: "#fff1ee",
          border: "1px solid #b94b4b",
          borderRadius: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#b94b4b",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          1 · Name your cow
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          What is the comfortable thing keeping you stuck? Be specific. The
          first answer is rarely the real one — go deeper than
          "procrastination" or "fear." What does it PROTECT you from
          having to face?
        </div>
        <textarea
          disabled={submitted}
          value={cow}
          onChange={(e) => setCow(e.target.value)}
          rows={4}
          placeholder="My cow is…"
          style={ta}
        />
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: "#f1ede1",
          border: "1px solid #e5e1d6",
          borderRadius: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2a5d4e",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          2 · Release her
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          What are you willing to do to release her? Not "let her die" in
          the abstract — what specific, concrete act, this week or this
          month, would mean you're choosing the new path over the
          comfortable one?
        </div>
        <textarea
          disabled={submitted}
          value={releaseAction}
          onChange={(e) => setReleaseAction(e.target.value)}
          rows={4}
          placeholder="To release her, I'm willing to…"
          style={ta}
        />
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ cow, releaseAction });
          }}
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
