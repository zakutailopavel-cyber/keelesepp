# Worksheet Studio v1 — structured, branded, interactive worksheets

Owner decision (2026-09-28): move Õppevara from generated worksheet *images* (uneditable, answers not checkable)
to *structured* worksheets that keep the approved KeeleSepp look, and let teachers assemble new worksheets
from blocks. The same document must serve Õppevara, homework, Live Classroom and a future printed textbook.
The owner approved the visual level on a prototype of "Minu päev ja kellaaeg".

## Where it lives

- `crm-v2/src/features/worksheet-studio/`
  - `engine/schema.js` — document schema `keelesepp.worksheet/2`, fixed tone palette, image aspect ratios, answer normalisation.
  - `engine/registry.js` — block registry, automatic task numbering, `scoreDocument` (per block and per lesson goal).
  - `engine/blocks/*.jsx` — 21 block types (see below). Each block = `{ type, label, group, task, width, tone, create(), View, Editor, score? }`.
  - `engine/Sheet.jsx` — renders a document as real A4 pages (270 mm design canvas, zoomed to A4 on print), automatic pagination, modes `edit` / `interactive` / `print` (and `review` reserved for teacher review).
  - `engine/legacy.js` — adapter from CRM v1 `worksheetData.blocks` to v2 (every v1 block type).
  - `engine/assets.jsx` — host-provided upload strategy (CRM: Firebase Storage; standalone: inline).
  - `engine/sheet.css` — the fixed design system (approved house style). Named `@page worksheet`, so other CRM pages print as before.
  - `editor/` — inspector and form fields; `WorksheetStudioPage.jsx` — the builder page.
- `crm-v2/src/services/firebase/worksheetDocs.js` — load / save / upload.

Route: `/library/worksheets/new` and `/library/worksheets/:lessonId` (staff). Entry points in Õppevara:
header button "Töölehe konstruktor" and "Ava konstruktoris" in the material dialog.

## Data contract

`curriculumLessons/{id}.worksheetDoc` (new optional field) holds the whole document:

```
{ schema: 'keelesepp.worksheet/2', id, meta: { title, subtitle, level, module, canDo, badge, slogan, footer, goals: { [goalId]: text } },
  blocks: [ { id, type, width: 'half'|'full', tone: 'blue'|'green'|'peach'|'sky'|'cream'|'white', goal?, data } ],
  updatedAt, updatedBy }
```

Also written: `worksheetDocSchema`, `worksheetDocUpdatedAt`, `updatedAt`, and an `activityLog` entry
(`worksheet_doc.created|updated`). A new worksheet creates a new `curriculumLessons` document
(`type: 'material'`, title/level/topic from meta). **`worksheetData` (v1) is never modified**, so CRM v1 and existing
assignments keep working. Photos/audio are uploaded to `curriculum/ws_*` (existing Storage rule: staff write,
signed-in read, safe content types, < 20 MB). No Firestore or Storage rule, index, Function or migration change.

Validation before save: known block types only, ≤ 150 blocks, ≤ 800 KB JSON, no inline `data:` media, title required.

## Blocks (21)

- Grammar & vocabulary: gaps (+ word bank, `[a|b]` answers), choice (single/multi, `*` marks correct), true/false,
  match pairs, many-to-many (teacher-reviewed), sort into groups, word order, table (`[answer]` cells).
- Topics: clock (drawn from data; accepts digits and Estonian words), dialogue with speech bubbles and gaps.
- Text & audio: reading + questions (`[answer]` or open), listening + gap sentences (+ transcript for teacher).
- Pictures: photo, picture grid (order numbers / labels / show).
- Speaking & writing: speaking (voice recording with target duration), writing (lined, live sentence and keyword
  counters), self-check "Kas ma oskan?".
- Layout: text, "Märka!" notice, tip, vocabulary box.

Authors choose tones only from the brand palette; photos are downscaled (1600 px, JPEG) and shown in fixed-aspect
slots with an author-set focal point, so any photo fits the layout.

## Verification (this slice)

