import { useState } from "react";

interface NeedRow {
  name: string;
  manifestation: string;
  importance: number;
  fulfillment: number;
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: {
    needs: NeedRow[];
    mostImportant: string;
    leastImportant: string;
    learning: string;
  }) => void;
}

interface NeedDef {
  id: string;
  name: string;
  blurb: string;
  pair?: string;
}

const NEEDS: NeedDef[] = [
  {
    id: "certainty",
    name: "Certainty / Security",
    pair: "paired with Variety",
    blurb:
      "Stability, safety, comfort, knowing what to expect. Your job is secure, the paycheck arrives, the routine holds.",
  },
  {
    id: "variety",
    name: "Variety / Uncertainty",
    pair: "paired with Certainty",
    blurb:
      "Change, challenge, novelty, surprise. If every minute of your life were known in advance, you'd die of boredom.",
  },
  {
    id: "significance",
    name: "Significance / Importance",
    pair: "paired with Love & Belonging",
    blurb:
      "Feeling unique, special, worthy of recognition. Being seen as capable, valuable, someone who matters.",
  },
  {
    id: "love",
    name: "Love & Belonging",
    pair: "paired with Significance",
    blurb:
      "Loving and being loved. Connection. Feeling part of something — a team, a family, a circle.",
  },
  {
    id: "growth",
    name: "Growth",
    pair: "grows with Contribution",
    blurb:
      "Learning, improving, developing — in personality and in spirit. What doesn't grow atrophies.",
  },
  {
    id: "contribution",
    name: "Contribution",
    pair: "grows with Growth",
    blurb:
      "Giving, helping others, leaving a mark, being part of something bigger than yourself.",
  },
];

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

