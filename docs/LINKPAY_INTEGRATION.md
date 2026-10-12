# LHV LinkPay (EveryPay) — KeeleSepp CRM integration spec

Status 2026-10-12: **sandbox configured, CRM not changed.** This is the contract for the agent (Codex) that builds the
integration. Production stays off until the owner gives separate permission.

## 1. What is configured in LHV Paytech Sandbox (`merchant.sandbox.lhv.ee`)

| Setting | Value |
|---|---|
| Link | `KeeleSepp - CRM invoices - SANDBOX` (portal id 3252912) |
| Link token (`linkpay_token`) | `b3uagr8a5v` — not a secret, it is part of every link |
| Status / language | Active / Estonian |
| Processing account / currency | EUR3D1 / EUR (card + open banking) |
| Payment limit / expires at | none / never (reusable for every invoice) |
| Subscription, ToS, Customer URL | off / none / empty (no real confirmation page yet) |
| Button label | „Maksa arve” |

Fields (all: Customer changeable OFF, URL changeable ON):

| Field | Label | Enabled | Required |
|---|---|---|---|
| `transaction_amount` | Summa (EUR) | always | always (portal fixed) |
| `invoice_number` | Arve number | ✓ | off |
| `customer_name` | Maksja nimi | ✓ | off |
| `customer_email` | Maksja e-post | ✓ | off |
| `order_reference` | Makse viide | ✓ | off |

„Required” is off on the URL fields on purpose: the customer cannot edit them, so a required empty field would block the
payment; the server always sends them. The old link `E&P Koolitus OÜ - TEST payment 1 EUR` (fixed 25 €, 1 payment,
English) is left untouched.

E-shop `epkoolitus.ee`: **Callback Notification URL is empty** — set it only when the CRM endpoint (§4.5) exists.

## 2. Verified in the sandbox

- `https://payment.sandbox.lhv.ee/lp/b3uagr8a5v` opens the Estonian form with the labels above; amount 0,00 € and not editable.
- A URL with parameters and a wrong `hmac` → „Esitatavates andmetes või HMACi valideerimises tekkis viga” (no payment possible).
- A URL with parameters and no `hmac` → „page doesn't exist”.
- **Not yet verified:** the two correctly signed links (A 25 € KS-TEST-001, B 175 € KS-TEST-002) — the secret is not
  available to the agent. The owner runs the local script `linkpay-sign-test.cjs` (repo root, not committed; reads the
  secret from `LHV_API_SECRET`, prints A, B and a tampered A). Expected: A and B show their amount and invoice number in
  Estonian; the tampered A shows the HMAC error.

## 3. Signing (EveryPay „Generate pre-filled LinkPay links”)

```
query = http_build_query({ transaction_amount, invoice_number, customer_name, customer_email, order_reference, linkpay_token })
        with spaces as %20 (PHP urlencode otherwise: only A–Z a–z 0–9 - _ . unencoded)
hmac  = hex(HMAC-SHA256(key = API secret, message = query))
url   = `${LINKPAY_PREFIX}?${query}&hmac=${hmac}`
```

- Sandbox prefix: `https://payment.sandbox.lhv.ee/lp` (NOT `https://pay.every-pay.eu/lp` from the generic example).
- Production prefix: confirm with LHV (expected `https://payment.lhv.ee/lp`).
- `transaction_amount`: the invoice's **open balance** (`balanceDueCents`), two decimals with a dot (`175.00`).
- `order_reference`: unique per attempt, allowed `a–z A–Z 0–9 / - ? : ( ) . , ' +` and space, e.g. `KS-2026-123-A3`.

## 4. Requirements for the CRM

1. **Signed URL on the server only.** New action in `invoiceApi` (e.g. `POST /pay-link { invoiceId }`), allowed to staff
   and to the parent/student who owns the invoice (same ownership check as the PDF). It refuses cancelled, paid and
   zero-balance invoices, creates `paymentAttempts/{orderReference}` `{ invoiceId, invoiceNum, amountCents, currency:'EUR',
   env, status:'created', createdAt, createdBy }` and returns the signed URL. The secret never reaches the browser,
   logs or Firestore.
2. **„Maksa arve” in the parent cabinet** (and the student's, if he pays): a button on every open invoice that calls
   the action above and redirects. No URL is stored in the client.
3. **Link in the PDF and the e-mail:** a stable CRM link, not a signed URL (the amount may change before payment):
   `https://crm.epkoolitus.ee/maksa/<invoiceId>?k=<payToken>` — `payToken` random, stored on the invoice; the page
   creates a fresh attempt and redirects (works without login). Text in the PDF: „Maksa kaardi või pangalingiga: <link>”.
4. **Server-side configuration** (Secret Manager / functions params, separate per env): `LHV_API_USERNAME`,
   `LHV_API_SECRET`, `LHV_LINKPAY_TOKEN`, `LHV_LINKPAY_PREFIX`, `LHV_API_BASE`, `LHV_ENV` (`sandbox` | `production`),
   plus a switch `financeSettings/payments.linkpayEnabled` (default false).
5. **Callback:** new HTTPS endpoint (e.g. `paymentCallbackApi`) set as the e-shop Callback Notification URL. EveryPay
   sends only `payment_reference` + `order_reference` and **does not sign them**, so the endpoint trusts nothing in the
   request: it calls `GET {LHV_API_BASE}/payments/{payment_reference}?api_username=…` with Basic auth (username +
   secret) and uses only that answer. Confirm `LHV_API_BASE` for the LHV sandbox with LHV (not shown in the portal).
6. **Status only after confirmed payment:** the invoice is paid only if the API answer has `payment_state = settled`,
   the same `order_reference` as an existing attempt, amount = attempt amount, currency EUR. The payment is registered
   through the existing payment registration (ledger + `financialAudit`, same as „Registreeri makse”), with
   `method: 'linkpay'`, `providerPaymentReference`. `failed` / `abandoned` / `voided` only update the attempt.
   The redirect page (Customer URL) only shows „Kontrollime makset…” and reads the invoice; it never marks it paid.
7. **Idempotency:** a transaction on `paymentProviderEvents/{payment_reference}`: if it already exists with a final
   state, return 200 and do nothing. The attempt doc moves only forward (created → settled/failed). Repeated callbacks,
   retries and the redirect never create a second payment.
8. **Retry:** an unpaid (or partly paid) invoice can be opened again any time; every click is a new attempt with a new
   `order_reference` and the current balance. Old attempts stay as history.
9. **Sandbox vs production:** separate secrets and prefixes; `LHV_ENV` stored on every attempt; the emulator and preview
   use sandbox only; production needs the owner's switch. Never mix: a callback whose attempt `env` differs from the
   function's env is rejected.

Tests: unit tests for signing (fixed vector), amount formatting and the callback state machine; emulator tests for
ownership, cancelled/paid refusal, idempotent callback, partial payment. Do not put the real secret in tests.

## 5. Before real payments

LHV production agreement and LinkPay activation for E&P Koolitus OÜ; production link with the same settings; production
API username/secret into Secret Manager; Callback URL in the production e-shop; a real confirmation page for Customer
URL; owner's explicit go-ahead.
