import { useState } from "react";

interface Stone {
  subOutcome: string;
  timeWindow: string;
  owner: string;
  resources: string;
  strength: string;
  value: string;
}

interface Output {
  goal: string;
  targetDate: string;
  stones: Stone[];
  startingPoint: string;
}

interface Props {
  title: string;
  instructions: string;
  goal?: string;
  targetDate?: string;
  topStrengths?: string[];
  topValues?: string[];
  topNeeds?: string[];
  biggestGap?: string;
  topRestrainer?: string;
  topAdvancers?: string[];
  onSubmit: (data: Output) => void;
}

function emptyStone(): Stone {
  return {
    subOutcome: "",
    timeWindow: "",
    owner: "",
    resources: "",
    strength: "",
    value: "",
  };
}

export default function MilestonePlan({
  title,
  instructions,
  goal,
  targetDate,
  topStrengths,
  topValues,
  topNeeds,
  biggestGap,
  topRestrainer,
  topAdvancers,
  onSubmit,
}: Props) {
  const [stones, setStones] = useState<Stone[]>([
    emptyStone(),
    emptyStone(),
    emptyStone(),
    emptyStone(),
  ]);
  const [startingPoint, setStartingPoint] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update(i: number, field: keyof Stone, value: string) {
    if (submitted) return;
    setStones((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    );
  }

  function addStone() {
    if (submitted || stones.length >= 6) return;
    setStones((prev) => [...prev, emptyStone()]);
  }

  function removeStone(i: number) {
    if (submitted || stones.length <= 3) return;
    setStones((prev) => prev.filter((_, idx) => idx !== i));
  }

  const fullyFilled = (s: Stone) =>
    s.subOutcome.trim() &&
    s.timeWindow.trim() &&
    s.owner.trim() &&
    s.resources.trim() &&
    s.strength.trim() &&
    s.value.trim();
  const filledCount = stones.filter(fullyFilled).length;
  const ready = filledCount >= 4 && startingPoint.trim().length > 0;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        We plan BACKWARD. Start from the goal at the top. Each stepping
        stone is a sub-outcome — not a task, but something real you
        could point to and say "that part is done." Usually 4-6 stones
        between the goal and today. Each stone is tagged with a
        strength from you and a value from you — this is YOUR plan.
      </p>

      {goal && (
        <div
          style={{
            padding: "14px 16px",
            background: "#2a5d4e",
            color: "white",
            borderRadius: 10,
            marginBottom: 14,
            fontSize: 15,
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
            Goal{targetDate ? ` — by ${targetDate}` : ""}
          </div>
          {goal}
        </div>
      )}

      <ContextBanner
        topStrengths={topStrengths}
        topValues={topValues}
        topNeeds={topNeeds}
        biggestGap={biggestGap}
        topRestrainer={topRestrainer}
        topAdvancers={topAdvancers}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "16px 0 8px",
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#d8d3c4" }} />
        <div style={{ fontSize: 11, color: "#888", letterSpacing: 0.5 }}>
          ↑ GOAL · STONES BELOW WALK BACKWARD ↓
        </div>
        <div style={{ flex: 1, height: 1, background: "#d8d3c4" }} />
      </div>

      {stones.map((s, i) => (
        <StoneRow
          key={i}
          index={i}
          total={stones.length}
          stone={s}
          submitted={submitted}
          topStrengths={topStrengths}
          topValues={topValues}
          onUpdate={(field, value) => update(i, field, value)}
          onRemove={() => removeStone(i)}
        />
      ))}

      {!submitted && stones.length < 6 && (
        <button
          type="button"
          onClick={addStone}
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
          + add another stepping stone (max 6)
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
          Starting point — today
        </div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          Where you actually are right now. One honest line.
        </div>
        <textarea
          disabled={submitted}
          value={startingPoint}
          onChange={(e) => setStartingPoint(e.target.value)}
          rows={2}
          placeholder="Today I am…"
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
        {filledCount} / {stones.length} stones fully filled
        {filledCount < 4 ? ` — need at least 4 complete` : " ✓"}
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              goal: goal ?? "",
              targetDate: targetDate ?? "",
              stones: stones.filter(fullyFilled),
              startingPoint,
            });
          }}
        >
          Share the plan with coach
        </button>
      )}
    </div>
  );
}

