# HANDOFF — Õppevara Visual Navigation v1

Date: 2026-09-14 (Europe/Tallinn)
Base: `cc8e80f8b410793b15d8661f0c65fe1ba9b2f66c`
Branch: `codex/oppevara-visual-navigation-v1`
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/148

## Result

- `Õppekavad` is first and is the default Õppevara tab.
- Explicit `?tab=library` still opens `Raamatukogu`.
- Subject cards preview real loaded topics instead of feeling like isolated empty cards.
- Level cards show short guidance plus up to three real topics and open the first topic from that exact level.
- Long topic names wrap in the left rail.
- Lesson cards include a compact clickable material preview. `worksheetData.blocks` shows block count and the
  first learner-facing content fragment; no answer/key fields are read. Without worksheet data, the card says
  `Töölehe lähteülesanne` and previews only `practice`, `goal`, `description` or `worksheetPrompt`.
- Clicking the mini preview reuses the existing `WorksheetPreviewModal` in the same workspace.
- Local preview fixtures cover both a real B1 worksheet and an honest B2 source-task state.

## Validation

- Focused Node suite: PASS — required 5-file Node suite
- `git diff --check`: PASS
- Local `LOCAL_LIBRARY_PREVIEW`: PASS — localhost ?preview=library; default Õppekavad, explicit library deep link, B1/B2 mini-preview → WorksheetPreviewModal, no actionable console errors
- Firebase/production deployment: NOT RUN and not required for this client-only slice.

## Data and security impact

Presentation and navigation only. No Firestore/Storage rules, Cloud Functions, schema, migrations, student
records, financial data or production writes are changed. Mini-preview extraction intentionally excludes
answer/key fields.

## Risks / limitations

The execution environment cannot mount `/Users/pavel/Documents/ep koolitus/keelesepp-unified-workspace-v1`,
so it cannot see the owner's exact uncommitted CSS diff. The stated CSS intent was recreated on the exact
remote base as an override layer and must be visually compared in the PR preview. The localhost preview uses
non-production fixtures and is not evidence of production Firebase data shape.

## Next safe step

Review the automatic Vercel preview through `Õppekavad → Eesti keel → B1/B2 → teema → töölehe eelvaade` and
merge only if that visual comparison is accepted.
