import { useState } from "react";

interface Output {
  statements: string[];
  loudest: string[];
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: Output) => void;
}

export default function InnerJudge({ title, instructions, onSubmit }: Props) {
  const [statements, setStatements] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [loudest, setLoudest] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, v: string) {
    if (submitted) return;
    setStatements((prev) => prev.map((s, idx) => (idx === i ? v : s)));
  }

  function toggleLoudest(s: string) {
    if (submitted) return;
    if (loudest.includes(s)) {
      setLoudest(loudest.filter((x) => x !== s));
    } else if (loudest.length < 2) {
      setLoudest([...loudest, s]);
    }
  }

  const filled = statements.filter((s) => s.trim()).length;
  const ready = filled >= 4 && loudest.length === 2;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        The inner judge is the voice that narrates failure before it
        happens. Catch it on the page — exactly as it speaks, first
        person. At least 4 statements. Then mark the 2 that hit hardest.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {statements.map((s, i) => {
          const isLoudest = loudest.includes(s) && s.trim().length > 0;
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 60px",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: s.trim() ? "#b94b4b" : "#d8d3c4",
                  color: s.trim() ? "white" : "#555",
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
                value={s}
                onChange={(e) => update(i, e.target.value)}
                rows={2}
                placeholder={
                  i === 0
                    ? '"Who do you think you are to…"'
                    : i === 1
                      ? '"You\'ll just embarrass yourself again."'
                      : '"…" (the exact words it says)'
                }
                style={ta}
              />
              <button
                type="button"
                disabled={submitted || !s.trim()}
                onClick={() => toggleLoudest(s)}
                style={{
                  padding: "4px 6px",
                  fontSize: 11,
                  borderRadius: 6,
                  border: `1px solid ${isLoudest ? "#2a5d4e" : "#d8d3c4"}`,
                  background: isLoudest ? "#2a5d4e" : "white",
                  color: isLoudest ? "white" : s.trim() ? "#555" : "#bbb",
                  cursor: submitted || !s.trim() ? "default" : "pointer",
                  fontFamily: "inherit",
                  marginTop: 2,
                  fontWeight: 600,
                }}
              >
                {isLoudest ? "★ loud" : "loudest?"}
              </button>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#888",
          marginBottom: 10,
        }}
      >
        {filled < 4
          ? `Add ${4 - filled} more (at least 4)`
          : loudest.length < 2
            ? `Mark ${2 - loudest.length} more as loudest`
            : "Ready — share with coach"}
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              statements: statements.filter((s) => s.trim()),
              loudest,
            });
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
