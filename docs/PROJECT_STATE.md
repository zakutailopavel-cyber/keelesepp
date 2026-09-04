# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `afa35ef3cd19aac7f08c1228a32c0303ddd5bc1e` (`Teacher Home: add direct staff entry from legacy CRM (#92)`)
Active branch: `agent/start-lesson-vocab-v1`
Active PR: `#93 Start Lesson flow: add B1 city vocabulary Lesson Mode`
Independent open learning/UI PR: `#83 Tighten Adaptive Lesson desktop layout` (old draft, currently conflicts with fresh main)
Independent legacy CRM PR: `#78 fix(crm): show retry state when reliability data fails to load` (old draft, currently conflicts with fresh main)

## Current objective

Finish the teacher's real end-to-end path before starting Lesson Builder:

`Haldus -> Õpetaja täna -> scheduled student -> Alusta/Jätka tundi -> correct Lesson Mode -> evidence/handoff -> Teacher Home`

Merged deterministic foundation:

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86;
4. Learning Profile adaptive evidence projection — #87;
5. phase-specific Lesson Mode workspaces — #88;
6. deterministic per-skill Adaptive Engine v1 — #89;
7. Curriculum Goal / prerequisite graph v1 — #90;
8. Teacher Home / Today v1 — #91;
9. direct staff entry from legacy CRM to Teacher Home — #92.

Do not start Lesson Builder until PR #93 is merged, rolled out and the real start/finish loop is manually verified.

## Production state before #93

### Vercel

Primary project `keelesepp` is the only active GitHub-connected Vercel project in this development flow.

`keelesepp-crm-v2` remains disconnected from GitHub.

