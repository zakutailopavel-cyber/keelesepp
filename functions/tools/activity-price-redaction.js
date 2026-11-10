"use strict";

// Review 2026-11-11 (B1): until then crm-v2 `revenuePlans.save` wrote the lesson price, per-subject prices,
// per-subject billing and the price terms into the `meta` of every `activityLog` entry `finance.revenue_plan_updated`,
// and every teacher could read activityLog. The client no longer writes them and the rules now let only admin /
// finance read finance.* entries; this removes the prices from the OLD entries.
//
// What it changes: only `activityLog` docs with type "finance.revenue_plan_updated" whose `meta` has a key outside
// KEPT_META_KEYS. Those keys are deleted; `meta.redactedAt` / `meta.redactedBy` record that it was done. type, label,
// byUid, byName, createdAt, date and the doc id stay — the entry still says who changed whose plan and when. The price
// history itself lives in `studentRevenuePlans/{studentId}.priceHistory` (admin / finance only) and is not touched.
//
// DRY RUN by default — it only reads and prints the plan:
//   cd functions && GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node tools/activity-price-redaction.js
// Apply (the owner's explicit permission only; from a fresh origin/main checkout, after a Firestore backup):
//   ... node tools/activity-price-redaction.js --apply
// Running it again is harmless (the second run finds nothing to write).

const TYPE = "finance.revenue_plan_updated";
const KEPT_META_KEYS = ["studentId", "studentName", "weeklyLessons", "billingMode", "subjectPricesChanged", "redactedAt", "redactedBy"];

// entries: [{ id, type, meta }] → [{ id, remove: [metaKey…], subjectPricesChanged }]
function redactionPlan(entries = []) {
  return entries
    .filter((entry) => entry && entry.type === TYPE && entry.meta && typeof entry.meta === "object")
    .map((entry) => ({
      id: entry.id,
      remove: Object.keys(entry.meta).filter((key) => !KEPT_META_KEYS.includes(key)).sort(),
      subjectPricesChanged: Object.prototype.hasOwnProperty.call(entry.meta, "subjectPrices"),
    }))
    .filter((item) => item.remove.length > 0);
}

// the update for one entry (FieldValue.delete per removed key, dotted paths so the kept meta keys stay)
function redactionUpdate(item, deleteValue, at) {
  const update = { "meta.redactedAt": at, "meta.redactedBy": "tools/activity-price-redaction.js" };
  for (const key of item.remove) update[`meta.${key}`] = deleteValue;
  if (item.subjectPricesChanged) update["meta.subjectPricesChanged"] = true;
  return update;
}

async function main() {
  const admin = require("firebase-admin");
  const apply = process.argv.includes("--apply");
  const project = process.env.GCLOUD_PROJECT || "keelesepp-5136b";
  admin.initializeApp({ projectId: project });
  const db = admin.firestore();
  const snap = await db.collection("activityLog").where("type", "==", TYPE).get();
  const plan = redactionPlan(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  const keys = [...new Set(plan.flatMap((item) => item.remove))].sort();
  console.log(`${project}: ${snap.size} ${TYPE} entries, ${plan.length} with price data (keys: ${keys.join(", ") || "—"})`);
  if (!apply) {
    console.log("Dry run: nothing written. Add --apply (owner's permission) to remove those keys.");
    return;
  }
  const at = new Date().toISOString();
  for (let i = 0; i < plan.length; i += 400) {
    const batch = db.batch();
    plan.slice(i, i + 400).forEach((item) => batch.update(db.collection("activityLog").doc(item.id), redactionUpdate(item, admin.firestore.FieldValue.delete(), at)));
    await batch.commit();
    console.log(`  written ${Math.min(i + 400, plan.length)} / ${plan.length}`);
  }
  console.log("Done.");
}

module.exports = { redactionPlan, redactionUpdate, KEPT_META_KEYS, TYPE };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
