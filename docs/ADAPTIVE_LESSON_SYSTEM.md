# KeeleSepp Adaptive Lesson System v1

Status: foundation + teacher-first UX prototype

## Purpose

KeeleSepp should not treat a curriculum lesson as a static plan. The system should help any teacher deliver the same pedagogical goal while adapting support and challenge to the learner's actual performance.

The core rule is:

> lesson attendance is not mastery.

A lesson may be marked as completed for calendar/accounting purposes while one or more learning outcomes remain below the mastery threshold.

## Pedagogical contract

Each adaptive lesson has one shared goal and three routes inside the same CEFR/category lesson:

- `support` — more scaffolding, smaller active set, visible models, guided choices;
- `core` — expected route for the lesson category;
- `advanced` — reduced scaffolding, transfer, justification, unexpected variation.

These are not CEFR levels. A B1 lesson remains B1 on all three routes. The route only changes the amount of support, independence and transfer demand.

The teacher can change route between lesson stages. A learner is never permanently labelled by the first diagnostic result.

## Teacher UX contract

The teacher must be able to run the lesson without understanding the adaptive algorithm.

The main lesson screen therefore behaves like an **interactive teacher textbook + control panel**, not an analytics form.

The primary desktop layout is:

1. compact school navigation rail;
2. lesson stages on the left;
3. one current teaching activity in the large centre workspace;
4. active vocabulary and teacher tools on the right.

The teacher sees the current student, lesson goal, time and current route in the header. Large unused margins should be avoided on normal desktop screens.

### Teacher judgement

The primary interaction after a diagnostic item or lesson stage is deliberately simple:

- **Vajab abi / Needs help** — increase scaffolding;
- **Sai hakkama / Managed** — keep expected difficulty;
- **Liiga kerge / Too easy** — reduce scaffolding and increase transfer demand.

The system may internally calculate scores, confidence, attempts, hints or other evidence, but those technical fields must not dominate the live teaching screen. Detailed mastery remains available at lesson completion and in later reporting.

### One decision at a time

Diagnostic items are shown one at a time. Each view should clearly answer:

- what the teacher asks or shows;
- what an acceptable answer may look like;
- what support may be revealed if needed;
- how the teacher evaluates the response;
- what happens next.

The same principle applies to teaching stages: teacher instruction, student task, optional support, success criterion, then one simple stage judgement.

### Vocabulary during the lesson

Lesson-specific vocabulary remains visible while teaching. A teacher may mark exact words as difficult or known. This is evidence for the final handoff; an unmarked word is unassessed, not failed.

## Required lesson blueprint

Every lesson should contain:

- immutable lesson id;
- subject, CEFR/category placement and duration;
- teacher-facing goal and measurable success criteria;
- prerequisites;
- lesson-specific vocabulary;
- language/grammar focus;
- diagnostic items;
- at least three teaching stages;
- all three routes inside every stage;
- checkpoint/scoring rule per stage where appropriate;
- homework variants;
- mastery policy;
- teacher handoff requirements.

The lesson must be autonomous enough that a qualified teacher who did not author it can conduct it without hidden context.

## Vocabulary model

Vocabulary belongs to the concrete lesson, not only to the broad topic.

Each vocabulary item should have a stable id and may contain word/phrase, translation, example, dictionary link and later tags or grammar notes.

Student evidence is stored per word. Recommended v1 interpretation:

- `>=85` — mastered;
- `65–84` — learning;
- `<65` — needs review.

Missing evidence is not the same as a zero score.

## Mastery model

Supported skill dimensions in the foundation core:

- vocabulary;
- grammar;
- reading;
- listening;
- speaking;
- writing.

Only skills actually assessed should receive a value. Unassessed skills must be absent/null, never `0`.

The foundation calculates an overall score from assessed skills and keeps weak/strong dimensions separately. A high average does not automatically allow progression if a lesson-defined critical skill is below threshold.

## Route recommendation

### Initial route

Diagnostic performance is the dominant signal and previous mastery may be a secondary signal. Foundation numerical defaults remain available in the core for deterministic calculation and later analytics.

The live teacher UI may translate diagnostic evidence into the three teacher judgements rather than requiring manual point entry.

### Stage-level adjustment

The pure core supports numerical stage evidence. The teacher-first UI adds a semantic layer:

- `needs help` → move one step toward support;
- `managed` → keep current route;
- `too easy` → move one step toward advanced.

A route can change after every stage. The lesson goal and CEFR placement never change because of the route.

## Teacher handoff

At lesson end the system must create a compact handoff for the next teacher containing at least:

- student id;
- lesson key/title;
- final/last route;
- mastery by assessed skill;
- weak skills;
- exact vocabulary needing review;
- teacher note;
- recommended next action;
- next lesson key when known.

This handoff is educational state, not free-form diary text only.

## Reference lesson

`adaptive-lessons/est-b1-city-problem-solving.js` is the first reference blueprint. It demonstrates a short diagnostic, a lesson-specific 12-word vocabulary set, three route variants, speaking transfer, exit assessment, differentiated homework and an explicit mastery policy.

This reference remains outside the generated curriculum dataset until the model and teacher UI are accepted.

## Code foundation

`adaptive-lesson-core.js` currently provides pure functions for diagnostic scoring, initial route recommendation, stage route adjustment, skill mastery, word-level vocabulary status, progression decision, teacher handoff and blueprint validation.

`haldus-adaptive-lesson/index.html` is the teacher-first prototype. It currently keeps the session local and does not write to Firestore.

## Integration boundary

Do not replace the existing curriculum, lesson accounting or Live Classroom structures in one change.

Recommended integration order:

1. prove the lesson blueprint and decision model with one reference lesson;
2. prove the teacher-facing adaptive lesson run screen;
3. connect one selected CRM student and one reference lesson in read-only mode;
4. persist a dedicated adaptive lesson session/evidence record only after the interaction model is accepted;
5. project the final summary into the existing curriculum journey;
6. only then migrate selected curriculum lessons into adaptive blueprints.

Calendar and finance continue using their existing lesson status. Mastery must be stored separately so accounting cannot be changed by pedagogical scoring.

## Proposed persistence model (not implemented yet)

A later implementation may use `adaptiveLessonSessions/{sessionId}` for session metadata and append-only `adaptiveLessonEvidence/{evidenceId}` for stage/skill/word evidence. Raw evidence should remain the audit source and a final session summary may cache calculated mastery/handoff for fast teacher access.

No Firestore schema/rule change is included in the current UI work.

## Acceptance criteria before broad curriculum migration

- one teacher can run the reference lesson from start to finish without author context;
- the main screen is understandable without knowledge of scoring algorithms;
- route can change between stages without changing CEFR/category;
- missing skill scores are not converted to zero;
- vocabulary review identifies exact words;
- a conducted lesson can still require targeted review;
- next teacher receives actionable handoff;
- old curriculum lessons continue working unchanged;
- automated tests cover the decision core and teacher UI contract;
- project state is updated after every substantial implementation step.
