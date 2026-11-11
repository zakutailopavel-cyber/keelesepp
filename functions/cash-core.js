"use strict";

// Cash payers and the cash box (owner 2026-10-18, team chat 2026-10-17): some payers pay in cash. Any staff member
// (a teacher at the lesson or an administrator) records that they took the money; the money stays with that person
// until they hand it over to someone else. An administrator then links the receipt to the payer's invoice, which
// records an ordinary invoice payment with method „cash” instead of a bank match.
//
// cashLedger/{id} — server writes only:
//   receipt:  { type: "receipt", holderUid, holderName, amountCents, receivedAt, studentId, studentName, payerName,
//               note, status: "open" | "allocated" | "void", invoiceId, paymentId }
//   handover: { type: "handover", fromUid, fromName, toUid, toName, amountCents, handedAt, note,
//               status: "active" | "pending" | "rejected" | "void", items?: [{ id, cents }] }
// A person's cash = their open and allocated receipts + handovers received − handovers given (void entries ignored).
// „Minu kassa” (owner 2026-11-11): a person's own hand-over starts as "pending" („ootab kinnitust”) and moves the money
// only when the receiver presses „Sain kätte” ("active"); „Ei saanud” makes it "rejected" (the money stays with the
// giver). Pending and rejected hand-overs never count in a balance; a pending one can no longer be given again.

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
    if (handoverCounts(entry)) { add(entry.fromUid, entry.fromName, -cents); add(entry.toUid, entry.toName, cents); }
  }
  return out;
}

// a hand-over moves money once it is confirmed: "active" (older entries know no other state); pending / rejected do not
function handoverCounts(entry = {}) {
  return entry.type === "handover" && (entry.status === "active" || !entry.status);
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
function lessonCashEntry({ actor, isAdmin, values = {}, entry, occurs, lesson = null, lessonId, studentId, student, issuer = "company", holder, invoicedBefore = [], amountCents = null, nowIso }) {
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
  // owner 2026-11-10: a cash-paid lesson leaves the monthly invoice, so it must be a marked lesson (the flag sits on
  // the lesson record that billing reads); the dialog marks it held first
  if (!lesson || !CASH_PAYABLE_STATUSES.includes(lesson.status)) throw cashError("Märgi tund enne toimunuks.", 409);
  // D1 (review 2026-11-11): a lesson already billed or settled another way is not paid in cash a second time
  const settled = lessonSettledRefusal(lesson);
  if (settled) throw cashError(settled, 409);
  // owner 2026-11-11: the amount is the card's lesson price (the server computes it; the teacher cannot change it)
  if (amountCents !== null && !(Number(amountCents) > 0)) throw cashError("Õpilase kaardil pole selle aine tunnihinda. Palu adminil hind lisada.", 409);
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
    amountCents: amountCents !== null ? Math.round(Number(amountCents)) : amountToCents(values.amount),
    // the day the teacher marked it: on the owner's chart the money counts from this day
    receivedAt: appToday(nowIso),
    studentId: String(studentId),
    studentName: clean(student.name, 120),
    payerName: clean(student.parentName || student.payerName || student.name, 120),
    note: clean(values.note),
    status: "open",
    invoiceId: null,
    paymentId: null,
    // a monthly invoice of that month already existed: it is not edited — the admin sees „makstud sularahas pärast arvet”
    invoicedBefore: invoicedBefore.slice(0, 5),
    createdAt: nowIso,
    createdBy: { uid: actor.uid, name: clean(actor.name, 120) },
  };
}

const CASH_PAYABLE_STATUSES = ["Toimunud", "Puudus_eta"];

/** Why a marked lesson cannot be paid in cash: already on a per-lesson invoice, paid directly, free / written off / paid
 * by the school. '' = it can. A package lesson can: the credit it took comes back (lesson-tokens-core lessonTakesToken). */
function lessonSettledRefusal(lesson = {}) {
  if (String(lesson.invoiceId || "").trim() || lesson.billingStatus === "invoiced") return "Tund on juba arvel — sularahas seda ei märgita.";
  if (lesson.directPaymentId || lesson.billingStatus === "paid_directly") return "Tund on juba makstud.";
  if (["free", "written_off", "school_covered", "cancelled_on_time"].includes(lesson.billingStatus)) return "Tund on tasuta või kooli kulul — selle eest sularaha ei märgita.";
  return "";
}

