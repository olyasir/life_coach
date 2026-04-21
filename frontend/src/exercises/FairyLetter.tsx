import { useState } from "react";

interface Props {
  title: string;
  instructions: string;
  goal?: string;
  onSubmit: (data: { letter: string }) => void;
}

export default function FairyLetter({
  title,
  instructions,
  goal,
  onSubmit,
}: Props) {
  const [letter, setLetter] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready = letter.trim().length > 80;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Imagine the wisest, kindest version of yourself — the one who
        already sees you clearly and wishes you well. Let THAT self
        write a short letter to the you who is sitting here now. About
        the goal, about the fears, about what's possible. Don't edit.
        First draft only.
      </p>

      {goal && (
        <div
          style={{
            padding: "10px 12px",
            background: "#f1ede1",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 12,
          }}
        >
          <b style={{ color: "#2a5d4e" }}>The goal you're working toward:</b>{" "}
          {goal}
        </div>
      )}

      <div
        style={{
          padding: 16,
          background: "#fbf9ef",
          border: "1px solid #e5e1d6",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "#888",
            fontStyle: "italic",
            marginBottom: 6,
          }}
        >
          Dear me,
        </div>
        <textarea
          disabled={submitted}
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          rows={14}
          placeholder="From the wiser, kinder self — what do I want you to know right now?"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            border: "1px solid #d8d3c4",
            borderRadius: 8,
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
            background: "white",
            lineHeight: 1.55,
          }}
        />
        <div
          style={{
            fontSize: 13,
            color: "#888",
            fontStyle: "italic",
            marginTop: 6,
          }}
        >
          With love,
          <br />
          the version of me who sees clearly
        </div>
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ letter });
          }}
          style={{ marginTop: 14 }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}
