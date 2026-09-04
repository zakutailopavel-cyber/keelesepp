# KeeleSepp Adaptive Lesson System v1

Status: foundation + persisted Learning Session/evidence loop + Learning Profile projection + phase-specific Lesson Mode workspace slice in PR #88

## Purpose

KeeleSepp must not treat a curriculum lesson as a static plan. The system should help any qualified teacher deliver the same pedagogical goal while adapting support and challenge to the learner's actual performance.

Core rule:

> lesson attendance is not mastery.

A lesson may be completed for calendar/accounting purposes while one or more learning outcomes still require targeted review.

## Pedagogical contract

Each adaptive lesson has one shared goal and three routes inside the same CEFR/category lesson:

- `support` — more scaffolding, smaller active set, visible models and guided choices;
- `core` — expected route for the lesson category;
- `advanced` — reduced scaffolding, more independence, transfer and justification.

These routes are not CEFR levels. A B1 lesson remains B1 on all routes. The route changes support, independence and transfer demand, not the programme level.

A learner is never permanently labelled by one result. Support may change after every meaningful task and, later, independently by skill.

## Teacher UX contract — Lesson Mode

Lesson Mode is a teaching focus mode, not a CRM dashboard.

The stable shell contains only:

1. essential lesson/student context;
2. elapsed time;
3. current route and persistence status;
4. compact phase navigation;
5. current activity workspace;
6. progressive teacher tools;
7. lesson finish action.

Normal CRM reports/settings do not belong in the live teaching flow.

### One activity at a time

The centre of the screen must answer:

- what should happen now;
- what the learner should produce/do;
- what the teacher needs to do;
- optional support, hidden unless pedagogically appropriate;
- how the learner handled the activity;
- what happens next.

Technical scoring and long analytics must not dominate the live screen.

### Stable shell, variable workspace

A lesson is not one screen repeated with different text.

Canonical workspace types:

- `diagnostic`;
- `vocabulary`;
- `controlled_practice`;
- `scene`;
- `roleplay`;
- `transfer`;
- `assessment`;
- `summary`.

The phase-specific renderer in PR #88 is the first implementation of this contract for the B1 city/problem-solving reference lesson.

Current reference mapping:

- diagnostic -> `diagnostic`;
- vocabulary activation -> `vocabulary`;
- problem/language formulation -> `controlled_practice`;
- first speaking activity -> `roleplay`;
- second speaking activity -> `transfer`;
- exit task -> `assessment`;
- explicit lesson close -> `summary`.

`scene` remains available for an activity with an exact relevant visual, but an image is no longer a permanent part of every workspace.

The implementation details and acceptance gate are in `docs/LESSON_WORKSPACES_MVP.md`.

## Workspace semantics

### Diagnostic

Purpose: obtain an initial observation without teaching the answer first.

Rules:

- no answer-bearing image;
- no visible answer model before the learner responds;
- no word bank unless the diagnostic explicitly measures supported performance;
- teacher may reveal the check answer only after the response.

The previous universal bus scene violated this contract because it visibly contained `hilineb` during a task asking the learner to produce that language. PR #88 removes the universal scene from diagnostic.

### Vocabulary

Purpose: activate/recall lesson-specific vocabulary.

Rules:

- use word cards or another vocabulary-native representation;
- Support may show translation/example and a smaller active set;
- Core shows the expected active set with limited on-demand scaffolding;
- Advanced uses the broader active set without translations;
- exact difficult/known word marks may be persisted as evidence;
- unmarked words remain unassessed.

### Controlled practice

Purpose: practise language form/function with controlled scaffolding.

Rules:

- sentence/function/pattern structure may be visible on Support/Core;
- Advanced removes unnecessary language templates;
- this workspace should support construction/reformulation rather than pretending every task is a scene.

### Scene

Purpose: use a visual or contextual asset when it materially supports the intended language output.

Rules:

- exact activity/stage asset only;
- no global/default scene fallback;
- scene must not reveal an answer that the phase is intended to diagnose/assess;
- stable `sceneId`/Storage metadata may be used for reusable non-sensitive assets.

