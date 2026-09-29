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

## Not in this slice

1. (done in slice 2)
2. Worksheet as a Live Classroom scene (needs the v2 lesson room; see PR #183 and the Live Classroom roadmap).
3. (manual conversion queue done in slice 3; automatic recognition is not planned without the owner's decision)
4. Textbook export (book layout, 300 dpi illustrations).
