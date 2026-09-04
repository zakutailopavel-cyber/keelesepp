# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `8468e425f032430e88b694da5b250be17431ee23` (`Teacher Home v1: Today learning flow (#91)`)
Active branch: `agent/teacher-home-entry-v1`
Active work: add a direct staff entry from legacy CRM to Teacher Home without touching `haldus.html` while independent PR #78 remains open.
Independent open learning/UI PR: `#83 Tighten Adaptive Lesson desktop layout`
Independent legacy CRM PR: `#78 fix(crm): show retry state when reliability data fails to load` (old draft, currently conflicts with fresh main)

## Current objective

Finish the teacher's real end-to-end path before starting Lesson Builder:

`Haldus -> Õpetaja täna -> scheduled student -> Alusta/Jätka tundi -> Lesson Mode -> evidence/handoff -> next student`

The deterministic learning foundation is already merged:

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86;
4. Learning Profile adaptive evidence projection — #87;
5. phase-specific Lesson Mode workspaces — #88;
6. deterministic per-skill Adaptive Engine v1 — #89;
7. Curriculum Goal / prerequisite graph v1 — #90;
8. Teacher Home / Today v1 — #91.

Do not start Lesson Builder until the Teacher Home entry and production smoke loop are complete.

## Production state

### Vercel

Primary project `keelesepp` is the only active GitHub-connected Vercel project in this development flow.

`keelesepp-crm-v2` was disconnected from GitHub on 2026-09-04 so pushes no longer create duplicate v2 builds.

Production deployment for merged main commit `8468e425...` (#91) was verified `READY`. `/haldus-teacher-home/` returned HTTP 200 from production.

### Firebase Functions

Merged #89 `learningSessionApi` was selectively deployed to production project `keelesepp-5136b` with Node.js 22 and the owner previously provided terminal proof of a successful update.

#91 changes `learningProfileEvidenceApi`. The owner reports that the selective merged-main deploy has now been performed, but this repository handoff does not independently claim the function rollout as verified until the production Teacher Home smoke test confirms the new active-session projection.

No Firestore/storage rules or schema migration is required for #91 or the Teacher Home entry slice.

## Teacher Home v1 contract

Route: `/haldus-teacher-home/`

Teacher Home is read-only and projects today's teaching queue using:

- `schedule` scoped to the signed-in teacher;
- exact `studentId` joins;
- canonical `students.skillMap`;
- structured Live Classroom summaries;
- trusted Adaptive evidence/session context from `learningProfileEvidenceApi`;
- Curriculum Engine v1 recommendations where the B1 city graph applies.

Primary action contract:

- active supported Adaptive session -> `Jätka tundi`;
- supported next goal `EST_B1_CITY_SOLVE_PROBLEM` -> `Alusta tundi`;
- unsupported context -> `Ava õppimisprofiil`.

An arbitrary curriculum goal must never be forced into the only Adaptive Lesson blueprint that exists today.

## Current slice — direct Teacher Home entry

Because old draft PR #78 still modifies `haldus.html`, this slice deliberately avoids editing the large legacy React file.

`staff-activity.js`, which is already loaded by the legacy CRM and other staff work surfaces, now owns a bounded staff-only quick entry on the legacy CRM home:

- only authenticated `admin` / `teacher` / super-admin staff profiles receive the entry;
- only `/haldus` and `/haldus.html` render it;
- the entry links directly to `/haldus-teacher-home/`;
- sign-out removes the entry;
- Teacher Home is tracked as its own staff activity area (`teacher-home`);
- no schedule, mastery, finance or calendar data is mutated.

This is a safe integration path while #78 remains independent. A later cleanup may move the same entry into the native React navigation after #78 is resolved, but that is not required for the end-to-end teaching loop to work.

## Data and pedagogy invariants

Unchanged:

- `students.skillMap` remains the canonical current mastery projection;
- missing evidence is unknown, never zero;
- Adaptive `routeBySkill` is runtime support/challenge state, not mastery;
- session completion is not curriculum goal achievement;
- no automatic CEFR change;
- no automatic Adaptive evidence -> `students.skillMap` write;
- no direct browser reads of private `learningSessions` / `learningEvidence` collections;
- no finance/calendar/crm-v2 work in the learning slices.

## Verification status

#91 executable CI gate completed green before merge, including Functions tests, Teacher Home core/UI tests, browser syntax checks and Auth/Firestore/Functions emulator integration.

The current Teacher Home entry slice must pass before Ready for review:

- `staff-activity.test.js`;
- full existing root CRM/calendar/learning test bundle through the repository workflow;
- browser JavaScript syntax checks;
- no modification to `haldus.html`;
- production deployment only after owner merge.

## Manual production gates still required

1. Open legacy `haldus.html` as a staff user and confirm the `Õpetaja täna` quick entry is visible after this slice is merged/deployed.
2. Open Teacher Home and confirm today's real scheduled student appears.
3. Confirm the student's active Adaptive session can show persisted divergent per-skill routes.
4. Use `Alusta tundi` or `Jätka tundi` to open Lesson Mode with the correct `studentId`.
5. Record one teacher judgement/evidence event, return to Teacher Home/Profile, and confirm the context persists.
6. Complete a lesson and confirm handoff/history remain available before moving to the next student.

Only after these gates pass should Lesson Builder begin.

## Known limits

- Curriculum Goal graph v1 covers only one B1 city/services vertical slice.
- Adaptive persistence currently supports only `est-b1-city-problem-solving-01`.
- Not every curriculum goal has a Lesson Mode blueprint.
- Teacher Home is not school-wide analytics; it is a bounded daily teaching queue.
- PR #78 remains an independent reliability fix and currently conflicts with fresh main.
- PR #83 remains independent from this slice.

## Next safe step

Finish CI/review for `agent/teacher-home-entry-v1`, owner merges it, verify the Vercel main deployment, then execute the six manual production gates above. Do not begin Lesson Builder before that loop is confirmed end to end.