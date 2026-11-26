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
| Firestore rules (`firestore.rules`) | 2026-11-24 23:32 | #1304 + this PR (board gaps: `fills`; student may change only `fills` + meta). Via Rules API (CLI gave 409); **compiled size is at Firestore's 256 kB limit** — keep rule changes minimal | live ruleset compared with the repo file: equal |
| Storage rules (`storage.rules`) | 2026-11-19 ~14:5x | `05884e2` (#1285 fail kandele: `financial/accounting-entries/{entryId}/{documentId}`) | `firebase deploy --only storage` „Deploy complete” |
| Firestore indexes (`firestore.indexes.json`) | not recorded | — | `firebase firestore:indexes` (read-only) |
| Hosting — app (Vercel, crm.epkoolitus.ee) | 2026-11-15 11:59 release commit | `dbdf512` `[deploy] Release 2026-11-15 11:59 UTC` | release commit on main; Vercel status success |

## Cloud Functions

Full deploy of all functions 2026-11-09 15:39 from main **(inferred)** `a80a749`; single functions after that:

| Function | Last deployed | Commit |
| --- | --- | --- |
| financeApi | 2026-11-26 12:35 | `90b5160` (#1353 Minu kassa: õpetaja märgib saadud sularaha, `/cash/teacher-receipt`; `source: "teacher"` raamatupidamisest väljas) |
| financeApi | 2026-11-19 ~15:0x | `05884e2` (#1285 `/accounting/entries/documents` — fail kandele) |
| financeApi, invoiceApi, linkpayApi, manualInvoiceApi, sendInvoicePaymentReminders, syncLessonTokens, staffOperationsApi | 2026-11-18 13:2x | `cd0e70a` (#1264 Õppesuunad individuaalne / grupp — group price, group packages, card merge) |
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

- 2026-11-18 13:31 · hosting (release.yml) · `9d7c925` · Claude (owner OK) · #1264 group / individual directions UI, #1265 k04 + table-cell fix, B1→B2 modules 3–4; after the rules + functions below; Vercel success
- 2026-11-18 13:2x · functions financeApi, invoiceApi, linkpayApi, manualInvoiceApi, sendInvoicePaymentReminders, syncLessonTokens, staffOperationsApi · `cd0e70a` · Claude (owner OK, owner re-logged firebase) · #1264; „Deploy complete”. First attempt earlier the same day failed on expired CLI credentials (nothing deployed); release.yml was disabled meanwhile and re-enabled after
- 2026-11-18 08:13 · Firestore rules · `cd0e70a` · Claude (owner OK) · #1264 `studentRevenuePlans.groupPrices`; two transient 409/503 errors before success; live = repo verified
- 2026-11-18 07:59 · hosting (release.yml) · `b54b56b` · Claude (owner OK) · B1→B2 modules 3–4 audio; the earlier release commit `b0fda14` (2026-11-17 09:54) got no Vercel build — check Vercel deployments after every release

- 2026-11-13 19:38 · hosting (release.yml) · `f412447` · Claude (owner OK) · Õpik free layer: lines and arrows (#1221); no rules / functions change; Vercel success
- 2026-11-14 08:30 · hosting (release.yml) · `9b8eb19` · Claude (owner OK) · Õpik free layer: text box typed on the sheet (#1223); no rules / functions change; Vercel success
- 2026-11-14 09:36 · hosting (release.yml) · `0242717` · Claude (owner OK) · Õpik free layer: text font / alignment / colour (#1225), snapping guides (#1226), Lehel buttons + see-through + shadow (#1227); no rules / functions change; Vercel success
- 2026-11-14 10:35 · hosting (release.yml) · `0222a65` · Claude (owner OK) · Õpik free layer: select several items (#1229); no rules / functions change; Vercel success
- 2026-11-14 11:13 · hosting (release.yml) · `ca10964` · Claude (owner OK) · Õpik free layer: selection frame (#1231); no rules / functions change; Vercel success
- 2026-11-14 11:34 · hosting (release.yml) · `1acbc08` · Claude (owner OK) · Õpik free layer: copy to another page, clipboard (#1232); no rules / functions change; Vercel success
- 2026-11-14 11:54 · hosting (release.yml) · `f5f3ac7` · Claude (owner OK) · Õpik free layer: speech bubble, star, sticker, ribbon (#1233); no rules / functions change; Vercel success
- 2026-11-14 12:54 · hosting (release.yml) · `3ee73c5` · Claude (owner OK) · Õpik free layer: crop a picture (#1235); no rules / functions change; Vercel success
- 2026-11-14 14:50 · hosting (release.yml) · `1738c4d` · Claude (owner OK) · Õpik free layer: behind the text, ready layouts (#1237); no rules / functions change; Vercel success
- 2026-11-14 23:35 · hosting (release.yml) · `a353bff` · Claude (owner OK) · Vestlusklubi 10–12 a, 12 meetings (#1240); no rules / functions change; Vercel success
- 2026-11-15 00:18 · hosting (release.yml) · `7ab4a91` · Claude (owner OK) · Vestlusklubi 10–12 a: 5 modules × 4 meetings, three review rounds (#1241); no rules / functions change; Vercel success. Data: curriculumLessons k11-001…012 updated, k11-013…020 created (no assignments existed)
- 2026-11-15 11:59 · hosting (release.yml) · `dbdf512` · Claude (owner asked to apply the teacher's feedback) · Vestlusklubi: harder words, sentence frames, pair tasks (#1243); no rules / functions change; Vercel success. Data: curriculumLessons k11-001…020 sheets updated in place (checked first: last version was ours, no teacher edits)
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
