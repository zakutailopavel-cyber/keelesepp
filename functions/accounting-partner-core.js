"use strict";

// Partners on the entries written before 2026-10-24 (the accountant: „Поставщиков сначала, и привяжи их к
// проводкам”). New OA / VM entries carry their supplier on every line (purchases-core); the older ones get it from
// their purchase invoice. Pure: entries + purchase invoices + suppliers in, a plan out. tools/accounting-partner-backfill.js
// prints the plan (dry run) and writes it only with --apply.
//
// Rules: only OA (purchaseInvoice) and VM (supplierPayment) entries and their stornos; a line that already has a
// partner is never changed (a different partner is reported as a conflict); deleted entries are left alone; an entry
// in a locked period (accountingSettings/lock) or a closed finance month is skipped and reported — after the lock it
// is not touched (RPS § 10). An applied change is a history item (action „partner”) like any other correction.
const accountingCore = require("./accounting-core");
const { supplierNameKey } = require("./purchases-core");

const PURCHASE_TYPES = new Set(["purchaseInvoice", "supplierPayment"]);

function invoiceIdOf(entry, byId, depth = 0) {
  if (entry.purchaseInvoiceId) return String(entry.purchaseInvoiceId);
  const match = String(entry.sourceKey || "").match(/^purchase-(?:invoice|payment):([^:]+)/);
  if (match) return match[1];
  if (entry.origin === "reversal" && entry.reversalOf && depth < 3) {
    const source = byId.get(entry.reversalOf);
    if (source) return invoiceIdOf(source, byId, depth + 1);
  }
  return "";
}

function partnerBackfillPlan({ entries = [], purchaseInvoices = [], suppliers = [], lockedThrough = "", closedDates = [] } = {}) {
  const invoices = new Map(purchaseInvoices.map((invoice) => [invoice.id, invoice]));
  const cards = new Map(suppliers.map((supplier) => [supplier.id, supplier]));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const closed = new Set(closedDates);
  const plan = { purchaseEntries: 0, update: [], alreadySet: [], deleted: [], noInvoice: [], noSupplier: [], locked: [], conflicts: [], linesToSet: 0 };
  entries.forEach((entry) => {
    if (!PURCHASE_TYPES.has(entry.documentType)) return;
    plan.purchaseEntries += 1;
    const ref = { id: entry.id, number: entry.number || "", date: entry.date || "", documentType: entry.documentType, documentRef: entry.documentRef || "" };
    if (entry.deleted) { plan.deleted.push(ref); return; }
    const invoice = invoices.get(invoiceIdOf(entry, byId));
    if (!invoice) { plan.noInvoice.push(ref); return; }
    const card = cards.get(invoice.supplierId);
    if (!card) { plan.noSupplier.push({ ...ref, supplierId: invoice.supplierId || "", supplierName: invoice.supplierName || "" }); return; }
    const partner = { type: "supplier", id: card.id, name: String(card.name || invoice.supplierName || "").trim() };
    const lineIndexes = [];
    let conflict = null;
    const lines = (entry.lines || []).map((line, index) => {
      const current = accountingCore.partnerOf(line);
      if (!current) { lineIndexes.push(index); return { ...line, partner }; }
      if (current.type !== "supplier" || current.id !== partner.id) conflict = { line: index + 1, account: String(line.account), current };
      return line;
    });
    if (conflict) plan.conflicts.push({ ...ref, ...conflict, expected: partner });
    if (!lineIndexes.length) { if (!conflict) plan.alreadySet.push(ref); return; }
    if (accountingCore.isLocked(entry.date, lockedThrough) || closed.has(String(entry.date).slice(0, 10))) { plan.locked.push({ ...ref, lineCount: lineIndexes.length }); return; }
    plan.update.push({ ...ref, partner, lineIndexes, lines });
    plan.linesToSet += lineIndexes.length;
  });
  return plan;
}

// Manual (PR) and opening entries typed before the Tarnijad existed (production 2026-10-24: 49 manual lines on 2110,
// „Kirsi Residents OÜ arve 2025/195”, „ostuarve Zone Media …”): the supplier is suggested when exactly one supplier's
// name (case, punctuation and the legal form ignored) or registry code is in the entry's text (content, document, line
// notes). Only the lines on the supplier accounts (2110, 1350) without a partner get it. Several or no matching
// suppliers → the accountant picks the partner in the päevaraamat herself.
function manualPartnerSuggestions({ entries = [], suppliers = [], lockedThrough = "", closedDates = [] } = {}) {
  const closed = new Set(closedDates);
  const keyed = suppliers.filter((s) => s.active !== false).map((s) => ({ supplier: s, key: supplierNameKey(s.name), code: String(s.regCode || "").trim() })).filter((s) => s.key || s.code);
  const out = { suggest: [], ambiguous: [], none: [], locked: [], linesToSet: 0 };
  entries.forEach((entry) => {
    if (entry.deleted || PURCHASE_TYPES.has(entry.documentType) || entry.origin === "auto") return;
    const lineIndexes = (entry.lines || []).map((l, i) => (accountingCore.SUPPLIER_ACCOUNTS.includes(String(l.account)) && !accountingCore.partnerOf(l) ? i : -1)).filter((i) => i >= 0);
    if (!lineIndexes.length) return;
    const raw = [entry.description, entry.documentRef, ...(entry.lines || []).map((l) => l.note)].join(" ");
    const text = ` ${supplierNameKey(raw)} `;
    const candidates = keyed.filter((s) => (s.key && text.includes(` ${s.key} `)) || (s.code.length >= 6 && raw.includes(s.code)));
    const ref = { id: entry.id, number: entry.number || "", date: entry.date || "", origin: entry.origin, text: String(entry.description || "").slice(0, 120), documentRef: entry.documentRef || "", lineCount: lineIndexes.length };
    if (candidates.length > 1) { out.ambiguous.push({ ...ref, candidates: candidates.map((c) => c.supplier.name) }); return; }
    if (!candidates.length) { out.none.push(ref); return; }
    if (accountingCore.isLocked(entry.date, lockedThrough) || closed.has(String(entry.date).slice(0, 10))) { out.locked.push(ref); return; }
    const card = candidates[0].supplier;
    const partner = { type: "supplier", id: card.id, name: String(card.name || "").trim() };
    const lines = (entry.lines || []).map((l, i) => (lineIndexes.includes(i) ? { ...l, partner } : l));
    out.suggest.push({ ...ref, partner, lineIndexes, lines });
    out.linesToSet += lineIndexes.length;
  });
  return out;
}

// the Firestore update of one planned entry: the lines with their partner and a history item (before / after)
function partnerBackfillPatch(entry, item, { nowIso, actorData, reason = "Partneri lisamine (tarnija ostuarvelt)" }) {
  const before = accountingCore.snapshotOf(entry);
  const after = accountingCore.snapshotOf({ ...entry, lines: item.lines });
  const patch = {
    lines: item.lines,
    history: [...(Array.isArray(entry.history) ? entry.history : []), { at: nowIso, by: actorData, action: "partner", reason, before, after }],
    updatedAt: nowIso,
    updatedBy: actorData,
  };
  // an overridden automatic entry books its override lines (entry.lines); keep the override record the same
  if (entry.override && Array.isArray(entry.override.lines) && entry.override.lines.length === item.lines.length) {
    patch.override = { ...entry.override, lines: item.lines };
  }
  return { patch, before, after };
}

module.exports = { manualPartnerSuggestions, partnerBackfillPatch, partnerBackfillPlan };
