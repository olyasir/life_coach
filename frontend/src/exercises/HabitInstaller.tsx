import { useState } from "react";

interface Output {
  habit: string;
  whenTime: string;
  wherePlace: string;
  cueAnchor: string;
  duration: string;
  reward: string;
  ifThen: string;
}

interface Props {
  title: string;
  instructions: string;
  actionToInstall?: string;
  onSubmit: (data: Output) => void;
}

export default function HabitInstaller({
  title,
  instructions,
  actionToInstall,
  onSubmit,
}: Props) {
  const [habit, setHabit] = useState(actionToInstall ?? "");
  const [whenTime, setWhenTime] = useState("");
  const [wherePlace, setWherePlace] = useState("");
  const [cueAnchor, setCueAnchor] = useState("");
  const [duration, setDuration] = useState("");
  const [reward, setReward] = useState("");
  const [ifThen, setIfThen] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready =
    habit.trim().length > 0 &&
    whenTime.trim().length > 0 &&
    wherePlace.trim().length > 0 &&
    cueAnchor.trim().length > 0 &&
    duration.trim().length > 0 &&
    reward.trim().length > 0;

  return (
    <div className="exercise-card">
      <h3>{title}</h3>
      <p className="instructions">{instructions}</p>
      <p style={{ color: "#888", fontSize: 13, margin: "4px 0 14px" }}>
        Willpower is a finite, daily-renewing resource. Habits, once
        installed, run on structure — not willpower. Every variable below
        must be SPECIFIC. "Sometime in the morning" is not a time.
        "After I pour my coffee" is.
      </p>

      {actionToInstall && (
        <div
          style={{
            padding: "10px 12px",
            background: "#f5f1e6",
            border: "1px solid #d8d3c4",
            borderRadius: 10,
            fontSize: 12,
            color: "#555",
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: "#2a5d4e", marginBottom: 3 }}>
            The behavior you want to make automatic:
          </div>
          <div>{actionToInstall}</div>
        </div>
      )}

      <Field label="The habit (one sentence — what's the action?)">
        <textarea
          disabled={submitted}
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
          rows={2}
          placeholder="e.g. 'Write 100 words on the project'"
          style={ta}
        />
      </Field>

      <Field label="WHEN — specific time (or window)">
        <input
          type="text"
          disabled={submitted}
          value={whenTime}
          onChange={(e) => setWhenTime(e.target.value)}
          placeholder="e.g. '7:30am, weekdays' or 'right after lunch'"
          style={inp}
        />
      </Field>

      <Field label="WHERE — specific physical location">
        <input
          type="text"
          disabled={submitted}
          value={wherePlace}
          onChange={(e) => setWherePlace(e.target.value)}
          placeholder="e.g. 'the kitchen table' or 'the desk in the back room'"
          style={inp}
        />
      </Field>

      <Field label="CUE / ANCHOR — what existing thing triggers it?">
        <input
          type="text"
          disabled={submitted}
          value={cueAnchor}
          onChange={(e) => setCueAnchor(e.target.value)}
          placeholder="e.g. 'after I pour my coffee', 'before I open my laptop', 'when I park the car'"
          style={inp}
        />
      </Field>

      <Field label="DURATION — start TINY, scale later">
        <input
          type="text"
          disabled={submitted}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. '5 minutes', '100 words', '1 page' — small enough to never miss"
          style={inp}
        />
      </Field>

      <Field label="REWARD — small, immediate, names the win">
        <input
          type="text"
          disabled={submitted}
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          placeholder="e.g. 'check it on the calendar', 'tell my partner I did it', 'a square of dark chocolate'"
          style={inp}
        />
      </Field>

      <Field label="IF / THEN backup — what if the cue doesn't fire? (optional)">
        <textarea
          disabled={submitted}
          value={ifThen}
          onChange={(e) => setIfThen(e.target.value)}
          rows={2}
          placeholder="e.g. 'If I miss the morning, I do it during my lunch break the same day'"
          style={ta}
        />
      </Field>

      <div
        style={{
          padding: "10px 12px",
          background: "#f1ede1",
          border: "1px solid #e5e1d6",
          borderRadius: 10,
          fontSize: 12,
          color: "#666",
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        <b style={{ color: "#2a5d4e" }}>Read it back as a sentence:</b>{" "}
        {habit && whenTime && wherePlace && cueAnchor ? (
          <span>
            "I will <b>{habit}</b> at <b>{whenTime}</b>, in{" "}
            <b>{wherePlace}</b>, right after <b>{cueAnchor}</b>
            {duration ? (
              <>
                , for <b>{duration}</b>
              </>
            ) : null}
            {reward ? (
              <>
                , and reward myself by <b>{reward}</b>
              </>
            ) : null}
            ."
          </span>
        ) : (
          <span style={{ fontStyle: "italic" }}>
            Fill in the fields above to see your habit as one sentence.
          </span>
        )}
      </div>

      {!submitted && (
        <button
          className="submit-btn"
          disabled={!ready}
          onClick={() => {
            setSubmitted(true);
            onSubmit({
              habit,
              whenTime,
              wherePlace,
              cueAnchor,
              duration,
              reward,
              ifThen,
            });
          }}
        >
          Share with coach
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  border: "1px solid #d8d3c4",
  borderRadius: 8,
  fontFamily: "inherit",
  background: "white",
  boxSizing: "border-box",
};

const ta: React.CSSProperties = {
  ...inp,
  resize: "vertical",
};
