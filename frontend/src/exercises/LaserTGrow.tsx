import { useState } from "react";

interface Output {
  topic: string;
  goals: string;
  reality: string;
  options: string[];
  will: {
    action: string;
    when: string;
    support: string;
  };
}

interface Props {
  title: string;
  instructions: string;
  topic?: string;
  onSubmit: (data: Output) => void;
}

export default function LaserTGrow({
  title,
  instructions,
  topic: seedTopic,
  onSubmit,
}: Props) {
  const [topic, setTopic] = useState(seedTopic ?? "");
  const [goals, setGoals] = useState("");
  const [reality, setReality] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [action, setAction] = useState("");
  const [when, setWhen] = useState("");
  const [support, setSupport] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const setOption = (i: number, v: string) => {
    const next = [...options];
    next[i] = v;
    setOptions(next);
  };

  const filledOptions = options.filter((o) => o.trim().length > 0);
  const ready =
    topic.trim().length > 0 &&
    goals.trim().length > 0 &&
    reality.trim().length > 0 &&
    filledOptions.length >= 2 &&
    action.trim().length > 0 &&
    when.trim().length > 0;

  const stage = (
    letter: string,
    name: string,
    hint: string,
    children: React.ReactNode,
  ) => (
    <div
      style={{
        padding: "14px 16px",
        background: "#fdfbf6",
        border: "1px solid #e6dec9",
        borderRadius: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#2a5d4e",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {letter}
        </div>
        <b style={{ color: "#2a5d4e", fontSize: 14 }}>{name}</b>
      </div>
      <p
        style={{
          color: "#888",
          fontSize: 12,
          margin: "0 0 8px 38px",
          lineHeight: 1.4,
        }}
      >
        {hint}
      </p>
      <div style={{ marginLeft: 38 }}>{children}</div>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    fontSize: 14,
    border: "1px solid #d8d3c4",
    borderRadius: 6,
    background: "white",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 14px" }}>
        A laser session — a focused detour to work one specific issue cleanly,
        stage by stage, before returning to our main work.
      </p>

      {stage(
        "T",
        "Topic",
        "One crisp sentence — what's the issue?",
        <input
          type="text"
          disabled={submitted}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., the conversation with my boss I've been avoiding"
          style={inputStyle}
        />,
      )}

      {stage(
        "G",
        "Goals (for this laser session)",
        "What would 'handled' look like for this specific issue? Not life goals — just this.",
        <textarea
          disabled={submitted}
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={3}
          placeholder="e.g., leave the meeting with a clear yes or no about the role"
          style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
        />,
      )}

      {stage(
        "R",
        "Reality",
        "What's actually true right now? Facts, feelings, constraints, who's involved.",
        <textarea
          disabled={submitted}
          value={reality}
          onChange={(e) => setReality(e.target.value)}
          rows={4}
          placeholder="what's happening, what's in the way, who matters here…"
          style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
        />,
      )}

      {stage(
        "O",
        "Options",
        "Brainstorm freely — no judgment. Silly ones too. Aim for at least 4.",
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              disabled={submitted}
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`option ${i + 1}`}
              style={inputStyle}
            />
          ))}
          {!submitted && (
            <button
              onClick={() => setOptions([...options, ""])}
              style={{
                alignSelf: "flex-start",
                padding: "4px 10px",
                fontSize: 12,
                background: "transparent",
                border: "1px dashed #c9a86b",
                borderRadius: 6,
                color: "#7a5f38",
                cursor: "pointer",
                marginTop: 2,
              }}
            >
              + add option
            </button>
          )}
        </div>,
      )}

      {stage(
        "W",
        "Will",
        "What will you actually do? When? What support do you need?",
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#666",
                marginBottom: 3,
              }}
            >
              Action
            </label>
            <input
              type="text"
              disabled={submitted}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="the specific thing you'll do"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#666",
                marginBottom: 3,
              }}
            >
              When
            </label>
            <input
              type="text"
              disabled={submitted}
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              placeholder="e.g., Thursday morning before standup"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "#666",
                marginBottom: 3,
              }}
            >
              Support needed (optional)
            </label>
            <input
              type="text"
              disabled={submitted}
              value={support}
              onChange={(e) => setSupport(e.target.value)}
              placeholder="who or what helps you follow through"
              style={inputStyle}
            />
          </div>
        </div>,
      )}

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              topic,
              goals,
              reality,
              options: filledOptions,
              will: { action, when, support },
            });
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}
