import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { reflectOnSession, runCoachTurn } from "./coach.js";
import { generatePreSessionBrief } from "./preSessionBrief.js";
import {
  advanceToNextSession,
  appendExercise,
  appendMemory,
  attachPreSessionBrief,
  attachReflection,
  completeCurrentSession,
  currentSessionRecord,
  loadJournal,
  resolveCommitment,
  saveJournal,
} from "./storage.js";
import type { ChatTurn } from "./types.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/journal/:userId", async (req, res) => {
  const journal = await loadJournal(req.params.userId);
  res.json(journal);
});

app.post("/api/debug/goto/:userId", async (req, res) => {
  const n = Number(req.body?.sessionNumber);
  if (!Number.isInteger(n) || n < 1 || n > 12) {
    return res.status(400).json({ error: "sessionNumber must be 1-12" });
  }
  const journal = await loadJournal(req.params.userId);
  journal.currentSession = n;
  if (!journal.sessions.find((s) => s.sessionNumber === n)) {
    journal.sessions.push({
      sessionNumber: n,
      startedAt: new Date().toISOString(),
      turns: [],
    });
  }
  await saveJournal(journal);
  res.json({ currentSession: journal.currentSession });
});

app.post("/api/debug/reset/:userId", async (req, res) => {
  const journal = await loadJournal(req.params.userId);
  journal.currentSession = 1;
  journal.sessions = [
    { sessionNumber: 1, startedAt: new Date().toISOString(), turns: [] },
  ];
  journal.memories = [];
  journal.exercises = [];
  await saveJournal(journal);
  res.json({ ok: true });
});

app.post("/api/profile/:userId", async (req, res) => {
  const journal = await loadJournal(req.params.userId);
  const { name, language } = req.body ?? {};
  if (typeof name === "string") journal.profile.name = name;
  if (language === "en" || language === "he") journal.profile.language = language;
  await saveJournal(journal);
  res.json(journal);
});

app.post("/api/message/:userId", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  const journal = await loadJournal(req.params.userId);
  const sessionRec = currentSessionRecord(journal);

  if (
    sessionRec.turns.length === 0 &&
    journal.currentSession > 1 &&
    !sessionRec.preSessionBrief
  ) {
    try {
      const brief = await generatePreSessionBrief(journal);
      if (brief) attachPreSessionBrief(sessionRec, brief);
    } catch (err) {
      console.error("pre-session brief failed", err);
    }
  }

  const userTurn: ChatTurn = {
    role: "user",
    content: text,
    timestamp: new Date().toISOString(),
  };
  sessionRec.turns.push(userTurn);

  try {
    const result = await runCoachTurn(journal, sessionRec.turns);

    const exercisesToRender: Array<{
      exerciseId: string;
      title: string;
      instructions: string;
      config?: Record<string, unknown>;
    }> = [];

    let sessionClosed: { summary: string; readyForNext: boolean } | null = null;

    for (const call of result.toolCalls) {
      if (call.tool === "render_exercise") {
        exercisesToRender.push({
          exerciseId: call.args.exerciseId,
          title: call.args.title,
          instructions: call.args.instructions,
          config: call.args.config as Record<string, unknown> | undefined,
        });
      } else if (call.tool === "save_memory") {
        appendMemory(journal, call.args);
      } else if (call.tool === "resolve_commitment") {
        resolveCommitment(
          journal,
          call.args.memoryId,
          call.args.status,
          call.args.note,
        );
      } else if (call.tool === "complete_session") {
        sessionClosed = { summary: call.args.summary, readyForNext: call.args.readyForNext };
      }
    }

    if (result.assistantText) {
      sessionRec.turns.push({
        role: "assistant",
        content: result.assistantText,
        timestamp: new Date().toISOString(),
      });
    }

    if (sessionClosed) {
      const completedRec = completeCurrentSession(journal, sessionClosed.summary);
      try {
        const reflection = await reflectOnSession(journal, completedRec.turns);
        if (reflection) attachReflection(completedRec, reflection);
      } catch (err) {
        console.error("reflection failed", err);
      }
      advanceToNextSession(journal);
    }

    await saveJournal(journal);

    res.json({
      assistantText: result.assistantText,
      exercises: exercisesToRender,
      sessionClosed,
      currentSession: journal.currentSession,
    });
  } catch (err) {
    console.error("coach turn failed", err);
    res.status(500).json({ error: "coach turn failed" });
  }
});

