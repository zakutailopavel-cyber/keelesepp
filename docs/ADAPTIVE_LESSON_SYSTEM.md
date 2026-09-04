# KeeleSepp Adaptive Lesson System v1

Status: foundation + persisted Learning Session/evidence loop + Learning Profile projection + phase-specific Lesson Mode + per-skill Adaptive Engine + Curriculum Goal graph + Teacher Home flow are merged through #92. PR #93 adds the second supported Lesson Mode blueprint for the first vocabulary goal.

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

A learner is never permanently labelled by one result. Support may change after every meaningful task and independently by skill. One active Learning Session may therefore hold Vocabulary Advanced, Grammar Core and Speaking Support at the same time.

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

Canonical workspace types:

- `diagnostic`;
- `vocabulary`;
- `controlled_practice`;
- `scene`;
- `roleplay`;
- `transfer`;
- `assessment`;
- `summary`.

The shell is shared by the supported blueprints. The lesson blueprint decides which workspace is used for each stable activity slot.

Current mappings include:

- diagnostic -> `diagnostic`;
- vocabulary activation -> `vocabulary`;
- lexical/language formulation -> `controlled_practice`;
- communicative activity -> `roleplay`;
- materially changed context -> `transfer`;
- final evidence task -> `assessment`;
- explicit lesson close -> `summary`.

`scene` is used only when an exact relevant visual materially supports the target output. There is no universal scene fallback.

The workspace implementation details are in `docs/LESSON_WORKSPACES_MVP.md`.

## Workspace semantics

### Diagnostic

Purpose: obtain an initial observation without teaching the answer first.

Rules:

- no answer-bearing image;
- no visible answer model before the learner responds;
- no word bank unless the diagnostic explicitly measures supported performance;
- teacher may reveal the check answer only after the response.

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

Purpose: practise language form/function or lexical combinations with controlled scaffolding.

Rules:

- patterns may be visible on Support/Core;
- Advanced removes unnecessary templates;
- the learner must construct/reformulate rather than only recognise an answer.

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
- teacher responds in role rather than reading a static answer model.

### Transfer

Purpose: prove that the target skill or vocabulary transfers to a materially changed context.

Rules:

- new situation differs from the practised situation;
- previous answer model is hidden;
- the learner applies the same target without copying the previous response;
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
- summary fields are derived from skills actually targeted by the selected lesson;
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

## Required lesson blueprint

Every mature adaptive lesson should contain:

- immutable lesson id;
- subject, CEFR/category and duration;
- stable curriculum goal IDs;
- teacher-facing goal and measurable success criteria;
- prerequisites;
- lesson-specific vocabulary;
- language/lexical/grammar focus where relevant;
- diagnostic items with evidence skill mapping;
- teaching stages;
- all route variants;
- stable activity/task slots;
- explicit workspace type for each activity/phase;
- checkpoint/scoring rule where appropriate;
- homework variants;
- mastery policy;
- handoff requirements.

The lesson must be autonomous enough for a qualified teacher who did not author it.

## Supported blueprints in PR #93

### `est-b1-city-vocabulary-01`

Curriculum target: `EST_B1_CITY_VOCAB` — `Linnaprobleemide põhisõnavara aktiveerimine`.

Purpose: activate the core city/service/problem vocabulary before the learner is expected to explain and solve a full city problem.

It contains:

- answer-safe vocabulary diagnostic;
- vocabulary-native activation workspace;
- lexical/collocation controlled practice;
- roleplay plus a genuinely changed transfer situation;
- final vocabulary-only assessment;
- Support/Core/Advanced variants with the same stable task-slot count;
- vocabulary-only summary score field plus handoff.

### `est-b1-city-problem-solving-01`

Curriculum target: `EST_B1_CITY_SOLVE_PROBLEM`.

Purpose: combine problem explanation, help-seeking and solution proposal into one B1 communication task.

This remains the broader reference lesson and continues to target vocabulary, grammar and speaking evidence where explicitly assessed.

## Vocabulary and mastery

Vocabulary belongs to the concrete lesson, not only the broad topic.

Supported foundation mastery dimensions are vocabulary, grammar, reading, listening, speaking and writing. Transfer may be tracked as a lesson-defined cross-skill evidence dimension later.

Only skills actually assessed should receive mastery values. Missing evidence is not failure.

`students.skillMap` remains the canonical current mastery projection. Adaptive sessions add evidence and adaptive route state first; Learning Profile displays evidence without silently rewriting `skillMap`.

A separately validated projection boundary is required before adaptive evidence may update canonical mastery.

## Per-skill route recommendation

`learningSessions.routeBySkill` is adaptive runtime state, not mastery.

A skill with no route yet uses Core as a bounded fallback. Missing route state does not mean Support and is not a zero score.

