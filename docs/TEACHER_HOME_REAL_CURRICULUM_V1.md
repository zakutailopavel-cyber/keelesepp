# Teacher Home — real curriculum source of truth v1

Date: 2026-09-05

## Problem

Teacher Home previously treated the pilot B1 city goal graph as a generic recommendation source for every `Eesti keel · B1` student. That could produce a valid-looking but wrong `Alusta tundi` action even when the student's real curriculum had a different next lesson.

Observed production example:

- student: Robert, `Eesti keel · B1`;
- real curriculum next lesson: `Образование и учёба` → `Урок 1` → `Школа и обучение: tund, õpetaja, kodutöö, hinne`;
- old Teacher Home recommendation: `EST_B1_CITY_VOCAB` / `Linnaprobleemide põhisõnavara aktiveerimine`.

The two sources were not the same curriculum and must not be substituted for each other.

## Contract

The real curriculum is the source of truth for the next curriculum lesson:

`HaldusCurriculum -> CurriculumWorkflow.buildStudentJourney() -> journey.nextItem -> Teacher Home`

Teacher Home now loads:

- `haldus-curriculum-data.js`;
- `curriculum-workflow-core.js`;
- completed lesson journal rows for today's students;
- `curriculumProgressEvents` for manual curriculum credits.

It calculates the same `buildStudentJourney()` projection already used by the legacy curriculum workspace.

## Adaptive boundary

The B1 city Curriculum Goal graph remains available only as explicit adaptive context. It is not allowed to activate merely because a student is `Eesti keel · B1`.

A trusted active supported Adaptive Lesson may still be resumed with `Jätka tundi`.

A pilot goal recommendation by itself can no longer create `Alusta tundi`. A future real curriculum lesson must have an explicit curriculum-item -> Lesson Mode binding before Teacher Home can start that lesson.

This is deliberate: a missing Lesson Mode implementation must fall back safely instead of opening a different lesson.

## Read model and safety

Teacher Home remains read-only.

- no curriculum progress writes;
- no `students.skillMap` writes;
- no Firestore rule/schema changes;
- no Firebase Function changes;
- no finance/calendar/Live Classroom mutation;
- missing curriculum/evidence stays unknown and is surfaced as a warning/fallback.

Teacher-scope lesson reads respect the existing `teacherUidV1` rollout boundary. Manual curriculum progress events use the existing staff-readable collection.

## Verification

Local targeted gate before the branch is pushed:

- `teacher-home-core.test.js`;
- `teacher-home-ui.test.js`;
- Robert regression test for real B1 curriculum vs B1 city pilot;
- inline Teacher Home JavaScript parse check.

Expected real smoke after merge:

1. open `Haldus -> Õpetaja täna`;
2. inspect Robert;
3. confirm the next curriculum block shows `Образование и учёба` / `Урок 1` / `Школа и обучение: tund, õpetaja, kodutöö, hinne`;
4. confirm no new city-vocabulary lesson is started from that card;
5. verify an already-active trusted Adaptive Lesson still resumes with `Jätka tundi`;
6. verify no curriculum/mastery data changed merely by opening Teacher Home.

## Next step

After this source-of-truth fix is manually verified, bind the first real curriculum lesson to a real Lesson Mode implementation. Only then should Teacher Home expose `Alusta tundi` for that curriculum item.

Lesson Builder remains blocked until the real curriculum -> correct Lesson Mode -> evidence/handoff loop is complete.
