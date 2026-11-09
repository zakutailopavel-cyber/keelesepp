"use strict";

// „Arve väljastaja” (owner 2026-11-09): the issuer choice, the separate FIE number series and the exclusion of FIE
// invoices from the company's books, bank matching, card payments and numbering repair.
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./invoice-issuer-core");
const { automaticEntries } = require("./accounting-core");
const bank = require("./bank-statement-core");
const linkpay = require("./linkpay-core");
const { invoicePaymentDetails } = require("./invoice-document");
const { invoiceNumberingPlan } = require("./invoice-numbering-core");

const OWNER = { uid: "owner-uid", name: "Pavel Zakutailo" };
const IBAN = "EE382200221020145685"; // the standard Estonian example IBAN (valid mod 97)
const track = (subject, teacherUid, teacher = "") => ({ subject, teacherUid, teacher, active: true });

test("an invoice without the field is a company invoice; companyOnly keeps the company's", () => {
  assert.equal(core.invoiceIssuer({}), "company");
  assert.equal(core.invoiceIssuer({ issuer: "company" }), "company");
  assert.equal(core.invoiceIssuer({ issuer: "fie" }), "fie");
  assert.deepEqual(core.companyOnly([{ id: "a" }, { id: "b", issuer: "fie" }, { id: "c", issuer: "company" }]).map((i) => i.id), ["a", "c"]);
});

test("FIE requisites: only the name and a valid IBAN; ready only when both are there", () => {
  assert.deepEqual(core.cleanFieSettings({ name: "  Pavel   Zakutailo ", iban: "ee38 2200 2210 2014 5685" }), { name: "Pavel Zakutailo", iban: IBAN });
  assert.throws(() => core.cleanFieSettings({ name: "P", iban: IBAN }), /ees- ja perekonnanimi/);
  assert.throws(() => core.cleanFieSettings({ name: "Pavel Zakutailo", iban: "EE382200221020145684" }), /IBAN/);
  assert.equal(core.fieReady({}), false);
  assert.equal(core.fieReady({ name: "Pavel Zakutailo" }), false);
  assert.equal(core.fieReady({ name: "Pavel Zakutailo", iban: IBAN }), true);
  assert.deepEqual(core.issuerFields("fie", { name: "Pavel Zakutailo", iban: IBAN, ownerUid: "x" }), { issuer: "fie", issuerDetails: { name: "Pavel Zakutailo", iban: IBAN } });
  assert.deepEqual(core.issuerFields("company", {}), { issuer: "company" });
  assert.equal(core.formatIban(IBAN), "EE38 2200 2210 2014 5685");
});

test("separate numbering: KS for the company, FIE- with its own counter for the FIE", () => {
  assert.equal(core.invoiceNumber("company", "2026", 117), "KS-2026-117");
  assert.equal(core.invoiceNumber("fie", "2026", 1), "FIE-2026-001");
  assert.equal(core.counterId("company"), "invoiceCounter");
  assert.equal(core.counterId("fie"), "invoiceCounterFie");
  assert.deepEqual(core.parseFieNumber("FIE-2026-007"), { year: 2026, sequence: 7 });
  assert.equal(core.parseFieNumber("KS-2026-007"), null);
  // the company's numbering repair never renumbers an FIE invoice into the KS series
  const plan = invoiceNumberingPlan(core.companyOnly([
    { id: "a", num: "KS-2026-001", date: "2026-11-01" },
    { id: "f1", num: "FIE-2026-001", issuer: "fie", date: "2026-11-01" },
    { id: "f2", num: "FIE-2026-001", issuer: "fie", date: "2026-11-02" },
  ]), { counterSeq: 1, currentYear: 2026 });
  assert.equal(plan.replacementCount, 0);
});

test("the owner as the teacher: by uid, or by the first name on an old card without a uid", () => {
  assert.equal(core.taughtByOwner({ teacherUid: "owner-uid" }, OWNER), true);
  assert.equal(core.taughtByOwner({ teacherUid: "other" , teacher: "Pavel" }, OWNER), false);
  assert.equal(core.taughtByOwner({ teacher: "Pavel" }, OWNER), true);
  assert.equal(core.taughtByOwner({ teacher: "Yelyzaveta" }, OWNER), false);
  assert.equal(core.taughtByOwner({}, OWNER), false);
});

