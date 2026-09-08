# Lesson Builder Worksheet Composer v1

## Result

`Lisa küsimuste loend` converts up to 30 pasted lines into separate fillable normalized activities
in one action. The teacher can paste ordinary questions or choose a response type per line:

- no prefix or `short:` — short text;
- `long:` — long text;
- `single: question | option A | option B` — single choice;
- `multiple: question | option A | option B` — multiple choice;
- `gaps: instruction | gap A | gap B` — fill-in gaps.

The composer allocates immutable activity IDs through the existing Builder allocator. Choice and
gap fields receive stable `field-N` IDs independent of their labels. Every generated activity uses
the existing Interactive Lesson response contract and Support/Core/Advanced routes.

The whole insertion is one history action, so Undo removes the generated batch. Invalid or oversized
input returns an inline error before changing the draft. Existing activities can be retained and the
new batch is appended.

## Safety

The feature is local authoring only. It adds no API, Firebase collection, Function, rule, index,
migration or production write. Preview continues to use the nonpersistent Lesson Mode boundary.

## Separate production observation

Read-only production UI verification found published lesson `60 min · individuaalne keeletund · v2`
and zero assignments in the current teacher assignment list. Publication and assignment are separate
explicit actions by contract. No assignment was created during the audit.
