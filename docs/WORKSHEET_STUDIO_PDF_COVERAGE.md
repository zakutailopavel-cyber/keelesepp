# Worksheet Studio — PDF coverage and reliability upgrade (2026-10-01)

## Source audit

The local generated A4 worksheet, two-page textbook spread and `Kiri linnavalitsusele` PDF were rendered page by
page and compared with the structured editor. Existing blocks already covered clocks, matching, picture sequencing,
word-bank gaps, speaking, ordinary writing and self-check. The formal-letter PDF additionally required a planning
grid, letter-structure table, phrase bank, guided long letter and final rubric.

## Authoring coverage

The registry now contains 32 blocks. New blocks: word forms, find/fix the error, dictation, teacher-reviewed
translation, printable word search, crossword, role cards A/B, writing plan, phrase bank, guided long letter and
rubric. The built-in `Kiri linnavalitsusele` template reproduces the complete two-page workflow as structured content.
All blocks render in edit, student and print modes; automatically checkable new tasks participate in scoring, while
open work participates in answer progress and remains teacher-reviewed.

## Reliability and publishing

- Author edits are backed up to browser storage and restored after an interrupted session.
- Saves compare the loaded timestamp and refuse a stale overwrite.
- Every save appends an immutable `worksheetVersions` snapshot; old versions can be loaded and restored as a new one.
- `draft` and `published` are separate. Assignments use the last published snapshot and a never-published draft is
  rejected by the service.
- Saving a previously published worksheet (including legacy documents without lifecycle fields) preserves its
  current document as the published snapshot in the same batch before replacing the editable draft.
- Õppevara classifies every constructor document as Tööleht. Preview uses the published snapshot, or labels a
  never-published draft Mustand; assignment offers a link back to the constructor to publish it.
- Publication blocks missing content/tasks, empty task titles and missing checked answers. Sheet placeholder titles,
  missing instructions/goals and missing listening audio are warnings; teachers may read listening text aloud.
- The editor includes whole-sheet copy, palette search, JSON replacement confirmation and a manual page-break option.
- Mobile authoring has bounded palette/inspector regions and a horizontally scrollable action bar.

The word popup from v2 specification section 5 remains intentionally excluded because the owner approved the spec
without that external-API section. No external API, paid call, Firebase Function, rule or production service changed.
