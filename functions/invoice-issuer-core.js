"use strict";

// Arve väljastaja (owner 2026-11-09): an invoice is issued either by the school, E&P Koolitus OÜ (`issuer: "company"`,
// an invoice without the field is a company invoice), or by the owner's own FIE (`issuer: "fie"`). The FIE belongs to
// the owner only („счёт FIE есть только у меня”): only the owner sees FIE invoices, its requisites (name + IBAN) and the
// per-student switch; FIE can be used only for the owner's own lessons. FIE money never reaches the company's books,
// analytics, bank matching or card payments. docs/ACCOUNTING.md „FIE arved”.

const crypto = require("crypto");

const ISSUERS = Object.freeze(["company", "fie"]);
const FIE_PREFIX = "FIE-";
const COMPANY_COUNTER = "invoiceCounter";
const FIE_COUNTER = "invoiceCounterFie";
const FIE_SETTINGS_ID = "fie"; // invoiceIssuers/fie
const FIE_NOT_READY = "FIE andmed on täitmata: Finantsid → Seaded → FIE (nimi ja IBAN).";
const FIE_OWNER_ONLY = "FIE arveid näeb ja koostab ainult omanik.";
const FIE_MIXED = "Arvel on omaniku FIE tunnid ja teiste õpetajate tunnid koos — koosta kaks eraldi arvet (FIE ja E&P Koolitus OÜ).";
const FIE_OTHER_TEACHER = "FIE arve on võimalik ainult omaniku enda tundide eest.";

const clean = (value) => String(value ?? "").trim();
const lower = (value) => clean(value).toLocaleLowerCase("et");

function issuerError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function invoiceIssuer(invoice = {}) {
  return invoice && invoice.issuer === "fie" ? "fie" : "company";
}

function isFieInvoice(invoice = {}) {
  return invoiceIssuer(invoice) === "fie";
}

// the company's own documents (books, analytics, bank matching, numbering repair, INF 3, the bookkeeper)
function companyOnly(list = []) {
  return (Array.isArray(list) ? list : []).filter((item) => !isFieInvoice(item));
}

function normalIban(value) {
  return clean(value).replace(/\s+/g, "").toUpperCase();
}

// ISO 13616 check (mod 97 = 1)
function validIban(value) {
  const iban = normalIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const moved = `${iban.slice(4)}${iban.slice(0, 4)}`;
  const digits = moved.replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55));
  let rest = 0;
  for (const digit of digits) rest = (rest * 10 + Number(digit)) % 97;
  return rest === 1;
}

function formatIban(value) {
  return normalIban(value).replace(/(.{4})/g, "$1 ").trim();
}

// the owner's FIE requisites: the name and the bank account, nothing else (owner 2026-11-09)
function cleanFieSettings(values = {}) {
  const name = clean(values.name).replace(/\s+/g, " ");
  const iban = normalIban(values.iban);
  if (name.length < 3 || name.length > 120) throw issuerError(400, "Sisesta ees- ja perekonnanimi (3–120 märki).");
  if (!validIban(iban)) throw issuerError(400, "IBAN ei ole korrektne (näiteks EE38 2200 2210 2014 5685).");
  return { name, iban };
}

function fieReady(settings = {}) {
  return Boolean(settings && clean(settings.name).length >= 3 && validIban(settings.iban));
}

// what an FIE invoice keeps of the requisites at the moment it is issued (the PDF and the e-mail show these)
function fieDetails(settings = {}) {
  return { name: clean(settings.name), iban: normalIban(settings.iban) };
}

function issuerFields(issuer, settings = {}) {
  return issuer === "fie" ? { issuer: "fie", issuerDetails: fieDetails(settings) } : { issuer: "company" };
}

function counterId(issuer) {
  return issuer === "fie" ? FIE_COUNTER : COMPANY_COUNTER;
}

// KS-2026-123 (the company, unchanged) or FIE-2026-001 (its own counter, never shared)
function invoiceNumber(issuer, year, sequence) {
  const tail = `${year}-${String(sequence).padStart(3, "0")}`;
  return issuer === "fie" ? `${FIE_PREFIX}${tail}` : `KS-${tail}`;
}

function parseFieNumber(value) {
  const match = clean(value).match(/^FIE-(\d{4})-(\d+)$/i);
  return match ? { year: Number(match[1]), sequence: Number(match[2]) } : null;
}

// the owner as a teacher: the uid stored with the requisites, or (old cards without a uid) the same first name
function taughtByOwner(item = {}, owner = {}) {
  const uid = clean(item.teacherUid);
  if (uid && owner.uid) return uid === owner.uid;
  const first = lower(item.teacher).split(/\s+/)[0];
  const ownerFirst = lower(owner.name).split(/\s+/)[0];
  return Boolean(!uid && first && ownerFirst && first === ownerFirst);
}

