# Bookkeeping (raamatupidamine) in the CRM

Owner 2026-10-22: full bookkeeping on the site, from **2026-01-01**. E&P Koolitus OÜ (17270880) is **not VAT
registered**. The chart of accounts is the owner's **Merit Aktiva** chart, so the books can be moved to or checked against
the accountant's Merit. INF 3 is a separate document (`docs/INF3.md`, next PR).

## Two bookkeepings (owner 2026-11-01)

Raamatupidamine is the accountant's own books, separate from the CRM's finance. Only invoices paid by invoice belong in it; anything else is kept out with the mark „Ei kuulu raamatupidamisse”. The CRM's money, PDFs and balances do not change. Changes she needs here may be made and shipped without a separate owner OK.

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
| Bank line without a document, categorised (since 2026-11-03) | bank date | in: 1010, out: the category account | in: the category account, out: 1010 |

With the bank rule on (accountingSettings/bankBooks.since, see „Pangapõhine raamatupidamine”), an invoice, a payment and
what follows them are booked only when bank money stands behind them, and a payment linked to a bank line is booked on
the bank date.

Purchase entries are written by financeApi in the same transaction as the invoice or the payment (not by the sync),
ids `auto_purchase-invoice_<id>` and `auto_purchase-payment_<invoiceId>_<paymentId>`.

Partners (since 2026-10-24, see „Partnerid”): every line of an OA / VM entry carries the supplier; the 1200 / 2500
lines of new sales entries (invoice, cancellation, credit note, payment, payment void, payer credit, refund) carry the
customer `{ type: "customer", id: <student card id>, name: <payer name or student name> }` when the document has one.

Sales revenue account: **3000** since 2026-10-23 (the accountant). Until then automatic sales entries used 3060
Maksuvaba müügitulu; entries already written keep 3060 (nothing rewrites them automatically). The accountant moves
them herself with „Asenda konto” 3060 → 3000 in the päevaraamat (see „Päevaraamat kui tabel”): each entry is corrected
in place with history and audit while its period is open. Alternatives: one reclassification entry 3060 → 3000, or
nothing (both accounts are on the report line „Müügitulu”, so the kasumiaruanne is the same). The chart name of 3000
is „Kauba, teenuse müük Eestis 20%” (Merit), although the company is not VAT registered — to be confirmed.

The sales document and the money are always separate entries: an invoice books 1200 / 3000 only; the payment is its
own entry (1010 or 1000 / 1200) on the payment date. No sales entry books to the bank.

**Correcting an issued invoice** (owner 2026-10-23): the invoice is never overwritten. „Krediteeri kogu arve”
(`/invoices/credit-full`) issues one credit note for the open amount → the credit-note entry above. „Paranda summa
või maksja” (`/invoices/correct`) issues the same full credit note and a new invoice (next KS number, `correctionOf`
↔ `correctedBy`) → a credit-note entry and an invoice entry, both on the correction date. The old invoice's own entry
stays as it was (functions/invoice-correction-core.js).

Documents dated before the start date are in the opening balances. Without a VAT registration an expense is booked with
its VAT (input VAT is not deductible).

Not automatic yet: salaries and their taxes (manual entries; the TSD tab can prepare one, see „TSD”), cash received but not
yet linked to an invoice (it is booked when the receipt is linked).

Lesson package invoices („Tunnipakett”, `billingMode: lesson_tokens_v1`) are booked like any invoice (1200 / 3000 on the
invoice date). The lessons bought, held, left and owed are not bookkeeping entries: they live in `studentPackages`,
`packageLedger` and `lessonPackageStates` (docs/LESSON_TOKENS.md). The package never changes the invoice.

## Päevaraamat and käibeandmik (crm-v2/src/features/accounting)

Layout of the owner's template (a Päevaraamat export of the accounting software) with the accountant's notes
(2026-10-23): a plain ruled grid, every cell bordered, nothing added. Excel (SpreadsheetML .xls) is the main format; the
screen shows the same grid. No PDF.

Päevaraamat (`journalReport`, `journalWorkbook`):

- Title, then the filters: Periood (from kuni to), Kande kood (one code or „Kõik”), Järjestus (Kande kood or Kuupäev).
- Two header bands: Kanne | Kuupäev | Dokument and Konto | Kuupäev | Dokument | Kirjeldus | Partner | Deebet |
  Kreedit (Partner since 2026-10-24, narrower than Kirjeldus). No rate or currency (all EUR).
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
Title „Käibeandmik 01.09.2026–05.11.2026”. For income / expense accounts the opening of a period that does not start
on 1 January is the sum from 1 January to the day before the period (standard; the maths is unchanged). Then a note
above the table (and a „Märkus” row in the Excel header) says so, with „Näita aasta algusest” (sets „Alates” to 01.01
of the same year). Quick period buttons for all period reports (`accountingPeriod.js`): „Aasta algusest” (01.01 of the
year in view → today, a past year → 31.12), „See kuu”, „Eelmine kuu”, „See kvartal”, „Eelmine kvartal”; Tallinn day;
the active one is highlighted. The period is remembered per device (`localStorage` `keelesepp.accounting.period`).

Manual entry (`JournalDraft.jsx`): „Lisa kanne” opens editable rows at the top of the päevaraamat grid: the date,
document and content in the entry row, account / note / debit / credit in each line. Tab moves cell to cell; Tab in
the last cell adds a row. „Salvesta kanne” is enabled when debit = credit, at least two lines and every account exists
and is open; the server (`validateEntry`) checks again.

Müügitulu accounts in the chart (functions/accounting-chart.js): 3000 Kauba, teenuse müük Eestis 20%; 3010 Kauba müük
Eur.Liitu 0%; 3015 Teenuse müük Eur.Liitu 0%; 3020 Kauba eksport; 3025 Teenuse eksport; 3040 Müügitulu 9%; 3060
Maksuvaba müügitulu; 3070 Kasutatud kauba müük soetusmaksumuses; 3075 / 3076 Kasutatud kauba müügil 20% / 9% maksustatav
kasum; 3080 Metallijäätmete, kinnisasja, väärismetallide müük; 3099 Ümardused. Which to close is the owner's decision
(the accountant: the goods accounts do not apply to a training company); nothing is closed yet.

## Päevaraamat kui tabel (the accountant 2026-10-23: „функциональность и свобода действий как в Excel”)

`JournalGrid.jsx` + pure helpers `journalGrid.js`. The päevaraamat grid is the editor; there is no separate „Muuda”
mode. The legal guarantees stay on the server (financeApi): history + `financialAudit` of every change, the period
lock, D = K per entry, immutable entry numbers, no client writes.

- **Cells.** Click, Enter, F2 or typing opens a cell of an entry in an open period: Konto (autocomplete from the
  chart), Kirjeldus (on the entry row: the entry content; on a line: the line note), Deebet, Kreedit; for a manual
  (PR) entry also Kuupäev („31.01.2026” or ISO) and Dokument. An automatic entry keeps its date and document (the link
  to the source document). Arrows, Tab / Shift+Tab, Enter / Shift+Enter, Home / End move like Excel; Esc cancels the
  cell (on the grid: drops the unsaved changes of the entry); Delete clears a cell. Tab in the last cell of an entry
  adds a line. Insert or Ctrl/Cmd+Shift++ inserts a line, Ctrl/Cmd+− deletes it; „+ / ×” on the row do the same.
