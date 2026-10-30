"use strict";

// Bookkeeping (owner 2026-10-22: „полная бухгалтерия” on the site, from 2026-01-01, E&P Koolitus OÜ is not VAT
// registered). Raamatupidamise seadus:
// - § 6: every business transaction is recorded by double entry; an entry (kirjend) has the transaction date, an
//   identifier (number), the debited and credited accounts with amounts and a reference to its source document;
// - § 8: a chart of accounts (accounting-chart.js, the owner's Merit Aktiva chart);
// - § 9: the registers allow extracts by account in chronological order (päevaraamat, pearaamat, käibeandmik);
// - § 10: an entry is never changed silently — while its period is open it is corrected in place with a history
//   (who, when, why, before / after; a deleted manual entry stays as a tombstone), after the lock by a storno or a new
//   correcting entry;
// - § 12: entries are kept for seven years (nothing here deletes them).
//
// Pure functions: the CRM's documents (invoices, credit notes, payments, payer credits, refunds, expenses) → the
// automatic entries they require. Each automatic entry has a stable source key, so a sync creates every entry once.
// accountingEntries/{id}: { number: "2026-0001", year, date, description, documentType, documentRef, sourceKey,
//   origin: "auto" | "manual" | "opening" | "reversal", lines: [{ account, debitCents, creditCents, note }],
//   totalCents, reversalOf, reason, createdAt, createdBy }

const ACCOUNTING_START_DATE = "2026-01-01";

// automatic posting accounts (Merit Aktiva codes); sales revenue goes to 3000 (the accountant 2026-10-23; until then
// 3060 Maksuvaba müügitulu — entries already written keep 3060, docs/ACCOUNTING.md) and an expense is booked with its
// VAT (the VAT is not deductible without a VAT registration)
const POSTING_ACCOUNTS = Object.freeze({
  cash: "1000",
  bank: "1010",
  receivables: "1200",
  prepayments: "2500",
  sales: "3000",
  otherPayables: "2450",
});

const EXPENSE_ACCOUNTS = Object.freeze({
  rent: "4210",
  advertising: "4300",
  software: "4320",
  learning_materials: "4050",
  bank_fees: "4340",
  taxes: "4360",
  office: "4330",
  travel: "4510",
  other: "4398",
});

function accountingError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

// ---- partners (the accountant 2026-10-24: „Поставщиков сначала, и привяжи их к проводкам”) ----
// Like Merit Aktiva: a line on a partner account carries the partner — { type: "supplier" | "customer", id, name }.
// A supplier is a suppliers/{id} card; a customer is the student / payer card of a sales document. Lines on the
// supplier accounts below need a supplier in a new manual entry; the partner report (Partnerid) groups by it.
const PARTNER_TYPES = Object.freeze(["supplier", "customer"]);
const SUPPLIER_ACCOUNTS = Object.freeze(["2110", "1350"]);
const CUSTOMER_ACCOUNTS = Object.freeze(["1200", "2500"]);

const cleanText = (value, max) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

// a line's partner, normalised; null when the line has none
function cleanPartner(value) {
  if (!value || typeof value !== "object") return null;
  const id = cleanText(value.id, 160);
  const name = cleanText(value.name, 160);
  if (!id && !name) return null;
  const type = String(value.type || "").trim();
  if (!PARTNER_TYPES.includes(type)) throw accountingError(`Partner „${name || id}”: vali tarnija nimekirjast (Tarnijad).`);
  if (!name) throw accountingError("Partneri nimi on kohustuslik.");
  return { type, id, name };
}

const partnerOf = (line) => (line?.partner && (line.partner.id || line.partner.name) ? { type: String(line.partner.type || ""), id: String(line.partner.id || ""), name: String(line.partner.name || "") } : null);

const isoDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") return (value.match(/^\d{4}-\d{2}-\d{2}/) || [""])[0];
  if (typeof value?.toDate === "function") return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return "";
};

const cents = (record, field = "amount") => {
  const exact = Number(record?.[`${field}Cents`]);
  if (Number.isFinite(exact)) return Math.round(exact);
  const amount = Number(record?.[field]);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
};

const money = (value) => (Number(value || 0) / 100).toFixed(2);

function line(account, debitCents, creditCents, note = "") {
  return { account: String(account), debitCents: Math.max(0, Math.round(debitCents || 0)), creditCents: Math.max(0, Math.round(creditCents || 0)), note };
}

// one debit and one credit of the same amount
function simple(account1, account2, amountCents) {
  return [line(account1, amountCents, 0), line(account2, 0, amountCents)];
}

