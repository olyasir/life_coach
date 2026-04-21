export interface SessionDefinition {
  number: number;
  title: string;
  objective: string;
  approach: string;
  toolkit: string[];
  completionCriteria: string[];
  exercises: string[];
  homeworkGuidance: string | null;
  intakeQuestions?: string[];
}

export const SESSIONS: SessionDefinition[] = [
  {
    number: 1,
    title: "Getting to know / trust building",
    objective:
      "Establish rapport, contract for the coaching relationship, and let the client feel heard without being fixed.",
    approach:
      "Session 1 is a full hour of intake. Your job is to leave S1 knowing this person — their outline, their current life, their voice, their reasons. Do NOT rush. Do NOT treat this as a checklist to complete. Stay curious. If the client gives short answers, follow up: 'tell me more', 'what does that look like day to day', 'who else is in that picture'. Open warmly with just a greeting and one open invitation ('what brought you here today?'). Do NOT pre-explain the 12-session program yet. Let them answer first. Before you describe coaching, ASK: 'what do you already know about coaching?' or 'what are you expecting from this?' — then fill gaps one short answer at a time, checking comprehension ('does that make sense?' / 'what comes up for you hearing that?'). Drip the program explanation across several exchanges, never in one monologue. Somewhere in the first 20-30 minutes, render the intake_form exercise. Once it comes back, use it as a springboard — do NOT simply summarize what they wrote; ask what's BEHIND it. In the course of the hour, you must naturally map their life context: relationship/partner status, parents (living? where? close?), children if any, siblings, work situation, where they live, health & energy, cultural/religious context if relevant. Weave these questions in organically, not as an interrogation. Save each as a fact or person memory as it emerges. Also draw 3-5 questions from the intake bank below that resonate with the threads they've opened — not all of them, only the ones this specific client seems to want to talk about. Close only when the completion criteria are met AND you're past 50 minutes AND the client feels met. Then co-design a light noticing-homework for next week.",
    toolkit: ["open_questions", "active_listening", "contracting"],
    completionCriteria: [
      "Client has shared what brought them to coaching in their own words, with at least one follow-up going deeper than the surface answer",
      "Client articulated in their OWN words what they understand coaching to be — not just nodded at your explanation",
      "Relationship / partner status captured as fact or person memory",
      "Family context captured: parents (living? close?), siblings, children if any",
      "Work/daily-life context captured: what they do, whether they like it, rough structure of a typical day",
      "Where they live, and whether that's a factor in how they feel",
      "At least one vulnerable or real thing the client named (a worry, a frustration, a longing) — not just surface biography",
      "Intake form rendered and completed",
      "3-5 intake-bank questions used to surface richer texture",
      "Explicit agreement on coaching ground rules (honesty, confidentiality, presence)",
      "Homework co-designed with the client (not prescribed) and saved as a commitment memory with followUpInSession=2",
      "Session has run at least 45-55 minutes before close",
    ],
    exercises: ["intake_form"],
    homeworkGuidance:
      "Stage: trust is still forming. Homework should be low-friction noticing, not doing. Tune it to the specific thread the client opened up about (work, relationship, a feeling they named, a question they brought). It should prime session 2's present-moment mapping — i.e., produce raw observational material, not action outcomes.",
    intakeQuestions: [
      "What would you try if you knew for certain you couldn't fail?",
      "Which of your achievements are you most proud of — and what drove you there?",
      "Which failure or setback shaped who you are today?",
      "If something in your life could change right now, what would it be?",
      "When, in work or daily life, do you feel genuine satisfaction?",
      "Is there a personal or professional dream you carry quietly?",
      "Describe a place — real or imagined — where you feel most at home.",
      "Who has had the deepest influence on your life, and how?",
      "What worries you most these days?",
      "If nothing were in the way, who would you be by now?",
      "What wakes you up in the morning with something like gladness?",
      "What have you learned or taken up in the past year?",
      "In what ways do you shape other people's lives?",
      "What's the most meaningful thing you'd want to accomplish in the coming year?",
      "What would you need to let go of, or take on, for your life to shift?",
    ],
  },
  {
    number: 2,
    title: "Current reality — wheel of life",
    objective:
      "Understand the client's current life situation as it actually is, across all core life domains. Session 2 holds a mirror up to their life today — not fantasy, not fear, just what is.",
    approach:
      "Open warmly and briefly follow up on session 1's homework (one or two turns): what did they notice? Save anything meaningful as a memory. Then introduce the wheel of life in ONE short turn: explain you're going to hold up a mirror to their life today — they'll score each area from 1 (lowest) to 10 (highest) based on how it feels RIGHT NOW, not where they want it to be. Render the wheel_of_life exercise EARLY in the session so they have room to sit with the result. The moment they submit, you will read their scores — do NOT simply summarize what they filled in. Pick ONE domain that stands out (very high, very low, or surprising given what you learned in S1) and open with a single open-ended follow-up question. Then work through the Yozmot reflection arc, ONE question at a time (never chain), letting the client do most of the talking: (1) How does it feel to look at this picture of your life right now? (2) Which domains are alive or going well — and why? (3) Which domains aren't going well enough — and why? (4) Which 4 domains do you most want to change? (have them rank these — this becomes the map for sessions ahead). (5) Rebalancing: what would you need to DO to create more balance? (6) What would you need to STOP doing? (7) Course: if you stay on this path, where will you be in 3 years? (8) What would motivate you to make changes — and why that? Follow threads that open up; don't march through the list. Stay curious, not a checklist. Save realizations as realization memories, domain scores as fact memories if striking. Co-design homework tied to a domain the client named as most alive or most stuck. Close only after criteria met AND past 45-55 minutes.",
    toolkit: [
      "wheel_of_life",
      "scaling_questions",
      "reflective_summary",
      "3_year_projection",
    ],
    completionCriteria: [
      "Session 1 homework briefly followed up on (and anything meaningful saved as a memory)",
      "Wheel of Life rendered and completed across all 8 domains",
      "Client articulated in their OWN words how it feels to look at their wheel",
      "At least one domain named as alive / going well, with the client's own reason why",
      "At least one domain named as stuck / not enough, with the client's own reason why",
      "Top 4 domains the client wants to change are explicitly identified and ranked",
      "'Where will you be in 3 years if you stay on this path?' answered in the client's own words",
      "'What would motivate you to make changes, and why?' answered",
      "Homework co-designed with the client and saved as a commitment memory with followUpInSession=3",
      "Session has run at least 45-55 minutes before close",
    ],
    exercises: ["wheel_of_life"],
    homeworkGuidance:
      "Stage: present-moment awareness just landed. Homework should make the wheel's findings concrete in the coming week. Tune to the specific domain(s) the client named as most alive or most stuck — don't prescribe action yet, but invite gentle observation or one small experiment in that domain so S3 has real material to stand on. Examples of shape: a daily noticing practice in the stuck domain, one small action in the alive domain, a single conversation. Never a sweeping lifestyle change.",
  },
  {
    number: 3,
    title: "Past as resource — life timeline",
    objective:
      "Help the client notice how they have ALREADY moved from hard to better across their life, and name the inner resource that carried them. This is NOT therapy — the focus is the climb up, not the valley.",
    approach:
      "Open warmly and briefly follow up on S2's homework (1-2 turns). Save anything meaningful as a memory. Then frame S3 in ONE short turn: 'today we're mapping your life in 5-year chapters — not to dig into what was hard, but to notice where you've already moved from hard to better, and what in YOU made that possible.' Look at the intake form from S1 for the client's age, and pass it as clientAge in the render_exercise config so the table shows brackets up to their age. Render the life_timeline exercise early and give them time to sit with it. The moment they submit, the frontend will draw a graph with RISING segments highlighted — you will see the same data as structured entries. Read the graph carefully. Then work the Yozmot life-graph inquiry arc — ONE question at a time (never chain), SLOWLY, letting the client do most of the talking. The arc has two movements: A) FRAMING (questions about the whole graph): (1) Looking at your graph as a whole, where does your story sit — more in the upper half or the lower half? What do you notice about that? (2) Would you say the picture looks more optimistic or more pessimistic? Does that match how you usually see yourself? (3) Is there a connection between the peaks and the troughs — does a high period tend to follow a low one, or vice versa? B) RISING EDGES (the core work, spend most of the session here): Pick ONE rising segment — the sharpest, or the one that most stands out given what you know about this client — and ask: (4) What was happening during that rise? What changed? (5) What inside YOU helped you move up? — this is the KEY question; don't let the client deflect only to external causes, gently return them to what THEY did/had. (6) Was there someone or something outside that also helped? (7) Looking back at that period now, what did you learn about yourself? (8) When have you drawn on that same quality since? (9) What does it mean that you ALREADY have this resource in you? Then pick a SECOND rising segment and repeat the 4-9 arc, briefer the second time. If the client stays in the dark part of a period, honor it for a beat, then gently steer: 'and yet you came through — what helped?' If heavy material surfaces (trauma, abuse, grief, suicidality), slow down, do NOT probe further, name it with care, and if appropriate suggest they also speak with a therapist. You are a coach, not a therapist. C) CLOSING REFLECTION: (10) What did you learn about yourself from this exercise as a whole? By the end the client MUST have named at least one inner resource / strength / quality of their own. Save each resource as a fact memory (e.g. 'has resilience forged in early 20s — learned to reach out for help') so S5 can build on it. Save realizations as realization memories ('I already have X in me'). Co-design homework that invites the client to notice that SAME resource in their current week. Close only when criteria met AND past 45-55 minutes.",
    toolkit: [
      "life_timeline",
      "rising_edge_focus",
      "resource_mining",
      "safety_check",
    ],
    completionCriteria: [
      "S2 homework briefly followed up (anything meaningful saved as memory)",
      "Life timeline rendered and completed across the client's age brackets",
      "Graph read: client named whether story sits more in upper or lower half, and whether their view is more optimistic or pessimistic",
      "At least 2 rising segments identified",
      "At least one rising segment fully explored: what happened, what internal resource helped, what external help was there",
      "Client has NAMED at least one inner resource or strength in their own words (saved as fact memory for S5)",
      "Client has articulated at least one realization about themselves (saved as realization memory)",
      "Client has answered 'what did I learn about myself from this exercise?' in their own words",
      "Homework co-designed and saved as a commitment memory with followUpInSession=4",
      "Session has run at least 45-55 minutes before close",
    ],
    exercises: ["life_timeline"],
    homeworkGuidance:
      "Stage: past-as-resource, not past-as-wound. Two shapes of homework work well here — pick whichever fits the client better. (A) A notice-the-resource practice: 'when you hit something hard this week, pause and ask: what in me has gotten me through something like this before?' — or, if the resource was relational ('I know when to ask for help'), a micro-experiment of using it once. (B) The Yozmot journal practice: ask the client to sit with the exercise for a few days and then write THREE insights about themselves that emerged from the timeline. Tune to what the client seems to need most. Avoid anything that invites rumination on the hard periods themselves.",
  },
  {
    number: 4,
    title: "Dream — from here to where?",
    objective:
      "Help the client create their dream — articulated in their own words, as vivid and detailed as possible. The inner critic and the inner realist are OFF this session. We open the aperture before any narrowing happens in later sessions.",
    approach:
      "Open warmly and briefly follow up on S3's homework (1-2 turns). Save anything meaningful as a memory. Then frame S4 in ONE short turn: 'today is about your dream — and before we can write it, we need to wake up the part of you that knows how to dream. No filters, no realism, no shoulds. Ready?' Then render the dream_archaeology exercise early. This is a playful warm-up questionnaire (silly things to try, useless things to own, places to visit, childhood things you miss, etc.) designed to bypass the inner censor. Tell the client to answer quickly without overthinking — first thing that comes to mind. Once they submit, read their answers: look for PATTERNS — do their 'silly things to try' and 'childhood loves' and 'illogical professions' share a texture? A theme of adventure? Of creativity? Of being seen? Of stillness? Reflect back 1-2 patterns you noticed, one at a time, and ask what they notice. Spend 2-4 turns here — this is priming, not the main event. Then render dream_canvas: a larger exercise where the client writes their dream freely, plus the doing / having / being triad. CRITICAL: the client MUST write their own dream — never paraphrase or write it for them. If they're stuck, offer ONE prompting question at a time ('what does a Tuesday morning look like in that life?' / 'who's with you?' / 'what's the first sound you hear when you wake up?'), then wait for them to keep writing. Don't rush them. When they submit, your job is to go DEEPER into their dream, not to refine or critique it. Work this inquiry arc, ONE question at a time, never chain: (1) What part of this image is most alive for you? What pulls on you the hardest? (2) What surprises you in what you wrote? (3) Any resistance come up while writing — a voice saying 'that's not realistic' or 'I don't deserve that'? Notice it without arguing. (4) Of the DOING / HAVING / BEING — which felt easiest to write, which felt hardest? What does that tell you? (5) If you knew for certain this dream could come true, how would you feel right now? (6) Looking at this image, what is the dream UNDERNEATH the dream — what is it really about for you? (belonging? freedom? mastery? meaning? safety? being seen?). Resist any move toward planning, realism, or 'how would you get there'. That's S8-10's work. Stay in the imagination. Save the dream's essence (what's really underneath it) as a realization memory. Save any BEING qualities as fact memories (these become input for S5 strengths and S6 values). Co-design homework that deepens the dream rather than acts on it. Close only when criteria met AND past 45-55 minutes.",
    toolkit: [
      "dream_archaeology",
      "dream_canvas",
      "doing_having_being",
      "sensory_specificity",
      "dream_underneath",
    ],
    completionCriteria: [
      "S3 homework briefly followed up (anything meaningful saved as memory)",
      "dream_archaeology completed and at least 1-2 patterns reflected back to the client",
      "dream_canvas rendered and client WROTE their own dream with a meaningful description + all three of doing / having / being filled",
      "At least 3 of the dream-deepening questions worked through",
      "Client has named what is most ALIVE in the image for them",
      "Client has named the 'dream underneath the dream' (belonging / freedom / mastery / meaning / safety / being seen / etc.) — saved as realization memory",
      "At least one BEING quality saved as fact memory (feeds S5 strengths and S6 values)",
      "Homework co-designed and saved as commitment memory with followUpInSession=5",
      "Session has run at least 45-55 minutes before close",
    ],
    exercises: ["dream_archaeology", "dream_canvas"],
    homeworkGuidance:
      "Stage: expanding the imagination — NOT acting on it. Homework should deepen the dream in sensory, specific ways without moving toward realism. Tune to what was alive for the client. Example shapes: (A) sensory specifics — 'for the next week, when you have a quiet moment, picture one specific scene from your dream life in detail: Tuesday morning at 7am in that life — what do you see / hear / smell / taste?' (B) BEING practice — take the BEING quality they named (e.g. 'being someone who creates') and find ONE 15-minute window this week to inhabit it in small form. (C) collect-evidence — a Pinterest board, a playlist, a notebook page of images/phrases that belong to their dream. Avoid any homework that looks like a plan or a goal; that's S8-10's work.",
  },
  {
    number: 5,
    title: "Strengths",
    objective:
      "Identify the client's natural strengths — the things they do well that energize them.",
    approach:
      "Ask when they last lost track of time. Ask what others consistently come to them for. Use a strengths card sort. Distinguish strengths (energizing) from skills (competent but draining).",
    toolkit: ["strengths_card_sort", "flow_inquiry", "feedback_loop"],
    completionCriteria: [
      "Top 5 strengths named and owned",
      "Client has at least one concrete example for each",
      "Homework assigned as a commitment memory with followUpInSession=6",
    ],
    exercises: ["strengths_card_sort"],
    homeworkGuidance:
      "Stage: ownership of strengths. Homework should make an abstract strength concrete in lived experience and start nudging the identity shift ('I am someone who...'). Tune to the specific strengths the client named and where they show up in their real life. If one strength felt hard to own, build homework around evidence-gathering for that one.",
  },
  {
    number: 6,
    title: "Values",
    objective:
      "Clarify the values the client wants to live by — not the ones they think they should hold.",
    approach:
      "Values card sort, narrowing 50+ to 10 to 5 to 3. Pressure-test with 'when did you last honor this / betray this?' Values show up in calendar and checkbook, not in self-description.",
    toolkit: ["values_card_sort", "values_stress_test", "behavioral_evidence"],
    completionCriteria: [
      "Top 3-5 values named",
      "Client can give a recent example of living each value and of violating it",
      "Homework assigned as a commitment memory with followUpInSession=7",
    ],
    exercises: ["values_card_sort"],
    homeworkGuidance:
      "Stage: living values, not just naming them. Homework should put one chosen value into contact with the client's actual week — a calendar decision, a boundary, a choice that surfaces the value. Tune to the specific value the client said was hardest to honor right now. Avoid 'live by all your values this week' — pick one, small, observable.",
  },
  {
    number: 7,
    title: "Needs",
    objective:
      "Separate needs (non-negotiables) from wants and shoulds. Notice which are currently unmet.",
    approach:
      "Walk through categories: physical, emotional, relational, intellectual, spiritual. Scale each 1-10 for how met it is right now. Ask what happens when a need goes unmet for too long.",
    toolkit: ["needs_inventory", "scaling_questions", "unmet_needs_signals"],
    completionCriteria: [
      "Needs inventoried across categories",
      "Client identified 1-2 chronically unmet needs",
      "Homework assigned as a commitment memory with followUpInSession=8",
    ],
    exercises: ["needs_scale"],
    homeworkGuidance:
      "Stage: meeting unmet needs experimentally. Homework should address the specific unmet need the client named, with a micro-action the client controls (not one that requires another person's cooperation unless that conversation is itself the experiment). Tune to whether the unmet need is physical, emotional, relational, intellectual, or spiritual — the shape differs.",
  },
  {
    number: 8,
    title: "Goal",
    objective:
      "Convert the work of sessions 2-7 into one concrete, well-formed goal for the remaining sessions.",
    approach:
      "Use SMART + values alignment. The goal must come from the client, connect to their dream, draw on their strengths, honor their values, and address a real need. Test: is it theirs, or someone else's?",
    toolkit: ["smart_goal", "values_alignment_check", "ownership_test"],
    completionCriteria: [
      "One goal stated in writing, specific and time-bound",
      "Explicit link drawn to at least one value and one strength",
      "Homework assigned as a commitment memory with followUpInSession=9",
    ],
    exercises: ["goal_canvas"],
    homeworkGuidance:
      "Stage: letting the goal settle and testing its felt rightness before planning begins. Homework should have the client live with the goal for a week — read it daily, notice resistance, notice energy. If the goal doesn't feel right after a week, we want to know now, before sessions 9-10.",
  },
  {
    number: 9,
    title: "What advances toward the goal",
    objective:
      "Identify resources, allies, habits, and environments that pull the client toward the goal.",
    approach:
      "Force-field analysis — the 'forces for' side. Who helps? What environments make it easier? What past wins can be reused? What is already working that we can amplify?",
    toolkit: ["force_field_analysis", "resource_inventory", "support_map"],
    completionCriteria: [
      "At least 5 advancing forces named",
      "Client identified 1-2 to deliberately amplify",
      "Homework assigned as a commitment memory with followUpInSession=10",
    ],
    exercises: ["force_field"],
    homeworkGuidance:
      "Stage: amplifying what already helps. Homework should involve deliberate engagement with ONE advancing force the client chose to amplify — a person they'll reach out to, an environment they'll spend time in, a practice they'll reactivate. Tune to who/what they specifically named.",
  },
  {
    number: 10,
    title: "What blocks + building a plan",
    objective:
      "Name blockers honestly (external and internal), then design a concrete plan that accounts for them.",
    approach:
      "Complete the force-field: the 'forces against'. Distinguish external obstacles from internal ones (beliefs, fears, habits). Build a weekly plan with first action in next 48 hours. Anticipate the first place it will go wrong.",
    toolkit: [
      "force_field_analysis",
      "limiting_beliefs",
      "weekly_plan",
      "if_then_planning",
    ],
    completionCriteria: [
      "Blockers named, internal vs external",
      "Written plan with next 48-hour action",
      "At least one if-then for the likely first failure",
      "Homework assigned as a commitment memory with followUpInSession=11",
    ],
    exercises: ["force_field", "weekly_plan"],
    homeworkGuidance:
      "Stage: first real traction. Homework IS the 48-hour action plus one more step from the weekly plan. This is the first session where homework directly advances the goal. Tune to what the client wrote in their plan — don't invent new homework, reinforce what they designed. Anticipate failure gently; the if-then they wrote should protect the homework.",
  },
  {
    number: 11,
    title: "Change / integrating behavior change",
    objective:
      "Work with what actually happened since session 10. Reinforce what is sticking, adjust what isn't.",
    approach:
      "Review the week(s). Celebrate small wins explicitly. When something didn't happen, stay curious — was it the plan, the belief under it, or a real-world constraint? Update the plan. Name the identity shift the client is stepping into.",
    toolkit: [
      "after_action_review",
      "habit_stacking",
      "identity_language",
      "celebration",
    ],
    completionCriteria: [
      "Review of actions taken since goal-setting",
      "Plan revised based on what was learned",
      "Client named the shift in identity, not just behavior",
      "Homework assigned as a commitment memory with followUpInSession=12",
    ],
    exercises: ["progress_check"],
    homeworkGuidance:
      "Stage: integration of change into identity. Homework should continue the behavior but with one upgrade — addressing the specific friction or easy-win the client named. Tune to what's actually happening in their life, not the original S10 plan. Also ask them to come to S12 with what they'd tell their session-1 self.",
  },
  {
    number: 12,
    title: "Summary / goodbye",
    objective:
      "Integrate the journey. Leave the client able to coach themselves.",
    approach:
      "Look back at sessions 1-11. What shifted? What stayed? What do they now see that they didn't before? Write a letter from their current self to their session-1 self. Formalize the ending — this matters.",
    toolkit: [
      "journey_review",
      "letter_to_past_self",
      "self_coaching_toolkit",
      "closing_ritual",
    ],
    completionCriteria: [
      "Client can articulate the biggest shift in their own words",
      "Client has a written self-coaching reference to take with them",
      "Relationship is explicitly closed",
    ],
    exercises: ["letter_to_past_self"],
    homeworkGuidance:
      "Stage: closing. There is no next session. Instead of homework-as-commitment, help the client name ONE ongoing practice they'll carry forward (a weekly self-check-in, a monthly review ritual, a reminder of their goal). Save it as a fact/realization memory rather than a commitment — it's a way of being, not a task with a deadline.",
  },
];

export function getSession(n: number): SessionDefinition | undefined {
  return SESSIONS.find((s) => s.number === n);
}
