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
| 4. Lesson billing | Link invoice lines to exact lessons and cancellation rules; prevent double billing | Done |
| 5. Tariffs and packages | Package ledger exists; tariff UI and tariff expansion are deferred because the owner does not need tariffs | Partial / deferred |
| 6. Teacher payroll | Server-owned work time, rates, activity evidence, approval/rejection, corrections and monthly payroll review | Done |
| 7. Expenses | Expense categories, receipts, VAT metadata and audited corrections; suppliers intentionally omitted for this language school | Done |
| 8. Period close | Monthly reconciliation checklist, locked periods, correction entries, opening/closing balances | Done |
| 9. Accounting export | Archived accountant CSV, attachments, payment/invoice/bank/lesson/payroll/expense/correction ledgers | Done (v1) |
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

The sixth Stage 4 slice creates a real PDF document for each lesson-line credit
note and can send that PDF as an email attachment through the existing SMTP,
Resend, SendGrid, or Firestore queue delivery path. The PDF is always rebuilt
from the immutable credit-note record; delivery metadata does not rewrite its
financial amount, reason, source invoice, or source lesson.

The final Stage 4 hardening slice runs the real `financeApi` against isolated
Authentication, Functions, and Firestore emulators. It verifies atomic
lesson-to-invoice linkage, immutable lines, counters, audit documents,
idempotent retries, rejection of double billing, lesson-line credit notes, and
rejection of duplicate corrections. The test refuses to run without emulator
hosts or with any project ID other than `demo-keelesepp-finance`.

Stage 4 is complete. Invoices linked to lessons remain intentionally not
directly deletable.

## Following slice: tariffs and packages

- Move price from a mutable student field to versioned tariff assignments.
- Support individual lessons, group lessons, monthly fees, and lesson packages.
- Record effective dates so historical invoices and payroll never change when a
  future tariff is edited.
- Model discounts and third-party payers separately from the lesson price.

The first Stage 5 slice introduces immutable per-lesson tariff versions and
dated student assignments. When a new assignment starts, the previous interval
is closed without changing its price snapshot. Lesson invoice lines resolve the
assignment that was active on each lesson date and preserve the tariff,
assignment, and unit price used. Existing `student.lessonPrice` remains a
migration fallback for dates without an assignment. Administrators can create
tariff versions and assign them from the invoice workflow; client-side writes to
both financial collections are denied.

The second Stage 5 slice introduces immutable lesson-package product versions,
separate student package accounts, and an append-only credit ledger. Issuing a
package creates its opening grant entry transactionally. Administrators can add
reasoned credit or debit corrections; the server prevents negative balances and
writes the resulting before/after balance to both the ledger and immutable
financial audit. Direct client writes to product, account, and ledger
collections are denied. Existing `packageTotal` / `packageUsed` counters remain
visible only as a migration fallback and are not rewritten by the new flow.

The third Stage 5 slice synchronizes completed lessons with package balances.
An explicit package selection is honored first; otherwise the oldest eligible
balance is used. Each completed lesson consumes exactly one credit through an
append-only entry linked to the lesson ID. Reversing completion creates a
separate restoration entry in the same package, and completing it again starts
a new numbered cycle. Sync requests and deterministic ledger IDs prevent
duplicate debits under retries or concurrent saves. A completed lesson with no
eligible credit is marked for attention rather than forcing a negative balance.
Lessons with active consumption cannot be deleted until their credit is
restored. Package-covered lessons are excluded from per-lesson invoice
selection, preventing double charging. Newly ledger-managed students stop
changing both legacy `packageUsed` and `lessonsSinceInvoice` counters; students
without registered package accounts retain the existing behavior.

The next Stage 5 slice should link package issuance to an invoice/payment
workflow. It should preserve the immutable product price snapshot, distinguish
issued versus paid/activated packages, support an explicit free or sponsored
package reason, and correct a sale with credit/refund entries rather than
rewriting either the package or its opening grant.

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
- active school expenses have supporting documents attached;
- an accountant export has been generated and archived.

After close, changes are made through dated correction entries rather than by
editing historical records.

