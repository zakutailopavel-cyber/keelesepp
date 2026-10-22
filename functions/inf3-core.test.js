const test = require("node:test");
const assert = require("node:assert/strict");
const { cleanIdentity, inf3Rows, inf3Xml, isValidIsikukood, payerKeyOf } = require("./inf3-core");

// well-known valid test codes; the codes in the e-MTA sample file are fictitious and fail the check digit
test("isikukood: check digit, birth date and century digit are checked", () => {
  assert.equal(isValidIsikukood("37605030299"), true);
  assert.equal(isValidIsikukood("49403136526"), true);
  assert.equal(isValidIsikukood("34901020276"), false, "the e-MTA sample code has a wrong check digit");
  assert.equal(isValidIsikukood("37605030290"), false, "wrong check digit");
  assert.equal(isValidIsikukood("37613030299"), false, "month 13");
  assert.equal(isValidIsikukood("97605030299"), false, "first digit 9");
  assert.equal(isValidIsikukood("3760503029"), false, "10 digits");
  assert.equal(isValidIsikukood(""), false);
});

test("an identity needs valid codes and a payer name with the payer's code", () => {
  assert.deepEqual(cleanIdentity({ studentCode: "494 0313 6526", payerCode: "37605030299", payerName: " Kati  Tamm ", trainingType: "2" }), { studentCode: "49403136526", payerCode: "37605030299", payerName: "Kati Tamm", trainingType: 2 });
  assert.throws(() => cleanIdentity({ studentCode: "49403136527" }), /Õpilase isikukood/);
  assert.throws(() => cleanIdentity({ payerCode: "37605030299" }), /maksja nimi/);
  assert.throws(() => cleanIdentity({ trainingType: 4 }), /1, 2 või 3/);
});

const base = {
  year: 2026,
  students: [{ id: "s1", name: "Mia Tamm", parentName: "Kati Tamm" }, { id: "s2", name: "Oskar Saar" }, { id: "s3", name: "Firma õpilane" }],
  invoices: [{ id: "i1", studentId: "s1" }, { id: "i2", studentId: "s2" }, { id: "i3", studentId: "s3", payerRegCode: "12345678" }],
  identities: [{ id: "s1", studentCode: "49403136526", payerCode: "37605030299", payerName: "Kati Tamm", trainingType: 2 }],
};

test("INF 3 counts money received in the year by trainee, not prepayment use, voided payments or company invoices", () => {
  const { rows, companyCents, totalCents } = inf3Rows({
    ...base,
    payments: [
      { id: "p1", invoiceId: "i1", paidAt: "2026-02-10", amountCents: 8000, method: "bank", status: "active" },
      { id: "p2", invoiceId: "i1", paidAt: "2026-03-10", amountCents: 6000, method: "cash", status: "active" },
      { id: "p3", invoiceId: "i1", paidAt: "2026-04-10", amountCents: 5000, method: "credit", status: "active" },
      { id: "p4", invoiceId: "i1", paidAt: "2026-05-10", amountCents: 9999, method: "bank", status: "void" },
      { id: "p5", invoiceId: "i1", paidAt: "2025-12-30", amountCents: 7000, method: "bank", status: "active" },
      { id: "p6", invoiceId: "i2", paidAt: "2026-06-01", amountCents: 4000, method: "bank", status: "active", payerName: "Pere Saar" },
      { id: "p7", invoiceId: "i3", paidAt: "2026-06-01", amountCents: 50000, method: "bank", status: "active" },
    ],
    bankTransactions: [{ id: "b1", paidAt: "2026-07-01" }],
    payerCredits: [
      { id: "b1", bankTransactionId: "b1", studentId: "s1", originalAmountCents: 10000 },
      { id: "over", sourcePaymentId: "p1", studentId: "s1", originalAmountCents: 500, createdAt: "2026-02-11" },
    ],
    refunds: [{ id: "r1", creditId: "b1", refundedAt: "2026-08-01", amountCents: 2000 }],
  });
  assert.equal(companyCents, 50000);
  assert.deepEqual(rows.map((r) => [r.studentName, r.amountCents, r.ready]), [["Mia Tamm", 8000 + 6000 + 10000 - 2000, true], ["Oskar Saar", 4000, false]]);
  assert.deepEqual(rows[1].problems, ["Õpilase isikukood puudub", "Maksja isikukood puudub"]);
  assert.equal(rows[1].payerName, "Pere Saar");
  assert.equal(totalCents, 26000);
});

