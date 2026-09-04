# Teacher Home / Today v1

Status: #91 and #92 merged; Start Lesson vocabulary extension is implemented in PR #93.

## Purpose

Teacher Home is the operational entry point for a teacher before and between lessons. It should answer four questions without making the teacher reconstruct context from several CRM screens:

1. Who do I teach today and when?
2. What do we already know about this learner?
3. What needs attention next?
4. Can I continue or start the supported Lesson Mode directly?

The page is a read-only projection. It does not become a new source of schedule, mastery, goal achievement or adaptive state.

## Entry point

`/haldus-teacher-home/`

PR #92 adds a staff-only `Õpetaja täna →` quick entry from the legacy CRM without editing the large `haldus.html`, because independent PR #78 still conflicts there.

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

Teacher Home does not invent a lesson implementation for every curriculum goal. It uses a bounded goal-to-blueprint registry.

Current deterministic rules:

- active supported session `est-b1-city-vocabulary-01` -> **Jätka tundi** with explicit `lessonId`;
- active supported session `est-b1-city-problem-solving-01` -> **Jätka tundi** with explicit `lessonId`;
- next Curriculum Goal `EST_B1_CITY_VOCAB` -> **Alusta tundi** using `est-b1-city-vocabulary-01`;
- next Curriculum Goal `EST_B1_CITY_SOLVE_PROBLEM` -> **Alusta tundi** using `est-b1-city-problem-solving-01`;
- every other context -> **Ava õppimisprofiil**.

The Lesson Mode URL therefore carries both stable identities:

`/haldus-adaptive-lesson/?studentId=<studentId>&lessonId=<lessonBlueprintId>`

Unsupported goal IDs never fall through into an arbitrary lesson.

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

For PR #93, `learningSessionApi` additionally owns the trusted lesson identity for each allowed blueprint: title, CEFR level and curriculum goal IDs are selected server-side and cannot be replaced by browser-supplied metadata.

## Performance boundary

The first release intentionally performs bounded per-student learning-context loads only for unique students who appear in the selected teacher day. It is not a school-wide analytics page.

If the school later needs dozens of simultaneous teacher dashboards or large weekly projections, a server-side aggregated read model may be justified. That is not needed to prove the current vertical flow.

## Verification

Required release gate:

- pure `teacher-home-core.js` tests;
- read-only UI contract tests;
- vocabulary blueprint contract tests;
- multi-blueprint Lesson Mode selection tests;
- Functions unit tests for trusted lesson registry;
- emulator integration proving both supported lessons can start/resume while unsupported lesson IDs are rejected;
- emulator integration proving client-supplied lesson title/CEFR/goal IDs cannot forge persisted lesson identity;
- existing active zero-evidence session and per-skill route authorization tests;
- browser JavaScript syntax checks;
- existing CRM/accounting/calendar test suite remains green.

## Rollout

For #93, static web code and `learningSessionApi` change.

After owner merge and explicit production approval:

1. selectively deploy `learningSessionApi` from merged `main`;
2. let the normal primary `keelesepp` Vercel main deployment publish the new blueprint and routing;
3. open Teacher Home for a B1 learner whose next goal is `EST_B1_CITY_VOCAB`;
4. verify `Alusta tundi` opens `est-b1-city-vocabulary-01` with the correct student;
5. record at least one vocabulary judgement/word mark;
6. finish with a vocabulary score and handoff;
7. return to Teacher Home and verify the persisted learning context;
8. do not deploy or reconnect `keelesepp-crm-v2`.

## Known limits

- the Curriculum Goal graph still covers only the B1 city/services vertical slice;
- Lesson Mode now has two supported blueprints: vocabulary activation and full problem solving;
- `EST_B1_CITY_EXPLAIN_PROBLEM`, `EST_B1_CITY_ASK_HELP` and `EST_B1_CITY_TRANSFER` still do not have dedicated blueprints, so those recommendations open Learning Profile;
- the legacy CRM uses the #92 quick entry rather than a permanent sidebar item while independent PR #78 remains unresolved;
- no automatic mastery or goal-achievement projection is introduced.