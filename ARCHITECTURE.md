# KeeleSepp platform architecture

## Current shape

KeeleSepp is a progressively separated browser application. The CRM is still delivered from
`haldus.html`, while learning content and live teaching already have independent entry points:

- `haldus.html` — CRM, schedule, students, invoices and administration;
- `haldus-exercises/index.html` — learning library, curricula, exercises and assignments;
- `live-classroom.html` + `live-classroom.js` — private teacher desk and public student stage;
- `functions/` — trusted financial mutations and document/email generation;
- `firestore.rules` — authorization and browser-write schema boundaries.

This is an intentional migration path. A full rewrite would put working school operations at
risk, so new behavior must first be extracted behind small tested core modules.

## Tested browser contracts

### Learning library

`learning-library-core.js` is the source of truth for:

- adapting legacy curricula and exercises into one library item model;
- folder keys and labels;
- subject → level/age → curriculum/topic navigation;
- URL serialization and recovery of the current folder;
- conversion of a private material record into a public Live Classroom scene draft.

Folder URLs use `libSubject`, `libStage` and `libTopic`. Other query parameters are preserved.
When records have `curriculumId`, that immutable id is used as the folder key. Older records
continue to fall back to their curriculum title or topic and do not need a destructive migration.

### Live Classroom

`live-classroom-core.js` owns the public scene contract. A scene may contain only:

- type, title, body, bounded public options and version metadata;
- an optional minimal source reference (`kind`, `id`, `type`);
- an optional same-site action link to a learning task.

Answer keys, full worksheet objects and arbitrary links are not part of the public contract.
Every room scene update is versioned transactionally. Firestore rules repeat the same boundary
server-side and reject extra fields, external action links, invalid screen-share state and
non-sequential versions. The same transaction writes an immutable
`liveClassrooms/{id}/scenes/{sceneId}` journal entry keyed by scene version. The history screen joins those
versioned public scenes with append-only student responses without copying private source data.
Ending a room requires a bounded `lessonSummary` with a teacher comment and optional achieved
goals and follow-up homework. The room's immutable `studentId` is the durable link to the
student cabinet. If homework is present, Firestore rules require the matching student homework
record to exist after the same atomic transaction. Summary v2 also stores stable curriculum-goal
IDs, display labels and the affected skill IDs. When structured goals are selected, the same
transaction updates the linked student's existing `skillMap`; rules require the student's
last-lesson markers to match the completed room. Completed summaries cannot be edited later.
Summary v1 remains valid for previously completed rooms.

### Finance

Financial writes remain isolated from the learning-content slice. Browser screens can request
financial operations, but authoritative payment, credit, package and invoice mutations live in
Cloud Functions and are covered by unit and emulator tests.

`accounting-ledger-core.js` builds the administrator's monthly invoice register as a read-only
projection of `lessons`, `invoices`, `payments`, `bankTransactions` and `payerCredits`. It
deliberately does not persist a second ledger. Invoice periods use the issue date while
incoming-payment periods use the payment date. The invoice projection compares payment snapshots
with active payment records and checks bank allocation arithmetic, exposing mismatches without
silently repairing authoritative records.

The lesson-payment projection joins both directions of the immutable lesson/invoice ID link.
It excludes credited lines, keeps package consumption as a separate coverage source, and exposes
legacy invoices without lesson lines instead of inventing historical links. An administrator can
create an append-only `paymentLineAllocations` version that snapshots exact lesson IDs, invoice
line indexes and allocated cents. The active payment stores the current version pointer; a dated,
reasoned correction creates a new version and audit entry instead of rewriting history. Explicit
allocations reserve their selected rows first. Payments without a version are then projected
oldest-first as a deterministic, labelled migration fallback. The projection reports
duplicate lesson lines, one lesson on multiple invoices, broken reciprocal links, line-total
mismatches, payment overflow, paid snapshots without payment records and absences without a
billing disposition. Both registers have CSV output with stable IDs. VAT, expenses and
period-close evidence remain future accounting slices.

