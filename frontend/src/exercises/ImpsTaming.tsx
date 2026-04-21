import { useState } from "react";

interface Imp {
  name: string;
  trigger: string;
  taming: string;
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: { imps: Imp[] }) => void;
}

const SUGGESTIONS = [
  "The Judge",
  "The Comparer",
  "The Worrier",
  "The Postponer",
  "The People-Pleaser",
  "The Impostor",
  "The Martyr",
  "The Controller",
  "The Know-It-All",
  "The Victim",
];

export default function ImpsTaming({ title, instructions, onSubmit }: Props) {
  const [imps, setImps] = useState<Imp[]>([
    { name: "", trigger: "", taming: "" },
    { name: "", trigger: "", taming: "" },
  ]);
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, field: keyof Imp, value: string) {
    if (submitted) return;
    setImps((prev) =>
      prev.map((imp, idx) => (idx === i ? { ...imp, [field]: value } : imp)),
    );
  }

  function addImp() {
    if (submitted) return;
    setImps((prev) => [...prev, { name: "", trigger: "", taming: "" }]);
  }

  function removeImp(i: number) {
    if (submitted) return;
    setImps((prev) => prev.filter((_, idx) => idx !== i));
  }

  const complete = imps.filter(
    (imp) => imp.name.trim() && imp.trigger.trim() && imp.taming.trim(),
  );
  const ready = complete.length >= 1;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Small internal voices that sabotage at the exact moment of effort.
        Name them — an imp you can name is an imp you can tame. Most
        people have 1-3 dominant ones.
      </p>

      <div
        style={{
          padding: "10px 12px",
          background: "#f1ede1",
          borderRadius: 10,
          fontSize: 12,
          color: "#555",
          marginBottom: 14,
        }}
      >
        <b style={{ color: "#2a5d4e" }}>Classic imps, if useful:</b>{" "}
        {SUGGESTIONS.join(" · ")}. Or name your own — sometimes the best
        name is a private one ("The Little Boss", "The Apologizer").
      </div>

      {imps.map((imp, i) => (
        <div
          key={i}
          style={{
            padding: 12,
            background: "#faf8f1",
            border: "1px solid #e5e1d6",
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#b94b4b" }}>
              Imp {i + 1}
            </div>
            {imps.length > 1 && !submitted && (
              <button
                type="button"
                onClick={() => removeImp(i)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#888",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                remove
              </button>
            )}
          </div>
          <Field label="Name">
            <input
              type="text"
              disabled={submitted}
              value={imp.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="The ___"
              style={inp}
            />
          </Field>
          <Field label="When does it show up?">
            <textarea
              disabled={submitted}
              value={imp.trigger}
              onChange={(e) => update(i, "trigger", e.target.value)}
              rows={2}
              placeholder="Right before I send an email… when someone praises me… when I open the laptop to start the hard thing…"
              style={ta}
            />
          </Field>
          <Field label="How do I tame it?">
            <textarea
              disabled={submitted}
              value={imp.taming}
              onChange={(e) => update(i, "taming", e.target.value)}
              rows={2}
              placeholder="Name it out loud. Take three breaths. Ask: whose voice is this? Do the thing for 5 minutes anyway…"
              style={ta}
            />
          </Field>
        </div>
      ))}

      {!submitted && (
        <button
          type="button"
          onClick={addImp}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            background: "white",
            border: "1px dashed #b94b4b",
            borderRadius: 6,
            color: "#b94b4b",
            cursor: "pointer",
            fontFamily: "inherit",
            marginBottom: 10,
          }}
        >
          + add another imp
        </button>
      )}

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ imps: complete });
          }}
          style={{ marginTop: 4, display: "block" }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 14,
  border: "1px solid #d8d3c4",
  borderRadius: 8,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

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
