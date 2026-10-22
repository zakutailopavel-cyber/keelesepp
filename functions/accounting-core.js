"use strict";

// Bookkeeping (owner 2026-10-22: „полная бухгалтерия” on the site, from 2026-01-01, E&P Koolitus OÜ is not VAT
// registered). Raamatupidamise seadus:
// - § 6: every business transaction is recorded by double entry; an entry (kirjend) has the transaction date, an
//   identifier (number), the debited and credited accounts with amounts and a reference to its source document;
// - § 8: a chart of accounts (accounting-chart.js, the owner's Merit Aktiva chart);
// - § 9: the registers allow extracts by account in chronological order (päevaraamat, pearaamat, käibeandmik);
// - § 10: an entry is never edited or deleted silently — it is corrected by a reversing entry (storno) that keeps the
//   reason, the time and the author;
// - § 12: entries are kept for seven years (nothing here deletes them).
//
// Pure functions: the CRM's documents (invoices, credit notes, payments, payer credits, refunds, expenses) → the
// automatic entries they require. Each automatic entry has a stable source key, so a sync creates every entry once.
// accountingEntries/{id}: { number: "2026-0001", year, date, description, documentType, documentRef, sourceKey,
//   origin: "auto" | "manual" | "opening" | "reversal", lines: [{ account, debitCents, creditCents, note }],
//   totalCents, reversalOf, reason, createdAt, createdBy }

const ACCOUNTING_START_DATE = "2026-01-01";

