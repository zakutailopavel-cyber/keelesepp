# PROJECT STATE

## Adaptive Lesson scene delivery

Desktop-first scene delivery uses Firebase Storage in the legacy/first KeeleSepp CRM architecture.

Flow:

`lesson task -> sceneId -> scene registry metadata -> Firebase Storage path`

Current reference scene:

- scene ID: `bus-delay-01`
- lesson ID: `est-b1-city-problem-solving-01`
- Storage path: `lesson-scenes/est-b1-city-problem-solving-01/bus-delay-01.jpg`
- registry: `adaptive-lessons/scenes.js`
- uploader: `/haldus-adaptive-scenes/`
- lesson player: `/haldus-adaptive-lesson/`

The uploader uses the same Firebase project and authentication as the legacy CRM. It must be opened on the production CRM origin (`crm.epkoolitus.ee`) in a browser where the staff user is already signed in. A Vercel preview origin does not share the production Firebase Auth persistence.

`storage.rules` now includes a dedicated `lesson-scenes/**` rule: scene images are non-sensitive teaching assets and may be read publicly; only authenticated staff can create, replace or delete them, and normal safe-content limits still apply.

This lets Lesson Mode render scene assets without embedding image bytes in HTML/JavaScript and without requiring a learner Firebase session, while scene management remains staff-only.

Desktop rollout gate:

1. merge the reviewed code;
2. deploy the updated Firebase Storage rules with `firebase deploy --only storage --project keelesepp-5136b`;
3. open `https://crm.epkoolitus.ee/haldus-adaptive-scenes/` while signed into the legacy CRM;
4. upload the approved bus-delay illustration;
5. open `https://crm.epkoolitus.ee/haldus-adaptive-lesson/` and verify the scene renders;
6. only after desktop is stable, continue mobile Safari polish.

The uploader includes direct navigation back to the legacy CRM and to Lesson Mode, and explicitly explains the production-origin authentication requirement.

CRM v2 is not part of this workstream.