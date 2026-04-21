import { useState } from "react";

interface Props {
  title: string;
  instructions: string;
  goal?: string;
  onSubmit: (data: { goal: string; reasons: string[] }) => void;
}

export default function TenReasons({
  title,
  instructions,
  goal,
  onSubmit,
}: Props) {
  const [reasons, setReasons] = useState<string[]>(Array(10).fill(""));
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, value: string) {
    if (submitted) return;
    setReasons((prev) => prev.map((r, idx) => (idx === i ? value : r)));
  }

  const filled = reasons.filter((r) => r.trim().length > 0).length;
  const ready = filled === 10;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Ten reasons why I want this goal. The first three come easy. The
        middle four make you think. The last three are where the real
        reasons live. Take your time.
      </p>

      {goal && (
        <div
          style={{
            padding: "12px 14px",
            background: "#2a5d4e",
            color: "white",
            borderRadius: 10,
            marginBottom: 14,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.45,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              opacity: 0.8,
              marginBottom: 4,
            }}
          >
            My goal
          </div>
          {goal}
        </div>
      )}

      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#faf8f1",
          padding: "6px 0",
          zIndex: 1,
          fontSize: 13,
          color: "#2a5d4e",
          fontWeight: 600,
        }}
      >
        {filled} / 10 reasons
        {!ready && !submitted && (
          <span style={{ color: "#888", fontWeight: 400, marginLeft: 8 }}>
            (fill all 10 to share)
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 8,
        }}
      >
        {reasons.map((r, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: r.trim() ? "#2a5d4e" : "#d8d3c4",
                color: r.trim() ? "white" : "#555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {i + 1}
            </div>
            <textarea
              disabled={submitted}
              value={r}
              onChange={(e) => update(i, e.target.value)}
              rows={2}
              placeholder={placeholderFor(i)}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 13,
                border: "1px solid #d8d3c4",
                borderRadius: 8,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
                background: "white",
              }}
            />
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ goal: goal ?? "", reasons });
          }}
          style={{ marginTop: 14 }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function placeholderFor(i: number): string {
  if (i < 3) return "Because…";
  if (i < 7) return "And also because… (dig deeper)";
  return "And the real reason… (quietest, most honest)";
}
