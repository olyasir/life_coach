import { useState } from "react";

interface Block {
  key: string;
  prompt: string;
  count: number;
}

const BLOCKS: Block[] = [
  {
    key: "silly_try",
    prompt: "Three silly or ridiculous things you'd love to try…",
    count: 3,
  },
  {
    key: "useless_have",
    prompt: "Three useless things you'd love to own…",
    count: 3,
  },
  {
    key: "amusing_learn",
    prompt: "Three amusing things you'd love to learn…",
    count: 3,
  },
  {
    key: "places_visit",
    prompt: "Five places you'd love to visit…",
    count: 5,
  },
  {
    key: "childhood",
    prompt:
      "Six things you loved doing as a child and don't do anymore…",
    count: 6,
  },
  {
    key: "history_meet",
    prompt: "Three people from history you'd love to meet…",
    count: 3,
  },
  {
    key: "illogical_work",
    prompt:
      "Two professions you'd love to work in even though they don't seem logical for you…",
    count: 2,
  },
  {
    key: "strange_hobbies",
    prompt:
      "Four hobbies other people have that seem strange or fascinating to you…",
    count: 4,
  },
];

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: Record<string, string[]>) => void;
}

export default function DreamArchaeology({
  title,
  instructions,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(BLOCKS.map((b) => [b.key, Array(b.count).fill("")])),
  );
  const [submitted, setSubmitted] = useState(false);

  function update(key: string, idx: number, value: string) {
    setValues((prev) => ({
      ...prev,
      [key]: prev[key].map((v, i) => (i === idx ? value : v)),
    }));
  }

  const totalFilled = Object.values(values)
    .flat()
    .filter((v) => v.trim().length > 0).length;
  const minFilled = 8;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p
        style={{
          color: "#c04848",
          fontSize: 13,
          fontWeight: 600,
          margin: "4px 0 12px",
        }}
      >
        Answer quickly — don't overthink. First thing that comes to mind is the right
        answer.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {BLOCKS.map((b) => (
          <div key={b.key}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
                color: "#2a5d4e",
              }}
            >
              {b.prompt}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {values[b.key].map((v, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#999",
                      width: 18,
                      textAlign: "right",
                    }}
                  >
                    {i + 1}.
                  </span>
                  <input
                    value={v}
                    disabled={submitted}
                    onChange={(e) => update(b.key, i, e.target.value)}
                    placeholder="—"
                    style={{
                      flex: 1,
                      border: "1px solid #d8d3c4",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 14,
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!submitted && (
        <button
          className="submit-btn"
          disabled={totalFilled < minFilled}
          onClick={() => {
            setSubmitted(true);
            onSubmit(values);
          }}
          style={{ marginTop: 16 }}
        >
          Share with coach
        </button>
      )}
      {!submitted && totalFilled < minFilled && (
        <p style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
          Fill at least {minFilled} to share — you don't have to fill them all.
        </p>
      )}
    </div>
  );
}