app.post("/api/exercise/:userId", async (req, res) => {
  const { exerciseId, data } = req.body ?? {};
  if (typeof exerciseId !== "string") {
    return res.status(400).json({ error: "exerciseId required" });
  }
  const journal = await loadJournal(req.params.userId);
  const sessionRec = currentSessionRecord(journal);

  appendExercise(journal, exerciseId, data);

  const formatted = formatExerciseResults(exerciseId, data);
  const summary = `[The client just completed the "${exerciseId}" exercise. Their responses:

${formatted}

Read their responses carefully. Pick the one answer that feels most alive, revealing, or incomplete — and ask ONE open-ended follow-up question to explore it. Do not thank them or ask if they want to continue. Move straight into the work.]`;
  sessionRec.turns.push({
    role: "user",
    content: summary,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await runCoachTurn(journal, sessionRec.turns);
    if (result.assistantText) {
      sessionRec.turns.push({
        role: "assistant",
        content: result.assistantText,
        timestamp: new Date().toISOString(),
      });
    }
    for (const call of result.toolCalls) {
      if (call.tool === "save_memory") {
        appendMemory(journal, call.args);
      } else if (call.tool === "resolve_commitment") {
        resolveCommitment(
          journal,
          call.args.memoryId,
          call.args.status,
          call.args.note,
        );
      }
    }
    await saveJournal(journal);
    res.json({ assistantText: result.assistantText });
  } catch (err) {
    console.error("exercise follow-up failed", err);
    res.status(500).json({ error: "follow-up failed" });
  }
});

function formatExerciseResults(exerciseId: string, data: unknown): string {
  if (exerciseId === "s5_assets_bank" && isObj(data) && Array.isArray((data as any).selected)) {
    const picks = (data as { selected: string[] }).selected;
    return `Client selected ${picks.length} assets/strengths from the bank:\n${picks.map((p) => `- ${p}`).join("\n")}`;
  }
  if (exerciseId === "s5_strengths_inventory" && isObj(data) && isObj((data as any).scores)) {
    const scores = (data as { scores: Record<string, number> }).scores;
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const byBand = (n: number) => entries.filter(([, v]) => v === n).map(([k]) => k);
    const four = byBand(4);
    const three = byBand(3);
    const two = byBand(2);
    const one = byBand(1);
    const lines: string[] = [];
    lines.push(`Client completed the 34-item Clifton strengths inventory.`);
    if (four.length) lines.push(`Score 4 (very strongly): ${four.join(", ")}`);
    if (three.length) lines.push(`Score 3 (strongly): ${three.join(", ")}`);
    if (two.length) lines.push(`Score 2 (somewhat): ${two.join(", ")}`);
    if (one.length) lines.push(`Score 1 (barely): ${one.join(", ")}`);
    return lines.join("\n");
  }
  if (exerciseId === "s6_values_bank" && isObj(data) && Array.isArray((data as any).selected)) {
    const picks = (data as { selected: string[] }).selected;
    return `Client selected ${picks.length} values from the bank:\n${picks.map((p) => `- ${p}`).join("\n")}`;
  }
  if (exerciseId === "s7_six_needs_reflection" && isObj(data) && Array.isArray((data as any).needs)) {
    const d = data as {
      needs: Array<{ name: string; manifestation: string; importance: number; fulfillment: number }>;
      mostImportant: string;
      leastImportant: string;
      learning?: string;
    };
    const withGap = d.needs.map((n) => ({ ...n, gap: n.importance - n.fulfillment }));
    const sortedByGap = [...withGap].sort((a, b) => b.gap - a.gap || b.importance - a.importance);
    const lines: string[] = [];
    lines.push(`Client completed the Robbins-Madanes six universal needs reflection.`);
    lines.push(``);
    lines.push(`How each need shows up in their life:`);
    for (const n of d.needs) {
      lines.push(`- ${n.name} (importance ${n.importance}/10, fulfilled ${n.fulfillment}/10, gap ${n.importance - n.fulfillment}):`);
      lines.push(`    ${n.manifestation}`);
    }
    lines.push(``);
    lines.push(`Most important to client: ${d.mostImportant}`);
    lines.push(`Least important to client: ${d.leastImportant}`);
    if (d.learning) lines.push(`Client's own learning: ${d.learning}`);
    lines.push(``);
    lines.push(`Needs sorted by gap (largest first — biggest gap is priority for homework):`);
    for (const n of sortedByGap) {
      lines.push(`- ${n.name}: gap ${n.gap} (imp ${n.importance}, got ${n.fulfillment})`);
    }
    return lines.join("\n");
  }
  if (exerciseId === "s7_yes_i_can") {
    return `Client acknowledged the Yes-I-Can integrating summary. Ask the landing question: "seeing all of this together — what do you notice?" Save their response as a realization memory.`;
  }
  if (exerciseId === "s8_goal_canvas" && isObj(data)) {
    const d = data as {
      goalStatement: string;
      valueHonored: string;
      needMet: string;
      targetDate: string;
      passion: number;
      willingToDo: string;
      priceWillingToPay: string;
      coreTest: { confirmed: boolean; note: string };
      ecologicalTest: { confirmed: boolean; note: string };
      realityTest: { confirmed: boolean; note: string };
    };
    const lines: string[] = [];
    lines.push(`Client finalized their S8 GOAL on the canvas.`);
    lines.push(``);
    lines.push(`GOAL STATEMENT: ${d.goalStatement}`);
    lines.push(`TARGET DATE: ${d.targetDate}`);
    lines.push(`VALUE HONORED: ${d.valueHonored}`);
    lines.push(`NEED MET: ${d.needMet}`);
    lines.push(`PASSION: ${d.passion}/10`);
    lines.push(``);
    lines.push(`WILLING TO DO: ${d.willingToDo}`);
    lines.push(`PRICE WILLING TO PAY: ${d.priceWillingToPay}`);
    lines.push(``);
    lines.push(`Quality tests:`);
    lines.push(`- CORE (values/beliefs): ${d.coreTest.confirmed ? "✓" : "✗"} — ${d.coreTest.note}`);
    lines.push(`- ECOLOGICAL (others affected): ${d.ecologicalTest.confirmed ? "✓" : "✗"} — ${d.ecologicalTest.note}`);
    lines.push(`- REALITY (resources): ${d.realityTest.confirmed ? "✓" : "✗"} — ${d.realityTest.note}`);
    lines.push(``);
    lines.push(`Save the final goal statement as a HIGH-CONFIDENCE fact memory. Then move into the s8_ten_reasons exercise.`);
    return lines.join("\n");
  }
  if (exerciseId === "s8_ten_reasons" && isObj(data) && Array.isArray((data as any).reasons)) {
    const d = data as { goal: string; reasons: string[] };
    const lines: string[] = [];
    lines.push(`Client completed the TEN REASONS exercise.`);
    if (d.goal) {
      lines.push(``);
      lines.push(`Goal: ${d.goal}`);
    }
    lines.push(``);
    lines.push(`Their ten reasons:`);
    d.reasons.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push(``);
    lines.push(`Read them carefully. Reflect back the PATTERN/theme across the ten (not a read-back). Then ask which reason has the most CHARGE — the one they'd put on their wall. Save that as a realization memory.`);
    return lines.join("\n");
  }
  if (exerciseId === "s9_force_field" && isObj(data)) {
    const d = data as {
      advancers: string[];
      restrainers: string[];
      wantsToBeExpressed?: string;
    };
    const lines: string[] = [];
    lines.push(`Client completed the S9 force-field canvas.`);
    lines.push(``);
    lines.push(`FORCES ADVANCING (${d.advancers.length}):`);
    d.advancers.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
    lines.push(``);
    lines.push(`FORCES RESTRAINING (${d.restrainers.length}):`);
    d.restrainers.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
    if (d.wantsToBeExpressed?.trim()) {
      lines.push(``);
      lines.push(`WHAT WANTS TO BE EXPRESSED: ${d.wantsToBeExpressed}`);
    }
    lines.push(``);
    lines.push(
      `Do NOT simply read back. Pick the longest / most-charged column and go there first with ONE question. Stay slow. Allow silence after each answer. Specific people named should be saved as person memories.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s9_inhibitors_bank" &&
    isObj(data) &&
    Array.isArray((data as any).topFive)
  ) {
    const d = data as {
      picked: string[];
      topFive: string[];
      answers: Array<{
        name: string;
        definition: string;
        howShowsUp: string;
        howBlocks: string;
      }>;
    };
    const lines: string[] = [];
    lines.push(`Client completed the Reuven Katz inhibitors bank.`);
    lines.push(``);
    lines.push(`All picked (${d.picked.length}): ${d.picked.join(", ")}`);
    lines.push(``);
    lines.push(`TOP 5:`);
    for (const a of d.answers) {
      lines.push(`- ${a.name}`);
      lines.push(`    definition: ${a.definition}`);
      lines.push(`    how it shows up: ${a.howShowsUp}`);
      lines.push(`    how it blocks goal: ${a.howBlocks}`);
    }
    lines.push(``);
    lines.push(
      `Ask: which of these has the most WEIGHT right now — which one, if it shifted, would change the most? Then origin + protect-against reframe on that top one.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s9_imps_taming" &&
    isObj(data) &&
    Array.isArray((data as any).imps)
  ) {
    const d = data as {
      imps: Array<{ name: string; trigger: string; taming: string }>;
    };
    const lines: string[] = [];
    lines.push(`Client named their imps (Richard Carson framework).`);
    lines.push(``);
    for (const imp of d.imps) {
      lines.push(`- ${imp.name}`);
      lines.push(`    trigger: ${imp.trigger}`);
      lines.push(`    taming: ${imp.taming}`);
    }
    lines.push(``);
    lines.push(
      `Ask which imp is loudest this week, and what the goal work will stir up in it. The taming line they wrote is a candidate homework move.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s9_inner_judge" &&
    isObj(data) &&
    Array.isArray((data as any).statements)
  ) {
    const d = data as { statements: string[]; loudest: string[] };
    const lines: string[] = [];
    lines.push(`Client caught the inner-judge voice on the page.`);
    lines.push(``);
    lines.push(`All statements:`);
    d.statements.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
    lines.push(``);
    lines.push(`Loudest (marked):`);
    d.loudest.forEach((s) => lines.push(`  ★ ${s}`));
    lines.push(``);
    lines.push(
      `Ask: "whose voice is that, actually?" — often it's a real person from earlier in life. Then: "if that voice weren't running, what would you do differently this week?"`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s9_fairy_letter" &&
    isObj(data) &&
    typeof (data as any).letter === "string"
  ) {
    const d = data as { letter: string };
    const lines: string[] = [];
    lines.push(`Client wrote the letter from their fairy/resource self.`);
    lines.push(``);
    lines.push(`LETTER:`);
    lines.push(d.letter);
    lines.push(``);
    lines.push(
      `Read the letter slowly. Reflect what the fairy voice KNOWS that the everyday voice doesn't. Ask: "which line in this letter would you want to remember this week?" Save it as a realization memory.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s9_inhibitors_by_domain" &&
    isObj(data) &&
    isObj((data as any).answers)
  ) {
    const d = data as { answers: Record<string, string> };
    const labels: Record<string, string> = {
      relationships: "Relationships",
      learning: "Learning & growth",
      daily: "Daily life & habits",
      achievement: "Achievement & ambition",
      finance: "Money & resources",
      overall: "Overall life",
    };
    const lines: string[] = [];
    lines.push(`Client surfaced inhibitors across life domains.`);
    lines.push(``);
    for (const [k, v] of Object.entries(d.answers)) {
      if (!v?.trim()) continue;
      lines.push(`- ${labels[k] ?? k}:`);
      lines.push(`    ${v}`);
    }
    lines.push(``);
    lines.push(
      `Look for the repeating pattern — is the same inhibitor showing up in multiple domains? That's the one to name. Ask which domain surprised them most.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s9_pop_answers" &&
    isObj(data) &&
    isObj((data as any).answers)
  ) {
    const d = data as { answers: Record<string, string> };
    const labels: Record<string, string> = {
      release: "What I need to let go of",
      self_confidence: "Where self-confidence is weakest (and why)",
      image: "Image I'm attached to (and what it costs)",
      failures: "Failure I'm still carrying (and what it says)",
    };
    const lines: string[] = [];
    lines.push(`Client answered the 4 pop-intuition questions (bypassing the censor).`);
    lines.push(``);
    for (const [k, v] of Object.entries(d.answers)) {
      if (!v?.trim()) continue;
      lines.push(`- ${labels[k] ?? k}:`);
      lines.push(`    ${v}`);
    }
    lines.push(``);
    lines.push(
      `Pick the ONE answer with the most charge and open it up with a single question. Don't march through all 4. Save the chosen thread as a realization memory.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s10_milestone_plan" &&
    isObj(data) &&
    Array.isArray((data as any).stones)
  ) {
    const d = data as {
      goal: string;
      targetDate: string;
      stones: Array<{
        subOutcome: string;
        timeWindow: string;
        owner: string;
        resources: string;
        strength: string;
        value: string;
      }>;
      startingPoint: string;
    };
    const lines: string[] = [];
    lines.push(`Client built their S10 backward-planned milestone plan.`);
    lines.push(``);
    if (d.goal) lines.push(`GOAL: ${d.goal}`);
    if (d.targetDate) lines.push(`TARGET DATE: ${d.targetDate}`);
    lines.push(``);
    lines.push(`STEPPING STONES (top = closest to goal, bottom = closest to today):`);
    d.stones.forEach((s, i) => {
      const n = d.stones.length - i;
      lines.push(`  Stone ${n}: ${s.subOutcome}`);
      lines.push(`    when: ${s.timeWindow} · owner: ${s.owner}`);
      lines.push(`    resources/people: ${s.resources}`);
      lines.push(`    strength deployed: ${s.strength} · value honored: ${s.value}`);
    });
    lines.push(``);
    lines.push(`STARTING POINT (today): ${d.startingPoint}`);
    lines.push(``);
    lines.push(
      `Do NOT narrate the plan back. Ask 2-3 targeted questions: (a) if any stone is missing a strength or value tag, ask which one carries it. (b) sanity-check the pace — is it right? (c) if 'people' is thin, probe for names not roles. (d) surface any stone the S9 top restrainer would threaten as written. Then move to the constraints pre-mortem.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s10_constraints_premortem" &&
    isObj(data) &&
    Array.isArray((data as any).rows)
  ) {
    const d = data as {
      rows: Array<{
        constraint: string;
        requiredAction: string;
        known: string;
        isTopRestrainer?: boolean;
      }>;
      foldInto: string;
    };
    const lines: string[] = [];
    lines.push(`Client completed the constraints pre-mortem (Yozmot אילוצים).`);
    lines.push(``);
    for (const r of d.rows) {
      const tag = r.isTopRestrainer ? " [S9 top restrainer]" : "";
      const know = r.known === "known" ? "KNOWN" : "unknown";
      lines.push(`- ${r.constraint}${tag} (${know})`);
      lines.push(`    action: ${r.requiredAction}`);
    }
    lines.push(``);
    lines.push(`FOLD INTO PLAN STRUCTURE: ${d.foldInto}`);
    lines.push(``);
    lines.push(
      `The client has named how to handle the constraints they already know. Treat the fold-in as an update to the milestone plan — mentally integrate it before the reflection arc. Then ask the feel-check question: 'looking at the whole plan now, how does it FEEL — doable, heavy, exciting, daunting?'`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s11_change_cycle_locator" &&
    isObj(data) &&
    typeof (data as any).stage === "string"
  ) {
    const d = data as { stage: string; why: string; toAdvance: string };
    const lines: string[] = [];
    lines.push(`Client located themselves on the change cycle.`);
    lines.push(``);
    lines.push(`STAGE: ${d.stage.toUpperCase()}`);
    lines.push(`Why this stage: ${d.why}`);
    lines.push(`What advancing would look like (concrete): ${d.toAdvance}`);
    lines.push(``);
    lines.push(
      `Do NOT correct their self-diagnosis. Diagnostic guide: insight-stuck → cow + kaizen size-down. change-stuck → habit installer. experience-stuck → rewind to S9 inhibitor work. habit → integration / new experience. Save stage and answer as fact memory. Next: tell the cow story slowly, in chat.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s11_my_cow" &&
    isObj(data) &&
    typeof (data as any).cow === "string"
  ) {
    const d = data as { cow: string; releaseAction: string };
    const lines: string[] = [];
    lines.push(`Client named their cow.`);
    lines.push(``);
    lines.push(`MY COW: ${d.cow}`);
    lines.push(`WILLING TO DO TO RELEASE HER: ${d.releaseAction}`);
    lines.push(``);
    lines.push(
      `Reflect what the cow is PROTECTING them from facing — every cow is also a guard. Save as high-confidence realization: 'S11 cow: X. Protects from facing: Y. Releasing by: Z.' Then move to the kaizen / identity / habit menu pick (1-2, never more).`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s11_kaizen_action" &&
    isObj(data) &&
    typeof (data as any).principle === "string"
  ) {
    const d = data as {
      principle: string;
      whyThis: string;
      tinyAction: string;
      whenToDo: string;
    };
    const lines: string[] = [];
    lines.push(`Client picked a kaizen principle and applied it.`);
    lines.push(``);
    lines.push(`PRINCIPLE: ${d.principle}`);
    lines.push(`Why this one: ${d.whyThis}`);
    lines.push(`Tiny action: ${d.tinyAction}`);
    lines.push(`When: ${d.whenToDo}`);
    lines.push(``);
    lines.push(
      `Pressure-test SIZE: if the action sounds ambitious, push smaller — 'how about half that?' The right size feels almost embarrassingly small. The amygdala should not fire when they imagine doing it. Save as fact memory; this likely becomes the homework + celebration ritual.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s11_identity_becoming" &&
    isObj(data) &&
    Array.isArray((data as any).statements)
  ) {
    const d = data as {
      statements: string[];
      proofMoment: string;
      oldIdentity: string;
    };
    const lines: string[] = [];
    lines.push(`Client wrote identity-becoming statements.`);
    lines.push(``);
    lines.push(`PROOF (the win that earns the statement): ${d.proofMoment}`);
    lines.push(``);
    lines.push(`I AM statements:`);
    for (const s of d.statements) lines.push(`  - I am ${s}`);
    lines.push(``);
    lines.push(`OLD IDENTITY being released: ${d.oldIdentity}`);
    lines.push(``);
    lines.push(
      `Pick the ONE statement with the most charge — read it back to them slowly. Ask: 'when you say that out loud, what shifts in your body?' Save the chosen statement + the proof moment as a high-confidence realization. This feeds S12.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s11_habit_installer" &&
    isObj(data) &&
    typeof (data as any).habit === "string"
  ) {
    const d = data as {
      habit: string;
      whenTime: string;
      wherePlace: string;
      cueAnchor: string;
      duration: string;
      reward: string;
      ifThen: string;
    };
    const lines: string[] = [];
    lines.push(`Client designed a habit installation.`);
    lines.push(``);
    lines.push(`HABIT: ${d.habit}`);
    lines.push(`WHEN: ${d.whenTime}`);
    lines.push(`WHERE: ${d.wherePlace}`);
    lines.push(`CUE / ANCHOR: ${d.cueAnchor}`);
    lines.push(`DURATION: ${d.duration}`);
    lines.push(`REWARD: ${d.reward}`);
    if (d.ifThen) lines.push(`IF / THEN backup: ${d.ifThen}`);
    lines.push(``);
    lines.push(
      `Stress-test specificity: every variable must be specific (not 'sometime in the morning'). Stress-test duration: small enough to never miss? If they balk, shrink it. Read back as one sentence so they hear it. Save as fact + commitment memory with followUpInSession=12.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s12_journey_reflection" &&
    isObj(data) &&
    typeof (data as any).treasuresFound === "string"
  ) {
    const d = data as {
      treasuresFound: string;
      placesReached: string;
      difficulties: string;
      significantPeople: string;
      placesWantedNext: string;
      feelingAtEnd: string;
      letterToSession1Self: string;
    };
    const lines: string[] = [];
    lines.push(`Client completed the S12 journey reflection canvas.`);
    lines.push(``);
    lines.push(`TREASURES FOUND IN MYSELF:`);
    lines.push(`  ${d.treasuresFound}`);
    lines.push(``);
    lines.push(`WONDERFUL PLACES REACHED:`);
    lines.push(`  ${d.placesReached}`);
    lines.push(``);
    lines.push(`DIFFICULTIES ALONG THE WAY:`);
    lines.push(`  ${d.difficulties}`);
    lines.push(``);
    lines.push(`SIGNIFICANT PEOPLE MET ON THE JOURNEY:`);
    lines.push(`  ${d.significantPeople}`);
    lines.push(``);
    lines.push(`PLACES STILL WANTED (journey continues):`);
    lines.push(`  ${d.placesWantedNext}`);
    lines.push(``);
    lines.push(`FEELING AT END OF JOURNEY:`);
    lines.push(`  ${d.feelingAtEnd}`);
    lines.push(``);
    lines.push(`ONE THING TO TELL SESSION-1 SELF:`);
    lines.push(`  ${d.letterToSession1Self}`);
    lines.push(``);
    lines.push(
      `Do NOT narrate this back. Ask ONE question: 'which of these sections surprised you as you wrote it?' Let silence follow. The answer is often the real insight of the session — save as high-confidence realization memory. Then move to the letter to future self.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "s12_letter_to_future_self" &&
    isObj(data) &&
    typeof (data as any).body === "string"
  ) {
    const d = data as {
      dateOneYearForward: string;
      greeting: string;
      body: string;
    };
    const lines: string[] = [];
    lines.push(`Client wrote their letter to self, +1 year, in as-if tense.`);
    lines.push(``);
    lines.push(`DATE: ${d.dateOneYearForward}`);
    lines.push(`GREETING: ${d.greeting}`);
    lines.push(``);
    lines.push(`LETTER (verbatim — preserve whole):`);
    lines.push(d.body);
    lines.push(``);
    lines.push(
      `Do NOT read it back. Do NOT interpret. Ask ONE question: 'what did it feel like to write in the as-if voice?' Then silence. Save the letter VERBATIM as a high-confidence realization memory — this is the single piece most clients reread. Then move to building the self-coaching toolkit in chat (3-5 questions/practices the client will carry forward), then the explicit goodbye. No homework.`,
    );
    return lines.join("\n");
  }
  if (
    exerciseId === "laser_tgrow" &&
    isObj(data) &&
    typeof (data as any).topic === "string"
  ) {
    const d = data as {
      topic: string;
      goals: string;
      reality: string;
      options: string[];
      will: { action: string; when: string; support: string };
    };
    const lines: string[] = [];
    lines.push(`Client completed a LASER T-GROW detour.`);
    lines.push(``);
    lines.push(`T (Topic): ${d.topic}`);
    lines.push(`G (Goals for this session): ${d.goals}`);
    lines.push(`R (Reality): ${d.reality}`);
    lines.push(``);
    lines.push(`O (Options brainstormed, ${d.options.length}):`);
    d.options.forEach((o, i) => lines.push(`  ${i + 1}. ${o}`));
    lines.push(``);
    lines.push(`W (Will):`);
    lines.push(`  Action: ${d.will.action}`);
    lines.push(`  When: ${d.will.when}`);
    if (d.will.support?.trim()) lines.push(`  Support: ${d.will.support}`);
    lines.push(``);
    lines.push(
      `Save the Will (action + when) as a commitment memory with followUpInSession=next session. Briefly name the shift back to the main session's theme; do NOT call complete_session from inside the laser detour.`,
    );
    return lines.join("\n");
  }
  if (exerciseId === "s6_values_assessment" && isObj(data) && Array.isArray((data as any).values)) {
    const values = (data as {
      values: Array<{ name: string; meaning: string; currentExpression: number; action: string }>;
    }).values;
    const sorted = [...values].sort((a, b) => a.currentExpression - b.currentExpression);
    const lines: string[] = [];
    lines.push(`Client's TOP 5 values (sorted by gap — lowest expressed first):`);
    for (const v of sorted) {
      lines.push(`- ${v.name} (${v.currentExpression}/10)`);
      lines.push(`    Means to them: ${v.meaning}`);
      lines.push(`    What they'd do to live it more: ${v.action}`);
    }
    const lowest = sorted[0];
    if (lowest) {
      lines.push(``);
      lines.push(`GAP: lowest-expressed top value is "${lowest.name}" at ${lowest.currentExpression}/10 — this is the priority for today's homework.`);
    }
    return lines.join("\n");
  }
  if (isObj(data)) {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length > 0) {
      return entries
        .map(([k, v]) => `- ${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("\n");
    }
  }
  return JSON.stringify(data, null, 2);
}

function isObj(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.resolve(__dirname, "../../frontend/dist");

import { existsSync } from "node:fs";
if (existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`coach backend listening on :${PORT}`);
  if (existsSync(FRONTEND_DIST)) {
    console.log(`serving frontend from ${FRONTEND_DIST}`);
  } else {
    console.log(`frontend/dist not found — run 'npm run build' in frontend/`);
  }
});
