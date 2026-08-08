# ERPNext staging runbook for KeeleSepp

This runbook exists for the integration spike only. It does not change production and it must not contain real school accounting data.

## Why this setup

The official `frappe/frappe_docker` project marks `pwd.yml` as a disposable demo/evaluation stack. That is exactly what we need for the first KeeleSepp finance end-to-end test. If the spike succeeds, move to the official production Compose/Easy Install path instead of promoting this disposable stack.

## 1. Start the disposable ERPNext staging

From the KeeleSepp repository:

```bash
bash infra/erpnext-staging/bootstrap.sh
```

The script clones or refreshes the official `frappe/frappe_docker` repository and starts its `pwd.yml` stack.

Expected local URL:

```text
http://localhost:8080
```

Use only synthetic test data.

## 2. Complete initial ERPNext setup

Log in as Administrator and complete the setup wizard. Create a test company matching the integration configuration. For the KeeleSepp spike use:

```text
Company: E&P Koolitus OÜ
Country: Estonia
Currency: EUR
```

Create or verify an item for manual lesson/charge rows:

```text
Item Code: KEELESEPP-LESSON
Item Name: KeeleSepp lesson
```

The item must be usable on Sales Invoice rows.

## 3. Add KeeleSepp custom fields

Create these ERPNext Custom Fields before using the provider:

### Customer

- `custom_keelesepp_payer_id` — Data, unique when possible
- `custom_keelesepp_payer_email` — Data

### Sales Invoice

- `custom_keelesepp_billing_key` — Data, unique when possible
- `custom_keelesepp_student_id` — Data

### Sales Invoice Item

- `custom_keelesepp_lesson_id` — Data

The local Firestore integration lock and the ERPNext billing key intentionally overlap. The lock protects concurrent KeeleSepp requests; the billing key protects retries after an uncertain remote response.

## 4. Create a dedicated integration user

Do not use Administrator credentials from KeeleSepp code. Create a dedicated API user with the minimum roles needed to:

- read/create Customer;
- read/create/submit Sales Invoice;
- read/create/submit Payment Entry;
- call the ERPNext payment-entry helper used by the provider.

Generate an API key and secret for that user.

## 5. Configure the smoke test

Set these environment variables only in the shell or server-side secret store:

```bash
export FINANCE_PROVIDER=erpnext
export FRAPPE_BASE_URL=http://localhost:8080
export FRAPPE_API_KEY='<integration-user-api-key>'
export FRAPPE_API_SECRET='<integration-user-api-secret>'
export ERPNEXT_COMPANY='E&P Koolitus OÜ'
export ERPNEXT_CUSTOMER_GROUP='All Customer Groups'
export ERPNEXT_TERRITORY='All Territories'
export ERPNEXT_LESSON_ITEM_CODE='KEELESEPP-LESSON'
```

Never prefix the secret with `VITE_` and never put it in the React application.

## 6. Run the real integration smoke test

From `functions/`:

```bash
node erpnext-live-smoke.js
```

The script performs a real test-data flow:

1. authenticate to Frappe;
2. ensure a Customer for a synthetic KeeleSepp payer;
3. create a Sales Invoice draft;
4. submit the Sales Invoice;
5. create and submit a Payment Entry;
6. reload the invoice and require `outstanding_amount == 0`;
7. repeat the same invoice request and require the same invoice id;
8. repeat payment against the fully paid invoice and require an idempotent no-op.

Success prints JSON containing `ok: true`, the ERPNext invoice/payment ids, the billing key and duplicate-protection flags.

## 7. Cutover gate

Do not set Firebase Hosting/Functions staging to `FINANCE_PROVIDER=erpnext` until the live smoke test passes against the selected ERPNext staging instance.

After the smoke test passes, the next KeeleSepp phase is:

- deploy only the relevant Firebase function to staging with ERPNext secrets;
- call `/provider-status` from an authenticated admin session;
- create one manual test invoice through the actual KeeleSepp UI;
- verify the same Sales Invoice in ERPNext;
- verify a retry does not create another Sales Invoice;
- only then evaluate automatic invoices.

Production `crm.epkoolitus.ee` remains outside this spike.
