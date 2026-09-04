# Teacher Home / Today v1

Status: implementation in PR #91.

## Purpose

Teacher Home is the operational entry point for a teacher before and between lessons. It should answer four questions without making the teacher reconstruct context from several CRM screens:

1. Who do I teach today and when?
2. What do we already know about this learner?
3. What needs attention next?
4. Can I continue or start the supported Lesson Mode directly?

The page is a read-only projection. It does not become a new source of schedule, mastery, goal achievement or adaptive state.

## Entry point

`/haldus-teacher-home/`

The first release is intentionally separate from `haldus.html`. PR #78 still touches the large legacy CRM file, so #91 avoids creating an unrelated conflict there. A later integration can add the Teacher Home link to the main CRM navigation after that independent work is resolved.

## Data flow

For the selected day the browser:

1. reads `schedule` through the existing `teacherUidV1` rollout boundary;
2. expands recurring schedule records with `CalendarCore.eventsForDate()`;
3. filters the result to the signed-in teacher with stable `teacherUid` first and a narrow legacy-name fallback only when an event has no UID;
4. joins exact `studentId` values to `students/{studentId}`;
5. reads structured Live Classroom summaries for each scheduled student;
6. calls the trusted `learningProfileEvidenceApi` for bounded Adaptive Lesson evidence/session context;
7. builds the existing read-only Learning Profile projection;
8. asks Curriculum Engine v1 for the explainable next goal where the B1 city/services graph applies;
9. renders a deterministic primary action.

No name-based student join is allowed. A legacy schedule row without `studentId` remains visible in the day list but cannot open a Learning Profile or Adaptive Lesson from Teacher Home.

## Card contract

Each lesson card may show:

- time and calculated end time;
- student name and known CEFR/category context;
- lesson title/status from schedule;
- latest structured learning evidence;
- canonical skillMap attention items;
- exact vocabulary review words from Adaptive evidence;
- explainable Curriculum Engine goal/status;
- current persisted per-skill adaptive routes for the teacher's active session;
- profile and supported Lesson Mode actions.

Missing evidence is rendered as missing/unknown. It is never converted to `0`.

## Primary action rules

Teacher Home does not invent a lesson implementation for every curriculum goal.

Current deterministic rules:

- active session using `est-b1-city-problem-solving-01` -> **Jätka tundi**;
- next Curriculum Goal `EST_B1_CITY_SOLVE_PROBLEM` -> **Alusta tundi**;
- every other supported/unsupported context -> **Ava õppimisprofiil**.

The page therefore cannot accidentally route an arbitrary goal into the only adaptive lesson blueprint that exists today.

## Adaptive session read projection

PR #91 extends the existing trusted `learningProfileEvidenceApi` session projection with bounded runtime fields:

- `currentIndex`;
- `currentPhaseId`;
- `currentActivityId`;
- sanitized `routeBySkill`.

The API also includes active sessions for the authorized student even when the session has not produced its first evidence event yet. This fixes an important read-side gap: starting a session and immediately opening Teacher Home/Learning Profile should still expose active goal/session context.

The browser still has no direct read permission for private `learningSessions` or `learningEvidence` collections.

## Security and mastery boundaries

Unchanged invariants:

- `students.skillMap` is the canonical current mastery projection;
- Teacher Home never writes `students.skillMap`;
- adaptive `routeBySkill` is runtime support state, not mastery;
- session completion is not goal achievement;
- missing evidence is not failure;
- no Firestore rule/schema migration is introduced;
- no schedule write is introduced;
- no finance/calendar mutation is introduced;
- no crm-v2 work is included.

## Performance boundary

The first release intentionally performs bounded per-student learning-context loads only for unique students who appear in the selected teacher day. It is not a school-wide analytics page.

If the school later needs dozens of simultaneous teacher dashboards or large weekly projections, a server-side aggregated read model may be justified. That is not needed to prove the current vertical flow.

## Verification

Required release gate:

- pure `teacher-home-core.js` tests;
- read-only UI contract tests;
- existing Learning Profile/Curriculum/Adaptive tests;
- Functions unit tests for sanitized active-session projection;
- emulator integration proving an active zero-evidence session is returned with `routeBySkill` and cannot bypass student authorization;
- browser JavaScript syntax checks;
- existing CRM/accounting/calendar test suite remains green.

## Rollout

PR #91 changes both static web code and `learningProfileEvidenceApi`.

After owner merge and explicit production approval:

1. selectively deploy `learningProfileEvidenceApi` from merged `main`;
2. verify the Function still returns historical evidence plus a zero-evidence active session;
3. let the normal primary `keelesepp` Vercel main deployment publish `/haldus-teacher-home/`;
4. smoke-test one real teacher day and one student with a persisted divergent `routeBySkill`;
5. do not deploy or reconnect `keelesepp-crm-v2`.

## Known limits

- the Curriculum Goal graph still covers only the B1 city/services vertical slice;
- Adaptive persistence still supports only `est-b1-city-problem-solving-01`;
- not every next curriculum goal has a Lesson Mode blueprint, so unsupported goals open Learning Profile;
- Teacher Home is not yet linked from the large legacy `haldus.html` navigation because independent PR #78 still modifies that file;
- no automatic mastery or goal-achievement projection is introduced.