test("issuer choice: the card's default applies only to the owner's own lessons", () => {
  const tracks = [track("Eesti keel", "owner-uid"), track("Matemaatika", "liza-uid")];
  const estonian = core.cardLine({ tracks, subject: "Eesti keel", defaultIssuer: "fie", owner: OWNER });
  const maths = core.cardLine({ tracks, subject: "Matemaatika", defaultIssuer: "fie", owner: OWNER });
  assert.equal(core.decideIssuer({ lines: [estonian], isOwner: true, ready: true }), "fie", "the owner's subject of an FIE card");
  assert.equal(core.decideIssuer({ lines: [maths], isOwner: true, ready: true }), "company", "another teacher's subject stays the company's");
  assert.throws(() => core.decideIssuer({ lines: [estonian, maths], isOwner: true, ready: true }), /kaks eraldi arvet/);
  // a card left on the company (everyone's default) never becomes FIE by itself
  const companyCard = core.cardLine({ tracks, subject: "Eesti keel", defaultIssuer: "company", owner: OWNER });
  assert.equal(core.decideIssuer({ lines: [companyCard], isOwner: false, ready: false }), "company");
});

test("issuer choice: only the owner chooses FIE, only for his own lessons and only with the requisites filled", () => {
  const own = { defaultIssuer: "company", ownerTeaches: true };
  const other = { defaultIssuer: "company", ownerTeaches: false };
  assert.equal(core.decideIssuer({ lines: [own], requested: "fie", isOwner: true, ready: true }), "fie");
  assert.throws(() => core.decideIssuer({ lines: [own], requested: "fie", isOwner: true, ready: false }), (error) => error.status === 409 && /nimi ja IBAN/.test(error.message));
  assert.throws(() => core.decideIssuer({ lines: [other], requested: "fie", isOwner: true, ready: true }), /omaniku enda tundide/);
  assert.throws(() => core.decideIssuer({ lines: [own], requested: "fie", isOwner: false, ready: true }), (error) => error.status === 403);
  // another administrator / the bookkeeper on an FIE card's owner lesson: refused, never a silent company invoice
  assert.throws(() => core.decideIssuer({ lines: [{ defaultIssuer: "fie", ownerTeaches: true }], isOwner: false, ready: true }), (error) => error.status === 403);
  // the owner may always issue a company invoice
  assert.equal(core.decideIssuer({ lines: [{ defaultIssuer: "fie", ownerTeaches: true }], requested: "company", isOwner: true, ready: true }), "company");
  assert.throws(() => core.decideIssuer({ lines: [own], requested: "x", isOwner: true }), /company või fie/);
});

test("manual charge: the default FIE needs every track to be the owner's; the owner's choice needs one", () => {
  const mixed = [track("Eesti keel", "owner-uid"), track("Matemaatika", "liza-uid")];
  const line = core.manualLine({ tracks: mixed, defaultIssuer: "fie", owner: OWNER });
  assert.equal(core.decideManualIssuer({ lines: [line], isOwner: true, ready: true }), "company");
  assert.equal(core.decideManualIssuer({ lines: [line], requested: "fie", isOwner: true, ready: true }), "fie");
  const ownOnly = core.manualLine({ tracks: [track("Eesti keel", "owner-uid")], defaultIssuer: "fie", owner: OWNER });
  assert.equal(core.decideManualIssuer({ lines: [ownOnly], isOwner: true, ready: true }), "fie");
});

test("a family's month with the owner's FIE lines and other teachers' lines splits into two invoices (owner only)", () => {
  const lines = [{ defaultIssuer: "fie", ownerTeaches: true }, { defaultIssuer: "fie", ownerTeaches: false }, { defaultIssuer: "company", ownerTeaches: true }];
  assert.deepEqual(core.monthlySplit({ lines, isOwner: true }), [{ issuer: "company", indexes: [1, 2] }, { issuer: "fie", indexes: [0] }]);
  assert.deepEqual(core.monthlySplit({ lines, isOwner: false }), [{ issuer: null, indexes: [0, 1, 2] }], "anyone else: one group, refused by decideIssuer");
  assert.deepEqual(core.monthlySplit({ lines, isOwner: true, requested: "company" }), [{ issuer: null, indexes: [0, 1, 2] }]);
  assert.deepEqual(core.monthlySplit({ lines: lines.slice(1), isOwner: true }), [{ issuer: null, indexes: [0, 1] }]);
});

