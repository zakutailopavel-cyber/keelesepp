# Finance v3 — staged delivery specification

Status: PRs 1–4 are merged. The 2026-10-08 follow-up implements the confirmed individual billing mode and manual-invoice preview/PDF workflow. Legacy cleanup remains gated by owner confirmation.

## 2026-10-08 earlier-debt invoice actions follow-up

- In `Võlgnevused`, every prior-month open invoice has `Muuda`. An administrator can correct the due date with a written reason through the existing `staffOperationsApi /data-quality/invoice-due` route. The route writes due-date history and financial audit; closed financial periods remain server-blocked.
- A lesson-linked invoice can credit one uncredited lesson line at a time through the existing `financeApi /invoices/credit-lesson-line` route. This issues a separate credit note, updates the balance, and preserves the original invoice. Failed corrections remain visible in the form without claiming success.
- `Tühista` appears on prior-month invoices that satisfy the same client eligibility as the current-month list: unpaid, unsent manual/monthly invoices without lesson links or credits. The server rechecks eligibility, payments, credit notes, and financial date locks transactionally. Cancellation preserves the invoice number, original amount, and reason in audit history.
- Issued invoices are never hard-deleted. Other historical invoices require a specific credit or correction workflow. Arbitrary amount/line and payer edits are not covered by the existing safe APIs and remain an owner decision for a subsequent scoped change.
- The debt list stacks row details and actions at 375 px instead of hiding actions in horizontal scrolling. Local example invoices were used for desktop and mobile screenshots; no production actions or records were used.

## 2026-10-08 finance tabs and invoice printing follow-up

- The four month summary cards are interactive tabs: `Arveid` shows all issued invoices for the selected month, `Laekunud` shows invoices with received payments (including partial payments), `Laekumata` shows current-month open invoices plus the prior-month debt panel and bank import, and `Ette makstud` shows the existing student-advance register. Only the selected view is rendered below the cards.
- Monthly invoice preparation has its own `Koosta arved` tab; it no longer extends the default invoice list vertically. The `Väljastatud arved` hero action selects the all-invoices tab and clears list filters. Existing overdue notification links select the open-invoices tab with the overdue filter. Tabs support keyboard arrow, Home and End navigation.
- The advance-card figure uses the available cent balance from `payerCredits` and matches the existing advance register. The selected month still controls the three invoice summary cards; the advance balance is a current account balance.
- Every issued invoice row offers `Prindi`. This reads the existing server-generated PDF through `invoiceDeliveryApi.pdf`, opens it in the CRM preview, and offers a direct link to the browser PDF viewer for printing. It does not create, send or change an invoice. The existing download control remains in the preview.
- No financial schema, authorization rule or mutation API changes. Screenshots use only local mock repositories at desktop and 375 px widths.

## 2026-10-08 issued-invoice follow-up

- The month header offers a direct `Väljastatud arved` jump to the current month's invoice list. Monthly preparation has its own name/e-mail search; bulk creation applies only to visible, selected rows.
- The invoice list offers `Tühista` for an administrator on an unpaid, unsent manual or monthly invoice without lesson-linked lines or credit notes. Require a written reason of at least 10 characters. The backend checks eligibility and open financial dates again in one transaction, sets the effective amount and balance to zero, and appends `invoice.cancelled` to `financialAudit` while preserving the original invoice number and amount.
- Cancelled invoices leave active month counts, debts, send, payment and PDF flows. An eligible monthly invoice can be prepared again for the same student and month with a new invoice ID revision and a new sequential number; the cancelled document is retained.
- Sent, paid, credited, lesson-linked and financially closed invoices require their existing correction workflow. Do not offer destructive deletion for these records. Delivery reserves `emailStatus: sending` before sending, so cancellation and email delivery cannot race past the eligibility check.
- Screenshots and UI checks use local mock repositories at desktop and 375 px widths. No production records, messages or payments are used.

## Product decisions

