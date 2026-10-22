# INF 3 — training costs paid by private persons

Owner 2026-10-22: file INF 3 from the CRM. Source: Maksu- ja Tolliamet, vorm INF 3 „Füüsiliste isikute tasutud
koolituskulude deklaratsioon” (valid from 01.01.2025), tulumaksuseadus § 57¹ lg 6; the upload format is emta.ee
`inf3.xsd` (namespace `http://www.emta.ee/inf3`), checked 2026-10-22.

## Rules

- Who: a täienduskoolitusasutus with a licence or a **majandustegevusteade** for täienduskoolitus in EHIS (form point 2).
  E&P Koolitus OÜ must have one before it files — the owner checks this.
- What: the amounts private persons **paid** during the calendar year: payer (name, isikukood), trainee (name,
  isikukood), sum in euros with cents, training type: 1 tasemekoolitus, 2 täienduskoolitus incl. **language learning**
  (the school's default), 3 huviharidus under 18 (only with a huvikool curriculum).
- When and how: by **1 February** of the next year in e-MTA; more than 10 rows → as a file (XML or CSV).

## How the CRM counts (functions/inf3-core.js `inf3Rows`)

Per trainee: invoice payments received in the year by bank, card or cash + money received in advance (bank lines kept
as payer credits) − refunds. Not counted: payments from a prepayment (the money was counted when it came in), the
overpaid part of a payment (already in the payment), voided payments, invoices to a company (`payerRegCode`). Only rows
with both valid codes go into the XML; the others are listed as missing.

## Personal codes

- `taxIdentities/{studentId}`: `studentCode`, `payerName`, `payerCode`, `trainingType`, `source` (`admin` | `form`).
  Admin read only (rules); teachers can read student cards, so the codes are not stored there. The audit records that
  codes changed, never the codes. The UI shows them masked (`376•••••299`).
- Isikukood check: 11 digits, century digit 1–8, a real birth date, the check digit (weights 1…9,1, then 3…9,1,2,3).
  The codes in the e-MTA sample file are fictitious and fail this check.
- Parents' form: admin → INF 3 → „Vormi link” creates `taxFormTokens/{token}` (random 24 bytes, 60 days, at most 10
  submissions) and copies `https://crm.epkoolitus.ee/maksuandmed/<token>`. The parent (et / ru) enters the payer's name
  and both codes and confirms; `taxFormApi` (public, no login) saves them. The form never changes the training type.

## Where

- financeApi (admin): `/tax/identity`, `/tax/form-link`, `/tax/inf3` (rows + XML).
- `taxFormApi` (public): `/info`, `/submit`.
- CRM: `/finance/inf3` (admin), `/maksuandmed/:token` (public).
