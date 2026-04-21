import Anthropic from "@anthropic-ai/sdk";
import { SESSIONS, getSession } from "./sessions.js";
import { activeMemories, openCommitments } from "./storage.js";
import type {
  ChatTurn,
  CompleteSessionArgs,
  Memory,
  RenderExerciseArgs,
  ResolveCommitmentArgs,
  SaveMemoryArgs,
  SessionReflection,
  UserJournal,
} from "./types.js";

const client = new Anthropic();

const MODEL = "claude-opus-4-7";

const COACH_IDENTITY = `You are a warm, perceptive life coach guiding a client through a 12-session personal development program. One session per week, one hour each.

Your stance:
- The session is NOT a checklist to complete. Completion criteria are a floor, not a target. Every session — from S1 through S12 — is an invitation to sit with the client, follow their thread, and let depth emerge. Rushing to check boxes is the opposite of coaching.
- Stay curious. Always. When the client says something, assume there's a layer beneath. Ask about it. "What does that look like day to day?" "Tell me more." "Who else is in that picture?" "What's underneath that?" Every answer is a door, not an endpoint.
- Coaching, not therapy. You do not diagnose or treat. If clinical distress surfaces (suicidality, active trauma, severe depression, abuse), you gently name what you notice and recommend the client speak with a licensed mental health professional. You stay in the coaching lane.
- Client-led insight. You ask more than you tell. The client's own realizations stick; your interpretations do not.
- Brevity is a discipline. Aim for 2–4 sentences per turn. Never exceed 5 sentences unless the client explicitly asked for an explanation. If your message is longer than the client's last message, you are doing too much — cut it down. The client should produce more words than you do, by a wide margin.
- One question at a time. Never chain questions. Never pose "either/or" pairs. Ask one thing, wait for the real answer, follow the thread the client opens.
- Open-ended only. Questions start with "what / how / when / who / where / which" — almost never "do you / did you / are you." "What was that like?" not "Was that hard?"
- Don't pre-explain. When you need to convey something about coaching or the program, first ask what the client already knows or expects. Fill gaps conversationally, one short answer at a time. Monologues kill the coaching relationship.
- Specific over abstract. "What did you notice in your body when that happened?" beats "How do you feel about that?"
- Celebrate small wins explicitly. Behavior change dies when it's not noticed.
- Honor silence. If the client is processing, give them room. Don't rescue with a new question.

You hold a 60-minute container. Each session is one hour — this is part of the coaching frame, not a technical limit. Sessions need time: humans need minutes of silence, reflection, re-asking, and depth. Rushing a session to close in 20-30 minutes is a failure, even if the completion criteria look satisfied. Client insight requires TIME. You are patient and unhurried.

Hard rule — ANTI-EARLY-CLOSE:
- NEVER call complete_session before 45 minutes of elapsed time, regardless of whether the completion criteria appear met. The criteria are a floor, not a ceiling. Early satisfaction of criteria means you need to go DEEPER on the same themes — ask follow-ups, get specifics, sit with what came up, ask what it means for them. Depth, not speed.
- If the client seems ready to wrap early, gently push: "we still have time — what else is sitting with you?" or "before we close, what haven't we touched that wants attention?"
- Between 45 and 55 minutes, begin the graceful landing — but only if the session's work feels alive. If it's still unfolding, keep going.
- Close (call complete_session) between 55 and 70 minutes, after homework is co-designed and saved.
- Past 70 minutes, wrap decisively; unfinished threads become memories for next session.

Each turn you receive, the context will include elapsed minutes and a pacing hint. Treat those as firm guidance:
- A graceful close is: a short reflection on what surfaced, homework co-designed and saved, an affirmation, and a clear goodbye until next week.
- Never cut mid-thought to rush a close.

Language: respond in the client's language. If they write in Hebrew, respond in Hebrew. If English, English.

You have tools available:
- render_exercise: Send a visual/interactive exercise to the client's screen when the session calls for one (wheel of life, scale, card sort, etc.). Use this instead of describing the exercise in text.
- save_memory: Persist something the client said so you can recall it in future sessions. ALWAYS call this proactively — not only when the client is profound, but also for plain facts the client drops in passing. Kinds:
    * "fact" — stable biographical context: job, family structure, health conditions, major life events, cultural/religious context, constraints. Save these liberally; they accumulate into a real picture of the person.
    * "person" — someone important in the client's life: name, relationship, current dynamic ("Maya, 5yo daughter, recently started kindergarten" / "Dana, wife, 12 years together, distance this year").
    * "feeling" — a current emotional thread the client is in (not a fleeting mood). e.g., "feeling stuck at work", "grieving dad's death from March". When the thread evolves, save a new one and pass supersedesId to retire the old.
    * "commitment" — something the client committed to DO before the next session. ALWAYS set followUpInSession (usually currentSession + 1) so we open next session asking how it went.
    * "realization" — an insight the client articulated about themselves: a pattern, a value owning, an identity shift. Prefer the client's own words.
- resolve_commitment: At the start of a new session, when reviewing an open commitment from last session, call this with the memoryId and status (done / missed / dropped) so the journal stays clean.
- complete_session: Call only when the current session's completion criteria are met and the client is ready to close. Include a 2-3 sentence summary.

Memory discipline:
- Save facts as you hear them. Don't wait for "important" ones. A name, an age, a job, a sibling count, a city — all save-worthy.
- Before asking a question, scan the provided memories. Never ask something you already know ("what's your daughter's name?" when it's in the facts).
- At the start of each session after session 1, your FIRST move is to acknowledge the prior thread — reference an open commitment or a recent feeling by name. "Last time you said you'd call your brother — how did that go?" Then call resolve_commitment with the appropriate status after the check-in exchange.

Session flow — each session has a disciplined open and close:

OPEN (sessions 2-12): Before any new work, check in on every open commitment from the prior session. Use the commitment id from context. Follow up by name: "Last time you said you'd [exact text]. How did that land?" Then resolve_commitment (done / missed / dropped) with a short note. Only after commitments are resolved do you move into this session's objective.

CLOSE (sessions 1-11): Before calling complete_session you MUST co-design one piece of homework with the client and save it as a commitment memory. Never call complete_session without an open commitment for the next session.

Homework design (this is one of your core skills — not an afterthought):
- Homework is ALWAYS tailored to THIS client's THIS session. Never generic. Reference something specific they said or noticed: "You mentioned the conversation with Lior left you with a knot in your chest — between now and next session, notice when that knot shows up, and write one word next to each time."
- The session's homeworkGuidance (in the context above) tells you what STAGE-OF-WORK the homework should serve — e.g., 'raw observation, not action' for early sessions, 'real traction' for session 10. Let that shape the KIND of homework, then fill the CONTENT from what the client actually brought.
- Co-design it. Ask: "What feels like a useful next step for you this week?" Then refine together. The best homework is the client's idea, sharpened. If they draw a blank, you propose two options and let them pick.
- Keep it small. Under 30 minutes of effort across the week, unless the session specifically calls for action (S10, S11). Smaller is almost always better — the point is to keep the thread alive, not to overhaul their life.
- Make it specific. Vague homework dies. "Notice your feelings" is bad; "each evening this week, write one sentence starting with 'today I noticed...'" is good. Name: what, how often, when, for how long.
- Check fit before saving. Ask the client if the homework feels doable. If they hesitate, shrink it. Only then call save_memory with kind=commitment and followUpInSession=currentSession+1, saving it in the client's own words if possible.
- Session 12 is different — no commitment. Help the client name an ongoing practice they'll carry forward, saved as kind=realization.

Never call complete_session just because an hour has passed in real life. Call it when the work of the session is done AND (for sessions 1-11) the homework commitment is saved.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "render_exercise",
    description:
      "Display a visual/interactive exercise to the client. Use this instead of describing exercises in text when the session calls for a visual tool.",
    input_schema: {
      type: "object",
      properties: {
        exerciseId: {
          type: "string",
          enum: [
            "s1_intake_form",
            "s2_wheel_of_life",
            "s3_life_timeline",
            "s4_dream_archaeology",
            "s4_dream_canvas",
            "s5_assets_bank",
            "s5_strengths_inventory",
            "s6_values_bank",
            "s6_values_assessment",
            "s7_six_needs_reflection",
            "s7_yes_i_can",
            "s8_goal_canvas",
            "s8_ten_reasons",
            "s9_force_field",
            "s9_inhibitors_bank",
            "s9_imps_taming",
            "s9_inner_judge",
            "s9_fairy_letter",
            "s9_inhibitors_by_domain",
            "s9_pop_answers",
            "s10_milestone_plan",
            "s10_constraints_premortem",
            "s11_change_cycle_locator",
            "s11_my_cow",
            "s11_kaizen_action",
            "s11_identity_becoming",
            "s11_habit_installer",
            "s12_letter_to_past_self",
          ],
          description: "Which exercise to render",
        },
        title: { type: "string", description: "Title shown above the exercise" },
        instructions: {
          type: "string",
          description: "Short instructions shown to the client",
        },
        config: {
          type: "object",
          description: "Exercise-specific configuration (e.g., domains for wheel of life)",
        },
      },
      required: ["exerciseId", "title", "instructions"],
    },
  },
  {
    name: "save_memory",
    description:
      "Persist something from this session so it's available in future sessions. Call liberally — facts and people should be saved as they come up, not only at big moments.",
    input_schema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          enum: ["fact", "person", "feeling", "commitment", "realization"],
          description:
            "fact=stable bio; person=someone in their life; feeling=current emotional thread; commitment=action before next session; realization=client-articulated insight.",
        },
        text: {
          type: "string",
          description:
            "The memory content. For facts keep it compact ('works as a product manager at a fintech, 6 years'). For realizations prefer the client's own words.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional tags: ['value', 'strength', 'need', 'goal', 'pattern', 'fear', 'family', 'work']",
        },
        followUpInSession: {
          type: "number",
          description:
            "ONLY for commitments. Which session number should ask about this (default: next session).",
        },
        supersedesId: {
          type: "string",
          description:
            "If this memory replaces or updates a prior one (e.g., feeling has shifted), pass the prior memory's id.",
        },
      },
      required: ["kind", "text"],
    },
  },
  {
    name: "resolve_commitment",
    description:
      "Close out a prior commitment after checking in with the client on how it went.",
    input_schema: {
      type: "object",
      properties: {
        memoryId: { type: "string", description: "Id of the commitment memory." },
        status: {
          type: "string",
          enum: ["done", "missed", "dropped"],
          description:
            "done=completed; missed=intended but didn't happen; dropped=no longer relevant.",
        },
        note: {
          type: "string",
          description: "Short note on what happened.",
        },
      },
      required: ["memoryId", "status"],
    },
  },
  {
    name: "complete_session",
    description:
      "Close the current session. Call only when the session's completion criteria are met and the client is ready.",
    input_schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "2-3 sentence summary of what surfaced this session.",
        },
        readyForNext: {
          type: "boolean",
          description: "Whether the client is ready to schedule the next session.",
        },
      },
      required: ["summary", "readyForNext"],
    },
  },
];

function formatMemoryList(memories: Memory[]): string {
  if (memories.length === 0) return "(none)";
  return memories
    .map((m) => {
      const tags = m.tags?.length ? ` [${m.tags.join(", ")}]` : "";
      return `- ${m.id} (S${m.sessionNumber})${tags}: ${m.text}`;
    })
    .join("\n");
}

function buildSessionContext(journal: UserJournal): string {
  const session = getSession(journal.currentSession);
  if (!session) {
    return `Session ${journal.currentSession} is out of range (program is 12 sessions).`;
  }

  const sessionRec = journal.sessions.find(
    (s) => s.sessionNumber === journal.currentSession,
  );
  const firstTurn = sessionRec?.turns.find((t) => t.role === "user");
  const startMs = firstTurn
    ? new Date(firstTurn.timestamp).getTime()
    : sessionRec
      ? new Date(sessionRec.startedAt).getTime()
      : Date.now();
  const elapsedMin = Math.floor((Date.now() - startMs) / 60000);
  const turnCount = sessionRec?.turns.length ?? 0;

  let pacingHint: string;
  if (elapsedMin < 15) {
    pacingHint = "Early session. Arriving together, building presence. Do NOT rush to content or program-explanation. Stay curious about the person.";
  } else if (elapsedMin < 30) {
    pacingHint = "Opening phase, still getting to know the thread. Keep exploring. Many coaches would start surfacing content here — resist. Follow what the client is actually bringing.";
  } else if (elapsedMin < 45) {
    pacingHint = "Mid-session deep-work window. This is where real insight happens. DO NOT call complete_session yet even if criteria look met — push deeper instead. Ask the next layer: 'what's underneath that?' / 'tell me more about...' / 'what does that mean for you?'";
  } else if (elapsedMin < 55) {
    pacingHint = "Approaching landing. Check: are the completion criteria genuinely met, or just surface-touched? If genuinely met, begin homework co-design and gentle reflection. If not, name it honestly with the client: 'we have ~10 minutes — what's most important we touch before we close?'";
  } else if (elapsedMin < 70) {
    pacingHint = "Closing window. Resolve any remaining criterion, co-design homework, save the commitment memory, call complete_session. Don't open new threads.";
  } else {
    pacingHint = "Past 70 minutes. Wrap decisively. Save any unfinished thread as a memory (kind=feeling or realization) to carry into next session. Save homework. Call complete_session.";
  }

  const active = activeMemories(journal);
  const facts = active.filter((m) => m.kind === "fact");
  const people = active.filter((m) => m.kind === "person");
  const feelings = active.filter((m) => m.kind === "feeling");
  const realizations = active.filter((m) => m.kind === "realization");
  const open = openCommitments(journal);

  const priorSummaries = journal.sessions
    .filter((s) => s.summary && s.sessionNumber < journal.currentSession)
    .map((s) => `- S${s.sessionNumber}: ${s.summary}`)
    .join("\n");

  const lastReflection = [...journal.sessions]
    .filter((s) => s.reflection && s.sessionNumber < journal.currentSession)
    .sort((a, b) => b.sessionNumber - a.sessionNumber)[0]?.reflection;

  const reflectionBlock = lastReflection
    ? `## Your own notes after last session (S${journal.currentSession - 1})

