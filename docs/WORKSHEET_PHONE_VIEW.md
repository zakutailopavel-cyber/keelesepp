# Tööleht telefonis ja tahvlis (õpilase vaade)

Owner 2026-11-01: a sheet on a phone was an A4 page zoomed to 0.3 (text 4–5 px). Now the student's phone and tablet show the
same document as one readable column. There is no second schema: same blocks, same answer keys, same scoring.

## When which view

| Where | View |
| --- | --- |
| Homework player, width ≤ 1023 px, or a touch screen ≤ 1366 px (`FLOW_QUERY`, `worksheet-studio/sheetFlow.js`) | column |
| Homework player on a mouse screen ≥ 1024 px | A4, as before |
| Printing from anywhere | A4: `beforeprint` redraws the pages, all column CSS is `@media screen` |
| Constructor, teacher's marking (`DocWorksheetSubmissionPreview`), `LiveWorksheetView`, Õppevara previews | A4, as before |
| Live Classroom, phone (≤ 700 px wide or ≤ 500 px high) | reading page: column; „Tahvlivaade” goes to the board |
| Live Classroom, tablet | board with the teacher's drawings stays the default (they lie on the A4 page); „Lugemisvaade” switches to the column |
| Live Classroom board | A4 at `BOARD_SHEET_SCALE`, always: `SheetFlowContext` is the host's decision, never the screen's |

A teacher who opens a learner's sheet read-only on a phone (`readOnly` player) also gets the column.

## How it works

- `Sheet` takes `flow`: one `.ws-page`, all rows in order, no measuring layer, no page split, no `(järg)`. `ctx.flow` reaches the blocks.
- `engine/sheetFlow.css` holds the layout, under `.ws-narrow`, in `@media screen`. Base rules are the phone; `@container` adds room on a tablet.
- A block's own column settings, `opts.size`, `minHeightMm`, joined cards do not apply in the column. Marks (`Marks.jsx`): what is written on them is listed under the task; arrows and rings are left out because they point at spots of the A4 card.
- Fixed order of `input.ws-line, textarea` in a card is a contract: teacher marks find an answer field by its index (`fieldsOf`). Reorder only with CSS (`order`), never in the DOM.
- A renderer adds text for the phone only through attributes (`data-label` + `::before`, `aria-label` + `::before`, `<option label>`), so the character offsets of teacher marks do not move.

## Per block, what the column changes

Tap alternatives: word bank (fills the gap being typed in, the keyboard stays), word order (`TapWords`: tap builds the same plain sentence, tap again removes), sorting and many-to-many as they were. There was no drag and drop on the student's side.
Stacked: match (option label says what the number means, value stays the number), table (each row a card, column name above the cell; ≤ 4 columns are a table again at ≥ 560 px), exam rubric, ads, picture rows, role cards, Venn (three lists).
Own-scroll boxes, allowed by the check: crossword (46 px cells), letter hunt, chart, colouring palette, enlarged scanned page.
Tracing: a 360-unit window of the 1000-unit line with „Edasi” / „Tagasi”; the ink keeps whole-line coordinates. The right edge of the row stays free for the thumb, because the lines themselves do not scroll.
Fields placed on a scanned page (`assignment.files`, `VisualWorksheetList`): the page with numbered dots, enlargeable in its own box, and a numbered list of fields under it. Same `visualAnswerKey`s.

## Keyboard and save state

`useFlowKeyboard` puts the visual viewport into `--ws-vv-h` / `--ws-vv-top` (the dialog takes that height), scrolls the focused field into the free part (`revealField`), and sets `html.ws-flow-typing`, which hides header and buttons while typing. Two-finger zoom is not taken for the keyboard.
`FlowBar`: sticky „3/8”, a thin bar, and Salvestan… / ✓ Salvestatud 14:03 / Ei salvestunud · proovin uuesti. A failed autosave used to be silent; it now shows and retries every 5 s. The v1 player has no autosave: its bar says saved only until the next answer.

## Checks

- `cd e2e && npx playwright test -c playwright.layout.config.cjs`: the real player on a fake repository (`crm-v2/sheet-lab.html`, `src/test/sheetLab/`, vite dev only, not in the build). Fails on: wider than the screen, target under 44 px, field under 16 px, text under 14 px, zoom other than 1. At 360, 375, 430, 768, 812×375, all themes, compact, checked, real course sheets, template v3 copy, live reading page. Runs in CI (`crm-v2.yml` „CRM v2”, job `sheet-layout`). Chromium only. Set `LAYOUT_PORT` to reuse a running dev server.
- `engine/gradingPin.test.js`: marks, score and progress of real sheets are pinned to `main` before this work. A change there means grading changed, a decision for the owner.
- `worksheet-studio/sheetFlow.test.jsx`: same answers as on A4 for every answerable block, tap paths, overlay list, keyboard arithmetic, save state.

A new block needs: its fields at 44 px / 16 px in the column; the check fails until they are. `catalogue.js` fills every block from the registry automatically, add hard data to `STRESS` when the block can be wide.
