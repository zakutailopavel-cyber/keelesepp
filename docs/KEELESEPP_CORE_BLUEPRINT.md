# KeeleSepp Core Blueprint v1

Status: architecture proposal for the first/legacy KeeleSepp CRM
Date: 2026-09-04

## 1. Product definition

KeeleSepp is not only a CRM and not only a lesson generator. The learning core should operate as a teacher operating system that connects curriculum intent, adaptive decisions, live teaching, reusable content and persistent learner evidence.

The five core engines are:

1. **Curriculum Engine** — decides what should be learned next.
2. **Adaptive Engine** — decides how much support, independence and transfer demand is appropriate now.
3. **Lesson Mode** — renders the correct teacher workspace for the current phase.
4. **Content Engine** — supplies the tasks, vocabulary, scenes, prompts, hints and answer material required by that workspace.
5. **Learning Profile** — stores the current mastery projection and the evidence that explains it.

The engines are connected by one runtime contract: **Learning Session**.

```text
Curriculum Engine
       ↓
Learning Profile → Adaptive Engine
       ↓               ↓
       └────── Learning Session ──────┐
                                      ↓
                                Lesson Mode
                                      ↓
                                Content Engine
                                      ↓
                                   Evidence
                                      ↓
                                Learning Profile
                                      ↺
```

The fundamental product rule is unchanged:

> A lesson marked as completed is not proof of mastery.

Calendar/accounting lesson status and pedagogical mastery must remain separate.

## 2. Product roles

### Teacher

The teacher should primarily see:

- Today / next lesson;
- student learning snapshot;
- Start lesson;
- live Lesson Mode;
- final summary / handoff;
- homework and follow-up.

The teacher should not need to understand Firestore, curriculum record IDs, route formulas, scene storage or internal scoring.

### Methodologist / content administrator

The methodologist should own:

- curriculum goals and prerequisite graph;
- adaptive lesson blueprints;
- workspace selection per phase;
- Support/Core/Advanced variants;
- content and scene library;
- lesson quality review.

### Owner / administrator

The owner keeps operational modules such as:

- schedule;
- students and staff;
- finance;
- attendance and operational analytics;
- permissions and school administration.

Operational CRM modules must not dominate the teacher's live lesson flow.

## 3. Core data contracts

These are contracts, not a request for an immediate production migration. The first implementation must be additive and must preserve existing IDs and historical meaning.

### 3.1 LearningSession

A Learning Session is the pedagogical runtime that connects one student, one lesson blueprint and the evidence collected during delivery.

```ts
type LearningSession = {
  id: string;
  studentId: string;
  teacherId: string;

  // Optional link to the operational lesson/schedule record.
  scheduleLessonId?: string;

  lessonBlueprintId: string;
  curriculumGoalIds: string[];
  ceFRLevel?: string;

  status: 'planned' | 'active' | 'completed' | 'abandoned';
  startedAt?: string;
  completedAt?: string;

  currentPhaseId?: string;
  currentActivityId?: string;

  // Route is per skill/phase, not a permanent student label.
  routeBySkill: Record<string, 'support' | 'core' | 'advanced'>;

  evidenceCount: number;
  assessedSkillIds: string[];

  teacherNote?: string;
  handoff?: TeacherHandoff;
  nextRecommendation?: NextLearningRecommendation;
};
```

Rules:

- the session never changes the course CEFR/category when the route changes;
- a missing assessment remains absent/null, never zero;
- attendance/completion may link to an operational lesson but does not become mastery evidence by itself;
- session history must remain reviewable after completion.

### 3.2 LearningEvidence

Learning Evidence records why the system believes a skill or word is strong/weak.

```ts
type LearningEvidence = {
  id: string;
  sessionId: string;
  studentId: string;
  lessonBlueprintId: string;
  phaseId: string;
  activityId: string;

  skillIds: string[];
  vocabularyIds?: string[];

  route: 'support' | 'core' | 'advanced';
  teacherJudgement?: 'needs_help' | 'managed' | 'too_easy';
  taskResult?: number | boolean | null;
  supportUsed?: 'none' | 'light' | 'medium' | 'high';

  source: 'teacher' | 'task-rule' | 'system';
  note?: string;
  createdAt: string;
};
```

