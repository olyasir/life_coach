import { useEffect, useRef, useState } from "react";
import { getJournal, gotoSession, resetJournal, sendMessage, submitExercise } from "./api";
import WheelOfLife from "./exercises/WheelOfLife";
import IntakeForm from "./exercises/IntakeForm";
import LifeTimeline from "./exercises/LifeTimeline";
import DreamArchaeology from "./exercises/DreamArchaeology";
import DreamCanvas from "./exercises/DreamCanvas";
import AssetsBank from "./exercises/AssetsBank";
import StrengthsInventory from "./exercises/StrengthsInventory";
import ValuesBank from "./exercises/ValuesBank";
import ValuesAssessment from "./exercises/ValuesAssessment";
import SixNeedsReflection from "./exercises/SixNeedsReflection";
import YesICan from "./exercises/YesICan";
import GoalCanvas from "./exercises/GoalCanvas";
import TenReasons from "./exercises/TenReasons";
import ForceField from "./exercises/ForceField";
import InhibitorsBank from "./exercises/InhibitorsBank";
import ImpsTaming from "./exercises/ImpsTaming";
import InnerJudge from "./exercises/InnerJudge";
import FairyLetter from "./exercises/FairyLetter";
import InhibitorsByDomain from "./exercises/InhibitorsByDomain";
import PopAnswers from "./exercises/PopAnswers";
import MilestonePlan from "./exercises/MilestonePlan";
import ConstraintsPremortem from "./exercises/ConstraintsPremortem";
import ChangeCycleLocator from "./exercises/ChangeCycleLocator";
import MyCow from "./exercises/MyCow";
import KaizenAction from "./exercises/KaizenAction";
import IdentityBecoming from "./exercises/IdentityBecoming";
import HabitInstaller from "./exercises/HabitInstaller";
import JourneyReflection from "./exercises/JourneyReflection";
import LetterToFutureSelf from "./exercises/LetterToFutureSelf";
import type { ExercisePayload, Message } from "./types";