export default function SixNeedsReflection({
  title,
  instructions,
  onSubmit,
}: Props) {
  const [rows, setRows] = useState<NeedRow[]>(
    NEEDS.map((n) => ({
      name: n.name,
      manifestation: "",
      importance: 5,
      fulfillment: 5,
    })),
  );
  const [mostImportant, setMostImportant] = useState("");
  const [leastImportant, setLeastImportant] = useState("");
  const [learning, setLearning] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, patch: Partial<NeedRow>) {
    if (submitted) return;
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  const allManifestFilled = rows.every((r) => r.manifestation.trim().length > 0);
  const ready =
    allManifestFilled &&
    mostImportant.trim() &&
    leastImportant.trim() &&
    mostImportant !== leastImportant;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Six universal human needs (Robbins &amp; Madanes). Every person has all
        six — what differs is the HIERARCHY and the WAYS each person fulfills
        them. For each: how does it show up in YOUR life? How important is it
        to you? How fulfilled is it right now?
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
        {rows.filter((r) => r.manifestation.trim()).length} / 6 described
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}
      >
        {NEEDS.map((def, i) => {
          const row = rows[i];
          return (
            <div
              key={def.id}
              style={{
                border: "1px solid #e5e1d6",
                borderRadius: 10,
                padding: 12,
                background: "#fff",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#2a5d4e",
                  marginBottom: 2,
                }}
              >
                {i + 1}. {def.name}
                {def.pair && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#888",
                      fontWeight: 500,
                      marginLeft: 8,
                    }}
                  >
                    ({def.pair})
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#555",
                  margin: "0 0 10px",
                  lineHeight: 1.4,
                }}
              >
                {def.blurb}
              </p>

              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                How does this show up in my life right now?
              </div>
              <textarea
                placeholder="Describe how you meet this need (or try to)."
                disabled={submitted}
                value={row.manifestation}
                onChange={(e) =>
                  update(i, { manifestation: e.target.value })
                }
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <ScaleRow
                  label="Importance"
                  value={row.importance}
                  onChange={(n) => update(i, { importance: n })}
                  disabled={submitted}
                />
                <ScaleRow
                  label="Fulfilled now"
                  value={row.fulfillment}
                  onChange={(n) => update(i, { fulfillment: n })}
                  disabled={submitted}
                />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: row.importance - row.fulfillment >= 4 ? "#b94b4b" : "#888",
                  marginTop: 6,
                  fontWeight: row.importance - row.fulfillment >= 4 ? 600 : 400,
                }}
              >
                gap = {row.importance - row.fulfillment}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 12,
          background: "#f1ede1",
          borderRadius: 10,
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
          Your hierarchy
        </div>

        <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
          Which need is MOST important to you?
        </div>
        <select
          value={mostImportant}
          disabled={submitted}
          onChange={(e) => setMostImportant(e.target.value)}
          style={selectStyle}
        >
          <option value="">— pick one —</option>
          {NEEDS.map((n) => (
            <option key={n.id} value={n.name}>
              {n.name}
            </option>
          ))}
        </select>

        <div style={{ fontSize: 13, color: "#555", margin: "10px 0 4px" }}>
          Which is LEAST important to you?
        </div>
        <select
          value={leastImportant}
          disabled={submitted}
          onChange={(e) => setLeastImportant(e.target.value)}
          style={selectStyle}
        >
          <option value="">— pick one —</option>
          {NEEDS.map((n) => (
            <option key={n.id} value={n.name}>
              {n.name}
            </option>
          ))}
        </select>

        <div style={{ fontSize: 13, color: "#555", margin: "10px 0 4px" }}>
          What do you learn from this? (optional)
        </div>
        <textarea
          placeholder="What surprised you? What pattern do you see?"
          disabled={submitted}
          value={learning}
          onChange={(e) => setLearning(e.target.value)}
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

      {submitted && <GapSummary rows={rows} />}
      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              needs: rows,
              mostImportant,
              leastImportant,
              learning,
            });
          }}
          style={{ marginTop: 14 }}
        >
          Share with coach
        </button>
      )}
      {!submitted && !ready && (
        <p style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
          Describe each need, then pick your most/least important.
        </p>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  border: "1px solid #d8d3c4",
  borderRadius: 8,
  fontFamily: "inherit",
  background: "white",
};

function ScaleRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
        {label}:{" "}
        <span style={{ fontWeight: 700, color: "#2a5d4e" }}>{value}/10</span>
      </div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => {
          const isOn = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: `1px solid ${isOn ? SCALE_COLORS[n - 1] : "#d8d3c4"}`,
                background: isOn ? SCALE_COLORS[n - 1] : "white",
                color: isOn ? (n >= 7 ? "white" : "#333") : "#555",
                fontSize: 11,
                fontWeight: 600,
                cursor: disabled ? "default" : "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GapSummary({ rows }: { rows: NeedRow[] }) {
  const sorted = [...rows]
    .map((r) => ({ ...r, gap: r.importance - r.fulfillment }))
    .sort((a, b) => b.gap - a.gap || b.importance - a.importance);

  function rowColor(gap: number): string {
    if (gap >= 5) return "#b94b4b";
    if (gap >= 3) return "#c8804b";
    if (gap >= 1) return "#c8c19e";
    if (gap === 0) return "#7fb069";
    return "#2a5d4e";
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: "0 0 6px" }}>Your needs — sorted by gap</h4>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 8px" }}>
        Largest gap at top — these are the needs your life isn't meeting right
        now. The size of the gap is the pull on your energy.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((r, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px 60px 60px",
              gap: 4,
              alignItems: "stretch",
              fontSize: 13,
            }}
          >
            <div
              style={{
                padding: "6px 10px",
                background: rowColor(r.gap),
                color: r.gap >= 3 ? "white" : "#333",
                borderRadius: "8px 0 0 8px",
                fontWeight: 600,
              }}
            >
              {r.name}
            </div>
            <div
              style={{
                padding: "6px 8px",
                background: rowColor(r.gap),
                color: r.gap >= 3 ? "white" : "#333",
                textAlign: "center",
              }}
            >
              imp {r.importance}
            </div>
            <div
              style={{
                padding: "6px 8px",
                background: rowColor(r.gap),
                color: r.gap >= 3 ? "white" : "#333",
                textAlign: "center",
              }}
            >
              got {r.fulfillment}
            </div>
            <div
              style={{
                padding: "6px 10px",
                background: rowColor(r.gap),
                color: r.gap >= 3 ? "white" : "#333",
                borderRadius: "0 8px 8px 0",
                textAlign: "right",
                fontWeight: 700,
              }}
            >
              gap {r.gap}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
