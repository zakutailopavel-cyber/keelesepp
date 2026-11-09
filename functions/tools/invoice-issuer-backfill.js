"use strict";

// „Arve väljastaja” (owner 2026-11-09, docs/ACCOUNTING.md „FIE arved”): every invoice made before the FIE feature is a
// company invoice. Firestore rules let another administrator and the bookkeeper LIST invoices only with
// where("issuer", "==", "company"), so the old invoices need the field to stay in their lists. This adds
// `issuer: "company"` to invoices WITHOUT the field — and nothing else: no number, amount, status, date or history
// changes, no audit noise (a classification field, not a correction). An invoice that has the field is never touched.
//
// DRY RUN by default — it only reads and prints the plan:
//   cd functions && GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node tools/invoice-issuer-backfill.js
// Apply (the owner's explicit permission only; run AFTER the functions are deployed and BEFORE the rules + hosting):
//   ... node tools/invoice-issuer-backfill.js --apply
// Running it again is harmless (the second run finds nothing to write).

const admin = require("firebase-admin");
const { backfillPlan } = require("../invoice-issuer-core");

const APPLY = process.argv.includes("--apply");
const PROJECT = process.env.GCLOUD_PROJECT || "keelesepp-5136b";

async function main() {
  admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const snap = await db.collection("invoices").get();
  const plan = backfillPlan(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  console.log(`${PROJECT}: ${plan.total} invoices, ${plan.missing} without issuer (fingerprint ${plan.fingerprint})`);
  if (!APPLY) {
    console.log("Dry run: nothing written. Add --apply (owner's permission) to set issuer: \"company\" on them.");
    return;
  }
  for (let i = 0; i < plan.ids.length; i += 400) {
    const batch = db.batch();
    plan.ids.slice(i, i + 400).forEach((id) => batch.update(db.collection("invoices").doc(id), { issuer: "company" }));
    await batch.commit();
    console.log(`  written ${Math.min(i + 400, plan.ids.length)} / ${plan.ids.length}`);
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