test("the XML follows inf3.xsd and declares only complete rows", () => {
  const { rows } = inf3Rows({ ...base, payments: [{ id: "p1", invoiceId: "i1", paidAt: "2026-02-10", amountCents: 12345, method: "bank", status: "active" }, { id: "p2", invoiceId: "i2", paidAt: "2026-02-10", amountCents: 100, method: "bank", status: "active" }] });
  const xml = inf3Xml({ regCode: "17270880", year: 2026, rows });
  assert.match(xml, /<deklaratsioon tyyp="inf3" xmlns="http:\/\/www\.emta\.ee\/inf3">/);
  assert.match(xml, /<saatja_regkood>17270880<\/saatja_regkood>/);
  assert.match(xml, /<aasta>2026<\/aasta>/);
  assert.equal((xml.match(/<kirje>/g) || []).length, 1);
  assert.match(xml, /<koolitusmaksja_isikukood>37605030299<\/koolitusmaksja_isikukood>\s*<koolitatava_isikukood>49403136526<\/koolitatava_isikukood>\s*<makstud_summa>123\.45<\/makstud_summa>\s*<koolituse_liik>2<\/koolituse_liik>/);
  assert.throws(() => inf3Xml({ regCode: "1727", year: 2026, rows }), /registrikood/);
  assert.throws(() => inf3Xml({ regCode: "17270880", year: 2026, rows: rows.filter((r) => !r.ready) }), /Deklareerida ei ole midagi/);
});

test("a parent's code is entered once and used for all their children; a child's own payer code wins", () => {
  const students = [
    { id: "k1", name: "Timur", linkedParentId: "parentA" },
    { id: "k2", name: "Varik", parentUid: "parentA" },
    { id: "k3", name: "Liis", parentEmail: "Pere@Example.ee" },
    { id: "k4", name: "Adult" },
  ];
  assert.equal(payerKeyOf(students[0]), payerKeyOf(students[1]));
  assert.match(payerKeyOf(students[2]), /^email_[0-9a-f]{32}$/);
  assert.equal(payerKeyOf({ parentEmail: " pere@example.ee " }), payerKeyOf(students[2]));
  assert.equal(payerKeyOf(students[3]), "");
  const { rows } = inf3Rows({
    year: 2026,
    students,
    invoices: students.map((st) => ({ id: `i-${st.id}`, studentId: st.id })),
    payments: students.map((st) => ({ id: `p-${st.id}`, invoiceId: `i-${st.id}`, paidAt: "2026-03-01", amountCents: 1000, method: "bank", status: "active" })),
    identities: [
      { id: "k1", studentCode: "49403136526" },
      { id: "k2", studentCode: "37605030299" },
      { id: "k4", studentCode: "37605030299", payerCode: "49403136526", payerName: "Own Payer" },
    ],
    payers: [{ id: payerKeyOf(students[0]), payerCode: "37605030299", payerName: "Ema Mets" }, { id: "uid_other", payerCode: "49403136526" }],
  });
  const by = Object.fromEntries(rows.map((r) => [r.studentName, r]));
  assert.equal(by.Timur.payerCode, "37605030299");
  assert.equal(by.Timur.payerName, "Ema Mets");
  assert.equal(by.Timur.payerFromParent, true);
  assert.equal(by.Varik.ready, true, "the second child gets the code too");
  assert.equal(by.Liis.payerCode, "", "no parent code yet");
  assert.equal(by.Adult.payerCode, "49403136526");
  assert.equal(by.Adult.payerFromParent, false);
});
