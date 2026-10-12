"use strict";
// LHV LinkPay (EveryPay) for KeeleSepp invoices (docs/LINKPAY_INTEGRATION.md). Pure helpers: signing the pre-filled
// link, the per-invoice pay code for PDF / e-mail links, invoice ownership and the verdict on the bank's payment record.
// No secret is ever returned or logged from here.
const crypto = require("crypto");

const ENVIRONMENTS = {
  sandbox: { prefix: "https://payment.sandbox.lhv.ee/lp", apiBase: "https://payment.sandbox.lhv.ee/api/v4" },
  production: { prefix: "https://payment.lhv.ee/lp", apiBase: "https://payment.lhv.ee/api/v4" },
};

// PHP urlencode (as in the EveryPay example): only A-Z a-z 0-9 - _ . stay, space → %20
function phpEncode(value) {
  return encodeURIComponent(String(value)).replace(/[!'()*~]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function signedLinkpayUrl({ prefix, linkpayToken, secret, params }) {
  if (!prefix || !linkpayToken || !secret) throw new Error("LinkPay is not configured");
  const entries = [...Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value) !== ""), ["linkpay_token", linkpayToken]];
  const query = entries.map(([key, value]) => `${phpEncode(key)}=${phpEncode(value)}`).join("&");
  const hmac = crypto.createHmac("sha256", secret).update(query).digest("hex");
  return `${prefix}?${query}&hmac=${hmac}`;
}

const amountString = cents => (Math.round(Number(cents) || 0) / 100).toFixed(2);

// the invoice's open balance in cents (the same fields the finance core writes)
function openBalanceCents(invoice = {}) {
  if (Number.isFinite(Number(invoice.balanceDueCents))) return Math.max(0, Math.round(Number(invoice.balanceDueCents)));
  if (invoice.balanceDue !== undefined) return Math.max(0, Math.round(Number(invoice.balanceDue) * 100) || 0);
  const amount = Number(invoice.effectiveAmountCents ?? invoice.amountCents ?? Math.round((Number(invoice.amount) || 0) * 100));
  const paid = Number(invoice.paidAmountCents ?? Math.round((Number(invoice.paidAmount) || 0) * 100));
  return Math.max(0, amount - paid);
}

// why an invoice cannot be paid now, or "" when it can
function unpayableReason(invoice) {
  if (!invoice) return "Arvet ei leitud.";
  if (invoice.status === "Tühistatud") return "Arve on tühistatud.";
  if (openBalanceCents(invoice) <= 0) return "Arve on juba tasutud.";
  return "";
}

// one attempt = one unique order reference (allowed: a-z A-Z 0-9 / - ? : ( ) . , ' + space; we use only - and alnum)
function orderReference(invoice, now = Date.now(), random = crypto.randomBytes(3).toString("hex")) {
  const base = String(invoice.num || "KS").replace(/[^A-Za-z0-9-]/g, "").slice(0, 30) || "KS";
  return `${base}-${Number(now).toString(36)}${random}`.slice(0, 60);
}

// the code in the PDF / e-mail link /maksa/<invoiceId>?k=<code>: random, stored on the invoice
const newPayCode = () => crypto.randomBytes(18).toString("base64url");
function payCodeMatches(stored, given) {
  const a = Buffer.from(String(stored || ""));
  const b = Buffer.from(String(given || ""));
  return a.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

// the same owners as the Firestore rule ownsInvoice(): linked student card, parent uid fields or a verified e-mail
function ownsInvoice(invoice = {}, { uid = "", email = "", emailVerified = false, linkedStudentIds = [] } = {}) {
  if (!uid) return false;
  if (invoice.studentId && linkedStudentIds.includes(invoice.studentId)) return true;
  if ([invoice.parentUid, invoice.linkedParentId, invoice.guardianUid].includes(uid)) return true;
  const mail = String(email || "").trim().toLowerCase();
  if (!emailVerified || !mail) return false;
  return [invoice.parentEmailLower, invoice.payerEmailLower, invoice.parentEmail, invoice.payerEmail]
    .some(value => String(value || "").trim().toLowerCase() === mail);
}

const FINAL_FAILED = new Set(["failed", "abandoned", "voided", "chargebacked"]);
const cents = value => Math.round((Number(value) || 0) * 100);

/**
 * The verdict on the bank's own payment record (GET /payments/{payment_reference}) against our attempt.
 * settled → count it only if the order reference, currency and amount match the attempt exactly.
 */
function paymentVerdict(payment = {}, attempt = {}) {
  const state = String(payment.payment_state || "").toLowerCase();
  const problems = [];
  if (String(payment.order_reference || "") !== String(attempt.orderReference || "")) problems.push("order_reference");
  if (String(payment.currency || "EUR").toUpperCase() !== "EUR") problems.push("currency");
  const paid = cents(payment.initial_amount ?? payment.standing_amount);
  if (paid !== Number(attempt.amountCents)) problems.push("amount");
  if (state === "settled") return problems.length ? { status: "mismatch", state, problems, amountCents: paid } : { status: "settled", state, amountCents: paid };
  if (FINAL_FAILED.has(state)) return { status: "failed", state, problems };
  return { status: "pending", state, problems };
}

// a payments/{requestId} id for the bank payment (recordInvoicePayment is idempotent by it)
const paymentRequestId = paymentReference => `linkpay_${String(paymentReference || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 100)}`;

module.exports = {
  ENVIRONMENTS, phpEncode, signedLinkpayUrl, amountString, openBalanceCents, unpayableReason, orderReference,
  newPayCode, payCodeMatches, ownsInvoice, paymentVerdict, paymentRequestId,
};
