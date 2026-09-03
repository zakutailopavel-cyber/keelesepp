# KeeleSepp Adaptive Lesson System v1

Status: foundation + focused Lesson Mode prototype

## Purpose

KeeleSepp should not treat a curriculum lesson as a static plan. The system should help any teacher deliver the same pedagogical goal while adapting support and challenge to the learner's actual performance.

The core rule is:

> lesson attendance is not mastery.

A lesson may be completed for calendar/accounting purposes while one or more learning outcomes still require targeted review.

## Pedagogical contract

Each adaptive lesson has one shared goal and three routes inside the same CEFR/category lesson:

- `support` — more scaffolding, smaller active set, visible models, guided choices;
- `core` — expected route for the lesson category;
- `advanced` — reduced scaffolding, transfer, justification, unexpected variation.

These are not CEFR levels. A B1 lesson remains B1 on all three routes. The route changes support, independence and transfer demand, not the course level.

The learner is never permanently labelled by one diagnostic result. Support may change after every meaningful task.

## Teacher UX contract — Lesson Mode

The live lesson is a **focus mode**, not a CRM dashboard.

When a lesson is running, normal CRM navigation, reports, settings and unrelated management controls must disappear from the primary screen. The teacher should not need to understand the adaptive algorithm.

The top bar contains only essential context: lesson, student, elapsed time, a small current-route indicator and lesson finish action.

### One activity at a time

The centre of the screen must visually dominate. It answers only:

- what should happen now;
- what the teacher says/shows;
- what an acceptable answer/direction may look like;
- optional teacher help, hidden by default;
- how the learner handled the task;
- what happens next.

Long stage descriptions, analytics, summaries and permanent recommendation panels do not belong in the live flow.

### The shell is stable; the workspace is not

Lesson Mode must not force every phase into one permanent card/scene layout. The stable shell is only:

1. essential top context;
2. compact phase navigation;
3. the current activity workspace;
4. progressive teacher tools;
5. lesson finish action.

The current workspace changes according to pedagogical purpose. Supported target workspace types are:

- `diagnostic`;
- `vocabulary`;
- `controlled_practice`;
- `scene`;
- `roleplay`;
- `transfer`;
- `assessment`;
- `summary`.

A scene/image is one Content Engine tool, not a universal requirement. Vocabulary activation may use word cards; controlled practice may use sentence building; roleplay may use role cards; transfer should deliberately introduce a materially new situation.

The full contract and roadmap live in `docs/KEELESEPP_CORE_BLUEPRINT.md`.

### Teacher judgement

The primary adaptive input is deliberately simple:

- **Vajab abi / Needs help** — increase scaffolding;
- **Sai hakkama / Managed** — keep the current support level;
- **Liiga kerge / Too easy** — reduce scaffolding and increase independence/transfer.

The system may calculate numerical evidence internally, but percentage, attempts, hint counters and mastery tables must not dominate the live teaching screen.

A route change should be communicated as a short transient notice, not a permanent analytics block.

### Methodical help is progressive disclosure

Teacher instructions, success criteria, examples and methodological notes are available on demand through a small **Õpetaja abi** control. They stay hidden until needed.

Detailed mastery entry is only available in the final lesson summary. An unassessed skill remains absent/null, never `0`.

### Vocabulary during the lesson

Only the vocabulary relevant to the current activity should dominate the workspace. The full lesson list remains one click away. A teacher may mark exact words as difficult or known; unmarked vocabulary remains unassessed.

## Scene contract

Reusable lesson scenes are non-sensitive teaching assets and may live in Firebase Storage behind stable `sceneId` metadata.

A scene should contain:

- stable `sceneId`;
- stable Storage path;
- alt text;
- pedagogical purpose;
- optional target/focus vocabulary IDs.

Final lesson visuals must not use emoji placeholders.

A scene should support the intended language output without revealing an answer that the current phase is supposed to diagnose or assess. In particular:

- diagnostic visuals must not contain the target answer or an obvious textual cue;
- Support may expose more visual/verbal scaffolding;
- Core should remove unnecessary answer cues;
- Advanced should increase independence and/or transfer demand;
- transfer requires a materially changed context rather than simply repeating the same scene.

The same scene may be reused across route variants of one communicative activity when the task changes but the context remains pedagogically valid. It should not be reused across the entire lesson merely because it exists.

