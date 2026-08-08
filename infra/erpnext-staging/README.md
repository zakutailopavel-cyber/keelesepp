# KeeleSepp ERPNext disposable staging

This directory automates the first live finance integration check against the official Frappe Docker evaluation stack.

## One command

From the KeeleSepp repository:

```bash
bash infra/erpnext-staging/run-live-smoke.sh
```

The command:

1. clones/refreshes the official `frappe/frappe_docker` repository;
2. starts its disposable `pwd.yml` ERPNext stack;
3. waits for the HTTP API;
4. signs in to the evaluation site as `Administrator`;
5. ensures the test company `E&P Koolitus OÜ`;
6. ensures the non-stock item `KEELESEPP-LESSON`;
7. creates the KeeleSepp integration Custom Fields;
8. creates a dedicated integration user with Accounts Manager + Sales Manager roles;
9. generates API key/secret credentials and writes them to a mode-600 file outside the repository;
10. runs `functions/erpnext-live-smoke.js`;
11. requires invoice/payment/idempotency checks to pass.

Default evaluation credentials follow the official `frappe_docker` `pwd.yml` documentation: `Administrator / admin`. Override them with `FRAPPE_ADMIN_USER` and `FRAPPE_ADMIN_PASSWORD` if the demo stack changes.

## Expected success gate

The smoke test must prove all of the following before KeeleSepp staging is switched to `FINANCE_PROVIDER=erpnext`:

- Frappe token authentication succeeds;
- Customer mapping is created once;
- Sales Invoice is created and submitted;
- Payment Entry closes the outstanding amount;
- replaying the same billing request returns the same Sales Invoice;
- replaying payment on a fully paid invoice becomes an idempotent no-op.

## Safety

`pwd.yml` is disposable evaluation infrastructure, not production. Use synthetic data only. Production `crm.epkoolitus.ee` stays untouched. If the spike succeeds, a persistent ERPNext environment must use the official production deployment path rather than promoting this demo stack.
