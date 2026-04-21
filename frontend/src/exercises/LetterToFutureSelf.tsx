import { useMemo, useState } from "react";

interface Output {
  dateOneYearForward: string;
  greeting: string;
  body: string;
}

interface Props {
  title: string;
  instructions: string;
  goal?: string;
  targetDate?: string;
  onSubmit: (data: Output) => void;
}

function oneYearFromToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function LetterToFutureSelf({
  title,
  instructions,
  goal,
  targetDate,
  onSubmit,
}: Props) {
  const defaultDate = useMemo(oneYearFromToday, []);
  const [dateOneYearForward, setDateOneYearForward] = useState(defaultDate);
  const [greeting, setGreeting] = useState("Dear me,");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready = body.trim().length >= 80;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 14px" }}>
        Write yourself a letter dated one year from today. Write it AS IF
        everything you want has already come to be — goal reached,
        identity lived, life shaped the way you want. Not "I hope" — present
        tense. Not "I'm trying" — arrival.
      </p>

      {(goal || targetDate) && (
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
          {goal && (
            <div>
              <span style={{ color: "#888" }}>Your goal from S8: </span>
              <b style={{ color: "#2a5d4e" }}>{goal}</b>
            </div>
          )}
          {targetDate && (
            <div style={{ marginTop: 3 }}>
              <span style={{ color: "#888" }}>Target date: </span>
              <b style={{ color: "#2a5d4e" }}>{targetDate}</b>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          padding: "28px 28px 22px",
          background:
            "repeating-linear-gradient(0deg, #fbf4e0, #fbf4e0 30px, #f6ecc9 30px, #f6ecc9 31px)",
          border: "2px solid #c9a86b",
          borderRadius: 6,
          boxShadow:
            "inset 0 0 40px rgba(180,140,70,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: 14,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 18,
            fontSize: 13,
            color: "#5a4a2c",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Date:</span>
            <input
              type="date"
              disabled={submitted}
              value={dateOneYearForward}
              onChange={(e) => setDateOneYearForward(e.target.value)}
              style={{
                padding: "4px 8px",
                fontSize: 13,
                border: "1px solid #c9a86b",
                borderRadius: 4,
                background: "rgba(255,255,255,0.5)",
                fontFamily: "inherit",
                color: "#5a4a2c",
              }}
            />
          </div>
        </div>

        <input
          type="text"
          disabled={submitted}
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          placeholder="Dear me,"
          style={{
            width: "100%",
            padding: "6px 0",
            marginBottom: 12,
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            borderBottom: "1px dashed #c9a86b66",
            background: "transparent",
            fontFamily: "inherit",
            color: "#3a2e1a",
            outline: "none",
          }}
        />

        <textarea
          disabled={submitted}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          placeholder="A year has passed. I'm writing from the place I set out toward. Here's what's true now…"
          style={{
            width: "100%",
            padding: "4px 0",
            fontSize: 14,
            lineHeight: "30px",
            border: "none",
            background: "transparent",
            fontFamily: "inherit",
            color: "#3a2e1a",
            resize: "vertical",
            boxSizing: "border-box",
            outline: "none",
            minHeight: 380,
          }}
        />

        <div
          style={{
            textAlign: "right",
            marginTop: 12,
            fontSize: 13,
            fontStyle: "italic",
            color: "#7a5f38",
          }}
        >
          — you
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#888",
          fontStyle: "italic",
          marginBottom: 10,
        }}
      >
        {body.trim().length} characters written — aim for a real letter,
        not a line. Touch the goal, the identity, at least one domain of
        life you care about.
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ dateOneYearForward, greeting, body });
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}
