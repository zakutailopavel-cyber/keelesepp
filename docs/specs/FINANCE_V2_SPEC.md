# Finance v2 and duplicate cards — specification (draft for owner approval, 2026-09-30)

Status: **approved 2026-09-30 with the owner's answers (see end)**. Owner's request: invoicing, reminders, payment tracking and invoice generation that work;
the lesson price set by the admin in the student's profile and invisible to teachers and parents; duplicate student
cards removed completely and for good, so a parent sees exactly one, current card of the child.

## 0. What exists today (checked in code)
- Finance page with 8 sections (FinancePage.jsx is 1,750 lines): create invoices from lessons, invoices and payments,
  bank import, month overview, revenue forecast, advances/refunds, audit, numbering. Same overload as v1.
- Server: invoice API, PDF (`invoice-document.js`), numbering, credit notes, bank matching, financial periods,
  daily reminders at 09:00 (`sendInvoicePaymentReminders`: 10 days before due + overdue).
- **Lesson price is stored on the student card (`students.lessonPrice`)**, and it can be set only inside Finance →
  revenue forecast form. The student card is readable by the student's teachers and by the parent, so the price is
  visible to them at the data level even though no screen shows it. `studentRevenuePlans` (admin/finance only) also
  holds a price and is preferred when present.
- Duplicates: an admin tool on the Students page finds likely duplicates and merges them on the server. The duplicate
  is only switched off (`active: false`, `mergedIntoStudentId`), not removed; a card the detector does not match
  cannot be merged by hand.

## 1. Lesson price in the student profile (admin / finance only)
- New profile tab **"Arveldus"**, shown only to admin and finance roles: price per lesson (EUR), lesson length the
  price is for (45 / 60 / 90 min; other lengths are pro-rated), payer (parent card), valid-from date.
- Price history: a new price starts from a date; invoices for earlier lessons keep the old price.
- Stored **only** in admin/finance-readable documents (`studentRevenuePlans` + history). A one-time server migration
  moves every existing `students.lessonPrice` there and deletes the field from all student cards (preview first,
  then apply). After that teachers and parents cannot read any price.
- Group lessons: price per participant, set on the group (same tab on the group page).

## 2. Finance page: three tabs instead of eight
1. **Arved (koosta)** — month picker → one row per payer: children, lessons held (from the calendar "Tund toimus"),
   price, total, warnings (no price, no payer e-mail, lesson not marked). "Vaata" opens the PDF; "Koosta ja saada"
   issues the invoices and e-mails the PDF to the payer. Nothing is sent without this click.
2. **Maksed** — every open invoice: sum, due date, status (tasumata / osaliselt / üle tähtaja / makstud), reminders
   already sent with dates, buttons "Märgi makstuks" (sum + date), "Saada meeldetuletus". Bank statement import stays
   here (matches by reference number / invoice number).
3. **Ülevaade** — month: invoiced, paid, open, overdue; per teacher.
- Advances, credit notes, audit, numbering, periods stay reachable under "Täpsem", not in the main view.

## 3. Reminders
- Settings (admin): on/off, days before the due date (default 3), after the due date (default 3 and 10), text of the
  e-mail. Per payer "ära saada meeldetuletusi".
- Every sent reminder is logged on the invoice and shown in "Maksed".
- Parent side: the parent dashboard shows the family's invoices (sum, due date, status, PDF) — the only money the
  parent sees. Teachers see no money.

## 4. Duplicate cards — full, irreversible merge
- Tool **"Topeltkaardid"** (admin, Students page): suggested groups (same name + parent e-mail / phone / child login)
  **and** a manual pick of any two cards.
- Preview shows what moves to the main card: lessons and calendar series, homework and worksheets, recordings,
  invoices and payments, parent and child logins, notes, skill map.
- Apply: everything is re-pointed to the main card, then the duplicate card is **deleted** (not archived). The admin
  confirms by typing the child's name. A short record (both ids, names, who, when, what moved) goes to the activity
  log so the action is traceable; the card itself cannot be restored.
- Issued invoices are legal documents: they are never deleted, only moved to the main card.
- Afterwards the parent's dashboard lists only active, non-merged cards (already filtered today); a check ensures
  each parent sees each child once.
- Same tool for duplicate parent accounts (server merge already exists).

## 5. Checks before release
- Unit + emulator tests: price not readable by teacher/parent (rules), migration idempotent, invoice totals with
  price history, reminder schedule, merge moves every linked collection and deletes the duplicate.
- Screenshots of the three tabs and the profile tab before approval; no invoices or e-mails are sent to real parents
  during testing.

## Owner's answers (2026-09-30)
1. Two billing modes per payer: **month in advance** (invoice for next month's planned lessons) and **current month,
   due by the 10th** (invoice at the start of the month). Both bill the lessons planned in the calendar for that month;
   differences (lessons cancelled by the school, absences announced in advance) are corrected on the next invoice.
2. Company details, payment account and invoice layout: **as in v1** (`PAYMENT_DETAILS`, due day 10).
3. "Puudus, ei teatanud" is **charged**, but the admin can waive a single lesson ("erand: ära arvesta").
4. Stored per student plan: `billingMode` ('advance' | 'current'), `lessonMinutes`, `chargeNoShow`, price history.

## Implementation notes (2026-09-30)
- §1 done (PR #210): price only in `studentRevenuePlans`, "Arveldus" card in the profile, one-time move button.
- §4 done (PR #211): permanent merge (type the main card's name), manual pick, purge of earlier archived duplicates.
  The v2 duplicate tool had called `financeApi`, which has no merge routes; it now calls `staffOperationsApi`.
- §2/§3: tab "Kuuarved" — planned lessons from the calendar (individual + group, cancelled dates skipped,
  lesson length in price units) × plan price; one invoice per student and month (`invoices/monthly_<student>_<month>`,
  server prices from the plan). Correction line = last month's chargeable lessons − last month's billed units
  (held lessons + no-shows unless waived). No-show exception per lesson (`billingWaived`, admin only in rules).
  "Koosta arved" / "Koosta ja saada" (PDF by e-mail via the existing invoice sender). Default due: current mode 10th
  of the month, advance mode last day of the month before. Existing reminders (1st–10th for invoices due on the
  10th, then overdue every few days) and their count/date on the invoice stay as they were.
- Finance page: tabs Kuuarved / Arved ja maksed (incl. bank) / Ülevaade; lesson-based invoices, advances, audit,
  numbering under "Täpsem".
