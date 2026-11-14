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
- Picture tasks (2026-10-12, `blocks/picture.jsx`): words ↔ lettered pictures A–L (`picmatch`, pictures mixed by the block id, the right letter computed in scoring), numbered labels on one picture (`scenelabel`, pins in % + word bank), character cards (`profiles`: portrait, facts, sentences with [gaps]), picture + situation + question rows (`picrows`, teacher-checked).
- Sheet density (`meta.density: 'compact'`, inspector „Tihedus”): smaller font, tighter cards and 3 mm row gaps — more tasks on a page.
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

## Media (2026-11-04, agent/constructor-media)

- **Video block** (`engine/blocks/video.jsx`, model `engine/video.js`, group „Tekst ja heli”, task): `data = { title,
  instruction, url, file, start, end, caption, questions }`. `url` = YouTube (watch / youtu.be / shorts / embed / live,
  `t=` / `start=`) or Vimeo (incl. private hash, `#t=`); `file` = `{ src, storagePath, name, type, size }` uploaded via
  `assets.video` → `uploadVideo` (`curriculum/ws_video_*`, private sheets `student-worksheets/<id>/`, ≤ 19 MB); a file
  wins over a link. `start` / `end` accept „90”, „1:30”, „1m30s”; the start field wins over the link's time.
  Player: YouTube from `www.youtube-nocookie.com/embed` (rel=0, start, end), Vimeo `player.vimeo.com/video/<id>?dnt=1`,
  a file in `<video>` with `#t=start,end`; the iframe sets `referrerPolicy="strict-origin-when-cross-origin"` (the site
  sends no cross-origin referrer and YouTube refuses an embed without one). Student (`interactive`) and live lesson
  (`review`) show the player; builder (`edit`) and paper (`print`, and `@media print` of any screen) show a QR code
  (`engine/qr.js`, own byte-mode / level-M encoder, checked module-for-module against libqrencode) + short watch link +
  caption + part („0:30–1:20”). Questions use the reading block's format and scoring (`reading.answers/score`).
  CSP (`crm-v2/vercel.json` `frame-src`): `https://www.youtube-nocookie.com https://player.vimeo.com` added.
- **Images**: „Lõika / pööra” in every photo picker (`editor/ImageEdit.jsx`): rotate ±90°, crop free or 4:3 / 3:2 /
  1:1 / 16:9 / 3:4 (math in `engine/image.js`: `fitCrop`, `moveCrop`, `resizeCrop`, `cropPixels`, `rotatedSize`). The
  result is a new upload; a free crop sets the slot to `aspect: 'orig'` (the picture's own shape, `aspectRatioOf`), a
  fixed one to its key. Needs Storage CORS (`storage.cors.json`), as the original cut does. Intake
  (`prepareImageFile`): SVG uploaded unchanged; rasters ≤ 1600 px; transparency → PNG (a PNG needing no downscale is
  uploaded unchanged), otherwise JPEG. Image block: „Alt-tekst” (`data.alt`), screen readers get `altText(data)` =
  alt, else the caption without markup.
- **Teacher voice** (`editor/VoiceRecorder.jsx`): „Salvesta hääl” in `AudioPick` (listening, dialogue, reading,
  examlisten): MediaRecorder (webm/opus, mp4 on Safari), timer, max 10 min, preview, „Salvesta uuesti”, „Kasuta seda” →
  `assets.audio` (the existing `uploadAudio`), stored as `data.audio` with `recorded: true`, file `haal-<ts>.<ext>`.
  Hidden where the browser cannot record.
- **Pank**: tabs Pildid / Heli / Video / Tekstid / Internet (the type filter). `mediaAssets` kinds `audio` and `video`
  (fields `src`, `storagePath`, `title` = file name, `caption`); every uploaded / recorded / TTS sound and uploaded video
  is added automatically (`bankMedia` in `WorksheetStudioPage.jsx`), the curriculum index also collects them
  (`extractAssets(...).media`). From the bank a sound goes into the selected sound block or a new listening block, a
  video into the selected video block or a new one. `firestore.rules` `mediaAssets`: kinds + `src` required for
  image / audio / video (rules deploy needed).
## Reuse: saved sheets in „Kogu”, copy / move to a phase, sheet and lesson templates (2026-11-04)

Pure logic: `crm-v2/src/features/worksheet-studio/sheetReuse.js` (+ `sheetReuse.test.js`); Firestore:
`services/firebase/sheetReuse.js` (reads) and `services/firebase/worksheetSheetTemplates.js` (templates); UI:
`BlockLibraryPanel.jsx` (source switch), `editor/ReuseDialogs.jsx` (`CopyMoveDialog`, `TemplateDialog`),
`WorksheetStudioPage.jsx` (block bar, „Fail” menu, empty-sheet banner).

- **„Kogu” → „Salvestatud lehed”.** Same search as the course library (words and #tags; extra tags `#salvestatud`,
  `#leht` / `#tund`, `#mustand` / `#avaldatud`, `#õpik`). Reads only what staff can read under the existing rules
  (`curriculumLessons` and `curriculumLessons/{id}/worksheets`, `courseReader`): the lesson list once when the source
  is chosen (cached 5 min) — every standalone sheet's tasks are on it; phase sheets (Avasta / Harjuta / Kasuta / Õpik,
  the draft `worksheetDoc`) of the open lesson and of at most 12 lessons whose title / level / module contain the typed
  words, 400 ms after typing stops, each lesson once per session. A broad query (only #tags) does not read phase sheets;
  the course content itself is already searchable under „Kursus”. Focus sheets of a lesson without a phase summary
  (`worksheetPhases`) are not read. An inserted task brings its goal text when the sheet has no goal with that key.
- **„Kopeeri / Teisalda…”** (block bar, folder icon; hidden on a student's private sheet): target = a phase sheet of
  this lesson or of another lesson (search by name / level / module). The copy is appended to the target's draft by
  `copyBlocksToPhase` → `lessonWorksheetsService.saveDraft` with the read's `worksheetDocUpdatedAt` (transaction
  conflict check; on a conflict it reads again once). A missing phase sheet is created with its role / slot (Õpik:
  `focus`, slot 4). Never published: a published target keeps its `publishedWorksheetDoc` until someone presses
  „Avalda” there. „Teisalda” = copy first, then the block is removed here and this sheet's draft saved (undoable
  with Ctrl+Z; a new unsaved sheet only loses it in the editor).
