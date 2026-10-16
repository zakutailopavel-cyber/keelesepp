# Archive: course modules before design v2

The owner (2026-10-16): „старые версии тоже можно было бы сохранить на всякий случай”. When a module is rewritten in
design v2 (`docs/COURSE_DESIGN_COMMUNICATIVE.md`), its previous file is copied here unchanged, e.g.
`archive/v1/b1/module02.js` is B1 module 2 as it was before the rewrite. Only the `blocks.js` import path is adjusted.

- The files are **not imported** by `registry.js`; the course and the CRM use only `b1/`, `b2/` and the other live folders.
- To bring an old module back: copy the file over the live one (`archive/v1/b1/moduleNN.js` → `b1/moduleNN.js`), put the
  import back to `'../blocks.js'`, remove the module from `strictModules.json` if it no longer passes the v2 gates, and
  run the course tests. The git history keeps every version too.
- Published sheets are versioned separately in the CRM: every save or publish writes `worksheetVersions/…`, and the
  constructor's „Versioonid ja taastamine…” compares and restores a version (one task or the whole sheet).
