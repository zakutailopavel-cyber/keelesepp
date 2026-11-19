"use strict";

// Partnerid — one partner register for the books (the accountant 2026-11-19: „Партнёров нет в бухгалтерии, есть только
// tarnijad”; docs/ACCOUNTING.md „Partnerid”). Like Merit Aktiva the partner of a journal line is one of:
//   - supplier  — a Tarnijad card (suppliers/{id}, purchases-core);
//   - customer  — an Ostja derived from the CRM invoices (company payer: name + registry code; private payer: the name
//                 only). Derived on every load by financeApi `/accounting/partners/customers`, never copied to a
//                 collection, so it cannot go stale and holds no personal data the accountant does not need;
//   - other     — Muu (Maksu- ja Tolliamet, Töötukassa, osanik, töötaja, pank …): accountingPartners/{id}, written only by
//                 financeApi `/accounting/partners` and `/accounting/partners/import`.
// Pure: no Firestore here.
const { cleanIban, supplierDuplicate, supplierNameKey } = require("./purchases-core");

function partnerError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

// the kinds of a „Muu” partner (column Tüüp shows the label)
const OTHER_KINDS = Object.freeze({
  tax: "Maksuamet",
  public: "Riigiasutus",
  owner: "Osanik",
  employee: "Töötaja",
  bank: "Pank",
  other: "Muu",
});

// one-click „Lisa” in the register (nothing is seeded by a script; the accountant adds what she needs)
const PARTNER_PRESETS = Object.freeze([
  Object.freeze({ key: "mta", name: "Maksu- ja Tolliamet", kind: "tax", regCode: "70000349" }),
  Object.freeze({ key: "tootukassa", name: "Eesti Töötukassa", kind: "public", regCode: "70009770" }),
  Object.freeze({ key: "osanik", name: "Pavel Zakutailo", kind: "owner", regCode: "" }),
  Object.freeze({ key: "lhv", name: "AS LHV Pank", kind: "bank", regCode: "10539549" }),
]);

// an Estonian personal code (isikukood): 11 digits, the first 1–6. Lists show it masked.
const isPersonalCode = (value) => /^[1-6]\d{10}$/.test(String(value || "").trim());
const maskCode = (value) => {
  const code = String(value || "").trim();
  return isPersonalCode(code) ? `${code[0]}******${code.slice(-4)}` : code;
};

// a „Muu” partner card as typed in the register
function otherPartnerRecord(values = {}) {
  const name = clean(values.name, 160);
  if (!name) throw partnerError("Partneri nimi on kohustuslik.");
  const kind = clean(values.kind, 20) || "other";
  if (!Object.prototype.hasOwnProperty.call(OTHER_KINDS, kind)) throw partnerError(`Tundmatu partneri liik „${kind}”.`);
  const email = clean(values.email, 160).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw partnerError("E-posti aadress on vigane.");
  let iban;
  try {
    iban = cleanIban(values.iban);
  } catch (error) {
    throw partnerError(error.message);
  }
  return {
    type: "other",
    kind,
    name,
    regCode: clean(values.regCode, 30).replace(/\s+/g, ""),
    vatNumber: clean(values.vatNumber, 30).toUpperCase().replace(/\s+/g, ""),
    email,
    iban,
    note: clean(values.note, 300),
    active: values.active !== false,
  };
}

const partnerDuplicateMessage = (record, dup) => (record.regCode && String(dup.regCode || "").trim() === record.regCode
  ? `Partner koodiga ${maskCode(record.regCode)} on juba olemas (${dup.name}).`
  : `Partner nimega „${dup.name}” on juba olemas.`);

// rows pasted from Excel: all or nothing, like Tarnijad (purchases-core supplierImportPlan)
const IMPORT_MAX = 400;
function otherPartnerImportPlan(rows = [], existing = []) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) throw partnerError("Imporditavaid ridu ei ole.");
  if (list.length > IMPORT_MAX) throw partnerError(`Korraga kuni ${IMPORT_MAX} partnerit.`);
  const records = [];
  const problems = [];
  const seen = [...existing];
  list.forEach((values, index) => {
    let record;
    try {
      record = otherPartnerRecord(values || {});
    } catch (error) {
      problems.push({ row: index + 1, message: error.message });
      return;
    }
    const dup = supplierDuplicate(record, seen);
    if (dup) { problems.push({ row: index + 1, message: dup.importRow ? `sama partner on real ${dup.importRow}.` : partnerDuplicateMessage(record, dup) }); return; }
    records.push(record);
    seen.push({ ...record, id: `row-${index + 1}`, importRow: index + 1 });
  });
  return { records, problems };
}

// ---- Ostjad from the CRM invoices ----
// Only the company's own invoices (an FIE invoice, issuer "fie", is never in the company's books; an invoice left out
// of the books is not a customer of the books either). A company payer (an 8-digit registry code or another
// non-personal code) is one customer per code; a private payer is one customer per name, without any code, e-mail or
// address. The id is stable: "reg:<code>" / "name:<name key>".
const outsideBooks = (invoice) => invoice.accountingExcluded === true || invoice.issuer === "fie";
const customerName = (invoice) => clean(invoice.payerName || invoice.parentName || invoice.studentName, 160);

function customersFromInvoices(invoices = []) {
  const byId = new Map();
  (Array.isArray(invoices) ? invoices : []).forEach((invoice) => {
    if (!invoice || outsideBooks(invoice)) return;
    const name = customerName(invoice);
    if (!name) return;
    const code = clean(invoice.payerRegCode, 30).replace(/\s+/g, "");
    const company = Boolean(code) && !isPersonalCode(code);
    const key = company ? `reg:${code}` : `name:${supplierNameKey(name) || name.toLowerCase()}`;
    const date = String(invoice.date || invoice.issueDate || "").slice(0, 10);
    const current = byId.get(key);
    if (!current) {
      byId.set(key, { id: key, type: "customer", kind: company ? "company" : "private", name, regCode: company ? code : "", invoiceCount: 1, lastInvoiceDate: date, source: "CRM arved" });
      return;
    }
    current.invoiceCount += 1;
    // the latest invoice's spelling of the name wins
    if (date && date >= current.lastInvoiceDate) { current.lastInvoiceDate = date; current.name = name; }
  });
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "et"));
}

module.exports = {
  IMPORT_MAX,
  OTHER_KINDS,
  PARTNER_PRESETS,
  customersFromInvoices,
  isPersonalCode,
  maskCode,
  otherPartnerImportPlan,
  otherPartnerRecord,
  partnerDuplicateMessage,
};