- **Saving.** An entry is saved (`/accounting/entries/update`, the same correctedEntry logic) when the cursor leaves
  it or the focus leaves the grid, and only when it is valid: D = K, at least one debit and one credit line, open
  accounts, a date in the same year and after the lock. Otherwise the entry turns red with the problem and
  „D − K = …”, and nothing is sent until it is fixed („Salvesta” / „Tühista (Esc)” under it, „Salvesta muudatused
  (n)” above the grid).
- **„Paranduse põhjus”** above the grid: asked once per session (sessionStorage), sent with every correction; an
  automatic entry is not saved without it.
- **Undo.** Ctrl/Cmd+Z on the grid (or „Võta tagasi”) reverses the last saved change of this session through the same
  route (the entry's previous content, reason „Tagasivõtmine (Ctrl+Z): …”); the history keeps both changes.
- **Filter and sort.** Filters above the grid: Konto (prefix), Tekst (content, notes, kande nr), Dokument, Summa (a
  line amount or the entry total). A header click sorts the entry blocks by that column (Kande kood, Kuupäev,
  Dokument, Kirjeldus, Summa); a second click turns the order. Excel export follows the chosen order.
- **Partner** (2026-10-24): the Partner cell of a line takes a supplier — typing shows Tarnijad matching the name (from
  its start or anywhere) or the registry code; arrows + Enter / Tab or a click pick one. A name that is not in Tarnijad
  stays red („pole tarnijate seas”) and the entry is not saved. A line on 2110 / 1350 without a supplier shows
  „Puudub: partner”; a manual (PR) entry is not saved without it, an automatic entry only shows the hint. Filter
  „Partner” above the grid; the header „Partner” sorts by it.
- **Copy and paste.** Shift+click or Shift+arrows select cells; Ctrl/Cmd+C copies them as tab separated text (for
  Excel). Ctrl/Cmd+V of rows from Excel: into an entry at the active cell over the grid columns (missing lines are
  added); into a new manual entry („Lisa kanne”): Konto | Kirjeldus | Deebet | Kreedit | Partner (optional; a
  supplier name or registry code), optionally Kuupäev | Dokument first, or a copy of the päevaraamat itself (with or
  without the Partner column); into ostuarve lines: Konto | Kirjeldus | Summa | KM. Amounts
  „1 234,50”, „1.234,50”, „1234.5”, „12,00 €” are read (`parseEuro`).
- **„Asenda konto”** (find & replace an account in the entries in view — period, kande kood and filters): the preview
  shows the number of entries and lines and the debit / credit sum, and which entries are skipped (locked period,
  storno / reversed). „Asenda N kandes” needs the „Paranduse põhjus” and sends one request
  `/accounting/entries/replace-account` { fromAccount, toAccount, entryIds | targets: [{ entryId, lineIndexes }],
  reason, requestId }. The server (accounting-core `replaceAccountValues`, `batchTargets`, `chunked`) checks every
  entry before writing anything — one entry in a locked period or a closed month refuses the whole request — then
  corrects each entry with `correctedEntry` in transactions of 100 entries (an update and an audit record each), one
  history item and one `financialAudit/<requestId>_<entryId>` per entry. A repeated request changes nothing; an
  entry that no longer has the account is left as it is. At most 2000 entries per request. Ctrl+Z moves back exactly
  the moved lines (`targets`).
- **Deleting** (the accountant 2026-10-30): a manual or automatic entry („Kustuta”, a tombstone). A deleted
  automatic entry keeps its document id, so the sync does not create it again; „Näita kustutatud” → „Taasta” brings it back.
  The source document in the CRM does not change. The opening entry is not deleted.
  An invoice's „Ei kuulu raamatupidamisse” mark removes all of its entries at once, see that section.
- **Read-only** for a user without the admin role, on a phone (≤ 760 px) and for entries in a locked period or
  stornos / deleted entries: cells can be selected and copied, not edited.

**How the accountant moves the old sales entries 3060 → 3000:** Päevaraamat → period from 01.01.2026 → Kande kood
„MA Müügiarve kanne” (or Kõik) → „Paranduse põhjus”: „Müügitulu konto 3000 (raamatupidaja otsus)” → „Asenda konto”
→ 3060 → 3000 → check the preview (number of entries, sum, skipped) → „Asenda N kandes”. Entries in a closed period
are not changed (a reclassification entry after the lock date instead). Ctrl+Z right after it moves them back.

## Tarnijad ja ostuarved (crm-v2/src/features/purchases, functions/purchases-core.js)

The accountant 2026-10-23: „Сделай таблицу поставщики и так же путь ей сделай дальше”. Route `/finance/ostuarved`
(Finantsid → „Ostuarved”, Raamatupidamine → „Ostuarved”), two tabs:

- **Tarnijad** (also on Raamatupidamine: tab and button „Tarnijad”, the same component `SuppliersPanel.jsx`): a ruled
  grid like Excel — Nimi | Registrikood | KMKR nr | Aadress | E-post | IBAN | Vaikekonto | Aktiivne. Every cell is
  typed in place; a changed row shows „Salvesta” (Enter saves); the last row adds a supplier. Search over every
  field, „Näita mitteaktiivseid”, a header click sorts. IBAN is checked (mod 97), the default account must be open.
  **Duplicates** (2026-10-24, `purchases-core supplierDuplicate`): the same registry code, or the same name (case,
  quotes, punctuation and the legal form OÜ / AS / MTÜ / FIE … ignored) unless both have different registry codes —
  shown as „Võimalik duplikaat: …” under the row and refused by the server (409). **„Impordi Excelist”**: rows copied
  from Excel are pasted into a box; a first row of column names maps the columns in any order (Nimi, Registrikood,
  KMKR nr, Aadress, E-post, IBAN, Vaikekonto / Konto, Aktiivne), without it the order is the Tarnijad Excel export.
  The preview shows per row „Imporditakse” or why it is skipped (duplicate of a saved supplier or of an earlier row,
  invalid IBAN / e-mail / account); only the new rows are sent to `/suppliers/import`, which checks them again and
  writes all or nothing (max 400, one `financialAudit/<requestId>` „supplier.imported”). Nothing is deleted
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

## Partnerid (the accountant 2026-10-24: „Поставщиков сначала, и привяжи их к проводкам”)

Like Merit Aktiva / her Excel: each journal line on a partner account carries the partner.

- **Line field** `partner: { type: "supplier" | "customer", id, name }` (optional; only on lines that have one).
  `accounting-core.cleanPartner` normalises it; `validateEntry(entry, accounts, { suppliers, requirePartner })` keeps
  it, checks that a supplier with an id exists (`suppliers/{id}`, loaded by financeApi `partnerSuppliers`) and takes
  the supplier's current name; a typed name without a type is refused („vali tarnija nimekirjast”).
- **Required**: a new manual entry (`/accounting/entries`) refuses a line on a supplier account (`SUPPLIER_ACCOUNTS`
  2110 Võlad tarnijatele, 1350 Ettemaksed tarnijatele) without a supplier. Corrections (`/accounting/entries/update`)
  keep and check partners but do not require them on the server (old entries stay correctable); the päevaraamat
  blocks saving a manual entry without one. Customer accounts (1200, 2500) never require a partner.
- **Automatic**: OA / VM entries — the supplier on every line (`purchases-core supplierPartner`); new sales entries —
  the customer on 1200 / 2500 (`accounting-core customerOf`). Entries written before 2026-10-24 are not changed by the
  sync (see the backfill below).
- **History and audit**: `snapshotOf` includes the partner, so a partner change is a correction like any other (before
  / after in `history` and `financialAudit`); the history line shows „2110 K 300,00 (Kirsi …)”. Storno
  (`reversalOf`) and „Asenda konto” keep the partners.
- **Report „Partnerid”** (Raamatupidamine tab, `accountingReports.partnerReport`): per partner on one account (2110 by
  default; any used account or „Kõik kontod”) Partner | Reg-kood | Algsaldo D/K | Käive D/K | Lõppsaldo D/K, Kokku;
  lines without a partner are the row „Partner puudub” (with a notice). A click on a partner opens its lines (date,
  kande kood, document, description, D, K, running saldo); „Pearaamat” opens the pearaamat of that account filtered
  by the partner. Excel (`partnersWorkbook`): sheet „Partnerid” (the summary) and sheet „Read” (every line with its
  partner and running saldo), ruled like the other registers.
- **Pearaamat**: filter „Partner” (the partners on that account + „Partner puudub”) and a Partner column.
  Käibeandmik unchanged.
- **Päevaraamat Excel** has the Partner column.

**Backfill of existing entries** (`functions/accounting-partner-core.js`, `functions/tools/accounting-partner-backfill.js`):
dry run by default (reads only). `--apply` sets the supplier of the purchase invoice on every line of existing OA /
VM entries and their stornos; `--apply-manual` sets the supplier on the 2110 / 1350 lines of manual / opening entries
whose text (content, document, line notes) names exactly one supplier (name without the legal form, or the registry
code). A line that already has a partner is never changed (a different one is reported as a conflict); deleted
entries are left alone; entries in a locked period or a closed month are skipped. Each written entry gets a history
item (action „partner”) and `financialAudit/partner-backfill-<time>_<entryId>`. Only with the owner's permission.

## Parandamine (corrections, the accountant 2026-10-23: „мне нужно исправление сделать”)

Raamatupidamise seadus § 6–12: an entry must stay traceable to its source document, a correction must show what,
when, by whom and why (§ 10), and nothing is destroyed for seven years (§ 12). In the CRM:

- **Open period** (the date is after „Suletud kuni …” and not in a closed finance month): in the päevaraamat every entry
  that is not deleted, not reversed and not a storno is edited in the grid cell by cell (see „Päevaraamat kui
  tabel”; until 2026-10-23 a „Muuda” button opened JournalDraft). A manual (PR) entry may change everything except the year (its number is per year); an automatic
  entry (MA, LK, OA, VM, …) too (2026-10-30), saved as `override` with `original` (the document's own lines); no reason is asked (owner 2026-10-30). Only the opening entry keeps its date and document. „Kustuta” for a manual or automatic entry; the entry becomes a tombstone (`deleted`, hidden from the registers, „Näita kustutatud” shows it, its
  PR number is never reused).
- **„Tühista ekslik storno”** (the owner 2026-10-29: the accountant made a storno by mistake): while both dates are open,
  a storno whose original still points to it becomes a tombstone (`deleted`, history action `undo-storno`, number never
  reused) and its original entry loses `reversedBy` / `reversedByNumber` / `reversedAt` and is live again (history
  action `storno-undone`); one `financialAudit` record „accounting.entry.storno-undone”. `POST
  /accounting/entries/undo-storno { entryId, reason, requestId }`; core check `assertStornoUndoable`.
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

## Ei kuulu raamatupidamisse (the accountant, confirmed by the owner 2026-10-30)

„Clients who pay to the owner's sole-proprietor (FIE) account” and single invoices must leave the company's books. An
automatic entry cannot be deleted and a rebuild would re-create it, so the mark is on the source document.

- **Who, where:** administrator or bookkeeper (`requireAccountingUser`). Finantsid → Kuu arveldus → the book icon by the
  invoice number; the row then shows „Ei kuulu raamatupidamisse”. `POST /accounting/invoices/exclude` and `/include`
  `{ invoiceId, reason, requestId }`, reason required, repeat with the same requestId changes nothing. Not writable from the
  client even by an admin (`changesInvoiceFinancialSource` in firestore.rules).
- **The mark on the invoice:** `accountingExcluded: true`, `accountingExcludedReason`, `accountingExcludedAt`,
  `accountingExcludedBy`. The invoice's money, status and PDF and the student's balance do not change. The invoice document
  is readable by its owner (`ownsInvoice`), like `cancellationReason`, so the reason is written neutrally; the UI does not
  show it to the student or the parent.
- **Scope** (`accounting-core exclusionScope`): the entries `invoice:`, `invoice-cancel:`, `credit-note:`, `payment:`,
  `payment-void:` and the `credit:` of an overpayment of that invoice. `automaticEntries` skips them on every sync, also
  for documents added later. Only automatic entries: a manual entry the accountant typed for the same client is hers to
  correct.
- **Existing entries become tombstones:** `deleted`, `deletedAt`, `deletedBy`, `deleteReason`, `excludedInvoiceId`,
  history action `excluded` with the content in `before`; the number is never reused; „Näita kustutatud” shows them with the
  tag „ei kuulu raamatupidamisse”. `financialAudit/<requestId>` „invoice.accounting_excluded”.
- **Undo:** „Taasta raamatupidamisse” removes the mark; the tombstones made by it are live again with the same numbers
  (history action `included`, audit „invoice.accounting_included”); documents without an entry get one from the next sync.
- **Refused (409):** a date in a locked period or a closed month (the invoice date and every entry date), both ways; an
  active payment that came through the company's bank (`bankTransactionId`, `bankStatementLineId` since 2026-11-03, requestId `lhv-…`, LinkPay), because that money
  is in the statement; a payment made from a prepayment that would stay in the books; an overpayment credit of the invoice
  already spent. Cancel those first.
- **A bank payment arriving later** on a marked invoice is not booked; the sync returns it in `exclusionConflicts` and
  Raamatupidamine shows a warning. A person cancels the payment or removes the mark.
- **Corrections:** „Paranda summa või maksja” copies the mark to the new invoice. When the mark is set on one invoice of a
  corrected pair, the other stays as it is and the result names it (`relatedInvoices`).
- **Not changed:** INF 3 (`inf3-core.js`) still counts these payments. Whether a payment made to the FIE belongs in the
  company's INF 3 is the accountant's decision; see PROJECT_STATE.

## FIE arved — the owner's own sole proprietorship (owner 2026-11-09)

Owner: „сделай так чтобы я мог выставлять счета на свой предпринимательский счёт для своих учеников и чтобы такие
счета не шли в бухгалтерию”; „счёт FIE есть только у меня”; „для FIE в настройках только номер счёта и мои имя и
фамилия”. Replaces the per-invoice „Ei kuulu raamatupidamisse” mark for the owner's FIE pupils from now on (the mark
stays for old invoices).

