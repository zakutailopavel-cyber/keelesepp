# KeeleSepp Project State

Last verified: 2026-09-05, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `fe459ffe6243109fa2f1f2879dc6348ca7ac344c` — merged #94, Teacher Home real curriculum
Active branch: `codex/real-curriculum-lesson-mode-v1`
PR: draft #95 — https://github.com/zakutailopavel-cyber/keelesepp/pull/95

## Outcome

Real Curriculum Lesson Mode v1 implements one explicit complete curriculum slice:

`est-b1-01:0 → est-b1-school-learning-01 → diagnostic → vocabulary → grammar practice → roleplay → transfer → assessment → evidence/handoff → Teacher Home / Learning Profile`.

Production #94 manual entry check passed on Robert: `Образование и учёба / Урок 1 /
Школа и обучение: tund, õpetaja, kodutöö, hinne`. His card did not offer or display the city
pilot substitution. Production was used read-only; no test teaching evidence was written.

Independent open PRs checked: #83, #78, #74, #72, #71. None is incorporated into this change.

## Implemented contracts and files

- `functions/curriculum-lesson-bindings.js`: shared exact curriculum/blueprint identity.
- `adaptive-lessons/est-b1-school-learning.js`: 60-minute school lesson, twelve activity slots,
  separate Vocabulary/Grammar/Speaking Support/Core/Advanced routes.
- `teacher-home-core.js`, `haldus-teacher-home/index.html`: exact start/resume routing,
  read-warning gate, named evidence and latest completed handoff.
- `haldus-adaptive-lesson/index.html`, `lesson-workspace-core.js`: registered lesson,
  answer-safe assessment, protected word drawer, persistence failure boundary and completion links.
- `learning-session-store.js`, `functions/learning-session-api.js`: server-owned lesson metadata,
  optional `curriculumLessonKey` on new school sessions/evidence, word-mark restoration on resume.
- `functions/learning-profile-evidence-api.js`, `haldus-learning-profile/index.html`: completed
  handoffs including unscored sessions; no generic B1 city recommendation in the school flow.
- `real-curriculum-lesson.test.js`, updated Teacher Home/Profile/API tests,
  `functions/learning-session-emulator.integration.js`, CI test-list update.
- `docs/REAL_CURRICULUM_LESSON_MODE_V1.md`, `docs/ADAPTIVE_LESSON_SYSTEM.md`: current contract/rollout.

No finance/calendar/Live Classroom or crm-v2 code changes. No rules or indexes changed.
No source curriculum, historical IDs, canonical skillMap or curriculum progress records rewritten.

## Verification

- Repository CI-selected CRM/learning suite including the new curriculum tests: **223/223 passed**.
- Functions unit tests: **157/157 passed**.
- Full existing Auth/Firestore/Functions emulator suite on Node 22: **25/25 passed**;
  includes the new complete school lesson/store/API/profile/home cycle, blank-score semantics,
  independent routes, word-mark restore, immutable student data, closed-session write rejection
  and handoff-only completion.
- Browser smoke on local preview: correct title/topic; Vocabulary Advanced after independent
  Grammar Core and Speaking Support; transfer; hidden assessment answers; Summary with blank
  grammar/speaking; explicit unsaved Preview handoff. Desktop layout visually inspected.
- Extended root glob: 359 passed / 4 failed at the earlier check. Three stale assertions in
  `adaptive-lesson-ui.test.js` reproduce identically on unchanged verified main; fourth test
  requires `crm-v2/node_modules/jsdom`, absent in this isolated worktree. These are outside
  the repository CI-selected gate; they have not been silently counted as passing.

## Limits and rollout

New code is local/PR-only until reviewed rollout. Production #94 visible regression is verified;
production persistence of the new school lesson is NOT yet verified.

Owner-authorized selective deployment of `learningSessionApi` and `learningProfileEvidenceApi`
is needed before exposing the new frontend start button. The old server rejects the new lesson ID.
The agent does not merge or deploy. No paid external API or production database mutation occurred.

Completed session != achieved curriculum goal. Teacher Home may continue to show lesson 1 until
existing explicit curriculum credit is recorded. This release does not invent mastery/credit.

Lesson Builder, Content Engine normalization and new feature families remain deferred.

## Next safe step

Review the draft's school lesson and authorize its two-function production rollout before owner merge;
then verify one genuinely taught school lesson through saved evidence/handoff on production.
