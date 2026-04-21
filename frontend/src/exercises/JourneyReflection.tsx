import { useState } from "react";

interface Output {
  treasuresFound: string;
  placesReached: string;
  difficulties: string;
  significantPeople: string;
  placesWantedNext: string;
  feelingAtEnd: string;
  letterToSession1Self: string;
}

interface Props {
  title: string;
  instructions: string;
  topStrengths?: string[];
  topValues?: string[];
  topNeeds?: string[];
  wins?: string[];
  topRestrainer?: string;
  significantPeople?: string[];
  goal?: string;
  identityShift?: string;
  onSubmit: (data: Output) => void;
}

export default function JourneyReflection({
  title,
  instructions,
  topStrengths,
  topValues,
  topNeeds,
  wins,
  topRestrainer,
  significantPeople,
  goal,
  identityShift,
  onSubmit,
}: Props) {
  const [treasuresFound, setTreasuresFound] = useState("");
  const [placesReached, setPlacesReached] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [sigPeople, setSigPeople] = useState("");
  const [placesWantedNext, setPlacesWantedNext] = useState("");
  const [feelingAtEnd, setFeelingAtEnd] = useState("");
  const [letterToSession1Self, setLetterToSession1Self] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const filledCount = [
    treasuresFound,
    placesReached,
    difficulties,
    sigPeople,
    placesWantedNext,
    feelingAtEnd,
    letterToSession1Self,
  ].filter((s) => s.trim().length > 0).length;

  const ready = filledCount >= 6;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 14px" }}>
        Twelve weeks ago you walked in. Today you walk out. Before the
        door closes, a look back — the treasures, the terrain, the people,
        what you feel now. Take your time. There's no rush.
      </p>

      <Section
        accent="#b9883b"
        label="1 · The treasures I found in myself"
        hint="What you can now name about yourself that you couldn't at session 1."
        hints={[
          ...(topStrengths ?? []).map((s) => `strength: ${s}`),
          ...(topValues ?? []).map((v) => `value: ${v}`),
          ...(topNeeds ?? []).map((n) => `need: ${n}`),
        ]}
        value={treasuresFound}
        onChange={setTreasuresFound}
        submitted={submitted}
        placeholder="What I found in myself was…"
      />

      <Section
        accent="#2a5d4e"
        label="2 · Wonderful places I reached on this journey"
        hint="Concrete wins, moments the new self showed up."
        hints={wins ?? []}
        value={placesReached}
        onChange={setPlacesReached}
        submitted={submitted}
        placeholder="The places I reached…"
      />

      <Section
        accent="#b94b4b"
        label="3 · Difficulties I had along the way"
        hint="Name them without apology — they're part of what you crossed."
        hints={topRestrainer ? [`top restrainer: ${topRestrainer}`] : []}
        value={difficulties}
        onChange={setDifficulties}
        submitted={submitted}
        placeholder="What was hard…"
      />

      <Section
        accent="#2a5d4e"
        label="4 · Significant people I met on the journey"
        hint="Family, advancers, witnesses — and whoever else walked with you."
        hints={significantPeople ?? []}
        value={sigPeople}
        onChange={setSigPeople}
        submitted={submitted}
        placeholder="The people who were with me…"
      />

      <Section
        accent="#b9883b"
        label="5 · Wonderful places I want to keep reaching"
        hint="S12 is a doorway, not an ending. Where does the journey continue?"
        hints={goal ? [`goal on the horizon: ${goal}`] : []}
        value={placesWantedNext}
        onChange={setPlacesWantedNext}
        submitted={submitted}
        placeholder="Where I'm still headed…"
      />

      <Section
        accent="#2a5d4e"
        label="6 · What I feel at the end of the journey"
        hint="Body check. No right answer. Just what's true."
        hints={[]}
        value={feelingAtEnd}
        onChange={setFeelingAtEnd}
        submitted={submitted}
        placeholder="Right now, at the end, I feel…"
      />

      <Section
        accent="#b94b4b"
        label="7 · One thing I'd tell my session-1 self"
        hint="The version of you who walked in 12 weeks ago — what do they need to know?"
        hints={identityShift ? [`you've become: ${identityShift}`] : []}
        value={letterToSession1Self}
        onChange={setLetterToSession1Self}
        submitted={submitted}
        placeholder="Dear me of 12 weeks ago, I want you to know…"
      />

      <div
        style={{
          fontSize: 12,
          color: "#2a5d4e",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {filledCount} of 7 sections written (at least 6 to share)
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              treasuresFound,
              placesReached,
              difficulties,
              significantPeople: sigPeople,
              placesWantedNext,
              feelingAtEnd,
              letterToSession1Self,
            });
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function Section({
  accent,
  label,
  hint,
  hints,
  value,
  onChange,
  submitted,
  placeholder,
}: {
  accent: string;
  label: string;
  hint: string;
  hints: string[];
  value: string;
  onChange: (v: string) => void;
  submitted: boolean;
  placeholder: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "#faf8f1",
        border: `1px solid ${accent}55`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: accent,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{hint}</div>
      {hints.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 8,
          }}
        >
          {hints.map((h, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                padding: "3px 8px",
                background: "white",
                border: "1px solid #e5e1d6",
                borderRadius: 999,
                color: "#777",
                fontStyle: "italic",
              }}
            >
              {h}
            </span>
          ))}
        </div>
      )}
      <textarea
        disabled={submitted}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 10px",
          fontSize: 13,
          border: "1px solid #d8d3c4",
          borderRadius: 8,
          fontFamily: "inherit",
          resize: "vertical",
          boxSizing: "border-box",
          background: "white",
        }}
      />
    </div>
  );
}
