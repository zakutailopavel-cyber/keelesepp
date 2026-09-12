# KeeleSepp Project State

Last verified: 2026-09-12, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `600dfb4d9969090b25dfd0ead2c9013af79d02f9` — #122 merged by owner
Current implementation branch: `agent/teacher-daily-workflow-reorganization`
Current draft PR: pending creation
PRs [#103](https://github.com/zakutailopavel-cyber/keelesepp/pull/103) through [#116](https://github.com/zakutailopavel-cyber/keelesepp/pull/116) are merged.

## Current objective

Teacher Daily Workflow Reorganization is the current bounded workstream. Teacher Home becomes the clear
start surface for the four recurring jobs: open today's lesson, prepare a lesson, assign published work,
and review answers. The legacy CRM sidebar leads with the daily tools and keeps administration and less
frequent tools inside one collapsible section.

All previous routes remain reachable. The assignment shortcut opens the existing authenticated assignment
form directly. This is navigation and presentation only: permissions, lesson contracts and persistence do
not change.

Production contains a genuine immutable A2 assignment for Elena Polischuk, assignment
`8f3cb3b6-9965-4637-9a4d-dd0032550008`, with 32 activities. Post-#112 production smoke confirmed the
teacher list, assignment open, all 32 activity steps, current status, CORS and Function requests without
creating answers or evidence.

The merged path is:

`real curriculum -> Teacher Home -> est-b1-school-learning-01 -> adaptive Lesson Mode -> evidence/handoff -> Learning Profile / Teacher Home`.

PR #94 switched Teacher Home to the real curriculum source. PR #95 then bound the first real school curriculum lesson (`est-b1-01:0`) to its own trusted adaptive lesson blueprint. PR #96 reconciled repository state after #95.

## Verified repository state

Current remote `main` is `600dfb4d9969090b25dfd0ead2c9013af79d02f9`.

Merged on current `main`:

- #94 `fix(learning): use real curriculum in Teacher Home`;
- #95 `Real Curriculum Lesson Mode v1: school lesson to evidence and handoff`;
- #96 `docs: reconcile project state after PR 95 merge`;
- #97 `docs: accept real curriculum production teaching loop`;
- #98 `Lesson Builder v1 — Normalized Activity Contract` — merged, COMPLETED;
- #99 `Lesson Builder v1 — Authoring & Validation UI` — merged;
- #100 `Lesson Builder Ultimate Teacher UX` — merged / **COMPLETED**;
- #101 post-merge reconciliation — merged.
- #102 Cloud Draft Library v1 — merged; owner-reported selective Firebase rollout completed.
- #103 Interactive Lesson v1 — merged; CI and automatic Vercel Preview passed;
- #104 Interactive Lesson recovery and revoked-account protection — merged;
- #105 production rollout reconciliation — merged.
- #106 ready fillable Lesson Builder templates — merged.
- #107 bulk worksheet composer — merged; Vercel production deployment READY.
- #108 worksheet-composer rollout reconciliation — merged; documentation aligned with production.
- #109 Image Block v1 — merged; Vercel production READY and selective Functions rollout complete.
- #110 Image Block v1 reconciliation — merged.
- #111 production CRM Functions CORS — merged; selective `gcalApi` deployment and smoke PASS.
- #112 student assignment delivery reliability — merged; selective `interactiveLessonApi` deployment
  and read-only production smoke PASS.
- #113 staff student preview — merged; Vercel production READY, selective `interactiveLessonApi`
  deployment and authenticated Elena preview smoke PASS.
- #114 focused Student Lesson Player — merged; Vercel production READY.
- #115 Legacy Fillable Gaps + In-context Authoring — merged by owner; selective production Function
  rollout and production smoke are still separate gates.
- #116 cost-bounded single-activity AI generation — merged.
- #117 student assignment entry UX — merged.
- #118–#121 AI authoring recovery fixes — merged.
- #122 Quick Questions + Answers — merged; every question creates its own activity and response field.

## Staff Student Preview v1 — COMPLETED

- Staff chooses **Kontrolli õpilase vaadet**, then a student in their authorized scope.
- Server returns only that student's assignments and records the preview start in `activityLog`.
- Opening an assignment uses the existing student projection and omits `teacherContent`.
- UI shows a persistent preview banner and provides an explicit exit action.
- Save, submit, feedback and local student recovery are unavailable in preview mode.
- Existing server mutations still require `actor.uid === assignment.studentUid`; preview introduces no
  alternate write path and no student credential/session impersonation.
- No Firestore rules, indexes, schemas, student records or production data are changed.

Validation on branch: targeted interactive lesson suite **11/11 PASS**; Functions suite **163/163 PASS**;
browser and Function JavaScript syntax checks PASS.

Known limitation: this slice verifies assigned interactive lessons. It does not impersonate a Firebase
account and does not reproduce private browser state, parent-only pages or third-party integrations.

## Student Lesson Player v1 — implementation pending review

Production review after #113 exposed a presentation defect: all 32 activity buttons appeared before
the selected activity, pushing the prompt and response below the fold. Staff preview also rendered
`Vastust pole` instead of response controls, so it could not verify fillable interactions.

The bounded player update provides:

- one focused activity card above the fold;
- visible prompt and response control;
- activity number, progress bar and concise `current / total` state;
- previous/next navigation;
- collapsed full lesson outline for direct navigation;
- responsive desktop/mobile presentation;
- interactive staff test answers held only in page memory, with no save/submit/API path.

No Function, Firestore rule, index, schema or production data change is required. Existing student
save, resume, submit, assignment IDs and answer validation remain unchanged.

Validation: targeted interactive lesson suite **12/12 PASS**; Functions suite **163/163 PASS**;
JavaScript syntax and diff checks PASS.

## Legacy Fillable Gaps + In-context Authoring — merged in #115

Production inspection of Elena's immutable A2 v1 showed a legacy activity whose prompt contains two
`___` blanks but whose published content has no `evaluation.response`. The existing renderer therefore
showed `Vastust pole` and supplied no fields.

The compatibility boundary now infers an optional `gaps` response only when an older activity has no
explicit response contract and one or more `___` tokens. IDs are deterministic (`legacy-gap-1`, etc.)
and remain identical across Support/Core/Advanced. The renderer places the inputs directly inside the
sentences. Normal legacy text without blank tokens remains read-only, and every explicit modern response
contract remains authoritative. The inferred response stays optional so an old published lesson does not
gain a new submission requirement; answers entered into the fields are still saved normally.

Teacher/admin view gains **Muuda seda ülesannet**. It opens the full cloud Builder in a same-page dialog,
loads the exact source draft and selects the current stable activity ID. Saving still uses optimistic
draft revisions; publishing creates a new immutable version. The already assigned version is not mutated
or silently repointed.

Data/security impact: no migration or current assignment rewrite. Once deployed, genuine student answers
for inferred gaps use the existing assignment `answers` map and existing save/submit validation. Staff
preview test values remain nonpersistent. The Function change requires a selective `interactiveLessonApi`
deployment after merge; Builder and player assets deploy through Vercel.

Validation for the merged #115 slice before the AI follow-up: interactive contract/UI suite **14/14 PASS**;
Functions suite **163/163 PASS**; syntax and
diff checks PASS.

The same PR adds **Loo üks ülesanne AI-ga** in Builder. The staff-only Vercel endpoint accepts a bounded
topic, CEFR, learning goal and response mode, calls `claude-haiku-4-5-20251001` with `max_tokens: 700`,
and returns exactly one tool-structured activity. It permits 10 requests per staff user per 15-minute
in-memory rate window. The teacher previews the result before inserting it. Insertion creates a new
stable activity ID, participates in Builder Undo/autosave, and remains an ordinary editable draft until
the existing explicit save/publish workflow is used. Generated metadata, text sizes, enums, response
items and gap counts are validated before insertion. No student, evidence, assignment, curriculum or
Firebase data is written by generation.

AI calls are paid external operations initiated only by the explicit **Loo ülesanne** button. No paid
generation was executed during development or tests. The endpoint uses the existing `ANTHROPIC_API_KEY`;
there is no new secret, Firestore rule, index, collection, Function or Firebase deployment.

The Single Activity AI slice was merged in #116. Its Vercel check passed; no paid generation was made by
the agent. The separate #115 selective `interactiveLessonApi` rollout remains an explicit owner-controlled
production gate.

## Student Assignment Entry UX — implementation pending review

The previous staff landing page presented three equal actions and assignment data as one undifferentiated
text row. The revised page leads with **Vaata õpilase pilguga**, explains that test inputs are not saved,
and moves authoring/assignment into secondary controls. Assigned lessons render as cards with the student
name, status and explicit **Ava ülesanded** action. The preview picker labels step one, requires a student,
then presents only that student's lesson cards. Student save/submit behavior and every server contract are
unchanged.

The focused lesson surface now labels **ÕPETAJA VAADE**, **TURVALINE ÕPILASE VAADE** or the genuine
student workspace and includes the student name for staff. Activity type is visible. A legacy activity
without a response contract is described as oral/teacher-led instead of the misleading `Vastust pole`.
Editing is a contextual action on the activity card, and its Builder dialog uses the full viewport. The
lesson header, progress, card hierarchy, navigation and teacher guidance received a responsive visual pass.

Data/security impact: presentation only. No Function, Firebase rule, index, schema, assignment, answer,
evidence or production data change.

Validation: interactive/generation contract and DOM suite **20/20 PASS**; Functions suite **163/163 PASS**;
JavaScript syntax and diff checks PASS.

## Teacher Daily Workflow Reorganization — implementation pending review

Teacher Home now presents the daily workflow as four prominent actions: today's lessons, lesson
preparation, student assignment and answer review. The CRM sidebar keeps the five daily destinations
visible and places infrequent administration tools in a collapsed **Kõik muud tööriistad** section.
The assignment shortcut opens the existing authenticated assignment form directly.

No route, permission or persistence contract is removed. The slice changes static navigation and
presentation only; Functions, Firestore, student records, assignments, answers and evidence are unchanged.

Validation: focused navigation and assignment tests **19/19 PASS**; Lesson Builder browser suite
**23/23 PASS**. The root suite is **429/433 PASS** on this branch. The same four unrelated failures
(three stale Adaptive Lesson UI expectations and the whiteboard browser environment test) reproduce on
clean `main`, where the suite is **426/430 PASS**.

Exactly one next safe step: owner review and merge of the Teacher Daily Workflow draft PR, followed by a
read-only production walkthrough of all four shortcuts and the collapsed legacy tool menu.

Independent open PRs remain separate and must not be mixed into the learning rollout:

- #83 adaptive lesson desktop density — old draft;
- #78 reliability spinner retry state — old draft;
- #74 Google Calendar sync reliability — open;
- #72 Frappe/ERPNext spike — finance staging;
- #71 finance staging stabilization — open.

Current GitHub `main` is authoritative. Open PR file lists were checked: no changed-file overlap with this authoring UI slice. #83 currently changes only `adaptive-lessons/scenes.js`, which is untouched.

## Real Curriculum Lesson Mode v1

The merged school slice keeps the contracts established in #95:

- exact curriculum/blueprint identity through `functions/curriculum-lesson-bindings.js`;
- stable blueprint `est-b1-school-learning-01` for curriculum lesson key `est-b1-01:0`;
- independent Vocabulary / Grammar / Speaking Support-Core-Advanced routes;
- answer-safe diagnostic and final assessment;
- roleplay and changed transfer context;
- append-only session/evidence persistence through trusted Functions;
- optional `curriculumLessonKey` on new school sessions/evidence;
- resume restores exact word marks and route state;
- blank scores remain absent rather than becoming zero;
- completion creates a handoff but does not rewrite `students.skillMap` or grant curriculum mastery/credit.

Main implementation boundaries remain:

- `functions/curriculum-lesson-bindings.js`;
- `adaptive-lessons/est-b1-school-learning.js`;
- `teacher-home-core.js` and `haldus-teacher-home/index.html`;
- `haldus-adaptive-lesson/index.html` and `lesson-workspace-core.js`;
- `learning-session-store.js` and `functions/learning-session-api.js`;
- `functions/learning-profile-evidence-api.js` and `haldus-learning-profile/index.html`;
- `real-curriculum-lesson.test.js` plus related Teacher Home/Profile/API/emulator coverage;
- `docs/REAL_CURRICULUM_LESSON_MODE_V1.md` and `docs/ADAPTIVE_LESSON_SYSTEM.md`.

## Verification

Verified from PR #95 / its reviewed head:

- CI-selected CRM/learning suite: **223/223 passed**;
- Functions unit tests: **157/157 passed**;
- Auth/Firestore/Functions emulator integration: **25/25 passed**;
- final Teacher Home/curriculum checks: **14/14 passed**;
- local browser smoke covered lesson identity, independent routes, transfer, hidden assessment answers, blank-score summary and Preview handoff behavior.

Known extended-glob noise from #95 remains unchanged: three stale `adaptive-lesson-ui.test.js` assertions reproduce on unchanged main, and one isolated-worktree test required missing `crm-v2/node_modules/jsdom`. These were not represented as passing.

## Production state — current #100 READY; historical teaching baseline below

Last inspected production baseline (post-#98, before #99 merge): Vercel was **READY** for main `b23dabc989be3aad1989de98f4c1234cfdc20e4a`:
`dpl_C6jfXFxJ8DMVfxCfT9Ks6MLpyepA`, primary GitHub-connected `keelesepp` project.

Post-#98 smoke on 2026-09-06:

- authenticated `crm.epkoolitus.ee/haldus-teacher-home/` loaded Robert's correct school lesson and existing handoff;
- nonstudent Lesson Mode loaded `est-b1-school-learning-01`; Next moved between activities;
- browser warning/error logs were empty for both pages;
- Vercel production error/fatal log query returned no matching entries in the inspected
  `12:36:58.432Z–13:36:58.432Z` window; this is bounded log coverage;
- production binding, blueprint, activity contract and workspace scripts matched main byte-for-byte;
- the downloaded client modules correctly resolved saved `currentActivityId=school-d-vocabulary`
  from the existing pre-smoke snapshot. This is an ID compatibility check, **not** a newly created
  or resumed live student session. Robert's accepted session is already completed.

Smoke result: **PASS within this non-mutating scope**. No new student evidence, sessions, handoffs,
Firebase operations or deployment were performed.

Authenticated production source downloads verified both Functions against main after the
2026-09-06 recovery of a stale-source redeployment:

- `learningSessionApi`: version **6**, ACTIVE, updated `2026-09-06T08:11:42.471Z`;
- `learningProfileEvidenceApi`: version **5**, ACTIVE, updated `2026-09-06T08:11:45.569Z`;
- build: `0d26d420-7f52-4672-badb-9434ce0e7e21`;
- source hash: `c208808a2d80bfe88674c62a7f86d2a4c24e113a`.

At that audit both deployed handlers matched the then-current main byte-for-byte. This workstream does not re-deploy or claim a new production revision. That separately authorized selective deployment
is complete; it grants no permission for further Firebase deployment. No new deployment was
performed for this acceptance documentation.

## Production teaching acceptance — ACCEPTED

On 2026-09-06 the owner confirmed that the recorded results belong to a genuine Robert lesson
and accepted the main production teaching loop. Read-only production verification found:

- completed session: `kJkHMe21CzXUqpN5NgrA`;
- status: `completed`; completedAt: `2026-09-06T08:43:12.101Z`;
- curriculumLessonKey: `est-b1-01:0`; lessonBlueprintId: `est-b1-school-learning-01`;
- 14 persisted `teacher_judgement` events and 3 `summary_score` events (17 total);
- summary scores: Vocabulary **50**, Grammar **74**, Speaking **70**;
- persisted routeBySkill: vocabulary **advanced**, grammar **advanced**, speaking **advanced**;
- explicit handoff and teacher note `Väga` persisted;
- the same scored handoff is visible in Learning Profile and Robert's Teacher Home card;
- `learningSessionApi` and `learningProfileEvidenceApi` returned HTTP **200**;
- no Functions errors were found in inspected flow logs;
- the full student document, including `students.skillMap`, is unchanged against the pre-smoke snapshot;
- lesson journal and `curriculumProgressEvents` remain unchanged; no automatic mastery, credit
  or advancement to lesson 2 was created.

Earlier session `dDF13J9b4k4ME3oe01h2` is a separate completed technical attempt with one judgement
and an unscored handoff. It was not reset, overwritten or confused with the genuine scored session.
Active-session refresh/resume and navigation persistence were verified before completion.
The audit did not create synthetic judgements, evidence, handoffs or credit.

### Non-blocking follow-up — NOT OBSERVED

**Production vocabulary_mark interaction not yet observed in a genuine lesson; verify opportunistically during the next real lesson.**

No `vocabulary_mark` event exists in this genuine session. It is unknown whether the word-mark
operation was actually performed; data loss is not established. The current contract supports
word marks and automated tests cover them. This production interaction is **NOT OBSERVED**,
not PASS or FAIL, and the owner explicitly accepted it as a non-blocking follow-up.

The first real curriculum production teaching loop is **ACCEPTED**. This rollout no longer
blocks Lesson Builder. No Firebase or Vercel deployment is needed for this documentation update.

## Normalized Activity Contract v1 — COMPLETED

PR **#98 is merged** on current main and its production Vercel deployment is READY.
The contract pins school task IDs, adapts legacy strings, preserves all three routes and restores
sessions by activity ID before legacy index fallback. Missing saved IDs fail visibly. The exact
contract remains in [NORMALIZED_ACTIVITY_CONTRACT_V1.md](NORMALIZED_ACTIVITY_CONTRACT_V1.md).
The existing real curriculum teaching acceptance above remains ACCEPTED.

## Completed implementation — Lesson Builder Ultimate Teacher UX (#100)

Base: `73d43aa9c5a4226ea2a4472c645795d6370e1ff8` (#99 merged).
Merged PR: [#100](https://github.com/zakutailopavel-cyber/keelesepp/pull/100). Implementation is in current main.

Implemented:

- compact teacher-facing desktop structure/editor/preview columns; laptop two-column mode,
  tablet structure drawer and preview overlay, mobile single-column editor;
- **41 declarative block templates** across nine subject/lesson categories and **9 lesson templates**;
- pointer drag handle, insertion indicator, placeholder, cross-phase move, keyboard Alt+Up/Down
  and Move up/down fallback, preserving stable IDs and variants;
- duplicate/copy/paste below/move-to/delete/reset, destructive confirmations, reference-copy warning;
- 50-snapshot Undo/Redo history with grouped typing and keyboard shortcuts;
- 700 ms local autosave, explicit Save, storage-error and unsaved-change states;
- human phase names/custom phases, skills, durations, lesson settings, hidden read-only technical details;
- teacher-friendly support levels, deterministic copy/simplify/challenge helpers (no AI);
- 450 ms live preview debounce, current activity, route/device/view selection and fullscreen overlay;
- **13 presentation presets** plus existing renderer, safe text-only image/audio placeholders;
- inline errors, separate warnings/tips, readiness metric explicitly unrelated to mastery;
- search/skill/type filters, collapsible phase groups, concise onboarding and JSON backup/restore.

Exact changed files:

- `lesson-block-templates.js`;
- `lesson-builder-ux-core.js`, `lesson-builder-ux-core.test.js`;
- `lesson-authoring-presentation.js`;
- `lesson-authoring-core.js`, `lesson-authoring-core.test.js`;
- `haldus-lesson-builder/index.html`, `haldus-lesson-builder/app.js`,
  `haldus-lesson-builder/style.css`, `haldus-lesson-builder/preview.css`;
- `haldus-adaptive-lesson/index.html`;
- `tests/lesson-builder/package.json`, `tests/lesson-builder/package-lock.json`,
  `tests/lesson-builder/ux.test.cjs`;
- `.github/workflows/financial-core-emulator.yml`;
- `docs/PROJECT_STATE.md`, `docs/LESSON_BUILDER_AUTHORING_UI_V1.md`,
  `docs/LESSON_BUILDER_UX_V2.md`, `docs/ADAPTIVE_LESSON_SYSTEM.md`.

Local validation:

- selected CRM/learning suite: **257/257 PASS** (15 new UX core tests, 10 existing authoring tests);
- isolated browser behavior suite: **11/11 PASS**, with pinned jsdom test dependency;
- unchanged Functions unit suite: **157/157 PASS**;
- existing school/city workspace parity: **123/123 equal**, all 41 activities × three routes;
- actual Chrome local review at **1440×1000, 1180×820, 834×1000 and 390×844**;
- actual pointer drag first→fifth across phases, autosave and preview navigation verified;
- browser syntax and diff checks PASS; final implementation CI: **450 PASS** (257 CRM, 157 Functions, 11 DOM, 25 emulator), run 34091652205.

Second UX/visual pass: replaced unreliable native browser drag with pointer-capture reorder;
removed premature empty-state errors; added inline duration/text errors and prompt counter;
hid teacher controls and the offscreen drawer from student preview; made desktop preview fit the
side panel; verified responsive editor density, focus styling and device layouts.

Contracts/data: no new normalized activity contract. Optional `draft.authoring` contains only
local lesson settings, keyed presentation/duration/template provenance and phase display names.
Older v1 drafts load without changing IDs. Phase and workspace type can be edited independently
in authoring (the existing normalized contract already permits this). Preview source indices are
derived; IDs, routeBySkill and registered teaching/session/evidence/handoff semantics remain intact.
Imported metadata is validated, markup escaped, unknown preview tokens fail closed, and studentId
is ignored in authoring preview. The student/teacher view switch is local preview presentation,
not an authentication/security boundary for distributing answer keys.

Production #100 limitations until cloud backend rollout: one saved local draft per browser origin, last-writer-wins across tabs, no cloud backup,
publication, versioning/assignment service or real audio/image upload. Presentation presets do not
claim an answer interaction engine. Incomplete drafts are not autosaved; unsaved-change warning
remains until fixed/saved. History is bounded and does not survive reload; saved content/IDs do.
Reference content is copied, never mutated. JSON exports are the separate lesson backup mechanism.

External operations: GitHub read/push/draft PR and automatic Vercel preview only. No Firebase
production call/deploy, rules/index/schema changes, student evidence, skillMap or curriculum credit
mutation, production Vercel deploy or paid AI call. Emulator tests use the demo project only.

## Post-merge production Builder smoke — PASS

Verified on 2026-09-07 at `https://crm.epkoolitus.ee/haldus-lesson-builder/`.
Vercel production is **READY** for main `1232af19599c327fdb2b6449097c3c831752bb08`:
`dpl_8hwo41hnZta4ebkLA8BJE7t75pQs`, target production, Git source. Deployment aliases
include crm.epkoolitus.ee, epkoolitus.ee and www.epkoolitus.ee. No deployment was initiated here.

Actual Chrome verification:

- Builder loaded the new visual interface; the origin initially had no saved draft.
- 60-minute lesson template created seven activities; diagnostic block template added the eighth.
- Real pointer drag moved the first activity to fifth across phases; the same eight IDs remained.
- After the autosave indicator confirmed completion, reload restored all eight IDs and content.
  A subsequent page reopen restored the reordered list with the original first ID still fifth.
- Teacher preview showed expected answer and teacher judgement controls; Student preview hid them.
- Desktop (1100px), Tablet (768px), Mobile (375px) preview frames worked; fullscreen and Next
  navigation worked. Only local authoring preview was used, without a student binding.
- Browser warning/error query returned **[]**.
- Available Vercel production error/fatal log query returned no matching entries for
  `2026-09-06T08:41:18.994Z–2026-09-07T08:41:18.994Z`. This is bounded coverage, not proof that
  all historical logs or Firebase runtime logs were inspected.

Six production responses matched current main byte-for-byte: Builder HTML/app.js, Lesson Mode
HTML, lesson-authoring-core.js, lesson-builder-ux-core.js and learning-session-store.js.
Re-ran **11/11 browser behavior tests PASS**, including forged-studentId preview with zero
persistent API/token calls. This validates the matching production code's nonpersistent boundary;
no direct Firestore before/after audit or browser network trace is claimed. No student session,
evidence, handoff, skillMap, mastery or curriculum credit was deliberately created or modified.
All smoke edits were confined to the browser-local draft `Builder post-merge smoke · local only`.

Autosave limitation confirmed: reload before the 700ms save completes may restore the previous
valid snapshot; the acceptance check waited for the saved indicator. Manual JSON import roundtrip
and malformed-file upload remain unverified in real Chrome due to the earlier extension file-access
restriction (automated coverage passes). They are retained as follow-ups, not silently marked PASS.
The genuine-lesson vocabulary_mark follow-up above remains NOT OBSERVED and non-blocking.

## Current cloud draft implementation

See [LESSON_BUILDER_CLOUD_DRAFTS_V1.md](LESSON_BUILDER_CLOUD_DRAFTS_V1.md) for schema/API/security.
New Function lessonDraftsApi owns lessonDrafts, lessonVersions and publishedLessons; direct client
read/write is denied. Revisions prevent stale saves; publication snapshots immutable versions.
Builder adds explicit cloud save, own library, reopen, duplicate, archive, read-only history and
publish. LocalStorage remains local recovery. Existing JS lessons and teaching/evidence are untouched.

Open PR intersections: #71 also touches functions/main.js; our only change there is one new export.
CI workflow is extended to run the new emulator test without changing functions/package.json,
which overlaps #71/#74. No finance/calendar behavior is included.

Verified CI run [34122978854](https://github.com/zakutailopavel-cyber/keelesepp/actions/runs/34122978854): Functions 161/161, CRM/learning 257/257, browser 13/13, existing emulator 25/25, new cloud emulator 14/14 (including parent suite): **470 PASS, 0 FAIL**. Includes explicit existing school-copy validation. Local emulator startup was blocked by missing Java; actual emulator verification ran in GitHub CI. Shared validator parity is enforced by test.
No production calls/writes/deployments made; preview uses automatic GitHub/Vercel build only.

Changed files in this workstream (18):

- `.github/workflows/financial-core-emulator.yml`, `ARCHITECTURE.md`;
- `docs/PROJECT_STATE.md`, `docs/LESSON_BUILDER_CLOUD_DRAFTS_V1.md`, `docs/ADAPTIVE_LESSON_SYSTEM.md`;
- `firestore.rules`, `functions/main.js`, `functions/lesson-drafts-api.js`;
- `functions/lesson-drafts.test.js`, `functions/lesson-drafts-emulator.integration.js`;
- `functions/lesson-contract/activity-contract-core.js`, `functions/lesson-contract/lesson-authoring-core.js`;
- `lesson-cloud-store.js`, `haldus-lesson-builder/cloud.js`, `haldus-lesson-builder/app.js`;
- `haldus-lesson-builder/index.html`, `haldus-lesson-builder/style.css`, `tests/lesson-builder/ux.test.cjs`.

[Automatic Vercel preview](https://keelesepp-git-agent-lesso-0d47d6-zakutailopavel-cybers-projects.vercel.app/haldus-lesson-builder/) is READY. Real Chrome loaded cloud controls, created a local lesson template and rendered Lesson Mode preview with no console errors/warnings. Cloud create/publish was not invoked against production; authenticated write lifecycle was verified through emulator HTTP and isolated UI tests. Full browser-to-production-cloud smoke remains gated on explicit backend deploy permission.

Firebase gate: only `lessonDraftsApi`; collections `lessonDrafts`, `lessonVersions`, `publishedLessons`; deny all direct client reads/writes; no index changes, migrations or existing teaching data writes. Exact proposed command in cloud contract doc. History represents published versions, not every save revision. Local recovery retains the existing valid-draft-only policy. Ambiguous create/duplicate responses need library inspection before manual retry; there is no automatic retry or idempotency-key mechanism in v1.

## Current workstream — Lesson Builder Interactive Templates v1

Branch `agent/lesson-builder-interactive-templates-v1` adds five ready fillable blocks and one
35-minute fillable worksheet. It reuses the deployed Interactive Lesson response contract and makes
no Firebase, API, schema or production-data change. Legacy lesson templates keep their behavior.
See [LESSON_BUILDER_INTERACTIVE_TEMPLATES_V1.md](LESSON_BUILDER_INTERACTIVE_TEMPLATES_V1.md).

## Current workstream — Worksheet Composer v1

Merged PR #107 adds `Lisa küsimuste loend`: teachers can paste
up to 30 questions and create a mixed fillable worksheet in one action. Prefixes select text,
choice or gaps response modes; stable activity and field IDs use the existing contracts. Invalid
input does not change the draft, and Undo removes the whole batch. See
[LESSON_BUILDER_WORKSHEET_COMPOSER_V1.md](LESSON_BUILDER_WORKSHEET_COMPOSER_V1.md).

## Current workstream — Image Block v1

Merged PR #109 adds an activity-level image asset with a stable ID,
HTTPS URL, required alternative text and optional caption. Builder editing, Undo/autosave,
authoring preview, immutable publication validation and the student runner use the existing
normalized activity. Unsafe URLs, duplicate asset IDs and unknown fields are rejected. Existing
activities without assets keep their behavior. No Storage upload, migration or production data is
included. See [LESSON_BUILDER_IMAGE_BLOCK_V1.md](LESSON_BUILDER_IMAGE_BLOCK_V1.md).

Final PR verification: Functions **163/163**, CRM/learning **269/269**, browser **23/23**,
existing emulator **25/25**, cloud drafts **14/14** and interactive lesson **13/13**, with GitHub
CI and automatic Vercel Preview PASS.

Vercel production is READY for main `568d42e1d1acd044895520612f01934bb4f81d0c`. With explicit
owner permission, `lessonDraftsApi` and `interactiveLessonApi` were selectively deployed; both are
ACTIVE on source hash `b11cbbe423e1e79e63ac87992839e876090a986e`. No rules, indexes,
Storage, migrations or production data were changed. Unauthenticated POST returned 401 and
production-origin preflight returned 204 for both. Fresh smoke executions completed without
runtime errors; one concurrent-update audit error was the deploy tool's duplicate update attempt,
after which the Function became ACTIVE on the intended hash.

## Historical Image Block follow-up

A genuine image activity acceptance walkthrough remains a non-blocking follow-up for the Image Block rollout.
