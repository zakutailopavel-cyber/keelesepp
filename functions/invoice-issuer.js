"use strict";

// Transaction helpers of „Arve väljastaja” (pure rules in invoice-issuer-core.js). Every invoice-creating function
// reads the context first (all reads before writes), decides the issuer, then takes the issuer's own next number.

const core = require("./invoice-issuer-core");
const { enrollmentsOf } = require("./student-enrollments-core");

// invoiceIssuers/fie (name, iban, ownerUid) and studentInvoiceIssuers/<card> of the given cards
async function readIssuerContext(transaction, db, studentIds = []) {
  const ids = [...new Set(studentIds.map((id) => String(id || "").trim()).filter(Boolean))];
  const [settingsSnap, ...cardSnaps] = await Promise.all([
    transaction.get(db.collection("invoiceIssuers").doc(core.FIE_SETTINGS_ID)),
    ...ids.map((id) => transaction.get(db.collection("studentInvoiceIssuers").doc(id))),
  ]);
  const settings = settingsSnap.exists ? settingsSnap.data() : {};
  const defaults = new Map(ids.map((id, index) => [id, cardSnaps[index].exists && cardSnaps[index].data().issuer === "fie" ? "fie" : "company"]));
  return {
    settings,
    ready: core.fieReady(settings),
    owner: { uid: String(settings.ownerUid || ""), name: String(settings.name || "") },
    defaultOf: (id) => defaults.get(String(id || "").trim()) || "company",
  };
}

// one card + subject as an issuer line (subject "" = the card as a whole)
function subjectLine(context, card = {}, studentId, subject = "") {
  return core.cardLine({ tracks: enrollmentsOf(card), subject, defaultIssuer: context.defaultOf(studentId), owner: context.owner });
}

function manualCardLine(context, card = {}, studentId) {
  return core.manualLine({ tracks: enrollmentsOf(card), subject: "", defaultIssuer: context.defaultOf(studentId), owner: context.owner });
}

// lessons of one card: FIE only when the owner taught the lesson
function lessonLine(context, lesson = {}, studentId) {
  return { defaultIssuer: context.defaultOf(studentId), ownerTeaches: core.taughtByOwner(lesson, context.owner) };
}

// the issuer's next free number inside the transaction; `commit` writes the counter after the invoice is created
async function nextIssuerNumber(transaction, db, { issuer = "company", todayIso }) {
  const counterRef = db.collection("meta").doc(core.counterId(issuer));
  const counterSnap = await transaction.get(counterRef);
  let sequence = (Number(counterSnap.data()?.seq) || 0) + 1;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = core.invoiceNumber(issuer, String(todayIso).slice(0, 4), sequence);
    const collision = await transaction.get(db.collection("invoices").where("num", "==", candidate).limit(1));
    if (collision.empty) {
      return {
        invoiceNum: candidate,
        nextSequence: sequence,
        commit: (tx, nowIso) => tx.set(counterRef, { seq: sequence, updatedAt: nowIso }, { merge: true }),
      };
    }
    sequence += 1;
  }
  throw core.issuerError(409, "Invoice counter requires numbering repair");
}

module.exports = { readIssuerContext, subjectLine, manualCardLine, lessonLine, nextIssuerNumber };
