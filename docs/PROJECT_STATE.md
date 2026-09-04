# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `62e0ec02dc6be358360a528b226777da3af5974f` (`Learning Profile MVP: read-only teacher snapshot (#85)`)
Active branch: `agent/learning-session-evidence`
Open draft PR: `#86 Learning Session MVP: append-only adaptive evidence`
Independent open UI draft PR: `#83 Tighten Adaptive Lesson desktop layout`

## Current objective

Execute the Core Blueprint as bounded vertical slices. Release slice 1 (Learning Profile read-only MVP) is merged in #85. Release slice 2 now implements durable adaptive Learning Session state plus append-only evidence for the single reference lesson.

The agreed product core remains five connected engines:

1. Curriculum Engine — what to learn next;
2. Adaptive Engine — how much support/challenge is appropriate now;
3. Lesson Mode — which phase-specific teaching workspace is active now;
4. Content Engine — tasks, vocabulary, scenes, prompts and variants;
5. Learning Profile — current mastery projection plus evidence explaining it.

`crm-v2` remains separate and is not part of this work.

## Release slice 2 — Learning Session + append-only evidence

PR #86 implements persistence for `est-b1-city-problem-solving-01` without automatic mastery writes.

### New runtime/data boundary

Two additive Firestore collections are written only by the trusted Cloud Function:

- `learningSessions/{sessionId}` — current pedagogical runtime and final handoff;
- `learningEvidence/{requestId}` — append-only observation/evidence events.

There are no new client Firestore grants for these collections. Browser clients remain denied by default because no Firestore rule matches these paths.

`students.skillMap` remains the canonical current mastery projection and is deliberately **not changed** by release slice 2.

### Trusted API

New Function: `learningSessionApi` in `functions/learning-session-api.js`.

Supported actions:

- `start_or_resume`;
- `progress`;
- `judge`;
- `vocabulary`;
- `complete`.

Security/invariants:

- Firebase ID token required;
- only teacher/admin staff accepted;
- ordinary teachers are limited to assigned students (`teacherUid`, with the existing narrow legacy teacher-name fallback only where the UID is absent);
- this slice accepts only the reference B1 lesson ID;
- judgement/vocabulary evidence uses stable request IDs for retry idempotency;
- evidence is added only while a session is active;
- no evidence update/delete endpoint exists;
- progress/navigation is not counted as evidence;
- completion does not update `students.skillMap`.

### Lesson Mode integration

`haldus-adaptive-lesson/index.html` now:

- initializes Firebase Auth only for Learning Session API authentication;
- reads optional `studentId` from the URL;
- stays in Preview without `studentId`;
- starts/resumes a persisted session when a real student and authenticated staff user are available;
- restores the saved activity index/route after reopen;
- persists teacher `Vajab abi / Sai hakkama / Liiga kerge` judgements as evidence;
- persists exact vocabulary weak/known marks as evidence;
- persists navigation/progress separately from evidence;
- keeps `Lõpeta tund` as a move to summary only;
- completes the persisted session only on explicit handoff action;
- creates final `summary_score` evidence only for nonblank, explicitly assessed skills.

The diagnostic tasks in `adaptive-lessons/est-b1-city-problem-solving.js` now declare explicit `skillIds`, avoiding guessed diagnostic skill attribution.

### New/changed files

New:

- `learning-session-core.js`
- `learning-session-core.test.js`
- `learning-session-store.js`
- `learning-session-ui.test.js`
- `functions/learning-session-api.js`
- `functions/learning-session-api.test.js`
- `functions/learning-session-emulator.integration.js`
- `docs/LEARNING_SESSION_EVIDENCE_MVP.md`

Changed:

- `functions/main.js` — exports `learningSessionApi`;
- `functions/package.json` — emulator test script runs finance + Learning Session integration sequentially;
- `haldus-adaptive-lesson/index.html` — persistence wiring;
- `adaptive-lessons/est-b1-city-problem-solving.js` — diagnostic evidence skill mapping;
- `.github/workflows/financial-core-emulator.yml` — Learning Session tests/syntax/integration coverage;
- `docs/ADAPTIVE_LESSON_SYSTEM.md` — persisted session/evidence contract;
- this project-state document.

`firestore.rules` is unchanged by design.

## Evidence semantics

Current event kinds:

- `teacher_judgement`;
- `vocabulary_mark`;
- `summary_score`.

Each event records the session/student/teacher/lesson identity, phase/activity, relevant skills, optional exact vocabulary IDs, route, evidence payload and timestamps.

Missing assessment remains missing. Explicit `0` remains a real score of zero.

A repeated judgement/vocabulary request with the same request ID is idempotent and does not increase `evidenceCount` twice.

## Verification status

Added automated checks cover:

- pure Learning Session/evidence normalization and validation;
- no invented score for missing summary assessments;
- browser Lesson Mode persistence hooks and no direct Firestore writes;
- explicit diagnostic skill mapping;
- trusted API input validation;
- emulator teacher-scope denial for an unrelated teacher;
- start/resume behavior;
- progress without evidence inflation;
- idempotent teacher judgement evidence;
- exact vocabulary evidence;
- direct browser Firestore evidence write denial;
- summary completion evidence;
- unchanged `students.skillMap` before/after the session;
- rejection of new evidence after completion.

GitHub Actions `Financial Core emulator` for PR #86 is the required integration gate. At the time of this state update the new run is queued/pending; do not claim green CI until the run completes successfully.

## Production / external services

No production deployment has been performed.

This PR adds a new Cloud Function export, but `learningSessionApi` is not available in production until an owner-approved Firebase Functions deployment occurs after merge/review.

No production Firestore migration/rules deployment is required for this slice because browser clients are not granted direct access to the new collections.

Vercel production is not changed or verified by this work.

## Known limits

- Learning Profile #85 does not yet read the new `learningEvidence` collection; it still projects existing `students.skillMap` plus prior Live Classroom summary evidence.
- No automatic mastery projection into `students.skillMap` exists in this slice.
- No evidence correction/review event exists yet.
- No automatic next curriculum goal recommendation exists.
- Only the B1 city/problem-solving reference lesson is accepted by the persistence API.
- Lesson Mode still uses the current general activity-card renderer; specialized phase workspaces are the next roadmap slice.
- PR #83 independently changes desktop Lesson Mode density and may need rebasing/closing after #86 because both touch the same HTML file. Do not silently mix it into #86.

## Core roadmap

1. Core Blueprint — merged in #84;
2. Learning Profile MVP — merged in #85;
3. Learning Session + append-only evidence persistence — implemented in draft PR #86, CI gate pending;
4. phase-specific Lesson Mode workspace renderer;
5. deterministic per-skill Adaptive Engine v1;
6. curriculum goal/prerequisite graph for the selected vertical slice;
7. Teacher Home vertical flow;
8. Lesson Builder + Content normalization;
9. AI-assisted content generation only after the core loop is stable;
10. scale/analytics after multiple lessons share the same contracts.

## Next safe step

**Finish PR #86 verification: require green root/unit/emulator CI, review its final diff for scope/security, then owner reviews/merges #86. After merge, begin release slice 3: phase-specific Lesson Mode workspace renderer on top of the persisted session contract. Do not add automatic `skillMap` projection to that UI slice.**