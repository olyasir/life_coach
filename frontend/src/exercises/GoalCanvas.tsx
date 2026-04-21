import { useState } from "react";

interface QualityCheck {
  confirmed: boolean;
  note: string;
}

interface GoalCanvasOutput {
  goalStatement: string;
  valueHonored: string;
  needMet: string;
  targetDate: string;
  passion: number;
  willingToDo: string;
  priceWillingToPay: string;
  coreTest: QualityCheck;
  ecologicalTest: QualityCheck;
  realityTest: QualityCheck;
}

interface Props {
  title: string;
  instructions: string;
  goalDraft?: string;
  topValues?: string[];
  topNeeds?: string[];
  biggestGap?: string;
  onSubmit: (data: GoalCanvasOutput) => void;
}

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

export default function GoalCanvas({
  title,
  instructions,
  goalDraft,
  topValues,
  topNeeds,
  biggestGap,
  onSubmit,
}: Props) {
  const [goalStatement, setGoalStatement] = useState(goalDraft ?? "");
  const [valueHonored, setValueHonored] = useState("");
  const [needMet, setNeedMet] = useState(biggestGap ?? "");
  const [targetDate, setTargetDate] = useState("");
  const [passion, setPassion] = useState(7);
  const [willingToDo, setWillingToDo] = useState("");
  const [priceWillingToPay, setPriceWillingToPay] = useState("");
  const [coreTest, setCoreTest] = useState<QualityCheck>({
    confirmed: false,
    note: "",
  });
  const [ecologicalTest, setEcologicalTest] = useState<QualityCheck>({
    confirmed: false,
    note: "",
  });
  const [realityTest, setRealityTest] = useState<QualityCheck>({
    confirmed: false,
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const ready =
    goalStatement.trim().length > 10 &&
    valueHonored.trim() &&
    needMet.trim() &&
    targetDate.trim() &&
    willingToDo.trim() &&
    priceWillingToPay.trim() &&
    coreTest.confirmed &&
    coreTest.note.trim() &&
    ecologicalTest.confirmed &&
    ecologicalTest.note.trim() &&
    realityTest.confirmed &&
    realityTest.note.trim();

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        This is where your goal becomes real — in your own handwriting.
        Positive, specific, measurable, time-bound. Yours alone.
      </p>

      {(topValues?.length || topNeeds?.length) && (
        <div
          style={{
            padding: "10px 12px",
            background: "#f1ede1",
            borderRadius: 10,
            marginBottom: 14,
            fontSize: 12,
            color: "#555",
          }}
        >
          <div style={{ fontWeight: 700, color: "#2a5d4e", marginBottom: 4 }}>
            From earlier sessions — here's what drives you:
          </div>
          {topValues && topValues.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <b>Your top values:</b> {topValues.join(" · ")}
            </div>
          )}
          {topNeeds && topNeeds.length > 0 && (
            <div>
              <b>Your driving needs:</b> {topNeeds.join(" · ")}
              {biggestGap && (
                <span style={{ color: "#b94b4b", marginLeft: 6 }}>
                  (biggest gap: {biggestGap})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <Field label="My goal — in one sentence (positive, specific, time-bound)">
        <textarea
          disabled={submitted}
          value={goalStatement}
          onChange={(e) => setGoalStatement(e.target.value)}
          rows={3}
          placeholder="By [date], I will [what exactly]…"
          style={ta}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Value this honors">
          <input
            type="text"
            disabled={submitted}
            value={valueHonored}
            onChange={(e) => setValueHonored(e.target.value)}
            placeholder="Which of my top values?"
            style={inp}
          />
        </Field>
        <Field label="Need this meets">
          <input
            type="text"
            disabled={submitted}
            value={needMet}
            onChange={(e) => setNeedMet(e.target.value)}
            placeholder="Which need — especially the biggest gap?"
            style={inp}
          />
        </Field>
      </div>

      <Field label="Target date">
        <input
          type="text"
          disabled={submitted}
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          placeholder="A real date — e.g. September 1, 2026"
          style={inp}
        />
      </Field>

      <Field
        label={
          <>
            Passion for this goal:{" "}
            <span style={{ fontWeight: 700, color: "#2a5d4e" }}>
              {passion}/10
            </span>
          </>
        }
      >
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const isOn = passion === n;
            return (
              <button
                key={n}
                type="button"
                disabled={submitted}
                onClick={() => setPassion(n)}
                style={{
                  width: 32,
                  height: 32,
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
      </Field>

      <Field label="What I'm willing to DO to achieve this">
        <textarea
          disabled={submitted}
          value={willingToDo}
          onChange={(e) => setWillingToDo(e.target.value)}
          rows={3}
          placeholder="Concrete actions I'll take — wake earlier, have the hard conversation, spend money, say no to…"
          style={ta}
        />
      </Field>

      <Field label="The price I'm willing to pay">
        <textarea
          disabled={submitted}
          value={priceWillingToPay}
          onChange={(e) => setPriceWillingToPay(e.target.value)}
          rows={3}
          placeholder="Time, money, comfort, relationships strained, fears faced — what will it cost me?"
          style={ta}
        />
      </Field>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: "#f1ede1",
          borderRadius: 10,
          border: "1px solid #e5e1d6",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#2a5d4e",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Three quality tests
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          Confirm each one, and write a line about what you see.
        </div>

        <QualityTestRow
          label="CORE — aligns with my values & beliefs"
          hint="Will I still respect myself when I achieve it this way?"
          disabled={submitted}
          check={coreTest}
          onChange={setCoreTest}
        />
        <QualityTestRow
          label="ECOLOGICAL — I've considered who else is affected"
          hint="Partner, kids, parents, colleagues — are they with me on this?"
          disabled={submitted}
          check={ecologicalTest}
          onChange={setEcologicalTest}
        />
        <QualityTestRow
          label="REALITY — I have (or can get) the resources"
          hint="Skill, time, money, support — is this achievable for me?"
          disabled={submitted}
          check={realityTest}
          onChange={setRealityTest}
        />
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              goalStatement,
              valueHonored,
              needMet,
              targetDate,
              passion,
              willingToDo,
              priceWillingToPay,
              coreTest,
              ecologicalTest,
              realityTest,
            });
          }}
          style={{ marginTop: 16 }}
        >
          This is my goal — share with coach
        </button>
      )}
    </div>
  );
}

function QualityTestRow({
  label,
  hint,
  disabled,
  check,
  onChange,
}: {
  label: string;
  hint: string;
  disabled: boolean;
  check: QualityCheck;
  onChange: (c: QualityCheck) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <input
          type="checkbox"
          disabled={disabled}
          checked={check.confirmed}
          onChange={(e) => onChange({ ...check, confirmed: e.target.checked })}
          style={{ marginTop: 3 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#2a5d4e" }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
            {hint}
          </div>
        </div>
      </label>
      <textarea
        disabled={disabled || !check.confirmed}
        value={check.note}
        onChange={(e) => onChange({ ...check, note: e.target.value })}
        rows={2}
        placeholder={
          check.confirmed ? "A line on what you see here…" : "(check above first)"
        }
        style={{
          ...ta,
          marginTop: 4,
          opacity: check.confirmed ? 1 : 0.5,
          background: check.confirmed ? "white" : "#f5f3ea",
        }}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div>
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
};