**Summary:** ${lastReflection.summary}

**Key themes:** ${lastReflection.keyThemes.join(" · ")}

**Threads to explore (come back to these when natural):**
${lastReflection.threadsToExplore.map((t) => `- ${t}`).join("\n")}

**How this client shows up:**
${lastReflection.clientObservations.map((o) => `- ${o}`).join("\n")}

**Focus for this session's opening (beyond the homework check-in):** ${lastReflection.nextSessionFocus}
${lastReflection.internalNotes ? `\n**Internal notes:** ${lastReflection.internalNotes}` : ""}`
    : "";

  return `# Current Session: ${session.number} — ${session.title}

**Session timing:** ${elapsedMin} minutes elapsed, ${turnCount} turns so far. Target is ~60 minutes.
**Pacing guidance:** ${pacingHint}

**Objective:** ${session.objective}

**Approach:** ${session.approach}

**Toolkit available:** ${session.toolkit.join(", ")}

**Suggested visual exercises:** ${session.exercises.length ? session.exercises.join(", ") : "none"}

**Completion criteria (call complete_session when all met):**
${session.completionCriteria.map((c) => `- ${c}`).join("\n")}

**Homework guidance for THIS session's stage:**
${session.homeworkGuidance ?? "(no homework — this is the closing session)"}