- Deliver one reviewable, green PR at a time, in dependency order. Keep the current Finance v2 services and mutation APIs as the source of truth.
- The new monthly screen becomes `/finance` only in PR 2. Preserve the current screen at `/finance/vana` during transition.
- Do not send invoices or reminders from background UI actions; existing explicit user actions continue to gate delivery.
- Keep financial amounts in integer cents for summaries and balances. A credit note remains a separate accounting record and must not be represented as a negative open balance.
- For a row with a positive balance, overdue takes precedence over partial-payment, failed-email, and no-show attention states. Fully paid and credited rows do not count as overdue.
- A due date is current for the full local calendar day; overdue begins the next day.
- Billing basis confirmed by the owner on 2026-10-07: the default is **one month in advance**. The invoice created during the current month uses the next month's planned calendar lessons; differences from the prior month remain explicit correction lines.
- Some students have an individual agreement to pay **after lessons actually take place**. Store this as an effective-dated student billing-plan override, not as a global switch or an invoice-row guess. Actual billing uses only chargeable lesson outcomes for the completed period. Changing the mode must never rewrite issued invoices or earlier billing history.
- For implementation, actual-lesson billing defaults to the 10th of the following month; keep the due rule in the billing plan so an individual agreement can override it later without rewriting history.
- Advance reconciliation is an auditable **paid lesson balance**, displayed in both lesson units and cents. Issuing a €100 advance invoice at €20 per lesson covers five units. A unit is consumed only by a final calendar outcome: `Toimunud`, or a chargeable `Puudus_eta` unless that lesson is waived. Unmarked, school-cancelled, notified-absence and waived lessons consume no unit. If four of five covered lessons are consumed, the next five-lesson invoice shows gross €100, one carried unit / €20 credit, and €80 due.
- Preserve the original paid value in cents when carrying a unit forward; price changes must not revalue an existing credit. Duration-based units may be fractional. Reconciliation must be idempotent by invoice/student/lesson evidence and must never mark a lesson held on behalf of a teacher.
- Students billed from actual outcomes do not also consume an advance balance for the same period.
- Manual invoice creation shows a live HTML preview before saving. `Loo ja laadi PDF` first creates the invoice and then downloads the existing server-generated document so its number, seller details and payment details are authoritative. It must never download a locally fabricated accounting document.
- Do not use production data or send real e-mail for screenshots or tests. Do not deploy, migrate production data, or merge these PRs.

## PR sequence

1. **`agent/finance-v3-rows`** — `financeRows.js`: row-state derivation, monthly summaries, sorting, and filters, with unit coverage for unpaid, partial, paid, overdue, credit, email failure, and no-show states. Add this specification and update `docs/PROJECT_STATE.md`.
2. **`agent/finance-v3-screen`** — create `FinanceMonthPage.jsx`; extract current data loading into `useFinanceData.js` using existing services; route `/finance` to the new page and preserve `FinancePage` at `/finance/vana`. Component tests mock APIs and cover invoice creation plus sending, payment registration, reminder, inline price/e-mail editing, and batch creation progress/error.
3. **`agent/finance-v3-settings`** — add the Finance “Seaded” page and navigation; preserve aliases for old links; point notification and dashboard links to the new screen.
4. **`agent/finance-v3-debts`** — add “Võlgnevused” for all unpaid past invoices and “Impordi pank” in a modal; imported transactions update row state immediately.
5. **`agent/finance-v3-cleanup`** — only after the owner confirms the new screen, remove obsolete `FinancePage` parts and update docs.

## Required checks before each PR

Run from `crm-v2`:

```sh
npx vitest run src/features/finance src/features/students src/services/firebase
npx vitest run --maxWorkers=4
npx eslint .
npm run build
```

Known full-suite exception at plan authoring: exactly 10 `live-classroom` / “Alusta tundi” failures attributed to Node 26 `localStorage`; no other failures are acceptable. Reconfirm against current `main` before treating this as an exception. For PR 2, attach desktop and 375 px screenshots generated locally with mocks/emulator, never real production actions or data.

## Definition of done for every PR

- Put a current entry at the top of `docs/PROJECT_STATE.md`: goal, completed work, files, exact check results, limits, and one safe next step.
- PR report states: result; files; tests; data/security risks; production/external-service use (must be “no”); PR status; next step. List owner decisions needed at the end.
- Do not merge or deploy.
