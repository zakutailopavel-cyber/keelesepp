# Lesson tokens (Tunnipakett)

Owner (2026-10-14): an invoice for N lessons (e.g. 2 a week → 8–9), the card's lesson price; the parent pays; the
administrator confirms and the child gets N lessons; every lesson takes one; the remaining lessons are visible.

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
5. **Visible**: student card → Finantsid → „Tunnipakett” (`LessonTokensCard`: left, granted, used, every movement);
   parent dashboard (per child with a package); „Lõppemas” at ≤ 2 lessons.

## Rules and settings

- Plan billing mode „Tunnipakett” (`billingMode: 'package'`): the card is not offered a monthly invoice.
- `studentPackages` / `packageLedger`: read by admin, finance and the card's own student / parent; written only by the server.
- A credited token invoice cannot be cancelled (correct the package: financeApi `/student-packages/adjust`).

## Tests

`functions/lesson-tokens-core.test.js`, `finance-emulator.integration.js` („lesson tokens: …”: invoice → unpaid refusal →
paid credit (+ backlog) → held / notified / no-show / removed marks → ledger), `crm-v2/src/features/finance/lessonTokens.test.jsx`,
`e2e/tests/lesson-tokens.spec.cjs` (UI: dialog → payment → Lisa tunnid → trigger → student card and parent).