`paymentAllocationQueue()` is a read-only client projection over the same authoritative
collections. It never writes or confirms money. For each active payment in the selected month it
subtracts lesson capacity reserved by other current exact versions, builds a bounded oldest-line
suggestion, classifies confidence, and exposes incomplete, invalid and legacy cases. Confirmation
still goes through the transactional Financial Core endpoint. The allocation modal also reads all
append-only versions for the selected payment so the accountant can inspect the complete correction
chain without granting the browser any financial write access.

Payment-order evidence is stored under
`financial/payment-orders/{paymentId}/{documentId}` in Firebase Storage. Only administrators
may create or read these objects; client updates and deletes are denied. After a successful
upload, the administrator calls the Financial Core with the exact payment ID, immutable
document ID, expected Storage path, bounded filename, MIME type and byte size. The server
validates the path and metadata, appends the document snapshot to the payment and writes an
immutable `payment.document_attached` audit entry in one Firestore transaction. Payment amount,
invoice balance and allocation are not changed by attaching evidence. Voided payments keep
their prior evidence but reject new attachments.

Monthly billing control is a reviewed snapshot, not yet a statutory period lock.
`accounting-ledger-core.js` combines invoice/payment, bank-allocation and lesson-line issues into
one administrator checklist. A review request is sent only when the browser projection has no
blocking errors, but the browser is not authoritative: `financeApi` reads `invoices`, `payments`,
`bankTransactions`, `lessons` and `paymentLineAllocations` again and builds an independent
`billing_control_v2` snapshot.
Blocking issues reject the request. A successful review creates an append-only
`financialPeriodReviews/{requestId}` document, updates the
`financialPeriods/{YYYY-MM}` latest-review pointer and writes an immutable
`financial_period.reviewed` audit entry in one transaction. Direct client writes to both period
collections are denied. Legacy invoices without immutable lesson lines remain warnings so old
data stays reviewable without inventing evidence.

The reviewed snapshot deliberately does not prevent later financial mutations. A true locked
period depends on dated correction entries, payroll approval, expenses and an archived
accountant export; enabling a lock before those workflows exist would make legitimate
corrections unsafe.

### Staff operations

`functions/staff-operations-core.js` owns deterministic work-duration, hourly-rate, payroll and
operational-alert calculations. `staffOperationsApi` is the only writer for work sessions:
one server-side pointer per staff member prevents concurrent open shifts, while every transition
also creates a `workTimeAudit` snapshot. Closed shifts are pending until an administrator
approves them; approval snapshots the hourly rate and calculated pay so later rate changes do not
rewrite prior payroll.

Activity-log time is deliberately a capped estimate and remains separate from approved payroll.
The scheduled `refreshSchoolAssistant` function derives owner-only alerts from invoices, tasks,
work sessions and sanitized Google Calendar status. It runs without an external AI provider, so
school and payroll records remain inside the Firebase project.

### Calendar

`calendar-core.js` owns migration-safe schedule calculations:

- 15-minute time slots and lesson end times;
- dated and legacy weekly-recurring occurrence rules;
- teacher and student overlap detection;
- Monday-first month grids;
- proportional day-timeline layout for simultaneous lessons;
- versioned payloads with stable `studentId` ownership.

The CRM renders month, week and day projections from the same schedule records. Existing records
without `scheduleVersion` remain valid. New browser-created records use `scheduleVersion: 2` and
keep their source (`keelesepp` or `gcal`) explicit. Per-occurrence child records use
`scheduleVersion: 3` and preserve their parent series reference.

`functions/calendar-sync-core.js` owns the pure Google event projection, scope checks, stable
origin identifiers and content fingerprints. The Firestore schedule trigger pushes individual
KeeleSepp lessons to a write-enabled teacher's owned primary Google Calendar. Insert, move,
restore and cancellation use the same server-owned path; hard deletes that cannot reach Google
immediately are retried through `calendarSyncOutbox`.

OAuth credentials live only in the server-only `calendarConnections` collection;
`users/{uid}.gcal` contains sanitized status metadata. Existing connections are migrated lazily
and remain inbound-only until the teacher grants the additional write scope. The hourly job
reconciles Google changes, flushes deferred deletes and backfills eligible KeeleSepp records.
Private Google extended properties plus a stable content fingerprint stop the service from
re-importing its own write as a new change. Completed lesson history is never deleted when a
Google event disappears.