// ---- „Maksab sularahas” on the student card (owner 2026-11-11) ----
// studentRevenuePlans/<card>.cashSubjects: the subjects this card pays in cash at the lesson — ["*"] = every subject
// (a card with one subject), else subject names. For such a lesson the teacher's „Toimus” is „Toimus · makstud
// sularahas 25 €”: one tap marks it held and records the cash. Admin-only field (firestore.rules); a plan without it =
// nobody pays in cash (the „Maksis sularahas” action after „Toimus” still works for a rare cash payment).
const sameSubject = (left, right) => clean(left, 80).toLocaleLowerCase("et") === clean(right, 80).toLocaleLowerCase("et");

function cashSubjectsOf(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(item => clean(item, 80)).filter(Boolean))].slice(0, 9);
}

/** Does this card pay this subject's lessons in cash? */
function paysCashFor(plan = {}, subject = "") {
  const subjects = cashSubjectsOf(plan && plan.cashSubjects);
  return subjects.includes("*") || subjects.some(item => sameSubject(item, subject));
}

/** The plan's price for one subject: its own (subjectPrices, key as written, else ignoring case) or the card's. */
function subjectPrice(plan = {}, subject = "") {
  const prices = plan && plan.subjectPrices && typeof plan.subjectPrices === "object" ? plan.subjectPrices : {};
  const key = subject && Object.prototype.hasOwnProperty.call(prices, subject) ? subject : subject ? Object.keys(prices).find(item => sameSubject(item, subject)) : "";
  const own = key && prices[key] && Number(prices[key].lessonPriceCents) > 0 ? prices[key] : null;
  const unitCents = Math.round(Number(own ? own.lessonPriceCents : plan.lessonPriceCents) || 0);
  const minutes = Number(own ? own.lessonMinutes || plan.lessonMinutes : plan.lessonMinutes) || 60;
  return { unitCents: Math.max(0, unitCents), minutes };
}

/** The cash a lesson costs: the subject's price scaled to the lesson's length (90 min of a 60-min price = 1.5×). */
function lessonCashPriceCents(plan, subject = "", lessonMinutes = 0) {
  if (!plan) return 0;
  const price = subjectPrice(plan, subject);
  if (!price.unitCents) return 0;
  const minutes = Number(lessonMinutes) || price.minutes;
  return Math.round(price.unitCents * (minutes / price.minutes));
}

/** What the teacher's marking screens need about one cash-paying card (sent only for the teacher's own students). */
function lessonCashPayer(plan = {}, mainSubjectName = "") {
  const subjects = cashSubjectsOf(plan && plan.cashSubjects);
  if (!subjects.length) return null;
  const prices = plan.subjectPrices && typeof plan.subjectPrices === "object" ? plan.subjectPrices : {};
  return {
    all: subjects.includes("*"),
    subjects: subjects.filter(item => item !== "*"),
    mainSubject: clean(mainSubjectName, 80),
    main: subjectPrice(plan, ""),
    prices: Object.fromEntries(Object.keys(prices).slice(0, 9).map(subject => [subject, subjectPrice(plan, subject)])),
  };
}

/** The company monthly invoices of the lesson's month that bill this card (not cancelled): [{ id, num }]. */
function invoicesCoveringLesson(invoices = [], { studentId, occurrenceDate }) {
  const month = String(occurrenceDate || "").slice(0, 7);
  const seen = new Set();
  return invoices
    .filter((invoice) => invoice && invoice.status !== "Tühistatud" && invoice.issuer !== "fie" && String(invoice.planMonth || "") === month
      && (invoice.studentId === studentId || (Array.isArray(invoice.studentIds) && invoice.studentIds.includes(studentId))))
    .filter((invoice) => (seen.has(invoice.id) ? false : seen.add(invoice.id)))
    .map((invoice) => ({ id: String(invoice.id), num: clean(invoice.num, 40) }));
}

/** The lesson record's flag (billing reads it: crm-v2 finance/monthlyBilling.js isChargeable). */
function lessonCashFlag(receiptId, entry, nowIso) {
  return { receiptId, amountCents: entry.amountCents, at: nowIso, byUid: entry.createdBy?.uid || "", invoicedBefore: (entry.invoicedBefore || []).map((invoice) => invoice.num || invoice.id) };
}

/**
 * May `actor` take back a lesson-cash mark? A teacher: only their own, on the day they marked it, while the money is
 * still with them (their cash box would go below zero if it had been handed over — „Sain kätte” already happened).
 * An administrator voids any open receipt in Kassa as before. Returns "" when allowed, else the reason.
 */