## Required lesson blueprint

Every adaptive lesson should contain:

- immutable lesson id;
- subject, CEFR/category placement and duration;
- teacher-facing goal and measurable success criteria;
- prerequisites;
- lesson-specific vocabulary;
- language/grammar focus;
- diagnostic items;
- at least three teaching stages;
- all three routes inside every stage;
- workspace type for each activity/phase;
- checkpoint/scoring rule where appropriate;
- homework variants;
- mastery policy;
- teacher handoff requirements.

The lesson must be autonomous enough that a qualified teacher who did not author it can conduct it without hidden context.

## Vocabulary and mastery

Vocabulary belongs to the concrete lesson, not only the broad topic. Each item should have a stable id and may contain word/phrase, translation, example and later a dictionary link or grammar note.

Only skills actually assessed should receive mastery values. Supported foundation dimensions are vocabulary, grammar, reading, listening, speaking and writing. Transfer may be tracked as a lesson-defined cross-skill evidence dimension where appropriate. Missing evidence is not failure.

A high overall average must not automatically allow progression when a lesson-defined critical skill remains below threshold.

The existing `students.skillMap` remains the canonical current skill-mastery projection. Adaptive sessions should add evidence and update that projection through a validated persistence boundary rather than creating a competing mastery source.

## Route recommendation

The pure core keeps deterministic numerical functions for diagnostic/stage evidence and later analytics. Lesson Mode adds a semantic teacher layer on top:

- needs help → move toward support;
- managed → keep the current route;
- too easy → move toward advanced.

The lesson goal and CEFR placement never change because of the route.

Target evolution is per-skill/per-phase routing. For example, vocabulary may run on Advanced while speaking remains Support inside the same B1 lesson.

## Learning Session and evidence

The target runtime boundary is a dedicated **Learning Session** connecting student, teacher, lesson blueprint, curriculum goal IDs, current phase, route-by-skill and evidence.

The session must keep pedagogical state separate from schedule/accounting status. Completion does not by itself produce mastery.

Evidence should explain why mastery changed and should include the relevant phase/activity, skills, route, teacher judgement/task result and support used. Completed evidence should be append-only or correction-only rather than silently rewritten.

The complete proposed contracts are defined in `docs/KEELESEPP_CORE_BLUEPRINT.md`. No production persistence schema is created merely by documenting that target.

## Teacher handoff

At lesson end the system must create a compact educational handoff containing student/lesson identity, final route context, assessed mastery, weak skills, exact vocabulary needing review, teacher note, recommended next action and next lesson/goal when known.

## Reference implementation

`adaptive-lessons/est-b1-city-problem-solving.js` is the first B1 reference blueprint.

`adaptive-lesson-core.js` provides pure decision/mastery/handoff logic.

`haldus-adaptive-lesson/index.html` is the current focused Lesson Mode prototype. It keeps session state local and does not write to Firestore.

`adaptive-lessons/scenes.js` resolves stable scene metadata and Firebase Storage URLs for the current reference lesson.

## Integration boundary

Do not replace curriculum, lesson accounting or Live Classroom in one change. Safe order:

1. prove the blueprint and decision model;
2. prove focused Lesson Mode and phase-specific workspaces;
3. expose one selected student's Learning Profile read-only;
4. add dedicated adaptive session/evidence persistence after the profile/read model is accepted;
5. project final summary into the existing canonical `students.skillMap` through validated rules/transactions;
6. connect curriculum goal recommendations;
7. migrate selected curriculum lessons only after the vertical flow is stable.

Calendar and finance continue using their existing lesson status. Pedagogical mastery remains separate.

## Acceptance criteria before broad curriculum migration

- a teacher can run the reference lesson without author context;
- the current task is visually dominant;
- unrelated CRM navigation is absent while teaching;
- technical scoring is hidden from the live flow;
- the workspace changes with the pedagogical phase instead of forcing one layout on the whole lesson;
- images/scenes appear only where they support the task and do not reveal diagnostic/assessment answers;
- support can change without changing CEFR/category;
- missing skill scores are not converted to zero;
- vocabulary review identifies exact words;
- the next teacher receives an actionable handoff;
- existing curriculum lessons continue working unchanged;
- automated tests cover the decision core and Lesson Mode contract;
- project state is updated after every substantial implementation step.
