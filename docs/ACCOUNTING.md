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
| Invoice | invoice date | 1200 Ostjatelt laekumata arved | 3000 (sales revenue) |
| Credit note | its date | 3000 | 1200 |
| Invoice cancellation | cancellation date | 3000 | 1200 (amount not yet credited) |
| Payment, bank / card | paid date | 1010 Pangakonto | 1200 |
| Payment, cash | paid date | 1000 Kassa | 1200 |
| Payment from a prepayment | paid date | 2500 Ostjatelt saadud ettemaksed | 1200 |
| Payment void | void date | 1200 | the payment's account |
| Bank money without an invoice (payer credit) | bank date | 1010 | 2500 |
| Overpayment moved to a payer credit | its date | 1200 | 2500 |
| Refund of a prepayment | refund date | 2500 | 1010 or 1000 |
| Expense | expense date | by category: rent 4210, advertising 4300, software 4320, learning materials 4050, bank fees 4340, taxes 4360, office 4330, travel 4510, other 4398 | 1010 (bank, card), 1000 (cash), 2450 (other) |
| Expense correction or void | its date | the old payment account | the old expense account |

Sales revenue account: **3000** since 2026-10-23 (the accountant). Until then automatic sales entries used 3060
Maksuvaba müügitulu; entries already written keep 3060 (entries are never edited, RPS § 10). Moving them needs an
owner decision: one reclassification entry 3060 → 3000 (manual entry, debit 3060 / credit 3000 for the balance) or
nothing (both accounts are on the report line „Müügitulu”, so the kasumiaruanne is the same). The chart name of 3000
is „Kauba, teenuse müük Eestis 20%” (Merit), although the company is not VAT registered — to be confirmed.

The sales document and the money are always separate entries: an invoice books 1200 / 3000 only; the payment is its
own entry (1010 or 1000 / 1200) on the payment date. No sales entry books to the bank.

Documents dated before the start date are in the opening balances. Without a VAT registration an expense is booked with
its VAT (input VAT is not deductible).

Not automatic yet: salaries and their taxes (manual entries until the payroll posting is built), cash received but not
yet linked to an invoice (it is booked when the receipt is linked).

## Päevaraamat and käibeandmik (crm-v2/src/features/accounting)

Layout of the owner's template (a Päevaraamat export of the accounting software) with the accountant's notes
(2026-10-23): a plain ruled grid, every cell bordered, nothing added. Excel (SpreadsheetML .xls) is the main format; the
screen shows the same grid. No PDF.

Päevaraamat (`journalReport`, `journalWorkbook`):

- Title, then the filters: Periood (from kuni to), Kande kood (one code or „Kõik”), Järjestus (Kande kood or Kuupäev).
- Two header bands: Kanne | Kuupäev | Dokument and Konto | Kuupäev | Dokument | Kirjeldus | Deebet | Kreedit. No
  rate or currency (all EUR).
- Per entry a grey row (code + running number, date, document), its lines (account number and name, date, document,
  the entry content + line note, debit, credit as 1 234,56; a zero side shows 0,00) and a bold total row.
- „Kokku N kannet” with the grand totals, „M kirjet”, footer: company, export time, „Rg-kood 17270880” (`COMPANY`, the
  same details as on invoices, functions/index.js PAYMENT_DETAILS).

Kande koodid (`entryCode`, from `origin` and `documentType`):

| Code | Name | Entries |
|-|-|-|
| MA | Müügiarve kanne | invoice, invoice cancellation |
| KR | Kreeditarve kanne | credit note |
| LK | Laekumise kanne | payment (bank, card, cash, from prepayment), payment void, money without an invoice, overpayment to a payer credit |
| TG | Tagastuse kanne | refund of a prepayment |
| OA | Ostuarve kanne | expense, its correction or void |
| PR | Pearaamatu kanne | manual entry |
| ST | Stornokanne | storno of a manual entry |
| AS | Algsaldode kanne | opening balances |

The running number („MA 3”) counts the entries of one code in one year in the order of the CRM entry numbers
(`2026-0001`…), so a later entry never renumbers an earlier one. The CRM number is shown as a tooltip on screen.

Käibeandmik (`trialBalance`, `trialBalanceWorkbook`): Konto | Nimetus | Algsaldo Deebet / Kreedit | Käive Deebet /
Kreedit | Lõppsaldo Deebet / Kreedit (two-level header), Kokku row.

Manual entry (`JournalDraft.jsx`): „Lisa kanne” opens editable rows at the top of the päevaraamat grid: the date,
document and content in the entry row, account / note / debit / credit in each line. Tab moves cell to cell; Tab in
the last cell adds a row. „Salvesta kanne” is enabled when debit = credit, at least two lines and every account exists
and is open; the server (`validateEntry`) checks again.

Müügitulu accounts in the chart (functions/accounting-chart.js): 3000 Kauba, teenuse müük Eestis 20%; 3010 Kauba müük
Eur.Liitu 0%; 3015 Teenuse müük Eur.Liitu 0%; 3020 Kauba eksport; 3025 Teenuse eksport; 3040 Müügitulu 9%; 3060
Maksuvaba müügitulu; 3070 Kasutatud kauba müük soetusmaksumuses; 3075 / 3076 Kasutatud kauba müügil 20% / 9% maksustatav
kasum; 3080 Metallijäätmete, kinnisasja, väärismetallide müük; 3099 Ümardused. Which to close is the owner's decision
(the accountant: the goods accounts do not apply to a training company); nothing is closed yet.

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
