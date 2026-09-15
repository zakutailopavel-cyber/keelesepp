# KeeleSepp Project State

## CRM v2 CI recovery — ready for review

Last verified: 2026-09-15, Europe/Tallinn
Verified main: `d3a5501adfd0792dbfda8fb11fd54cf0097f1ddb`.
Implementation branch: `agent/crm-v2-ci-repair-20260915`.

The CRM v2 suite on current main had 29 failing tests. The failures came from
outdated tests after the Finance workspace navigation and responsive layouts
were introduced, date-dependent invoice expectations, and form labels whose
controls had no generated ID. `Input` and `Select` now generate stable React
IDs when callers do not supply one, restoring label-to-control accessibility.
The affected tests now follow the visible Finance section navigation and assert
the current invoice, calendar, student-filter, profile and search behaviour.

Changed files: CRM v2 shared `Input`/`Select`, and focused test suites for
finance, calendar, student profile/list and global search. No Firebase rules,
Functions, schema, migrations, production data, deployment or external service
calls are included.

Validation: PASS — `npm test` (71 files, 285 tests); `npm run build`; `npm run lint`; `git diff --check`.

Known limitation: no production deployment or live-data check was run.

Exactly one next safe step: review the CI-repair branch and open a draft PR;
after it merges, confirm the remote CRM v2 CI is green.

