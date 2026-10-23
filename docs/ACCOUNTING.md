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
| 10 | An entry is corrected or removed only to match its document, and what, when and why stays visible. | While the period is open an entry is corrected in place and every change is kept on the entry (`history`: who, when, why, before / after) and in `financialAudit`; a deleted manual entry stays as a tombstone (`deleted`, its number never reused). After „Sulge periood kuni …” only a **storno** or a new correcting entry dated after the lock. Firestore rules: no client writes. See „Parandamine”. |
| 11 | A sise-eeskiri with the chart and its content (not required from a microenterprise). | This document and the chart. |
| 12 | Keep source documents and registers seven years. | Nothing in the CRM removes entries or source documents from the database (a deleted entry is a tombstone, a voided purchase invoice stays with its PDF). |

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
| Purchase invoice (ostuarve, OA) | invoice date | each line's account (cost, prepaid, asset) „<tarnija> <kirjeldus>”; 2311 only for a line with deductible VAT | 2110 Võlad tarnijatele „<tarnija> Arve <nr>” |
| Payment to a supplier (VM) | payment date | 2110 | 1010 Pangakonto (bank, card) or 1000 Kassa (cash) |

Purchase entries are written by financeApi in the same transaction as the invoice or the payment (not by the sync),
ids `auto_purchase-invoice_<id>` and `auto_purchase-payment_<invoiceId>_<paymentId>`.

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
| OA | Ostuarve kanne | purchase invoice; old expense, its correction or void |
| VM | Väljamakse kanne | payment to a supplier |
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

## Tarnijad ja ostuarved (crm-v2/src/features/purchases, functions/purchases-core.js)

The accountant 2026-10-23: „Сделай таблицу поставщики и так же путь ей сделай дальше”. Route `/finance/ostuarved`
(Finantsid → „Ostuarved”, Raamatupidamine → „Ostuarved”), two tabs:

- **Tarnijad**: a ruled grid like Excel — Nimi | Registrikood | KMKR nr | Aadress | E-post | IBAN | Vaikekonto |
  Aktiivne. Every cell is typed in place; a changed row shows „Salvesta” (Enter saves); the last row adds a supplier.
  IBAN is checked (mod 97), the default account must be open, a registry code is unique. Nothing is deleted
  (inactive instead).
- **Ostuarved**: „Lisa ostuarve” opens rows inside the grid (no dialog). First row: Tarnija (typed, list of
  suppliers; picking one fills its default account into the lines), Arve nr, Kuupäev, Maksetähtaeg, Märkus, Olek
  („Tasumata” or „Tasutud kohe” + makseviis). Each line: Konto, Kirjeldus, Summa (with VAT), KM, „maha”. Tab in the
  last cell adds a line. „Salvesta ostuarve” books the OA entry (and with „Tasutud kohe” the VM entry on the invoice
  date). A supplier invoice number can be entered once per supplier.
- Per invoice: „Tasu” (inline row: date, amount — the open part by default, bank / card / cash) books a VM entry;
  partial payments add up, the status becomes „Tasutud”; „Eemalda” removes a payment typed by mistake (open period:
  its VM entry becomes a tombstone with the reason). „Muuda” corrects the invoice in place while its date is open —
  the OA entry changes with it (same number, the change in its history); the year cannot change and the total cannot
  be less than paid. „Tühista” (unpaid only, reason required): open period → the OA entry becomes a tombstone; locked
  period → a storno is booked today. „fail”: the invoice PDF / photo (PDF, JPEG, PNG, WebP < 10 MB, the same checks as
  an expense receipt) to Storage `financial/purchase-invoices/<id>/<docId>`. Overdue unpaid invoices show
  „Üle tähtaja”. Excel: one row per invoice line (Tarnija, Reg-kood, Arve nr, Kuupäev, Tähtaeg, Konto, Kirjeldus,
  Summa, KM, KM maha, Arve kokku, Tasutud, Olek); Tarnijad also to Excel.

**VAT.** E&P Koolitus OÜ is not VAT registered, so input VAT is not deductible: by default („maha” off) the whole line
amount, VAT included, goes to the cost account and there is no 2311 line. The KM amount is kept on the line for
information. „maha” on a line (only for a VAT-registered period, a decision of the owner and the accountant) books
the line net to its account and the VAT to 2311 Sisendkäibemaks.

**The old „Kulud” register** (`expenses`, booked expense / bank directly, without a supplier and without 2110) is now an
archive: no new costs there („Uus ostuarve” instead); its records can still be corrected, voided and given files, and
their entries stay as they were (RPS § 10). The `/expenses` routes stay for the archive. New costs go only through
suppliers and purchase invoices, so a cost and its payment are always two entries (OA and VM), like the sales side
(MA and LK).

