# KeeleSepp platform architecture

## Current shape

The primary CRM is the React application in `crm-v2/`: routes are in `src/app/routes.jsx`,
domain screens in `src/features/`, and Firebase adapters in `src/services/firebase/`.
The first CRM (v1: `haldus*.html`, the old `live-classroom.html`, `interactive-lesson/` and about a hundred
browser modules in the repository root) was retired on 2026-10-19 (owner: move everyone to the new CRM). Its
addresses on www.epkoolitus.ee redirect to crm.epkoolitus.ee (`vercel.json`); the repository root now holds only the
public website (index, `ru/`, `oppematerjalid/`, `tasemetest`, `kutse`, `privaatsus`, `tingimused`). Old modules that
server tests still use live in `functions/test-fixtures/legacy/`. The v1 server endpoints (`lessonDraftsApi`,
`learningSessionApi`, `learningProfileEvidenceApi`) are still deployed; removing them is a separate, owner-approved step.
Sections below that describe v1 surfaces are history.

### Calendar accounting integrity (2026-10-07)

`schedule` stores the plan/series; `lessons` stores the journal. Per-date `occurrenceStatuses`
and `lessonEntryId` are legacy-compatible references, not replacements for a journal record.
Calendar resolution checks both scheduleId/date and explicit record IDs, always requiring the
same student and date. Missing or duplicate terminal records are shown as inconsistencies;
quick completion and dragging are blocked instead of creating a second charge.
Series result statuses apply only to their recorded occurrence date; new server journal writes
keep the series Planeeritud and store the result under occurrenceStatuses[date]. A dated v2
series is recurring when recurring=true, regardless of whether date is populated.
CRM v2 completion and group array/attendance mutations use Firestore transactions. On retries,
they read the latest document instead of overwriting another staff member's changes.
The dashboard includes individual and group occurrences, matching the calendar's projection.

### Current Google authority (owner decision 2026-10-05)

KeeleSepp is authoritative: lessons are pushed to Google; inbound lesson changes/imports are
disabled. Previously imported lessons are editable in KeeleSepp (`isGoogleOwned` returns false).
Older two-way descriptions later in this document describe the historical implementation,
not the current policy. OAuth permissions, scoped credentials and deferred-delete outbox remain.

## Tested browser contracts

### Learning library

`learning-library-core.js` is the source of truth for:

- adapting legacy curricula and exercises into one library item model;
- folder keys and labels;
- subject → level/age → curriculum/topic navigation;
- URL serialization and recovery of the current folder;
- conversion of a private material record into a public Live Classroom scene draft.

Before rendering, curriculum records are deduplicated by stable source identity and by normalized
subject/level/topic/title identity. If equivalent records exist, the published or otherwise richer, newer worksheet
record wins. This is a presentation and save-safety boundary, not a destructive data migration.

#### Course names (owner 2026-10-29)

Courses are named by the TARGET level, like Harno / Töötukassa: **Eesti keel A2** (algajale · Harno A2 eksamini),
**Eesti keel B1** (A2 tasemelt · Harno B1 eksamini), **Eesti keel B2** (B1 tasemelt · Harno B2 eksamini),
**C1 süvakursus** (B2+ · 240 ak h), **English A2 / English B1** (the English course as a whole: „English A1–B1”).
The one source is `crm-v2/src/features/curriculum/courseNames.js`; the course registry, the worksheet badge
(„KeeleSepp · Eesti keel B1 · moodul N”), Õppevara groups (by `curriculumId`, the stored `curriculumTitle` is only a
fallback), „Minu kursus” and the textbook cover read it. Old badges stored in Firestore are shown under the new name
by `courseBadge()` in `Sheet.jsx`. Display only: ids (`est-a2-b1-roadmap-v1`, `a2b1-…`, course keys) never change.

### Didactics library

Teacher reference books and reusable methodical resources live in the separate `didacticLibrary` collection and
`didactics/<staffUid>/...` Storage prefix. They do not use `curriculumLessons`, so book uploads cannot change course,
topic or lesson counts. Only staff may list, upload, edit, download or delete these records and files.

The browser supports batch upload of up to 50 files per selection. Each PDF, EPUB, Office, text or image file is
limited to 100 MB, receives shared subject/level/language/category metadata and an automatically derived editable
title. Exact same-name and same-size duplicates are rejected before upload. If metadata creation fails after the blob
upload, the blob is removed immediately. Search spans title, author, description, tags, subject, level and original
file name; rendering is incrementally capped at 60 cards for large collections.

Worksheet editing from Õppevara carries the immutable curriculum lesson ID into the builder. That ID always wins over
temporary picker state, so saving creates a new worksheet version on the original lesson instead of a second lesson
document. The displayed document name can be edited explicitly or derived automatically from the selected lesson or
destination topic; renaming does not rewrite immutable published worksheet-version history.

The student's phone and tablet draw the same document as one column (`Sheet` prop `flow`, `docs/WORKSHEET_PHONE_VIEW.md`); A4 stays for print, the constructor and the teacher's marking.

CRM v2 Worksheet Studio keeps the current author document in `curriculumLessons.worksheetDoc`, its lifecycle in
`worksheetDocStatus`, and the last assignable snapshot in `publishedWorksheetDoc`. Every save creates an immutable
`worksheetVersions/{lessonId}_studio_v{n}` record. A client must submit the `worksheetDocUpdatedAt` it loaded; a
different current timestamp is a conflict and must never be overwritten silently. Draft-only content is not
assignable. Existing worksheet documents without the lifecycle fields remain published for backward compatibility.
Their first draft save preserves that existing document as the published snapshot in the same batch. Library type
classification includes draft documents; preview falls back to a labelled draft when no published snapshot exists.

Folder URLs use `libSubject`, `libStage` and `libTopic`. Other query parameters are preserved.
When records have `curriculumId`, that immutable id is used as the folder key. Older records
continue to fall back to their curriculum title or topic and do not need a destructive migration.

### Live Classroom

CRM v2 room (`crm-v2/src/features/live-classroom/LiveRoom.jsx`): an accepted `liveLessonInvitations` room is a
full-screen layer. The call is `useLiveCall` (WebRTC over `liveLessonCallSignals` + presence). The board is the
student's persistent board `whiteboards/{studentId}` (same as CRM „Tahvel” and the v1 board) with optional lesson pages
`lessonPages/{pageId}` named "Tund dd.mm.yyyy"; materials are placed as image/PDF board elements (staff only by rules).
Chat uses the student's internal `messages` conversation. Board rules check access once per write (see
`whiteboardElementCreateValid`, `lessonPageLive`); evaluating it repeatedly exceeds Firestore's 1000-expression limit.

Room video layout (1:1 and group): the camera tiles are movable / resizable windows (`FloatingWindow.jsx`,
`floatingLayout.js`) in a pointer-transparent layer over the board; layout per window id is kept anchored to a corner
in `localStorage` `keelesepp.liveLayout.v2` (v1 until 2026-11-05; group strip orientation in `keelesepp.liveGroupStrip`). Screen share in a
1:1 call (`screenShare.js`): the teacher's offer has camera video + a second „screen slot” video transceiver
(`sendrecv`, the student's answer sets it `sendrecv` too); sharing = `replaceTrack(screen)` on the slot, stop =
`replaceTrack(null)` — no renegotiation, the camera keeps its own track. The receiver recognises the slot as the second
video transceiver and the sharer announces `{ t: 'screen', on, slot }` over the room data channel (remote track label /
contentHint are not transmitted, so they cannot identify a screen). Peers without `addTransceiver` fall back to the old
way (screen replaces the camera track, announced with `slot: false`). The share takes the main area (`ScreenStage.jsx`,
„Ekraan / Tahvel” switch); group rooms have no screen share.

Room on small screens (2026-11-05 `agent/live-room-small-screens`, 1:1 and group, teacher and student): `.lr` is
exactly the viewport (`100dvh`, page scroll locked with `body:has(.lr)`); the top bar is one row of fixed height
(`--lr-top-h`, 52 px when the window is ≤ 820 px high; phones ≤ 760 px keep two rows). `topBarFit.js`
(`useTopBarFit`, pure `foldReducer`) measures the bar after each render / resize and folds steps in a fixed order into
„⋯” (`liveRoomFoldSteps` / `groupRoomFoldSteps`: first `labels` = words next to icons, then Osalejad, Materjalid, Sõnad,
Kiirküsimus, Taimer, undo/redo, Vestlus, Ülesanded, Tunniplaan pill, „Ei salvesta”); mic, camera, screen, leave /
end call, the lesson clock and the recording mark never fold; the title truncates with „…”. Layers over the board: page
tab bar (StudentBoard; the „Tahvlivaade / Lugemisvaade” switch is a button in it in the room) → left column
`.lr-stack` (countdown, the teacher's device warning — passed as `LiveRoom stageNotice` —, „Täna harjutada”; it stops
`insetRight` px before the video windows) → video windows (`FloatingLayer` inset 52 px top / 66 px bottom, so they never
cover the tab bar or the tool dock) → quick poll card (bottom 80 px, above the dock, z 30) → dock (centred, never under
the zoom bar; ≤ 980 px board width smaller buttons). The student's „Tundi salvestatakse” is a pill in the top bar.
Fixed notes (toasts, page error, device warning outside the stack) use `--lr-stage-top`.

Lesson plan + in-room attendance (teacher only, 1:1 and group): `liveLessonPlans/{roomKey}` (roomKey = invitation id
or group room id; staff-only rules, only the room's teacher writes). Steps with minutes (`lessonPlan.js`, default
Soojendus/Avasta/Harjuta/Kasuta/Kokkuvõte scaled to the calendar lesson length remembered by `rememberLessonTiming`),
timer derived from `startedAt` / `stepStartedAt` / `spentMs` (no per-second writes), `attendance.<studentId>`
(`roomAttendance.js`: present / late + minutes / absent, prefilled from the invitation's `respondedAt`). A 1:1 room
started from the calendar hands its mark through `lessonHandoff.js` to the calendar's `completeFromSchedule`
(Kohal/Hilines → `Toimunud`, Puudub → `Puudus_eta`); group rooms are not linked to calendar groups, so their marks stay
in the plan. The student sees only „Samm X/Y” over the data channel.

Countdown timer (teacher tool, 1:1 and group; `countdown.js`, `useCountdown.js`, `CountdownTimer.jsx`,
`services/firebase/liveCountdown.js`): one map `countdown { running, remainingMs, durationMs, label, by, updatedAt }` on
`liveLessonInvitations/{id}` (1:1) or `liveGroupRooms/{id}` (group) — docs the students already read. Rules: only the
room's teacher, only that field (`affectedKeys().hasOnly(['countdown'])`), while the room is accepted / open,
`updatedAt == request.time`, ≤ 2 h, `by == uid`. Readers derive the time left as `updatedAt + remainingMs − (local now +
offset)`; the offset (server − local) is the largest of the last 5 samples `updatedAt − arrival time` of writes seen
live (not the first, possibly old snapshot). Writes only on start / pause / resume / +1 min / stop. Badge in the stage
corner (click: big), last 10 s highlighted, „Aeg läbi!” + Web Audio chime once (mute in `localStorage`
`keelesepp.countdownMuted`).

Sheet tabs (1:1 room, teacher and student alike since 2026-11-04 `agent/live-tabs-bar`; `sheetTabs.js`): worksheet pages
(„Tööleht: …”) are tabs only for this room's sheets (or, when the room has none yet, the most recent lesson day's); older
sheets (grouped by `liveRoomKey`, labelled by `liveOpenedAt` date) are in the select „Varasemad tunnid”. A sheet chosen
there, opened otherwise or reached by following the teacher stays a tab with a × until closed (session state only).
`StudentBoard` takes this as the optional `sheetTabs` prop.

Board pointer (2026-11-05 `agent/board-one-pointer`): one tool „Vali ja täida” (id `select`, `boardModel.POINTER_TOOL`,
key V) replaced „Täida töölehte” (`fill`) + „Vali ja liiguta”; it is the default on every page. `boardTool()` maps an old
id (`fill`) to it; `wordTap.stageTool` reads `tool-fill` the same way. On a worksheet page the drawing SVG is
`pointer-events: none` (the sheet's fields, word tools and the teacher's Viga / Märkus / Sõna take the clicks) and only
the user's own movable parts (not locked, not a teacher's material for a student, not a highlighter line) get
`pointer-events: auto`; pressing one makes the whole layer take the pointer until any release (ends with the #1111
selection block). A press on the sheet clears the selection; a mouse drag on the empty desk beside the sheet draws a
selection frame.