Evidence should be append-only once a session is completed. Corrections should create a new dated correction/review event instead of silently rewriting historical evidence.

### 3.3 Learning Profile

The existing `students.skillMap` remains the canonical current mastery projection for skills. Do not introduce a second competing current-skill truth.

The Learning Profile is therefore a composed read model:

```ts
type StudentLearningProfile = {
  studentId: string;
  currentTrackId?: string;
  currentLevel?: string;

  // Existing canonical projection.
  skillMap: Record<string, number>;

  // Future additive projection for lesson-specific words/phrases.
  vocabularyMap?: Record<string, number>;

  recentEvidence: LearningEvidence[];

  recommendations: {
    focusSkillIds: string[];
    cautionSkillIds: string[];
    reviewVocabularyIds: string[];
    nextGoalIds: string[];
  };
};
```

The mastery projection is derived from evidence and explicit lesson policy. Raw evidence is not deleted merely because the current score changes.

### 3.4 CurriculumGoal

The Curriculum Engine should progressively move from topic-only navigation toward stable learning goals.

```ts
type CurriculumGoal = {
  id: string;
  curriculumId: string;
  unitId: string;
  title: string;
  description: string;
  level: string;

  targetSkillIds: string[];
  criticalSkillIds?: string[];
  prerequisiteGoalIds: string[];
  nextGoalIds: string[];

  successCriteria: string[];
};
```

Legacy curriculum lessons remain valid. Goal IDs are added incrementally; there is no bulk destructive migration.

### 3.5 AdaptiveDecision

Adaptive Engine v1 should stay deterministic and explainable.

```ts
type AdaptiveDecision = {
  sessionId: string;
  phaseId: string;
  activityId: string;

  focusSkillIds: string[];
  route: 'support' | 'core' | 'advanced';
  workspaceType: WorkspaceType;

  supportLevel: 0 | 1 | 2 | 3;
  showHints: boolean;
  showModel?: boolean;
  requireTransfer?: boolean;

  reasonCodes: string[];
};
```

The teacher may override a decision. The override should be recorded as session evidence/context, not treated as an error.

### 3.6 Workspace contract

Lesson Mode is one shell with multiple specialized workspaces.

```ts
type WorkspaceType =
  | 'diagnostic'
  | 'vocabulary'
  | 'controlled_practice'
  | 'scene'
  | 'roleplay'
  | 'transfer'
  | 'assessment'
  | 'summary';
```

Every activity defines only the capabilities it needs. A scene is optional; it is not a universal lesson requirement.

```ts
type LessonActivity = {
  id: string;
  phaseId: string;
  workspaceType: WorkspaceType;
  goal: string;
  skillIds: string[];

  contentRef?: string;
  sceneId?: string;
  vocabularyIds?: string[];

  routes: {
    support: ActivityVariant;
    core: ActivityVariant;
    advanced: ActivityVariant;
  };

  assessmentRule?: AssessmentRule;
};
```

## 4. Lesson workspace map

Only the shell is stable: top context bar, compact phase navigation, teacher tools, finish action. The central workspace changes according to pedagogical purpose.

### 4.1 Diagnostic workspace

Purpose: establish starting evidence without teaching the answer.

Use:

- short prompts;
- minimal context;
- neutral visual only when it does not reveal the target answer;
- fast teacher judgement;
- no model answer before the learner response.

Do not use a scene that contains the target phrase or an obvious textual answer.

### 4.2 Vocabulary workspace

Purpose: activate lesson-specific words/phrases.

Possible tools:

- compact word cards;
- categorisation;
- known / unsure / new marking;
- matching;
- sentence creation;
- small supporting visuals.

A large communicative scene is optional and usually secondary.

### 4.3 Controlled practice workspace

Purpose: practise language form with bounded cognitive load.

Possible tools:

- sentence builder;
- open-the-brackets tasks;
- word order;
- form selection;
- transformation;
- micro-dialogue completion.

The dominant tool is the exercise, not an illustration.

