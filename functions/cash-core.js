"use strict";

// Cash payers and the cash box (owner 2026-10-18, team chat 2026-10-17): some payers pay in cash. Any staff member
// (a teacher at the lesson or an administrator) records that they took the money; the money stays with that person
// until they hand it over to someone else. An administrator then links the receipt to the payer's invoice, which
// records an ordinary invoice payment with method „cash” instead of a bank match.
//
// cashLedger/{id} — server writes only:
//   receipt:  { type: "receipt", holderUid, holderName, amountCents, receivedAt, studentId, studentName, payerName,
//               note, status: "open" | "allocated" | "void", invoiceId, paymentId }
//   handover: { type: "handover", fromUid, fromName, toUid, toName, amountCents, handedAt, note, status: "active" | "void" }
// A person's cash = their open and allocated receipts + handovers received − handovers given (void entries ignored).

const { appToday } = require("./local-date-core");

function cashError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function amountToCents(value) {
  const number = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) throw cashError("Summa peab olema positiivne arv.");
  const cents = Math.round(number * 100);
  if (Math.abs(number * 100 - cents) > 0.000001) throw cashError("Summal võib olla kuni kaks kohta pärast koma.");
  if (cents > 10000000) throw cashError("Summa on liiga suur.");
  return cents;
}

function cashDay(value, nowIso) {
  const today = appToday(nowIso);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : today;
  if (day > today) throw cashError("Kuupäev ei saa olla tulevikus.");
  return day;
}

const clean = (value, max = 500) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// the teachers of a student card: the main teacher and every study track's teacher
function studentTeacherUids(student = {}) {
  return [student.teacherUid, ...(student.enrollments || []).map(track => track?.teacherUid)].filter(Boolean).map(String);
}

/** A new receipt: the actor took cash from a payer. A teacher records only for themselves and their own students. */
function receiptEntry({ actor, isAdmin, values = {}, studentId, student, holder, nowIso }) {
  if (!student || student.active === false || student.mergedInto) throw cashError("Õpilase kaarti ei leitud.", 404);
  if (!isAdmin && !studentTeacherUids(student).includes(actor.uid)) throw cashError("See ei ole sinu õpilane.", 403);
  if (!holder?.uid) throw cashError("Vali, kelle käes raha on.");
  if (!isAdmin && holder.uid !== actor.uid) throw cashError("Õpetaja märgib ainult raha, mille ta ise sai.", 403);
  return {
    type: "receipt",
    holderUid: holder.uid,
    holderName: clean(holder.name, 120),
    amountCents: amountToCents(values.amount),
    receivedAt: cashDay(values.receivedAt, nowIso),
    studentId: String(studentId),
    studentName: clean(student.name, 120),
    payerName: clean(student.parentName || student.payerName || student.name, 120),
    note: clean(values.note),
    status: "open",
    invoiceId: null,
    paymentId: null,
    createdAt: nowIso,
    createdBy: { uid: actor.uid, name: clean(actor.name, 120) },
  };
}

/** Balances by person: { uid: { uid, name, cents } }. */
function cashBalances(entries = []) {
  const out = {};
  const add = (uid, name, cents) => {
    if (!uid) return;
    const row = out[uid] || (out[uid] = { uid, name: "", cents: 0 });
    if (name && !row.name) row.name = name;
    row.cents += cents;
  };
  for (const entry of entries) {
    if (!entry || entry.status === "void") continue;
    const cents = Number(entry.amountCents) || 0;
    if (entry.type === "receipt") add(entry.holderUid, entry.holderName, cents);
    if (entry.type === "handover") { add(entry.fromUid, entry.fromName, -cents); add(entry.toUid, entry.toName, cents); }
  }
  return out;
}

/** A handover: `from` gives cash to `to`. A teacher hands over only their own cash; nobody gives more than they hold. */
function handoverEntry({ actor, isAdmin, values = {}, from, to, balanceCents, nowIso }) {
  if (!from?.uid || !to?.uid) throw cashError("Vali, kes annab ja kes saab raha.");
  if (from.uid === to.uid) throw cashError("Raha ei saa anda iseendale.");
  if (!isAdmin && from.uid !== actor.uid) throw cashError("Üle saab anda ainult enda käes olevat raha.", 403);
  const amountCents = amountToCents(values.amount);
  if (amountCents > balanceCents) throw cashError(`${from.name || "Andjal"} on kassas ainult ${(balanceCents / 100).toFixed(2)} €.`, 409);
  return {
    type: "handover",
    fromUid: from.uid,
    fromName: clean(from.name, 120),
    toUid: to.uid,
    toName: clean(to.name, 120),
    amountCents,
    handedAt: cashDay(values.handedAt, nowIso),
    note: clean(values.note),
    status: "active",
    createdAt: nowIso,
    createdBy: { uid: actor.uid, name: clean(actor.name, 120) },
  };
}

/** What a staff member sees: an administrator everything, a teacher the entries where they hold, give or get money. */
function visibleEntries(entries = [], { uid, isAdmin }) {
  if (isAdmin) return entries;
  return entries.filter(entry => entry.holderUid === uid || entry.fromUid === uid || entry.toUid === uid || entry.createdBy?.uid === uid);
}