// One line of an invoice (a card's subject, a lesson, a manual charge): `defaultIssuer` the card's „Arve väljastaja”,
// `ownerTeaches` whether the owner teaches it. FIE is the line's issuer only for the owner's own teaching.
//   requested  "" | "company" | "fie" — only the owner may ask; other users always get the default
//   isOwner    the signed-in user is the owner
//   ready      the FIE requisites are filled
function decideIssuer({ lines = [], requested = "", isOwner = false, ready = false } = {}) {
  const ask = clean(requested);
  if (ask && !ISSUERS.includes(ask)) throw issuerError(400, "Arve väljastaja peab olema company või fie.");
  const list = lines.length ? lines : [{ defaultIssuer: "company", ownerTeaches: false }];
  let issuer;
  if (ask && isOwner) {
    if (ask === "fie" && list.some((line) => !line.ownerTeaches)) throw issuerError(409, FIE_OTHER_TEACHER);
    issuer = ask;
  } else {
    if (ask === "fie") throw issuerError(403, FIE_OWNER_ONLY);
    const each = list.map((line) => (line.defaultIssuer === "fie" && line.ownerTeaches ? "fie" : "company"));
    if (new Set(each).size > 1) throw issuerError(409, FIE_MIXED);
    issuer = each[0];
  }
  if (issuer === "fie" && !isOwner) throw issuerError(403, "Selle õpilase arved koostab omanik.");
  if (issuer === "fie" && !ready) throw issuerError(409, FIE_NOT_READY);
  return issuer;
}

// a month's lines of one family (combined monthly invoice): for the owner without an explicit choice, lines of the
// owner's FIE and lines of the company become two groups (two invoices made together). Otherwise one group whose
// issuer decideIssuer() settles (mixed lines then refuse with FIE_MIXED for anyone but the owner).
function monthlySplit({ lines = [], requested = "", isOwner = false } = {}) {
  const all = [{ issuer: null, indexes: lines.map((_, index) => index) }];
  if (clean(requested) || !isOwner) return all;
  const each = lines.map((line) => (line.defaultIssuer === "fie" && line.ownerTeaches ? "fie" : "company"));
  if (new Set(each).size < 2) return all;
  return ["company", "fie"].map((issuer) => ({ issuer, indexes: each.map((value, index) => (value === issuer ? index : -1)).filter((index) => index >= 0) }));
}

// a card's line for a subject ("" = the whole card: every active track must be the owner's for the default, one is
// enough for the owner's explicit choice)
function cardLine({ tracks = [], subject = "", defaultIssuer = "company", owner = {} } = {}) {
  const active = tracks.filter((track) => track.active !== false && track.status !== "ended");
  const wanted = lower(subject);
  const matching = wanted ? active.filter((track) => lower(track.subject) === wanted) : active;
  const own = matching.filter((track) => taughtByOwner(track, owner));
  return {
    defaultIssuer: defaultIssuer === "fie" ? "fie" : "company",
    ownerTeaches: matching.length > 0 && (wanted ? own.length > 0 : own.length === matching.length),
    ownerTeachesAny: own.length > 0,
  };
}

// a card's line for a manual charge: the default needs every track to be the owner's; the owner's choice needs one
function manualLine(args) {
  const line = cardLine(args);
  return { defaultIssuer: line.defaultIssuer, ownerTeaches: line.ownerTeachesAny, defaultFie: line.ownerTeaches };
}

function decideManualIssuer({ lines = [], requested = "", isOwner = false, ready = false } = {}) {
  const ask = clean(requested);
  if (ask && isOwner) return decideIssuer({ lines, requested: ask, isOwner, ready });
  return decideIssuer({ lines: lines.map((line) => ({ defaultIssuer: line.defaultIssuer, ownerTeaches: line.defaultFie })), requested: ask, isOwner, ready });
}

// payments, credit notes, audit and e-mail logs of an FIE invoice live in owner-only collections
function collectionFor(base, issuer) {
  if (issuer !== "fie") return base;
  return { payments: "fiePayments", financialAudit: "fieAudit", emailQueue: "fieEmailQueue", invoicePaymentClaims: "fieInvoicePaymentClaims" }[base] || base;
}

// The legacy backfill (functions/tools/invoice-issuer-backfill.js): only invoices without the field get
// `issuer: "company"` — nothing else changes. Returns the ids to write.
function backfillPlan(invoices = []) {
  const ids = invoices.filter((invoice) => !("issuer" in (invoice || {})) || invoice.issuer === undefined || invoice.issuer === null || invoice.issuer === "").map((invoice) => String(invoice.id));
  const fingerprint = crypto.createHash("sha256").update(JSON.stringify(ids.slice().sort())).digest("hex").slice(0, 16);
  return { total: invoices.length, missing: ids.length, ids, fingerprint };
}

module.exports = {
  ISSUERS,
  FIE_PREFIX,
  COMPANY_COUNTER,
  FIE_COUNTER,
  FIE_SETTINGS_ID,
  FIE_NOT_READY,
  FIE_OWNER_ONLY,
  FIE_MIXED,
  backfillPlan,
  cardLine,
  cleanFieSettings,
  collectionFor,
  companyOnly,
  counterId,
  decideIssuer,
  decideManualIssuer,
  fieDetails,
  fieReady,
  formatIban,
  invoiceIssuer,
  invoiceNumber,
  isFieInvoice,
  issuerError,
  issuerFields,
  manualLine,
  monthlySplit,
  normalIban,
  parseFieNumber,
  taughtByOwner,
  validIban,
};
