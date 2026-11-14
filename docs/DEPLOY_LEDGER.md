# Deploy ledger — what is live

One table of what runs in production and from which commit. GitHub `main` is not the same as production: the app
(Vercel) goes out only with a `[deploy]` / `[hotfix]` commit (`.github/workflows/release.yml`), Firestore / Storage rules
and Cloud Functions only when the owner runs `firebase deploy`. A merged PR that says „⚠ needs deploy” is **not** live
until it shows up here.

**Rule (AGENTS.md):** whoever deploys rules or functions updates this file in the same day — one row per target, the
commit it was deployed from (`git rev-parse --short HEAD` of the checkout used, normally fresh `origin/main`) and the
UTC time. Check the live state read-only with:

```sh
gcloud auth application-default login     # once, an account with read access to keelesepp-5136b
(cd functions && npm ci)                  # optional: lets the script use google-auth-library
node tools/deploy-status/deploy-status.mjs
```

It prints the live Firestore / Storage ruleset sha256 vs the repo file (same / DIFFERENT), every Cloud Function's
`updateTime`, and functions missing on either side. GET requests only; nothing is deployed or written.

Project `keelesepp-5136b`. Times UTC. „Commit” = the commit the deploy was made from. **(inferred)** = only the time
was recorded; the commit is the head of `main` at that moment, not verified against the deployed code.

## Rules and hosting

| Target | Live since | Commit | How verified |
| --- | --- | --- | --- |
| Firestore rules (`firestore.rules`) | 2026-11-11 15:32 | `8a9cb61` (= main 2026-11-11) | live ruleset compared with main `8a9cb61`: equal |
| Storage rules (`storage.rules`) | not recorded | — | run `deploy-status.mjs` and fill in |
| Firestore indexes (`firestore.indexes.json`) | not recorded | — | `firebase firestore:indexes` (read-only) |
| Hosting — app (Vercel, crm.epkoolitus.ee) | 2026-11-14 08:30 release commit | `9b8eb19` `[deploy] Release 2026-11-14 08:30 UTC` | release commit on main; Vercel status success |

## Cloud Functions

Full deploy of all functions 2026-11-09 15:39 from main **(inferred)** `a80a749`; single functions after that:

| Function | Last deployed | Commit |
| --- | --- | --- |
| financeApi | 2026-11-12 10:27 | `f372e75` (#1212 unmark package lesson, #1213 credited invoices) |
| invoiceApi, linkpayApi, manualInvoiceApi, sendInvoicePaymentReminders | 2026-11-12 10:27 | `f372e75` (#1213 credited invoices don't block the month / take payments) |
| syncLessonTokens | 2026-11-10 19:16 | `8a37c40` (#1202: cash-paid lesson takes no token) |
| languageApi | 2026-11-10 16:30 | `b0b88d9` (inferred; #1196 forms-lookup-parallel) |
| autoMarkLiveLesson | 2026-11-09 22:39 | `4e83ed1` (inferred; #1185 fast-marking) |
| staffOperationsApi | 2026-11-09 22:12 | `68bb49b` (inferred; #1183 weekly-unmarked-teachers) |
| weeklyUnmarkedLessonsDigest | 2026-11-09 22:12 | `68bb49b` (inferred; #1183) |
| websiteLeadApi | 2026-11-09 20:42 | `000d45d` (inferred) |
| gcalApi, interactiveLessonApi, learnerEmailsTick, learningProfileEvidenceApi, learningSessionApi, lessonDraftsApi, liveTurnApi, metaMessagingApi, notifyHomeworkCreated, notifyPendingAccount, purgeCardTrash, queueLearnerExerciseReviewEmail, queueLearnerScheduleEmail, queueLearnerWorksheetReviewEmail, refreshSchoolAssistant, sheetBuilderApi, syncAllCalendars, syncGroupToGoogleCalendar, syncRoomBooking, syncScheduleToGoogle, systemHealthDigest, systemHealthTick, taxFormApi, teacherScopeMigrationApi | 2026-11-09 15:39 (full deploy) | `a80a749` (inferred) |

A function changed on main after its row above is **not live** — compare with
`git log --oneline <commit>..origin/main -- functions/` before telling anyone a server fix is out.

## Log

Newest first. One line per deploy: date UTC · target(s) · commit · who · note.

- 2026-11-13 19:38 · hosting (release.yml) · `f412447` · Claude (owner OK) · Õpik free layer: lines and arrows (#1221); no rules / functions change; Vercel success
- 2026-11-14 08:30 · hosting (release.yml) · `9b8eb19` · Claude (owner OK) · Õpik free layer: text box typed on the sheet (#1223); no rules / functions change; Vercel success
- 2026-11-13 18:41 · hosting (release.yml) · `4770aae` · Claude (owner OK) · editor: up to 3 pictures in a text / reading text (#1218), Õpik „Vaba kiht” (#1219); no rules / functions change; Vercel success
- 2026-11-13 13:50 · hosting (release.yml) · `df8797f` · Claude (owner OK) · A2 lesson a2-l05 with its listening audio (#1216); Vercel success, audio URL 200
- 2026-11-12 10:27 · functions:financeApi,invoiceApi,linkpayApi,manualInvoiceApi,sendInvoicePaymentReminders · `f372e75` · Claude (owner OK) · Fable fixes T2 (#1212) and D4/D6 (#1213); „Deploy complete”; rules unchanged; hosting released after with #1210, #1211, #1214
- 2026-11-11 15:32 · firestore:rules · `8a9cb61` · Claude (owner OK) · Õpik: teachers save, only admin publishes (#1207); verified equal to main; hosting released 19:04 after GitHub runner outage (sheet-layout job) — layout suite run locally 31/31
- 2026-11-11 12:35 · firestore:rules + functions:financeApi · `21b204b` · Claude (owner OK) · teacher cash box „Minu kassa” + hand-over (#1204); rules verified equal to main; hosting released after (12:43)
- 2026-11-10 19:18 · firestore:rules · `8a37c40` · Claude (owner OK) · privacy fixes #1200 + cash in Toimus #1202; verified equal to main
- 2026-11-10 19:16 · functions:financeApi, functions:syncLessonTokens · `8a37c40` · Claude (owner OK) · cash in Toimus, server respects cashPaid (#1202). Note: the hosting release 19:13 went out ~5 min before these (rules API 503) — the release must wait for rules/functions deploys.
- 2026-11-10 17:03 · functions:financeApi · `9f171eb` (inferred) · owner · cash for lessons (#1198)
- 2026-11-10 17:01 · firestore:rules · `6719bcf` · owner · `lessons.cashPaid` (#1198); verified equal to main
- 2026-11-10 16:30 · functions:languageApi · `b0b88d9` (inferred) · owner · EKI forms in parallel (#1196)
- 2026-11-09 22:39 · functions:autoMarkLiveLesson · `4e83ed1` (inferred) · owner
- 2026-11-09 22:12 · functions:staffOperationsApi,weeklyUnmarkedLessonsDigest · `68bb49b` (inferred) · owner
- 2026-11-09 20:42 · functions:websiteLeadApi · `000d45d` (inferred) · owner
- 2026-11-09 15:39 · functions (all) · `a80a749` (inferred) · owner · full deploy