function lessonCashUndoRefusal({ actor, isAdmin, entry, balanceCents, remainingCents, nowIso }) {
  if (!entry || entry.type !== "receipt" || entry.source !== "lesson") return "Märget ei leitud.";
  if (entry.status === "void") return "";
  if (entry.status !== "open") return "Raha on juba arvega seotud.";
  if (isAdmin) return "";
  if (entry.createdBy?.uid !== actor.uid || entry.holderUid !== actor.uid) return "See ei ole sinu märge.";
  if (entry.receivedAt !== appToday(nowIso)) return "Märget saab tagasi võtta ainult samal päeval. Palu adminil see parandada.";
  // „Minu kassa” (owner 2026-11-11): once any of it is in a hand-over (pending or confirmed) only the admin corrects it
  const handed = "Raha on juba üle antud. Palu adminil märge parandada.";
  if (remainingCents !== undefined && (Number(remainingCents) || 0) < (Number(entry.amountCents) || 0)) return handed;
  if (balanceCents !== undefined && (Number(balanceCents) || 0) < (Number(entry.amountCents) || 0)) return handed;
  return "";
}

/** What a teacher's screen needs about the lesson-cash marks they see: lessonId → { id, amountCents, status, canUndo }. */
function lessonCashMarks(entries = [], { uid, isAdmin, balanceCents, remaining = null, nowIso }) {
  const out = {};
  for (const entry of entries) {
    if (!entry || entry.type !== "receipt" || entry.source !== "lesson" || entry.status === "void" || !entry.lessonId) continue;
    if (!isAdmin && entry.holderUid !== uid && entry.createdBy?.uid !== uid) continue;
    out[entry.lessonId] = {
      id: entry.id, amountCents: entry.amountCents, status: entry.status, receivedAt: entry.receivedAt, holderName: entry.holderName || "",
      canUndo: !lessonCashUndoRefusal({ actor: { uid }, isAdmin, entry, balanceCents, remainingCents: remaining ? remaining[entry.id] ?? 0 : undefined, nowIso }),
    };
  }
  return out;
}

// ---- „Minu kassa” — a person's own cash and hand-overs to a cash receiver (owner 2026-11-11) ----
// The receivers („Kassa vastuvõtjad”) are a setting: cashSettings/receivers { uids: [...] }, written by an admin through
// financeApi /cash/settings. No document yet = the defaults: the owner and the administrator whose account id starts
// with FVHgmN (Oleksiy; matched only among users with role admin, so no other account can fall into it).
const DEFAULT_CASH_RECEIVERS = Object.freeze({ uids: Object.freeze(["2ai5mVQCmjSGjsy7t53JrqKgZdX2"]), adminUidPrefixes: Object.freeze(["FVHgmN"]) });
const MAX_RECEIVERS = 10;
const MAX_HANDOVER_ITEMS = 400;

const centsOf = (entry) => Math.round(Number(entry && entry.amountCents) || 0);
const entryDay = (entry = {}) => String(entry.receivedAt || entry.handedAt || String(entry.createdAt || "").slice(0, 10));
const byTime = (left, right) => entryDay(left).localeCompare(entryDay(right))
  || String(left.createdAt || "").localeCompare(String(right.createdAt || "")) || String(left.id || "").localeCompare(String(right.id || ""));

/**
 * One person's cash. Incoming: their receipts and the confirmed hand-overs they got. Outgoing: their confirmed and
 * pending hand-overs, oldest first — one that names its items takes those items, the rest (the admin's amount-only
 * „Sain kätte”, or what an item no longer had) takes the oldest money first.
 * → { onHandCents (officially with them), pendingOutCents (given, not confirmed yet), availableCents (can still be
 *     given), items: [incoming entry + remainingCents > 0], remaining: { entryId: cents not given yet }, ever }
 */