// the customer of a sales document: the student card it belongs to and the payer's name (the 1200 / 2500 lines)
function customerOf(record = {}, invoice = {}) {
  const id = cleanText(record.studentId || invoice?.studentId, 160);
  const name = cleanText(record.payerName || invoice?.payerName || invoice?.parentName || record.studentName || invoice?.studentName, 160);
  if (!id && !name) return null;
  return { type: "customer", id, name: name || id };
}
// the partner on the lines of the given accounts
const withPartner = (lines, accounts, partner) => (partner ? lines.map((l) => (accounts.includes(l.account) ? { ...l, partner } : l)) : lines);
const CUSTOMER_LINES = [POSTING_ACCOUNTS.receivables, POSTING_ACCOUNTS.prepayments];

const paymentAccount = (method) => (method === "cash" ? POSTING_ACCOUNTS.cash : method === "credit" ? POSTING_ACCOUNTS.prepayments : POSTING_ACCOUNTS.bank);
const methodLabel = { bank: "pangaülekanne", cash: "sularaha", credit: "ettemaksu arvelt", card: "kaardimakse", other: "muu" };

// Automatic entries for the CRM's documents. Documents dated before the start date are already in the opening
// balances; a later reversal of such a document is still booked on its own date.
function automaticEntries({ invoices = [], creditNotes = [], payments = [], payerCredits = [], refunds = [], expenses = [], bankTransactions = [] } = {}, { startDate = ACCOUNTING_START_DATE } = {}) {
  const out = [];
  const add = (entry) => {
    if (!entry.date || entry.date < startDate) return;
    const lines = entry.lines.filter((l) => l.debitCents || l.creditCents);
    if (!lines.length) return;
    out.push({ ...entry, lines, origin: "auto" });
  };
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const creditedByInvoice = new Map();
  creditNotes.forEach((note) => {
    const amount = Math.abs(cents(note));
    creditedByInvoice.set(note.invoiceId, (creditedByInvoice.get(note.invoiceId) || 0) + amount);
  });

  invoices.forEach((invoice) => {
    const amount = cents(invoice);
    const num = String(invoice.num || invoice.id);
    const customer = customerOf(invoice);
    if (amount > 0) {
      add({
        sourceKey: `invoice:${invoice.id}`, date: isoDate(invoice.date), documentType: "invoice", documentRef: num,
        description: `Müügiarve ${num}${invoice.payerName || invoice.studentName ? ` · ${invoice.payerName || invoice.studentName}` : ""}`,
        lines: withPartner(simple(POSTING_ACCOUNTS.receivables, POSTING_ACCOUNTS.sales, amount), CUSTOMER_LINES, customer),
      });
    }
    if (invoice.status === "Tühistatud" && invoice.cancelledAt) {
      const open = amount - (creditedByInvoice.get(invoice.id) || 0);
      if (open > 0) {
        add({
          sourceKey: `invoice-cancel:${invoice.id}`, date: isoDate(invoice.cancelledAt), documentType: "invoice", documentRef: num,
          description: `Arve ${num} tühistamine${invoice.cancellationReason ? ` · ${String(invoice.cancellationReason).slice(0, 80)}` : ""}`,
          lines: withPartner(simple(POSTING_ACCOUNTS.sales, POSTING_ACCOUNTS.receivables, open), CUSTOMER_LINES, customer),
        });
      }
    }
  });

  creditNotes.forEach((note) => {
    const amount = Math.abs(cents(note));
    const num = String(note.num || note.id);
    add({
      sourceKey: `credit-note:${note.id}`, date: isoDate(note.date || note.createdAt), documentType: "creditNote", documentRef: num,
      description: `Kreeditarve ${num}${note.invoiceNum ? ` (arve ${note.invoiceNum})` : ""}`,
      lines: withPartner(simple(POSTING_ACCOUNTS.sales, POSTING_ACCOUNTS.receivables, amount), CUSTOMER_LINES, customerOf(note, invoiceById.get(note.invoiceId))),
    });
  });

  payments.forEach((payment) => {
    const amount = cents(payment);
    if (amount <= 0) return;
    const ref = payment.invoiceNum || payment.invoiceId || payment.id;
    const account = paymentAccount(payment.method);
    const customer = customerOf(payment, invoiceById.get(payment.invoiceId));
    add({
      sourceKey: `payment:${payment.id}`, date: isoDate(payment.paidAt), documentType: "payment", documentRef: String(payment.reference || ref),
      description: `Laekumine arvele ${ref} (${methodLabel[payment.method] || payment.method || "pangaülekanne"})${payment.payerName ? ` · ${payment.payerName}` : ""}`,
      lines: withPartner(simple(account, POSTING_ACCOUNTS.receivables, amount), CUSTOMER_LINES, customer),
    });
    // the CRM marks a cancelled receipt „voided” (index.js); „void” is the old spelling (2026-10-26: the balance showed
    // 1200 at −711 € — five receipts entered twice and voided once stayed booked)
    if ((payment.status === "voided" || payment.status === "void") && payment.voidedAt) {
      add({
        sourceKey: `payment-void:${payment.id}`, date: isoDate(payment.voidedAt), documentType: "payment", documentRef: String(payment.reference || ref),
        description: `Laekumise tühistamine (arve ${ref})${payment.voidReason ? ` · ${String(payment.voidReason).slice(0, 80)}` : ""}`,
        lines: withPartner(simple(POSTING_ACCOUNTS.receivables, account, amount), CUSTOMER_LINES, customer),
      });
    }
  });

  // money received without an invoice (an unmatched bank payment) or the overpaid part of an invoice payment
  const bankById = new Map(bankTransactions.map((tx) => [tx.id, tx]));
  payerCredits.forEach((credit) => {
    const amount = cents(credit, "originalAmount");
    if (amount <= 0) return;
    if (credit.sourcePaymentId) {
      add({
        sourceKey: `credit:${credit.id}`, date: isoDate(credit.createdAt || credit.updatedAt), documentType: "payment", documentRef: String(credit.sourceInvoiceNum || credit.sourcePaymentId),
        description: `Ettemaks (enammakse)${credit.payerName ? ` · ${credit.payerName}` : ""}`,
        lines: withPartner(simple(POSTING_ACCOUNTS.receivables, POSTING_ACCOUNTS.prepayments, amount), CUSTOMER_LINES, customerOf(credit)),
      });
      return;
    }
    const tx = bankById.get(credit.bankTransactionId);
    add({
      sourceKey: `credit:${credit.id}`, date: isoDate(tx?.paidAt || credit.receivedAt || credit.createdAt), documentType: "bankTransaction", documentRef: String(tx?.externalId || credit.bankTransactionId || credit.id),
      description: `Ettemaks pangast${credit.payerName ? ` · ${credit.payerName}` : ""}`,
      lines: withPartner(simple(POSTING_ACCOUNTS.bank, POSTING_ACCOUNTS.prepayments, amount), CUSTOMER_LINES, customerOf(credit)),
    });
  });

  refunds.forEach((refund) => {
    const amount = cents(refund);
    if (amount <= 0) return;
    add({
      sourceKey: `refund:${refund.id}`, date: isoDate(refund.refundedAt), documentType: "refund", documentRef: String(refund.reference || refund.id),
      description: `Ettemaksu tagastus${refund.payerName ? ` · ${refund.payerName}` : ""}`,
      lines: withPartner(simple(POSTING_ACCOUNTS.prepayments, refund.method === "cash" ? POSTING_ACCOUNTS.cash : POSTING_ACCOUNTS.bank, amount), CUSTOMER_LINES, customerOf(refund)),
    });
  });

  expenses.forEach((expense) => {
    const amount = cents(expense);
    if (amount <= 0) return;
    const expenseAccount = EXPENSE_ACCOUNTS[expense.category] || EXPENSE_ACCOUNTS.other;
    const paidFrom = expense.paymentMethod === "cash" ? POSTING_ACCOUNTS.cash : expense.paymentMethod === "other" ? POSTING_ACCOUNTS.otherPayables : POSTING_ACCOUNTS.bank;
    const text = String(expense.description || "").slice(0, 120);
    add({
      sourceKey: `expense:${expense.id}`, date: isoDate(expense.expenseDate), documentType: "expense", documentRef: String(expense.documentNumber || expense.id),
      description: `Kulu: ${text}`,
      lines: simple(expenseAccount, paidFrom, amount),
    });
    if (expense.status === "voided" && expense.voidedAt) {
      add({
        sourceKey: `expense-void:${expense.id}`, date: isoDate(expense.voidedAt), documentType: "expense", documentRef: String(expense.documentNumber || expense.id),
        description: `Kulu tühistamine: ${text}${expense.voidReason ? ` · ${String(expense.voidReason).slice(0, 80)}` : ""}`,
        lines: simple(paidFrom, expenseAccount, amount),
      });
    }
    if (expense.status === "corrected" && expense.correctedAt) {
      add({
        sourceKey: `expense-correction:${expense.id}`, date: isoDate(expense.correctedAt), documentType: "expense", documentRef: String(expense.documentNumber || expense.id),
        description: `Kulu parandus (asendatud): ${text}`,
        lines: simple(paidFrom, expenseAccount, amount),
      });
    }
  });

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.sourceKey.localeCompare(b.sourceKey));
}