// ---- „Makstud sularahas” on a lesson (owner 2026-11-10) ----
// A teacher marks one calendar lesson of their own as paid in cash. It is an ordinary receipt of the cash box (held by
// the teacher until they hand it over: „Sain kätte” on the admin's „Õpetajate käes sularaha” = a handover to the
// admin), with the lesson's link on it. One receipt per lesson: the id is fixed, `lessoncash_<lesson document id>`.
// Owner 2026-11-10: lesson cash does not go to the accountant — it is never linked to an invoice (/cash/allocate
// refuses `source: "lesson"`), so it never becomes a payment and never reaches the books, the bank-books review or
// the exports; only the owner / admin see it (Finantsid „Laekunud”, Kassa).

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The receipt's fixed id for a lesson (same characters rule as the lesson document's id). */
function lessonCashId(lessonId) {
  return `lessoncash_${String(lessonId || "")}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 250);
}

/** The lesson's teacher: the lesson record's when it is marked, else the calendar entry's. */
function lessonTeacherUid({ entry = {}, lesson = null }) {
  return String((lesson && lesson.teacherUid) || entry.teacherUid || "");
}

/**
 * A new lesson-cash receipt. Checks: a real lesson of this student on this date that has happened (not in the future,
 * not cancelled); a teacher only for their own lesson and only as the holder; never an FIE card (the owner's private
 * sole-proprietor billing stays apart from the school's cash box).
 */
function lessonCashEntry({ actor, isAdmin, values = {}, entry, occurs, lesson = null, lessonId, studentId, student, issuer = "company", holder, nowIso }) {
  const occurrenceDate = String(values.occurrenceDate || "");
  if (!ISO_DAY.test(occurrenceDate)) throw cashError("Tunni kuupäev on vigane.");
  if (occurrenceDate > appToday(nowIso)) throw cashError("Tund ei ole veel toimunud.");
  if (!entry) throw cashError("Tundi ei leitud.", 404);
  const ids = [entry.studentId, ...(Array.isArray(entry.studentIds) ? entry.studentIds : [])].filter(Boolean).map(String);
  if (!ids.includes(String(studentId))) throw cashError("Õpilane ei ole selles tunnis.", 404);
  if (!occurs && !lesson) throw cashError("Sel päeval seda tundi ei olnud.", 404);
  if (lesson && lesson.status === "Puudus_p") throw cashError("Tund jäi ära (teatas ette) — selle eest sularaha ei märgita.", 409);
  if (!student || student.active === false || student.mergedInto) throw cashError("Õpilase kaarti ei leitud.", 404);
  if (issuer === "fie") throw cashError("See õpilane on FIE arvetel — kooli kassasse tema raha ei märgita.", 409);
  const teacherUid = lessonTeacherUid({ entry, lesson });
  if (!isAdmin && teacherUid !== actor.uid) throw cashError("See ei ole sinu tund.", 403);
  if (!holder?.uid) throw cashError("Vali, kelle käes raha on.");
  if (!isAdmin && holder.uid !== actor.uid) throw cashError("Õpetaja märgib ainult raha, mille ta ise sai.", 403);
  return {
    type: "receipt",
    source: "lesson",
    lessonId: String(lessonId),
    scheduleId: String(values.scheduleId || ""),
    occurrenceDate,
    subject: clean((lesson && lesson.subject) || entry.subject, 80),
    lessonTime: clean(entry.time, 10),
    teacherUid,
    holderUid: holder.uid,
    holderName: clean(holder.name, 120),
    amountCents: amountToCents(values.amount),
    // the day the teacher marked it: on the owner's chart the money counts from this day
    receivedAt: appToday(nowIso),
    studentId: String(studentId),
    studentName: clean(student.name, 120),
    payerName: clean(student.parentName || student.payerName || student.name, 120),
    note: clean(values.note),
    status: "open",
    invoiceId: null,
    paymentId: null,
    createdAt: nowIso,
    createdBy: { uid: actor.uid, name: clean(actor.name, 120) },
  };
}

/**
 * May `actor` take back a lesson-cash mark? A teacher: only their own, on the day they marked it, while the money is
 * still with them (their cash box would go below zero if it had been handed over — „Sain kätte” already happened).
 * An administrator voids any open receipt in Kassa as before. Returns "" when allowed, else the reason.
 */
function lessonCashUndoRefusal({ actor, isAdmin, entry, balanceCents, nowIso }) {
  if (!entry || entry.type !== "receipt" || entry.source !== "lesson") return "Märget ei leitud.";
  if (entry.status === "void") return "";
  if (entry.status !== "open") return "Raha on juba arvega seotud.";
  if (isAdmin) return "";
  if (entry.createdBy?.uid !== actor.uid || entry.holderUid !== actor.uid) return "See ei ole sinu märge.";
  if (entry.receivedAt !== appToday(nowIso)) return "Märget saab tagasi võtta ainult samal päeval. Palu adminil see parandada.";
  if ((Number(balanceCents) || 0) < (Number(entry.amountCents) || 0)) return "Raha on juba üle antud. Palu adminil märge parandada.";
  return "";
}

/** What a teacher's screen needs about the lesson-cash marks they see: lessonId → { id, amountCents, status, canUndo }. */
function lessonCashMarks(entries = [], { uid, isAdmin, balanceCents = 0, nowIso }) {
  const out = {};
  for (const entry of entries) {
    if (!entry || entry.type !== "receipt" || entry.source !== "lesson" || entry.status === "void" || !entry.lessonId) continue;
    if (!isAdmin && entry.holderUid !== uid && entry.createdBy?.uid !== uid) continue;
    out[entry.lessonId] = {
      id: entry.id, amountCents: entry.amountCents, status: entry.status, receivedAt: entry.receivedAt, holderName: entry.holderName || "",
      canUndo: !lessonCashUndoRefusal({ actor: { uid }, isAdmin, entry, balanceCents, nowIso }),
    };
  }
  return out;
}

module.exports = {
  amountToCents, cashBalances, cashError, handoverEntry, lessonCashEntry, lessonCashId, lessonCashMarks, lessonCashUndoRefusal,
  lessonTeacherUid, receiptEntry, studentTeacherUids, visibleEntries,
};
