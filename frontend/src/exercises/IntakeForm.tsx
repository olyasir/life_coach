import { useState } from "react";

interface IntakeData {
  name: string;
  age: string;
  whyCame: string;
  whatAchieve: string;
  willingToDo: string;
  howKnow: string;
}

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: IntakeData) => void;
}

const FIELDS: Array<{ key: keyof IntakeData; label: string; multiline: boolean }> = [
  { key: "name", label: "Your name", multiline: false },
  { key: "age", label: "Age", multiline: false },
  { key: "whyCame", label: "Why did you come to coaching?", multiline: true },
  { key: "whatAchieve", label: "What would you want to achieve through this program?", multiline: true },
  { key: "willingToDo", label: "What are you willing to do to get there?", multiline: true },
  { key: "howKnow", label: "How will you know, at the end, that you got what you came for?", multiline: true },
];

export default function IntakeForm({ title, instructions, onSubmit }: Props) {
  const [data, setData] = useState<IntakeData>({
    name: "",
    age: "",
    whyCame: "",
    whatAchieve: "",
    willingToDo: "",
    howKnow: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = data.name.trim() && data.whyCame.trim() && data.whatAchieve.trim();

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      {FIELDS.map((f) => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 14, marginBottom: 4, color: "#444" }}>
            {f.label}
          </label>
          {f.multiline ? (
            <textarea
              value={data[f.key]}
              disabled={submitted}
              onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
              style={{
                width: "100%",
                minHeight: 80,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d8d3c4",
                fontFamily: "inherit",
                fontSize: 14,
                resize: "vertical",
              }}
            />
          ) : (
            <input
              type={f.key === "age" ? "number" : "text"}
              value={data[f.key]}
              disabled={submitted}
              onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d8d3c4",
                fontFamily: "inherit",
                fontSize: 14,
              }}
            />
          )}
        </div>
      ))}
      {!submitted && (
        <button
          className="submit-btn"
          disabled={!canSubmit}
          onClick={() => {
            setSubmitted(true);
            onSubmit(data);
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}