function ContextBanner({
  topStrengths,
  topValues,
  topNeeds,
  biggestGap,
  topRestrainer,
  topAdvancers,
}: {
  topStrengths?: string[];
  topValues?: string[];
  topNeeds?: string[];
  biggestGap?: string;
  topRestrainer?: string;
  topAdvancers?: string[];
}) {
  const hasAny =
    topStrengths?.length ||
    topValues?.length ||
    topNeeds?.length ||
    topRestrainer ||
    topAdvancers?.length;
  if (!hasAny) return null;
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#f1ede1",
        borderRadius: 10,
        fontSize: 12,
        color: "#555",
        marginBottom: 4,
        lineHeight: 1.55,
      }}
    >
      <div style={{ fontWeight: 700, color: "#2a5d4e", marginBottom: 4 }}>
        From our earlier sessions — this plan is built on these:
      </div>
      {topStrengths && topStrengths.length > 0 && (
        <div>
          <b>Your strengths:</b> {topStrengths.join(" · ")}
        </div>
      )}
      {topValues && topValues.length > 0 && (
        <div>
          <b>Your values:</b> {topValues.join(" · ")}
        </div>
      )}
      {topNeeds && topNeeds.length > 0 && (
        <div>
          <b>Driving needs:</b> {topNeeds.join(" · ")}
          {biggestGap && (
            <span style={{ color: "#b94b4b", marginLeft: 6 }}>
              (biggest gap: {biggestGap})
            </span>
          )}
        </div>
      )}
      {topAdvancers && topAdvancers.length > 0 && (
        <div>
          <b>Forces advancing you:</b> {topAdvancers.join(" · ")}
        </div>
      )}
      {topRestrainer && (
        <div style={{ color: "#b94b4b" }}>
          <b>Top restrainer to design around:</b> {topRestrainer}
        </div>
      )}
    </div>
  );
}

function StoneRow({
  index,
  total,
  stone,
  submitted,
  topStrengths,
  topValues,
  onUpdate,
  onRemove,
}: {
  index: number;
  total: number;
  stone: Stone;
  submitted: boolean;
  topStrengths?: string[];
  topValues?: string[];
  onUpdate: (field: keyof Stone, value: string) => void;
  onRemove: () => void;
}) {
  const isLast = index === total - 1;
  return (
    <div
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
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2a5d4e",
            letterSpacing: 0.5,
          }}
        >
          STEPPING STONE {total - index}
          {index === 0 ? " (closest to goal)" : ""}
          {isLast ? " (closest to today)" : ""}
        </div>
        {!submitted && total > 3 && (
          <button
            type="button"
            onClick={onRemove}
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

      <Field label="Sub-outcome — what's real when this stone is reached?">
        <textarea
          disabled={submitted}
          value={stone.subOutcome}
          onChange={(e) => onUpdate("subOutcome", e.target.value)}
          rows={2}
          placeholder={
            index === 0
              ? "Right before the goal — what's the last thing that needs to be true?"
              : "A sub-outcome, not a task. 'Application package ready to submit' not 'submit the app'"
          }
          style={ta}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Field label="Time window (from when → until when)">
          <input
            type="text"
            disabled={submitted}
            value={stone.timeWindow}
            onChange={(e) => onUpdate("timeWindow", e.target.value)}
            placeholder="e.g. May 1 — May 20"
            style={inp}
          />
        </Field>
        <Field label="Owner (usually me — or who?)">
          <input
            type="text"
            disabled={submitted}
            value={stone.owner}
            onChange={(e) => onUpdate("owner", e.target.value)}
            placeholder="Me / me + [name] / [name]"
            style={inp}
          />
        </Field>
      </div>

      <Field label="Resources needed — knowledge, money, skills, and PEOPLE to bring on board">
        <textarea
          disabled={submitted}
          value={stone.resources}
          onChange={(e) => onUpdate("resources", e.target.value)}
          rows={2}
          placeholder="What I need to know / have / spend / ask. Name people by name, not role."
          style={ta}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Field label="Which of my strengths carries this?">
          {topStrengths && topStrengths.length > 0 ? (
            <select
              disabled={submitted}
              value={stone.strength}
              onChange={(e) => onUpdate("strength", e.target.value)}
              style={inp}
            >
              <option value="">pick one…</option>
              {topStrengths.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__other__">other (type below)</option>
            </select>
          ) : (
            <input
              type="text"
              disabled={submitted}
              value={stone.strength}
              onChange={(e) => onUpdate("strength", e.target.value)}
              placeholder="My strength here…"
              style={inp}
            />
          )}
          {stone.strength === "__other__" && (
            <input
              type="text"
              disabled={submitted}
              onChange={(e) => onUpdate("strength", e.target.value)}
              placeholder="Your strength…"
              style={{ ...inp, marginTop: 4 }}
            />
          )}
        </Field>
        <Field label="Which of my values does this honor?">
          {topValues && topValues.length > 0 ? (
            <select
              disabled={submitted}
              value={stone.value}
              onChange={(e) => onUpdate("value", e.target.value)}
              style={inp}
            >
              <option value="">pick one…</option>
              {topValues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
              <option value="__other__">other (type below)</option>
            </select>
          ) : (
            <input
              type="text"
              disabled={submitted}
              value={stone.value}
              onChange={(e) => onUpdate("value", e.target.value)}
              placeholder="My value here…"
              style={inp}
            />
          )}
          {stone.value === "__other__" && (
            <input
              type="text"
              disabled={submitted}
              onChange={(e) => onUpdate("value", e.target.value)}
              placeholder="Your value…"
              style={{ ...inp, marginTop: 4 }}
            />
          )}
        </Field>
      </div>
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
  fontSize: 13,
  border: "1px solid #d8d3c4",
  borderRadius: 8,
  fontFamily: "inherit",
  boxSizing: "border-box",
  background: "white",
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
