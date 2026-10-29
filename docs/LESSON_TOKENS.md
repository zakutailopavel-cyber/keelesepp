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
   „Tunnipakett (aine): N × min × €”. „Loo ja saada” e-mails it.
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
do not expire; owed lessons are paid by the next package; one pool of packages per card (a lesson takes the oldest
package of the card, whatever the subject).

## Tests

`functions/lesson-tokens-core.test.js`, `finance-emulator.integration.js` („lesson tokens: …”: invoice → unpaid refusal →
paid credit (+ backlog) → held / notified / no-show / removed marks → ledger; a used-up package → owed lessons → a removed
owed lesson cleared → the next package pays the owed lesson first), `security-finance-emulator.integration.js`
(„lesson tokens: the plan saves „Tunnipakett” …”: the rule and who reads owed lessons), `crm-v2/src/features/finance/lessonTokens.test.jsx`,
`e2e/tests/lesson-tokens.spec.cjs` (UI: dialog → payment → Lisa tunnid → trigger → student card and parent).
