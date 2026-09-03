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
- `adaptive-lessons/scenes.js` maps task/stage IDs to scene metadata (`src`, `alt`, pedagogical `purpose`);
- the current reference scene is embedded directly in `scenes.js` as a JPEG data URI so Safari does not need a second protected Vercel request for the image;
- missing or failed images show a clean fallback instead of Safari's broken-image icon;
- mobile header/stage layout was adjusted so lesson content no longer scrolls underneath the sticky header;
- Support/Core/Advanced route logic and teacher judgement controls remain unchanged.

## Scene asset incident and final delivery strategy

The first repository-hosted scene JPEG was truncated, and a later valid external JPEG still failed in mobile Safari on protected Vercel previews because the image was a separate subresource request.

The preview screenshot confirmed the fallback rendered cleanly, proving the UI path was correct but external asset delivery remained unreliable.

To remove that dependency, the bus-delay illustration is now embedded in `adaptive-lessons/scenes.js` as `data:image/jpeg;base64,...`. The embedded source is a locally validated 360 x 238 RGB JPEG. The obsolete external JPG and temporary staging marker files were removed from PR #82.

This is an intentional reliability choice for the current prototype/reference lesson. When the scene library grows, move production assets to a dedicated public object-storage/CDN path rather than embedding many large scenes in one JavaScript file.

## Verification still required

Verify the newest Vercel preview after the inline-scene commit:

- `/haldus-adaptive-lesson/` returns 200;
- the browser renders the scene without any separate `/adaptive-lessons/scenes/*.jpg` request;
- mobile Safari shows the full illustration rather than the fallback;
- header, stage strip, task card, judge buttons and floating controls do not overlap.

## Safety / unchanged areas

- no Firestore writes or schema changes;
- no finance/calendar/Live Classroom changes;
- no `crm-v2` changes;
- no production deployment until owner explicitly merges PR #82.

## Next safe step

Verify the latest preview for PR #82 on mobile Safari. If the full embedded scene renders correctly, update PR verification notes and ask the owner to merge only #82.