# Normalized Activity Contract v1

Status: COMPLETED in merged PR #98, main `b23dabc989be3aad1989de98f4c1234cfdc20e4a`.
Production Vercel READY; post-merge non-mutating smoke passed.
The subsequent local editor is documented in [LESSON_BUILDER_AUTHORING_UI_V1.md](LESSON_BUILDER_AUTHORING_UI_V1.md).

## Boundary and identity

`activity-contract-core.js` is a pure UMD/CommonJS adapter and validator. It converts an existing
blueprint into ordered normalized activities. `lesson-workspace-core.buildItems()` projects those
activities into the existing Lesson Mode item shape, with the exact same `item.id` used by
LearningSession and all evidence. There is no second persistent activity-ID system.

Legacy route tasks remain strings and retain `${stage.id}-${taskIndex}` IDs. Legacy diagnostic
items retain their declared ID or `diagnostic-${index}` fallback. These legacy positions must not
be reordered/inserted into while historical identity is required: pin explicit IDs first.

New authored route tasks are objects, e.g.:

```js
{id: 'school-vocabulary-0', prompt: 'Selgita sõnu …'}
```

Each logical task uses the same ID on Support/Core/Advanced. Core order defines navigation order;
other routes are joined by ID, not array index. Explicit task IDs are required, unique within the
lesson, at most 140 characters, and never derived from prompt text. Every structured route must
contain the same ID set. Mixed string/object tasks within a stage are rejected. New IDs must be
allocated once at authoring time and never reused for a different learning activity. Existing school
IDs with numeric suffixes are pinned literal identifiers, not recomputed positions.

`summary` and `summary-*` are reserved for existing completion/summary evidence. IDs are scoped
by the existing lessonBlueprintId in sessions/evidence. Phase IDs retain the existing stage ID
(or `diagnostic`) and its 100-character persistence limit.

## Exact runtime shape

```ts
type Activity = {
  schemaVersion: 1;
  id: string;                 // existing activityId, immutable
  phaseId: string;            // existing phaseId
  skillIds: string[];         // diagnostic mapping or inherited stage skill
  workspaceType: WorkspaceType;
  title: string;              // stage/diagnostic display label
  routes: Record<'support' | 'core' | 'advanced', {
    prompt: string;
    workspaceType: WorkspaceType;
    expected: string;         // teacher-only answer/check direction
    teacherInstruction: string;
    responseMode?: string;
    assets?: Array<{id: string; [metadata: string]: unknown}>;
    progression?: Record<string, unknown>;
    collaboration?: Record<string, unknown>;
    evaluation?: Record<string, unknown>;
  }>;
  responseMode?: string;
  assets?: Array<{id: string; [metadata: string]: unknown}>;
  progression?: Record<string, unknown>;
  collaboration?: Record<string, unknown>;
  evaluation?: Record<string, unknown>;
  source: {
    kind: 'diagnostic' | 'stage';
    stage: number;            // UI navigation only; not identity
    taskIndex: number;        // current blueprint order only
  };
};
```

WorkspaceType remains the eight existing types. Default metadata comes from the core task;
route-local optional metadata is retained on that variant. Optional metadata is JSON-only,
deep-copied, and inert: no media fetch, recording, progression execution, collaboration, grading,
or evidence generation is enabled by supplying it. Its detailed nested semantics are deliberately
reserved for future bounded features; this validator checks outer types and asset reference IDs,
not future asset authorization, URLs or executable rules. Such consumers require their own trusted
validation boundary. Metadata is never sent to the current persistence API.

A structured task may also provide `workspaceType`, `expected` and `teacherInstruction` overrides.
Otherwise the adapter retains existing stage/route workspace selection, answer and instruction
fallbacks. Diagnostic/assessment answer hiding remains owned by Lesson Mode. Student rendering
continues to escape prompt strings; normalized expected answers are not public student content.

## Resume and evidence

Resume first finds `currentActivityId` in the normalized plan. A changed order therefore does not
redirect an active session to the wrong activity. Only ID-less legacy records fall back to bounded
`currentIndex`. A recorded ID missing from the current blueprint raises an error and keeps initial
lesson controls locked; it never silently substitutes a different task. Removal/version migration
of an in-use activity remains outside v1.

`learning-session-core.js`, `learning-session-store.js` and Functions are unchanged. Existing
`teacher_judgement`, `vocabulary_mark`, `summary_score`, routeBySkill and handoff payloads remain
unchanged, including `summary-${skill}` evidence IDs. No Firestore schema/rule/index migration,
mastery update, curriculum credit or production data mutation is introduced.

## Reference proof and checks

`est-b1-school-learning-01` pins all nine stage tasks across three routes; its three existing
explicit diagnostic IDs remain unchanged. All 12 IDs and the pedagogical text are preserved.
Both city blueprints remain string-based and pass through the legacy boundary unchanged.

Contract tests cover deterministic/pure normalization, duplicate/missing/mismatched IDs, metadata,
route reordering, insertion/resume, exact reference workspace parity, all evidence kinds and the
existing store request payloads using a fake transport. Browser UMD loading uses the actual script
order from Lesson Mode. No synthetic production evidence is used.

Known boundaries: no visual Builder UI, publication/versioning service, drag-and-drop, response
capture, AI/media generation or collaboration runtime. Blueprint metadata must be serializable JSON.
A future Builder must preserve declared IDs and validate before publication.