`vitest`: engine (every block renders in every mode; scoring of all scorable blocks; legacy adapter for all v1 types;
print never shows learner answers), service (load v2 / convert v1 / new; save merge without touching
`worksheetData`; create; validation; uploads), page (load → add block → save; conversion notice; student view check
per goal; save and load errors). Full suite, ESLint and production build — see PROJECT_STATE.

## Slice 2: homework (assign, student player, teacher review)

- A lesson with `worksheetDoc` is classified as a worksheet in Õppevara (`libraryModel.hasWorksheet`) and assigned with
  the existing flow; `worksheetAssignments/{id}.worksheetDoc` is a snapshot, so later edits do not change handed-out
  work.
- `WorksheetPlayer` dispatches: `worksheetDoc` → `DocWorksheetPlayer` (same Sheet, mode `interactive`, then `review`);
  otherwise the v1 player.
- Answers keep the engine keys `${blockId}:${key}`. Voice answers recorded in the browser are uploaded on save/submit
  (`homeworkService.uploadRecording` → `homework/{studentId}/ws_rec_*`) and the URL replaces the local `blob:` URL.
- `checkDocument(doc, answers)` → `{ results, perGoal, speak, score }`; `score = { correct, total, pct, perGoal }` is
  stored on submit; `errorLog` lists up to 20 wrong fields.
- Teachers see the submitted sheet with marks, recordings and `GoalEvidence` in the Homework review dialog.

## Slice 3: moving image worksheets to the new format

- `/library/worksheets/convert` (staff; button "Üleviimine" in Õppevara): every worksheet-like material with its
  status: only image/PDF, v1 structured (opens converted), done (`worksheetDoc`); progress %, filters by status,
  level and text. Tests, exam parts and lesson plans without images are left out (`conversion.js`).
- In the studio, a material that has original images opens with the "Originaal" tab next to the sheet (tab switch
  back to "Plokid"). The teacher drags a frame over a photo in the original and cuts it into the selected block (if
  that block has a photo slot) or into a new photo block; the cut goes through the normal upload (JPEG ≤ 1600 px,
  `curriculum/ws_*`). Text is retyped into blocks, never kept as an image.
- Cutting needs the Storage bucket to send CORS headers for GET. Without it the studio shows a clear message and
  the teacher can upload the photo as a file instead. One-time setup by the owner (read-only GET, no rule change):
  `gsutil cors set storage.cors.json gs://<VITE_FIREBASE_STORAGE_BUCKET>`.
- No automatic (AI) recognition of the image: that would be a paid external call and needs the owner's decision.

## Slice 4: textbook export

- `/library/worksheets/book` (staff; button "Õpik" in Õppevara): pick structured worksheets (`worksheetDoc`), order
  them, set title / subtitle / level / publisher; the page renders a cover, contents with page numbers and every sheet
  in print mode with running book page numbers in the footer (`Sheet` props `startPage`, `onPageCount`).
- "PDF / Prindi" prints the whole book (A4, one worksheet page per sheet of paper; while the builder or the book is open
  the whole print job is forced to A4 without margins, see `printPage.js`); "Save as PDF" gives the file for a
  printer. The book plan (ids and titles) is kept in the teacher's browser (`localStorage`), nothing is stored in
  Firestore; worksheets stay the single source.
- Print quality depends on uploaded photos (JPEG ≤ 1600 px): enough for A4 at ~150–190 dpi. Offset printing at 300 dpi
  would need larger originals (not changed in this slice).

## Slice 5: live worksheet in a lesson

- A shared workspace for a lesson without a new room or rule change: the student works in the normal player
  (`DocWorksheetPlayer`), which now autosaves answers 1.5 s after each change (`saveWorksheetDraft`; local voice
  recordings are still uploaded only on Salvesta / Esita).
- The teacher opens `/library/worksheets/live/:assignmentId` (staff): a Firestore listener on the assignment shows
  answers, ✓/✗ marks, progress and per-goal evidence as they arrive. Clicking a task sets `liveFocus.blockId` on the
  assignment (staff update, existing rule); the student's sheet highlights that task and scrolls to it.
