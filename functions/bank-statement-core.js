"use strict";

// Pangapõhine raamatupidamine (owner 2026-11-03: „в бухгалтерию попадают только те деньги, за которые мы получили
// деньги по счетам, только на основе банка”; docs/ACCOUNTING.md „Pangapõhine raamatupidamine”).
//
// Pure functions, no Firestore:
// - parseStatement: the LHV account statement CSV (Russian, Estonian or English headers) → one record per bank line,
//   incoming (C) and outgoing (D), with a stable id (the bank's „Ссылка проводки” / „Kande viide”);
// - invoiceNumbersIn: „KS-2026-085”, „Arve KS -2026-083”, „KC- 2026-088”, „Makse selgitus KS-2026-097” → KS-2026-085 …;
// - matchLine: what a line is in the CRM — an existing bank transaction, an existing payment typed by hand (linked, so
//   it is booked on the bank date), a new payment on the invoices named in the explanation (sure), a suggestion
//   (likely: payer + amount + open balance, the payer's memory, LinkPay), a supplier payment or a refund (outgoing);
// - ruleFor: a bank line without a document, categorised by the accountant once or by a saved rule (the entry itself is
//   made by accounting-core automaticEntries, source key bank-line:<id>).
//
// bankStatementLines/{id}: { accountIban, date, direction: "C" | "D", amountCents (> 0), currency, counterpartyName,
//   counterpartyAccount, counterpartyRegCode (8-digit registry codes only; personal codes are never stored),
//   explanation, referenceNumber, documentNumber, archiveId, transactionRef, providerRef, importId, state, match,
//   bankTransactionId, paymentIds, creditIds, entryKeys, category, … } — see docs/ACCOUNTING.md.

const crypto = require("crypto");

// the company's own account(s): a statement of any other account (the owner's FIE account) is refused
const COMPANY_ACCOUNTS = Object.freeze(["EE917700771011885682"]);

const LINE_STATES = Object.freeze(["matched", "review", "unmatched", "categorized"]);

// column names → field (compared after headerKey: lower case, accents and punctuation removed)
const HEADERS = {
  account: ["Счёт клиента", "Счет клиента", "Kliendi konto", "Customer account", "Customer account no", "Account no"],
  documentNumber: ["Номер документа", "Dokumendi number", "Document number", "Document no"],
  date: ["Дата", "Kuupäev", "Date", "Booking date"],
  counterpartyAccount: ["Счёт плательщика/получателя", "Счёт получателя/плательщика", "Saaja/maksja konto", "Beneficiary's account", "Sender/receiver account", "Counterparty account"],
  counterpartyName: ["Имя плательщика/получателя", "Имя получателя/плательщика", "Saaja/maksja nimi", "Beneficiary's name", "Sender/receiver name", "Counterparty name"],
  direction: ["Дебет/Кредит (D/C)", "Deebet/Kreedit (D/C)", "Debit/Credit (D/C)", "D/C"],
  amount: ["Сумма", "Summa", "Amount"],
  referenceNumber: ["Номер ссылки", "Viitenumber", "Reference number"],
  archiveId: ["Признак архивирования", "Архивный признак", "Arhiveerimistunnus", "Archiving code", "Archive code"],
  explanation: ["Пояснение", "Selgitus", "Description", "Details"],
  currency: ["Валюта", "Valuuta", "Currency"],
  regCode: ["Личный код или регистрационный код", "Isiku- või registrikood", "Isikukood või registrikood", "Personal code or register code", "Personal or registry code"],
  transactionRef: ["Ссылка проводки", "Kande viide", "Transaction reference"],
  providerRef: ["Ссылка поставщика счета", "Konto teenusepakkuja viide", "Account servicer reference"],
};

const headerKey = (value) => String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const HEADER_KEYS = Object.fromEntries(Object.entries(HEADERS).map(([field, names]) => [field, names.map(headerKey)]));

const clean = (value, max = 300) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const ibanKey = (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 34);
const safeId = (value) => String(value || "").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 120);

// the whole text, with quoted cells that may hold the separator, "" and line breaks
function csvRows(text, separator) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { cell += '"'; i += 1; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === separator) { row.push(cell); cell = ""; } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

