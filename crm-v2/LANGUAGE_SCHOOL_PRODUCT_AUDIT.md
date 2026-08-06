# KeeleSepp CRM v2: product audit for a language school

## Product principle

The CRM should optimize the daily work of a language school administrator, teacher, parent and student. Features that are powerful but rarely used should not dominate navigation or primary screens.

A common operation should normally take no more than three clear actions. Daily actions must be visible without opening nested menus.

## Must have

### Student management

- fast search by name, phone and email;
- filters by teacher, level, group and active state;
- one central student profile;
- schedule, attendance, lesson history and progress;
- parent and payer details;
- invoice, payment, advance and debt history;
- internal administrator notes and audit trail;
- safe archive instead of destructive deletion.

### Scheduling and attendance

- recurring individual and group lessons;
- conflict prevention for teacher and student;
- cancellation, late cancellation and no-show states;
- attendance marking directly from the calendar;
- teacher replacement and holiday handling;
- clear mobile weekly view.

### Finance

- student lesson price and billing rules;
- invoice creation from completed billable lessons;
- batch invoice creation for a billing period;
- invoice PDF, delivery and reminder state;
- payment registration and bank reconciliation;
- partial payments, overpayments, advances and refunds;
- overdue queue;
- monthly reconciliation and export;
- teacher payroll hours separated from customer billing.

### Teacher workspace

- own schedule and students only;
- fast lesson completion and attendance;
- homework assignment;
- progress notes;
- monthly teaching hours;
- no access to unrelated finance or students.

### Parent and student self-service

- upcoming schedule;
- homework and materials;
- messages;
- attendance and progress summary;
- invoices and payment status for authorized payer roles;
- contact data editing with controlled permissions.

## Should have

- group capacity and free-place tracking;
- automated invoice reminders;
- student retention and inactivity warnings;
- teacher workload overview;
- registration review and duplicate detection;
- reusable learning-material library;
- simple revenue forecast;
- document attachment and preview;
- export for accounting and payroll.

## Useful but should stay secondary

These features are valid, but should live behind secondary navigation or expandable panels:

- immutable financial audit history;
- credit-note line corrections;
- payment voiding;
- parent-profile merging;
- security migration controls;
- detailed annual revenue forecasts;
- advanced worksheet authoring;
- raw Firebase connection diagnostics;
- period-close technical reconciliation details.

They are important for exceptional cases, not for the main daily workflow.

## Potentially excessive or misplaced

### Full worksheet authoring inside the CRM

Creating complex worksheets with every possible block type turns the CRM into a learning-content authoring platform. Keep basic material creation and assignment, but consider moving advanced authoring into a dedicated Materials workspace with separate navigation.

### Too many finance operations on one screen

Invoice creation, bank CSV reconciliation, advances, refunds, credit notes, payment voiding and month close should not appear as equal primary sections. The default finance screen should show:

1. create invoices;
2. unpaid and overdue invoices;
3. incoming payments;
4. monthly summary.

Advanced corrections belong in an "Advanced finance" section.

### Technical migration controls in normal settings

Teacher UID migration and strict-read controls are operational tools. Hide them from ordinary administrators unless the current user is a super administrator.

### Duplicate entry points

Avoid multiple identical "Create invoice", "Open student" or "Send reminder" buttons on the same screen. Use one strong primary action and contextual row actions only where they save time.

## Recommended navigation

### Main navigation

1. Dashboard
2. Calendar
3. Students
4. Groups
5. Finance
6. Messages
7. Materials
8. Staff
9. Settings

### Role-specific simplification

- Teacher: Dashboard, Calendar, Students, Groups, Homework, Messages, Materials.
- Finance: Dashboard, Finance, Students read-only, Reports.
- Parent: Home, Children, Schedule, Homework, Messages, Invoices.
- Student: Home, Schedule, Homework, Materials, Messages, Progress.

## UX rules

- one primary action per page;
- no hidden daily actions;
- status labels must use plain language;
- destructive or irreversible actions require confirmation and explanation;
- tables must have mobile card layouts;
- empty states must explain the next action;
- filters should preserve state when returning from a profile;
- every successful operation should show what changed and the next useful action;
- advanced technical terms should not appear in normal administrator workflows;
- finance amounts and statuses must remain consistent across profile, invoice list and dashboard.

## Priority roadmap

### P0: release safety

- complete role-based acceptance tests;
- enable strict teacher data scoping only after acceptance;
- verify finance creation, payment, reconciliation and month-close flows;
- remove dead links and duplicate primary actions.

### P1: daily usability

- centralize student finance history in the student profile;
- add batch invoice creation;
- simplify the finance landing page;
- add global student search;
- preserve filters and navigation context;
- improve mobile calendar and attendance marking.

### P2: operational efficiency

- automated reminders;
- teacher payroll summary;
- group capacity and retention alerts;
- accounting exports;
- registration-to-student onboarding workflow.

### P3: optional platform features

- advanced worksheet authoring;
- deeper analytics;
- custom report builder;
- additional content formats.

## Acceptance criteria for user-friendly features

A feature is ready only when:

- a first-time administrator can understand it without documentation;
- the primary task takes no more than three actions in the normal case;
- mobile use is supported;
- loading, empty, success and error states are present;
- role permissions are tested;
- duplicate or conflicting entry points are removed;
- the feature has a clear owner and a realistic daily or monthly use case.