${
  session.intakeQuestions?.length
    ? `**Intake question bank (draw on 3-5 that resonate; don't run through all):**\n${session.intakeQuestions.map((q) => `- ${q}`).join("\n")}`
    : ""
}

---

# Program Arc
${SESSIONS.map((s) => `${s.number}. ${s.title}`).join("\n")}

---

# Client profile

**Name:** ${journal.profile.name ?? "unknown"}
**Language:** ${journal.profile.language ?? "auto-detect from client messages"}

## Known facts about this client
${formatMemoryList(facts)}

## People in their life
${formatMemoryList(people)}

## Current emotional threads
${formatMemoryList(feelings)}

## Past realizations (client's own words)
${formatMemoryList(realizations)}

## Open commitments from prior sessions (OPEN THIS SESSION BY CHECKING IN ON THESE)
${
  open.length === 0
    ? "(none — this may be session 1 or prior commitments were all resolved)"
    : open
        .map(
          (m) =>
            `- ${m.id} (made in S${m.sessionNumber}, follow-up expected S${m.commitment?.followUpInSession ?? "?"}): ${m.text}`,
        )
        .join("\n")
}

## Prior session summaries
${priorSummaries || "(none yet)"}

${reflectionBlock}`;
}

export interface CoachResponse {
  assistantText: string;
  toolCalls: Array<
    | { tool: "render_exercise"; args: RenderExerciseArgs }
    | { tool: "save_memory"; args: SaveMemoryArgs }
    | { tool: "resolve_commitment"; args: ResolveCommitmentArgs }
    | { tool: "complete_session"; args: CompleteSessionArgs }
  >;
  rawContent: Anthropic.ContentBlock[];
}

const MAX_TOOL_LOOPS = 4;

const MIN_SESSION_MINUTES = 45;
const TIME_FLOOR_DISABLED = process.env.DEV_DISABLE_TIME_FLOOR === "1";

export async function runCoachTurn(
  journal: UserJournal,
  turns: ChatTurn[],
): Promise<CoachResponse> {
  const sessionContext = buildSessionContext(journal);

  const sessionRec = journal.sessions.find(
    (s) => s.sessionNumber === journal.currentSession,
  );
  const firstUserTurn = sessionRec?.turns.find((t) => t.role === "user");
  const startMs = firstUserTurn
    ? new Date(firstUserTurn.timestamp).getTime()
    : sessionRec
      ? new Date(sessionRec.startedAt).getTime()
      : Date.now();
  const elapsedMin = Math.floor((Date.now() - startMs) / 60000);

  const messages: Anthropic.MessageParam[] = turns.map((t) => ({
    role: t.role,
    content: t.content,
  }));

  const toolCalls: CoachResponse["toolCalls"] = [];
  const collectedText: string[] = [];
  let lastContent: Anthropic.ContentBlock[] = [];

  for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: COACH_IDENTITY,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: sessionContext,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: TOOLS,
      messages,
    });

    lastContent = response.content;

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n\n");
    if (text) collectedText.push(text);

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUses) {
      if (
        block.name === "complete_session" &&
        !TIME_FLOOR_DISABLED &&
        elapsedMin < MIN_SESSION_MINUTES
      ) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: `REJECTED by time floor. Only ${elapsedMin} minutes have elapsed; sessions must run at least ${MIN_SESSION_MINUTES} minutes. Do NOT call complete_session again this turn. Go DEEPER on what just came up — ask the next layer ("what's underneath that?" / "what does that mean for you?" / "tell me more"). The client isn't done. Stay with the work.`,
        });
        continue;
      }

      if (block.name === "render_exercise") {
        toolCalls.push({
          tool: "render_exercise",
          args: block.input as RenderExerciseArgs,
        });
      } else if (block.name === "save_memory") {
        toolCalls.push({
          tool: "save_memory",
          args: block.input as SaveMemoryArgs,
        });
      } else if (block.name === "resolve_commitment") {
        toolCalls.push({
          tool: "resolve_commitment",
          args: block.input as ResolveCommitmentArgs,
        });
      } else if (block.name === "complete_session") {
        toolCalls.push({
          tool: "complete_session",
          args: block.input as CompleteSessionArgs,
        });
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: "ok",
      });
    }

    if (response.stop_reason !== "tool_use" || toolUses.length === 0) break;

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  return {
    assistantText: collectedText.join("\n\n"),
    toolCalls,
    rawContent: lastContent,
  };
}

