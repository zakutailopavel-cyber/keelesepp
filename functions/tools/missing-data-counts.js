"use strict";

// „Puuduvad andmed” (owner 2026-10-25): READ-ONLY counts of what active cards miss, with the current setting (or the
// defaults when the administrator has not saved it) — the same rules as staffOperationsApi /missing-data/report.
// Prints counts only (no names, no contacts). Writes nothing.
//   cd functions && GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node tools/missing-data-counts.js

const admin = require("firebase-admin");
const { report } = require("../missing-data-service");

const PROJECT = process.env.GCLOUD_PROJECT || "keelesepp-5136b";

async function main() {
  admin.initializeApp({ projectId: PROJECT });
  const { settings, totals, rows } = await report(admin.firestore());
  const kinds = rows.reduce((all, row) => ({ ...all, [row.kind]: (all[row.kind] || 0) + 1 }), {});
  const accounts = rows.reduce((all, row) => ({ ...all, [row.account]: (all[row.account] || 0) + 1 }), {});
  const required = rows.filter((row) => row.required.length);
  console.log(`${PROJECT}: ${totals.cards} active cards`);
  console.log("settings:", JSON.stringify(settings));
  console.log("kind:", JSON.stringify(kinds), " accounts:", JSON.stringify(accounts));
  console.log(`missing anything: ${totals.withMissing}; missing a required item: ${required.length}`);
  console.log(`  of those with an account (would see the form): ${totals.wouldSee}; without any account: ${required.filter((row) => row.account === "none").length}`);
  Object.entries(totals.items).forEach(([item, count]) => console.log(`  ${item.padEnd(13)} ${String(count.cards).padStart(3)} cards  (account ${count.withAccount}, no account ${count.withoutAccount})`));
}

main().catch((error) => { console.error(error); process.exit(1); });