function cashPosition(entries = [], uid = "") {
  const live = entries.filter((entry) => entry && entry.status !== "void");
  const incoming = live
    .filter((entry) => (entry.type === "receipt" && entry.holderUid === uid) || (handoverCounts(entry) && entry.toUid === uid))
    .sort(byTime)
    .map((entry) => ({ entry, remaining: centsOf(entry) }));
  const outgoing = live
    .filter((entry) => entry.type === "handover" && entry.fromUid === uid && (handoverCounts(entry) || entry.status === "pending"))
    .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")));
  const rows = new Map(incoming.map((row) => [row.entry.id, row]));
  for (const handover of outgoing) {
    let left = centsOf(handover);
    for (const item of Array.isArray(handover.items) ? handover.items : []) {
      const row = rows.get(item && item.id);
      if (!row || left <= 0) continue;
      const take = Math.min(row.remaining, Math.round(Number(item.cents) || 0), left);
      row.remaining -= take;
      left -= take;
    }
    for (const row of incoming) {
      if (left <= 0) break;
      const take = Math.min(row.remaining, left);
      row.remaining -= take;
      left -= take;
    }
  }
  const sum = (list) => list.reduce((total, entry) => total + centsOf(entry), 0);
  const inCents = sum(incoming.map((row) => row.entry));
  const activeOut = sum(outgoing.filter(handoverCounts));
  const pendingOut = sum(outgoing.filter((entry) => entry.status === "pending"));
  return {
    onHandCents: inCents - activeOut,
    pendingOutCents: pendingOut,
    availableCents: inCents - activeOut - pendingOut,
    items: incoming.filter((row) => row.remaining > 0).map((row) => ({ ...row.entry, remainingCents: row.remaining })),
    remaining: Object.fromEntries(incoming.map((row) => [row.entry.id, row.remaining])),
    ever: entries.some((entry) => entry && (entry.holderUid === uid || entry.fromUid === uid || entry.toUid === uid)),
  };
}

/** The receivers to offer: [{ uid, name, isAdmin }] — the saved list, else the defaults; only active staff. */
function cashReceivers({ settings = null, people = [] } = {}) {
  const active = people.filter((person) => person && person.uid && person.active !== false);
  const saved = settings && Array.isArray(settings.uids) ? settings.uids.map(String) : null;
  const chosen = saved
    ? saved.map((uid) => active.find((person) => person.uid === uid)).filter(Boolean)
    : active.filter((person) => DEFAULT_CASH_RECEIVERS.uids.includes(person.uid)
      || (person.isAdmin && DEFAULT_CASH_RECEIVERS.adminUidPrefixes.some((prefix) => person.uid.startsWith(prefix))));
  const seen = new Set();
  return chosen.filter((person) => (seen.has(person.uid) ? false : seen.add(person.uid)))
    .map((person) => ({ uid: person.uid, name: clean(person.name, 120), isAdmin: Boolean(person.isAdmin) }));
}

/** The admin's new receiver list: unique active staff, 1…10. */
function cleanReceiverUids(value, people = []) {
  const list = Array.isArray(value) ? [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))] : [];
  if (!list.length) throw cashError("Vali vähemalt üks raha vastuvõtja.");
  if (list.length > MAX_RECEIVERS) throw cashError(`Vastuvõtjaid võib olla kuni ${MAX_RECEIVERS}.`);
  for (const uid of list) {
    const person = people.find((item) => item.uid === uid);
    if (!person || person.active === false) throw cashError("Vastuvõtja peab olema aktiivne koolitöötaja.");
  }
  return list;
}

/**
 * „Andsin raha üle”: `from` (always the actor — everyone hands over only their own cash) gives a listed receiver
 * everything they can still give, or the chosen entries of it. Status "pending" until the receiver answers.
 */
function handoverRequestEntry({ actor, from, to, receivers = [], position, itemIds = [], values = {}, nowIso }) {
  if (!from?.uid || !to?.uid) throw cashError("Vali, kellele raha andsid.");
  if (from.uid !== actor.uid) throw cashError("Üle saab anda ainult enda käes olevat raha.", 403);
  if (from.uid === to.uid) throw cashError("Raha ei saa anda iseendale.");
  if (!receivers.some((receiver) => receiver.uid === to.uid)) throw cashError("Vali raha saaja kassa vastuvõtjate nimekirjast.", 409);
  const available = position.items || [];
  const wanted = Array.isArray(itemIds) ? [...new Set(itemIds.map(String).filter(Boolean))] : [];
  if (wanted.length > MAX_HANDOVER_ITEMS) throw cashError("Liiga palju kirjeid korraga — vali vähem.");
  const chosen = wanted.length ? wanted.map((id) => available.find((item) => item.id === id)) : available.slice(0, MAX_HANDOVER_ITEMS);
  if (chosen.some((item) => !item)) throw cashError("Mõni valitud kirje ei ole enam sinu käes. Laadi leht uuesti.", 409);
  const amountCents = Math.min(chosen.reduce((total, item) => total + item.remainingCents, 0), position.availableCents);
  if (!(amountCents > 0)) throw cashError("Sul ei ole praegu sularaha, mida üle anda.", 409);
  return {
    type: "handover",
    fromUid: from.uid,
    fromName: clean(from.name, 120),
    toUid: to.uid,
    toName: clean(to.name, 120),
    amountCents,
    items: chosen.map((item) => ({ id: String(item.id), cents: item.remainingCents })),
    handedAt: appToday(nowIso),
    note: clean(values.note),
    status: "pending",
    createdAt: nowIso,
    createdBy: { uid: actor.uid, name: clean(actor.name, 120) },
  };
}

