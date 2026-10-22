"use strict";

const crypto = require("crypto");

// Vorm INF 3 „Füüsiliste isikute tasutud koolituskulude deklaratsioon” (owner 2026-10-22; form inf_3_2025.pdf, valid from
// 01.01.2025; tulumaksuseadus § 57¹ lg 6). A training provider declares, by 1 February of the next year, what private
// persons paid during the calendar year for training: payer and trainee (name, isikukood), the amount in euros with
// cents and the training type (1 tasemekoolitus, 2 täienduskoolitus incl. language learning, 3 huviharidus under 18).
// Over 10 rows → electronically (e-MTA, XML by inf3.xsd from emta.ee). Pure functions; docs/INF3.md.

const TRAINING_TYPES = Object.freeze({ 1: "Tasemekoolitus", 2: "Täienduskoolitus (keeleõpe)", 3: "Huviharidus (alla 18)" });
const DEFAULT_TRAINING_TYPE = 2;

function inf3Error(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

const isoDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") return (value.match(/^\d{4}-\d{2}-\d{2}/) || [""])[0];
  if (typeof value?.toDate === "function") return value.toDate().toISOString().slice(0, 10);
  return "";
};

const cents = (record, field = "amount") => {
  const exact = Number(record?.[`${field}Cents`]);
  if (Number.isFinite(exact)) return Math.round(exact);
  const amount = Number(record?.[field]);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
};

