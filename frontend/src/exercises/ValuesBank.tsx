import { useMemo, useState } from "react";

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: { selected: string[] }) => void;
}

const CATEGORIES: { label: string; items: string[] }[] = [
  {
    label: "Character & integrity",
    items: [
      "Integrity",
      "Honesty",
      "Authenticity",
      "Courage",
      "Humility",
      "Responsibility",
      "Reliability",
      "Directness",
      "Discipline",
      "Self-discipline",
      "Self-awareness",
      "Decisiveness",
      "Assertive thinking",
      "Seriousness",
      "Precision",
      "Punctuality",
    ],
  },
  {
    label: "Relationships & community",
    items: [
      "Love",
      "Loyalty",
      "Trust",
      "Friendship",
      "Family",
      "Belonging",
      "Caring",
      "Cooperation",
      "Teamwork",
      "Commitment",
      "Communication",
      "Tolerance",
      "Compassion",
      "Acceptance",
      "Generosity",
      "Appreciation",
      "Sensitivity",
      "Forgiveness",
      "Gentleness",
    ],
  },
  {
    label: "Fairness & service",
    items: [
      "Fairness",
      "Equality",
      "Respect",
      "Justice",
      "Goodness",
      "Nonviolence",
      "Care for others",
      "Peace",
      "Unity",
      "Patriotism",
    ],
  },
  {
    label: "Achievement & mastery",
    items: [
      "Success",
      "Achievement",
      "Excellence",
      "Expertise",
      "Quality",
      "Advancement",
      "Competitiveness",
      "Challenge",
      "Motivation",
      "Leadership",
      "Power",
      "Strength",
      "Efficiency",
      "Work",
    ],
  },
  {
    label: "Learning & growth",
    items: [
      "Learning",
      "Education",
      "Wisdom",
      "Reason",
      "Inquiry",
      "Personal growth",
      "Inspiration",
      "Innovation",
      "Creativity",
      "Uniqueness",
      "Versatility",
    ],
  },
  {
    label: "Freedom & adventure",
    items: [
      "Freedom",
      "Liberty",
      "Choice",
      "Flexibility",
      "Adaptability",
      "Mobility",
      "Adventure",
      "Risk-taking",
      "Change",
      "Resourcefulness",
    ],
  },
  {
    label: "Stability & security",
    items: [
      "Stability",
      "Safety",
      "Security",
      "Tradition",
      "Simplicity",
    ],
  },
  {
    label: "Meaning & wellbeing",
    items: [
      "Meaning",
      "Spirituality",
      "Faith",
      "Joy",
      "Happiness",
      "Enjoyment",
      "Humor",
      "Balance",
      "Vitality",
      "Health",
      "Beauty",
      "Openness",
      "Culture",
      "Diversity",
      "Wealth",
    ],
  },
];

const ALL_ITEMS = CATEGORIES.flatMap((c) => c.items);

export default function ValuesBank({ title, instructions, onSubmit }: Props) {
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
  const minPick = 15;
  const ready = count >= minPick;

  const total = useMemo(() => ALL_ITEMS.length, []);

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 10px" }}>
        Go broad — pick every value that resonates with you, not just your top
        ones. Values can't be judged as good or bad — only which ones feel
        truly YOURS. We'll narrow down to the top 5 next.
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