- **Templates** (`worksheetTemplates`, new collection): `{ kind: 'sheet' | 'lesson', title, level, sheets: [{ phase,
  label, doc }], ownerUid, ownerName, createdAt, updatedAt, archived }`; save stamps (`updatedAt`, `version`, `status`)
  are stripped from the docs; ≤ 6 sheets, ≤ 900 kB. „Fail” → „Salvesta leht mallina…”, on a lesson page also
  „Salvesta terve tund mallina…” (the latest draft of each phase sheet with blocks, the open one as in the editor).
  „Fail” → „Uus mallist…” (and the „Leht on tühi” banner) lists the built-in sheets („Kiri linnavalitsusele”,
  „Minu päev”) and saved templates: a sheet template replaces the open sheet in the editor (undoable, not saved by
  itself); a lesson template on a lesson page („Täida tund”) puts its sheet for the open phase into the editor and
  saves drafts only for phases with no sheet or an empty one — a sheet with blocks is never overwritten. The author or
  an admin archives a template („Arhiveeri”); nothing is deleted. Block templates stay in `worksheetBlockTemplates`.
- **Rules** (`firestore.rules` `worksheetTemplates`): staff read; staff create in their own name with exactly those
  keys, `archived == false`; author or admin may change only `title`, `archived`, `archivedAt`, `archivedBy`,
  `updatedAt`; delete denied. Emulator test `functions/worksheet-sheet-templates-emulator.integration.js` (in
  `npm run test:emulator`). Needs `firebase deploy --only firestore:rules` before templates can be saved.

## Tablet editing and the Õpik book (2026-11-11, agent/opik-edit-tablet)

- Touch / pen: the first tap selects a block, a second tap on its text opens the in-place editor (a mouse keeps the
  double click). Table rows are edited as their source line (`data-edit="rows#i"`).
- „Suur tekst” (Aa in the top bar): the sheet as the `sheetFlow.css` column at 16 px; default on for touch tablets and
  screens under 1024 px (`editor/touchEditing.js`, `localStorage ks-studio-column`). The A4 view stays for layout.
- Tablet (`(max-width: 1180px), (pointer: coarse)`): drawer starts closed; block settings are a bottom sheet lifted over
  the on-screen keyboard (`--st-kb`); 44 px targets; inputs 16 px. On the Õpik sheet the generator strip shows only tabs.
- Book (`/library/worksheets/book`): the settings panel folds (`ks-book-side`); „Muuda” opens the sheet on the screen in
  the same tab, „← Õpik” returns to the same place (`bookPlace.js`, `sessionStorage ks-book-return`).

