# KeeleSepp Project State

## 2026-10-02 — Teacher dashboard secondary-assignment permission hotfix — local branch

Checked against fresh `origin/main` `3517dd8` on 2026-10-02; open PRs #230, #233 and #234 do not contain this rules
fix. A production teacher (`Anhelina Korotka`) saw the whole `Ülevaade` fail with `Missing or insufficient
permissions`. The dashboard's teacher-scoped student loader intentionally combines `teacherUid == current UID` and
`teacherUids array-contains current UID`, but enforced Firestore reads allowed only the first constraint. Therefore
the second valid query was rejected and its shared `Promise.all` failed the page.

Branch `codex/teacher-secondary-assignment-read` extends only `teacherCanRead`: a teacher may read a record where
their UID is the primary `teacherUid` or is present in `teacherUids`. Legacy pre-enforcement behaviour and admin,
parent, student, create and update permissions are unchanged; broad unscoped teacher reads remain denied. The
emulator regression creates a student whose primary teacher is someone else, confirms the assigned secondary
teacher's `ARRAY_CONTAINS` query succeeds with exactly that record, and keeps the broad-query denial assertion.

Files: `firestore.rules`, `functions/finance-emulator.integration.js`,
`crm-v2/src/services/firebase/students.pagination.test.js`, `ARCHITECTURE.md`, and this state file. No schema,
migration, Function, Vercel or production-data change. Checks: Firestore production-project dry-run compiled the
rules successfully; focused CRM student-query tests 5/5 passed; Functions unit suite 212/212 passed;
`git diff --check` passed. The intended focused Firestore emulator regression is added but could not run on this Mac because
Firebase Emulator requires Java and no Java runtime is installed; two launch attempts stopped before any emulator
or test code ran. Exactly one next safe step: owner explicitly approves the production `firestore:rules` deploy,
then reload and verify Anhelina's teacher dashboard; no CRM redeploy is needed.

## 2026-10-02 — Known test failures fixed, Kontrolltöö label — PR (branch `agent/fix-known-failures`)

Checked against main `240e09c`. Owner asked to fix the remaining known problems (not the items they parked: TURN,
Storage CORS, 54 unmatched Google events, APP_BASE_URL, „Minu tööpäev”, parent study terms).
- The 3–4 "flaky" tests were test problems, not product bugs: `FinancePage.test.jsx` asserted a single `role="status"`
  while a panel's LoadingState (also `status`) was still on screen → `findNotice(text)` waits for the notice with the
  expected text; `StudentProfilePage.test.jsx` read lessons/invoices right after the tabs appeared, before the data had
  loaded → waits for the content (4 s). Both files pin the clock to 2026-10-01 (`vi.useFakeTimers({ toFake: ['Date'] })`,
  real timers) so fixtures dated October 2026 do not turn "overdue" later. Full suite 534/534 four runs in a row.
- `libraryModel.curriculumType`: a Kontrolltöö with a constructor worksheet is labelled „Kontrolltöö” again (since #228
  it showed „Tööleht”); `library.assign` sends any record with a `worksheetDoc` as an interactive worksheet, so the
  assignment behaviour is unchanged. Tests added.
- Section headings below updated: #219–#225 released; #227, #228, #229, #231 merged, waiting for the release.

## 2026-10-02 — Live Classroom: full-screen lesson room (owner's design photo) + board rules fix — MERGED (#231, 297e79e), release pending (rules + CRM)

Checked against main `240e09c`. Owner sent a photo of how the lesson must look: top bar (back, menu, "Tund — date",
undo/redo, subject, timer + signal, mic/camera/screen/hang-up, more, participants, chat, Materjalid, Ülesanded), a
large board with the worksheet and handwriting on it, the student's video tile on the right, a floating tool dock at
the bottom, a colour/size panel on the right and the zoom at the bottom left. Built that:

- `features/live-classroom/LiveRoom.jsx` + `liveRoom.css`: the accepted room is now a full-screen layer (both roles).
  Call controls live in the top bar; timer from `respondedAt`; signal bars from the call state; video tiles on the right
  (remote large with initial + name, self small). Drawers: Vestlus (the same internal `messages` as Suhtlus, live via
  new `messagesService.subscribeByStudent`; badge counts messages that arrive during the lesson), Osalejad, Materjalid
  (teacher: image/PDF files of Õppevara materials → "Tahvlile"), Tunni salvestamine (RoomRecorder, kept mounted).
  "Ülesanded" opens the existing RoomWorksheetPanel over the board; it opens by itself for the student when the teacher
  opens a worksheet (`onCurrentChange`). "Rohkem": new lesson page "Tund dd.mm.yyyy", recording, leave, Lõpeta tund.
  Leaving keeps the lesson; the start page shows "Tagasi tundi" for an accepted room of the last 6 h (teacher+student).
- `features/live-classroom/useLiveCall.js`: the WebRTC logic moved out of LiveLessonCallPanel unchanged (panel kept).
- The room board is the student's own board (`StudentBoard` `variant="room"`, `whiteboards/{studentId}` = CRM
  „Tahvel” and v1 board): everything stays after the lesson. New: dock (select, hand, shapes menu, pen, eraser, text,
  note, image upload for staff via `libraryService.uploadFile`), 12 colours, width slider, S/M/L/XL, undo/redo of own
  actions (exposed to the top bar), insert material (image/PDF as a board element, PDF rendered as a page), new lesson
  page (`studentBoardService.addPage`, v1 lessonPages shape), each page fitted to content once.
  The old per-invitation `LiveLessonWhiteboard` (strokes only) is no longer used and was removed.
- **Firestore rules fix (needs a rules deploy):** a teacher (not admin) could not add images/PDFs to a student board and
  could not write anything on a lesson page — board access was evaluated 2–3 times per write and hit Firestore's
  1000-expression limit (permission-denied; also in CRM v1). Access is now checked once; semantics unchanged
  (`whiteboardElementCreateValid`, `whiteboardElementUpdateValid`, `lessonPageLive`, `snapshotPageActive`). New
  emulator test `functions/whiteboard-rules-emulator.integration.js` (in `npm run test:emulator`): teacher image/PDF on
  board + lesson page + snapshot copy OK; student note OK, student image denied, snapshot write denied, locked delete
  denied, completed snapshot immutable. Against the old rules the teacher test failed with the 1000-expression error.
- Checks: `npx eslint src` clean; vitest 538 tests, only the 4 known date-dependent Finance/StudentProfile tests fail
  (same as main); new `LiveRoom.test.jsx` (8). `npm run build` OK. Functions `node --test` 212/212; emulator rules tests
  10/10 (whiteboard + invitations). Browser, two users on local emulators with fake camera/mic: teacher invites,
  student joins; teacher puts a material on the board, draws, adds a note; both "Ühendatud"; chat badge 1; undo/redo;
  new lesson page visible to the student with the teacher's note; 1440 px and 390 px without horizontal scroll.
- Release: merge + `firebase deploy --only firestore:rules` (for materials and lesson pages) + Vercel `keelesepp-crm-v2`.
- Limits: no pinch-zoom on phones (buttons instead); chat is the Suhtlus conversation; TURN server still missing.

## 2026-10-01 — Worksheet draft regression repair — MERGED (#228, a71b66b), release pending

Fresh main: `9fda4b9df487696b59cbe1847ab3ce08e1bed7c6` (2026-10-01). PR #227 was merged with the owner's explicit
permission; GitHub confirmed merged=true. No open PRs before this task. Task 1 is isolated in draft PR #228: https://github.com/zakutailopavel-cyber/keelesepp/pull/228.

Completed: draft saves of legacy/published constructor documents without a published snapshot preserve the old
`worksheetDoc`, version and update timestamp in `publishedWorksheetDoc*` in the same batch. Subsequent drafts do not
replace that snapshot. Every constructor document is classified as Tööleht. Preview uses the published snapshot or
labels a never-published draft Mustand. Assignment rejects never-published drafts with a typed publication error;
the UI explains why and offers “Ava konstruktoris ja avalda” at `/library/worksheets/:id`.
Listening without audio and placeholder worksheet titles are publication warnings. Content/tasks, task titles and
checked answer keys still block publication. Already broken drafts are not automatically published or migrated.

Files: `crm-v2/src/services/firebase/{worksheetDocs.js,worksheetDocs.test.js,library.js}`;
`crm-v2/src/features/library/{libraryModel.js,LibraryPage.jsx,LibraryPage.test.jsx,MaterialPreview.jsx}`;
`crm-v2/src/features/worksheet-studio/{quality.js,quality.test.js}`; `ARCHITECTURE.md`,
`docs/WORKSHEET_STUDIO_PDF_COVERAGE.md`, this state file. Existing curriculumLessons published snapshot fields and
worksheetVersions are reused; no collection, rule, migration, Function or production data changes.

Executed checks: focused Vitest 5 files / 58 tests passed; full CRM Vitest 106 files / 522 tests passed;
ESLint passed; production build passed (existing >600 kB chunk warning); git diff --check passed.
Browser: actual Vite app with VITE_FIREBASE_EMULATORS=1, Auth/Firestore on demo-keelesepp, existing Firestore rules:
- old worksheet v3 -> edit title -> Salvesta: still Tööleht; preview shows old title; assignment succeeds and stored
  worksheetAssignments snapshot has the old content, while curriculumLessons holds the new draft;
- new listening worksheet -> Salvesta: Tööleht, preview Mustand; assignment has the constructor/publish link and no
  assign button; constructor Avalda is enabled despite absent audio;
- follow that link -> Avalda -> assign: assignment stores new published v2;
- pre-existing broken draft without published snapshot -> Avalda succeeds with listening audio absent;
- constructor, library, draft preview and assignment dialog at 390x844: documentElement.scrollWidth=390;
  no page errors reported by agent-browser. Screenshots saved locally in /tmp/worksheet-*.png.

Limits: no production migration repairs historical drafts automatically; staff publishes them through the constructor.
No deploy executed. No new PR merged. Unfinished implementation work: none for Task 1.
Exactly one next safe step: owner reviews the Task 1 draft PR.

## 2026-10-01 — access hotfix after PR #226 — MERGED (#227, 9fda4b9), release pending

