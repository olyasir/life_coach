import { useState } from "react";

interface Props {
  title: string;
  instructions: string;
  items?: string[];
  onSubmit: (data: Record<string, number>) => void;
}

const DEFAULT_ITEMS = [
  "Physical (rest, movement, nourishment)",
  "Emotional (feeling seen, expressed)",
  "Relational (connection, intimacy)",
  "Intellectual (challenge, learning)",
  "Spiritual (meaning, purpose)",
];

export default function Scale({ title, instructions, items, onSubmit }: Props) {
  const list = items ?? DEFAULT_ITEMS;
  const [values, setValues] = useState<Record<string, number>>(
    () => Object.fromEntries(list.map((i) => [i, 5])),
  );
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      {list.map((item) => (
        <div className="wheel-row" key={item}>
          <label>{item}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={values[item]}
            disabled={submitted}
            onChange={(e) => setValues({ ...values, [item]: Number(e.target.value) })}
          />
          <span className="value">{values[item]}</span>
        </div>
      ))}
      {!submitted && (
        <button
          className="submit-btn"
          onClick={() => {
            setSubmitted(true);
            onSubmit(values);
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}
