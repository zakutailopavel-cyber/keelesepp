# Lesson Builder Interactive Templates v1

## Result

Teachers can start with a complete fillable worksheet or add one ready response block without
manually configuring the response schema. This is an authoring productivity slice over the existing
Normalized Activity Contract and Interactive Lesson runner.

## Ready blocks

- `interactive-short` — required short text;
- `interactive-long` — required long text;
- `interactive-single` — required single choice;
- `interactive-multiple` — required multiple choice;
- `interactive-gaps` — required fill-in gaps.

Choice and gap item IDs are stable template data. Editing visible labels, prompts or difficulty
routes does not change them. Every inserted activity still receives its own immutable activity ID
from the existing Builder allocator.

`worksheet` creates a 35-minute lesson containing all five blocks. Teachers can immediately edit
the prompts, choices, gaps, answer model and instructions, then use the existing student/teacher
preview and cloud publication flow.

## Compatibility and safety

Legacy templates have no response metadata and keep their previous behavior. Ready blocks use
`responseMode` plus `evaluation.response`, which is already validated by `interactive-lesson-core`
on cloud save/publication and allowlisted for the student projection. Preview remains ephemeral.

This slice adds no collection, index, Function, rule, migration or production write. It does not
touch students, sessions, evidence, skill maps, mastery or curriculum progress.

## Known production follow-up

A genuinely published cloud lesson was not visible in the student assignment list during the
owner's production check. Investigation was deferred. No assignment-cycle production acceptance
is claimed by this workstream.
