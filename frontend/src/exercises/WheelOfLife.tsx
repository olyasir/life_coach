import { useRef, useState } from "react";

const DEFAULT_DOMAINS = [
  "Career",
  "Finances",
  "Health",
  "Family",
  "Romance",
  "Friends",
  "Growth",
  "Fun",
];

const SIZE = 500;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 180;
const R_LABEL = 215;
const MAX_SCORE = 10;

function polar(angle: number, r: number): [number, number] {
  return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)];
}

function sliceArc(i: number, sliceCount: number, r: number): string {
  const sweep = (Math.PI * 2) / sliceCount;
  const start = -Math.PI / 2 + i * sweep;
  const end = start + sweep;
  const [x1, y1] = polar(start, r);
  const [x2, y2] = polar(end, r);
  return `M ${CX} ${CY} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}

interface Props {
  title: string;
  instructions: string;
  domains?: string[];
  onSubmit: (data: Record<string, number>) => void;
}

export default function WheelOfLife({ title, instructions, domains, onSubmit }: Props) {
  const list = domains ?? DEFAULT_DOMAINS;
  const sliceCount = list.length;
  const sweep = (Math.PI * 2) / sliceCount;
  const svgRef = useRef<SVGSVGElement>(null);
  const [values, setValues] = useState<Record<string, number>>(
    () => Object.fromEntries(list.map((d) => [d, 5])),
  );
  const [submitted, setSubmitted] = useState(false);

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    if (submitted) return;
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const dx = local.x - CX;
    const dy = local.y - CY;
    const dist = Math.hypot(dx, dy);
    if (dist > R_OUTER + 30) return;
    let angle = Math.atan2(dy, dx);
    angle = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const sliceIndex = Math.floor(angle / sweep) % sliceCount;
    const score = Math.max(
      1,
      Math.min(MAX_SCORE, Math.round((dist / R_OUTER) * MAX_SCORE)),
    );
    setValues((prev) => ({ ...prev, [list[sliceIndex]]: score }));
  }

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, textAlign: "center", margin: "4px 0 0" }}>
        Tap or drag in each slice to set its score (1 = center, 10 = edge)
      </p>
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            maxWidth: 480,
            touchAction: "none",
            cursor: submitted ? "default" : "pointer",
          }}
          onPointerDown={handlePointer}
          onPointerMove={(e) => {
            if (e.buttons === 1) handlePointer(e);
          }}
        >
          {Array.from({ length: MAX_SCORE }, (_, i) => i + 1).map((s) => (
            <circle
              key={`grid-${s}`}
              cx={CX}
              cy={CY}
              r={(s / MAX_SCORE) * R_OUTER}
              fill="none"
              stroke="#e5e1d6"
              strokeWidth={1}
            />
          ))}
          {list.map((d, i) => {
            const r = (values[d] / MAX_SCORE) * R_OUTER;
            return (
              <path
                key={`fill-${d}`}
                d={sliceArc(i, sliceCount, r)}
                fill="#2a5d4e"
                fillOpacity={0.78}
                stroke="white"
                strokeWidth={1.5}
              />
            );
          })}
          {list.map((_, i) => {
            const start = -Math.PI / 2 + i * sweep;
            const [x, y] = polar(start, R_OUTER);
            return (
              <line
                key={`div-${i}`}
                x1={CX}
                y1={CY}
                x2={x}
                y2={y}
                stroke="#d8d3c4"
                strokeWidth={1}
              />
            );
          })}
          <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#2a5d4e" strokeWidth={2} />
          {list.map((d, i) => {
            const angle = -Math.PI / 2 + i * sweep + sweep / 2;
            const [lx, ly] = polar(angle, R_LABEL);
            return (
              <g key={`label-${d}`}>
                <text
                  x={lx}
                  y={ly - 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={14}
                  fontWeight={600}
                  fill="#1b1b1b"
                >
                  {d}
                </text>
                <text
                  x={lx}
                  y={ly + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fill="#2a5d4e"
                  fontWeight={600}
                >
                  {values[d]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {!submitted && (
        <button
          className="submit-btn"
          onClick={() => {
            setSubmitted(true);
            onSubmit(values);
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}
