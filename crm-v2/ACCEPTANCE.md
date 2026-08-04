# CRM v2 acceptance checklist

Use dedicated test accounts and non-production-like sample records for write
checks. Do not archive or edit an active learner during a smoke test.

## Anonymous and routing

- Open `/`, `/students` and `/students/example` directly.
- Confirm each protected route resolves to `/login` without a white screen.
- Confirm invalid credentials show a useful Estonian error.

## Administrator

- Sign in with an administrator test account.
- Confirm the Students list loads real Firebase records.
- Search by name, phone and email; refresh and confirm URL search is preserved.
- Exercise status, level, teacher and sort filters, then reset them.
- Open a student profile and verify main data, schedule, recent lessons,
  progress and financial summary.
- Create a clearly named temporary student, edit it, then archive it.
- Confirm a duplicate profile is rejected and a failed archive shows an error.
- Confirm an administrator can assign or change a teacher.

## Teacher

- Sign in with a teacher test account.
- Confirm only students assigned to that teacher are listed.
- Confirm a direct URL for another teacher's student shows `Ligipääs puudub`.
- Confirm the finance card is not loaded or displayed.
- Confirm the teacher field cannot be reassigned in create or edit forms.
- Confirm legacy short and full teacher names resolve to the same teacher scope.

## Student

- Sign in with a student test account and confirm `/` resolves to `/student`.
- Confirm only profiles explicitly linked through `linkedUserId` or `studentUid`
  appear; similarly named or matching-email profiles must not be inferred.
- Confirm upcoming lessons, pending homework, reviewed submissions, progress and
  invoice balance match the linked profile.
- Confirm Homework and Messages open from the student dashboard.
- Sign in with an unlinked student test account and confirm the safe linking
  instruction appears without exposing another learner's data.

## Finance forecast

- As an administrator, open Finance and save a lesson price and weekly lesson
  count for a test student.
- Confirm weekly, average monthly (`weekly × 52 / 12`) and annual totals update.
- Confirm the student's `lessonPrice` and `weeklyLessons` fields match the saved
  values and are used for both the forecast and new lesson invoices.
- As a finance-role test account, confirm the forecast is visible but editing is
  unavailable and the full Students collection is not queried.

## Lesson accounting and invoices

- Mark an individual calendar occurrence completed and confirm exactly one
  `lessons` record with `accountingSource: crm_v2` is created.
- Mark group attendance and confirm each learner receives only their own dated
  accounting record; clearing a non-invoiced attendance mark removes it.
- In Finance, confirm completed lessons are grouped by student and use the
  lesson price stored on that student's card.
- Select a subset of lessons, create an invoice and confirm those lesson IDs are
  linked to exactly one immutable invoice.
- Open the invoice and confirm every lesson date and amount is visible.
- Credit one mistaken lesson line with a reason and confirm the original invoice
  remains, a credit note is created and the balance is recalculated.
- Send the invoice and an overdue reminder to a dedicated test recipient.

## Bank reconciliation

- As an administrator, import a CSV statement with date, positive amount, payer,
  reference and transaction ID columns; confirm outgoing rows are skipped.
- Confirm a unique invoice number or payment reference selects the open invoice
  automatically, while an ambiguous row remains unselected for manual review.
- Allocate an exact payment and confirm one bank transaction, one payment and the
  recalculated invoice balance are committed together.
- Allocate a partial payment and an overpayment; confirm the partial invoice stays
  open and the excess becomes an advance for the selected student.
- Import the same file again and confirm the same external transaction is marked
  as already imported rather than creating another payment.
- Sign in with a non-administrator finance account and confirm bank transactions,
  student profiles and import controls are not queried or displayed.

## Account settings

- For each role, open Settings and update the current account's name or phone.
- Confirm e-mail, UID and roles are read-only.
- Send a password reset link and confirm it targets the signed-in account's
  e-mail address.

## Responsive and keyboard

- Repeat the list and profile smoke test at 390 px and 768 px widths.
- Confirm there is no horizontal page overflow and the mobile student cards are used.
- Open and close forms with keyboard only; verify Escape closes a modal and focus returns.
- Confirm validation errors are announced with their associated fields.

## Release gate

- `npm run lint`, `npm test` and `npm run build` pass from `crm-v2/`.
- Firestore rules compile and emulator security regression tests pass.
- Vercel Preview is built from the `crm-v2/` root and nested routes return HTTP 200.
- Keep PR #51 in draft until the administrator and teacher checks above pass with real test accounts.
