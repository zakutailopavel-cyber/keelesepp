# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `8cb8da11de4b4883e6ebcac28ba437578cf3875b` (`Adaptive Lesson scene rendering v2 (#82)`)
Active architecture branch: `agent/core-blueprint-v1`
Open UI draft PR: `#83 Tighten Adaptive Lesson desktop layout`

## Current objective

Stop broad feature expansion and define the learning core before adding more teacher-facing modules.

The agreed product core is five connected engines:

1. Curriculum Engine — what to learn next;
2. Adaptive Engine — how much support/challenge is appropriate now;
3. Lesson Mode — which teaching workspace the teacher uses now;
4. Content Engine — tasks, vocabulary, scenes, prompts and variants;
5. Learning Profile — current mastery projection plus the evidence that explains it.

The engines are connected by a proposed `LearningSession` runtime contract. Full target contracts, screen map and release roadmap are documented in `docs/KEELESEPP_CORE_BLUEPRINT.md`.

`crm-v2` remains separate and is not part of this work.

## Current adaptive lesson implementation on main

PR #82 is merged.

- `haldus-adaptive-lesson/index.html` is the focused adaptive Lesson Mode prototype;
- `adaptive-lessons/est-b1-city-problem-solving.js` is the reference B1 lesson;
- `adaptive-lessons/scenes.js` resolves stable `sceneId` metadata to Firebase Storage URLs;
- reusable lesson scenes live under `lesson-scenes/**` in Firebase Storage;
- `storage.rules` allows public read for non-sensitive lesson scene assets and restricts writes to staff;
- Support/Core/Advanced route logic and simple teacher judgement controls remain in place;
- the current Lesson Mode still keeps session state local and does not persist adaptive session/evidence data to Firestore.

## Verified scene delivery

The owner manually deployed the current `storage.rules` to Firebase project `keelesepp-5136b` and uploaded the reference asset to:

`lesson-scenes/est-b1-city-problem-solving-01/bus-delay-01.jpg`

The direct Firebase Storage media URL was manually verified in desktop Chrome and rendered the illustration successfully after the current public-read rule was deployed.

The owner also verified the merged #82 Lesson Mode locally from `origin/main` via `python3 -m http.server 8080`; the reference scene loaded from Firebase Storage inside Lesson Mode.

## Desktop density work

Draft PR #83 (`agent/adaptive-lesson-desktop-density`) changes only desktop Lesson Mode density:

- narrower stage sidebar;
- smaller outer spacing;
- scene capped around 390 px / 42vh;
- `object-fit: contain` to avoid artwork cropping;
- tighter expected-answer and judgement blocks;
- mobile layout intentionally unchanged.

The owner manually verified the PR #83 branch locally and confirmed the denser screen allows the task, scene, expected answer and teacher judgement controls to remain visible together on a typical desktop viewport.

PR #83 remains separate from this architecture documentation work.

## Product decision: phase-specific workspaces

The current single scene/card pattern is not the final Lesson Mode architecture.

Only the Lesson Mode shell stays stable. The central teaching tool must change with the pedagogical phase. Target workspace types are:

- diagnostic;
- vocabulary;
- controlled practice;
- scene;
- roleplay;
- transfer;
- assessment;
- summary.

A large illustration is optional. Diagnostic/assessment visuals must not reveal the answer; vocabulary and controlled practice may use completely different tools; transfer must materially change context.

See `docs/ADAPTIVE_LESSON_SYSTEM.md` and `docs/KEELESEPP_CORE_BLUEPRINT.md`.

## Learning Profile decision

`students.skillMap` remains the canonical current skill-mastery projection already used by the platform. The new Learning Profile must not introduce a second competing current-skill truth.

Target evolution is:

- current projection: existing `students.skillMap`;
- future exact vocabulary projection where needed;
- append-only adaptive session evidence explaining why projections change;
- teacher-facing read model combining current mastery, recent evidence, review vocabulary and next recommendations.

No new persistence collections or Firestore writes are introduced by the blueprint PR.

## Vercel state / current limitation

The owner encountered Vercel deployment rate limiting while merging #82. `crm.epkoolitus.ee` was still observed on the earlier production deployment from #81 during this work, so new #82 routes could not be relied on through production Vercel immediately.

Local HTTP serving plus Firebase Storage was used to verify the learning UI without waiting for a new Vercel deployment.

Do not claim #82 is live on the production domain until a new production deployment is explicitly verified.

## Safety / unchanged areas

This blueprint work changes documentation only.

- no Firestore schema or rules changes;
- no database migration;
- no production deploy;
- no finance/calendar/Live Classroom changes;
- no `crm-v2` changes;
- no AI/paid external calls;
- PR #83 UI work remains independent.

## Core roadmap order

1. Core contracts / blueprint review;
2. Learning Profile MVP as a read-only teacher surface using existing `students.skillMap`;
3. adaptive session + append-only evidence persistence for one reference lesson;
4. phase-specific Lesson Mode workspace renderer;
5. deterministic per-skill Adaptive Engine v1;
6. curriculum goal/prerequisite graph for the selected vertical slice;
7. Teacher Home vertical flow;
8. Lesson Builder + Content normalization;
9. AI-assisted content generation only after the core loop is stable;
10. scale/analytics after multiple lessons use the same contracts.

## Next safe step

Review and approve `docs/KEELESEPP_CORE_BLUEPRINT.md`. If accepted, implement **Learning Profile MVP as a read-only teacher surface** using the existing `students.skillMap` and available historical learning evidence, without adding new mastery writes in the same slice.
