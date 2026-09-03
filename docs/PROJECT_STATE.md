# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `1450a18dff97766fbb611c45f239f5358f08427a` (`Restore legacy static deployment after adaptive scene asset (#81)`)
Active branch: `agent/adaptive-lesson-scenes-v2`
Open draft PR: `#82 Adaptive Lesson scene rendering v2`

## Current objective

Finish the adaptive Lesson Mode scene system in the first/legacy KeeleSepp CRM. `crm-v2` remains separate and is not part of this work.

## Implemented on PR #82

- `haldus-adaptive-lesson/index.html` renders lesson scenes dynamically instead of hardcoding one image;
- `adaptive-lessons/scenes.js` maps task/stage IDs to scene metadata (`src`, `version`, `alt`, pedagogical `purpose`);
- missing or failed images show a clean fallback instead of Safari's broken-image icon;
- mobile header/stage layout was adjusted so lesson content no longer scrolls underneath the sticky header;
- Support/Core/Advanced route logic and teacher judgement controls remain unchanged;
- replacement scene lives at `adaptive-lessons/scenes/bus-delay-v2.jpg`.

## Scene asset incident and fix

The first `bus-delay-v2.jpg` committed on PR #82 was truncated. Safari displayed only a thin top strip and filled the remainder of the scene area grey.

A replacement JPEG was validated locally before upload:

- dimensions: 480 x 317;
- format: JPEG, RGB;
- Pillow decode/verify: successful;
- local size: 23,584 bytes.

The validated binary was uploaded as Git blob `f375325d09176e055de400b6bf0c981990e2f1da` and committed on the PR branch as `710bb8c84786a1a73be85082ad5c1b29fbfbe0b0` (`fix(adaptive): replace truncated lesson scene JPEG`).

## Verification still required

Wait for the Vercel preview for commit `710bb8c...` to become READY, then verify:

- `/haldus-adaptive-lesson/` returns 200;
- `/adaptive-lessons/scenes/bus-delay-v2.jpg?v=2` returns a complete JPEG with expected content length;
- mobile Safari renders the full scene rather than a grey block;
- header, stage strip, task card, judge buttons and floating controls do not overlap.

## Safety / unchanged areas

- no Firestore writes or schema changes;
- no finance/calendar/Live Classroom changes;
- no `crm-v2` changes;
- no production deployment until owner explicitly merges PR #82.

## Next safe step

Verify the new preview deployment for commit `710bb8c...`. If the scene renders correctly on mobile Safari, update PR #82 verification notes and ask the owner to merge only #82.