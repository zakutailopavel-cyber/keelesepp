# Finance v3 — staged delivery specification

Status: implementation starts with draft PR #361 on `agent/finance-v3-rows`, rebased onto `origin/main` `d74b3cc` (2026-10-07). Do not merge or deploy from this work.

## Product decisions

- Deliver one reviewable, green PR at a time, in dependency order. Keep the current Finance v2 services and mutation APIs as the source of truth.
- The new monthly screen becomes `/finance` only in PR 2. Preserve the current screen at `/finance/vana` during transition.
- Do not send invoices or reminders from background UI actions; existing explicit user actions continue to gate delivery.
- Keep financial amounts in integer cents for summaries and balances. A credit note remains a separate accounting record and must not be represented as a negative open balance.
- For a row with a positive balance, overdue takes precedence over partial-payment, failed-email, and no-show attention states. Fully paid and credited rows do not count as overdue.
- A due date is current for the full local calendar day; overdue begins the next day.
- Billing basis confirmed by the owner on 2026-10-07: the default is **one month in advance**. The invoice created during the current month uses the next month's planned calendar lessons; differences from the prior month remain explicit correction lines.
- Some students have an individual agreement to pay **after lessons actually take place**. Store this as an effective-dated student billing-plan override, not as a global switch or an invoice-row guess. Actual billing uses only chargeable lesson outcomes for the completed period. Changing the mode must never rewrite issued invoices or earlier billing history.
- The exact default due date for actual-lesson billing is still an owner decision. The HTML prototype shows the 10th of the following month as a proposal; implementation must not hard-code it until confirmed.
- Do not use production data or send real e-mail for screenshots or tests. Do not deploy, migrate production data, or merge these PRs.

## PR sequence

1. **`agent/finance-v3-rows`** — `financeRows.js`: row-state derivation, monthly summaries, sorting, and filters, with unit coverage for unpaid, partial, paid, overdue, credit, email failure, and no-show states. Add this specification and update `docs/PROJECT_STATE.md`.
2. **`agent/finance-v3-screen`** — create `FinanceMonthPage.jsx`; extract current data loading into `useFinanceData.js` using existing services; route `/finance` to the new page and preserve `FinancePage` at `/finance/vana`. Component tests mock APIs and cover invoice creation plus sending, payment registration, reminder, inline price/e-mail editing, and batch creation progress/error.
3. **`agent/finance-v3-settings`** — add the Finance “Seaded” page and navigation; preserve aliases for old links; point notification and dashboard links to the new screen.
4. **`agent/finance-v3-debts`** — add “Võlgnevused” for all unpaid past invoices and “Impordi pank” in a modal; imported transactions update row state immediately.
5. **`agent/finance-v3-cleanup`** — only after the owner confirms the new screen, remove obsolete `FinancePage` parts and update docs.

## Required checks before each PR

Run from `crm-v2`:

```sh
npx vitest run src/features/finance src/features/students src/services/firebase
npx vitest run --maxWorkers=4
npx eslint .
npm run build
```

Known full-suite exception at plan authoring: exactly 10 `live-classroom` / “Alusta tundi” failures attributed to Node 26 `localStorage`; no other failures are acceptable. Reconfirm against current `main` before treating this as an exception. For PR 2, attach desktop and 375 px screenshots generated locally with mocks/emulator, never real production actions or data.

## Definition of done for every PR

- Put a current entry at the top of `docs/PROJECT_STATE.md`: goal, completed work, files, exact check results, limits, and one safe next step.
- PR report states: result; files; tests; data/security risks; production/external-service use (must be “no”); PR status; next step. List owner decisions needed at the end.
- Do not merge or deploy.