- Entry point: after assigning a structured worksheet in Õppevara the success notice links "Jälgi tunnis otse" per
  student (`libraryService.assign` now returns `assignments: [{ id, studentId, studentName }]`).
- New optional field `worksheetAssignments.liveFocus = { blockId, at }` (written by staff only).
- Inside the Live Classroom room (PR #183): `RoomWorksheetPanel` opens a studio worksheet for the invited student
  (`liveRoomKey`, `liveOpenedAt` on the assignment); teacher view `LiveWorksheetView`, student `DocWorksheetPlayer inline`.

## End-to-end check against the real rules

`functions/worksheet-studio-emulator.integration.js` runs in the "Financial Core emulator" workflow (Auth and
Firestore emulators with the repository rules): teacher saves a `worksheetDoc` and assigns it; the owning learner
autosaves and submits with a per-goal score; another learner cannot read or write; learners cannot forge `liveFocus`
or the snapshot; the teacher can point at a task.
Storage (`curriculum/ws_*`, `homework/{studentId}/ws_rec_*`) is not covered: in CI (firebase-tools 15.22.3) the
Storage emulator denied every rules-checked upload, including a super admin whose rule reads no Firestore, while an
owner upload succeeded. These are the same prefixes the CRM already uses in production for material and homework files.

## Browser audit 2026-09-30 (owner: "по такой же схеме протестируй конструктор урока")

Walked through in a real browser (Playwright) on the Firestore/Auth/Storage emulators as teacher, admin and a student
with an own account. Worked: new sheet, all 21 blocks, the three views, save → new URL → reload, inspector fields,
move/copy/width, photo upload to Storage, sample sheet, JSON export/import, student view with "Kontrolli vastuseid" and
per-goal evidence, print view without learner answers, assign with due date, student autosave + reload, submit and
score, teacher review (6 %, 1/18), live view, textbook page, conversion queue, a v1 sheet opening converted, cutting a
photo from an original image into a new block.

Fixed:
- Leaving the builder through an in-app link (the "Õppevara" button or the sidebar) silently dropped unsaved work; only
  reload/close asked. `useUnsavedGuard` (capture-phase link click + `beforeunload`) now asks first.
- No undo: a deleted block was gone. Undo/redo (toolbar buttons, Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y; quick typing
  forms one step, 60 steps), Delete/Backspace removes the selected block, deleting shows a notice with the way back.
- In edit mode a click on an answer option of "Valikvastused" (a disabled button) did not select the block
  (`.ws-root.mode-edit :disabled { pointer-events: none }`).
- Opening a JSON file that is not a worksheet crashed the page (blank screen). `parseWorksheetFile` checks schema,
  meta and block types; anything else is refused with a message and the sheet stays.
- "Laadi näidisleht" replaced a non-empty sheet without asking; it asks now (and is undoable). The "Fail" menu closes
  after a choice. The JSON download anchor is attached to the page (name = sheet title).
- A new sheet could be saved as "Uus tööleht"; the first save asks for a title.
- Kodutööd (student): after "Esita tööleht" or "Salvesta" the page reload unmounted the player and reopened it from the
  old copy: the result was hidden, "Esita" showed again and a following autosave could overwrite newer answers with the
  stale ones. The page now keeps its content while reloading. Summary counters include worksheets (total / open /
  late), the student sees "N töölehte" instead of "N õpilast", and a started worksheet shows "Pooleli".

Not an app bug: in headless Chromium a download name with Estonian letters falls back to "download" (ASCII names keep
the title); desktop browsers keep the name.

## Not in this slice

1. (done in slice 2)
2. (live worksheet done in slice 5 as a stand-alone view; embedding it into the v2 lesson room belongs to the Live Classroom track)
3. (manual conversion queue done in slice 3; automatic recognition is not planned without the owner's decision)
4. (textbook export done in slice 4; 300 dpi illustrations need larger photo uploads)
