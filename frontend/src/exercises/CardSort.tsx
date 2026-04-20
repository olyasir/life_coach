import { useState } from "react";

const DEFAULT_VALUES = [
  "Freedom", "Family", "Growth", "Creativity", "Honesty", "Adventure",
  "Security", "Connection", "Health", "Achievement", "Service", "Beauty",
  "Curiosity", "Courage", "Peace", "Fairness", "Independence", "Mastery",
  "Loyalty", "Humor", "Spirituality", "Wealth", "Recognition", "Simplicity",
];

interface Props {
  title: string;
  instructions: string;
  items?: string[];
  maxPick?: number;
  onSubmit: (data: { selected: string[] }) => void;
}

export default function CardSort({
  title,
  instructions,
  items,
  maxPick = 5,
  onSubmit,
}: Props) {
  const list = items ?? DEFAULT_VALUES;
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (item: string) => {
    if (submitted) return;
    if (selected.includes(item)) {
      setSelected(selected.filter((s) => s !== item));
    } else if (selected.length < maxPick) {
      setSelected([...selected, item]);
    }
  };

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">
        {instructions} (pick up to {maxPick})
      </p>
      <div className="card-sort">
        {list.map((item) => (
          <button
            key={item}
            className={selected.includes(item) ? "selected" : ""}
            onClick={() => toggle(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {!submitted && selected.length > 0 && (
        <button
          className="submit-btn"
          onClick={() => {
            setSubmitted(true);
            onSubmit({ selected });
          }}
        >
          Share with coach ({selected.length})
        </button>
      )}
    </div>
  );
}