### Roleplay

Purpose: conduct a communicative exchange.

Rules:

- student and teacher roles are distinct;
- Support may expose conversational steps;
- Core exposes the goal with minimal structure;
- Advanced may introduce a complication and require negotiation/justification;
- teacher should respond in role rather than read a static answer model.

### Transfer

Purpose: prove that the skill transfers to a materially changed context.

Rules:

- new situation must differ from the practised situation;
- previous answer model is hidden;
- the learner must apply the same target function without merely copying the previous response;
- Support may expose process steps, but not the solution itself.

### Assessment

Purpose: collect explicit final evidence.

Rules:

- no answer model before performance;
- criteria may be visible if they do not expose the answer;
- only actually assessed skills receive values;
- missing evidence stays absent/null, never `0`.

### Summary

Purpose: finish the pedagogical session and create a teacher handoff.

Rules:

- detailed mastery entry belongs here, not in the live task workspace;
- blank skill fields remain absent;
- teacher note/handoff is explicit;
- session completion does not itself mean mastery.

## Teacher judgement

The primary live adaptive input remains deliberately simple:

- **Vajab abi / Needs help** -> increase scaffolding;
- **Sai hakkama / Managed** -> keep the current support level;
- **Liiga kerge / Too easy** -> reduce scaffolding and increase independence/transfer.

Canonical persisted values:

- `needs_help`;
- `managed`;
- `too_easy`.

A route change is a teaching decision, not a CEFR change.

## Methodical help

Teacher instructions, success criteria, examples and methodological notes use progressive disclosure.

Diagnostic and assessment keep the check answer hidden until the teacher explicitly opens the control after the learner has responded.

## Required lesson blueprint

Every mature adaptive lesson should contain:

- immutable lesson id;
- subject, CEFR/category and duration;
- teacher-facing goal and measurable success criteria;
- prerequisites;
- lesson-specific vocabulary;
- language/grammar focus;
- diagnostic items with evidence skill mapping;
- teaching stages;
- all route variants;
- stable activity/task IDs;
- explicit workspace type for each activity/phase;
- checkpoint/scoring rule where appropriate;
- homework variants;
- mastery policy;
- handoff requirements.

The lesson must be autonomous enough for a qualified teacher who did not author it.

## Vocabulary and mastery

Vocabulary belongs to the concrete lesson, not only the broad topic.

Supported foundation mastery dimensions are vocabulary, grammar, reading, listening, speaking and writing. Transfer may be tracked as a lesson-defined cross-skill evidence dimension later.

Only skills actually assessed should receive mastery values. Missing evidence is not failure.

`students.skillMap` remains the canonical current mastery projection. Adaptive sessions currently add evidence first; the Learning Profile displays that evidence without silently rewriting `skillMap`.

A separately validated projection boundary is required before adaptive evidence may update canonical mastery.

## Route recommendation

Current teacher-facing route semantics:

- needs help -> move toward Support;
- managed -> keep current route;
- too easy -> move toward Advanced.

The target next implementation slice is deterministic per-skill Adaptive Engine v1, where vocabulary may be Advanced while speaking remains Support inside the same B1 lesson.

## Learning Session and evidence

A dedicated Learning Session is the persisted runtime boundary for the reference lesson.

It connects:

- student and teacher identity;
- lesson blueprint identity;
- current phase/activity/index;
- current route and `routeBySkill` context;
- evidence count and assessed skill IDs;
- final teacher note/handoff;
- active/completed state.

It is pedagogical runtime state and remains separate from schedule/accounting lesson status.

### Evidence semantics

Current append-only evidence kinds:

- `teacher_judgement`;
- `vocabulary_mark`;
- `summary_score`.

Each event keeps session/student/teacher/lesson identity, phase/activity, relevant skills, optional vocabulary IDs, route, evidence payload and timestamp.

Navigation/progress is not evidence.

Once a session is completed, new evidence additions are rejected.

### Trusted persistence boundary