/** The receiver's answer: „Sain kätte” → active (the money moves), „Ei saanud” (with a note) → rejected. → the patch, or
 * null when the same answer was already given. Only the receiver it was addressed to answers (an admin corrects by void). */
function handoverAnswerPatch({ actor, entry, decision, note = "", nowIso }) {
  if (!entry || entry.type !== "handover") throw cashError("Üleandmist ei leitud.", 404);
  if (entry.toUid !== actor.uid) throw cashError("See üleandmine ei ole sulle.", 403);
  if (!["confirm", "reject"].includes(decision)) throw cashError("Vali „Sain kätte” või „Ei saanud”.");
  const target = decision === "confirm" ? "active" : "rejected";
  if (entry.status === target) return null;
  if (entry.status !== "pending") throw cashError("See üleandmine ei oota enam kinnitust.", 409);
  const by = { uid: actor.uid, name: clean(actor.name, 120) };
  if (decision === "confirm") return { status: "active", confirmedAt: nowIso, confirmedBy: by };
  const why = clean(note);
  if (!why) throw cashError("Kirjuta, mis juhtus (nt summa ei klapi).");
  return { status: "rejected", rejectedAt: nowIso, rejectedBy: by, rejectNote: why };
}

/** The giver takes back their own pending hand-over (e.g. the wrong receiver). "" = allowed. */
function handoverCancelRefusal({ actor, entry }) {
  if (!entry || entry.type !== "handover") return "Üleandmist ei leitud.";
  if (entry.fromUid !== actor.uid) return "See ei ole sinu üleandmine.";
  if (entry.status !== "pending") return "Üleandmine on juba kinnitatud või lõpetatud.";
  return "";
}

const handoverView = (entry) => ({
  id: entry.id, fromUid: entry.fromUid, fromName: entry.fromName || "", toUid: entry.toUid, toName: entry.toName || "", amountCents: centsOf(entry),
  handedAt: entry.handedAt || "", status: entry.status || "active", note: entry.note || "", itemCount: Array.isArray(entry.items) ? entry.items.length : 0,
  confirmedAt: entry.confirmedAt || "", rejectedAt: entry.rejectedAt || "", rejectNote: entry.rejectNote || "", createdAt: entry.createdAt || "",
});

/** „Minu kassa”: what one person sees — only entries where they hold, give or get money; no one else's, no totals. */
function myCashView(entries = [], uid = "") {
  const own = entries.filter((entry) => entry && (entry.holderUid === uid || entry.fromUid === uid || entry.toUid === uid));
  const position = cashPosition(own, uid);
  const newest = (left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
  return {
    onHandCents: position.onHandCents,
    pendingOutCents: position.pendingOutCents,
    availableCents: position.availableCents,
    ever: position.ever,
    items: position.items.map((entry) => ({
      id: entry.id, type: entry.type, source: entry.source || "", date: entryDay(entry), studentName: entry.studentName || "",
      occurrenceDate: entry.occurrenceDate || "", lessonTime: entry.lessonTime || "", subject: entry.subject || "",
      fromName: entry.type === "handover" ? entry.fromName || "" : "", amountCents: centsOf(entry), remainingCents: entry.remainingCents,
    })).reverse(),
    handovers: own.filter((entry) => entry.type === "handover" && entry.fromUid === uid).sort(newest).slice(0, 60).map(handoverView),
    incoming: own.filter((entry) => entry.type === "handover" && entry.toUid === uid && entry.status === "pending").sort(newest).map(handoverView),
    received: own.filter((entry) => entry.type === "handover" && entry.toUid === uid && entry.status !== "pending").sort(newest).slice(0, 30).map(handoverView),
  };
}

module.exports = {
  DEFAULT_CASH_RECEIVERS, cashPosition, cashReceivers, cleanReceiverUids, handoverAnswerPatch, handoverCancelRefusal, handoverCounts,
  handoverRequestEntry, myCashView,
  amountToCents, cashBalances, cashError, cashSubjectsOf, handoverEntry, invoicesCoveringLesson, lessonCashEntry, lessonCashFlag, lessonCashId,
  lessonCashMarks, lessonCashPayer, lessonCashPriceCents, lessonCashUndoRefusal, lessonSettledRefusal, lessonTeacherUid, paysCashFor, receiptEntry,
  studentTeacherUids, visibleEntries,
};
