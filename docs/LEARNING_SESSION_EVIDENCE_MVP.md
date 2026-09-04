# Learning Session + Evidence MVP

Status: release slice 2 of `docs/KEELESEPP_CORE_BLUEPRINT.md`
Date: 2026-09-04
Reference lesson: `est-b1-city-problem-solving-01`

## Goal

Persist the pedagogical runtime of one adaptive lesson without turning lesson completion into mastery and without changing `students.skillMap`.

This slice proves the loop:

```text
Teacher opens reference Lesson Mode for one student
  -> start or resume LearningSession
  -> teacher judgement / vocabulary mark
  -> append immutable LearningEvidence
  -> persist current lesson position and route
  -> explicit final summary scores
  -> complete LearningSession + handoff
```

It deliberately does **not** calculate or write canonical mastery yet.

## Trust boundary

Browser code does not write `learningSessions` or `learningEvidence` directly.

`learning-session-store.js` sends authenticated HTTPS requests to the trusted Cloud Function `learningSessionApi`. The API verifies the Firebase ID token, staff role and teacher/student scope, then writes with the Firebase Admin SDK.

There are intentionally no client Firestore rules granting access to `learningSessions` or `learningEvidence`. Unmatched Firestore paths stay denied to browser clients. The emulator integration test explicitly proves a teacher cannot create a `learningEvidence` document directly.

This avoids broad write rules and keeps the evidence append-only invariant on the server.

## Collections

### `learningSessions/{sessionId}`

One pedagogical runtime per teacher + student + reference lesson while active.

Core fields:

- `schemaVersion: 1`
- `studentId`, `studentName`
- `teacherUid`, `teacherName`
- `lessonBlueprintId`, `lessonTitle`
- `curriculumGoalIds`
- `cefrLevel`
- `status: active | completed`
- `currentIndex`, `currentPhaseId`, `currentActivityId`
- `currentRoute`
- `routeBySkill`
- `evidenceCount`
- `assessedSkillIds`
- `teacherNote`
- `handoff`
- server timestamps

An active session is resumed rather than duplicated when the same teacher opens the same student + lesson again.

### `learningEvidence/{requestId}`

Evidence IDs use bounded client-generated request IDs for idempotency. Repeating the same judge/vocabulary request does not create a duplicate event or increment `evidenceCount` again.

Evidence fields include:

- session/student/teacher/lesson identity;
- phase/activity identity;
- `skillIds`;
- optional exact `vocabularyIds`;
- route at evidence time;
- teacher judgement and/or explicit `taskResult`;
- source/kind;
- note;
- server timestamp + ISO display timestamp.

Current event kinds:

- `teacher_judgement`
- `vocabulary_mark`
- `summary_score`

Evidence is created only while the session is active. The API has no evidence update/delete action.

## Teacher actions

The Lesson Mode keeps the simple interaction contract:

- `Vajab abi` -> `needs_help`
- `Sai hakkama` -> `managed`
- `Liiga kerge` -> `too_easy`

The evidence stores the route on which the judgement was made. The session stores the resulting route for the next step.

Exact vocabulary marks are separately persisted as evidence:

- difficult/weak word -> `needs_help`
- known word -> `managed`

Unmarked words remain unassessed.

## Progress is not evidence

Moving between activities only updates:

- current activity/phase/index;
- current route and per-skill route context;
- `updatedAt`.

It does **not** increment evidence count and does not imply success.

## Completion is not mastery

`Lõpeta tund` only opens the final summary. It does not complete the persisted Learning Session by itself.

The teacher may enter explicit 0-100 scores for actually assessed skills. Blank fields stay absent, not zero.

When the teacher explicitly creates the handoff, the API:

1. appends one `summary_score` evidence event for each entered score;
2. stores the bounded teacher note and handoff;
3. marks the Learning Session `completed`;
4. keeps every existing evidence event unchanged.

No `students.skillMap` mutation occurs in this release slice.

## Reference lesson evidence map

Stage skills already map deterministically:

- vocabulary stage -> `vocabulary`
- language stage -> `grammar`
- speaking/transfer stage -> `speaking`
- exit stage -> `speaking`

The five diagnostic tasks now also declare explicit `skillIds`, so diagnostic judgements do not depend on guessed skill semantics.

## API actions

`learningSessionApi` accepts authenticated POST actions:

- `start_or_resume`
- `progress`
- `judge`
- `vocabulary`
- `complete`

This release slice rejects other lesson blueprint IDs. Scaling the API to more lessons is intentionally deferred until the reference vertical flow is accepted.

## Teacher scope

- administrator/super-admin may open any student;
- a teacher may open a student whose `teacherUid` matches the authenticated teacher;
- legacy records without `teacherUid` use the same narrow teacher-name alias fallback already used by the CRM migration period.

An unrelated teacher is rejected by the API.

## Browser modes

`/haldus-adaptive-lesson/` remains usable without persistence:

- without `?studentId=...` -> Preview;
- with a real student + authenticated staff account + available API -> persisted session;
- if persistence cannot initialize -> Lesson Mode remains usable and displays a save error instead of silently claiming success.

For real persistence testing the function must exist either in the local Functions emulator or in a deployed Firebase Functions environment. This PR does not deploy production Functions.

## Verification contract

Automated checks cover:

- pure Learning Session/evidence model;
- explicit missing-vs-zero summary semantics;
- browser integration hooks and absence of direct Firestore writes;
- API input validation;
- teacher scope in the emulator;
- active-session resume;
- progress without evidence inflation;
- append-only idempotent judgement evidence;
- exact vocabulary evidence;
- direct client Firestore evidence write denial;
- final summary evidence;
- no `students.skillMap` mutation;
- no evidence addition after completion.

## Known limits / intentionally deferred

- Learning Profile does not yet read the new `learningEvidence` collection; it still shows the prior Live Classroom summaries from release slice 1.
- No automatic `students.skillMap` projection is performed.
- No correction/review event type exists yet.
- No automatic curriculum next-goal calculation exists.
- The reference Lesson Mode still uses its current general activity-card workspace; phase-specific workspace rendering is the next planned release slice.
- Only the B1 city/problem-solving reference lesson is accepted by the API.
- Production Functions deployment is not part of this PR.

## Next safe step

After this release slice is accepted and merged, implement phase-specific Lesson Mode workspaces on top of the persisted Learning Session contract. Do not introduce automatic mastery projection in the same UI-workspace change.