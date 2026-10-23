"use strict";

// Tarnijad and ostuarved (the accountant 2026-10-23: „таблица поставщики и путь дальше”; docs/ACCOUNTING.md).
// Pure functions: a supplier card, a purchase invoice and the two entries it makes —
// - OA Ostuarve kanne on the invoice date: debit the expense (or prepaid / asset) account of each line with
//   „<tarnija> <kirjeldus>”, debit 2311 Sisendkäibemaks only for a line whose VAT is deductible, credit 2110 Võlad
//   tarnijatele with the document number. E&P Koolitus OÜ is not VAT registered, so by default the VAT stays in the
//   cost (vatDeductible = false) and there is no 2311 line;
// - VM Väljamakse kanne on the payment date: debit 2110, credit 1010 Pangakonto (bank, card) or 1000 Kassa (cash).
// suppliers/{id}: { name, regCode, vatNumber, address, email, iban, defaultAccount, active }
// purchaseInvoices/{id}: { supplierId, supplierName, supplierRegCode, documentNumber, date, dueDate, lines: [{ account,
//   description, amountCents, vatCents, vatDeductible }], totalCents, paidCents, payments: [{ id, date, amountCents,
//   method, reference, entryId }], status: "unpaid" | "paid" | "voided", documents, entryId }

const PURCHASE_ACCOUNTS = Object.freeze({
  payables: "2110",
  inputVat: "2311",
  bank: "1010",
  cash: "1000",
});

const PAYMENT_METHODS = new Set(["bank", "card", "cash"]);

function purchaseError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

function validDate(value, label) {
  const date = String(value || "").trim().slice(0, 10);
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw purchaseError(`${label}: vigane kuupäev.`);
  }
  return date;
}

function cents(value, label, { allowZero = false } = {}) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || (!allowZero && number === 0)) throw purchaseError(`${label}: summa peab olema positiivne (sentides).`);
  return number;
}

// IBAN: spaces removed, upper case, the ISO 13616 mod-97 check
function cleanIban(value) {
  const iban = String(value || "").replace(/\s+/g, "").toUpperCase();
  if (!iban) return "";
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) throw purchaseError("IBAN on vigane.");
  const digits = `${iban.slice(4)}${iban.slice(0, 4)}`.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let rest = 0;
  for (const digit of digits) rest = (rest * 10 + Number(digit)) % 97;
  if (rest !== 1) throw purchaseError("IBAN-i kontrollsumma ei klapi.");
  return iban;
}

function activeAccount(code, accounts, label) {
  const account = accounts.find((a) => String(a.code) === String(code));
  if (!account) throw purchaseError(`${label}: kontot ${code} pole kontoplaanis.`);
  if (account.active === false) throw purchaseError(`${label}: konto ${code} on suletud.`);
  return String(account.code);
}

function supplierRecord(values = {}, accounts = []) {
  const name = clean(values.name, 160);
  if (!name) throw purchaseError("Tarnija nimi on kohustuslik.");
  const email = clean(values.email, 160).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw purchaseError("E-posti aadress on vigane.");
  const defaultAccount = clean(values.defaultAccount, 6);
  return {
    name,
    regCode: clean(values.regCode, 30),
    vatNumber: clean(values.vatNumber, 30).toUpperCase().replace(/\s+/g, ""),
    address: clean(values.address, 300),
    email,
    iban: cleanIban(values.iban),
    defaultAccount: defaultAccount ? activeAccount(defaultAccount, accounts, "Vaikekonto") : "",
    active: values.active !== false,
  };
}

// a purchase invoice as typed in the grid; amounts are integer cents, a line amount includes its VAT
function purchaseInvoiceRecord(values = {}, { accounts = [], supplier } = {}) {
  if (!supplier?.id) throw purchaseError("Vali tarnija.");
  const documentNumber = clean(values.documentNumber, 80);
  if (!documentNumber) throw purchaseError("Arve number on kohustuslik (RPS § 7).");
  const date = validDate(values.date, "Arve kuupäev");
  const dueDate = values.dueDate ? validDate(values.dueDate, "Maksetähtaeg") : date;
  if (dueDate < date) throw purchaseError("Maksetähtaeg ei saa olla enne arve kuupäeva.");
  const lines = (Array.isArray(values.lines) ? values.lines : []).map((line, index) => {
    const label = `Rida ${index + 1}`;
    const account = activeAccount(clean(line?.account, 6), accounts, label);
    if (account === PURCHASE_ACCOUNTS.payables || account === PURCHASE_ACCOUNTS.inputVat) throw purchaseError(`${label}: vali kulu- või varakonto (mitte ${account}).`);
    const amountCents = cents(line?.amountCents, label);
    const vatCents = cents(line?.vatCents || 0, `${label} käibemaks`, { allowZero: true });
    if (vatCents > amountCents) throw purchaseError(`${label}: käibemaks ei saa olla suurem kui summa.`);
    const description = clean(line?.description, 200);
    if (!description) throw purchaseError(`${label}: kirjeldus on kohustuslik.`);
    return { account, description, amountCents, vatCents, vatDeductible: line?.vatDeductible === true && vatCents > 0 };
  });
  if (!lines.length) throw purchaseError("Ostuarvel peab olema vähemalt üks rida.");
  if (lines.length > 50) throw purchaseError("Ostuarvel on kuni 50 rida.");
  const totalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  return {
    supplierId: supplier.id,
    supplierName: clean(supplier.name, 160),
    supplierRegCode: clean(supplier.regCode, 30),
    documentNumber,
    date,
    dueDate,
    lines,
    totalCents,
    deductibleVatCents: lines.reduce((sum, line) => sum + (line.vatDeductible ? line.vatCents : 0), 0),
    note: clean(values.note, 500),
  };
}

