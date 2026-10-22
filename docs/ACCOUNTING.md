# Bookkeeping (raamatupidamine) in the CRM

Owner 2026-10-22: full bookkeeping on the site, from **2026-01-01**. E&P Koolitus OÜ (17270880) is **not VAT
registered**. The chart of accounts is the owner's **Merit Aktiva** chart, so the books can be moved to or checked against
the accountant's Merit. INF 3 is a separate document (`docs/INF3.md`, next PR).

## Law (Raamatupidamise seadus, checked 2026-10-22 on riigiteataja.ee)

| § | Requirement | How the CRM meets it |
|-|-|-|
| 6 | Double entry; every entry has the date, an identifier, the debited and credited accounts with amounts and a reference to the source document. | `accountingEntries`: `date`, `number` (`2026-0001`), `lines`, `documentRef`; `validateEntry` refuses an unbalanced entry or one without a document reference. |
| 7 | Source document (algdokument): date, content, amounts; invoices also number and parties. | The CRM's invoices, credit notes, payments, bank lines and expense receipts; the entry keeps their number. |
| 8 | Chart of accounts. | `accountingAccounts` seeded from `functions/accounting-chart.js` (Merit Aktiva). Accounts are added or closed, never deleted. |
| 9 | Registers allow extracts by account in chronological order, machine-readable. | Päevaraamat (by date), pearaamat and käibeandmik (by account) from the same entries; Excel export. |
| 10 | An entry is corrected or removed only to match its document, and what, when and why stays visible. | Entries are never edited or deleted (Firestore rules: no client writes). A manual entry is corrected by a **storno** with a reason; an automatic entry follows its document (credit note, invoice cancellation, payment void, expense correction), each booked as its own entry on its own date. |
| 11 | A sise-eeskiri with the chart and its content (not required from a microenterprise). | This document and the chart. |
| 12 | Keep source documents and registers seven years. | Nothing in the CRM deletes entries or source documents. |

## Automatic entries (functions/accounting-core.js `automaticEntries`)

| Document | Date | Debit | Credit |
|-|-|-|-|
| Invoice | invoice date | 1200 Ostjatelt laekumata arved | 3060 Maksuvaba müügitulu |
| Credit note | its date | 3060 | 1200 |
| Invoice cancellation | cancellation date | 3060 | 1200 (amount not yet credited) |
| Payment, bank / card | paid date | 1010 Pangakonto | 1200 |
| Payment, cash | paid date | 1000 Kassa | 1200 |
| Payment from a prepayment | paid date | 2500 Ostjatelt saadud ettemaksed | 1200 |
| Payment void | void date | 1200 | the payment's account |
| Bank money without an invoice (payer credit) | bank date | 1010 | 2500 |
| Overpayment moved to a payer credit | its date | 1200 | 2500 |
| Refund of a prepayment | refund date | 2500 | 1010 or 1000 |
| Expense | expense date | by category: rent 4210, advertising 4300, software 4320, learning materials 4050, bank fees 4340, taxes 4360, office 4330, travel 4510, other 4398 | 1010 (bank, card), 1000 (cash), 2450 (other) |
| Expense correction | correction date | the old payment account | the old expense account |

Documents dated before the start date are in the opening balances. Without a VAT registration an expense is booked with
its VAT (input VAT is not deductible).

Not automatic yet: salaries and their taxes (manual entries until the payroll posting is built), cash received but not
yet linked to an invoice (it is booked when the receipt is linked).

## Data and API

- `accountingEntries/{id}`: `auto_<sourceKey>`, `manual_<requestId>`, `reversal_<requestId>`, `opening_<requestId>`.
  Fields: `number`, `year`, `sequence`, `date`, `description`, `documentType`, `documentRef`, `sourceKey`, `origin`
  (`auto` | `manual` | `reversal` | `opening`), `lines[{ account, debitCents, creditCents, note }]`, `totalCents`,
  `reversalOf` / `reversedBy`, `reason`, `createdAt`, `createdBy`.
- `meta/accountingCounter_<year>.next`: the next number of a year.
- financeApi (admin only): `/accounting/sync`, `/accounting/entries`, `/accounting/entries/reverse`,
  `/accounting/opening`, `/accounting/accounts`. Manual entries and stornos respect closed months
  (`financialLockedDates`).
- Firestore rules: admins read `accountingEntries` and `accountingAccounts`; nobody writes them from the client.