test("owner-only side collections: payments, audit, e-mail log and payment notices of an FIE invoice", () => {
  assert.equal(core.collectionFor("payments", "fie"), "fiePayments");
  assert.equal(core.collectionFor("financialAudit", "fie"), "fieAudit");
  assert.equal(core.collectionFor("emailQueue", "fie"), "fieEmailQueue");
  assert.equal(core.collectionFor("invoicePaymentClaims", "fie"), "fieInvoicePaymentClaims");
  assert.equal(core.collectionFor("payments", "company"), "payments");
});

test("the books: an FIE invoice and its payments never become company entries", () => {
  const entries = automaticEntries({
    invoices: [
      { id: "c1", num: "KS-2026-120", date: "2026-02-03", amountCents: 8000, status: "Makstud" },
      { id: "f1", num: "FIE-2026-001", issuer: "fie", date: "2026-02-03", amountCents: 5000, status: "Makstud" },
    ],
    payments: [
      { id: "p1", invoiceId: "c1", paidAt: "2026-02-10", amountCents: 8000, method: "bank", status: "active" },
      { id: "p2", invoiceId: "f1", paidAt: "2026-02-10", amountCents: 5000, method: "bank", status: "active" },
    ],
  });
  assert.deepEqual(entries.map((e) => e.sourceKey), ["invoice:c1", "payment:p1"]);
});

test("bank matching: a line of the company account is never matched to an FIE invoice", () => {
  const fie = { id: "f1", num: "FIE-2026-001", issuer: "fie", studentId: "s1", payerName: "Julia Näidis", amountCents: 15000, balanceDueCents: 15000, status: "Saadetud", date: "2026-10-01", paymentReference: "FIE-2026-001" };
  const line = { id: "lhv_1", direction: "C", date: "2026-10-07", amountCents: 15000, currency: "EUR", counterpartyName: "JULIA NÄIDIS", explanation: "FIE-2026-001", referenceNumber: "FIE-2026-001", archiveId: "A1", transactionRef: "1" };
  const match = bank.matchLine(line, { invoices: [fie] });
  assert.notEqual(match.kind, "allocate");
  assert.ok(!(match.allocations || []).some((a) => a.invoiceId === "f1"));
});

test("card payment: an FIE invoice is never paid through the company's LinkPay", () => {
  assert.match(linkpay.unpayableReason({ issuer: "fie", amountCents: 5000, balanceDueCents: 5000, status: "Saadetud" }), /pangaülekandega/);
  assert.equal(linkpay.unpayableReason({ amountCents: 5000, balanceDueCents: 5000, status: "Saadetud" }), "");
});

test("the PDF of an FIE invoice shows only the FIE's name and IBAN, no company data and no card link", () => {
  const company = { company: "E&P Koolitus OÜ", regCode: "17270880", address: "x", email: "info@x", iban: "EE917700771011885682", bank: "LHV", swift: "LHVBEE22", paymentDueDay: 10, lateFeePerDay: "0,0%", issuer: "Pavel Zakutailo" };
  assert.equal(invoicePaymentDetails({}, company), company);
  const fie = invoicePaymentDetails({ issuer: "fie", issuerDetails: { name: "Pavel Zakutailo", iban: IBAN } }, company);
  assert.deepEqual(fie, { fie: true, company: "Pavel Zakutailo", iban: "EE38 2200 2210 2014 5685", issuer: "Pavel Zakutailo", paymentDueDay: 10, lateFeePerDay: "0,0%" });
  assert.equal(fie.regCode, undefined);
});

test("legacy backfill: only invoices without the field get issuer company", () => {
  const plan = core.backfillPlan([{ id: "a" }, { id: "b", issuer: "company" }, { id: "c", issuer: "fie" }, { id: "d", issuer: "" }]);
  assert.deepEqual(plan.ids, ["a", "d"]);
  assert.equal(plan.total, 4);
});