const sourceKeyOfInvoice = (id) => `purchase-invoice:${id}`;
const sourceKeyOfPayment = (invoiceId, paymentId) => `purchase-payment:${invoiceId}:${paymentId}`;
const entryIdOf = (sourceKey) => `auto_${sourceKey.replace(/[^A-Za-z0-9_-]/g, "_")}`;

// OA Ostuarve kanne: the line text is „<tarnija> <kirjeldus>” (the journal joins the entry description and the line
// note with a space for purchase entries); without a deductible VAT the whole amount goes to the cost account
function purchaseInvoiceEntry(id, invoice) {
  const lines = [];
  invoice.lines.forEach((line) => {
    const vat = line.vatDeductible ? line.vatCents : 0;
    lines.push({ account: line.account, debitCents: line.amountCents - vat, creditCents: 0, note: line.description });
    if (vat) lines.push({ account: PURCHASE_ACCOUNTS.inputVat, debitCents: vat, creditCents: 0, note: `Sisendkäibemaks · ${line.description}` });
  });
  lines.push({ account: PURCHASE_ACCOUNTS.payables, debitCents: 0, creditCents: invoice.totalCents, note: `Arve ${invoice.documentNumber}` });
  return {
    sourceKey: sourceKeyOfInvoice(id),
    origin: "auto",
    date: invoice.date,
    documentType: "purchaseInvoice",
    documentRef: invoice.documentNumber,
    description: invoice.supplierName,
    purchaseInvoiceId: id,
    lines: lines.filter((l) => l.debitCents || l.creditCents),
    totalCents: invoice.totalCents,
  };
}

function paymentRecord(values = {}, invoice) {
  const date = validDate(values.date, "Tasumise kuupäev");
  if (date < invoice.date) throw purchaseError("Tasumise kuupäev ei saa olla enne arve kuupäeva.");
  const open = invoice.totalCents - Number(invoice.paidCents || 0);
  if (open <= 0) throw purchaseError("Arve on juba tasutud.", 409);
  const amountCents = values.amountCents === undefined || values.amountCents === null || values.amountCents === "" ? open : cents(values.amountCents, "Tasutud summa");
  if (amountCents > open) throw purchaseError(`Tasutud summa on suurem kui tasumata osa (${(open / 100).toFixed(2)}).`);
  const method = PAYMENT_METHODS.has(values.method) ? values.method : "bank";
  return { date, amountCents, method, reference: clean(values.reference, 80) };
}

// VM Väljamakse kanne: the money leaves the bank or the cash box and the debt to the supplier is gone
function supplierPaymentEntry(invoiceId, invoice, payment) {
  const account = payment.method === "cash" ? PURCHASE_ACCOUNTS.cash : PURCHASE_ACCOUNTS.bank;
  const note = `Arve ${invoice.documentNumber} tasumine`;
  return {
    sourceKey: sourceKeyOfPayment(invoiceId, payment.id),
    origin: "auto",
    date: payment.date,
    documentType: "supplierPayment",
    documentRef: payment.reference || invoice.documentNumber,
    description: invoice.supplierName,
    purchaseInvoiceId: invoiceId,
    lines: [
      { account: PURCHASE_ACCOUNTS.payables, debitCents: payment.amountCents, creditCents: 0, note },
      { account, debitCents: 0, creditCents: payment.amountCents, note },
    ],
    totalCents: payment.amountCents,
  };
}

const DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

// the invoice PDF or photo (the same rules as an expense receipt: PDF / JPEG / PNG / WebP below 10 MB)
function purchaseDocumentRecord({ purchaseInvoiceId, documentId, storagePath, fileName, contentType, size, uploadedAt } = {}) {
  const invoiceId = String(purchaseInvoiceId || "").trim();
  const docId = String(documentId || "").trim();
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(invoiceId) || !/^[A-Za-z0-9_-]{12,120}$/.test(docId)) throw purchaseError("Vigane arve või faili ID.");
  const expectedPath = `financial/purchase-invoices/${invoiceId}/${docId}`;
  if (String(storagePath || "").trim() !== expectedPath) throw purchaseError("Faili asukoht ei vasta arvele.");
  const name = clean(fileName, 180);
  const type = String(contentType || "").trim().toLowerCase();
  const bytes = Number(size);
  if (!name || !DOCUMENT_TYPES.has(type) || !Number.isInteger(bytes) || bytes <= 0 || bytes > 10 * 1024 * 1024) throw purchaseError("Fail peab olema PDF, JPEG, PNG või WebP ja alla 10 MB.");
  return { id: docId, kind: "purchase_invoice", purchaseInvoiceId: invoiceId, storagePath: expectedPath, fileName: name, contentType: type, size: bytes, uploadedAt: String(uploadedAt || "") };
}

const statusOf = (totalCents, paidCents) => (paidCents >= totalCents ? "paid" : "unpaid");

module.exports = {
  PURCHASE_ACCOUNTS,
  cleanIban,
  entryIdOf,
  paymentRecord,
  purchaseDocumentRecord,
  purchaseInvoiceEntry,
  purchaseInvoiceRecord,
  sourceKeyOfInvoice,
  sourceKeyOfPayment,
  statusOf,
  supplierPaymentEntry,
  supplierRecord,
};
