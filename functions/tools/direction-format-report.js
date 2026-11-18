"use strict";

// „Õppesuunad: individuaalne / grupp” (2026-11-18): READ-ONLY report. Every existing enrollment reads as „Individuaalne”
// unless the card is a member of an active calendar group of that subject (and has no other track of that subject):
// then the CRM shows it as „Grupp?” (direction-format-core.js legacyGroupCandidates). Nothing is ever written: the
// administrator confirms each one in the „Õppesuunad” window, and only a stored format splits prices and packages.
//
//   cd functions && GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node tools/direction-format-report.js [--list]
//
// Prints the number of such tracks (and with --list: card id, subject, group id — no names, no prices).

const { legacyGroupCandidates } = require("../direction-format-core");

function summary(candidates = []) {
  const bySubject = {};
  for (const item of candidates) bySubject[item.subject] = (bySubject[item.subject] || 0) + 1;
  return { tracks: candidates.length, cards: new Set(candidates.map((item) => item.studentId)).size, bySubject };
}

async function main() {
  const admin = require("firebase-admin");
  const project = process.env.GCLOUD_PROJECT || "keelesepp-5136b";
  admin.initializeApp({ projectId: project });
  const db = admin.firestore();
  const [studentsSnap, groupsSnap] = await Promise.all([db.collection("students").get(), db.collection("groups").get()]);
  const students = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((card) => card.active !== false && !card.mergedIntoStudentId);
  const groups = groupsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const candidates = legacyGroupCandidates(students, groups);
  const result = summary(candidates);
  console.log(`${project}: ${students.length} active cards, ${groups.length} groups → ${result.tracks} tracks on ${result.cards} cards read as „Grupp?” (${Object.entries(result.bySubject).map(([subject, n]) => `${subject} ${n}`).join(", ") || "—"})`);
  if (process.argv.includes("--list")) candidates.forEach((item) => console.log(`  ${item.studentId} · ${item.subject} · group ${item.groupId}`));
  console.log("Read only: nothing written.");
}

module.exports = { summary };

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
