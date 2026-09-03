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

Desktop Lesson Mode has only three persistent zones:

1. compact lesson stages on the left;
2. one current teaching activity in the large centre workspace;
3. a small current-vocabulary/tool strip on the right.

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

Only the first 5–6 active words should be visible by default. The full list is one click away. A teacher may mark exact words as difficult or known; unmarked vocabulary remains unassessed.

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
- checkpoint/scoring rule where appropriate;
- homework variants;
- mastery policy;
- teacher handoff requirements.

The lesson must be autonomous enough that a qualified teacher who did not author it can conduct it without hidden context.

## Vocabulary and mastery

Vocabulary belongs to the concrete lesson, not only the broad topic. Each item should have a stable id and may contain word/phrase, translation, example and later a dictionary link or grammar note.

Only skills actually assessed should receive mastery values. Supported foundation dimensions are vocabulary, grammar, reading, listening, speaking and writing. Missing evidence is not failure.

A high overall average must not automatically allow progression when a lesson-defined critical skill remains below threshold.

## Route recommendation

The pure core keeps deterministic numerical functions for diagnostic/stage evidence and later analytics. Lesson Mode adds a semantic teacher layer on top:

- needs help → move toward support;
- managed → keep the current route;
- too easy → move toward advanced.

The lesson goal and CEFR placement never change because of the route.

## Teacher handoff

At lesson end the system must create a compact educational handoff containing student/lesson identity, final route, assessed mastery, weak skills, exact vocabulary needing review, teacher note, recommended next action and next lesson when known.

## Reference implementation

`adaptive-lessons/est-b1-city-problem-solving.js` is the first B1 reference blueprint.

`adaptive-lesson-core.js` provides pure decision/mastery/handoff logic.

`haldus-adaptive-lesson/index.html` is the current focused Lesson Mode prototype. It keeps session state local and does not write to Firestore.

## Integration boundary

Do not replace curriculum, lesson accounting or Live Classroom in one change. Safe order:

1. prove the blueprint and decision model;
2. prove focused Lesson Mode;
3. connect one selected CRM student and one reference lesson read-only;
4. add dedicated adaptive session/evidence persistence after UX approval;
5. project final summary into the curriculum journey;
6. migrate selected curriculum lessons only after the vertical flow is stable.

Calendar and finance continue using their existing lesson status. Pedagogical mastery remains separate.

## Acceptance criteria before broad curriculum migration

- a teacher can run the reference lesson without author context;
- the current task is visually dominant;
- unrelated CRM navigation is absent while teaching;
- technical scoring is hidden from the live flow;
- support can change without changing CEFR/category;
- missing skill scores are not converted to zero;
- vocabulary review identifies exact words;
- the next teacher receives an actionable handoff;
- existing curriculum lessons continue working unchanged;
- automated tests cover the decision core and Lesson Mode contract;
- project state is updated after every substantial implementation step.
