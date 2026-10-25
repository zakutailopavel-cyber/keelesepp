"use strict";

// Partners on the existing OA / VM entries (the accountant 2026-10-24: „привяжи их к проводкам”; docs/ACCOUNTING.md
// „Partnerid”). Every line of an ostuarve (OA) or supplier payment (VM) entry gets the supplier of its purchase
// invoice as its partner. A line that already has a partner is not changed.
//
// DRY RUN by default — it only reads and prints the plan:
//   cd functions && GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node tools/accounting-partner-backfill.js
// Apply (the owner's explicit permission only; writes accountingEntries.lines + history and one financialAudit
// record per entry; entries in a locked period or a closed month are skipped):
//   ... node tools/accounting-partner-backfill.js --apply
// Manual (PR) and opening entries on 2110 / 1350 typed before the Tarnijad existed: the dry run lists the supplier
// whose name or registry code is in the entry's text (exactly one match); they are written only with
//   ... node tools/accounting-partner-backfill.js --apply-manual
// The dry run also counts sales lines (1200 / 2500) without a customer — information only, nothing is planned for them.

const admin = require("firebase-admin");
const { manualPartnerSuggestions, partnerBackfillPatch, partnerBackfillPlan } = require("../accounting-partner-core");

const APPLY = process.argv.includes("--apply");
const APPLY_MANUAL = process.argv.includes("--apply-manual");
const PROJECT = process.env.GCLOUD_PROJECT || "keelesepp-5136b";

