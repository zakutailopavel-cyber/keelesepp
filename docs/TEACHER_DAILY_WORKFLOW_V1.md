# Teacher Daily Workflow v1

## Purpose

A teacher should not need to understand KeeleSepp's internal modules before starting work. Teacher Home
is the start page and presents four ordinary actions in the order they are normally performed:

1. open today's lessons;
2. prepare a lesson;
3. assign a published lesson to a student;
4. review student answers.

## Navigation contract

- **Minu tööpäev** opens `/haldus-teacher-home/`.
- **Valmista tund** opens the existing Lesson Builder.
- **Määra õpilasele** opens the existing staff-only assignment form directly.
- **Kontrolli vastuseid** opens the existing assignment list.
- **Minu õpilased** and **Tunniplaan** remain primary CRM routes.
- Every previous CRM tool remains under **Kõik muud tööriistad**.

No existing URL, role check, record or workflow is removed. The direct assignment query parameter only
chooses the initial staff view; the existing API still checks authentication, staff role, student scope and
immutable lesson version.

## Data and deployment impact

This slice changes static navigation and presentation. It does not change Functions, Firestore rules,
indexes, collections, student data, assignments, evidence, finance or curriculum progress. Vercel Preview
is sufficient before owner review. Firebase deployment is not required.

## Guided curriculum preparation

A current unbound curriculum lesson opens Builder with only its stable `curriculumLessonKey`. Builder resolves
that key locally and protects an existing browser draft before replacement. The first teacher decision is now
limited to three paths:

1. a recommended editable 60-minute lesson structure;
2. a short fillable independent worksheet;
3. the complete existing lesson-template library.

Whichever structure is selected, the curriculum title, CEFR, topic, goal and planned duration remain in the
new draft. Template activities receive new stable IDs and remain ordinary normalized activities. The teacher
still reviews, saves, publishes and assigns explicitly. This flow creates no session, evidence, assignment,
curriculum progress or Firebase write by itself.
