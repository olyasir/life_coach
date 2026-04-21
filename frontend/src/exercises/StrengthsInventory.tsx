import { useMemo, useState } from "react";

interface Props {
  title: string;
  instructions: string;
  onSubmit: (data: { scores: Record<string, number> }) => void;
}

interface StrengthItem {
  name: string;
  description: string;
}

const STRENGTHS: StrengthItem[] = [
  {
    name: "Responsible",
    description:
      "For me, a word is a word. Once I commit to something, I'll do everything to make it happen. High ethics, high reliability.",
  },
  {
    name: "Individualization",
    description:
      "I notice the uniqueness and specific strengths of each person, and I get the best out of each. I see difference as an advantage.",
  },
  {
    name: "Intellectual",
    description:
      "I love to think. Mental activity energizes me. The hum of thought is a constant companion.",
  },
  {
    name: "Self-confident",
    description:
      "I believe in my own judgment and capability. I can take risks, face new challenges, and handle pressure.",
  },
  {
    name: "Believer",
    description:
      "I act on long-term values and search for meaning. My values are the basis of my life, and I'll make sacrifices to live by them.",
  },
  {
    name: "Empathic",
    description:
      "I immediately sense what others are feeling. I can intuitively see the world through their eyes.",
  },
  {
    name: "Analytical",
    description:
      "I want proof and pattern for every theory or idea. I think logically and look for evidence.",
  },
  {
    name: "Strategic",
    description:
      "I can impose order on confusion and find the best path forward. I see patterns and test alternative scenarios.",
  },
  {
    name: "Ideator",
    description:
      "I get excited by ideas and find connections between things. I think outside the box — my ideas excite me and others.",
  },
  {
    name: "Fair",
    description:
      "I want to treat people equally and believe in consistent rules. I provide a fair, predictable environment.",
  },
  {
    name: "Achiever",
    description:
      "I feel a constant need for achievement. I try to break even my own records.",
  },
  {
    name: "Context",
    description:
      "I look to the past to understand the present and predict the future. I rely on solid facts, not just intuition.",
  },
  {
    name: "Harmony",
    description:
      "I look for common ground and prefer to avoid conflict. Consensus matters to me.",
  },
  {
    name: "Relator",
    description:
      "I build honest, real relationships with those around me. I feel most at home in intimate, genuine friendships.",
  },
  {
    name: "Focus",
    description:
      "I need clear goals. They act as my compass — I lock onto them and move everything else aside.",
  },
  {
    name: "Connectedness",
    description:
      "I feel we are all part of something larger. I build bridges between people and accept them as they are.",
  },
  {
    name: "Positivity",
    description:
      "I give praise quickly, smile easily, find humor in most situations. My optimism is contagious.",
  },
  {
    name: "Includer",
    description:
      "I want everyone to feel they belong. I widen the circle and include those on the edge.",
  },
  {
    name: "Woo",
    description:
      "I love making new connections and winning people over. To me there are no strangers — only friends I haven't met yet.",
  },
  {
    name: "Learner",
    description:
      "I love the process of learning itself — more than the content or the outcome. New experiences of learning excite me.",
  },
  {
    name: "Arranger",
    description:
      "I find the most efficient path, especially in a changing reality. I reorganize quickly when things shift.",
  },
  {
    name: "Activator",
    description:
      "I crave action and believe only doing makes things happen. I'll be judged by performance, not thought.",
  },
  {
    name: "Developer",
    description:
      "I see potential in others and look for ways to help them grow. Their success is fuel for me.",
  },
  {
    name: "Maximizer",
    description:
      "I have a high bar and love turning mediocre into excellent. I cultivate what's already strong rather than complain about what's missing.",
  },
  {
    name: "Significance",
    description:
      "I want my work and presence to matter to others. I want to be seen, recognized, trusted with independence.",
  },
  {
    name: "Discipline",
    description:
      "I need my world orderly and predictable. I work well inside schedules and structure — order gives me control.",
  },
  {
    name: "Restorative",
    description:
      "I love solving problems and restoring function. Breakdowns and puzzles energize me.",
  },
  {
    name: "Adaptable",
    description:
      "I live in the moment and adjust flexibly to what the day brings. I re-center quickly when plans change.",
  },
  {
    name: "Futuristic",
    description:
      "The future fascinates me. I can picture it vividly and help others believe in it. I give hope.",
  },
  {
    name: "Command",
    description:
      "I take control. I don't fear confrontation and I'll press my point when it matters.",
  },
  {
    name: "Input",
    description:
      "I'm a collector — curious, gathering and categorizing information, knowing how to use it when needed.",
  },
  {
    name: "Deliberative",
    description:
      "I'm careful and private. I see risks in advance and weigh my steps before taking them.",
  },
  {
    name: "Competitive",
    description:
      "I compare myself to others and I don't enter to participate — I enter to win. Competitive company energizes me.",
  },
  {
    name: "Communication",
    description:
      "I love explaining, describing, holding a room. I can turn any event into a story people want to hear.",
  },
];