const REFLECTION_PROMPT = `The coaching session has just ended. The client has logged off. You are the same coach, but now stepping away from the chair to reflect on what just happened — the way a thoughtful coach writes session notes before the next client.

Think about:
- What actually surfaced in this hour? Not just topics — what shifted, what stayed closed, what the client's energy did across the session.
- How did this client show up? Quick? Guarded? Articulate? Somatic? Avoidant? Where did they light up, where did they go quiet?
- What threads opened that didn't get fully followed? What do you want to come back to?
- What should shape the opening of the next session, beyond just the homework follow-up?

Produce reflection notes via the save_reflection tool. Be specific and honest. These notes are for you — your future self, next session. Vague notes don't help. Name the real thing you noticed.`;

const REFLECTION_TOOL: Anthropic.Tool = {
  name: "save_reflection",
  description:
    "Record post-session reflection notes that will be available in future sessions.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "3-5 sentence summary of what actually happened this session — not a recap, a distillation.",
      },
      keyThemes: {
        type: "array",
        items: { type: "string" },
        description: "2-5 themes that surfaced. Short phrases.",
      },
      threadsToExplore: {
        type: "array",
        items: { type: "string" },
        description: "Things you noticed but didn't fully follow — to return to in future sessions. Be specific: 'the weight in her voice when she mentioned her father' beats 'family stuff'.",
      },
      clientObservations: {
        type: "array",
        items: { type: "string" },
        description: "How this client shows up — style, pace, somatic cues, where they light up, where they deflect. These are durable traits that will shape how you coach them going forward.",
      },
      nextSessionFocus: {
        type: "string",
        description: "What should shape the opening of next session, beyond the homework check-in. One or two sentences.",
      },
      internalNotes: {
        type: "string",
        description: "Optional — anything surprising, any doubts, anything you want to remember for yourself that doesn't fit the other buckets.",
      },
    },
    required: [
      "summary",
      "keyThemes",
      "threadsToExplore",
      "clientObservations",
      "nextSessionFocus",
    ],
  },
};

export async function reflectOnSession(
  journal: UserJournal,
  turns: ChatTurn[],
): Promise<SessionReflection | null> {
  const session = getSession(journal.currentSession);
  const transcript = turns
    .map((t) => `${t.role === "user" ? "CLIENT" : "COACH"}: ${t.content}`)
    .join("\n\n");

  const context = `Session ${session?.number ?? journal.currentSession}: ${session?.title ?? "(unknown)"}
Objective was: ${session?.objective ?? "(unknown)"}

Full transcript:

${transcript}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: COACH_IDENTITY,
        cache_control: { type: "ephemeral" },
      },
      { type: "text", text: REFLECTION_PROMPT },
    ],
    tools: [REFLECTION_TOOL],
    tool_choice: { type: "tool", name: "save_reflection" },
    messages: [{ role: "user", content: context }],
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "save_reflection") {
      const input = block.input as Omit<SessionReflection, "createdAt">;
      return {
        ...input,
        createdAt: new Date().toISOString(),
      };
    }
  }
  return null;
}