### 4.4 Scene workspace

Purpose: create communicative context.

Possible tools:

- one contextual illustration;
- problem statement;
- role/context cards;
- optional Support prompts;
- teacher-only success direction.

Scenes should be adult educational cartoons or other context-rich visuals consistent with KeeleSepp's visual language. The image must support language production and must not simply decorate the page.

### 4.5 Roleplay workspace

Purpose: use the target skill in live interaction.

Possible tools:

- separate teacher/student roles;
- hidden teacher complication;
- speaking goal;
- time/turn cue;
- optional support phrases;
- no fixed script on Core/Advanced unless the learning goal specifically requires modelling.

### 4.6 Transfer workspace

Purpose: test whether the learner can apply the skill in a new situation.

The context must change materially. Reusing the same bus scene and same problem is not sufficient transfer evidence.

Example for the current B1 lesson:

- learning scene: delayed bus;
- transfer scene: broken ticket machine, wrong platform, lost travel card or another city-service problem.

### 4.7 Assessment workspace

Purpose: collect final evidence with reduced support.

Use:

- only lesson-critical tasks;
- minimal hints;
- explicit evidence mapping to skills;
- no automatic score for skills not actually assessed.

### 4.8 Summary / handoff workspace

Purpose: close the loop.

It should show:

- assessed skills only;
- weak skills;
- exact vocabulary needing review;
- teacher note;
- next route recommendation;
- next curriculum goal when known;
- homework/follow-up.

## 5. Teacher workflow

The system should answer one question at each step: **what does the teacher do now?**

### 5.1 Teacher Home / Today

Default teacher entry point:

```text
13:00 Maria Petrova · B1
Current unit: Linn ja teenused
Last evidence: speaking needs support; vocabulary strong
Recommended lesson: Probleemi lahendamine linnas

[ ALUSTA TUNDI ]
```

The teacher should not need to open curriculum, student history, material library and schedule separately before starting.

### 5.2 Pre-lesson brief

Before Start Lesson, show a compact brief:

- lesson goal;
- previous weak skills;
- vocabulary due for review;
- recommended initial route by relevant skill;
- any teacher handoff note.

This screen is informational, not an editor.

### 5.3 Live lesson

Flow:

```text
Diagnostic
  ↓
Vocabulary
  ↓
Controlled practice
  ↓
Scene / communication
  ↓
Roleplay
  ↓
Transfer
  ↓
Assessment
```

Not every lesson requires every workspace type, but the reference lesson should prove the full vertical flow.

Primary teacher action remains simple:

- `Vajab abi`;
- `Sai hakkama`;
- `Liiga kerge`.

The system converts those judgements and task results into evidence and the next adaptive decision.

### 5.4 Lesson close

`Lõpeta tund` should not immediately equate to mastered.

The close flow should:

1. show assessed evidence;
2. let the teacher add one bounded note;
3. create the handoff;
4. update the current Learning Profile projection;
5. recommend next action/goal;
6. optionally create homework.

### 5.5 Next lesson

The next teacher receives the new profile and handoff automatically. The next session should not restart from a blank student state.

## 6. Engine responsibilities

### Curriculum Engine — WHAT next

Owns:

- curriculum tracks;
- units/topics;
- stable goals;
- prerequisites;
- critical skills;
- next-goal graph.

Does not own:

- live UI;
- student route;
- image storage;
- final mastery score calculation by itself.

### Learning Profile — WHAT we know about the learner

Owns:

- current `students.skillMap` projection;
- future exact vocabulary projection;
- recent evidence;
- review/focus recommendations.

Does not use attendance alone as evidence.

### Adaptive Engine — HOW difficult now

Owns:

- route per current skill/phase;
- support level;
- route change after new evidence;
- explanation reason codes;
- teacher override handling.

Adaptive Engine v1 should be deterministic rules. AI/ML is not required for the first reliable version.

### Lesson Mode — WHAT the teacher sees now

Owns:

- focused live shell;
- workspace renderer;
- progressive teacher help;
- capture of teacher judgement;
- navigation through the planned/adapted session.

Does not own curriculum logic or permanently store mastery by itself.