**Who.** Only the owner (the super admin e-mail, `isSuperAdmin` in functions, `superAdmin()` in the rules,
`isOwnerEmail` in the CRM). Other administrators and the bookkeeper never see an FIE invoice, its payments, the FIE
requisites or the per-student switch — enforced in `firestore.rules` and in every endpoint (same 404 as a missing
invoice), not only in the UI. The family still sees its own FIE invoice (PDF, unpaid notice, „Maksin ära”).

**Data.**

- `invoices/{id}.issuer`: `"company"` (E&P Koolitus OÜ; an invoice WITHOUT the field is also the company's) or
  `"fie"`; set by the functions when the invoice is made, never changed afterwards (rules: `issuer` / `issuerDetails`
  are in `changesInvoiceFinancialSource`). An FIE invoice also stores `issuerDetails { name, iban }` — the snapshot
  printed on its PDF and e-mail. Every new company invoice carries `issuer: "company"`.
- Numbers: the company keeps `KS-YYYY-NNN` with `meta/invoiceCounter`; the FIE has its own `FIE-YYYY-NNN` with
  `meta/invoiceCounterFie` (fixed prefix, not a setting). Each series is unique and sequential on its own
  (`invoice-issuer.js nextIssuerNumber`, collision check per number). „Numeratsioon” repairs the KS series only.
- `invoiceIssuers/fie { name, iban, ownerUid, updatedAt, updatedBy }` — Finantsid → Seaded → **FIE** (owner only):
  the owner's first and last name and the IBAN (mod 97 checked), nothing else; `ownerUid` = the owner's account (who
  „the owner as a teacher” is). Until both are filled FIE cannot be chosen.
- `studentInvoiceIssuers/{studentId} { issuer, updatedAt, updatedByUid }` — the student card → Finants → **„Arve
  väljastaja”** (owner only). Absent = E&P Koolitus OÜ (nothing changes for existing pupils). FIE can be set only for a
  pupil the owner teaches (an active track with the owner's uid, or an old track whose teacher's first name is the
  owner's).
- `fiePayments`, `fieAudit`, `fieEmailQueue`, `fieInvoicePaymentClaims`: the FIE invoice's payments, audit records,
  e-mail log and „Maksin ära” notices — the same shapes as `payments` / `financialAudit` / `emailQueue` /
  `invoicePaymentClaims`, owner-only (the family reads its own notice).

**Which issuer a new invoice gets** (`invoice-issuer-core.js decideIssuer`): per line, FIE only when the card is set to
FIE AND the owner teaches that subject / lesson; other teachers' lines stay the company's — so no other teacher's
payroll is ever on an FIE invoice. The owner may override per invoice („Arve väljastaja” in „Lisa arve”, „Tunnipakett”,
from lessons): `fie` only for his own lessons, `company` always. A manual charge defaults to FIE only when every active
track of the card is the owner's. A family's monthly invoice with the owner's FIE lines and other teachers' lines is
made as TWO invoices in one go (company `monthly_combined_…`, FIE `monthly_combined_…-fie`, `monthlySplit`); anyone but
the owner gets 403 for an FIE line („Selle õpilase arved koostab omanik”) instead of a silent company invoice. Lesson
balances, packages and the monthly logic are unchanged; only the issuer differs.

**What an FIE invoice is NOT part of:** the company's books (`accounting-core excludedSourceKeys` + `accountingSources`),
„Pank” matching of the OÜ statement (`bank-statement-core matchLine`, `bank-statement.js matchContext`) and bank /
advance / cash-box allocation (`allocateBankTransaction`, `applyPayerCredit`, cash receipts: 409), card payment
(`linkpay-core unpayableReason`; no pay link on the PDF / e-mail, no „Maksa arve” button), credit notes / „Paranda” /
overpayment to an advance (409 — cancel an unpaid FIE invoice and make a new one), period review / close / the
accountant's export, „Raha liikumine” analytics (FIE invoices, the lessons on them and the plans of FIE cards are left
out of the forecast), INF 3, „Andmete kvaliteet”, the admins' bell, „Ei kuulu raamatupidamisse” (409: never in the
books anyway), internal notes (rules: no `invoiceNotes` on an FIE invoice) and every company list in the CRM
(`invoicesService.list()` returns company invoices only, also for the owner). The owner sees FIE separately:
Finantsid → **„FIE arved (ainult sulle…)”** (invoices, money received, debt; „Registreeri makse”, PDF).

