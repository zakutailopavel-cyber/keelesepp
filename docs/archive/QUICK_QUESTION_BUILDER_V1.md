# Quick Question Builder v1

## Teacher outcome

The **Küsimused + vastused** action opens a simple question list. The teacher writes one question per row,
chooses a short or longer answer, adds or removes rows, and inserts the whole set in one action. A long
plain-text list can be pasted into the optional bulk section.

## Contract

Each non-empty question creates one normalized activity with a newly allocated stable activity ID. Its
response is `short_text` or `long_text`; therefore the student receives one response control directly
under that question. Answers continue to use the existing assignment map keyed by activity ID.

The builder does not create one activity containing several questions. This avoids nested answer state,
keeps resume and validation unchanged, and makes every answer independently editable and reviewable.

## Compatibility and impact

- Existing drafts, published versions, assignments and answers are unchanged.
- The older mixed worksheet parser remains available to existing callers.
- One insertion is one Undo/Redo history operation.
- Builder preview remains local and performs no assignment or evidence writes.
- No Function, Firestore rule, index, collection, migration or production data change is required.

## Known boundary

This slice improves question authoring and response identity. The wider CRM navigation and daily teacher
workflow are a separate workstream after production smoke.
