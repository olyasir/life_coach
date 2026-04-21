import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "./sessions.js";
import { activeMemories, openCommitments } from "./storage.js";
import type { SessionBrief, UserJournal } from "./types.js";

const client = new Anthropic();
const MODEL = "claude-opus-4-7";

const BRIEF_PROMPT = `You are the coach, stepping away from the last session's chair and preparing for the NEXT session with this specific client. The generic session plan is a template — your job is to personalize it to THIS client based on everything we know about them so far.

Before the client walks in, synthesize a brief that will make the upcoming session feel truly personal — not generic. Think about:

- What opening move is right for THIS client? What prior thread or homework follow-up should the coach surface first? (beyond the generic "check homework").
- What adjustments does this client's style, pace, and history call for? (e.g., "this client is a fast processor — don't over-explain, trust their synthesis", or "this client tends to deflect with humor when things get heavy — name it gently when you see it").
- What should the coach WATCH FOR in this session specifically? (specific triggers, patterns, sensitivities — pulled from prior reflections and observations).
- What CALL-BACKS to prior sessions would deepen this one? (e.g., "when they listed 'belonging' as a top value in S6, they said it with visible weight — if belonging is relevant to this session's exercise, reference that moment").
- What CONFIG HINTS should shape this session's exercises? (e.g., if this session renders a canvas that expects S5 strengths, which 4-6 strengths are the RIGHT ones to seed it with, given their scoring patterns and what they emphasized in conversation?).
- If a confirmed CORE ISSUE / GOLDEN THREAD is in the client's memory, how should it shape this session? (If none is confirmed, leave this empty — do not speculate.)

Produce the brief via the save_brief tool. Be specific and actionable. The brief is for your future self, the coach-at-the-chair, not for the client. Vague briefs don't help. Name the real thing you'd remind yourself of.`;

const BRIEF_TOOL: Anthropic.Tool = {
  name: "save_brief",
  description:
    "Record a personalized pre-session brief for the upcoming session.",
  input_schema: {
    type: "object",
    properties: {
      openingMove: {
        type: "string",
        description:
          "Beyond the generic homework check-in, what specific opening move is right for THIS client, THIS session? One or two sentences.",
      },
      personalAdjustments: {
        type: "array",
        items: { type: "string" },
        description:
          "2-5 adjustments to the generic approach, based on how this client shows up. Each a short actionable sentence.",
      },
      watchFor: {
        type: "array",
        items: { type: "string" },
        description:
          "2-5 specific things to watch for this session — triggers, patterns, deflections, places the client tends to go silent. Pulled from prior observations.",
      },
      callBacks: {
        type: "array",
        items: { type: "string" },
        description:
          "2-5 specific prior-session moments to reference when relevant — e.g., 'her mother-in-law comment from S1' or 'the weight in his voice when he mentioned his dad in S3'. Quote or paraphrase with enough specificity to use.",
      },
      exerciseConfigHints: {
        type: "string",
        description:
          "For any exercise this session will render: which specific memories should seed the config? E.g., 'If rendering s9_force_field, seed topAdvancers with [person names], topRestrainer with the S5-observed pattern of X.' If no exercise is planned, say so briefly.",
      },
      coreIssueFrame: {
        type: "string",
        description:
          "Optional. Only fill if a confirmed core_issue/golden-thread realization exists in the client's memory. How should that core issue shape THIS session? Leave empty if none confirmed.",
      },
    },
    required: [
      "openingMove",
      "personalAdjustments",
      "watchFor",
      "callBacks",
      "exerciseConfigHints",
    ],
  },
};

function formatMemoryBlock(title: string, items: string[]): string {
  if (items.length === 0) return `## ${title}\n(none)`;
  return `## ${title}\n${items.map((i) => `- ${i}`).join("\n")}`;
}

export async function generatePreSessionBrief(
  journal: UserJournal,
): Promise<SessionBrief | null> {
  const upcomingNumber = journal.currentSession;
  const session = getSession(upcomingNumber);
  if (!session) return null;

  const active = activeMemories(journal);
  const facts = active.filter((m) => m.kind === "fact").map((m) => m.text);
  const people = active.filter((m) => m.kind === "person").map((m) => m.text);
  const feelings = active.filter((m) => m.kind === "feeling").map((m) => m.text);
  const realizations = active
    .filter((m) => m.kind === "realization")
    .map((m) => {
      const tag = m.tags?.includes("core_issue") ? " [CORE ISSUE]" : "";
      return `${m.text}${tag}`;
    });
  const open = openCommitments(journal).map(
    (m) =>
      `${m.text} (made S${m.sessionNumber}, follow-up S${m.commitment?.followUpInSession ?? "?"})`,
  );

  const priorSessionReflections = journal.sessions
    .filter((s) => s.reflection && s.sessionNumber < upcomingNumber)
    .map((s) => {
      const r = s.reflection!;
      return `### S${s.sessionNumber} — ${getSession(s.sessionNumber)?.title ?? ""}
Summary: ${r.summary}
Themes: ${r.keyThemes.join(" · ")}
Client observations: ${r.clientObservations.join(" | ")}
Threads to explore: ${r.threadsToExplore.join(" | ")}
Focus for next: ${r.nextSessionFocus}${r.internalNotes ? `\nInternal: ${r.internalNotes}` : ""}`;
    })
    .join("\n\n");

  const priorSummaries = journal.sessions
    .filter((s) => s.summary && s.sessionNumber < upcomingNumber)
    .map((s) => `- S${s.sessionNumber}: ${s.summary}`)
    .join("\n");

  const genericPlan = `# Upcoming session ${session.number}: ${session.title}

**Objective:** ${session.objective}

**Approach:** ${session.approach}

**Toolkit:** ${session.toolkit.join(", ")}

**Suggested exercises:** ${session.exercises.join(", ") || "none"}

**Completion criteria:**
${session.completionCriteria.map((c) => `- ${c}`).join("\n")}

**Homework guidance:** ${session.homeworkGuidance ?? "(none — closing session)"}`;

  const context = `${genericPlan}

---

# What we know about this specific client

**Name:** ${journal.profile.name ?? "unknown"}

${formatMemoryBlock("Known facts", facts)}

${formatMemoryBlock("People in their life", people)}

${formatMemoryBlock("Current emotional threads", feelings)}

${formatMemoryBlock("Past realizations (their own words — look for CORE ISSUE tags)", realizations)}

${formatMemoryBlock("Open commitments", open)}

## Prior session summaries
${priorSummaries || "(none)"}

## Prior session reflections (your own notes)
${priorSessionReflections || "(none)"}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: "You are a warm, perceptive life coach preparing notes before the next session with a client you know well. Your job is to personalize the generic session plan to this specific human.",
      },
      { type: "text", text: BRIEF_PROMPT },
    ],
    tools: [BRIEF_TOOL],
    tool_choice: { type: "tool", name: "save_brief" },
    messages: [{ role: "user", content: context }],
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "save_brief") {
      const input = block.input as Omit<SessionBrief, "createdAt">;
      return { ...input, createdAt: new Date().toISOString() };
    }
  }
  return null;
}
