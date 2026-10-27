## 2026-10-27 · agent/preschool-plan — the preschool (5–7) group course: plan and child lesson format (proposal)

- Owner 2026-10-26: plans for preschoolers, organising groups for group lessons, a plan for 5–7-year-old groups;
  „нашего генератора явно не хватит, нужен детский формат”.
- New docs/PRESCHOOL_GROUP_COURSE.md:
  - group size 4–6 and 45 min;
  - an 8-part lesson (greeting circle → review → new words → movement → song → table task → picture story →
    goodbye);
  - a 32-week plan in 8 themed blocks;
  - what the generator can and cannot do;
  - progress as observation ticks (Oskab / Harjutame / Veel mitte);
  - how to organise the groups (uses „Täida grupp”, #829);
  - the CRM parts to build next: „Lastetund” card type, „Pildileht”, observation ticks, take-home card.
- No code. Content (32 cards, picture sheets) goes to the content agent after the owner approves.
- Next safe step: the owner approves or edits the plan and chooses which CRM part comes first.

## 2026-10-27 · agent/group-fill — „Täida grupp”: who fits a group (seats, age group, level, time)

- Owner 2026-10-26: „заполнение групп”, „организация групп для групповых уроков” (also preschool 5–7). Stacked on
  agent/planner-history (#826, learned times).
- A group may carry `audience` ('' | adult | school | preschool), `capacity` (default 8, preschool 6), `ageFrom` /
  `ageTo` (children's groups): `groupsService.groupSettings` / `updateSettings` (admin, activity log). The rules for
  `groups` are already staff read/write: no rules change.
- Grupid: each card shows „n/8 kohta” and the age group, and an admin has the button „Täida”. GroupFillDialog lets the
  admin set the age group, seats and ages. It lists students and website enquiries that fit, best first, with reasons.
  The pure model is `groups/groupFill.js` (`groupCandidates`, `ageOf`, `audienceOf`, `capacityOf`, `freeSeats`):
  - same subject;
  - the age group from the birth year / „N. klass” / „Täiskasvanu” / „lasteaed”;
  - level the same or next to it (none for preschool);
  - the group's weekly times against „Sobivad ajad”, else the times of past lessons;
  - clashes with own lessons and other groups.
  „Lisa” is the normal add-to-group action; enquiries link to Päringud and are not contacted automatically.
- New group form: Sihtrühm + Kohti.
- Checks: groups tests 7 passed (new groupFill 4); eslint 0; whole vitest: all passed except the known night-time
  LearnerSnapshotCard (fixed in #827). Local check on the emulator copy (read-only export of production): a test group
  „A2 noored” → 76 candidates listed with reasons.
- Next safe step: owner approves #826 and this PR; creates the first group with its time, opens „Täida”.

## 2026-10-27 · agent/meta-inbox — Facebook / Instagram inbox: nothing lost, and a log that shows whether Meta calls at all

- Owner 2026-10-26: „доделать общение с клиентами”. Production read (2026-10-27, read only):
  - `messages` has 27 internal messages and **no Facebook / Instagram message ever**, although `metaMessagingApi` is
    deployed and its 4 secrets exist; 17 calls in 60 days, all 200.
  - E-mails to students and parents (#792) are deployed, but no type is switched on (`emailSettings` missing,
    `emailLog` 0).
  - Old `emailQueue` failures („535 Authentication failed”, 2026-07-11…10-07) stopped on 10-07.
- This PR (functions only):
  - a Meta message with only a photo / voice / file / sticker was dropped (no text); it is now stored as „[pilt]”,
    „[helisõnum]”, „[fail]” …;
  - every webhook call logs a content-free summary (`meta webhook`: object, entries, event kinds, stored count).
- Files: functions/meta-messaging-core.js (+ test), functions/index.js.
- Checks: functions `npm test` 408/408; index.js loads.
- Deploy needed (owner): `firebase deploy --only functions:metaMessagingApi`.
- Owner's side (Meta, not code): in the Meta app → Messenger / Instagram → Webhooks the page (and the IG account) must
  be subscribed to `messages`, with the callback `…/metaMessagingApi/webhook`, and the app must be Live. After a test
  message the log shows `meta webhook` with `message: 1`.
- Next safe step: owner approves + deploys, sends a test message to the Facebook page, checks Sõnumid.

## 2026-10-27 · agent/local-today — „today” is the local day, not the UTC one (site bug check)

- Found in the night bug check (owner 2026-10-26 „проверить сайт на наличие багов”): 43 places took „today” as
  `new Date().toISOString().slice(0, 10)`, the UTC day. In Estonia between 00:00 and 02:00 / 03:00 that is yesterday:
  - deadlines looked a day off;
  - a „Minu vead” practice after midnight counted for the day before;
  - the pet's streak day was off;
  - the default homework due date was yesterday.
  The test suite failed at night for the same reason.
- New `crm-v2/src/utils/localDate.js` (`localDate(value = now)`, the browser's own day). Used in:
  - homework: page, flow, service date;
  - vocabulary: daily plan, reminder;
  - pet streak;
  - Minu vead;
  - live classroom: homework and lesson-end due dates;
  - after-lesson homework;
  - students: lessons and works panels, directions, Ei saa tulla;
  - teacher profile; parents; groups (+ service default start date).
  Three tests compute today the same way now.
- Not touched on purpose (finance / accounting, own PR with the accountant if wanted): AccountingPage,
  accountingReports, PurchasesPage, ExpensesPage, FinanceMonthPage, FinancePage, lessonAccounting, FinancialPeriodPanel,
  ManualInvoiceDialog, AdvanceManagementPanel, studentFinance. Also kept: stored createdAt / updatedAt day stamps
  in students.js / groups.js and settings/cleanupModel.
- Checks: eslint src 0; whole vitest 380 files passed (00:30 local, the hour that failed before); the touched areas also
  under TZ=UTC (324 passed).
- Next safe step: owner approves; later the same fix for the finance pages together with the accountant.

## 2026-10-27 · agent/planner-history — Planeerija places students without „Sobivad ajad” at their usual times

- Owner 2026-10-26: „доделать планировщик уроков автоматический”. The planner (#791) placed almost nobody: 38 of 50
  directions had no „Sobivad ajad”.
- Now a student without own times gets the times of their past individual lessons (12 weeks, not cancelled or missed;
  calendar + journal): `studentTimesModel.learnedTimes` / `withLearnedTimes`. Never ★ → yellow „õpilane käis varem sel
  ajal”; another time is „unknown” (red, agree), not „cannot”. The selected-lesson box says „varasemad tunnid: …”.
- CalendarPage computes the learned times only while the planner is open (useMemo).
- Production dry run (read only, 2026-10-27, start 2026-11-02): placed directions 7 → 33 (45 lessons: 2 green, 24
  yellow, 19 red of which 16 overlap and 3 to agree); unplaced 43 → 17 (12 no history, 5 no teacher). 29 ms.
- Files: crm-v2/src/features/calendar/studentTimesModel.js, plannerModel.js, PlannerView.jsx, CalendarPage.jsx (+ tests);
  docs/specs/CALENDAR_V2_SPEC.md.
- Checks: calendar tests 179 passed; eslint src 0; whole vitest: all passed except LearnerSnapshotCard (fails only
  between 00:00 and 03:00 local time: UTC „today”; fixed in its own PR agent/local-today).
- Next safe step: the owner approves; then opens Kalender → Planeerija → „Lisa kõik õpilased” → „Jaota” and checks the
  red ones with the students.

## 2026-10-26 · agent/teacher-homework — Kodutööd: teachers' access re-checked, the page tidied

- Owner 2026-10-26: „у учителей в kodutood кому-то нельзя было зайти, там внешний вид тоже поправить”.
- Access: fixed on 2026-10-21 (5fd8f69, 5 cards per query). Re-checked tonight: a copy of production users, students,
  homework, worksheetAssignments, exerciseResults (read only) was loaded into the local emulator, and the page's own
  queries ran as each of the 5 teachers. Result: all OK, no permission errors. Nothing to change in the rules.
- Look:
  - search and filter in one slim row (no big empty card);
  - each task shows the student's name first (teachers scan by student);
  - the due date in words: „Täna”, „Homme”, „3 p hiljaks”, „28. okt” (homeworkFlow.dueLabel);
  - „Ootab hinnet” instead of the long „Automaatselt kontrollitud”; work titles wrap to two lines;
  - phones: the due date is shown again (index.css hid it under 560 px); „Kinnita N” goes under the work.
- Bug fixed: `Button` dropped its own classes when given a `className`, so „Kinnita N” looked like a bare grey button.
  The only user was this button.
- Files: crm-v2/src/components/ui/Button.jsx, features/homework/HomeworkPage.jsx, homeworkFlow.js (+ test),
  homeworkPage.css (new).
- Checks: verify (eslint 0, vitest 2666 passed); local visual check at 1400 px and 375 px.
- Next safe step: the owner approves the PR.

## 2026-10-26 · agent/night-fixes — „Ei saa tulla?”: a plain „Ma ei tule” (parents' complaint)

- Owner 2026-10-26: „родители жаловались что у них отметка не приду на урок не работала”. Cause: the dialog demanded a
  new time or a written one („Vali uus aeg või kirjuta …”), so a plain absence could not be sent. Production had
  0 lessonChangeRequests ever. Rules were fine: the emulator shows a linked parent can create the request.
- RescheduleDialog: two choices on top — „Ma ei tule · uut aega pole vaja” (button „Saada teade”) / „Soovin uut aega”.
- rescheduleModel: buildRequest({ absent }) stores proposals [] and other '' (same document keys, no rules change);
  isAbsenceOnly(request).
- Teacher (ChangeRequestsPanel + CalendarPage): „Märgi puudumine” marks the lesson Puudus_p („teatas ette”) through
  lessonRepository.completeFromSchedule (the reason goes into the note) and answers the notice (accepted, chosen null).
  The heading is „Ei saa tulla (N)”; the bell says „… ei tule tunnile”.
- Student page / parent page: „Teade saadetud”, then „Ei tule · märgitud”.
- Production read (2026-10-26): 40 parent accounts, 37 linked to a card, 3 not linked (they see no lessons at all);
  every schedule doc has teacherUid.
- Checks: verify (eslint 0, vitest 2668 passed); lesson-change-emulator.integration.js on the emulator (pass, a parent
  case added).
- Next safe step: the owner approves the PR; links the 3 unlinked parent accounts in Kasutajad.

## 2026-10-26 · agent/finance-lesson-revenue — Finantsid „Ülevaade” counts the calendar's lessons, not the invoices

- Owner 2026-10-26: „прогноз … не привязывать к бухгалтерии, он берётся из количества уроков в календаре, проведённых
  и вынесенных; в бухгалтерии бухгалтер сама всё сделает”.
- financeDashboard.js now:
  - lessonRevenue — per month, the calendar's occurrences (individual + group, every card incl. archived);
  - before today a lesson counts as held when it is marked Toimunud, is a charged Puudus_eta, or is still unmarked
    (not cancelled; counted apart as „märkimata”); Puudus_p and Tühistatud count nothing; from today it is planned;
  - journal-only lessons count as held; a card without a price is counted apart;
  - lessonPriceCents — the plan price by length, the subject's own price;
  - lessonSummary.
  - The invoice / payment model (revenueHistory, revenueForecast, dashboardSummary) is removed.
- FinanceDashboard.jsx loads all student cards, the schedule and the groups itself (plans and the lesson journal come
  from the finance page).
  - KPIs: held this month, still planned this month, month total (vs last month), next month, 3 months, monthly average
    (+ unmarked count).
  - Curves: held (green), planned (gold dashed, from this month's total); the month card under the chart.
- Production read (2026-10-26): Jun 652 €, Jul 780 €, Aug 1077 €, Sep 2628 €, Oct 5105 € held + 1069 € planned;
  Nov–Jan ≈ 6.1–6.2 k € planned.
- Checks: verify (eslint 0, vitest all passed); local visual check.

## 2026-10-26 · agent/accounting-partner-optional — Raamatupidamine: the partner on 2110 / 1350 is optional

- The bookkeeper 2026-10-26 (via the owner): „Подвязку kohustlik убери … я сама их буду привязывать”. A manual entry
  with a line on 2110 (Võlad tarnijatele) or 1350 could not be saved without a supplier partner.
- functions/index.js (manual entry save): validateEntry without `requirePartner`. A named partner must still be a
  supplier card. accounting-core keeps the option.
- crm-v2 accounting: JournalDraft (no „kohustlik”, no „partner (2110)” blocker), JournalGrid (no red „Puudub: partner”),
  journalGrid.workingProblem (no partner requirement). „pole tarnijate seas” for a typed unknown name stays.
- Tests updated (journalGrid.test.js, partners.test.jsx, functions/finance-emulator.integration.js — the finance emulator suite: 102 passed). Checks: verify (eslint 0, vitest 2660 passed); functions npm
  test 407 passed.
- Deploy: functions:invoiceApi (the accounting endpoints).
## 2026-10-26 · agent/finance-dashboard — Finantsid „Ülevaade”: revenue chart and forecast

- Owner 2026-10-26: „в финансах дашборд с графиком дохода, прогнозируемый доход и т.д.” → „сделай как будет лучше в
  нашем стиле”.
- finance/financeDashboard.js (pure, tested):
  - revenueHistory — invoiced by the invoice date (cancelled and credited ones count nothing); received by the date of
    the payment records; an old invoice marked paid by hand counts at its own paidAt;
  - revenueForecast — monthlyBillingRows (the „Koosta arved” calculation: scheduled lessons × each card's price) per
    month. An invoice dated in the month counts as that month's invoice, because almost no invoice carries planMonth.
    Lesson packages and cards without a price are reported apart;
  - dashboardSummary, niceMax.
- finance/FinanceDashboard.jsx (+ financeDashboard.css, the Finantsid greens / gold), on top of /finance for admins,
  can be hidden (remembered per browser):
  - KPIs: invoiced this month (vs last), „Kalendri järgi” with what is not invoiced yet, received (12 months, average),
    outstanding / overdue, next month's forecast, 3 months' forecast;
  - an SVG chart of smooth curves (owner: „кривая, а не столбцы”; monotone cubic, never below zero): invoiced (dark
    green, filled), received (light green), forecast (gold dashed, from this month's calendar amount, over a light gold
    zone); a guide line and a card follow the pointer; the month buttons stay for the keyboard and screen readers;
    a narrow screen scrolls the chart and opens it at this month.
- Production read (2026-10-26): invoiced Jun–Oct 492 / 1780 / 1524 / 1894 / 2231 €. The calendar owes 5958 € for
  October; 4107 € (41 students, mostly „current” billing) has no October invoice yet. Forecast Nov–Jan ≈ 6.1–6.2 k €.
- Checks: verify (eslint 0, vitest 2666 passed); local visual check (desktop and 375 px, no horizontal scroll).
- Not in it: expenses / profit (the expenses collection is empty).

## 2026-10-26 · agent/keelesepp-ai-cors — the ChatGPT plugin install was blocked by CORS

- First „Установить” in ChatGPT failed at once: ChatGPT discovers / registers from chatgpt.com in the browser, and the
  OAuth / MCP addresses answered without Access-Control-Allow-Origin (applyCors allows only the CRM origins).
- keelesepp-ai-mcp.js `isPublic` / `cors`: /mcp and /oauth/* answer any origin (no cookies; bearer tokens), allow the
  MCP headers and expose WWW-Authenticate; preflight answered before the generic OPTIONS.
- Checks: emulator sheet-builder tests 2/2 (preflight from chatgpt.com asserted); functions npm test 407 passed.
- Deploy: functions:sheetBuilderApi.

## 2026-10-26 · agent/keelesepp-ai-mcp — KeeleSepp AI as a ChatGPT plugin (MCP + OAuth)

- In the owner's ChatGPT workspace new GPTs can no longer be made ("plugins replace GPTs", the old ones work until
  11.12); plugins connect only through MCP, and only OAuth (with dynamic client registration) can be entered there.
- functions/keelesepp-ai-mcp.js (inside sheetBuilderApi):
  - MCP Streamable HTTP (JSON-RPC, JSON answers) with the 8 tools of the Actions API: get_guide, get_block,
    get_textbooks, get_textbook, list_lessons, get_lesson, check_sheet, save_draft;
  - the server's `instructions` = the KeeleSepp AI workflow;
  - OAuth 2.1: protected-resource + authorization-server metadata, DCR (/oauth/register — only https callbacks on
    chatgpt.com / chat.openai.com / platform.openai.com), consent (/oauth/describe, /oauth/approve — admin Firebase
    token), token (PKCE S256, one-time 5-min codes in sheetBuilderCodes);
  - the token is a sheetBuilderKeys entry (`kind: "oauth"`, `clientId`), revoked in Seaded like any key.
- Public addresses on the CRM domain (crm-v2/vercel.json rewrites to the function):
  - https://crm.epkoolitus.ee/ai/mcp, /ai/oauth/*;
  - /.well-known/oauth-protected-resource[/…], /.well-known/oauth-authorization-server[/…], /.well-known/openid-configuration.
- CRM: /ai/connect (AiConnectPage, admins) — „Luba” / „Keela”.
- LoginPage now returns to the page with its query (the OAuth parameters survive a login).
- Checks: verify (eslint 0, vitest 2660 passed); functions npm test 407 passed; emulator sheet-builder tests 2/2
  (Actions; OAuth register → consent → PKCE token → MCP initialize/tools/list/tools/call).
- Deploy: functions:sheetBuilderApi; the rewrites go live with the Vercel deploy of main.
- Next: in ChatGPT, Plugin Creator → MCP server https://crm.epkoolitus.ee/ai/mcp, auth OAuth; the owner presses „Luba”.

## 2026-10-26 · agent/textbook-map — the owner's textbooks in the KeeleSepp AI connector

- Owner 2026-10-26: photos of „E nagu Eesti” (contents, pp. 7, 10–20) — „подключи все”.
- Photos saved by page on the owner's Mac: ~/KeeleSepp-opikud/E nagu Eesti/ (never committed).
- functions/textbooks.json:
  - „E nagu Eesti”: 41 parts of the contents — chapter, grammar, pages, nearest A2 course lessons; `license: "unconfirmed"`;
  - „Minu Eesti”: `license: "granted"`.
- Connector: GET /textbooks, /textbooks/{id}. Rule: Õpik 1:1 only for a book with `license: "granted"`; otherwise
  topics and ideas only; handwritten answers in photos are not copied.
- docs/TEXTBOOKS.md (E nagu Eesti section), docs/GPT_SHEET_BUILDER.md updated.
- Checks: emulator connector test passed (textbooks included); functions npm test 407 passed.
- Open: the owner confirms whether the publisher's permission covers „E nagu Eesti”.

## 2026-10-26 · agent/keelesepp-ai-label — GPT drafts are marked „KeeleSepp AI”

- Owner 2026-10-26: „Давай с пометкой KeeleSepp AI”.
- sheet-builder-api.js: author name „KeeleSepp AI” (`AI_NAME`; with the key label when it differs) in the version
  history, `contentOrigin.author`, default key label, OpenAPI title.
- The lesson constructor (LessonWorksheetStudioPage) shows a green „KeeleSepp AI koostas selle mustandi · allikas …”
  banner on such a draft until it is published.
- Seaded card renamed „KeeleSepp AI töölehed”; docs/GPT_SHEET_BUILDER.md: the GPT is named „KeeleSepp AI”.
- Checks: verify (eslint 0, vitest 2658 passed); emulator sheet-builder test passed.
- Deploy: functions:sheetBuilderApi.

## 2026-10-26 · agent/gpt-sheet-connector — ChatGPT builds worksheets with our constructor (drafts only)

- Owner 2026-10-26: „листы будет делать гпт” → „делай”. docs/GPT_SHEET_BUILDER.md (setup + the GPT's instructions).
- functions/sheet-builder-api.js → Cloud Function `sheetBuilderApi`, OpenAPI /openapi.json for a Custom GPT (Actions,
  Bearer key):
  - /guide, /blocks/{type}, /lessons, /lessons/{id}?phase=;
  - /check (the constructor's own checks);
  - /drafts — a new draft version of the lesson sheet; publishedWorksheetDoc kept, version history + summary like the
    constructor; contentOrigin gpt-connector.
- Keys: sheetBuilderKeys/{sha256} (rules catch-all: no client access); CRM Seaded → „ChatGPT töölehed” (admins:
  create — shown once, list, revoke).
- Checks: functions/generated/sheet-kit.cjs bundled from crm-v2/src/features/worksheet-studio/sheetKit.js
  (`npm run build:sheet-kit`; sheetKit.test.js fails when stale).
- Tests: functions/sheet-builder-emulator.integration.js (in financial-core-emulator); sheetKit.test.js; SheetBuilderCard.test.jsx.
- Checks run: verify (eslint 0, vitest 2656 passed); functions npm test 407 passed; the CI emulator suite exit 0.
- Deploy: functions:sheetBuilderApi only (new function).
- Next: the owner makes a key in Seaded and sets up the GPT; first real sheet reviewed in the constructor.

## 2026-10-26 · agent/fake-parent-email — made-up e-mails are refused and never mailed; a child's parent e-mail is optional

- Owner 2026-10-26: a homework e-mail to 123@123.com bounced (Aleksei Merzin's card, parentEmail typed in the
  „Puuduvad andmed” form to get past it). „Да, сделай пункт 2 и сделай это не обязательным пунктом”.
- Made-up addresses (numeric or test/example/asd… domains, a@a.com, noemail@…): crm-v2/src/utils/placeholderEmail.js
  = functions/email-address-core.js (keep in step).
- functions deliverEmail drops made-up recipients; only made-up → nothing sent, `{ status: "skipped" }`.
- „Puuduvad andmed” (missing-data-core.js + missingDataModel.js / MissingDataGate.jsx): a child's parent e-mail is never
  required (the adult's own e-mail still follows the setting); a made-up address is refused with
  „Kirjuta päris e-posti aadress või jäta tühjaks”.
- Student card form refuses made-up e-mail / parent e-mail; the student page warns when the card has one.
- Tests updated from example.com fixtures (account-approval-response.test.js, missing-data-emulator).
- Checks: verify (eslint 0 errors, vitest 2645 passed after a rerun of the flaky WorksheetStudioPage test); functions npm
  test 407 passed; the CI emulator suite passed (exit 0).
- Deploy: firebase deploy --only functions:notifyHomeworkCreated,functions:staffOperationsApi (owner's yes 2026-10-26).
  Other functions (invoice e-mails) get the recipient filter with the next functions deploy.
- Open: Aleksei Merzin's card still has 123@123.com — the admin fixes or clears it (the card now warns).

## 2026-10-26 · agent/works-order — given worksheets in the order to do them, numbered

- Base: `main` 476827d. Owner: in „Tööd” it was hard to see which sheet comes first (sheets of one lesson were
  given at the same minute, the list was newest first). `features/homework/workOrder.js` `compareWorks` / `sortWorks`:
  earliest deadline, then the lesson given first, then Avasta → Harjuta → Kasuta. Used in the student's „Määratud
  töölehed” (HomeworkPage) and the teacher's student card „Tööd” (StudentWorksPanel); each row shows its step „1.”, „2.” …
- Checks: vitest homework + students 39 files, 164 passed (+1 test file); eslint 0 errors. UI only.

## 2026-10-26 · agent/teacher-answer-key — click a task: the teacher sees its answers and can show them to the student

- Base: `main` 2aec0f9 (2026-10-26). Draft PR #813 from `agent/teacher-answer-key`. UI + one service method; no rules change.
- Asked (owner): „Когда нажимаешь на задание, у учителя должны показываться ответы, которыми он может поделиться с учеником.”
- Done: `BlockKeyPanel.jsx` — under the clicked task on the TEACHER's sheet: right answers per item (gaps, choice, true/false,
  matching, word order, dictation, listening, dialogue, tables, exam blocks…), the course explanation (`explain`), the
  teacher note (`teacher`), the listening script; an open task says „hinda ise”. Where: `LiveWorksheetView` (room board,
  /library/worksheets/live/:id, „praegune seis” in the student card), `DocWorksheetSubmissionPreview` (homework review,
  staff only via `answerKey`) and the read-only `DocWorksheetPlayer` a teacher opens. Live view only: „Näita õpilasele” /
  „Peida” per task and „Näita kõik vastused” / „Peida kõik vastused” in the task list (not after the sheet is submitted).
  `engine/answerKey.js`: `blockAnswerKey(doc, blockId)`, listening/dialogue items get the line as prompt (one item per gap
  kept — course explanation counts unchanged), bare item numbers are no longer shown as prompts.
- Data: `homeworkService.setWorksheetShown({ assignmentId, shown, change: { blockIds, on }, user })` — one transaction from
  the stored list: `liveShown`, `liveShownBy[blockId] = { on, byUid, byName, at }`, `liveShownLog` (last 200). Without
  `change` the old plain write remains. Answers and score untouched; the learner's player is unchanged (it already lists the
  right answers of `liveShown` tasks under them, own answers kept and marked). Rules: staff may update the assignment; the
  learner's update list stays answers/status/score/… so the learner cannot write these fields. No emulator test (no rule change).
- Security note: answer keys already live in `worksheetAssignments.worksheetDoc`, which the learner reads (gap brackets,
  `*` options, `explain`, `transcript`). Not changed, no new exposure; moving keys server-side would be its own task.
- Checks: full crm-v2 vitest 372 files passed (1 skipped), 2644 tests passed / 4 skipped, 0 failed (+1 file
  `BlockKeyPanel.test.jsx` 6 tests, +1 in `homework.test.js`); eslint 0 errors (16 old warnings, none in touched files);
  `npm run build` ok. Local stand (teacher live view + student player on one in-memory assignment, b1b2-007 Kasuta
  „Kõne infotelefonile”): click → panel with 8 answers and script; „Näita õpilasele” → student sees „Õiged vastused 1)…8)”
  under the task with own red-marked answer kept; panel shows „näidatud 14:52, Aleksei Merzin”. Stand not committed.
- Limits: the panel is in the sheet flow, so while it is open the teacher's sheet below that task is longer than the
  student's copy (as with the dictation note). Showing answers lets the learner fix answers before „Esita” (score is then
  computed as usual; `liveShownLog` shows what was shown when).
- Deploy: hosting only (no functions, no rules). Next safe step: owner review of the draft PR, then merge and deploy hosting.
## 2026-10-26 · agent/a2-kohakaanded-check — A2 „Kus? Kuhu? Kust? — kontroll A / B”, published

- Base: `main` 2aec0f9 (2026-10-26). Draft PR #812 from `agent/a2-kohakaanded-check`. Content + a small gate rule (diagnostic).
- Asked (owner): a short (~10 min) diagnostic of the place cases for a weak 6th-grade A1–A2 learner — a baseline now and
  the same check in a month, measurable per sub-skill, with a parallel version B; Harjuta only, all items closed.
- Built: `admin/course/a2/kohakaanded.js` (MODULE `a2-kohakaanded-01`, `supplement: true`, A2, strict): a2-k01 „Kus? Kuhu?
  Kust? — kontroll A” and a2-k02 „… — kontroll B”, one Harjuta sheet each, 10 min, 24 items: task 1 choice Kus/Kuhu/Kust
  (8, goal `g_kus`), task 2 inner vs outer form, 2 options (8, `g_koht`), task 3 typed form of a given word with the
  question given (8, `g_lopp`; short illative expected, long form accepted: kooli|koolisse, poodi|poesse, tuppa|toasse …;
  koju only). Same item plan in A and B (task 1: Kus 3 / Kuhu 3 / Kust 2; task 2: inner 4 / outer 4; task 3: Kuhu 4,
  Kust 2, Kus 2), teen topics, the notebook words kodus/koju/kodust, tööl/tööle/töölt, peal, sisse/seest, juurde/juurest.
  Goals = sub-skills in `a2/lessonGoals.js`, so the player's „Tulemus tunni eesmärkide kaupa” gives N / 8 per sub-skill.
  Scoring: 7–8 / 8 known, 5–6 shaky, ≤ 4 not known; task 2 has 2 options (chance 4 / 8) → known only at ≥ 6 / 8.
  Teacher key (`EXPLAIN`) names the sub-skill and reason of each item.
- New rule: a lesson's `diagnostic: true` → `meta.diagnostic` + `meta.shortSheet` (`registry.js`); `quality.js` skips the
  lesson-shape rules for it (length, variety, end, v4 phase jobs, neighbour / same-opening / module-same, balance) and
  instead requires every task to be auto-scored (`diagnostic-open`); `gates.js` skips the vocabulary-box rule. +2 tests.
  Docs: B1_B2_COURSE_PRODUCTION.md §6.
- Checks: full crm-v2 vitest 372 files, 2643 passed / 0 failed; `src/features/worksheet-generator` 933 passed / 0 failed;
  module report 2/2 lessons READY; quality and final-shape baselines unchanged; eslint clean; Vabamorf speller 0 unknown;
  forms checked with Vabamorf synthesize (sg ill / adt / in / el / all / ad / abl); typed answers scored on a test run.
  Sheets looked at in a local preview (render OK).
- Production (owner's permission): created `curriculumLessons/a2-k01`, `a2-k02` (est-a2-curriculum-v1, order 111–112,
  module „Kus? Kuhu? Kust? (kontroll)”) and published their practice sheets v1 (+ worksheetVersions); read back equal to
  the code. Not assigned, no deploy.
- Next safe step: the teacher assigns a2-k01 to the learner now, writes down the three goal results, and assigns a2-k02 in
  a month; compare per goal (g_kus, g_koht, g_lopp).

## 2026-10-26 · agent/a2-lihtminevik-extra — A2 „Lihtminevik: si- ja i-minevik (lisaharjutused)”, published

- Base: `main` cfc59f6 (2026-10-26). Draft PR #811 from `agent/a2-lihtminevik-extra`. Content + a small sheet-gate rule.
- Asked (owner): an 8th-grade A1→A2 learner did a2-076 Harjuta at 19 % (*tulesin, *minesin, *saamasin, *jõisin; negative
  past 0/8: *ei läksin, *ei sõin); a lesson on si-/i-past to assign often. a2-076 lists the i-forms only to memorise
  (no rule, no conjugation); a2b1-023 teaches the i-past at B1. A handout the owner was shown put käima, õppima, võima
  in the i-past — they are si-past (käisin, õppisin, võisin; also viisin, müüsin, lugesin); checked with Vabamorf.
- Built: `admin/course/a2/lihtminevik.js` (MODULE `a2-lihtminevik-01`, `supplement: true`, A2, template v4, strict):
  a2-l01 „Si- või i-minevik?” (Avasta + Harjuta 40–41 min, Kasuta short), a2-l02 „Ei läinud, ei söönud” (same shape),
  a2-l03 / a2-l04 „Lihtminevik: kordamine 1 / 2” (Harjuta only, 17–18 min, spaced review; l03 has a listening).
  Goals in `a2/lessonGoals.js`. New: a lesson's `shortSheet` (true or phases) → `meta.shortSheet` (`registry.js`);
  `depth.js` skips the minute norms (thin, live-fast) on such a sheet, item and sentence norms stay (+1 test). Audio:
  6 recordings (TartuNLP, `public/audio/a2-l01…l03`, `listeningAudio.json`). Docs: B1_B2_COURSE_PRODUCTION.md §6.
- Checks: full crm-v2 vitest 371 files, 2637 passed / 0 failed; module report 4/4 lessons READY (0 problems, didactic
  score 100 on all 8 sheets); quality and final-shape baselines unchanged; eslint clean; Vabamorf speller: only the
  deliberate wrong options and ending fragments (one real slip *videosid → videoid fixed). Sheets looked at in a local
  preview (render, cloze line breaks fixed).
- Production (owner's permission): created `curriculumLessons/a2-l01…l04` (est-a2-curriculum-v1, order 101–104) and
  published their sheets v1 (+ worksheetVersions); read back equal to the code. No homework assigned, no deploy.
- Risk: the audio files are served from the app (`/audio/a2-l0x/…`) — until this PR is merged and deployed the
  listening blocks of these sheets have no sound (6 blocks; a2-l03 is the one short sheet with listening).
- Next safe step: merge the PR and deploy hosting, so the audio of the published sheets plays; then assign.

## 2026-10-26 · agent/ledger-sign — pearaamat shows a liability's balance as a positive number

- Base: `main` e78c9d3. Owner: 2110 Võlad tarnijatele showed −168,00 for a debt (the ledger always counted
  debit − credit). `accountingReports.js` `ledger`: liabilities, equity and income count credit − debit (`side:
  'credit'`), so a normal balance is positive and a minus now really means the wrong side. Käibeandmik and bilanss
  unchanged. Also merged/deployed today: PR #808 (voided receipts reversed; 1200 no longer negative after the sync).
- Checks: vitest src/features/accounting 55/55 (+1); eslint clean. UI only.

## 2026-10-26 · agent/accounting-voided-payments — voided receipts are reversed in the books

- Base: `main` 5c8ab1a. The accountant: the balance sheet shows a minus. Read-only check: 1200 Ostjatelt
  laekumata arved −261 € — five invoices (KS-2026-036, -058, -063, -066, -076) had a receipt entered twice and voided
  once (+ a voided 1 € LinkPay test, KS-2026-093): 711 € of voided receipts stayed booked. Cause:
  `accounting-core.js` reversed only `status: "void"`, the CRM writes `"voided"`. Fixed (both spellings); the next
  „Uuenda kanded” adds the `payment-void:` storno entries on the void dates. 2110 Võlad tarnijatele −81,30 € is from
  manual entries (supplier payments larger than the booked purchase invoices / opening balance) — for the accountant.
- Checks: functions npm test all passed (+1 test in accounting-core.test.js). Deploy: functions:financeApi.
## 2026-10-26 · agent/ledger-width — Pearaamat fits without sideways scrolling

- Base: `main` 5c8ab1a. Owner: the pearaamat table needed horizontal scrolling. `AccountingPage.jsx` ledger
  table gets `accounting-ledger` + a colgroup; `accounting.css`: fixed layout, column widths (date 10 %, nr 10 %,
  document 15 %, partner 12 %, sums 9 % each, Sisu the rest), tighter cells, long text wraps. UI only.
- Checks: vitest src/features/accounting 54/54; eslint clean.

## 2026-10-26 · agent/direction-level-sync — „Muuda andmeid” level reaches the main study track

- Base: `main` a9d4444. Owner: on Svetlana Pitkevichus's card „Muuda andmeid” set B1 → B2, but „Õppesuunad”
  still showed A1 → B1 (the main track only followed a teacher change).
- `services/firebase/students.js`: `withMainTrack(stored, current, patch)` (teacher, level, target level);
  `withMainTrackTeacher` kept as a wrapper; `update()` sends the card's teacher / level / target level to the main
  track. Read-only check: 15 active cards have a main track level different from the card (tracks show the default
  A1 → B1) — not changed by this PR.
- Checks: vitest services/firebase/students + features/students 26 files, 123 passed (+1 test); eslint clean.

## 2026-10-26 · agent/b1-m07-final — B1 module 7 „Tervis ja enesetunne” in the final shape

- Base: `main` b519e36 (2026-10-26, after #800, module 6). Draft PR #804 from `agent/b1-m07-final`. Content only; no
  production data, no deploy. Parallel agents rewrite modules 8, 9, 10 (not touched here).
- Asked (owner): module 7 (a2b1-031…035) to the final shape (`COURSE_FINAL_SHAPE_B1.md` §6.2 row 7, §6.3 formats L3a and
  W1a, Eksaminurk in every teaching lesson, ≥ 80 % target per exam part).
- Done: `b1/module07.js` rewritten (storyline: November flu wave in Sofia's office, Markus's cough, Viktor's bicycle fall,
  Liis's December challenge „30 päeva tervemalt”, Kristjan in January, the office weekend in Võrumaa):
  - 031 KUUL L→W — office dialogue (L04), Kadri's column (R06 õige/vale/ei selgu), first look at the translative
    (table G02), two fluency talks (S06, S11); corner **L3a** (radio, short answers, format introduced); formtext,
    chat, translation, crossword, W02 message to Liis; Kasuta: Anna's voicemail (L07), call back (S05), tasks shared
    (S03), main **W04** letter 90–110 words.
  - 032 LUGU R→S — Markus's story in three episodes: reading with a cliffhanger (R02), doctor's visit (L05), rule (G02),
    retelling (S07) and talk to two listeners (fluency); choice, word forms, transformation, medicine leaflet (R07),
    pharmacy (L09), formal mail to the Riga client (W12); corner **R1** (where to turn); Kasuta: his message (R05),
    plan (W11), main **S04** call to the health centre for him, ranking of his tasks (S12), get-well card (W03).
  - 033 AVAS L→S — test first (G13), Viktor at the trauma clinic (L06), imperative rule (G04 sort), match, 10 clips (L01),
    4-3-2 (S08); word order, sina → teie (G05), phone menu numbers (L10), physio leaflet bank (R04), pharmacy problem
    (S10), corner **S1a**; Kasuta: Markus's sleep diary (R08, `level: 3`), explain it (S13, fluency), main **S03**
    sleep plan, W08 reply with advice.
  - 034 KIRJ R→W — Liis's invitation (R13 predict), Jaan's model story with headings (R09), story parts (G04), radio on
    habits (L02), survey (S09, fluency); editing (G06), Anna's diary cloze (R03), joining (W09), Liis's message (G03),
    8-minute free writing (W06, fluency), corner **W1a** (questionnaire, format introduced); Kasuta: results cards (R11),
    Kristjan's first day (S01), main **W05** newsletter story 80–100 words, rewrite with the rubric (W10).
  - 035 EKS — Harno A2 frame with B1 tasks R1, R2, R3a, L1, L3a, L4, W1a, W2a, S0, S1a, S2; `B.examPart` per part
    (R 38, L 31, W 20, S 20 points), target 80 %; Sofia's letter from Võrumaa closes the story.
  - §6.2 row 7 used as written (all four pairs, no swap needed). Goals 031–035 in `b1/lessonGoals.js` (035 without
    `g_vocab`, as the test wants); cast facts in `COURSE_CAST.md`; the 032 picture brief now names the family doctor,
    not Liis (`art/visuals/b1-module-07.js`); pitfalls in `FINAL_SHAPE_AUTHORING.md` §8.2.
- Audio: 13 new recordings (TartuNLP, free) in `public/audio/a2b1-031…035`, 6 old files and 7 manifest entries removed.
- Checks: `course:final-shape --module 7` 57 → 0; course 979 → 885 (baseline only shrank: module 7 −57, modules 8, 9, 11,
  13, 15, 16 and course −37 because the old module-7 instructions and sequences are gone). Strict + older quality gate
  for module 7: 0. `npx vitest run src/features/worksheet-generator`: 61 files passed (1 skipped), 923 tests passed, 4
  skipped (`origin/main` still b519e36 at the end). eslint on changed files: 0. Vabamorf speller: 0 unknown words except
  names (EMO, Ozols), the grammar endings „ge / ke” of the imperative notice and the technical value `kusimustik`. All 15
  sheets rendered on a local stand (print mode, not committed), no console errors.
- Limits: sheets are 40–48 min by the estimator (exam 47–51); 033 Kasuta reading carries `level: 3` (decisions from the
  diary); V1/V2 against 036 checked on today's `main` only (module 8 is being rewritten).
- Next safe step: owner reviews module 7 in „Kursuse tootmine” and publishes it; the module 8 author checks V2 against 034
  (Avasta opens R13, Harjuta G06, Kasuta R11) and the 30 % recycling of module 7's vocab boxes.
## 2026-10-26 · agent/b1-m06-final — B1 module 6 „Toit ja teenindus” in the final shape

- Base: `main` 092f898 (2026-10-26, after #798, module 2). Draft PR #800 from `agent/b1-m06-final`. Content only; no
  production data, no deploy. Parallel agents rewrite modules 3, 4, 5 (not touched here).
- Asked (owner): module 6 (a2b1-026…030) to the final shape (`COURSE_FINAL_SHAPE_B1.md` §6.2–§8), Eksaminurk from
  module 6, new texts, unique instructions, ≥ 80 % target per exam part.
- Done: `b1/module06.js` rewritten (storyline: Helgi's week at Sofia's — market, café Kaneel, restaurant Aed, Anna's
  dinner, the office fridge, the late delivery from „Kiire Kõht”):
  - 026 LUGE R→W — Liis's blog (R13 predict), market listening (L03), kogus + osastav; corner **R1** (ads, format
    introduced); Kasuta: guests' cards (R11), menu agreed (S03 idea card), main **W04** letter to Jaan 80–100 words.
  - 027 KUUL L→S — corner **L1** (10 clips), lunch at Kaneel (L04), chat (R12), the owner on the radio (L05), ordering
    with an allergy (S05); Kasuta: restaurant voicemail (L07), main **S04** booking call, S12 ranking, S01, W02 message.
  - 028 AVAS L→W — test first (G13) → diary (R06) → rule (G02) → Anna's recipe by phone (L09) → test again (G05), 4-3-2;
    Viktor's letter (R03), food-bank radio (L02), dictation, W01 questionnaire, corner **S1a** (format introduced);
    Kasuta: Markus's message (R05), retelling (S07), kitchen meeting (S03), main **W05** story 8–10 sentences.
  - 029 PROB R→S — the wrong burger heard (L06), first try (S10), four steps, notices (R07), angry message rewritten
    (W12); choice, word bank (R04), translation, joining (W09), reviews (R09), explain to Helgi (S13); Kasuta: order and
    terms (R08, `level: 3`), main = corner **S2** call to customer service, W08 reply, W10 rewrite.
  - 030 EKS — Harno A2 frame with B1 tasks R1, R2, R3a, L1, L3a, L4, W1b, W2a, S0, S1a, S2; `B.examPart` per part,
    target 80 %; Helgi's letter closes the story.
  - Leads: §6.2 had 028 AVAS R→S and 029 PROB L→W, but PROB → W fails V5-lead (§4: PROB output S). Moved to 028 AVAS
    L→W, 029 PROB R→S (all four pairs once); §6.2 row annotated.
  - Goals of 026–030 in `b1/lessonGoals.js`; cast facts in `docs/COURSE_CAST.md`; module-6 pitfalls in
    `docs/FINAL_SHAPE_AUTHORING.md` §8.
- Audio: 13 new recordings (TartuNLP, free) in `public/audio/a2b1-026…030`, 7 old ones removed from the manifest and disk.
- Checks: `course:final-shape --module 6` 72 → 0; baseline 1282 → 1202 (only shrank: module 6 −72, 8 V7/V2 entries in
  modules 7, 10, 11 left because the old module-6 instructions are gone). Older quality gate + strict gate for module 6:
  0. `npx vitest run src/features/worksheet-generator`: 61 files passed (1 skipped), 923 tests passed, 4
  skipped (`origin/main` was still 092f898 at the end, nothing to merge). eslint on changed files:
  0. Vabamorf speller: 0 unknown words except names, „PÄ” (allergen letter) and the technical genre value
  `kusimustik`. All 15 sheets rendered locally (print mode), no layout problems.
- Limits: sheets are 40–50 min by the estimator; 029 Kasuta reading carries `level: 3` (application questions on the
  order terms); 028 is declared L-led although its inputs are half reading, half listening; V1/V2 against 024 and 031 were
  checked on today's `main` only (modules 5 and 7 may change); no new pictures (the 5 existing briefs still fit).
- Next safe step: owner reviews module 6 in „Kursuse tootmine” and publishes it; module 7 author starts 031 with a
  corner other than S2 (029's corner) and checks V2 against 029.
## 2026-10-26 · agent/b1-m04-final — B1 module 4 in the final shape

- Base: `main` 092f898 (2026-10-26, after #798). Draft PR #802 from `agent/b1-m04-final`. Content only; no production data,
  no deploy. Parallel: modules 3, 5, 6 are rewritten by other agents (not touched here).
- Asked (owner): module 4 „Aeg ja plaanid” (a2b1-016…020) to the final shape (`COURSE_FINAL_SHAPE_B1.md` §6.2 row 4).
- Done: `b1/module04.js` rewritten, one storyline (first week of December: camp, inventory, Anna's wedding, the dentist,
  Viktor's car): 016 AVAS R→S (time expressions; test → Kaie's programme → rule → test again; main S03 day plan), 017
  KUUL L→W (peab/võib/saab/ei tohi; 5 listenings; W1b note taught with an exam tip; main W04 letter to Kati 80–100 words,
  W12 formal reply), 018 LUGE R→W (particle verbs; Markus's Thursday, article, Anna's handover; main W05 story 80–100
  words + W10 rewrite), 019 PROB L→S (first try at the call → polite forms → second call; S2 phone call taught in Kasuta,
  main; family council; invitation W03), 020 EKS Vahehindamine 1 (A2 form + B1 tasks R1, R2, R3a, L1, L3a, L4, W1b, S0,
  S1a, S2; timed parts, 80 % per part; language items name their area; profile table vs a2b1-001). All tasks tagged,
  reviews name 014/016–018 and module 1–2 lessons, 2 fluency tasks a lesson. Goals 016–020 in `b1/lessonGoals.js`;
  cast facts in `COURSE_CAST.md`; new pitfalls in `FINAL_SHAPE_AUTHORING.md` §8.
- Audio: 13 new recordings (TartuNLP, free) in `public/audio/a2b1-016…020`, 9 old files and 8 manifest entries removed;
  „Kaie” added to the female names of `tools/listening-audio/plan.mjs`; `sisenemistestiga` to `language-allow.txt`.
- Checks: `course:final-shape --module 4` 69 → 0; course 1282 → 1202 (baseline only shrank: module 4 −69, 11 V7 problems
  in modules 5–15 disappeared with the old module-4 instructions). Strict + older quality gate for module 4: 0.
  `npx vitest run src/features/worksheet-generator`: 61 files passed (1 skipped), 923 tests passed, 4 skipped. eslint on changed
  files: 0 errors. Vabamorf speller: 0 unknown words except names and the technical value `kusimustik`. All 15 sheets
  rendered on a local stand (not committed).
- Limits: sheets are 40–44 min (exam sheets 40–55), not 45+ — the V4 id caps leave no room for more tasks; 019 Kasuta
  listening carries `level: 3` (consequence questions); particle verbs are introduced in 018 (LUGE), not in an AVAS
  lesson (§4.1 rule 6 is not automated; the plan row puts AVAS on 016 = time expressions); V2/recycling checks against
  modules 3 and 5 must be re-run after their rewrites merge.
- Next safe step: owner reviews module 4 in „Kursuse tootmine” and publishes it.
## 2026-10-26 · agent/b1-m03-final — B1 module 3 in the final shape

- Base: `main` 092f898 (after #798, B1 module 2). Draft PR from `agent/b1-m03-final`. Content only; no production data,
  no deploy. Modules 4, 5, 6 are rewritten by other agents in parallel — only module 3 and its lines in shared files here.
- Asked (owner): module 3 „Kodu ja linn” (a2b1-011…015) to the final shape (`COURSE_FINAL_SHAPE_B1.md` §6.2–6.4, §7–8),
  grammar per `grammarPlan.js`, storyline continuing module 2, Harno-like A2 module exam with an 80 % target per part.
- Done: `b1/module03.js` rewritten with new texts and items — 011 KUUL L→W „Kodu otsingul” (adjective suffixes; eight
  voice messages, the viewing at Valgevase 7, radio on renting, house notices; owner's voicemail → explain to Jaan →
  phone the owner → main W04 letter to Helgi 80–100 words), 012 LUGE R→W „Kolimispäev” (kus/kuhu/kust; blog with
  prediction, cloze, word-bank list, house rules õige/vale/ei selgu, polite notice; Helgi's letter → idea card on the
  furniture → main W05 story 80–100 words + invitation card), 013 RÄÄK L→S „Minu uus linnaosa” (suffixes again,
  sest/kuna; vox pop, Tiina's walk with numbers, survey, questionnaire, 4-3-2, interview T/F; five proposals → main S03
  residents' meeting → summary letter), 014 PROB R→S „Pidu on ohus” (directions mine/minge, -ni; decide first, R1 ads,
  city announcement, Viktor's story, Helgi phones from the station; maintenance terms and day plan → main S10 call to the
  firm → rewritten way description → meeting Tiina), 015 EKS (Harno A2 form, `B.examPart` per part, R2, R3a, L1, L4,
  L3a, W1b, S0 tagged; reading 30 / listening 25 / writing 20 / speaking 20 points, target 80 %). Leads differ from the
  §6.2 row („RÄÄK L→W*” fails V5-lead: RÄÄK must end in speaking, so KUUL became L→W and RÄÄK L→S) — see
  `FINAL_SHAPE_AUTHORING.md` §9. Goals of 011–015 in `b1/lessonGoals.js`; cast facts in `docs/COURSE_CAST.md`.
- Audio: 13 new recordings (TartuNLP, free, `--only a2b1-011` … `a2b1-015`), 10 old files and 8 manifest entries removed.
  Speller: suffix labels `eba`, `lik`, `line`, `ne`, `tu` added to `tools/course-audit/language-allow.txt`.
- Checks: `course:final-shape --module 3` 54 → 0; course 1282 → 1206 (baseline only shrank: module 3 −54, modules 4, 5,
  7, 8, 13, 14 −22 V7/V2 problems that came from the old module-3 texts). Strict and older quality gates for module 3:
  0 problems. `npx vitest run src/features/worksheet-generator`: 61 files passed (1 skipped), 923 tests passed,
  4 skipped. eslint on changed files: 0 errors. Vabamorf speller: 0 unknown words except names and the technical value
  `kusimustik`. All 15 sheets rendered once on a local stand (not committed).
- Limits: sheets are 40–45 min by the estimator (gate 40–55), not 45+ everywhere (the id caps leave no more tasks);
  Kasuta of 014 uses a reading tagged `level: 3` (R08, questions that apply times and prices); module 4's recycling of
  module-3 words is 35 % (gate 30 %) against the current module 4 — re-check after module 4 is merged.
- Next safe step: owner reviews module 3 in „Kursuse tootmine” and publishes it; whoever merges second among modules
  3–6 re-runs `UPDATE_FINAL_SHAPE_BASELINE=1` and the worksheet-generator tests.
## 2026-10-26 · agent/b1-m05-final — B1 module 5 in the final shape

- Base: `main` 092f898 (after #798, B1 module 2). Draft PR #799 from `agent/b1-m05-final`. Content only; no production data,
  no deploy. Parallel agents rewrite modules 3, 4 and 6 (not touched here).
- Asked (owner): module 5 „Lihtminevik ja kogemused” (a2b1-021…025) to the final shape (`COURSE_FINAL_SHAPE_B1.md`
  §6.2–6.4, §7–8); fix the audit's can-do/time mismatch (024 promised 2–3 min speaking).
- Done: `b1/module05.js` rewritten with new texts and items, one storyline (Linnaleht story contest „Minu kõige
  ootamatum päev”). 021 LUGU R→W (regular past -si-/-s- and negation; main W04 letter to the sick colleague, 80–100
  words); 022 RÄÄK R→S (time words, verb second; main S03 agreement on the team outing; 4-3-2); 023 AVAS L→S (irregular
  past; test → rule → test; Harno L1 clips introduced, tagged `L1`; main S10 problem with the festival organiser);
  024 KIRJ L→W (process writing; main W05 story 80–100 words, Harno W2a introduced, tagged `W2a`; the can-do now promises
  writing, matching the main task); 025 EKS (Harno A2 form + B1 tasks R2, R3a, L1, L4, L3a, W1b, W2a, S0, S2; timed
  parts, 80 % target per part). §6.2 swap: 022 RÄÄK / 023 AVAS (allowed), so AVAS introduces the irregular past
  (grammarPlan 021/023 unchanged). Goals 021–025 in `b1/lessonGoals.js`; cast in `docs/COURSE_CAST.md`; pitfalls in
  `docs/FINAL_SHAPE_AUTHORING.md` §8.1.
- Audio: 13 new recordings (TartuNLP, free) in `public/audio/a2b1-021…025`; 9 old files and 8 manifest entries removed.
- Checks: `course:final-shape --module 5` 59 → 0 problems; course 1282 → 1210 (baseline only shrank: module 5 −59, 12
  V7/V6 problems in modules 6–14 and course disappeared with the old module-5 instructions). Older quality gate and strict
  gate for module 5: 0. `npx vitest run src/features/worksheet-generator`: 61 files passed (1 skipped), 923 tests passed,
  4 skipped; vocabulary + library tests 112 passed. eslint on changed files: 0. Vabamorf speller: no unknown words except
  names, notice morphemes (-sin, -sid) and the deliberate wrong options of the „try first” test. All 15 sheets rendered
  locally (print mode), no broken markup.
- Limits: sheets 40–43 min (gate 40–55; 45+ would need more tasks than the id caps allow); one Kasuta reading has
  `level: 3` (024 contest rules, application questions); the „try first” test uses over-generalised non-words as wrong
  options on purpose.
- Next safe step: owner reviews module 5 in „Kursuse tootmine”; then the next module with the S/W id plan of §8.1.

## 2026-10-26 · agent/b1-m02-final — B1 module 2 in the final shape (pilot module)

- Base: `main` 6a63532, merged with `main` 14f9af9 (after #797, B1 module 1). Draft PR #798 from `agent/b1-m02-final`. Content
  only; no production data, no deploy.
- Asked (owner): module 2 „Pere ja suhted” (a2b1-006…010) to the final shape (`COURSE_FINAL_SHAPE_B1.md`) as the pilot
  for modules 3–18; notes for the next agents.
- Done: `b1/module02.js` rewritten — 006 LUGU R→W (old photo, lost cousin Maie; main W05 story 60–80 words), 007 KUUL
  L→S (kes-clauses; voice notes, announcement, radio interview; main S03 agreement on a babysitter), 008 AVAS R→S
  (oma/tema, mis/mida/mille; test → rule → test; main S04 phone call to lost property), 009 PROJ L→W (sest/kuna,
  proposals; voicemail with numbers, R1 ads, booking call, plan & budget; main W04 invitation letter 80–100 words +
  rewrite), 010 EKS (Harno A2 form, timed `B.examPart` per part, target 80 % per part, teie-form instructions; B1-shaped
  tasks tagged R2, R3a, L1, L4, L3a, W1b, S0). Goals of 006–010 in `b1/lessonGoals.js`; cast facts in
  `docs/COURSE_CAST.md`; „Lessons from the pilot module” in `docs/FINAL_SHAPE_AUTHORING.md` §8.
- Audio: 13 new recordings (TartuNLP, free) in `public/audio/a2b1-006…010`, 7 old ones removed; „Marika” added to the
  female names of `tools/listening-audio/plan.mjs`; `nõbul`, `nõbule` added to `tools/course-audit/language-allow.txt`.
- Checks: `course:final-shape --module 2` 47 → 0 problems; course 1360 → 1282 (baseline only shrank: module 2 −47,
  31 V7/V2/V6 problems in modules 3–7 and course disappeared because the old module-2 instructions are gone). Strict and
  older quality gates for module 2: 0. `npx vitest run src/features/worksheet-generator`: 61 files passed (1 skipped),
  923 tests passed, 4 skipped. eslint on changed files: 0 errors. Vabamorf speller: 0 unknown words except names and the
  technical genre value. All 15 sheets rendered locally (print and student mode), no layout problems.
- Limits: sheets are 40–43 min by the estimator (gate 40–55), not 45+; one Kasuta reading carries `level: 3` (009,
  application questions) because only R05/R11/L07 meet the Kasuta rules by default; no picture for 009 (no brief added,
  as every brief needs its image file); A2 rubric split reuses the B1 scales (8 + 12, 20).
- Next safe step: owner reviews module 2 in „Kursuse tootmine” and publishes it; then module 3 with the plan table of
  `FINAL_SHAPE_AUTHORING.md` §8.

## 2026-10-26 · agent/b1-m01-diagnostic — B1 module 1: entry test, A2 consolidation, module check

- Base: `main` 6a63532 (2026-10-26, after #796). Draft PR from `agent/b1-m01-diagnostic`. Content only; no production
  data, no deploy. Parallel: `agent/b1-m02-final` rewrites module 2 (not touched here).
- Asked (owner): module 1 (a2b1-001…005) = entry diagnostic + A2 consolidation in the final shape.
- Done: `admin/course/b1/module01.js` (registered in `registry.js`, added to `strictModules.json`), goals 001–005
  rewritten in `b1/lessonGoals.js`, picture questions (`prompts`) for the 5 existing module-1 pictures
  (`art/visuals/b1-module-01.js`), cast facts in `docs/COURSE_CAST.md`, status lines in `COURSE_FINAL_SHAPE_B1.md` §10
  and `METHODOLOGY_STANDARD.md` §6.4.
  - 001 EKS entry test, timed (`B.examPart` R/L/W/S, target 60 %): A2 short form + one B1 preview per skill (R1 ads,
    L4 interview, W2a story, S2 phone call); closed parts scored; W/S with exam rubrics; every language item names its
    grammar area in the teacher's key (`why`), profile table → lessons 002/003/004.
  - 002 AVAS R→W lihtminevik (write first → Anna's diary → rule → letter W04, main); 003 RÄÄK L→S partitive object +
    ma/da (radio survey → 4-3-2 → agreement S03, main); 004 PROB R→S kus/kuhu/kust + conditional (problem → first try →
    rule → phone call S04, main). Reviews name `a2b1-00N` and A2 lessons (`a2-0NN`). 005 EKS module check in A2 form,
    compared with 001, leads to module 2.
  - `module03.js`: four review items got `from` (a2b1-002 / a2b1-004) so V13-spaced does not appear in module 3 now
    that module 1 exists.
- Audio: 16 new recordings (TartuNLP, free) in `public/audio/a2b1-00[1-5]`, manifest updated.
- Checks: `course:final-shape --module 1` 0 problems; course total 1360 (was 1359): +1 baseline entry
  `a2b1-006|discover|V13-previous` (module 2) — 006 now has a previous lesson (005) and its review does not name it; to be
  fixed in the module 2 rewrite (review item with `from: 'a2b1-005'`). Older quality gate and strict gate for module 1:
  0 problems. `npx vitest run src/features/worksheet-generator`: 61 files passed (1 skipped), 923 tests passed,
  4 skipped; didactics 51/51; eslint on changed files 0.
- Limits: diagnostic sheets are ≥ 40 min each (gate), so the full test is ~2 h 15 min; rubric splits are ours (§2.4).
- Next safe step: module 2 agent adds a review item `['…', 'a2b1-005']` in 006 and removes that baseline entry.

## 2026-10-26 · agent/final-shape-gates — B1 final shape: tags, archetypes, gates V1–V15, Harno exam blocks

- Base: `main` 6442af2 (2026-10-26, after #795). Draft PR #796 from `agent/final-shape-gates`. Code + docs; no lesson
  content rewritten, no production data, no deploy.
- Asked (owner): §9 items 1–4 of `docs/COURSE_FINAL_SHAPE_B1.md` — infrastructure only. Owner decisions recorded in §10:
  certificate needs ≥ 80 % in every exam part; module 1 (001–005) = entry diagnostic + A2 consolidation (content later).
- Built:
  - **Author's order kept** (`registry.js lessonOrder`): only rubric / examrubric and self-check go to the end; planning,
    speaking, writing, role cards stay where the author put them (audit problem 1). Measured: the built order changes
    on 41 of 255 B1 sheets (A2 27, B2 46, C1 39, EK9 3, EN 3); the other „speak → write” endings are in the content
    itself. Exam sheets may end on any task (`quality.js` `end`).
  - **Task catalogue** `worksheet-studio/didactics/taskCatalogue.js`: §3 (61 ids R/L/W/S/G, level, exam link, per-module
    min/max), default id per block type, Harno format ids, archetypes, §6.3 introduction and §6.4 practice numbers.
  - **Tags and lesson shape** (`admin/course/blocks.js`): `tag(block, { task, harno, level, fluency, main, topic })` on
    `block.tag` (validated); `shape('LUGU', 'R→W')`, `withShapes(LESSONS, map)` → `archetype`, `lead` in sheet meta;
    `B.review` items `[text, fromLessonId]` → `data.from`.
  - **Harno exam blocks** (`engine/blocks/harno.jsx`, data in `harnoScales.js`; player, teacher review, studio editor,
    print, answer keys, CSS incl. phone width): `adsmatch` (R1, scored), `examlisten` (L1/L2/L4 choice / true-false /
    matching with audio, scored; audio tool builds it too), `examwriting` (Harno task card, W1a questionnaire or text
    with live word count), `speakcard` (S1b idea card, S2 question/answer cards, recording), `examrubric` (W1 /8,
    W2 /12, speaking /20, 80 % target), `exampart` (minutes, tasks, points, 80 % target, timer on screen). Builders
    `B.adsmatch`, `B.bankText`, `B.examListen`, `B.examWriting`, `B.ideaCard`, `B.phoneCards`, `B.rubricW1`,
    `B.rubricW2`, `B.rubricSpeaking`, `B.examPart`. Time estimate, depth, didactic check, quality lists, method gaps
    know the new types.
  - **Gates V1–V15** `worksheet-studio/didactics/finalShape.js` (pure, node-importable); course test
    `admin/course/finalShape.test.js` with baseline `admin/course/finalShapeBaseline.json` (known problems shown, new
    ones fail, fixed ones must leave); summary `npm run course:final-shape` (= `tools/course-audit/final-shape.mjs`,
    counts per rule / check / module + ported audit measurements). V14 uses EKI etLex A1–B1 forms (CC BY, in repo) +
    earlier modules' vocab, because PSV is not available offline.
  - Example lesson `admin/course/finalShapeExample.js` (not a course module) passing every lesson rule; guide
    `docs/FINAL_SHAPE_AUTHORING.md`; §9 status in `COURSE_FINAL_SHAPE_B1.md`; note in `DIDACTIC_ENGINE.md`.
- **Baseline (how far B1 is from the spec, 85 lessons, 67 teaching): 1359 problems** — V1 2, V2 17, V3 68, V4 254,
  V5 75 (no archetypes yet), V6 62, V7 392 (repeated instructions), V8 0, V9 124, V10 77, V11 71 (fluency strand
  missing in 67 lessons), V12 51 (no exam corner), V13 125 (review items without `from`), V14 26, V15 15. Tags in use:
  0 of 1211 tasks; catalogue ids in use 23 of 61; sheet endings „speak → write” 178; exam lessons with 4 listening
  tasks 3 of 18, with part timing 0.
- Checks: crm-v2 whole vitest 372 files (370 passed, 1 failed, 1 skipped), 2629 tests: 2624 passed, 4 skipped,
  1 failed — `LearnerSnapshotCard` „täna”, fails on clean `main` 6442af2 too (local time just after midnight, not
  touched here). New tests: `finalShape.test.js` 22, `harno.test.jsx` 12, `blocks.test.js` 7, `finalShapeExample.test.js`
  2, course `finalShape.test.js` 18 groups; block round trip covers the 4 new answerable blocks. eslint 0 errors
  (16 old warnings); `npm run build` ok. Local stand (student + print) of all new blocks, not committed.
- Limits / risks: Harno's per-criterion split for B1 writing/speaking is ours (§2.4 [INF]); per-skill raw scores into
  „Minu areng” not done; V7 baseline is per lesson + phase (a swap of one repeated instruction for another in the same
  phase is not caught); published sheets change block order only when republished.
- Not done: content (modules 1–18), per-skill score in progress, mocks 060/080/089/090 in full Harno form.
- Next safe step: a content agent rewrites one B1 module (e.g. 7) with tags, `withShapes`, review `from` and one exam
  corner per lesson, and shrinks `finalShapeBaseline.json` for that module.

## 2026-10-26 · agent/course-final-shape — B1 course final shape (research doc, no code)

- Base: `main` a67789f (2026-10-26, after #794). Draft PR from `agent/course-final-shape`. Docs only.
- Asked (owner): lessons must not repeat one template, tasks must not repeat, each lesson leads to its goal, after the
  B1 course a learner passes Harno B1 with ≥ 80 %.
- Done: `docs/COURSE_FINAL_SHAPE_B1.md` — sources with URLs (Harno B1 page re-read 2026-10-26, sample tasks,
  consultation booklet, performance samples, handbooks; Keeleklikk/Keeletee, Tere jälle!, E nagu Eesti, Naljaga
  pooleks, INSA, EKI PSV/Sõnaveeb/käsiraamat; Nation, Willis, Ellis, Harmer, spacing/retrieval/interleaving, Bloom/SOLO,
  CEFR CV, CoE test manual, washback); Harno B1 exam map with ids W1a…S2 and the 80 % target per part (16/20, 24/30,
  27/33, 16/20); catalogue of 61 task types (R/L/W/S/G) with exam link, level and per-module min–max; 8 teaching
  archetypes + exam/mock with rotation rules and a default plan for modules 2–18 (checked by script: no archetype twice
  in a row, 4 distinct per module, L→S/L→W/R→S/R→W once per module); module arc; course arc with mocks 060, 080, 089
  and final 090, format introduction schedule and practice counts; 15 testable rules V1–V15.
- Checks: no tests needed (docs only); the §6.2 matrix verified with a local script against rules 1–5.
- Limits: Harno does not publish the B1 per-criterion raw split for writing/speaking — our rubrics are marked [INF].
- Not done: code (tags, `finalShapeProblems` gate, exam-scale rubrics), module 1, content rewrite.
- Next safe step: owner reviews §6.2 plan and §10 questions; then one PR adding block tags + gates V1–V5, V7–V9 into
  the quality baseline.

## 2026-10-25 · agent/missing-data-gate — „Puuduvad andmed”: after login a learner fills what is missing on the card

- Base: `main` 3102bb8 (2026-10-25, after #791), merged with `main` d0fa498 (after #792 learner-emails). Draft PR
  #793 from `agent/missing-data-gate`. Learner gate + Õpilased list + Seaded card + one server route group + two
  rules blocks. No calendar, finance, Live Classroom or content changes; no data written, no deploy.
- Asked (owner 2026-10-25): „Сделать форму для заполнения недостающих данных во время входа.”
- Built (ARCHITECTURE.md „Puuduvad andmed”):
  - Learner: `MissingDataGate` right after the „Teated” gate (Teated first, then this; one blocking flow, logout
    always, fail-open after 8 s, „Jätka praegu ilma” when saving fails). Opens only when a REQUIRED item is missing;
    optional ones are in the same form. Items: Sobivad ajad (PollGrid + quick choices), contact e-mail and phone (an
    adult's own; a child's parent's), parent's name (child), message language et / ru / en, class 1.–12. or birth
    year (child; an unknown-age student picks „Täiskasvanu” or a class first, then gets the adult or the child
    questions; the account e-mail is prefilled for an adult). A parent fills per child in one form and gives their
    own phone and language once. ET + RU labels, checks in the browser and again on the server.
  - Server (`functions/missing-data-core.js` pure, `functions/missing-data-service.js`, routes in
    `staffOperationsApi`): `/missing-data/mine`, `/missing-data/save`, `/missing-data/report` (admin). Writes only
    the missing fields of the caller's own cards (and only while still empty), never other fields or cards (403),
    `studentAvailability` only when empty, parent's `phone` / `preferredLanguage` on their own `users` profile, and an
    audit record `missingDataSubmissions/{id}` (who, when, before → after).
  - **`preferredLanguage` ('et' | 'ru' | 'en')** on the student card and on the parent's user profile — the contract
    agent/learner-emails (#792) already reads (docs/EMAIL_NOTIFICATIONS.md).
  - Admin: Seaded → „Puuduvad andmed” (`missingDataSettings/current`: per item Kohustuslik / Soovi korral / Ei küsi;
    default Sobivad ajad, e-post, keel, klass required; telefon, lapsevanema nimi optional). Õpilased → „Puuduvad
    andmed” (`?puuduvad=1`): per card missing items, kind, teacher, account, „küsitakse sisselogimisel”, filters,
    counts, „Ava kaart”, „Kopeeri /ajad link” for cards without an account, „Uued täitmised” with before → after and
    „Vaadatud”. Bell: „<name> täitis puuduvad andmed” (category Õpilased) until „Vaadatud”.
  - Rules: `missingDataSettings` admin read / validated write; `missingDataSubmissions` admin read, admin may only set
    the review mark, no create / delete from the browser. Students / users rules unchanged (not loosened).
- Read-only production counts (2026-10-25, default settings, `functions/tools/missing-data-counts.js`): 96 active
  cards — kind: 53 child, 3 adult, 40 unknown age (own account, no class, no parent data); accounts: 42 student only,
  12 parent only, 15 both, 27 none. Every card misses at least one required item (language is new: 96). Would see the
  form at login: 69; without any account (school sends /ajad or calls): 27. Per item (with account / without):
  Sobivad ajad 95 (68 / 27), e-post 35 (9 / 26), telefon 86 (59 / 27), lapsevanema nimi 10 (7 / 3), keel 96
  (69 / 27), klass või sünniaasta 62 (46 / 16).
- Checks: crm-v2 whole vitest 367 files (366 passed, 1 skipped), 2563 tests: 2560 passed, 3 skipped, 0 failed (new:
  MissingDataGate 12, MissingDataPanel 5, MissingDataSettingsCard 3); eslint 0 errors (16 old warnings);
  `npm run build` ok; functions `npm test` 402/402 (new missing-data-core 8); emulator (`firebase emulators:exec
  --only auth,firestore,functions --project demo-keelesepp-finance`, JDK 21) missing-data-emulator (new, in
  `test:emulator`) + announcements + learner-email + security-access: 13/13. Local stand with made-up data (student of
  unknown age → Täiskasvanu, parent with 2 children, admin list, settings; 375 px, no horizontal scroll, + desktop),
  not committed.
- Deploy needed (owner): `firebase deploy --only firestore:rules` and `firebase deploy --only
  functions:staffOperationsApi`. Front end with main (Vercel). Until functions are deployed the gate gets 404 and
  fails open (the CRM opens as before); until rules are deployed Seaded cannot save (defaults apply on the server).
- Limits: optional items alone never open the form; values already on the card cannot be changed through it (staff
  edit the card); a child's own e-mail is not asked (only the parent's); the parent's name / e-mail come from the
  parent account when one is linked; unknown-age cards are counted with the adult questions in the admin list.
- Owner decision: with defaults 69 learners will be asked at the next login (language is missing everywhere) — keep,
  or set some items to „Soovi korral” first.
- Next safe step: owner deploys rules + `staffOperationsApi`, checks Seaded → „Puuduvad andmed”, then logs in as the
  test student to see the form.

## 2026-10-25 · agent/learner-emails — e-mails to students and parents (7 types, all off by default)

- Base: `main` 914a417 (2026-10-25, after #790). Draft PR #792 from `agent/learner-emails`. Functions + Seaded + one public
  learner page + rules. Calendar UI (`features/calendar`, the planner's branch) not touched.
- Asked (owner 2026-10-25): lesson reminder the day before, lesson moved / cancelled only when the teacher confirmed,
  new schedule from the planner, homework due tomorrow, work checked, „Teated” by e-mail; admin switches each on,
  texts editable, ET + RU, unsubscribe link, log without addresses, no SMTP flood.
- Built (full contract: docs/EMAIL_NOTIFICATIONS.md, ARCHITECTURE.md „E-mails to students and parents”):
  `functions/learner-email-core.js` (pure: occurrences like calendarView, change detection + resolution, planner batch
  summary, recipients, language, HMAC preference token, ET/RU texts with placeholders, DST-safe Tallinn time),
  `functions/learner-email-service.js` (jobs `learnerEmailJobs`, daily runs, lease, 40 messages / 5-min tick, retry,
  stale drop, `emailLog`, preferences, preview / test), index.js: `learnerEmailsTick` (every 5 min),
  `queueLearnerScheduleEmail`, `queueLearnerWorksheetReviewEmail`, `queueLearnerExerciseReviewEmail`,
  staffOperationsApi `/email-preferences/{status,save,one-click}` (no login) and `/learner-emails/{preview,test}`
  (admin), `deliverEmail` passes `headers` (List-Unsubscribe), `notifyHomeworkCreated` respects the opt-out.
  CRM: Seaded → „E-kirjad õpilastele ja vanematele” (`LearnerEmailsCard.jsx`: toggles, daily hour, school address,
  texts per type with placeholders, preview, „Saada proov mulle”, last 30 log rows), public `/e-kirjad/:token`
  (`EmailPreferencesPage.jsx`: off / on, language). Rules: `emailSettings` (admin, full validated shape),
  `emailLog` (admin read); everything else server-only.
- Teacher confirmation: only staff can write `schedule`; learners only ask (`lessonChangeRequests`); the teacher's
  „Kinnita” moves the lesson → that move is what is e-mailed, after a 10-min settle window (undo = nothing sent).
- Planner contract (for `agent/calendar-planner`): `plannerBatchId` on every confirmed lesson (+ `source: 'planner'`),
  one e-mail per student 3 min after the batch's last write; optional `plannerBatches/{id}` `{ status, notify }`.
- Language: `preferredLanguage` (`et|ru|en`, added by `agent/missing-data-gate`) on the student card / parent profile
  (coordinator 2026-10-25), else ET + RU; the recipient's own choice on `/e-kirjad` wins.
- Reach (read-only production check 2026-10-25, counts only): 96 live cards; 71 with at least one address (60 with a
  student address, 31 with a parent address; 63 distinct student and 25 distinct parent addresses); 25 cards get
  nothing; users 66 students / 39 parents; schedule 710 docs (68 active weekly series, 67 future one-off lessons, 100
  online); 0 groups; 16 open homework with a future due date.
- Checks: functions `npm test` 394/394 (+16 learner-email-core); emulator (`firebase emulators:exec --only
  auth,firestore,functions --project demo-keelesepp-finance`, JDK 21) `npm run test:emulator` 100/100 (+3
  learner-email-emulator: rules; whole queue with a mock mailer — reminders on the DST day, undo, occurrence move /
  cancel, planner batch, review, announcement, opt-out, idempotency, retry, stale, lease; routes + the real trigger);
  crm-v2 whole vitest 362 files (361 passed, 1 skipped), 2520 tests: 2517 passed, 3 skipped, 0 failed (new: model 4,
  card 2, preferences page 3); eslint 0 errors (16 old warnings); `npm run build` ok. All 7 types rendered to HTML in
  the scratch dir and checked visually; Seaded card + `/e-kirjad` checked at desktop and 375 px (harness not committed).
  No e-mail was sent; no production write.
- Deploy needed (owner): functions (4 new + staffOperationsApi + notifyHomeworkCreated; index.js changed), rules
  (`emailSettings`, `emailLog`), front end with main. After deploy nothing is sent until types are switched on.
- Limits: group lesson moves / cancels are not e-mailed (0 groups); deleting a one-off lesson and ending a series are
  silent; `emailQueue` still stores each message with the address (existing pattern, admin + bookkeeper read);
  `plannerBatches` has no browser rules (the planner PR adds them if it writes that doc).
- Next safe step: owner deploys rules + functions, opens Seaded → E-kirjad, sends „Saada proov mulle” for each type,
  then switches on one type (e.g. „Tunni meeldetuletus”) and checks `Viimased kirjad` the next evening.
## 2026-10-25 · agent/calendar-planner — „Planeerija”: the whole weekly timetable at once

- Base: `main` 914a417 (2026-10-25, after #790). Draft PR #791 from `agent/calendar-planner`. Calendar only (+ one
  small rules block for `plannerBatches`); no finance, content, Live Classroom; no data written, no deploy.
- Asked (owner 2026-10-25): all students into the calendar with one button and distributed; students who do not fit may
  share a time; while moving, green = wants, yellow = can, red = cannot (still allowed, agree with the student).
  Coordinator addition: lessons of one „Kinnita” carry `source: 'planner'` + `plannerBatchId`, and
  `plannerBatches/{id}` is written after them for the schedule e-mail of agent/learner-emails (no e-mail here).
- Built (docs/specs/CALENDAR_V2_SPEC.md „Planeerija”): `features/calendar/plannerModel.js` (pure: `planningRequests`,
  `plannerContext`, `judgeSlot`, `distribute` — hardest first, ★ first, a student's lessons on different days, one
  backtracking step, least-bad fallback with allowed overlap, unplaced reasons — `judgeAll`, `planSummary`, `dragMarks`,
  `lessonPayload`, `moveDraft`, `placeRequest`), `PlannerView.jsx` (toolbar Algus / Õpilased / „Ka need, kel on korduv
  tund”, „Lisa kõik õpilased”, „Jaota”, „Kinnita ajakava…”, summary, legend, „Aega ei leitud” chips with „ava kaart” /
  „kopeeri /ajad link” / „Paku aeg”, selected-lesson box with reasons, phone list, „Õppesuunad plaanis” editor, confirm
  dialog with ticks), button „Planeerija” + `?planeerija=1` in `CalendarPage.jsx`, `TimeGrid` `onDragChange` /
  `onDropItem` / `item.blockClass`, CSS in calendarV2.css. Draft in `localStorage` `keelesepp.planner.v1.<uid>`.
  `services/firebase/plannerBatches.js` (new), `schedule.js` `payload` exported and a new entry may name its `source`
  (an existing one keeps its own; default unchanged). Rules: `plannerBatches/{id}` admin create (fixed keys, own uid,
  server time, ≥1 lesson, status confirmed) + admin read, no update / delete. ARCHITECTURE.md „Firestore ownership”.
- Read-only production dry run (2026-10-25, start 2026-10-26, all teachers): 96 active cards → 49 directions without a
  weekly lesson ahead (60 lessons a week: 39 × 1, 9 × 2, 1 × 3; 10 online; 5 teachers). Only 1 `studentAvailability`
  document exists and none of these 49 has times → placed ★ 0, suitable 0, needs agreement 0, overlap 0; not placed
  49 (44 „Sobivad ajad puuduvad”, 5 without a teacher). Of the 49, 7 have a one-off lesson ahead, 32 had a lesson in
  the last 60 days, 4 have Google-imported lessons ahead. With „uus plaan”: 98 directions (128 lessons), 2 with times →
  1 ★, 1 needs agreement, 1 overlap; 91 no times, 5 no teacher. Speed with made-up times for all 98: 0.54 s.
- Checks: crm-v2 whole vitest 361 files (360 passed, 1 skipped), 2534 tests: 2531 passed, 3 skipped, 0 failed (new:
  plannerModel 15, PlannerView 5, TimeGrid planner 1, CalendarPage planner 1, schedule payload 1); planner tests also
  under TZ Europe/Tallinn, America/New_York, Pacific/Auckland, UTC (19/19 each); eslint 0 errors (16 old warnings);
  `npm run build` ok; functions `npm test` 378/378; emulator (`firebase emulators:exec --only auth,firestore --project
  demo-keelesepp-finance`, JDK 21) planner-batches-rules-emulator 1/1 (new, in `test:emulator`) +
  study-directions-rules-emulator 1/1. Local stand with made-up data (add all → Jaota → drag with colours, click-to-place
  an unplaced student, confirm dialog; desktop + 375 px, no horizontal scroll), not committed.
- Deploy needed (owner): `firebase deploy --only firestore:rules` (plannerBatches) before the first „Kinnita” whose
  e-mail should go out; until then the lessons are created and the planner shows that the batch record failed.
  Front end with main (Vercel). No functions change.
- Limits: the draft is per browser; a teacher's „Kinnita” writes no batch record (admin-only rules) — lessons still
  carry the batch id; a teacher sees only their own lessons; greedy + one backtracking step, not an optimum; one-off
  lessons in the next 3 weeks block a weekly time.
- Next safe step: owner deploys the rules, collects „Sobivad ajad” (/ajad link) from the 44 students without times and
  sets a teacher on the 5 tracks without one, then opens Kalender → Planeerija → „Lisa kõik õpilased” → „Jaota”.

## 2026-10-24 · agent/accounting-partners — Tarnijad first, partners on journal lines, „Partnerid” report

- Base: `main` 3f31fcb (2026-10-24, after #789). Draft PR #790 from `agent/accounting-partners`. Accounting only (no calendar,
  student, Live Classroom or content changes; no rules change).
- Asked (the accountant via the owner 2026-10-24): „Поставщиков сначала, и привяжи их к проводкам” — like Merit Aktiva /
  Excel, each journal line on a partner account carries the partner.
- Built (docs/ACCOUNTING.md „Tarnijad ja ostuarved”, „Partnerid”, „Päevaraamat kui tabel”):
  1. Tarnijad: `SuppliersPanel.jsx` (search, „Näita mitteaktiivseid”, header sort, „Impordi Excelist” with a per-row
     preview, Excel) on Ostuarved and on Raamatupidamine (tab + button „Tarnijad”). Duplicates by registry code or
     by name (case, quotes, legal form ignored) — warning under the row, server 409 (`purchases-core supplierDuplicate`,
     now also on `/suppliers`). New route `/suppliers/import` (`supplierImportPlan`, all or nothing, max 400,
     idempotent by requestId, one `financialAudit` record).
  2. Partner on entry lines: `lines[].partner { type: supplier | customer, id, name }`. accounting-core `cleanPartner`,
     `validateEntry(…, { suppliers, requirePartner })` (keeps it, checks the supplier exists, takes its current
     name), `correctedEntry` passes the options, `snapshotOf` / `reversalOf` keep the partner (history + audit show
     partner changes; storno and „Asenda konto” keep partners). `/accounting/entries` (new manual entry) requires a
     supplier on 2110 / 1350 lines; `/accounting/entries/update` checks but does not require. OA / VM entries carry the
     supplier on every line; new sales entries the customer (student card id + payer name) on 1200 / 2500.
     Päevaraamat grid: column „Partner” (12 %, Kirjeldus ≈ 34 % stays the widest), type-ahead from Tarnijad by name or
     registry code (`PartnerInput.jsx`), „Puudub: partner” on 2110 / 1350 lines (blocks a manual entry), unresolved
     names red, filter + sort by partner, paste with a Partner column (JournalDraft and grid), Excel with Partner.
  3. Reports: tab „Partnerid” (`partnerReport`, 2110 by default, any account or all): algsaldo, käive D/K, lõppsaldo
     per partner, „Partner puudub” row, drill-down to the lines, „Pearaamat” → ledger filtered by that partner;
     Excel `partnersWorkbook` (sheets Partnerid + Read). Pearaamat: Partner filter + column. Käibeandmik unchanged.
  4. Backfill: `functions/accounting-partner-core.js` (`partnerBackfillPlan`, `manualPartnerSuggestions`,
     `partnerBackfillPatch`) + `functions/tools/accounting-partner-backfill.js` (dry run by default; `--apply` OA / VM,
     `--apply-manual` text matches; history item „partner” + financialAudit; locked / closed skipped). NOT applied.
- Dry run on production (read-only, 2026-10-24): 382 entries, 0 purchase invoices, 0 suppliers → 0 OA / VM entries to
  update. 50 lines on 2110 (49 in 48 manual PR entries typed as „ostuarve …” / „PA-ülekanne …”, 1 in the algsaldod
  entry 168,00); 221 lines on 1200 / 2500 without a customer (old sales entries, not touched). Simulation in memory
  with the supplier names found in those texts (Kirsi Residents, Zone Media, Senty Studio, Apple, Euronics, Charlot,
  Hea Vesi, Julianus Inkasso, Google, …): 43 entries / 44 lines would get a supplier by `--apply-manual`, 2 match two
  suppliers (Kirsi Residents + Julianus Inkasso), 3 none (FB reklaam, grossi ostuarve, algsaldod).
- Checks: crm-v2 whole vitest 359 files (358 passed, 1 skipped), 2511 tests: 2508 passed, 3 skipped, 0 failed (new:
  partners.test.jsx 7, suppliers.test.jsx 6, journalGrid partners 5; JournalGrid / journalGrid tests moved to the
  7 columns); eslint 0 errors (16 old warnings); `npm run build` ok; functions `npm test` 378/378 (+11: core partner 4,
  purchases 3, backfill 4); emulator (`firebase emulators:exec --only auth,firestore,functions --project
  demo-keelesepp-finance`, JDK 21) finance-emulator + security-finance-emulator 46/46 (new: partners — import all or
  nothing / idempotent / teacher 403, name duplicate 409, OA / VM partners, manual 2110 needs an existing supplier,
  partner change in history + audit, replace-account and storno keep partners). Local stand with made-up data
  (grid type-ahead + save, draft „Puudub: partner (2110)”, Partnerid drill-down → Pearaamat, Tarnijad import; desktop
  + 375 px), not committed.
- Deploy needed (owner): functions (`financeApi`: partner validation, `/suppliers/import`, name duplicates). No rules
  change (suppliers already admin-read). Front end with main (Vercel). Until functions are deployed the import button
  gets 404 and partners typed in the grid are saved by the old server without the supplier check (the old
  validateEntry drops unknown fields — partners would be lost), so deploy functions before the accountant starts.
- Limits: a manual-entry correction is not partner-required on the server (only the UI blocks it); the customer
  partner exists only on sales entries written after the deploy; a supplier rename does not rename partners already
  on lines (the report groups by id and shows the stored name).
- Next safe step: owner deploys functions; the accountant imports Tarnijad from Excel (Raamatupidamine → Tarnijad →
  „Impordi Excelist”), then the owner runs the backfill dry run and, with permission, `--apply-manual`; the rest
  (2 ambiguous, 3 without a match, the algsaldod 168,00) she sets in the päevaraamat column „Partner”.

## 2026-10-24 · agent/student-merge-subjects — „Liida kaardid” done properly, parents on the card, own study directions

- Base: `main` 7bfa20f (2026-10-24, after #787 / #788). Draft PR #789 from `agent/student-merge-subjects`. Students / parents /
  settings UI, the merge function, one rules block. Calendar and finance invoicing logic not touched.
- Asked (owner 2026-10-24): „нормальное объединение и связывание их с родителями … нормально сделать предметы … самому
  ставить учебные направления”.
- (1) Merge. Audit found two merges: „Liida kaardid” on the card (`/students/merge-cards`) moved only `studentId` /
  `studentIds` (not group members in `groups.students`, not per-card documents such as the price plan, „Sobivad ajad”,
  board; finance and schedule only on request; no audit of conflicts) and the list's „Kontrolli duplikaate”
  (`/students/merge`) deleted the other card by default. Now one merge (ARCHITECTURE.md „Student identity”):
  `functions/student-card-merge-core.js` (pure) + `functions/student-merge.js`: admin picks the kept card and the name;
  preview lists per kind what moves, documents, price, subjects, parents and conflicts; apply needs `confirmed: true`;
  everything moves (lessons, schedule incl. series, groups + `studentLessonMap`, homework / worksheets / results,
  notes, change requests, recordings, invitations, invoices / payments / credits / packages — only the card id, never
  an amount or number); per-card docs copied when the kept card has none; the other price becomes
  `subjectPrices[its subject]`; `users.linkedStudentIds` re-pointed; accounts, parents, contacts, enrollments,
  `teacherUids` united; old card = tombstone (`active: false`, `mergedInto`, `mergedIntoStudentId`), never deleted;
  `studentCardMerges/{oldId}` (idempotent, resumable) + `activityLog/student-card-merge-{oldId}`. `/students/merge`
  with `permanent` and `/students/merged/purge` now answer 410. Õpilased → „Võimalikud duplikaadid”
  (`duplicateCandidates.js`, `DuplicateCandidatesModal.jsx`): same name, or same first name + same parent / phone /
  e-mail / account; „Liida” per pair, „Ei ole duplikaat” (`students.notDuplicateOf`).
- (2) Parents. Card „Lapsevanemad” (`StudentParentsCard.jsx`, admin): link an existing parent account (search), add a
  parent without an account (`students.parentContacts`), remove a link / contact. `parentsService.linkStudent` now
  adds (several parents per child; the first stays main), new `unlinkStudent` / `addContact` / `removeContact`;
  ParentsPage „Määra siia” (overwrite) → „Lisa ka sellele vanemale”; `parentMatchesStudent` counts every linked
  account. Access model unchanged (rules read `linkedParentIds`); a contact's e-mail links the child at the parent's
  registration (`account-bootstrap-core.js parentEmails` + test). No rules change for parents.
- (3) Study directions. `studyDirections/{id}` (rules: admin writes validated keys, no delete; staff + finance read).
  Seaded → „Õppesuunad” (`StudyDirectionsCard.jsx`): name, short label, colour, levels, other spellings, archive;
  shows cards per direction and values on cards that are not in the list. Built-in list until saved (Eesti keel,
  Inglise keel, Matemaatika, Emakeel, Vene keel). `SubjectSelect.jsx` everywhere a subject is chosen (student form,
  „Õppesuunad”, new child of a parent, group form); levels follow the direction. Track status „Käib / Paus /
  Lõpetanud” (`enrollments[].status`; ended = inactive). Card „Õppesuunad” (`StudentDirectionsCard.jsx`,
  `studentDirectionsModel.js`): per direction teacher, level → target, price (finance roles), „Käib” / „Tunde pole
  plaanis” / „Paus” / „Lõpetanud” + next lesson, derived from the schedule; admin „Paus / Jätka / Lõpeta”. Teachers
  see only their own directions. Calendar and Õppevara subject tabs unchanged (calendar reads the card's tracks;
  Õppevara tabs come from the material's level labels). No backfill needed (reads fall back).
- Read-only production check (2026-10-24, 97 open cards, 0 stored directions): subjects on cards Eesti keel 90,
  Inglise keel 6 + „Inglise Keel” 1 (same direction), Matemaatika 7; 5 cards already have >1 direction; schedule
  has 414 entries without a subject (lessons 12). Duplicate candidates 3: Milan / Milan Grozovski (high: same parent
  account, e-mail, name), Maria / Maria and Mykyta / Mykyta (same name). Children (grade set) 32, of them 19 without a
  parent account link (9 have their own student account; 10 have no parent contact at all). Parent accounts 39, 3 with
  no child at all (Anton Kortšomkin, Анна Пищик, Денис Лазарєв).
- Checks: crm-v2 whole vitest 357 files (356 passed, 1 skipped), 2493 tests: 2490 passed, 3 skipped, 0 failed (new:
  duplicateCandidates 5, studyDirections 5, studentDirectionsModel 3, StudentDirectionsCard 3, StudentParentsCard 3,
  StudyDirectionsCard 2, parents service +2, merge modal / list rewritten); eslint 0 errors (16 warnings, before 18);
  `npm run build` ok; functions `npm test` 367/367 (+6 merge core, +1 bootstrap); emulator (`firebase
  emulators:exec --only auth,firestore,functions --project demo-keelesepp-finance`, JDK 21):
  student-merge-emulator 3/3, study-directions-rules-emulator 1/1 (new, in `test:emulator`), finance-emulator 40/40
  (merge over HTTP: admin only / preview / confirm; „never deleted” replaces the two delete tests). Local stand with
  made-up data (card, list + merge dialog, settings; desktop + 375 px), not committed.
- Deploy needed (owner): `firebase deploy --only firestore:rules` (studyDirections) and
  `firebase deploy --only functions:staffOperationsApi` (merge, 410 for deletes, account bootstrap reads
  parentContacts e-mails). Until the rules are
  deployed the settings card cannot save and the built-in list is used; until functions are deployed the new merge
  dialog gets the old server answer (preview works, apply ignores `confirmed`, finance / schedule stay behind).
- Owner decisions: merge Milan + Milan Grozovski? Maria / Maria and Mykyta / Mykyta: two children each („Ei ole
  duplikaat”) or one? Save the direction list (add levels for Matemaatika / Emakeel as wanted). Link parents for the
  10 children without any parent contact; check the 3 parent accounts without children.
- Next safe step: owner merges, deploys rules + `staffOperationsApi`, then saves Seaded → Õppesuunad and runs „Liida”
  on Milan / Milan Grozovski.

## 2026-10-24 · agent/calendar-admin-fixes — rooms after „Tühista”, red hour = warning, teacher week grid

- Base: `main` f69a872 (2026-10-24). Draft PR #788 from `agent/calendar-admin-fixes`. Calendar only (+ a functions core
  helper and a dry-run tool); no rules, no data, no deploy.
- Asked (Oleksiy, chat „Баги в системе” 2026-10-22…24, docs/specs/CALENDAR_V2_SPEC.md „Administrator fixes”):
  1. „При отмене занятия через Tühista не освобождается кабинет”. The 2026-10-22 fix (#730) covered the
     administrator; left: `roomBookings` were read once per page, and a teacher sees other teachers' lessons only
     through them → a lesson cancelled elsewhere held its room until a full reload. Now the bookings reload with the
     calendar (`CalendarPage` `bookingsState`), `roomModel.roomConflict` ignores cancelled / online bookings (stale ones
     too). `functions/room-booking-core.js` `roomBookingResyncPlan` + `functions/tools/room-bookings-resync.js`: finds
     stale bookings, dry run by default (`--apply` only with the owner's word; writes `roomBookings` + an `activityLog`
     entry). Not run. `syncRoomBooking` is deployed (checked with `firebase functions:list`).
  2. A red (busy) or yellow (online only, on-site lesson) teacher window is a warning, not a ban: form „Salvesta
     ikkagi” (second click), drag „Tõsta tund?” → „Tõsta ikkagi” / the weekly choice, „Ei saa tulla?” accept → confirm.
     `planningWarnings` tags `window: 'busy' | 'online'`. The old rule (only a teacher could override their own time,
     owner 2026-10-10) is replaced by this. Room rule unchanged.
  3. „Minu ajad” / „Õpetaja ajad” opens `TeacherWeekEditor.jsx` (+ `teacherWeekModel.js`): Mon–Sun × half hours
     08–22, „Saadaval” / „Ainult veebis” / „Ei saa” / „Kustuta”, tap / drag / whole day; the week's lessons on top
     (clashes framed red), „Võrdle õpilasega” overlays a student's „Sobivad ajad”, date windows listed with
     „Eemalda”. Saves the same `teacherAvailability/{uid}` (rules unchanged: admin any, staff own) — only changed
     weekdays are rebuilt, everything else kept with its id. One-day windows: cell menu or the old painting mode
     („märgi kalendris lohistades”). `?ajad=1` opens it.
- Files: crm-v2/src/features/calendar/{CalendarPage.jsx, roomModel.js, studentTimesModel.js, CellStatusMenu.jsx
  (wording), calendarV2.css, TeacherWeekEditor.jsx (new), teacherWeekModel.js (new)} + tests (CalendarPage.test.jsx,
  CalendarPage.rooms.test.jsx (new), roomModel.test.js, studentTimesModel.test.js, TeacherWeekEditor.test.jsx (new),
  teacherWeekModel.test.js (new)); functions/room-booking-core.js (+test), functions/tools/room-bookings-resync.js
  (new); docs/specs/CALENDAR_V2_SPEC.md.
- Checks: vitest src/features/calendar 21 files / 155 tests passed (new: rooms page 4, roomModel 1, red window page 5
  replacing 2, planningWarnings 1, week grid model 12, editor 9, editor page 2 replacing 1); grid / editor / rooms /
  warnings models also under TZ Europe/Tallinn, America/Los_Angeles, Pacific/Kiritimati, UTC (39/39 each); whole crm-v2
  vitest 350 files (349 passed, 1 skipped), 2461 tests: 2458 passed, 3 skipped, 0 failed; eslint 0 errors (18 old
  warnings); `npm run build` ok; functions `npm test` 360/360. Emulator not run (rules not touched). Checked on a local
  stand page with made-up data (desktop + 375 px: editor, compare, drag-paint + save, red drag warning, „Salvesta
  ikkagi”); stand not committed.
- Deploy: the usual Vercel front-end deploy after merge. Functions: nothing to deploy (the core helper is used only
  by the tool). The resync tool needs the owner's permission and a service account to run.
- Next safe step: owner merges; Oleksiy cancels a test lesson as a teacher and re-books its room, then opens
  „Minu ajad”.
## 2026-10-24 · agent/student-card-fixes — student card: lessons after a rename, parent link, second subject on one card

- Base: `main` f69a872 (2026-10-24). Draft PR from `agent/student-card-fixes`. Students / parents UI only (no calendar,
  no finance logic, no rules, no functions, no production writes).
- Asked (Oleksiy, „Баги в системе” 2026-10-17…24): (1) future lessons missing on a renamed card; (2) a button from the
  student's card to the parent's card; (3) several courses with different teachers on ONE card.
- (1) Already fixed by #663 (2026-10-18): the card reads `schedule` / `lessons` by `studentId`, and the cause was a
  weekly series with a past start date, not the name. Read-only production check today: 141 live schedule entries,
  all with a valid `studentId` (0 missing, 0 unknown); 8 of them carry an old name of 4 renamed cards and all 4 cards
  show their next lessons with the current code. No data fix needed (180 entries without `studentId` are all from
  2026-06-15…08-19, none live; 12 `lessons` point to card ids that no longer exist). This PR: regression test
  (renamed card keeps its lessons) and the subject of each next lesson on a card with several subjects.
- (2) „Ava lapsevanema kaart” existed (2026-10-22, linked parent account ids). Gap: a card linked to its parent only
  by the parent's e-mail/name had no link (2 active cards in production). Now it gets „Ava lapsevanema kaart” →
  `/parents?student=<card id>`: ParentsPage shows the parents whose children include that card (same matching as the
  page: id, e-mail, name), or says no parent account is linked. Parent → child links already existed.
- (3) Already built: enrollments (`students.enrollments`, `addEnrollment` / `updateEnrollment`), subject switcher, a
  teacher sees only their subject, price per subject in Finantsid → Arveldus (`studentRevenuePlans.subjectPrices`),
  one invoice with lines per subject. Missing glue: the track editor was only in the list „Õpilased”. Now:
  - `EnrollmentManager.jsx` (moved out of StudentsPage) opens on the card: hero button „Õppesuunad” and „+ Lisa aine
    teise õpetajaga” under Õpetaja/Õppesuunad (admin only); `/students/<id>?enrollments=1` opens it at once. Subject
    suggestions (`SUBJECT_CHOICES` in subjects.js), the name is normalised (`subjectName`), the same subject with the
    same teacher is refused. After adding: notice „… Tunnihinna saab määrata Finantsid → Arveldus”; the price field
    of the new subject appears there by itself. Only the card is re-read (the window stays open).
  - „Lisa õpilane”: `similarStudents.js` warns when a card with the same name (or name + surname, any order) exists
    and links to that card with the track editor open — the main source of duplicate cards.
  - „Muuda andmeid” on a card with several subjects says it edits the main subject and lists the others.
  - Invoicing untouched.
- Duplicates (read-only, 97 active cards): exact same name — 2 pairs, both one subject (the two „Maria” are two
  children per the owner; two „Mykyta” cards, one from a parent account, one from the learner's own registration).
  Same parent + similar name + different subjects — 1 pair („Milan” English / „Milan Grozovski” Estonian, same
  grade): very likely one child on two cards. Not merged (owner decides; „Liida kaardid” keeps both subjects).
- Files: crm-v2/src/features/students/{EnrollmentManager.jsx (new), similarStudents.js (+test, new),
  StudentProfilePage.jsx, StudentsPage.jsx, StudentForm.jsx, StudentLessonsPanel.jsx, subjects.js,
  studentProfileTabs.css} + tests; features/parents/ParentsPage.jsx (+test); styles/index.css.
- Checks: crm-v2 whole vitest 347 files passed + 1 skipped, 2441 tests: 2438 passed, 3 skipped, 0 failed (students +
  parents 118 → +12 new); eslint 0 errors (18 old warnings); `npm run build` ok. Visual check on a local stand
  (card: add „inglise keel” → „Inglise keel · Anhelina Korotka”, notice, Tunnid with subjects, Arveldus price field;
  „Lisa õpilane” warning and its link; `/parents?student=`); stand not committed.
- Deploy: frontend only (goes with main). No rules / functions.
- Owner decisions: merge „Milan” + „Milan Grozovski” (and the two „Mykyta”) with „Liida kaardid”?
- Next safe step: merge; the administrator adds a second subject on a card and sets its price in Arveldus.

## 2026-10-24 · agent/learner-announcements — „Teated”: the school's announcements before the learner portal opens

- Base: `main` 03f8b6e (2026-10-24), merged with `main` 12e179d. Draft PR from `agent/learner-announcements`.
- Asked (owner 2026-10-24): a news card for parents and students — on login first a message from the administrator
  that must be answered before anything else.
- Built (ARCHITECTURE.md „Teated”):
  - Admin: Suhtlus → „Teated” (`/messages/teated`, admin only; `features/announcements/AnnouncementsAdminPage.jsx`,
    `AnnouncementForm.jsx`): new / edit / publish / archive / restore as draft; title, text (line breaks, https links),
    audience students / parents / both + optional subject, level and chosen students (count of matching cards shown),
    from–to dates, response „Loetud” / „Küsimus” (free text, one or several choices, optional „Muu”) / „Sobivad ajad”,
    „Luba vastust muuta”. „Vastused”: who must answer, who answered (time, who, answer; times as „T 18–20”), who not
    yet; CSV for Excel (`;`, UTF-8 BOM).
  - Learner / parent: `AnnouncementGate` in `AppShell` — full-screen card before the CRM, one after another (oldest
    first, „Teade 2 / 3”), logout kept, Estonian + Russian labels; „Sobivad ajad” uses PollGrid + the saved
    `studentAvailability` (a parent per child); fails open if the server is unreachable (8 s). „Teated koolilt” card on
    the student and parent home lists answered / ended ones; the answer can be changed only if allowed.
  - Server: `functions/announcements-core.js` (pure), `functions/announcements-service.js`, routes in
    `staffOperationsApi`: `/announcements/mine`, `/announcements/respond`, `/announcements/report` (admin).
  - Rules: `announcements` admin read / validated write, no delete; `announcementResponses` admin read, no client write.
- Checks (after merging main 12e179d): crm-v2 whole vitest 347 files (346 passed, 1 skipped), 2430 tests: 2427 passed,
  3 skipped, 0 failed (new:
  announcements 4 files 18 tests, MessagesPage +1); eslint 0 errors (18 old warnings); `npm run build` ok; functions
  `npm test` 359/359 (new announcements-core.test.js 9); emulator (`firebase emulators:exec --only
  auth,firestore,functions --project demo-keelesepp-finance`, JDK 21) announcements-emulator.integration.js 1/1 (rules
  allow / deny, audience, once, change only when allowed, parent per child, report admin-only) and
  teacher-availability 1/1. Visual check on a local stand page (student, parent at 375 px, home card, admin list /
  form / report); stand not committed.
- Deploy needed (owner): `firebase deploy --only firestore:rules` and functions (`staffOperationsApi`). Until then the
  learner app opens as before (the gate fails open) and the admin page cannot save (rules deny).
- Limits: no e-mail / SMS; a learner without a KeeleSepp account is not in the „Vastused” list; while an announcement
  is open the lesson-invitation pop-up is hidden too (answer first); a student with several cards answers once (the
  first matching card by name is used for „Sobivad ajad”).
- Next safe step: deploy rules + functions, then the administrator publishes a test announcement to a test student.

## 2026-10-24 · agent/calendar-student-times — „Sobivad ajad” in the calendar: overlay, free lesson times, warnings

- Base: `main` 03f8b6e (2026-10-24). Draft PR from `agent/calendar-student-times`. Calendar only (no finance, no content,
  no rules, no functions).
- Asked (owner 2026-10-24): use the students' „Sobivad ajad” when planning teachers' lessons, without overlaps.
- Built (docs/specs/CALENDAR_V2_SPEC.md „Sobivad ajad in the calendar”): `studentTimesModel.js` (pure: student half
  hours × teacher windows × lessons incl. groups × rooms, weekly check 4 weeks, warnings), `StudentTimesPanel.jsx`
  (pick students / Planeerimata õpilased, legend, „Vabad tunniajad” → prefilled „Uus tund”), `TimeGrid` `marks`
  (violet shading, ★ stronger, grey = the student's lesson elsewhere), `CalendarPage.jsx` (loads studentAvailability:
  admin all, teacher own students; warnings in the form, on drag „Tõsta tund?”, on accepting „Ei saa tulla?”),
  `calendarV2.css`.
- Checks: vitest src/features/calendar 18 files / 124 tests passed (+9 model, +3 page tests, 1 test updated: a drag onto
  the teacher's other lesson now asks first); full crm-v2 vitest 344 files: 2411 tests, 2408 passed / 3 skipped /
  0 failed; model tests also under TZ Europe/Tallinn, America/Los_Angeles, Pacific/Kiritimati, UTC; eslint 0 errors
  (18 old warnings); `npm run build` ok. Checked on a local stand page with made-up data (desktop + 375 px), not committed.
- Limits: a teacher does not see another teacher's lessons of the same student (rules unchanged); an /ajad lead is not
  linked to a card on „Õppijaks” (times must be entered on the card).
- Deploy: only the usual Vercel front-end deploy after merge; no rules / functions / data changes.
- Next safe step: the owner tries „Sobivad ajad” in the calendar after merge (pick an unplanned student with times).

## 2026-10-24 · agent/draft-account-suggest — a new entry suggests accounts by number or name

- Base: `main` acd13f9. The accountant (2026-10-24): in a new entry the account cell „не считывает номера
  счетов” — she typed „so” and had to remember the number.
- `AccountInput.jsx` (new): under the account cell of a typed entry a list of open accounts matching the text (number
  from its start, name anywhere, max 8); arrows + Enter / Tab or a click picks one; `JournalDraft.jsx` uses it.
- Checks: vitest src/features/accounting 42/42 (+1 test); eslint clean; `npm run build` ok. UI only.
## 2026-10-24 · agent/kaanded-practice — B2 „Käänete kordamine”: three extra Harjuta sheets on noun cases

- Base: `main` acd13f9 (2026-10-24). Draft PR #783. Content + a small course-gate rule.
- Asked (owner 2026-10-24): homework on noun cases for a B1→B2 learner; „дай все на падежи, а чего нет — сделай”.
- Existing B2 case practice (published): b1b2-006 Harjuta (kohakäänded, täis-/osaalus), 016 (sihitis), 018 (rektsioon),
  026 (olev + saav), 041 (saav). Missing as a sheet at B1+: base cases with plurals, plural locatives + short illative,
  -ni / -ta / -ga.
- Built: `admin/course/b2/kaanded.js` (MODULE `b1b2-kaanded-01`, `supplement: true`, template v4, strict), lessons
  b1b2-k01 (nimetav / omastav / osastav, sg + pl), k02 (kus / kuhu / kust, lühike sisseütlev), k03 (-ni, -ta, -ga);
  Harjuta only. Goals in `b2/lessonGoals.js`. Supplement rule: sheet gates apply; `harnoProblems`, v4 module listening
  and `methodGaps.courseModules` skip a supplement; badge = supplement name (`registry.js`, `quality.js`,
  `methodGaps.js`, tests; docs/B1_B2_COURSE_PRODUCTION.md §6 „Lisaharjutused”).
- Checks: vitest worksheet-generator + worksheet-studio 1195 passed / 0 failed; full crm-v2 2395 passed / 0 failed;
  module report 3/3 READY; EstNLTK: only the suffix „sid” unknown.
- Production (owner's permission): created `curriculumLessons/b1b2-k01…k03` and published their `worksheets/practice`
  v1 (+ worksheetVersions); read back equal to the code. No homework assigned, no deploy.
- Next safe step: review the three sheets in Õppevara (B2 → Käänete kordamine) and merge #783.

## 2026-10-24 · agent/journal-draft-typing — a new entry: Dokument can be typed on any line

- Base: `main` 9a54715. The accountant (2026-10-24, „Документ не ввести”): she clicked the Dokument cell of a
  line in a new entry; it was plain text (only the header row had the input).
- `JournalDraft.jsx`: the Dokument cell of every line is an input bound to the entry's document (typing in any of
  them sets it for the whole entry); a click on a line's Kuupäev focuses the header date.
- Checks: vitest src/features/accounting 41/41 (test extended); eslint clean; typed into header and line cells in a
  local stand page (not committed). UI only.
- Next safe step: the accountant retries after the Vercel deploy.

## 2026-10-24 · agent/algsaldo-trial-balance — Algsaldod = the Algsaldo column of the käibeandmik

- Base: `main` 65149a7. The accountant (2026-10-24): „algsaldo привяжи к algsaldo” — the balances entered with
  „Algsaldod” (entry origin `opening`, dated 2026-01-01) showed in the käibeandmik 01.01–… under Käive, the Algsaldo
  column was empty.
- `accountingReports.js` (`startsPeriod`): in `trialBalance` and `ledger` the opening entry is the start balance of a
  period that begins on or after its date (Algsaldo, not Käive); the Excel export follows (same function).
- `AccountingPage.jsx`: „Algsaldod” opens with the balances already entered; when an algsaldod entry exists, saving
  corrects that entry through `/accounting/entries/update` (reason „Algsaldode parandus”, history kept) instead of
  the create route that refused a second one. The käibeandmik Algsaldo header has „muuda” → the same dialog.
- Checks: vitest src/features/accounting 41/41 (+2 tests); eslint accounting clean; `npm run build` ok. UI only.
- Next safe step: the accountant checks käibeandmik 01.01.2026–… after the Vercel deploy.

## 2026-10-24 · agent/journal-columns — Päevaraamat: column widths; a typed entry that did not save

- Base: `main` 24f7625. The accountant (2026-10-24, screenshots): Dokument column far wider than Kirjeldus
  („Kirjeldus важнее”); a new entry with D = K 25,00 did not save — the button was grey without a reason.
- `accounting.css`: the päevaraamat grid has fixed column widths (Konto 18 %, Kuupäev 9 %, Dokument 14 %,
  Kirjeldus the rest ≈ 39 %, Deebet/Kreedit 10 %), long text wraps.
- `JournalDraft.jsx` + `accountingReports.js` `draftDescription`: an empty „kande sisu” takes the first line note
  (she typed the text on the line); next to the button „Puudub: …” lists what blocks saving (kuupäev, dokument,
  kande sisu, konto summaga real, unknown konto, deebet = kreedit, paranduse põhjus). Server rules unchanged.
- Checks: vitest src/features/accounting 39/39 (+1 test); eslint accounting clean; `npm run build` ok.
- Next safe step: the accountant retries the entry after the Vercel deploy.

## 2026-10-23 · agent/accounting-excel-mode — päevaraamat like Excel (cells, keyboard, paste, „Asenda konto”, undo)

- Base: `main` 7271b5f (2026-10-23). Draft PR #779 from `agent/accounting-excel-mode`. Accounting only.
- Asked (the accountant via the owner): „функциональность и свобода действий как в Excel” in the bookkeeping, keeping
  the legal guarantees (history / audit, period lock, D = K, immutable numbers, no client writes).
- Built (docs/ACCOUNTING.md „Päevaraamat kui tabel”):
  - crm-v2/src/features/accounting/JournalGrid.jsx (new) + journalGrid.js (new, pure): the päevaraamat grid is the
    editor — click / Enter / F2 / typing edits a cell (Konto with chart autocomplete, Kirjeldus, Deebet, Kreedit; a
    manual entry also Kuupäev and Dokument), arrows / Tab / Enter move, Esc cancels, Insert / Ctrl+Shift++ / Ctrl+−
    and „+ / ×” insert and delete lines; an entry is saved through `/accounting/entries/update` when the cursor leaves
    it and D = K, otherwise it stays red with the difference; „Paranduse põhjus” once per session (sessionStorage);
    Ctrl/Cmd+Z undoes the last saved change through the same route; filters Konto / Tekst / Dokument / Summa; header
    click sorts (Excel export follows); Shift+click selection, Ctrl/Cmd+C as TSV; Ctrl/Cmd+V from Excel into an entry;
    read-only without the admin role, on a phone and for locked / storno entries. The „Muuda” mode is gone;
    automatic entries show „ei kustutata” with a tooltip on how to fix them.
  - Paste from Excel into a new manual entry (JournalDraft) and into ostuarve lines (PurchaseInvoiceDraft);
    `parseEuro` reads „1 234,50”, „1.234,50”, „1,234.50”, no-break spaces and „€”.
  - „Asenda konto”: preview (entries, lines, D / K sum, skipped) → new route `/accounting/entries/replace-account`
    (functions/index.js `replaceAccountInEntries`, accounting-core `replaceAccountValues`, `batchTargets`, `chunked`):
    the whole request is refused if one entry is locked / closed month / storno; then the same correctedEntry logic per
    entry in transactions of 100, one history item and one `financialAudit/<requestId>_<entryId>` per entry,
    idempotent by requestId, max 2000 entries; undo with `targets` (exact line indexes). `correctionPatch` is shared
    with `/accounting/entries/update`.
  - crm-v2/src/app/AuthContext.jsx: `useOptionalAuth()` (the page decides read-only without crashing in tests);
    services: `financeApi.replaceAccountingAccount`, `accountingService.replaceAccount`.
- Checks: crm-v2 whole vitest 343 files (342 passed, 1 skipped), 2386 passed, 3 skipped, 0 failed (new: journalGrid.test.js 11,
  JournalGrid.test.jsx 10, PurchasesPage paste 1; AccountingPage tests adapted); eslint 0 errors (18 old warnings
  elsewhere); `npm run build` ok; functions `npm test` 350/350 (2 new core tests); emulator
  (`firebase emulators:exec --only auth,firestore,functions --project demo-keelesepp-finance`, JDK 21)
  finance-emulator.integration.js + security-finance-emulator.integration.js 45/45 (new: replace-account — reason
  required, locked entry refuses all, history + audit, idempotent, undo by targets, closed / unknown account 400,
  teacher 403). Visual check on a local mock page in the Browser pane (desktop edit, reason, save, „Asenda konto”
  preview + apply, Cmd+Z, phone read-only); mock not committed.
- Deploy needed (owner): functions (financeApi: new route; the update route refactored). No rules change. Nothing was
  deployed; no production data was read or written; the 3060 → 3000 move was NOT run.
- Limits: the save happens when the cursor leaves the entry or the grid — closing the tab with a red / unsaved entry
  loses those unsaved edits (the browser does not warn); undo is per session (the stack is lost on reload, the history
  stays); „Asenda konto” works on the entries in view (period, kande kood, filters) and only on open periods.
- Next safe step: deploy functions, then the accountant runs „Asenda konto” 3060 → 3000 for 2026 herself (steps in
  docs/ACCOUNTING.md „How the accountant moves the old sales entries”).

## 2026-10-23 · agent/legacy-paid-invoice — an old invoice marked „Makstud” is not a debt

- Base: `main` 5e6bb54 (2026-10-23).
- Problem: KS-2026-004 (2026-06) has status „Makstud” and paidAt, but no payment records or paid amount (an old
  invoice marked paid by hand), so `financeRowState` counted 60 € as an overdue debt in „Võlgnevused”. The owner
  asked to delete it; an issued invoice is not deleted (number order, audit) — it is paid, so only the debt view was wrong.
- Fix: `crm-v2/src/features/finance/financeRows.js` — status „Makstud” without `payments`, `paidAmountCents` and
  `paidAmount` counts as paid in full; a recorded paid amount still wins. The server already treats „Makstud” as
  paid (no reminders). No data changed.
- Checks: vitest src/features/finance 29 files, 170 passed (+2 new tests in financeRows.test.js).
- Next safe step: after the Vercel deploy, KS-2026-004 is gone from „Võlgnevused”.

## 2026-10-23 · agent/paevaraamat-template — Päevaraamat and käibeandmik like the owner's template; inline entries; sales to 3000

- Base: `main` 5f1c015 (2026-10-23). Draft PR from `agent/paevaraamat-template`.
- Owner's template (Päevaraamat export, PDF) + the accountant's notes (2026-10-23): a plain ruled grid, Excel is the
  main format, no PDF, no rate/currency, Kuupäev before Dokument, separate entries for a sales document and the money.
- Päevaraamat (accountingReports `journalReport`, `entryCode`, `ENTRY_CODES`, `amount`, `dmy`, `COMPANY`): kande kood
  MA / KR / LK / TG / OA / PR / ST / AS with its own running number per year (counted in the CRM number order, so it
  never shifts), filters period + kande kood + järjestus (kande kood or kuupäev), entry blocks with totals,
  „Kokku N kannet”, „M kirjet”, footer company + time + Rg-kood. Screen and Excel (`journalWorkbook`) are the same
  six-column grid: Konto | Kuupäev | Dokument | Kirjeldus | Deebet | Kreedit, every cell bordered, full page width.
- Käibeandmik: screen and Excel (`trialBalanceWorkbook`) — Konto | Nimetus | Algsaldo D/K | Käive D/K | Lõppsaldo D/K
  (two-level header), ruled grid, Kokku.
- Manual entry (JournalDraft.jsx): „Lisa kanne” opens editable rows inside the grid (no dialog); Tab moves cell to cell,
  Tab in the last cell adds a row; saving only when D = K and the accounts exist; same route `/accounting/entries`.
- functions/accounting-core.js: new automatic sales entries credit/debit **3000** instead of 3060. Existing production
  entries are NOT changed (they keep 3060; credit notes / cancellations of old invoices will now use 3000).
- Checks: vitest accounting 15/15; whole vitest 337 files, 2316 passed, 0 failed; eslint (accounting) 0 problems;
  `npm run build` ok; `node --test functions/accounting-core.test.js` 10/10. finance-emulator.integration.js updated
  (3060 → 3000) but not run (needs the emulator). Visual check on a local mock page (not committed).
- Open for the owner: (1) migration of existing 3060 lines to 3000 (a storno + new entry per entry, or a single
  reclassification entry 3060 → 3000 on a date) — not done; (2) 3000's chart name is „Kauba, teenuse müük Eestis 20%”
  although the company is not VAT registered — rename or confirm; (3) which müügitulu accounts to drop (3000–3099
  list in docs/ACCOUNTING.md).
- Next safe step: owner/accountant reviews the Excel files from the draft PR; decide the 3060 → 3000 migration.

### Same PR (#777), part 2 · tarnijad, ostuarved and corrections (the accountant 2026-10-23)

- `origin/main` b8df2c2 (2026-10-23) merged into the branch (conflicts in docs, index.js requires and the emulator
  file resolved; main's new invoice-correction emulator test now expects sales account 3000, as on this branch).
- Asked: (1) „таблица поставщики и путь дальше” — suppliers, purchase invoices row by row like Excel, each booked as
  „OA Ostuarve kanne”, payment as a separate bank entry; (2) „почему проводки нельзя исправлять и удалять” — corrections.
- Built (docs/ACCOUNTING.md „Tarnijad ja ostuarved”, „Parandamine”):
  - functions/purchases-core.js (new): supplierRecord (IBAN mod 97), purchaseInvoiceRecord, purchaseInvoiceEntry (OA:
    D line account „<tarnija> <kirjeldus>”, D 2311 only for `vatDeductible` lines — default off, the company is not
    VAT registered; K 2110 „Arve <nr>”), paymentRecord / supplierPaymentEntry (VM: D 2110, K 1010 or 1000),
    purchaseDocumentRecord.
  - functions/accounting-core.js: correctedEntry, assertDeletable, isLocked, snapshotOf.
  - functions/index.js (financeApi, admin): `/accounting/entries/update`, `/accounting/entries/delete`,
    `/accounting/lock`, `/suppliers`, `/purchase-invoices` (+ `/pay`, `/payment/remove`, `/void`, `/documents`);
    manual entries and stornos now also respect the accounting lock (`accountingSettings/lock`).
  - UI: /finance/ostuarved (PurchasesPage, SuppliersGrid, PurchaseInvoiceDraft; Excel of invoices and suppliers);
    päevaraamat: „Muuda” (inline, JournalDraft edit mode), „Kustuta” (manual, tombstone), „Ajalugu (n)”,
    „Näita kustutatud”, „Sulge periood / Suletud kuni …”; new kande kood VM Väljamakse kanne. The old „Kulud” page is an
    archive (no new costs; Finantsid button „Kulud” → „Ostuarved”).
  - Data: new collections `suppliers`, `purchaseInvoices`, `accountingSettings`; entries get `history`, `override`,
    `original`, `deleted*`. Rules: admin read, no client writes; storage `financial/purchase-invoices/**`.
- Checks (after merging main): `node --test` in functions 348/348; emulator (`firebase emulators:exec --project
  demo-keelesepp-finance`, JDK 21) finance-emulator.integration.js + security-finance-emulator.integration.js 44/44 (new test: suppliers,
  OA / VM entries, invoice edit with history, payment remove, override needs reason, manual edit / delete with
  history, lock blocks edit / delete / new invoice, storno after the lock, reopen needs reason, client writes 403);
  crm-v2 vitest 340 files, 2363 passed, 0 failed; eslint 0 errors; `npm run build` ok. Visual check on a local mock page
  (not committed).
- Deploy needed (owner): functions (financeApi), firestore.rules, storage.rules. Nothing was deployed; no production
  data was read or written.
- Limits / owner decisions: VAT „maha” only if the company registers for VAT; an override of a purchase entry's
  amounts in the päevaraamat does not change the invoice (correct on Ostuarved); the sync can still book a sales
  document dated in a locked period; old `expenses` entries stay as booked (expense / bank, no 2110).
- Next safe step: deploy functions + rules, then the accountant enters one real supplier invoice (Senty Studio OÜ
  1575) and checks the OA / VM entries in the päevaraamat Excel.
## 2026-10-23 · agent/lhv-request-v2 — LHV LinkPay production request (refresh of PR #554)

- `docs/LHV_PRODUCTION_REQUEST.md` from #554 on current main, now with the invoice volume (read-only count from
  production `invoices`: about 20 invoices a month, average about 100 €). Letter not sent — the owner sends it and
  chooses the contact phone (+372 5374 0753 personal or +372 5434 4155 public). LinkPay code stays in test mode
  until live keys exist and the owner allows the switch.
## 2026-10-23 · agent/pet-course-games-v2 — lemmiku mängud kursuse töölehtedest (PR #518 uuesti main'il)

- Base: `main` 5f1c015 (2026-10-23). Branch `agent/pet-course-games-v2`, draft PR (supersedes #518, which stays open).
- #518 cherry-picked (pet.css: Sorteeri/Arva sõna styles + the pet reactions of main kept). Topic games also use the
  published course sheets of the last 4 attended lessons (`lessons.topicLessonId`, `courseTopics()`); `transformation`
  → „Lauseehitus”, `dialogue` gaps → „Püüa sõna”; new games „Sorteeri” (`categorize`) and „Arva sõna” (crossword,
  vocab, match clues; Estonian keyboard).
- New on top of #518 (`pet/petGames.js`): the „Õpik” sheet (`TEXTBOOK_SHEET_ID`, by record id or `meta.phase`) is never
  game material (licensed content); `cloze` option gaps → „Püüa sõna” with the gap's own options, sentence by sentence;
  „Sorteeri” cards ≤ 3 words, a group made mostly of longer items is dropped; „Arva sõna” only on Estonian sheets
  (`meta.language`, else lesson id `en-…` = English).
- Guard test `pet/petGamesCourse.test.js`: every non-assessment lesson of the Estonian courses (A2, B1, B2, C1, ek9;
  312 lessons from `COURSE_MODULES` / `moduleSheets`) gives ≥ 2 games. Coverage: 786 of 936 sheets playable; lessons
  per game catch 311, order 308, truth 232, guess 186, pairs 127, sort 50; 101 lessons with 5–6 games; 1834 cloze rounds.
- Unchanged: games only fill the pet's joy (`playedAt`), no XP, nothing written; no rules/functions changed.
- Checks: vitest pet 54/54; whole vitest 2321 passed, 3 skipped, 0 failed; eslint `src/features/pet` clean; `npm run build` OK.
  Not checked in a browser in this round.
- Next step: owner tries the games with a test student who has an attended lesson with an Õppevara topic, then merges.
## 2026-10-23 · agent/finance-debt-actions-v2 — „Muuda” and „Tühista” in the debts list (replaces PR #368)

- Base: main 5f1c015 (2026-10-23). Draft PR to main; supersedes the old PR #368 (left open for the owner to close).
- Võlgnevused (FinanceDebtsPanel, Finance → Laekumata): each past-month debt has „Muuda” — with a reason of 10+ chars
  the admin (a) corrects the due date (financeApi.correctInvoiceDueDate → staffOperationsApi `/data-quality/invoice-due`,
  server keeps dueDateHistory + audit) or (b) credits ONE lesson line as a separate credit note (existing
  `/invoices/credit-lesson-line`). (b) is disabled with an explanation for invoices without lesson lines (monthly
  multi-subject invoices) and hides already credited lines (`correctedLessonIds`). Invoice amounts are never overwritten.
- „Tühista” in the debts list uses main's rule and dialog (PR #640: sent unpaid invoices with a confirmation, lesson
  tokens); canCancelInvoice + invoiceWasSent moved unchanged from FinanceMonthPage.jsx to finance/invoiceActions.js.
- financeRows.js: `due` (what the server corrects) now wins over the legacy `dueDate` snapshot (state + sorting).
- financeDebts.css: at ≤680 px each debt is a card (no sideways scroll at 375 px).
- Checks: vitest src/features/finance 29 files / 159 passed; full vitest 338 files passed (2330 tests, 3 skipped);
  eslint on changed files 0 errors (1 old warning); npm run build ok. Mocks only — no production, no deploy.
- Owner decisions 2026-10-23 (both YES) built in the same PR — an issued invoice is never overwritten:
  - „Krediteeri kogu arve”: financeApi `/invoices/credit-full` (admins; `creditInvoiceInFull` in functions/index.js) →
    one credit note (`creditNotes/{requestId}`, `kind: full_credit`, KN number) for the open amount (original −
    earlier lesson-line credits); invoice keeps `amount`/`amountCents`, gets `creditedAmountCents = original`,
    `effectiveAmountCents/balanceDueCents 0`, `status: Krediteeritud`, `correctionStatus: fully_credited`,
    `fullCreditNoteId`; still-billed lessons → `billingStatus: credited`; pending package invoice → `tokenStatus:
    voided` (`creditBlocker` now refuses voided/credited invoices). Audit `invoice.fully_credited`.
  - „Paranda summa või maksja”: `/invoices/correct` (`correctIssuedInvoice`) in ONE transaction: the same full
    credit note (`kind: correction`) + new invoice `invoices/correction_{requestId}` with the next KS number, same
    lines/subject/student, corrected payer (`payerName/Email/RegCode/Address`) and/or amount (an extra
    `amount_correction` line with the difference), fresh payment/e-mail state, due = given date or today;
    `correctionOf` on the new invoice, `correctedBy` + `correctionStatus: corrected` on the old one; lessons move
    to the new invoice (`previousInvoiceIds`). Audits `invoice.corrected_credit` + `invoice.created_correction`.
  - Refusals (409): cancelled, already fully credited or corrected, any active payment (void/refund first), package
    lessons already on the card; amount change of a lesson-linked invoice (credit the line instead). Reason ≥ 10
    chars (400). Idempotent by requestId (same payload → 200 `idempotent: true`, other payload → 409).
  - Works for old debts that „Tühista” cannot close (no `billingMode`, euros only, `lessonIds` without lesson lines,
    partially credited, failed e-mail — e.g. KS-2026-004/-030/-049/-050); old lessons without `billingStatus`
    are credited too. Only today's date must be in an open period (the credit note is dated today).
  - Pure rules: functions/invoice-correction-core.js (+ test). Bookkeeping needs no new code: the next
    `/accounting/sync` books the credit note (3060 → 1200) and the new invoice (1200 → 3060).
  - UI: „Muuda” dialog of Võlgnevused → section „Kogu arve parandamine” with both buttons (or the reason why not)
    → InvoiceCorrectionDialog.jsx (shows what will be created, reason, confirmation checkbox); the same two buttons
    in the old invoice detail (FinancePage, /finance/vana). financeApi: `creditInvoiceInFull`, `correctIssuedInvoice`.
    No Firestore rules change (server-only writes, admin check in financeApi).
- Checks (2026-10-23, after the corrections): functions `npm test` 341/341; emulator `npm run test:emulator`
  (auth+firestore+functions, demo project, Java 21) 92/92 incl. the new route test; crm-v2 vitest 338 files /
  2339 passed, 3 skipped; eslint on changed crm-v2 files 0 errors (1 old warning); `npm run build` ok.
- Deploy needed: A and B work only after `firebase deploy --only functions:financeApi` (owner's decision); the
  UI shows the buttons before that but the calls would fail with 404. No production data was touched.
- Open: which old debts to clear is the owner's call in the UI after deploy (nothing changed in data); a monthly
  invoice credited in full (A) still counts as that month's invoice for „Koosta kuuarve” — use B to reissue.
- Next safe step: owner reviews the PR preview (Finance → Laekumata → Muuda), merges, deploys financeApi; then
  credits the old debts one by one with a reason; close #368.
## 2026-10-23 · agent/library-subject-tabs — Õppevara: subject tabs above the levels

- Owner: „надо добавить вкладку предмета”. Õppevara shows „Kõik ained · Eesti keel · Emakeel · Inglise keel” tabs
  (URL `?aine=et|ek|en`) above the level chips; the tab narrows levels, modules, types and results. The subject is
  read from the item's level label (`libraryModel.js` `subjectOfLevel`, `subjectFacets`, `SUBJECTS`; + test).
- Files: `library/LibraryPage.jsx`, `library/libraryModel.js` (+test), `library/libraryWorkspace.css`.
- Checks: library tests 49 passed; build OK.

## 2026-10-23 · agent/page-menu-fix — the board page ⋯ menu was hidden under the lesson room

- Owner 2026-10-23 (screenshot): the ⋯ button next to the open page did nothing. The menu (rename, give to the
  student, delete) is rendered into document.body (85a9587, 20.10) with z-index 50, under the full-screen lesson room
  and workspace (.lr, z-index 1300). board.css: .sb-page-menu z-index 1400 (the word card 1450 and the sentence dialog
  1500 were already above the room).
- Checks: verify (eslint errors 0, vitest all passed).

## 2026-10-23 · agent/sheet-text-analysis — „Analüüs” in the mark composer of a worksheet

- Owner 2026-10-23 (screenshot of the live lesson, a letter selected on the sheet): „тут тоже должна быть функция
  анализа текста”.
- SheetAnnotations `analysis` ({ level }): when the teacher selects 5+ words, the composer has a tab „Analüüs”
  (TextAnalysisPane) — the same school-Mac check as in the homework review („learnerText”: TartuNLP corrections + EKI
  levels). Each correction: „Märgi” → a „Viga” mark on its own words (start/end found in the selection) with the
  corrected text, and (checkbox, default on) a sentence in the student's „Minu vead”; „Märgi kõik vigadeks”.
- On in LiveWorksheetView (lesson board, both views) and in the editable homework review (DocWorksheetSubmissionPreview).
- Checks: verify (eslint errors 0, vitest 2312 passed, 0 failed). The school Mac answered learnerText today (4 done).
- Limit: needs the school Mac on (as in the homework review).

## 2026-10-23 · agent/observer-speak — „Räägi kaasa”: the administrator joins the lesson call and speaks

- Owner 2026-10-23: „чтобы я мог зайти на урок к учителю и что то говорить тоже, как будто групповой созвон”.
- The observer („Vaata tundi”) already had one connection to the teacher and one to the student (receive-only). Now
  LiveObserverPage has „Räägi kaasa”: the admin's microphone (and camera if there is one) is opened and both
  connections are offered again with sendrecv tracks (useObserveLesson `localStream`); mute button, „Ainult vaatan”
  goes back to watching. The participant side (useObserverPeers) keeps the observer's tracks (`streams`); LiveRoom plays
  them (ObserverMedia: audio always, a small tile while the video is shown). Teacher ↔ student stays the 1:1 call.
- No rules change: observerSignals already carry any SDP.
- Files: live-classroom/useLessonObserver.js, LiveObserverPage.jsx, ObserverMedia.jsx, LiveRoom.jsx, liveRoom.css,
  lessonObserver.test.jsx.
- Checks: verify (eslint errors 0, vitest 2309 passed, 0 failed). Not tested live with three real devices yet.
- Limit: works only when the lesson runs on the CRM call; a lesson held in Google Meet has no CRM video to join.

## 2026-10-23 · agent/board-past-sheets — HOTFIX: worksheet pages of earlier lessons were empty

- Owner 2026-10-23 (screenshots, Arseni): every „Tööleht: …” page on the board showed „Tühi tahvel”. Cause: a sheet is
  bound to the lesson room it was opened in (worksheetAssignments.liveRoomKey), its board page stays forever, but the
  board looked for sheets of the current room only (TeacherWorkspace: `prep_<student>`; LiveRoom: this invitation).
  Production read: Arseni's sheets carry the room key of the 19.10 lesson. No data was lost.
- homework.subscribeStudentLiveWorksheets(studentId): all the student's sheets ever opened on a lesson board.
- live-classroom/usePastSheets.jsx → StudentBoard `pastWorksheets`: a page finds its sheet among them too (this
  lesson's sheets first); they never take over the board. Wired in TeacherWorkspace, LiveRoom (not for guests) and
  StudentWorkspace.
- Checks: verify (eslint errors 0, vitest 2306 passed, 0 failed); regression test in board.test.jsx.
- Known: the duplicate tabs „Tööleht: Kontroll 1 — igapäevaelu” are separate pages; they now all show the newest sheet
  with that title. Cleaning them up is manual (⋯ → Kustuta).

## 2026-10-23 · published: v4 courses in Õppevara (production)

- After #764: 585 sheets published (B1 modules 2–18, B2 modules 1–18, A2 modules 1–4); second dry run: all same.
- After #766: A2 modules 1–8 — 108 sheets published, 12 already the same; second dry run: all 120 same.
- Publish script: manual CRM edits are skipped (none found), old versions stay in `worksheetVersions`.
- Owner stopped the goal („стоп цель”). Not done: A2 modules 9–20, C1 modules 1–10, the v4 pass of the exam lessons,
  art briefs for the new storylines (`docs/COURSE_REVIEW_LOG.md`).

## 2026-10-23 · agent/a2-c1-v4 — A2 modules 5–8 in template v4, A2 lesson goals 1–4

- A2 modules 5 (city), 6 (food), 7 (shopping; numbers in cases), 8 (services; impersonal present) rewritten in v4;
  exams unchanged; old files in `archive/v3/a2/`. `a2/lessonGoals.js`: sub-goals of modules 1–4 describe the v4
  sheets. Audio for the new listening blocks (TartuNLP), stale recordings removed.
- Stopped by the owner („стоп цель”): A2 modules 9–20 and C1 stay in v3; unfinished drafts of A2 9–11 were discarded.
- Checks: worksheet-generator + worksheet-studio 1188 passed. Publish after merge.

## 2026-10-23 · agent/b1-v4-course — courses in template v4: B1 2–18, B2 1–18, A2 1–4 (merge and publish)

- Owner: „подгони курсы до финального вида…”, then „закончить цель, то что готово выложить”.
- This branch contains PRs #740, #745, #746, #750 and the standard from #744, merged with main 16593cc.
- Rewritten in template v4 (old files in `archive/v3/`): B1 modules 2–18 (B1 grammar plan complete), B2 modules 1–18
  (B2 grammar plan complete), A2 modules 1–4. Exams (assessment lessons) unchanged. Lesson goals of B1 and B2 updated.
- Not done: A2 modules 5–20, C1 modules 1–10, a v4 pass of the exam lessons, new art briefs (many pictures show the
  wrong characters). Remaining gaps are listed in `grammarPlan.test.js` and `methodGaps.test.js`; per-lesson ideas in
  `docs/COURSE_REVIEW_LOG.md`; cast in `docs/COURSE_CAST.md`.
- Checks: full crm-v2 vitest 2305 passed, 3 skipped; build OK; language check (EstNLTK) on rewritten modules.

## 2026-10-23 · agent/b1-v4-course — B1 modules 3, 4, 6–11 in template v4

- Stacked on agent/b1-m2-v4 (PR #750). Owner goal: „подгони курсы до финального вида и после каждого урока продумай,
  что можно улучшить”. Modules rewritten (exams unchanged, old files in `archive/v3/b1/`): 03 (adjective suffixes),
  04 (particle verbs), 06 (total / partial object), 07 (translative of change), 08 (verb government), 09 (ma-forms with
  case endings), 10 (pluperfect), 11 (participles as attributes). Each: one storyline with the cast
  (`docs/COURSE_CAST.md`), a module goal and final project, review at every lesson start, one-to-one notes, ≥ 2
  listening tasks, almost no errorfix / translation / dictation.
- `grammarPlan.js`: 7 more B1 items taught (B1 gaps left: quotative → module 13, completion → 14, jussive → 15).
  `methodGaps.test.js`: listening gaps left in B1 12, 14, 15; no recycling gap.
- Audio: new listening blocks recorded (TartuNLP, free), 11 stale recordings removed; voices know the new characters.
- `docs/COURSE_REVIEW_LOG.md`: per-lesson improvement notes (pictures, real documents, real voices, cast clashes);
  `docs/METHODOLOGY_STANDARD.md` copied from PR #744 so agents can read it.
- Checks: worksheet-generator + worksheet-studio — 1079 passed, 3 skipped. Not published.
- Open: `b1/lessonGoals.js` sub-goals of the rewritten lessons are still the old ones; B1 modules 12–18; exams' v4 pass.

## 2026-10-22 · agent/b1-m2-v4 — B1 module 2 in template v4 with kes/mis relative clauses

- Stacked on agent/method-gates-2 (PR #746). Owner: build the missing B1 grammar into the existing modules.
- `b1/module02.js` (a2b1-006…009; exam 010 unchanged): Jaan's family storyline, goal = a surprise party for Helgi's
  60th (009 Kasuta). New B1 grammar: kes/kellel/keda/kellega clauses (007), mis/mida/mille clauses for things (008).
  Every Avasta opens with „Mäletad?”, every pair / group task has a one-to-one note. Errorfix, translation and dictation:
  0 (v3 file: many). Old file in `archive/v3/b1/module02.js`.
- `grammarPlan.js`: b1 relative → a2b1-007, a2b1-008 (one gap less). `methodGaps.test.js`: a2b1-module-03 now in the
  recycling gaps (it uses < 30 % of the new module 2 words) — fixed when module 3 is rewritten.
- Audio: 4 new MP3 (TartuNLP, free), 2 old removed; `tools/listening-audio/plan.mjs` knows the voices of Mia, Helgi,
  Maie, Kertu, Oskar, a teadustaja and a turvatöötaja.
- Checks: worksheet-generator + worksheet-studio — 1079 passed, 3 skipped. Not published.

## 2026-10-22 · agent/method-gates-2 — methodology gates: listening, recycling, exam formats, v4 time rates

- Stacked on agent/method-gates (PR #745).
- `admin/course/methodGaps.js` (+ test): per course — listening ≥ 2 a module, vocabulary blocks, recycling of the
  previous module's vocabulary (word stems, ≥ 30 %), Harno exam formats trained at least once (rough block tests).
  A v4 module must have no gap; older modules' gaps are listed in the test (listening: 15 modules; recycling:
  a2b1-module-04; A2 and C1 have no vocabulary blocks). All exam formats are met somewhere in every course.
- `timeEstimate.js`: v4 sheets count meaning items as reading + deciding (choice .4, true/false .3, match .35,
  categorize .25, crossword .45, scheme gap .5, card gap .5 min); `depth.js` and `quality.js` pass the template.
  Older templates unchanged.
- Checks: worksheet-generator + worksheet-studio tests all pass. Not published.

## 2026-10-22 · agent/method-gates — methodology gates: review, one-to-one, grammar plan

- Stacked on agent/b1-m5-v4 (PR #740); standard in PR #744 (docs/METHODOLOGY_STANDARD.md §7.1).
- v4 gates (`quality.js`): `v4-review` (Avasta begins with „Mäletad?”, `B.review`, not counted as a task),
  `v4-one-to-one` (a pair / group task or a role play has a teacher note `teach(block, …)`).
- Teacher's key (`engine/answerKey.js`, `AnswerKeyView.jsx`, css `.ws-key-note`): open tasks with a note are listed
  under „Õpetajale”, tasks numbered as on the sheet.
- `admin/course/grammarPlan.js` (+ test): the grammar inventory of A2 / B1 / B2 / C1 (handbooks) mapped to lessons;
  23 known gaps listed in the test (B1: 11, planned into modules 02–15).
- B1 module 5: four „Mäletad?” reviews, 16 one-to-one notes.
- Checks: `npx vitest run src/features/worksheet-generator src/features/worksheet-studio` — all pass (after the update
  of the v4 tests). Not published.
- Still planned (§7.1): word recycling across modules, time-estimate recalibration, listening ≥ 2 for every template,
  exam-format coverage per level.

## 2026-10-22 · agent/b1-m5-v4 — sample module in lesson template v4 (variety and situations)

- Owner: „много заданий типа диктант, исправление ошибок… разнообразия не хватает, ситуаций не хватает”; „сделаем образец
  одного модуля”. Checked `main` efd80db (2026-10-22).
- B1 module 5 (a2b1-021…024) rewritten as the v4 sample; 025 (exam) unchanged. One storyline (Markus, Anna, Jaan,
  Sofia, Liis, Viktor), goal on the first sheet, final Kasuta = story for a contest. New task kinds in use: detective
  cards + interview, information gap, timeline, find-someone-who, predict from the picture then listen, doctor's
  appointment, radio interview. Errorfix 1, translation 0, dictation 0 in the module (v3: 11 / 9 / 5).
- Files: `admin/course/b1/module05.js`, `archive/v3/b1/module05.js` (old file), `quality.js` (+test: `fullerTemplate`,
  `v4Problems`, `v4ModuleProblems`), `worksheet-studio/didactics/depth.js` (v4 = v3 sizes), `listeningAudio.json` +
  5 new MP3 in `public/audio/a2b1-02x/` (TartuNLP, free), removed `022_d_voice.mp3`, `docs/COURSE_DESIGN_COMMUNICATIVE.md` §12.
- Checks: `npx vitest run src/features/worksheet-generator src/features/worksheet-studio` — 113 files, 1064 passed,
  3 skipped; module 5 stays in `strictModules.json` and passes every gate. Other modules unchanged (v4 rules only for
  `template: 'v4'`).
- Not published to Õppevara (production). Screenshots were sent to the owner.
- Next safe step: owner reviews the sample; on „да” merge, publish module 5 with the publish script, then rewrite the
  other B1 modules in v4.
## 2026-10-23 · agent/last-seen-list — „sees eile” in the students list and the last visit in „Riskis õpilased”

- Owner 2026-10-23 („давай”) after #762.
- presence.js: `forStudents(students)` reads the own accounts of many students at once (users, documentId in ≤30),
  `accountUid` (card or any card of a person), `lastSeenOf` (newest of the visit and the last „Minu vead” day).
- „Õpilased”: „· sees eile” after the student's line (desktop and phone), loaded after the list; failures show nothing.
- „Riskis õpilased” (retentionRisk `seen`): „Minu vead” days count as own practice; once a visit is recorded, „pole N
  päeva sisse loginud” (no practice for 14 days, or no visit for 21 days). Fixed: the new-student rule („only the
  calendar gap counts”) now checks that the gap is the only reason instead of comparing the score.
- No rules change (staff already read accounts); emulator test added: a teacher lists accounts, a student cannot.
- Checks: verify (eslint errors 0, vitest 2290 passed, 0 failed); emulator presence tests 2/2.

## 2026-10-23 · agent/last-seen — „Viimati sees” and „Minu vead” results in the database for the teacher

- Owner 2026-10-23: „Да, делай вход и Kordamine в базу” (yes to the rules change and its deploy).
- firestore.rules `validPresence` (in safeSelfUserFields): a user may write on his own account `lastSeenAt` only as the
  server time (serverTimestamp) and `practice` { errorsDate YYYY-MM-DD, errorsPct int 0–100, days list ≤ 60 }.
  Emulator test functions/student-presence-emulator.integration.js (in the financial-core-emulator workflow).
- services/firebase/presence.js: `markSeen` after sign-in for approved students and parents, at most every 6 h (errors
  ignored); `savePractice` after a „Minu vead” drill (MistakesPage; the browser copy stays as before); `forStudent`
  reads the card's own account for staff.
- „Õpilase pilt” (LearnerSnapshotCard / learnerSnapshot.js): „Viimati sees” (or „kontot pole” / „andmeid veel pole”)
  and „Minu vead: täna · 80% · N päeva 30 päevaga”; the reviews count as own study for „Pole iseseisvalt õppinud”.
  The student's home and „Minu vead” also take today's result from the account (another device).
- Checks: verify (eslint errors 0, vitest 2285 passed, 0 failed); emulator rules tests presence + pet green.
- Until the rules are deployed the writes fail silently and the teacher sees „andmeid veel pole”.

## 2026-10-23 · agent/course-official-only — „Minu kursus” shows only the course; a flaky pet test fixed

- Production check (read-only, 2026-10-23): Liudmila's card is active, self-study, level B2. Her B2 course map showed
  18 course modules plus 4 old hand-made library modules (11 B2 lessons without `roadmapManaged`, some named after
  other students — „Konstantin”, „Nika”, „Veronika” — and 7 without sheets). The 90 course lessons have all 270 sheets
  published.
- self-study/StudentCoursePage.jsx: `courseLessons` keeps only `roadmapManaged` lessons (falls back to all when the
  library has none).
- pet/companion.test.jsx: the invitation mock re-delivered an empty list when the companion re-subscribed (after the
  pet loaded), wiping the invitation pushed by the test — CI failed „announces a lesson invitation by itself”. The
  mock now re-delivers the current list, as Firestore does.
- Checks: verify (eslint errors 0, vitest 2274 passed, 0 failed); pet tests 3 runs in a row green.
## 2026-10-23 · agent/daily-reminder — „Tuleta mulle iga päev meelde”: a daily reminder for „Päeva 5 minutit”

- Owner 2026-10-23 („делай дальше”): students forget to practise between lessons.
- On „Minu sõnad” (when the student has words) a small row: choose a time, „Lisa telefoni kalendrisse” downloads a
  daily repeating calendar event (.ics, floating local time, alarm at the start) whose link opens
  /student/sonavara?paev=1. The phone reminds; the CRM sends nothing and the file holds no personal data. The chosen
  time is remembered in the browser only.
- Files: vocabulary/dailyReminder.js (+test), vocabulary/DailyReminder.jsx (+test), VocabularyPage.jsx, vocabulary.css.
- Checks: verify (eslint errors 0, vitest 2276 passed, 0 failed).
- Not done: the teacher's „last login” needs a `lastSeenAt` self-write allowed in firestore.rules (a rules deploy —
  waits for the owner's yes). Until then the teacher sees „last practised” in „Õpilase pilt”.
## 2026-10-23 · agent/auto-mark-lesson — „Märkimata tunnid”: past lessons without a journal mark on the dashboard

- Why: progress, retention, month steps and the parent report read the lesson journal; a production read (2026-10-23,
  read-only) found 71 past calendar lessons of the last 14 days with no journal record (66 events, most of them one
  teacher's one-off lessons). Live Classroom lessons started from the calendar were already marked via the handoff.
- calendar/unmarkedLessons.js: individual (not group) calendar lessons of the last 14 days still „Planeeritud” with no
  journal record (matched by scheduleId+date or studentId+date), teacher-scoped for teachers.
- calendar/UnmarkedLessonsCard.jsx on the dashboard (above the agenda, hidden when nothing is unmarked): „Toimunud”
  in one click (lessonsService.completeFromSchedule — the same write as the calendar, with activityLog), „Muu…” opens
  the lesson in the calendar for absences (their billing choice stays there).
- Files: calendar/unmarkedLessons.js (+test), calendar/UnmarkedLessonsCard.jsx (+test), retention/retention.css,
  dashboard/DashboardPage.jsx. No rules, functions or data changes.
- Checks: verify (eslint errors 0, vitest 2277 passed, 0 failed).
- Next: a student daily reminder for „Päeva 5 minutit” and the teacher's „last seen”.

## 2026-10-23 · agent/self-study-course — „Minu kursus” for students (self-study cards open the sheets themselves)

- Owner 2026-10-23: a self-study course is needed, no certificate.
- New page /student/kursus (student menu „Kursus”; it used to redirect to „Minu vead”): the course of the student's
  level module by module (buildTopicCatalog), each lesson's Avasta / Harjuta / Kasuta with his progress
  (selfStudyModel.progressMap), the next lesson on top. A self-study card (`isSelfStudent`) starts a sheet itself
  (homework.createSelfStudy — already allowed by the rules: own card, the published sheet, unscored at the start) and
  does it in place (WorksheetPlayer); a student who learns with a teacher sees the map and progress, the sheets stay
  for the lesson (owner 2026-10-12). Done sheets open for review for both.
- Files: self-study/StudentCoursePage.jsx (+test), selfStudy.css, app/routes.jsx, app/navigation.js (+test updated).
- Checks: verify (eslint errors 0, vitest 2273 passed, 0 failed).

## 2026-10-23 · agent/monthly-report — „Kuu aruanne vanemale” sent by the admin

- Owner 2026-10-23: the admin presses „send” after checking; never automatic.
- learner/monthlyReport.js (+test): the last 30 days in Estonian then Russian — lessons held and absences, words learned
  this month / total / new, the month's lesson steps mastered, homework done, and the two steps to practise next.
- Student card (admins only): MonthlyReportCard (+test) „Koosta aruanne” → the admin edits the text → „Saada vanemale”
  with a confirmation → an internal message in the student's conversation (messagesService.send, „Suhtlus”, the family
  sees it; activityLog records it). No rules or functions change.
- Checks: verify (eslint errors 0, vitest 2271 passed, 0 failed).

## 2026-10-23 · agent/placement-test — „Paigutustest”: a 15-minute entry test with a level suggestion

- Owner 2026-10-23: build the entry test. placement/placementTest.js (+test): 30 Estonian multiple-choice questions,
  six per level A1 → C1 (written for KeeleSepp), each level a goal of the sheet, so the normal auto-check gives a result
  per level; the suggested level is the highest passed (≥ 60 %) with every level below passed; under A1 → „algaja”.
- Student card → Esmane hindamine: PlacementCard (+test) sends it as a normal worksheet assignment (lessonId
  `placement-et`, libraryService.assign; the student does it in „Kodutööd”) and shows the latest result per level and
  the suggested level. The card's level stays the teacher's decision (as for the initial assessment).
- Files: features/placement/*, students/StudentProfilePage.jsx. No rules change.
- Checks: verify (eslint errors 0, vitest 2269 passed, 0 failed).
- Not yet: an English placement test (the English courses would need their own items).

## 2026-10-23 · agent/month-steps — „Kuu sammud”: the month's goal is the lessons' own steps

- Owner 2026-10-23: the monthly goal is the mini-steps of the lessons themselves and how well they are mastered.
- learner/monthSteps.js (+test): the „Ma oskan …” goals (worksheetDoc.meta.goals) of the sheets a student worked on in
  30 days, the three sheets of a lesson together (lessonTitle), mastery from score.perGoal: Selge ≥ 80 %, Harjuta veel
  50–79 %, Kordame < 50 %, Veel tegemata (no result yet). MonthStepsCard (+test) on the student's home, per child on the
  parent's home, and in the teacher's „Õpilase pilt”.
- Checks: verify (eslint errors 0, vitest 2265 passed, 0 failed; WorksheetStudioPage.test failed once under load and
  passed alone twice and in the repeated full run).

## 2026-10-23 · agent/teacher-report — „Õpetajate võrdlus” (administrators only)

- Owner 2026-10-23: the teacher comparison is for the administrator only. On „Õpetajad” an admin sees, per active
  teacher over 30 days: students, lessons held, share missed (absences + cancellations), students practising on their
  own (words reviewed in 14 days, of those with words), submitted sheets with the average result (≥ 3 sheets), new words
  per student. Too little data shows „—”. Teachers opening the page do not see it.
- Files: teachers/teacherReport.js (+test), TeacherReportCard.jsx, TeachersPage.jsx (+test).
- Checks: verify (eslint errors 0, vitest 2263 passed, 0 failed).

## 2026-10-23 · agent/progress-stats — „Minu sõnad ja vead”: plain progress for the student and the family

- docs/LEARNER_PROFILE.md step 4. vocabulary/wordGrowth.js (+test): words learned (box ≥ 3), new in 30 days, own
  mistakes fixed („Sinu lause” cards in box ≥ 3). WordGrowthCard (+test) on the student's home under „Minu areng” and,
  per child, on the parent's home (ChildrenWordGrowth, live like „Minu sõnad”). Estonian with a Russian line.
- Checks: verify (eslint errors 0, vitest 2261 passed, 0 failed).

## 2026-10-23 · agent/personal-sheet-errors — the personal worksheet works on the student's own wrong sentences

- docs/LEARNER_PROFILE.md step 3. „Isiklik tööleht” (student card → AutoSkillsCard) now also takes his unlearned
  „Sinu lause” cards (wrong sentences from submitted sheets and lessons, box < 3) next to the lesson-recording errors →
  „Leia ja paranda viga”, gaps, word forms; sentence cards no longer appear in its word list.
- Files: students/personalWorksheet.js (+test). Checks: verify (eslint errors 0, vitest all passed).

## 2026-10-23 · agent/sheet-error-cards — a worksheet's wrong sentences become the student's cards

- Main checked: after #749. docs/LEARNER_PROFILE.md step 2.
- When a student submits a worksheet, up to 5 wrong answers that make a whole sentence become his review cards in the
  „Minu vead” format (word = the right sentence, translation = „Sinu lause: …”): a wrong gap rebuilds its sentence with
  the other gaps right; a task whose right answer is a sentence (rewrite, correct, translate) gives that sentence.
  Empty answers and one-word answers make no card; a sentence he already has is not added twice. They come back in
  „Minu vead” and in „Päeva 5 minutit” (≤ 2 sentences a day). Staff opening a sheet add nothing.
- Files: worksheet-studio/engine/errorCards.js (+test), DocWorksheetPlayer.jsx (+test), services/firebase/studentWords.js
  (`addSheetErrors`). No rules change (a student may create his own words).
- Checks: verify (eslint errors 0, vitest 2257 passed, 0 failed).
- Next: the next worksheet gets 2–3 tasks on what this student gets wrong (LEARNER_PROFILE step 3).

## 2026-10-23 · agent/voice-task — „Häälülesanne”: speaking between lessons

- Main checked: 15a2343+ (all earlier PRs merged). docs/LEARNER_PROFILE.md roadmap, speaking practice.
- A homework can be a voice task (`kind: 'voice'`, `prompts` ≤ 3): the teacher ticks „Häälülesanne” in Kodutööd → Uus
  kodutöö (with helper questions) or in the Live Classroom homework panel. The student sees the questions and
  „Salvesta vastus”: records up to 2 minutes (MediaRecorder), listens, sends — the file goes with the answer
  (`submitAnswer`, homework/{studentId}/…; storage rules allow audio) and the task is done. Audio answers play in the
  task list for the teacher and the student.
- No rules change: staff create homework freely; the student writes only `studentFiles`/`status` as before.
- Files: homework/VoiceAnswer.jsx (+test), voiceTask.js (+test), HomeworkPage.jsx (+tests), reviewLayout.css,
  live-classroom/LessonHomeworkPanel.jsx, services/firebase/homework.js (`createFromLesson` voice).
- Checks: vitest crm-v2 all green. The browser pane blocks the microphone, so recording is tested with a fake recorder.
- Next: transcribe voice answers on the school Mac (like lesson recordings) and feed errors into the learner profile.

## 2026-10-23 · agent/english-published — English A2 and B1 are in Õppevara

- Main checked: 15a2343 (all of #732–#743 merged with the owner's yes, Vercel production deployed).
- Owner: „Делай все” (after „скажите «публикуй английский»”). Production write, create-only: curriculumLessons
  en-a2-011…050 and en-b1-016…050 (75 records; the 25 existing ones skipped), then 225 sheets published from
  buildCourseSheet (scratchpad publish script: a sheet edited by hand in the CRM or left as a draft is never
  overwritten; 0 such). A second dry run: 300 sheets, all equal to the code.
- Both English courses are complete in Õppevara: A2 50 lessons, B1 50 lessons, 300 sheets.
- Next safe step: voice task between lessons (docs/LEARNER_PROFILE.md roadmap).

## 2026-10-23 · agent/english-a2 — English A2 modules 3–10: the A2 course is complete

- Main checked: ab99b9b (2026-10-22). Branch agent/english-a2, draft PR #733 (stacked on #732, B1).
- Modules (all with Russian teacher keys, strict gates, curriculum records; enA2Curriculum version 2026-10-23.10):
  3 School and learning (011–015), 4 Free time (016–020), 5 Food and health (021–025), 6 Travel and holidays
  (026–030), 7 People and places (031–035: superlatives, nationalities, What is it like?, festivals and in / on / at),
  8 Shopping and money (036–040: much / many, too / enough, as… as, returns and complaints), 9 Media and technology
  (041–045: present perfect ever / never, just / already / yet, should for online safety, present perfect vs past
  simple), 10 A2 exam practice (046–049 strategy lessons with a grammar review, 050 a full A2 mock exam).
- Files: crm-v2/src/features/worksheet-generator/admin/course/en/a2/module03…10 (.js, b.js, Key.js), registry.js,
  strictModules.json, en/a2/moduleKeys.test.js, curriculum/enA2Curriculum.js.
- Checks: `gate_s.sh en/a2/moduleNN` clean for 3–10; vitest worksheet-generator 866 passed, curriculum green.
- Not published (owner's yes needed: install en-a2-011…050 records, publish 120 sheets). A1 is out of scope (owner).
- Next safe step: the owner's yes to publish A2 3–10 and B1 4–10.

## 2026-10-23 · agent/english-b1-m4 — English B1 modules 5–10: the B1 course is complete

- Modules (all with Russian teacher keys, strict gates, curriculum records; enB1Curriculum version 2026-10-23.10):
  5 Free time and culture (021–025: -ing / to, comparatives, so / such and reviews, suggestions and invitations),
  6 Travel (026–030: must / have to / should, could / managed to, complaints), 7 Health and lifestyle (031–035:
  quantifiers, second conditional, I wish, should / had better), 8 Technology and media (036–040: present and past
  passive, be allowed to / let / make, opinions and linking words), 9 Our world (041–045: relative clauses, reported
  statements and requests, environment phrasal verbs), 10 Exam practice (046–049 strategy lessons with a grammar review,
  050 a full mock exam).
- Tooling in the scratchpad only (not in the repo): scaffold / addlesson / autokey / curr helpers.
- Checks: `gate_s.sh en/b1/moduleNN` clean for 5–10; vitest admin/course + curriculum 382 passed.
- Not published (owner's yes needed: install en-b1-016…050 records, publish 105 sheets). Next: A2 modules 3–10.

## 2026-10-22 · agent/english-b1-m4 — English B1 module 4 „Plans and the future”

- Main checked: ab99b9b (2026-10-22).
- Module 4: en-b1-016 What are you going to do? (going to vs will), 017 It's in my diary (present continuous for
  arrangements, present simple for timetables), 018 What will the future be like? (will / won't / might / probably,
  a magazine article), 019 If I pass, I'll… (first conditional, unless, when / as soon as, a formal e-mail), 020 the
  check in the Harno B1 task types. 15 sheets of 41–49 min. Files: en/b1/module04.js, module04b.js, module04Key.js.
- Teacher key en/b1/module04Key.js (Russian, every item); moduleKeys.test.js covers B1 1–4; strictModules +module 4;
  registry +enb1m04; curriculum/enB1Curriculum.js module 4 records (version 2026-10-22.4).
- Checks: `gate_s.sh en/b1/module04` clean; vitest worksheet-generator + curriculum + worksheet-studio 1094 passed.
- Not published yet (waits for the owner: install en-b1-016…020 records, publish the 15 sheets). Next: B1 module 5.
## 2026-10-23 · agent/retention-risk — „Riskis õpilased” on the dashboard

- Main checked: efd80db (2026-10-22). Independent of #737/#738/#739; other agents work on English content.
- Owner: „делай всё” after the learner profile → first the student retention view (docs/LEARNER_PROFILE.md roadmap).
- New: features/retention/retentionRisk.js (+test) and RetentionCard.jsx (+test). Signals per active card: 2+ absences
  or cancellations in the last 4 journal lessons; last held lesson over 21 / 35 days ago (a card active for 3+ months
  without lessons: „võta ühendust või arhiveeri”); no lesson ahead (weak right after a lesson, ignored for self-study
  cards); words but no own practice for 14 days; an overdue invoice (finance view only). Packages with ≤ 1 lesson left
  are listed as the moment to talk about the next one.
- Teachers do not always mark held lessons in the journal (a weekly series ran while the journal stopped in June), so
  a lesson the calendar had in the last 21 days counts as recent (`recentlyScheduled`).
- Production run (read only, 2026-10-23): 96 active cards → 7 at risk (2 high), each with a clear reason.
- Files: features/retention/*, dashboard/DashboardPage.jsx, services/firebase/studentWords.js (`listForStudentIds`).
- Checks: vitest crm-v2 all green; eslint clean in the touched files.
- Next safe step: the daily 5-minute review on the student's home (docs/LEARNER_PROFILE.md, step 1).
## 2026-10-23 · agent/lesson-summary-parent — „Kokkuvõte vanemale” after the lesson analysis

- Main checked: efd80db (2026-10-22). Independent of #737–#742.
- The family already sees a lesson summary (teacher's note, board pages, new words, homework). Missing: what the
  student got wrong. The transcript stays teacher/admin only (owner 2026-10-04, firestore.rules lessonRecordings), so the
  teacher sends it: „Pärast tundi” → „Kokkuvõte vanemale” prefills plain lines in Estonian and Russian (error topics and
  the number of corrected sentences, never the sentences), the teacher edits and sends; the text is added to the
  lesson's note in `lessonSummaries` (same fields as the end-of-lesson save, so the rules hold).
- Files: lesson-recording/afterLesson.js (`parentNoteFromAnalysis`, +test), TranscriptView.jsx (AfterLesson),
  AfterLessonParent.test.jsx, lessonRecording.css, services/firebase/lessonSummaries.js (`appendNote`).
- Checks: vitest crm-v2 all green.
- Next safe step: voice task between lessons (docs/LEARNER_PROFILE.md roadmap).
## 2026-10-23 · agent/daily-review — „Päeva 5 minutit” for the student

- Main checked: efd80db (2026-10-22). Independent of #737–#741.
- docs/LEARNER_PROFILE.md step 1. New vocabulary/dailyReview.js (+test): about ten cards a day without choosing —
  own corrected sentences (≤ 2), forgotten words (box 0 after a review), due words (oldest first), ≤ 3 never practised.
- Student home „Täna”: the words step is „Päeva 5 minutit · N kaarti · X ununeb” and opens
  /student/sonavara?paev=1, which starts the set at once; done after five cards reviewed today (before: one word).
  Sõnavara's „Täna” block offers the same set („Alusta”). Answers move the words in their Leitner boxes as before.
- Fix: Sõnavara showed a white page when loading failed (an Error object was rendered as text); now the message shows.
- Checks: vitest crm-v2 all green; manual check on the emulators (student on a phone: home step → set opens → an
  answer moved „eelarve” from box 0 to 1).
- Next safe step: docs/LEARNER_PROFILE.md step 2 (sheet errors become review cards).
## 2026-10-23 · agent/learner-snapshot — „Õpilase pilt”: the student before the lesson

- Main checked: efd80db (2026-10-22). Independent of #737/#738 (live board); other agents work on English content.
- Owner: „то, что выведет платформу на новый уровень” → the learner profile, version 1 (docs/LEARNER_PROFILE.md).
- Usage check (production, read only, 2026-10-22): 27 of ~65 student accounts have words in „Minu sõnad”, 15 ever
  practised, 14 this week; „Kordamine” results are browser-only, invisible to teachers.
- New: features/learner/learnerSnapshot.js (+test) and LearnerSnapshotCard.jsx (+test), learner.css. The teacher sees:
  last own practice, this week, forgotten words, the last sheets with their auto-check errors in words, overdue homework,
  the last lesson's topic and notes, and short signals. Live Classroom Tööruum: panel „Õpilane” opens first when a
  student is picked; „Pane kordamine tahvlile” makes a board page with the forgotten words. Student card → Ülevaade.
- Files: features/learner/*, live-classroom/TeacherWorkspace.jsx, students/StudentProfilePage.jsx, docs/LEARNER_PROFILE.md.
- Checks: vitest crm-v2 2121 passed; eslint clean (learner, live-classroom); manual check on the emulators with seeded
  words, a sheet with errors, overdue homework and a held lesson.
- No rules, data or production changed.
- Next safe step: the daily 5-minute review from the profile on the student's home (LEARNER_PROFILE.md, step 1).
## 2026-10-23 · agent/live-room-layout — Live Classroom: the worksheet is no longer covered

- Stacked on agent/live-board-realtime (#737), both change StudentBoard and LiveRoom.
- Found in the two-account test: the video tiles and the colour panel lay over the worksheet; on a phone the colour
  panel stayed open over the reading view and both tiles covered the page tabs; the sheet picker in the room had bare
  browser buttons (its rules were scoped to `.ws-studio`).
- Now: on a wide screen a worksheet page is fitted beside the video tiles (`insetRight` 250 px); the tiles can be made
  small („Peida video”: a chip with the other side's name, picture and sound go on); the colour panel closes when a
  worksheet page opens (it opens again from the dock) and never shows over the phone reading view; on a phone only the
  other side's picture, 92 px, below the page tabs; the picker's tabs and search have their own styles.
- Files: board/StudentBoard.jsx, live-classroom/LiveRoom.jsx, liveRoom.css, worksheet-studio/worksheetStudio.css,
  board.test.jsx (+1), LiveRoom.follow.test.jsx (+1).
- Checks: vitest crm-v2 2127 passed; eslint clean in the touched folders; manual check on the emulators (teacher at
  1440 px with a worksheet, student on a 375 px phone).
- Next safe step: owner review of #737 and this PR together (same lesson room).

## 2026-10-23 · agent/live-board-realtime — Live Classroom board: live typing, drawing, cursors, „Juhi vaadet”

- Main checked: efd80db (2026-10-22). No open PR touched the board or Live Classroom; other agents work on English
  content (#732/#733) and course health.
- Problem (tested with two accounts on the emulators): a text typed on the board reached the other side only when the
  writer left the field (the student saw an empty „Tekst” box); lines and moves only on mouse up; no cursors; teacher and
  student saw the worksheet at different zoom and place (138 % vs 77 %).
- Now over the call's data channel (nothing extra is saved, Firestore writes are unchanged): letters while they are
  typed („Anna kirjutab…”), a line or shape while it is drawn, elements while they are dragged, the other side's
  cursor with a name. The teacher's „Juhi vaadet” sends the visible part of the board; the student sees the same place
  (a worksheet: the same width and line); when he moves away, „Jälgi õpetaja vaadet” brings him back.
- Files: board/liveDrafts.js (+test: messages are checked and cut to size, stale drafts drop after 6 s, throttle 40 ms),
  board/boardModel.js (viewRect, fitRect), board/StudentBoard.jsx (props live, presenting, followView, onFollowBreak;
  pointer release no longer stops a line from saving), board/board.css, live-classroom/LiveRoom.jsx (one channel
  listener fans out to the board), liveRoom.css, LiveRoom.follow.test.jsx (+5 tests).
- Checks: vitest crm-v2 2125 passed; eslint board + live-classroom clean; manual two-tab run on the emulators (typing,
  drawing, cursor, view lead on a worksheet, follow break and return).
- Limits: all live parts need the call's data channel (no camera/microphone → no live layer; the board still syncs on
  save). Group lessons (GroupRoom) do not have it yet. The phone reading view keeps its own scrolling (view lead not
  applied there).
- Next safe step: layout PR — video tiles and the colour panel stop covering the worksheet, the colour panel closed in
  the phone reading view, the sheet picker's styles loaded in the room.

## 2026-10-22 · agent/course-health — „Kursuste tervis”: is each course whole?

- Owner: course integrity. Another agent works in parallel on the English courses (PRs #732/#733), so I did not touch
  course files or CourseProductionPage.
- New read-only admin page `/library/worksheet-generator/health` (Õppevara → Tööriistad → „Kursuste tervis”):
  - per course, every lesson's quality gates and its sheets (Avasta / Harjuta / Kasuta / Õpik) compared with Õppevara;
  - states: the same as the code, published but different from the code, a newer draft in progress, only a draft,
    missing, or only in Õppevara;
  - „Kontrolli Õppevaraga” reads the lessons six at a time; the list filters to lessons with problems.
- Files:
  - `admin/course/health.js` (+ test);
  - `ui/CourseHealthPage.jsx` (+ test);
  - `routes.jsx` (one route);
  - LibraryPage (one menu item).
- First reading of production 2026-10-22, read-only:
  - A2: 100 lessons, 303 sheets the same, 1 draft;
  - B1: 85 lessons, 258 the same;
  - B2: 90 lessons, 271 the same;
  - ek9: 15 the same;
  - en: 75 the same;
  - C1: 245 the same, 55 different from the code — modules 8–10 (est-c1-071…100) were changed in code and not
    published;
  - no sheet missing.
- Quality gates („all gates pass”):
  - B1, B2, ek9 and en: all lessons;
  - A2 and C1: no lesson passes them all. A2: repeated sentences 197, no vocabulary block 96. C1: no vocabulary block
    100, depth notes.
- Checks: health + page tests 5/5, eslint 0 errors.
- Next safe step: the owner decides about publishing C1 modules 8–10 and adding the vocabulary blocks to A2 / C1.

## 2026-10-22 · agent/studio-teacher-pass — constructor walked through as a teacher

- Owner: go through the lesson constructor as a teacher and fix what is awkward or missing.
- What I checked on a local stand (mocked services, real course sheets B1 a2b1-021 and C1 est-c1-075, plus a sheet
  with all 42 block types):
  - select a task, edit a sentence on the sheet, student view with checking, add a block from the palette, the
    phone layout;
  - every block's settings panel was scanned for cut-off text. No page errors.
- Fixed:
  - one-line fields cut long sentences off. `SentenceInput` / `Sentence` (editor/fields.jsx) grow with the text, and
    Enter does not add a line. Used in Õige/vale statements, errorfix, transformation, translation, picture-situation
    and dialogue lines;
  - a short choice next to a sentence (Õ / V) took half the row: `.ed-row > .ed-input.small` now keeps its own width;
  - text areas (instruction, texts, role cards) grow with the text up to ~420 px instead of a small scrolling box;
  - speaking tip: lines were glued together on the sheet („uudise eesmärk onseevastutoon”) and edited in a one-line
    field that dropped the line breaks. Now they show joined by „ · ” and are edited in a text area (+ test).
- Seen, not changed:
  - the student preview shows ticks but no total score;
  - at ~1000 px the constructor header gets crowded (title cut, „Määra õpilastele” on two lines).
- Checks: worksheet-studio + worksheet-generator suites 1059 passed, 3 skipped. eslint 0 errors.
- Next safe step: merge; then the course-integrity page and the course → textbook work.

## 2026-10-22 · agent/book-speed — the textbook („Õpik töölehtedest”) no longer freezes

- Owner: the book is so big that the site hangs for some teachers when they open it. A level is 200–270 sheets, and
  every sheet is drawn twice (visible pages plus a hidden copy that measures the pages), so the page grew to tens of
  thousands of elements.
- BookPage:
  - a sheet is drawn only when it comes within ~1500 px of the visible part of the canvas (IntersectionObserver);
    until then it is an empty frame of its page height, and once drawn it stays;
  - „PDF / Prindi” first draws all sheets 4 at a time with a progress counter („Valmistan… n/N”). The dialog opens
    when the page counts have been still for a moment, so a sheet that never reports its pages cannot block it;
  - without IntersectionObserver (tests, old browsers) every sheet is drawn as before.
- Measured on a local stand with the whole B1 course (255 sheets): after loading 2 sheets were drawn and the page had
  4,534 elements (before, all 255 sheets ended up drawn). Scrolling draws the sheets that come into view.
- Checks: BookPage tests 3/3, eslint 0 errors.
- Next safe step: merge; then make printing a whole level faster (fewer measuring passes) if teachers print whole
  levels often.

## 2026-10-22 · agent/calendar-room-free — a cancelled lesson frees its room at once

- Oleksiy (#bug #high_priority #calender): „При отмене занятия через Tühista не освобождается кабинет”.
- Cause: the calendar loaded roomBookings once; a save updated them locally, a cancel, move, delete or undo did not, so
  the room looked taken until the page was reloaded (the server trigger had already freed it).
- Fix: roomModel `bookingFromEvent` (the server's rule) and `mergedBookings`: lessons this calendar has loaded count as
  they are after every reload; the server's roomBookings only add lessons the user cannot see; a deleted series is
  hidden at once. Files: features/calendar/roomModel.js (+tests), CalendarPage.jsx.
- Checks: vitest calendar 108/108.
## 2026-10-22 · agent/student-parent-link — „Ava lapsevanema kaart” on the student's card

- Oleksiy (#improvement #database): a quick way from the student's card to the parent's card.
- Student card → Põhiandmed → under Lapsevanem: „Ava lapsevanema kaart” (one link per linked parent account; from
  parentModel `parentCardIds`). It opens /parents?parent=<id>: the parents page shows that parent only, with „Näita kõiki”.
- Files: students/StudentProfilePage.jsx, studentProfileTabs.css, parents/ParentsPage.jsx, parentModel.js (+tests),
  styles/index.css. Checks: vitest parents + students 104/104.

## 2026-10-22 · agent/english-b1-m3 — English B1 module 3 „Experiences”

- Module 3: en-b1-011 Have you ever…? (present perfect for experience, been / gone, participles), 012 Just, already, yet
  (news vs details), 013 How long have you…? (for / since / ago), 014 Then or up to now? (present perfect vs past simple,
  follow-up questions, scholarship application), 015 the check in the Harno B1 task types. 15 sheets of 42–51 min.
- Teacher key en/b1/module03Key.js (Russian, every item); moduleKeys.test.js covers B1 1–3; strictModules +module 3.
- curriculum/enB1Curriculum.js: module 3 records (version 2026-10-22.3).
- Checks: `gate_s.sh en/b1/module03` clean; vitest admin/course 304 passed.
- Not published yet (waits for the owner). Next: B1 module 4 „Plans and the future”.

## 2026-10-22 · agent/inf3-parent-code — a parent's INF 3 code for all their children

- Owner: „личный код уже родителю можно приписывать чтобы потом автоматически вносилось” → yes, build it.
- functions/inf3-core.js `payerKeyOf` (the parent's account id, else a hash of the parent's e-mail); saving a payer code
  (admin or the parents' form) also writes taxPayers/{key}; the INF 3 report uses it for every child of that parent,
  also new ones; a child's own payer code wins. Rules: taxPayers admin read, no client writes. UI marks such rows
  „lapsevanema kaardilt”. docs/INF3.md updated.
- Checks: functions 334/334; emulator INF 3 test (with a sibling) passes; vitest tax 3/3.

## 2026-10-22 · deployed: bookkeeping and INF 3 (owner: „Да, сливай и выкладывай”)

- Merged #724 (core), #725 (Raamatupidamine page), #726 (INF 3); main d4a5f46. Vercel builds the CRM from main.
- Deployed from main d4a5f46: functions financeApi (update) and taxFormApi (new), firestore.rules.
- Checked live: taxFormApi refuses an unknown link; /maksuandmed/* is served. Dry run on production data (read-only):
  214 automatic entries, all balanced; 1010 +8 624 €, 1200 +32 €, 2500 −567 €, 3060 −8 089 €. No entries are written
  yet: they are created the first time an admin opens Finantsid → Raamatupidamine. INF 3 2026 so far: 45 trainees,
  8 544 €, no personal codes yet.
- Owner's gates: opening balances on 01.01.2026 from the accountant's käibeandmik („Algsaldod”); the EHIS
  majandustegevusteade for täienduskoolitus before filing INF 3; salaries are manual entries for now.
- Next safe step: the owner enters the opening balances and sends the parents' form links; then English B1 module 3
  (branch agent/english-b1-m3, lessons 011–013 done).

## 2026-10-22 · agent/accounting-ui — Raamatupidamine page (on top of agent/accounting-core)

- Route /finance/raamatupidamine (admin), linked from Finantsid („Raamatupidamine”). Tabs: Päevaraamat, Pearaamat,
  Käibeandmik, Bilanss ja kasumiaruanne, Kontoplaan. Period filter, Excel export (SpreadsheetML .xls with the columns
  of the owner's P2evaraamat.xls and K2ibeandmik_a.xls), manual entry (cannot be edited; storno with a reason), opening
  balances, add / rename / close an account. Opening the page creates missing automatic entries (/accounting/sync).
- Files: crm-v2/src/features/accounting/* (AccountingPage, accountingReports, accountingExcel, css, tests),
  services/firebase/accounting.js + financeApi accounting methods, app/routes.jsx, app/accessPolicy.js, finance links.
- Checks: vitest accounting + finance + app + services 329 passed; eslint clean on the new files; checked on the local
  stand with sample entries (trial balance and balance sheet balance; phone width without horizontal scroll).
- Next safe step: owner review; merge #724 then this PR; deploy functions + rules with the owner's yes; then INF 3.

## 2026-10-22 · agent/accounting-core — bookkeeping core (päevaraamat, käibeandmik) on the server

- Owner: implement Päevaraamat, Käibeandmik (templates P2evaraamat.xls, K2ibeandmik_a.xls), the Merit Aktiva kontoplaan
  and INF 3 in Finantsid, „как по законам Эстонии”. Decisions (AskUserQuestion): full bookkeeping on the site; not VAT
  registered; from 2026-01-01 with opening balances; isikukood in the card plus a parents' form.
- This PR: the server core. functions/accounting-chart.js (207 Merit Aktiva accounts), functions/accounting-core.js
  (automatic entries from invoices, credit notes, cancellations, payments, voids, payer credits, refunds, expenses;
  validation; storno; opening balances; numbering), financeApi routes /accounting/*, rules for accountingEntries and
  accountingAccounts (admin read, no client writes). docs/ACCOUNTING.md: the law (RPS §§ 6–12) and the posting table.
- Checks: functions node --test 329/329 (accounting-core 10); emulator: the new bookkeeping test passes.
- Not done: the UI (next PR: Raamatupidamine with päevaraamat, pearaamat, käibeandmik, bilanss, kasumiaruanne, manual
  entries, opening balances, Excel); INF 3; salaries are manual entries. Nothing deployed.
- Next safe step: the Raamatupidamine UI on top of this branch; deploy functions with the owner's yes after merge.
## 2026-10-22 · agent/inf3 — INF 3 (training costs paid by private persons)

- Owner: INF 3 in Finantsid (inf_3_2025.pdf), personal codes in the card + a parents' form (AskUserQuestion).
- functions/inf3-core.js: isikukood check, `inf3Rows` (money received in the year by trainee, minus refunds; not
  prepayment use, overpayments, voids, company invoices), `inf3Xml` (emta.ee inf3.xsd). financeApi /tax/identity,
  /tax/form-link, /tax/inf3; new public function `taxFormApi` (/info, /submit) with one-time 60-day links; rules:
  taxIdentities admin read, taxFormTokens closed.
- CRM: /finance/inf3 (admin; masked codes, missing rows, „Vormi link”, XML download, filing notes), /maksuandmed/:token
  (public parents' form, et / ru). Link „INF 3” in Finantsid. docs/INF3.md.
- Checks: functions inf3-core 4/4; emulator INF 3 test passes; vitest tax + app 27 passed; eslint clean.
- Owner's manual gate: E&P Koolitus OÜ needs a majandustegevusteade for täienduskoolitus in EHIS before filing.
- Not deployed (new function taxFormApi + financeApi + rules need the owner's yes).

## 2026-10-22 · agent/english-b1-m2 — English B1 module 2 „Life stories”

- Main checked: 198b5f1. B1 module 1 was merged (#722) and published with the owner's yes: records en-b1-001…005
  created create-only, 15 sheets published.
- Module 2: en-b1-006 What happened? (past simple, -ed spelling and sounds), 007 While it was happening (past
  continuous, when / while), 008 How things used to be (used to vs past simple), 009 Telling a story (time linkers,
  strong adjectives), 010 the check in the Harno B1 task types. 15 sheets of 41–53 min.
- Teacher key en/b1/module02Key.js (Russian, every item). Very short key lines in all English keys now start with
  „Ответ:” (the key test needs more than 5 characters); published English sheets change only in these lines.
- curriculum/enB1Curriculum.js: module 2 records (version 2026-10-22.2). strictModules + en-b1-module-02.
- Checks: `gate_s.sh en/b1/module02` clean; vitest worksheet-generator + worksheet-studio + curriculum 1080 passed.
- Not done: not published (waits for the owner); no English audio.
- Next safe step: with the owner's yes, install en-b1-006…010 and publish all English sheets; then B1 module 3
  „Experiences” (present perfect).

## 2026-10-22 · agent/english-b1-m1 — English B1 module 1 „People around me”

- Main checked: 479f88b. Owner: „Дальше начинай Б1 курс”. B1 module list in docs/ENGLISH_COURSE_PLAN.md.
- Module 1: en-b1-001 Getting to know you (present simple / continuous, stative verbs, subject / object questions),
  002 What are you like? (personality, adjective + preposition, -ed / -ing, prefixes), 003 Friends and family
  (phrasal verbs, always + continuous), 004 Asking politely (indirect questions, polite requests, formal e-mail),
  005 the check in the Harno B1 task types. 15 sheets of 41–54 min; B1 norms (10 items, texts 200–400 words).
- Teacher key en/b1/module01Key.js (Russian, every item); moduleKeys.test.js covers A2 1–2 and B1 1.
- curriculum/enB1Curriculum.js (+ test): records en-b1-001…005, „Inglise keel · English B1”.
- didacticCheck.js: the „inference question” check also knows English (why, explain, do you think…).
- Translation tasks still have no model answer in the teacher key (the block has no answer field).
- Checks: `gate_s.sh en/b1/module01` clean; vitest admin/course + curriculum 319 passed.
- Not done: not published (waits for the owner's yes); no English audio.
- Next safe step: publish B1 module 1 with the owner's yes, then B1 module 2 „Life stories”.

## 2026-10-22 · agent/english-a2-m2 — English A2 module 2 „Home and my town”

- Main checked: 54bee4d. Owner: „Сливай и выкладывай в Õppevara, потом модуль 2”.
- Module 2: en-a2-006 My home (there is / are, some / any), 007 Where is it? (prepositions of place), 008 Around town
  (places, asking the way, imperative directions, ordinals), 009 Town or country? (comparatives with than), 010 the
  check in exam form. 15 sheets of 39–44 min; teacher key module02Key.js (Russian, every item).
- en-a2-005 speaking 2 no longer needs a teacher's picture (a photo on the phone), like the new lessons.
- curriculum/enA2Curriculum.js: module 2 records (en-a2-006…010), version 2026-10-22.2.
- Tests: moduleKeys.test.js covers modules 1 and 2 (replaces module01.test.js); strictModules +en-a2-module-02.
- Checks: `gate_s.sh en/a2/module02` clean; vitest admin/course + curriculum 310 passed.
- Production (owner's yes): records 006–010 created create-only; sheets of modules 1–2 published with publish-v2.cjs.
- Next safe step: A2 module 3 „School and learning” (can / have to, past simple regular).

## 2026-10-22 · agent/english-a2-curriculum — English A2 module 1 in Õppevara

- Owner: „Сливай и выкладывай в Õppevara, потом модуль 2”. #719 merged (main ec1bc43).
- curriculum/enA2Curriculum.js: `enA2CurriculumRecords()` → curriculumLessons/en-a2-001…005 (subject „Inglise keel”,
  level „English A2”, Russian lesson plans, lesson 5 = Kontroll). A module is added there when its sheets are built.
- Production (owner's yes): records created create-only, the 15 sheets published from buildCourseSheet (scratchpad
  scripts ek9-install.cjs / publish-v2.cjs; a manually edited sheet is never overwritten).
- Checks: enA2Curriculum.test.js 2/2.
- Next safe step: A2 module 2 „Home and my town”.

## 2026-10-22 · agent/english-a2-m1 — English course A2, module 1 „Me and my world”

- Main checked: 749893c (2026-10-21). Owner 2026-10-21: an English course by level A1 → B1; English instructions with a
  Russian hint for hard rules; start with A2 module 1. Plan, exam source and module list: docs/ENGLISH_COURSE_PLAN.md.
- Module 1 is built: en-a2-001 Meet the class (present simple, be), 002 My day (routines, adverbs of frequency, time),
  003 Right now (present continuous vs simple), 004 People I know (looks, character, has got), 005 the check in the
  exam's task types (reading, listening, language tasks, e-mail, speaking). 15 sheets, 40–45 min each.
- Teacher key: every task item has a Russian explanation (module01Key.js, 88 tasks); test checks one line per item.
- System changes:
  - `MODULE.language: 'en'` → `meta.language`; the EKI (Estonian) word-list check skips non-Estonian sheets
    (didacticCheck.js). `COURSES.en` added to the registry.
  - Answer check (`engine/schema.js` `norm`): ’ = ', and n't / 'm / 're / 've and can not are written out on both
    sides, so „doesn’t” from a phone and „does not” are accepted. Estonian answers are unaffected.
  - listeningAudio.test.js covers Estonian modules only: the TTS (TartuNLP) is Estonian, so English transcripts are
    read by the teacher (the instructions say so).
- Files: admin/course/en/a2/module01.js, module01b.js, module01Key.js, module01.test.js; registry.js;
  strictModules.json (+en-a2-module-01); didacticCheck.js; engine/schema.js; listeningAudio.test.js;
  docs/ENGLISH_COURSE_PLAN.md.
- Checks: `gate_s.sh en/a2/module01` no blocking lines; vitest worksheet-generator + worksheet-studio 1029 passed,
  1 failed under load (CourseProductionPage, 2/2 passed alone).
- Not done / limits: no curriculum records and no publishing (production write, needs the owner's yes); no English
  audio (needs a choice of English TTS); sheet chrome labels (Kontrolli end. etc.) stay Estonian.
- Next safe step: the owner reviews lesson en-a2-001 in Kursused → English; then curriculum records for A2 module 1.

## 2026-10-21 · agent/functions-1gb — the functions people wait on run on 1 GB

- Owner's payment test went through linkpayApi: 6.2 s on the first call after a pause, then 0.15–0.17 s. On a 256 MB
  gen1 instance the first call loads the Firestore client on a ≈0.4 GHz CPU.
- These functions moved to `memory: "1GB"` (≈1.4 GHz), still inside the free tier: linkpayApi, interactiveLessonApi,
  gcalApi, staffOperationsApi, languageApi (financeApi, invoiceApi and manualInvoiceApi earlier today).
- Checks: functions `node --test` 319/319. Deploy with the owner's yes.

## 2026-10-21 · agent/grammar-index-look — „Grammatika” looks like the module lists

- Owner screenshot: the Grammatika block in Õppevara was ragged compared to the module lists. The Määra button
  followed the title's length, and there was no icon and no preview.
- Now it is a `lib2-section` with the same header as a module and one `lib2-row` per topic and lesson:
  - a topic number column;
  - a book icon;
  - the topic, with „Tund N · lesson · module” under it;
  - the Õpik chip in the meta column;
  - Vaata and Määra in the actions column.
  On a phone the number takes the star's place.
- Files: library/LibraryPage.jsx (+ test selector), library/libraryWorkspace.css.
- Checks: library vitest 48/48; the B2 level checked on the local stand with the production library data.
- Also deployed today with the owner's yes: functions from main 290cd08. financeApi, invoiceApi and manualInvoiceApi
  now run on 1024 MB (checked with functions:list).

## 2026-10-21 · agent/finance-speed — finance actions took 3–10 s

- Owner: every action in Finantsid takes long.
- Measured:
  - The page reloads 9 collections after each action; that is about 770 KB and ~0.6 s with the admin SDK, so it is
    not the cause.
  - Function logs: financeApi 3–10 s, invoiceApi 6–6.5 s, manualInvoiceApi 8 s first / 1 s next. The preceding OPTIONS
    took ~40 ms, so the time is spent in the handler on a cold instance, not only in the cold start.
  - The functions run on gen1's default 256 MB (≈0.4 GHz CPU).
  - Every function also loaded googleapis at start (local main.js load 425 → 152 ms after the fix).
  - Each reload replaced the whole page with „Laen finantsandmeid…”.
- Fix:
  - financeApi, invoiceApi and manualInvoiceApi `runWith({ memory: "1GB" })` (≈1.4 GHz). Usage stays inside the free
    tier (400 000 GB-s a month).
  - googleapis loads lazily (calendar only).
  - Finance, Kuu arveldus and Kassa keep the page during a reload and show a small „Uuendan andmeid…” pill.
- Checks:
  - finance + cash + hooks vitest: 144/144;
  - functions `node --test`: 319/319.
- Production: frontend with the merge (Vercel). The functions change needs a functions deploy (owner's yes).

## 2026-10-21 · production data — Timur Varik and Timur Saipov: one card each (owner)

- Owner: the invoice student picker showed two cards for each Timur. Timur Varik has Estonian (Elena), English and
  maths (Liza), all 20 €; Timur Saipov has Estonian with Pavel, 25 €.
- **Varik.**
  - The „(matem)” card (wrongly subject „Inglise keel”) and its 8 records were tagged Matemaatika, then the card was
    merged into the English card `aoesCvGrQLxN7GEFMp1L` (student-merge.js: 5 lessons, 3 schedule).
  - Kept card: name „Timur Varik”, enrollments Inglise keel + Matemaatika (Yelyzaveta), Eesti keel (Elena),
    teacherUids both.
  - studentRevenuePlans: 2000 cents with subjectPrices Matemaatika and Eesti keel at 2000; the merged card's plan was
    set inactive.
  - Liza's 3 lessons tagged „Eesti keel” (Oct 2, 6, 9) and 4 schedule entries without a subject became „Inglise keel”.
    Result: 7 English and 5 maths lessons.
- **Saipov.**
  - The card without an account `WA4gQD348heNl4ekkwTD` was merged into the card with the account
    `CJHcCsxtMnxZF17Rh947` (2 schedule entries).
  - Kept card: name „Timur Saipov”, Eesti keel B1 with Pavel only; a new revenue plan at 2500 cents for 60 min,
    1 lesson a week.
  - Elena's 3 past lessons keep their own teacher.
- Invoices were not moved; both kept cards already had them.
- Backup (cards, plans, record subjects): /Users/pavel/KeeleSeppTranscriber/backup-timur-2026-10-21.json.

## 2026-10-21 · agent/teacher-query-chunks — teachers' Kodutööd / Ülevaade „no permission”

- Owner: teachers say they have no rights on some tabs (homework, the main screen).
- Checked:
  - the menu roles: users.role „teacher” for every teacher, no custom claims → the menu is complete;
  - the live Firestore rules equal main (ruleset of 2026-10-21 07:21 UTC); compared with 2026-10-20 they only add
    studentAvailability.
- Cause: since the teacher scope (#686, 2026-10-20) homework, worksheetAssignments, exerciseResults and messages are
  read only if `staffCanAccessStudent(studentId)` holds. For a query that is one get() per student card, plus the
  teacher's profile and securityMigrations/teacherUidV1. Firestore allows 10 get() calls a query, and the client asked
  10 cards per IN query → over the limit → the whole query was refused. Admins pass on `isAdmin()` and never saw it.
- Fix:
  - `services/firebase/homework.js` asks 5 cards per query (`RULE_CHECKED_IN`);
  - `messages.js` asks 5 too.
- New emulator test in security-access-emulator.integration.js: a teacher with 10 cards reads all four collections in
  queries of 5. It also logs the status of a 10-card query, to confirm the limit.
- Next safe step: merge; frontend only (Vercel), no rules or functions deploy.

## 2026-10-21 · agent/fix-ek9-library — „Õpetaja võti” at full width

- Owner screenshot: the answer key opened as a tiny column on the left. The studio body grid kept the 240 px palette
  column in key mode and the A4 fit-zoom was applied. Fix: `.mode-key .st-body` is one column and the key is not
  zoomed.
- Owner screenshot 2: Õppevara „9. klass emakeel” showed „Cannot read properties of undefined (reading 'slice')”. Not
  reproduced on main with the full production library data:
  - the level page, a lesson click, all 15 ek9 sheets in every mode and the key all render;
  - every main deploy succeeded.
  It was probably a tab that was open across the deploy. The owner is asked to reload and say what was clicked if it
  comes back.

## 2026-10-21 · agent/grammar-index — „Grammatika” at the top of each level in Õppevara

- Owner: add a separate grammar block at the beginning of each level. The owner chose a topic index.
- `features/library/grammarIndex.js` lists the grammar topics per level in course order with their lessons:
  - A2: 17 topics;
  - B1: 15;
  - B2: 14;
  - C1: 18.
- LibraryPage shows a „Grammatika” card first when a level is chosen (no search, module or phase filter). Each topic
  shows its lesson(s) (opens the preview), a chip „Õpik” when the lesson's textbook sheet is published (opens it) and
  „Määra”.
- Files: grammarIndex.js, LibraryPage.jsx, libraryWorkspace.css, LibraryPage.test.jsx (+2 tests).
- Checks: library suite 48/48; eslint 0 errors; checked on a local stand with mocked data.
- Next safe step: add topics when new grammar lessons or textbook chapters arrive (docs/TEXTBOOKS.md).
## 2026-10-21 · agent/answer-explanations — „Õpetaja võti”: the teacher's answer key with explanations

- Owner: answers for teachers with an explanation of why the answer is right.
- `worksheet-studio/engine/answerKey.js` (`answerKeyOf(doc)`, + test):
  - every task with its items, the right answer and `data.explain` (one line per item);
  - covers gaps, choice, truefalse, match, errorfix, transformation, wordforms, categorize, reading, table, and any
    block with `answers()`.
- `AnswerKeyView.jsx` + the studio tab „Õpetaja võti” (next to Trükivaade). It is printable and teachers only: students
  play sheets in DocWorksheetPlayer, which never renders it.
- Course files:
  - a module may export `EXPLAIN = { blockId: [lines] }`; `registry.buildCourseSheet` puts it into `data.explain`
    (`withExplanations`);
  - `blocks.js` also has `why(block, lines)`.
- 9. klass emakeel module 1 has explanations for all 84 tasks (~690 answers) in `ek9/module01Key.js`.
  `module01Key.test.js` checks one line per item and full coverage.
- Content fixes found while writing:
  - 005: „märjal mätal” → „mättal”;
  - 001: an answer with a word not in the task;
  - 001: a disputed quote-comma sentence;
  - 005: a semantically odd lauselühend row.
- Checks:
  - module gates: no problems;
  - answerKey + module01Key tests pass.
  - Broad suites locally: 1091 passed; only 5 page tests timed out under machine load, and they pass in isolation
    (25/25). CI decides.
- Done 2026-10-21: ek9 module 1 republished v1 → v2 with the explanations (dry run 15, 0 manual edits; apply 15; re-run 15 „same”).
- Next safe step: write module 2 with its EXPLAIN file from the start.

## 2026-10-21 · agent/opik-sheet — textbook pages as a 4th lesson sheet „Õpik”

- Owner: digitise the licensed textbooks, but inside our course: a grammar lesson gets the textbook's rule and
  exercises 1:1, not a separate module. Owner picked a 4th sheet „Õpik” next to Avasta / Harjuta / Kasuta.
- Service: `lessonWorksheets` keeps a summary for `opik` too (`worksheetPhases.opik`) and allows slot 4. No rules
  change: staff already write any sheet id.
- Õppevara:
  - the chip „Õpik” shows only when a lesson has one and is not counted in the phase filters;
  - assignment offers it, unticked by default;
  - board, homework and the live-room sheet list label it „Õpik”.
- Kursuse tootmine: new section „Õpik” lists `admin/course/textbook` sheets with preview and „Avalda” (confirmation);
  only the answer key gates publishing.
- Content (code only, not published):
  - „Minu Eesti” (Mangus, Simmul) pp. 38–43, split into a2b1-021, a2b1-023 and b1b2-018;
  - `docs/TEXTBOOKS.md` maps the grammar book's whole table of contents to course lessons, with gaps marked „—”.
- Checks: library, services, worksheet-generator, worksheet-studio and board suites: 1234 passed, 3 skipped. eslint: 0
  errors.
- Later the same day:
  - grammar book 1.2–1.5 (pp. 11–17) went into a2-003, a2-006, a2-007 and a2b1-008;
  - the sheets show only „Õpik, lk …”;
  - the inline markup gained ~~struck out~~ and ***bold italic*** (richText.js, ui.jsx Md; button „S” in the on-sheet editor bar), so textbook pages copy 1:1;
  - `textbook.test.js` fails if any markup shows as text.
- Not done: nothing is published. The sheets carry no title, author or source line (owner 2026-10-21).
- Published 2026-10-21 (owner „заливай”): the 7 Õpik sheets (a2b1-021, a2b1-023, b1b2-018, a2-003, a2-006, a2-007, a2b1-008) went to production as v1 with a script like publish-v2.cjs (role focus, slot 4, worksheetVersions snapshot, lesson summary). A dry run afterwards found all 7 the same.
- Next safe step: further chapters go the same way: the textbook JSON, then tests, then the dry run, then publishing.
## 2026-10-21 · agent/ek9-install — 9. klass emakeel: the 30-lesson curriculum and its installation

- Owner: yes to both steps (install the grade 9 lessons and publish module 1).
- `crm-v2/src/features/curriculum/ek9Curriculum.js` (+ test):
  - 6 modules × 5 lessons (ek9-001…030), each fifth lesson a check;
  - module topics from the exam description and the PRÕK grade 7–9 spelling topics;
  - `ek9CurriculumRecords()` gives curriculumLessons records: subject „Eesti keel”, level „9. klass emakeel”, topic
    „NN. module”, curriculumId `est-ek9-emakeel-v1`, roadmapManaged, and a Russian lesson plan for the teacher.
- The test checks that module 1 in code (ek9/module01.js) has the same ids, titles and module.
- Production (with the owner's yes): one-off creation of the 30 records (existing ones are skipped) and publishing of
  module 1 (15 sheets) with publish-v2.
- Done 2026-10-21:
  - `curriculumLessons/ek9-001…030` created (dry run 30 new / 0 existing; a re-run shows 30 existing; the script only
    `create()`s, never overwrites);
  - module 1 published as v1 (dry run 15 new, apply 15, re-run 15 „same”, 0 manual/draft/missing).
  The scripts and JSON are in the session scratchpad (ek9-install.cjs, publish-v2.cjs); the records come from
  `ek9CurriculumRecords()` at this commit.
- Next safe step: modules 2–6 by the same pattern.

## 2026-10-21 · agent/native-ek9 — Estonian as a mother tongue: grade 9 module 1 and the native-level norms

- Owner: start without textbooks; take the curriculum and material from official sources.
- Read the official sources:
  - Harno's 2026/2027 exam descriptions for grade 9 and grade 12;
  - PRÕK 2011 lisa 1 spelling topics;
  - Harno postponed the grade 9 e-exam by a year (ERR).
  The facts are recorded in `docs/NATIVE_ESTONIAN_9_12_PLAN.md`.
- Built:
  - native levels EK9 / EK12 in the didactics norms;
  - strict scoring of spelling tasks (commas and capitals count);
  - course `ek9` with module 1 „Tekstimõistmine” (5 lessons × 3 sheets, original texts), in strictModules.
  Details are in the plan doc, section „State”.
- Checks:
  - module gates: no problems;
  - `course.test.js -t ek9`: 4/4;
  - worksheet-generator + worksheet-studio + library + test + homework: 1090 passed, 3 skipped;
  - nativeLevels.test.js: 5/5;
  - eslint: 0 errors.
- Not done: the curriculumLessons installer and publishing (production; owner's yes); modules 2–6; grade 12.
- Owner: the level is named „9. klass emakeel” (and „12. klass emakeel”); `nativeStage` reads both forms.
- Next safe step: the owner reviews module 1 in the course production page preview.

## 2026-10-21 · agent/native-estonian-plan — plan: Estonian as a mother tongue, 9. and 12. klass

- Owner: prepare Õppevara for Estonian as a mother tongue (9. and 12. grade).
- Added `docs/NATIVE_ESTONIAN_9_12_PLAN.md`:
  - the exam goals: põhikooli lõpueksam, an e-exam from spring 2027; riigieksam with a reading part and an essay of
    at least 400 words;
  - a draft outline (2 × 6 modules × 5 lessons);
  - the technical steps: data manifests, registry `ek9` / `ek12`, level `9. klass` / `12. klass`, a native norm set,
    the installer, task types;
  - four open owner questions; three are answered: both pupil groups (bilingual core plus „Raskem” tasks), 30
    lessons a grade, subject „Eesti keel” + level. The textbooks are still open.
- No code, data or rules changed. The exam facts come from open sources and must be checked against Harno's exam
  description.
- Next safe step: the owner's answers, then `ek9` module 1 as a sample.

## 2026-10-21 · agent/course-v3-c1-m8 — C1 module 8 rewritten to the v3 lesson pattern

- Owner: make the courses complete, start with C1 module 8. Lessons est-c1-071…079 are now `template: 'v3'`, and the
  module is `design: 'v2', template: 'v3'`.
- What every lesson (071–079) now has:
  - Avasta: the reading is split into paragraphs A–G, followed by a „Millises lõigus?” task (Harno task 1).
  - Harjuta: a choice cloze (Harno task 3), a sentence insertion with one extra sentence (Harno task 2), „Pane sõnad
    õigesse vormi” in a text, a 10-sentence RU→ET translation and a 2–3 minute monologue to a plan.
  - Kasuta: a material reading of at least 400 words (except the grammar lessons 078/079, which work on a longer
    colleague draft), a writing task of 14–18 sentences (~220–260 words) with a rubric, and speaking [120, 210].
- Changes per lesson:
  - 075 / 076 / 077: new transfer materials (course press release, dog park debate, Estonian film funding).
  - 078: indirect speech, cloze and formtext on the kaudne kõneviis, a longer meeting summary to edit, and a new rubric.
  - 079: plain-language transformation, „majja / tuppa” formtext, and a longer homepage draft.
- 080 is marked `assessment: true` („Mooduli 8 eksam (Harno C1 vormis)”), like 070. Its selfchecks are removed and
  speaking is [120, 210].
- Generated from scratchpad scripts c1m08_071…080.py (run_c1.sh 08); the files are module08.js and module08b.js only.
- Checks:
  - module gates: no blocking „!!” for 071–080; module-same fixed by reordering 077 practice;
  - `npx vitest run src/features/worksheet-generator`: 705 passed, 3 skipped.
- Not done: publishing to production (`publish-v2.cjs`) needs the owner's yes.
- Next safe step: owner review, then the publish dry run.

## 2026-10-21 · agent/gcal-cleanup — Google chip error, refused deletions, old tokens out of users/{uid}

- Owner: what is the „Google: viga” error? Found:
  - KeeleSepp → Google push works (last successful push 2026-10-21).
  - The red chip came from deleting three weekly lessons that had once been imported from Pavel's Google calendar
    (Mon 9:00, Wed 16:00, Thu 9:00). Their events come from another calendar, so Google answers 400 Bad Request.
    Each new attempt set `lastPushError` again, and 9 delete jobs piled up in `calendarSyncOutbox` (Oct 5–21).
  - The chip date „5. okt” was `lastSyncAt`, the import time; import has been off since 2026-10-05.
  - **Security:** users/{uid}.gcal of Pavel and Anhelina Korotka still held the old OAuth access/refresh tokens.
    Every teacher can read users docs (`isStaff`). The migration to calendarConnections wrote the public metadata with
    a merge, which kept the token fields.
- Changes:
  - functions `isGoogleRejectedError` (400/403, calendar-sync-core.js + test). A refused deletion of a deleted or
    cancelled lesson is logged, not queued and not shown as a sync error. A refused outbox job is dropped.
  - `LEGACY_TOKEN_FIELDS_DELETE` removes accessToken/refreshToken/expiryDate (and snake_case forms) from users.gcal
    on every public-metadata write (load/migrate/save).
  - The CRM chip shows the latest of lastPushAt / lastGroupPushAt / lastSyncAt (`lastActivityAt`).
- Checks:
  - functions `node --test` 319/319;
  - `npx vitest run src/features/google-calendar` 12/12;
  - eslint on google-calendar: 0 problems.
- Manual: the refused events probably still sit in Pavel's Google calendar; remove them there. Pavel and Anhelina
  should reconnect Google in CRM settings so the exposed tokens are replaced.
- Done 2026-10-21 (owner: „то что лучше”):
  - functions deployed from main 937b3ea.
  - Production cleanup: accessToken/refreshToken/expiryDate removed from users.gcal of the 2 users, and the 9 „Bad
    Request” outbox jobs deleted. Backup (outbox jobs and the removed field names, no tokens):
    /Users/pavel/KeeleSeppTranscriber/backup-gcal-cleanup-2026-10-21.json.
  - Pavel's stale lastPushError cleared.
  - A re-run of the dry run shows 0 / 0.
- Next safe step: Pavel and Anhelina reconnect Google in CRM settings.

## 2026-10-21 · agent/match-layout — „Ühenda paarid”: the answer slot stands in front of its question

- Owner (screenshot of Kontroll 12, task „Küsimus ja vastus”): unclear how to do it, and crooked. The letter slot sat at
  the far end of the left column, next to the A–F list, so it read as part of the right column, and the rows of the two
  columns did not line up (an is-tall card also turned the rows back into list items).
- Owner then: the student should write numbers at the letters. Now the questions are numbered (1, 2, …) on the left;
  on the right each lettered answer (A, B, …) has a slot in front where the student picks the question's number.
  Answer keys are `r<k>` (k = position of the answer, value = question number). Answers saved before this (keys 0, 1, …
  with letters) are recognised and still shown and scored the old way (`.ws-match.is-legacy`). Interactive hint: „Kirjuta
  iga vastuse ette sobiva küsimuse number.”
- Files: worksheet-studio/engine/blocks/tasks.jsx (match View), worksheet-studio/engine/sheet.css.
- Checks: `npx vitest run src/features/worksheet-studio src/test src/features/library` 335/335. Print and interactive views were checked on
  the local stand.
- Next safe step: none needed after merge (frontend deploys with main).

## 2026-10-21 · agent/assign-single-task — assign one task of a sheet

- Owner: be able to assign a single task, not only the whole sheet.
- The block bar of a published, saved sheet in the constructor has „Määra” on every task block. It opens Õppevara with
  `?assign=<lesson>&leht=<phase>&plokk=<block id>`. LibraryPage `singleTaskItem` narrows the published doc to that one
  block (meta kept) and the usual assignment dialog opens. The title is „<lesson> · <sheet> · <task title>”. A block that
  is not on the published version gives an error and no dialog. The assignment is a normal worksheetAssignment with that
  one-block worksheetDoc. No schema, rules or service change.
- Files: worksheet-studio/WorksheetStudioPage.jsx, worksheet-studio/icons.js (Send), library/LibraryPage.jsx (+ test).
- Checks: `npx vitest run src/features/library src/features/worksheet-studio/WorksheetStudioPage.test.jsx` 68/68;
  eslint 0 errors.
- Next safe step: merge (frontend deploys with main).

## 2026-10-21 · agent/board-sheet-align — the student's sheet lies exactly like the teacher's

- Owner: check that the student sees the sheet as the teacher does and that a task the teacher clicks is highlighted.
- Checked on a local stand with both boards side by side (shared worksheet, live focus): the whole sheet on both (10
  tasks), a teacher's click marks the task on both and moves the student's view to it. Found: the student's sheet sat
  9 px lower (the inline player's 1 px border + 8 px canvas margin from worksheetStudio.css won over board.css), so the
  teacher's drawings landed slightly off. board.css now removes them on the board with a stronger selector; afterwards
  every task had the same position on both boards.
- Next safe step: merge (frontend deploys with main).
## 2026-10-21 · agent/school-covered-button — „Kooli kulul” as the fourth way to close a lesson

- Oleksiy (team chat 2026-10-19): next to „Tund toimus / Puudus (teatas ette) / Puudus (ei teatanud)” a fourth button
  „refund from the school”. Since #680 an admin could only set „Kooli kulul” on an already held lesson.
- Now the unmarked lesson panel (admin) has „Kooli kulul” → reason → „Tund toimus kooli kulul”: the lesson is marked
  held (teacher's hour counts) and right away `setLessonBillingDisposition(id, 'school_covered', reason)` (audited; the
  token trigger gives back a credit). If the second step fails, the panel says so and the existing link on the held
  lesson finishes it. Teachers do not see the button. Frontend only (no function change).
- Checks: vitest calendar 104/104, eslint clean.
## 2026-10-21 · agent/self-payer-parents — „Lapsevanemad” keeps a learner who pays for themselves

- main checked: origin/main. Oleksiy (team chat 2026-10-20, #bug #high_priority): „See on õpilane” (parent → own
  learner) removed the person from Lapsevanemad, the main tab for watching payers.
- Fix: `parent-to-student-core.js` marks the account `selfPayer: true`; `parentsService.list` lists self-payers too;
  `parentMatchesStudent` gives them their own card (linkedUserId / studentUid / linkedUserIds); badge „Õpib ise”.
- Production: one account was converted before the fix (Olena Polishchuk, 2026-10-20) — gets `selfPayer: true` after
  deploy with the owner's permission.
- Checks: vitest parents + services 172/172, functions parent-to-student-core 3/3.
- Deploy after merge: `functions:staffOperationsApi`.
## 2026-10-21 · agent/student-availability — „Sobivad ajad” in the student's and parent's pages, on the card, notifications

- main checked: origin/main. Owner: put the /ajad table into the student and parent cards, notify us when a student's
  times change so we can offer a time quickly, and let the admin open „Sobivad ajad” on the student's card.
- Data: `studentAvailability/{studentId}` — slots / preferred (half hours „Mon-16:00”), message, changedAt / By / Role,
  previousSlots / previousPreferred, reviewedAt / ByName. Rules: the card's student or parent writes their own (never the
  review mark, changedByUid = self), the admin writes any and marks reviewed, the student's teacher reads.
- UI: `AvailabilityCard` (features/availability-poll): student home „Millal sulle tund sobib?”, parent home one per
  child, student card (admin edits and „Vaadatud”, shows „Mis oli enne”; teacher reads). Notification bell (admin):
  „<name> muutis sobivaid aegu” until reviewed, links to /students/<id>#sobivad-ajad. The public /ajad page and
  Päringud are unchanged.
- Checks: vitest students/parents/components/notifications/availability 122 + card 3/3, eslint clean; emulator rules
  test in security-access-emulator.integration.js (CI).
- Deploy after merge (owner permission): `firestore:rules`; the pages go with main.

## 2026-10-21 · decision — lesson packages (tokens) stay

- Owner 2026-10-21: lesson packages are the lesson token system (Tunnipakett: studentPackages, packageLedger, token
  invoices, `syncLessonTokens`); they stay untouched. The earlier plan's step 5 „remove packages” (2026-10-20) is
  cancelled — ignore it in the entries below. Production has 0 packages in use; nothing was removed.

## 2026-10-21 · agent/bank-visual — the statement import as a bank feed

- main checked: origin/main after #694. Owner: make the last update look pleasant. The import preview is no longer a
  wide table: one card per payment (stripe green = sure, amber = suggestion, grey = manual), payer and date with the
  explanation, the amount, the invoice(s) as pills (split payments as several pills, the rest as „… ettemaksuks”), the
  reason, the badge and „Muuda” that opens the invoice / advance choosers. The counts are a filter (Kõik · Kindel ·
  Kinnita soovitus · Vali käsitsi); the sticky footer shows „Valitud N makset · summa” and „Seo valitud maksed (N)”.
  Same labels for screen readers and tests. vitest finance 141/141, eslint clean, looked at on a local stand.

## 2026-10-21 · agent/bank-matching — bank statement: payer memory, split payments, sure vs suggested matches

- main checked: origin/main (2026-10-21). Owner: points 1–3 — remember the payer's account, one payment for several
  invoices, auto-apply only sure matches and show the rest as suggestions to confirm.
- Statement: the payer's account column („Saaja/maksja konto”, „Sender/receiver account”…) is read (`payerAccount`).
- `matchBankRow` (bankReconciliation.js): sure = invoice reference or number in the explanation (several numbers →
  several invoices), or the payer's account paid for the child before and the amount equals that child's open invoice or
  an exact set of them; likely = name + amount, the payer's name paid for the child before, or a family's invoices that
  add up exactly. `payerMemory` learns from bank transactions (`payerAccount`, `paidStudentIds`), payments made from them
  and the 2026-10-15 LHV payments (their note names the bank payer). Sure rows come ticked, likely rows show the
  suggestion unticked („Kinnita soovitus”, „Vali kõik soovitused”), the rest „Vali käsitsi”. A split shows „Jagatakse:”.
- Server `allocateBankTransaction`: stores `payerAccount` (IBAN, no spaces) and `paidStudentIds`; financeApi sends
  `payerAccount` and several `allocations`. Nothing was changed in existing data.
- Checks: vitest finance 141/141, functions node --test 319/319, eslint clean; emulator test „one bank payment pays two
  invoices … remembers the payer's account” (CI).
- Deploy after merge (owner permission): `functions:financeApi`.
- Next: LHV Connect for automatic statements (the owner asks LHV first).

## 2026-10-20 · agent/availability-names — „Sobivad ajad”: student's and parent's full name required

- main checked: origin/main after #691. Owner: add the parent's first and last name and make it and the child's
  required. The page asks „Õpilase (lapse) ees- ja perekonnanimi *” and „Lapsevanema ees- ja perekonnanimi *” (two
  words each, checked in the page and in functions/website-lead-core.js: `parentName`, errors `name` / `parentName`).
  Päringud and the e-mail show „Lapsevanem”. Checks: vitest 4/4, functions 9/9, eslint clean.
- Then (owner): a box „Olen täiskasvanud õpilane / Я взрослый ученик” hides the parent field; `adult: true` lets the
  server accept no parent; Päringud / e-mail show „Lapsevanem: — täiskasvanud õpilane”. vitest 5/5, functions 10/10.

## 2026-10-20 · agent/availability-design — „Sobivad ajad”: better look, texts and its own link preview

- main checked: origin/main after #689 (2026-10-20). Owner: improve quality, look and description; anyone with the link
  must open it.
- Checked: `/ajad` opens without a login (built-in browser, signed out). Added `crm-v2/ajad.html` (second Vite entry,
  same app) with its own title, description and og:image, and a Vercel rewrite `/ajad → /ajad.html`, so WhatsApp /
  Telegram / e-mail show „Millal sulle tund sobib? · Когда вам удобно заниматься?” instead of the CRM's bare title.
- Page: sticky header with brand and ET/RU switch, 3 steps, a highlighted „mark EVERY time that really works” note,
  quick choices (weekday evenings 17–21, weekday days 9–17, weekend 10–18, clear), the grid with sticky day row and
  morning / day / evening sections, ✓ / ★ marks, a live summary per day, chips for subject / lessons per week / format,
  privacy line, success screen with „send another”. Model helpers `withPreset`, `summaryOf` (pollModel.js).
- Checks: vitest availability-poll + leads 3/3, app/hostingHeaders 2/2, eslint clean, vite build makes dist/ajad.html;
  looked at 375×812 and desktop on a local stand.
- Owner 2026-10-20: the page is mostly for CURRENT students now (too many to fit the times by hand): one general link,
  answers in Päringud as before, but without what current students do not need — no subject, lesson count, format or
  goals. The form asks only name, phone or e-mail, the times and an optional comment; texts speak of a new timetable.
  `website-lead-core.js`: availability needs no subject; lesson count / format only when sent; the e-mail drops
  „Tase”, „Keel”, „Tunde nädalas”, „Vorm”. Päringud: „Kommentaar” instead of „Eesmärk”, no empty fields; ★ cells keep
  their colour outside the poll page; times per day as text above the grid.
- Deploy after merge: `functions:websiteLeadApi` (the page goes with main).
- Next: match the answers with the teachers' free windows and the calendar to propose a timetable (owner confirms).

## 2026-10-20 · agent/student-sheet-full — Live Classroom: the student sees the whole worksheet

- main checked: origin/main (2026-10-20). Owner screenshot: the student saw only the top of the sheet (title, picture)
  and the „Salvesta / Esita tööleht” bar right under it; the teacher saw the whole sheet.
- Cause: the student's player (DocWorksheetPlayer, board mode) carries `.ws-studio`, the constructor's full-screen frame
  (`height: calc(100dvh - 96px); overflow: hidden`). On the board the sheet was clipped at the window's height and the
  board measured only that much, so the student could not move further down. The teacher's player has no such frame.
- Fix (board.css): `.sb-underlay .ws-studio` and `.sb-reading .ws-studio` get `height: auto; overflow: visible`, and the
  phone reading page drops the inline canvas's 75vh limit. Checked on a local stand (1280×650): the student's sheet
  grew from 682 px to its full 6654 px and scrolls down to the tasks.
- Next safe step: merge (frontend deploys with main); the owner checks a student's sheet in a lesson.
## 2026-10-20 · agent/subject-prices — one learner, several subjects: step 4 (price per subject, one invoice)

- main checked: origin/main after #687 (2026-10-20). Owner: subjects may have different prices; one invoice per payer
  with a line per subject; no packages; billing by agreement (by the 10th or after lessons) stays.
- Data: `studentRevenuePlans/{studentId}.subjectPrices = { "Matemaatika": { lessonPriceCents, lessonMinutes } }` — the
  card's own price is its main subject's (`mainSubject` in students/subjects.js); a subject without a price is billed
  at the card's price. firestore.rules allow the field (map, ≤ 8). Saved with `mergeFields` so a removed price goes.
- Billing: `monthlyBillingRows` gives a multi-subject card `subjectParts` (lessons by subject via `itemSubject`, own
  price and length, own correction against its part of last month's invoice — an invoice from before subjects counts
  for the main subject). `invoiceItems` → one item per subject; 2+ items go to `/monthly-combined` (now accepts one card
  twice with different subjects: `monthlyItemsInput`, `planForSubject` in functions/combined-invoice-core.js), one item
  to `/monthly` with `subject`. A non-language subject's line says „Tunnid”, not „Keeletunnid”.
- UI: Finantsid → card „Arveldus” has a price and length per further subject; Kuuarved shows the subjects of a row.
- Not changed: per-lesson invoices from „Tunnid → arve” (LessonAccountingPanel) still use the card's price.
- Checks: vitest finance/students/services/parents 390/390, eslint clean, functions node --test 316/316; emulator
  test „one card, two subjects” in finance-emulator.integration.js (CI).
- After merge (owner permission): deploy `firestore:rules` and `functions:manualInvoiceApi`; then copy the maths price
  of Stefania and the English price of Aleksandr Smirnov from their archived cards' plans into `subjectPrices`.
- Next: (step 5 „remove packages” cancelled 2026-10-21 — packages/tokens stay.)
## 2026-10-20 · agent/availability-poll — „Sobivad ajad”: a page the school sends to learners to mark suitable times

- main checked: origin/main (2026-10-20). Owner: a Mon–Sun table to send to anyone who wants lessons, as simple as
  possible, asking for every time that REALLY suits a lesson, not only the preferred one.
- Public page `https://crm.epkoolitus.ee/ajad` (no login; ET/RU, Russian browsers start in RU): hours 8–22 × Mon–Sun,
  tap = sobib (light green), tap again = ★ best, third tap clears; a finger drag paints (skipped hours in one day are
  filled); a day name marks the whole day. Then name, phone or e-mail (one is enough), subject (Eesti keel, Inglise
  keel, Matemaatika, Muu), lessons per week, online/kohapeal, comment; honeypot.
- Sent through the existing public `websiteLeadApi` (per-IP limit, honeypot, e-mail to info@): source `availability`,
  `slots` / `preferred` as half hours ("Mon-16:00"), `format`, `lessonsPerWeek` (functions/website-lead-core.js,
  `slotSummary` in the e-mail: „E 16:00–19:00 (★ 17:00–18:00)”). It lands in Päringud with a read-only week grid.
- Files: `crm-v2/src/features/availability-poll/*`, routes.jsx (lazy public route), leads/LeadsPage.jsx + leads.css,
  functions/website-lead-core.js (+ test). Checks: vitest availability-poll 3/3, functions website-lead-core 8/8,
  eslint clean; tried on a local stand at 375×812 (marking, ★, drag, form).
- Deploy after merge (owner permission): `functions:websiteLeadApi`; the page itself goes with main. The link carries
  no personal data — the learner types name and contact.
- Next: match the answers with the teachers' free windows (Õpetaja ajad) when choosing a teacher.

## 2026-10-20 · agent/teacher-own-subject — one learner, several subjects: step 3 (a teacher sees only their subject)

- main checked: origin/main after #685 (2026-10-20). Owner: a teacher of another subject must not see what is not theirs.
- Correction (2026-10-20, after checking): teacher-scoped reads are ON in production since 2026-08-05
  (`securityMigrations/teacherUidV1.readEnforced: true`, enforced by the owner); an earlier note here said OFF — that
  was a truncated read. Lessons, schedule and student cards were already per teacher; homework, messages, worksheets
  and results were readable by any teacher until this PR. Also: the student card refused the second subject's
  teacher („Ligipääs puudub”) because it compared only the card's main `teacher`.
- This PR: port of #517 — `staffCanAccessStudent()` for homework, messages, worksheetAssignments, exerciseResults (a
  teacher only of cards with their uid in teacherUid/teacherUids; by name until enforcement); messages unread count and
  sheet results query by own students; calibration card admin-only. Subject level: `lessons/schedule.listByStudent(id,
  { teacherUid })`; the student card lets in a teacher of any track (`teacherTracks` in subjects.js), loads only their
  lessons and schedule, shows only their subject (header, overview) and only works they gave or of their subject.
- Tests: vitest 581 (students, parents, services, components, worksheet-studio, generator ui), eslint clean; emulator
  tests: #517 ones + „two teachers of one child” (security-access-emulator.integration.js) — CI.
- Deployed 2026-10-20 (owner „сливай и выкладывай”): #686 merged, live rules checked equal to main, then
  `firebase deploy --only firestore:rules`. The 4 cards without a teacher got one (owner): Viktoria and Aleksei Merzin —
  Pavel Zakutailo; „Михаил Мач” and „Mihhail” — Jegor Fjodorov (probably one boy; not merged, owner: do not touch).
- Verified in production as two teachers (custom-token sign-in, reads only): own students, schedule, lessons, homework,
  worksheets, results and messages load; a foreign card is refused; on a shared child the teacher's own lessons load
  and „all lessons of the child” is refused.
- Next: price per subject + one invoice with lines per subject → remove packages.

## 2026-10-20 · agent/subject-switcher — one learner, several subjects: step 2 (subject switcher)

- main checked: origin/main after #684 (2026-10-20). Production data done earlier today with the owner's permission:
  subject backfill (136 lessons, 121 Google-synced schedule entries, 51 homework; 352 never-synced schedule entries left
  untouched so no write pushes old lessons into teachers' Google calendars — the CRM places them by teacher), 8 pairs of
  cards merged (`functions/student-merge.js`, schedule moved, finance left on the archived cards): Stefania, Georg,
  Aleksandr and Mihhail Smirnov now have two subjects on one card; Artur Karpovits, Timur, Mariam, Monika lost a
  duplicate. The two Marias are two children (owner). Script logs: activityLog `subject.backfilled`, `student.cards_merged`.
- This step: `crm-v2/src/features/students/subjects.js` (subject of a record: own field → teacher's track → the card's
  only subject) and `SubjectSwitcher.jsx` („Kõik · Eesti keel · Matemaatika”, shown only with 2+ subjects).
  Parent home: switcher filters upcoming lessons, done lessons, homework and the child's tracks; a lesson shows its
  subject under „Kõik”. Student home: switcher filters next lesson / lessons / homework; „Minu areng” (Estonian course)
  only for Eesti keel or „Kõik”. Student card (staff): subject tracks in the header, switcher filters the Tunnid tab.
  Invoices are not filtered (one invoice per family).
- Checks: vitest students + parents 97/97 + subjects.test 2/2, eslint 0 errors.
- Next steps: teacher sees only their subject (UI + firestore.rules) → price per subject + one invoice with lines per
  subject (Stefania maths and Aleksandr English prices stayed on the archived cards) → remove packages.

## 2026-10-20 · agent/board-page-menu — Live Classroom: the page ⋯ menu names its page; right click on any tab

- Owner 2026-10-20 (screenshot): could not delete a sheet in the lesson. The ⋯ button stood after all tabs (next to the
  worksheet tab) while it acted on the open page („Leht 3”), and the menu was rendered inside the scrolling tab strip.
- Now: ⋯ stands right after the open page's tab and its title names the page; a right click on any page tab opens the
  menu of that page (delete it without opening it); the menu shows the page name, is rendered in `document.body`
  (portal, own styles in board.css) and tells when a completed lesson page cannot be deleted. Deleting another page keeps
  the open one.
- Files: `crm-v2/src/features/board/StudentBoard.jsx`, `board.css`, `board.test.jsx`. Checks: vitest board +
  live-classroom 117/117, eslint clean.
- Same PR, owner 2026-10-20 („ученик с телефона нормально не может видеть лист…”): on a phone the A4 sheet (1000 px)
  was shrunk to ~33 % and could not be read or moved; a student who followed the teacher onto the sheet kept the pen,
  so one finger drew instead of moving or tapping fields. Now: under 700 px a worksheet page is a reading page — the
  sheet in one column (`.ws-narrow` rules at the end of `worksheet-studio/engine/sheet.css`: page/rows/grids single
  column, theme paddings, headers/footers hidden, 16 px inputs) in a native finger-scrolling box; the drawing dock and
  zoom are hidden; „Tahvlivaade” switches back to the board (teacher's drawings), „Lugemisvaade” returns. A pointed
  task scrolls into view. The student following onto a worksheet page gets the fill tool on any screen.
- Checked on a local stand at 375×812 (sheet readable, no sideways scroll, answer fields full width); vitest board +
  live-classroom + worksheet-studio 407/407 + 2 new phone tests, eslint clean. Not tried on a real phone yet.
- Next safe step: merge (frontend deploys with main); the owner deletes a page and a student opens a sheet on a phone.

## 2026-10-20 · agent/merge-subjects — one learner, several subjects: step 1 (merging cards keeps both subjects)

- main checked: origin/main after #682 (2026-10-20). Owner decisions 2026-10-20: one card per child with one enrollment
  per subject (own teacher, level, lessons, homework, progress, **own price**); lesson packages are dropped (production
  had 0 studentPackages / 0 ledger entries); one invoice per payer with a line per subject; a teacher sees only their
  own subject; parent and student get a subject switcher.
- Found: enrollments already exist in the CRM (calendar picks a track, card lists „Õppesuunad”), but production has no
  card with >1 enrollment: 9 children have two cards instead (4 genuinely two subjects, 5 duplicates of one subject).
  148 of 305 lessons and 550 of 674 schedule entries have no subject.
- This step: `functions/student-enrollments-core.js` (subject names, enrollments of old and new cards, merge of tracks);
  `student-merge.js` writes the union of enrollments + `teacherUids` to the kept card and marks the other card's moved
  lessons / schedule / work without a subject with that card's subject (finance records untouched). „Liida kaardid”
  preview shows „uus õppesuund” and the subjects after merging.
- Checks: functions unit (enrollments + merge core) 14/14; vitest students 78/78; eslint clean; new emulator test in
  student-merge-emulator.integration.js runs in CI (local Java < 21).
- Merged + `functions:staffOperationsApi` deployed 2026-10-20 (owner „сливай и деплой”). Production data 2026-10-20 (owner:
  „Muu это математика”): subject „Muu” → „Matemaatika” on the 8 cards that had it (activityLog `student.subject_renamed`).
  Waiting for the owner: subject backfill on lessons/schedule/homework and merging the 8 pairs (Maria: one child or two?).
- Next steps (separate PRs): subject backfill on lessons/schedule (dry run first) → subject switcher for parent/student
  and subject tabs on the card → per-subject teacher scoping in rules → price per subject + one invoice with lines per
  subject → remove packages UI/trigger.

## 2026-10-19 · agent/teacher-no-money — teachers see no invoices or amounts (port of #516)

- main checked: 7686fb4 (2026-10-19). Owner 2026-10-19: „Учитель не должен видеть сумму и счета”.
- Found: the live rules still let any teacher read every invoice of the school, edit an invoice description and read
  `emailQueue` (invoice / reminder e-mails with amounts); `invoiceApi` `/send` and `/remind` accepted a teacher.
- `firestore.rules`: `invoices` read = admin, bookkeeper (`isFinance`) or the invoice's own family; update = admin only;
  `emailQueue` read = admin or bookkeeper. `functions/index.js` `invoiceApi`: staff routes now require the administrator.
- Checked that nothing else gives a teacher money: student cards hold only lesson counts (production read: no price or
  balance fields), prices are in admin-only plans, payments / packages / ledgers are admin-only, CRM v2 loads invoices
  only for admin / bookkeeper. Kept on purpose: Kassa — a teacher records cash they took and sees only their own cash
  (owner: „принимать деньги от учителя может каждый”).
- Tests: `security-finance-emulator.integration.js` — teacher cannot read / edit an invoice, cannot send or remind even
  an own student's invoice, cannot list `emailQueue`; admin can edit the description. Runs in CI.
- Deployed 2026-10-19 (owner „сливай оба”): #681 merged; live rules were checked equal to main first, then
  `firebase deploy --only firestore:rules,functions:invoiceApi`.
- Next safe step: after deploy, open the CRM as a teacher and check the calendar, student card and Kassa still work.
## 2026-10-19 · agent/raamatukogu — „Raamatukogu” in Õppevara (port of #505)

- main checked: 7686fb4. Owner 2026-10-19: „Библиотеку нужно внедрить”; next the owner sends photos of the school's
  textbooks to digitise (separate task, copyright of each book to be checked first).
- Page `/library/raamatukogu` (button „Raamatukogu” in Õppevara, staff only): free external sources by category and the
  Harno level-exam links A2–C1; only one file is hosted (Peace Corps Estonian, US government work, public domain).
- Files: `crm-v2/src/features/library/raamatukogu/*`, `crm-v2/public/raamatukogu/*.pdf`, `routes.jsx` (lazy route),
  `LibraryPage.jsx` (button). Checks: vitest library + app 67/67, eslint 0 errors, vite build OK. External links not
  re-checked since 2026-10-11.
- Merged 2026-10-19 (owner „сливай оба”), frontend deploys with main. Owner: the textbooks are not ours, the school has
  the publisher's permission; plan — page photos + recognised text in Raamatukogu „Õpikud” (signed-in school users
  only, no download), then exercises as CRM sheets, then links from course lessons.
- Next safe step: the owner sends the photos and any limits of the permission.

## 2026-10-19 · agent/school-covered-lesson — „Kooli kulul”: a held lesson the school pays itself

- main checked: eef5885 (2026-10-19, after #679). Asked by Oleksiy in the team chat, plan approved by the owner 2026-10-19.
- What: a 4th way to close a lesson. The lesson stays **Toimunud** (the teacher's hour counts — payroll is workSessions,
  untouched), but the student pays nothing: `lessons.billingStatus = "school_covered"` + required reason
  (`billingDispositionReason`), set through the existing audited `POST /lessons/billing-disposition` (financeApi,
  admin only, financialAudit `lesson.billing_disposition_changed`, refused when the month is closed or the lesson is invoiced).
- Credits: `lessonTakesToken` (functions/lesson-tokens-core.js) returns false for it; `syncLessonTokens` now also reacts
  to this flag, so a credit the lesson already took is restored through the package ledger (`lesson_restoration`);
  undoing („Tühista „kooli kulul””, `billingStatus unset`, reason required) takes it again. `lessonBillingDispositionPatch`
  allows `school_covered` (only that) on a package-consumed lesson.
- Billing: not billable (`lessonIsBillable`), not chargeable in the monthly invoice (`monthlyBilling.isChargeable`),
  correction note counts „N kooli kulul”; Finance disposition dialog has the option too.
- UI: calendar lesson panel (admin, individual lessons) „Kooli kulul (õpilane ei maksa)” → reason → confirm; badge
  „Toimunud · kooli kulul”. Student card history and the parent home show „Tasuta (kooli kulul)”.
- Not yet: group lessons (attendance has no billing record per student); student portal wording beyond the parent home.
- Checks: functions node --test finance-core + lesson-tokens-core 55/55; vitest finance/calendar/parents/students 65 files
  327 tests + LessonPanel 7/7; eslint 0 errors. New emulator test in finance-emulator.integration.js — NOT run locally
  (local Java < 21), runs in CI.
- Deployed 2026-10-19 (owner „да”): #680 merged, `financeApi` + `syncLessonTokens` deployed, frontend via main.
- Next safe step: after merge + functions deploy, mark one real lesson in the calendar and check the package balance.

## 2026-10-19 · agent/www-public-only — www.epkoolitus.ee served the whole repository

- Found during the v1 retirement: the Vercel project „keelesepp” (www.epkoolitus.ee, output directory „.”, not deployed
  from git) served every uploaded file: `functions/index.js`, `firestore.rules`, `crm-v2/` sources, `AGENTS.md`, `docs/`
  (incl. PROJECT_STATE with some student names and card ids) and the v1 `api/` AI proxy (staff-only, rate-limited).
- Fix: `.vercelignore` uploads only the public website (index, ru, oppematerjalid, tasemetest, kutse, privaatsus,
  tingimused, icons, robots, sitemap, vercel.json). Deployed to production 2026-10-19 by CLI (owner: «старых убрать»,
  «чистим»): source files now 404, public pages 200, `/haldus*`, `/live-classroom*`, `/interactive-lesson*`, `/api/*`
  redirect to crm.epkoolitus.ee (`/haldus#registreeru` opens registration).
- How to deploy www from now on: from a checkout of `main`, `VERCEL_ORG_ID=team_QrqSG3j8wACTFZY4TFpKqRuQ
  VERCEL_PROJECT_ID=prj_ABArYIixd2dkQkF3JTAdKL2xBvTr npx vercel deploy --prod` (the project has no git integration).
- Next safe step: the owner decides whether the past exposure of internal docs needs any notice; consider git-linking
  the „keelesepp” project with root „.” and this `.vercelignore`.

## 2026-10-19 · agent/retire-v1 — the first CRM (v1) retired, repository cleaned

- main checked: origin/main after #676 (main = production, 2026-10-19). Owner: «всех надо перенести на новую а старых убрать», «чистим».
- Removed: `haldus*.html`, all `haldus-*` tools, `haldus*.js/.css`, old `live-classroom.html/js/css`, `interactive-lesson/`,
  `adaptive-lessons/`, `curriculum-goals/`, `tests/lesson-builder/`, the v1 serverless `api/` (an AI proxy only v1 used),
  `assets/worksheet-visuals/`, and ~120 browser modules and their tests in the root. Root keeps only the public website.
- Redirects (`vercel.json`): `/haldus*` → crm `/login` (the `#registreeru` hash still opens registration),
  `/haldus-calendar*` → crm `/calendar`, other `/haldus-*` and `/interactive-lesson*` → crm, `/live-classroom*` → crm
  `/live-classroom`. crm-v2 `vercel.json` no longer sends `/haldus` back to www.
- E-mail links: `APP_BASE_URL` default is now `https://crm.epkoolitus.ee/` (invoice and credit-note e-mails had a
  „Ava KeeleSepp kabinet” button into v1; Google Calendar OAuth fallback too). Needs a functions deploy to take effect.
- Õppevara: the „Ava töövahend” link into the v1 exercise tool is gone (exercises are edited with „Muuda” and assigned in
  v2; v2 already plays them in „Kodutööd”). `utils/legacyUrls.js` removed.
- Server tests: modules they need moved to `functions/test-fixtures/legacy/`; two tests that compared server copies with
  the deleted browser modules removed. CI: the root-module test step and the Builder browser steps dropped; the temporary
  `temp-apply-interactive-pdf-v1` workflow removed.
- Docs: 41 stale/v1 documents moved to `docs/archive/`; this file keeps entries from 2026-10-15 on, older ones are in
  `docs/archive/PROJECT_STATE_until_2026-10-14.md`; root `PROJECT_STATE.md` archived as `PROJECT_STATE_root_legacy.md`.
- Still deployed, not removed: `lessonDraftsApi`, `learningSessionApi`, `learningProfileEvidenceApi` (v1 server endpoints;
  `interactiveLessonApi` still needs `lesson-drafts-api`). Next: owner-approved `firebase functions:delete` for the first three
  after the code is decoupled.
- Checks: functions `node --test` 306 passed; crm-v2 lint 0 errors, library tests 47 passed, build ok.
- Next safe step: merge (Vercel deploys crm and www), deploy `invoiceApi`, `financeApi`, `sendInvoicePaymentReminders`,
  `gcalApi` for the e-mail link, check the redirects live.

## 2026-10-19 · agent/sentence-breakdown — „Lause lahti”: a sentence taken apart (like sonastik.app)

- Checked `main` f9b9fbb (2026-10-19). Branch `agent/sentence-breakdown`, draft PR (see GitHub).
- Owner 2026-10-19 („Нам тоже такое надо”, screenshot of sonastik.app): every word with its base form, the
  multi-word verb („aru saama”, rektsioon) and the translation.
- Done:
  - `functions/sentence-core.js` (pure, tested in `sentence-core.test.js`): EKI etLex morphology → tokens with lemma,
    part of speech (et + ru), form (et + ru: cases with the question words, verb forms), level; our list of ~140
    multi-word verbs / verb phrases with Russian and government (`PHRASES`), found by verb lemma + particle anywhere in
    the sentence; punctuation spacing.
  - `functions/index.js` languageApi `POST /analyze` (any signed-in user): etLex (public) + TartuNLP translation of the
    sentence and of each content lemma (public, `x-api-key: public`); cached in `languageCache` by the sentence.
    Only the sentence is sent out.
  - UI `features/vocabulary/SentenceBreakdown.jsx` (+ `sentenceBreakdown.css`): words coloured by part of speech
    (noun blue, verb green, adjective red, expression amber) with the base form under them; a tap shows form + gloss;
    „Väljendid” with government; „Tõlge”. Entry points: the worksheet word card (double click / double tap) →
    „Võta lause lahti” opens the sentence around the word (`sentenceAt`, `sentenceAround` in WordLookup.jsx); and a
    card „Võta lause lahti” on the student's „Sõnavara” page. Service `languageToolsService.analyzeSentence`.
- Checks: `node --test` in functions 301 passed; `npx vitest run` 1948 passed; eslint on changed UI files clean;
  `vite build` ok. Checked live against EKI and TartuNLP from a local script (3 sentences: lemmas, forms, „maha jätma”,
  „kätte saama”, „ühendust võtma”). Visual check at desktop and 375 px width.
- Limits: the expression list is ours and finite; EKI may mis-analyse rare words.
- Deployed 2026-10-19 (owner: «да, деплой и публикуй оба»): `firebase deploy --only functions:languageApi` (no other open branch changes languageApi) and the frontend in `dpl_4sQDrN8mg2e6vF83H3H24EL5F2nY` (bundle contains „Võta lause lahti”).
- Next safe step: the owner tries „Võta lause lahti” as a student; add expressions to `PHRASES` when one is missing.
## 2026-10-19 · agent/board-tab-menu — Live Classroom: page ⋯ menu, one page per phase sheet, course order

- Checked `main` f9b9fbb (2026-10-19). Branch `agent/board-tab-menu`, draft PR (see GitHub).
- Owner 2026-10-19: empty duplicate board pages, no way to delete a page; the pencil should become „⋯” with rename / delete /
  give to the student; the sheet picker listed lesson 5, then 16, …, 90, then 56.
- Done:
  - `StudentBoard.jsx`: the pencil next to the open page is now „⋯” (`Lehe toimingud`): „Nimeta ümber” (everyone), „Määra
    õpilasele õppimiseks” (when the host passes `onAssignPage`; Live Classroom teacher), „Kustuta leht” (staff, confirm,
    not for completed pages). New service method `deletePage(studentId, pageId)` in `services/firebase/studentBoard.js`
    (elements best-effort, then the page). `firestore.rules` already allow staff to delete a non-completed lesson page
    (whiteboards and groupBoards) — no rules change.
  - Empty duplicates: the Avasta / Harjuta / Kasuta sheets of a lesson share a title, the board found a sheet's page by
    title, so only one page showed a sheet and the others stayed empty. `boardModel.sheetBoardTitle(item)` adds the phase
    („Kontroll 1 · Harjuta”); LiveRoom / TeacherWorkspace pass it plus `legacyTitle`; the old shared page stays with the
    newest sheet of that title, the others get their own page. Old empty duplicates are removed by hand with „Kustuta leht”.
  - „Määra õpilasele”: LiveRoom opens „Kodutöö” (`LessonHomeworkPanel`, new prop `assignPage`) with the page ticked and
    the task „Õpi tahvlilehe „…” materjal.” — the existing homework with `boardPageId` (student opens it from „Kodutööd”).
  - `roomWorksheetChoices.js`: curriculum sheets sorted by level, then lesson number (module title only as a tie-break);
    „Järgmine tund” therefore follows the course (after 5 comes 6). A sheet on the board is matched by phase, not title.
  - Student scrolling the sheet (owner 2026-10-19: „ученик мог сам листать лист”): a focused answer field (iPad
    keyboard) or the teacher's pointed task (`scrollIntoView`) scrolled the overflow-hidden board stage, the sheet stayed
    shifted and its top / end could not be reached. `StudentBoard` now turns any stage scroll into a move of the view and
    keeps the stage at 0; `DocWorksheetPlayer` on the board sends `ws-reveal` instead of `scrollIntoView`, the board
    moves to the pointed task once.
- Checks: `npx vitest run` — 1951 passed, 2 failed in `CourseProductionPage.test.jsx` only under the full run (pass alone,
  85/85 with live-classroom; timeout under load, unrelated). eslint on changed files clean; `vite build` ok.
- Limits: on the student's own board page (`/board`) „Määra õpilasele” is not shown (no lesson to attach homework to).
- Deployed 2026-10-19 15:16 (owner: «деплой»): production = 512a852 + this branch (15c5f21, 5efb5a0, 0eabbec, 18d1708)
  + calendar 1019c2a, `dpl_BjwhCWwLd6M1AeowQ3teN8K2VcAH` on crm.epkoolitus.ee (bundle contains „Lehe toimingud”).
  Rebased on `agent/board-scrollbar` (PR #666, already in production); PR #672 base is that branch.
- Next safe step: the teacher removes the old empty duplicate pages with „⋯” → „Kustuta leht”.
## 2026-10-19 · agent/course-v3-c1-m7 — C1 module 7 in template v3

- Branch `agent/course-v3-c1-m7` is stacked on agent/course-v3-c1-m6 (#673). Draft PR.
- Done: C1 module 7 (est-c1-061…070, mobility, environment and planning) in lesson template v3, the same way as modules 4–6. 070 is the module exam (`assessment: true`).
- Every Kasuta has a new reading of 400+ words (office move, Paris strike, rural municipality, coastal adaptation plan, wind park, logistics centre, housing association, draft news story, bus line 7). 068 and 069 now have a Kasuta rubric.
- No new audio: 061 keeps its radio interview; the transcript is unchanged, one question was added.
- Checks: `moduleProblems` has no problems for module 7. `npx vitest run src/features/worksheet-generator`: 704 passed; `CourseProductionPage.test.jsx` timed out once in the full run and passes alone (2/2).
- Production (owner's permission, 2026-10-19 „да, деплой и публикуй”): `vercel deploy --prod` of 8ca61d8 + board tab menu + „Lause lahti” + the calendar fix, `dpl_8Lxcx5iV459SQEmS8uWGyqiADKa5`. All 30 sheets of module 7 published with `publish-v2.cjs` (earlier v7 = batch write of 2026-10-13 22:10; dry check same=30).
- Not done: C1 modules 8–10.
- Next safe step: C1 module 8 the same way.

## 2026-10-19 · agent/course-v3-c1-m6 — C1 module 6 in template v3

- Branch `agent/course-v3-c1-m6` is stacked on agent/course-v3-c1-m5 (#671). Draft PR.
- Done: C1 module 6 (est-c1-051…060, health and society) in lesson template v3, the same way as modules 4–5. 060 is the module exam (`assessment: true`).
- 053, 058 and 059 got new Kasuta readings (team workload materials, the clinic's hard patient guide, a draft medicine leaflet); 058 and 059 have a rubric in Kasuta now.
- No new audio: 057 keeps its radio listening; the transcript is unchanged, two questions were added.
- Checks: `moduleProblems` has no problems for module 6. `npx vitest run src/features/worksheet-generator` gives 705 passed.
- Production (owner's permission, 2026-10-19 „да, деплой и публикуй оба”): `vercel deploy --prod` of 9182376 + board tab menu (#672) + „Lause lahti” (#674) + the calendar fix, `dpl_4sQDrN8mg2e6vF83H3H24EL5F2nY`; `firebase deploy --only functions:languageApi` from agent/sentence-breakdown. All 30 sheets of module 6 published with `publish-v2.cjs` (earlier v7 = batch write of 2026-10-13 22:10; dry check same=30).
- Not done: C1 modules 7–10.
- Next safe step: C1 module 7 the same way.

## 2026-10-19 · agent/course-v3-c1-m5 — C1 module 5 in template v3

- Branch `agent/course-v3-c1-m5` is stacked on agent/course-v3-c1-m4 (#670). Draft PR.
- Done: C1 module 5 (est-c1-041…050) in lesson template v3, the same way as module 4. 050 is the module exam (`assessment: true`).
- No new audio: 044 keeps its existing meeting listening.
- Checks: `moduleProblems` has no problems for module 5. `npx vitest run src/features/worksheet-generator` gives 705 passed.
- Production (owner's permission, 2026-10-19): `vercel deploy --prod` of 512a852 plus the calendar fix; all 30 sheets of module 5 are published (their earlier v7 was the batch write of 2026-10-13 22:10).
- Not done: C1 modules 6–10.
- Next safe step: C1 module 6 the same way.

## 2026-10-19 · agent/course-v3-c1-m4 (#670) — C1 module 4 in template v3

- main checked: see `git log origin/main` (2026-10-19). Branch `agent/course-v3-c1-m4` is stacked on agent/course-v3-a2 (#668). Draft PR #670.
- Owner 2026-10-19: „продолжай C1” after the A2 course was published.
- Done: C1 module 4 (est-c1-031…040) in lesson template v3, in the same way as modules 1–3:
  - Avasta: the long text lettered A–G with a 10-item „Millises lõigus?” task, a notice block, 10-item language tasks, a 2–3-minute talk and an 8–12-sentence writing task;
  - Harjuta: sentence insertion (`B.insertion`) or a news listening, a 3-option cloze, a forms-in-text task, 10-item tasks, a translation and a monologue;
  - Kasuta: a reading of about 400 words, a letter or a writing task, role cards, a speech and a rubric; the task order varies between lessons;
  - 040 is the module exam (`assessment: true`).
- 038: the old text listed *pean minema* among the da-infinitive verbs; fixed.
- Audio: TartuNLP for the new 035 news listening (`public/audio/est-c1-035`).
- The scratchpad helper `to_insertion` (c1lib.py) turns the old sentence-gap tasks into `B.insertion`. It is not in the repo; the result is in the module files.
- Checks: `moduleProblems` has no problems for module 4. `npx vitest run src/features/worksheet-generator` gives 705 passed.
- Production (owner's permission, 2026-10-19): `vercel deploy --prod` of 8fa835c plus the calendar fix; all 30 sheets of module 4 are published with `publish-v2.cjs`. Their earlier v7 was the batch write of 2026-10-13 22:09, so the sheets were marked as vetted.
- Not done: C1 modules 5–10.
- Next safe step: C1 module 5 the same way.

## 2026-10-19 · agent/course-v3-a2 (#668) — the A2 course in template v3 (all 20 modules) + agent/calendar-menu-fit (#669)

- main checked: see `git log origin/main` (2026-10-19). Branch `agent/course-v3-a2` is stacked on agent/course-v3-c1 (#667). Draft PR #668.
- Owner 2026-10-19: „Давай сначала а2”: the A2 course goes before C1 modules 4–10.
- Done: all A2 modules 1–20 (a2-001…a2-100), one commit per module. Each lesson:
  - 5–9 blocks a sheet and 40–55 minutes;
  - 8 items a task (A2 norm): short tasks of the old sheets were merged;
  - every Harjuta has a new cloze text (3 options, 8 gaps) and a „Pane sõnad õigesse vormi” text with 8 gaps;
  - every Kasuta has role cards, a speech and a rubric. Letters are at least 40 words;
  - openers and task sequences vary inside each module;
  - Kontroll N (a2-005, 010 … 100) and the two Harno mocks a2-097 and a2-099 are `assessment: true` with only the Kasuta selfcheck;
  - every art visual has its own questions (`prompts` in art/visuals/a2-module-NN.js). Modules 18–20 have no art.
- Removed listening blocks are pruned from listeningAudio.json and public/audio. The textbookArt tests follow the new a2-001 and a2-004 prompts.
- Generator: scratchpad scripts a2mNN_NNN.py, rebuilt from the pre-rewrite snapshot. They are not in the repo; the result is the module files.
- Checks: module gate (`moduleProblems`) has no problems for modules 1–20. `npx vitest run src/features/worksheet-generator` gives 705 passed (after module 20, be59932).
- Known: some sheets keep the soft warning „short-sentences” (avg 3–4 words in imperative or price tasks); it is not a gate error.
- Calendar (#669, owner 2026-10-19): the cell menu („Vaba / Hõivatud / Lisa tund”) measures its own height, so the menu stays on screen for late hours. Deployed to production on 2026-10-19 with the owner's permission, together with this A2 branch (4ae104b + 1019c2a, built from a detached worktree).
- Risk: production runs unmerged branches (C1, A2, calendar fix). A deploy from main before #667, #668, #669 are merged removes them.
- **Production (owner's permission, 2026-10-19):**
  - `vercel deploy --prod` of d6309c4 plus the calendar fix (cherry-pick of 1019c2a), built from the detached worktree `keelesepp-deploy`;
  - 299 of the 300 A2 sheets are published with `publish-v2.cjs`. Their earlier versions were batch writes on 2026-10-13 (17:46–17:51 and 22:24), so they were marked as vetted;
  - a2-002 Avasta is **not** published: it has a real hand edit by Yelyzaveta Lukiianchuk (v8, 2026-10-14). The owner decides whether to overwrite it.
- Not done: C1 modules 4–10.
- Next safe step: C1 module 4 the same way.

## 2026-10-18 · agent/course-v3-c1 — C1 module 1 in template v3 (Harno C1)

- main checked: f9b9fbb (2026-10-18). Branch `agent/course-v3-c1` is stacked on #660/#661 and has agent/board-scrollbar (#666) merged in. Draft PR.
- Done:
  - the chart block „Andmediagramm” (`chart`, `B.chart`; 01311e9);
  - module 1 (est-c1-001…010) in lesson template v3, for the Harno C1 exam:
    - reading formats: statements to lettered paragraphs; sentence-option cloze; forms in a text;
    - listening formats: news heard twice with short answers; a debate or lecture heard once;
    - writing: a data summary of about 180 words from a chart, and a 220–260-word piece;
    - speaking: a 2–3-minute talk after 3 minutes of preparation, and a discussion on role cards;
    - every Kasuta ends with a rubric of the Harno criteria;
  - 008 is the object case (sihitis), 009 is government (rektsioon); 010 is the module exam (`assessment: true`).
- Generator: scratchpad scripts c1m01_NNN.py, rebuilt from the pre-rewrite snapshot. They are not in the repo; the result is the module files.
- Audio: TartuNLP for every listening block of the module (`listeningAudio.json`, `public/audio/est-c1-0NN`).
- Checks:
  - `npx vitest run src/features/worksheet-generator`: 51 files and 705 tests pass;
  - the module gate (quality.js) has no problems;
  - board and studio tests pass (1020 passed before the last fixes).
- **Production (owner's permission, 2026-10-18):**
  - `vercel deploy --prod` of a4249f1 from a clean worktree;
  - all 30 sheets of module 1 are published with `publish-v2.cjs` (v9–v11). Their v8 was a batch write on 2026-10-13 22:09, not a hand edit, so they were marked as vetted; old versions stay in `worksheetVersions`.
- Risk: production runs this unmerged branch. A deploy from main before #660, #661, #666 and this PR are merged removes the audio, the chart block and the board scrollbar.
- **C1 module 2** (est-c1-011…020) is done the same way. The scripts are c1m02_NNN.py; there are art prompts for all 10 pictures. 018 is word order and information structure, 019 is the more complex uses of the cases, 020 is the module exam (`assessment`, writing part 1 from two charts). Audio is built for the new listening blocks. Checks: `vitest src/features/worksheet-generator` passes 705 tests; the module gate has no problems. Module 2 is **not yet deployed or published**: that waits for the owner's permission.
- Module 2 was deployed and published 2026-10-18 with the owner's permission (30 sheets).
- **C1 module 3** (est-c1-021…030) is done the same way. 025 has a data summary from a chart; 028 is past tenses in coherent text, 029 is moods and modality, 030 is the module exam (`assessment`). Audio is built. Checks: `vitest src/features/worksheet-generator` passes 705 tests; the module gate has no problems. 
- Personal sheet: a B1 test (reading and writing, 90 min) for Mihhail Smirnov was saved and published on the owner's request (`studentWorksheetDrafts/zuB96TFbpLCCqf0a919V`, assignment with the same id).
- Not done: C1 modules 4–10 are still the old design.
- Module 3 was deployed (2526b0b) and its 30 sheets were published on 2026-10-19 with the owner's permission.
- Queue (owner, 2026-10-19): C1 modules 4–10, then the A2 course in template v3.
- Next safe step: C1 module 4 the same way.

## 2026-10-18 · agent/board-scrollbar — a scrollbar on a worksheet page of the board

- main checked: f9b9fbb (2026-10-18). Branch `agent/board-scrollbar`, draft PR.
- Why: in a Live Classroom lesson a student using a mouse could not see the questions below the screen and found no scrollbar to drag. A worksheet page is a page of the board, so it moved only with the wheel, a trackpad, the middle button or a finger.
- Done: a worksheet page shows a vertical scrollbar at the right edge of the board (`.sb-scrollbar`, `role="scrollbar"`). The thumb can be dragged, and a click on the rail moves one screen. Pure helpers `scrollbarFor` and `scrollView` are in `boardModel.js`; the stage height comes from a ResizeObserver; `navDown` ignores the bar. Nothing is saved and there is no data change.
- Files: `crm-v2/src/features/board/{StudentBoard.jsx,boardModel.js,board.css,board.test.jsx}`.
- Checks: `npx vitest run src/features/live-classroom src/features/board` passed, 16 files and 111 tests (2 of them new); `eslint src/features/board` is clean. Not checked by eye in a real lesson.
- Risk: the bar sits 2 px from the right edge; the video tiles (right 14px) and the style panel do not cover it.
- **Deployed to production 2026-10-18 with the owner's permission:** `vercel deploy --prod` from this branch (origin/main f9b9fbb + this commit). crm.epkoolitus.ee serves the bar. The PR is NOT merged: until it is merged, the next deploy from main would remove the bar again.
- Next safe step: the owner merges #666 (then main and production match) and checks the bar in a lesson.
## 2026-10-18 · agent/course-v3-b1 + agent/course-v3-b2 — the B1 and B2 courses rewritten in lesson template v3 (both done)

- main checked: f9b9fbb (2026-10-18). Draft PRs: #660 (`agent/course-v3-b1`, on #659) and #661 (`agent/course-v3-b2`, stacked on #660). Owner (2026-10-18): „переделывай теперь под новые критерии курсы Б1 и Б2”.
- Level map as built: docs/COURSE_DESIGN_COMMUNICATIVE.md §10 (B1 2–5 A2+, 6–10 B1-, 11–14 B1, 15–18 B1/B1+; B2 1–4 B1+, 5–8 B2-, 9–18 B2).
- B1 commits on `agent/course-v3-b1`: 44b3d12 (quality.js / depth.js: the textbook picture is not a task block, assessment sheets have no upper time limit, depth v3 not for assessment), 4bc6425 (2), 5d79a64 (3), adec6e7 (4), b48e40c (5), 15372dd (6), 3b9f759 (7), a2c11d2 (8), a74cc65 (9), a649c5e + 78ad309 (10), cb93d2f (11), 8ff4289 (12), 7367c1f (13), abe6a54 (14). B1 15–18 were rebuilt earlier on the same branch.
- B2 commits on `agent/course-v3-b2`: 03bd25b (1), 8fb9820 (2), be57201 (3), 8b36796 (4), 9ff22ce (5), 22bd1ca (6), 200ed8d (7), 090d704 (8), 685ec95 (9), 5502d3c (10), 0eb980d (11), 8844f3c (12), b9685a7 (13), 458ac89 (14), 7e003ae (15), 81e43b0 (16), 9e5668a (17), 0e2cd54 (18), 042c5d1 (docs).
- Per module: `MODULE.level` raised, `template: 'v3'`; every non-assessment lesson rebuilt to 7–9 blocks a sheet — Avasta: a text or a listening at the stage's length in paragraphs + notice + full language tasks (10 items at B1-/B1) + speaking + writing; Harjuta: cloze A–D (g_vocab) + formtext + a second exam text (truefalse / choice / manymatch / listening) + a monologue with a plan; Kasuta: situation + reading + role cards + a speech + letter + rubric. B2 and B1 2–10 picture prompts (`prompts`) in `art/visuals/*-module-NN.js`. Assessment lessons keep the Harno form (see §10).
- B1 module 13 (the design-v2 sample named in AGENTS.md) is still `design: 'v2'`, now also `template: 'v3'`: 061 Avasta got a reading on talgud, 063 three residents' letters instead of the profile cards, Kasuta sheets a speech each.
- Changed files: `admin/course/b1/module02–14.js`, `admin/course/b2/module01–18.js`, `art/visuals/b1-module-02–10.js`, `art/visuals/b2-module-01–18.js`, `admin/course/listeningAudio.json`, `crm-v2/public/audio/a2b1-*` and `b1b2-*` (rebuilt listening clips, free TartuNLP TTS via `tools/listening-audio/build.mjs --only`), `quality.js`, `depth.js`, docs §10.
- Gate per module: `quality.js` sheet + module problems, `course.test.js`, `b1/` and `b2/lessonGoals.test.js` (each sub-goal ≥ 2 tasks), no sentence repeated across sheets, neighbours ≤ 85 % task types, no same opening in consecutive lessons, phase type sequences differ inside a module, lesson drills ≤ 40 %.
- Checks after B1 module 14: `npx vitest run src/features/worksheet-generator src/features/worksheet-studio` → 104 files passed, 1 skipped; 992 tests passed, 3 skipped.
- Known limits: B1 modules 11–14 have no textbook pictures (no `art/visuals/b1-module-11…14.js` yet, so no picture prompts there); a few Harno-form exam sheets are 56–59 min (assessment sheets have no upper limit).
- Published 2026-10-18 with the owner's permission („Публикуй в CRM”): all 525 B1 + B2 sheets (175 lessons × 3) built from branch `agent/course-v3-b2` at 9b77690, written to `curriculumLessons/<id>/worksheets/<phase>` as a new published version; every old version stays in `worksheetVersions`. b1b2-002 Avasta had a manual edit (v10, Pavel Zakutailo) and was overwritten on the owner's request (v11; v10 kept in history). Check: a second dry run reports 525 same, 0 to publish. No deploy, no other production data touched.
- Risk: the CRM now shows the v3 sheets while the code is still on draft PRs #660/#661; if a PR changes a sheet before merge, publish again.
- Next safe step: owner merges #659 → #660 → #661; then pictures for B1 11–14.

## 2026-10-18 · agent/lesson-template-v3 — lesson template v3 (fewer, fuller tasks; Harno exam formats), pilot B2 lesson 061

- main checked: f9b9fbb (2026-10-18). Owner: B2 starts too low, too many small same-type blocks, little speaking, few situations and texts to think about, no exam-style lünkharjutus / „pane sõnad õigesse vormi”; „столько блоков не надо” — build the lesson on didactic norms.
- Measured: 30–35 blocks a lesson, ~5 items a drill, 11–18 drills a lesson; B1 modules 2–8 are A2/A2+, B2 modules 1–4 B1, only B2 17–18 B2.
- Norm: docs/COURSE_DESIGN_COMMUNICATIVE.md §10 (level map, to do) and §11 (template v3, sources: three-part lesson, Willis, Nation's four strands, Harno B2 booklet).
- Code: new blocks `formtext` and `insertion` (engine/blocks/exam.jsx, builders in course/blocks.js, sheet.css, time, depth, didactic measure, review list); `template: 'v3'` (lesson or MODULE) → `meta.template`; quality.js v3 rules (5–9 blocks, ≥ 4 task types, fixed phase jobs, lesson balance drills ≤ 40 % / use ≥ 25 %, module ≥ 12 types, neighbours ≤ 85 %); depth.js v3 (full item count, Avasta ≥ 12 min / Kasuta ≥ 6 min exercises); gates.js speaking length B2 180 s / C1 210 s (was above the didactic norm).
- Content: B2 lesson b1b2-061 rewritten in v3 (Avasta 8, Harjuta 7, Kasuta 7 blocks; cloze 12 gaps A–D, formtext 12, Harno info reading, insertion 6+1, argument cards). Not published — the CRM still shows the published v2 sheet until the owner allows publishing.
- Checks: vitest worksheet-generator + worksheet-studio + homework 1037 pass, 3 skipped.
- Next safe step: owner looks at lesson 061 (local preview or after publishing) → then rewrite by the level map, module by module.
## 2026-10-18 · agent/calendar-subject — calendar: the lesson's subject, the half hour under the pointer, the cell menu stays on screen

- Base: `agent/calendar-student-link` (#663, same files). main checked: f9b9fbb. Team chat (Oleksiy, 2026-10-17): #improvement #high_priority #calender „не отображается, какой предмет ведёт учитель — пиктограмма или поле в окне урока”; #improvement #low_priority #calender „рамка на полчаса под курсором; окно выбора часов уходит под экран внизу”.
- Subject: only 115 of 666 `schedule` lessons store `subject`; `calendarView.lessonSubjectOf()` takes the lesson's subject, else the student's study track with this teacher, else the only track, else the card's subject (`withLessonSubjects`, groups untouched, no data rewrite). `SubjectTag` shows ET / EN / MA (RU / FI / DE, else two letters; „Muu” none) on week blocks, crowded clusters, month chips and agenda rows; the lesson panel shows the tag and the full subject name.
- TimeGrid: a thin frame (`.tg-hover`) on the half hour under the pointer, not over lessons, not while dragging or painting.
- CellStatusMenu: measured after render; opens above the pointer when it does not fit below, never leaves the window (max-height + scroll).
- Files: `features/calendar/calendarView.js`, `SubjectTag.jsx` (new), `TimeGrid.jsx`, `CellStatusMenu.jsx`, `CalendarPage.jsx`, `LessonPanel.jsx`, `calendarV2.css`, tests (`calendarView.test.js`, `LessonPanel.integrity.test.jsx`, new `CellStatusMenu.test.jsx`).
- Checks: `npx vitest run src/features/calendar src/features/students` → 33 files, 177 passed; eslint clean. Not checked in a browser (needs a logged-in session).
- Production: none (read-only query of subject values). Needs a frontend deploy.
- Next safe step: owner merges #663 then this PR and deploys; then the cash-payer category (finance, plan first).

## 2026-10-18 · agent/calendar-student-link — calendar: the student's current name and a link to the card; student card: next lessons of a weekly series

- main checked: f9b9fbb (2026-10-18). Requests from the team chat (Oleksiy, 2026-10-17): #bug #high_priority #calender „сделать кликабельным ученика в занятии… имя обновляется, если обновил карточку”; #bug #low_priority #student_card „не отображаются будущие часы занятий, если карточка ученика была изменена”.
- Cause 1: a `schedule` lesson keeps `studentName` from the day it was planned (24 of 666 lessons had an old name, e.g. „Agata” → „Agata Kuzina”). Now `calendarView.withCurrentStudentNames()` shows the name on the student card (by `studentId`; the stored name stays as fallback; groups untouched). No data rewrite.
- The lesson panel title is a link to `/students/<id>` (individual lessons with a known card).
- Cause 2 (not the rename): the card's „Tulevased tunnid” dropped every weekly series whose start date was in the past. Now it lists the dated occurrences of the next 8 weeks (`occurrencesForDates`, cancelled and marked ones left out); undated entries stay one weekly line.
- Files: `features/calendar/calendarView.js`, `CalendarPage.jsx`, `LessonPanel.jsx`, `calendarV2.css`, `features/students/StudentLessonsPanel.jsx`, tests (`calendarView.test.js`, `LessonPanel.integrity.test.jsx`, new `StudentLessonsPanel.test.jsx`).
- Checks: `npx vitest run src/features/students src/features/calendar` → 32 files, 174 passed.
- Production: none (read-only Firestore query to find the cause). Needs a frontend deploy to show.
- Next safe step: owner merges and deploys; then the next calendar item (subject icon on a lesson).
## 2026-10-18 · agent/cash-payers — cash payers and the cash box („Kassa”)

- main checked: f9b9fbb (2026-10-18). Team chat (Oleksiy, 2026-10-17) #improvement #database: a separate category of payers who pay in cash; confirmed by hand who received the money (and handed it over later). Owner 2026-10-18: any teacher may take cash; the cash box is needed.
- Data: `cashLedger/{id}` (server writes only, rules: admin read, no client writes). `receipt` {holderUid/Name, amountCents, receivedAt, studentId/Name, payerName, note, status open|allocated|void, invoiceId, paymentId}; `handover` {fromUid, toUid, amountCents, handedAt, status active|void}. A person's cash = receipts + handovers in − handovers out. Payer flag `payerMethod: 'cash'|'bank'` on the parent account (`users`) and copied to the children's cards (`students`).
- Server (`functions/cash-core.js` + `financeApi`): staff `POST /cash/summary` (admin all, teacher own entries and own balance), `/cash/receipts` (a teacher only for own students — `teacherUid` or a study track — and only as holder), `/cash/handover` (only own cash, never more than held, only to staff); admin `/cash/allocate` (receipt → ordinary invoice payment, method `cash`, `receivedBy`, `cashReceiptId`; requestId `cashalloc_<id>`), `/cash/void` (not an allocated receipt). `recordInvoicePayment` with method `cash` takes `receivedByUid` and enters the money in that person's box (`cashpay_<requestId>`); `voidSinglePayment` reopens the linked receipt. Every entry has a `financialAudit` record (`cashbox_…`).
- UI: menu „Kassa” (`/kassa`, admin + teacher): balances, „Sain sularaha”, „Andsin raha üle”, entries; admin „Seo arvega” (open invoices of the student, same sum first) and void. Parents: „Makseviis” in the edit dialog, badge „sularaha”, filter „Maksab sularahas”. Student card: „Makseviis” row with a link to the cash box. Finance → payment dialog: „Kes raha sai” when the method is cash.
- Checks: `functions npm test` → 303 pass (+ `cash-core.test.js` 6); emulator `finance-emulator.integration.js` + `security-finance-emulator.integration.js` → 37 pass (new cash box flow test); `crm-v2 npx vitest run` → 1948 passed, 3 skipped; `npm run build` ok. Emulator needs JDK 21: `PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH`.
- Not decided: whether a cash payer's invoice e-mail drops the bank details / LinkPay link (asked, no answer) — invoices unchanged.
- Production: none. Manual gate: deploy `financeApi` + `firestore:rules` + frontend (owner's permission).
- Next safe step: owner merges and allows the deploy; then marks cash payers in „Lapsevanemad”.

## 2026-10-17 · agent/parent-to-student — „See on õpilane”: a parent account that is really the learner

- main checked: 5521e1a (2026-10-17). Owner: a learner registered as a parent (Veronika Bistrova); the admins must be able to fix this themselves.
- Server: `POST staffOperationsApi /accounts/parent-to-student` (admin only, `requestId` idempotent) in `functions/index.js`; plan in `functions/parent-to-student-core.js` (+ test). The account leaves `linkedParentIds/linkedParentId/parentUid/guardianUid` of that card and joins `linkedUserIds/linkedUserId/studentUid`; `parentName/parentEmail` stay (payer). Role → student, unless the account has other active children (then parent stays and student is added). Claims follow. Audit: `activityLog/parent-to-student-<id>` with before-values. Staff and super-admin accounts are refused.
- UI: „Lapsevanemad” card footer (admin) → „See on õpilane” → choose the card → „Muuda õpilaseks”. Service: `accountApprovalsService.convertParentToStudent`.
- Checks: functions `npm test` 297 pass; vitest parents + accountApprovals 27 pass.
- Manual gate: deploy `staffOperationsApi`, then convert Veronika (card `tFW4vNY28JemXO58qQxm`) with the button.
- Next safe step: owner approves deploy + merge.

## 2026-10-16 · agent/course-v2-b2 — the B1→B2 course in design v2 (in progress)

- Base: branch `agent/course-v2-b1` (#652, B1 02–18 in v2, not merged yet; it carries the `quality.js` opener fix).
  Branch `agent/course-v2-b2`, draft PR stacked on #652. Main checked: d869b31.
- Goal (owner): after B1, bring every B2 module 02–18 (`admin/course/b2/`) to design v2 and review every sheet for
  didactics and Estonian; old versions kept in `archive/v1/b2/moduleNN.js` (see `archive/README.md`).
- **Module 02** (b1b2-006…010, level B1): patched to v2 — `design: 'v2'`, 6th items in every 5-item task, a vocab block
  in every lesson, selfchecks only in Kasuta, varied openers (007/009 Kasuta start with the genre's typical errors, 009
  Avasta with the reaction match), cross-sheet duplicates reworded (the „laadija” sentence, two Russian sources),
  new whole-sentence tasks (006/008 Kasuta errorfix, 008 Harjuta dictation, 008 Kasuta transformation, 010 Avasta and
  Harjuta translations). 010 „Kontroll 2” marked `assessment`; its 180-word essay gave way to two sentence tasks
  (typical errors + argument sentences) so Kasuta fits 55 min; the rubric and score lines follow. 5/5 READY, language
  0 unknown, audio unchanged. Tests: 970 passed, 3 skipped.
- **Module 03** (b1b2-011…015, level B1): patched to v2 — 6th items, vocab in every lesson, selfchecks only in
  Kasuta, gap instructions name the form, varied openers (012 Avasta errorfix, 014 Avasta feelings match, 012/014
  Kasuta match first), new tasks (012 Kasuta motivation-letter errors, 014 Avasta and Kasuta story errors, 015 Avasta
  tense transformation), the 012 crossword removed (one-word items), two cross-sheet duplicates reworded. 015
  „Kontroll 3” marked `assessment`: the essay gave way to typical errors + argument sentences. 5/5 READY, language 0
  unknown. Tests: 971 passed, 3 skipped.
- **Module 04** (b1b2-016…020, level B1): patched to v2 — 6th items, vocab in every lesson, selfchecks only in
  Kasuta, gap instructions name the form, varied openers (017 Avasta match, 017 Harjuta errorfix, 017 Kasuta match,
  019 Avasta gaps, 019 Kasuta letter errors), new tasks (017 Kasuta infinitive errors, 018 Avasta verb-government
  transformation + case choice, 019 Harjuta polite transformation, 019 Kasuta errorfix + dictation, 020 Avasta
  translation). 020 „Vahehindamine 1” marked `assessment`: the essay gave way to typical errors + argument sentences.
  5/5 READY, language 0 unknown. Tests: 972 passed, 3 skipped.
- **Module 05** (b1b2-021…025, level B1+): patched to v2 — vocab in every lesson, selfchecks only in Kasuta,
  cross-sheet duplicates reworded (five sentences), new tasks (021 Harjuta dictation, 021 Kasuta letter errors, 022
  Harjuta argument errors, 024 Kasuta comparison transformation as opener, 025 Avasta and Harjuta translations), a
  rubric for 023 Kasuta, varied openers (022 Avasta/Kasuta match), an errorfix row without an error replaced. 025
  „Kontroll 5” marked `assessment`: the essay gave way to typical errors + argument sentences. 5/5 READY, language 0
  unknown. Tests: 973 passed, 3 skipped.
- **Module 06** (b1b2-026…030, level B1+): patched to v2 — vocab in every lesson, selfchecks only in Kasuta,
  five cross-sheet duplicates in 030 reworded, new tasks (026 Harjuta dictation, 026/028/029/030 Kasuta errorfix, 027
  Harjuta errorfix, 027 Kasuta translation, 029 Avasta errorfix + translation, 029 Kasuta dictation, 030 Avasta
  translation + transformation), the 027 crossword removed, varied openers. 030 „Kontroll 6” marked `assessment`:
  the 180-word summary gave way to typical errors + summary sentences. 5/5 READY, language 0 unknown. Tests: 974 passed, 3 skipped.
- **Module 07** (b1b2-031…035, level B1+): patched to v2 — vocab in every lesson, selfchecks only in Kasuta,
  new tasks (031/033/034 Kasuta errorfix, 032 Harjuta errorfix, 034 Avasta errorfix + translation, 034 Kasuta
  transformation, 035 Avasta translation + transformation, 035 Harjuta translation), varied openers, two speaking
  blocks and one sort removed to fit 55 min. 035 „Kontroll 7” marked `assessment`: a 250-word HR letter (with the
  survey numbers) replaces the data table, the essay gave way to letter errors + argument translation. 5/5 READY,
  language 0 unknown. Tests: 975 passed, 3 skipped.
- **Module 08** (b1b2-036…040, level B1+): patched to v2 — vocab in every lesson, selfchecks only in Kasuta,
  three cross-sheet duplicates reworded, new tasks (036/038/039 Avasta errorfix, 039 Avasta translation, 036/038/039
  Kasuta errorfix, 039 Kasuta transformation, 037 Kasuta word order → dictation, 040 Avasta translation +
  transformation, 040 Harjuta translation), the 039 crossword and three speaking blocks removed to fit 55 min, two
  Avasta reviews shortened to 120–140 words, varied openers. 040 „Vahehindamine 2” marked `assessment`: a 250-word
  HR letter (with the travel data) replaces the table, the essay gave way to letter errors + argument translation.
  5/5 READY, language 0 unknown. Tests: 976 passed, 3 skipped.
- **Module 09** (b1b2-041…045, level B1+/B2-): patched to v2 — vocab in every lesson, selfchecks only in
  Kasuta, gap instructions name the form, two cross-sheet duplicates reworded, rubrics for 042/043 Kasuta, new tasks
  (042/044 Kasuta errorfix, 043 Harjuta errorfix, 044 Avasta errorfix, 044 Kasuta transformation, 045 Avasta and
  Harjuta translations), 042 Avasta dictation → word order and 044 Avasta dictation → errorfix for variety, the 044
  crossword and four speaking blocks removed to fit 55 min, varied openers. 045 „Kontroll 9” marked `assessment`: a
  250-word HR letter (with the survey numbers) replaces the table, the essay gave way to letter errors + argument
  translation. 5/5 READY, language 0 unknown. Tests: 977 passed, 3 skipped.
- **Module 10** (b1b2-046…050, level B1+/B2-): patched to v2 — vocab in every lesson (046/047 lists cleaned:
  no comma splits, one-off words removed or woven into new items), selfchecks only in Kasuta, one cross-sheet
  duplicate reworded, new tasks (047 Avasta errorfix instead of a dictation, 047 Harjuta dictation of feelings,
  047/049/050 Kasuta errorfix, 047 Kasuta I-message transformation, 048 Avasta translation, 049 Kasuta dictation,
  050 Avasta translation + transformation, 050 Harjuta translation), the 047 crossword and five speaking/planning
  blocks removed to fit 55 min and vary sheets, varied openers. 050 „Kontroll 10” marked `assessment`: a 250-word
  HR letter (with the survey numbers) replaces the table, the essay gave way to letter errors + argument
  translation. 5/5 READY, language 0 unknown. Tests: 978 passed, 3 skipped (one LiveWorksheetPage step-mode test is timing-flaky
  under the full run; it passes alone).
- **Module 11** (b1b2-051…055, level B1+/B2-): patched to v2 — vocab in every lesson, selfchecks only in
  Kasuta, two cross-sheet duplicates reworded, the 3-item reader match (054) turned into a sort, new tasks (052 Avasta
  translation, 052 Harjuta dictation, 052/054 Kasuta errorfix, 052/054 Kasuta transformation, 053 Kasuta word order →
  dictation, 055 Avasta translation + transformation, 055 Harjuta translation), the 054 crossword and four speaking
  blocks removed to fit 55 min, varied openers. 055 „Kontroll 11” marked `assessment`: a 250-word manager letter
  (with the consumer-survey numbers) replaces the table, the essay gave way to letter errors + argument translation.
  5/5 READY, language 0 unknown. Tests: 979 passed, 3 skipped (run with `--maxWorkers=3 --testTimeout=60000`: on a loaded machine
  some UI tests exceed the default 20 s; they pass alone).
- **Module 12** (b1b2-056…060, level B1+/B2-): patched to v2 — vocab in every lesson, selfchecks only in
  Kasuta, gap instruction names the form, one cross-sheet duplicate reworded, new tasks (057/059 Avasta errorfix,
  057/059 Harjuta dictation, 057/059 Kasuta errorfix, 059 Avasta word order, 059 Kasuta transformation, 060 Avasta
  translation + transformation, 060 Harjuta translation), the 058 Kasuta sort and three speaking blocks removed,
  short errorfix rows lengthened, longer true/false statements, varied openers. 060 „Vahehindamine 3” marked
  `assessment`: a 250-word IT-manager letter (with the digital-habits numbers) replaces the table, the essay gave
  way to letter errors + argument translation. 5/5 READY, language 0 unknown. Tests: 980 passed, 3 skipped.
- Merged as #652 (B1), #653 (B2 02–12), #654 (goals list fix) on 2026-10-16; Vercel production deploy of 807ece5.
- **Published 2026-10-17** (owner: „это тоже сделай”): 420 sheets of B1 02–18 and B2 02–12 written to
  `curriculumLessons/{id}/worksheets/{phase}` with a new `worksheetVersions` entry each (old versions kept). 194 sheets
  whose last version carried the owner's name were compared with the v1 code first: only audio, goal tags and sort
  format differed (no hand edits), so they were replaced too. 11 B1 check lessons renamed „Kontroll N” → „Eksam N”
  on the lesson card. A dry run afterwards shows all 420 identical to code. Sheets already given to students keep their copy.
- **Module 13** (b1b2-061…065, level B2-: sentences ≥6 words on average, one speaking task up to 4 min, texts
  ≥220 words, letters ≥140 words, no visible word banks): patched to v2 — vocab in every lesson, selfchecks only in
  Kasuta, speaking 3.5–4 min, short task sentences rewritten longer (slogans, dictations, errorfix rows, translations),
  new tasks (061/064 Kasuta errorfix or translation, 063 Avasta errorfix instead of a dictation, 063 Kasuta word order
  → dictation as opener, 064 Avasta translation + errorfix, 064 Harjuta dictation + translation), the 061 table and
  four speaking/planning blocks removed to fit 55 min, varied openers. 065 „Kontroll 13” marked `assessment`:
  reading part 4 became option gaps (no bank at B2), the speaking parts 3–4 min, a 300-word manager letter feeds the
  explanation letter (140 words) and replaces the essay. 5/5 READY, language 0 unknown. Tests: 984 passed, 3 skipped.
- **Module 14** (b1b2-066…070, level B2-): patched to v2 — vocab in every lesson (066/068 lists cleaned of comma
  splits and one-off words), selfchecks only in Kasuta, speaking 3.5–4 min, short task sentences rewritten longer,
  new tasks (067/069 Kasuta translation, 068 Kasuta errorfix, 069 Avasta errorfix instead of a dictation, 069 Harjuta
  dictation, 066 Kasuta word order → dictation), planning/speaking blocks removed to fit 55 min, varied openers. 070
  „Kontroll 14” marked `assessment`: speaking parts 3–4 min, letter 140–160 words, a 300-word council article with
  the e-services numbers replaces the data summary essay. 5/5 READY, language 0 unknown. Tests: 985 passed, 3 skipped.
- **Module 15** (b1b2-071…075, level B2-): patched to v2 — vocab in every lesson, selfchecks only in Kasuta,
  speaking 3.5–4 min, short task sentences rewritten longer, new tasks (072 Avasta errorfix instead of a dictation +
  word order, 072 Kasuta errorfix, 074 Kasuta translation, 071/073 Kasuta word order → dictation), planning/speaking/
  role blocks removed to fit 55 min and vary sheets, varied openers. 075 „Kontroll 15” marked `assessment`: speaking
  parts 3–4 min, letter 140–160 words, a 300-word newspaper article (paywall + the wrong layoff story) feeds the letter
  and replaces the essay. 5/5 READY, language 0 unknown. Tests: 986 passed, 3 skipped.
- **Module 16** (b1b2-076…080, level B2-): patched to v2 — vocab in every lesson, selfchecks only in Kasuta,
  speaking 3.5–4 min, short task sentences rewritten longer (choice stems, dictations, errorfix rows), new tasks (076
  Kasuta word order → errorfix, 078 Kasuta word order → dictation + translation), Kasuta sheets keep one speaking task
  and drop the role play or planning to fit 55 min, varied openers. 080 „Vahehindamine 4” marked `assessment`:
  listening part 1 now 6 questions with 4 options (Harno B2), speaking parts 3–4 min, letters 140–160 words, a 300-word
  article on short-term rentals feeds the letter and replaces the essay. 5/5 READY, language 0 unknown. Tests: 987 passed, 3 skipped.
- **Module 17** (b1b2-081…085, level B2: reading 350+ words in the didactic check): patched to v2 — vocab in
  every lesson, selfchecks only in Kasuta, speaking 3–4 min, Avasta/Kasuta letters at 140–160 words (B2 minimum) so
  sheets fit 55 min, short „weak sentence” sources rewritten longer, new tasks (081 Avasta translation + errorfix, 081
  Harjuta translation + dictation, 081 Kasuta transformation, 082 Avasta translation, 082 Kasuta word order →
  dictation, 083 Avasta translation, 083 Harjuta dictation, 083 Kasuta translation → transformation, 084 Kasuta
  gaps → dictation + errorfix + rubric), planning/speaking/role blocks trimmed, varied openers. 085 „Kontroll 17”
  marked `assessment`: speaking parts 3–4 min, letter 140–160 words, a 350-word school-newspaper article on a later
  school start replaces the data summary essay. 5/5 READY, language 0 unknown. Tests: 988 passed, 3 skipped.
- **Module 18** (b1b2-086…090, level B2): patched to v2 — vocab in every lesson, selfchecks only in Kasuta,
  speaking 3–4 min, short task sentences rewritten longer, new tasks (087 Harjuta dictation, 087 Kasuta errorfix +
  word order → dictation, 088 Avasta dictation, 088 Kasuta errorfix + translation), role/planning/speaking blocks
  trimmed to fit 55 min, varied openers. The mocks 089 „Täismahus B2 simulatsioon” and 090 „Lõpphindamine” marked
  `assessment`: a language part in Avasta (089 errorfix + dictation, 090 errorfix + translation, the listening
  result as a rubric), reading part 4 as option gaps (no bank at B2), speaking parts 3–4 min, letters 140–160 words,
  a 350-word text (manager's letter / article on language courses) replaces the second essay. `lõputest` and
  `lõpptest` added to the language allow-list (valid compounds). 5/5 READY, language 0 unknown. Tests: 989 passed, 3 skipped.
- **B2 (modules 02–18) is complete in v2.**
- Merged as #655 (73113e9), Vercel production deploy. **Published 2026-10-17**: the 90 sheets of B2 13–18 (all last
  written by the publish script, no hand edits) with a new `worksheetVersions` entry each; a dry run afterwards shows
  all 90 identical to code. Together with the earlier publish, B1 02–18 and B2 02–18 are live in v2.
- Next safe step: watch the first lessons taught with the v2 sheets and collect teacher feedback per sheet.

## 2026-10-16 · agent/course-v2-b1 — the whole B1 course in design v2 (in progress)

- Base: `main` 48347ce (2026-10-16). Branch `agent/course-v2-b1`, no PR yet (one PR when the B1 modules are done, or per few modules).
- Goal (owner): rewrite every B1 module 02–18 in design v2 (`docs/COURSE_DESIGN_COMMUNICATIVE.md`), then B2 01–18; review
  every sheet for didactics and Estonian; keep the old versions.
- Done: **module 02** (a2b1-006…010) — 5/5 READY, language check 0 unknown words, audio built (006_t_voice, 008_d_office,
  010_p_clips), lessonGoals 006–010 rewritten, `a2b1-module-02` in `strictModules.json`. Module 13 was the pilot (#650).
- Old versions: `crm-v2/src/features/worksheet-generator/admin/course/archive/v1/b1/moduleNN.js` (not imported, README
  says how to restore); old mp3 files stay in `public/audio/` so the published v1 sheets keep their sound.
- quality.js: `openingOf` skips the textbook picture and its card (`data.artFor`).
- Checks: `npx vitest run src/features/worksheet-generator src/features/worksheet-studio` → 954 passed, 3 skipped.
- Not published to production: the owner publishes each lesson in „Kursuse tootmine” (the CRM keeps the published
  version in `worksheetVersions`, restorable with „Versioonid ja taastamine…”).
- **Module 03** (a2b1-011…015) done the same way: 5/5 READY, language 0 unknown, audio 012_d_listen, 013_p_listen,
  014_t_voice, 015_p_clips; v1 in `archive/v1/b1/module03.js`. Tests: 955 passed, 3 skipped.
- **Module 04** (a2b1-016…020): all three phases written (v1 had only Harjuta + Kasuta; its Avasta sheets exist only
  in production), 5/5 READY, language 0 unknown, audio 018_d_voice and 020_p_clips; v1 in `archive/v1/b1/module04.js`.
- **Module 05** (a2b1-021…025, stage A2+: reading texts 120–250 words, no copyable word banks): all three phases,
  5/5 READY, language 0 unknown, audio 022_d_voice and 025_p_clips; v1 in `archive/v1/b1/module05.js`.
- **Module 06** (a2b1-026…030): all three phases, 5/5 READY, language 0 unknown, audio 028_d_recipe, 030_p_clips,
  030_p_dialog; v1 in `archive/v1/b1/module06.js`. Draft PR #652 collects the B1 modules.
- **Module 07** (a2b1-031…035): all three phases, 5/5 READY, language 0 unknown, audio 033_d_radio, 035_p_clips;
  v1 in `archive/v1/b1/module07.js`.
- **Module 08** (a2b1-036…040, exam 040 = „Vahehindamine 2 — A2+”): all three phases, 5/5 READY, language 0
  unknown, audio 038_d_radio, 040_p_clips (040_p_listen and 040_p_dialog kept, transcripts unchanged); v1 in
  `archive/v1/b1/module08.js`. Tests: 960 passed, 3 skipped.
- **Module 09** (a2b1-041…045, stage A2+/B1- = B1- norms: sentences ≥6 words on average, reading 150–320 words,
  exam 045 „Eksam 9 — tööelu” in Harno B1 form): all three phases, 5/5 READY, language 0 unknown, new audio
  042_d_radio (044_p_listen, 045_p_listen, 045_p_short kept, transcripts unchanged); v1 in `archive/v1/b1/module09.js`.
  Tests: 961 passed, 3 skipped.
- **Module 10** (a2b1-046…050, B1- norms, exam 050 „Eksam 10 — reisimine” in Harno B1 form): all three phases,
  5/5 READY, language 0 unknown, new audio 050_p_clips (049_p_listen and 050_p_listen kept, transcripts unchanged);
  v1 in `archive/v1/b1/module10.js`. Tests: 962 passed, 3 skipped.
- **Module 11** (a2b1-051…055; v1 already had all three phases but failed the v2 gates: 5-item tasks, three
  selfchecks per lesson, no Kasuta rubric, repeated openings): rewritten to v2 from the v1 texts, exam 055 „Eksam 11”
  in Harno B1 form, 5/5 READY, language 0 unknown, new audio 055_p_clips (053_p_listen, 055_p_listen kept). Lesson 055
  keeps 4 goals (it is not in the lessonGoals ASSESSMENTS set, like 015 and 030). Tests: 963 passed, 3 skipped.
- **Module 12** (a2b1-056…060; v1 had three phases but failed the v2 gates like module 11): rewritten to v2 from
  the v1 texts, mid-term check 060 „Vahehindamine 3 — B1- algus” in Harno B1 form, 5/5 READY, language 0 unknown, no
  new audio (058_p_listen, 060_p_listen, 060_p_listen2 kept, transcripts unchanged). Tests: 964 passed, 3 skipped.
- Module 13 (pilot) re-checked: 5/5 READY, no change.
- **Module 14** (a2b1-066…070, stage B1-: the gates use B1 depth — closed tasks ≥25 min on Avasta/Harjuta, dictation
  ≥6 sentences, input text ≥140 words, every letter ≥70 words; the Harno B1 50-word note is therefore a `writing`
  block): rewritten to v2, exam 070 in Harno B1 form, 5/5 READY, language checked (talisuplema is kept), audio
  070_p_listen and 070_p_listen2 kept. Tests: 965 passed, 3 skipped.
- **Module 15** (a2b1-071…075, B1-): rewritten to v2, exam 075 in Harno B1 form, 5/5 READY, language checked
  (coach → elutreener, ühiskööki), audio 075_p_listen and 075_p_listen2 kept. Tests: 966 passed, 3 skipped.
- **Module 16** (a2b1-076…080, already a rich Harno-B1 module): patched to v2 instead of rewritten — a 6th item in
  every 5-item task, selfchecks only in Kasuta, a rubric in every Kasuta, varied openings, 080 marked `assessment`,
  the 50-word note as a `writing` block; 5/5 READY, audio kept. Tests: 967 passed, 3 skipped.
- **Module 17** (a2b1-081…085, stage B1: input texts 200–400 words): patched to v2 — 6th items, notes as `writing`,
  vocab blocks for 082/083/085, rubrics, new openers (083 Harjuta text parts, 084 Kasuta percentages), 085 marked
  `assessment` with a reading input; 5/5 READY, language 0 unknown. Tests: 968 passed, 3 skipped.
- **Module 18** (a2b1-086…090, the last B1 module): patched to v2 — 6th items, new 086 Harjuta dictation and
  Kasuta translations (086, 088), 087 vocab and new openers (Avasta sorting, Harjuta errorfix, Kasuta idea-card
  choice), 088 vocab without one-off words; the mocks 089 „B1 proovitund” and 090 „Lõpphindamine — B1” marked
  `assessment`, a language part in Avasta (089 errorfix + dictation, 090 transformation + translation), a reading
  input (~200 words) that feeds the 50-word note (now a `writing` block), speaking 1a with 3 questions so Kasuta fits
  55 min, the B1 result table and pass rule in 090 Kasuta; selfchecks only in Kasuta. 5/5 READY, language 0 unknown,
  audio unchanged; v1 in `archive/v1/b1/module18.js`. Tests: 969 passed, 3 skipped.
- B1 (modules 02–18) is complete in v2. Not published to production — the owner publishes in „Kursuse tootmine”.
- Next safe step: B2 module 01–18 (`admin/course/b2/`) in v2 on a new branch `agent/course-v2-b2`, same approach.

## 2026-10-15 · agent/calendar-rooms — rooms („Kabinet”)

- Oleksiy #improvement #low_priority: a room field when booking; when all rooms are taken, a lesson without
  „Veebitund” cannot be saved. Main checked: a35a554.
- Data: `classrooms/{id}` { name, active, order, updatedAt, updatedBy } — admin writes (Kalender → „Kabinetid”, a
  room is switched off, never deleted), staff read. `roomBookings/{scheduleId}` — written only by the new trigger
  `syncRoomBooking` (functions/room-booking-core.js) on every schedule write: room, time, date / weekly series,
  excluded and cancelled dates, teacher; no student data; staff read (teachers see only their own schedule, so the
  occupancy of all lessons lives here). Schedule entries get `roomId`, `roomName`.
- CRM: lesson form „Kabinet” (on-site lessons, when rooms exist): „Vaba kabinet automaatselt” or a room; taken rooms
  are disabled; a weekly lesson is checked for 12 weeks (`roomModel.js`: candidateDates, roomConflict, roomChoices,
  assignRoom). Saving on site with every room taken fails („märgi tund veebitunniks”); online lessons take no room.
  Dragging a lesson to a time its room is taken is refused. The room name is shown next to the time on the block.
  Bookings saved in the session count at once (the server's booking follows a moment later).
- Not covered: group lessons take no room yet.
- Tests: functions +3 (core), rules emulator `rooms-rules-emulator.integration.js`, crm-v2 +5, e2e `rooms.spec.cjs`.
- Production after merge: deploy firestore rules and the function `syncRoomBooking`. No rooms exist until the admin
  adds them (until then nothing changes for anyone).

## 2026-10-15 · agent/calendar-cell-status — a click on an empty cell sets its status

- Oleksiy #improvement: every half-hour cell can be „free / online only / busy / a lesson”. Main checked: dc7e0d5.
- A click on an empty cell opens `CellStatusMenu`: Vaba / Ainult veebitunnid / Hõivatud / Eemalda märge (current
  status marked), „Iga nädal” (else this day only), „+ Lisa tund” (the lesson form as before). The teacher: own
  time; an administrator: the teacher chosen in the filter or the teacher's column of the day view; an administrator
  with all teachers gets only „Lisa tund”. Same data as „Minu ajad” (`teacherAvailability`, same rules).
- `availabilityModel.js`: `setCellStatus` cuts same-scope windows around the cell (a 9–17 window stays 9–12 and
  12:30–17) and joins neighbours; `effectiveSlots`: a one-day window overrides the weekly ones where they overlap
  (also a stored „open” = unmarked that day); `availabilityAt`, `bandsOn` and the reschedule proposals use it.
- Tests: crm-v2 1900 passed (+5), build OK; clicked through in a browser on the emulators.
- Queued: rooms („кабинет”, Oleksiy, low priority).

## 2026-10-16 · agent/course-design-v2-pilot — B1 / B2 course design v2, pilot B1 module 13

- Owner: „интересный и эффективный курс B1 и B2… õpijakeskne tund и коммуникативный метод… экзаменационные
  задания в конце модуля”; decisions: pilot first, topics stay, mini Harno exam (4 skills). Main checked: 8309e1b.
- Contract: `docs/COURSE_DESIGN_COMMUNICATIVE.md` (why the old sheets were templates — measured on 1090 sheets —,
  principles, phase jobs and input/task menus, module shape with the exam lesson, variety rules, v2 norms).
- Gates (only for `MODULE.design: 'v2'`): quality.js `varietyProblems` (consecutive lessons open a phase
  differently, neighbours ≤ 60 % same types, ≥ 16 block types a module, one self-check a lesson), v2 end rule,
  Kasuta rubric; depth.js closed tasks ≥ 6; level gate accepts dialogue / profiles / cloze as input;
  timeEstimate.js counts pair speaking and role play as pair work. Old modules unchanged (all course tests pass).
- B1 module 13 rewritten (a2b1-061…065): each phase opens differently (chat, phone call audio, neighbours' profiles,
  story; sentence building, crossword, conflict flow, station announcement; friends' cards, hotel e-mail, residents'
  meeting, voice message); each Kasuta = one assessed task (rubric); lesson 065 = mini Harno B1 exam (reading 33,
  listening 32, writing 20, speaking 20 points, aim ≥ 60 % each). Lesson goals updated (no unverifiable „70 %”).
  5/5 READY, strict; language check 0 unknown words; 5 listening audios built (TartuNLP).
- Tests: worksheet-generator + worksheet-studio 953 passed. Not published (owner reviews first).
- Next safe step: the owner reviews the pilot in „Kursuse tootmine” (moodul 13) and tries it in a lesson; then
  B2 module 02 in the same design, then the Codex contract moves to v2.

## 2026-10-15 · agent/teacher-students-consistent — one rule for „whose student is this”

- Owner: the teacher in the student list and on the teacher's card did not match. Cause: the student list shows the
  card's study tracks (`enrollments`), while Õpetajad (counter) and the teacher's card used the main `teacher` /
  `teacherUid` / old `teacherUids`; „Muuda” changed only the main teacher, so 7 production cards disagree.
- `utils/teachers.js`: `teachesStudent(student, teacher)` / `tracksTaughtBy` (active tracks by name, by account
  when a track names nobody); the bare „Jegor” = Jegor Fjodorov (exact alias only). TeachersPage counter and
  TeacherProfilePage use it; the teacher's card lists all students (was the first 12), sorted, with subject · level.
- `studentsService.update`: changing the teacher also moves the only / main stored track (`withMainTrackTeacher`);
  `teacherUids` are rebuilt from the updated tracks.
- Data not changed: 7 cards whose main teacher differs from the track wait for the owner's decision.
- Tests: crm-v2 1894 passed (+3), build OK.
## 2026-10-15 · agent/calendar-online-visible — online and on-site lessons told apart

- Oleksiy #bug #high_priority: „если одновременно несколько уроков висит — не видно где онлайн, а где оффлайн”.
- TimeGrid: an online lesson has a camera icon before its time, a dashed outline and a striped background
  (`is-online`), on-site lessons stay solid (`is-onsite`); the same in crowded clusters; the block's label says
  „veebitund”; the phone list shows a „veeb” badge. CSS only in calendarV2.css.
- Tests: calendar 85 passed (+1). Queued from Oleksiy: rooms („кабинет”, low priority), half-hour cell status menu.

## 2026-10-15 · agent/lesson-admin-notes — the administrator's note on a calendar lesson

- Oleksiy (#improvement): „поле админ записей, которые видит только админ и учителя … пиктограмма на поле урока”.
  Main checked: 049de70.
- New collection `lessonNotes/{scheduleId}` (every lesson of the series) or `{scheduleId}_{date}` (one lesson):
  { scheduleId, date, teacherUid, studentName, text ≤ 1000, updatedAt, updatedBy, updatedByName }. Kept out of
  `schedule` because students and parents can read their own schedule entries. Rules: the admin writes / deletes;
  the admin and the lesson's teacher (`teacherUid` on the note) read; nobody else.
- CRM: `lessonNotesService` (services/firebase/lessonNotes.js, `notesFor`); calendar loads the notes (teacher: own);
  a note icon next to the time on the lesson block, in crowded clusters and in the phone list; `AdminNoteBox` in the
  lesson panel: the admin edits (recurring: „Kõik selle sarja tunnid” / „Ainult see tund”), the teacher reads.
- Limitation: a note keeps the teacher it was saved with; after a lesson moves to another teacher, saving it again
  gives it to the new teacher.
- Tests: crm-v2 1891 passed (+2), rules emulator `lesson-notes-emulator.integration.js` (in test:emulator) passes,
  build OK. Production after merge: deploy firestore rules (Vercel deploys the page).

## 2026-10-15 · agent/payment-ledger — „Laekumised”: the incoming money like a bank statement

- Owner (screenshot of Kontroll): „вид как в банке чтобы админ видел кто оплатил и поиск по имени и счету”.
  Main checked: 5c7c8b6.
- Kontroll opens on „Laekumised” (`PaymentLedger.jsx`; `paymentLedger` / `filterLedger` in `paymentReconciliation.js`):
  one row per bank transaction (several invoices + advance) and per hand-entered payment, newest first: day, payer
  (the bank's name: bank import, or „LHV väljavõte <day>, <name> (…)” in the note), explanation, invoice + child,
  amount; search by every word (payer, child, invoice number, explanation, amount), month filter, total of the rows.
  Voided payments are not listed. The findings moved to the tab „Erinevused (N)”; the page keeps the tab on reload.
- Bank rows that were never imported (the owner's 143 unmatched LHV rows) are not in this list.
- Tests: crm-v2 1889 passed (+2), build OK, e2e payment-check passes. No server or rules change.

## 2026-10-15 · agent/lhv-sender-header — the real LHV export + the owner's statement recorded

- The owner's LHV export (May–15.10.2026, 197 incoming rows, 15 571,12 €) names the payer column „Sender/receiver
  name”: added to `bankReconciliation.js` (+ test). Main checked: d0e67c3.
- With the owner's approval 26 payments (1 263 €) were recorded in production through financeApi /payments (the
  „Makse” path, requestId `lhv-<archiving code>`, note „LHV väljavõte …”): 17 by the invoice number in the
  explanation, 9 by the child's / payer's name and the exact amount. 28 rows were already entered by hand (skipped).
  KS-2026-022, -067, -078, -083, -103 became paid; the old paid invoices got their records.
- Not recorded (owner: „не вносить, дать список”): 143 rows, 11 160,12 € (lessons paid before CRM invoices,
  Töötukassa, companies with the old „arve nr 260xx” numbers, payments with a wrong invoice number). The list is a local
  file for the owner (not in git). Still open: KS-2026-004 and -042 (paid, no matching bank row), -030, -049, -050 and
  the October invoices.
- Next safe step: the admin checks „Kontroll” (KS-2026-066 duplicate, the 2 remaining paid-without-record invoices).

## 2026-10-15 · agent/payment-reconciliation — „Kontroll”: invoices against payments and the LHV statement

- Owner: „надо сделать так чтобы админ мог сверять счета по оплатам”; chose „выписка банка + отчёт”, bank LHV.
  Main checked: 5eb3aef (2026-10-15).
- Production found (read-only): 23 invoices KS-2026-001…043 marked „Makstud” without a payment record (the new
  finance page counts them as unpaid); KS-2026-066 paid twice (two records 2 s apart from the old haldus.html, 360 €
  on a 180 € invoice); 7 bank transactions (567 €) still unapplied.
- CRM: Finantsid → tab „Kontroll” (admin) = `PaymentCheckPanel.jsx` + pure `paymentReconciliation.js`: duplicates
  (same amount and day, entered ≤ 10 min apart) → „Tühista korduv” (financeApi /payments/void); overpaid →
  „Ülejääk ettemaksuks” (/invoices/resolve-overpayment); paid without a record → „Lisa makse kirje” / „Lisa kõigile”
  (/payments with requestId `reconcile-missing-<invoiceId>`, amount and day from the invoice); status ≠ payments;
  payments on cancelled or missing invoices; bank money not on an invoice → „Ette makstud”. „Impordi LHV väljavõte”
  opens the existing bank import. `paymentsService.listAll()` (admin rules).
- Bank import (`bankReconciliation.js`): LHV CSV headers in Estonian, English and Russian; outgoing (D) and non-EUR
  rows skipped; a match also by the parent's name in another word order or the child's name in the explanation.
- Payment dialogs (month page and the old page) send one requestId per opened form: a double click never records
  a payment twice.
- Tests: crm-v2 1887 passed (+12), build OK, e2e 16/16 (+1 `payment-check.spec.cjs`). No server or rules change.
- Production after merge: nothing to deploy beyond Vercel (automatic). The fixes in „Kontroll” are the admin's
  clicks; nothing was changed in the production data by the agent.
- Next safe step: the admin opens „Kontroll”, voids the KS-2026-066 duplicate and adds the 23 missing records.

## 2026-10-15 · agent/parent-accounts — the administrator creates parent logins

- Owner: „дай админам возможность создавать аккаунты родителей”. Main checked: 0bea9f8 (2026-10-15).
- Server: `staffOperationsApi /accounts/invite-parent` (admin only) + pure `functions/parent-invite-core.js`: a new
  e-mail → Firebase account without a password, `users/{uid}` role parent (approved, `registrationSource: invite`),
  linked to the chosen cards through `linkAccountToStudent` (relationship parent), cards without parentName /
  parentEmail get them, e-mail with the password link (ET+RU, names the children; `composeInviteEmail` got `children`).
  An e-mail that already has a parent (or student-and-parent) login → that login is linked to the cards it is not on
  and gets a new password link. Staff logins and a child's own login are refused (409). 0–10 cards per call.
- CRM: „Lapsevanemad” → „Lisa lapsevanem” (`features/parents/ParentInviteDialog.jsx`: name, e-mail, phone, children
  search; the first child fills an empty name / e-mail from its card; copy link when the mail is not confirmed);
  student card „Konto” → „Loo lapsevanema konto” (prefilled from the card) when no parent login is linked.
- Tests: functions 291/291 (+6), crm-v2 1875 passed (+5), build OK, e2e 15/15 (+1 `parent-invite.spec.cjs`).
- Production after merge: deploy functions `staffOperationsApi`. No rules change.
- Next safe step: after deploy, create one real parent login from a card whose parent has none and check the e-mail.

## 2026-10-15 · agent/cancel-sent-invoice — an e-mailed unpaid invoice can be cancelled

- Owner: Mykyta's mother registered with a wrong e-mail; invoice KS-2026-094 went there and could not be cancelled
  („Sent invoices need a separate correction”), the corrected KS-2026-098 exists.
- `invoice-cancellation-core.js`: a sent invoice is cancellable with `afterSending: true` (the admin's confirmation);
  paid / credited / lesson-linked / credit-noted invoices still never. `manualInvoiceApi /cancel` takes `afterSending`,
  marks `cancelledAfterSending`, the audit keeps `wasSent` + `sentTo`. Never deleted: the number and the reason stay.
- CRM: „Tühista” also on sent unpaid invoices (and unpaid lesson-package invoices); the dialog requires the checkbox
  „Arve on juba saadetud aadressile … Kinnitan tühistamise”.
- Tests: functions 285/285, crm-v2 finance 118/118 (+1, 1 rewritten). Production: deploy manualInvoiceApi.

## 2026-10-15 · agent/lesson-tokens — lesson tokens (Tunnipakett)

- Owner's queued request (memory lesson-tokens-request): invoice for N lessons → paid → admin confirms → the child gets
  N lessons → lessons use them → balance visible. Built on the existing package ledger (studentPackages, packageLedger,
  syncLessonPackageConsumption), which had no UI and was never triggered by CRM v2 lesson marks.
- Server: `functions/lesson-tokens-core.js`; `manualInvoiceApi /create-tokens`; `financeApi /invoices/tokens/credit`
  (+ backlog of lessons marked since the invoice date); trigger `syncLessonTokens`; the ledger sync now charges a
  no-show without notice like the monthly invoices and gives the credit back when a mark is removed (deleted lesson),
  stores lessonDate on the state; token invoices can be cancelled while not credited.
- CRM: Finantsid „Tunnipakett” dialog, invoice rows „Tunnipakett · N tundi” + „Lisa tunnid (N)”, plan mode
  „Tunnipakett” (no monthly invoice), `LessonTokensCard` on the student card and the parent dashboard.
- Rules: studentPackages / packageLedger readable by finance and the card's own student / parent.
- Tests: functions 285/285 (+5), finance emulator 31/31 (+1 full flow), crm-v2 +4, e2e 14/14 (+1). Docs: `docs/LESSON_TOKENS.md`.
- Production after merge: deploy rules + functions manualInvoiceApi, financeApi, syncLessonTokens (new). No package data existed.

## 2026-10-15 · agent/codex-course-tasks — tasks for Codex: B1→B2 modules 2–18 to every gate

- Owner: „дай задания для кодекса”. `docs/CODEX_TASKS_B1B2_IDEAL.md`: the full contract (scope, allowed files,
  definition of done = every lesson READY + strict + 0 unknown words + 40–55 min, how to rewrite a lesson after
  `b2/module01.js`, check lessons, listening audio, Estonian quality, PR hand-over; Claude publishes after merge).
  AGENTS.md points to it.
- `admin/course/courseTools.test.js` (skipped normally): `COURSE_REPORT=<module>` prints the gates per lesson,
  `COURSE_DUMP=<file>` writes built sheets for `tools/course-audit/language.py`.

