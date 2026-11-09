"use strict";
// „Arve väljastaja” (owner 2026-11-09) end to end on the functions emulator: the owner's FIE requisites and the
// per-student switch are owner-only; an FIE invoice gets its own number series, is invisible to another administrator
// (404), takes its payment into fiePayments, never enters the company's books, cannot be credited; a family's month
// with the owner's and another teacher's subject becomes a company invoice and an FIE invoice.
const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const PROJECT = "demo-keelesepp-finance";
const OWNER_EMAIL = "zakutailo.pavel@gmail.com";
const AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const DB = process.env.FIRESTORE_EMULATOR_HOST;
const FN = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";
const IBAN = "EE382200221020145685";

function safe() {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  for (const host of [AUTH, DB]) assert.match(host || "", /^(127\.0\.0\.1|localhost):\d+$/);
}

async function account(email, role) {
  const body = JSON.stringify({ email, password: "emulator-only-password", returnSecureToken: true });
  const opts = { method: "POST", headers: { "Content-Type": "application/json" }, body };
  let created = true;
  let r = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, opts);
  let b = await r.json();
  if (!b.idToken) {
    created = false;
    r = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo`, opts);
    b = await r.json();
  }
  assert.ok(b.idToken, JSON.stringify(b));
  const uid = JSON.parse(Buffer.from(b.idToken.split(".")[1], "base64url")).sub;
  if (role) await admin.firestore().doc(`users/${uid}`).set({ role, roles: [role], email, displayName: role });
  return { token: b.idToken, uid, created };
}

const call = (api, who, path, payload = {}) => fetch(`http://${FN}/${PROJECT}/us-central1/${api}${path}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${who.token}`, "Content-Type": "application/json", Origin: "https://crm.epkoolitus.ee" },
  body: JSON.stringify(payload),
}).then(async (response) => ({ status: response.status, body: await response.json().catch(() => ({})) }));
const rid = (tag) => `fie_${tag}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

test("FIE invoices end to end: owner-only settings, own number series, hidden from another admin, outside the books", async (t) => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const owner = await account(OWNER_EMAIL, null);
  t.after(() => (owner.created ? admin.auth().deleteUser(owner.uid).catch(() => {}) : null));
  const other = await account(`fie-admin-${Date.now()}@example.com`, "admin");
  const books = await account(`fie-books-${Date.now()}@example.com`, "finance");
  const stamp = Date.now();
  const ownPupil = `fie-own-${stamp}`;
  const mixedPupil = `fie-mixed-${stamp}`;
  const strangerPupil = `fie-stranger-${stamp}`;
  await Promise.all([
    db.doc(`students/${ownPupil}`).set({ name: "Oma Õpilane", active: true, enrollments: [{ subject: "Eesti keel", teacher: "Pavel", teacherUid: owner.uid }] }),
    db.doc(`students/${mixedPupil}`).set({ name: "Kahe Õpetajaga", active: true, enrollments: [{ subject: "Eesti keel", teacher: "Pavel", teacherUid: owner.uid }, { subject: "Matemaatika", teacher: "Liza", teacherUid: other.uid }] }),
    db.doc(`students/${strangerPupil}`).set({ name: "Teise Õpilane", active: true, enrollments: [{ subject: "Eesti keel", teacher: "Liza", teacherUid: other.uid }] }),
    db.doc(`studentRevenuePlans/${mixedPupil}`).set({ studentId: mixedPupil, lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 1, active: true }),
    db.doc("invoiceIssuers/fie").delete(),
  ]);
  const due = "2099-12-10";

  // nobody but the owner reaches the FIE routes; FIE is blocked until the name and IBAN are filled
  assert.equal((await call("financeApi", other, "/fie/settings")).status, 404);
  assert.equal((await call("financeApi", other, "/fie/student-issuer", { studentId: ownPupil, issuer: "fie" })).status, 404);
  assert.equal((await call("financeApi", owner, "/fie/student-issuer", { studentId: ownPupil, issuer: "fie" })).status, 409);
  assert.equal((await call("financeApi", owner, "/fie/settings", { save: { name: "Pavel Zakutailo", iban: "EE00" } })).status, 400);
  const saved = await call("financeApi", owner, "/fie/settings", { save: { name: "Pavel Zakutailo", iban: "EE38 2200 2210 2014 5685" } });
  assert.equal(saved.status, 200, JSON.stringify(saved.body));
  assert.equal(saved.body.ready, true);
  assert.equal((await db.doc("invoiceIssuers/fie").get()).data().ownerUid, owner.uid);
  assert.equal((await call("financeApi", owner, "/fie/student-issuer", { studentId: strangerPupil, issuer: "fie" })).status, 409, "not the owner's pupil");
  for (const id of [ownPupil, mixedPupil]) assert.equal((await call("financeApi", owner, "/fie/student-issuer", { studentId: id, issuer: "fie" })).status, 200);

  // another administrator or the bookkeeper cannot issue the owner's FIE invoice — refused, not silently a company one
  const otherTry = await call("manualInvoiceApi", other, "/create", { studentId: ownPupil, description: "Tunnid", amount: 50, due, requestId: rid("other") });
  assert.equal(otherTry.status, 403, JSON.stringify(otherTry.body));
  assert.equal((await call("manualInvoiceApi", books, "/create", { studentId: ownPupil, description: "Tunnid", amount: 50, due, issuer: "fie", requestId: rid("books") })).status, 403);

  // the owner: FIE numbers of their own, the company's counter untouched
  const companyCounter = Number((await db.doc("meta/invoiceCounter").get()).data()?.seq || 0);
  const first = await call("manualInvoiceApi", owner, "/create", { studentId: ownPupil, description: "Tunnid", amount: 50, due, requestId: rid("one") });
  const second = await call("manualInvoiceApi", owner, "/create", { studentId: ownPupil, description: "Tunnid", amount: 30, due, requestId: rid("two") });
  assert.equal(first.status, 201, JSON.stringify(first.body));
  const fie1 = first.body.invoice;
  const fie2 = second.body.invoice;
  assert.equal(fie1.issuer, "fie");
  assert.deepEqual(fie1.issuerDetails, { name: "Pavel Zakutailo", iban: IBAN });
  const seq = (num) => Number(String(num).split("-").pop());
  assert.match(fie1.num, /^FIE-\d{4}-\d{3}$/);
  assert.equal(seq(fie2.num), seq(fie1.num) + 1, "the FIE series is sequential");
  assert.equal(Number((await db.doc("meta/invoiceCounter").get()).data()?.seq || 0), companyCounter, "the company counter is not used");
  assert.equal((await db.doc(`fieAudit/${fie1.id}`).get()).exists, true);
  assert.equal((await db.doc(`financialAudit/${fie1.id}`).get()).exists, false, "the FIE audit is owner-only");
  // the owner may still issue a company invoice for the same pupil
  const company = await call("manualInvoiceApi", owner, "/create", { studentId: ownPupil, description: "Materjal", amount: 10, due, issuer: "company", requestId: rid("company") });
  assert.equal(company.status, 201, JSON.stringify(company.body));
  assert.equal(company.body.invoice.issuer, "company");
  assert.match(company.body.invoice.num, /^KS-/);

  // another administrator: the FIE invoice does not exist for them
  assert.equal((await call("financeApi", other, "/payments", { invoiceId: fie1.id, amount: 50, paidAt: "2099-01-05", method: "bank", requestId: rid("pay_other") })).status, 404);
  assert.equal((await call("invoiceApi", other, "/pdf", { invoiceId: fie1.id })).status, 404);
  assert.equal((await call("manualInvoiceApi", other, "/cancel", { invoiceId: fie2.id, reason: "Vale arve, tühistan", requestId: rid("cancel_other") })).status, 404);

  // the owner's payment goes to fiePayments; company money never pays an FIE invoice; no credit note
  const paid = await call("financeApi", owner, "/payments", { invoiceId: fie1.id, amount: 50, paidAt: new Date().toISOString().slice(0, 10), method: "bank", requestId: rid("pay_owner") });
  assert.equal(paid.status, 201, JSON.stringify(paid.body));
  assert.equal((await db.doc(`fiePayments/${paid.body.payment.id}`).get()).exists, true);
  assert.equal((await db.doc(`payments/${paid.body.payment.id}`).get()).exists, false);
  assert.equal((await db.doc(`invoices/${fie1.id}`).get()).data().status, "Makstud");
  assert.equal((await call("financeApi", owner, "/invoices/credit-full", { invoiceId: fie2.id, reason: "Kreediti proov", requestId: rid("credit") })).status, 409);
  assert.equal((await call("financeApi", owner, "/bank-transactions/allocate", { requestId: rid("bank"), externalId: `x${stamp}`, paidAt: "2099-01-05", payerName: "X", amount: 30, allocations: [{ invoiceId: fie2.id, amount: 30 }] })).status, 409);
  const voided = await call("financeApi", owner, "/payments/void", { paymentId: paid.body.payment.id, reason: "Vale summa", requestId: rid("void") });
  assert.equal(voided.status, 200, JSON.stringify(voided.body));
  assert.equal((await db.doc(`invoices/${fie1.id}`).get()).data().paidAmountCents, 0);

  // the books: the sync makes no entry for an FIE invoice
  const synced = await call("financeApi", owner, "/accounting/sync");
  assert.equal(synced.status, 200, JSON.stringify(synced.body));
  const fieEntries = await db.collection("accountingEntries").where("sourceKey", "in", [`invoice:${fie1.id}`, `invoice:${fie2.id}`]).get();
  assert.equal(fieEntries.size, 0);

  // a family's month: the owner's subject (FIE) and another teacher's subject (company) become two invoices
  const month = "2099-11";
  const split = await call("manualInvoiceApi", owner, "/monthly-combined", { month, due, items: [{ studentId: mixedPupil, subject: "Eesti keel", plannedUnits: 4 }, { studentId: mixedPupil, subject: "Matemaatika", plannedUnits: 4 }] });
  assert.equal(split.status, 201, JSON.stringify(split.body));
  const made = split.body.invoices;
  assert.equal(made.length, 2);
  assert.deepEqual(made.map((invoice) => invoice.issuer).sort(), ["company", "fie"]);
  assert.match(made.find((invoice) => invoice.issuer === "fie").num, /^FIE-/);
  assert.ok(made.find((invoice) => invoice.issuer === "fie").lines.every((line) => line.subject === "Eesti keel"), "only the owner's subject on the FIE invoice");
  assert.ok(made.find((invoice) => invoice.issuer === "company").lines.every((line) => line.subject === "Matemaatika"));
  // another administrator cannot make that month for the family (it holds the owner's FIE lines)
  const otherMonth = await call("manualInvoiceApi", other, "/monthly-combined", { month: "2099-10", due, items: [{ studentId: mixedPupil, subject: "Eesti keel", plannedUnits: 4 }, { studentId: mixedPupil, subject: "Matemaatika", plannedUnits: 4 }] });
  assert.equal(otherMonth.status, 409, JSON.stringify(otherMonth.body));
});
