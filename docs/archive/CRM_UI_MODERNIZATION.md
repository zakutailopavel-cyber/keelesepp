# KeeleSepp CRM UI modernization

## Goal

Modernize the existing CRM without replacing its working Firebase, calendar, finance, learning-material and staff-time logic.

The visual direction borrows proven admin-dashboard patterns: clear hierarchy, compact navigation, consistent cards, accessible focus states, responsive tables and predictable status colors. TailAdmin is treated as a reference, not copied as a dependency.

## Principles

1. Preserve existing workflows and Firestore data contracts.
2. Improve shared CSS before restructuring individual screens.
3. Keep owner, teacher and student views role-specific.
4. Make desktop information-dense and mobile task-focused.
5. Introduce reusable design tokens and avoid one-off inline styling.
6. Ship changes in small reversible pull requests.

## Phase 1 — shared visual foundation

- design tokens for color, spacing, radii and shadows;
- improved cards, buttons, inputs, badges and sidebar states;
- accessible keyboard focus;
- responsive tables and horizontal overflow protection;
- reduced-motion support;
- clearer print behavior.

## Phase 2 — owner dashboard

- KPI cards: active students, lessons, overdue invoices, monthly income;
- today panel and manager alerts;
- quick actions;
- compact revenue and attendance trends;
- empty, loading and error states.

## Phase 3 — student CRM

- searchable and filterable student table;
- student profile header with status and next lesson;
- tabs for lessons, progress, homework, invoices and notes;
- consistent action placement;
- mobile summary-first layout.

## Phase 4 — calendar and finance

- unified toolbar patterns;
- clearer conflict and payment status indicators;
- sticky table headers;
- task-oriented finance workspace;
- safer destructive actions and confirmations.

## Phase 5 — component extraction

The current CRM is intentionally kept working while repeated UI patterns are identified. Components should then be extracted gradually from `haldus.html` into maintainable modules or a build-based React application. A full framework migration should happen only after the shared UI and data contracts are stable.

## Acceptance criteria for each phase

- no data model changes unless explicitly documented;
- no role-permission regression;
- desktop and mobile smoke tests;
- keyboard-visible focus states;
- existing calendar, invoice and lesson workflows remain usable;
- changes can be reverted independently.