Recurring schedule exceptions are additive and migration-safe. The parent series keeps an
`excludedDates` array. A moved or cancelled occurrence becomes a separate `schedule` record with
`seriesId`, `originalOccurrenceDate` and stable student ownership. Google receives matching
`EXDATE` recurrence lines, while an active moved occurrence is synchronized as its own managed
event. Deleting the exception removes that child record and restores the date on the parent.

Google-native exceptions of a KeeleSepp-managed recurring series are imported through the
non-expanded Calendar API view. Ordinary instances are omitted; only moved, overridden or
cancelled instances become deterministic `gcalx_*` child records. Their immutable
`originalStartTime` is stored as `originalOccurrenceDate`, the parent records the corresponding
native excluded date, and a restored Google instance removes both projections on the next sync.
These child records keep `source: gcal`, so their authority remains Google and the Firestore
push trigger cannot echo the import back as another event.

The current two-way slice still uses last-synchronized-write-wins. Explicit conflict review,
Google eTag preconditions and incremental sync tokens remain separate releases.

## Firestore ownership

- `curriculumLessons`, `exercises` — staff-authored learning sources.
- `worksheetAssignments`, `homework`, `exerciseResults` — student-specific learning activity.
- `liveClassrooms` — one teacher and one student per current room.
- `liveClassrooms.lessonSummary` — immutable teacher outcome attached when a room is completed.
- `students.skillMap` — the canonical current mastery view; structured lesson outcomes may only
  raise their mapped skills and keep the immutable room summary as evidence.
- `liveClassrooms/{id}/scenes` — immutable public scene snapshots for versions published after
  learning-history rollout.
- `liveClassrooms/{id}/responses` — append-only student responses for the current scene version.
- `activityLog` — operational audit events, including library assignment and classroom publish.
  Records before 29.07.2026 may be projected into a read-only historical work-time estimate.
  This projection remains visibly separate from server-measured `staffProgramDays` and is never
  silently promoted to payroll evidence.
- `workSessions` — server-authored staff shifts; staff read their own and administrators read all.
- `workTimeAudit` — immutable server-authored snapshots for shift, approval and rate transitions.
- `workSessionOpen` — server-only concurrency pointers enforcing one open shift per staff member.
- `staffProgramDays` — server-authored daily active-time aggregates; staff read their own and
  administrators read all. Browsers cannot submit or edit a duration.
- `staffProgramPresence` — server-only cross-tab heartbeat pointer. It prevents several visible
  KeeleSepp windows from multiplying the same wall-clock interval.
- `assistantAlerts` — server-authored operational attention queue visible only to administrators.
- `schedule` — dated or recurring lesson intent plus additive occurrence exceptions with stable
  student ownership.
- `calendarConnections` — server-only Google OAuth credentials and sync status; browser access is denied.
- `calendarSyncOutbox` — server-only deferred Google event deletions; browser access is denied.
- financial collections — governed by the financial core and its immutable audit model.

Assignment records copy display metadata for historical readability and also store stable
`sourceId` and `curriculumId` references when available.

## Safe evolution rules

1. Preserve legacy records and add optional fields; do not rewrite history merely to fit a new UI.
2. Put reusable classification, validation and conversion logic in a tested core module.
3. Treat the student stage as a public projection, never as a view of the teacher workspace.
4. Use transactions for versioned or auditable state transitions.
5. Deploy additive `firestore.rules` before a web release that depends on a new collection;
   deploy restrictive rule changes only with an explicit compatibility plan.

Completed rooms created before the scene journal remain valid. The teacher history UI shows their
room metadata and an explicit legacy notice instead of inventing missing scene details.

## Next extraction seams

The remaining large files should be reduced incrementally:

1. extract the library React view and assignment dialogs from `haldus-exercises/index.html`;
2. extract Live Classroom room transactions into a dedicated service module;
3. split CRM domains from `haldus.html` one workflow at a time;
4. extract reusable student learning-history cards from the CRM;
5. add a migration tool that can attach stable curriculum ids to legacy topic-only records.

These are bounded extractions, not a request to replace the platform in one release.
