import { useState } from "react";

interface Output {
  statements: string[];
  proofMoment: string;
  oldIdentity: string;
}

interface Props {
  title: string;
  instructions: string;
  goal?: string;
  identityShift?: string;
  onSubmit: (data: Output) => void;
}

export default function IdentityBecoming({
  title,
  instructions,
  goal,
  identityShift,
  onSubmit,
}: Props) {
  const [statements, setStatements] = useState<string[]>(["", "", "", "", ""]);
  const [proofMoment, setProofMoment] = useState("");
  const [oldIdentity, setOldIdentity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, value: string) {
    if (submitted) return;
    setStatements((prev) => prev.map((s, idx) => (idx === i ? value : s)));
  }

  function addStatement() {
    if (submitted) return;
    setStatements((prev) => [...prev, ""]);
  }

  const filled = statements.filter((s) => s.trim().length > 0);
  const ready =
    filled.length >= 5 &&
    proofMoment.trim().length > 0 &&
    oldIdentity.trim().length > 0;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Behavior change held by willpower decays. Behavior change held by
        identity stays. The shift is from "I'm trying to write" to "I am a
        writer." You earn the statement with one tiny win — then you keep
        repeating it until the body believes it.
      </p>

      {goal && (
        <div
          style={{
            padding: "10px 12px",
            background: "#f5f1e6",
            border: "1px solid #d8d3c4",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: "#2a5d4e", marginBottom: 3 }}>
            The goal:
          </div>
          <div>{goal}</div>
        </div>
      )}

      {identityShift && (
        <div
          style={{
            padding: "10px 12px",
            background: "#fff9f0",
            border: "1px solid #b9883b",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: "#b9883b", marginBottom: 3 }}>
            Who you said in S8 you'd become:
          </div>
          <div>{identityShift}</div>
        </div>
      )}

      <div
        style={{
          padding: "12px 14px",
          background: "#fff1ee",
          border: "1px solid #b94b4b",
          borderRadius: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#b94b4b",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          1 · The proof — the win that earns the statement
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          What's ONE thing you've already done — even tiny — that the new
          you would do? This is your proof. Identity statements without
          proof are wishful thinking.
        </div>
        <textarea
          disabled={submitted}
          value={proofMoment}
          onChange={(e) => setProofMoment(e.target.value)}
          rows={3}
          placeholder="Last week I…"
          style={ta}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2a5d4e",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          2 · Five "I AM" statements (not "I'm trying to be" — "I AM")
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          Write them in present tense. They should feel slightly bigger
          than comfortable — but anchored to the proof above.
        </div>
        {statements.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#2a5d4e",
                fontWeight: 700,
                minWidth: 32,
              }}
            >
              I am
            </span>
            <input
              type="text"
              disabled={submitted}
              value={s}
              onChange={(e) => update(i, e.target.value)}
              placeholder="someone who…"
              style={{
                flex: 1,
                padding: "8px 10px",
                fontSize: 13,
                border: "1px solid #d8d3c4",
                borderRadius: 8,
                fontFamily: "inherit",
                background: "white",
              }}
            />
          </div>
        ))}
        {!submitted && (
          <button
            type="button"
            onClick={addStatement}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              background: "white",
              border: "1px dashed #2a5d4e",
              borderRadius: 6,
              color: "#2a5d4e",
              cursor: "pointer",
              fontFamily: "inherit",
              marginTop: 4,
            }}
          >
            + add another
          </button>
        )}
      </div>

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
          3 · The old identity you're letting go of
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          Every new identity displaces an old one. Naming what you're
          leaving makes the new identity easier to step into.
        </div>
        <textarea
          disabled={submitted}
          value={oldIdentity}
          onChange={(e) => setOldIdentity(e.target.value)}
          rows={3}
          placeholder="The version of me I'm leaving behind is the one who…"
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
        {filled.length} statements written (need at least 5)
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              statements: filled,
              proofMoment,
              oldIdentity,
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