Production deployment for merged main commit `afa35ef3...` (#92) was verified `READY`.

The owner opened `/haldus-teacher-home/` in production and the page successfully loaded the real teacher day: 7 scheduled lessons / 7 students. A real B1 card for Hanna Skoryk showed next goal `EST_B1_CITY_VOCAB` (`Linnaprobleemide põhisõnavara aktiveerimine`). Because that goal had no Lesson Mode blueprint before #93, the correct fallback action was still `Ava õppimisprofiil`. This observation defines the current gap.

### Firebase Functions

Merged #89 `learningSessionApi` was selectively deployed to production project `keelesepp-5136b` with Node.js 22 and earlier terminal proof showed a successful update.

The owner reports that merged #91 `learningProfileEvidenceApi` has also been selectively deployed. The production Teacher Home successfully loaded the real daily queue after that step, but this file does not claim additional function internals beyond the observed UI behavior.

No Firestore/Storage rule or schema migration is required for #93.

## Current slice — #93 Start Lesson vocabulary flow

### Problem

Curriculum Engine correctly recommends the first graph goal `EST_B1_CITY_VOCAB`, but Teacher Home could not start a lesson for it because only `EST_B1_CITY_SOLVE_PROBLEM` had a Lesson Mode blueprint.

### New vocabulary blueprint

New stable blueprint:

`est-b1-city-vocabulary-01`

Bound curriculum goal:

`EST_B1_CITY_VOCAB`

The 60-minute B1 lesson contains:

- answer-safe diagnostic vocabulary checks;
- vocabulary-native activation;
- lexical/collocation controlled practice;
- communicative roleplay plus a changed transfer situation;
- final vocabulary-only assessment;
- Support/Core/Advanced variants with the same stable task-slot count;
- exact difficult/known word evidence;
- explicit vocabulary score + teacher handoff.

All routes keep the same B1 learning goal. They vary support/challenge only.

### Teacher Home routing

Teacher Home now uses a bounded goal -> blueprint map:

- `EST_B1_CITY_VOCAB` -> `est-b1-city-vocabulary-01`;
- `EST_B1_CITY_SOLVE_PROBLEM` -> `est-b1-city-problem-solving-01`.

Supported start/resume links explicitly carry both identities:

`/haldus-adaptive-lesson/?studentId=<studentId>&lessonId=<lessonBlueprintId>`

Active supported sessions get `Jätka tundi`; supported recommended goals get `Alusta tundi`; unsupported goals still open Learning Profile.

### Lesson Mode selection

`haldus-adaptive-lesson/index.html` loads the bounded supported blueprint registry and selects the requested `lessonId`.

Unknown lesson IDs do not silently fall back to a different lesson; the teacher sees a controlled unsupported-lesson message.

For backward compatibility only, a direct old Lesson Mode URL without `lessonId` still defaults to `est-b1-city-problem-solving-01`.

The Summary screen derives score fields from skills actually targeted by the selected lesson, so the new vocabulary lesson shows vocabulary rather than irrelevant grammar/speaking score fields.

### Trusted persistence

`learningSessionApi` now has an explicit allowlist for the two supported lesson blueprints.

For an allowed blueprint, the server owns the persisted:

- lesson title;
- CEFR level;
- curriculum goal IDs.

Browser-supplied metadata cannot forge those identities.

Summary evidence uses the actual final session phase instead of the old reference-lesson-only `stage-4-exit` hardcode.

Existing invariants remain unchanged:

- Firebase Admin SDK performs private collection writes;
- browser does not write `learningSessions` / `learningEvidence` directly;
- evidence remains append-only/idempotent;
- `students.skillMap` is not written by this slice;
- session completion is not goal achievement.

## Verification status

Executable head: `cd14a0d7b445a151074fb33cbc7ab8cabf89ac91`.

GitHub Actions `Financial Core emulator` run #262 completed successfully on that executable head.

The green gate covers:

- Functions unit tests including trusted supported-lesson registry;
- existing CRM/accounting/calendar/learning root suite;
- new `adaptive-vocabulary-lesson.test.js` blueprint contract;
- Teacher Home goal/lesson start-resume routing;
- multi-blueprint Lesson Mode selection and browser syntax;
- Auth/Firestore/Functions emulator integration;
- vocabulary session start + resume;
- rejection of an unsupported lesson ID;
- server replacement of forged client title/CEFR/curriculum-goal metadata with canonical lesson metadata;
- coexistence with the existing problem-solving session;
- existing per-skill route/evidence/idempotency/skillMap boundaries.

Commits after executable head are documentation-only.

## Deployment boundary for #93

After owner merge and explicit production approval:

1. selectively deploy merged-main `learningSessionApi` to project `keelesepp-5136b`;
2. verify the normal primary `keelesepp` Vercel main deployment;
3. do not deploy Firestore/Storage rules or schema changes;
4. keep `keelesepp-crm-v2` disconnected.

Do not deploy the Function from the PR branch.

## Manual production gate after #93 merge

Use a real B1 student whose next goal is `EST_B1_CITY_VOCAB` (the observed Hanna card is a suitable smoke target if still current):

1. open `Haldus -> Õpetaja täna`;
2. confirm the card shows `Alusta tundi` instead of `Ava õppimisprofiil`;
3. click it and verify the correct student + `Linnaprobleemide põhisõnavara` Lesson Mode opens;
4. record one teacher judgement and one exact word mark;
5. confirm persisted state/status;
6. finish the lesson with a vocabulary score and handoff;
7. return to Teacher Home / Learning Profile and verify context remains visible;
8. confirm `students.skillMap` was not silently rewritten by the adaptive runtime.

Only after this gate passes should Lesson Builder begin.

## Known limits

- Curriculum Goal graph v1 still covers only one B1 city/services vertical slice.
- Dedicated Lesson Mode blueprints exist for `EST_B1_CITY_VOCAB` and `EST_B1_CITY_SOLVE_PROBLEM` only.
- `EST_B1_CITY_EXPLAIN_PROBLEM`, `EST_B1_CITY_ASK_HELP` and `EST_B1_CITY_TRANSFER` still fall back to Learning Profile.
- Blueprints currently use Core task positions as stable activity slots; route variants therefore need equal task counts until activity/content normalization is introduced.
- Teacher Home is a bounded daily teaching queue, not school-wide analytics.
- #78 and #83 remain independent old drafts and should not be mixed into #93.

## Next safe step

Finish #93 review, owner merges it, deploy merged-main `learningSessionApi`, verify Vercel main, then execute the eight-step production smoke gate above. Lesson Builder remains blocked until that end-to-end teaching loop succeeds.