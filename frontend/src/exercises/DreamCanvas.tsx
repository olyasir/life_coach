import { useState } from "react";

interface DreamData {
  description: string;
  doing: string;
  having: string;
  being: string;
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: DreamData) => void;
}

export default function DreamCanvas({
  title,
  instructions,
  onSubmit,
}: Props) {
  const [data, setData] = useState<DreamData>({
    description: "",
    doing: "",
    having: "",
    being: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const wordCount = data.description.trim().split(/\s+/).filter(Boolean).length;
  const triadFilled =
    data.doing.trim().length > 0 &&
    data.having.trim().length > 0 &&
    data.being.trim().length > 0;
  const ready = wordCount >= 30 && triadFilled;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>
          Describe your dream — in as much detail as you can
        </label>
        <p style={hintStyle}>
          Where are you? What does a typical day look like? What's around you?
          Who are you with? What do you see, hear, feel? Don't filter.
        </p>
        <textarea
          value={data.description}
          disabled={submitted}
          onChange={(e) =>
            setData({ ...data, description: e.target.value })
          }
          rows={8}
          style={textareaStyle}
          placeholder="Start writing…"
        />
        <div style={{ fontSize: 12, color: "#999", textAlign: "right" }}>
          {wordCount} words
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #e5e1d6",
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#2a5d4e",
            margin: "0 0 12px",
          }}
        >
          In this dream, you are…
        </p>
        {(
          [
            {
              key: "doing",
              label: "DOING",
              hint: "What are you doing with your days? Work, practice, creation, relationship?",
            },
            {
              key: "having",
              label: "HAVING",
              hint: "What do you have in your life? Objects, resources, relationships, experiences?",
            },
            {
              key: "being",
              label: "BEING",
              hint: "Who are you being? What qualities, identity, presence?",
            },
          ] as const
        ).map((row) => (
          <div key={row.key} style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{row.label}</label>
            <p style={hintStyle}>{row.hint}</p>
            <textarea
              value={data[row.key]}
              disabled={submitted}
              onChange={(e) =>
                setData({ ...data, [row.key]: e.target.value })
              }
              rows={3}
              style={textareaStyle}
              placeholder="—"
            />
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit(data);
          }}
          style={{ marginTop: 12 }}
        >
          Share with coach
        </button>
      )}
      {!submitted && !ready && (
        <p style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
          {wordCount < 30
            ? `Keep writing — at least 30 words in the description (${wordCount}/30).`
            : "Fill each of the three (doing / having / being) before sharing."}
        </p>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#2a5d4e",
  letterSpacing: 0.5,
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#888",
  margin: "2px 0 6px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d8d3c4",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 14,
  fontFamily: "inherit",
  resize: "vertical",
};