const SCORES = [
  { value: 1, label: "barely", color: "#d8d3c4" },
  { value: 2, label: "somewhat", color: "#c8c19e" },
  { value: 3, label: "strongly", color: "#7fb069" },
  { value: 4, label: "very strongly", color: "#2a5d4e" },
] as const;

export default function StrengthsInventory({
  title,
  instructions,
  onSubmit,
}: Props) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  function set(name: string, value: number) {
    if (submitted) return;
    setScores((prev) => ({ ...prev, [name]: value }));
  }

  const scoredCount = Object.keys(scores).length;
  const minScored = 20;
  const ready = scoredCount >= minScored;

  const sorted = useMemo(
    () =>
      STRENGTHS.map((s) => ({ ...s, score: scores[s.name] ?? 0 })).sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name),
      ),
    [scores],
  );

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        34 strengths, from the book <em>Now, Discover Your Strengths</em>. For
        each one, notice how strongly it shows up in you. First answer is the
        right answer — don't overthink.
      </p>

      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#faf8f1",
          padding: "6px 0",
          zIndex: 1,
          fontSize: 13,
          color: "#2a5d4e",
          fontWeight: 600,
        }}
      >
        {scoredCount} / {STRENGTHS.length} scored
        {scoredCount < minScored && (
          <span style={{ color: "#888", fontWeight: 400, marginLeft: 8 }}>
            (score at least {minScored} to share)
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {STRENGTHS.map((s) => {
          const current = scores[s.name];
          return (
            <div
              key={s.name}
              style={{
                border: "1px solid #e5e1d6",
                borderRadius: 10,
                padding: 10,
                background: "#fff",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#2a5d4e",
                  marginBottom: 2,
                }}
              >
                {s.name}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#555",
                  margin: "0 0 8px",
                  lineHeight: 1.4,
                }}
              >
                {s.description}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SCORES.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    disabled={submitted}
                    onClick={() => set(s.name, g.value)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 13,
                      border: `1px solid ${current === g.value ? g.color : "#d8d3c4"}`,
                      background: current === g.value ? g.color : "white",
                      color:
                        current === g.value
                          ? g.value >= 3
                            ? "white"
                            : "#333"
                          : "#555",
                      cursor: submitted ? "default" : "pointer",
                    }}
                  >
                    {g.value} · {g.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {submitted && <StrengthsSummary sorted={sorted} />}
      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({ scores });
          }}
          style={{ marginTop: 14 }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function StrengthsSummary({
  sorted,
}: {
  sorted: Array<{ name: string; description: string; score: number }>;
}) {
  const scored = sorted.filter((s) => s.score > 0);

  function rowColor(score: number): string {
    if (score === 4) return "#2a5d4e";
    if (score === 3) return "#7fb069";
    if (score === 2) return "#c8c19e";
    if (score === 1) return "#d8d3c4";
    return "#eee";
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: "0 0 6px" }}>Your strengths — sorted</h4>
      <p style={{ color: "#888", fontSize: 13, margin: "0 0 8px" }}>
        Top band (dark green) is where you're living in your power. Bottom band
        isn't weakness — it's "not where my energy goes."
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px",
          gap: 4,
          fontSize: 13,
        }}
      >
        {scored.map((s) => (
          <div
            key={s.name}
            style={{
              display: "contents",
            }}
          >
            <div
              style={{
                padding: "6px 10px",
                background: rowColor(s.score),
                color: s.score >= 3 ? "white" : "#333",
                borderRadius: "8px 0 0 8px",
                fontWeight: s.score === 4 ? 700 : 500,
              }}
            >
              {s.name}
            </div>
            <div
              style={{
                padding: "6px 10px",
                background: rowColor(s.score),
                color: s.score >= 3 ? "white" : "#333",
                borderRadius: "0 8px 8px 0",
                textAlign: "right",
                fontWeight: 600,
              }}
            >
              {s.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
