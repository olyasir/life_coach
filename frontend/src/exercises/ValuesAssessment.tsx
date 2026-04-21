import { useState } from "react";

interface ValueRow {
  name: string;
  meaning: string;
  currentExpression: number;
  action: string;
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: { values: ValueRow[] }) => void;
}

const EMPTY_ROW: ValueRow = {
  name: "",
  meaning: "",
  currentExpression: 5,
  action: "",
};

const SCALE_COLORS = [
  "#d8d3c4",
  "#d8d3c4",
  "#d8d3c4",
  "#c8c19e",
  "#c8c19e",
  "#c8c19e",
  "#7fb069",
  "#7fb069",
  "#2a5d4e",
  "#2a5d4e",
];

export default function ValuesAssessment({
  title,
  instructions,
  onSubmit,
}: Props) {
  const [rows, setRows] = useState<ValueRow[]>([
    { ...EMPTY_ROW },
    { ...EMPTY_ROW },
    { ...EMPTY_ROW },
    { ...EMPTY_ROW },
    { ...EMPTY_ROW },
  ]);
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, patch: Partial<ValueRow>) {
    if (submitted) return;
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  const filledCount = rows.filter(
    (r) => r.name.trim() && r.meaning.trim() && r.action.trim(),
  ).length;
  const ready = filledCount === 5;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Your TOP 5 values — the ones that truly drive you. For each: the value
        name, what it means to YOU (not a dictionary definition), how much
        it's expressed in your life right now (1-10), and one thing you could
        do to live it more.
      </p>

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
        {filledCount} / 5 complete
        {!ready && !submitted && (
          <span style={{ color: "#888", fontWeight: 400, marginLeft: 8 }}>
            (fill all 5 rows to share)
          </span>
        )}
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #e5e1d6",
              borderRadius: 10,
              padding: 12,
              background: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#2a5d4e",
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Value {i + 1}
            </div>

            <input
              type="text"
              placeholder="Value (e.g. Authenticity, Family, Freedom…)"
              disabled={submitted}
              value={row.name}
              onChange={(e) => update(i, { name: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid #d8d3c4",
                borderRadius: 8,
                fontFamily: "inherit",
                marginBottom: 8,
                boxSizing: "border-box",
              }}
            />

            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              What this value means to me:
            </div>
            <textarea
              placeholder="In your own words — what does this look like when you're living it?"
              disabled={submitted}
              value={row.meaning}
              onChange={(e) => update(i, { meaning: e.target.value })}
              rows={2}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 13,
                border: "1px solid #d8d3c4",
                borderRadius: 8,
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />

            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              How expressed in my life right now:{" "}
              <span style={{ fontWeight: 700, color: "#2a5d4e" }}>
                {row.currentExpression}/10
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => {
                const isOn = row.currentExpression === n;
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={submitted}
                    onClick={() => update(i, { currentExpression: n })}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: `1px solid ${isOn ? SCALE_COLORS[n - 1] : "#d8d3c4"}`,
                      background: isOn ? SCALE_COLORS[n - 1] : "white",
                      color: isOn ? (n >= 7 ? "white" : "#333") : "#555",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: submitted ? "default" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              What I'd do to live this value more fully:
            </div>
            <textarea
              placeholder="One concrete thing that would bring this value to life."
              disabled={submitted}
              value={row.action}
              onChange={(e) => update(i, { action: e.target.value })}
              rows={2}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 13,
                border: "1px solid #d8d3c4",
                borderRadius: 8,
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>

      {submitted && <ValuesSummary rows={rows} />}
      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ values: rows });
          }}
          style={{ marginTop: 14 }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function ValuesSummary({ rows }: { rows: ValueRow[] }) {
  const sorted = [...rows].sort(
    (a, b) => a.currentExpression - b.currentExpression,
  );

  function rowColor(score: number): string {
    return SCALE_COLORS[Math.max(0, Math.min(9, score - 1))];
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: "0 0 6px" }}>Your top 5 — sorted by gap</h4>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 8px" }}>
        Lowest-scored at top — that's where your compass is pointing you. The
        gap between what you value and what you live is where the energy is.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((v, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px",
              gap: 4,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                background: rowColor(v.currentExpression),
                color: v.currentExpression >= 7 ? "white" : "#333",
                borderRadius: "8px 0 0 8px",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {v.name}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  opacity: 0.85,
                  marginTop: 2,
                }}
              >
                {v.meaning}
              </div>
            </div>
            <div
              style={{
                padding: "8px 10px",
                background: rowColor(v.currentExpression),
                color: v.currentExpression >= 7 ? "white" : "#333",
                borderRadius: "0 8px 8px 0",
                textAlign: "right",
                fontWeight: 700,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {v.currentExpression}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
