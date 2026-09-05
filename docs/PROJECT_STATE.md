# KeeleSepp Project State

Last verified: 2026-09-05, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit before this workstream: `da4874ccda92f04f797cf5e31be1920a99573f05` (`Start Lesson flow: add B1 city vocabulary Lesson Mode (#93)`)
Active workstream: `agent/teacher-home-real-curriculum-v1`
Independent old drafts: `#83 Tighten Adaptive Lesson desktop layout`, `#78 reliability retry state` — keep separate.

## Current objective

Finish the teacher's real end-to-end path before Lesson Builder:

`Haldus -> Õpetaja täna -> scheduled student -> REAL curriculum next lesson -> correct Lesson Mode -> evidence/handoff -> Teacher Home`

The critical rule is now explicit: **the real student curriculum is the source of truth for the next curriculum lesson. A pilot adaptive goal graph must never replace it.**

## Merged deterministic foundation

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86;
4. Learning Profile adaptive evidence projection — #87;
5. phase-specific Lesson Mode workspaces — #88;
6. deterministic per-skill Adaptive Engine v1 — #89;
7. Curriculum Goal / prerequisite graph v1 — #90;
8. Teacher Home / Today v1 — #91;
9. direct staff entry from legacy CRM to Teacher Home — #92;
10. B1 city vocabulary Lesson Mode + bounded multi-blueprint support — #93.

## Production state before this workstream

### Vercel

Primary project `keelesepp` is the only active GitHub-connected Vercel project in this flow. `keelesepp-crm-v2` remains disconnected.

Production deployment for merged main `da4874cc...` (#93) was verified `READY`.

### Firebase Functions

The owner selectively deployed merged-main `learningProfileEvidenceApi` and `learningSessionApi` to project `keelesepp-5136b`. Terminal proof for `learningSessionApi` showed `Successful update operation` and `Deploy complete!` on Node.js 22.

No Firestore/Storage rule or schema deployment is part of the current Teacher Home source-of-truth slice.

## Production bug found during real smoke

Robert (`Eesti keel · B1`) exposed an architectural mismatch:

- real curriculum workspace: next topic `Образование и учёба`;
- next lesson: `Урок 1`;
- goal: `Школа и обучение: tund, õpetaja, kodutöö, hinne`;
- Teacher Home incorrectly showed the pilot goal `EST_B1_CITY_VOCAB` and an `Alusta tundi` button for the B1 city vocabulary Lesson Mode.

Root cause: Teacher Home loaded `curriculum-goals/b1-city.js` and used the pilot graph as a generic B1 recommendation source instead of calculating the student's real curriculum journey.

## Current slice — real curriculum source of truth

Teacher Home now follows the existing legacy curriculum contract:

`HaldusCurriculum -> CurriculumWorkflow.buildStudentJourney(...) -> nextItem`

It reads only the data required to calculate progress for today's students:

- lesson journal rows with curriculum identifiers;
- `curriculumProgressEvents` manual credits.

`homework` and material counts are not required to select `nextItem`, so Teacher Home does not add unrelated reads for them in this slice.

The UI renders `curriculumNext` as:

- topic name;
- lesson number;
- exact lesson goal.

The B1 city goal graph is gated by explicit trusted adaptive session context. Generic `Eesti keel + B1` is no longer enough to activate it.

## Action boundary

Priority:

1. trusted active supported Adaptive Lesson -> `Jätka tundi`;
2. real next curriculum item with a future explicit Lesson Mode binding -> `Alusta tundi`;
3. otherwise -> safe Learning Profile fallback.

At this slice there is intentionally no fake binding from Robert's `est-b1-01:0` lesson to the B1 city pilot. Therefore Robert must not receive a city `Alusta tundi` action.

## Invariants

- `students.skillMap` remains canonical and is not written by Teacher Home;
- missing evidence is unknown, never zero;
- Adaptive evidence remains append-only;
- completed session != achieved curriculum goal;
- Teacher Home remains read-only;
- no finance/calendar/Live Classroom mutation;
- no crm-v2 work;
- #78/#83 remain independent.

## Local verification before push

Targeted local gate passed:

- Teacher Home core behavior;
- Teacher Home UI contract;
- Robert real-curriculum regression;
- active supported session resume;
- missing curriculum/evidence boundary;
- inline JavaScript parsing.

The workstream is pushed only after the local gate; GitHub CI then provides the repository-wide gate before owner merge.

## Manual gate after merge

1. open `Haldus -> Õpetaja täna` in production;
2. inspect Robert;
3. verify `Образование и учёба` / `Урок 1` / `Школа и обучение: tund, õpetaja, kodutöö, hinne`;
4. verify Teacher Home does not substitute `EST_B1_CITY_VOCAB`;
5. verify an existing active supported Adaptive Lesson can still show `Jätka tundi`;
6. verify no curriculum/mastery state changes merely by opening the screen.

## Next safe step

After the real curriculum projection passes the manual gate, implement an explicit binding and Lesson Mode for the first real curriculum lesson. Only after the complete real curriculum -> Lesson Mode -> evidence/handoff loop works should Lesson Builder start.
