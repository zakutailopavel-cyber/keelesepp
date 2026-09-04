# Curriculum Goal Graph v1

Status: PR #90 implementation slice for the selected B1 `Linn ja teenused` vertical flow.

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

## Reference lesson binding

`adaptive-lessons/est-b1-city-problem-solving.js` now stores:

```js
curriculumGoalIds:['EST_B1_CITY_SOLVE_PROBLEM']
```

This allows new Learning Sessions to persist a stable curriculum target instead of only a lesson title/topic.

The goal graph also keeps a legacy mapping from blueprint `est-b1-city-problem-solving-01` and the previous topic/title strings. Legacy mapping is context only; it is not mastery evidence.

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

## Learning Profile projection

For supported B1 context, Learning Profile now shows a read-only `Järgmine õppekava eesmärk` card containing:

- stable goal title and ID;
- state: ready / active / blocked;
- deterministic explanation;
- prerequisite goal status;
- critical skill status from canonical `students.skillMap`;
- exact vocabulary review evidence when useful.

The UI may use explicit B1 Learning Session/blueprint context even if the student's broad profile level field has not yet been updated. This keeps an already-started curriculum target explainable without silently changing the student's CEFR level.

For levels/units without a defined graph, the existing evidence-based fallback remains in place.

## Safety boundaries

This slice adds no:

- Firestore schema migration;
- Firestore rule change;
- automatic `students.skillMap` write;
- automatic CEFR-level change;
- automatic goal-achievement write;
- production deployment;
- finance/calendar/crm-v2/Live Classroom behavior change.

## Verification contract

Automated coverage must prove:

- graph validity and cycle rejection;
- exact reference-lesson binding;
- deterministic entry/successor/transfer recommendations;
- missing skill evidence stays unknown;
- active adaptive target is not achieved;
- completed adaptive session target is not achieved merely because the lesson ended;
- Learning Profile passes only explicit achieved goals as prerequisite evidence;
- Learning Profile remains read-only;
- browser scripts parse;
- existing learning/CRM test bundle remains green.

## Known limit

Curriculum Goal graph v1 covers only one B1 city/services vertical slice. It is deliberately not a broad migration of every existing curriculum topic.

The next roadmap slice is Teacher Home / `Today`, which can consume Curriculum Engine recommendations together with Learning Profile and Lesson Mode. Broad Lesson Builder/content normalization follows after that.