## Parandamine (corrections, the accountant 2026-10-23: „мне нужно исправление сделать”)

Raamatupidamise seadus § 6–12: an entry must stay traceable to its source document, a correction must show what,
when, by whom and why (§ 10), and nothing is destroyed for seven years (§ 12). In the CRM:

- **Open period** (the date is after „Suletud kuni …” and not in a closed finance month): in the päevaraamat every entry
  that is not deleted, not reversed and not a storno has „Muuda”: its rows become editable in the grid
  (JournalDraft). A manual (PR) entry may change everything except the year (its number is per year); an automatic
  entry (MA, LK, OA, VM, …) keeps its date and document reference — only the lines and the description change, saved as
  `override` with `original` (the document's own lines), and a reason is required. „Kustuta” only for a manual entry,
  with a reason; the entry becomes a tombstone (`deleted`, hidden from the registers, „Näita kustutatud” shows it, its
  PR number is never reused).
- **Every change** appends `{ at, by, action: edit | override | document | delete, reason, before, after }` to the
  entry's `history` („Ajalugu (n)” under the entry) and writes a `financialAudit` document.
- **„Sulge periood kuni …”** (button on Raamatupidamine, `accountingSettings/lock.lockedThrough`): on and before that date
  nothing is booked, edited or deleted (manual entries, stornos, purchase invoices and payments, corrections). After it
  a mistake is corrected only by a storno (manual entries) or a new correcting entry dated after the lock. Moving the
  date back (reopening) needs a reason and is audited (`accounting.period.reopened`). The finance month close
  (`financialLockedDates`) locks the same way.
- Limit: the sync still books automatic entries of sales documents on their own date even in a locked period (the
  document exists; the finance month close prevents such documents). An override of a purchase entry's amounts in the
  päevaraamat does not change the purchase invoice — correct amounts on the Ostuarved page.

## Data and API

- `accountingEntries/{id}`: `auto_<sourceKey>`, `manual_<requestId>`, `reversal_<requestId>`, `opening_<requestId>`.
  Fields: `number`, `year`, `sequence`, `date`, `description`, `documentType` (also `purchaseInvoice`,
  `supplierPayment`), `documentRef`, `sourceKey`, `origin` (`auto` | `manual` | `reversal` | `opening`),
  `lines[{ account, debitCents, creditCents, note }]`, `totalCents`, `reversalOf` / `reversedBy`, `reason`,
  `createdAt`, `createdBy`; corrections: `history[]`, `override`, `original`, `deleted`, `deletedAt`, `deletedBy`,
  `deleteReason`, `updatedAt`, `updatedBy`; purchase entries: `purchaseInvoiceId`.
- `accountingSettings/lock`: `{ lockedThrough, reason, updatedAt, updatedBy }`.
- `suppliers/{id}`: `name`, `regCode`, `vatNumber`, `address`, `email`, `iban`, `defaultAccount`, `active`.
- `purchaseInvoices/{id}`: `supplierId`, `supplierName`, `supplierRegCode`, `documentNumber`, `date`, `dueDate`,
  `lines[{ account, description, amountCents, vatCents, vatDeductible }]`, `totalCents`, `deductibleVatCents`, `note`,
  `paidCents`, `payments[{ id, date, amountCents, method, reference, entryId, entryNumber }]`, `removedPayments[]`,
  `status` (`unpaid` | `paid` | `voided`), `documents[]`, `entryId`, `entryNumber`.
- `meta/accountingCounter_<year>.next`: the next number of a year.
- financeApi (admin only): `/accounting/sync`, `/accounting/entries`, `/accounting/entries/reverse`,
  `/accounting/entries/update`, `/accounting/entries/delete`, `/accounting/lock`, `/accounting/opening`,
  `/accounting/accounts`, `/suppliers`, `/purchase-invoices` (create, or update with `purchaseInvoiceId`),
  `/purchase-invoices/pay`, `/purchase-invoices/payment/remove`, `/purchase-invoices/void`,
  `/purchase-invoices/documents`. All bookings and corrections respect the accounting lock and closed months
  (`financialLockedDates`).
- Firestore rules: admins read `accountingEntries`, `accountingAccounts`, `accountingSettings`, `suppliers`,
  `purchaseInvoices`; nobody writes them from the client. Storage: `financial/purchase-invoices/**` admin read and
  create (PDF / images < 10 MB), no update or delete.