Teacher judgement moves each affected skill one bounded step from that skill's own current route:

- `needs_help`: Advanced -> Core -> Support;
- `managed`: keep the current skill route;
- `too_easy`: Support -> Core -> Advanced.

Unrelated skill routes stay unchanged.

For a multi-skill activity, the visible workspace uses the most supportive route required by the affected skills. Navigation may change which route is visible because the next activity targets different skills, but navigation is not evidence and must not mutate `routeBySkill`.

Word-level vocabulary marks remain evidence but do not automatically change the whole vocabulary route. Teacher judgement remains the explicit adaptive route signal in v1.

The complete deterministic contract is in `docs/PER_SKILL_ADAPTIVE_ENGINE_V1.md`.

## Curriculum goal recommendation

Curriculum Engine and Adaptive Engine have separate jobs:

- Curriculum Engine chooses **what goal should be learned next**;
- Adaptive Engine chooses **how much support/challenge the current activity needs**.

The B1 `Linn ja teenused` graph has stable IDs, prerequisite edges, next-goal edges, success criteria and canonical skill references.

PR #93 binds the first goal `EST_B1_CITY_VOCAB` to `est-b1-city-vocabulary-01`, while `EST_B1_CITY_SOLVE_PROBLEM` remains bound to `est-b1-city-problem-solving-01`.

Critical distinction:

- active/completed Adaptive Learning Session goal IDs are session **targets**;
- session completion alone does not mark a goal achieved;
- only explicit structured achieved-goal evidence may satisfy a curriculum prerequisite.

Legacy lesson/topic mapping exists only to bridge existing records into stable goal context. It must not be interpreted as mastery evidence.

The full contract is in `docs/CURRICULUM_GOAL_GRAPH_V1.md`.

## Learning Session and evidence

A dedicated Learning Session is the persisted runtime boundary for supported adaptive lessons.

It connects:

- student and teacher identity;
- lesson blueprint identity;
- stable curriculum target IDs;
- current phase/activity/index;
- current effective route and `routeBySkill` context;
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

Navigation/progress is not evidence. Once a session is completed, new evidence additions are rejected.

### Trusted persistence boundary

Browser Lesson Mode does not receive direct Firestore write permission for `learningSessions` or `learningEvidence`.

`learning-session-store.js` authenticates to `learningSessionApi`. The Cloud Function validates:

- Firebase ID token;
- teacher/admin role;
- teacher/student scope;
- supported lesson allowlist;
- route/index/input bounds;
- request-id idempotency;
- active session state.

PR #93 makes the server authoritative for supported lesson identity. For each allowed blueprint the Function owns:

- canonical lesson title;
- canonical CEFR level;
- canonical curriculum goal IDs.

Browser-supplied title, CEFR or curriculum goal metadata cannot forge a persisted lesson target.

For per-skill adaptation, the Function remains authoritative: it computes the expected transition from persisted `routeBySkill`, affected skill IDs and canonical teacher judgement. A browser-supplied `nextRouteBySkill` is only a consistency check.

Summary evidence now records the active session's actual final phase rather than assuming one hard-coded reference-lesson exit phase.

Firebase Admin SDK performs writes. The browser cannot use a route patch to change unrelated skills or skip multiple route steps.

The Firestore student document path is authoritative for identity; a stored `id` field cannot redirect session ownership.

## Learning Profile projection

`learningProfileEvidenceApi` is the trusted read boundary for adaptive evidence.

Learning Profile combines:

- canonical `students.skillMap`;
- structured Live Classroom summaries;
- append-only Adaptive Lesson evidence/session context;
- read-only Curriculum Goal graph recommendation where that graph exists.

It may surface recent exact words needing review, but evidence does not automatically become mastery.

The profile keeps achieved goals separate from Adaptive session target goals before passing prerequisite evidence to Curriculum Engine.

Direct browser reads of the private adaptive evidence/session collections remain denied.

## Start / resume from Teacher Home

Teacher Home maps only explicitly supported Curriculum Goals to explicitly supported Lesson Mode blueprints.

Current mapping:

- `EST_B1_CITY_VOCAB` -> `est-b1-city-vocabulary-01`;
- `EST_B1_CITY_SOLVE_PROBLEM` -> `est-b1-city-problem-solving-01`.

Lesson Mode opens as:

`/haldus-adaptive-lesson/?studentId=<id>&lessonId=<lessonBlueprintId>`

The page loads the bounded blueprint registry and selects the requested `lessonId`. An unknown `lessonId` shows a controlled unsupported-lesson screen instead of silently running the wrong lesson.