function getOrCreateUserId(): string {
  const KEY = "coach_user_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

const USER_ID = getOrCreateUserId();

const PREVIEW_EXERCISES: Array<{ id: string; title: string; instructions: string }> = [
  { id: "s1_intake_form", title: "Intake — who you are", instructions: "A few questions to start. Take your time." },
  { id: "s2_wheel_of_life", title: "Wheel of life", instructions: "Score each domain 1-10 as it feels RIGHT NOW." },
  { id: "s3_life_timeline", title: "Life timeline", instructions: "Title each 5-year chapter you've lived, and grade it." },
  { id: "s4_dream_archaeology", title: "Dream archaeology — warm-up", instructions: "Answer quickly, don't overthink. First thing that comes." },
  { id: "s4_dream_canvas", title: "Your dream", instructions: "Write your dream freely, then the doing / having / being triad." },
  { id: "s5_assets_bank", title: "Assets & strengths bank", instructions: "Tap everything that applies to you. Go broad." },
  { id: "s5_strengths_inventory", title: "Know your strengths — 34-item inventory", instructions: "Score each strength 1-4 as it shows up in you." },
  { id: "s6_values_bank", title: "Values bank", instructions: "Tap every value that resonates. Go broad." },
  { id: "s6_values_assessment", title: "Top 5 values — what they mean and how you live them", instructions: "For each of your top 5 values: what it means to you, how expressed 1-10, one action to live it more." },
  { id: "s7_six_needs_reflection", title: "Six universal needs", instructions: "Robbins-Madanes needs. For each: how it shows up in you, importance + fulfillment 1-10." },
  { id: "s7_yes_i_can", title: "Yes I can — the picture so far", instructions: "Everything we've named together (preview is empty — real view filled from memory in S7)." },
  { id: "s8_goal_canvas", title: "Your goal — in your own hand", instructions: "The goal statement, the value it honors, the need it meets, target date, passion, price, and the three quality tests." },
  { id: "s8_ten_reasons", title: "Ten reasons why I want this goal", instructions: "The first three are easy. The middle four make you think. The last three are the real ones." },
  { id: "s9_force_field", title: "The field around your goal", instructions: "What's already pulling you toward it, what's holding you back, and what wants to be expressed." },
  { id: "s9_inhibitors_bank", title: "Katz inhibitors bank", instructions: "26 common inhibitors. Pick what echoes. Rank top 5. 3 questions on each of the 5." },
  { id: "s9_imps_taming", title: "Name your imps", instructions: "Small internal voices. Name them, trigger, how to tame. 1-3 is usually right." },
  { id: "s9_inner_judge", title: "The inner judge", instructions: "Catch the critic voice on the page. 4+ statements. Mark the 2 loudest." },
  { id: "s9_fairy_letter", title: "Letter from the fairy self", instructions: "A short letter from the wisest, kindest you — to the you sitting here now." },
  { id: "s9_inhibitors_by_domain", title: "Inhibitors by life domain", instructions: "6 domains. Where does the pattern show up — relationships, learning, daily, achievement, finance, overall?" },
  { id: "s9_pop_answers", title: "Pop answers — fast, honest, first-thought", instructions: "4 questions. First thing that comes. Bypass the censor." },
  { id: "s10_milestone_plan", title: "Your plan — stepping stones, backward from the goal", instructions: "4-6 stepping stones between today and the goal. Each one a sub-outcome, tagged with a strength and a value." },
  { id: "s10_constraints_premortem", title: "Constraints pre-mortem (אילוצים)", instructions: "What's likely to go sideways, what handles it, what we already know how to handle." },
  { id: "s11_change_cycle_locator", title: "Where you are on the change cycle", instructions: "Experience → insight → change → habit. Pick the stage you're in for this goal's work." },
  { id: "s11_my_cow", title: "Your cow", instructions: "Name the comfortable thing keeping you stuck — and what you're willing to do to release her." },
  { id: "s11_kaizen_action", title: "Kaizen — embarrassingly small step", instructions: "Pick one of Maurer's six principles and apply it concretely. Tiny enough that the amygdala doesn't fire." },
  { id: "s11_identity_becoming", title: "Who you're becoming", instructions: "I AM statements, anchored to one tiny win that proves them." },
  { id: "s11_habit_installer", title: "Install the habit", instructions: "When, where, cue, duration, reward — every variable specific so structure (not willpower) carries the behavior." },
  { id: "s12_journey_reflection", title: "The journey — looking back", instructions: "Seven sections: treasures, places reached, difficulties, people, places still wanted, feeling at the end, one thing to your session-1 self." },
  { id: "s12_letter_to_future_self", title: "Letter to myself, one year from today", instructions: "Write as if everything you want has already come to be. Present tense. Not hope — arrival." },
];

function ExerciseRenderer({
  payload,
  onSubmit,
}: {
  payload: ExercisePayload;
  onSubmit: (data: unknown) => void;
}) {
  switch (payload.exerciseId) {
    case "s1_intake_form":
      return (
        <IntakeForm
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s2_wheel_of_life":
      return (
        <WheelOfLife
          title={payload.title}
          instructions={payload.instructions}
          domains={payload.config?.domains as string[] | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s3_life_timeline":
      return (
        <LifeTimeline
          title={payload.title}
          instructions={payload.instructions}
          clientAge={payload.config?.clientAge as number | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s4_dream_archaeology":
      return (
        <DreamArchaeology
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s4_dream_canvas":
      return (
        <DreamCanvas
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s5_assets_bank":
      return (
        <AssetsBank
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s5_strengths_inventory":
      return (
        <StrengthsInventory
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s6_values_bank":
      return (
        <ValuesBank
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s6_values_assessment":
      return (
        <ValuesAssessment
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s7_six_needs_reflection":
      return (
        <SixNeedsReflection
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s7_yes_i_can":
      return (
        <YesICan
          title={payload.title}
          instructions={payload.instructions}
          assets={payload.config?.assets as string[] | undefined}
          strengths={payload.config?.strengths as string[] | undefined}
          values={
            payload.config?.values as
              | Array<{ name: string; meaning?: string }>
              | undefined
          }
          needs={
            payload.config?.needs as
              | Array<{ name: string; gap: number }>
              | undefined
          }
          onSubmit={onSubmit}
        />
      );
    case "s8_goal_canvas":
      return (
        <GoalCanvas
          title={payload.title}
          instructions={payload.instructions}
          goalDraft={payload.config?.goalDraft as string | undefined}
          topValues={payload.config?.topValues as string[] | undefined}
          topNeeds={payload.config?.topNeeds as string[] | undefined}
          biggestGap={payload.config?.biggestGap as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s8_ten_reasons":
      return (
        <TenReasons
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s9_force_field":
      return (
        <ForceField
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
          targetDate={payload.config?.targetDate as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s9_inhibitors_bank":
      return (
        <InhibitorsBank
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s9_imps_taming":
      return (
        <ImpsTaming
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s9_inner_judge":
      return (
        <InnerJudge
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s9_fairy_letter":
      return (
        <FairyLetter
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s9_inhibitors_by_domain":
      return (
        <InhibitorsByDomain
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s9_pop_answers":
      return (
        <PopAnswers
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s10_milestone_plan":
      return (
        <MilestonePlan
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
          targetDate={payload.config?.targetDate as string | undefined}
          topStrengths={payload.config?.topStrengths as string[] | undefined}
          topValues={payload.config?.topValues as string[] | undefined}
          topNeeds={payload.config?.topNeeds as string[] | undefined}
          biggestGap={payload.config?.biggestGap as string | undefined}
          topRestrainer={payload.config?.topRestrainer as string | undefined}
          topAdvancers={payload.config?.topAdvancers as string[] | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s10_constraints_premortem":
      return (
        <ConstraintsPremortem
          title={payload.title}
          instructions={payload.instructions}
          topRestrainer={payload.config?.topRestrainer as string | undefined}
          restrainerOrigin={
            payload.config?.restrainerOrigin as string | undefined
          }
          restrainerProtectAgainst={
            payload.config?.restrainerProtectAgainst as string | undefined
          }
          onSubmit={onSubmit}
        />
      );
    case "s11_change_cycle_locator":
      return (
        <ChangeCycleLocator
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s11_my_cow":
      return (
        <MyCow
          title={payload.title}
          instructions={payload.instructions}
          onSubmit={onSubmit}
        />
      );
    case "s11_kaizen_action":
      return (
        <KaizenAction
          title={payload.title}
          instructions={payload.instructions}
          stalledStep={payload.config?.stalledStep as string | undefined}
          topStrengths={payload.config?.topStrengths as string[] | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s11_identity_becoming":
      return (
        <IdentityBecoming
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
          identityShift={payload.config?.identityShift as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s11_habit_installer":
      return (
        <HabitInstaller
          title={payload.title}
          instructions={payload.instructions}
          actionToInstall={
            payload.config?.actionToInstall as string | undefined
          }
          onSubmit={onSubmit}
        />
      );
    case "s12_journey_reflection":
      return (
        <JourneyReflection
          title={payload.title}
          instructions={payload.instructions}
          topStrengths={payload.config?.topStrengths as string[] | undefined}
          topValues={payload.config?.topValues as string[] | undefined}
          topNeeds={payload.config?.topNeeds as string[] | undefined}
          wins={payload.config?.wins as string[] | undefined}
          topRestrainer={payload.config?.topRestrainer as string | undefined}
          significantPeople={
            payload.config?.significantPeople as string[] | undefined
          }
          goal={payload.config?.goal as string | undefined}
          identityShift={payload.config?.identityShift as string | undefined}
          onSubmit={onSubmit}
        />
      );
    case "s12_letter_to_future_self":
      return (
        <LetterToFutureSelf
          title={payload.title}
          instructions={payload.instructions}
          goal={payload.config?.goal as string | undefined}
          targetDate={payload.config?.targetDate as string | undefined}
          onSubmit={onSubmit}
        />
      );
    default:
      return (
        <div className="exercise-card">
          <h3>{payload.title}</h3>
          <p className="instructions">{payload.instructions}</p>
          <p style={{ color: "#999", fontSize: 13 }}>
            ({payload.exerciseId} — visual component not yet built; answer in chat for now)
          </p>
        </div>
      );
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getJournal(USER_ID)
      .then((j) => setCurrentSession(j.currentSession))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const res = await sendMessage(USER_ID, text);
      const newMsgs: Message[] = [];
      if (res.assistantText) {
        newMsgs.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.assistantText,
        });
      }
      for (const ex of res.exercises) {
        newMsgs.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          exercise: ex,
        });
      }
      setMessages((m) => [...m, ...newMsgs]);
      setCurrentSession(res.currentSession);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "(connection error — please try again)",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function previewExercise(id: string) {
    const def = PREVIEW_EXERCISES.find((e) => e.id === id);
    if (!def) return;
    const exercise: ExercisePayload = {
      exerciseId: def.id,
      title: def.title,
      instructions: def.instructions,
      config: def.id === "s3_life_timeline" ? { clientAge: 40 } : {},
    };
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `[preview: ${def.id}]`,
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        exercise,
        preview: true,
      },
    ]);
  }

  async function onExerciseSubmit(exerciseId: string, data: unknown) {
    setSending(true);
    try {
      const res = await submitExercise(USER_ID, exerciseId, data);
      if (res.assistantText) {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "assistant", content: res.assistantText },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "(connection error — please try again)",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h2 style={{ margin: 0 }}>Coach</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={currentSession}
            onChange={async (e) => {
              const n = Number(e.target.value);
              await gotoSession(USER_ID, n);
              setCurrentSession(n);
              setMessages([]);
            }}
            style={{
              background: "#2a5d4e",
              color: "white",
              border: "none",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 13,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Session {n}
              </option>
            ))}
          </select>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                previewExercise(e.target.value);
                e.target.value = "";
              }
            }}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #d8d3c4",
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <option value="">preview exercise…</option>
            {PREVIEW_EXERCISES.map((e) => (
              <option key={e.id} value={e.id}>
                {e.id}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              if (!confirm("Reset everything for this user?")) return;
              await resetJournal(USER_ID);
              setCurrentSession(1);
              setMessages([]);
            }}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #d8d3c4",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            reset
          </button>
        </div>
      </div>

      <div className="chat">
        {messages.length === 0 && (
          <div className="bubble assistant">
            Welcome. When you're ready, say hello and we'll begin.
          </div>
        )}
        {messages.map((m) =>
          m.exercise ? (
            <ExerciseRenderer
              key={m.id}
              payload={m.exercise}
              onSubmit={(data) => {
                if (m.preview) {
                  console.log(`[preview ${m.exercise!.exerciseId}] submitted:`, data);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: `[preview submit received — see console. Payload keys: ${Object.keys(data as object ?? {}).join(", ") || "(raw)"}]`,
                    },
                  ]);
                  return;
                }
                onExerciseSubmit(m.exercise!.exerciseId, data);
              }}
            />
          ) : (
            <div key={m.id} className={`bubble ${m.role}`}>
              {m.content}
            </div>
          ),
        )}
        {sending && (
          <div className="bubble assistant thinking">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type here..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend(input);
              }
            }}
          />
          <button disabled={sending || !input.trim()} onClick={() => onSend(input)}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
