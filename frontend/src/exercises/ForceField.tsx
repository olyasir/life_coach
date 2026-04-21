import { useState } from "react";

interface ForceFieldOutput {
  advancers: string[];
  restrainers: string[];
  wantsToBeExpressed: string;
}

interface Props {
  title: string;
  instructions: string;
  goal?: string;
  targetDate?: string;
  onSubmit: (data: ForceFieldOutput) => void;
}

export default function ForceField({
  title,
  instructions,
  goal,
  targetDate,
  onSubmit,
}: Props) {
  const [advancers, setAdvancers] = useState<string[]>(["", "", "", "", ""]);
  const [restrainers, setRestrainers] = useState<string[]>(["", "", ""]);
  const [wantsToBeExpressed, setWantsToBeExpressed] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateAdv(i: number, v: string) {
    if (submitted) return;
    setAdvancers((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  }
  function updateRes(i: number, v: string) {
    if (submitted) return;
    setRestrainers((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  }
  function addAdv() {
    if (submitted) return;
    setAdvancers((prev) => [...prev, ""]);
  }
  function addRes() {
    if (submitted) return;
    setRestrainers((prev) => [...prev, ""]);
  }

  const advFilled = advancers.filter((x) => x.trim()).length;
  const resFilled = restrainers.filter((x) => x.trim()).length;
  const ready = advFilled >= 5 && resFilled >= 3;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Every goal sits between forces that pull you toward it and forces
        that keep you where you are. Both are real. Today we name both —
        honestly.
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
            My goal{targetDate ? ` — by ${targetDate}` : ""}
          </div>
          {goal}
        </div>
      )}

      <Column
        title="Forces advancing me"
        tint="#7fb069"
        hint="People who help, environments that make it easier, past wins I can reuse, strengths, resources, habits, values that pull me. At least 5."
        items={advancers}
        filled={advFilled}
        minimum={5}
        placeholder={(i) =>
          i < 3
            ? "A person, a strength, a resource…"
            : "And also… (dig for what's already working)"
        }
        onUpdate={updateAdv}
        onAdd={addAdv}
        submitted={submitted}
      />

      <Column
        title="Forces restraining me"
        tint="#b94b4b"
        hint="External: time, money, a person, distance. Internal: fears, beliefs, patterns, voices, habits. At least 3 — name them honestly."
        items={restrainers}
        filled={resFilled}
        minimum={3}
        placeholder={(i) =>
          i < 2
            ? "A fear, an obstacle, a pattern…"
            : "And also… (what else keeps me stuck?)"
        }
        onUpdate={updateRes}
        onAdd={addRes}
        submitted={submitted}
      />

      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#2a5d4e",
            marginBottom: 4,
          }}
        >
          What wants to be expressed
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
          Anything that doesn't fit cleanly in either column but feels alive.
          Optional — leave empty if nothing's there.
        </div>
        <textarea
          disabled={submitted}
          value={wantsToBeExpressed}
          onChange={(e) => setWantsToBeExpressed(e.target.value)}
          rows={3}
          placeholder="The thing you'd say if no one was listening…"
          style={ta}
        />
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              advancers: advancers.filter((x) => x.trim()),
              restrainers: restrainers.filter((x) => x.trim()),
              wantsToBeExpressed,
            });
          }}
          style={{ marginTop: 14 }}
        >
          {ready
            ? "Share the field with coach"
            : `(need 5 advancers, 3 restrainers — ${advFilled}/5, ${resFilled}/3)`}
        </button>
      )}
    </div>
  );
}

function Column({
  title,
  tint,
  hint,
  items,
  filled,
  minimum,
  placeholder,
  onUpdate,
  onAdd,
  submitted,
}: {
  title: string;
  tint: string;
  hint: string;
  items: string[];
  filled: number;
  minimum: number;
  placeholder: (i: number) => string;
  onUpdate: (i: number, v: string) => void;
  onAdd: () => void;
  submitted: boolean;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        background: "#faf8f1",
        border: `1px solid ${tint}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 4,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: tint }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: "#888" }}>
          {filled} / {minimum}
          {filled >= minimum ? " ✓" : ""}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{hint}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((val, i) => (
          <textarea
            key={i}
            disabled={submitted}
            value={val}
            onChange={(e) => onUpdate(i, e.target.value)}
            rows={1}
            placeholder={placeholder(i)}
            style={ta}
          />
        ))}
      </div>
      {!submitted && (
        <button
          type="button"
          onClick={onAdd}
          style={{
            marginTop: 8,
            padding: "4px 10px",
            fontSize: 12,
            background: "white",
            border: `1px dashed ${tint}`,
            borderRadius: 6,
            color: tint,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + add another
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
