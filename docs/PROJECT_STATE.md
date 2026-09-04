# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `4bb573bbfca7bba8b47cb6af2051d7aba5d494de` (`Learning Session MVP: append-only adaptive evidence (#86)`)
Active branch: `agent/learning-profile-evidence`
Open PR: `#87 Learning Profile: project adaptive evidence read-only` — ready after green CI
Independent open UI draft PR: `#83 Tighten Adaptive Lesson desktop layout`

## Current objective

Execute the Core Blueprint as bounded vertical slices.

Merged foundation:

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86.

Release slice 3 connects the new Adaptive Lesson evidence back into Learning Profile without automatic mastery writes.

The agreed product core remains five connected engines:

1. Curriculum Engine — what to learn next;
2. Adaptive Engine — how much support/challenge is appropriate now;
3. Lesson Mode — which phase-specific teaching workspace is active now;
4. Content Engine — tasks, vocabulary, scenes, prompts and variants;
5. Learning Profile — current mastery projection plus evidence explaining it.

`crm-v2` remains separate and is not part of this work.

## Release slice 3 — Learning Profile evidence projection

The read-only Learning Profile now consumes both:

- structured Live Classroom lesson summaries;
- append-only Adaptive Lesson `learningEvidence` created by persisted Learning Sessions.

`students.skillMap` remains the canonical current mastery projection. Adaptive evidence is displayed as evidence/context only and never overwrites the skill map in this slice.

### Trusted read boundary

New Cloud Function: `learningProfileEvidenceApi` in `functions/learning-profile-evidence-api.js`.

The browser does not receive direct Firestore read permission for `learningEvidence` or `learningSessions`.

The Function validates:

- Firebase ID token;
- teacher/admin role;
- current teacher/student scope via `teacherUid`, with the existing narrow legacy name fallback only when UID ownership is absent;
- bounded evidence result size.

It returns only a bounded projection of fields required by Learning Profile plus minimal session context. Historical evidence from a previous teacher remains visible to the current authorized teacher for that assigned student.

Student identity is path-authoritative: a stored `students/{id}.id` field cannot shadow the actual Firestore document ID. The same hardening is applied to `learningSessionApi`. When evidence references a session, session context is returned only if that session belongs to the selected student.

`firestore.rules` is unchanged.

### Browser integration

New `learning-profile-evidence-store.js`:

- authenticates with the current Firebase user;
- calls `learningProfileEvidenceApi`;
- requests one selected student's evidence;
- performs no Firestore writes and no mastery writes.

`haldus-learning-profile/index.html` now loads Live Classroom evidence and Adaptive evidence independently in parallel.

Failure behavior:

- Adaptive API unavailable -> existing `skillMap` + Live Classroom still render with a warning;
- Live Classroom unavailable but Adaptive API succeeds -> Adaptive evidence can still render;
- both fail -> evidence-load error.

This supports staged deployment because the new Function and static UI may not be released at the exact same moment.

### Projection semantics

Adaptive evidence kinds remain:

- `teacher_judgement`;
- `vocabulary_mark`;
- `summary_score`.

Learning Profile normalizes them into the recent evidence timeline while retaining:

- source (`Adaptive Lesson` vs `Live Classroom`);
- lesson/session context;
- teacher;
- timestamp;
- phase/activity;
- skill IDs;
- exact vocabulary IDs;
- route;
- teacher judgement;
- explicit summary score when present.

A `summary_score` is evidence only. It does not become current mastery automatically.

### Vocabulary review

Adaptive vocabulary evidence now provides an immediately useful read-side recommendation without inventing percentages.

For each word, the newest vocabulary mark wins for the current review list:

- latest `needs_help` -> word appears in `reviewVocabularyIds`;
- latest `managed` -> word is removed from the current review list;
- older events remain immutable in history.

The Learning Profile UI surfaces those words as `Korda:` chips and may suggest beginning the next lesson with them.

## Files in this slice

New:

- `learning-profile-evidence-store.js`
- `learning-profile-evidence-store.test.js`
- `functions/learning-profile-evidence-api.js`
- `functions/learning-profile-evidence-api.test.js`
- `functions/learning-profile-evidence-emulator.integration.js`
- `docs/LEARNING_PROFILE_EVIDENCE_PROJECTION.md`

Changed:

- `learning-profile-core.js` — merges Adaptive evidence into the read model while preserving `skillMap` as canonical;
- `learning-profile-core.test.js` — projection, ordering and vocabulary-review semantics;
- `haldus-learning-profile/index.html` — merged evidence timeline, source labels, review vocabulary and graceful fallback;
- `learning-profile-ui.test.js` — read-only / no direct evidence Firestore access / fallback contracts;
- `functions/main.js` — exports `learningProfileEvidenceApi`;
- `functions/package.json` — adds profile-evidence emulator integration;
- `functions/learning-session-api.js` — makes the Firestore document path authoritative for student identity;
- `functions/learning-session-emulator.integration.js` — verifies stored-ID shadowing cannot redirect a session;
- `.github/workflows/financial-core-emulator.yml` — runs the new store/core/UI/API/integration coverage;
- this project-state document.

## Security / data integrity invariants

- no direct browser query to `learningEvidence` or `learningSessions`;
- no new Firestore client grant;
- no new evidence/session mutation endpoint;
- no automatic `students.skillMap` update;
- unrelated teachers are denied by the trusted read API;
- Firestore document path is authoritative for student identity in both learning read/write boundaries;
- joined session context must match the selected student;
- response size is bounded;
- direct client reads of private evidence remain denied in emulator verification;
- attendance alone still does not become mastery evidence.

## Verification status

GitHub Actions `Financial Core emulator` on the final implementation head completed successfully.

Verified gates:

- Functions unit tests, including profile-evidence API projection — green;
- root CRM/accounting/calendar/learning tests, including authenticated evidence client/core/UI contracts — green;
- browser JavaScript syntax checks — green;
- emulator integrations — green, including teacher scope, newest-first/bounded evidence, stored-ID shadowing, cross-student session isolation, direct client-read denial, Learning Session identity hardening and unchanged `students.skillMap`.

## Production / external services

No production deployment is performed by this branch.

`learningProfileEvidenceApi` will not exist in production until an owner-approved Firebase Functions deployment occurs after merge/review.

The Learning Profile UI is intentionally tolerant of that rollout gap and falls back to existing evidence sources.

No Firestore rules migration/deployment is required for this slice.

Vercel production is not changed or verified by this work.

## Known limits

- no automatic mastery projection from evidence into `students.skillMap`;
- no evidence correction/retraction event model yet;
- no automatic next curriculum goal recommendation;
- persistence still accepts only the B1 city/problem-solving reference lesson;
- Lesson Mode still uses the general activity-card renderer;
- PR #83 remains an independent old desktop-density draft and should not be silently mixed into this branch.

## Core roadmap

1. Core Blueprint — merged #84;
2. Learning Profile MVP — merged #85;
3. Learning Session + append-only evidence persistence — merged #86;
4. Learning Profile evidence projection — implemented and green in #87;
5. phase-specific Lesson Mode workspace renderer;
6. deterministic per-skill Adaptive Engine v1;
7. curriculum goal/prerequisite graph for the selected vertical slice;
8. Teacher Home vertical flow;
9. Lesson Builder + Content normalization;
10. AI-assisted content generation only after the core loop is stable;
11. scale/analytics after multiple lessons share the same contracts.

## Next safe step

**Owner reviews/merges #87. After merge, begin the phase-specific Lesson Mode workspace renderer on top of the now-connected session -> evidence -> profile loop. Keep automatic `skillMap` projection out of that UI slice.**
