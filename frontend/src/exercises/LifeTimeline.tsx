import { useMemo, useState } from "react";

interface TimelineEntry {
  ageRange: string;
  title: string;
  feeling: string;
  description: string;
  grade: -2 | -1 | 1 | 2 | null;
}

interface Props {
  title: string;
  instructions: string;
  clientAge?: number;
  onSubmit: (data: Array<Omit<TimelineEntry, "grade"> & { grade: number }>) => void;
}

const GRADES = [
  { value: -2, label: "very bad", color: "#c04848" },
  { value: -1, label: "bad", color: "#d88a5f" },
  { value: 1, label: "good", color: "#7fb069" },
  { value: 2, label: "very good", color: "#2a5d4e" },
] as const;

function buildBrackets(maxAge: number): string[] {
  const top = Math.max(20, Math.ceil(maxAge / 5) * 5);
  const out: string[] = [];
  for (let a = 0; a < top; a += 5) out.push(`${a}-${a + 5}`);
  return out;
}

export default function LifeTimeline({
  title,
  instructions,
  clientAge,
  onSubmit,
}: Props) {
  const brackets = useMemo(() => buildBrackets(clientAge ?? 40), [clientAge]);
  const [entries, setEntries] = useState<TimelineEntry[]>(() =>
    brackets.map((r) => ({
      ageRange: r,
      title: "",
      feeling: "",
      description: "",
      grade: null,
    })),
  );
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof TimelineEntry>(
    i: number,
    key: K,
    value: TimelineEntry[K],
  ) {
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)),
    );
  }

  const filled = entries.filter((e) => e.grade !== null) as Array<
    Omit<TimelineEntry, "grade"> & { grade: number }
  >;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        For each 5-year chapter you've lived, give it a short title, a 2-3
        word feeling, a sentence of description, and a grade.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((e, i) => (
          <div
            key={e.ageRange}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr",
              gap: 10,
              padding: 10,
              border: "1px solid #e5e1d6",
              borderRadius: 10,
              background: "#fff",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#2a5d4e",
                display: "flex",
                alignItems: "center",
              }}
            >
              {e.ageRange}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <input
                value={e.title}
                disabled={submitted}
                onChange={(ev) => update(i, "title", ev.target.value)}
                placeholder="title of this chapter"
                style={inputStyle}
              />
              <input
                value={e.feeling}
                disabled={submitted}
                onChange={(ev) => update(i, "feeling", ev.target.value)}
                placeholder="2-3 words for how it felt"
                style={inputStyle}
              />
              <textarea
                value={e.description}
                disabled={submitted}
                onChange={(ev) => update(i, "description", ev.target.value)}
                rows={2}
                placeholder="one or two sentences"
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {GRADES.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    disabled={submitted}
                    onClick={() => update(i, "grade", g.value)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 13,
                      border: `1px solid ${e.grade === g.value ? g.color : "#d8d3c4"}`,
                      background: e.grade === g.value ? g.color : "white",
                      color: e.grade === g.value ? "white" : "#555",
                      cursor: submitted ? "default" : "pointer",
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {submitted && <LifeGraph entries={filled} />}
      {!submitted && (
        <button
          className="submit-btn"
          disabled={filled.length < 2}
          onClick={() => {
            setSubmitted(true);
            onSubmit(filled);
          }}
          style={{ marginTop: 14 }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid #d8d3c4",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 14,
  fontFamily: "inherit",
};

function LifeGraph({
  entries,
}: {
  entries: Array<{ ageRange: string; grade: number; title: string }>;
}) {
  const W = 560;
  const H = 280;
  const PAD = { l: 80, r: 20, t: 20, b: 40 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const points = entries
    .map((e) => {
      const [lo, hi] = e.ageRange.split("-").map(Number);
      return { age: (lo + hi) / 2, grade: e.grade, title: e.title };
    })
    .sort((a, b) => a.age - b.age);

  if (points.length === 0) return null;

  const xMin = Math.min(...points.map((p) => p.age)) - 2.5;
  const xMax = Math.max(...points.map((p) => p.age)) + 2.5;
  const xScale = (x: number) =>
    PAD.l + ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = (y: number) =>
    PAD.t + innerH / 2 - (y / 2) * (innerH / 2);

  const lineD = points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.age)} ${yScale(p.grade)}`,
    )
    .join(" ");

  const rising: Array<[(typeof points)[number], (typeof points)[number]]> = [];
  for (let i = 1; i < points.length; i++) {
    if (points[i].grade > points[i - 1].grade) {
      rising.push([points[i - 1], points[i]]);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: "0 0 6px" }}>Your life graph</h4>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 8px" }}>
        Rising lines (highlighted) are the moments you moved from hard toward
        better — that's where we'll look.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: "100%" }}>
        <line
          x1={PAD.l}
          y1={yScale(0)}
          x2={W - PAD.r}
          y2={yScale(0)}
          stroke="#bbb"
          strokeDasharray="4 3"
        />
        <line
          x1={PAD.l}
          y1={PAD.t}
          x2={PAD.l}
          y2={H - PAD.b}
          stroke="#888"
        />
        {[
          { v: 2, label: "very good" },
          { v: 1, label: "good" },
          { v: 0, label: "" },
          { v: -1, label: "bad" },
          { v: -2, label: "very bad" },
        ].map(({ v, label }) => (
          <g key={v}>
            <text
              x={PAD.l - 8}
              y={yScale(v) + 4}
              fontSize={12}
              textAnchor="end"
              fill={v === 0 ? "#aaa" : "#555"}
              fontWeight={v === 0 ? 400 : 500}
            >
              {label}
            </text>
            <line
              x1={PAD.l - 3}
              y1={yScale(v)}
              x2={PAD.l}
              y2={yScale(v)}
              stroke="#888"
            />
          </g>
        ))}
        {points.map((p) => (
          <text
            key={`xt-${p.age}`}
            x={xScale(p.age)}
            y={H - PAD.b + 16}
            fontSize={11}
            textAnchor="middle"
            fill="#666"
          >
            {p.age}
          </text>
        ))}
        <path d={lineD} stroke="#bbb" strokeWidth={1.5} fill="none" />
        {rising.map(([a, b], i) => (
          <line
            key={`rise-${i}`}
            x1={xScale(a.age)}
            y1={yScale(a.grade)}
            x2={xScale(b.age)}
            y2={yScale(b.grade)}
            stroke="#2a5d4e"
            strokeWidth={3}
          />
        ))}
        {points.map((p) => (
          <circle
            key={`pt-${p.age}`}
            cx={xScale(p.age)}
            cy={yScale(p.grade)}
            r={4}
            fill="#2a5d4e"
          />
        ))}
      </svg>
    </div>
  );
}