// automatic posting accounts (Merit Aktiva codes); the school sells VAT-free training, so sales go to 3060 and an
// expense is booked with its VAT (the VAT is not deductible without a VAT registration)
const POSTING_ACCOUNTS = Object.freeze({
  cash: "1000",
  bank: "1010",
  receivables: "1200",
  prepayments: "2500",
  sales: "3060",
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
  const creditedByInvoice = new Map();
  creditNotes.forEach((note) => {
    const amount = Math.abs(cents(note));
    creditedByInvoice.set(note.invoiceId, (creditedByInvoice.get(note.invoiceId) || 0) + amount);
  });

  invoices.forEach((invoice) => {
    const amount = cents(invoice);
    const num = String(invoice.num || invoice.id);
    if (amount > 0) {
      add({
        sourceKey: `invoice:${invoice.id}`, date: isoDate(invoice.date), documentType: "invoice", documentRef: num,
        description: `Müügiarve ${num}${invoice.payerName || invoice.studentName ? ` · ${invoice.payerName || invoice.studentName}` : ""}`,
        lines: simple(POSTING_ACCOUNTS.receivables, POSTING_ACCOUNTS.sales, amount),
      });
    }
    if (invoice.status === "Tühistatud" && invoice.cancelledAt) {
      const open = amount - (creditedByInvoice.get(invoice.id) || 0);
      if (open > 0) {
        add({
          sourceKey: `invoice-cancel:${invoice.id}`, date: isoDate(invoice.cancelledAt), documentType: "invoice", documentRef: num,
          description: `Arve ${num} tühistamine${invoice.cancellationReason ? ` · ${String(invoice.cancellationReason).slice(0, 80)}` : ""}`,
          lines: simple(POSTING_ACCOUNTS.sales, POSTING_ACCOUNTS.receivables, open),
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
      lines: simple(POSTING_ACCOUNTS.sales, POSTING_ACCOUNTS.receivables, amount),
    });
  });

  payments.forEach((payment) => {
    const amount = cents(payment);
    if (amount <= 0) return;
    const ref = payment.invoiceNum || payment.invoiceId || payment.id;
    const account = paymentAccount(payment.method);
    add({
      sourceKey: `payment:${payment.id}`, date: isoDate(payment.paidAt), documentType: "payment", documentRef: String(payment.reference || ref),
      description: `Laekumine arvele ${ref} (${methodLabel[payment.method] || payment.method || "pangaülekanne"})${payment.payerName ? ` · ${payment.payerName}` : ""}`,
      lines: simple(account, POSTING_ACCOUNTS.receivables, amount),
    });
    if (payment.status === "void" && payment.voidedAt) {
      add({
        sourceKey: `payment-void:${payment.id}`, date: isoDate(payment.voidedAt), documentType: "payment", documentRef: String(payment.reference || ref),
        description: `Laekumise tühistamine (arve ${ref})${payment.voidReason ? ` · ${String(payment.voidReason).slice(0, 80)}` : ""}`,
        lines: simple(POSTING_ACCOUNTS.receivables, account, amount),
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
        lines: simple(POSTING_ACCOUNTS.receivables, POSTING_ACCOUNTS.prepayments, amount),
      });
      return;
    }
    const tx = bankById.get(credit.bankTransactionId);
    add({
      sourceKey: `credit:${credit.id}`, date: isoDate(tx?.paidAt || credit.receivedAt || credit.createdAt), documentType: "bankTransaction", documentRef: String(tx?.externalId || credit.bankTransactionId || credit.id),
      description: `Ettemaks pangast${credit.payerName ? ` · ${credit.payerName}` : ""}`,
      lines: simple(POSTING_ACCOUNTS.bank, POSTING_ACCOUNTS.prepayments, amount),
    });
  });

  refunds.forEach((refund) => {
    const amount = cents(refund);
    if (amount <= 0) return;
    add({
      sourceKey: `refund:${refund.id}`, date: isoDate(refund.refundedAt), documentType: "refund", documentRef: String(refund.reference || refund.id),
      description: `Ettemaksu tagastus${refund.payerName ? ` · ${refund.payerName}` : ""}`,
      lines: simple(POSTING_ACCOUNTS.prepayments, refund.method === "cash" ? POSTING_ACCOUNTS.cash : POSTING_ACCOUNTS.bank, amount),
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

// a manual, opening or reversal entry must balance and use known, active accounts
function validateEntry(entry, accounts = []) {
  const byCode = new Map(accounts.map((account) => [String(account.code), account]));
  const date = isoDate(entry?.date);
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (!date || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw accountingError("Kande kuupäev on vigane.");
  const description = String(entry?.description || "").replace(/\s+/g, " ").trim();
  if (!description) throw accountingError("Kande sisu (kirjeldus) on kohustuslik.");
  const documentRef = String(entry?.documentRef || "").replace(/\s+/g, " ").trim();
  if (!documentRef) throw accountingError("Viide algdokumendile on kohustuslik (RPS § 6).");
  const lines = (Array.isArray(entry?.lines) ? entry.lines : []).map((l) => ({
    account: String(l?.account || "").trim(),
    debitCents: Math.round(Number(l?.debitCents || 0)),
    creditCents: Math.round(Number(l?.creditCents || 0)),
    note: String(l?.note || "").replace(/\s+/g, " ").trim().slice(0, 200),
  })).filter((l) => l.debitCents || l.creditCents);
  if (lines.length < 2) throw accountingError("Kandes peab olema vähemalt üks deebet- ja üks kreeditrida.");
  lines.forEach((l) => {
    const account = byCode.get(l.account);
    if (!account) throw accountingError(`Kontot ${l.account} pole kontoplaanis.`);
    if (account.active === false) throw accountingError(`Konto ${l.account} on suletud.`);
    if (l.debitCents < 0 || l.creditCents < 0 || !Number.isInteger(l.debitCents) || !Number.isInteger(l.creditCents)) throw accountingError("Summad peavad olema positiivsed.");
    if (l.debitCents && l.creditCents) throw accountingError("Ühel real on kas deebet või kreedit, mitte mõlemad.");
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
    lines: entry.lines.map((l) => ({ account: l.account, debitCents: l.creditCents, creditCents: l.debitCents, note: l.note || "" })),
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

const entryNumber = (year, sequence) => `${year}-${String(sequence).padStart(4, "0")}`;

module.exports = {
  ACCOUNTING_START_DATE,
  EXPENSE_ACCOUNTS,
  POSTING_ACCOUNTS,
  automaticEntries,
  entryNumber,
  openingEntry,
  reversalOf,
  validateEntry,
};
