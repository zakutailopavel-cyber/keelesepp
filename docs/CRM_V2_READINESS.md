# CRM v2 readiness

## Scope

CRM v2 now has implemented routes for every item in its role-aware navigation: dashboard, students, calendar, groups,
parents, learning library, Live Classroom, teachers, homework, finance, communication and settings. Parent and student
dashboards are separate role-scoped routes. The legacy v1 remains available during the controlled transition.

## Code readiness

- No CRM v2 route uses `PlaceholderPage`.
- Authentication and route access continue to use the shared access policy.
- Financial mutations continue to use the trusted finance APIs.
- Existing Firebase collections, immutable IDs, audit history and role scopes are unchanged by the final UX pass.
- Homework and settings use the same operational overview and responsive visual language as the rest of v2.
- Long homework and submission lists use browser rendering containment, with visible keyboard focus retained.

## Verification gate

The release candidate must pass:

1. ESLint and a production build.
2. Focused tests for every changed feature.
3. The complete CRM v2 suite. If host contention causes only five-second test timeouts, every affected file must pass
   in a recorded serial rerun; assertion failures are not acceptable.
4. GitHub `verify`, security regression and Vercel preview checks.
5. Authenticated smoke tests for administrator, teacher, parent and student roles before making v2 the default.

## Transition gate

Merging this UX PR does not retire v1 and does not authorize a production deployment, rules deployment or data
migration. Making v2 the default requires explicit owner approval after authenticated role smokes. v1 should remain
available as the fallback until real daily use confirms that calendar, finance, communication, homework and learning
content workflows are stable.

## Migration plan

The step-by-step migration plan, including the owner's decision of 2026-09-29 that Worksheet Studio is the only
authoring tool, is in [CRM_V2_MIGRATION_PLAN.md](CRM_V2_MIGRATION_PLAN.md).
