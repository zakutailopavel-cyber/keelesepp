# Learning Profile Evidence Projection

Status: release slice 3 implementation contract

## Goal

Connect the append-only `learningEvidence` created by Adaptive Lesson sessions to the existing read-only Learning Profile without automatically changing `students.skillMap`.

The invariant remains:

> evidence explains observed learning; `students.skillMap` is still the canonical current mastery projection until a separately validated projection policy exists.

## Read boundary

The browser does **not** receive direct Firestore read permission for `learningEvidence` or `learningSessions`.

A dedicated HTTPS Cloud Function, `learningProfileEvidenceApi`, performs the read projection with Firebase Admin SDK after validating:

- Firebase ID token;
- teacher/admin role;
- current teacher/student scope using `teacherUid`, with the existing narrow legacy teacher-name fallback only when UID ownership is absent;
- bounded evidence result size.

The endpoint returns only a bounded projection of evidence/session fields required by Learning Profile. Arbitrary session/evidence fields are not exposed.

This keeps `firestore.rules` unchanged. Direct browser access to the new collections remains denied by default.

## Browser client

`learning-profile-evidence-store.js`:

- obtains the current Firebase ID token;
- calls `learningProfileEvidenceApi`;
- requests evidence for one selected student only;
- returns `{ student, evidence, sessions }`;
- performs no Firestore writes and no mastery writes.

The Learning Profile loads two independent evidence sources in parallel:

1. existing structured Live Classroom summaries;
2. Adaptive Lesson append-only evidence via the trusted read API.

If Adaptive evidence is temporarily unavailable, the profile degrades gracefully to the existing `skillMap` + Live Classroom data and shows a warning instead of failing the whole view.

## Projection semantics

Supported Adaptive evidence kinds remain:

- `teacher_judgement`;
- `vocabulary_mark`;
- `summary_score`.

The read model normalizes them into the same recent-evidence timeline used by Learning Profile, while retaining source-specific fields:

- lesson/session title;
- teacher;
- timestamp;
- phase/activity;
- skill IDs;
- vocabulary IDs;
- route;
- teacher judgement;
- explicit task result when present;
- session status.

A `summary_score` is displayed as evidence. It does not overwrite the corresponding skill in `students.skillMap`.

## Vocabulary review

Exact vocabulary evidence is useful immediately without inventing mastery percentages.

For each vocabulary ID, the most recent Adaptive vocabulary mark wins:

- latest `needs_help` -> show in `reviewVocabularyIds`;
- latest `managed` -> remove from the current review list;
- older marks remain in append-only history.

This gives the next teacher a practical review list while preserving evidence history and avoiding destructive rewrites.

## Learning Profile UI

The teacher sees:

- canonical `skillMap` average/skill counts;
- existing attention/strong-skill cards based only on `skillMap`;
- exact vocabulary words currently needing review from Adaptive evidence;
- a merged recent evidence timeline with clear `Live Classroom` vs `Adaptive Lesson` source labels;
- teacher judgement / route / explicit summary-score context for Adaptive evidence;
- a next-direction card that may suggest checking review vocabulary first, but does not choose a new curriculum goal automatically.

The screen remains read-only.

## Failure behavior

The read sources are intentionally independent:

- if Adaptive API fails, Live Classroom + `skillMap` still render;
- if Live Classroom query fails but Adaptive API succeeds, Adaptive evidence can still render;
- only when both evidence sources fail does the profile show a blocking evidence-load error.

This is important during staged rollout because the static UI and the new Cloud Function may not be deployed at exactly the same moment.

## Security / data integrity invariants

- no new Firestore client grant;
- no direct browser query to `learningEvidence` or `learningSessions`;
- no API mutation endpoint in this slice;
- no `students.skillMap` mutation;
- current assigned teacher may read historical evidence for their assigned student, including evidence created by a previous teacher;
- unrelated teachers are rejected by the trusted API;
- response size is bounded;
- direct client reads of the private evidence collection remain denied in emulator verification.

## Verification gate

Automated coverage must prove:

- evidence API limit validation and field projection;
- teacher scope denial;
- authenticated browser client contract;
- newest-first evidence ordering;
- merged Live Classroom + Adaptive evidence timeline;
- latest vocabulary mark controls the current review list;
- Adaptive summary scores do not alter canonical `skillMap`;
- UI has no direct evidence/session Firestore query or write;
- graceful fallback when Adaptive API is unavailable;
- emulator direct client read remains denied;
- emulator API read leaves student `skillMap` unchanged.

## Deferred

This slice does not implement:

- automatic mastery projection from evidence into `students.skillMap`;
- evidence correction/retraction events;
- automatic curriculum next-goal selection;
- phase-specific Lesson Mode workspace renderer;
- production Firebase Functions deployment.

After this slice is merged, the next product slice is the phase-specific Lesson Mode workspace renderer built on top of the now-connected session/evidence/profile loop.
