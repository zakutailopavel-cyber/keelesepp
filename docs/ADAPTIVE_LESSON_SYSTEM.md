# KeeleSepp Adaptive Lesson System v1

Status: foundation / draft implementation

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

Each vocabulary item should have a stable id and may contain:

- word/phrase;
- translation;
- example;
- dictionary link;
- tags or grammar note later.

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

Example:

- vocabulary 100;
- grammar 69;
- reading 100;
- speaking 74;
- writing 100;
- overall 89.

If grammar and speaking are critical at threshold 75, progression is blocked and the next session starts with targeted review.

## Route recommendation

### Initial route

The foundation uses diagnostic performance as the dominant signal and may blend previous mastery as a secondary signal.

Default bands:

- below 45 → support;
- 45–81 → core;
- 82+ → advanced.

Low-confidence diagnostic evidence widens the core band so the system does not overreact to weak evidence.

### Stage-level adjustment

After each stage the teacher/system may recommend a new route.

Foundation rules:

- score below 55, 3+ attempts, or 3+ hints → support;
- score 90+ on first attempt without hints → advanced;
- otherwise → core.

These values are decision defaults, not immutable pedagogy. Later they should be configurable by lesson/category.

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

`adaptive-lessons/est-b1-city-problem-solving.js` is the first reference blueprint.

It demonstrates:

1. short diagnostic;
2. lesson-specific 12-word vocabulary set;
3. support/core/advanced variants for vocabulary activation;
4. support/core/advanced variants for polite problem explanation;
5. speaking transfer with unexpected complications;
6. exit assessment;
7. differentiated homework;
8. explicit mastery policy.

This reference is intentionally kept outside the existing generated curriculum dataset until the model and teacher UI are accepted.

## Code foundation

`adaptive-lesson-core.js` currently provides pure functions for:

- diagnostic scoring;
- initial route recommendation;
- stage route adjustment;
- skill mastery calculation;
- word-level vocabulary status;
- progression decision;
- teacher handoff generation;
- blueprint structural validation.

The core has no Firestore writes, no production side effects and no external API calls.

## Integration boundary

Do not replace the existing curriculum, lesson accounting or Live Classroom structures in one change.

Recommended integration order:

1. prove the lesson blueprint and decision model with one reference lesson;
2. add a teacher-facing adaptive lesson preview/run screen in CRM;
3. persist a dedicated adaptive lesson session/evidence record;
4. project the final summary into the existing curriculum journey;
5. only then migrate selected curriculum lessons into adaptive blueprints.

Calendar and finance should continue using their existing lesson status. Mastery must be stored separately so accounting cannot be changed by pedagogical scoring.

## Proposed persistence model (not implemented yet)

Suggested collections/records for a later PR:

### `adaptiveLessonSessions/{sessionId}`

- `studentId`
- `teacherUid`
- `lessonKey`
- `curriculumTopicId`
- `curriculumLessonIndex`
- `startedAt`
- `completedAt`
- `initialRoute`
- `finalRoute`
- `status`
- `schemaVersion`

### `adaptiveLessonEvidence/{evidenceId}`

Immutable or append-only evidence rows:

- `sessionId`
- `stageId`
- `skill`
- `score`
- `max`
- `attempts`
- `hintCount`
- `wordEvidence` when relevant
- `teacherUid`
- `createdAt`

### final handoff projection

A final session summary may cache the calculated mastery and handoff for fast teacher access, but raw evidence should remain the audit source.

No Firestore schema/rule change is included in the foundation branch yet.

## Acceptance criteria before broad curriculum migration

- one teacher can run the reference lesson from start to finish without author context;
- route can change between stages without changing CEFR/category;
- missing skill scores are not converted to zero;
- vocabulary review identifies exact words;
- a conducted lesson can still require targeted review;
- next teacher receives actionable handoff;
- old curriculum lessons continue working unchanged;
- automated tests cover the decision core;
- project state is updated after every substantial implementation step.