// Estonian personal identification code (EVS 585:2007): 11 digits, century/sex digit 1–8, a real birth date and the
// check digit (weights 1…9,1; if the remainder is 10, weights 3…9,1,2,3; if again 10, the check digit is 0)
function isValidIsikukood(value) {
  const code = String(value || "").trim();
  if (!/^[1-8]\d{10}$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const century = { 1: 1800, 2: 1800, 3: 1900, 4: 1900, 5: 2000, 6: 2000, 7: 2100, 8: 2100 }[digits[0]];
  const year = century + Number(code.slice(1, 3));
  const month = Number(code.slice(3, 5));
  const day = Number(code.slice(5, 7));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false;
  const check = (weights) => digits.slice(0, 10).reduce((sum, digit, index) => sum + digit * weights[index], 0) % 11;
  let remainder = check([1, 2, 3, 4, 5, 6, 7, 8, 9, 1]);
  if (remainder === 10) remainder = check([3, 4, 5, 6, 7, 8, 9, 1, 2, 3]);
  if (remainder === 10) remainder = 0;
  return remainder === digits[10];
}

// The payer of a child's lessons is the parent: their code is kept once per parent (taxPayers/{key}) and used for all
// their children. The key is the parent's account, or a hash of the parent's e-mail when the parent has no account.
function payerKeyOf(student = {}) {
  const uid = student.linkedParentId || student.parentUid || student.guardianUid || (Array.isArray(student.linkedParentIds) ? student.linkedParentIds[0] : "");
  if (uid) return `uid_${String(uid).replace(/[^A-Za-z0-9_-]/g, "")}`;
  const email = String(student.parentEmail || "").trim().toLowerCase();
  if (email) return `email_${crypto.createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
  return "";
}

function cleanIdentity(values = {}) {
  const studentCode = String(values.studentCode || "").replace(/\s/g, "");
  const payerCode = String(values.payerCode || "").replace(/\s/g, "");
  const payerName = String(values.payerName || "").replace(/\s+/g, " ").trim().slice(0, 160);
  if (studentCode && !isValidIsikukood(studentCode)) throw inf3Error("Õpilase isikukood ei ole korrektne.");
  if (payerCode && !isValidIsikukood(payerCode)) throw inf3Error("Maksja isikukood ei ole korrektne.");
  if (payerCode && !payerName) throw inf3Error("Lisa maksja nimi.");
  const trainingType = Number(values.trainingType || DEFAULT_TRAINING_TYPE);
  if (!TRAINING_TYPES[trainingType]) throw inf3Error("Koolituse liik on 1, 2 või 3.");
  return { studentCode, payerCode, payerName, trainingType };
}

// The amounts private persons paid in the year, by trainee: money received by bank, card or cash on invoices, money
// received in advance (bank lines kept as a payer credit), minus refunds. A payment from a prepayment is not counted
// again. Invoices to a company (with a registry code) are left out: their cost is not the person's.
function inf3Rows({ year, invoices = [], payments = [], payerCredits = [], refunds = [], bankTransactions = [], identities = [], students = [], payers = [] } = {}) {
  const y = String(year);
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const studentById = new Map(students.map((student) => [student.id, student]));
  const identityById = new Map(identities.map((identity) => [identity.id || identity.studentId, identity]));
  const payerByKey = new Map(payers.map((payer) => [payer.id, payer]));
  const bankById = new Map(bankTransactions.map((tx) => [tx.id, tx]));
  const creditById = new Map(payerCredits.map((credit) => [credit.id, credit]));
  const totals = new Map();
  const add = (studentId, amount, payerName) => {
    if (!studentId || !amount) return;
    const row = totals.get(studentId) || { studentId, amountCents: 0, payerNames: new Set() };
    row.amountCents += amount;
    if (payerName) row.payerNames.add(payerName);
    totals.set(studentId, row);
  };
  let companyCents = 0;

  payments.forEach((payment) => {
    if (payment.status === "void" || payment.method === "credit") return;
    if (!isoDate(payment.paidAt).startsWith(`${y}-`)) return;
    const invoice = invoiceById.get(payment.invoiceId) || {};
    const student = studentById.get(invoice.studentId || payment.studentId) || {};
    if (invoice.payerRegCode || invoice.payerType === "company" || student.payerRegCode) { companyCents += cents(payment); return; }
    add(invoice.studentId || payment.studentId, cents(payment), payment.payerName || invoice.payerName || invoice.parentName);
  });
  payerCredits.forEach((credit) => {
    if (credit.sourcePaymentId) return; // the overpaid part of a payment already counted above
    const tx = bankById.get(credit.bankTransactionId);
    if (!isoDate(tx?.paidAt || credit.receivedAt || credit.createdAt).startsWith(`${y}-`)) return;
    add(credit.studentId, cents(credit, "originalAmount"), credit.payerName);
  });
  refunds.forEach((refund) => {
    if (!isoDate(refund.refundedAt).startsWith(`${y}-`)) return;
    const credit = creditById.get(refund.creditId) || {};
    add(credit.studentId || refund.studentId, -cents(refund), "");
  });

  const rows = [...totals.values()].filter((row) => row.amountCents !== 0).map((row) => {
    const student = studentById.get(row.studentId) || {};
    const own = identityById.get(row.studentId) || {};
    const parent = payerByKey.get(payerKeyOf(student)) || {};
    // the child's own payer code wins; otherwise the parent's code from any of their children
    const payerFromParent = !own.payerCode && Boolean(parent.payerCode);
    const identity = { ...own, payerCode: own.payerCode || parent.payerCode || "", payerName: own.payerCode ? own.payerName : (parent.payerName || own.payerName) };
    const payerName = identity.payerName || [...row.payerNames][0] || student.parentName || student.name || "";
    const problems = [];
    if (!identity.studentCode) problems.push("Õpilase isikukood puudub");
    else if (!isValidIsikukood(identity.studentCode)) problems.push("Õpilase isikukood on vigane");
    if (!identity.payerCode) problems.push("Maksja isikukood puudub");
    else if (!isValidIsikukood(identity.payerCode)) problems.push("Maksja isikukood on vigane");
    return {
      studentId: row.studentId,
      studentName: student.name || identity.studentName || "",
      studentCode: identity.studentCode || "",
      payerName,
      payerCode: identity.payerCode || "",
      amountCents: row.amountCents,
      trainingType: Number(identity.trainingType || DEFAULT_TRAINING_TYPE),
      payerFromParent,
      problems,
      ready: problems.length === 0,
    };
  }).sort((a, b) => a.studentName.localeCompare(b.studentName, "et"));
  return { rows, companyCents, totalCents: rows.reduce((sum, row) => sum + row.amountCents, 0) };
}

const xmlText = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// the e-MTA upload file (namespace and elements of inf3.xsd); only complete rows are declared
function inf3Xml({ regCode, year, rows }) {
  if (!/^\d{8}$/.test(String(regCode || ""))) throw inf3Error("Saatja registrikood peab olema 8 numbrit.");
  const ready = rows.filter((row) => row.ready);
  if (!ready.length) throw inf3Error("Deklareerida ei ole midagi: ühelgi real pole mõlemat isikukoodi.");
  const kirjed = ready.map((row) => [
    "    <kirje>",
    `      <koolitusmaksja_isikukood>${xmlText(row.payerCode)}</koolitusmaksja_isikukood>`,
    `      <koolitatava_isikukood>${xmlText(row.studentCode)}</koolitatava_isikukood>`,
    `      <makstud_summa>${(row.amountCents / 100).toFixed(2)}</makstud_summa>`,
    `      <koolituse_liik>${row.trainingType}</koolituse_liik>`,
    "    </kirje>",
  ].join("\n")).join("\n");
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<deklaratsioon tyyp="inf3" xmlns="http://www.emta.ee/inf3">',
    `  <saatja_regkood>${regCode}</saatja_regkood>`,
    "  <periood>",
    `    <aasta>${Number(year)}</aasta>`,
    "  </periood>",
    "  <inf3>",
    kirjed,
    "  </inf3>",
    "</deklaratsioon>",
    "",
  ].join("\n");
}

module.exports = { DEFAULT_TRAINING_TYPE, TRAINING_TYPES, cleanIdentity, inf3Rows, inf3Xml, isValidIsikukood, payerKeyOf };
