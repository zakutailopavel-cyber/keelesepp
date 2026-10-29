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
- One held lesson = one credit, whatever its length (`TOKENS_PER_LESSON = 1`, server and client). The invoice line is
  „N × plan minutes × price”, so a double lesson still takes one credit (owner question below).
- `lessonPackageStates`: read by admin, finance and the card's own student / parent (the owed lessons); written only by
  the server.
- `studentPackages` / `packageLedger`: read by admin, finance and the card's own student / parent; written only by the server.
- A credited token invoice cannot be cancelled (correct the package: financeApi `/student-packages/adjust`).

## Open owner questions

- A double / longer lesson: one credit (today) or credits by length (e.g. 90 min on a 45-min plan = 2)? Changing it
  needs the ledger movement to carry more than ±1.
- Unused credits: kept forever (today) or do they expire (e.g. 3 months after the invoice)? No expiry exists.
- Owed lessons: paid by the next package (today) or invoiced separately (a monthly invoice line)?
- Multi-subject cards: a lesson takes the oldest package of the card, whatever the subject; separate packages per
  subject would need the lesson's subject matched to the package's.

## Tests

`functions/lesson-tokens-core.test.js`, `finance-emulator.integration.js` („lesson tokens: …”: invoice → unpaid refusal →
paid credit (+ backlog) → held / notified / no-show / removed marks → ledger; a used-up package → owed lessons → a removed
owed lesson cleared → the next package pays the owed lesson first), `security-finance-emulator.integration.js`
(„lesson tokens: the plan saves „Tunnipakett” …”: the rule and who reads owed lessons), `crm-v2/src/features/finance/lessonTokens.test.jsx`,
`e2e/tests/lesson-tokens.spec.cjs` (UI: dialog → payment → Lisa tunnid → trigger → student card and parent).