Page bar (`board/BoardPageTabs.jsx`, `board/pageTabsModel.js`, every board variant): a solid toolbar above the board
(room variant: `--sb-bar-h` 44 px, the stage starts 8 px below it, the bar ends `insetRight` px before the video tiles).
Labels drop „Tööleht:”; the pages of one lesson („<lesson> · Avasta|Harjuta|Kasuta|Õpik”) are one tab with a chip per
phase (title ellipsized, full title as tooltip / accessible name = page title). The active tab is scrolled into view;
overflow shows edge fades + arrows; a bar narrower than 1000 px whose tabs do not fit folds to „Tahvel” + the open
tab + menu „Lehed ▾”.

„Kiirküsimus” (quick poll, teacher tool, 1:1 and group; `quickPoll.js`, `useQuickPoll.js`, `QuickPoll.jsx`,
`services/firebase/livePolls.js`): one doc per room `livePolls/{kind}_{roomId}` (kind `lesson` = invitation id, `group` =
group room id) `{ kind, roomId, teacherUid, participantUids, round, mode: choice|gap, question, sentence, options (2–4),
timeLimitSec, status: open|revealed|closed, correctIndex (−1 until revealed), startedAt, updatedAt }`; a new question is the
next `round`. The right option is only in the teacher-only `livePolls/{id}/key/current { teacherUid, round, correctIndex }`
(same batch as the question) until „Näita vastust” copies it onto the poll (rules: must equal the key). Answers
`livePolls/{id}/answers/{uid} { uid, name, round, choice, answeredAt }`: the student writes only his own, only to the open
round; the teacher reads all, a student only his own. Rules also require the room to be live (invitation `accepted` /
group `open`) and `participantUids` to equal the invitation's `studentUid` / the group's `memberUids`. An optional time
limit starts the room's countdown with the label „Kiirküsimus” (answers lock in the client when it expires). A wrong
answer becomes a `studentNotes` record (kind `board`, `pageTitle` „Kiirküsimus”) with one teacher click.

„Tunni tahvlid” (`features/board/lessonBoards.js`, `LessonBoardsCard.jsx`, `LessonBoardView.jsx`,
`studentBoard.js` `lessonCopiesService`): at the lesson end the teacher's browser copies the lesson's board pages onto the
student's own board as snapshot pages `whiteboards/{studentId}/lessonPages/lb-<lessonKey>-<n>` (`isSnapshot: true`,
`snapshotOf` = source page id or `board`), copies the elements (fields whitelisted as in `validWhiteboardElement`, drawing
order in `revision`) and sets `status: 'completed'` — the existing snapshot rules then forbid any change or delete. 1:1:
„Tunni lõpp” copies the lesson pages the teacher opened (not worksheet pages), or the main board when no page was used.
Group: „Lõpeta tund” copies the group board (main + pages) onto every member's board. The student („Minu areng”) and
linked parents („Areng”) list them by `isSnapshot == true`, grouped by lesson (date, teacher), and view them read-only.

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

**„Seadme kontroll” (`/kontroll`, 2026-11-04).** A public page (no login) checks browser support, camera, microphone,
speakers, network (hosting round trip, the TURN function, ICE gathering with the room's own `callIceServers`; the TURN
relay only with `?tund=<invitationId>` of an accepted room) and screen sharing. Media never leaves the browser. A
signed-in, approved student (not a guest, not a preview) saves only the summary on the own account:
`users/{uid}.deviceCheck { at: ISO string, status: 'ok'|'warn'|'fail', issues: ≤ 12 codes, browser: ≤ 40 chars }`.
`firestore.rules` `validDeviceCheck` accepts exactly the codes of `deviceCheckModel.js` `ISSUE_CODES` (a unit test
compares both lists) through `safeSelfUserFields`; staff read it (users read `isStaff()`). The teacher sees
`DeviceCheckNotice` in the calendar lesson panel (planned lessons) and in the 1:1 room until the call connects:
„fail” / „warn” with the issues in Estonian, or „Õpilane pole seadet kontrollinud” when there is no result and the
student has no closed live lesson with this teacher (admin: with anyone). Emulator test:
`functions/device-check-emulator.integration.js`. Group lessons (2026-11-04): `GroupDeviceCheckNotice` lists every
member whose last check is „fail” / „warn” or missing (also after earlier live lessons; `groupDeviceWarnings`) — in
the live group room for the teacher until someone's video connects (× hides it), and in the calendar panel of a
planned group lesson (active members; `LessonPanel` `groupStudents`).

### Finance

Financial writes remain isolated from the learning-content slice. Browser screens can request
financial operations, but authoritative payment, credit, package and invoice mutations live in
Cloud Functions and are covered by unit and emulator tests.

The administrator enters these workflows through one `Finants` workspace. Its `Arved`,
`Maksete sobitamine` and `Raamatupidamine` sections are navigation boundaries over the existing
views, not separate data stores. Teachers retain the narrower invoice-management route and
students or parents retain their own invoice cabinet. Legacy internal routes are mapped to the
matching administrator section so dashboard alerts and saved operational links do not lose their
destination during the UI consolidation.

