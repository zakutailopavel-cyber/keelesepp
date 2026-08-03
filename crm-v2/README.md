# KeeleSepp CRM v2

A separate React/Vite workspace for rebuilding the CRM without disrupting the current production interface.

## Run locally

```bash
cd crm-v2
npm install
npm run dev
```

## Current scope

- new application shell
- responsive sidebar and top navigation
- dashboard metrics
- lesson schedule overview
- attention/action queue

## Migration rule

The current CRM remains the source of truth until individual v2 modules are connected to Firebase and validated. No existing production routes are replaced by this workspace yet.
