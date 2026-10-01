# Worksheet Studio v2 — specification (draft for owner approval, 2026-09-29)

Status: **implemented 2026-10-01 without section 5** (no external API; word popup remains postponed). Owner's requests: more task types and their modifications
(first: free block size instead of "half / full"), teacher annotations on the student's sheet, double-click a word for
its translation and main forms.

## 1. Free block size
- 12-column sheet grid. Width presets ¼, ⅓, ½, ⅔, ¾, full; set by dragging the block's right edge on the page
  (snaps to presets) or in the inspector. Blocks fill a row until 12 columns are used (⅓+⅓+⅓, ¼+¾ …).
- Height: drag the bottom edge (extra space for writing/drawing), or "auto".
- Stored as `block.span` (1–12) and `block.minHeightMm`; old `width: 'half' | 'full'` read as 6 / 12. Print (A4) and
  pagination use the same rows.

## 2. Common task modifications (inspector, every task type where it makes sense)
- Items in 1 / 2 / 3 columns inside the block.
- "Näide": first item shown solved as an example.
- Shuffle options / pairs for the student.
- Number of answer lines for written answers.
- Font size: smaller / normal / larger (children).

## 3. New task types (order to be chosen by the owner)
1. Word forms (käänamine / pööramine): base word + requested form → student writes it; auto-check against the answer the teacher enters (no API).
2. Find and fix the mistake in a sentence.
3. Dictation: listen and write (TTS or teacher audio), auto-check per word.
4. Translation RU → ET (teacher-graded).
5. Crossword and word search (printable, children).
6. Role cards A/B for pair speaking.

Implemented together with PDF-derived planning grid, phrase bank, guided long letter and rubric blocks. The registry
now contains 32 structured block types; see `docs/WORKSHEET_STUDIO_PDF_COVERAGE.md`.

## 4. Teacher annotations on the student's sheet
- In homework review and in the live lesson the teacher selects text (in a task, the student's answer or a reading
  text) → highlight colour + short comment ("vaata lõppu", "osastav!").
- Anchored to block + field + text quote, so they survive re-layout; stored per assignment (not in the worksheet).
- The student sees highlights; tapping one shows the comment. Live lesson: appears on the student's screen at once.
- Optional: the student marks "parandatud" (fixed).

## 5. Word popup (double-click / double-tap a word)
- Shows: base form, the three main forms (nouns: nimetav · omastav · osastav; verbs: ma- · da- · present 3rd person),
  translation to Russian / English, a "listen" button.
- Sources: EKI Ekilex API (forms, meanings; needs an API key from the owner's Ekilex profile), TartuNLP Neurotõlge
  (translation), TartuNLP Neurokõne (audio). Called through our Cloud Function (key stays secret, results cached in
  Firestore so repeated words are instant and free).
- Inflected words (e.g. "koeraga") are resolved to the base form ("koer") — verified first against the API.
- Teacher can switch the popup off for a sheet (tests / exams).

## Order proposed
1 (size) + 2 (modifications) → screenshots → 5 (word popup, after the Ekilex key) → 4 (annotations) → 3 (new types one by one).