Browser Lesson Mode does not receive direct Firestore write permission for `learningSessions` or `learningEvidence`.

`learning-session-store.js` authenticates to `learningSessionApi`. The Cloud Function validates:

- Firebase ID token;
- teacher/admin role;
- teacher/student scope;
- supported reference lesson;
- route/index/input bounds;
- request-id idempotency;
- active session state.

Firebase Admin SDK performs writes.

The Firestore student document path is authoritative for identity; a stored `id` field cannot redirect session ownership.

## Learning Profile projection

`learningProfileEvidenceApi` is the trusted read boundary for adaptive evidence.

Learning Profile combines:

- canonical `students.skillMap`;
- structured Live Classroom summaries;
- append-only Adaptive Lesson evidence.

It may surface recent exact words needing review, but evidence does not automatically become mastery.

Direct browser reads of the private adaptive evidence/session collections remain denied.

## Start / resume

Opening Lesson Mode with `?studentId=<id>` and an authenticated staff user starts or resumes the active session for teacher + student + reference lesson.

Without `studentId`, Lesson Mode stays in Preview and remains non-persistent.

## Lesson close and handoff

`Lõpeta tund` opens Summary; it does not mark mastery or complete persistence by itself.

The teacher explicitly creates the handoff. Only entered summary scores become `summary_score` evidence. Blank skills stay absent.

The completed session retains the teacher note/handoff for later read-side use.

## Reference implementation

- `adaptive-lessons/est-b1-city-problem-solving.js` — first B1 reference blueprint; now includes explicit workspace metadata.
- `adaptive-lesson-core.js` — original pure diagnostic/mastery/handoff logic.
- `lesson-workspace-core.js` — pure phase/workspace projection and route-aware view-model logic.
- `learning-session-core.js` — pure Learning Session/evidence normalization helpers.
- `learning-session-store.js` — authenticated browser client for persistence.
- `functions/learning-session-api.js` — trusted session/evidence writer.
- `learning-profile-evidence-store.js` + `functions/learning-profile-evidence-api.js` — trusted adaptive-evidence read projection.
- `haldus-adaptive-lesson/index.html` — focused live teaching shell with phase-specific workspace renderers.
- `adaptive-lessons/scenes.js` — exact scene metadata registry; no longer a universal Lesson Mode background.

## Integration boundary

Do not replace curriculum, accounting/calendar status or Live Classroom in one change.

Safe evolution:

1. prove blueprint/decision model — done;
2. prove focused Lesson Mode shell — done;
3. expose Learning Profile read-only — done;
4. persist Learning Session/evidence — done;
5. project adaptive evidence into Learning Profile — done;
6. phase-specific workspace renderer — current PR #88;
7. deterministic per-skill Adaptive Engine v1;
8. curriculum goal/prerequisite graph;
9. Teacher Home vertical flow;
10. normalize Lesson Builder/Content Engine around stable activity IDs;
11. AI-assisted generation only after the deterministic loop is stable.

## Acceptance criteria before broad curriculum migration

- teacher can run the reference lesson without author context;
- current activity is visually dominant;
- unrelated CRM navigation is absent;
- technical scoring is hidden from live flow;
- workspace changes with pedagogical purpose;
- diagnostic and assessment do not leak answers;
- images appear only when they materially support the activity;
- Support/Core/Advanced change scaffolding without changing CEFR;
- teacher judgements and exact vocabulary marks persist for a real student;
- repeated evidence requests are idempotent;
- navigation does not create evidence;
- completed sessions reject new evidence;
- missing skill scores are not converted to zero;
- `students.skillMap` is not silently changed;
- Learning Profile can show append-only evidence/context;
- existing curriculum lessons remain working;
- automated tests cover decision, workspace, persistence and read-side boundaries;
- project state is updated after each substantial slice.

## Known current limitation

The legacy reference blueprint still uses Core task positions as stable activity slots. Route variants with different numbers of activities are therefore not yet fully normalized. The later Content Engine normalization slice must introduce stable activity IDs shared across all route variants before broad lesson-authoring/migration.