The first Stage 9 slice adds an administrator-only monthly invoice register. It joins
issued invoices with active payment allocations and normalized bank transactions,
shows payment provenance and reconciliation mismatches, and exports the filtered
invoice register as CSV. It is a read-only projection and does not duplicate the
authoritative financial collections. Accountant-specific VAT fields, attachments,
payment-ledger export, opening balances and an archived export manifest remain
separate slices.

The second Stage 9 slice adds a lesson-to-payment control register. For every lesson
in the selected month it distinguishes exact immutable invoice-line links, package
coverage, explicit free/cancelled/write-off decisions, credits, unbilled work and
legacy records. Full payments cover every active lesson line; partial invoice
payments are shown as a deterministic oldest-line-first projection with the
allocation method, lesson ID, invoice ID and payment IDs visible in the UI and CSV.
The register does not rewrite or backfill historical data. Missing reciprocal links,
duplicate billing, line-total mismatches and paid invoice flags without authoritative
payment records are surfaced as blocking reconciliation errors.

The fourth Stage 9 slice adds optional immutable payment-to-invoice-line allocations.
An administrator can distribute an active payment across exact lesson rows. The current
allocation is a version pointer on the payment; every correction requires its own date and
reason, creates a new append-only `paymentLineAllocations` document, links to the superseded
version and writes a before/after financial audit entry. Explicit allocations reserve lesson
capacity before remaining unversioned payments use the derived FIFO projection. Missing,
overlapping, over-payment or incomplete exact allocations block monthly review. Existing
payments without allocation versions remain readable through the migration-safe FIFO fallback.

The fifth Stage 9 slice adds an accountant-facing allocation work queue and version history.
Suggestions are computed from the payment's invoice, immutable lesson rows, dates, amounts and
capacity already reserved by other current exact versions. High, medium and low confidence remain
advisory: no suggestion is persisted until an administrator reviews the rows and submits the
existing server-validated command. The same modal exposes every append-only version with its
effective date, reason and line amounts.

The sixth Stage 9 slice adds safe bulk confirmation and bank-reference evidence. Pending complete
suggestions reserve lesson capacity in deterministic payment-date order, preventing overlapping
batch proposals. Only high-confidence rows can be selected; bank-sourced rows require a unique
normalized invoice reference in their payment description. Every selection still executes as an
independent idempotent Financial Core command with its own immutable audit record and current-state
validation. The bank-statement matcher also distinguishes unique references, duplicate references,
unique name-plus-balance proposals and ambiguous names. Fully automatic posting and OCR remain
future slices.

The third Stage 9 slice attaches private payment-order evidence to an exact payment record.
Administrators can upload a bounded PDF or image, while students, parents and teachers have no
Storage access. The Financial Core validates the payment-scoped Storage path and appends
immutable document metadata plus a financial audit entry without changing payment or invoice
amounts. The accounting register exposes evidence files and includes their names and stable IDs
in CSV. OCR, supplier documents, accountant export archives and document retention policies
remain future slices.

The first Stage 8 slice adds a consolidated monthly billing-control checklist and an
administrator-confirmed review snapshot. The UI joins the invoice, payment, bank-allocation and
lesson-line controls, promotes normal unbilled lessons to blocking decisions, and keeps
migration-era invoice links as visible non-blocking warnings. Confirmation is never trusted from
the browser: Financial Core independently re-reads the authoritative collections, rejects a
month with errors or unresolved decisions, and creates an append-only
`financialPeriodReviews` version plus a latest-review pointer and financial audit entry.

The final Stage 8/9 slice adds the real close. A month can close only after it has ended, the exact
canonical review fingerprint is current, payroll is resolved, every active expense has evidence,
and the archived export fingerprint matches the same source records. Closing stores receivable and
payer-credit opening/closing balances and creates server-owned locks for every date in the month.
Cloud Functions and Firestore Rules reject ordinary historical mutations on those dates. Later
errors use append-only `financialPeriodCorrections` dated in an open period. The archived v1 export
contains stable-ID registers for invoices, payments and documents, bank rows, lessons, expenses and
receipts, payroll and corrections, with a bounded Firestore archive size.

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

The Functions runtime is Node.js 22. Financial pull requests run unit tests and
the isolated emulator transaction suite in GitHub Actions.
