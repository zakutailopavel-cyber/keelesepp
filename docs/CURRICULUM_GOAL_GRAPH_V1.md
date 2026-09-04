# Curriculum Goal Graph v1

Status: B1 `Linn ja teenused` goal graph merged in #90; Teacher Home consumes it through #91/#92; PR #93 binds the first vocabulary goal to a dedicated Lesson Mode blueprint.

## Purpose

Curriculum Engine answers a different question from Adaptive Engine:

- Curriculum Engine: **what learning goal should come next?**
- Adaptive Engine: **how much support/challenge should the current activity use?**

The first Curriculum Engine slice introduces stable learning-goal IDs and explicit prerequisite/next-goal edges without creating a second mastery source of truth.

## Source-of-truth boundary

`students.skillMap` remains the canonical current mastery projection.

Curriculum recommendations may read canonical skill scores to prioritize or explain a recommendation, but this slice never writes `students.skillMap` and never invents a mastery score from attendance, session completion, route state or missing evidence.

Missing skill evidence is `unknown`, not `0`.

## Graph contract

Each goal has:

- stable `id`;
- `curriculumId` and `unitId`;
- subject and CEFR level;
- title and description;
- stable `targetSkillIds`;
- optional `criticalSkillIds`;
- `prerequisiteGoalIds`;
- `nextGoalIds`;
- measurable `successCriteria`;
- optional lesson-blueprint and legacy topic/title mappings.

`curriculum-goal-core.js` validates:

- duplicate IDs;
- required fields;
- missing goal references;
- self references;
- prerequisite cycles.

Invalid graphs do not produce a normal recommendation.

## B1 city/services graph

Graph: `EST_B1_CITY_SERVICES_V1`

Flow:

```text
EST_B1_CITY_VOCAB
  ├─> EST_B1_CITY_EXPLAIN_PROBLEM ─┐
  └─> EST_B1_CITY_ASK_HELP ────────┤
                                    v
                         EST_B1_CITY_SOLVE_PROBLEM
                                    |
                                    v
                         EST_B1_CITY_TRANSFER
```

The first five stable goals are:

1. `EST_B1_CITY_VOCAB` — activate city-problem vocabulary;
2. `EST_B1_CITY_EXPLAIN_PROBLEM` — explain a city problem coherently;
3. `EST_B1_CITY_ASK_HELP` — ask politely for help and clarification;
4. `EST_B1_CITY_SOLVE_PROBLEM` — integrate explanation, help-seeking and a justified solution;
5. `EST_B1_CITY_TRANSFER` — transfer the same communicative competence to a new city-service situation.

The graph reuses canonical B1 skill IDs from `HaldusSkillCatalog`, especially `B1_VOCAB_TOPIC` and `B1_SPEAK_DESC`. It does not add parallel skill-map IDs.

## Lesson blueprint bindings

The graph may bind a goal to one or more stable Lesson Mode blueprints. A binding means the system has a concrete teaching implementation for that goal; it does not mean the goal is achieved.

Current dedicated bindings:

```text
EST_B1_CITY_VOCAB
  -> est-b1-city-vocabulary-01

EST_B1_CITY_SOLVE_PROBLEM
  -> est-b1-city-problem-solving-01
```

The blueprints themselves declare the same stable targets:

```js
// adaptive-lessons/est-b1-city-vocabulary.js
curriculumGoalIds:['EST_B1_CITY_VOCAB']

// adaptive-lessons/est-b1-city-problem-solving.js
curriculumGoalIds:['EST_B1_CITY_SOLVE_PROBLEM']
```

This allows Learning Sessions to persist stable curriculum targets instead of only lesson title/topic text and lets Teacher Home route `Alusta tundi` to the correct supported blueprint.

`EST_B1_CITY_EXPLAIN_PROBLEM`, `EST_B1_CITY_ASK_HELP` and `EST_B1_CITY_TRANSFER` currently have no dedicated blueprint. Teacher Home must therefore open Learning Profile for those goals rather than inventing a lesson mapping.

The graph also keeps legacy topic/title mappings for transition context. Legacy mapping is context only; it is not mastery evidence.

## Recommendation order

`recommendNextGoal()` is deterministic.

Priority:

1. continue an explicit active goal;
2. choose a ready direct successor of an explicitly achieved goal;
3. use an exact legacy lesson mapping when needed for transition context;
4. choose a ready goal in graph order, prioritizing critical skills that currently need attention;
5. if all remaining candidates are prerequisite-blocked, return the closest blocked goal and explain what is missing.

A low critical-skill score does not mean the learner is forbidden to learn the goal. It changes priority/explanation. Stable prerequisite-goal edges are the graph gate.

## Achievement semantics

This distinction is mandatory:

- **target goal** = what a Learning Session is teaching;
- **active goal** = target of an active Learning Session;
- **achieved goal** = explicit structured achievement evidence;
- **completed session** = the teaching session ended.

A completed Adaptive Lesson is **not automatically an achieved curriculum goal**.

Today, Learning Profile treats structured Live Classroom summary goal IDs as achieved-goal evidence because that existing flow records selected curriculum outcomes. Adaptive Learning Session `curriculumGoalIds` remain target/current-context IDs until a separate validated goal-achievement projection is implemented.

This preserves the existing core rule: lesson attendance/completion is not mastery.

## Learning Profile and Teacher Home projection

For supported B1 context, Learning Profile shows a read-only `Järgmine õppekava eesmärk` card containing:

- stable goal title and ID;
- state: ready / active / blocked;
- deterministic explanation;
- prerequisite goal status;
- critical skill status from canonical `students.skillMap`;
- exact vocabulary review evidence when useful.

Teacher Home consumes that same recommendation. It may start a Lesson Mode only when the goal has an explicit supported blueprint binding. The current bounded map is:

- `EST_B1_CITY_VOCAB` -> `est-b1-city-vocabulary-01`;
- `EST_B1_CITY_SOLVE_PROBLEM` -> `est-b1-city-problem-solving-01`.

An unsupported goal remains explainable in Learning Profile but does not get forced into a wrong lesson.

The UI may use explicit B1 Learning Session/blueprint context even if the student's broad profile level field has not yet been updated. This keeps an already-started curriculum target explainable without silently changing the student's CEFR level.

For levels/units without a defined graph, the existing evidence-based fallback remains in place.

## Safety boundaries

This work adds no:

- Firestore schema migration;
- Firestore rule change;
- automatic `students.skillMap` write;
- automatic CEFR-level change;
- automatic goal-achievement write;
- finance/calendar/crm-v2/Live Classroom behavior change.

The trusted `learningSessionApi` owns the persisted title/CEFR/goal identity for the supported blueprints, so a browser cannot forge a different curriculum target while starting one of them.

## Verification contract

Automated coverage must prove:

- graph validity and cycle rejection;
- exact blueprint-to-goal bindings;
- deterministic entry/successor/transfer recommendations;
- missing skill evidence stays unknown;
- active adaptive target is not achieved;
- completed adaptive session target is not achieved merely because the lesson ended;
- Learning Profile passes only explicit achieved goals as prerequisite evidence;
- Teacher Home starts only explicitly bound goals;
- unsupported goals remain profile fallbacks;
- trusted persistence cannot be given forged goal metadata by the browser;
- Learning Profile remains read-only;
- browser scripts parse;
- existing learning/CRM test bundle remains green.

## Known limit

Curriculum Goal graph v1 covers only one B1 city/services vertical slice. Two of its goals now have dedicated Lesson Mode blueprints. The intermediate explain/help goals and final transfer goal still need their own teaching implementations or later Lesson Builder/content normalization before they can become direct `Alusta tundi` actions.