## Picture inside a text, picture frames (2026-11-11, agent/opik-layout)

- Data (optional, backward compatible): text block `data.figure = { mode: 'float', img, caption, alt, side: left |
  right | center, width: 20–100 (% of the text column), at: paragraph index, shape: rect | rounded | circle | oval,
  border: none | ink | lime, locked }`; picture block `data.shape`, `data.border`. Model and checks:
  `engine/figureFloat.js` (`normalizeFigure`, `figureProblem` used by `validateWorksheetDoc`); drawing / tools:
  `engine/FloatFigure.jsx`; inspector: `editor/FigureFields.jsx`.
- Layout is flow, not coordinates: CSS float + `shape-outside` (circle / ellipse / rounded inset; a caption keeps the
  wrap rectangular), frames by `border-radius` and a border. A text block is never split by `pageSplit.js`, so the
  picture stays with its text on one page; print uses the same CSS without the tools. The phone column
  (`sheetFlow.css`) stacks it above its paragraph; a tablet column (≥ 560 px container) wraps again (≥ ⅓ width).
- Editing: inspector „Pilt teksti sees” (picture, caption, alt, side, width, paragraph, shape, border, lock, remove);
  on the sheet ✥ drags it (third of the column → side, height → paragraph), the corner drags its width (snaps to 25 /
  33 / 50 / 100, else 5 %), 🔓 locks it (no move / resize tools; text editing unaffected). Buttons of 36 px (44 px on
  touch) whatever the page's zoom; each change is one undo step (`Sheet onPatch` → `ctx.patch`). The picture block's
  bar has „Teksti sisse” (into the next or previous text block without a picture). Tapping the picture is not a text
  edit; its caption is (`inlineEdit.findEditable` skips `[data-noedit]` and the figure's text).
- Several pictures and the reading text (2026-11-13, agent/figure-everywhere): `data.figures` = up to 3 such objects
  (`MAX_FIGURES`), each before its own paragraph; a block with the older single `data.figure` reads as a list of one
  (`figuresOf`), and the first change writes `figures` and sets `figure: null` (`figuresPatch`). Blocks that take
  pictures: `text` (field `text`) and `reading` (field `passage`, empty paragraphs dropped) — `FIGURE_TEXT`. Both draw
  through `FigureFlow` (`engine/FloatFigure.jsx`, column marked `data-figure-column`). A reading split over two pages
  (`pageSplit.js`) keeps the whole list and gets `figureFrom` / `figureLast`: a part draws only the pictures of its own
  paragraphs and stores a change against the whole text. „Teksti sisse” works into a text or reading text that has
  fewer than 3 pictures (a second picture goes to the left, by the last paragraph when the text is above). Notice / tip /
  dialogue blocks take no picture yet.
- Phase 3 is built as a separate free layer (below), not as `figure.mode: 'free'`; `figureProblem` still refuses
  unknown figure modes.

## „Vaba kiht” — free layer of the Õpik page (2026-11-13, agent/opik-free-layer)

- Data (optional, backward compatible): `doc.free = [{ id, kind: image | shape | text, page, x, y, w, h (mm on the
  270 mm design page), z, rotate, locked, img, alt, shape: rect | rounded | circle | oval, fill: none | lime | cream |
  sky | peach | navy, border: none | ink | lime, text (≤ 600), size (pt), bold }]`, ≤ 40 items. Model and checks:
  `engine/freeLayer.js` (`normalizeFreeItem`, `itemsOnPage`, `flowItems`, `moveItem`, `resizeItem`, `restack`,
  `freeProblem` used by `validateWorksheetDoc`).
- Drawing: `engine/FreeLayer.jsx` — an absolute layer over each `.ws-page` (`Sheet.jsx`), items in mm, so print, zoom
  and the book draw the same; an item of a missing page stands on the last page. The blocks do not move out of its
  way (decoration / illustration on top). Outside the constructor the items take no pointer (answer fields under
  them stay usable). Phone column (`flow`): pictures and text boxes after the blocks in page / top order, shapes left
  out (`FreeFlow`, `.ws-free-flow` order 3).
- Lines and arrows (2026-11-13, agent/opik-free-lines): `kind: 'line'` with two ends `x, y` → `x2, y2` (mm, kept on the
  page) instead of a box, `color: ink | navy | green | lime | red`, `stroke` (mm), `heads: none | end | both`, `dash`.
  Drawn as an 8 mm strip turned around its start with an SVG in mm (`LineItem`); dragging the strip moves both ends,
  the two round handles move one end (`moveEnd`). Lines are left out of the phone column. Palette: „Joon”, „Nool”.
- Text typed on the sheet (2026-11-14, agent/free-text-inline): a double click on a text box, or one more tap on a
  selected one, opens a textarea in the box (`TextEditor` in `engine/FreeLayer.jsx`, same letter size, ≤ 600 marks,
  Markdown kept). Leaving it (tap elsewhere, Ctrl/Cmd+Enter) writes the text as one undo step; Esc gives the old text
  back; keys typed there never reach the constructor's shortcuts. Works on a locked box too (lock = place and size).
- Text box letters (2026-11-14, agent/free-text-style): optional `font: body | head | hand` (Nunito Sans / Nunito /
  Caveat), `align: left | center | right` (missing: left, a circle or oval centres), `color: auto | ink | navy | green |
  red | white` (auto: white on navy, ink elsewhere). One inline style `textStyle(item)` (freeLayer.js) draws the page,
  the typing box and the phone column alike; `freeProblem` refuses unknown values. Settings: Kiri, Joondus, Teksti värv.
- Snapping (2026-11-14, agent/free-snap): while an item or a line is dragged, `snapItem(item, others)` pulls its edge
  or middle (a line: its ends) onto the page edge, margin (9 / 11 mm) or middle, or onto another item's edge or middle
  on the same page, within `SNAP_MM` = 2 mm; a pink guide (`.ws-free-guide`, never printed) shows it during the drag
  only. Alt while dragging = no snapping. Resizing and the arrow keys do not snap. No data change.
- „Lehel”, see-through, shadow (2026-11-14, agent/free-place): settings buttons Vasakule / Keskele ↔ / Paremale /
  Üles / Keskele ↕ / Alla (`placeOnPage`: page middle or margins 9 / 11 / 9 mm; lines move both ends); optional
  `opacity` 0.2…1 („Läbipaistvus”) and `shadow` („Vari”, a soft drop shadow) on every kind, drawn by `lookStyle`
  on the page and in the phone column; `freeProblem` refuses an opacity outside 0.2…1.
- Several items at once (2026-11-14, agent/free-multi): Shift / Ctrl / ⌘ + tap, or the palette toggle „Vali mitu”
  (touch), adds an item to the selection or takes it out (studio state `selectedFreeId` + `extraFreeIds`). Dragging
  one selected item moves all (others follow by CSS `translate`, one undo step `moveMany`); a tap on one of them
  selects it alone. Arrows / Delete / Ctrl+D / Esc act on the whole selection. Panel `FreeGroupFields`: „Joonda
  omavahel” (`alignMany`: edges / middles of the common box), „Võrdsed vahed” for 3+ (`spreadMany`), layer top /
  bottom keeping order (`restackMany`), copy all, delete all, unselect. Locked items stay put. No data change.
- Selection frame (2026-11-14, agent/free-frame): Shift + drag on a page, any drag on a page while „Vali mitu” is on
  (the page then takes the finger instead of scrolling), or a drag that starts on the bare page draws a pink dashed
  frame (`.ws-free-band`, studio `startFrame`, pointerdown capture on the canvas); every free item of that page it
  touches joins the selection (`itemsInFrame`). A tap (< 2 mm) is not a frame. Not in the phone column view.
- Constructor (`WorksheetStudioPage.jsx`): only on the Õpik sheet (`worksheetId === 'opik'`, or any sheet that
  already has a layer) the palette shows „Vaba kiht (Õpik)”: Pilt / Kujund / Tekstikast (added on the page in the
  middle of the screen, selected, settings open). On the sheet: tap selects, drag moves, the corner resizes (pictures
  and circles keep proportions); arrows nudge 1 mm (Shift 10), Delete removes, Ctrl+D copies, Esc deselects. Settings
  `editor/FreeFields.jsx` (picture / alt, text / size / bold, shape, colour, frame, page, turn, layer: Kõige peale /
  Üles / Alla / Kõige alla, lock, copy, delete) in the same floating panel as a block's. Each change is one undo step.


## Not in this slice

1. (done in slice 2)
2. (live worksheet done in slice 5 as a stand-alone view; embedding it into the v2 lesson room belongs to the Live Classroom track)
3. (manual conversion queue done in slice 3; automatic recognition is not planned without the owner's decision)
4. (textbook export done in slice 4; 300 dpi illustrations need larger photo uploads)