// a manual, opening or reversal entry must balance and use known, active accounts. options.suppliers (a Map of
// supplier id → card) checks that a supplier partner exists; options.requirePartner refuses a line on a supplier
// account (2110, 1350) without a supplier (a new manual entry).
function validateEntry(entry, accounts = [], { suppliers = null, requirePartner = false } = {}) {
  const byCode = new Map(accounts.map((account) => [String(account.code), account]));
  const date = isoDate(entry?.date);
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (!date || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw accountingError("Kande kuupäev on vigane.");
  const description = String(entry?.description || "").replace(/\s+/g, " ").trim();
  if (!description) throw accountingError("Kande sisu (kirjeldus) on kohustuslik.");
  const documentRef = String(entry?.documentRef || "").replace(/\s+/g, " ").trim();
  if (!documentRef) throw accountingError("Viide algdokumendile on kohustuslik (RPS § 6).");
  const lines = (Array.isArray(entry?.lines) ? entry.lines : []).map((l) => {
    const out = {
      account: String(l?.account || "").trim(),
      debitCents: Math.round(Number(l?.debitCents || 0)),
      creditCents: Math.round(Number(l?.creditCents || 0)),
      note: String(l?.note || "").replace(/\s+/g, " ").trim().slice(0, 200),
    };
    const partner = cleanPartner(l?.partner);
    if (partner && partner.type === "supplier" && partner.id && suppliers) {
      const card = suppliers.get(partner.id);
      if (!card) throw accountingError(`Tarnijat „${partner.name}” ei leitud (Tarnijad).`);
      partner.name = cleanText(card.name, 160) || partner.name;
    }
    if (partner) out.partner = partner;
    return out;
  }).filter((l) => l.debitCents || l.creditCents);
  if (lines.length < 2) throw accountingError("Kandes peab olema vähemalt üks deebet- ja üks kreeditrida.");
  lines.forEach((l) => {
    const account = byCode.get(l.account);
    if (!account) throw accountingError(`Kontot ${l.account} pole kontoplaanis.`);
    if (account.active === false) throw accountingError(`Konto ${l.account} on suletud.`);
    if (l.debitCents < 0 || l.creditCents < 0 || !Number.isInteger(l.debitCents) || !Number.isInteger(l.creditCents)) throw accountingError("Summad peavad olema positiivsed.");
    if (l.debitCents && l.creditCents) throw accountingError("Ühel real on kas deebet või kreedit, mitte mõlemad.");
    if (requirePartner && SUPPLIER_ACCOUNTS.includes(l.account) && l.partner?.type !== "supplier") throw accountingError(`Konto ${l.account} real on partner (tarnija) kohustuslik.`);
  });
  const debit = lines.reduce((n, l) => n + l.debitCents, 0);
  const credit = lines.reduce((n, l) => n + l.creditCents, 0);
  if (!lines.some((l) => l.debitCents) || !lines.some((l) => l.creditCents)) throw accountingError("Kandes peab olema vähemalt üks deebet- ja üks kreeditrida.");
  if (debit !== credit) throw accountingError(`Deebet (${money(debit)}) ja kreedit (${money(credit)}) ei ole võrdsed.`);
  return { date, description: description.slice(0, 300), documentRef: documentRef.slice(0, 120), lines, totalCents: debit };
}

// a storno: the same lines with debit and credit swapped, on its own date, with the reason (RPS § 10)
function reversalOf(entry, { date, reason }) {
  const cleanReason = String(reason || "").replace(/\s+/g, " ").trim();
  if (!cleanReason) throw accountingError("Tühistamise põhjus on kohustuslik.");
  if (entry.reversedBy) throw accountingError(`Kanne ${entry.number} on juba tühistatud.`);
  if (entry.origin === "reversal") throw accountingError("Tühistuskannet ei saa uuesti tühistada; tee uus kanne.");
  return {
    date,
    description: `Storno: kanne ${entry.number} · ${cleanReason}`.slice(0, 300),
    documentRef: entry.documentRef,
    documentType: entry.documentType || "",
    origin: "reversal",
    reversalOf: entry.id,
    reason: cleanReason.slice(0, 300),
    lines: entry.lines.map((l) => ({ account: l.account, debitCents: l.creditCents, creditCents: l.debitCents, note: l.note || "", ...(partnerOf(l) ? { partner: partnerOf(l) } : {}) })),
    totalCents: entry.totalCents,
  };
}

// opening balances on the start date: one entry, debit for asset balances, credit for liabilities and equity; the
// difference must be zero (the accountant's closing trial balance of the previous year)
function openingEntry(balances = [], accounts = [], { startDate = ACCOUNTING_START_DATE } = {}) {
  const lines = balances.map((b) => {
    const debitCents = Math.round(Number(b.debitCents || 0));
    const creditCents = Math.round(Number(b.creditCents || 0));
    return { account: String(b.account || "").trim(), debitCents: Math.max(0, debitCents - creditCents), creditCents: Math.max(0, creditCents - debitCents) };
  }).filter((l) => l.debitCents || l.creditCents);
  const byCode = new Map(accounts.map((a) => [String(a.code), a]));
  lines.forEach((l) => {
    const type = byCode.get(l.account)?.type;
    if (type === "income" || type === "expense") throw accountingError(`Tulu- ja kulukontodel (${l.account}) algsaldot ei ole.`);
  });
  return validateEntry({ date: startDate, description: `Algsaldod seisuga ${startDate}`, documentRef: "Eelmise perioodi käibeandmik", lines }, accounts);
}

// ---- corrections while the period is open (the accountant 2026-10-23: „мне нужно исправление сделать”) ----
// RPS § 10: a correction must stay traceable. While the date is open (not in a closed finance month and after the
// accounting lock date) a manual entry is edited in place or deleted (a tombstone stays: `deleted`, never removed from
// the database) and an automatic entry gets an override of its lines and description (its date and source document
// stay). Every change appends { at, by, action, reason, before, after } to the entry's `history`. After the lock only
// a storno or a new correcting entry is possible.

const snapshotOf = (entry) => ({
  date: entry.date || "",
  description: entry.description || "",
  documentRef: entry.documentRef || "",
  lines: (entry.lines || []).map((l) => ({ account: String(l.account), debitCents: l.debitCents || 0, creditCents: l.creditCents || 0, note: l.note || "", ...(partnerOf(l) ? { partner: partnerOf(l) } : {}) })),
});

const isLocked = (date, lockedThrough) => Boolean(lockedThrough && date && String(date).slice(0, 10) <= lockedThrough);

function assertCorrectable(entry) {
  if (entry.deleted) throw accountingError("Kanne on kustutatud.", 409);
  if (entry.reversedBy) throw accountingError(`Kanne ${entry.number} on stornoga tühistatud; tee uus kanne.`, 409);
  if (entry.origin === "reversal") throw accountingError("Stornokannet ei muudeta; tee uus kanne.", 409);
}

// the corrected entry: a manual or automatic entry may change everything except the year of its number (the accountant
// 2026-10-30: „не исправить и не удалить” the entries the system made; the source document stays in `sourceKey`, its own
// lines in `original`); the opening entry keeps its date and document
function correctedEntry(entry, values, accounts = [], options = {}) {
  assertCorrectable(entry);
  const fixed = entry.origin === "opening" ? { date: entry.date, documentRef: entry.documentRef } : {};
  // an automatic entry sent without a date or document keeps its own
  const own = entry.origin === "auto" ? { date: entry.date, documentRef: entry.documentRef } : {};
  const normalized = validateEntry({ ...own, ...values, ...fixed }, accounts, options);
  if (entry.origin === "opening") {
    const types = new Map(accounts.map((a) => [String(a.code), a.type]));
    const result = normalized.lines.find((l) => types.get(l.account) === "income" || types.get(l.account) === "expense");
    if (result) throw accountingError(`Tulu- ja kulukontodel (${result.account}) algsaldot ei ole.`);
  }
  if (entry.origin !== "opening" && String(normalized.date).slice(0, 4) !== String(entry.date).slice(0, 4)) {
    throw accountingError("Aastat ei saa muuta (kande number on aasta kaupa). Kustuta kanne ja tee uus.");
  }
  const before = snapshotOf(entry);
  const after = snapshotOf(normalized);
  if (JSON.stringify(before) === JSON.stringify(after)) throw accountingError("Muudatusi ei ole.");
  return { before, after, totalCents: normalized.totalCents };
}

// „Tühista ekslik storno” (the owner 2026-10-29: the accountant made a storno by mistake and wants it gone): a storno
// made in error becomes a tombstone (`deleted`, like a deleted manual entry: number never reused, content in history)
// and its original entry is live again. Only a live storno whose original still points to it; the service checks that
// both dates are open (after the lock only a new correcting entry is possible).
function assertStornoUndoable(storno, original) {
  if (storno.origin !== "reversal") throw accountingError("See ei ole stornokanne.", 409);
  if (storno.deleted) throw accountingError("Storno on juba tühistatud.", 409);
  if (!original) throw accountingError("Storno algset kannet ei leitud.", 409);
  if (original.reversedBy !== storno.id) throw accountingError(`Kanne ${original.number || ""} ei ole selle stornoga tühistatud.`, 409);
  if (original.deleted) throw accountingError(`Algne kanne ${original.number || ""} on kustutatud.`, 409);
}

function assertDeletable(entry) {
  assertCorrectable(entry);
  if (entry.origin === "opening") throw accountingError("Algsaldode kannet ei kustutata: paranda read või tee storno.", 409);
}

// a deleted entry back in the books (a tombstone keeps its number and content). A deleted storno comes back only through
// a new storno: its original entry is live again.
function assertRestorable(entry) {
  if (!entry.deleted) throw accountingError("Kanne ei ole kustutatud.", 409);
  if (entry.origin === "reversal") throw accountingError("Tühistatud stornot ei taastata; tee uus storno.", 409);
}

// „Asenda konto” (the accountant 2026-10-23: move the old sales entries 3060 → 3000 herself): the entry with the lines
// of one account moved to another. `lineIndexes` limits it to those lines (an undo moves back exactly what was moved).
// null when the entry has no such line (already moved — a repeated request changes nothing).
function replaceAccountValues(entry, fromAccount, toAccount, lineIndexes = null) {
  const from = String(fromAccount || "").trim();
  const to = String(toAccount || "").trim();
  if (!from || !to) throw accountingError("Sisesta mõlemad kontod.");
  if (from === to) throw accountingError("Kontod on samad.");
  const only = Array.isArray(lineIndexes) ? new Set(lineIndexes.map(Number)) : null;
  const changed = [];
  const lines = (entry.lines || []).map((l, index) => {
    if (String(l.account) !== from || (only && !only.has(index))) return l;
    changed.push(index);
    return { ...l, account: to };
  });
  if (!changed.length) return null;
  return { values: { date: entry.date, description: entry.description, documentRef: entry.documentRef, lines }, lineIndexes: changed };
}

// the ids of a batch in groups small enough for one Firestore transaction (each entry: an update and an audit record)
const BATCH_CHUNK = 100;
const BATCH_MAX = 2000;
function chunked(list, size = BATCH_CHUNK) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

// the entries of a batch request: unique ids (or { entryId, lineIndexes } targets), at most BATCH_MAX
function batchTargets({ entryIds, targets } = {}) {
  const list = Array.isArray(targets) && targets.length
    ? targets.map((t) => ({ entryId: String(t?.entryId || "").trim(), lineIndexes: Array.isArray(t?.lineIndexes) ? t.lineIndexes.map(Number).filter(Number.isInteger) : null }))
    : (Array.isArray(entryIds) ? entryIds : []).map((id) => ({ entryId: String(id || "").trim(), lineIndexes: null }));
  const seen = new Set();
  const unique = list.filter((t) => t.entryId && !seen.has(t.entryId) && seen.add(t.entryId));
  if (!unique.length) throw accountingError("Vali kanded.");
  if (unique.length > BATCH_MAX) throw accountingError(`Korraga kuni ${BATCH_MAX} kannet.`);
  return unique;
}

const entryNumber = (year, sequence) => `${year}-${String(sequence).padStart(4, "0")}`;

module.exports = {
  ACCOUNTING_START_DATE,
  CUSTOMER_ACCOUNTS,
  PARTNER_TYPES,
  SUPPLIER_ACCOUNTS,
  cleanPartner,
  customerOf,
  partnerOf,
  BATCH_CHUNK,
  BATCH_MAX,
  batchTargets,
  chunked,
  replaceAccountValues,
  assertDeletable,
  assertRestorable,
  assertStornoUndoable,
  correctedEntry,
  isLocked,
  snapshotOf,
  EXPENSE_ACCOUNTS,
  POSTING_ACCOUNTS,
  automaticEntries,
  entryNumber,
  openingEntry,
  reversalOf,
  validateEntry,
};
