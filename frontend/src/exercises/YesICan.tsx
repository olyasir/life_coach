import { useState } from "react";

interface ValueItem {
  name: string;
  meaning?: string;
}

interface NeedItem {
  name: string;
  gap: number;
}

interface Props {
  title: string;
  instructions: string;
  assets?: string[];
  strengths?: string[];
  values?: ValueItem[];
  needs?: NeedItem[];
  onSubmit: (data: { acknowledged: true }) => void;
}

export default function YesICan({
  title,
  instructions,
  assets,
  strengths,
  values,
  needs,
  onSubmit,
}: Props) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>
        Everything we've named together over the last four sessions — in one
        place. This is what you're standing on.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Section
          heading="My strengths"
          subheading="(session 5 — Clifton inventory + your own list)"
          color="#2a5d4e"
        >
          {strengths && strengths.length > 0 ? (
            <Chips items={strengths} tone="green" />
          ) : (
            <Empty text="no strengths captured yet" />
          )}
        </Section>

        <Section
          heading="My assets"
          subheading="(session 5 — what you're carrying)"
          color="#4a7a6a"
        >
          {assets && assets.length > 0 ? (
            <Chips items={assets} tone="light" />
          ) : (
            <Empty text="no assets captured yet" />
          )}
        </Section>

        <Section
          heading="My values"
          subheading="(session 6 — what drives you)"
          color="#7a5a3a"
        >
          {values && values.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {values.map((v, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 12px",
                    background: "#f1ede1",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#2a5d4e" }}>
                    {v.name}
                  </div>
                  {v.meaning && (
                    <div
                      style={{ fontSize: 12, color: "#555", marginTop: 2 }}
                    >
                      {v.meaning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Empty text="no values captured yet" />
          )}
        </Section>

        <Section
          heading="My needs"
          subheading="(session 7 — where the gap is pulling you)"
          color="#b94b4b"
        >
          {needs && needs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[...needs]
                .sort((a, b) => b.gap - a.gap)
                .map((n, i) => {
                  const bg =
                    n.gap >= 5
                      ? "#b94b4b"
                      : n.gap >= 3
                        ? "#c8804b"
                        : n.gap >= 1
                          ? "#c8c19e"
                          : "#7fb069";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 70px",
                        gap: 4,
                        alignItems: "stretch",
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 10px",
                          background: bg,
                          color: n.gap >= 3 ? "white" : "#333",
                          borderRadius: "8px 0 0 8px",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {n.name}
                      </div>
                      <div
                        style={{
                          padding: "6px 10px",
                          background: bg,
                          color: n.gap >= 3 ? "white" : "#333",
                          borderRadius: "0 8px 8px 0",
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        gap {n.gap}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <Empty text="no needs captured yet" />
          )}
        </Section>
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          onClick={() => {
            setSubmitted(true);
            onSubmit({ acknowledged: true });
          }}
          style={{ marginTop: 18 }}
        >
          I see it — let's keep going
        </button>
      )}
    </div>
  );
}

function Section({
  heading,
  subheading,
  color,
  children,
}: {
  heading: string;
  subheading: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e1d6",
        borderRadius: 10,
        padding: 12,
        background: "#fff",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 2,
        }}
      >
        {heading}
      </div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 10 }}>
        {subheading}
      </div>
      {children}
    </div>
  );
}

function Chips({ items, tone }: { items: string[]; tone: "green" | "light" }) {
  const bg = tone === "green" ? "#2a5d4e" : "#f1ede1";
  const fg = tone === "green" ? "white" : "#2a5d4e";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((s, i) => (
        <span
          key={i}
          style={{
            padding: "4px 10px",
            background: bg,
            color: fg,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "#999",
        fontStyle: "italic",
        padding: "4px 0",
      }}
    >
      {text}
    </div>
  );
}