For backward compatibility, opening Lesson Mode without `lessonId` still selects `est-b1-city-problem-solving-01`. Without `studentId`, Lesson Mode stays in Preview and remains non-persistent.

A resumed session restores persisted `routeBySkill`. Existing sessions that have only some skill keys remain valid; missing skills use Core until teacher evidence changes them.

## Lesson close and handoff

`Lõpeta tund` opens Summary; it does not mark mastery or complete persistence by itself.

The teacher explicitly creates the handoff. Only entered summary scores become `summary_score` evidence. Blank skills stay absent.

The completed session retains the teacher note/handoff for later read-side use. Session completion does not automatically satisfy a Curriculum Goal prerequisite.

## Reference implementation

- `adaptive-lessons/est-b1-city-vocabulary.js` — vocabulary activation blueprint for `EST_B1_CITY_VOCAB`.
- `adaptive-lessons/est-b1-city-problem-solving.js` — broader B1 problem-solving blueprint for `EST_B1_CITY_SOLVE_PROBLEM`.
- `adaptive-lesson-core.js` — original pure diagnostic/mastery/handoff logic.
- `adaptive-skill-engine.js` — pure deterministic per-skill route engine.
- `curriculum-goal-core.js` — pure deterministic goal-graph validation and recommendation engine.
- `curriculum-goals/b1-city.js` — stable B1 city/services goal/prerequisite graph and blueprint bindings.
- `lesson-workspace-core.js` — pure phase/workspace projection and route-aware view-model logic.
- `learning-session-core.js` — pure Learning Session/evidence normalization helpers.
- `learning-session-store.js` — authenticated browser client for persistence.
- `functions/learning-session-api.js` — trusted supported-lesson/session/evidence and per-skill-route writer.
- `learning-profile-evidence-store.js` + `functions/learning-profile-evidence-api.js` — trusted adaptive-evidence read projection.
- `haldus-learning-profile/index.html` — read-only Learning Profile including Curriculum Engine projection.
- `haldus-teacher-home/index.html` + `teacher-home-core.js` — daily teacher flow and bounded start/resume routing.
- `haldus-adaptive-lesson/index.html` — focused live teaching shell selecting a supported blueprint by stable `lessonId`.
- `adaptive-lessons/scenes.js` — exact scene metadata registry; no universal Lesson Mode background.

## Integration boundary

Do not replace curriculum, accounting/calendar status or Live Classroom in one change.

Safe evolution:

1. blueprint/decision model — done;
2. focused Lesson Mode shell — done;
3. Learning Profile read-only — done;
4. Learning Session/evidence persistence — done;
5. adaptive evidence projection — done;
6. phase-specific workspaces — done;
7. deterministic per-skill Adaptive Engine — done;
8. curriculum goal/prerequisite graph — done;
9. Teacher Home vertical flow — done through #92;
10. first next-goal -> dedicated Lesson Mode launch — PR #93;
11. normalize Lesson Builder/Content Engine around stable activity IDs only after this E2E flow is verified;
12. AI-assisted generation only after the deterministic loop is stable.

## Acceptance criteria before broad curriculum migration

- teacher can open Teacher Home and start the curriculum-recommended supported lesson;
- supported Lesson Mode is selected by stable blueprint ID rather than an arbitrary browser payload;
- teacher can run each supported lesson without author context;
- current activity is visually dominant;
- unrelated CRM navigation is absent;
- workspace changes with pedagogical purpose;
- diagnostic and assessment do not leak answers;
- images appear only when they materially support the activity;
- Support/Core/Advanced change scaffolding without changing CEFR;
- vocabulary, grammar and speaking may hold different adaptive routes where a lesson targets them;
- navigation does not invent or overwrite adaptive skill routes;
- teacher judgements and exact vocabulary marks persist for a real student;
- repeated evidence requests are idempotent;
- completed sessions reject new evidence;
- missing skill scores are not converted to zero;
- `students.skillMap` is not silently changed;
- stable Curriculum Goals use explicit prerequisite/next-goal edges;
- Adaptive session completion does not silently mark Curriculum Goal mastery;
- existing curriculum lessons remain working;
- automated tests cover decision, workspace, persistence, curriculum, Teacher Home routing and read-side boundaries;
- project state is updated after each substantial slice.

## Known current limitation

The Curriculum Goal graph covers only the first B1 city/services vertical slice. Dedicated Lesson Mode blueprints now exist for `EST_B1_CITY_VOCAB` and `EST_B1_CITY_SOLVE_PROBLEM`; the intermediate explain/help goals and final transfer goal still fall back to Learning Profile. Blueprints still use Core task positions as stable activity slots, so all route variants in the new vocabulary lesson deliberately keep equal task counts. The later Content Engine normalization slice must introduce route-independent stable activity IDs before broad authoring/migration.