### Content Engine — WHAT fills the workspace

Owns reusable content:

- prompts;
- task variants;
- vocabulary;
- examples;
- teacher notes;
- scenes;
- roleplay data;
- transfer variations;
- homework variants.

Firebase Storage is appropriate for reusable non-sensitive lesson scene assets. Scene content is selected by `sceneId`; the image should not be hardcoded into the Lesson Mode shell.

## 7. Current code → target engine map

| Current asset | Target role | Status |
| --- | --- | --- |
| `adaptive-lesson-core.js` | Adaptive Engine pure decision/mastery functions | foundation exists |
| `adaptive-lessons/est-b1-city-problem-solving.js` | reference lesson blueprint / Content Engine source | exists, needs workspace contract |
| `haldus-adaptive-lesson/index.html` | Lesson Mode shell | prototype exists |
| `adaptive-lessons/scenes.js` + Firebase Storage | Content Engine scene registry | first vertical slice works |
| `students.skillMap` | Learning Profile current mastery projection | existing canonical projection |
| `curriculumLessons`, generated curriculum data | Curriculum Engine legacy source | existing, goal graph incomplete |
| Live Classroom summary/evidence patterns | precedent for immutable learning evidence | useful architecture precedent, not a required dependency |

## 8. Persistence proposal

No production schema is changed by this document. The preferred future additive shape is:

```text
students/{studentId}
  skillMap                       # existing current skill projection
  vocabularyMap?                # future current vocabulary projection

adaptiveSessions/{sessionId}
  studentId
  teacherId
  scheduleLessonId?
  lessonBlueprintId
  curriculumGoalIds[]
  status
  routeBySkill
  startedAt
  completedAt
  handoff
  nextRecommendation

adaptiveSessions/{sessionId}/evidence/{evidenceId}
  phaseId
  activityId
  skillIds[]
  vocabularyIds[]?
  route
  teacherJudgement
  supportUsed
  taskResult
  source
  createdAt
```

Security direction:

- teachers/admin may create/update an active session they are allowed to conduct;
- completed session summary/evidence should become immutable or correction-only;
- students/parents may later receive a bounded read projection, not teacher-internal notes;
- browser clients must not be able to arbitrarily rewrite canonical mastery without the same validated transaction/command that records evidence.

The exact Firestore rules and transaction boundary are a separate implementation slice and require emulator tests before deployment.

## 9. Product screen map

### Teacher surfaces

1. **Teacher Home / Today** — next actions and lessons.
2. **Student Learning Snapshot** — current goals, recent evidence, weak skills, vocabulary review.
3. **Pre-lesson Brief** — one-page lesson context.
4. **Lesson Mode** — dynamic workspace shell.
5. **Lesson Summary / Handoff** — close and next recommendation.
6. **Homework / Follow-up** — bounded post-lesson action.

### Methodologist surfaces

1. Curriculum map.
2. Learning goal editor.
3. Lesson Builder.
4. Content library.
5. Scene/media manager.
6. Lesson quality/coverage report.

### Owner/admin surfaces

Existing CRM operations remain separate: schedule, finance, staff, students, reliability and school analytics.

## 10. Reference lesson target

Before migrating many lessons, the current B1 reference lesson must prove the complete system.

Target sequence:

1. diagnostic workspace — no answer-revealing bus dialogue image;
2. vocabulary workspace — exact lesson words;
3. controlled practice workspace — polite help/problem language;
4. scene workspace — delayed-bus communicative situation;
5. roleplay workspace — learner and teacher roles;
6. transfer workspace — a materially different city-service problem and preferably a different scene;
7. assessment workspace — critical skills with minimal support;
8. summary/handoff — persistent assessed evidence and next recommendation.

Acceptance gate:

> A qualified teacher who did not author the lesson can conduct the full lesson without opening another CRM module, and the next teacher receives a useful learning state rather than only `Toimunud`.

## 11. Development roadmap

The order is deliberately vertical. Do not scale content before the learning loop is proven.

### Release slice 0 — Core contracts (this blueprint)

Deliver:

- five-engine boundary;
- LearningSession contract;
- evidence contract;
- workspace taxonomy;
- role-specific screen map;
- reference vertical-flow acceptance criteria.

Gate: architecture reviewed and accepted before persistence work.

### Release slice 1 — Learning Profile read model

Deliver:

- student learning snapshot built from existing `students.skillMap`;
- recent lesson evidence projection where available;
- weak/focus skill presentation;
- no new authoritative duplicate mastery store.

Gate: one teacher can understand what the student needs next from one screen.

### Release slice 2 — Adaptive session + evidence persistence

Deliver:

- `adaptiveSessions` vertical slice for one reference lesson;
- append-only activity evidence;
- safe completion transaction/command;
- projection into `students.skillMap` using explicit mastery policy;
- emulator tests and auditability.

Gate: refresh/relogin does not lose the learning result and completed evidence cannot be silently rewritten.

### Release slice 3 — Lesson Mode workspace renderer

Deliver:

- stable shell;
- diagnostic workspace;
- vocabulary workspace;
- controlled-practice workspace;
- scene workspace;
- roleplay workspace;
- transfer workspace;
- assessment/summary workspace.

Gate: the reference lesson changes tools by phase and no longer uses one scene/card pattern for the whole lesson.

### Release slice 4 — Adaptive Engine v1 per skill

Deliver:

- deterministic per-skill route decision;
- `needs_help / managed / too_easy` evidence mapping;
- Support/Core/Advanced selection per phase;
- teacher override;
- reason codes and tests.

Gate: vocabulary may be Advanced while speaking is Support in the same B1 lesson.

### Release slice 5 — Curriculum Goal graph

Deliver:

- stable goal IDs for the selected B1 vertical slice;
- prerequisites;
- critical skills;
- next-goal recommendations;
- mapping from legacy curriculum lesson/topic to the new goals.

Gate: the system can explain why a particular lesson/goal is recommended next.

### Release slice 6 — Teacher Home vertical flow

Deliver:

```text
Today → student → pre-lesson brief → Start lesson → Lesson Mode → Summary → next action
```

Gate: a teacher can start the correct lesson without manually navigating schedule, curriculum library and student history.

### Release slice 7 — Lesson Builder + Content normalization

Deliver:

- methodologist lesson builder;
- workspace type per activity;
- Support/Core/Advanced variants;
- vocabulary and scene references;
- transfer variant;
- validation before publication.

Gate: a second lesson can be created without editing Lesson Mode source code.

### Release slice 8 — Content automation / AI assistance

Only after the previous contracts are stable:

- draft lesson generation;
- vocabulary/task suggestions;
- scene prompt generation;
- image generation → Firebase Storage → `sceneId`;
- automatic homework drafts;
- human review before publication.

AI is an authoring assistant, not the source of truth for mastery or financial/school records.

### Release slice 9 — Scale and analytics

After multiple lessons use the same contracts:

- exam readiness;
- skill trends;
- content gap detection;
- cohort analytics;
- teacher support analytics;
- parent/student progress projections.

## 12. Explicit non-goals until the core loop is stable

Do not prioritize:

- broad curriculum migration;
- a new CRM rewrite;
- crm-v2 migration;
- AI deciding authoritative mastery;
- dozens of new independent teacher screens;
- deep mobile polishing ahead of desktop teacher workflow;
- finance/calendar/Live Classroom refactors inside adaptive-learning PRs.

## 13. Decision rules for future features

Before adding a learning feature, ask:

1. Which of the five engines owns it?
2. What teacher/student problem does it solve?
3. What stable ID/data contract does it use?
4. What evidence does it produce or consume?
5. Can it be hidden from the teacher when it is not relevant to the current phase?
6. Does it preserve historical learning meaning?

If ownership is unclear, the feature is not ready to implement.

## 14. Immediate next safe implementation

After this blueprint is reviewed, the next implementation should be **Learning Profile MVP as a read-only teacher surface**, using the existing `students.skillMap` and existing historical lesson/summary evidence where available.

Do not add new mastery writes in the same slice. First prove that the teacher can see one coherent learner state and that the proposed read model is sufficient for Adaptive Engine inputs.
