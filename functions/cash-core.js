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

module.exports = { amountToCents, cashBalances, cashError, handoverEntry, receiptEntry, studentTeacherUids, visibleEntries };
