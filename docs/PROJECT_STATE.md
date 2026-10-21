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
- Next safe step: after the functions deploy, the one-off production cleanup (token fields in 2 users docs, 9 outbox
  jobs) with a backup.

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
- Not deployed, not published (needs the owner's permission).
- Not done: C1 modules 8–10.
- Next safe step: owner's permission → deploy and publish module 7; then C1 module 8 the same way.

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

