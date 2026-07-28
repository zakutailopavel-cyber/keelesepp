# KeeleSepp Financial Core roadmap

This roadmap covers the internal platform for students, teachers, administrators,
and accounting. Atlas is explicitly out of scope.

## Product direction

The target is one traceable chain:

```text
Lesson delivered
  → billable item
  → invoice
  → bank transaction / cash payment
  → allocation
  → payer credit or remaining debt
  → teacher payroll and school ledger
  → locked accounting period
  → accountant export and management reports
```

Every financial mutation must be authenticated, transactional, idempotent where
retries are possible, and represented in an immutable audit trail.

## Delivery map

| Stage | Outcome | Status |
|---|---|---|
| 1. Payment register | Separate payments, invoice balances, partial payments, overpayments, immutable audit | Done in PR #3 |
| 2. Bank allocation | Normalized bank transactions, one transaction split across invoices, residual payer credits | Done in PR #4 |
| 3. Credit and corrections | Apply payer credits to invoices; void one payment and restore its source without touching unrelated payments | Done in PR #5 |
| 4. Lesson billing | Link invoice lines to exact lessons and cancellation rules; prevent double billing | In progress |
| 5. Tariffs and packages | Versioned prices, group/individual packages, discounts, family/employer/Töötukassa payer models | Planned |
| 6. Teacher payroll | Rate history, delivered hours, group rules, substitutions, bonuses, payroll review and lock | Planned |
| 7. Expenses and suppliers | Expense categories, supplier invoices, receipts, VAT metadata, recurring costs | Planned |
| 8. Period close | Monthly reconciliation checklist, locked periods, correction entries, opening/closing balances | Planned |
| 9. Accounting export | Accountant-ready CSV/API export, attachments, payment and invoice ledgers | Planned |
| 10. Financial analytics | Cash flow, aged debt, revenue by course/group, margin after payroll and expenses | Planned |

## Stage 3 — definition of done

- An administrator can apply one payer credit across one or more open invoices.
- Credit application and every resulting invoice payment happen atomically.
- The credit balance is reduced or closed and remains traceable to its bank source.
- An administrator can void one payment without voiding other payments on the invoice.
- Voiding a bank allocation restores the amount as payer credit.
- Voiding a credit application restores the source credit.
- Invoice balance and status are recalculated in the same transaction.
- Every operation requires a reason where it is a correction and writes immutable audit data.
- Existing invoices, payments, reconciliation, and legacy paid flags remain readable.

## Stage 4 — lesson-to-invoice linkage

The next PR should add billable lesson records without replacing the calendar:

1. Define billing status for every lesson occurrence:
   `unbilled`, `invoiced`, `paid`, `free`, `cancelled_on_time`,
   `late_cancel_billable`, or `written_off`.
2. Generate immutable invoice lines that reference exact lesson IDs and dates.
3. Prevent one lesson from being included in more than one active invoice.
4. Show invoice lines in the invoice UI and lesson billing state in the lesson UI.
5. Preserve the current `lessonsSinceInvoice × lessonPrice` calculation only as
   a migration fallback.
6. Add correction entries instead of silently changing already issued invoice lines.

The first Stage 4 slice (PR #6) creates automatic student invoices from exact
completed, unbilled lesson documents. The invoice stores dated immutable lines
and the same transaction marks every source lesson as invoiced. Manual and parent
invoices remain available as a migration fallback.

The second Stage 4 slice adds explicit dispositions for free lessons, timely
cancellations, billable late cancellations, and write-offs. Disposition changes
require an administrator reason, update the unbilled counter transactionally,
and are written to the immutable financial audit.

The third Stage 4 slice adds immutable credit notes for individual lesson lines.
The original invoice amount and lines remain unchanged; its effective amount and
balance are recalculated transactionally, the source lesson becomes credited,
and an immutable audit entry records the reason and actor. A correction that
would turn an existing payment into an overpayment is intentionally blocked
until the excess payment is voided or a dedicated refund workflow exists.

The fourth Stage 4 slice resolves an invoice overpayment into traceable payer
credit without rewriting the original payment. It records gross, resolved, and
net payment amounts, updates linked bank allocation totals, and writes an
immutable resolution and audit entry. Open payer credit can be refunded through
a separate immutable outgoing record. Credit-sourced invoice payments must still
be voided back to their source credit before an overpayment is transferred.

The fifth Stage 4 slice lets an administrator select an exact subset of currently
billable lessons in the invoice wizard. All eligible lessons remain selected by
default, manual invoices remain available as a migration fallback, and the
server still validates the chosen IDs transactionally before creating immutable
lines and marking their source lessons as invoiced.

The next slice should add a printable/email credit-note document, then close
Stage 4 with focused emulator coverage for the lesson and invoice transaction.
Invoices linked to lessons remain intentionally not directly deletable.

## Following slice: tariffs and packages

- Move price from a mutable student field to versioned tariff assignments.
- Support individual lessons, group lessons, monthly fees, and lesson packages.
- Record effective dates so historical invoices and payroll never change when a
  future tariff is edited.
- Model discounts and third-party payers separately from the lesson price.

## Payroll dependency

Teacher payroll starts only after lesson occurrences have stable IDs and statuses.
The payroll base will be:

```text
teacher + lesson occurrence + duration + lesson type + rate version + adjustment
```

Payroll periods must have draft, reviewed, approved, paid, and locked states.

## Accounting and period close

A period can be closed only when:

- all imported bank transactions are allocated or explicitly left as payer credit;
- invoice balances match active payment allocations;
- payment reversals and refunds are resolved;
- teacher payroll is approved;
- supplier expenses and supporting documents are attached;
- an accountant export has been generated and archived.

After close, changes are made through dated correction entries rather than by
editing historical records.

## Cross-cutting technical work

The platform currently keeps substantial UI and business logic in `haldus.html`.
Each financial slice should move new calculations and mutations into testable
modules or server functions. A full rewrite is not required. Extraction order:

1. currency and allocation rules;
2. invoice/payment/credit commands;
3. lesson billing rules;
4. payroll calculations;
5. reporting projections.

Security rules, unit tests, migration notes, and an explicit rollback/correction
path are required for every financial PR.
