/**
 * KeeleSepp — Firebase Cloud Functions
 * Google Calendar OAuth2 Integration
 *
 * Endpoints:
 *  GET  /api/gcal/auth-url          → returns OAuth URL for teacher to connect
 *  GET  /api/gcal/callback           → handles OAuth callback, saves tokens
 *  POST /api/gcal/sync               → syncs calendar events to Firestore
 *  POST /api/gcal/disconnect         → removes tokens for a teacher
 *  GET  /api/gcal/status             → returns connection status for a user
 *
 * Scheduled:
 *  syncAllCalendars                  → runs every hour, syncs all connected teachers
 */

const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {
  buildLessonInvoiceLines,
  centsToAmount,
  creditAfterApplication,
  creditAfterRefund,
  creditAfterRestoration,
  invoiceAfterLessonCredit,
  invoiceFinancialPatch,
  invoiceOriginalAmountCents,
  lessonBillingDispositionPatch,
  normalizeAllocations,
  paymentNetAmountCents,
  planInvoiceOverpaymentTransfer,
  selectBillableLessons,
  toCents,
} = require("./finance-core");

admin.initializeApp();
const db = admin.firestore();
const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "Europe/Tallinn";
const STAFF_ROLES = new Set(["teacher", "admin"]);
const SUPER_ADMIN_EMAILS = new Set(
  (process.env.SUPER_ADMIN_EMAILS || "zakutailo.pavel@gmail.com")
    .split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean),
);
const DEFAULT_ALLOWED_ORIGINS = [
  "https://keelesepp.vercel.app",
  "https://epkoolitus.ee",
  "https://www.epkoolitus.ee",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8765",
  "http://127.0.0.1:8766",
];
const PAYMENT_DETAILS = {
  company: "E&P Koolitus OÜ",
  regCode: "17270880",
  email: "zakutailo.pavel@gmail.com",
  iban: "EE917700771011885682",
  bank: "LHV Pank AS",
  swift: "LHVBEE22",
  paymentDueDay: 10,
};
const MAIL_FROM = process.env.MAIL_FROM || `KeeleSepp <${PAYMENT_DETAILS.email}>`;
const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO || "info@epkoolitus.ee";
const SMTP_DEFAULTS = {
  host: "smtp.zone.eu",
  port: "465",
  secure: "true",
  user: "info@epkoolitus.ee",
  from: "KeeleSepp <info@epkoolitus.ee>",
};
const APP_BASE_URL = process.env.APP_BASE_URL || "https://www.epkoolitus.ee/haldus/";
const INVOICE_REMINDER_INTERVAL_DAYS = Number(process.env.INVOICE_REMINDER_INTERVAL_DAYS || 3);

// ── CONFIG ────────────────────────────────────────────────────
const getConfig = () => ({
  clientId:     process.env.GCAL_CLIENT_ID,
  clientSecret: process.env.GCAL_CLIENT_SECRET,
  redirectUri:  process.env.GCAL_REDIRECT_URI ||
                "https://us-central1-keelesepp-5136b.cloudfunctions.net/gcalApi/gcal/callback",
});

// ── OAUTH CLIENT ──────────────────────────────────────────────
function getOAuthClient() {
  const cfg = getConfig();
  return new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
}

// ── HELPERS ───────────────────────────────────────────────────
function applyCors(req, res) {
  const allowed = new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...(process.env.ALLOWED_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean),
  ]);
  const origin = req.get("Origin");
  if (origin && allowed.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
  }
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("X-Content-Type-Options", "nosniff");
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function sendError(res, err) {
  const status = err.status || 500;
  res.status(status).json({ error: status >= 500 ? "Internal error" : err.message });
}

async function requireFirebaseUser(req) {
  const header = req.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw httpError(401, "Firebase ID token required");
  try {
    return await admin.auth().verifyIdToken(match[1]);
  } catch (e) {
    throw httpError(401, "Invalid Firebase ID token");
  }
}

function isSuperAdmin(decoded) {
  return SUPER_ADMIN_EMAILS.has(String(decoded.email || "").toLowerCase());
}

async function requireCalendarOwner(req, uid, { staffOnly = true } = {}) {
  const decoded = await requireFirebaseUser(req);
  if (decoded.uid !== uid && !isSuperAdmin(decoded)) throw httpError(403, "Forbidden");
  const snap = await db.collection("users").doc(uid).get();
  const profile = snap.exists ? snap.data() : {};
  const role = profile.role || decoded.role || "";
  if (staffOnly && !STAFF_ROLES.has(role) && !isSuperAdmin(decoded)) {
    throw httpError(403, "Teacher or admin access required");
  }
  return { decoded, profile, role };
}

function configValue(...values) {
  return values.find(value => value !== undefined && value !== null && String(value).trim() !== "");
}

function configBool(value, fallback = false) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  return ["1", "true", "yes", "y", "on"].includes(String(value).trim().toLowerCase());
}

function collectRoles(profile = {}, decoded = {}) {
  const roles = new Set();
  const addRole = value => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(addRole);
      return;
    }
    roles.add(String(value).toLowerCase());
  };
  addRole(profile.role);
  addRole(profile.roles);
  addRole(decoded.role);
  addRole(decoded.roles);
  if (profile.isAdmin) roles.add("admin");
  if (profile.teacherRole || profile.isTeacher) roles.add("teacher");
  return roles;
}

async function requireStaffUser(req) {
  const decoded = await requireFirebaseUser(req);
  const snap = await db.collection("users").doc(decoded.uid).get();
  const profile = snap.exists ? snap.data() : {};
  const roles = collectRoles(profile, decoded);
  if (!isSuperAdmin(decoded) && ![...roles].some(role => STAFF_ROLES.has(role))) {
    throw httpError(403, "Teacher or admin access required");
  }
  return { decoded, profile, roles };
}

async function requireAdminUser(req) {
  const actor = await requireStaffUser(req);
  if (!isSuperAdmin(actor.decoded) && !actor.roles.has("admin")) {
    throw httpError(403, "Administrator access required");
  }
  return actor;
}

function actorSnapshot(actor) {
  return {
    uid: actor.decoded.uid,
    email: String(actor.decoded.email || "").toLowerCase(),
    name: actor.profile.displayName || actor.decoded.name || actor.decoded.email || "",
    role: isSuperAdmin(actor.decoded) ? "admin" : [...actor.roles].sort().join(","),
  };
}

function cleanRequestId(value) {
  const id = String(value || "").trim();
  if (!/^[A-Za-z0-9_-]{12,120}$/.test(id)) {
    throw httpError(400, "Valid requestId required");
  }
  return id;
}

function cleanText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