Last verified: 2026-09-15, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `de9a9f31cb16fd3493da130a5ee0ee7893cdacf3` — page-aware PDF worksheet overlays (#152)
Current implementation branch: `agent/popup-answer-hotspots-20260915`
Current draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/154
PRs [#103](https://github.com/zakutailopavel-cyber/keelesepp/pull/103) through [#116](https://github.com/zakutailopavel-cyber/keelesepp/pull/116) are merged.


## Interactive PDF Worksheet v1 — DRAFT

This slice replaces the temporary workflow-based PDF experiment from #144 with ordinary application code.
`haldus-exercises` loads each PDF page through PDF.js into a canvas, provides page navigation, and places
teacher-authored interactive fields only on their matching page. Image worksheet behaviour is unchanged.
The new `modal` field is a small click target: the teacher clicks once beside a question, configures its title
and instruction, and the student writes the answer in a popup rather than in a precisely positioned page field.
The marker now starts as a text button and can be moved by dragging it or resized by dragging visible edge and
corner handles; the editor no longer requires width and height number entry for this element type.

Changed files: `haldus-exercises/index.html`, `interactive-worksheet-pdf-v1.test.js`, `ARCHITECTURE.md`, and
this state document. Changed data contract: `interactiveOverlay.elements[].page` is an optional one-based page
number; legacy elements without it render on page 1. There is no Firestore rule, Function, index, migration,
production deployment, or document upload in this slice. PDF.js is loaded in the browser from the existing
CDN-style client dependency model; the PDF content is not sent to an AI service.

Validation: PASS — `node --test interactive-worksheet-v1.test.js interactive-worksheet-pdf-v1.test.js
visual-worksheet-student-v1.test.js` (8/8); `git diff --check`.

Known limitation: browser verification could reach the production sign-in page but had no authenticated teacher
session, so a real multi-page PDF authoring and student-review path has not been manually exercised. Rendering
also depends on the configured PDF.js CDN being available.

Exactly one next safe step: use a non-sensitive multi-page PDF in the PR preview while signed in, verify field
placement on two pages, and then review the saved assignment and student response without altering real student data.


## Student Visual Worksheet v1 — DRAFT

This slice connects the already-merged manual image overlay authoring from #143 to the student assignment flow.
A curriculum image with answerable `interactiveOverlay` fields is classified as a worksheet; assignment creation
snapshots the image pages and bounded overlay metadata into `worksheetAssignments`. The student `WorksheetPlayer`
renders the original page image unchanged and places short answer, long answer, choice and checkbox controls at
the authored percentage coordinates. Answers use the existing assignment `answers` map and existing
`submitWorksheet` write boundary. Open responses are required for completion but are not auto-scored unless the
teacher explicitly configured `correctAnswer`; word-translation hotspots remain informational. Students can
explicitly save an `in_progress` draft, and teacher review re-renders the same worksheet page with submitted
answers positioned over the original image.

Changed data contract: optional `worksheetAssignments.files[]` snapshot with optional
`interactiveOverlay: {version:1,elements:[]}`. Existing assignments without `files` are unchanged. No Firestore
rule, Function, index, migration, financial data, curriculum skill credit or production deployment is included.
The open PDF overlay PR #144 remains separate; this slice intentionally implements the current PNG/JPG workflow
without modifying PDF.js authoring.

Validation: PASS — root library/interactive/visual worksheet Node contracts; focused CRM worksheet/homework Vitest; `crm-v2` production build; `git diff --check`.

Known limitation: visual field placement depends on the teacher-authored overlay coordinates; this slice does not
perform OCR/AI field detection. PDF student rendering remains a follow-up after #144 is reconciled.

Exactly one next safe step: review one real two-page image worksheet in the Vercel preview from teacher assignment
through student completion and teacher submission view before merge.


## Õppevara Visual Navigation v1 — DRAFT

This bounded client-side slice makes `Õppekavad` the first/default Õppevara destination while preserving
explicit `?tab=library` deep links. Subject cards are compact and preview real curriculum topics; level cards
show their own real topic examples and navigate using the selected level's first topic. Topic names wrap in
the left rail. B1/B2 lesson cards show a clickable mini material preview: real `worksheetData.blocks` report
their block count and a safe learner-facing fragment, while lessons without worksheet data are explicitly
labelled as a source task rather than a finished worksheet. The click reuses the existing
`WorksheetPreviewModal` and stays in the current KeeleSepp workspace.
Attached image/PDF worksheets are also treated as documents rather than small attachments: image files render as full-size pages and PDFs receive a full-width embedded preview.

Changed files: `haldus-exercises/index.html`, `oppevara-visual-navigation-v1.test.js`,
`docs/PROJECT_STATE.md`, `ARCHITECTURE.md`, and `docs/HANDOFF_OPPEVARA_VISUAL_NAVIGATION_V1.md`.
No Firebase Function, rule, index, schema, migration, production data or paid external API is changed.

Validation:
- focused Node suite: PASS — required 5-file Node suite
- `git diff --check`: PASS
- localhost `LOCAL_LIBRARY_PREVIEW` visual smoke and browser console: PASS — localhost ?preview=library; default Õppekavad, explicit library deep link, B1/B2 mini-preview → WorksheetPreviewModal, no actionable console errors

Known limitation: the runner cannot inspect Pavel's uncommitted Mac working tree, so the described CSS work
was reproduced as a bounded override layer on the exact `cc8e80f8...` base instead of copying an unavailable
local diff. Review should therefore compare the automatic Vercel preview with the owner's local visual state.

Exactly one next safe step: review the draft Vercel preview through `Õppekavad → Eesti keel → B1/B2 → teema → töölehe eelvaade` and merge only if the visual result matches the intended local design.

## Current objective

Curriculum Document Upload & Preview v1 is the current bounded workstream. It upgrades the existing
`Õppevara → Õppekavad` material flow with pre-upload validation, explicit type/size guidance, filename and
percentage progress, safe Storage names, readable attachment metadata and same-page previews. PDF, image and
TXT files render inside KeeleSepp; Word and PowerPoint show a clear download card without sending authenticated
file URLs to a third-party viewer. Existing topics, materials and attachments remain compatible.

The existing Storage boundary remains authoritative: authenticated reads, staff-only writes, safe content and
files below 20 MB. No Function, Firestore rule, Storage rule, index, schema, migration, student record or
production-data change is included. See [CURRICULUM_DOCUMENT_UPLOAD_PREVIEW_V1.md](CURRICULUM_DOCUMENT_UPLOAD_PREVIEW_V1.md).

Exactly one next safe step: review the automatic Vercel preview with one non-sensitive PDF and one image,
confirm same-page preview and download, then merge the draft PR if the visual flow is accepted.

Historical Google Calendar Sync Clarity is merged and production-accepted. Past one-time KeeleSepp
lessons whose original Google push failed are shown as neutral `G–` records. An exact imported Google
mirror for the same student, teacher and interval is collapsed from presentation and no longer creates a
false self-conflict. Current and future sync failures remain actionable `G!` records.

Production smoke on main `28195c052758efe2153c30eead0ee592132889e7` confirmed the visible week retains
five completed lessons after a full reload. Deniss Lazarev and the historical Martin lesson show `G–`;
the duplicate Martin mirror and `Martin ↔ Martin` conflict are absent. The genuine
`Anna Krupenya ↔ Dema` overlap remains. No lesson, schedule, billing or Google Calendar record was
created or changed during the smoke.

Historical Calendar Completion Reconciliation is merged and production-accepted. Existing lesson-journal
results remain visible even when an older schedule record was already reverted to `Planeeritud` before
the #124 protection reached production.

The #124 import boundary prevents future reversion. #125 derives the displayed status from an existing
final lesson-journal record using exact `scheduleId + date` identity. Production reload retained five
completed lessons in the visible week. No lesson, billing or Google Calendar record was created or changed
during the smoke.

Production contains a genuine immutable A2 assignment for Elena Polischuk, assignment
`8f3cb3b6-9965-4637-9a4d-dd0032550008`, with 32 activities. Post-#112 production smoke confirmed the
teacher list, assignment open, all 32 activity steps, current status, CORS and Function requests without
creating answers or evidence.

The merged path is:

`real curriculum -> Teacher Home -> est-b1-school-learning-01 -> adaptive Lesson Mode -> evidence/handoff -> Learning Profile / Teacher Home`.

PR #94 switched Teacher Home to the real curriculum source. PR #95 then bound the first real school curriculum lesson (`est-b1-01:0`) to its own trusted adaptive lesson blueprint. PR #96 reconciled repository state after #95.

## Verified repository state

Current remote `main` is `31256ea0ec049973e8fd913b0699861be28b51b2`.

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
- #123 Teacher Daily Workflow Reorganization — merged.
- #124 Calendar Completion Persistence — merged; owner deployed `gcalApi` and `syncAllCalendars`.
- #125 Historical Calendar Completion Reconciliation — merged; Vercel production READY and smoke PASS.
- #126 #125 post-merge documentation reconciliation — merged.
- #127 Historical Google Calendar Sync Clarity — merged; Vercel production READY and smoke PASS.
- #128 #127 post-merge documentation reconciliation — merged.
- #129 Teacher Home daily action clarity — merged; Vercel production READY and authenticated smoke PASS.
- #130 Teacher Home Curriculum Preparation Bridge — merged; Vercel production READY and authenticated production smoke PASS.
- #131 #130 post-merge documentation reconciliation — merged.
- #132 Guided Curriculum Starter — merged; focused curriculum/Builder/session and browser suites PASS.
- #133 expired summer course removal — merged; Vercel production rollout is an owner/Vercel gate.
- #134 Unified Teacher Workspace v1 — merged; authenticated production smoke PASS.

## Unified Teacher Workspace v1 — COMPLETED

- `Minu tööpäev` and `Valmista tund` are internal CRM destinations rather than full-page external navigation.
- Both centre surfaces remain mounted for instant return and Builder in-memory state preservation.
- Shared section headers retain title and signed-in profile; embedded pages remove duplicate branding only.
- Curriculum preparation query parameters survive the transition into embedded Builder.
- Focused tests **57/57 PASS**; Builder browser tests **24/24 PASS**; Vercel Preview READY.
- Authenticated production smoke PASS on main `73569786de938948a482b8e52f67a6444071c5b4`.
- The CRM URL and browser tab remain unchanged during daily-work/Builder transitions; sidebar and profile persist.
- Returning to Builder preserves the A2 draft, selected first block and open preview without reloading the surface.
- Student/Teacher and Desktop/Tablet/Mobile preview projections render in place with the non-persistence notice.
- No Firebase, API, schema, student or production-data change.

## Expired Summer Courses Removal — COMPLETED

- Removes the obsolete `Suvekursused 2026` homepage section and its unused responsive styles.
- Removes the seasonal benefit-list line and `Suvekursus lapsele` registration option so the public page no
  longer offers a past-season product through a secondary path.
- Keeps the regular course catalogue, prices, teachers, reviews and registration form unchanged.
- Validation: HTML landmark/content checks PASS; `git diff --check` PASS; local browser smoke PASS.
- Data/security impact: static public-page content only. No Firebase, API, authentication, CRM or production
  data change and no deployment performed.

## Guided Curriculum Starter — COMPLETED

- Reconciled product priorities are in `docs/PRODUCT_ROADMAP.md`: teacher preparation, explicit
  draft-to-student delivery and reliable student completion are P0.
- Curriculum entry presents three choices: recommended 60-minute structure, fillable independent work or
  the full template library.
- Applying any lesson template preserves curriculum title, CEFR, topic, goal and duration. New activities
  receive unique stable IDs; the previous browser draft remains recoverable through the existing Undo flow.
- Validation: focused curriculum/Builder/Teacher Home/session suite **87/87 PASS**; isolated Builder browser
  suite **24/24 PASS**; JavaScript syntax and diff checks PASS; local visual smoke and console PASS.
- Data/security impact: browser-only draft construction. No API, Firebase, student, assignment, evidence,
  calendar, `skillMap`, mastery or curriculum-credit write.
- Known limitation: the generated template content remains a starting point that the teacher reviews; this
  slice does not publish or assign automatically.

## Teacher Home Curriculum Preparation Bridge — COMPLETED

- Unbound real-curriculum lessons receive `Valmista see tund`; a ready or active trusted Lesson Mode keeps
  `Alusta tundi` / `Jätka tundi` unchanged.
- The link contains only `curriculumLessonKey`; Builder does not receive a student id or personal data.
- Builder pre-fills lesson title, CEFR, topic and goal and immediately opens the existing template library.
- Existing local work requires confirmation before replacement and remains available through Undo.
- Validation: focused core/UI/real-curriculum suite **59/59 PASS**; Lesson Builder browser suite **23/23 PASS**;
  JavaScript syntax and diff checks PASS; local and Vercel Preview visual paths PASS for `est-a2-03:0`;
  GitHub/Vercel checks **3/3 PASS**.
- Data/security impact: browser-only preparation flow; no API call, Firebase change, student write or deploy.
- Production smoke: Teacher Home, Vlad A1 and Ilja A2 preparation actions, stable curriculum key, existing-draft confirmation and browser console PASS.
- Known limitation: selecting and tailoring the pedagogical template remains an explicit teacher action.

## Historical Google Calendar Sync Clarity — COMPLETED

The calendar distinguishes an old, non-actionable push failure from a current failure. A past one-time
native lesson with `gcalSyncStatus: error` and no Google event ID renders as `G–`; current and recurring
errors keep the existing actionable `G!` state. When an exact historical imported Google mirror exists
for the same student, teacher and interval, presentation retains the native KeeleSepp lesson and removes
only the duplicate mirror. Genuine overlaps continue to appear in the conflict queue.

Validation before merge: targeted calendar and accounting UI suite **28/28 PASS**; JavaScript syntax and
diff checks PASS; GitHub/Vercel checks PASS. After owner merge, Vercel production for main
`28195c052758efe2153c30eead0ee592132889e7` became READY. Authenticated production smoke confirmed
`G–` for Deniss and historical Martin, no duplicate historical Martin card, no false self-conflict, and
the unchanged genuine Anna Krupenya/Dema conflict. A full reload retained five completed lessons and the
same corrected presentation. No new application runtime or API errors appeared. The console still emits
the known Tailwind CDN, in-browser Babel and oversized inline Babel transformation warnings.

Data/security impact: presentation-only. No Firebase Function, Firestore rule, index, migration, lesson,
schedule, Google Calendar, billing or student data was changed or deployed for #127.

Exactly one next safe step: run a read-only production usability audit of the teacher's daily path and
choose one bounded high-frequency friction point before making another code change.

## Calendar Completion Persistence — COMPLETED

Root cause: the trusted lesson journal correctly stores a final lesson result and patches its schedule
record, but the next Google import regenerated `status: Planeeritud` and merged it into the same document.
That made completed one-time lessons reappear as unfinished. The same boundary could overwrite a native
Google occurrence exception.

Google import now preserves `Toimunud`, `Puudus_p`, `Puudus_eta`, the linked lesson entry and recurring
`occurrenceStatuses`. Planned lessons continue to receive Google changes normally, and completing one date
of a recurring series does not complete future dates.

Validation before merge: calendar sync and lesson identity tests **22/22 PASS**;
calendar/UI/accounting contract tests **32/32 PASS**; complete Functions unit suite **166/166 PASS**;
JavaScript syntax and diff checks PASS. The owner merged #124 and selectively deployed `gcalApi` and
`syncAllCalendars`. A manual production sync returned HTTP 200 and synchronized 77 events without failures.
The subsequent hourly scheduled syncs completed successfully without Function errors.

## Historical Calendar Completion Reconciliation — COMPLETED

Some schedule documents may already have been reverted before #124 was deployed. Calendar rendering now
projects an existing final lesson-journal status (`Toimunud`, `Puudus_p`, or `Puudus_eta`) onto the matching
calendar occurrence using exact `scheduleId + date` identity. A different date or schedule ID cannot match.

This is a read-only presentation reconciliation. It does not update Firestore, create or delete lessons,
change billing, modify Google Calendar, or require Firebase deployment. Targeted calendar and accounting UI
tests **35/35 PASS**; GitHub/Vercel checks **3/3 PASS**. After owner merge, Vercel production for main
`e13ca1918c4884c7247f7be4d37578456cf5d07b` became READY. Real production showed 26 lessons for the visible
week: five completed, twenty planned and one cancelled. A full reload retained the same five completed
results. Google Calendar remained connected. No new application runtime error appeared; only the known
Tailwind CDN and in-browser Babel build warnings remain.

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

## Teacher Daily Workflow Reorganization — COMPLETED

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

Production navigation confirmed the reorganized daily navigation after #123 merged. Exactly one next safe
step: implement a bounded calendar presentation fix for historical failed pushes and exact self-duplicates,
while retaining real teacher and student overlap warnings.

The read-only production audit found both visible `G!` records were one-time KeeleSepp lessons from
8 September whose push failed on 7 September with `invalid_request` and no Google event ID. Current syncs
are healthy, but past one-time lessons are intentionally excluded from retry. Deniss has no matching imported
Google record. Martin also has a separate successfully imported Google record for the same student, date and
time, which creates a false `Martin ↔ Martin` overlap in the current presentation. No record was changed.

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

## Current workstream — Unified Teacher Workspace v1

Last checked main on 2026-09-14: `2ef513a799cce77a8d3593aa8c56f15f7709cbaa`.
PR [#146](https://github.com/zakutailopavel-cyber/keelesepp/pull/146) is merged. Follow-up branch
`codex/restore-oppevara-primary` and draft PR
[#147](https://github.com/zakutailopavel-cyber/keelesepp/pull/147) restore the existing Õppevara application
as the primary sidebar destination after user review found the internal catalogue in the wrong position.

Goal: make `haldus.html` the single teacher workspace with one persistent menu/header/profile and no new
browser tabs in the ordinary curriculum, learning-library and worksheet-authoring flow. The daily routes are
`Minu tööpäev`, `Tunniplaan`, `Valmista tund`, `Õppevara` and `Minu õpilased`. `Õppevara` is the existing
`/haldus-exercises/` application that formerly opened in a separate tab. The duplicate `Õppeprogramm`
sidebar destination is removed; curriculum remains inside Õppevara and in student-specific flows. Existing same-origin tools
render in the CRM centre surface with duplicate child headers hidden. Curriculum and library worksheet
actions hand navigation back to the parent shell.

The student curriculum position now has a one-number control. It maps the number to an existing stable
curriculum item and reuses `students.curriculumPlan` plus `curriculumPlanUpdatedAt`; the existing activity
logger records `curriculum.position_set`. It sets the planned current lesson without fabricating completion
history. No new collection, endpoint, Function, Firestore rule, index, Storage object, publication contract
or data migration is introduced.

Changed files and full continuation details are in
[HANDOFF_UNIFIED_TEACHER_WORKSPACE_V1.md](HANDOFF_UNIFIED_TEACHER_WORKSPACE_V1.md). Open PR #144 changes only
the interactive PDF patch workflow/test and has no file overlap with this workstream. PRs #83, #78, #74,
#72 and #71 are older unrelated workstreams.

Verification: focused navigation/curriculum/worksheet suite **34/34 PASS**, `git diff --check` PASS,
GitHub `financial-core` PASS (1m26s), Vercel deployment PASS and Vercel preview-comment check PASS. Chrome
loaded the preview login and embedded learning-library route. Authenticated preview verification is blocked
because the temporary Vercel hostname is not in Firebase Authentication authorized domains; Google sign-in
failed at that boundary. No production deploy, Firebase deploy, production data write or paid external call
was made.

Known limits: embedded tools are still separate HTML runtimes; this is a navigation and visual-shell
consolidation, not a risky rewrite. The numeric position is a planning pointer rather than proof of earlier
completion. Exactly one next safe step: run the authenticated Vercel preview smoke described in the handoff.
