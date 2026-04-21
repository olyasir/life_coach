import { useMemo, useState } from "react";

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: { selected: string[] }) => void;
}

const CATEGORIES: { label: string; items: string[] }[] = [
  {
    label: "Inner qualities",
    items: [
      "Willpower",
      "Perseverance",
      "Curiosity",
      "Kindness",
      "Optimism",
      "Positive thinking",
      "Determination",
      "Gratitude",
      "Self-appreciation",
      "Wisdom",
      "Patience",
      "Initiative",
      "Flexibility",
      "Resourcefulness",
      "Courage to change",
      "Willingness to take risks",
      "Composure under pressure",
      "Tolerance of people different from me",
      "Ability to dream big",
      "Striving for excellence",
      "Self-confidence",
      "Thoroughness",
      "Presence",
      "Leadership",
      "Discretion",
      "Integrity",
      "Loyalty",
      "Professionalism",
      "Sense of justice",
    ],
  },
  {
    label: "Life experience & wisdom",
    items: [
      "Life experience",
      "Past successes",
      "Sense of calm",
      "Focus",
      "Spiritual beliefs",
      "Faith",
      "Values I live by",
      "Intuition",
      "Emotional intelligence",
      "Spiritual intelligence",
      "Seeing the whole picture",
      "Attention to detail",
      "Ability to recognize opportunities",
    ],
  },
  {
    label: "Heart & relationships",
    items: [
      "Joy of life",
      "Passion",
      "Love relationships",
      "Friends",
      "Acquaintances",
      "Current family",
      "Family of origin",
      "Parents",
      "Parenthood",
      "Partnership",
      "Siblings",
      "Children",
      "Ancestral lineage",
      "A place I call home",
      "Empathy",
      "Care for others",
      "Helping others",
      "Ability to give appreciation",
      "Grace — ability to find favor with others",
      "Ability to host people",
      "Speaking eye-to-eye with anyone",
      "Ability to make friends easily",
      "Love of humanity",
    ],
  },
  {
    label: "Mind & learning",
    items: [
      "Ability to learn",
      "Languages",
      "Knowledge",
      "Creativity",
      "Written expression",
      "Verbal expression",
      "Charisma",
      "Sense of humor",
      "Aesthetic sense",
      "Management ability",
      "Precision",
      "Ability to improvise",
      "Musical talent",
      "Singing talent",
      "Cooking",
    ],
  },
  {
    label: "Body & senses",
    items: [
      "Health",
      "The body and its parts",
      "Sense of touch",
      "Sense of taste",
      "Sense of smell",
      "Sense of hearing",
      "Sense of sight",
      "Beauty",
      "Charm",
      "Sex appeal",
    ],
  },
  {
    label: "External resources",
    items: [
      "My profession",
      "Work",
      "Status",
      "Citizenship",
      "Cultural heritage",
      "Property / assets",
      "Luck",
      "Contribution to the world",
    ],
  },
];

const ALL_ITEMS = CATEGORIES.flatMap((c) => c.items);

export default function AssetsBank({ title, instructions, onSubmit }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  function toggle(item: string) {
    if (submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  const count = selected.size;
  const minPick = 20;
  const ready = count >= minPick;

  const total = useMemo(() => ALL_ITEMS.length, []);

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 10px" }}>
        Tap everything that applies to you. Assets include inner qualities,
        relationships, experience, body & senses, external resources. Most
        people underestimate themselves here.
      </p>

      <div
        style={{
          background: "#2a5d4e",
          color: "white",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {count} selected <span style={{ opacity: 0.6 }}>/ {total} items</span>
        </span>
        <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>
          {CATEGORIES.length} sections · scroll through all
        </span>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}
      >
        {CATEGORIES.map((cat, idx) => (
          <div key={cat.label}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#2a5d4e",
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>
                {idx + 1} / {CATEGORIES.length} · {cat.label}
              </span>
              <span style={{ color: "#999", fontWeight: 500 }}>
                {cat.items.length} items
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {cat.items.map((item) => {
                const isOn = selected.has(item);
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={submitted}
                    onClick={() => toggle(item)}
                    style={{
                      border: `1px solid ${isOn ? "#2a5d4e" : "#d8d3c4"}`,
                      background: isOn ? "#2a5d4e" : "white",
                      color: isOn ? "white" : "#333",
                      borderRadius: 999,
                      padding: "5px 11px",
                      fontSize: 13,
                      fontFamily: "inherit",
                      cursor: submitted ? "default" : "pointer",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
              {idx < CATEGORIES.length - 1 && (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: "#bbb",
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  ↓ more below
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ selected: Array.from(selected) });
          }}
          style={{ marginTop: 16 }}
        >
          Share with coach
        </button>
      )}
      {!submitted && !ready && (
        <p style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
          Pick at least {minPick} — you can always pick more.
        </p>
      )}
    </div>
  );
}
