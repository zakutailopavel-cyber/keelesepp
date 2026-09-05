# Real Curriculum Lesson Mode v1

## Verified entry

On 2026-09-05 the production browser route `https://crm.epkoolitus.ee/haldus.html`
→ `Õpetaja täna` showed Robert's exact next curriculum item:

`Образование и учёба → Урок 1 → Школа и обучение: tund, õpetaja, kodutöö, hinne`.

The card had `Ava õppimisprofiil`, no city lesson launch and no `EST_B1_CITY_VOCAB` substitution.
This verifies the visible #94 regression. No lesson was started and no test assessment was
written to Robert. Existing active-session resume and write boundaries were tested locally,
not claimed as separately observed production events.

## Immutable binding

`functions/curriculum-lesson-bindings.js` is a small shared UMD contract, served as a static
browser script and included inside the Firebase Functions deployment source:

- curriculum key: `est-b1-01:0`;
- topic ID: `est-b1-01`, zero-based lesson index: `0`;
- subject/level: `Eesti keel` / `B1`;
- blueprint: `est-b1-school-learning-01`;
- target goal: `EST_B1_SCHOOL_LEARNING_01`.

Teacher Home matches the full exact identity and requires a valid journey without read warnings.
It never matches by student name, generic B1 level, translated title or pilot recommendation.
A supported active session still takes priority. Other curriculum items still fall back to Profile.
The new target goal is an identity, not a new prerequisite graph or an assertion of achievement.

The server owns the blueprint title, B1 level, target goal and curriculum lesson key.
`curriculumLessonKey` is an additive optional field on new school sessions and their evidence;
old city sessions retain their identity. No backfill or existing record migration occurs.

## Lesson delivery

`adaptive-lessons/est-b1-school-learning.js` provides twelve stable activity slots:

- three separate diagnostic questions: vocabulary, grammar, speaking;
- two vocabulary activities with 6/10/12 cards by route;
- two controlled grammar activities;
- teacher/student school roleplay;
- transfer to a new online course;
- three separate final assessments.

The activities take 55 minutes, with five minutes reserved for summary/handoff.
All routes preserve task-slot counts and B1 goals. Vocabulary can be Advanced, Grammar Core
and Speaking Support simultaneously. Only the affected skill changes after teacher judgement.
No navigation event creates evidence or changes skill routes.

Diagnostic and assessment answers begin hidden. Assessment criteria are skill-specific and
do not reveal target vocabulary. The word drawer is disabled in diagnostic, transfer and assessment;
changing tasks closes it. Transfer's private teacher details remain in teacher help.

## Persistence and return path

The existing browser store and authenticated `learningSessionApi` handle start/resume,
progress, teacher judgement, word marks and explicit completion. Resume restores the latest
word marks from append-only evidence in the same session, as well as saved skill routes.
A real-student session that fails to open keeps lesson actions locked instead of reporting
local changes as persisted. Preview explicitly reports that its handoff was not saved.

The Summary accepts only entered scores; blank grammar/speaking remain absent. After successful
completion, fields are disabled and links lead to Teacher Home and that student's Learning Profile.

`learningProfileEvidenceApi` returns completed sessions even if they contain only a handoff
and no score evidence. Teacher Home and Learning Profile display completed handoffs; Teacher Home
joins raw evidence to its session title. Learning Profile requires explicit city graph context,
so generic B1 school context does not trigger the city pilot recommendation.

Completion does not write `students.skillMap`, lesson journal or `curriculumProgressEvents`.
It does not advance `est-b1-01:0` to lesson 2. Mastery and curriculum credit remain the existing
explicit teacher workflows. A repeat launch is therefore possible and intentional until credit
is explicitly recorded through those workflows.

## Verification and production gate

Automated end-to-end test uses only `demo-keelesepp-finance` on loopback emulators:
real curriculum → browser store → all activities → distinct skill routes → resume → word evidence
→ completion with a blank score → trusted read API → Learning Profile → Teacher Home.
It verifies unchanged student data, no achieved-goal invention, post-completion write rejection,
and a second handoff with no scores. Existing suites cover authorization and idempotency.

Production persistence for this new blueprint requires owner-authorized deployment of **both**
`learningSessionApi` and `learningProfileEvidenceApi`. No Firestore/Storage rule deployment is needed.
Deploy the two functions from the reviewed change before exposing the new frontend launch,
then owner-merge the frontend PR. Do not merge and claim production completion with the old
server allowlist: it will reject the school blueprint.

The agent has not deployed either function and has not merged the PR. After authorized rollout,
run one real taught session and verify the saved handoff/evidence on production. Lesson Builder
remains deferred until this production teaching loop is accepted.
