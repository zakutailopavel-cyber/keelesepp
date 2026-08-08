# KeeleSepp -> Frappe Education + ERPNext spike

## Goal

Keep KeeleSepp CRM v2 as the school-facing React UI while moving commodity finance/accounting responsibilities to Frappe/ERPNext instead of extending a second accounting engine in Firebase.

This spike must not change production behavior. The existing Firebase finance path remains authoritative until the ERPNext staging flow passes end-to-end checks.

## Proposed boundary

```text
KeeleSepp React UI
        |
        | Firebase ID token
        v
KeeleSepp Firebase Functions
        |
        | Frappe API token (server only)
        v
Frappe Education + ERPNext
```

Never expose `FRAPPE_API_SECRET` to the browser.

## Initial ownership model

### Keep in KeeleSepp initially

- Firebase Authentication and current role policy
- calendar UI and Google Calendar sync
- current lesson workflow and attendance UX
- school-specific lesson billing eligibility rules
- existing staging UI

### Move to ERPNext in phases

- customer/payer master
- Sales Invoice creation and numbering
- accounts receivable / outstanding balance
- Payment Entry
- credit notes / accounting effects
- financial ledger and accounting reports

### Evaluate Frappe Education after finance spike

- Student
- Guardian
- Instructor
- Course / Program
- scheduling and attendance
- student portal

Do not migrate those domains merely because matching DocTypes exist. Compare the KeeleSepp workflow first.

## Proposed identity mapping

| KeeleSepp | Frappe / ERPNext | Notes |
|---|---|---|
| `students/{studentId}` | Education `Student` | School identity. Evaluate after finance spike. |
| payer / parent / company | ERPNext `Customer` | The legal payer is the accounting party. Do not assume student == payer. |
| billable lesson(s) | Sales Invoice item rows | Preserve KeeleSepp lesson IDs as integration references. |
| `invoices/{id}` | `Sales Invoice` | ERPNext becomes accounting source of truth only after cutover. |
| payment record | `Payment Entry` | Allocate against Sales Invoice. |
| cancellation / correction | Credit Note / return Sales Invoice | Prefer ERPNext accounting semantics over custom balance patches. |

## Critical KeeleSepp rule

A student and payer are not necessarily the same person. Invoice creation must resolve the payer first and map that payer to an ERPNext `Customer`.

## Idempotency

Do not rely only on a generated ERPNext invoice number.

For every automatic invoice plan create a stable KeeleSepp integration key derived from:

```text
billing month + student ID + payer ID + sorted billable lesson IDs
```

Store that key in KeeleSepp and, where practical, in a custom ERPNext field such as `custom_keelesepp_billing_key` with uniqueness validation.

Before invoice creation:

1. resolve the billing plan;
2. calculate the stable integration key;
3. check the local integration record;
4. check ERPNext for the same integration key;
5. create and submit only when both checks confirm absence;
6. persist the ERPNext document name back to KeeleSepp.

This keeps retry safety even if a request times out after ERPNext has accepted it.

## Server configuration

Required environment variables:

```text
FRAPPE_BASE_URL=https://<staging-instance>
FRAPPE_API_KEY=<integration-user-api-key>
FRAPPE_API_SECRET=<integration-user-api-secret>
```

Use a dedicated Frappe integration user with the minimum roles needed for the spike.

## Phase 1 acceptance test

No UI changes yet.

1. `whoAmI()` succeeds from Firebase Functions to the staging Frappe instance.
2. Read a test `Customer`.
3. Create a test `Customer` through the server adapter.
4. Create a draft Sales Invoice for a test payer.
5. Submit the Sales Invoice.
6. Create and submit a Payment Entry allocated to it.
7. Verify invoice status / outstanding amount in ERPNext.
8. Repeat the KeeleSepp request and prove no duplicate invoice is created.

Use test data only.

## Phase 2 KeeleSepp finance adapter

Once Phase 1 passes, add a provider boundary, for example:

```text
finance provider
  - firebaseLegacyFinanceProvider
  - erpNextFinanceProvider
```

The React components should call the KeeleSepp API without knowing which accounting backend is active.

Suggested staging flag:

```text
FINANCE_PROVIDER=firebase | erpnext
```

Default remains `firebase` until the complete staging scenario passes.

## Phase 3 migration

Only after reconciliation:

- migrate or import open invoices;
- map existing payers to ERPNext Customers;
- preserve old KeeleSepp invoice IDs as external references;
- reconcile outstanding balances;
- switch staging reads/writes to ERPNext;
- run the parent/student debt view against ERPNext-backed data.

Production cutover requires a separate decision.

## What this spike intentionally does not do

- no production deployment;
- no automatic invoice execution;
- no migration of historical accounting data;
- no replacement of Firebase Auth;
- no full CRM redesign;
- no direct Frappe API calls from the browser.
