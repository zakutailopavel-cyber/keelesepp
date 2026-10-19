# KeeleSepp Learning Profile MVP

Status: implementation candidate — Core Blueprint release slice 1

## Purpose

The Learning Profile is the teacher-facing read model for the learner's current educational state. It answers a narrower question than the legacy skill editor:

> What do we currently know about this learner, what evidence supports that view, and what should the teacher verify next?

It does **not** create a second mastery store and it does not automatically choose the next curriculum goal.

## Source-of-truth boundary

`students.skillMap` remains the canonical current skill-mastery projection already used by KeeleSepp.

The MVP composes that projection with historical structured evidence. It never recalculates or overwrites `skillMap`.

Current inputs:

- `students/{studentId}.skillMap` — current skill percentages;
- `haldus-programs.js` / `HaldusSkillCatalog` — canonical display labels for skill IDs;
- completed `liveClassrooms` records that contain `lessonSummary` — historical evidence context;
- summary v2 fields such as `curriculumGoalIds`, `curriculumGoalLabels`, `curriculumSkillIds`, `teacherComment` and `nextHomework`;
- legacy `achievedGoals` only as readable historical goal labels when structured labels are unavailable.

A completed lesson without `lessonSummary` is not promoted to learning evidence. Attendance remains separate from mastery.

## Pure read model

`learning-profile-core.js` is a reusable UMD/CommonJS module. It has no Firebase dependency and owns deterministic projection rules:

- score normalization without converting missing evidence to zero;
- skill status bands (`focus`, `caution`, `developing`, `strong`);
- stable fallback labels for unknown skill IDs;
- normalization of Live Classroom summary evidence;
- filtering evidence to the selected student;
- newest-first evidence ordering;
- current summary metrics and teacher attention lists.

Current status bands are presentation/review bands, not CEFR changes:

- `< 50` — focus;
- `50–69` — caution;
- `70–79` — developing;
- `>= 80` — strong.

These bands do not modify the lesson category or the learner's CEFR level.

## Teacher surface

Route:

- `/haldus-learning-profile`
- `/haldus-learning-profile/`

Entry point file: `haldus-learning-profile/index.html`.

The surface is intentionally read-only and shows:

1. learner identity, current level and summary metrics;
2. skills needing attention from the existing `skillMap`;
3. strongest currently assessed skills;
4. recent structured lesson evidence;
5. recently achieved curriculum goals as historical context;
6. a bounded teacher direction for what to verify next.

The page explicitly does not claim that recently achieved goals are the next goals. `recommendations.nextGoalIds` stays empty until the Curriculum Goal / prerequisite graph is implemented.

The legacy `/haldus-skillmap/` editor remains separate and unchanged. It is still the existing manual mastery-editing workflow; the Learning Profile is not a replacement writer.

## Authorization and teacher scope

The browser UI does not replace Firestore rules.

- administrators may read the available student/evidence projections allowed by existing rules;
- teachers follow the existing `teacherUidV1` rollout state for student-list queries;
- when teacher-scope read enforcement is active, the student query includes `teacherUid == auth.uid`;
- Live Classroom evidence queries for non-admin teachers always include `teacherUid == auth.uid`, matching the current `liveClassrooms` rule boundary;
- the new page adds no Firestore `set`, `update`, `add` or `delete` operation.

This slice does not change `firestore.rules` and does not broaden any existing permission.

## Deliberate non-goals

The MVP does not yet provide:

- adaptive-session persistence;
- append-only task-level `learningEvidence` records;
- exact vocabulary mastery/history;
- automatic next curriculum-goal selection;
- prerequisite graph traversal;
- AI recommendations;
- automatic mastery writes;
- replacement of the legacy skill editor;
- `crm-v2` integration.

## Verification

Targeted Node tests cover:

- missing scores remain missing rather than becoming zero;
- skill status bands are deterministic;
- Live Classroom summary v2 becomes evidence without inventing a score;
- `students.skillMap` remains the current mastery projection;
- evidence is filtered to the selected student and sorted newest first;
- attendance without a summary is not evidence;
- achieved goals remain historical context and do not become next-goal recommendations;
- the teacher page contains no direct Firestore write path;
- teacher-scoped student and Live Classroom reads match current security boundaries;
- the shared skill catalog is reused;
- inline browser scripts parse;
- Vercel routes exist with and without a trailing slash.

Manual verification after the branch is checked out locally:

1. serve the repository with the existing local HTTP workflow;
2. sign in as an administrator and open `/haldus-learning-profile/`;
3. select a learner with `skillMap` data and confirm current strengths/attention skills render;
4. select a learner with a structured Live Classroom summary and confirm the summary appears as historical evidence;
5. sign in as a teacher and confirm only teacher-scoped students/evidence are queryable under the current rollout state;
6. verify `/haldus-skillmap/` still opens separately and no value changes merely by viewing the Learning Profile.

## Next release slice

After owner review of this read-only surface, the next safe slice is the Core Blueprint's **adaptive Learning Session + append-only evidence persistence for one reference lesson**. That slice should create durable evidence first; automatic mastery changes remain a separate policy decision and must not be bundled into the initial persistence change.