async function main() {
  admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const [entrySnap, invoiceSnap, supplierSnap, lockSnap, closedSnap] = await Promise.all([
    db.collection("accountingEntries").get(),
    db.collection("purchaseInvoices").get(),
    db.collection("suppliers").get(),
    db.collection("accountingSettings").doc("lock").get(),
    db.collection("financialLockedDates").get(),
  ]);
  const entries = entrySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const lockedThrough = lockSnap.exists ? String(lockSnap.get("lockedThrough") || "") : "";
  const plan = partnerBackfillPlan({
    entries,
    purchaseInvoices: invoiceSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    suppliers: supplierSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    lockedThrough,
    closedDates: closedSnap.docs.map((doc) => doc.id),
  });

  const suppliers = supplierSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const manual = manualPartnerSuggestions({ entries, suppliers, lockedThrough, closedDates: closedSnap.docs.map((doc) => doc.id) });
  const live = entries.filter((e) => !e.deleted);
  const salesLines = live.flatMap((e) => (e.lines || []).filter((l) => ["1200", "2500"].includes(String(l.account))));
  const supplierLines = live.flatMap((e) => (e.lines || []).filter((l) => ["2110", "1350"].includes(String(l.account))));
  console.log(`${PROJECT}: ${entries.length} entries (${live.length} not deleted), ${invoiceSnap.size} purchase invoices, ${supplierSnap.size} suppliers, locked through ${lockedThrough || "—"}, ${closedSnap.size} closed days`);
  console.log(`OA / VM entries: ${plan.purchaseEntries}`);
  console.log(`  to update: ${plan.update.length} entries, ${plan.linesToSet} lines`);
  plan.update.forEach((item) => console.log(`    ${item.number}  ${item.date}  ${item.documentType}  ${item.documentRef}  → ${item.partner.name}  (lines ${item.lineIndexes.map((i) => i + 1).join(", ")})`));
  console.log(`  already set: ${plan.alreadySet.length}`);
  console.log(`  deleted (left alone): ${plan.deleted.length}`);
  console.log(`  locked period / closed month (skipped): ${plan.locked.length}`);
  plan.locked.forEach((item) => console.log(`    ${item.number}  ${item.date}`));
  console.log(`  no purchase invoice found: ${plan.noInvoice.length}`);
  plan.noInvoice.forEach((item) => console.log(`    ${item.number}  ${item.date}  ${item.documentRef}`));
  console.log(`  supplier card missing: ${plan.noSupplier.length}`);
  plan.noSupplier.forEach((item) => console.log(`    ${item.number}  ${item.supplierName} (${item.supplierId})`));
  console.log(`  conflicts (a different partner already on a line): ${plan.conflicts.length}`);
  plan.conflicts.forEach((item) => console.log(`    ${item.number} line ${item.line}: ${item.current.name} ≠ ${item.expected.name}`));
  console.log(`Manual / opening entries with 2110 / 1350 lines without a partner: ${manual.suggest.length + manual.ambiguous.length + manual.none.length + manual.locked.length}`);
  console.log(`  supplier found in the text: ${manual.suggest.length} entries, ${manual.linesToSet} lines`);
  manual.suggest.forEach((item) => console.log(`    ${item.number}  ${item.date}  ${item.documentRef} | ${item.text}  → ${item.partner.name}`));
  console.log(`  several suppliers match (pick in the päevaraamat): ${manual.ambiguous.length}`);
  manual.ambiguous.forEach((item) => console.log(`    ${item.number}  ${item.date}  ${item.text}  ? ${item.candidates.join(" / ")}`));
  console.log(`  no supplier matches: ${manual.none.length}`);
  manual.none.forEach((item) => console.log(`    ${item.number}  ${item.date}  ${item.documentRef} | ${item.text}`));
  console.log(`  locked period / closed month (skipped): ${manual.locked.length}`);
  console.log(`Supplier-account lines (2110 / 1350): ${supplierLines.length}, without partner ${supplierLines.filter((l) => !l.partner).length}`);
  console.log(`Customer-account lines (1200 / 2500): ${salesLines.length}, without partner ${salesLines.filter((l) => !l.partner).length} (not changed by this script)`);

  if (!APPLY && !APPLY_MANUAL) { console.log("\nDry run: nothing was written. --apply (OA / VM) or --apply-manual (text matches) with the owner's permission."); return; }
  const nowIso = new Date().toISOString();
  const runId = `partner-backfill-${nowIso.replace(/[:.]/g, "-")}`;
  const actorData = { uid: "script", name: "accounting-partner-backfill", email: "" };
  const byId = new Map(entries.map((e) => [e.id, e]));
  const invoices = invoiceSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const closedDates = closedSnap.docs.map((doc) => doc.id);
  // each entry is planned again inside its transaction (it may have changed since the plan was read)
  const write = async (items, replan, reason) => {
    let written = 0;
    for (const item of items) {
      const ref = db.collection("accountingEntries").doc(item.id);
      await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(ref);
        if (!snap.exists) return;
        const current = { id: snap.id, ...snap.data() };
        const again = replan(current);
        if (!again) return;
        const { patch, before, after } = partnerBackfillPatch(current, again, { nowIso, actorData, reason });
        transaction.update(ref, patch);
        transaction.create(db.collection("financialAudit").doc(`${runId}_${item.id}`.slice(0, 700)), { entityType: "accountingEntry", entityId: item.id, action: "accounting.entry.partner", number: current.number, reason, before, after, createdAt: nowIso, createdBy: actorData, requestId: runId });
        written += 1;
      });
    }
    return written;
  };
  if (APPLY) {
    const written = await write(plan.update, (current) => partnerBackfillPlan({ entries: [current, ...(current.reversalOf && byId.has(current.reversalOf) ? [byId.get(current.reversalOf)] : [])], purchaseInvoices: invoices, suppliers, lockedThrough, closedDates }).update.find((u) => u.id === current.id), "Partneri lisamine (tarnija ostuarvelt)");
    console.log(`Applied OA / VM: ${written} entries updated (financialAudit ${runId}_*).`);
  }
  if (APPLY_MANUAL) {
    const written = await write(manual.suggest, (current) => manualPartnerSuggestions({ entries: [current], suppliers, lockedThrough, closedDates }).suggest.find((u) => u.id === current.id), "Partneri lisamine (tarnija nimi kande tekstis)");
    console.log(`Applied manual: ${written} entries updated (financialAudit ${runId}_*).`);
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
