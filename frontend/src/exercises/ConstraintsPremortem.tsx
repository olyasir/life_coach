import { useState } from "react";

interface Row {
  constraint: string;
  requiredAction: string;
  known: "known" | "unknown" | "";
  isTopRestrainer?: boolean;
}

interface Output {
  rows: Row[];
  foldInto: string;
}

interface Props {
  title: string;
  instructions: string;
  topRestrainer?: string;
  restrainerOrigin?: string;
  restrainerProtectAgainst?: string;
  onSubmit: (data: Output) => void;
}

export default function ConstraintsPremortem({
  title,
  instructions,
  topRestrainer,
  restrainerOrigin,
  restrainerProtectAgainst,
  onSubmit,
}: Props) {
  const [rows, setRows] = useState<Row[]>(() => {
    const initial: Row[] = [];
    if (topRestrainer) {
      initial.push({
        constraint: topRestrainer,
        requiredAction: "",
        known: "",
        isTopRestrainer: true,
      });
    }
    while (initial.length < 4) {
      initial.push({ constraint: "", requiredAction: "", known: "" });
    }
    return initial;
  });
  const [foldInto, setFoldInto] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, field: keyof Row, value: string) {
    if (submitted) return;
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );
  }

  function addRow() {
    if (submitted) return;
    setRows((prev) => [
      ...prev,
      { constraint: "", requiredAction: "", known: "" },
    ]);
  }

  const filled = rows.filter(
    (r) => r.constraint.trim() && r.requiredAction.trim() && r.known,
  );
  const knownOnes = filled.filter((r) => r.known === "known");
  const ready = filled.length >= 3 && foldInto.trim().length > 0;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Every plan meets unforeseen events. Some can be foreseen. List
        the constraints likely to show up on the path to your goal. For
        each: what action would be required, and do you already know how
        to handle it? The KNOWN ones get folded back into the plan
        itself — handled by structure, not by willpower in the moment.
      </p>

      {topRestrainer && (
        <div
          style={{
            padding: "10px 12px",
            background: "#fff1ee",
            border: "1px solid #b94b4b",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 14,
            lineHeight: 1.55,
          }}
        >
          <div style={{ fontWeight: 700, color: "#b94b4b", marginBottom: 3 }}>
            Constraint you already know is coming (from last session):
          </div>
          <div>
            <b>{topRestrainer}</b>
            {restrainerOrigin && (
              <span style={{ color: "#888" }}>
                {" "}
                — origin: {restrainerOrigin}
              </span>
            )}
            {restrainerProtectAgainst && (
              <span style={{ color: "#888" }}>
                {" "}
                — protects you from: {restrainerProtectAgainst}
              </span>
            )}
          </div>
          <div style={{ marginTop: 4, fontStyle: "italic", color: "#888" }}>
            Pre-filled as row 1. Write the required action for it.
          </div>
        </div>
      )}

      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            padding: 12,
            background: r.isTopRestrainer ? "#fff9f6" : "#faf8f1",
            border: `1px solid ${r.isTopRestrainer ? "#b94b4b55" : "#e5e1d6"}`,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: r.isTopRestrainer ? "#b94b4b" : "#2a5d4e",
              marginBottom: 6,
            }}
          >
            Constraint {i + 1}
            {r.isTopRestrainer ? " (your top restrainer)" : ""}
          </div>
          <Field label="Constraint — what's likely to go sideways?">
            <textarea
              disabled={submitted || r.isTopRestrainer}
              value={r.constraint}
              onChange={(e) => update(i, "constraint", e.target.value)}
              rows={2}
              placeholder="A time collision, a money limit, a specific person's reaction, energy crash at week 3…"
              style={{
                ...ta,
                background: r.isTopRestrainer ? "#f5f3ea" : "white",
              }}
            />
          </Field>
          <Field label="Required action — what handles it?">
            <textarea
              disabled={submitted}
              value={r.requiredAction}
              onChange={(e) => update(i, "requiredAction", e.target.value)}
              rows={2}
              placeholder="When this shows up, I will…"
              style={ta}
            />
          </Field>
          <div style={{ display: "flex", gap: 8 }}>
            <KnownButton
              active={r.known === "known"}
              label="I know how to handle this"
              disabled={submitted}
              onClick={() => update(i, "known", "known")}
              color="#2a5d4e"
            />
            <KnownButton
              active={r.known === "unknown"}
              label="I don't know yet"
              disabled={submitted}
              onClick={() => update(i, "known", "unknown")}
              color="#b94b4b"
            />
          </div>
        </div>
      ))}

      {!submitted && (
        <button
          type="button"
          onClick={addRow}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            background: "white",
            border: "1px dashed #2a5d4e",
            borderRadius: 6,
            color: "#2a5d4e",
            cursor: "pointer",
            fontFamily: "inherit",
            marginBottom: 14,
          }}
        >
          + add another constraint
        </button>
      )}

      <div
        style={{
          padding: "12px 14px",
          background: "#f1ede1",
          border: "1px solid #e5e1d6",
          borderRadius: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2a5d4e",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Fold into the plan
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          Of the KNOWN-action constraints, which one needs to be built
          into the plan's structure — so it's handled automatically, not
          by willpower in the moment?
          {knownOnes.length > 0 && (
            <span style={{ color: "#2a5d4e" }}>
              {" "}
              Known ones: {knownOnes.map((k) => k.constraint).join(" · ")}
            </span>
          )}
        </div>
        <textarea
          disabled={submitted}
          value={foldInto}
          onChange={(e) => setFoldInto(e.target.value)}
          rows={3}
          placeholder="e.g. 'Because I get scattered working alone, I'll add a weekly 30-min check-in with [name] to each stepping stone'"
          style={ta}
        />
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#2a5d4e",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {filled.length} constraints complete (need at least 3)
        {knownOnes.length > 0
          ? ` · ${knownOnes.length} known · ${filled.length - knownOnes.length} unknown`
          : ""}
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ rows: filled, foldInto });
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function KnownButton({
  active,
  label,
  disabled,
  onClick,
  color,
}: {
  active: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        flex: 1,
        padding: "6px 10px",
        fontSize: 12,
        borderRadius: 6,
        border: `1px solid ${active ? color : "#d8d3c4"}`,
        background: active ? color : "white",
        color: active ? "white" : "#555",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        fontWeight: active ? 700 : 400,
      }}
    >
      {active ? "✓ " : ""}
      {label}
    </button>
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