Invoice payer snapshot (2026-11-04): every new one-card invoice (manual, monthly, lesson package, combined, lesson-based)
stores `studentName` (the card's full `name`), `payerName` (payer / company → parent → the learner himself) and one
resolved address in `payerEmail` / `parentEmail` (+ `*Lower`) from `functions/invoice-payer-core.js`
(card `payerEmail → parentEmail → billingEmail → contactEmail → guardianEmail → email`, else the linked parent
account's login e-mail). The invoice e-mail (`index.js` `invoiceRecipient`) uses the same file: the snapshot first, then
the same card resolution, so the stored payer and the recipient cannot differ. `crm-v2/src/features/finance/invoicePayer.js`
mirrors it for the „Arvel pole saaja e-posti” warning before creating. Issued invoices are never rewritten; the PDF and
the month list show `emailRecipient` when an old invoice has no payer e-mail (display only).

Combined lesson package invoice („Ühine tunnipakett”, 2026-11-04, `docs/LESSON_TOKENS.md`): `manualInvoiceApi
/create-tokens-combined` makes ONE `lesson_tokens_v1` invoice for 2–12 lines of one payer (`combined: true`,
`studentIds`, `cardParts[i] = { studentId, subject, tokenCredits, priceCents, amountCents }`), each line priced from its
own card's plan. `financeApi /invoices/tokens/credit` gives every line its own package
`studentPackages/tokens_<invoiceId>_<lineIndex>` (own grant, audit and backlog) in one transaction; the invoice stores
`tokenPackageIds`. One-card package invoices keep `tokens_<invoiceId>`.

The `/finance` month screen shows one finance view at a time: issued invoices, invoices with
received payments, open invoices and earlier debts, student advances, or monthly invoice
preparation. Its summary cards select the corresponding views. Invoice printing reads the
server-generated PDF through the existing delivery API; it does not mutate the invoice.

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
chain without granting the browser any financial write access. Complete proposals reserve capacity
in deterministic payment-date order inside the projection, so two pending payments never propose
the same lesson capacity. Bulk confirmation is deliberately limited to complete high-confidence
rows. Each selected payment is submitted as its own idempotent, audited server command and is
revalidated against current Firestore state; one rejection cannot corrupt another payment.

`bankStatementMatchProposal()` is a second read-only projection. It normalizes punctuation and
spacing in invoice references, accepts only a unique reference as high confidence, and can propose
a single open invoice from a unique payer/student name plus exact balance as medium confidence.
Ambiguous names or duplicate references remain visibly unresolved. For bank-sourced lesson
allocation, a reference match is required before a proposal becomes eligible for bulk confirmation.

`bank-statement-core.js` parses the four-column browser import independently from the reconciliation
view and returns explicit accepted/skipped diagnostics. The matching UI treats a proposal and an
authoritative saved transaction as different states: totals and completed styling are derived from
server-created `bankTransactions.externalId` values, never from a client-only review checkbox.
It also recognizes header-based bank exports (including the current Swedbank Estonia CSV), imports
only incoming EUR credit rows, preserves stable bank-origin identifiers where present, and excludes
outgoing or unsupported-currency rows with visible diagnostics. `studentInvoiceRegister()` builds
the per-student paid/partial/unpaid view from invoice and active payment records; it also projects
student-owned open advances and invoice-free direct lesson payments without treating either as an
invoice. Shared parent invoices and legacy paid flags remain visibly reviewable rather than being
counted as exact evidence.

An imported bank transaction has three explicit audited allocation targets. Invoice allocations
create ordinary `payments` linked to immutable invoice IDs. Direct lesson allocations create
`payments.kind = direct_lesson`, link one payment to one immutable lesson ID and mark that lesson
`billingStatus = paid_directly`; no synthetic invoice is created. Any residual or wholly unallocated
amount creates a `payerCredits` balance owned by an exact `studentId`. A student-owned credit may
later be applied transactionally to either an invoice or one or more billable lessons. The lesson
register verifies the direct payment ID, amount and source before accepting it as exact evidence.

Correcting a direct lesson payment never deletes history. The payment becomes voided, the lesson
returns to `unbilled`, the value returns to the same student credit, and the bank/application
aggregates are updated in the same transaction. Firestore rules prevent browser clients from
editing direct-payment pointers, amounts or source-credit fields. Existing legacy payer credits
without a stable `studentId` remain usable for invoice allocation but are not guessed onto a
student or silently applied to lessons.

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

#### Student price terms (2026-10-29)

A student's price lives only in `studentRevenuePlans/{studentId}` (admin writes, finance reads): `lessonPriceCents` +
`lessonMinutes` for the card's main subject and `subjectPrices` for further subjects. Monthly and per-lesson invoices
keep reading exactly these fields; nothing on the server changed. The student card's „Arveldus” (Finantsid tab) sets
them through a switch: „Üldtingimused” prices every subject at `STANDARD_HOURLY_RATE_CENTS` (2500 = 25 € / 60 min,
`crm-v2/src/features/finance/priceTerms.js`, the one place to change it) by its own lesson length; „Soodustus” is one of
`DISCOUNT_HOURLY_RATES_CENTS` (20 / 15 / 12 €/h) or „Muu” (an own rate the admin types, > 0 and < 25 €/h), always with a
required `discountReason` (≤ 300 characters). A further subject picks from the same list plus „sama kui kaardil” and
„Üldtingimused 25 €/h” (the card's own subject gets the 25 €/h choice too when the card has further subjects), so one
subject can stay at 25 while another is discounted. A stored price that is none of the school's rates is shown as „Muu”
prefilled with its rate and kept to the cent (even ≥ 25 €/h) until the admin edits it or the lesson length. The plan
stores `priceTerms`, `hourlyRateCents`, `discountReason` and `priceTermsChangedAt/By/ByUid`; firestore.rules check them
(discount needs a non-blank reason, general carries none). A plan without `priceTerms` is shown by its price only
(all at the standard rate → general, otherwise a discount with an empty reason) and is never re-priced: an untouched
rate keeps its stored per-lesson cents. `activityLog` (readable by all staff) gets the terms, not the reason. The
Finantsid forecast form still edits the lesson price directly and leaves the terms as they are.

#### Billing per subject (2026-11-06)

On a card with several subjects every subject may have its own billing mode, lessons per week and no-show rule:
`studentRevenuePlans.subjectBilling = { "<subject>": { billingMode?, weeklyLessons?, chargeNoShow? } }` (≤ 8 subjects,
firestore.rules: a map; the finance role cannot write it). A field that is absent is the card's own value; the card's
main subject (`mainSubject`, the card's price subject) always bills by the card's `billingMode` / `weeklyLessons` /
`chargeNoShow`, and its tab on the student card edits exactly those. A plan without `subjectBilling` bills exactly as
before (golden test `crm-v2/src/features/finance/monthlyBilling.golden.test.js` on fixtures run through the code before
the change). Prices stay in `subjectPrices`; price terms and `validFrom` stay card-wide.

One resolver, two copies kept equal: `functions/subject-billing-core.js` (server) and
`crm-v2/src/features/finance/subjectBilling.js` (browser); `functions/subject-billing-core.test.js` imports the browser
file and compares every function on the same cases. `subjectBilling(plan, subject, main)` → the effective values plus
`own` flags; `cardMonthlyMode(plan, subjects, main)` → the monthly row's mode, `monthlySubjects`, `packageSubjects` and
`mixedTiming`; `weeklyForecastCents(plan)` → card price × card weekly + each further subject with its OWN weekly × its
price (a subject without its own number counts inside the card's number, as before).

Who reads it: monthly invoice rows (`monthlyBilling.js`: package subjects get no line, the no-show rule per subject in
the correction, lessons left per subject), the student card „Alles” balances and Täna „Makstud tunnid lõppevad”
(`studentLessonBalances`), the revenue forecast (Finantsid `revenueForecast`, server `financial-analytics-core`), the
calendar revenue in Ülevaade / Ärinäitajad (`financeDashboard.noShowCharged`), the server's monthly invoice routes
(`combined-invoice-core monthlyBillingBlocker`: a package subject, or „Pärast toimunud tunde” next to a subject billed
ahead, is refused with 400 — only for plans with `subjectBilling`) and the lesson-package trigger
(`syncLessonPackageConsumption`: with `subjectBilling`, the lesson's subject decides the no-show rule and a subject
billed monthly takes no package credit, also not from an old shared package). „Pärast toimunud tunde” (held lessons
of the month, due the next month) and „Kuu ette” / „Jooksev kuu” (the month ahead) cannot share one monthly invoice:
the card form refuses that combination and the monthly row shows „Arveldusviisid ei sobi”; packages combine with any.
A card merge brings the other card's billing as `subjectBilling[its subject]` when it differs from the kept card's.

### Staff operations

Teacher-facing navigation is task-oriented. `haldus.html` is the daily start surface and keeps the common
destinations together: `Minu tööpäev`, `Tunniplaan`, `Minu õpilased` and `Õppevara`, with `Valmista tund`
alongside them. Administrative and lower-frequency tools remain available in a collapsible section. These
destinations are views over existing data and do not introduce another data store or permission path.

`Ülesanded` reuses the existing `tasks` collection as a lightweight team workspace. Its list and board are
two projections of the same records; the board adds the backwards-compatible `in_progress` status between
legacy `open` and `done`. The detail drawer updates task fields with merge writes and keeps replies on the
existing bounded reply array, so no migration or parallel task store is introduced.

The unified notification centre is another read-only projection rather than a notification database. It combines
the signed-in user's unread messages, unseen worksheet results, overdue scoped tasks and invoices, plus administrator
parent-link and operational alerts. Opening an item routes to its source record or workflow; resolving that source
removes the notification. This keeps permissions and acknowledgement semantics owned by the original collection.

CRM v2 (`crm-v2/src/features/tasks`, `components/layout/NotificationCenter.jsx`) uses the same `tasks` records and
the same projection idea. It adds two optional fields that v1 ignores: `assignedToUid` (a hint; the canonical
`assignedTo` name stays authoritative because v1 reassigns by name) and `openedByUids` (who has opened the task;
drives "Uus ülesanne sulle" for tasks created in the last 14 days). The v2 bell derives task (new for me, new reply,
overdue, due today), unread message, homework-awaiting-review and overdue-invoice items from their sources.

„Õpetajate koormus” (`/teachers/koormus`, administrator only, 2026-11-04) is a read-only projection per teacher for a
week or a month: lessons from `lessonFacts` (calendar + journal), unmarked lessons from `findUnmarkedLessons`, unbooked
free time from `teacherAvailability` (`effectiveSlots`, next 14 days), works waiting for a review (Kodutööd's rule) and
a pay estimate by the „Ärinäitajad” rule (`workHourlyRateCents` × lessons given; no rate → „määramata”). It writes
nothing and adds no collection; the journal and submissions are read by single-field date ranges
(`features/teachers/teacherLoad.js`, `services/firebase/teacherLoad.js`).

Single-student scheduled lessons use the existing server-owned lesson journal endpoint for one-click completion.
The optional completion payload extends the same idempotent transaction: it records schedule attendance, creates a
stable lesson-derived homework record, advances `students.curriculumPlan`, and optionally creates a linked follow-up
task. The lesson, attendance, homework, plan pointer and follow-up therefore either commit together or not at all;
package-ledger synchronization remains the existing post-transaction audited workflow.

The authenticated CRM shell is also the teacher-facing visual workspace. Primary daily and authoring
destinations render in its centre surface while the navigation rail, section header and signed-in profile
remain visible. Independent same-origin teaching applications render as embedded surfaces inside that
shell. Embedded mode removes their duplicate header. Child tools can request another same-origin workspace
through a parent message, so curriculum → worksheet and library → worksheet transitions stay in the centre
surface instead of opening browser tabs. The shell rejects cross-origin workspace requests. This migration
boundary does not change Firebase authentication, authorization or persistence. Curriculum preparation
keeps the complete query, including the stable `curriculumLessonKey`.

Inside `haldus-exercises/`, `Õppekavad` is the primary Õppevara landing tab and `Raamatukogu` is the second
primary tab. An explicit `?tab=library` deep link remains valid. Subject → level → topic navigation and
worksheet previews stay inside the same authenticated surface and reuse `CurriculumView`, `TopicView` and
`WorksheetPreviewModal`; this is a presentation/navigation contract only and adds no new persistence model.

The C1 course extends this same contract without a parallel curriculum or worksheet system. Its source-derived
manifest and ten module shards live under `data/keelesepp-c1-curriculum*.json`; the authenticated idempotent
installer writes the 100 stable lesson IDs to the existing `curriculumLessons` collection. `theme`, `grammar`
and `assessment` remain visible lesson metadata, and each lesson retains its own DOCX prompt. `Kasuta prompti`
passes that prompt through the existing `ws_prefill` boundary into `/haldus-worksheet/`. See
`docs/C1_CURRICULUM_240.md`.

The student's manually selected curriculum position reuses `students.curriculumPlan`. A one-based number
is resolved to an existing stable curriculum item and stored through the existing plan contract. It sets
the current planned lesson and does not invent completion records for earlier lessons.

The student profile is the staff-facing 360-degree projection over existing records. Its attention summary
derives unpaid invoice balance, pending homework, unread messages, low package balance and missing curriculum
planning in the browser; quick navigation links to the existing learning, worksheet, message, lesson and finance
sections. It does not introduce a student summary collection or copy financial and learning history.

### Student identity and lifecycle

CRM v2 treats a displayed child as a person projection over one or more legacy `students` documents. Stable
`personId` is preferred; parent account, parent email or parent name plus the child's normalized name are migration
fallbacks. Separate subject-teacher combinations are enrollments, not new people. Adding or editing an enrollment
updates the existing student document and never creates another student card. The administrator edits enrollments from the list „Õpilased” and from the student card („Õppesuunad”,
`EnrollmentManager.jsx`); „Lisa õpilane” warns about a card with the same name (`similarStudents.js`) before a new card is made.

Archive and restore apply atomically to every physical student document represented by the person projection. They
only change lifecycle metadata (`active`, `archivedAt` or `restoredAt`) and preserve document IDs, enrollments and all
historical references. Parent and student cabinets exclude inactive and converted records. Administrators may link
or reassign an existing student from the parent directory; that workflow updates the existing records and does not
create a replacement identity.

Possible duplicates (2026-10-24, extended 2026-11-04) are listed for the administrator in Õpilased → „Võimalikud
topeltkaardid” (`features/students/duplicateCandidates.js`, `DuplicateCandidatesModal.jsx`): the same name after
Cyrillic → Latin transliteration and spelling variants (`personName`: Mariia = Maria, Jekaterina = Ekaterina =
Katerina, double letters, й/i; level / subject tags like „B2”, „En” in the name are taken out and kept as a hint), or
the same first name (surnames not different) plus the same parent (account, e-mail, phone, name) or the same learner
account / e-mail / phone. Same first name + different surnames, a shared surname or a shared parent alone (siblings)
is not a pair. Same teacher, same level tag and „one card self-registered, the other without an account” only raise
the score; different subjects are reported as „Sama inimene, eri ained” (one card per person, subjects are
enrollments). Cards are compared only inside blocks (canonical name, first-name stem, account, e-mail, phone, parent
account / e-mail / phone). The list shows both cards side by side (created, archived, account, subjects / teachers,
lesson and invoice counts via `studentsService.recordCounts` count queries, masked contacts). „Pole sama inimene”
stores `students.notDuplicateOf` on both cards. „Ava ühendamine” opens „Liida kaardid” with the pair preselected.

„Liida kaardid” (`MergeCardsModal.jsx` → `staffOperationsApi /students/merge-cards` → `functions/student-merge.js`,
rules in `functions/student-card-merge-core.js`; admin only) is the one merge. The administrator picks the other card,
which card stays and which name; the server preview lists what moves per kind (learner / schedule / finance), the
per-card documents, the price, the subjects, the parents and the conflicts (two names, two parents, two prices or
teachers for one subject, two student accounts, a document both cards have). Apply needs `confirmed: true`. Then:
every root collection is searched for `studentId`, `studentIds[]` and `students[]` (groups, with `studentLessonMap`);
records move to the kept card (lessons and schedule get the other card's subject when they have none and the kept
name in `studentName`; finance records change only the card id — never an amount, number or the issued name);
`studentRevenuePlans`, `studentAvailability`, `studentInitialAssessments`, `taxIdentities`, `whiteboards` (with
subcollections) are copied when the kept card has none, else the kept one stays; the other card's price becomes
`subjectPrices[its subject]` when the kept plan has no price for that subject (same subject, other price = conflict,
nothing changes) and its billing mode / weekly lessons / no-show rule `subjectBilling[its subject]` when they differ; accounts listing the old id (`users.linkedStudentIds`) get the kept id; learner and parent accounts
and parent contacts are united; enrollments and `teacherUids` are united; empty profile fields are filled, notes
joined. History (`activityLog`, `financialAudit`, …) keeps the old id. The old card is never deleted: it stays
`active: false`, `mergedInto` + `mergedIntoStudentId`, without account links, as a tombstone; the old per-card
documents are marked `mergedInto` too. `studentCardMerges/{oldCardId}` records the run (idempotent: a repeat returns
the stored result; a failed run continues where it stopped); `activityLog/student-card-merge-{oldCardId}` is the
audit entry. The older `/students/merge` with `permanent` and `/students/merged/purge` answer 410 (no deletes).
Archived cards merge in every direction (archived source, archived kept card, two archived cards; 2026-11-03 /
2026-11-06). A card in the „Prügikast” (`deletedAt` / `purgedAt`) is refused with 409 „… on prügikastis. Taasta see
enne liitmist” — its purge would anonymise the merged history. The dialog's search finds archived cards by name, an
earlier name (`nameAliases`), e-mail, phone or parent (`duplicateCandidates.js matchesMergeSearch`); „Võimalikud
topeltkaardid” also proposes two archived cards (after the pairs with an active card).

Guard and undo (2026-11-09, after two different girls named Stefania were merged). The preview returns
`differentPerson: [{ code, label }]` (`student-card-merge-core.js differentPersonSignals`): `surname` (both cards
have one, same alphabet, no shared surname incl. `nameAliases`), `grade` (`grade` field / „N. klass” track levels with
nothing in common), `parent` (parent uids, e-mails or names both present and disjoint), `subject_teacher` (both cards
name subjects; no shared subject and no shared teacher), `birth_year` (`birthYear` / `birthDate` / `dateOfBirth` /
isikukood). The dialog shows them in a red block and needs a second tick „Kinnitan, et see on sama laps”; the server
refuses apply with 409 `code: different_person` unless `confirmedDifferences: true`. A moved lesson keeps its own
subject; one without gets the other card's subject (`sourceLessonSubject`, also for archived / multi-subject cards).
Every moved record writes `{ path, anchor, after, before, absent }` (or `{ kind: 'ids', hadKeep }` for `studentIds`)
into `studentCardMerges/{oldId}/undo/*` in the same batch as the move (`runId`); the final transaction stores
`undo: { version: 1, runId, cards: [kept, old], docs (per-card document marks, the added subject price), users
[{ uid, hadKeep, hadSource }], copies }` on the operation and `mergeUndoVersion: 1` on the tombstone.
„Võta ühendamine tagasi” (`MergeHistoryCard.jsx` on both cards → `/students/unmerge-cards` → `unmergeStudentCards`,
admin only, preview then `confirmed: true`) restores each field only while it still holds the merge's value
(`revertFields`; writes with a `lastUpdateTime` precondition); a field changed since is left and listed; documents
copied to the kept card stay (listed for a manual check); records created on the kept card after the merge stay.
Nothing is deleted. Then `studentCardMerges.status = 'unmerged'`, `activityLog/student-card-unmerge-{oldId}-{runId}`.
Merges without the record answer 409 `code: legacy` („Vana ühendamine — tagasi võtmiseks pöördu administraatori
poole”); the button is shown disabled with that hint.

Parents (2026-10-24): a child may have several parent accounts (`linkedParentIds`; `linkedParentId` / `parentUid` is
the main one) and parents without an account (`parentContacts: [{ name, email, phone }]`, plus the old
`parentName` / `parentEmail`). The student card „Lapsevanemad” (`StudentParentsCard.jsx`, admin) links an existing
parent account, adds a contact or removes a link (`parentsService.linkStudent` / `unlinkStudent` / `addContact` /
`removeContact`, admin client writes the rules already allow). Linking adds, never replaces. A contact's e-mail
links the child when that parent registers (`account-bootstrap-core.js parentEmails`). Rules unchanged.

Archived children (2026-11-06): a parent can be linked to an archived card everywhere — Lapsevanemad „Lisa laps”,
„Lisa lapsevanem” (`ParentInviteDialog`), the student card „Seo lapsevanem”, `/accounts/invite-parent` and
`/accounts/link` (relationship `parent`). Pickers use `features/parents/childPicker.js`: active cards, then an
„Arhiveeritud” section, one search over name, e-mail, phone and parent; trashed (`deletedAt` / `purgedAt`), merged-away
and converted cards are never offered. Choosing an archived card asks „Taasta ja seo” (card `active: true`,
`restoredAt`, in the same batch / after the invite) or „Seo arhiveerituna”. Server: `parent-invite-core.js
linkCardRefusal` — parent accepts archived, refuses trash / merged (409); a student's own login still needs an active
card. The parent's „Minu pere” still lists only active cards (`students.listOwned`).

Parent cabinet „Minu pere” (`/parent`, `features/parents/ParentDashboardPage.jsx`, 2026-11-04): child chips (name +
level → target), then per child „Areng” = one „Keeleoskus” curve toward the target level (`features/progress-points/`:
`ProficiencyCard.jsx`, `ProficiencyChart.jsx` inline SVG with a table fallback; formula `levelCurve.js`, documented in
`docs/PROGRESS_ESTIMATE.md` „Keeleoskus”) and „Mida õpime praegu” (`NowLearningCard.jsx`), beside them „Järgmised
tunnid”, „Kodutööd”, the teacher's latest feedback, „Arved” (unpaid sum only) and „Kirjuta õpetajale”. The curve is
computed in the browser from the child's `worksheetAssignments` (score.perGoal) and the course goal list in the code
(`worksheet-generator/admin/course/<level>/lessonGoals.js`, loaded on demand), anchored by `progressPoints`.
`progressPoints/{id}` { studentId, date, level, percent 0–100, kind estimate | exam | teacher, label, createdBy,
createdByName, createdAt, updatedAt }: written only by an admin or the student's teacher (a teacher changes / deletes
his own), read by them, the student and linked parents (firestore.rules; emulator test
`functions/progress-points-emulator.integration.js`). Staff add points on the student card („Keeleoskus tasemele”,
`ProgressPointsCard.jsx`: start „Algus”, corrections, mock exams; admin warning when an exam is > 15 points from the
curve); the admin's „Teekond sihttasemeni” has „Salvesta punkt” (kind estimate). A mock exam never moves the curve.
Never shown to parents: lesson balance / package lessons left, lesson analysis, teacher notes, call notes, monologue
notes / analysis, the skill-estimate card, per-goal percentages. Demo page for screenshots (dev only, fake data):
`crm-v2/parent-lab.html` (`?family=two|empty`, `?view=staff`) + `src/test/parentLab/`.

Study directions (2026-10-24): `studyDirections/{id}` `{ name, shortLabel, color, levels[], aliases[], status:
active|archived, order }` — admin writes (validated keys, no delete), staff and finance read. Seaded → „Õppesuunad”
(`features/settings/StudyDirectionsCard.jsx`). Until saved, the built-in list (`studyDirections.js
DEFAULT_DIRECTIONS`) is used. Every subject choice uses `SubjectSelect.jsx` (student form, „Õppesuunad”, new child of
a parent, group); a card's value the list does not know stays selectable; aliases map old spellings
(`canonicalSubject`). A track has `status: 'paused' | 'ended'` (ended = `active: false`, the teacher loses access).
The student card „Õppesuunad” (`StudentDirectionsCard.jsx`, `studentDirectionsModel.js`) shows per track the
teacher, level, price (finance roles) and „Käib” (lessons in the next 8 weeks) / „Tunde pole plaanis” / „Paus” /
„Lõpetanud”, derived from the schedule, never stored. Calendar and Õppevara subject tabs are unchanged (the
calendar picks a track of the card; Õppevara's tabs come from the material's level labels).

The existing Lesson Builder is the canonical authoring surface. Worksheet visual blocks will converge into
it through the Normalized Activity Contract. A future A4 canvas stores presentation-only grid placement on
the same immutable activity IDs and produces teacher, student and print projections rather than a separate
lesson schema. See `docs/UNIFIED_VISUAL_WORKSPACE.md`.

Account approval in `staffOperationsApi` commits the profile, bootstraps linked
student cards and writes the audit record, then sends the approval e-mail before answering (work after an HTTP
response is not guaranteed on Cloud Functions). The e-mail is capped at 30 s (`APPROVAL_MAIL_LIMIT_MS`) and the
function timeout is 120 s, so a slow SMTP server can no longer break the response. `mailed: false` means the e-mail
was not confirmed (failed or timed out), never that the approval failed; `mailPending` stays `false` (kept for
compatibility). Delivery failures are logged and stored by the existing emailQueue delivery path.
SMTP connection/greeting/socket timeouts are 10/10/20 seconds. On a lost approval response, CRM v2 rereads the
authoritative user profile and reports success with an e-mail warning only when approvalStatus is explicitly approved.

`functions/staff-operations-core.js` owns deterministic work-duration, hourly-rate, payroll and
operational-alert calculations. `staffOperationsApi` is the only writer for work sessions:
one server-side pointer per staff member prevents concurrent open shifts, while every transition
also creates a `workTimeAudit` snapshot. Closed shifts are pending until an administrator
approves them; approval snapshots the hourly rate and calculated pay so later rate changes do not
rewrite prior payroll.

Teacher payouts (owner 2026-11-09): `/finance/payroll` shows one figure per teacher-month, „Väljamaksmisele” =
the approved session pay above; lessons given × the same `workHourlyRateCents` (`teachers/teacherLoad.js`) is shown
next to it as a check (gap ≥ 5 € flagged). „Märgi makstuks” writes `teacherPayouts/{YYYY-MM}_{teacherUid}` from the
browser (admin only; bookkeeper reads; never deleted; undo = status `cancelled`; append-only `history`) plus an
`activityLog` line without the amount. A mark records a payment made elsewhere; it moves no money.

Activity-log time is deliberately a capped estimate and remains separate from approved payroll.
The scheduled `refreshSchoolAssistant` function derives owner-only alerts from invoices, tasks,
work sessions and sanitized Google Calendar status. It runs without an external AI provider, so
school and payroll records remain inside the Firebase project.

### Card trash — „Prügikast” for student and teacher cards (2026-11-03)

Administrator request (Oleksiy 2026-11-03): an administrator deletes student and teacher cards; a deleted card waits a
week in a trash, then it is deleted for good. Code: `functions/card-trash-core.js` (rules, unit-tested),
`functions/card-trash.js` (Firestore), `staffOperationsApi /cards/trash | /cards/restore | /cards/purge-due` (admin
only), scheduled `purgeCardTrash` (daily 03:40 Europe/Tallinn); CRM: „Kustuta” on the student card and the teacher card
(`features/trash/CardTrashDialog.jsx`; the right-click menu opens the same window with `?kustuta=1`), page Inimesed →
„Prügikast” (`/trash`, `features/trash/TrashPage.jsx`, `services/firebase/cardTrash.js`).

0. **Preview (2026-11-06).** The „Kustuta” window first calls `/cards/trash-preview` (reads only,
   `card-trash.js previewTrash` → `card-trash-core.js trashPreview`): the blockers, the lessons / series ahead (date or
   weekday, time, student or teacher, subject — what to reassign) and the active groups, the linked records per
   collection (finance first; audit collections never listed) and the outcome `delete | anonymise | blocked`.
   „Vii prügikasti” is disabled while blocked; the server checks again on the real call.
1. **Kustuta (trash).** Refused while the card has lessons ahead (a planned single lesson from today on, or a recurring
   series without a past end date — `schedule-clear-core.js futureRecordInScope`) or an active group: the administrator
   cancels or reassigns them first. A student card with an unpaid invoice (`invoiceOpenCents` > 0: not „Tühistatud” /
   „Makstud”, open balance from `balanceDueCents` or amount − paid) is refused too, „Kaardil on tasumata arveid … —
   arhiveeri kaart” (2026-11-06); paid / cancelled invoices do not block (the card is anonymised at the purge). Blocking rather than cancelling was chosen because cancelling sends e-mails, changes
   Google Calendar and package balances — not something a delete should do silently. A teacher card: role `teacher`
   only (an administrator account is changed to teacher first), never the own account. The card gets `deletedAt`,
   `deletedBy {uid, name}`, `purgeAfter` (= deletedAt + 7 days, ISO strings) and `trashState` (the previous `active` of
   a student / `disabled` of a teacher). A student card gets `active: false` (so every active list, the learner and
   parent cabinets, invoicing and e-mails leave it out); a teacher profile gets `disabled: true` (the rules treat a
   disabled profile as signed out). Nothing else on the card changes. An audit entry `activityLog/card-trash-…` is written.
2. **Hidden everywhere.** `studentsService` (`matchesStudentFilters`, `listSelf`, `listOwned`) and `teachersService.list`
   leave out every card with `deletedAt` or `purgedAt` — archive lists, search, calendar, finance and group pickers
   included (`{ includeDeleted: true }` for history views). The card itself still opens by its link and shows
   „Kaart on prügikastis — kustutatakse lõplikult <date>” with „Taasta”. Payroll still shows a deleted teacher's work
   (it adds staff from the work sessions).
3. **Taasta (restore)** within the week: the previous `active` / `disabled` comes back and the trash fields are removed;
   audit `activityLog/card-restore-…`.
4. **Purge after 7 days** (`purgeCardTrash`, or „/cards/purge-due” by an administrator — same rules). Per card:
   - **block** — lessons ahead, an active group or an unpaid invoice (`open-invoices`) appeared during the week:
     nothing changes, `purgeBlocked` is set and
     the card stays in the trash (shown there);
   - **delete** — no record outside the audit collections refers to the card: the card document is deleted with its
     disposable per-card documents (student: `studentAvailability`, `studentRevenuePlans`; teacher: `teacherAvailability`);
   - **anonymise** — anything refers to it (invoices, payments, accounting, packages, held or cancelled lessons,
     schedule, homework, worksheet results, recordings, messages, groups, tax data, first assessment, board, work
     sessions / pay, a student card assigned to the teacher, a tombstone merged into the card …): the id and all those
     records stay unchanged; the card keeps only non-personal fields (`KEEP_FIELDS`: subject, level, teacher ids,
     enrollments, skill map, plans, `personId`, lifecycle), its name becomes „Kustutatud õpilane #abc123” /
     „Kustutatud õpetaja #abc123”, contacts and account links are cleared, `purgedAt` and `anonymised: true` are set.
     Issued invoices and other history keep the name they were made with (financial meaning is never rewritten).
   References are found like the card merge does: every root collection is queried for `studentId`, `studentIds[]`,
   `students[]`, `mergedInto` (student) or `teacherUid`, `teacherUids[]`, `staffUid`, `assignedBy`, `createdByUid`,
   `teacher` / `teacherFull` = the display name (teacher). Audit collections (`activityLog`, `financialAudit`,
   `emailQueue`, `emailLog`, merge records, …) never count and keep the old id. Audit entry `activityLog/card-purge-…`
   (decision, reference counts, no name).
5. **Accounts.** Firebase Auth users are never deleted or changed. At purge a learner's / parent's `users` document
   loses the card id from `linkedStudentIds`; a teacher's profile stays `disabled` (deleted outright when nothing refers
   to it — the Auth user could then register again and wait for approval like a new account).
6. **Rules.** Admin writes the trash fields (`changesCardTrash()` in `firestore.rules`): a teacher cannot set or clear
   them and cannot change a card that has `deletedAt`; a user cannot set them on the own profile (`safeSelfUserFields`).
   Tests: `functions/card-trash-core.test.js`, `functions/card-trash-emulator.integration.js`,
   `crm-v2/src/features/trash/TrashPage.test.jsx`.

### „Teated” — announcements that gate the learner portal (2026-10-24)

The administrator writes announcements in Suhtlus → Teated (`/messages/teated`,
`crm-v2/src/features/announcements/`). A student or parent account (not staff, not the administrator's read-only
user preview) sees every active, not yet answered announcement addressed to it full screen right after login, oldest
first, before the CRM shell renders (`AnnouncementGate` in `AppShell`); logout stays possible. If the server cannot
be reached within 8 s, the CRM opens as usual — an announcement never locks anyone out.

- `announcements/{id}` — `title`, `body` (plain text; only http(s) addresses become links, never HTML), `audience`
  (`students` | `parents` | `both`), optional `subjects`, `levels` (both on one active enrollment) and `studentIds`,
  `activeFrom` / `activeTo` (Tallinn days), `responseType` (`read` | `question` | `availability`), `question`
  (`mode` text | single | multiple, `options`, `allowOther`), `allowChange`, `status` (draft | published | archived),
  `publishedAt`. Firestore rules: administrator only (validated shape, never deleted — archived).
- `announcementResponses/{announcementId}__{targetKey}` — written only by the server; administrator reads. Target
  keys: `u_<uid>` (a student, once), `p_<uid>` (a parent's „Loetud”, once for all children), `c_<studentId>`
  (a parent's question / suitable times per child; either parent answers for the child). A second answer is refused
  (409) unless `allowChange`; then the previous answers stay in `history`.
- Learners never read these collections: `staffOperationsApi` `POST /announcements/mine` returns only the caller's
  announcements without the audience lists, `POST /announcements/respond` matches the audience again, validates the
  answer and writes once in a transaction; for „Sobivad ajad” the gate first saves `studentAvailability/{studentId}`
  (existing rules) and the server requires times saved after `publishedAt`, keeping a snapshot. `POST
  /announcements/report` (administrator) lists every account that must answer with its answer (CSV export in the
  browser). Pure rules: `functions/announcements-core.js`; loading / writing: `functions/announcements-service.js`.

### „Puuduvad andmed” — missing card data after login (2026-10-25)

Right after „Teated” (the `MissingDataGate` is a child of `AnnouncementGate` in `AppShell`, so it mounts only after
the last announcement is answered) a student or parent account fills what is missing on its OWN cards
(`crm-v2/src/features/missing-data/`). The form opens only when a REQUIRED item is missing; optional missing items are
shown in the same form. Logout stays possible; if the server cannot be reached within 8 s the CRM opens (fail-open),
and a failed save offers „Jätka praegu ilma”. Not shown to staff or in the administrator's read-only preview. Cards
with no student / parent account never see it — the administrator's list shows them (copy the /ajad link or call).

- Items (`functions/missing-data-core.js` `ITEMS`): `availability` (`studentAvailability/{id}` has no slots),
  `email` and `phone` (an adult's own `email` / `phone`; a child's parent: `parentEmail` / `parentPhone`, the
  `parentContacts` list or a linked parent account's profile), `parentName` (child only), `language`
  (`preferredLanguage` 'et' | 'ru' | 'en' — on the student card, and for parents on their `users/{uid}` profile; a
  child counts as known when the card or a linked parent's profile has it), `grade` (child or unknown age: `grade`
  „N. klass” 1–12 or `birthYear`; „Täiskasvanu” marks an adult).
- Kind of a card: `grade` „Täiskasvanu” / `birthYear` ≥ 18 years ago / `adult: true` → adult; a class, a younger
  birth year, a parent account link or a parent contact → child; otherwise unknown: the form asks the class first
  (with „Täiskasvanu”) and then the adult or the child questions.
- A parent answers per child (times, class, …) and ONCE for themself: own phone (children's parent phone) and own
  language go to the parent's `users/{uid}` profile (`phone`, `preferredLanguage`).
- `missingDataSettings/current` — `{ items: { <item>: 'required' | 'optional' | 'off' } }`; default availability,
  email, language, grade required, phone and parentName optional. Rules: administrator read / write, fixed keys and
  values. Seaded → „Puuduvad andmed” (`MissingDataSettingsCard`).
- Server: `staffOperationsApi` `POST /missing-data/mine` (the caller's questions; cards found as for „Teated” —
  `announcements-service.callerContext`), `POST /missing-data/save` (403 for a card that is not the caller's; values
  validated — e-mail, Estonian `+372…` or international phone, class 1–12 or birth year, language; required ones
  enforced, 400 with per-field `details`), `POST /missing-data/report` (administrator). The save writes ONLY the
  missing fields (`CARD_FIELDS`: email, phone, parentName, parentEmail, parentPhone, grade, birthYear,
  preferredLanguage; profile: phone, preferredLanguage) and only while they are still empty (re-read in the
  transaction), `studentAvailability/{id}` only when it has no slots (same shape as the client writes, so the
  „muutis sobivaid aegu” bell works), plus `missingDataSubmissions/{auto}` — the audit: `byUid`, `byName`, `byRole`,
  `at`, `studentIds`, `changes[{ target, id, field, before, after }]`, `reviewedAt`. Rules: administrator read and
  may only set `reviewedAt` / `reviewedByUid` / `reviewedByName`; nobody creates or deletes from the browser.
- Administrator: Õpilased → „Puuduvad andmed” (`MissingDataPanel`; `?puuduvad=1`, `&taidetud=<id>`): per active card
  the missing items (required orange, optional grey), kind, teacher, account (student / parent / both / none) and
  „küsitakse sisselogimisel”; filters by item, account and name; „Ava kaart”, „Kopeeri /ajad link” for cards without
  an account; „Uued täitmised” with before → after and „Vaadatud”. The bell shows „<name> täitis puuduvad andmed”
  (category Õpilased) until marked seen. Read-only counts: `functions/tools/missing-data-counts.js`.

### E-mails to students and parents (2026-10-25)

Seven notification types (lesson reminder the day before, lesson moved, lesson cancelled, new schedule from the
planner, homework due tomorrow, work checked, „Teated”) — all off until the administrator switches them on in Seaded →
E-kirjad (`emailSettings/learner`). Triggers only queue deterministic jobs in the server-only `learnerEmailJobs`; the
5-minute `learnerEmailsTick` creates the daily jobs and sends at most 40 messages a tick through `deliverEmail`. Lesson
changes are e-mailed only when staff changed `schedule` (learners can only ask) and only after a 10-minute settle window
(the calendar's undo sends nothing). Every e-mail links to the public `/e-kirjad/<token>` page (HMAC-signed address,
no login) for opt-out and language; `emailLog` keeps counts without addresses. Contract for the planner
(`plannerBatchId`) and all details: `docs/EMAIL_NOTIFICATIONS.md`.

### Calendar

`calendar-core.js` owns migration-safe schedule calculations:

- 15-minute time slots and lesson end times;
- dated and legacy weekly-recurring occurrence rules;
- teacher and student overlap detection with non-blocking save warnings;
- Monday-first month grids;
- proportional day-timeline layout for simultaneous lessons;
- versioned payloads with stable `studentId` ownership.

The CRM renders month, week and day projections from the same schedule records. Existing records
without `scheduleVersion` remain valid. New browser-created records use `scheduleVersion: 2` and
keep their source (`keelesepp` or `gcal`) explicit. Per-occurrence child records use
`scheduleVersion: 3` and preserve their parent series reference.

Teacher-scoped student reads accept both the primary immutable `teacherUid` and membership in the
additive `teacherUids` array used by active enrolments. Client queries must carry one of those exact
UID constraints; an unscoped teacher collection read remains denied.

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

Inbound deletion reconciliation uses Google's explicit cancellation tombstones and the same
seven-day lookback as the tombstone query, so a recently elapsed imported lesson deleted in Google
after its time disappears from KeeleSepp. A schedule with a recorded result (Toimunud/Puudus status,
`lessonEntryId`, `attendance` or an `occurrenceStatuses` entry) is never removed by that reconcile.

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

Group lessons are stored inside `groups/{groupId}.lessons[]`. The `syncGroupToGoogleCalendar`
trigger, the hourly job and a manual sync push each one as a private event with origin
`keelesepp-group` into the group teacher's primary calendar (teacher can switch this off:
`calendarConnections.syncGroups`). Server-only `calendarGroupEventLinks/{groupId}__{lessonId}`
records the Google event and its owner calendar, so the group document is never written back and a
group handed to another teacher is removed from the previous calendar. The import skips these
events; attendance changes do not start a push.

CRM v2 connects through `/gcal/auth-url?returnTo=` (allowed CRM origins only); the callback returns
to that page with `?gcal=connected|error`, else to v1 (`APP_BASE_URL`). v2 uses a light sync
(`force: false`: only changed or failed lessons are pushed) from Seaded and when the calendar opens
more than 15 minutes after the last sync. Lessons imported from Google stay Google-owned: v2 does not
move or cancel them.

The current two-way slice still uses last-synchronized-write-wins. Explicit conflict review,
Google eTag preconditions and incremental sync tokens remain separate releases.

### Groups (Grupid) — what follows an edit (2026-11-06)

`groups/{id}` holds name, teacher (`teacher`, `teacherUid`, `teacherHistory`), subject, level, `audience`,
`capacity`, `ageFrom`/`ageTo`, `students[]`, `studentLessonMap` and the weekly `lessons[]` (day, time, `duration`,
`startDate`, attendance). Groups have no room / online flag and no price of their own: billing reads the
attendance `lessons` docs (`group_<g>_<l>_<date>_<student>`) like any other lesson, and the group lesson's `duration`
goes into each of them exactly like a 1:1 lesson's.
Create and edit use one form and one check (`features/groups/groupForm.js groupFormError`; the service checks name and
ages again). What an edit changes:

- **Name** → the members' cards whose `group` is the old name (or empty); marked lessons keep the old name.
- **Teacher** (from a chosen date) → `teacherHistory` gets the old teacher until the day before; calendar, attendance,
  reports and Google Calendar (`syncGroupToGoogleCalendar`) follow the teacher of each date. Group lessons have no
  `schedule` docs, so nothing else is rewritten; already marked `lessons` docs keep their teacher. Live group rooms
  (`liveGroupRooms`) are ad-hoc rooms of the teacher who opens them, not linked to `groups`, so nothing there changes.
  Members' cards are not given to the new teacher (`teacherUids` unchanged), same as when a member is added.
- **Lesson length** → `patchLesson { duration }`: every unmarked lesson of that weekly time; marked ones keep theirs.
  The form offers 45 / 60 / 90 / 120 min and „Muu pikkus” (5–480).
- **Archived students** may join a group: „Halda” lists them under their own „Arhiveeritud” header (one search over
  name, e-mail, phone, parent, level for both lists); ticking one asks „Õpilane on arhiveeritud — kas taastada
  aktiivseks?” → „Lisa ja taasta kaart” or „Lisa, kaart jääb arhiivi”. A failed archive read is shown, not hidden.
- Participation: the group window has „Kinnita osalemine” per member (card `groupInterest.status = interested`); the
  lesson attendance („Kohal / Puudub / Teatas”) is marked in the calendar lesson panel.
- Pages that reload after a save keep their data on screen (`if (!state.data)` shows the loader only on the first
  load) so an open window does not disappear and come back.

## Form field help („?”) — the pattern for every form (owner 2026-11-06)

Forms must explain themselves. Every input whose meaning is not obvious gets a small „?” right after its label:
`<Input label="Grupi nimi" help="Lühike nimi, mida näevad õpilased ja õpetaja." helpExample="Eesti keel B1 · teisipäev 18:00" />`
(`Select` and wrappers that pass props on, e.g. `SubjectSelect`, take the same `help` / `helpExample`), or on its own
`<FieldHelp label="…" text="…" example="…" />` from `components/ui`. Behaviour (`components/ui/FieldHelp.jsx`,
`fieldHelp.css`): a 20 px round button (bigger invisible touch area) with `aria-label="Abi: <label>"`,
`aria-expanded`, `aria-controls`; tap / click / Enter toggles a popover `role="dialog"` named by the label, which takes
the focus; Escape closes it and returns the focus to „?” without closing a surrounding `Modal`; a tap outside or
tabbing away closes it. The popover is absolutely positioned (no layout shift), at most 300 px wide, and is shifted
so it stays inside the screen with a 16 px gutter (phones). Text rules: plain Estonian, one or two short sentences saying what to enter and what it affects, then
„Näide: …”. Keep the texts next to the form's model (groups: `GROUP_HELP` in `groupForm.js`). Form errors are shown
inside the open window (`role="alert"`), not behind it.

## Firestore ownership

- `curriculumLessons`, `exercises` — staff-authored learning sources.
- `studyDirections` — the school's study directions; admin writes (no delete), staff and finance read.
- `plannerBatches` — one record per „Kinnita ajakava” of the calendar's Planeerija `{ createdAt (server time), createdBy, lessonIds[], studentIds[], status: 'confirmed' }`; admin creates once and reads, nobody updates or deletes from the app (the server's schedule e-mail reads it). The created `schedule` entries carry `source: 'planner'` and `plannerBatchId`.
- `studentCardMerges` — server-only run records of „Liida kaardid” (one per merged card); `students.mergedInto` marks the tombstone.
- `students` / `users` trash fields `deletedAt`, `deletedBy`, `purgeAfter`, `trashState`, `purgeBlocked`, `purgedAt`,
  `anonymised` — „Prügikast”, written only by `staffOperationsApi /cards/*` and `purgeCardTrash` (see „Card trash”).
- `worksheetAssignments`, `homework`, `exerciseResults` — student-specific learning activity.
- `studentMonologues/{studentId}_{YYYY-MM}` — „Kuu monoloog” (2026-11-04): one two-minute recording per card and month
  on the fixed prompt of the level (`features/monologue/monologueModel.js` `MONOLOGUE_PROMPTS`; never reword an id).
  `{ studentId, studentUid, month, promptId, level, audioPath, contentType, seconds, createdAt, updatedAt }`, audio in
  Storage `homework/{studentId}/monologues/{YYYY-MM}.{webm|m4a|ogg}`. Only the card's own student account (role student)
  writes, in the current month, and may replace the take; the card's teacher and admins read; parents nothing (a later
  „share with parent” needs a new read branch + a flag). The school Mac's transcriber (`tools/lesson-transcriber`,
  Admin SDK) adds `transcript`, `words`, `wpm`, `transcribedAt`, `transcriber`, `transcriptModel`, `transcribedTake`
  (= the take's `updatedAt`; a re-record makes the text stale), `analyzedTake` and error / attempt fields; no app user
  may write them. `studentMonologueAnalysis/{monologueId}` — the transcriber's error check of one take (`take`,
  `errors`, `checked`, `focus`), staff read only, no client write (docs/LESSON_RECORDING.md).
  `studentMonologueNotes/{monologueId}` — the teacher's note, staff only (kept off the monologue so the student cannot
  read it).
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
- `clientErrors/{auto id}` — client error tracking „Vead” (2026-11-04). The CRM's own reporter
  (`crm-v2/src/features/client-errors/clientErrorReporter.js`) writes one record per error group and session window:
  `{ message ≤ 500 (sanitized), kind: error|rejection|render|permission|call|media, route (path only, ids / link
  tokens → :id), build ≤ 40, role, uid, browser ≤ 60, frame ≤ 200, count 1–1000, fingerprint (16 hex of kind +
  message + top frame), status 'new', firstAt, lastAt = server time }`. Sources: window `error` /
  `unhandledrejection` (main.jsx), `PageErrorBoundary`, Firestore writes refused by the rules (vite alias
  `firebase/firestore` → `services/firebase/firestoreWithReporting.js`: setDoc / updateDoc / deleteDoc / addDoc /
  batch / transaction, collection pattern only), Live Classroom call failures and getUserMedia errors (useLiveCall,
  useGroupCall). Throttle: one record per fingerprint per 10 min per browser session, ≤ 20 per session. Any signed-in
  user creates (a lesson-link guest only with a valid `liveGuestGrants` grant, as role `guest`); admin reads, sets
  `status` new / ack / fixed, deletes. Page `/vead` (Seaded → Tehniline), dashboard digest of new groups in 24 h.
  Never store document data, form contents, names, e-mails, tokens or query strings in it.
- `systemHealth/{current|digest}` — „Süsteemi olek” (2026-11-09), server-written only (`allow write: if false`),
  admin reads. `systemHealthTick` (every 10 min) GETs the CRM (`crm.epkoolitus.ee/login`, expects `id="root"`), the
  website (`www.epkoolitus.ee`) and `financeApi/health` + `staffOperationsApi/health` (200 `{ ok: true }`, no
  data, no sign-in) and writes `current`: `{ status ok|down, checkedAt, targets.{id}: { label, ok, httpStatus, ms,
  error, failStreak, lastOkAt }, incident | null, lastIncident, history[≤ 48] }`. A target failing 2 checks in a
  row opens one incident (`inc_<yyyymmddhhmmss>`); all targets answering closes it (pure logic:
  `functions/system-health-core.js`). `systemHealthDigest` (07:00 Europe/Tallinn) writes `digest`: `{ date, total,
  occurrences, groups, top[5] by message + route }` of `clientErrors` with `lastAt` in the last 24 h. No e-mail:
  the admin's bell derives notices from both docs (`notificationModel.systemHealthNotifications`, category
  „Süsteem”, id per incident / per day), the „Vead” page shows `SystemHealthCard`.
- `schedule` — dated or recurring lesson intent plus additive occurrence exceptions with stable
  student ownership.
- `calendarConnections` — server-only Google OAuth credentials and sync status; browser access is denied.
- `calendarSyncOutbox` — server-only deferred Google event deletions; browser access is denied.
- `announcements` (administrator) and `announcementResponses` (server-written) — „Teated”, see above; learners
  reach them only through `staffOperationsApi /announcements/*`.
- `missingDataSettings` (administrator) and `missingDataSubmissions` (server-written audit, administrator marks seen) —
  „Puuduvad andmed”, see above; learners reach them only through `staffOperationsApi /missing-data/*`.

- `emailSettings/learner` (administrator), `emailLog` (administrator reads, server writes), `learnerEmailJobs`,
  `learnerEmailRuns`, `emailPreferences`, `serverConfig` (server only) — e-mails to students and parents, see above.
- financial collections — governed by the financial core and its immutable audit model.

Assignment records copy display metadata for historical readability and also store stable
`sourceId` and `curriculumId` references when available.
Visual worksheet assignments may additionally snapshot image or PDF `files` with a bounded
`interactiveOverlay` (`version: 1`, percentage-positioned elements). PDF overlay elements may carry an
optional one-based `page`; absent legacy values mean page 1. The source document remains immutable;
an element with `type: "modal"` stores only a small activation marker and opens its response input outside
the document surface, so authors do not have to align an answer field with a printed line. Its default square
can be moved and resized through visible edge and corner handles without changing the printed source document.
student input is stored only in the assignment's existing `answers` map under visual field keys and is
submitted through the existing worksheet completion contract. This adds no second assignment store and
keeps legacy structured `worksheetData.blocks` assignments compatible.

## Loading on a phone (2026-11-04)

Every route is lazy (`app/routes.jsx`); the first load is React, Firebase (app + auth + Firestore), the router with the
sign-in page and the one CSS file (`app/eagerStyles.js`). Contracts that keep a student's first screen and the lesson
room small:

- The signed-in shell (`AppShell` with its gates, invitation overlay, announcements) is a lazy file (2026-11-09):
  `app/shellPrefetch.js` starts it from `main.jsx` at once on a signed-in address (in parallel with the session check),
  on `/login` / `/registreeru` when the page is idle, never on the public links. A new public route outside the shell
  belongs in its `NO_SHELL` list (`shellPrefetch.test.js` checks routes.jsx).
- Firebase Storage is its own chunk (`firebase-storage`, vite.config.js): `client.js` does not import it; a service that
  uses `requireFirebaseClient().storage` must `import './storageClient.js'` (checked by `storageClient.test.js`).
- `re2js` (Firestore Pipelines' regex engine, ~45 KB gzip) is aliased to `services/firebase/re2jsStub.js`: the CRM
  never uses Pipelines (`re2jsStub.test.js`). Using `firebase/firestore/pipelines` would need the alias removed.

- Import a service file directly (`services/firebase/homework.js`), not the `services/firebase/index.js` barrel: modules
  with top-level work behind it (the worksheet block registry, the kids campaigns) are then pulled into the page.
- The worksheet block registry (`worksheet-studio/engine/registry.js`, every block's views and rules) loads only where a
  sheet is shown or edited. `engine/storedScore.js` does not import it: registry calls `provideScoreChecker` when it
  loads; services await `loadScoreChecker()` when a stored score needs a re-check (`needsScoreCheck`).
- Live Classroom: page → room → panels/recorder/sheet are separate downloads (`LiveClassroomPage.jsx`, `LiveRoom.jsx`,
  `RoomWorksheetPanel.jsx`); `live-classroom/liveRoomPrefetch.js` fetches the room before a lesson / on an invitation.
- Staff-only shell parts (search, right-click menu, admin counts) load lazily in `AppShell.jsx`.
- Tests of lazy parts preload them (`live-classroom/lazyParts.testkit.js`) and wait with `findBy…`.

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

## Cloud lesson authoring and publication

`lessonDraftsApi` is the sole writer/reader for browser cloud lesson operations. Teacher-owned mutable
drafts use optimistic revision transactions. Immutable `lessonVersions` are created atomically with
a `publishedLessons` current pointer. Firestore client access is denied. Server and browser use
byte-identical Normalized Activity Contract modules, enforced by tests. Publication is staff-only;
assignment and LearningSession integration remain out of scope. Future sessions must pin the
immutable lessonVersionId. See `docs/LESSON_BUILDER_CLOUD_DRAFTS_V1.md`.

## CRM v2 Communication Hub

CRM v2 treats communication as a channel-neutral projection over stable identities. Existing student-linked
`messages` remain compatible and new internal messages add `channel: internal` plus a stable `conversationId`
equal to the exact student ID. External Facebook and Instagram records may carry stable `conversationId`,
`externalThreadId`, `externalMessageId` and sender identifiers. Conversation selection, grouping and React keys
must never use an array index or current sort position.

The browser Firebase service remains the client data boundary. External-channel replies are sent only by an
administrator through the authenticated `metaMessagingApi`; CRM v2 never routes an external thread through the
internal student message writer. The Firebase Function verifies Meta webhook challenges and HMAC-SHA256 signatures,
uses deterministic inbound document IDs for retry safety, and stores inbound/outbound projections in the existing
`messages` collection. Outbound replies are additionally bound server-side to a previously ingested signed Meta
conversation, so a client cannot substitute an arbitrary recipient ID. Facebook uses its Page-scoped Send API with
`META_PAGE_ACCESS_TOKEN`; Instagram uses its Instagram Send API with `META_INSTAGRAM_ACCESS_TOKEN`.
`META_VERIFY_TOKEN` and `META_APP_SECRET` are also server-only Firebase Function secrets. No migration, Firestore
index, or rules change is required. See `docs/COMMUNICATION_HUB_V1.md`.

## Deterministic Worksheet Generator

The worksheet generator is a pure client-side content compiler under
`crm-v2/src/features/worksheet-generator/engine/`. It combines a versioned lesson profile, structured focus IDs,
curated content banks, level-safe vocabulary and a string seed into ordinary `keelesepp.worksheet/2` documents.
It reuses the current Worksheet Studio block registry and renderer; it has no Firebase, network, AI-provider,
timestamp or unseeded-random dependency. Generator metadata remains outside the worksheet document.

The pedagogical selection layer is split from rendering. `activityCatalog.js` defines versioned logical activities
(phase, CEFR range, lesson kinds, skills, production mode, cognitive load, activity family, source requirements and
didactic tags). `planner.js` deterministically compiles compatible activities into Avasta / Harjuta / Kasuta plans,
prefers family diversity and uses recent activity IDs as a cooldown signal. `content.js` only materializes that plan
from curated profile banks into existing Worksheet Studio blocks. `quality.js` checks plan-to-block consistency and
the required phase progression before persistence. A changed seed can therefore change both task content and the
didactic activity mix without changing the worksheet storage schema.

Generated lesson worksheets use child records under `curriculumLessons/{lessonId}/worksheets/{worksheetId}` and leave
the legacy root worksheet contract intact. `lessonWorksheetsService` saves each draft or publication in a Firestore
transaction, rejects a stale `worksheetDocUpdatedAt`, and appends an immutable top-level `worksheetVersions` record
whose ID includes both the lesson and child worksheet. A draft keeps the last published snapshot unchanged. Signed-in
users may read child sheets; only staff may create, update or delete them. Published child sheets continue through the
existing immutable `worksheetAssignments` snapshot. Real-time teacher guidance reuses `LiveWorksheetView`,
`liveFocus.blockId` and the same assignment document inside Live Classroom.
Teacher answer key per task (2026-10-26): in the teacher's live view („Otse tunnis”, the room board, „praegune seis”),
the homework review and a teacher's read-only player, a click on a task opens `BlockKeyPanel` under it
(`engine/answerKey.js` `blockAnswerKey`: answers, explanations, teacher note, listening script). In the live view
„Näita õpilasele” / „Peida” (and „Näita kõik vastused”) write staff-only fields of the assignment in one transaction:
`liveShown` (the learner's player lists the right answers under those tasks, own answers kept), `liveShownBy[blockId]`
(last show / hide: byUid, byName, at) and `liveShownLog` (last 200 actions). Scores and answers are not touched; rules
unchanged (only staff may write these keys). Known exposure, unchanged: the assignment's `worksheetDoc` snapshot that the
learner reads holds the answer keys (gap brackets, `*` options, `explain`, `transcript`); the UI never shows them before a
reveal, but a learner reading the raw document could. Moving keys server-side would be a separate change.

The teacher opens a lesson worksheet set at `/library/lessons/:lessonId/worksheets`; supported profiles
generate the three stable core drafts in parallel. Child routes adapt the same `WorksheetStudioPage` to
`lessonWorksheetsService`, so editing, quality validation, publishing and history do not fork the worksheet engine.
Student-profile work history must query those assignments rather
than copying answers or results into `students`. See `docs/WORKSHEET_GENERATOR_V1.md`.

Content Pack Factory is a pure authoring layer above the generator profile sanitizer and planner. Its versioned
Content Library stores curated reusable communicative frames and lesson-specific sources; the Factory merges stable
IDs deterministically, rejects missing sources and returns an unsaved draft. Firebase remains an adapter used only
after an explicit teacher save. Generated learner metadata never falls back to Russian roadmap goal/success fields.
Content Library v2 extends the same contract with the `family-relations` source and an explicit A2-006 blueprint;
it does not add storage collections, new persistence fields or automatic profile writes. Content Library v3 completes
module two (`possession-genitive`, `appearance-character`, `people-profiles`; A2-007…A2-010); v4 completes module
three (`daily-routine`, `clock-time`, `frequency`, `week-plan`; A2-011…A2-015). Translation hints stay empty:
`alternatives` are accepted answers for the teacher and are never shown to the learner. Context-choice gaps take
distractors of another part of speech first, so a gap keeps exactly one grammatical answer.
The rule-based generator's word forms live in `worksheet-generator/lexicon/forms.json`, built offline from
`source.json` with Vabamorf (`tools/lexicon/build_forms.py`); the CRM reads the JSON only (docs/GENERATOR_LEXICON.md).
Live Classroom calls use STUN plus Cloudflare Realtime TURN: `liveTurnApi` gives the teacher/student of an
accepted invitation short-lived relay credentials (key in Secret Manager); without it the call falls back to STUN only.
The CEFR reserve is loaded separately with authenticated Firebase Storage `getBytes()` and is passed as plain data to
the network-free generator core.

## Admin cleanup audit boundary (2026-10-07)

Maintenance operations commit at most 400 data writes and one activityLog entry in the same
Firestore batch. Each entry includes all IDs for its chunk, not a truncated global list.
Multi-chunk cleanup may partially complete, but committed changes cannot lose their audit
because a subsequent standalone log write failed. No automatic production cleanup is performed.
## Worksheet Studio concurrent-save boundary (2026-10-07)

`worksheetDocsService.save` uses one Firestore transaction for reading the current authoring
revision and writing the lesson, immutable version and activity log. The expected timestamp
compares exactly, including the empty timestamp of an editor loaded before the first save.
A retry must reject an intervening revision instead of silently replacing its document.
This aligns the legacy single-sheet save path with transactional phased worksheet persistence.