**Payments of an FIE invoice:** `/payments` (bank transfer to the FIE account or cash; cash goes to no company cash box)
writes `fiePayments` + `fieAudit`; `/payments/void` finds an FIE payment in `fiePayments`. Batch reminders: the
scheduled run and the owner include FIE invoices (e-mail logged in `fieEmailQueue`), another administrator's run skips
them.

**Firestore rules.** `invoices`: get = owner, or admin / bookkeeper when the invoice is the company's
(`get('issuer','company') == 'company'`), or the family; **list** = owner, or admin / bookkeeper only with
`where('issuer', '==', 'company')` (a list rule must compare the stored field: with a default an unconstrained list
would pass with the FIE invoices in it — checked in the emulator), or the family; create from the client only as a
company invoice; update / delete of an FIE invoice only by the owner. New owner-only collections above, no client
writes. Emulator test `functions/invoice-issuer-fie-rules-emulator.integration.js`.

**Migration (before the rules go live):** old invoices have no `issuer`, so the company-only list of another
administrator / the bookkeeper would miss them. `functions/tools/invoice-issuer-backfill.js` (dry run by default,
`--apply` with the owner's permission) adds `issuer: "company"` to invoices without the field — nothing else. Order:
deploy functions → run the backfill → deploy rules + hosting.

## Payment guards and „Võimalikud topeltlaekumised” (October 2026 audit, 2026-11-03)

- **Payment date.** The receipt (1010 or 1000 / 1200) is booked on the payment's `paidAt`. The payment dialogs
  (`/finance` month view and the invoice window) keep the date editable, show the invoice's due date and earlier payment
  date, and warn „Kuupäev peab olema päev, mil raha pangakontole laekus.” when the date differs from an earlier payment,
  is more than 7 days after the due date, or is in another month than today (`crm-v2/src/features/finance/paymentEntry.js`).
- **`financeApi /payments`** (a payment typed in by a person; `functions/payment-guards-core.js`): 409
  `details.code: "duplicate_payment"` when an active payment with the same invoice, amount, date and method was created
  in the last 10 minutes (any user; the same `requestId` stays an idempotent 200); 409 `details.code: "overpayment"`
  („Arve on juba makstud. Kas registreerida ülemakse ettemaksuna?”) when the amount exceeds the open balance, unless the
  request has `allowOverpayment: true`. A confirmed overpayment is stored with `overpaymentConfirmed: true`, and the
  dialog then calls the existing `/invoices/resolve-overpayment` so the excess becomes a `payerCredits` advance (auto
  entry 1200 / 2500). LinkPay and the cash box allocation are not guarded (their money is real; each is idempotent by its
  own source id). The bank import does not use this endpoint.
- **„Võimalikud topeltlaekumised”** (Raamatupidamine, above the registers, only when there is something to show;
  `crm-v2/src/features/accounting/duplicateReceipts.js`): pairs of a live CRM receipt entry (`sourceKey` `payment:` or
  `credit:`, a debit on 1010) and a live manual entry with a debit on 1010 of the same amount within 120 days, when the
  manual entry names the same client (line partner id), the same reference / invoice number (whole token) or the payer's
  name (all words, at least two words or one of 5+ letters). Read-only: nothing is deleted or reversed; the sync on
  opening the page is unchanged.

## Pangapõhine raamatupidamine (owner 2026-11-03)

Owner: „довести систему до автоматизма, чтобы в бухгалтерию попадали только те деньги, за которые мы получили деньги по
счетам, только на основе банка”. The October 2026 audit found receipts typed on the wrong day (11 Jul–Sep payments booked
in October, 1 429 €), a payment typed twice, invoices marked „Ei kuulu raamatupidamisse” although their money came to the
company account, every bank line booked by hand a second time, and income without a CRM invoice (Töötukassa, lesson
payments without an invoice, external invoices) and all expenses missing. From now on the **statement of the company
account LHV EE917700771011885682** is the source of the books' money.

### Rules

1. **Import.** Raamatupidamine → tab **„Pank”** → „Impordi LHV väljavõte (CSV)”. The LHV „Konto väljavõte” CSV in
   Russian, Estonian or English headers (`functions/bank-statement-core.js` `parseStatement`; separators `,` `;` tab,
   dates `2026-10-07` or `07.10.2026`, amounts `-1 234,56` / `150.00`). Every line, incoming (C) and outgoing (D), is
   stored once in `bankStatementLines` with the id `lhv_<„Ссылка проводки” / „Kande viide”>` (card payments have no
   archive code, they have this reference); without it `lhva_<archive code>`, else a hash of the line. A line already
   stored under the same bank reference or archive code is a duplicate: the same file twice adds nothing. A statement
   of another account (e.g. the owner's FIE account) is refused. Personal codes (11 digits) are never stored; a
   company's 8-digit registry code is kept for the rules.
2. **Matching incoming lines** (`matchLine`), in this order:
   - the line is already in the CRM — a bank transaction of the earlier CSV flow (`externalId` = archive code, or the same
     day, amount and payer when the flow had no archive code) or a payment of the 2026-10-15 LHV run (`requestId lhv-…`)
     → linked, nothing new (**sure**);
   - an invoice number in the explanation (tolerant: „KS-2026-085”, „Arve KS -2026-083”, „KC- 2026-088” (C typo),
     „Makse selgitus KS-2026-097”, „ks 2026-85”), or the invoice's reference number in „Viitenumber”:
     - a payment typed by hand on that invoice with exactly this amount (bank / card / other, no bank link yet) → that
       payment is **linked** (`bankStatementLineId`, `bankDate` = the bank date) — not paid twice (**sure**);
     - else the open balance ≥ the amount → a new payment on the invoice(s) with **the bank date** through the existing
       `/bank-transactions/allocate` (`bankTransactions/stmt_<lineId>`, payments `…_a1`) (**sure**);
     - more money than open (already paid, overpaid) → suggestion: pay what is open, the rest as an advance (**likely**);
   - a LinkPay payment of the same amount 0–5 days before → link (**likely**);
   - a typed payment with the same payer name and amount within 45 days → link (**likely**);
   - the payer (account or name) paid for a child before and one open invoice has exactly this balance, or the payer's
     name is on exactly one open invoice with exactly this balance → new payment (**likely**).
   Only **sure** matches are executed at import. **Likely** ones go to „Kinnita vasted”: „Kinnita” (one click) or „Pole
   see” (the line goes to „Ilma dokumendita read”). „Otsi vasteid uuesti” runs the matcher on every open line (after
   new invoices or payments).
3. **Matching outgoing lines:** a supplier payment typed on Ostuarved (bank / card, the same amount ± 7 days; sure when
   the supplier's name or the invoice number is in the line) or a refund of an advance (likely) is linked; nothing new is
   booked (the VM / refund entry already books 1010).
4. **Books rule** (`accounting-core.js` `bankBooksRule`, on from `accountingSettings/bankBooks.since`):
   - a receipt on 1010 (method bank, card, other, LinkPay) is booked only when its payment is **linked to the bank**:
     `bankStatementLineId`, `bankTransactionId`, `requestId lhv-…` or LinkPay (the bank pays the card money to the
     account). A payment typed by hand without a bank line stays in the CRM (the student's balance, PDFs and reminders do
     not change) and waits: „Ootab panka” on the „Pank” tab;
   - a linked receipt is booked on the **bank date** (`bankDate`), not on the typed `paidAt`;
   - **cash** (1000, the school's own till, cash box) is booked as before; a payment **from an advance** (2500) when the
     advance is in the books; an advance from a bank transaction always; an overpayment advance when its payment is;
     a refund when its advance is; a payment void when its payment is;
   - **sales (1200 / 3000)**: an invoice is booked only once one of its payments is booked — the owner: only invoices
     actually paid to the bank go to the books. Reasoning: accrual (booking every issued invoice) put invoices paid to the
     FIE account or never paid into 1200 for ever and needed the opt-in „Ei kuulu raamatupidamisse” mark per invoice;
     booking only paid invoices makes the books follow the bank by itself. The whole invoice amount is booked on the
     invoice date (a partial payment leaves the rest on 1200 as a real receivable); when the invoice date is in a locked
     period, on the date of its first booked payment („arve kuupäev …, periood suletud”);
   - **credit notes and cancellations** follow their invoice: booked when the invoice is in the books (also an invoice
     booked before the rule), otherwise not — an unpaid invoice that is credited or cancelled never touches the books;
   - documents dated **before** `since` keep the earlier rule (everything booked). The opt-in `accountingExcluded` mark
     („Ei kuulu raamatupidamisse”) keeps working on top of the rule; it is no longer needed for new invoices.
5. **Lines without a document** (tab „Pank” → „Ilma dokumendita read”): the accountant picks a category (presets:
   in — 3000 müügitulu ilma arveta, 2500 ettemaks, 3530 toetus (Töötukassa), 3560 muu äritulu, 2030 laen omanikult,
   1230 aruandva isiku tagastus; out — 4320 IT, 4210 rent, 2210 palk, 1210 maksude ettemaksukonto, 4340 pangateenus,
   4050 õppematerjalid, 4330 kontoritarbed, 1230 aruandev isik, 2030 laenu tagasimakse, 4970 mitteseotud kulu, 4398
   muu) or types any open account (not 1010) → „Kirjenda”. With „Reegel” (basis: the counterparty's IBAN, the name or a
   piece of the explanation) the rule (`bankRules`) categorises the other open lines now and every new line at import
   (the most specific active rule wins: IBAN > name > explanation). The sync books a categorised line once:
   in D 1010 / K account (kande kood LK), out D account / K 1010 (VM), document the archive code (`sourceKey
   bank-line:<lineId>`). „Tühista…” (reason) reopens a line only when its entry is not live (delete it in the
   päevaraamat first); a line categorised again gets a new key `bank-line:<id>~2`, so the tombstone stays.
   Rules are switched off, never deleted.
6. **Never twice:** a line is either matched (payments, a bank transaction, a supplier payment, a refund) or categorised,
   never both (409); a payment is linked to one line only; the import is idempotent by line id, bank reference and archive
   code; `requestId`s of the allocations are derived from the line id.
7. **Month check** (tab „Pank” → „Kuu kontroll”, `crm-v2/src/features/accounting/bankBooks.js` `monthCheck`): the lines
   of the month against account 1010. Per line: Korras / Otsus puudub (no decision) / Kanne puudub (linked, no live entry
   — „Uuenda kanded”) / Summa erineb / Teine kuu (booked in another month, e.g. a receipt typed in October for July
   money) / Makse tühistatud. Below: 1010 entries of the month without a bank line; a manual one with the amount of a
   booked line within 5 days is marked „Topelt?”. Totals: statement in / out vs 1010 debit / credit, and the bank's
   closing balance (typed once per month from the LHV statement, `bankStatementBalances/<yyyy-mm>`, the CSV has no
   balance) vs the 1010 balance at the month end. „Kuu on korras” only when every line is booked once and the balances
   match. Then „Sulge periood kuni …”.

### What the sync writes now (opening Raamatupidamine)

Unchanged in kind: only missing automatic entries, never a change of an existing one. New: entries `bank-line:<id>` of
categorised lines. With the bank rule on, fewer entries: no receipt of an unlinked typed payment, no sales entry of an
unpaid invoice (they come later, when the money is linked). The sync also returns `waiting` (typed payments and invoices
waiting for the bank) and `bankBooksSince`. Import, confirm and categorise write CRM payments and lines, never entries;
the panel then runs the sync.

### Data and API

- `bankStatementLines/{lineId}`: `accountIban`, `date`, `direction` C | D, `amountCents` (> 0), `currency`,
  `counterpartyName`, `counterpartyAccount`, `counterpartyRegCode` (8 digits only), `explanation`, `referenceNumber`,
  `documentNumber`, `archiveId`, `transactionRef`, `providerRef`, `sourceLine`, `importId`, `importedAt`, `importedBy`,
  `state` new | matched | review | unmatched | categorized, `match { kind, confidence, reason, allocations,
  paymentIds, bankTransactionId, purchaseInvoiceId, purchasePaymentId, refundId, creditStudentId, error }`,
  `bankTransactionId`, `paymentIds`, `creditIds`, `purchase { invoiceId, paymentId }`, `refundId`, `entryKeys` (source
  keys of the entries that book its money), `category { account, label, note, ruleId, by, at, sourceKey }`,
  `categoryVersion`, `categoryHistory`, `linkedAt`, `linkedBy`.
- `bankStatementImports/{requestId}`: file name, account, from / to, counts, errors, who. `bankRules/{id}`: `direction`,
  `counterpartyAccount`, `counterpartyName`, `explanation`, `account`, `label`, `active`. `bankStatementBalances/{yyyy-mm}`:
  `closingCents`. `accountingSettings/bankBooks`: `since` (`""` = off), `reason`, `updatedAt`, `updatedBy` (audit
  `accounting.bank_books.changed`).
- New fields: payments `bankStatementLineId`, `bankDate`, `bankLinkedAt`, `bankLinkedBy`; bankTransactions
  `statementLineId`; purchase invoice payments and refunds `bankStatementLineId`, `bankDate`.
- financeApi (admin): `/bank-statement/import { csv, fileName, requestId }`, `/bank-statement/confirm { lineId, choice?,
  requestId }`, `/bank-statement/dismiss`, `/bank-statement/categorize { lineId, account, label, note, rule?, requestId }`,
  `/bank-statement/uncategorize { lineId, reason }`, `/bank-statement/rules { ruleId?, rule }`,
  `/bank-statement/balance { month, closingCents }`, `/bank-statement/rematch`, `/accounting/bank-books { since, reason }`,
  `/accounting/bank-books/review { from, to }` (read-only). Rules: the four new collections admin read, no client writes.
  No composite index (the collections are read whole; `payments.bankTransactionId ==` is a single-field query).

### Migration (January–October 2026)

Nothing is rewritten automatically. Existing entries stay as they are (RPS § 10); the rule applies to entries the sync
creates after `since` is set, for documents dated on or after `since`.

1. Deploy (functions + rules + hosting), then the owner or accountant sets „Pangareegel” **from 2026-11-01** (reason).
2. Import the LHV statements month by month from January (each month's CSV; overlaps are ignored). The sure matches link
   the typed payments and give them the bank date; new payments are created only for bank money the CRM does not have.
   Before October the documents keep the old rule, so the import does not book anything twice: linking only adds
   `bankStatementLineId` / `bankDate` to payments whose entries already exist.
3. „Pank” → „Varasemad kanded” (`/accounting/bank-books/review`, read-only) lists live automatic entries the rule would
   not have made: receipts without a bank line (typed, money to the FIE account or never received), receipts booked on
   another day than the bank's (the October 1 429 €), sales invoices without money. The month check shows the same per
   month plus manual 1010 entries duplicating a bank line.
4. With the owner's go, the accountant corrects month by month in the päevaraamat: deletes the receipt / sales entries
   that do not belong (tombstone with reason, history kept) or moves the date of a receipt to the bank date (while the
   period is open), deletes her manual 1010 duplicates, categorises the remaining lines. Locked months: a correcting
   entry after the lock. The month check must show „Kuu on korras” before „Sulge periood”.
5. Optionally move `since` back to 2026-01-01 afterwards: new entries of older documents (e.g. a credit note) then follow
   the rule too. Moving `since` never deletes an entry.

### How the accountant works each month

1. LHV → Konto väljavõte → the month → CSV → Raamatupidamine → „Pank” → „Impordi LHV väljavõte”.
2. „Kinnita vasted”: „Kinnita” or „Pole see” per suggestion.
3. „Ilma dokumendita read”: a category per line, „Reegel” for recurring ones (Töötukassa, Apple / Google / Anthropic,
   rent, salary, EMTA, owner transfers). After a few months almost everything comes categorised.
4. „Ootab panka”: typed payments without bank money — ask the administrator (FIE account, cash, a typo).
5. „Kuu kontroll”: type the bank's closing balance, clear the red rows, then „Sulge periood kuni <month end>”.

## Sularaha tunni eest — „Makstud sularahas” (owner 2026-11-10)

**Owner decision 2026-11-10: this cash does NOT go to the accountant.** It is never linked to an invoice, so it never
becomes a payment, never reaches the accounting sync, the bank-books review, the period close or any export. Only the
owner / admin see it (Finantsid „Laekunud” and the card „Õpetajate käes sularaha”, Kassa). The accountant's logic was
not changed at all.

- **Teacher** (phone agenda in Kalender and „Märkimata tunnid”): „Sularahas” beside „Toimus ✓ / Puudus ▾” on a past
  1:1 lesson of their own (held or still unmarked; not a group lesson, not a notified absence or a cancelled lesson).
  The dialog takes the amount (default = the card's lesson price for the lesson's subject, scaled to the lesson's
  length — `studentRevenuePlans` via `planForSubject`, returned only to the lesson's own teacher or an admin) and an
  optional note; on an unmarked row the button reads „Toimus ja makstud” and marks the lesson held first through the
  usual path (the cash needs a marked lesson, see below). A marked lesson shows the sum („25,00 €”); the teacher can
  „Võta tagasi” the same day while the money is still with them (then the lesson is billable again). The teacher
  never sees other teachers' cash or any finance totals (only their own „Sinu käes” in Kassa).
- **Data:** (1) `cashLedger` (server writes only): an ordinary cash-box receipt with `source: "lesson"`, id
  `lessoncash_<lesson document id>` (one per lesson; marked again after a void → same id, `revision` + 1),
  `lessonId, scheduleId, occurrenceDate, subject, lessonTime, teacherUid, holderUid` (= the teacher), `receivedAt` = the
  day it was marked, `status: "open"`, `invoicedBefore: [{ id, num }]` (a monthly invoice of that month that already
  existed). `financialAudit` `cashbox_<id>` (`cash.lesson_receipt`), `activityLog` `lesson.cash_paid`.
  (2) the lesson record `lessons/<id>.cashPaid = { receiptId, amountCents, at, byUid, invoicedBefore: [num] }` — the
  flag billing reads. **`firestore.rules`:** no client (admin included) creates, changes or removes `cashPaid`; a
  lesson with `cashPaid` cannot change `status / date / duration / studentId` or be deleted from the browser (undo the
  cash mark first). The client says the same (`lessons.changeMark / removeMark`).
- **Server** (`functions/cash-core.js` `lessonCashEntry`, `lessonCashUndoRefusal`, `lessonCashMarks`;
  `functions/index.js` financeApi, staff): `/cash/lesson/info`, `/cash/lesson`, `/cash/lesson/undo`,
  `/cash/lesson/mine`. Refused: another teacher's lesson (403), a future lesson, a day the entry does not occur, a
  student not in the lesson, a notified absence, an archived card, an FIE lesson (card billed through the FIE and
  taught by the owner — the school's cash box never takes FIE money), a lesson not marked yet (409 „Märgi tund enne
  toimunuks”), a closed financial period. `/cash/allocate` refuses `source: "lesson"` (409); „Seo arvega” stays for the
  other Kassa receipts (owner 2026-11-10). Undo by a teacher: own mark, same day, and the teacher's cash box still holds
  the amount. Undo and the admin's `/cash/void` remove the lesson's `cashPaid` in the same transaction.
- **Hand-over:** the existing cash-box handover. Kassa (admin) → „Õpetajate käes sularaha” → „Sain kätte” = a handover
  of that person's whole balance to the admin. After it the teacher can no longer undo.
- **Chart:** Finantsid „Laekunud” (admin only) — total + „Ülekanded” (payments method bank / linkpay / card) +
  „Sularaha” (payments method cash + open cash-box receipts, by `receivedAt`); a receipt linked to an invoice is counted
  once, as its payment. The bookkeeper's view of the chart is unchanged.
- **Monthly invoice (owner 2026-11-10):** a cash-paid lesson is not chargeable (`crm-v2 finance/monthlyBilling.js
  isChargeable` → false when `cashPaid`), the same path as lessons not held: billed ahead (`advance` / `current`) it is
  not „used”, so the paid balance gives −1 on the next invoice's correction line („Eelmise kuu tasaarveldus: −1 tundi
  (1 makstud sularahas)”) and lessons left stay; billed after the lessons (`actual`) it is not on the invoice. Undo →
  chargeable again. **An invoice already made is never edited:** the receipt / flag name it, Kassa shows „Makstud
  sularahas pärast arvet KS-…” (billed ahead the next correction still takes it off; billed after the lessons the admin
  fixes it by hand, e.g. a credit line). Lesson packages (`lesson-tokens-core lessonTakesToken`) are not changed: a
  cash-paid package lesson still takes a credit. The accountant's books logic is unchanged (the monthly invoice is an
  ordinary sales document with fewer units).

## Sisemine märkus (invoice internal note, team 2026-10-29)

„Создать внутреннюю заметку к выставляемым счетам”: the administrator or the bookkeeper writes what exactly an invoice
was for. Staff only — never printed (PDF), never e-mailed, never shown to the student or the parent.

- Stored apart from the invoice in `invoiceNotes/{invoiceId}` `{ invoiceId, text (≤ 1000), updatedAt, updatedByUid,
  updatedByName }` — the invoice document is readable by its owner (`ownsInvoice`), this collection is not. Written
  from the client (`crm-v2/src/services/firebase/invoiceNotes.js`); rules: read and write for `admin` and `finance`,
  fixed keys, `updatedByUid` = writer, only for an existing invoice, never deleted (an empty text clears it). It does
  not touch the invoice's money, so it is editable on issued, paid and closed-period invoices; the last writer and time
  stay on the document (no history of earlier texts).
- Finantsid → Kuu arveldus: a note icon by the invoice number (filled with the text as tooltip, faint „Lisa sisemine
  märkus” when empty), one clipped line „Märkus: …” under the student, the full text and „Viimati muutis …” in the
  dialog; the search („Otsi”) also matches the note.
- „Lisa arve” and „Tunnipakett”: the field „Sisemine märkus” saves into `invoiceNotes` right after the invoice is
  made. Until 2026-10-29 the „Märkus” field went to the invoice's own `note` (readable by the owner through the rules,
  though not printed); new invoices send `note: ''`. Old `note` values are shown read-only in the note dialog.

## Data and API

- `accountingEntries/{id}`: `auto_<sourceKey>`, `manual_<requestId>`, `reversal_<requestId>`, `opening_<requestId>`.
  Fields: `number`, `year`, `sequence`, `date`, `description`, `documentType` (also `purchaseInvoice`,
  `supplierPayment`), `documentRef`, `sourceKey`, `origin` (`auto` | `manual` | `reversal` | `opening`),
  `lines[{ account, debitCents, creditCents, note, partner? { type: supplier | customer, id, name } }]`, `totalCents`, `reversalOf` / `reversedBy`, `reason`,
  `createdAt`, `createdBy`; corrections: `history[]`, `override`, `original`, `deleted`, `deletedAt`, `deletedBy`,
  `deleteReason`, `excludedInvoiceId`, `updatedAt`, `updatedBy`; purchase entries: `purchaseInvoiceId`.
- `accountingSettings/lock`: `{ lockedThrough, reason, updatedAt, updatedBy }`.
- `suppliers/{id}`: `name`, `regCode`, `vatNumber`, `address`, `email`, `iban`, `defaultAccount`, `active`; imported ones also `importId` (id `<requestId>_<row>`).
- `purchaseInvoices/{id}`: `supplierId`, `supplierName`, `supplierRegCode`, `documentNumber`, `date`, `dueDate`,
  `lines[{ account, description, amountCents, vatCents, vatDeductible }]`, `totalCents`, `deductibleVatCents`, `note`,
  `paidCents`, `payments[{ id, date, amountCents, method, reference, entryId, entryNumber }]`, `removedPayments[]`,
  `status` (`unpaid` | `paid` | `voided`), `documents[]`, `entryId`, `entryNumber`.
- `meta/accountingCounter_<year>.next`: the next number of a year.
- financeApi (admin and finance): `/accounting/invoices/exclude`, `/accounting/invoices/include`.
- financeApi (admin only): `/invoices/credit-full`, `/invoices/correct` (documents above), `/accounting/sync`,
  `/accounting/entries`, `/accounting/entries/reverse`, `/accounting/entries/update`, `/accounting/entries/delete`,
  `/accounting/entries/replace-account`,
  `/accounting/lock`, `/accounting/opening`, `/accounting/accounts`, `/suppliers`, `/suppliers/import` (rows, all or
  nothing), `/purchase-invoices` (create, or
  update with `purchaseInvoiceId`), `/purchase-invoices/pay`, `/purchase-invoices/payment/remove`,
  `/purchase-invoices/void`, `/purchase-invoices/documents`. All bookings and corrections respect the accounting lock
  and closed months
  (`financialLockedDates`).
- Firestore rules: admins read `accountingEntries`, `accountingAccounts`, `accountingSettings`, `suppliers`,
  `purchaseInvoices`; nobody writes them from the client. Storage: `financial/purchase-invoices/**` admin read and
  create (PDF / images < 10 MB), no update or delete.

## TSD (owner 2026-10-30: „сделать аналог TSD декларации в бухгалтерии”)

Raamatupidamine → tab **TSD** (`crm-v2/src/features/accounting/tsd/`). It prepares the monthly declaration of income and
social tax, unemployment insurance and funded pension: Lisa 1 part Ia per person, the totals of the main form, an Excel
file. **It sends nothing to the tax board. The accountant checks the numbers before she files them.**

### Rates (checked 2026-10-30) and sources

Rates go by the year of the **payment** (taxation is cash-based). They live only in `tsd/tsdRates.js` by year, and can be
set or corrected per year in the tab (`tsdSettings/<year>`, button „Määrad”). A year with neither stops the calculation.

| 2026 | Value | Source |
|-|-|-|
| Income tax | 22 % | [emta.ee Tax rates](https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/tax-rates), [TuMS § 4 lg 1](https://www.riigiteataja.ee/akt/TuMS) |
| Basic exemption | 700 €/month (8400 €/year), a fixed amount, on a written application to one payer only | emta.ee, TuMS § 23 |
| Exemption at pensionable age | 776 €/month (9312 €/year) | emta.ee, TuMS § 23⁵ |
| Social tax | 33 % | emta.ee, [SMS § 7](https://www.riigiteataja.ee/akt/SMS) |
| Monthly base for the minimum | 886 € (292,38 € of tax) | [emta.ee Sotsiaalmaks](https://www.emta.ee/ariklient/maksud-ja-tasumine/tulumaks-ja-sotsiaalmaks/sotsiaalmaks), SMS § 2 lg 2 |
| Unemployment insurance | employee 1,6 %, employer 0,8 % | emta.ee |
| Funded pension (II) | 2 %, 4 % or 6 %, the person's choice; per person, not per year | emta.ee |
| Filing and paying | the 10th of the next month; a weekend moves it (10.10.2026 → 12.10) | [emta.ee TSD](https://emta.ee/ariklient/maksud-ja-tasumine/tulumaks-ja-sotsiaalmaks/deklaratsiooni-tsd-esitamine/deklaratsiooni-tsd-esitamine-muutub-andmepohiseks), form TSD p 4 |

Payment types: [official table](https://ncfailid.emta.ee/s/N2YaQNKweXWH6XS/download/tsd_lisa_1_valjamakseliikide_tabel_01.01.2026.xlsx),
compared with the data-based TSD matrix (`APA_TSD_valjamakseliikide maatrikstabel_20251118.xlsx` in the
[technical documentation](https://ncfailid.emta.ee/s/TiG3ajyNdETfLK4)): the codes offered keep their number and attributes.
**A contract under the law of obligations is 17, not 21; 21 is a board member.** Offered: 10, 15, 16, 17, 21, 24, 33, 54, 55,
57; plus „FIE / company” and „non-resident (Lisa 2)”, both outside the calculation.

Calculation, as in [Lisa 1 examples](https://emta.ee/ariklient/maksud-ja-tasumine/tulumaks-ja-sotsiaalmaks/deklaratsiooni-tsd-esitamine/lisa-1-osa-1a-taitmise-naited)
(the tests reproduce examples 1, 2, 3, 14, 15 and the pensioner's example 3 to the cent): pension and employee unemployment
off the gross → exemption, at most what is left and one per person across types → 22 % of the rest. Social tax on the gross;
for types 10 and 33 raised to the monthly base (code 1090) unless the person is exempt (SMS § 2 lg 2¹, lg 4) or the increase
is typed by hand (a part month, SMS § 2 lg 3). At pensionable age: exemption type 650, no employee unemployment, employer's
stays. Rounding: every amount to the cent.

### Form and format

Columns follow Lisa 1 ([form](https://www.emta.ee/sites/default/files/documents/2025-05/vorm_tsd_lisa_1_2025.pdf)): 1000, 1010,
1020, 1030, 1150, 1160, 1060, 1090, 1100, 1110, 1120, 1130, 1140, 1170, totals 1200–1250. Main form
([form](https://www.emta.ee/sites/default/files/documents/2023-01/vorm_tsd_2023.pdf)): 110, 115, 116 = TK + TTK, 117, 118. Not
computed: 114 (Lisas 3–8), 119, part Ib (refunds), codes 1070 / 1080, Lisa 2, part II.

**Since 01.10.2026 Lisas 1 and 2 are replaced in e-MTA by one payments view** (the October TSD, due 10.11, is the first).
The old XML is no longer valid; files use the new XBRL GL format, the old CSV is accepted until the end of 2027, manual entry
stays. So the export is **Excel only**. No XML: the format changed and no upload could be tested. A CSV export can be
added against the official description if the accountant wants it.

### Data

| Collection | Holds | Who |
|-|-|-|
| `tsdPayees/<uid or auto id>` | name, `idCode`, `code` (payment type, `fie`, `nonresident`), `exemptionApplied` (null = not answered), `exemptionCents`, `pensionAge`, `pensionRate` (null = not answered), `minimumExempt`, `staffUid`, `active`, `note`, `history` | read and write: admin, finance |
| `tsdMonths/<YYYY-MM>` | `sourceMonth`, `lines` (`id`, `payeeId`, `code`, `grossCents` (null = not entered), `minimumIncreaseCents` (null = calculated)), `history` | read and write: admin, finance |
| `tsdSettings/<year>` | the rates of a year | read and write: admin, finance |

No one deletes. `history` names who changed which fields and when, never a value, so an ID code does not spread. ID codes
are in no log, URL or file name; the Excel holds them, because the declaration needs them. The page itself is ADMIN only
(`accessPolicy.js`). Emulator test: `functions/tsd-rules-emulator.integration.js`.

### The month

The TSD month is the month of **payment**. „Töö kuu” (default: the month before) says whose pay it was: the accountant's books
pay March in April and file it as „TSD 04/2026”. Gross comes from approved work time of that month (`workSessions`) until she
types her own; typed values are saved and stay. Empty gross = not in the calculation, with a warning; a typed 0 on type 10
means the monthly base alone. Missing data shows under the person. A person without a contract type stays out of the totals.

**On 2026-10-30 production has no `workSessions` and none of the fields above, so everything is typed by hand at first.**

### Comparison and salary entry

„Võrdlus pearaamatuga” compares TSD gross with account 4710 of the month worked. „Vaata ja loo palgakanne” is a separate, optional
step: it shows the entry first and warns when the month already has one, then calls the normal `/accounting/entries` (PR, numbered,
in history and audit, refused in a closed period). It copies the accountant's own monthly entry: last day of the month worked,
„PL <kuu> <aasta>”, D 4710 gross, D 4720 social tax, D 4730 employer unemployment (4720 if the chart has no 4730), C 2210 net,
C 2320, C 2330, C 2340 TK + TTK, C 2350.
