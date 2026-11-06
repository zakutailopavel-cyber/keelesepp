# Lesson tokens (Tunnipakett)

Owner (2026-10-14): an invoice for N lessons (e.g. 2 a week → 8–9), the card's lesson price; the parent pays; the
administrator confirms and the child gets N lessons; every lesson takes one; the remaining lessons are visible.
Owner (2026-10-29): per package invoice the school must see how many lessons were bought, held and are left, and when
the package is used up — how many lessons are owed (to be invoiced and paid).

## Flow

1. **Finantsid → „Tunnipakett”** (`crm-v2/src/features/finance/TokenInvoiceDialog.jsx`): choose the card (student and
   subject; the payer is the card's parent / payer), N lessons (4 / 8 / 9 / 12 or any 1–100), due date →
   `manualInvoiceApi POST /create-tokens`. The price is the card's plan price (`studentRevenuePlans.lessonPriceCents`),
   never the request's. Invoice: `billingMode: 'lesson_tokens_v1'`, `tokenCredits`, `tokenStatus: 'pending'`, one line
   „Tunnipakett (aine): N × min × €”. The dialog only creates it („Loo arve”); it is NEVER e-mailed automatically
   (Oleksiy 2026-11-06): the administrator checks it and sends it by hand with „Saada” on its invoice row. The reminder
   batches (scheduled `sendInvoicePaymentReminders`, admin `/monthly-reminders`, `/overdue-reminders`) skip package
   invoices (`functions/invoice-reminder-batch-core.js isPackageInvoice`); a reminder is only the row's own button.
2. The payment is registered as for any invoice (Makse, bank match, LinkPay).
3. **„Lisa tunnid (N)”** on the paid invoice row → `financeApi POST /invoices/tokens/credit` (admin): refuses an unpaid
   invoice; creates `studentPackages/tokens_<invoiceId>` (N credits, valid from the invoice date), a `grant` entry in
   `packageLedger`, marks the invoice `tokenStatus: 'credited'`, audit `student.package_credited_from_invoice`. A second
   click changes nothing. Lessons marked since the invoice date take their credits at once (backlog).
4. **Lessons**: trigger `syncLessonTokens` (lessons/{id} onWrite) → `syncLessonPackageConsumption` (existing ledger):
   a held lesson (`Toimunud`) and a no-show without notice (`Puudus_eta`, unless the plan has `chargeNoShow: false` or
   the lesson `billingWaived`) take one credit; another mark or a removed mark (the lesson is deleted) gives it back.
   Runs only for CRM v2 marks (`accountingSource: crm_v2`; the server lesson journal syncs packages itself), for cards with a package or lessons that took a credit.
5. **Owed lessons („võlg”)**: a chargeable lesson held when no package has credits gets `lessonPackageStates/{lessonId}`
   `status: 'needs_attention'` (+ `lessonDate`) and the lesson `packageConsumptionStatus: 'needs_attention'`. A mark
   that no longer charges (notified absence, „Kooli kulul”, invoiced separately) or a removed lesson sets the state to
   `cleared`. The next paid package pays the owed lessons first, oldest first (`OWED_LESSONS_TAKE_NEXT_PACKAGE`,
   `lesson-tokens-core.js` `packageForOwedLesson` / `tokenBacklogLessonIds`): on „Lisa tunnid” the backlog takes the
   owed lessons and the lessons since the invoice date; a later mark of an owed lesson takes the oldest token package
   with credits even if it is dated after the lesson. Catalogue packages (`sourceType: package_issue`) never pay an
   owed lesson.
6. **Visible** (`crm-v2/src/services/firebase/lessonTokens.js` `tokenAccount`, `tokenLine`, `tokenInvoiceUsage`):
   - student card → Finantsid → „Tunnipakett” (`LessonTokensCard`): „N tundi alles”, badge Aktiivne / Lõppemas (≤ 2) /
     Pakett otsas / Võlg; „Ostetud · peetud · alles · võlg”; a table per package invoice, oldest first (Arve, Alates,
     Ostetud, Peetud, Alles / läbi, a correction shown as „(+1 parandus)”); the owed lessons with their dates; every
     movement. Used-up packages (`status: depleted`) still count (before 2026-10-29 they dropped out of the totals).
   - finance month view: under a token invoice „Tunnipakett · 8 tundi · peetud 5 · alles 3” (or „läbi”), before
     crediting „tunnid lisatakse pärast makset”; the student's newest token invoice of the month adds „võlg N tundi
     (uus arve)”.
   - parent / student dashboard: the compact card with one line „Paketist alles N tundi” or „Pakett on läbi · N tundi
     ootab tasumist”.

## One subject per package (Oleksiy 2026-11-03)

„При составлении туннипакета у ученика нет возможности выбрать курс”: the dialog offered only the card and its main
subject, the server priced and labelled the invoice by the card's main subject and every lesson of the card took from
any package.

- **Dialog**: „Õpilane” (the option lists all the card's subjects) and „Aine (kursus)”: the card's active subjects
  (`subjects.js subjectsOf`); a card whose tracks have all ended gets the school's „Õppesuunad”. One subject is chosen by
  default; with several the administrator must choose. Price and total come from `studentRevenuePlans.subjectPrices[subject]`,
  else the card's price; „Praegu paketis (aine)” = `subjectBalance` (that subject's packages + shared ones).
- **Server** `manualInvoiceApi /create-tokens` takes `subject`; `lesson-tokens-core tokenInvoiceSubject` accepts only one
  of the card's subjects (any subject when the card names none), requires one on a card with several, picks the only one
  otherwise. Price `planForSubject`; the invoice stores `subject`, the line reads „Tunnipakett (Matemaatika): …”, the
  audit `invoice.created_lesson_tokens` carries `subject`.
- **Package**: `tokenPackageRecord` writes `tokenSubject` only when the invoice has `subject`; the grant ledger entry and the
  audit `student.package_credited_from_invoice` carry it too. `subject` (display) is unchanged.
- **Consumption** (`syncLessonPackageConsumption`): when no package of the card has `tokenSubject`, nothing changes (one
  pool, the old code path). Otherwise the lesson's subject (`lessonSubject`: its own if the card has it, else its
  teacher's track, else the only / main subject) picks the tiers (`packageTiersForLesson`): its subject's packages, then
  the packages without a subject; FIFO and the owed-lesson rule inside each tier. A lesson whose subject has no package
  while the card has packages only for other subjects is `not_applicable` (takes nothing, owes nothing; an owed state is
  cleared). An owed state stores `subject`. „Lisa tunnid” backlog of a subject package takes only that subject's lessons.
- **Views**: `LessonTokensCard` shows an „Aine” column („kõik ained” for a package without a subject) and the subject of
  owed lessons.
- Existing invoices / packages are not rewritten: without `subject` / `tokenSubject` they keep paying every lesson.

## One invoice for a family („Ühine tunnipakett”, owner 2026-11-04)

A parent paying for several children (or one child's two subjects, each at its own price) gets ONE package invoice:
one number, one PDF, one e-mail, one payment — like the combined monthly / manual invoice (`combined-invoice-core.js`).

- **Dialog** (`TokenInvoiceDialog.jsx`, rules in `tokenInvoiceRows.js`): the first line as before (card, subject, N
  lessons), „Maksja: name · e-mail” (`invoicePayer.js`); „+ Lisa rida (teine laps või aine, sama maksja)” adds a line
  (card + subject + N lessons), up to 12. The other lines offer the first card's payer's cards first („Sama maksja”);
  a card of another payer (`monthlyBilling.payerKey`, the server's `combined-invoice-core payerKey`) shows and is refused
  with „Kaartidel on erinev maksja: ühine tunnipakett on ühe maksja (sama lapsevanema) lastele…”; the same card and
  subject twice is refused. Each line shows its price (the subject's `subjectPrices`, else the card's price) and amount,
  „Kokku” the lessons, lines and total. One line → `/create-tokens` (unchanged); two or more → `/create-tokens-combined`.
- **Server** `manualInvoiceApi POST /create-tokens-combined` `{ items: [{ studentId, subject, lessons }], due, note,
  requestId }` (`lesson-tokens-core combinedTokenInput`: 2–12 lines, 1–100 lessons each, card + subject once;
  `combined-invoice-core combinedTokenRecord`): `checkOnePayer` (409 on mixed payers), every line's subject by
  `tokenInvoiceSubject` and price by `planForSubject` from that card's `studentRevenuePlans` (never the request's), the
  line „<name> · Tunnipakett (aine): N × min × €” with `studentId`, `subject`, `tokenCredits`. Invoice: `billingMode:
  'lesson_tokens_v1'`, `combined: true`, `studentIds`, `studentId` = the first card, `cardParts[i] = { studentId,
  studentName, subject, tokenCredits, priceCents, minutes, amountCents }`, `tokenCredits` = the sum, `tokenStatus:
  'pending'`, the payer snapshot of the first card (same payer for all). Audit `invoice.created_lesson_tokens_combined`.
  Idempotent by `requestId`.
- **Crediting** „Lisa tunnid (N)” → the same `financeApi /invoices/tokens/credit`: for a combined invoice
  (`lesson-tokens-core isCombinedTokenInvoice` / `tokenInvoiceParts`) one transaction creates per line
  `studentPackages/tokens_<invoiceId>_<lineIndex>` (`tokenPartPackageId`) on that line's card with its credits, price and
  `tokenSubject`, `sourceInvoiceLine`, its own ledger grant (`packageLedger` same id) and audit
  (`credit_tokens_<invoiceId>_<lineIndex>`); the invoice gets `tokenStatus: 'credited'`, `tokenPackageIds` (no
  `tokenPackageId`). Refused while not paid in full (partial payment too), when credited / voided; all packages present
  → idempotent 200 with `studentPackages`; only some present → 409 (cannot happen through the route). Then every package
  runs its own backlog (`consumeTokenBacklog`: its card's lessons since the invoice date and owed lessons, of its subject).
  Response: `studentPackage` (first), `studentPackages`, `backlog { consumed, packages: [{ studentPackageId, studentId,
  consumed }] }`.
- **Views**: student card „Tunnipakett”, parent / student line and Täna „Makstud tunnid lõppevad” read packages by
  `studentId`, so every line appears on its own card. Finance month view: `tokenInvoiceUsageLines` — „Ühine tunnipakett ·
  N tundi” and a line per card and subject („Mari · Eesti keel: 8 tundi · peetud 1 · alles 7”); owed lessons of a card
  once, on its newest token invoice (a combined invoice counts for each of its cards). `packagesForInvoices` returns an
  array per combined invoice.
- **Cancel / credit note / correction**: the one-card rules apply to the whole invoice (all its lines are credited
  together): not credited → can be cancelled or credited in full (`tokenStatus: 'voided'`); credited → refused („Selle
  paketi tunnid on juba õpilase kaardil”, correct the packages with `/student-packages/adjust`). A corrected replacement
  keeps `cardParts` and gets `tokenStatus: 'pending'`; `tokenPackageIds` is not copied.

## Price per hour on the composing page (Oleksiy 2026-11-06)

Every row of the dialog shows „Tunnihind: 25,00 € / h”, „Tund 45 min = 18,75 €” when the lesson is not 60 min, and
„N tundi × hind = summa”. The per-lesson price is `tokenInvoiceRows.js tokenPlanPrice` — the same rule as the server
(`planForSubject` + `tokenInvoiceLines`); the hourly figure is derived (price × 60 / minutes) for display only. A row
without price shows „Hind määramata — lisa see õpilase kaardil (Finantsid → Arveldus)” and both create buttons are
disabled. Test: `crm-v2/src/features/finance/TokenInvoiceDialog.price.test.jsx`.

## Package ↔ invoice link

One token invoice gives one package: `studentPackages/tokens_<invoiceId>` has `sourceInvoiceId` / `sourceInvoiceNum`,
the invoice has `tokenPackageId`, the ledger grant entry has `sourceInvoiceId`. Every package made by
`/invoices/tokens/credit` is linked; nothing is rewritten. Packages issued from the package catalogue
(`issueStudentPackage`, `sourceType: package_issue`) have no invoice and are shown as „arveta pakett”; they cannot be
linked automatically (no invoice reference is stored).

## Rules and settings

- Plan billing mode „Tunnipakett” (`billingMode: 'package'`): the card is not offered a monthly invoice. Until
  2026-10-29 `firestore.rules` (`studentRevenuePlans`) allowed only `advance` / `current` / `actual`, so saving the price
  form with „Tunnipakett” was refused; the rule now allows `package`.
- Per subject (owner 2026-11-06, ARCHITECTURE.md „Billing per subject”): one subject of a card may be on packages while
  another is billed monthly (`studentRevenuePlans.subjectBilling`). Its monthly invoice has no line for the package
  subject (the server refuses one), and with `subjectBilling` a lesson of a subject billed monthly takes no credit —
  also not from an old package without a subject. The no-show rule is the lesson's subject's. A plan without
  `subjectBilling` takes credits exactly as before.
- **Credits per lesson** (owner 2026-10-29): `lessonTokenCost(lesson) = max(1, floor(duration / 60))` — 45 / 60 / 90
  min = 1, a double lesson of 120 min = 2, 180 min = 3; no length = 60 min (`TOKEN_MINUTES`, `TOKENS_PER_LESSON` = the
  minimum; `functions/lesson-tokens-core.js` and the same in `crm-v2/src/services/firebase/lessonTokens.js`). The lesson
  takes them from one package that has them all (FIFO; `selectStudentPackageForLesson` / `packageForOwedLesson` with
  `credits`), the ledger entry moves the balance by that number, the state keeps `credits` (also on the lesson:
  `packageCredits`) and a corrected or removed mark gives back exactly that number (states written before this took 1).
  A length changed after marking (60 → 120): the old number comes back and the new one is taken (the trigger and the
  lesson journal call the sync a second time after such a restore). An owed lesson owes its credits; the views count
  owed credits. A single credit left in an older package is not split with the next package: a 2-credit lesson takes a
  package with ≥ 2 left, the single credit waits for a 1-credit lesson or a correction.
- `lessonPackageStates`: read by admin, finance and the card's own student / parent (the owed lessons); written only by
  the server.
- `studentPackages` / `packageLedger`: read by admin, finance and the card's own student / parent; written only by the server.
- A credited token invoice cannot be cancelled (correct the package: financeApi `/student-packages/adjust`).

## Open owner questions

Answered 2026-10-29: a double lesson is 120 min = 2 credits (rule above). Kept at the defaults for now: unused credits
do not expire; owed lessons are paid by the next package. Since 2026-11-03 a package invoice names a subject and its
package pays only that subject's lessons (above); older packages remain one pool.

## Tests

`functions/lesson-tokens-core.test.js`, `finance-emulator.integration.js` („lesson tokens: …”: invoice → unpaid refusal →
paid credit (+ backlog) → held / notified / no-show / removed marks → ledger; a used-up package → owed lessons → a removed
owed lesson cleared → the next package pays the owed lesson first), `security-finance-emulator.integration.js`
(„lesson tokens: the plan saves „Tunnipakett” …”: the rule and who reads owed lessons), `crm-v2/src/features/finance/lessonTokens.test.jsx`,
`e2e/tests/lesson-tokens.spec.cjs` (UI: dialog → payment → Lisa tunnid → trigger → student card and parent).
„Ühine tunnipakett”: `functions/combined-token-invoice.test.js` (input, price per card / subject, mixed payers refused,
a package per line, partial payment refused, backlog per card), `finance-emulator.integration.js` („lesson tokens: one
package invoice for a family …”: mixed payer 409, invoice, partial payment refused, credit → 3 packages + 3 grants + 3
audits + backlog per card, second click idempotent, a later lesson takes from its own line, credited invoice not
cancelled), `crm-v2/src/features/finance/TokenInvoiceDialog.combined.test.jsx`.
