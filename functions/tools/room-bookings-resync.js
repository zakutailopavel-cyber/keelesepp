"use strict";

// Room bookings resync (Oleksiy 2026-10-22: „при отмене занятия через Tühista не освобождается кабинет”).
// roomBookings/{scheduleId} is written by the trigger syncRoomBooking on every schedule write. If a booking was ever
// left behind (a failed trigger run, a lesson written before the trigger was deployed), this script finds it.
//
// DRY RUN by default — it only reads and prints the plan:
//   cd functions && GOOGLE_APPLICATION_CREDENTIALS=<service-account.json> node tools/room-bookings-resync.js
// Apply (the owner's explicit permission only; writes roomBookings, never schedule):
//   ... node tools/room-bookings-resync.js --apply
// Every applied change is logged to activityLog/room-bookings-resync-<time> with the before values.

const admin = require("firebase-admin");
const { roomBookingResyncPlan } = require("../room-booking-core");

const APPLY = process.argv.includes("--apply");
const PROJECT = process.env.GCLOUD_PROJECT || "keelesepp-5136b";

async function main() {
  admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const [scheduleSnap, bookingSnap] = await Promise.all([db.collection("schedule").get(), db.collection("roomBookings").get()]);
  const schedules = scheduleSnap.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
  const bookings = bookingSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const plan = roomBookingResyncPlan(schedules, bookings);
  const before = new Map(bookings.map((booking) => [booking.id, booking]));

  console.log(`${PROJECT}: ${schedules.length} schedule entries, ${bookings.length} room bookings`);
  console.log(`write ${plan.write.length}, remove ${plan.remove.length}`);
  plan.write.forEach((item) => console.log(`  write  ${item.scheduleId}  (${item.reason})  ${item.booking.roomName || item.booking.roomId} ${item.booking.recurring ? `weekly ${item.booking.day}` : item.booking.date} ${item.booking.time}`));
  plan.remove.forEach((item) => { const old = before.get(item.scheduleId) || {}; console.log(`  remove ${item.scheduleId}  (${item.reason})  ${old.roomName || old.roomId || ''} ${old.recurring ? `weekly ${old.day}` : old.date || ''} ${old.time || ''}`); });

  if (!APPLY) { console.log("\nDry run: nothing was written. Add --apply (owner's permission) to fix the bookings above."); return; }
  if (!plan.write.length && !plan.remove.length) { console.log("Nothing to fix."); return; }
  const now = new Date().toISOString();
  const ops = [
    ...plan.write.map((item) => (batch) => batch.set(db.collection("roomBookings").doc(item.scheduleId), { ...item.booking, updatedAt: now })),
    ...plan.remove.map((item) => (batch) => batch.delete(db.collection("roomBookings").doc(item.scheduleId))),
  ];
  for (let index = 0; index < ops.length; index += 400) {
    const batch = db.batch();
    ops.slice(index, index + 400).forEach((op) => op(batch));
    await batch.commit();
  }
  await db.collection("activityLog").doc(`room-bookings-resync-${now.replace(/[:.]/g, "-")}`).set({
    type: "room-bookings-resync",
    at: now,
    written: plan.write.map((item) => ({ scheduleId: item.scheduleId, reason: item.reason, before: before.get(item.scheduleId) || null })),
    removed: plan.remove.map((item) => ({ scheduleId: item.scheduleId, reason: item.reason, before: before.get(item.scheduleId) || null })),
  });
  console.log(`Applied: ${plan.write.length} written, ${plan.remove.length} removed (activityLog entry saved).`);
}

main().catch((error) => { console.error(error); process.exit(1); });