Owner reported that the parent study-terms release caused parent login errors and that approving a newly registered
student surfaced a raw browser `Failed to fetch`. Verified current GitHub `main` = `36abfd6` (merge #226) and
Vercel production deployment `dpl_AGUKe8X8SC1mHFX1GCpX7uximU6P` still serves that exact commit on
`crm.epkoolitus.ee`; the attempted rollback had not changed GitHub main or the active production aliases when checked.

Hotfix scope is intentionally narrow:
- revert the full #226 parent-study-terms gate back to the pre-#226 tree `c76f69f`; no parent is blocked by a new
  first-login condition and no `studyTermsAcceptedAt/studyTermsVersion` browser write is required;
- keep registration/approval data unchanged;
- allow the protected Firebase HTTP APIs to answer CORS requests from exact configured origins plus the KeeleSepp CRM
  Vercel project aliases under `*-zakutailopavel-cybers-projects.vercel.app`; authentication and admin checks remain
  mandatory, so CORS does not grant data access;
- replace the raw account-approval `Failed to fetch` text with an actionable message pointing staff back to the
  canonical `https://crm.epkoolitus.ee` address.

Why the student symptom is separate from registration: `authService.register()` creates a pending Firebase account
and profile without calling `staffOperationsApi`; the server fetch is skipped while approvalStatus is pending.
The request to `staffOperationsApi/accounts/approval` happens when staff approves the account, and
`accounts/bootstrap` runs only after approval. A browser-level `Failed to fetch` therefore points to network/CORS
before a normal JSON 4xx/5xx response can be handled.

Changed in this hotfix: CRM v2 auth/settings files are reverted to pre-#226 state; `firestore.rules` is reverted to
the pre-#226 source; `functions/index.js` now uses the tested origin matcher; new
`functions/cors-origin-core.js` + test; `accountApprovals.js` has the recovery message. No data migration and no
production mutation performed by the agent. The CORS fix only becomes live when `staffOperationsApi` is explicitly
deployed; Vercel deploy alone cannot update Firebase Functions.

Checks on code HEAD `d628ae5`: CRM v2 106 test files / 515 tests passed; ESLint passed; production build passed.
GitHub `security-regression` and `financial-core` emulator workflows passed. Vercel preview
`dpl_qHvPozXyX1A3qAa6c1rJ1HUiNTuG` is READY and Vercel reports no unresolved preview feedback. This
PROJECT_STATE update is documentation-only; production remains unchanged.

Next safe step: owner manually merges PR #227. Release must include the Vercel CRM update plus an explicit
`staffOperationsApi` Firebase Functions deploy for the CORS repair; until that Function is deployed, the CORS
change is not live.


## 2026-10-01 — Approval SMTP response repair — MERGED (#229, 240e09c), release pending (Functions deploy)

**Correction 2026-10-02 (owner asked Claude to finish it):** sending the e-mail after `res.json` was replaced. On
Cloud Functions an instance may be stopped right after the response, so the approval e-mail could be silently lost.
Now the e-mail is sent before the response, bounded by `APPROVAL_MAIL_LIMIT_MS` = 30 s (`Promise.race`; timeout or
error → `console.error`, `mailed:false`), and `staffOperationsApi` runs with `timeoutSeconds: 120`. `mailed:true` only
when delivery finished; `mailPending` is always `false`. Tests rewritten: stalled SMTP → response after the limit with
mailed=false and CORS; normal → order profile, bootstrap, audit, mail, response; failure → logged, one response.
Checks: Functions `node --test` 212/212; CRM accounts 16/16. The paragraphs below describe the earlier draft
("SMTP starts after the response", "post-response mail is best effort") and are superseded by this correction.

Checked fresh main `9fda4b9df487696b59cbe1847ab3ce08e1bed7c6` on 2026-10-01 (#227 merged with explicit owner
permission). Open Task 1 draft PR #228 is separate; none of its implementation is included in this branch.
Task 2 draft PR #229: https://github.com/zakutailopavel-cyber/keelesepp/pull/229. No parent study-terms work is included.

Completed: `deliverEmail` configures nodemailer connectionTimeout=10000, greetingTimeout=10000,
socketTimeout=20000. `/accounts/approval` writes profile, performs bootstrap and writes audit before replying;
SMTP starts after the successful JSON response. SMTP errors are caught/logged and do not send a second response.
The immediate response carries mailed=false (delivery unconfirmed), with additive mailPending=true when an attempt
is planned; AccountsPage never claims mail was sent while pending. Existing emailQueue records retain delivery
status/error. Already approved accounts and rejections do not send a repeated approval e-mail.
On a fetch/body network failure the CRM uses getDocFromServer for users/{uid}; an explicit approved status recovers
as a success notice: “Konto kinnitati, kuid vastust ei saadud. E-kiri võis jääda saatmata.” Missing, unreadable,
pending/rejected or fieldless profiles retain the network error. HTTP API errors are not masked; no automatic retry
or duplicate approval is sent. The new accounts list refreshes after recovery.

Files: `functions/index.js`, `functions/account-approval-response.test.js`;
`crm-v2/src/services/firebase/{accountApprovals.js,accountApprovals.test.js}`;
`crm-v2/src/features/accounts/{AccountsPage.jsx,AccountsPage.test.jsx}`; `ARCHITECTURE.md`, this file.
No rules, collections, profile-schema change or migration. The API adds mailPending and the client service adds
responseLost for local reconciliation. Existing approvalStatus/linking/audit meanings are preserved.

Executed checks: focused CRM 2 files / 16 tests passed; full CRM 107 files / 527 tests passed;
Functions node --test 211/211 passed, including a stalled delivery with response-before-SMTP, CORS, failure logging,
no duplicate mail, actual transporter options and persisted delivery failure. ESLint passed; build passed with existing
chunk warning; git diff --check passed. Browser: actual CRM at 390x844 with VITE_FIREBASE_EMULATORS=1 and demo-keelesepp
Auth/Firestore. A local test-only endpoint wrote approved to the emulator and deliberately dropped the HTTP response;
real accountApprovals service reread the profile, AccountsPage showed the exact recovery notice, removed the pending
row, and had scrollWidth=390. This is a network fault injection, not a real SMTP/production Functions smoke.

Limits: post-response mail is best effort; Firebase can suspend execution after sending the HTTP response. No durable
worker/retry infrastructure is added. The HTTP response cannot report a future mail outcome; mailed=false remains
accurate at response time and mailPending avoids claiming delivery. Real production SMTP delivery was not exercised.
No deploy and no production-data operations were performed. No new PR merged. Unfinished implementation: none.
Required owner release after review/merge: `firebase deploy --only functions:staffOperationsApi`, plus CRM v2 release.
Exactly one next safe step: owner reviews the Task 2 draft PR and the best-effort mail limitation.

## 2026-10-01 — Worksheet Studio PDF coverage and author reliability — MERGED (#225, c76f69f), RELEASED with #226

Checked against fresh `origin/main` `a3e9f88`; no open PRs at start. Rendered and reviewed all local generated
worksheet PDFs (one-page and textbook `Minu päev`, plus the two-page `Kiri linnavalitsusele`). Worksheet Studio now
has 32 structured blocks: the former 21 plus word forms, error correction, dictation, translation, word search,
crossword, role cards, writing plan, phrase bank, guided long letter and rubric. A built-in formal-letter template
recreates the PDF workflow as editable/interactive/print content.

Author safety: browser autosave/recovery, conflict rejection for stale editors, immutable `worksheetVersions`,
restore as a new version, draft/published lifecycle, publication quality gate, assignment from last published snapshot,
whole-sheet copy, searchable palette, JSON replacement confirmation, manual page break and improved 390 px authoring.
No migration, Function, rule, external API or production action. Existing `worksheetVersions` create-only staff rule
is reused. Focused tests: 16 files / 98 tests passed; ESLint clean; production build passed. Browser harness: all 31
palette entries visible, formal-letter template paginated to two pages, 9 interactive inputs enabled, and 390×844
layout had no horizontal page overflow. Full suite: 511/515 passed; the four unrelated failures are the same current
main timing issues in FinancePage (3) and StudentProfilePage (1), while all worksheet/library tests passed.

Next safe step: review the branch diff and browser evidence, then open a draft PR; deployment remains owner-gated.

## 2026-10-01 — Õppevara: worksheet of a material visible and reachable — MERGED (#224, a3e9f88), RELEASED

Checked against main `0628691` (#223 merged and released). Owner: a worksheet made in the Töölehe konstruktor was not
visible in the preview, and a lesson plan had no clear "create / change the worksheet" action. The worksheet lives on
the same `curriculumLessons` record as `worksheetDoc` (unchanged). Now:
- `MaterialPreview.jsx` renders the constructor worksheet exactly as printed (`StudioSheetPreview.jsx`, lazy-loaded
  `Sheet` in print mode) next to the lesson plan phases, with "Muuda töölehte" / "Loo tööleht" in the footer.
- `MaterialEditor.jsx` has a "Tööleht" box at the top for existing materials: status, "Vaata töölehte",
  "Muuda töölehte" or "Loo tööleht" (opens `/library/worksheets/:id`; saving there attaches the worksheet to the
  same material, as before).
- `LibraryPage.jsx`: every row has "Vaata" again (preview now shows constructor worksheets); the detail window says
  "Muuda töölehte" / "Loo tööleht" instead of "Ava konstruktoris".
- No data, rule or assignment change. Checks: library tests 22/22 (+2), `npx eslint src` clean, build OK; full suite
  506/510 — the 4 failures are the known date-dependent finance/profile tests that also fail on main. Browser on
  local emulators: lesson plan → "Loo tööleht" opens the builder; plan with a constructor worksheet → preview shows
  the sheet, "Muuda töölehte" opens the builder; 1440/390 px without horizontal scroll, no page errors.
- Next safe step: owner merges, then Vercel `keelesepp-crm-v2` release.

## 2026-10-01 — Õppevara: visible "Muuda" on every row — MERGED (#223, 0628691), RELEASED

Checked against main `950a0d1` (2026-10-01; #219–#222 merged and released to `keelesepp-crm-v2` by the owner).
Owner could not find how to edit a worksheet. Before: structured worksheets had only an "Ava" button, old image/PDF
worksheets only "Vaata"; editing was hidden behind clicking the title. Now every row in `LibraryPage.jsx` has
"Muuda": worksheets (structured, or `type: 'worksheet'` with only files, which the library lists as Tunnikava) open
in the Töölehe konstruktor, exercises in the exercise editor, other materials in the material editor. "Vaata" stays
for items without a structured worksheet. No data, type classification or assignment change.
Checks: library tests 20/20 (2 new), `npx eslint src` clean; browser on local emulators: both worksheet kinds open in
the builder from "Muuda", 1440/390 px without horizontal scroll. Next safe step: owner merges, then Vercel
`keelesepp-crm-v2` release.

## 2026-10-01 — Team tasks (Ülesanded) and notification centre in CRM v2 — MERGED (#222, 950a0d1), RELEASED

Checked against main `e014ea6` (2026-10-01). Goal: staff work with team tasks and see what needs attention in CRM v2,
so v1 is not needed for it. Same `tasks` collection and field meanings as v1 (both CRMs show the same tasks); no rule,
index, function or migration change (`tasks` is already read/write for staff).

- `services/firebase/tasks.js`: live subscribe, create, update (status change sets/clears `doneAt/doneBy*` like v1),
  reply (bounded to 30, `lastReply*`), markSeen (`lastReplySeenBy`, `openedByUids` via arrayUnion), remove. Every
  change except markSeen writes an `activityLog` entry (`task.created/updated/done/reopened/reply/deleted`), as v1.
- Additive optional fields: `assignedToUid` (hint; the name `assignedTo` stays authoritative), `openedByUids`.
- `features/tasks/`: `taskModel.js` (v1 scope: admin sees all, teacher sees assigned/created; filters Avatud, Minu
  ülesanded, Tähtaeg möödas, Minu loodud, Valmis, Kõik; Kiire first), `TasksPage.jsx` (`/tasks`, staff, menu
  "Ülesanded"): quick add, board Uus/Töös/Valmis (Valmis shows the last 7 days under "Avatud") and list, search,
  tick done, task window via `?task=id` with all fields, discussion, delete for admin/creator. `useTasks.js`, `tasks.css`.
- Notification centre: bell in the top bar for admin/teacher/finance (`components/layout/NotificationCenter.jsx`,
  `features/notifications/`). Items are derived, not stored: new task for me (last 14 days, not opened), new task
  reply, overdue task (assignee; admin sees all), task due today, unread messages per conversation, homework awaiting
  review, overdue invoices (admin/finance). Category tabs, refresh; each item opens its page.
- Checks: `npx eslint src` clean; `npx vitest run` 104 files / 494 tests pass (8 new in `tasks.test.jsx`);
  `npm run build` OK. Browser run on local emulators (`demo-keelesepp`, no production): teacher bell 3 items (overdue v1
  task, new task, unread message) → task opens from bell, status Töös + reply saved in v1 format, bell drops to 2;
  admin sees "Uus vastus" and creates a task for Elena → stored with v1 fields + activityLog; teacher bell shows it
  live; 1440 and 390 px without horizontal scroll; no rule errors.
- Limits: messages/homework/invoices in the bell refresh on page load and when the bell is opened (tasks are live);
  no e-mail/push; no drag-and-drop between columns; v1 has no `openedByUids`, so opening a task in v1 does not clear
  "Uus ülesanne sulle" in v2.
- Release = merge + Vercel `keelesepp-crm-v2`; no functions/rules deploy.
- Next safe step: owner reviews and merges the draft PR, then releases `keelesepp-crm-v2`.
## 2026-10-01 — Student board outside the lesson (CRM v2 `/board`) — MERGED (#221, 04fc1a6), RELEASED

Checked against main `e014ea6` (2026-10-01). Goal: the student's own board (v1 "Tahvel") works in CRM v2 so v1 can be
retired. Same data as v1, no new collections, no rule or schema change: `whiteboards/{studentId}/elements` and lesson
pages `whiteboards/{studentId}/lessonPages/{pageId}/elements` (snapshot pages hidden). Everything drawn in v1 shows up
in v2 and both stay in sync live.

- `services/firebase/studentBoard.js`: live subscribe of elements/pages, add/update (v1 meta: `updatedAt`,
  `updatedByUid`, `updatedByName`, `lastClientId`, `revision`), remove, teacher "Tühjenda" (keeps locked elements).
- `features/board/`: `boardModel.js` (pure geometry: pan/zoom 20–300 %, fit, shapes, arrows), `StudentBoard.jsx`
  (tools: select/move, pen, sticky note, text, rect, ellipse, arrow, eraser, hand; colours; zoom; page tabs "Tahvel" +
  v1 lesson pages; renders v1 stroke/shape/note/text/image/pdf), `BoardPage.jsx`, `board.css`, `board.test.jsx` (7).
- Routes: `/board` for student/parent (menu item "Tahvel", picks the card when there are several), `/board/:studentId`
  for staff, opened with "Ava tahvel" on the student card. `ACCESS.BOARD` in `app/accessPolicy.js`.
- Limits as in the rules: only staff can add image/pdf (v2 does not upload yet — use the Live Classroom or v1 for
  that); locked elements cannot be erased or moved; strokes cannot be moved.
- Checks: `npx eslint src` clean; `npx vitest run` 104 files / 493 tests pass; `npm run build` OK. Browser run on local
  emulators (`demo-keelesepp`, no production): teacher opens the board from the card and sees v1 elements, student has
  "Tahvel" in the menu, teacher's stroke appears live for the student and the student's note for the teacher, moving a
  v1 note works, lesson page text shows, no rule errors; 1440 px and 390 px without horizontal scroll.
- Not done: image/PDF upload from v2, undo. Release = merge + Vercel `keelesepp-crm-v2`; no functions/rules deploy.
- Next safe step: owner reviews and merges the draft PR, then releases `keelesepp-crm-v2`.
## 2026-10-01 — Finish CRM v1 interactive lessons in CRM v2 — MERGED (#220, 84de98a), RELEASED

Owner item 7 (issued v1 content must be finishable in v2). v1 exercises assigned as homework already open in v2
(`ExercisePlayer`); what was missing were the v1 **interactive lessons** (`interactiveAssignments`, server-only, e.g.
the A2 lesson with many activities), which only opened on www.epkoolitus.ee/interactive-lesson/ with a separate login.
Now "Kodutööd" shows a card "Interaktiivsed tunnid" (students: all their v1 interactive lessons; teachers: the ones
waiting for feedback). `InteractiveLessonPlayer` uses the existing `interactiveLessonApi` (list/get/save/submit/review)
— same rules as v1: answers per activity (short/long text, single/multiple choice, gaps incl. inline "___"), local
draft backup, required answers checked before "Saada õpetajale", revision conflict message; teachers see the student's
answer next to the expected answer / teacher instruction and send feedback. Nothing new is assigned from v2; the card
disappears when the old lessons are done. No server, rule or data change (the API already allows crm.epkoolitus.ee).
Files: `crm-v2/src/services/firebase/interactiveAssignments.js` (+index), `crm-v2/src/features/homework/
{InteractiveLessonPlayer.jsx,interactiveLessonModel.js,interactiveLesson.css,HomeworkPage.jsx,HomeworkPage.test.jsx}`.
Checks: homework vitest 26/26 (2 new), ESLint clean; browser on emulators **with the real functions emulator**: a
lesson created and assigned through lessonDraftsApi/interactiveLessonApi; student answered, saved, sent; teacher saw
answer + expected and sent feedback; student saw "Tubli, Mari!". Needs only a Vercel release of crm-v2.
## 2026-10-01 — "Alusta tundi" from the calendar — MERGED (#219, 0a5a5e5), RELEASED

Owner chose items 1, 7, 8, 9 of the teacher-work list (item 6 "Minu tööpäev" is dropped for good; the rest waits).
This is item 1. The calendar lesson panel shows "Alusta tundi" for an individual lesson on its day that is not yet
marked: it creates a `liveLessonInvitations` invitation with the existing service (title "<subject> · <time>") and
opens `/live-classroom?invitation=<id>`. A student card without a linked account shows the button disabled with
"Õpilasel pole veel sisselogimiskontot…". No rule, data or function change.
Files: `crm-v2/src/features/calendar/{CalendarPage.jsx,LessonPanel.jsx,calendarV2.css,CalendarPage.test.jsx}`.
Checks: calendar vitest 44/44 (3 new), ESLint clean; browser on emulators: teacher clicks "Alusta tundi" → room opens
("Ootab vastust"), student cabinet shows "Jelena kutsub sind tundi" → "Liitu tunniga" → teacher sees "Mari Maas võttis
kutse vastu".
Next: item 7 (finish issued v1 assignments in v2), then 8 (student board), 9 (team tasks + notifications), each its own PR.

## 2026-10-01 — Website header fix (www.epkoolitus.ee, ET and RU)

Owner screenshot: the header was crooked — logo glued to "Kursused", the ET/RU switch cut off, "Logi sisse" on two
lines. Cause (older than #215, made worse by its new menu item "Õppematerjalid"): the header sat in the 1120 px content
column and every item was allowed to shrink. Fix in `index.html` and `ru/index.html`: the header row is up to 1320 px
wide with a 28 px gap, logo/buttons/language switch/menu items never shrink or wrap, menu gap 20 px below 1400 px, the
☰ menu from 1240 px down (was 1080 px), tighter spacing below 560 px. Checked with Playwright at 360–1920 px in both
languages: no overlap, no horizontal scroll. Needs a Vercel release of the `keelesepp` project.

## 2026-10-01 — Release of #214, #215, #216 (main `adabd67`) — DEPLOYED

The owner ran the release on his Mac from a clean worktree of `origin/main` (`~/keelesepp-release`), guided step by step:
- Firebase (`keelesepp-5136b`): Firestore rules released; functions `gcalApi`, `syncAllCalendars`, `websiteLeadApi`
  updated and `syncGroupToGoogleCalendar` created — "Deploy complete!".
- Vercel: `keelesepp-crm-v2` → crm.epkoolitus.ee and `keelesepp` → www.epkoolitus.ee, both "Ready" and aliased.
- Checked from outside: crm.epkoolitus.ee serves a new bundle; www.epkoolitus.ee/oppematerjalid/ is live; the live
  tasemetest page contains both review fixes (`diagnosticId: attemptId`, language "Eesti keel"/"Inglise keel").
Not yet done (owner): connect Google Calendar for one teacher in Seaded and check one individual and one group lesson
in Google; send one real level-test result and see it in CRM "Päringud". Known: some FinancePage/StudentProfilePage
tests fail on the 1st of the month on main too (suggested as a separate task), not a production issue.
Exactly one next safe step: the owner's two live checks above.

## 2026-09-30 — Public growth platform v1 — MERGED (#215, adabd67)

**Review fixes (2026-09-30, before merge).** A browser run of `tasemetest.html` with the lead request intercepted
(never sent to production) found that no level-test result could be delivered: (1) the submit handler read an undefined
`diagnosticCode` and threw before sending; it now uses `attemptId`; (2) it sent the track label ("Eesti suund" /
"English track") as `language`, which `websiteLeadApi` rejects with 400; it now sends "Eesti keel" / "Inglise keel".
After the fix the captured payload passes `normalizeWebsiteLead` (language, level, source `level-test`, bounded
assessment) and the visitor sees "Tulemus on saadetud". The four `/oppematerjalid/` pages and their CSS load (200) and
link only to existing paths. Remaining gates unchanged: `websiteLeadApi` + Firestore rules deploy with the owner's word,
then one real end-to-end lead.


Last verified main: `9e2ae40` after `git fetch origin --prune`. Active branch: `agent/public-growth-platform-v1`.
PR: not opened. Goal: one cohesive public funnel rather than a series of small Vercel-triggering commits.

Implemented locally: the adaptive level test now describes its real 6-15 question path and submits the result through
`websiteLeadApi`; the normalized `websiteLeads` record can contain bounded diagnostic score/skill data and its source;
CRM v2 has a staff-only `Päringud` queue with status transitions; Firestore permits staff reads and four-field workflow
updates only; the new `/oppematerjalid/` hub contains the first three indexable topic pages and is linked from the
homepage and sitemap. Full contract and release gates: `docs/PUBLIC_GROWTH_V1.md`.

Checks: Functions full suite 188/188; CRM v2 ESLint clean, production build OK, Vitest 102 files / 452 tests;
Firestore rules dry-run compiled successfully; level-test inline JavaScript syntax OK; sitemap XML parses;
`git diff --check` clean. The in-app browser verified
the current production homepage and test before implementation, but could not reach the isolated local HTTP server,
so visual verification of the new public pages remains pending. No production service, data, function, rules or Vercel
deployment was changed.

Known gates: `websiteLeadApi` and Firestore rules need separate owner-approved Firebase deploys; merging/pushing would
trigger Vercel and has intentionally not been done. Exactly one next safe step: perform a local visual review using a
browser that can reach the worktree server, then make one commit and open one draft PR for the complete block.
## Worksheet Studio (Töölehe konstruktor) browser audit — MERGED (#216, 048757a)

Last verified against main: 2026-09-30, `9e2ae40` (#213). Owner 2026-09-30: test the lesson builder the same way as the
calendar. Separate from the calendar PR #214 (AGENTS.md: learning content and calendar changes are not mixed).
Full scenario list, findings and fixes: `docs/WORKSHEET_STUDIO_V1.md` → "Browser audit 2026-09-30".
Fixed: unsaved work lost on in-app navigation; undo/redo + Delete key; choice block not selectable by its options;
invalid JSON import crash; sample sheet overwrite without asking; default-title first save; Kodutööd hid the submit
result and could overwrite newer answers after a reload; Kodutööd counters ignored worksheets; started sheet shown as
"Alustamata".
Files: `crm-v2/src/features/worksheet-studio/{WorksheetStudioPage.jsx,editorHistory.js,engine/sheet.css}` (+test),
`crm-v2/src/features/homework/HomeworkPage.jsx` (+test). No data, rule, Function or schema change.
Checks: crm-v2 vitest 457/459 — the 2 failures are `FinancePage.test.jsx` (a "Loen tunniplaani…" spinner still on
screen when the test looks for the status message); they fail identically on clean `main`, not touched here. ESLint
clean, build OK. Browser re-run of every fixed scenario: OK.
Exactly one next safe step: owner reviews and merges the PR, then a Vercel release.
## Google Calendar in CRM v2 (connect, status, groups) — MERGED (#214, e323ace)

Last verified against main: 2026-09-30, `9e2ae40` (#213). Owner request 2026-09-30: "полноценную и удобную синхронизацию
с Гугл календарем". The server sync already existed (hourly import, push of individual lessons, outbox, dedupe); v2 had
no screen and the OAuth return landed in v1.

Done:
- **Seaded → Google Calendar** (teachers and admins, not in support preview): connect, grant write access for old
  import-only connections, state (two-way / import only / error), last import and push time, "Sünkrooni kohe",
  switch "Näita minu grupitunde Google Calendaris", disconnect with a two-click confirmation.
- **Calendar toolbar chip**: Google state + time of last sync + sync button; not connected → link to Seaded. Opening the
  calendar syncs by itself when the last sync is older than 15 minutes (light sync, never while an error is shown).
- **Lesson panel**: "Google Calendaris" / "Ootab…" / "Google'isse ei jõudnud: <error>" for KeeleSepp lessons. Lessons
  imported from Google (`source: gcal`) show "Google Calendarist", cannot be dragged, and have no "Muuda aega" /
  "Tühista tund" (the next import would undo the change); "Tund toimus" still works.
- **Server (`functions/index.js`)**: `/gcal/auth-url` takes `returnTo` (allowed CRM origins only, stored in
  `oauthStates`), callback returns there with `?gcal=connected|error` (v1 unchanged: fallback `APP_BASE_URL`);
  `/gcal/sync` takes `force: false` (v2: push only changed/failed lessons; v1 sends nothing and keeps the full re-push);
  new `/gcal/settings { uid, syncGroups }`; status adds `syncGroups`, `lastGroupPushAt`, `lastGroupPushError`;
  disconnect keeps imported one-off lessons dated before today (history) and returns `{ removed, kept }`.
- **Group lessons → Google**: new trigger `syncGroupToGoogleCalendar` (groups/{id}) and the hourly job / manual sync push
  each group lesson as its own private event (origin `keelesepp-group`) into the group teacher's primary calendar.
  Links in the new server-only collection `calendarGroupEventLinks/{groupId}__{lessonId}` ({ groupId, lessonId,
  teacherUid, eventId, anchorDate, hash, status, error }). Attendance marks do not trigger a push. Removed/cancelled
  lessons, inactive groups, switching the setting off and handing a group to another teacher delete the event. The
  import skips group events. Series without a start date use `anchorDate` = the day of the first push.
- Firestore rule: `calendarGroupEventLinks` read/write false.
- **"Kustuta" in the lesson panel** (owner 2026-09-30: a lesson put in by mistake, wrong student or wrong day, could not
  be deleted). Next to "Tühista tund" (lesson does not take place) the panel has "Kustuta" with a confirmation: a one-off
  lesson is removed (`schedule` doc deleted → the trigger deletes its Google event); a weekly lesson asks "Ainult see
  tund" (date into `excludedDates`) or "See ja kõik järgmised" (`endDate` = day before; the whole record is deleted only
  from its first date and when it has no `lessons` records). Undo toast restores the same record under the same id
  (`scheduleService.restore`, Google link fields stripped so a fresh event is created). Not offered for held/absent
  lessons, group lessons or lessons imported from Google. Pure planner `planDelete` in `calendarGrid.js`.

**Calendar scenario audit (owner 2026-09-30: "проверь все сценарии использования календаря").** Walked through in a
real browser (Playwright) on the Firestore/Auth emulators with seeded admin, teacher, students, one-off, weekly, group,
Google-imported, 07:30 and 21:00 lessons. Found and fixed:
- Lessons before 08:00 or from 21:00 were **not shown at all** in week/day view (grid filtered them out while the
  counter included them). The grid now widens to whole hours around the earliest/latest lesson (`gridRange`).
- A wrong mark could not be fixed. Done/absent lessons now have "Märkisid valesti? Paranda": another status, or
  "Eemalda märge" (planned again). CRM v2 marks are changed in Firestore (`lessonsService.changeMark/removeMark`,
  activity log); older marks are removed through the server journal (`financeApi.deleteLessonJournal`, reverses
  package/counter bookkeeping). Invoiced lessons / closed periods are refused with a pointer to Finantsid.
- Future lessons could be marked "Tund toimus". Before the lesson day only "Puudus (teatas ette)" is offered.
- "Tühista kogu sari" in the edit dialog set the whole series to cancelled, which also hid every past occurrence from
  the calendar. Replaced by "Lõpeta või kustuta…" (only this date / this and all following; history stays).
- Cancelling a one-off lesson had no undo; now the toast offers "Tühista".
- A group lesson could not be cancelled for one date from the calendar: admin gets "Tühista see grupitund" (date into
  the lesson's `excludedDates`, with undo).
- Admin can pick the teacher when creating/editing a lesson (substitution); default is the student's teacher. Editing
  no longer silently resets the teacher to the student's teacher.
- "Eelmine kord" showed the lesson's own mark instead of the previous lesson.
- Resize toast shows the new length.
Verified OK in the browser: week/day/month/mobile agenda, create one-off and weekly, conflict refusal, drag + undo,
resize, delete (one-off, one date, series from its first date), teacher sees only own lessons and no teacher picker,
group attendance, Google-imported lesson locked, `?student=` filter. `VITE_FIREBASE_EMULATORS=1` (off by default)
connects the v2 client to local emulators; how-to in `crm-v2/README.md`.
Not covered: Live Classroom start from a lesson (not in the calendar panel), mobile drag (agenda has no drag by design).

Checks (2026-09-30): functions `npm test` 201/201 (new `calendar-group-sync-core.test.js`,
`calendar-group-sync-behavior.test.js`); crm-v2 vitest 479/479, ESLint clean, `vite build` OK. Not run: emulator
suite, a real Google account, visual check in a browser.

Needs with the merge (owner's word): deploy functions `gcalApi`, `syncAllCalendars`, `syncGroupToGoogleCalendar` (new)
and Firestore rules. Until then v2 "Ühenda" still works but returns to v1, and group lessons are not pushed. No Google
Cloud Console change: the redirect URI is unchanged.

Risks: teachers who already typed group lessons into Google by hand will see them twice — they can switch groups off in
Seaded or delete their own copies. If the Google OAuth app is in "Testing" mode, refresh tokens expire after 7 days.
Conflicts are still last-synchronized-write-wins; sync is hourly + on calendar open (no Google push channel yet).

Exactly one next safe step: owner deploys `gcalApi`, `syncAllCalendars`, `syncGroupToGoogleCalendar` and the rules,
then connects one teacher in crm.epkoolitus.ee → Seaded → Google Calendar and checks one individual and one group lesson
in Google.

## 2026-09-29 — crm.epkoolitus.ee now serves CRM v2

`crm.epkoolitus.ee` points at the `keelesepp-crm-v2` Vercel project. v2 has self-registration (`/registreeru`),
password reset and new-Google-account onboarding; old v1 paths (`/haldus…`, `/tasemetest`, `/kutse`, …) redirect (307)
to `www.epkoolitus.ee`, which still serves the school website and v1. Details, rollback and remaining items:
`docs/CRM_V2_MIGRATION_PLAN.md` ("Domain switch").

## CRM v2 bug: students and parents landed on "Ligipääs puudub" — PR

Reported by the owner 2026-09-29 with a screenshot of a student's browser (`/forbidden`). After sign-in everyone opens
`/`, which was wrapped in the staff-only DASHBOARD guard, so students and parents never reached `HomePage`, which
already redirects them to `/student` and `/parent`; "Tagasi avalehele" looped back. Fix: `/` is no longer guarded;
`HomePage` routes by role. Regression test `src/app/routes.home.test.jsx` (fails on the old routes). Direct links
meanwhile: `/student`, `/parent`.

## Lesson recording and free transcription — PR

Owner 2026-09-29: "3 пункт делаем но без квен пока". Live Classroom records a lesson (teacher + student tracks,
5-minute files) with the student's consent from the student card; a worker on the school Mac transcribes it for free
with whisper.cpp; staff read the dialogue on the student card. No AI analysis yet. Details: `docs/LESSON_RECORDING.md`.
New: `crm-v2/src/features/lesson-recording/*`, `crm-v2/src/services/firebase/lessonRecordings.js`,
`LiveLessonCallPanel` `onMediaStreams`, room/student-card wiring, `tools/lesson-transcriber/*`, Firestore rule
`lessonRecordings`, Storage rule `lessonRecordings/*`, emulator test and CI steps.
Needs: Firestore **and Storage** rules deploy with the merge; owner creates a service account key; whisper model
download on the Mac; launchd agent. Checks: vitest 390/390, ESLint clean, build OK, transcriber lib tests 3/3, rules
compile.

## Student cabinet pet (KeeleSepp sõbrad) — PR #195

Owner idea 2026-09-29: every student is greeted by a personal pet; the student chooses it. On "Minu õpingud" a student
picks one of four pets (Siil, Rebane, Kakk, Draakon) and names it; the pet then shows mood and growth derived only from
existing data: held lessons (+10), submitted worksheets/exercises (+15), fully reached lesson goals in `score.perGoal`
(+5); stages Beebi / Noor (scarf, from 100) / Täiskasvanu (cap, from 300); moods proud (goal in 3 days), happy (lesson
or work in 2 days), asleep (no activity 14+ days; never sick or dying), calm. It greets in the language being learned
(Estonian, English for English learners) with a Russian hint: today's lesson, homework count, praise.
Files: `crm-v2/src/features/pet/{petArt.js,petModel.js,PetCard.jsx,pet.css,pet.test.jsx}`,
`crm-v2/src/services/firebase/pets.js` (+ index export), `StudentDashboardPage.jsx`, `firestore.rules`
(`safeSelfUserFields` + `validPet`), `functions/student-pet-emulator.integration.js` (+ emulator workflow).
Data contract: `users/{uid}.pet = { kind: siil|rebane|kakk|draakon, name ≤ 24, chosenAt }`, written by the user only.
Growth is never stored. Staff preview shows the pet read-only and nothing when none is chosen.
Walking companion (`PetCompanion`, mounted in `AppShell`, students only, never in staff preview): the pet walks along
the bottom of every page (click → a hint; "Peida mind" docks it in the corner), gives a first-visit tour of the menu
(`data-tour` on nav links; steps whose target is off screen are skipped), and reacts by itself to a lesson invitation
(runs to the invitation card: "… kutsub sind tundi! Vajuta „Liitu tunniga”"), a lesson starting within 15 minutes, and
late or due-today homework (`companionModel.js`). Uses existing reads only (invitations, own schedule, homework).
Owner decisions 2026-09-29 (design page https://claude.ai/artifact/N3EKq3c3LQxRRjLoni7wph): offered to every student with
"Ei, aitäh" (opt-out, switch in "Seaded" → "Minu sõber"); the five pre-deploy items are done in this PR: opt-out,
silence while a worksheet is open (`petQuiet`) and in the lesson room, tour/hidden/opt-out stored on the account
(`pet.tourDoneAt`, `pet.hidden`, `pet.optedOut`), celebration after "Esita tööleht" (`petCelebrate`, +15 and +5 per
reached goal), one-time hints on Kodutööd and Live Classroom. Estonian phrases are corrected after deploy. Stage 2 for
now: only motivational lines (no wardrobe, parent view or speech yet).
Pre-deploy review fixes: absences ('Puudus_eta', 'Puudus_p') and cancellations no longer feed the pet (only
'Toimunud' or an older record without status) and no longer count in "Läbitud tunnid"; on phones the tour points at the
menu button and the pet stands above the full-width invitation card; exercises also quiet the pet and celebrate;
keyboard focus moves into the tour card.
**Needs a Firestore rules deploy** together with the merge (`validPet` allows kind, name, chosenAt, tourDoneAt, hidden,
optedOut); until then saving fails with a permission error.
Checks: vitest 373/373, ESLint clean, build OK, rules compile (dry run).
## Production deploy status (2026-09-29)

Vercel's free plan hit its build rate limit several times on 2026-09-29, so some merges were not deployed. The last
production build of `keelesepp-crm-v2` before this note was `cf97557` (#190); #183 (Live Classroom with worksheet),
#193 (camera/microphone header) and #194 (dialog focus) were merged but not built. This docs-only merge triggers a new
production build of main. How to check: GitHub deployments API (`Production – keelesepp-crm-v2`) or the response header
`permissions-policy` of the v2 site (must contain `camera=(self)`).

## CRM v2 bug: typing in any dialog lost focus after the first key — PR

Reported by the owner on 2026-09-29 with a screen video of "Uus tund" (calendar): after typing the first letter of the
student name the suggestion list closed and focus jumped to the dialog's close button. Cause: the shared `Modal`
focus effect depended on `onClose`, which callers pass as a new function on every render, so each keystroke that
re-rendered the parent re-ran the effect (restore previous focus, then focus the first button). Affects every dialog
with a form. Fix: `onClose` kept in a ref, the effect runs only when the dialog opens. Regression tests in
`src/components/ui/ui.test.jsx` fail on the old code and pass now.

## CRM v2 production blocker: camera and microphone were forbidden — PR

Found 2026-09-29 while planning the switch of all users to v2: `crm-v2/vercel.json` sent
`Permissions-Policy: camera=(), microphone=()`, so on the production v2 site (`keelesepp-crm-v2.vercel.app`) the Live
Classroom video call, screen sharing and worksheet voice answers could not start (tests do not see hosting headers).
Fix: `camera=(self), microphone=(self), display-capture=(self)`; guard test `src/app/hostingHeaders.test.js`.
Checks: vitest 366/366, ESLint clean, build OK. Takes effect with the next Vercel production deploy of main.

## CRM v2 migration plan — DECIDED 2026-09-29

Owner decision: **Worksheet Studio is the only authoring tool**; v1 Lesson Builder ("Valmista tund"), v1 Worksheet
Builder, the v1 exercise builder and the v2 "Loo materjal" worksheet blocks / "Loo harjutus" are not ported or
developed further. Existing content stays usable (legacy adapter, "Üleviimine", issued assignments playable until
finished). Plan and order of remaining work: `docs/CRM_V2_MIGRATION_PLAN.md`.
Exactly one next safe step: step 1 of the plan (freeze old builders in the UI, no data change).

## CRM v2 Live Classroom (invitations, video call, presence, screen share, board, worksheet) — MERGED (#183, 62eaa29), RULES DEPLOYED

Updated 2026-09-29 (Claude, owner: «Довести и смёржить #183»): branch merged with main `cf97557` (Worksheet Studio),
and the lesson room now shows a structured worksheet (`RoomWorksheetPanel`): the teacher picks a studio worksheet,
it is assigned to the invited student (normal `worksheetAssignments` doc, note "Live Classroom: …") and tagged
`liveRoomKey = roomKey`, `liveOpenedAt`; the teacher sees answers live and points at tasks (`LiveWorksheetView`,
also used by `/library/worksheets/live/:id`); the student fills it inline (`DocWorksheetPlayer inline`, autosave).
Student query: `worksheetAssignments where studentId == … and liveRoomKey == …` (existing read rule, checked in
`functions/worksheet-studio-emulator.integration.js`). No rule change for the worksheet part.
Checks: vitest 365/365, ESLint clean, build OK, emulator job green. **Firestore rules deployed 2026-09-29** from main
`62eaa29` (`firebase deploy --only firestore:rules --project keelesepp-5136b`, dry run compiled first; owner-approved).


Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `8e8bd65` (branch was 0 commits behind `origin/main` at commit time).
Implementation branch: `agent/live-classroom-invitations-v2`.
Pull request: draft, opened 2026-09-28 (see GitHub; not merged by the agent).

Scope is deliberately limited to inviting a student and the invitation lifecycle up to entering one shared waiting
room. Video, whiteboard and lesson materials are NOT part of this PR. A teacher (or admin) opens Live Classroom,
chooses only a student that has a real student account, and sends an invitation. The student sees the invitation as an
overlay on any page of the student cabinet (`LessonInvitationOverlay` in `AppShell`) and can accept or decline; the
teacher can cancel; invitations expire after at most 5 minutes. Accepting brings both into the same waiting room
(`roomKey` = invitation ID). Student and teacher IDs stored on the invitation are immutable after creation.

Changed files: `crm-v2/src/app/accessPolicy.js` (+ test; new `ACCESS.LIVE_CLASSROOM` = admin, teacher, student),
`crm-v2/src/app/navigation.js`, `crm-v2/src/app/routes.jsx`, `crm-v2/src/components/layout/AppShell.jsx`,
`crm-v2/src/features/live-classroom/LiveClassroomPage.jsx` (+ new test), new
`crm-v2/src/features/live-classroom/invitationModel.js` (+ test), new `liveClassroom.css`, new
`crm-v2/src/components/layout/LessonInvitationOverlay.jsx` (+ test), new
`crm-v2/src/services/firebase/liveLessonInvitations.js`, `crm-v2/src/services/firebase/index.js`, `firestore.rules`.

Data contract: new collection `liveLessonInvitations/{invitationId}` with fields `teacherUid, teacherName, studentId,
studentUid, studentName, title, status (pending|accepted|declined|cancelled|closed), roomKey, createdAt, createdAtIso,
expiresAt, respondedAt, cancelledAt, closedAt`. Rules: create only by staff for themselves (`teacherUid == uid()`), only for a
student the teacher may invite (`teacherCanInviteStudent`), and only if `studentUid` is that student's own account
(`studentAccountOwns`: document ID, `linkedUserId`, `studentUid` or `linkedUserIds`). Parent/guardian fields
(`parentUid`, `linkedParentId(s)`, `guardianUid`) are intentionally NOT accepted, so a parent UID cannot be invited as
the student; the client (`studentAccountUid`) resolves the target from the same student-only fields. Update: only
`status/respondedAt/cancelledAt` may change, only from `pending`; the student may accept/decline before `expiresAt`;
teacher/admin may cancel a pending invitation; the inviting teacher/admin may close an accepted waiting room. Delete: admin only.

Validation before the corrective follow-up: full CRM v2 suite 75 files / 308 tests, focused live-classroom/overlay/access suites 4 files / 19 tests, ESLint and production build PASS. The corrective commit adds dedicated Firestore emulator coverage for parent/student identity, expiry, teacher scope and accepted-room closing; GitHub CI is the verification gate for that added coverage.
No production deployment, rules deploy, index change or data migration was performed.

Known limits and manual gates: `firestore.rules` changes take effect only after an explicit owner-approved rules
deploy; expiry is enforced by rules on accept and by the client display, there is no server-side cleanup of expired
invitations yet; the waiting room is the existing Live Classroom page keyed by `roomKey`, without video.

Follow-up in the same draft PR: accepted rooms now contain an opt-in browser WebRTC audio/video panel. Signaling is stored only in the invitation's `signals` subcollection, is readable/writable only by that invitation's teacher and student while status is `accepted`, and each fresh call uses a new session ID. Camera/microphone access happens only after the user presses the start/join button. A hangup signal stops both peers and local tracks. Current ICE configuration uses public STUN only; TURN fallback is intentionally still pending for restrictive NAT/firewall networks.

Presence/reconnect/floating follow-up in the same draft PR: accepted participants now heartbeat into an invitation-scoped `presence` subcollection; the UI shows whether the other participant is currently fresh/online, refreshes on tab visibility, and marks itself offline on cleanup when possible. A disconnected/failed teacher peer can issue a fresh WebRTC offer without closing the room, while a student with local media already enabled automatically answers a new offer. The call card can be switched into a compact fixed floating mode within Live Classroom. Firestore rules restrict presence writes to each participant's own UID/role and keep parents/outsiders out.

Screen sharing follow-up in the same draft PR: the teacher can share a browser-selected screen/window/tab only after the call has started. The implementation uses WebRTC `RTCRtpSender.replaceTrack`, so audio/microphone state is preserved and no separate signaling or Firestore collection is needed. The local preview switches to the shared surface; stopping from KeeleSepp or the browser's native “Stop sharing” control restores the camera track. Reconnect creates the next peer with the active screen track when sharing is still in progress.

Shared whiteboard follow-up in the same draft PR: accepted teacher/student pairs now get an invitation-scoped realtime SVG board with pen, four colors, eraser and teacher-only clear. Every stroke is stored as its own document under `liveLessonInvitations/{invitationId}/whiteboardElements`, reusing the established per-element collaboration model without exposing the general student whiteboard collection. This is intentional: the existing persistent whiteboard grants linked parents access, while a live lesson room must remain private to the invited student and teacher. Firestore rules allow both participants to add strokes, students to erase only their own strokes, and the inviting teacher to erase/clear any stroke; parents and outsiders cannot read or write the live board.

Unfinished: TURN fallback (needs an external TURN provider and credentials: owner decision), server-side cleanup of expired invitations (needs a Cloud Functions deploy), lesson completion integration (linking the room to the lesson record). Done: floating call window, board, worksheet inside the room.
Exactly one next safe step: after the rules deploy, one real teacher + student lesson: invite, accept, start the call, open a worksheet in the room.
## Worksheet Studio fixes from the visual check — MERGED (#190, cf97557)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `cd9a81f` (merged #189).
Branch: `agent/worksheet-studio-live-polish`. Found by clicking through the real components in a local harness
(in-memory data, teacher and student tabs synced; not committed):
1. `useFitScale` attached only on mount, so pages that first show a loading state (book, live view) never scaled and
   the A4 sheet overflowed the screen. The hook now returns a callback ref (`const [ref, scale] = useFitScale()`).
2. The live view marked untouched fields red while the learner was still working; now only answered fields get ✓/✗
   until the assignment is submitted.
3. Printing: a 381.86 mm page zoomed to exactly 297 mm only fits on A4 with zero margins, but A4 was set only for the
   named `worksheet` page, so with the browser's default paper (Letter) or margins every page split onto two sheets
   and the CRM background printed. Now the builder and the book set `@page { size: A4; margin: 0 }` for the whole job
   while they are open (`printPage.js`), the print zoom is .7776 (296.9 mm), and the page background is white.
   Checked with headless Chrome: a 1-sheet book prints as 4 A4 pages (cover, contents, sheet pages 3 and 4).
Verified visually: student player with photos and handwriting font, autosave, teacher live view (answer appears,
task highlight followed by the student's sheet), original panel with photo cutting (same-origin image), book cover,
contents and page numbers. Checks: vitest 335/335, ESLint clean, build OK.
Exactly one next safe step: merge after checks.

## Worksheet Studio end-to-end rules check — MERGED (#189, cd9a81f)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `2c72234` (merged #188).
Branch: `agent/worksheet-studio-e2e`. Adds `functions/worksheet-studio-emulator.integration.js` and runs it in
`.github/workflows/financial-core-emulator.yml`. Covers the whole worksheet path against the real Firestore rules
(see `docs/WORKSHEET_STUDIO_V1.md`). Storage is not covered: the CI Storage emulator denied every rules-checked upload,
even the super admin's; worth a separate look by whoever owns the emulator setup. No product code, rule or data change.
Exactly one next safe step: merge after the emulator job is green.

## Worksheet Studio slice 5 (live worksheet in a lesson) — MERGED (#188, 2c72234)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `005c44c` (merged #187).
Branch: `agent/worksheet-studio-live`. Claude merges its own PRs after all checks pass (owner, 2026-09-29).

What: the student player autosaves structured-worksheet answers; `/library/worksheets/live/:assignmentId` (staff) shows
them live with marks, progress and per-goal evidence; the teacher clicks a task to highlight it on the student's sheet
(`worksheetAssignments.liveFocus`). Entry: links "Jälgi tunnis otse" after assigning in Õppevara.
Changed files: `crm-v2/src/features/worksheet-studio/{LiveWorksheetPage.jsx,LiveWorksheetPage.test.jsx}` (new),
`DocWorksheetPlayer.jsx`, `engine/{Sheet.jsx,registry.js,sheet.css}`, `worksheetStudio.css`,
`crm-v2/src/services/firebase/{homework,library}.js` (+ tests), `crm-v2/src/features/library/LibraryPage.jsx`,
`crm-v2/src/app/{routes.jsx,accessPolicy.js}`, `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: optional `worksheetAssignments.liveFocus = { blockId, at }` (staff update, existing rule); student
autosave writes the already allowed `status/answers/updatedAt`. No rule, index, Function, migration or deploy.
Validation: `npx vitest run` 335/335; `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: not tried with two real browsers against Firebase; autosave adds one small write per pause while typing.
Unfinished (other track): embedding the live view in the v2 lesson room (after #183 and the room PR).
Exactly one next safe step: owner assigns one studio worksheet to a test student, opens "Jälgi tunnis otse" and fills
the sheet as the student in a second browser.

## Worksheet Studio slice 4 (textbook export) — MERGED (#187, 005c44c)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `69865b8` (merged #186).
Branch: `agent/worksheet-studio-book`. Claude merges its own PRs after all checks pass (owner, 2026-09-29).

What: `/library/worksheets/book` (staff, button "Õpik" in Õppevara) composes a textbook from structured worksheets:
title/subtitle/level/publisher, order, cover, contents with page numbers, sheets with running book page numbers;
"PDF / Prindi" prints the whole book as A4. The plan is kept in the teacher's browser (`localStorage`), nothing new in
Firestore.
Changed files: `crm-v2/src/features/worksheet-studio/{BookPage.jsx,BookPage.test.jsx}` (new), `engine/Sheet.jsx`
(`startPage`, `onPageCount`), `worksheetStudio.css`, `crm-v2/src/app/{routes.jsx,accessPolicy.js}`,
`crm-v2/src/features/library/LibraryPage.jsx`, `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: none. No rule, index, Function, migration or deploy.
Validation: `npx vitest run` 332/332; `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: the printed book was not checked on paper or as a browser PDF with real photos; the contents page assumes one
page (about 30 worksheets); photos ≤ 1600 px suit office printing, not 300 dpi offset.
Unfinished: Live Classroom worksheet scene (needs the v2 lesson room from the Live Classroom track).
Exactly one next safe step: owner builds a 3-sheet book in "Õpik" and saves it as PDF from the print dialog.

## Worksheet Studio slice 3 (moving image worksheets to the structured format) — MERGED (#186, 69865b8)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `0aacb7c` (merged #185).
Branch: `agent/worksheet-studio-conversion`. Owner instruction (2026-09-29): Claude merges its own PRs after all checks pass.

What: `/library/worksheets/convert` (staff, button "Üleviimine" in Õppevara) lists every worksheet-like material by
migration status (only image/PDF → v1 structured → done), with progress and filters. The studio opens a material
that has original images with an "Originaal" tab next to the sheet; the teacher drags a frame over a photo and cuts
it into the selected block or a new photo block (normal upload path). Text is retyped as blocks.
Changed files: `crm-v2/src/features/worksheet-studio/{conversion.js,ConversionQueuePage.jsx,OriginalPanel.jsx,
conversion.test.jsx}` (new), `WorksheetStudioPage.jsx` (+ test), `engine/image.js` (`cropToFile`, `nearestAspect`),
`worksheetStudio.css`, `crm-v2/src/app/{routes.jsx,accessPolicy.js}`, `crm-v2/src/features/library/LibraryPage.jsx`,
`storage.cors.json` (new, not applied), `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: none new. No rule, index, Function, migration or deploy.
Validation: `npx vitest run` 331/331; `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: cutting photos from originals needs Storage CORS for GET; until the owner runs
`gsutil cors set storage.cors.json gs://<bucket>` the studio shows a message and photos are uploaded as files.
Unfinished: Live Classroom worksheet scene; textbook export.
Exactly one next safe step: owner applies `storage.cors.json` to the Storage bucket (read-only GET), then converts
one image worksheet through "Üleviimine".

## Worksheet Studio slice 2 (assign structured worksheets, student player, teacher review) — MERGED (#185, 0aacb7c)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `8e8bd65`.
Implementation branch: `agent/worksheet-studio-assignments`, stacked on `agent/worksheet-studio-v1` (PR #184).
Pull request: draft, base `agent/worksheet-studio-v1` (not merged by the agent). Merge #184 first.

What it does: a worksheet built in the studio counts as a worksheet in Õppevara and is assigned with the existing
"Määra" flow; each `worksheetAssignments` document gets a snapshot `worksheetDoc` (v1 `worksheetData`/`files` kept).
The student opens it in the same A4 design (`DocWorksheetPlayer`), answers, records voice answers (uploaded to
`homework/{studentId}/ws_rec_*` before draft/submit), submits; the score is `{ correct, total, pct, perGoal }`.
After submission the student and the teacher see the sheet read-only with ok/bad marks, recordings and the result per
lesson goal; the teacher review dialog in Homework shows the same (`DocWorksheetSubmissionPreview`). Assignments
without `worksheetDoc` keep the v1 player unchanged.

Changed files: `crm-v2/src/features/worksheet-studio/{DocWorksheetPlayer.jsx,GoalEvidence.jsx,useFitScale.js}` (new,
+ test), `engine/registry.js` (`checkDocument`), `engine/Sheet.jsx` (`ctx.review`), `engine/ui.jsx`,
`engine/blocks/{tasks,productive}.jsx`, `engine/sheet.css`, `worksheetStudio.css`, `WorksheetStudioPage.jsx`
(uses `checkDocument` + `GoalEvidence`), `crm-v2/src/features/homework/{WorksheetPlayer,HomeworkPage}.jsx`,
`crm-v2/src/services/firebase/{homework,library}.js` (+ tests), `crm-v2/src/features/library/libraryModel.js`
(+ test), `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: optional `worksheetAssignments.worksheetDoc` (created by staff; existing create rule has no field list);
student updates only `status, answers, score, errorLog, completedAt, seenByTeacher, updatedAt, selfAssessment` (already
allowed). Storage: `homework/{studentId}/ws_rec_<assignment>_<block>_<ts>.(webm|m4a|ogg)` (existing rule: staff or
owning student/parent, audio allowed, < 20 MB). No rule, index, Function, migration or deploy.
A batch refuses assigning a structured worksheet when copies would exceed ~9 MB (message tells the max student count).

Validation (2026-09-29): `npx vitest run` 326/327 passed (1 pre-existing date-dependent failure in
`TeachersPage.test.jsx`, same as on main); `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: not yet clicked through in a browser against real Firebase (player layout at phone width, MediaRecorder on
iOS Safari produces `audio/mp4`, handled as `.m4a`); many-to-many and open answers are counted as "teacher sees".
Unfinished: Live Classroom worksheet scene; image→structure conversion queue; textbook export.
Exactly one next safe step: owner merges #184, then opens this PR's Vercel preview, assigns one studio worksheet to a
test student and completes it as that student.

## Worksheet Studio v1 (structured branded worksheets + builder) — MERGED (#184, 93815fa)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `8e8bd65`.
Implementation branch: `agent/worksheet-studio-v1`. Pull request: draft (see GitHub; not merged by the agent).
Owner of this area: Claude (didactic core). Codex continues the rest of CRM v2; please avoid
`crm-v2/src/features/worksheet-studio/**` and `crm-v2/src/services/firebase/worksheetDocs*.js` without coordination.

Goal (owner, 2026-09-28): replace uneditable generated worksheet images with structured worksheets in the approved
KeeleSepp style, assembled by teachers from blocks, reusable for homework, Live Classroom and a printed textbook.
Result: `/library/worksheets/:lessonId` builder with 21 block types, fixed brand palette, photo slots with focal point,
automatic A4 pagination, student view with per-goal checking, print/PDF; v1 structured worksheets open converted.
Details and data contract: `docs/WORKSHEET_STUDIO_V1.md`.

Changed files: new `crm-v2/src/features/worksheet-studio/**`, new `crm-v2/src/services/firebase/worksheetDocs.js`
(+ test), `crm-v2/src/services/firebase/index.js` (export), `crm-v2/src/app/routes.jsx` (route),
`crm-v2/src/app/accessPolicy.js` (route access: staff), `crm-v2/src/features/library/LibraryPage.jsx`
(two entry buttons), `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: optional `curriculumLessons.worksheetDoc` (+ `worksheetDocSchema`, `worksheetDocUpdatedAt`);
`activityLog` types `worksheet_doc.created|updated`; Storage objects `curriculum/ws_*`. v1 `worksheetData` untouched.
No Firestore/Storage rule, index, Function, migration or deploy.

Validation: see the PR description for exact numbers (vitest full suite, ESLint, vite build).
Known pre-existing failure on 2026-09-29: `src/features/teachers/TeachersPage.test.jsx › summarises active
teachers…` fails on unchanged main as well (date-dependent); not related to this slice.
Known limits: photos in the built-in sample are omitted; print quality depends on uploaded photo resolution;
Google Fonts (Nunito, Nunito Sans, Caveat; OFL) are loaded by the worksheet stylesheet.
Unfinished: homework assignment + student player/review for `worksheetDoc`; Live Classroom scene; image→structure
conversion queue; textbook export.
Exactly one next safe step: owner opens the Vercel preview, builds one worksheet in `/library/worksheets/new`, and
reviews/merges this draft PR; then the homework/student-player slice starts.

## CRM v2 student identity and lifecycle — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `77645f7` (merged PR #182).
Implementation branch: `feature/edit-student-enrollments-20260928`.
Pull request: #181.

PR #181 now keeps one displayed child across multiple learning directions and adds complete lifecycle handling. Archive
and restore update every physical `students` document represented by the person card in one Firestore batch, while
preserving IDs, enrollments and history. Parent/student-owned lists no longer return archived or parent-converted
student records. The already existing parent directory remains the admin workflow for manually linking or reassigning
an existing student to a parent.

Administrators can request the existing server-owned data-quality duplicate scan from the student directory. A merge
requires choosing the surviving primary ID, reviewing the server preview and confirming separately. The existing
Financial Core merge moves supported dependent references, preserves aliases/profile snapshots and archives secondary
records with an audit trail; no browser-side partial merge or production data migration is added.

Changed files: `crm-v2/src/features/students/StudentsPage.jsx`, its focused test,
`crm-v2/src/services/firebase/students.js`, `crm-v2/src/services/firebase/financeApi.js`, `ARCHITECTURE.md` and this
state file. Data contracts reused: `students`, parent links, the existing `/data-quality/preview`,
`/students/merge/preview` and `/students/merge` endpoints, and existing merge audit records.

Validation so far: PASS — focused student/parent suites 43/43, student pagination plus serial finance suites 23/23,
server duplicate-merge core 7/7, ESLint, production build and `git diff --check`. The full parallel CRM suite reached
296/298; its only two failures were unrelated five-second finance test timeouts, and that complete finance file passed
19/19 when rerun outside the saturated full-suite process. No production
deployment, Firebase rules/index change or production record mutation was performed. The merge remains admin-only and
requires an explicit preview plus confirmation. Exactly one next safe step: push the updated #181 branch and wait for
GitHub CI before owner review and merge.

## CRM v2 final readiness — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `fcded22`.
Implementation branch: `codex/v2-final-readiness`.
Implementation PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/182.

The final UX/readiness pass brings Homework and Settings into the shared v2 workspace language. Homework now has a
role-aware operational overview for total, open, overdue and unreviewed work; Settings has a concise account, role,
Firebase and support-access summary. Remaining cards use the same elevation and responsive treatment, long homework
and submission lists use browser rendering containment, and interactive rows retain visible keyboard focus.

Every CRM v2 navigation route now resolves to an implemented feature; `PlaceholderPage` is not used by the router.
`docs/CRM_V2_READINESS.md` records the code, verification and controlled-transition gates. Existing business logic,
roles, Firebase contracts, finance APIs, v1 and production data are unchanged. No deploy or migration is included.

Validation: PASS — Homework and Settings 7/7, ESLint, production build and `git diff --check`. The full parallel suite
reached 288/295; all seven five-second timeouts then passed in a serial rerun covering the five affected files, 35/35.
GitHub `verify`, security regression and both Vercel preview checks pass. Exactly one next safe step: owner review and
merge of PR #182.

## CRM v2 finance experience — MERGED

Last verified against main: 2026-09-28, Europe/Tallinn.
Implementation PR: #175 — merged.

Finance and expenses now use the CRM v2 workspace visual language while preserving the existing trusted finance APIs, roles, Firebase contracts and business rules. The finance page has clearer workflow navigation, an overdue attention state and improved responsive hierarchy; the expenses register now matches the same v2 presentation. v1 is unchanged.

This documentation update also intentionally creates a fresh `main` commit after reconnecting the Vercel Git integration so the current CRM v2 production project can deploy the latest main head.

## CRM v2 people experience — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `3a69994`.
Implementation branch: `codex/v2-people-experience`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/174.

The groups, teachers and parents directories, teacher profile, student dashboard and parent dashboard now share one
responsive operational overview component. Each surface presents its role-appropriate counts and workload context
before the detailed cards, while directories have a consistent toolbar and elevated card treatment. Large parent and
group card collections use browser rendering containment, and keyboard focus remains visible on teacher cards.

Existing group membership and schedule mutations, teacher workload records, parent/student linking, duplicate review,
finance visibility, role scope, Firebase services and route contracts are unchanged. v1 is unchanged. No production
data, rules or deployment are included.

Validation: PASS — focused people and dashboard suites 15/15, ESLint, production build, React structure/accessibility
review and `git diff --check`. Exactly one next safe step: wait for GitHub CI, then owner review of PR #174.

## CRM v2 calendar experience — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `d0f15d5`.
Implementation branch: `codex/v2-calendar-experience`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/173.

The calendar now opens with a responsive operational overview for the selected period: total lessons, today's lessons,
group lessons and completed lessons. The current period has a stronger visual hierarchy, today's column is clearly
identified, lesson cards have improved interaction and keyboard-focus states, and the overview collapses cleanly on
smaller screens. Existing day, week and month views, filters, conflict detection, lesson creation and editing, quick
completion, group attendance, teacher scoping and Firebase contracts remain unchanged. v1 is unchanged.

Validation: PASS — focused calendar suites 11/11, ESLint, production build, `git diff --check`, GitHub `verify`,
`security-regression` and Vercel preview checks. No production deployment is included. Exactly one next safe step:
owner review of PR #173.

## CRM v2 student experience — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `0ddb977`.
Implementation branch: `codex/v2-student-experience`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/172.

The first feature-level refinement after the shared visual foundation improves the existing student directory and
student 360 profile without changing their data contracts. The directory adds a compact loaded-result summary,
recognisable initial avatars and clearer desktop/mobile identity hierarchy. The profile adds a dedicated identity hero,
status, learning context and role-scoped counts for lessons, schedule entries and invoices. Existing filters, URL state,
pagination, editing, archive confirmation, teacher scope, finance scope and profile tabs remain intact. v1 is unchanged.

Validation: PASS — focused student suites 18/18, ESLint, production build and React structure/accessibility review.
GitHub CI remains the merge gate. Exactly one next safe step: owner review of PR #172.

## CRM v2 visual foundation — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `e9bbacf`.
Implementation branch: `codex/v2-visual-foundation`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/171.

CRM v2 is receiving a shared visual foundation while v1 remains fully operational. The shared layer changes design
tokens, application shell, navigation, typography, cards, controls, tables, dialogs, state views and responsive
behavior. The dashboard is now a deliberate daily command centre with a contextual welcome surface, role-scoped quick
actions, readable metrics, today's teaching agenda and an attention queue. The direction is a calm modern school
workspace with a deep navy frame, KeeleSepp green actions, warm restrained highlights and dense but readable working
surfaces. Existing routes, roles, Firebase data, business logic and v1 files are unchanged.

Validation: PASS for ESLint, production build, focused authentication and shell tests (2/2), the four files affected by
parallel host-load timeouts rerun serially (31/31), and desktop browser review of the redesigned login surface. The full
parallel suite reached 282/290; its eight failures were five-second timeouts without assertion failures. No production
deployment is included. Exactly one next safe step: owner review of PR #171 before expanding the system to feature-level
layout refinements.

## Didaktika raamatukogu v1 — LOCAL IMPLEMENTATION

Last verified against main: 2026-09-27, Europe/Tallinn.
Verified main: `820c952`.
Implementation branch: `codex/didactics-library-v1`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/169.

Õppevara now has a separate `Didaktika` workspace for books, teacher guides, methodology, worksheets, games, cards,
assessment resources and other reusable staff reference material. Teachers can search title, author, description,
tags, subject, level and original file name; combine category, subject and language filters; open or download files;
and edit metadata without mixing reference books into curriculum lesson counts. Large result sets render 60 cards at
a time.

Batch upload accepts up to 50 PDF, EPUB, Word, PowerPoint, text or image files in one selection, with shared category,
subject, level, language and tag metadata. Each file may be up to 100 MB. Titles are derived from filenames and remain
editable. Exact same-name and same-size files already in the collection are rejected. Upload progress is visible; if
Firestore metadata creation fails after a blob upload, that blob is removed instead of becoming an orphan.

Data contract: metadata uses the new staff-only `didacticLibrary` collection; files use the staff-only
`didactics/<staffUid>/...` Storage prefix. Changed files: `didactics-library-core.js`, its tests,
`haldus-exercises/index.html`, `firestore.rules`, `storage.rules`, `ARCHITECTURE.md`, the existing Õppevara tab contract
test and this state file. No production data, rules or deployment are changed by this branch.

Validation: PASS — focused Õppevara and Didaktika suites, 28/28 tests; `git diff --check`; local Chrome verification
of the three sample book cards, combined search, four filters, batch-upload modal, metadata fields and responsive
layout; no browser console errors. Production use is blocked until the owner explicitly approves deployment of both
Firestore and Storage rules after merge.

Exactly one next safe step: finish focused tests and browser QA, then open a draft PR for authenticated owner review.

## Õppevara usability and readiness guardrails — PRODUCTION VERIFIED

Last verified against main: 2026-09-27, Europe/Tallinn.
Verified main: `820c952`.
Implementation PR: #168 — merged.

The existing Õppevara interface now distinguishes available curricula from empty planned subjects and levels. Empty
cards are disabled and labelled `Pole veel valmis`, so teachers cannot mistake English, mathematics or an empty
language level for a usable course. Curriculum navigation writes recoverable same-page history and restores its
subject, level and topic from the URL on browser Back. Standalone loading waits for the first curriculum snapshot
instead of briefly presenting zero records as real content.

A small pure readiness checker reviews curriculum materials and exercises before presentation. It flags missing
titles or learning content, the observed test-copy patterns, missing worksheet questions and exercise-type-specific
required data. Cards show `Valmis kasutamiseks`, `Kontrollitud`, `Mustand` or `Vajab kontrolli`, including the exact
reason. Exercise filters can isolate those states, and the topic badge is explicitly prefixed with `Teema:` so it is
not confused with the exercise type. Destructive lesson and exercise actions are moved behind `Rohkem toiminguid`;
the existing confirmation remains and exercise confirmation now names the record and states that deletion cannot be
undone.

Changed files: `oppevara-usability-core.js`, its unit test, `oppevara-usability-ui.test.js`,
`haldus-exercises/index.html` and this state file. No Firestore documents, rules, indexes, Functions, finance data or
production deployment are changed.

Validation: PASS — focused readiness, UI, visual-navigation and deduplication suites, 20/20 tests; `git diff --check`;
local Chrome verification of subject and level navigation, readiness labels, overflow actions and browser Back.
The separate pre-existing `curriculum-ui.test.js` still fails on clean `origin/main` because `haldus.html` does not
contain its expected `Õppekava teema` string; this branch does not modify that surface.

Known limitation: readiness is a presentation guardrail, not an automatic correction of production content. Existing
misnamed topics and incomplete records stay intact and are surfaced for human review; no production record was
silently renamed or deleted.

Production verification: the authenticated embedded Õppevara shows the readiness labels, overflow actions and
recoverable curriculum navigation against the real 327 library records and 21 exercises without browser console
errors. No production record was changed during verification.

Exactly one next safe step: use the readiness filter to review the records flagged by the presentation guardrail;
rename or delete content only through a separate owner-approved content-cleanup task.

## Communication Hub v1 Meta adapter — PRODUCTION GATE PARTIAL

Last verified against main: 2026-09-27, Europe/Tallinn
Verified main: `40547500dd21b7a8cb46b2e2bbb6665b1da542c9`.
Implementation PR: #162 — merged.

CRM v2's existing `Sõnumid` workflow is converted into a channel-neutral `Kommunikatsioon` surface without
replacing the working `messages` collection. Conversation identity uses stable IDs only: explicit
`conversationId`, then channel-qualified external thread identity, while legacy internal conversations keep the
exact `studentId`. Array position and current sort order are presentation-only.

New internal sends remain legacy-compatible and add `channel: internal` plus `conversationId: studentId`.
The server-only `metaMessagingApi` verifies webhook challenges and HMAC-SHA256 signatures and stores inbound Meta
messages with deterministic IDs so retries cannot duplicate them. Administrators may reply to external conversations;
teachers and parents cannot send through the external adapter.

Outbound Meta replies now fail closed. Before any provider call, the Function verifies that channel,
`conversationId` and recipient match an existing inbound message created by the signed Meta webhook. Facebook uses
`https://graph.facebook.com/v26.0/<page-id>/messages` with `META_PAGE_ACCESS_TOKEN`. Instagram uses
`https://graph.facebook.com/v26.0/<instagram-account-id>/messages` with
`META_INSTAGRAM_ACCESS_TOKEN`. Sender assets are pinned to Facebook Page `571647362697524` and Instagram account
`17841474277841669`, with non-secret environment overrides available.

Changed files: `functions/meta-messaging-core.js` and its test, `functions/index.js`,
`crm-v2/src/features/messages/MessagesPage.jsx` and its focused test,
`crm-v2/src/services/firebase/messages.js`, `crm-v2/src/features/messages/messagesModel.js` and its test,
`crm-v2/src/app/navigation.js`, `ARCHITECTURE.md`, `docs/COMMUNICATION_HUB_V1.md` and this state file.
No Firestore migration, rules/index change, or production data rewrite is included.

Production activation as of 2026-09-27: Meta app `KeeleSepp CRM` (`2016847882342152`) remains restricted to
Facebook Page `571647362697524` and Instagram account `17841474277841669`. Firebase Function secrets
`META_VERIFY_TOKEN`, `META_APP_SECRET`, `META_PAGE_ACCESS_TOKEN` and `META_INSTAGRAM_ACCESS_TOKEN` are configured.
Only `metaMessagingApi` was deployed in project `keelesepp-5136b`; no Firestore rules, indexes, migrations or other
Functions were deployed. The active endpoint is
`https://us-central1-keelesepp-5136b.cloudfunctions.net/metaMessagingApi`, and the GET `/webhook` challenge returns
the exact challenge with HTTP 200. Facebook and Instagram are subscribed to the `messages` webhook field.

Validation: PASS on code/docs head `cc074b1d0e4188d1417143ff58cca83c0b525062` — GitHub CRM v2 workflow
#36173652514 PASS; Financial Core emulator #36173652527 PASS; CRM v2 CI #36173652562 PASS including tests, lint and
production build; Vercel preview READY. Additional focused Meta core run: 6/6 PASS. Branch is not behind main and the
PR changes only the 12 communication/documentation files listed by the compare check.

Production smoke: Facebook inbound PASS and Facebook outbound PASS through the deployed `/reply` route. Instagram
tester `pa6an4ik` was explicitly authorized, and two real Instagram inbound messages reached the signed webhook and
were stored in `messages`, so Instagram inbound is PASS. PR #166 is merged in main and the corrected Function was
selectively deployed with only `metaMessagingApi`; the post-deploy GET `/webhook` challenge returned HTTP 200 with
the exact challenge. A newly generated permanent Page token was saved as enabled
`META_INSTAGRAM_ACCESS_TOKEN` version 4. Meta token diagnostics report it as valid, non-expiring, scoped to app
`2016847882342152`, Page `571647362697524` and Instagram account `17841474277841669`, including
`instagram_basic` and `instagram_manage_messages`.

Instagram outbound through `/reply` remains NOT PASSED. The confirmed CRM smoke message on 2026-09-27 returned
HTTP 502 because Meta rejected the provider request. A read-only conversation diagnostic with the same valid token
returned Meta OAuth error `(#3) Application does not have the capability to make this API call`. This isolates the
remaining blocker to Meta application capability/access, not the send endpoint, Firebase secret, webhook, or deploy.

Known production blocker: Meta keeps the app in development access until App Review is completed. In this state,
Facebook/Instagram messaging is limited to app administrators, developers or testers whose eligible accounts are
connected as Meta requires. Do not describe the Instagram channel as outbound-ready or public-production ready until
Meta grants the messaging capability and both public-account inbound/outbound smokes pass.

Exactly one next safe step: obtain owner approval to begin Meta App Review for Instagram messaging permissions;
after approval, repeat one Instagram inbound/outbound smoke from a non-role account.

## One-click lesson completion

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `d5c20ce`.
Implementation branch: `codex/one-click-lesson-completion`.

The single-student lesson modal now has one primary `Lõpeta tund ühe klõpsuga` action. The teacher confirms the
prefilled attendance, lesson topic and result, optional homework due date, automatically suggested next curriculum
step and optional internal follow-up. One authenticated lesson-journal request then commits the completed lesson,
schedule attendance, stable homework, student curriculum pointer and linked task in the same Firestore transaction.
Existing stable lesson IDs and request IDs make retries idempotent and prevent duplicate homework or follow-up tasks.

The same modal now includes a school-curriculum picker backed by the existing `curriculumLessons` collection, with
subject and CEFR-level filters and lessons grouped by curriculum topic. This keeps the full managed C1 roadmap from
`Õppevara → Õppekavad` authoritative, while retaining the built-in curriculum as a fallback. Selecting a lesson
prefills the diary topic, vocabulary, goal and next assignment and makes one-click completion advance from that exact
position. The picker remains available when the student's subject or level is missing instead of silently disappearing.

Changed files: `haldus.html`, `haldus.css`, `functions/index.js`, `functions/lesson-record-core.js`,
`functions/lesson-record-core.test.js`, `lesson-one-click-completion.test.js`, `ARCHITECTURE.md` and this state file.
The existing `lessons`, `schedule`, `students`, `homework`, `tasks` and `lessonJournalRequests` stores are reused;
no migration, new collection, rules change or production write is included.

Validation: PASS — Functions unit suite 167/167; focused lesson/UI contracts 16/16; Node syntax check and
`git diff --check`. GitHub CI run 35883603985 passed the full Financial Core emulator suite, including the new
one-click transaction and its retry/idempotency checks. The automatic Vercel preview is ready. Local emulator
startup remains unavailable on this host because Java is not installed; authenticated visual owner review is still
required before production deployment.

Known limitation: v1 applies to individual scheduled lessons. Group lessons keep their existing per-student
attendance workflow because one group click must preserve distinct attendance and package outcomes for each student.

Exactly one next safe step: verify one real-looking scheduled lesson in the authenticated hosted preview before
owner review/merge.

## Unified notification centre v1

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `6f491da`.
Implementation branch: `codex/notification-center-v1`.

A global bell now opens one notification drawer across the CRM. It combines unread messages, unseen completed
worksheets, overdue scoped tasks and invoices, and administrator-only parent-link, calendar and work-time alerts.
Filters show each source category, severity controls ordering and colour, and every item routes to its source student
or workflow. Notifications resolve with their source data rather than being copied to a second collection.

Changed files: `haldus.html`, `haldus.css`, `notification-center-ui.test.js`, `ARCHITECTURE.md` and this state file.
No Firestore rules, Functions, indexes, notification collection, email/push delivery or production data are changed.

Validation: focused notification, Student 360 and task workspace contract tests pass; `git diff --check` passes.
Authenticated visual owner review is required on the hosted preview.

Known limitation: v1 is an in-app centre and does not persist arbitrary dismissals or send email/push notifications.
A signal disappears when its source is handled, for example when a message is read or an invoice is paid.

Exactly one next safe step: review the bell, category filters and source navigation with real scoped data on the
hosted preview, then merge the draft PR if the routing is correct for administrator and teacher roles.

## Student 360 working hub v1

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `2b6f881`.
Implementation branch: `codex/student-360-v1`.

The existing student profile now starts with a compact operational hub. It surfaces unpaid balance, pending
homework, unread messages, low package balance and missing curriculum planning, and provides direct navigation to
the existing learning path, worksheets, messages, homework, lesson journal and finance sections. The profile keeps
the detailed existing tools intact and derives the summary from their current records; it adds no parallel store,
migration or browser write path.

Changed files: `haldus.html`, `haldus.css`, `student-360-ui.test.js`, `ARCHITECTURE.md` and this state file.
No Firestore rules, Functions, indexes, financial records or production data are changed.

Validation: focused Student 360 contract tests and existing task workspace tests pass; `git diff --check` passes.
Authenticated visual owner review is required on the hosted preview.

Known limitation: v1 improves overview and navigation but keeps the existing long detail sections. Upcoming phases
can introduce attendance workflows, linked internal tasks and a unified notification centre without changing this
projection contract.

Exactly one next safe step: review the Student 360 hub with a real student on the hosted preview, then merge the
draft PR if the attention signals and navigation match daily staff work.

## Ülesanded team workspace — Asana-like v1

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `bc9ada0`.
Implementation branch: `codex/asana-tasks-v1`.

The existing staff `Ülesanded` view now provides list and kanban projections, with `Uus`, `Töös` and `Valmis`
columns, search and the existing status/category filters. A task opens in a focused side drawer where staff can
rename it, move its status, reassign it, change its deadline, priority and category, and continue the existing
discussion. Task creation is collapsed into a compact quick-add panel. Existing `open` and `done` records remain
valid; `in_progress` is additive and all edits use merge writes to the existing `tasks` collection.

Changed files: `haldus.html`, `haldus.css`, `task-workspace-ui.test.js`, `ARCHITECTURE.md` and this state file.
No Firestore rules, Functions, indexes, schema migration, production data or deployment is included.

Validation: focused task workspace contract tests and staff assistant task tests pass; `git diff --check` passes.
The local application booted to the sign-in screen without a runtime boot error. Authenticated visual owner review
will use the hosted preview because browser authentication is origin-specific.

Known limitation: v1 changes stages through the detail drawer rather than drag-and-drop. Subtasks, dependencies
and notifications are not part of this bounded slice.

Exactly one next safe step: review the hosted preview as an authenticated administrator, then merge the draft PR
if the board, list and detail drawer match the daily workflow.

## Õppevara duplicate prevention, worksheet opening and naming

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `5d66ec40647a69d5ec639e4c4b8a953f992b127d`.
Implementation branch: `codex/oppevara-dedup-rename`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/156.

The production `curriculumLessons` collection was audited read-only before implementation: 306 records, with no
duplicate stable source keys and no exact duplicate subject/level/topic/title groups. No production documents were
deleted or modified. The reproducible risk was in worksheet saving: a known curriculum `lessonId` could temporarily
fall through to the new-record mode while the topic picker was still loading. The save target is now locked to that
immutable lesson ID and a missing original fails closed instead of creating a replacement document.

`LearningLibraryCore` now collapses repeated stable-source or exact semantic records before both Õppekavad and
Raamatukogu render them, keeping the richer/newer worksheet. Worksheet cards have explicit `Ava tööleht` / `Ava
kirje` actions, clickable titles and Escape-to-close preview. Teachers also get a visible `Nimeta` action. Manual
renaming updates the curriculum record and current worksheet title without rewriting immutable published-version
history.

The worksheet save dialog now shows a document-name field and enables automatic naming from the selected existing
lesson or destination topic. Opening a worksheet from a curriculum lesson visibly confirms that it will save back to
the same entry and will not create a duplicate.

Changed files: `learning-library-core.js`, `learning-library-core.test.js`, `worksheet-workflow-core.js`,
`worksheet-workflow-core.test.js`, `haldus-exercises/index.html`, `haldus-worksheet/index.html`,
`oppevara-dedup-rename.test.js`, `ARCHITECTURE.md` and this state file. No Firestore rules, Functions, indexes,
financial data or production records are changed.

Validation: PASS — focused Õppevara, C1 and worksheet suites, 56/56 tests; `git diff --check`; local desktop browser
verification of title-to-preview opening, Escape close, explicit rename/open controls, curriculum-to-builder handoff,
locked existing-record save message and automatic document-name control.

Deployment status: Vercel preview is ready and PR #156 checks are green. No production deployment or write was run.

Known limitation: production UI verification waits for PR review/merge and deployment. Existing near-duplicates with
different titles or topics are intentionally not guessed or deleted.

Exactly one next safe step: owner review/merge PR #156, then repeat the same save action twice in production and
confirm that the original lesson receives new versions while the curriculum record count stays unchanged.

## C1 curriculum 240 academic hours — implementation

Last verified: 2026-09-21, Europe/Tallinn
Verified main: `3046881f61bbe18fae1b0dbeaa3d540595b5bf8c`.
Implementation branch: `codex/c1-curriculum-100-lessons`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/155.

The attached `KeeleSepp_C1_oppekava_240ak_tundi.docx` is now represented as a source-derived C1 roadmap for
the existing `Õppevara → Õppekavad` flow. It contains 10 ordered modules and 100 ordered two-hour lessons:
70 thematic lessons, 20 separate grammar lessons and 10 progress checks. Every lesson keeps the exact focus
and its own full worksheet prompt from the DOCX. The C1 installer reuses `curriculumLessons`; stable IDs and
merge writes make it idempotent. It does not create a second curriculum store.

The current `CurriculumView`, `TopicView` and `WorksheetPreviewModal` show the C1 type, objective, focus and
full prompt. `Kasuta prompti` fills the existing `ws_prefill` contract and opens the existing worksheet AI
workspace. B1/B2 data and flows are unchanged. The C1 level card reports 240 academic hours, 100 lessons and
10 modules.

Changed files: C1 manifest plus 10 module shards, DOCX extraction script, C1 authenticated installer,
`haldus-exercises/index.html`, `c1-curriculum.test.js`, `ARCHITECTURE.md`, this state file and
`docs/C1_CURRICULUM_240.md`. No Functions, rules, indexes, schema migrations, student records, finance, CRM or
schedule data are changed by the code patch.

Validation: PASS — focused C1 and existing Õppevara/worksheet suites, 37/37 tests; `git diff --check`;
desktop browser verification of all 10 modules and the thematic, grammar and progress-check lesson flows;
existing worksheet-builder handoff with the complete prompt; mobile verification at 390 × 844 with no horizontal
overflow. The complete root Node suite has the same six pre-existing failures on this branch and on clean
`origin/main` (branch 484/490, baseline 480/486); the four added C1 tests pass and introduce no regression.

Deployment status: Vercel hosted preview is ready and CI is green. The preview requires a separate KeeleSepp
sign-in on its own origin, so the complete visual flow was verified locally with the same commit. Production data
has not been installed.

Known gate: repository policy forbids the agent from merging its own PR. Production publication therefore
requires owner review/merge after the branch and preview are verified.

Exactly one next safe step: owner review/merge PR #155; after the production deployment, open the live C1 view
once as an authenticated teacher or administrator to run the idempotent installer and verify all 100 records.

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