function detectSeparator(text) {
  const first = String(text || "").replace(/^﻿/, "").split(/\r?\n/)[0] || "";
  const count = (sep) => first.split(sep).length;
  return [";", "\t", ","].sort((a, b) => count(b) - count(a))[0];
}

// "1 234,56" | "-50.00" | "1.234,50" → cents (signed)
function amountCents(value) {
  const source = String(value || "").trim();
  if (!source) return null;
  const negative = /^-/.test(source) || /^\(.*\)$/.test(source);
  let n = source.replace(/[()€A-Za-z\s +-]/g, "");
  const comma = n.lastIndexOf(",");
  const dot = n.lastIndexOf(".");
  if (comma > dot) n = n.replace(/\./g, "").replace(",", ".");
  else n = n.replace(/,/g, "");
  const amount = Number(n);
  if (!n || !Number.isFinite(amount)) return null;
  return (negative ? -1 : 1) * Math.round(amount * 100);
}

function isoDate(value) {
  const s = String(value || "").trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const local = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  const parts = iso ? [iso[1], iso[2], iso[3]] : local ? [local[3], local[2].padStart(2, "0"), local[1].padStart(2, "0")] : null;
  if (!parts) return "";
  const date = parts.join("-");
  const parsed = new Date(`${date}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : "";
}

// a stable id of a bank line: the bank's own transaction reference, else the archive code, else a hash of the line
function lineIdOf(line) {
  if (line.transactionRef) return `lhv_${safeId(line.transactionRef)}`;
  if (line.archiveId) return `lhva_${safeId(line.archiveId)}`;
  const hash = crypto.createHash("sha256").update(JSON.stringify([line.accountIban, line.date, line.direction, line.amountCents, line.counterpartyAccount, line.counterpartyName, line.explanation, line.documentNumber])).digest("hex").slice(0, 32);
  return `lhvh_${hash}`;
}

// → { accountIbans, lines, errors, skipped }
function parseStatement(text) {
  const separator = detectSeparator(text);
  const rows = csvRows(text, separator);
  if (rows.length < 2) return { accountIbans: [], lines: [], errors: ["Failis ei ole pangaridu."], skipped: 0 };
  const header = rows[0].map(headerKey);
  const col = Object.fromEntries(Object.entries(HEADER_KEYS).map(([field, keys]) => [field, header.findIndex((h) => keys.includes(h))]));
  if (col.date < 0 || col.amount < 0) return { accountIbans: [], lines: [], errors: ["Väljavõttel peavad olema kuupäeva ja summa veerud (LHV konto väljavõte CSV)."], skipped: 0 };
  const lines = [];
  const errors = [];
  let skipped = 0;
  rows.slice(1).forEach((cells, index) => {
    const cell = (field) => (col[field] >= 0 ? clean(cells[col[field]]) : "");
    const date = isoDate(cell("date"));
    const signed = amountCents(cell("amount"));
    if (!date || signed === null) { errors.push(`Rida ${index + 2}: kuupäeva või summat ei õnnestunud lugeda.`); return; }
    if (!signed) { skipped += 1; return; }
    const dc = cell("direction").toUpperCase();
    const direction = dc.startsWith("D") ? "D" : dc.startsWith("C") || dc.startsWith("K") ? "C" : signed < 0 ? "D" : "C";
    const regCode = cell("regCode").replace(/\s+/g, "");
    const line = {
      sourceLine: index + 2,
      accountIban: ibanKey(cell("account")),
      date,
      direction,
      amountCents: Math.abs(signed),
      currency: (cell("currency") || "EUR").toUpperCase().slice(0, 3),
      counterpartyName: clean(cell("counterpartyName"), 160),
      counterpartyAccount: ibanKey(cell("counterpartyAccount")),
      // a company's registry code (8 digits) helps the rules; a person's code (11 digits) is personal data: not kept
      counterpartyRegCode: /^\d{8}$/.test(regCode) ? regCode : "",
      explanation: clean(cell("explanation"), 300),
      referenceNumber: clean(cell("referenceNumber"), 40),
      documentNumber: clean(cell("documentNumber"), 60),
      archiveId: clean(cell("archiveId"), 60),
      transactionRef: clean(cell("transactionRef"), 60),
      providerRef: clean(cell("providerRef"), 80),
    };
    line.id = lineIdOf(line);
    lines.push(line);
  });
  const seen = new Set();
  const unique = lines.filter((line) => !seen.has(line.id) && seen.add(line.id));
  return { accountIbans: [...new Set(unique.map((l) => l.accountIban).filter(Boolean))], lines: unique, errors, skipped: skipped + lines.length - unique.length };
}

// invoice numbers named in an explanation: KS-2026-085 written as „KS -2026-083”, „KC- 2026-088”, „ks2026-85”, „Arve
// KS-2026-107” … The CRM numbers its invoices KS-<year>-<NNN> (invoice-numbering-core.js).
function invoiceNumbersIn(text) {
  const found = new Set();
  const re = /(^|[^A-Za-z0-9])K\s*[SC]\s*[-–—_.]?\s*(20\d{2})\s*[-–—_./]\s*(\d{1,4})(?!\d)/gi;
  let m;
  while ((m = re.exec(String(text || "")))) found.add(`KS-${m[2]}-${String(Number(m[3])).padStart(3, "0")}`);
  return [...found];
}

const normalizedInvoiceNum = (value) => {
  const m = String(value || "").trim().match(/^K\s*[SC]\s*-?\s*(\d{4})\s*-\s*(\d+)$/i);
  return m ? `KS-${m[1]}-${String(Number(m[2])).padStart(3, "0")}` : String(value || "").trim().toUpperCase();
};

// "SMIRNOVA JEKATERINA" = "Jekaterina Smirnova"
const nameKey = (value) => String(value || "").toLocaleLowerCase("et").normalize("NFC").split(/[^a-z0-9äöõüšžа-яё]+/i).filter((w) => w.length >= 2).sort().join(" ");
const textKey = (value) => String(value || "").toLocaleLowerCase("et").replace(/\s+/g, " ").trim();

const centsOf = (record, field = "amount") => {
  const exact = Number(record?.[`${field}Cents`]);
  if (Number.isFinite(exact)) return Math.round(exact);
  const amount = Number(record?.[field]);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
};

// fully credited („Krediteeritud”, or replaced by a corrected invoice): owes nothing, takes no payment (Fable Д6)
const isFullyCredited = (invoice = {}) => invoice.status === "Krediteeritud" || ["fully_credited", "corrected"].includes(invoice.correctionStatus);

// a credited invoice → the live invoice that replaced it (correctedBy, followed through repeated corrections), or null
function replacementInvoice(invoice, invoiceById) {
  let current = invoice;
  for (let step = 0; step < 5 && current && isFullyCredited(current); step += 1) {
    const nextId = current.correctedBy?.invoiceId;
    current = nextId ? invoiceById.get(nextId) : null;
  }
  return current && current.status !== "Tühistatud" && !isFullyCredited(current) ? current : null;
}

function invoiceBalanceCents(invoice = {}) {
  if (invoice.status === "Tühistatud" || isFullyCredited(invoice)) return 0;
  if (Number.isFinite(Number(invoice.balanceDueCents))) return Math.max(0, Number(invoice.balanceDueCents));
  if (Number.isFinite(Number(invoice.amountCents))) return Math.max(0, Number(invoice.amountCents) - (Number(invoice.paidAmountCents) || 0));
  return Math.max(0, Math.round(((Number(invoice.amount) || 0) - (Number(invoice.paidAmount) || 0)) * 100));
}

const isActivePayment = (p) => p && p.status !== "voided" && p.status !== "void";
// a payment typed by hand that no bank line stands behind yet (bank, card or other — the money of 1010)
const isUnlinkedTypedPayment = (p) => isActivePayment(p) && !p.bankTransactionId && !p.bankStatementLineId && !/^lhv-/.test(String(p.requestId || "")) && ["bank", "card", "other", ""].includes(String(p.method || "")) && !p.sourceCreditId;
const daysBetween = (a, b) => Math.round((Date.parse(`${a}T12:00:00Z`) - Date.parse(`${b}T12:00:00Z`)) / 86400000);
const paymentDate = (p) => String(p.bankDate || p.paidAt || "").slice(0, 10);

// who paid for whom before: the payer's account and name → the student ids (bankTransactions + their payments)
function payerMemory({ bankTransactions = [], payments = [], lines = [] } = {}) {
  const memory = new Map();
  const add = (key, studentId) => {
    if (!key || !studentId) return;
    if (!memory.has(key)) memory.set(key, new Set());
    memory.get(key).add(studentId);
  };
  const txById = new Map(bankTransactions.map((tx) => [tx.id, tx]));
  const lineById = new Map(lines.map((line) => [line.id, line]));
  const keysOf = (account, name) => [account ? `acct:${ibanKey(account)}` : "", nameKey(name) ? `name:${nameKey(name)}` : ""];
  bankTransactions.forEach((tx) => (tx.paidStudentIds || []).concat(tx.creditStudentId || []).forEach((id) => keysOf(tx.payerAccount, tx.payerName).forEach((key) => add(key, id))));
  payments.filter(isActivePayment).forEach((p) => {
    const tx = p.bankTransactionId ? txById.get(p.bankTransactionId) : null;
    if (tx) keysOf(tx.payerAccount, tx.payerName).forEach((key) => add(key, p.studentId));
    const line = p.bankStatementLineId ? lineById.get(p.bankStatementLineId) : null;
    if (line) keysOf(line.counterpartyAccount, line.counterpartyName).forEach((key) => add(key, p.studentId));
  });
  return memory;
}

const allocationsFor = (invoices, amountCents) => {
  let left = amountCents;
  return invoices.map((invoice) => {
    const cents = Math.min(left, invoiceBalanceCents(invoice));
    left -= cents;
    return { invoiceId: invoice.id, invoiceNum: String(invoice.num || ""), studentId: String(invoice.studentId || ""), amountCents: cents };
  }).filter((a) => a.amountCents > 0);
};

const NONE = Object.freeze({ kind: "none", confidence: "none", reason: "" });

// → { kind: "bankTransaction" | "payments" | "allocate" | "purchasePayment" | "refund" | "none", confidence: "sure" |
//   "likely" | "none", reason, … }. Only "sure" is executed without a person (docs: the invoice number is in the
// explanation, the bank's archive code is already in the CRM, or a typed payment of exactly this amount on that
// invoice). The rest is a suggestion in „Kinnita vasted”.
function matchLine(line, { invoices: allInvoices = [], payments = [], bankTransactions = [], purchaseInvoices = [], refunds = [], memory = new Map(), takenPaymentIds = new Set() } = {}) {
  // a line of the company account never pays an FIE invoice (the owner's own sole proprietorship, owner 2026-11-09)
  const invoices = allInvoices.filter((inv) => inv.issuer !== "fie");
  if (line.currency && line.currency !== "EUR") return { ...NONE, reason: `valuuta ${line.currency}` };
  if (line.direction === "D") return matchOutgoing(line, { purchaseInvoices, refunds, takenPaymentIds });

  // 1. the same bank line was already recorded in the CRM (the earlier CSV flow, or the 2026-10-15 LHV run)
  const archive = line.archiveId || "";
  // (the earlier CSV flow did not read the archive code of the Russian export: then the same day, amount and payer)
  const tx = (archive ? bankTransactions.find((t) => t.externalId && (t.externalId === archive || t.externalId === line.transactionRef)) : null)
    || bankTransactions.find((t) => !t.externalId && !t.statementLineId && String(t.paidAt || "") === line.date && centsOf(t) === line.amountCents && nameKey(t.payerName) && nameKey(t.payerName) === nameKey(line.counterpartyName));
  if (tx) return { kind: "bankTransaction", confidence: "sure", reason: "pangarida on CRM-is juba seotud", bankTransactionId: tx.id };
  const legacy = archive ? payments.filter((p) => isActivePayment(p) && String(p.requestId || "").startsWith(`lhv-${archive}`)) : [];
  if (legacy.length) return { kind: "payments", confidence: "sure", reason: "makse on sellest pangareast juba sisestatud", paymentIds: legacy.map((p) => p.id) };

  const free = (p) => isUnlinkedTypedPayment(p) && !takenPaymentIds.has(p.id);
  const notCancelled = invoices.filter((inv) => inv.status !== "Tühistatud");
  // a fully credited invoice bills nothing: never a candidate for the money (Fable Д6)
  const open = notCancelled.filter((inv) => !isFullyCredited(inv));
  const byNum = new Map(notCancelled.map((inv) => [normalizedInvoiceNum(inv.num), inv]));
  const text = `${line.explanation} ${line.referenceNumber}`;
  const namedAll = [...new Set([
    ...invoiceNumbersIn(text).map((num) => byNum.get(num)).filter(Boolean),
    ...(line.referenceNumber ? notCancelled.filter((inv) => inv.paymentReference && String(inv.paymentReference) === line.referenceNumber) : []),
  ])];
  // the payer used the number of a credited invoice: the money goes to the invoice that replaced it (a person confirms),
  // or — no replacement — the line stays for a person to decide; it never becomes an advance on its own
  const creditedNamed = namedAll.filter(isFullyCredited);
  const invoiceByIdAll = new Map(invoices.map((inv) => [inv.id, inv]));
  const replacements = creditedNamed.map((inv) => replacementInvoice(inv, invoiceByIdAll)).filter(Boolean);
  const named = [...new Set([...namedAll.filter((inv) => !isFullyCredited(inv)), ...replacements])];
  if (creditedNamed.length && !named.length) {
    return { ...NONE, reason: `selgituses krediteeritud arve ${creditedNamed.map((inv) => inv.num).join(", ")} — vali arve käsitsi` };
  }
  const redirectNote = creditedNamed.length
    ? ` (selgituses krediteeritud ${creditedNamed.map((inv) => inv.num).join(", ")}${replacements.length ? " — asendusarve" : ""})`
    : "";
  // a credited invoice in the explanation makes the match only a suggestion: a person confirms where the money goes
  const sureUnlessRedirected = creditedNamed.length ? "likely" : "sure";

  // 2. invoices named in the explanation (number or the invoice's reference number)
  if (named.length) {
    const nums = `${named.map((inv) => inv.num).join(", ")}${redirectNote}`;
    const typed = payments.filter((p) => free(p) && named.some((inv) => inv.id === p.invoiceId));
    const exactTyped = typed.filter((p) => centsOf(p) === line.amountCents);
    if (exactTyped.length) {
      const nearest = [...exactTyped].sort((a, b) => Math.abs(daysBetween(paymentDate(a), line.date)) - Math.abs(daysBetween(paymentDate(b), line.date)))[0];
      return { kind: "payments", confidence: sureUnlessRedirected, reason: `${nums}: käsitsi sisestatud makse ${centsLabel(line.amountCents)} saab panga kuupäeva`, paymentIds: [nearest.id] };
    }
    const typedSum = typed.reduce((n, p) => n + centsOf(p), 0);
    if (typed.length > 1 && typedSum === line.amountCents) return { kind: "payments", confidence: sureUnlessRedirected, reason: `${nums}: ${typed.length} käsitsi sisestatud makset kokku täpselt`, paymentIds: typed.map((p) => p.id) };
    const balance = named.reduce((n, inv) => n + invoiceBalanceCents(inv), 0);
    const allocations = allocationsFor(named, line.amountCents);
    if (balance >= line.amountCents && allocations.length) return { kind: "allocate", confidence: sureUnlessRedirected, reason: `arve number selgituses: ${nums}`, allocations, creditStudentId: "" };
    // more money than is open: a payment typed with another amount, an invoice already paid, or a real overpayment
    const studentId = named[0].studentId || "";
    return { kind: "allocate", confidence: "likely", reason: balance ? `${nums}: laekus ${centsLabel(line.amountCents)}, avatud ${centsLabel(balance)} — ülejääk ettemaksuks` : `${nums} on juba makstud — kontrolli, kas makse on topelt; raha läheks ettemaksuks`, allocations, creditStudentId: studentId };
  }
  if (invoiceNumbersIn(text).length) return { ...NONE, reason: `selgituses arve ${invoiceNumbersIn(text).join(", ")}, mida CRM-is ei ole` };

  // 3. LinkPay: the bank pays the card money of a LinkPay payment to the account
  const linkpay = payments.filter((p) => isActivePayment(p) && p.method === "linkpay" && !p.bankStatementLineId && !takenPaymentIds.has(p.id) && centsOf(p) === line.amountCents && daysBetween(line.date, paymentDate(p)) >= 0 && daysBetween(line.date, paymentDate(p)) <= 5);
  if (linkpay.length === 1) return { kind: "payments", confidence: "likely", reason: "LinkPay makse sama summaga", paymentIds: [linkpay[0].id] };

  // 4. a payment typed by hand: the same payer name and amount within 45 days
  const payer = nameKey(line.counterpartyName);
  const invoiceById = new Map(invoices.map((inv) => [inv.id, inv]));
  const sameName = (value) => payer && nameKey(value) && (nameKey(value) === payer || nameKey(value).split(" ").filter((w) => payer.includes(w)).length >= 2);
  const typedByName = payments.filter((p) => free(p) && centsOf(p) === line.amountCents && Math.abs(daysBetween(paymentDate(p), line.date)) <= 45
    && [p.payerName, invoiceById.get(p.invoiceId)?.payerName, invoiceById.get(p.invoiceId)?.parentName, p.studentName].some(sameName));
  if (typedByName.length === 1) return { kind: "payments", confidence: "likely", reason: "käsitsi sisestatud makse: sama maksja ja summa", paymentIds: [typedByName[0].id] };

  // 5. the payer paid for this child before (account or name) and one open invoice has exactly this balance
  const unpaid = open.filter((inv) => invoiceBalanceCents(inv) > 0);
  const students = memory.get(line.counterpartyAccount ? `acct:${line.counterpartyAccount}` : "") || memory.get(payer ? `name:${payer}` : "");
  if (students) {
    const exact = unpaid.filter((inv) => students.has(inv.studentId) && invoiceBalanceCents(inv) === line.amountCents);
    if (exact.length === 1) return { kind: "allocate", confidence: "likely", reason: "sama maksja on maksnud selle õpilase eest; summa = avatud arve", allocations: allocationsFor(exact, line.amountCents), creditStudentId: "" };
  }
  // 6. the payer's name on exactly one open invoice with exactly this balance
  const byName = unpaid.filter((inv) => invoiceBalanceCents(inv) === line.amountCents && [inv.payerName, inv.parentName, inv.studentName].some(sameName));
  if (byName.length === 1) return { kind: "allocate", confidence: "likely", reason: "maksja nimi ja summa = avatud arve", allocations: allocationsFor(byName, line.amountCents), creditStudentId: "" };
  return NONE;
}

// outgoing: a supplier payment typed on Ostuarved (VM entry) or a refund of an advance — so the line is not booked twice
function matchOutgoing(line, { purchaseInvoices = [], refunds = [], takenPaymentIds = new Set() }) {
  const candidates = [];
  purchaseInvoices.forEach((invoice) => (invoice.payments || []).forEach((p) => {
    if (p.method === "cash" || p.bankStatementLineId || takenPaymentIds.has(`${invoice.id}:${p.id}`)) return;
    if (Number(p.amountCents) !== line.amountCents || Math.abs(daysBetween(String(p.date || ""), line.date)) > 7) return;
    const named = (invoice.documentNumber && textKey(line.explanation).includes(textKey(invoice.documentNumber)))
      || (nameKey(invoice.supplierName) && nameKey(line.counterpartyName) && nameKey(line.counterpartyName).includes(nameKey(invoice.supplierName).split(" ")[0]));
    candidates.push({ invoice, payment: p, named });
  }));
  const sure = candidates.filter((c) => c.named);
  const pick = sure.length === 1 ? sure[0] : candidates.length === 1 ? candidates[0] : null;
  if (pick) return { kind: "purchasePayment", confidence: pick.named ? "sure" : "likely", reason: `ostuarve ${pick.invoice.documentNumber || ""} tasumine (${pick.invoice.supplierName || ""})`.replace(/\s+/g, " "), purchaseInvoiceId: pick.invoice.id, purchasePaymentId: pick.payment.id };
  const refund = refunds.filter((r) => r.method !== "cash" && !r.bankStatementLineId && !takenPaymentIds.has(`refund:${r.id}`) && centsOf(r) === line.amountCents && Math.abs(daysBetween(String(r.refundedAt || "").slice(0, 10), line.date)) <= 7);
  if (refund.length === 1) return { kind: "refund", confidence: "likely", reason: "ettemaksu tagastus sama summaga", refundId: refund[0].id };
  return NONE;
}

function centsLabel(cents) {
  return `${(Number(cents || 0) / 100).toFixed(2).replace(".", ",")} €`;
}

// ---- rules for lines without a document (the accountant assigns a category once; a rule repeats it) ----
// bankRules/{id}: { direction: "C" | "D" | "", counterpartyAccount, counterpartyName, explanation, account, label, active }
function cleanRule(values = {}) {
  const rule = {
    direction: ["C", "D"].includes(values.direction) ? values.direction : "",
    counterpartyAccount: ibanKey(values.counterpartyAccount),
    counterpartyName: clean(values.counterpartyName, 120),
    explanation: clean(values.explanation, 120),
    account: clean(values.account, 10),
    label: clean(values.label, 80),
    active: values.active !== false,
  };
  if (!rule.counterpartyAccount && !rule.counterpartyName && !rule.explanation) throw Object.assign(new Error("Reeglil peab olema vähemalt üks tingimus (konto, nimi või selgituse tekst)."), { status: 400 });
  if (!/^\d{4}$/.test(rule.account)) throw Object.assign(new Error("Vali konto."), { status: 400 });
  return rule;
}

const ruleMatches = (rule, line) => rule.active !== false
  && (!rule.direction || rule.direction === line.direction)
  && (!rule.counterpartyAccount || rule.counterpartyAccount === line.counterpartyAccount)
  && (!rule.counterpartyName || textKey(line.counterpartyName).includes(textKey(rule.counterpartyName)))
  && (!rule.explanation || textKey(line.explanation).includes(textKey(rule.explanation)));
const ruleWeight = (rule) => (rule.counterpartyAccount ? 4 : 0) + (rule.counterpartyName ? 2 : 0) + (rule.explanation ? 1 : 0) + (rule.direction ? 0.5 : 0);

// the most specific active rule (account > name > explanation); ties: the older rule
function ruleFor(line, rules = []) {
  return rules.filter((rule) => ruleMatches(rule, line)).sort((a, b) => ruleWeight(b) - ruleWeight(a) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")))[0] || null;
}

const BANK_ACCOUNT = "1010";

// the source keys of the automatic entries that book a line's money (accounting-core automaticEntries): the month check
// finds a line's entries by these
function entryKeysOf({ paymentIds = [], creditIds = [], lineId = "", categorized = false, purchase = null, refundId = "" } = {}) {
  return [
    ...paymentIds.map((id) => `payment:${id}`),
    ...creditIds.map((id) => `credit:${id}`),
    ...(categorized && lineId ? [`bank-line:${lineId}`] : []),
    ...(purchase ? [`purchase-payment:${purchase.invoiceId}:${purchase.paymentId}`] : []),
    ...(refundId ? [`refund:${refundId}`] : []),
  ];
}

// presets offered in „Ilma dokumendita read” (Merit Aktiva accounts of accounting-chart.js); the accountant may type any
// open account instead
const CATEGORY_PRESETS = Object.freeze({
  C: [
    { account: "3000", label: "Müügitulu (tasu ilma arveta)" },
    { account: "2500", label: "Ettemaks ostjalt" },
    { account: "3530", label: "Toetus (Töötukassa jm)" },
    { account: "3560", label: "Muu äritulu" },
    { account: "2030", label: "Laen omanikult" },
    { account: "1230", label: "Aruandva isiku tagastus" },
  ],
  D: [
    { account: "4320", label: "IT teenused, tarkvara" },
    { account: "4210", label: "Ruumide rent" },
    { account: "2210", label: "Palga väljamakse" },
    { account: "1210", label: "Maksude ettemaksukonto (EMTA)" },
    { account: "4340", label: "Pangateenus" },
    { account: "4050", label: "Õppematerjalid" },
    { account: "4330", label: "Kontoritarbed" },
    { account: "1230", label: "Aruandev isik (omanik)" },
    { account: "2030", label: "Laenu tagasimakse omanikule" },
    { account: "4970", label: "Ettevõtlusega mitteseotud kulu" },
    { account: "4398", label: "Muu tegevuskulu" },
  ],
});

module.exports = {
  BANK_ACCOUNT,
  CATEGORY_PRESETS,
  COMPANY_ACCOUNTS,
  LINE_STATES,
  amountCents,
  entryKeysOf,
  cleanRule,
  csvRows,
  ibanKey,
  invoiceBalanceCents,
  isFullyCredited,
  invoiceNumbersIn,
  isUnlinkedTypedPayment,
  lineIdOf,
  matchLine,
  nameKey,
  normalizedInvoiceNum,
  parseStatement,
  payerMemory,
  ruleFor,
  safeId,
};