async function createLessonInvoice({
  actor,
  studentId,
  lessonIds,
  due,
  description,
  paymentReference,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanStudentId = String(studentId || "").trim();
  if (!cleanStudentId) throw httpError(400, "studentId required");
  if (!Array.isArray(lessonIds) || lessonIds.length === 0 || lessonIds.length > 100) {
    throw httpError(400, "Between 1 and 100 lessonIds required");
  }
  const uniqueLessonIds = [...new Set(lessonIds.map(id => String(id || "").trim()).filter(Boolean))].sort();
  if (uniqueLessonIds.length !== lessonIds.length) {
    throw httpError(400, "lessonIds must be non-empty and unique");
  }
  const cleanDue = String(due || "").trim();
  const parsedDue = new Date(`${cleanDue}T12:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(cleanDue)
    || Number.isNaN(parsedDue.getTime())
    || parsedDue.toISOString().slice(0, 10) !== cleanDue
  ) {
    throw httpError(400, "Valid due date required");
  }
  const cleanDescription = cleanText(description, 300);
  const cleanReference = cleanText(paymentReference, 160);
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    studentId: cleanStudentId,
    lessonIds: uniqueLessonIds,
    due: cleanDue,
    description: cleanDescription,
    paymentReference: cleanReference,
  })).digest("hex");
  const invoiceRef = db.collection("invoices").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const studentRef = db.collection("students").doc(cleanStudentId);
  const counterRef = db.collection("meta").doc("invoiceCounter");
  const lessonRefs = uniqueLessonIds.map(id => db.collection("lessons").doc(id));
  const studentLessonsQuery = db.collection("lessons").where("studentId", "==", cleanStudentId);
  const nowIso = new Date().toISOString();
  const todayIso = nowIso.slice(0, 10);
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existingInvoice = await transaction.get(invoiceRef);
    if (existingInvoice.exists) {
      if (existingInvoice.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different invoice");
      }
      return { invoice: { id: existingInvoice.id, ...existingInvoice.data() }, idempotent: true };
    }
    const [studentSnap, counterSnap, studentLessonsSnap] = await Promise.all([
      transaction.get(studentRef),
      transaction.get(counterRef),
      transaction.get(studentLessonsQuery),
    ]);
    if (!studentSnap.exists) throw httpError(404, "Student not found");

    const student = studentSnap.data();
    const studentLessons = studentLessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const hasLegacyCounter = Object.prototype.hasOwnProperty.call(student, "lessonsSinceInvoice");
    const eligibleLessons = selectBillableLessons(
      studentLessons,
      hasLegacyCounter ? student.lessonsSinceInvoice : undefined,
    );
    const eligibleById = new Map(eligibleLessons.map(lesson => [lesson.id, lesson]));
    const selectedLessons = uniqueLessonIds.map(id => {
      const lesson = eligibleById.get(id);
      if (!lesson) throw httpError(409, `Lesson ${id} is not currently billable`);
      return lesson;
    });
    const lessonPrice = Number(student.lessonPrice) || 0;
    const lessonData = buildLessonInvoiceLines(selectedLessons, lessonPrice);
    const nextSequence = (Number(counterSnap.data()?.seq) || 0) + 1;
    const invoiceNum = `KS-${todayIso.slice(0, 4)}-${String(nextSequence).padStart(3, "0")}`;
    const parentUid = student.linkedParentId || student.parentUid || student.guardianUid || "";
    const parentName = student.parentName || student.guardianName || "";
    const parentEmail = student.parentEmail || student.contactEmail || student.guardianEmail || "";
    const payerName = student.payerName || student.companyName || parentName || student.name || "";
    const payerEmail = student.payerEmail || parentEmail || student.email || "";
    const invoice = {
      num: invoiceNum,
      status: "Ootel",
      date: todayIso,
      due: cleanDue,
      paymentDueRule: PAYMENT_DETAILS.paymentDueRule || "monthly_10",
      paymentReference: cleanReference || invoiceNum,
      invoiceTargetType: "student",
      studentId: cleanStudentId,
      studentName: student.name || "—",
      parentUid,
      linkedParentId: student.linkedParentId || student.parentUid || "",
      guardianUid: student.guardianUid || "",
      parentName,
      parentEmail,
      parentEmailLower: String(parentEmail).trim().toLowerCase(),
      payerName,
      payerEmail,
      payerEmailLower: String(payerEmail).trim().toLowerCase(),
      amountCents: lessonData.amountCents,
      amount: lessonData.amount,
      paidAmountCents: 0,
      paidAmount: 0,
      balanceDueCents: lessonData.amountCents,
      balanceDue: lessonData.amount,
      overpaidAmountCents: 0,
      overpaidAmount: 0,
      paymentStatus: "unpaid",
      paymentCount: 0,
      parentPaymentStatus: "pending",
      parentPaymentMethod: "",
      parentPaymentSubmittedAt: "",
      emailStatus: "",
      emailRecipient: "",
      emailSentAt: "",
      emailLastType: "",
      lastReminderSentAt: "",
      reminderCount: 0,
      due10ReminderMonth: "",
      desc: cleanDescription || `${lessonData.lessonCount} keeletundi x ${lessonData.lessonPrice}€`,
      lessonCount: lessonData.lessonCount,
      lessonPrice: lessonData.lessonPrice,
      lessonPriceCents: lessonData.lessonPriceCents,
      lessonIds: lessonData.lessonIds,
      lines: lessonData.lines,
      lineVersion: 1,
      billingMode: "lesson_lines_v1",
      autoGenerated: true,
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };

    transaction.create(invoiceRef, invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    const lineIndexByLessonId = new Map(lessonData.lines.map((line, index) => [line.lessonId, index]));
    lessonRefs.forEach(ref => {
      transaction.set(ref, {
        billingStatus: "invoiced",
        invoiceId: invoiceRef.id,
        invoiceNum,
        invoiceLineIndex: lineIndexByLessonId.get(ref.id),
        billedAmountCents: lessonData.lessonPriceCents,
        billedAmount: lessonData.lessonPrice,
        invoicedAt: nowIso,
        billingUpdatedAt: nowIso,
      }, { merge: true });
    });
    transaction.set(studentRef, {
      lessonsSinceInvoice: Math.max(
        0,
        (Number(student.lessonsSinceInvoice) || 0) - lessonData.lessonCount,
      ),
      lastInvoiceAt: todayIso,
    }, { merge: true });
    transaction.create(auditRef, {
      entityType: "invoice",
      entityId: invoiceRef.id,
      action: "invoice.created_from_lessons",
      invoiceId: invoiceRef.id,
      invoiceNum,
      studentId: cleanStudentId,
      studentName: invoice.studentName,
      lessonIds: lessonData.lessonIds,
      amountCents: lessonData.amountCents,
      amount: lessonData.amount,
      actor: actorData,
      reason: "Completed lessons invoiced",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { invoice: { id: invoiceRef.id, ...invoice }, idempotent: false };
  });
}

async function setLessonBillingDisposition({
  actor,
  lessonId,
  billingStatus,
  reason,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanLessonId = String(lessonId || "").trim();
  if (!cleanLessonId) throw httpError(400, "lessonId required");
  const cleanReason = cleanText(reason);
  if (!cleanReason) throw httpError(400, "Reason required");
  const cleanBillingStatus = String(billingStatus || "").trim();
  const lessonRef = db.collection("lessons").doc(cleanLessonId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existingAudit = await transaction.get(auditRef);
    if (existingAudit.exists) {
      const existing = existingAudit.data();
      if (
        existing.action !== "lesson.billing_disposition_changed"
        || existing.lessonId !== cleanLessonId
        || existing.afterBillingStatus !== cleanBillingStatus
      ) {
        throw httpError(409, "requestId already used for a different financial mutation");
      }
      return { lessonId: cleanLessonId, billingStatus: cleanBillingStatus, idempotent: true };
    }
    const lessonSnap = await transaction.get(lessonRef);
    if (!lessonSnap.exists) throw httpError(404, "Lesson not found");
    const lesson = lessonSnap.data();
    const disposition = lessonBillingDispositionPatch(
      lesson,
      cleanBillingStatus,
      nowIso,
    );
    const studentId = String(lesson.studentId || "").trim();
    const studentRef = studentId && studentId !== "ext"
      ? db.collection("students").doc(studentId)
      : null;
    const studentSnap = studentRef ? await transaction.get(studentRef) : null;
    if (studentRef && !studentSnap.exists) throw httpError(409, "Lesson student not found");

    const lessonPatch = {
      billingDispositionReason: cleanReason,
      billingUpdatedAt: nowIso,
      billingUpdatedBy: actorData,
    };
    if (disposition.billingStatus === null) {
      lessonPatch.billingStatus = admin.firestore.FieldValue.delete();
      lessonPatch.billingDispositionReason = admin.firestore.FieldValue.delete();
    } else {
      lessonPatch.billingStatus = disposition.billingStatus;
    }
    transaction.set(lessonRef, lessonPatch, { merge: true });
    if (studentRef && disposition.counterDelta !== 0) {
      const student = studentSnap.data();
      transaction.set(studentRef, {
        lessonsSinceInvoice: Math.max(
          0,
          (Number(student.lessonsSinceInvoice) || 0) + disposition.counterDelta,
        ),
        billingUpdatedAt: nowIso,
      }, { merge: true });
    }
    transaction.create(auditRef, {
      entityType: "lesson",
      entityId: cleanLessonId,
      action: "lesson.billing_disposition_changed",
      lessonId: cleanLessonId,
      studentId,
      studentName: lesson.studentName || "",
      lessonDate: lesson.date || "",
      beforeBillingStatus: lesson.billingStatus
        || (lesson.status === "Toimunud" ? "unbilled_legacy" : "unset"),
      afterBillingStatus: cleanBillingStatus,
      counterDelta: disposition.counterDelta,
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      lesson: {
        id: cleanLessonId,
        ...lesson,
        billingStatus: disposition.billingStatus || "",
        billingDispositionReason: disposition.billingStatus === null ? "" : cleanReason,
        billingUpdatedAt: nowIso,
        billingUpdatedBy: actorData,
      },
      counterDelta: disposition.counterDelta,
      idempotent: false,
    };
  });
}

async function activeInvoicePayments(transaction, invoiceId) {
  const snap = await transaction.get(
    db.collection("payments").where("invoiceId", "==", invoiceId),
  );
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function bankAllocationStatus(allocatedAmountCents, unappliedAmountCents) {
  if (allocatedAmountCents <= 0) return "unapplied";
  return unappliedAmountCents > 0 ? "partially_allocated" : "allocated";
}

async function transferInvoiceOverpayment({ actor, invoiceId, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanInvoiceId = String(invoiceId || "").trim();
  const cleanReason = cleanText(reason);
  if (!cleanInvoiceId) throw httpError(400, "invoiceId required");
  if (!cleanReason) throw httpError(400, "Reason required");
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    invoiceId: cleanInvoiceId,
    reason: cleanReason,
  })).digest("hex");
  const invoiceRef = db.collection("invoices").doc(cleanInvoiceId);
  const resolutionRef = db.collection("overpaymentResolutions").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existingResolution = await transaction.get(resolutionRef);
    if (existingResolution.exists) {
      if (existingResolution.data().signature !== signature) {
        throw httpError(409, "requestId already used for a different overpayment resolution");
      }
      return {
        resolution: { id: existingResolution.id, ...existingResolution.data() },
        idempotent: true,
      };
    }
    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists) throw httpError(404, "Invoice not found");
    const invoice = invoiceSnap.data();
    const payments = await activeInvoicePayments(transaction, cleanInvoiceId);
    const plan = planInvoiceOverpaymentTransfer(invoice, payments);
    const paymentsById = new Map(payments.map(payment => [payment.id, payment]));
    const bankIds = [...new Set(plan.allocations
      .map(allocation => paymentsById.get(allocation.paymentId)?.bankTransactionId)
      .filter(Boolean))];
    const bankRefs = bankIds.map(id => db.collection("bankTransactions").doc(String(id)));
    const bankSnaps = await Promise.all(bankRefs.map(ref => transaction.get(ref)));
    bankSnaps.forEach((snap, index) => {
      if (!snap.exists) throw httpError(409, `Source bank transaction ${bankIds[index]} not found`);
    });
    const bankById = new Map(bankSnaps.map((snap, index) => [
      bankIds[index],
      { ref: bankRefs[index], data: snap.data(), resolvedAmountCents: 0 },
    ]));

    const creditIds = [];
    const creditSummaries = [];
    const resolvedPayments = payments.map(payment => ({ ...payment }));
    plan.allocations.forEach((allocation, index) => {
      const payment = paymentsById.get(allocation.paymentId);
      if (!payment) throw httpError(409, "Overpayment source payment not found");
      const previousResolvedAmountCents = Number(payment.resolvedAmountCents)
        || Math.round((Number(payment.resolvedAmount) || 0) * 100);
      const resolvedAmountCents = previousResolvedAmountCents + allocation.amountCents;
      const netAmountCents = paymentNetAmountCents({
        ...payment,
        resolvedAmountCents,
      });
      const paymentRef = db.collection("payments").doc(payment.id);
      transaction.set(paymentRef, {
        resolvedAmountCents,
        resolvedAmount: centsToAmount(resolvedAmountCents),
        netAmountCents,
        netAmount: centsToAmount(netAmountCents),
        resolutionIds: admin.firestore.FieldValue.arrayUnion(mutationId),
        lastResolvedAt: nowIso,
        updatedAt: nowIso,
      }, { merge: true });
      const resolvedIndex = resolvedPayments.findIndex(item => item.id === payment.id);
      resolvedPayments[resolvedIndex] = {
        ...resolvedPayments[resolvedIndex],
        resolvedAmountCents,
      };

      const creditId = `${mutationId}_c${index + 1}`;
      const creditRef = db.collection("payerCredits").doc(creditId);
      const payerName = payment.payerName
        || invoice.payerName
        || invoice.parentName
        || invoice.studentName
        || "";
      const payerCredit = {
        payerKey: payerKey(payerName),
        payerName,
        bankTransactionId: payment.bankTransactionId || "",
        sourcePaymentId: payment.id,
        sourceInvoiceId: cleanInvoiceId,
        sourceInvoiceNum: invoice.num || "",
        overpaymentResolutionId: mutationId,
        originalAmountCents: allocation.amountCents,
        originalAmount: centsToAmount(allocation.amountCents),
        availableAmountCents: allocation.amountCents,
        availableAmount: centsToAmount(allocation.amountCents),
        appliedAmountCents: 0,
        appliedAmount: 0,
        refundedAmountCents: 0,
        refundedAmount: 0,
        status: "open",
        createdAt: nowIso,
        createdBy: actorData,
      };
      transaction.create(creditRef, payerCredit);
      creditIds.push(creditId);
      creditSummaries.push({
        creditId,
        paymentId: payment.id,
        bankTransactionId: payment.bankTransactionId || "",
        amountCents: allocation.amountCents,
        amount: centsToAmount(allocation.amountCents),
      });
      if (payment.bankTransactionId) {
        bankById.get(payment.bankTransactionId).resolvedAmountCents += allocation.amountCents;
      }
    });

    bankById.forEach(({ ref, data, resolvedAmountCents }) => {
      const allocatedAmountCents = Math.max(
        0,
        (Number(data.allocatedAmountCents) || 0) - resolvedAmountCents,
      );
      const unappliedAmountCents = Math.max(
        0,
        (Number(data.unappliedAmountCents) || 0) + resolvedAmountCents,
      );
      transaction.set(ref, {
        allocatedAmountCents,
        allocatedAmount: centsToAmount(allocatedAmountCents),
        unappliedAmountCents,
        unappliedAmount: centsToAmount(unappliedAmountCents),
        status: bankAllocationStatus(allocatedAmountCents, unappliedAmountCents),
        overpaymentResolutionIds: admin.firestore.FieldValue.arrayUnion(mutationId),
        updatedAt: nowIso,
      }, { merge: true });
    });

    const invoicePatch = invoiceFinancialPatch(invoice, resolvedPayments, nowIso);
    if (invoicePatch.overpaidAmountCents !== 0 || invoicePatch.balanceDueCents !== 0) {
      throw httpError(409, "Overpayment resolution did not balance the invoice");
    }
    const isFullyCredited = invoice.correctionStatus === "fully_credited"
      || Number(invoice.effectiveAmountCents) === 0;
    const balancedInvoicePatch = isFullyCredited
      ? { ...invoicePatch, status: "Krediteeritud", paymentStatus: "credited" }
      : invoicePatch;
    transaction.set(invoiceRef, {
      ...balancedInvoicePatch,
      overpaymentResolutionIds: admin.firestore.FieldValue.arrayUnion(mutationId),
      lastOverpaymentResolvedAt: nowIso,
    }, { merge: true });
    const resolution = {
      invoiceId: cleanInvoiceId,
      invoiceNum: invoice.num || "",
      payerName: invoice.payerName || invoice.parentName || invoice.studentName || "",
      amountCents: plan.overpaidAmountCents,
      amount: centsToAmount(plan.overpaidAmountCents),
      type: "payer_credit",
      credits: creditSummaries,
      creditIds,
      sourcePaymentIds: plan.allocations.map(allocation => allocation.paymentId),
      signature,
      reason: cleanReason,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.create(resolutionRef, resolution);
    transaction.create(auditRef, {
      entityType: "overpaymentResolution",
      entityId: mutationId,
      action: "invoice.overpayment_transferred_to_credit",
      invoiceId: cleanInvoiceId,
      invoiceNum: invoice.num || "",
      amountCents: plan.overpaidAmountCents,
      amount: centsToAmount(plan.overpaidAmountCents),
      credits: creditSummaries,
      before: {
        paidAmount: Number(invoice.paidAmount) || 0,
        overpaidAmount: Number(invoice.overpaidAmount) || centsToAmount(plan.overpaidAmountCents),
      },
      after: {
        paidAmount: balancedInvoicePatch.paidAmount,
        overpaidAmount: balancedInvoicePatch.overpaidAmount,
        balanceDue: balancedInvoicePatch.balanceDue,
      },
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      resolution: { id: mutationId, ...resolution },
      invoice: { id: cleanInvoiceId, ...invoice, ...balancedInvoicePatch },
      payerCredits: creditSummaries,
      idempotent: false,
    };
  });
}

async function refundPayerCredit({
  actor,
  creditId,
  amount,
  refundedAt,
  method,
  reference,
  reason,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanCreditId = String(creditId || "").trim();
  if (!cleanCreditId) throw httpError(400, "creditId required");
  const amountCents = toCents(amount, "refund amount");
  const cleanReason = cleanText(reason);
  if (!cleanReason) throw httpError(400, "Reason required");
  const nowIso = new Date().toISOString();
  const rawRefundDate = String(refundedAt || "");
  const parsedRefundDate = new Date(`${rawRefundDate}T12:00:00.000Z`);
  const refundDate = /^\d{4}-\d{2}-\d{2}$/.test(rawRefundDate)
    && !Number.isNaN(parsedRefundDate.getTime())
    && parsedRefundDate.toISOString().slice(0, 10) === rawRefundDate
    ? rawRefundDate
    : nowIso.slice(0, 10);
  const cleanMethod = cleanText(method, 40) || "bank";
  const cleanReference = cleanText(reference, 160);
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    creditId: cleanCreditId,
    amountCents,
    refundedAt: refundDate,
    method: cleanMethod,
    reference: cleanReference,
    reason: cleanReason,
  })).digest("hex");
  const creditRef = db.collection("payerCredits").doc(cleanCreditId);
  const refundRef = db.collection("refunds").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existingRefund = await transaction.get(refundRef);
    if (existingRefund.exists) {
      if (existingRefund.data().signature !== signature) {
        throw httpError(409, "requestId already used for a different refund");
      }
      return { refund: { id: existingRefund.id, ...existingRefund.data() }, idempotent: true };
    }
    const creditSnap = await transaction.get(creditRef);
    if (!creditSnap.exists) throw httpError(404, "Payer credit not found");
    const credit = creditSnap.data();
    const creditPatch = creditAfterRefund(credit, amountCents, nowIso);
    const refund = {
      creditId: cleanCreditId,
      payerKey: credit.payerKey || "",
      payerName: credit.payerName || "",
      bankTransactionId: credit.bankTransactionId || "",
      sourcePaymentId: credit.sourcePaymentId || "",
      sourceInvoiceId: credit.sourceInvoiceId || "",
      amountCents,
      amount: centsToAmount(amountCents),
      refundedAt: refundDate,
      method: cleanMethod,
      reference: cleanReference,
      reason: cleanReason,
      status: "recorded",
      signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.set(creditRef, {
      ...creditPatch,
      refundIds: admin.firestore.FieldValue.arrayUnion(mutationId),
    }, { merge: true });
    transaction.create(refundRef, refund);
    transaction.create(auditRef, {
      entityType: "refund",
      entityId: mutationId,
      action: "payer_credit.refunded",
      refundId: mutationId,
      creditId: cleanCreditId,
      payerName: credit.payerName || "",
      amountCents,
      amount: centsToAmount(amountCents),
      beforeAvailableAmount: Number(credit.availableAmount) || 0,
      afterAvailableAmount: creditPatch.availableAmount,
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      refund: { id: mutationId, ...refund },
      payerCredit: { id: cleanCreditId, ...credit, ...creditPatch },
      idempotent: false,
    };
  });
}

async function createInvoiceLessonCreditNote({
  actor,
  invoiceId,
  lessonId,
  reason,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanInvoiceId = String(invoiceId || "").trim();
  const cleanLessonId = String(lessonId || "").trim();
  const cleanReason = cleanText(reason);
  if (!cleanInvoiceId) throw httpError(400, "invoiceId required");
  if (!cleanLessonId) throw httpError(400, "lessonId required");
  if (!cleanReason) throw httpError(400, "Reason required");

  const signature = crypto.createHash("sha256").update(JSON.stringify({
    invoiceId: cleanInvoiceId,
    lessonId: cleanLessonId,
    reason: cleanReason,
  })).digest("hex");
  const invoiceRef = db.collection("invoices").doc(cleanInvoiceId);
  const lessonRef = db.collection("lessons").doc(cleanLessonId);
  const creditNoteRef = db.collection("creditNotes").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const counterRef = db.collection("meta").doc("creditNoteCounter");
  const nowIso = new Date().toISOString();
  const todayIso = nowIso.slice(0, 10);
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existingCreditNote = await transaction.get(creditNoteRef);
    if (existingCreditNote.exists) {
      if (existingCreditNote.data().signature !== signature) {
        throw httpError(409, "requestId already used for a different credit note");
      }
      return {
        creditNote: { id: existingCreditNote.id, ...existingCreditNote.data() },
        idempotent: true,
      };
    }

    const [invoiceSnap, lessonSnap, counterSnap, payments] = await Promise.all([
      transaction.get(invoiceRef),
      transaction.get(lessonRef),
      transaction.get(counterRef),
      activeInvoicePayments(transaction, cleanInvoiceId),
    ]);
    if (!invoiceSnap.exists) throw httpError(404, "Invoice not found");
    if (!lessonSnap.exists) throw httpError(404, "Lesson not found");

    const invoice = invoiceSnap.data();
    const lesson = lessonSnap.data();
    const line = (Array.isArray(invoice.lines) ? invoice.lines : [])
      .find(item => item && item.lessonId === cleanLessonId);
    if (!line) throw httpError(409, "Invoice does not contain this lesson line");
    if (lesson.invoiceId !== cleanInvoiceId || lesson.billingStatus !== "invoiced") {
      throw httpError(409, "Lesson is not actively invoiced by this invoice");
    }
    const hasLegacyPaidFlag = invoice.status === "Makstud"
      && invoice.paidAmount === undefined
      && invoice.paidAmountCents === undefined
      && payments.every(payment => payment.status === "voided");
    if (hasLegacyPaidFlag) {
      throw httpError(
        409,
        "Legacy paid invoice must have its paid flag reset before a lesson line can be credited",
      );
    }

    const creditPatch = invoiceAfterLessonCredit(invoice, line);
    const originalInvoiceAmountCents = invoiceOriginalAmountCents(invoice);
    const updatedInvoice = { ...invoice, ...creditPatch };
    const financialPatch = invoiceFinancialPatch(updatedInvoice, payments, nowIso);
    if (financialPatch.overpaidAmountCents > 0) {
      throw httpError(
        409,
        "Credit would create an overpayment; void or refund the excess payment first",
      );
    }

    const nextSequence = (Number(counterSnap.data()?.seq) || 0) + 1;
    const creditNoteNum = `KN-${todayIso.slice(0, 4)}-${String(nextSequence).padStart(3, "0")}`;
    const lineAmountCents = Number(line.amountCents)
      || Math.round((Number(line.amount) || 0) * 100);
    const isFullyCredited = creditPatch.effectiveAmountCents === 0;
    const correction = {
      creditNoteId: mutationId,
      creditNoteNum,
      lessonId: cleanLessonId,
      lessonDate: line.date || lesson.date || "",
      amountCents: lineAmountCents,
      amount: centsToAmount(lineAmountCents),
      reason: cleanReason,
      createdAt: nowIso,
    };
    const creditNote = {
      num: creditNoteNum,
      status: "issued",
      date: todayIso,
      invoiceId: cleanInvoiceId,
      invoiceNum: invoice.num || "",
      studentId: invoice.studentId || lesson.studentId || "",
      studentName: invoice.studentName || lesson.studentName || "",
      payerName: invoice.payerName || invoice.parentName || invoice.studentName || "",
      lessonId: cleanLessonId,
      lessonDate: correction.lessonDate,
      amountCents: lineAmountCents,
      amount: centsToAmount(lineAmountCents),
      lines: [{
        ...line,
        type: "lesson_credit",
        amountCents: -lineAmountCents,
        amount: -centsToAmount(lineAmountCents),
      }],
      originalInvoiceAmountCents,
      originalInvoiceAmount: Number(invoice.amount) || 0,
      effectiveInvoiceAmountCents: creditPatch.effectiveAmountCents,
      effectiveInvoiceAmount: creditPatch.effectiveAmount,
      reason: cleanReason,
      signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };

    transaction.create(creditNoteRef, creditNote);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    transaction.set(invoiceRef, {
      amountCents: originalInvoiceAmountCents,
      ...creditPatch,
      ...financialPatch,
      status: isFullyCredited ? "Krediteeritud" : financialPatch.status,
      paymentStatus: isFullyCredited ? "credited" : financialPatch.paymentStatus,
      correctionStatus: isFullyCredited ? "fully_credited" : "partially_credited",
      creditNoteIds: admin.firestore.FieldValue.arrayUnion(mutationId),
      corrections: admin.firestore.FieldValue.arrayUnion(correction),
      ...(financialPatch.paidAt ? {} : { paidAt: admin.firestore.FieldValue.delete() }),
    }, { merge: true });
    transaction.set(lessonRef, {
      billingStatus: "credited",
      creditNoteId: mutationId,
      creditNoteNum,
      creditedAt: nowIso,
      creditReason: cleanReason,
      billingUpdatedAt: nowIso,
      billingUpdatedBy: actorData,
    }, { merge: true });
    transaction.create(auditRef, {
      entityType: "creditNote",
      entityId: mutationId,
      action: "invoice.lesson_line_credited",
      creditNoteId: mutationId,
      creditNoteNum,
      invoiceId: cleanInvoiceId,
      invoiceNum: invoice.num || "",
      lessonId: cleanLessonId,
      amountCents: lineAmountCents,
      amount: centsToAmount(lineAmountCents),
      before: {
        originalAmount: Number(invoice.amount) || 0,
        effectiveAmount: Number(invoice.effectiveAmount ?? invoice.amount) || 0,
        balanceDue: Number(invoice.balanceDue ?? invoice.amount) || 0,
      },
      after: {
        originalAmount: Number(invoice.amount) || 0,
        effectiveAmount: creditPatch.effectiveAmount,
        balanceDue: financialPatch.balanceDue,
        status: isFullyCredited ? "Krediteeritud" : financialPatch.status,
      },
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      creditNote: { id: mutationId, ...creditNote },
      invoice: {
        id: cleanInvoiceId,
        ...invoice,
        amountCents: originalInvoiceAmountCents,
        ...creditPatch,
        ...financialPatch,
        status: isFullyCredited ? "Krediteeritud" : financialPatch.status,
        paymentStatus: isFullyCredited ? "credited" : financialPatch.paymentStatus,
      },
      idempotent: false,
    };
  });
}

async function recordInvoicePayment({ actor, invoiceId, amount, paidAt, method, reference, note, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const amountCents = toCents(amount);
  const invoiceRef = db.collection("invoices").doc(String(invoiceId || ""));
  const paymentRef = db.collection("payments").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const paymentDate = /^\d{4}-\d{2}-\d{2}$/.test(String(paidAt || ""))
    ? String(paidAt)
    : nowIso.slice(0, 10);
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(paymentRef);
    if (existing.exists) {
      const data = existing.data();
      if (data.invoiceId !== invoiceRef.id || data.amountCents !== amountCents) {
        throw httpError(409, "requestId already used for a different payment");
      }
      const invoiceSnap = await transaction.get(invoiceRef);
      return { payment: { id: existing.id, ...data }, invoice: { id: invoiceSnap.id, ...invoiceSnap.data() }, idempotent: true };
    }

    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists) throw httpError(404, "Invoice not found");
    const invoice = invoiceSnap.data();
    const payments = await activeInvoicePayments(transaction, invoiceRef.id);
    const payment = {
      invoiceId: invoiceRef.id,
      invoiceNum: invoice.num || "",
      studentId: invoice.studentId || "",
      studentName: invoice.studentName || "",
      payerName: invoice.payerName || invoice.parentName || invoice.studentName || "",
      amountCents,
      amount: centsToAmount(amountCents),
      paidAt: paymentDate,
      method: cleanText(method, 40) || "bank",
      reference: cleanText(reference, 160) || invoice.paymentReference || invoice.num || "",
      note: cleanText(note),
      status: "active",
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    const patch = invoiceFinancialPatch(invoice, [...payments, payment], nowIso);

    transaction.create(paymentRef, payment);
    transaction.set(invoiceRef, patch, { merge: true });
    transaction.create(auditRef, {
      entityType: "payment",
      entityId: mutationId,
      invoiceId: invoiceRef.id,
      invoiceNum: invoice.num || "",
      action: "payment.created",
      before: {
        status: invoice.status || "Ootel",
        paidAmount: Number(invoice.paidAmount) || 0,
        balanceDue: invoice.balanceDue ?? (Number(invoice.amount) || 0),
      },
      after: {
        status: patch.status,
        paidAmount: patch.paidAmount,
        balanceDue: patch.balanceDue,
        overpaidAmount: patch.overpaidAmount,
      },
      amountCents,
      amount: centsToAmount(amountCents),
      actor: actorData,
      reason: cleanText(note) || "Payment recorded",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { payment: { id: mutationId, ...payment }, invoice: { id: invoiceRef.id, ...invoice, ...patch }, idempotent: false };
  });
}

async function resetInvoicePayments({ actor, invoiceId, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const invoiceRef = db.collection("invoices").doc(String(invoiceId || ""));
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  const cleanReason = cleanText(reason);
  if (!cleanReason) throw httpError(400, "Reason required");

  return db.runTransaction(async transaction => {
    const existingAudit = await transaction.get(auditRef);
    if (existingAudit.exists) return { idempotent: true };
    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists) throw httpError(404, "Invoice not found");
    const invoice = invoiceSnap.data();
    const payments = await activeInvoicePayments(transaction, invoiceRef.id);
    const activePayments = payments.filter(payment => payment.status !== "voided");
    if (activePayments.some(payment => payment.bankTransactionId || payment.sourceCreditId)) {
      throw httpError(
        409,
        "Source-linked payments must be voided individually so the bank transaction or payer credit can be restored",
      );
    }

    activePayments.forEach(payment => {
      transaction.set(db.collection("payments").doc(payment.id), {
        status: "voided",
        voidedAt: nowIso,
        voidedBy: actorData,
        voidReason: cleanReason,
        voidRequestId: mutationId,
      }, { merge: true });
    });
    const patch = invoiceFinancialPatch(invoice, [], nowIso);
    transaction.set(invoiceRef, {
      ...patch,
      paidAt: admin.firestore.FieldValue.delete(),
      parentPaymentSubmittedAt: "",
      parentPaymentMethod: "",
    }, { merge: true });
    transaction.create(auditRef, {
      entityType: "invoice",
      entityId: invoiceRef.id,
      invoiceId: invoiceRef.id,
      invoiceNum: invoice.num || "",
      action: activePayments.length ? "payments.voided" : "invoice.legacy_payment_reset",
      before: {
        status: invoice.status || "Ootel",
        paidAmount: invoice.paidAmount ?? (invoice.status === "Makstud" ? Number(invoice.amount) || 0 : 0),
      },
      after: {
        status: patch.status,
        paidAmount: 0,
        balanceDue: Number(invoice.effectiveAmount ?? invoice.amount) || 0,
      },
      paymentIds: activePayments.map(payment => payment.id),
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { invoiceId: invoiceRef.id, voidedPaymentCount: activePayments.length, idempotent: false };
  });
}

function payerKey(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  return normalized
    ? crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 24)
    : "unknown";
}

async function allocateBankTransaction({
  actor,
  requestId,
  externalId,
  paidAt,
  payerName,
  reference,
  amount,
  allocations,
  note,
}) {
  const mutationId = cleanRequestId(requestId);
  const normalized = normalizeAllocations(amount, allocations);
  const sortedAllocations = [...normalized.allocations].sort((a, b) => a.invoiceId.localeCompare(b.invoiceId));
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    amountCents: normalized.transactionAmountCents,
    allocations: sortedAllocations,
    externalId: cleanText(externalId, 160),
    paidAt: String(paidAt || ""),
    payerName: cleanText(payerName, 200),
    reference: cleanText(reference, 300),
    note: cleanText(note),
  })).digest("hex");
  const bankRef = db.collection("bankTransactions").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const creditRef = db.collection("payerCredits").doc(mutationId);
  const nowIso = new Date().toISOString();
  const rawTransactionDate = String(paidAt || "");
  const parsedTransactionDate = new Date(`${rawTransactionDate}T12:00:00.000Z`);
  const transactionDate = /^\d{4}-\d{2}-\d{2}$/.test(rawTransactionDate)
    && !Number.isNaN(parsedTransactionDate.getTime())
    && parsedTransactionDate.toISOString().slice(0, 10) === rawTransactionDate
    ? rawTransactionDate
    : nowIso.slice(0, 10);
  const cleanPayerName = cleanText(payerName, 200);
  const cleanReference = cleanText(reference, 300);
  const cleanNote = cleanText(note);
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(bankRef);
    if (existing.exists) {
      if (existing.data().signature !== signature) {
        throw httpError(409, "requestId already used for a different bank transaction");
      }
      return { bankTransaction: { id: existing.id, ...existing.data() }, idempotent: true };
    }

    const invoiceRefs = sortedAllocations.map(allocation => db.collection("invoices").doc(allocation.invoiceId));
    const invoiceSnaps = await Promise.all(invoiceRefs.map(ref => transaction.get(ref)));
    invoiceSnaps.forEach((snap, index) => {
      if (!snap.exists) throw httpError(404, `Invoice ${sortedAllocations[index].invoiceId} not found`);
    });
    const paymentSnaps = await Promise.all(sortedAllocations.map(allocation =>
      activeInvoicePayments(transaction, allocation.invoiceId),
    ));
    const legacyExternalId = cleanText(externalId, 160).replace(/[^A-Za-z0-9_-]/g, "_");
    const legacyPaymentSnaps = legacyExternalId
      ? await Promise.all(sortedAllocations.map(allocation =>
        transaction.get(db.collection("payments").doc(`bank_${legacyExternalId}_${allocation.invoiceId}`)),
      ))
      : [];
    if (legacyPaymentSnaps.some(snap => snap.exists)) {
      throw httpError(409, "Bank row was already recorded by the previous reconciliation flow");
    }

    const bankTransaction = {
      externalId: cleanText(externalId, 160),
      paidAt: transactionDate,
      payerName: cleanPayerName,
      payerKey: payerKey(cleanPayerName),
      reference: cleanReference,
      amountCents: normalized.transactionAmountCents,
      amount: centsToAmount(normalized.transactionAmountCents),
      allocatedAmountCents: normalized.allocatedAmountCents,
      allocatedAmount: centsToAmount(normalized.allocatedAmountCents),
      unappliedAmountCents: normalized.unappliedAmountCents,
      unappliedAmount: centsToAmount(normalized.unappliedAmountCents),
      allocationCount: sortedAllocations.length,
      activeAllocationCount: sortedAllocations.length,
      status: normalized.allocatedAmountCents === 0
        ? "unapplied"
        : normalized.unappliedAmountCents > 0
          ? "partially_allocated"
          : "allocated",
      signature,
      note: cleanNote,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    const auditInvoices = [];
    const paymentIds = [];

    sortedAllocations.forEach((allocation, index) => {
      const invoice = invoiceSnaps[index].data();
      const paymentId = `${mutationId}_a${index + 1}`;
      const paymentRef = db.collection("payments").doc(paymentId);
      const payment = {
        invoiceId: allocation.invoiceId,
        invoiceNum: invoice.num || "",
        studentId: invoice.studentId || "",
        studentName: invoice.studentName || "",
        payerName: cleanPayerName || invoice.payerName || invoice.parentName || invoice.studentName || "",
        amountCents: allocation.amountCents,
        amount: centsToAmount(allocation.amountCents),
        paidAt: transactionDate,
        method: "bank",
        reference: cleanReference || invoice.paymentReference || invoice.num || "",
        note: cleanNote || "Allocated bank transaction",
        status: "active",
        bankTransactionId: mutationId,
        bankExternalId: cleanText(externalId, 160),
        allocationIndex: index,
        createdAt: nowIso,
        createdBy: actorData,
        requestId: paymentId,
      };
      const patch = invoiceFinancialPatch(invoice, [...paymentSnaps[index], payment], nowIso);
      transaction.create(paymentRef, payment);
      transaction.set(invoiceRefs[index], patch, { merge: true });
      paymentIds.push(paymentId);
      auditInvoices.push({
        invoiceId: allocation.invoiceId,
        invoiceNum: invoice.num || "",
        amount: payment.amount,
        beforePaidAmount: Number(invoice.paidAmount) || 0,
        afterPaidAmount: patch.paidAmount,
        afterBalanceDue: patch.balanceDue,
        afterOverpaidAmount: patch.overpaidAmount,
      });
    });

    transaction.create(bankRef, bankTransaction);
    if (normalized.unappliedAmountCents > 0) {
      transaction.create(creditRef, {
        payerKey: bankTransaction.payerKey,
        payerName: cleanPayerName,
        bankTransactionId: mutationId,
        originalAmountCents: normalized.unappliedAmountCents,
        originalAmount: centsToAmount(normalized.unappliedAmountCents),
        availableAmountCents: normalized.unappliedAmountCents,
        availableAmount: centsToAmount(normalized.unappliedAmountCents),
        status: "open",
        createdAt: nowIso,
        createdBy: actorData,
      });
    }
    transaction.create(auditRef, {
      entityType: "bankTransaction",
      entityId: mutationId,
      action: "bank_transaction.allocated",
      bankTransactionId: mutationId,
      paymentIds,
      invoices: auditInvoices,
      transactionAmount: bankTransaction.amount,
      allocatedAmount: bankTransaction.allocatedAmount,
      unappliedAmount: bankTransaction.unappliedAmount,
      payerKey: bankTransaction.payerKey,
      payerName: cleanPayerName,
      actor: actorData,
      reason: cleanNote || "Bank transaction allocated",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      bankTransaction: { id: mutationId, ...bankTransaction },
      paymentIds,
      payerCredit: normalized.unappliedAmountCents > 0
        ? { id: mutationId, amount: centsToAmount(normalized.unappliedAmountCents) }
        : null,
      idempotent: false,
    };
  });
}

async function applyPayerCredit({ actor, creditId, allocations, note, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanCreditId = String(creditId || "").trim();
  if (!cleanCreditId) throw httpError(400, "creditId required");
  if (!Array.isArray(allocations) || allocations.length === 0) {
    throw httpError(400, "At least one credit allocation required");
  }
  const requestedAmount = allocations.reduce((sum, allocation) => sum + (Number(allocation?.amount) || 0), 0);
  const normalized = normalizeAllocations(requestedAmount, allocations);
  const sortedAllocations = [...normalized.allocations].sort((a, b) => a.invoiceId.localeCompare(b.invoiceId));
  const cleanNote = cleanText(note);
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    creditId: cleanCreditId,
    allocations: sortedAllocations,
    note: cleanNote,
  })).digest("hex");
  const creditRef = db.collection("payerCredits").doc(cleanCreditId);
  const applicationRef = db.collection("creditApplications").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existingApplication = await transaction.get(applicationRef);
    if (existingApplication.exists) {
      if (existingApplication.data().signature !== signature) {
        throw httpError(409, "requestId already used for a different credit application");
      }
      return { creditApplication: { id: existingApplication.id, ...existingApplication.data() }, idempotent: true };
    }
    const creditSnap = await transaction.get(creditRef);
    if (!creditSnap.exists) throw httpError(404, "Payer credit not found");
    const credit = creditSnap.data();
    if (credit.status !== "open" || (Number(credit.availableAmountCents) || 0) <= 0) {
      throw httpError(409, "Payer credit is not available");
    }
    const invoiceRefs = sortedAllocations.map(allocation => db.collection("invoices").doc(allocation.invoiceId));
    const invoiceSnaps = await Promise.all(invoiceRefs.map(ref => transaction.get(ref)));
    invoiceSnaps.forEach((snap, index) => {
      if (!snap.exists) throw httpError(404, `Invoice ${sortedAllocations[index].invoiceId} not found`);
    });
    const paymentSnaps = await Promise.all(sortedAllocations.map(allocation =>
      activeInvoicePayments(transaction, allocation.invoiceId),
    ));
    sortedAllocations.forEach((allocation, index) => {
      const preview = invoiceFinancialPatch(invoiceSnaps[index].data(), paymentSnaps[index], nowIso);
      if (allocation.amountCents > preview.balanceDueCents) {
        throw httpError(409, `Credit allocation exceeds invoice ${allocation.invoiceId} balance`);
      }
    });
    const creditPatch = creditAfterApplication(credit, normalized.allocatedAmountCents, nowIso);
    const paymentIds = [];
    const auditInvoices = [];

    sortedAllocations.forEach((allocation, index) => {
      const invoice = invoiceSnaps[index].data();
      const paymentId = `${mutationId}_a${index + 1}`;
      const payment = {
        invoiceId: allocation.invoiceId,
        invoiceNum: invoice.num || "",
        studentId: invoice.studentId || "",
        studentName: invoice.studentName || "",
        payerName: credit.payerName || invoice.payerName || invoice.parentName || invoice.studentName || "",
        amountCents: allocation.amountCents,
        amount: centsToAmount(allocation.amountCents),
        paidAt: nowIso.slice(0, 10),
        method: "credit",
        reference: `Avanss ${creditRef.id}`,
        note: cleanNote || "Payer credit applied",
        status: "active",
        sourceCreditId: creditRef.id,
        creditApplicationId: mutationId,
        createdAt: nowIso,
        createdBy: actorData,
        requestId: paymentId,
      };
      const patch = invoiceFinancialPatch(invoice, [...paymentSnaps[index], payment], nowIso);
      transaction.create(db.collection("payments").doc(paymentId), payment);
      transaction.set(invoiceRefs[index], patch, { merge: true });
      paymentIds.push(paymentId);
      auditInvoices.push({
        invoiceId: allocation.invoiceId,
        invoiceNum: invoice.num || "",
        amount: payment.amount,
        beforePaidAmount: Number(invoice.paidAmount) || 0,
        afterPaidAmount: patch.paidAmount,
        afterBalanceDue: patch.balanceDue,
      });
    });

    const application = {
      creditId: creditRef.id,
      payerKey: credit.payerKey || "",
      payerName: credit.payerName || "",
      amountCents: normalized.allocatedAmountCents,
      amount: centsToAmount(normalized.allocatedAmountCents),
      originalAmountCents: normalized.allocatedAmountCents,
      originalAmount: centsToAmount(normalized.allocatedAmountCents),
      allocations: auditInvoices,
      paymentIds,
      activePaymentCount: paymentIds.length,
      status: "active",
      signature,
      note: cleanNote,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.set(creditRef, creditPatch, { merge: true });
    transaction.create(applicationRef, application);
    transaction.create(auditRef, {
      entityType: "payerCredit",
      entityId: creditRef.id,
      action: "payer_credit.applied",
      creditId: creditRef.id,
      creditApplicationId: mutationId,
      paymentIds,
      invoices: auditInvoices,
      amount: application.amount,
      beforeAvailableAmount: Number(credit.availableAmount) || 0,
      afterAvailableAmount: creditPatch.availableAmount,
      actor: actorData,
      reason: cleanNote || "Payer credit applied",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      creditApplication: { id: mutationId, ...application },
      payerCredit: { id: creditRef.id, ...credit, ...creditPatch },
      idempotent: false,
    };
  });
}

async function voidSinglePayment({ actor, paymentId, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanPaymentId = String(paymentId || "").trim();
  if (!cleanPaymentId) throw httpError(400, "paymentId required");
  const cleanReason = cleanText(reason);
  if (!cleanReason) throw httpError(400, "Reason required");
  const paymentRef = db.collection("payments").doc(cleanPaymentId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existingAudit = await transaction.get(auditRef);
    if (existingAudit.exists) {
      const existingData = existingAudit.data();
      if (existingData.action !== "payment.voided" || existingData.paymentId !== paymentRef.id) {
        throw httpError(409, "requestId already used for a different financial mutation");
      }
      return { paymentId: paymentRef.id, idempotent: true };
    }
    const paymentSnap = await transaction.get(paymentRef);
    if (!paymentSnap.exists) throw httpError(404, "Payment not found");
    const payment = paymentSnap.data();
    if (payment.status === "voided") throw httpError(409, "Payment is already voided");
    const invoiceRef = db.collection("invoices").doc(String(payment.invoiceId || ""));
    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists) throw httpError(404, "Invoice not found");
    const invoice = invoiceSnap.data();
    const invoicePayments = await activeInvoicePayments(transaction, invoiceRef.id);

    let sourceCreditRef = null;
    let sourceCredit = null;
    let applicationRef = null;
    let application = null;
    let bankRef = null;
    let bankTransaction = null;
    if (payment.sourceCreditId) {
      sourceCreditRef = db.collection("payerCredits").doc(String(payment.sourceCreditId));
      const creditSnap = await transaction.get(sourceCreditRef);
      if (!creditSnap.exists) throw httpError(409, "Source payer credit not found");
      sourceCredit = creditSnap.data();
      if (payment.creditApplicationId) {
        applicationRef = db.collection("creditApplications").doc(String(payment.creditApplicationId));
        const applicationSnap = await transaction.get(applicationRef);
        if (!applicationSnap.exists) throw httpError(409, "Credit application not found");
        application = applicationSnap.data();
      }
    } else if (payment.bankTransactionId) {
      bankRef = db.collection("bankTransactions").doc(String(payment.bankTransactionId));
      sourceCreditRef = db.collection("payerCredits").doc(String(payment.bankTransactionId));
      const [bankSnap, creditSnap] = await Promise.all([
        transaction.get(bankRef),
        transaction.get(sourceCreditRef),
      ]);
      if (!bankSnap.exists) throw httpError(409, "Source bank transaction not found");
      bankTransaction = bankSnap.data();
      sourceCredit = creditSnap.exists ? creditSnap.data() : {
        payerKey: bankTransaction.payerKey || "",
        payerName: bankTransaction.payerName || payment.payerName || "",
        bankTransactionId: bankRef.id,
        originalAmountCents: Number(payment.amountCents) || Math.round((Number(payment.amount) || 0) * 100),
        originalAmount: Number(payment.amount) || centsToAmount(Number(payment.amountCents) || 0),
        availableAmountCents: 0,
        availableAmount: 0,
        appliedAmountCents: 0,
        appliedAmount: 0,
        status: "open",
        createdAt: nowIso,
        createdBy: actorData,
      };
    }

    const amountCents = paymentNetAmountCents(payment);
    if (amountCents <= 0) throw httpError(409, "Payment amount is invalid");
    const voidedPayment = {
      ...payment,
      status: "voided",
      voidedAt: nowIso,
      voidedBy: actorData,
      voidReason: cleanReason,
      voidRequestId: mutationId,
    };
    const recalculatedPayments = invoicePayments.map(item =>
      item.id === paymentRef.id ? { ...item, status: "voided" } : item,
    );
    const invoicePatch = invoiceFinancialPatch(invoice, recalculatedPayments, nowIso);
    transaction.set(paymentRef, {
      status: "voided",
      voidedAt: nowIso,
      voidedBy: actorData,
      voidReason: cleanReason,
      voidRequestId: mutationId,
    }, { merge: true });
    transaction.set(invoiceRef, {
      ...invoicePatch,
      ...(invoicePatch.paidAt ? {} : { paidAt: admin.firestore.FieldValue.delete() }),
    }, { merge: true });

    let restoredCreditPatch = null;
    if (sourceCreditRef && sourceCredit) {
      restoredCreditPatch = creditAfterRestoration(
        sourceCredit,
        amountCents,
        nowIso,
        { reverseApplication: Boolean(payment.sourceCreditId) },
      );
      transaction.set(sourceCreditRef, {
        ...sourceCredit,
        ...restoredCreditPatch,
      }, { merge: true });
    }
    if (applicationRef && application) {
      const remainingAmountCents = Math.max(0, (Number(application.amountCents) || 0) - amountCents);
      transaction.set(applicationRef, {
        amountCents: remainingAmountCents,
        amount: centsToAmount(remainingAmountCents),
        activePaymentCount: Math.max(0, (Number(application.activePaymentCount) || application.paymentIds?.length || 0) - 1),
        status: remainingAmountCents === 0 ? "voided" : "partially_voided",
        voidedPaymentIds: admin.firestore.FieldValue.arrayUnion(paymentRef.id),
        updatedAt: nowIso,
      }, { merge: true });
    }
    if (bankRef && bankTransaction) {
      const allocatedAmountCents = Math.max(0, (Number(bankTransaction.allocatedAmountCents) || 0) - amountCents);
      const unappliedAmountCents = Math.max(0, (Number(bankTransaction.unappliedAmountCents) || 0) + amountCents);
      transaction.set(bankRef, {
        allocatedAmountCents,
        allocatedAmount: centsToAmount(allocatedAmountCents),
        unappliedAmountCents,
        unappliedAmount: centsToAmount(unappliedAmountCents),
        activeAllocationCount: Math.max(0, (Number(bankTransaction.activeAllocationCount) || bankTransaction.allocationCount || 0) - 1),
        status: allocatedAmountCents === 0 ? "unapplied" : "partially_allocated",
        updatedAt: nowIso,
      }, { merge: true });
    }

    transaction.create(auditRef, {
      entityType: "payment",
      entityId: paymentRef.id,
      action: "payment.voided",
      paymentId: paymentRef.id,
      invoiceId: invoiceRef.id,
      invoiceNum: invoice.num || payment.invoiceNum || "",
      bankTransactionId: payment.bankTransactionId || "",
      sourceCreditId: payment.sourceCreditId || "",
      creditApplicationId: payment.creditApplicationId || "",
      amount: centsToAmount(amountCents),
      before: {
        paymentStatus: payment.status || "active",
        invoicePaidAmount: Number(invoice.paidAmount) || 0,
        invoiceBalanceDue: invoice.balanceDue ?? (Number(invoice.amount) || 0),
      },
      after: {
        paymentStatus: voidedPayment.status,
        invoicePaidAmount: invoicePatch.paidAmount,
        invoiceBalanceDue: invoicePatch.balanceDue,
        restoredCreditAmount: restoredCreditPatch?.availableAmount ?? null,
      },
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      payment: { id: paymentRef.id, ...voidedPayment },
      invoice: { id: invoiceRef.id, ...invoice, ...invoicePatch },
      restoredCredit: restoredCreditPatch
        ? { id: sourceCreditRef.id, ...sourceCredit, ...restoredCreditPatch }
        : null,
      idempotent: false,
    };
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[ch]));
}

function money(value) {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

function formatEtDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(`${String(isoDate).slice(0, 10)}T12:00:00`).toLocaleDateString("et-EE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

function parseIsoDate(isoDate) {
  const [year, month, day] = String(isoDate || "").slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

function daysBetweenIso(startIso, endIso) {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (start == null || end == null) return Infinity;
  return Math.floor((end - start) / 86400000);
}

function monthKey(isoDate) {
  return String(isoDate || "").slice(0, 7);
}

function invoiceDueDate(baseDate = new Date()) {
  const todayIso = localDate(baseDate, APP_TIME_ZONE);
  const [year, month, day] = todayIso.split("-").map(Number);
  const due = new Date(Date.UTC(year, month - 1, PAYMENT_DETAILS.paymentDueDay, 12));
  if (day > PAYMENT_DETAILS.paymentDueDay) due.setUTCMonth(due.getUTCMonth() + 1);
  return due.toISOString().slice(0, 10);
}

function parseAddress(address) {
  const match = String(address || "").match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (!match) return { email: String(address || "").trim() };
  return { name: match[1].replace(/^"|"$/g, "").trim(), email: match[2].trim() };
}

function firstEmail(...values) {
  const flat = values.flat().map(value => String(value || "").trim()).filter(Boolean);
  return flat.find(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) || "";
}

async function loadInvoice(invoiceId) {
  if (!invoiceId) throw httpError(400, "invoiceId required");
  const ref = db.collection("invoices").doc(String(invoiceId));
  const snap = await ref.get();
  if (!snap.exists) throw httpError(404, "Invoice not found");
  return { id: snap.id, ref, ...snap.data() };
}

async function loadInvoiceStudent(invoice) {
  if (!invoice.studentId) return null;
  const snap = await db.collection("students").doc(String(invoice.studentId)).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

function invoiceRecipient(invoice, student) {
  return firstEmail(
    invoice.email,
    invoice.parentEmail,
    invoice.payerEmail,
    student?.payerEmail,
    student?.parentEmail,
    student?.contactEmail,
    student?.guardianEmail,
    student?.email,
  );
}

function invoiceIsParentTarget(invoice) {
  return invoice?.invoiceTargetType === "parent" || (!invoice?.studentId && Boolean(invoice?.parentUid || invoice?.linkedParentId || invoice?.parentName || invoice?.parentEmail || invoice?.payerName || invoice?.payerEmail));
}

function invoicePartyLabel(invoice, student) {
  if (invoiceIsParentTarget(invoice)) {
    return invoice.parentName || invoice.payerName || invoice.parentEmail || invoice.payerEmail || "lapsevanem";
  }
  return invoice.studentName || student?.name || "õpilane";
}

function composeInvoiceEmail(invoice, student, type = "invoice") {
  const due = invoice.due || invoiceDueDate();
  const reference = invoice.paymentReference || invoice.num || "";
  const partyKind = invoiceIsParentTarget(invoice) ? "Lapsevanem" : "Õpilane";
  const partyName = invoicePartyLabel(invoice, student);
  const desc = invoice.desc || "Keeletunnid";
  const isReminder = type === "reminder" || type === "due10";
  const effectiveAmount = Number(invoice.effectiveAmount ?? invoice.amount) || 0;
  const payableAmount = isReminder
    ? Number(invoice.balanceDue ?? effectiveAmount) || 0
    : effectiveAmount;
  const amount = money(payableAmount);
  const creditedAmount = Number(invoice.creditedAmount) || 0;
  const subject = isReminder
    ? `Meeldetuletus: arve ${invoice.num || ""} tasumine`
    : `Arve ${invoice.num || ""} - KeeleSepp`;
  const intro = type === "due10"
    ? `Tuletame meelde, et arve tasumise tähtaeg on ${PAYMENT_DETAILS.paymentDueDay}. kuupäeval.`
    : isReminder
      ? "Tuletame meelde, et arve on veel tasumata."
      : "Saadame Teile KeeleSepp arve.";
  const lines = [
    "Tere!",
    "",
    intro,
    "",
    `Arve: ${invoice.num || ""}`,
    `${partyKind}: ${partyName}`,
    `Kirjeldus: ${desc}`,
    creditedAmount > 0 ? `Parandused: -${money(creditedAmount)} EUR` : "",
    `${isReminder ? "Tasuda" : "Summa"}: ${amount} EUR`,
    `Tähtaeg: ${formatEtDate(due)}`,
    `Makse selgitus: ${reference}`,
    "",
    `Saaja: ${PAYMENT_DETAILS.company}`,
    `IBAN: ${PAYMENT_DETAILS.iban}`,
    `Pank: ${PAYMENT_DETAILS.bank}`,
    `SWIFT: ${PAYMENT_DETAILS.swift}`,
    "",
    "Aitäh!",
    "KeeleSepp",
  ];
  const correctionRow = creditedAmount > 0
    ? `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Parandused</td><td style="padding:8px;border:1px solid #e5e7eb">-${escapeHtml(money(creditedAmount))} EUR</td></tr>`
    : "";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1C2B3A;line-height:1.5;max-width:640px">
      <h2 style="margin:0 0 12px;color:#1C2B3A">${escapeHtml(subject)}</h2>
      <p>${escapeHtml(intro)}</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#fff">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Arve</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(invoice.num || "")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">${escapeHtml(partyKind)}</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(partyName)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Kirjeldus</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(desc)}</td></tr>
        ${correctionRow}
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">${isReminder ? "Tasuda" : "Summa"}</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(amount)} EUR</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Tähtaeg</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(formatEtDate(due))}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Makse selgitus</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(reference)}</td></tr>
      </table>
      <div style="padding:14px 16px;background:#F9F8F6;border:1px solid #e5e7eb;border-radius:10px">
        <strong>${escapeHtml(PAYMENT_DETAILS.company)}</strong><br>
        IBAN: ${escapeHtml(PAYMENT_DETAILS.iban)}<br>
        ${escapeHtml(PAYMENT_DETAILS.bank)} · SWIFT: ${escapeHtml(PAYMENT_DETAILS.swift)}
      </div>
      <p style="margin-top:18px"><a href="${escapeHtml(APP_BASE_URL)}" style="display:inline-block;background:#2F5D50;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700">Ava KeeleSepp kabinet</a></p>
      <p style="font-size:12px;color:#64748b">Kui makse on juba tehtud, võib seda kirja ignoreerida.</p>
    </div>`;
  return { subject, html, text: lines.join("\n") };
}

async function postJson(url, headers, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
  if (!response.ok) {
    throw new Error(`${response.status}: ${text.slice(0, 300)}`);
  }
  return data;
}

async function deliverEmail(message, context = {}) {
  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const smtpHost = configValue(process.env.SMTP_HOST, SMTP_DEFAULTS.host);
  const smtpUser = configValue(process.env.SMTP_USER, SMTP_DEFAULTS.user);
  const smtpPass = process.env.SMTP_PASS;
  const smtpPortRaw = configValue(process.env.SMTP_PORT, SMTP_DEFAULTS.port);
  const smtpSecureRaw = configValue(process.env.SMTP_SECURE, SMTP_DEFAULTS.secure);
  const smtpSecure = configBool(smtpSecureRaw, Number(smtpPortRaw || 0) === 465);
  const smtpPort = Number(smtpPortRaw || (smtpSecure ? 465 : 587));
  const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass);
  const provider = hasSmtp ? "smtp" : resendKey ? "resend" : sendgridKey ? "sendgrid" : "firestore";
  const from = process.env.MAIL_FROM || SMTP_DEFAULTS.from || MAIL_FROM;
  const replyTo = MAIL_REPLY_TO;
  const ref = db.collection("emailQueue").doc();
  const queueBase = {
    ...context,
    to: message.to,
    from,
    replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
    status: "queued",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (provider === "firestore") {
    await ref.set({ ...queueBase, provider: "firestore" });
    return { status: "queued", provider: "firestore", queueId: ref.id };
  }

  await ref.set({ ...queueBase, status: "sending", provider });
  try {
    let providerId = "";
    if (provider === "smtp") {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      });
      const info = await transporter.sendMail({
        from,
        to: message.to,
        replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      providerId = info.messageId || "";
      await ref.update({ status: "sent", provider: "smtp", providerId, sentAt: admin.firestore.FieldValue.serverTimestamp() });
      return { status: "sent", provider: "smtp", queueId: ref.id, providerId };
    }

    if (provider === "resend") {
      const data = await postJson("https://api.resend.com/emails", {
        Authorization: `Bearer ${resendKey}`,
      }, {
        from,
        to: [message.to],
        reply_to: replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      providerId = data.id || "";
      await ref.update({ status: "sent", provider: "resend", providerId, sentAt: admin.firestore.FieldValue.serverTimestamp() });
      return { status: "sent", provider: "resend", queueId: ref.id, providerId };
    }

    const parsedFrom = parseAddress(from);
    const data = await postJson("https://api.sendgrid.com/v3/mail/send", {
      Authorization: `Bearer ${sendgridKey}`,
    }, {
      personalizations: [{ to: [{ email: message.to }] }],
      from: parsedFrom,
      reply_to: parseAddress(replyTo),
      subject: message.subject,
      content: [
        { type: "text/plain", value: message.text },
        { type: "text/html", value: message.html },
      ],
    });
    providerId = data.id || "";
    await ref.update({ status: "sent", provider: "sendgrid", providerId, sentAt: admin.firestore.FieldValue.serverTimestamp() });
    return { status: "sent", provider: "sendgrid", queueId: ref.id, providerId };
  } catch (e) {
    await ref.update({
      status: "failed",
      error: String(e.message || e).slice(0, 500),
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    throw httpError(502, "Email provider error");
  }
}

async function sendInvoiceMessage(invoiceId, { type = "invoice", actor = null } = {}) {
  const invoice = await loadInvoice(invoiceId);
  if (type !== "invoice" && invoice.status === "Makstud") {
    throw httpError(400, "Invoice is already paid");
  }
  const student = await loadInvoiceStudent(invoice);
  const to = invoiceRecipient(invoice, student);
  if (!to) throw httpError(400, "Recipient email is missing");
  const payload = composeInvoiceEmail(invoice, student, type);
  const nowIso = new Date().toISOString();

  let delivery;
  try {
    delivery = await deliverEmail({ ...payload, to }, {
      type,
      invoiceId: invoice.id,
      invoiceNum: invoice.num || "",
      studentId: invoice.studentId || "",
      studentName: invoice.studentName || student?.name || "",
      invoiceTargetType: invoice.invoiceTargetType || (invoiceIsParentTarget(invoice) ? "parent" : "student"),
      parentUid: invoice.parentUid || invoice.linkedParentId || "",
      parentName: invoice.parentName || invoice.payerName || "",
      parentEmail: invoice.parentEmail || invoice.payerEmail || "",
      createdByUid: actor?.decoded?.uid || "system",
      createdByEmail: actor?.decoded?.email || "system",
    });
  } catch (e) {
    await invoice.ref.update({
      emailStatus: "failed",
      emailLastError: String(e.message || e).slice(0, 300),
      emailUpdatedAt: nowIso,
      emailLastType: type,
    });
    throw e;
  }

  const patch = {
    emailRecipient: to,
    emailStatus: delivery.status,
    emailLastType: type,
    emailUpdatedAt: nowIso,
  };
  if (delivery.status === "sent") patch.emailSentAt = nowIso;
  if (delivery.status === "queued") patch.emailQueuedAt = nowIso;
  if (type === "invoice") patch.invoiceEmailSentAt = nowIso;
  if (type !== "invoice") {
    patch.lastReminderSentAt = nowIso;
    patch.reminderCount = admin.firestore.FieldValue.increment(1);
    if (type === "due10") patch.due10ReminderMonth = monthKey(invoice.due || invoiceDueDate());
  }
  await invoice.ref.update(patch);
  return { ...delivery, to, invoiceId: invoice.id };
}

function shouldSendDue10Reminder(invoice, todayIso, force = false) {
  if (invoice.status === "Makstud") return false;
  if (force) return true;
  const day = Number(todayIso.slice(8, 10));
  const due = String(invoice.due || "");
  const currentMonth = monthKey(todayIso);
  return day >= 1
    && day <= PAYMENT_DETAILS.paymentDueDay
    && due.startsWith(currentMonth)
    && due.endsWith(`-${String(PAYMENT_DETAILS.paymentDueDay).padStart(2, "0")}`)
    && invoice.due10ReminderMonth !== currentMonth;
}

function shouldSendOverdueReminder(invoice, todayIso, force = false) {
  if (invoice.status === "Makstud") return false;
  if (force) return true;
  const due = String(invoice.due || "");
  if (!due || due >= todayIso) return false;
  const last = String(invoice.lastReminderSentAt || "").slice(0, 10);
  return !last || daysBetweenIso(last, todayIso) >= INVOICE_REMINDER_INTERVAL_DAYS;
}

async function sendInvoiceBatch({ type, force = false, actor = null } = {}) {
  const todayIso = localDate(new Date(), APP_TIME_ZONE);
  const snap = await db.collection("invoices").where("status", "==", "Ootel").get();
  const result = { sent: 0, queued: 0, skipped: 0, failed: 0, errors: [] };
  for (const doc of snap.docs) {
    const invoice = { id: doc.id, ...doc.data() };
    const shouldSend = type === "due10"
      ? shouldSendDue10Reminder(invoice, todayIso, force)
      : shouldSendOverdueReminder(invoice, todayIso, force);
    if (!shouldSend) {
      result.skipped++;
      continue;
    }
    try {
      const delivery = await sendInvoiceMessage(doc.id, { type, actor });
      if (delivery.status === "sent") result.sent++;
      else result.queued++;
    } catch (e) {
      result.failed++;
      result.errors.push({ invoiceId: doc.id, error: e.message || String(e) });
    }
  }
  return result;
}

function formatInTimeZone(date, timeZone, fields) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, ...fields })
    .formatToParts(date)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return parts;
}

function localDate(date, timeZone) {
  const parts = formatInTimeZone(date, timeZone, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function localTime(date, timeZone) {
  const parts = formatInTimeZone(date, timeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${parts.hour}:${parts.minute}`;
}

// Normalize name for matching: "Maria Mägi" → "maria magi"
function normalizeName(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

// Extract student name from calendar event title
// Formats supported:
//   "Занятие — Hanna Skoryk"
//   "Tund - Maria Mägi"
//   "Eesti keel / Anna (A2)"
//   "Anna Ivanova eesti keel"
function extractStudentName(title) {
  if (!title) return null;
  // Pattern: dash/em-dash separator
  const dashMatch = title.match(/[—–-]\s*([A-ZÕÄÖÜ][a-zõäöüšž]+(?:\s+[A-ZÕÄÖÜ][a-zõäöüšž]+)*)/u);
  if (dashMatch) return dashMatch[1].trim();
  // Pattern: "Занятие X" or "Tund X"
  const lessonMatch = title.match(/(?:Занятие|Tund|Õppetund|Lesson)\s+([A-ZÕÄÖÜ][a-zõäöüšž]+(?:\s+[A-ZÕÄÖÜ][a-zõäöüšž]+)*)/u);
  if (lessonMatch) return lessonMatch[1].trim();
  // Pattern: starts with two capitalized words = "FirstName LastName ..."
  const nameMatch = title.match(/^([A-ZÕÄÖÜ][a-zõäöüšž]+\s+[A-ZÕÄÖÜ][a-zõäöüšž]+)/u);
  if (nameMatch) return nameMatch[1].trim();
  return null;
}

// (findStudentByName удалена: поиск по имени теперь идёт по кэшу,
// собираемому один раз за прогон в syncTeacherCalendar)

// Convert Google Calendar event to KeeleSepp schedule format
function gcalEventToSchedule(event, teacher, studentId, studentName, teacherUid) {
  const start = event.start?.dateTime || event.start?.date;
  const end   = event.end?.dateTime   || event.end?.date;
  if (!start) return null;

  const startDate = new Date(start);
  const timeZone = event.start?.timeZone || event.end?.timeZone || APP_TIME_ZONE;
  const date = event.start?.date || localDate(startDate, timeZone);
  const time = event.start?.dateTime
    ? localTime(startDate, timeZone)
    : "";

  // Duration in minutes
  let duration = 60;
  if (event.end?.dateTime) {
    duration = Math.round((new Date(end) - startDate) / 60000);
  }

  return {
    gcalEventId:  event.id,
    gcalCalId:    event.calendarId || "primary",
    title:        event.summary || "",
    studentId:    studentId || "",
    studentName:  studentName || extractStudentName(event.summary) || "",
    teacher:      teacher || "",
    teacherFull:  teacher || "",
    teacherUid:   teacherUid || "",
    date,
    time,
    duration,
    notes:        event.description || "",
    status:       "Planeeritud",
    source:       "gcal",
    updatedAt:    new Date().toISOString(),
  };
}

// ── API: invoice emails and reminders ────────────────────────
exports.invoiceApi = functions
  .runWith({ secrets: ["SMTP_PASS"] })
  .https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const path = req.path;
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }

  try {
    const actor = await requireStaffUser(req);

    if (path === "/send") {
      const result = await sendInvoiceMessage(req.body?.invoiceId, { type: "invoice", actor });
      res.json(result);
      return;
    }

    if (path === "/remind") {
      const result = await sendInvoiceMessage(req.body?.invoiceId, { type: "reminder", actor });
      res.json(result);
      return;
    }

    if (path === "/monthly-reminders") {
      const result = await sendInvoiceBatch({ type: "due10", force: Boolean(req.body?.force), actor });
      res.json(result);
      return;
    }

    if (path === "/overdue-reminders") {
      const result = await sendInvoiceBatch({ type: "reminder", force: Boolean(req.body?.force), actor });
      res.json(result);
      return;
    }

    res.status(404).json({ error: "Not found" });
  } catch (e) {
    sendError(res, e);
  }
  });

// ── API: transactional payment register ──────────────────────
// Payment and invoice aggregates are changed in one transaction. Every
// mutation also creates an immutable financialAudit document.
exports.financeApi = functions.https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }

  try {
    const actor = await requireAdminUser(req);
    if (req.path === "/invoices/from-lessons") {
      const result = await createLessonInvoice({
        actor,
        studentId: req.body?.studentId,
        lessonIds: req.body?.lessonIds,
        due: req.body?.due,
        description: req.body?.description,
        paymentReference: req.body?.paymentReference,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/lessons/billing-disposition") {
      const result = await setLessonBillingDisposition({
        actor,
        lessonId: req.body?.lessonId,
        billingStatus: req.body?.billingStatus,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/invoices/credit-lesson-line") {
      const result = await createInvoiceLessonCreditNote({
        actor,
        invoiceId: req.body?.invoiceId,
        lessonId: req.body?.lessonId,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/payments") {
      const result = await recordInvoicePayment({
        actor,
        invoiceId: req.body?.invoiceId,
        amount: req.body?.amount,
        paidAt: req.body?.paidAt,
        method: req.body?.method,
        reference: req.body?.reference,
        note: req.body?.note,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/reset-invoice-payments") {
      const result = await resetInvoicePayments({
        actor,
        invoiceId: req.body?.invoiceId,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.json(result);
      return;
    }
    if (req.path === "/bank-transactions/allocate") {
      const result = await allocateBankTransaction({
        actor,
        requestId: req.body?.requestId,
        externalId: req.body?.externalId,
        paidAt: req.body?.paidAt,
        payerName: req.body?.payerName,
        reference: req.body?.reference,
        amount: req.body?.amount,
        allocations: req.body?.allocations,
        note: req.body?.note,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/payer-credits/apply") {
      const result = await applyPayerCredit({
        actor,
        creditId: req.body?.creditId,
        allocations: req.body?.allocations,
        note: req.body?.note,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/invoices/resolve-overpayment") {
      const result = await transferInvoiceOverpayment({
        actor,
        invoiceId: req.body?.invoiceId,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/payer-credits/refund") {
      const result = await refundPayerCredit({
        actor,
        creditId: req.body?.creditId,
        amount: req.body?.amount,
        refundedAt: req.body?.refundedAt,
        method: req.body?.method,
        reference: req.body?.reference,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/payments/void") {
      const result = await voidSinglePayment({
        actor,
        paymentId: req.body?.paymentId,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.json(result);
      return;
    }
    res.status(404).json({ error: "Not found" });
  } catch (e) {
    sendError(res, e);
  }
});

// ── API: GET /api/gcal/auth-url ───────────────────────────────
exports.gcalApi = functions.https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const path = req.path;

  // ── GET /gcal/auth-url ──────────────────────────────────────
  if (path === "/gcal/auth-url" && req.method === "GET") {
    const uid = req.query.uid;
    if (!uid) { res.status(400).json({ error: "uid required" }); return; }
    try {
      await requireCalendarOwner(req, uid);
      const oauth2 = getOAuthClient();
      const state = crypto.randomBytes(24).toString("hex");
      await db.collection("oauthStates").doc(state).set({
        uid,
        provider: "gcal",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const url = oauth2.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/calendar.readonly"],
        state,
      });
      res.json({ url });
    } catch (e) {
      sendError(res, e);
    }
    return;
  }

  // ── GET /gcal/callback ──────────────────────────────────────
  if (path === "/gcal/callback" && req.method === "GET") {
    const { code, state } = req.query;
    if (!code || !state) { res.status(400).send("Missing code or state"); return; }
    try {
      const stateRef = db.collection("oauthStates").doc(String(state));
      const stateSnap = await stateRef.get();
      if (!stateSnap.exists || stateSnap.data().provider !== "gcal") {
        res.status(400).send("Invalid OAuth state");
        return;
      }
      const { uid } = stateSnap.data();
      await stateRef.delete();
      const oauth2 = getOAuthClient();
      const { tokens } = await oauth2.getToken(code);
      // Save tokens to Firestore under user doc
      await db.collection("users").doc(uid).update({
        gcal: {
          connected: true,
          accessToken:  tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate:   tokens.expiry_date,
          connectedAt:  new Date().toISOString(),
        },
      });
      // Trigger initial sync
      await syncTeacherCalendar(uid, tokens);
      // Redirect back to app
      res.redirect("https://keelesepp.vercel.app/haldus.html?gcal=connected");
    } catch (e) {
      console.error("OAuth callback error:", e);
      res.redirect("https://keelesepp.vercel.app/haldus.html?gcal=error");
    }
    return;
  }

  // ── POST /gcal/sync ─────────────────────────────────────────
  if (path === "/gcal/sync" && req.method === "POST") {
    const { uid } = req.body;
    if (!uid) { res.status(400).json({ error: "uid required" }); return; }
    try {
      await requireCalendarOwner(req, uid);
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists || !userDoc.data().gcal?.refreshToken) {
        res.status(404).json({ error: "Google Calendar not connected" });
        return;
      }
      const result = await syncTeacherCalendar(uid, userDoc.data().gcal);
      res.json({ success: true, synced: result.synced, skipped: result.skipped });
    } catch (e) {
      console.error("Sync error:", e);
      res.status(500).json({ error: e.message });
    }
    return;
  }

  // ── POST /gcal/disconnect ────────────────────────────────────
  if (path === "/gcal/disconnect" && req.method === "POST") {
    const { uid } = req.body;
    if (!uid) { res.status(400).json({ error: "uid required" }); return; }
    try {
      const { profile } = await requireCalendarOwner(req, uid);
      await db.collection("users").doc(uid).update({
        gcal: admin.firestore.FieldValue.delete(),
      });
      // Remove synced events from schedule
      const teacherName = (profile.displayName || "").split(" ")[0] || profile.displayName || "";
      const byUidSnap = await db.collection("schedule")
        .where("source", "==", "gcal")
        .where("teacherUid", "==", uid)
        .get();
      const byNameSnap = teacherName
        ? await db.collection("schedule").where("source", "==", "gcal").where("teacher", "==", teacherName).get()
        : { docs: [] };
      const batch = db.batch();
      const seen = new Set();
      [...byUidSnap.docs, ...byNameSnap.docs].forEach(d => {
        if (seen.has(d.id)) return;
        seen.add(d.id);
        batch.delete(d.ref);
      });
      await batch.commit();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }

  // ── GET /gcal/status ─────────────────────────────────────────
  if (path === "/gcal/status" && req.method === "GET") {
    const uid = req.query.uid;
    if (!uid) { res.status(400).json({ error: "uid required" }); return; }
    try {
      await requireCalendarOwner(req, uid);
      const userDoc = await db.collection("users").doc(uid).get();
      const gcal = userDoc.data()?.gcal || {};
      res.json({
        connected: !!gcal.connected,
        connectedAt: gcal.connectedAt || null,
      });
    } catch (e) {
      sendError(res, e);
    }
    return;
  }

  res.status(404).json({ error: "Not found" });
});

// ── CORE SYNC FUNCTION ────────────────────────────────────────
async function syncTeacherCalendar(uid, tokens) {
  const oauth2 = getOAuthClient();
  oauth2.setCredentials({
    access_token:  tokens.accessToken  || tokens.access_token,
    refresh_token: tokens.refreshToken || tokens.refresh_token,
    expiry_date:   tokens.expiryDate   || tokens.expiry_date,
  });

  // Refresh token if needed and save
  const newTokens = await oauth2.getAccessToken();
  if (newTokens.res?.data?.access_token) {
    await db.collection("users").doc(uid).update({
      "gcal.accessToken": newTokens.res.data.access_token,
      "gcal.expiryDate":  newTokens.res.data.expiry_date,
    });
  }

  const calendar = google.calendar({ version: "v3", auth: oauth2 });

  // Get teacher name from Firestore
  const userDoc = await db.collection("users").doc(uid).get();
  const fullName = userDoc.data()?.displayName || "";
  // Use first name only to match KeeleSepp teacher format (e.g. "Pavel" not "Pavel Zakutailo")
  const teacherName = fullName.split(" ")[0] || fullName;

  // Fetch events: now → 60 days ahead
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

  const eventsResp = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 500,
  });

  const events = eventsResp.data.items || [];
  let synced = 0;
  let skipped = 0;

  // Один запрос студентов на весь прогон вместо чтения на каждое событие
  // (раньше: doc.get() на каждый student:ID + полный скан коллекции на каждый
  // фолбэк по имени — до ~500 событий за прогон).
  const studentsSnap = await db.collection("students").get();
  const studentsById = new Map();
  const studentsByName = new Map(); // normalizedName -> [{...student}]
  for (const doc of studentsSnap.docs) {
    const s = { id: doc.id, ...doc.data() };
    studentsById.set(doc.id, s);
    const key = normalizeName(s.name);
    if (key) {
      if (!studentsByName.has(key)) studentsByName.set(key, []);
      studentsByName.get(key).push(s);
    }
  }
  const findCachedStudentByName = (name) => {
    const candidates = studentsByName.get(normalizeName(name)) || [];
    if (!candidates.length) return null;
    const normTeacher = normalizeName(teacherName);
    return candidates.find(s => normTeacher && normalizeName(s.teacher || "") === normTeacher) || candidates[0];
  };

  const batch = db.batch();

  for (const event of events) {
    // Try to find student ID in event description
    // Format: student:STUDENT_ID anywhere in description
    const description = event.description || "";
    const idMatch = description.match(/student[:\s]+([a-zA-Z0-9]+)/i);
    const studentIdFromDesc = idMatch ? idMatch[1].trim() : null;

    let student = null;

    if (studentIdFromDesc) {
      // Primary: look up by ID from description
      student = studentsById.get(studentIdFromDesc) || null;
    }

    // Fallback: try to extract name from title (legacy support)
    if (!student) {
      const studentName = extractStudentName(event.summary || "");
      if (studentName) {
        student = findCachedStudentByName(studentName);
      }
    }

    // Skip if no student found
    if (!student) { skipped++; continue; }

    const scheduleData = gcalEventToSchedule(
      { ...event, calendarId: "primary" },
      teacherName,
      student.id,
      student.name,
      uid,
    );
    if (!scheduleData) { skipped++; continue; }

    // Upsert by gcalEventId
    const docRef = db.collection("schedule").doc(`gcal_${event.id}`);
    batch.set(docRef, scheduleData, { merge: true });
    synced++;
  }

  await batch.commit();

  // Update last sync time
  await db.collection("users").doc(uid).update({
    "gcal.lastSyncAt": new Date().toISOString(),
    "gcal.lastSyncCount": synced,
  });

  console.log(`Synced ${synced} events for teacher ${teacherName}, skipped ${skipped}`);
  return { synced, skipped };
}

// ── SCHEDULED: sync all connected teachers every hour ─────────
exports.syncAllCalendars = functions.pubsub
  .schedule("every 60 minutes")
  .timeZone(APP_TIME_ZONE)
  .onRun(async () => {
    const snap = await db.collection("users")
      .where("gcal.connected", "==", true)
      .get();

    console.log(`Syncing ${snap.docs.length} connected teachers`);
    for (const doc of snap.docs) {
      try {
        await syncTeacherCalendar(doc.id, doc.data().gcal);
      } catch (e) {
        console.error(`Sync failed for ${doc.id}:`, e.message);
      }
    }
    return null;
  });

// ── SCHEDULED: invoice payment reminders ─────────────────────
exports.sendInvoicePaymentReminders = functions
  .runWith({ secrets: ["SMTP_PASS"] })
  .pubsub
  .schedule("0 9 * * *")
  .timeZone(APP_TIME_ZONE)
  .onRun(async () => {
    const due10 = await sendInvoiceBatch({ type: "due10", force: false });
    const overdue = await sendInvoiceBatch({ type: "reminder", force: false });
    console.log("Invoice reminders", { due10, overdue });
    return null;
  });
