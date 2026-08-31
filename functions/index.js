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
const { FieldValue } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {
  buildCreditNotePdf,
  composeCreditNoteEmail,
  creditNoteFileName,
} = require("./credit-note-document");
const {
  buildInvoicePdf,
  invoiceFileName,
} = require("./invoice-document");
const { invoiceNumberingPlan } = require("./invoice-numbering-core");
const { expenseDocumentRecord, expenseRecord } = require("./expenses-core");
const {
  classifyLessonDataQuality,
  normalizedIdentity,
} = require("./data-quality-core");
const {
  accountantExportArchive,
  billingFingerprint,
  periodCloseProjection,
} = require("./period-close-core");
const { financialAnalyticsSnapshot } = require("./financial-analytics-core");
const {
  buildLessonInvoiceLines,
  centsToAmount,
  creditAfterApplication,
  creditAfterRefund,
  creditAfterRestoration,
  financialPeriodReviewSnapshot,
  invoiceAfterLessonCredit,
  invoiceFinancialPatch,
  invoiceOriginalAmountCents,
  lessonBillingDispositionPatch,
  lessonIsBillable,
  normalizeAllocations,
  normalizeBankDistribution,
  packageBalanceAfterEntry,
  packageBalanceAfterLessonMovement,
  paymentDocumentRecord,
  paymentLineAllocationPlan,
  paymentNetAmountCents,
  planInvoiceOverpaymentTransfer,
  positiveInteger,
  selectBillableLessons,
  selectStudentPackageForLesson,
  tariffAssignmentPlan,
  toCents,
  validIsoDate,
  validIsoMonth,
} = require("./finance-core");
const {
  GOOGLE_SCOPE_EVENTS_OWNED,
  hasCalendarWriteScope,
  normalizeCalendarName,
  extractCalendarStudentName,
  scheduleToGoogleEvent,
  scheduleSyncFingerprint,
  managedGoogleScheduleId,
  isKeeleSeppManagedGoogleEvent,
  isGoogleGoneError,
  googleRecurrenceExcludedDates,
  googleOriginalOccurrenceDate,
  managedGoogleOccurrenceExceptionId,
  googleOccurrenceExceptionSchedule,
  googleNativeExclusionState,
  explicitlyDeletedGoogleEventIds,
  shouldApplyExplicitGoogleDeletion,
} = require("./calendar-sync-core");
const {
  buildOperationalAlerts,
  heartbeatDeltaSeconds,
  hourlyRateCents,
  payAmountCents,
  workDurationMinutes,
} = require("./staff-operations-core");
const { collectTrustedRoles, isDisabledProfile } = require("./auth-core");
const {
  lessonCompletionCounterDelta,
  lessonMutationSignature,
  normalizedLessonStatus,
  scheduleStatusForLesson,
  stableLessonDocumentId,
} = require("./lesson-record-core");
const { planTeacherScopeBackfill } = require("./teacher-scope-core");
const { planTeacherFutureScheduleClear, teacherOwnsRecord } = require("./schedule-clear-core");
const {
  findStudentDuplicateGroups,
  mergeStudentProfileData,
  mergeGroupStudentReferences,
  normalizedStudentMergeInput,
  parentAccountIds,
  studentAccountIds,
  studentMergeOwnership,
  uniqueIds,
} = require("./student-merge-core");

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
  "https://keelesepp-crm-v2.vercel.app",
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

const calendarConnectionRef = uid => db.collection("calendarConnections").doc(uid);
const calendarReturnUrl = status => {
  const separator = APP_BASE_URL.includes("?") ? "&" : "?";
  return `${APP_BASE_URL}${separator}gcal=${encodeURIComponent(status)}`;
};

function publicCalendarMetadata(connection = {}) {
  const writeEnabled = Boolean(
    connection.writeEnabled || hasCalendarWriteScope(connection.grantedScopes),
  );
  return {
    connected: Boolean(connection.connected),
    provider: "google",
    direction: writeEnabled ? "two_way" : "google_to_keelesepp",
    writeEnabled,
    requiresWriteConsent: Boolean(connection.connected) && !writeEnabled,
    connectedAt: connection.connectedAt || null,
    lastSyncAt: connection.lastSyncAt || null,
    lastSyncCount: Number(connection.lastSyncCount || 0),
    lastSyncSkipped: Number(connection.lastSyncSkipped || 0),
    lastSyncRemoved: Number(connection.lastSyncRemoved || 0),
    lastSyncCancelled: Number(connection.lastSyncCancelled || 0),
    lastSyncExceptions: Number(connection.lastSyncExceptions || 0),
    lastSyncError: connection.lastSyncError || "",
    lastPushAt: connection.lastPushAt || null,
    lastPushError: connection.lastPushError || "",
  };
}

async function loadCalendarConnection(uid, { migrateLegacy = true } = {}) {
  const privateRef = calendarConnectionRef(uid);
  const userRef = db.collection("users").doc(uid);
  const privateSnap = await privateRef.get();
  if (privateSnap.exists && privateSnap.data()?.refreshToken) {
    const connection = privateSnap.data();
    if (migrateLegacy) {
      await userRef.set({ gcal: publicCalendarMetadata(connection) }, { merge: true });
    }
    return connection;
  }

  const userSnap = await userRef.get();
  const legacy = userSnap.data()?.gcal || {};
  if (!legacy.refreshToken) return null;

  const migrated = {
    connected: legacy.connected !== false,
    provider: "google",
    accessToken: legacy.accessToken || legacy.access_token || "",
    refreshToken: legacy.refreshToken || legacy.refresh_token || "",
    expiryDate: legacy.expiryDate || legacy.expiry_date || null,
    connectedAt: legacy.connectedAt || new Date().toISOString(),
    lastSyncAt: legacy.lastSyncAt || null,
    lastSyncCount: Number(legacy.lastSyncCount || 0),
    lastSyncSkipped: Number(legacy.lastSyncSkipped || 0),
    lastSyncRemoved: Number(legacy.lastSyncRemoved || 0),
    lastSyncCancelled: Number(legacy.lastSyncCancelled || 0),
    lastSyncExceptions: Number(legacy.lastSyncExceptions || 0),
    lastSyncError: legacy.lastSyncError || "",
    grantedScopes: "",
    writeEnabled: false,
    lastPushAt: null,
    lastPushError: "",
    migratedAt: new Date().toISOString(),
  };
  if (migrateLegacy) {
    await privateRef.set(migrated, { merge: true });
    await userRef.set({ gcal: publicCalendarMetadata(migrated) }, { merge: true });
  }
  return migrated;
}

async function saveCalendarConnection(uid, connection, { merge = true } = {}) {
  let existing = {};
  if (merge) {
    const existingSnap = await calendarConnectionRef(uid).get();
    existing = existingSnap.exists ? existingSnap.data() : {};
  }
  const grantedScopes = connection.grantedScopes || existing.grantedScopes || "";
  const next = {
    ...existing,
    ...connection,
    connected: connection.connected !== false,
    provider: "google",
    grantedScopes,
    writeEnabled: Boolean(
      connection.writeEnabled
      || existing.writeEnabled
      || hasCalendarWriteScope(grantedScopes),
    ),
    updatedAt: new Date().toISOString(),
  };
  await calendarConnectionRef(uid).set(next, { merge });
  await db.collection("users").doc(uid).set({
    gcal: publicCalendarMetadata(next),
  }, { merge: true });
  return next;
}

async function authorizedGoogleCalendar(uid, connection) {
  const oauth2 = getOAuthClient();
  oauth2.setCredentials({
    access_token: connection.accessToken || connection.access_token,
    refresh_token: connection.refreshToken || connection.refresh_token,
    expiry_date: connection.expiryDate || connection.expiry_date,
  });
  const refreshed = await oauth2.getAccessToken();
  if (refreshed.res?.data?.access_token) {
    await calendarConnectionRef(uid).set({
      accessToken: refreshed.res.data.access_token,
      expiryDate: refreshed.res.data.expiry_date || connection.expiryDate || null,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
  return google.calendar({ version: "v3", auth: oauth2 });
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
  if (status >= 500) console.error("Unhandled request error:", err);
  const payload = { error: status >= 500 ? "Internal error" : err.message };
  if (status < 500 && err.details) payload.details = err.details;
  res.status(status).json(payload);
}

async function requireFirebaseUser(req) {
  const header = req.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw httpError(401, "Firebase ID token required");
  try {
    return await admin.auth().verifyIdToken(match[1], true);
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
  if (isDisabledProfile(profile)) throw httpError(403, "Account disabled");
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

async function requireStaffUser(req) {
  const decoded = await requireFirebaseUser(req);
  const snap = await db.collection("users").doc(decoded.uid).get();
  const profile = snap.exists ? snap.data() : {};
  if (isDisabledProfile(profile)) throw httpError(403, "Account disabled");
  const roles = collectTrustedRoles(profile, decoded);
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

async function assertFinancialDateOpen(transaction, value) {
  const date = validIsoDate(String(value || "").slice(0, 10), "financial date");
  const lockSnap = await transaction.get(db.collection("financialLockedDates").doc(date));
  if (lockSnap.exists) throw httpError(409, `Financial period ${date.slice(0, 7)} is closed`);
  return date;
}

async function createTariffVersion({
  actor,
  name,
  unitPrice,
  effectiveFrom,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanName = cleanText(name, 120);
  if (!cleanName) throw httpError(400, "Tariff name required");
  const unitPriceCents = toCents(unitPrice, "tariff unit price");
  const cleanEffectiveFrom = validIsoDate(effectiveFrom, "effectiveFrom");
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    name: cleanName,
    unitPriceCents,
    effectiveFrom: cleanEffectiveFrom,
    billingModel: "per_lesson",
    currency: "EUR",
  })).digest("hex");
  const tariffRef = db.collection("tariffs").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(tariffRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different tariff");
      }
      return { tariff: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    const tariff = {
      name: cleanName,
      billingModel: "per_lesson",
      unitPriceCents,
      unitPrice: centsToAmount(unitPriceCents),
      currency: "EUR",
      effectiveFrom: cleanEffectiveFrom,
      status: "active",
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.create(tariffRef, tariff);
    transaction.create(auditRef, {
      entityType: "tariff",
      entityId: tariffRef.id,
      action: "tariff.version_created",
      tariffId: tariffRef.id,
      tariffName: cleanName,
      unitPriceCents,
      unitPrice: tariff.unitPrice,
      effectiveFrom: cleanEffectiveFrom,
      actor: actorData,
      reason: "Versioned tariff created",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { tariff: { id: tariffRef.id, ...tariff }, idempotent: false };
  });
}

async function assignStudentTariff({
  actor,
  studentId,
  tariffId,
  effectiveFrom,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanStudentId = String(studentId || "").trim();
  const cleanTariffId = String(tariffId || "").trim();
  if (!cleanStudentId) throw httpError(400, "studentId required");
  if (!cleanTariffId) throw httpError(400, "tariffId required");
  const cleanEffectiveFrom = validIsoDate(effectiveFrom, "effectiveFrom");
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    studentId: cleanStudentId,
    tariffId: cleanTariffId,
    effectiveFrom: cleanEffectiveFrom,
  })).digest("hex");
  const assignmentRef = db.collection("studentTariffAssignments").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const studentRef = db.collection("students").doc(cleanStudentId);
  const tariffRef = db.collection("tariffs").doc(cleanTariffId);
  const assignmentsQuery = db.collection("studentTariffAssignments")
    .where("studentId", "==", cleanStudentId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(assignmentRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different tariff assignment");
      }
      return {
        assignment: { id: existing.id, ...existing.data() },
        idempotent: true,
      };
    }
    const [studentSnap, tariffSnap, assignmentsSnap] = await Promise.all([
      transaction.get(studentRef),
      transaction.get(tariffRef),
      transaction.get(assignmentsQuery),
    ]);
    if (!studentSnap.exists) throw httpError(404, "Student not found");
    if (!tariffSnap.exists) throw httpError(404, "Tariff not found");
    const tariff = tariffSnap.data();
    if (tariff.status !== "active" || tariff.billingModel !== "per_lesson") {
      throw httpError(409, "Tariff is not active for per-lesson billing");
    }
    if (cleanEffectiveFrom < tariff.effectiveFrom) {
      throw httpError(409, "Assignment cannot start before the tariff version");
    }
    const existingAssignments = assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let plan;
    try {
      plan = tariffAssignmentPlan(existingAssignments, cleanEffectiveFrom);
    } catch (error) {
      throw httpError(error.status || 409, error.message);
    }
    const student = studentSnap.data();
    const assignment = {
      studentId: cleanStudentId,
      studentName: student.name || "—",
      tariffId: cleanTariffId,
      tariffName: tariff.name || "—",
      billingModel: "per_lesson",
      unitPriceCents: tariff.unitPriceCents,
      unitPrice: tariff.unitPrice,
      currency: tariff.currency || "EUR",
      effectiveFrom: cleanEffectiveFrom,
      effectiveUntil: "",
      status: "active",
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    if (plan.previousAssignmentId) {
      transaction.set(
        db.collection("studentTariffAssignments").doc(plan.previousAssignmentId),
        {
          effectiveUntil: plan.previousEffectiveUntil,
          status: "superseded",
          supersededBy: assignmentRef.id,
          updatedAt: nowIso,
          updatedBy: actorData,
        },
        { merge: true },
      );
    }
    transaction.set(studentRef, {
      latestTariffAssignmentId: assignmentRef.id,
      latestTariffId: cleanTariffId,
      latestTariffName: assignment.tariffName,
      latestTariffUnitPriceCents: assignment.unitPriceCents,
      latestTariffUnitPrice: assignment.unitPrice,
      latestTariffEffectiveFrom: cleanEffectiveFrom,
      tariffUpdatedAt: nowIso,
    }, { merge: true });
    transaction.create(assignmentRef, assignment);
    transaction.create(auditRef, {
      entityType: "student_tariff_assignment",
      entityId: assignmentRef.id,
      action: "student.tariff_assigned",
      studentId: cleanStudentId,
      studentName: assignment.studentName,
      tariffId: cleanTariffId,
      tariffName: assignment.tariffName,
      unitPriceCents: assignment.unitPriceCents,
      unitPrice: assignment.unitPrice,
      effectiveFrom: cleanEffectiveFrom,
      previousAssignmentId: plan.previousAssignmentId,
      previousEffectiveUntil: plan.previousEffectiveUntil,
      actor: actorData,
      reason: "Versioned tariff assigned to student",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      assignment: { id: assignmentRef.id, ...assignment },
      idempotent: false,
    };
  });
}

async function createPackageProduct({
  actor,
  name,
  lessonCredits,
  totalPrice,
  effectiveFrom,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanName = cleanText(name, 120);
  if (!cleanName) throw httpError(400, "Package product name required");
  const credits = positiveInteger(lessonCredits, "lesson credits", 500);
  const priceCents = toCents(totalPrice, "package total price");
  const cleanEffectiveFrom = validIsoDate(effectiveFrom, "effectiveFrom");
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    name: cleanName,
    lessonCredits: credits,
    priceCents,
    effectiveFrom: cleanEffectiveFrom,
    productType: "lesson_package",
    currency: "EUR",
  })).digest("hex");
  const productRef = db.collection("packageProducts").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(productRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different package product");
      }
      return { packageProduct: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    const packageProduct = {
      name: cleanName,
      productType: "lesson_package",
      billingModel: "package",
      lessonCredits: credits,
      priceCents,
      price: centsToAmount(priceCents),
      currency: "EUR",
      effectiveFrom: cleanEffectiveFrom,
      status: "active",
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.create(productRef, packageProduct);
    transaction.create(auditRef, {
      entityType: "package_product",
      entityId: productRef.id,
      action: "package.product_created",
      packageProductId: productRef.id,
      packageProductName: cleanName,
      lessonCredits: credits,
      priceCents,
      price: packageProduct.price,
      effectiveFrom: cleanEffectiveFrom,
      actor: actorData,
      reason: "Immutable lesson package product created",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      packageProduct: { id: productRef.id, ...packageProduct },
      idempotent: false,
    };
  });
}

async function issueStudentPackage({
  actor,
  studentId,
  packageProductId,
  issuedAt,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanStudentId = String(studentId || "").trim();
  const cleanProductId = String(packageProductId || "").trim();
  if (!cleanStudentId) throw httpError(400, "studentId required");
  if (!cleanProductId) throw httpError(400, "packageProductId required");
  const cleanIssuedAt = validIsoDate(issuedAt, "issuedAt");
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    studentId: cleanStudentId,
    packageProductId: cleanProductId,
    issuedAt: cleanIssuedAt,
  })).digest("hex");
  const packageRef = db.collection("studentPackages").doc(mutationId);
  const ledgerRef = db.collection("packageLedger").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const studentRef = db.collection("students").doc(cleanStudentId);
  const productRef = db.collection("packageProducts").doc(cleanProductId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(packageRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different student package");
      }
      return { studentPackage: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    const [studentSnap, productSnap] = await Promise.all([
      transaction.get(studentRef),
      transaction.get(productRef),
    ]);
    if (!studentSnap.exists) throw httpError(404, "Student not found");
    if (!productSnap.exists) throw httpError(404, "Package product not found");
    const product = productSnap.data();
    if (product.status !== "active" || product.productType !== "lesson_package") {
      throw httpError(409, "Package product is not active");
    }
    if (cleanIssuedAt < product.effectiveFrom) {
      throw httpError(409, "Package cannot be issued before the product effective date");
    }
    const student = studentSnap.data();
    const studentPackage = {
      studentId: cleanStudentId,
      studentName: student.name || "—",
      packageProductId: cleanProductId,
      packageProductName: product.name || "—",
      productType: "lesson_package",
      lessonCredits: product.lessonCredits,
      grantedCredits: product.lessonCredits,
      balanceCredits: product.lessonCredits,
      consumedCredits: 0,
      adjustmentCreditCredits: 0,
      adjustmentDebitCredits: 0,
      ledgerEntryCount: 1,
      priceCents: product.priceCents,
      price: product.price,
      currency: product.currency || "EUR",
      productEffectiveFrom: product.effectiveFrom,
      issuedAt: cleanIssuedAt,
      status: "active",
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      updatedAt: nowIso,
      requestId: mutationId,
    };
    const ledgerEntry = {
      studentPackageId: packageRef.id,
      studentId: cleanStudentId,
      studentName: studentPackage.studentName,
      packageProductId: cleanProductId,
      packageProductName: studentPackage.packageProductName,
      entryType: "grant",
      sourceType: "package_issue",
      creditsDelta: product.lessonCredits,
      balanceBefore: 0,
      balanceAfter: product.lessonCredits,
      reason: "Lesson package issued",
      actor: actorData,
      createdAt: nowIso,
      requestId: mutationId,
      creationSignature: signature,
    };
    transaction.create(packageRef, studentPackage);
    transaction.create(ledgerRef, ledgerEntry);
    transaction.create(auditRef, {
      entityType: "student_package",
      entityId: packageRef.id,
      action: "student.package_issued",
      studentPackageId: packageRef.id,
      studentId: cleanStudentId,
      studentName: studentPackage.studentName,
      packageProductId: cleanProductId,
      packageProductName: studentPackage.packageProductName,
      creditsDelta: product.lessonCredits,
      balanceBefore: 0,
      balanceAfter: product.lessonCredits,
      actor: actorData,
      reason: "Lesson package issued from immutable product version",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      studentPackage: { id: packageRef.id, ...studentPackage },
      idempotent: false,
    };
  });
}

async function adjustStudentPackage({
  actor,
  studentPackageId,
  creditsDelta,
  reason,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanPackageId = String(studentPackageId || "").trim();
  if (!cleanPackageId) throw httpError(400, "studentPackageId required");
  const delta = Number(creditsDelta);
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 500) {
    throw httpError(400, "creditsDelta must be a non-zero integer between -500 and 500");
  }
  const cleanReason = cleanText(reason, 500);
  if (!cleanReason) throw httpError(400, "Adjustment reason required");
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    studentPackageId: cleanPackageId,
    creditsDelta: delta,
    reason: cleanReason,
  })).digest("hex");
  const packageRef = db.collection("studentPackages").doc(cleanPackageId);
  const ledgerRef = db.collection("packageLedger").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const [existingEntry, packageSnap] = await Promise.all([
      transaction.get(ledgerRef),
      transaction.get(packageRef),
    ]);
    if (existingEntry.exists) {
      if (existingEntry.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different package movement");
      }
      return {
        ledgerEntry: { id: existingEntry.id, ...existingEntry.data() },
        studentPackage: packageSnap.exists
          ? { id: packageSnap.id, ...packageSnap.data() }
          : null,
        idempotent: true,
      };
    }
    if (!packageSnap.exists) throw httpError(404, "Student package not found");
    const studentPackage = packageSnap.data();
    let movement;
    try {
      movement = packageBalanceAfterEntry(studentPackage, delta, nowIso);
    } catch (error) {
      throw httpError(error.status || 409, error.message);
    }
    const ledgerEntry = {
      studentPackageId: cleanPackageId,
      studentId: studentPackage.studentId || "",
      studentName: studentPackage.studentName || "—",
      packageProductId: studentPackage.packageProductId || "",
      packageProductName: studentPackage.packageProductName || "—",
      entryType: delta > 0 ? "manual_credit" : "manual_debit",
      sourceType: "admin_adjustment",
      creditsDelta: delta,
      balanceBefore: movement.balanceBefore,
      balanceAfter: movement.balanceAfter,
      reason: cleanReason,
      actor: actorData,
      createdAt: nowIso,
      requestId: mutationId,
      creationSignature: signature,
    };
    transaction.set(packageRef, {
      ...movement.accountPatch,
      latestLedgerEntryId: ledgerRef.id,
      latestMovementAt: nowIso,
      latestMovementBy: actorData,
    }, { merge: true });
    transaction.create(ledgerRef, ledgerEntry);
    transaction.create(auditRef, {
      entityType: "student_package",
      entityId: cleanPackageId,
      action: delta > 0 ? "student.package_adjusted_credit" : "student.package_adjusted_debit",
      studentPackageId: cleanPackageId,
      studentId: ledgerEntry.studentId,
      studentName: ledgerEntry.studentName,
      packageProductId: ledgerEntry.packageProductId,
      packageProductName: ledgerEntry.packageProductName,
      creditsDelta: delta,
      balanceBefore: movement.balanceBefore,
      balanceAfter: movement.balanceAfter,
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      ledgerEntry: { id: ledgerRef.id, ...ledgerEntry },
      studentPackage: {
        id: packageRef.id,
        ...studentPackage,
        ...movement.accountPatch,
        latestLedgerEntryId: ledgerRef.id,
        latestMovementAt: nowIso,
        latestMovementBy: actorData,
      },
      idempotent: false,
    };
  });
}

function lessonPackageLedgerEntryId(lessonId, cycle, movement) {
  const hash = crypto.createHash("sha256")
    .update(`${lessonId}:${cycle}:${movement}`)
    .digest("hex")
    .slice(0, 48);
  return `lesson_${hash}`;
}

async function syncLessonPackageConsumption({
  actor,
  lessonId,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanLessonId = String(lessonId || "").trim();
  if (!cleanLessonId) throw httpError(400, "lessonId required");
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    lessonId: cleanLessonId,
    command: "sync_lesson_package_v1",
  })).digest("hex");
  const requestRef = db.collection("lessonPackageSyncRequests").doc(mutationId);
  const lessonRef = db.collection("lessons").doc(cleanLessonId);
  const stateRef = db.collection("lessonPackageStates").doc(cleanLessonId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const [existingRequest, lessonSnap, stateSnap] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(lessonRef),
      transaction.get(stateRef),
    ]);
    if (existingRequest.exists) {
      if (existingRequest.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different lesson package sync");
      }
      return { ...(existingRequest.data().result || {}), idempotent: true };
    }
    if (!lessonSnap.exists) throw httpError(404, "Lesson not found");
    const lesson = lessonSnap.data();
    if (!lessonActorCanWrite(actor, { lesson })) {
      throw httpError(403, "Lesson belongs to another teacher");
    }
    const state = stateSnap.exists ? stateSnap.data() : {};
    const completed = lesson.status === "Toimunud";
    const lessonDate = validIsoDate(lesson.date, "lesson date");
    await assertFinancialDateOpen(transaction, lessonDate);
    const requestRecord = result => ({
      lessonId: cleanLessonId,
      creationSignature: signature,
      result,
      actor: actorData,
      createdAt: nowIso,
      requestId: mutationId,
    });

    if (completed && state.status === "consumed") {
      const result = {
        changed: false,
        status: "consumed",
        lessonId: cleanLessonId,
        studentPackageId: state.studentPackageId || "",
        ledgerEntryId: state.consumptionEntryId || "",
        cycle: Number(state.cycle) || 1,
      };
      transaction.create(requestRef, requestRecord(result));
      return { ...result, idempotent: false };
    }

    if (
      completed
      && (
        String(lesson.invoiceId || "").trim()
        || ["invoiced", "free", "written_off"].includes(lesson.billingStatus)
      )
    ) {
      const result = {
        changed: false,
        status: "not_applicable",
        lessonId: cleanLessonId,
        reason: "Lesson is already invoiced or excluded from billing",
      };
      transaction.create(requestRef, requestRecord(result));
      return { ...result, idempotent: false };
    }

    if (completed) {
      const cleanStudentId = String(lesson.studentId || "").trim();
      if (!cleanStudentId || cleanStudentId === "ext") {
        const result = {
          changed: false,
          status: "not_applicable",
          lessonId: cleanLessonId,
          reason: "Lesson has no registered student",
        };
        transaction.create(requestRef, requestRecord(result));
        return { ...result, idempotent: false };
      }
      const packagesQuery = db.collection("studentPackages")
        .where("studentId", "==", cleanStudentId);
      const packagesSnap = await transaction.get(packagesQuery);
      const packages = packagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let selectedPackage = null;
      let selectionError = "";
      try {
        selectedPackage = selectStudentPackageForLesson(packages, {
          lessonDate,
          requestedPackageId: lesson.requestedStudentPackageId || "",
          preferredPackageId: state.studentPackageId || "",
        });
      } catch (error) {
        selectionError = error.message;
      }
      if (!selectedPackage) {
        const reason = selectionError
          || (packages.length
            ? "No eligible lesson credits remain"
            : "No student package is registered");
        const lessonFields = {
          packageAccountingSource: "package_ledger_v1",
          packageConsumptionStatus: "needs_attention",
          packageSyncError: reason,
          packageSyncedAt: nowIso,
        };
        const result = {
          changed: false,
          status: "needs_attention",
          lessonId: cleanLessonId,
          reason,
          lessonFields,
        };
        transaction.set(lessonRef, lessonFields, { merge: true });
        transaction.set(stateRef, {
          lessonId: cleanLessonId,
          studentId: cleanStudentId,
          status: "needs_attention",
          cycle: Number(state.cycle) || 0,
          lastError: reason,
          updatedAt: nowIso,
          updatedBy: actorData,
        }, { merge: true });
        transaction.create(requestRef, requestRecord(result));
        return { ...result, idempotent: false };
      }

      const cycle = (Number(state.cycle) || 0) + 1;
      let movement;
      try {
        movement = packageBalanceAfterLessonMovement(selectedPackage, "consume", nowIso);
      } catch (error) {
        throw httpError(error.status || 409, error.message);
      }
      const ledgerEntryId = lessonPackageLedgerEntryId(cleanLessonId, cycle, "consume");
      const ledgerRef = db.collection("packageLedger").doc(ledgerEntryId);
      const packageRef = db.collection("studentPackages").doc(selectedPackage.id);
      const ledgerSignature = crypto.createHash("sha256").update(JSON.stringify({
        lessonId: cleanLessonId,
        studentPackageId: selectedPackage.id,
        cycle,
        movement: "consume",
      })).digest("hex");
      const ledgerEntry = {
        studentPackageId: selectedPackage.id,
        studentId: cleanStudentId,
        studentName: lesson.studentName || selectedPackage.studentName || "—",
        packageProductId: selectedPackage.packageProductId || "",
        packageProductName: selectedPackage.packageProductName || "—",
        lessonId: cleanLessonId,
        lessonDate,
        lessonTopic: cleanText(lesson.topic, 200),
        cycle,
        entryType: "lesson_consumption",
        sourceType: "lesson_status",
        creditsDelta: movement.creditsDelta,
        balanceBefore: movement.balanceBefore,
        balanceAfter: movement.balanceAfter,
        reason: "Completed lesson consumed one package credit",
        actor: actorData,
        createdAt: nowIso,
        requestId: mutationId,
        creationSignature: ledgerSignature,
      };
      const lessonFields = {
        packageAccountingSource: "package_ledger_v1",
        packageConsumptionStatus: "consumed",
        packageStudentPackageId: selectedPackage.id,
        packageProductName: selectedPackage.packageProductName || "—",
        packageConsumptionEntryId: ledgerEntryId,
        packageRestorationEntryId: "",
        packageConsumptionCycle: cycle,
        packageSyncError: FieldValue.delete(),
        packageSyncedAt: nowIso,
      };
      transaction.set(packageRef, {
        ...movement.accountPatch,
        latestLedgerEntryId: ledgerEntryId,
        latestMovementAt: nowIso,
        latestMovementBy: actorData,
      }, { merge: true });
      transaction.create(ledgerRef, ledgerEntry);
      transaction.set(stateRef, {
        lessonId: cleanLessonId,
        studentId: cleanStudentId,
        studentPackageId: selectedPackage.id,
        packageProductId: selectedPackage.packageProductId || "",
        packageProductName: selectedPackage.packageProductName || "—",
        status: "consumed",
        cycle,
        consumptionEntryId: ledgerEntryId,
        restorationEntryId: "",
        consumedAt: nowIso,
        restoredAt: "",
        lastError: "",
        updatedAt: nowIso,
        updatedBy: actorData,
      }, { merge: true });
      transaction.set(lessonRef, lessonFields, { merge: true });
      transaction.create(auditRef, {
        entityType: "lesson_package_consumption",
        entityId: ledgerEntryId,
        action: "lesson.package_credit_consumed",
        lessonId: cleanLessonId,
        lessonDate,
        studentId: cleanStudentId,
        studentName: ledgerEntry.studentName,
        studentPackageId: selectedPackage.id,
        packageProductId: ledgerEntry.packageProductId,
        packageProductName: ledgerEntry.packageProductName,
        creditsDelta: movement.creditsDelta,
        balanceBefore: movement.balanceBefore,
        balanceAfter: movement.balanceAfter,
        cycle,
        actor: actorData,
        reason: ledgerEntry.reason,
        createdAt: nowIso,
        requestId: mutationId,
      });
      const result = {
        changed: true,
        status: "consumed",
        lessonId: cleanLessonId,
        studentPackageId: selectedPackage.id,
        ledgerEntryId,
        cycle,
        balanceAfter: movement.balanceAfter,
        lessonFields: {
          ...lessonFields,
          packageSyncError: "",
        },
      };
      transaction.create(requestRef, requestRecord(result));
      return { ...result, idempotent: false };
    }

    if (state.status !== "consumed") {
      const lessonFields = {
        packageAccountingSource: lesson.packageAccountingSource || "",
        packageConsumptionStatus: state.status === "restored" ? "restored" : "not_applicable",
        packageSyncError: FieldValue.delete(),
        packageSyncedAt: nowIso,
      };
      const result = {
        changed: false,
        status: lessonFields.packageConsumptionStatus,
        lessonId: cleanLessonId,
        lessonFields: {
          ...lessonFields,
          packageSyncError: "",
        },
      };
      transaction.set(lessonRef, lessonFields, { merge: true });
      transaction.create(requestRef, requestRecord(result));
      return { ...result, idempotent: false };
    }

    const cleanPackageId = String(state.studentPackageId || "").trim();
    if (!cleanPackageId) throw httpError(409, "Lesson package state has no package reference");
    const packageRef = db.collection("studentPackages").doc(cleanPackageId);
    const packageSnap = await transaction.get(packageRef);
    if (!packageSnap.exists) throw httpError(409, "Consumed lesson package no longer exists");
    const studentPackage = { id: packageSnap.id, ...packageSnap.data() };
    let movement;
    try {
      movement = packageBalanceAfterLessonMovement(studentPackage, "restore", nowIso);
    } catch (error) {
      throw httpError(error.status || 409, error.message);
    }
    const cycle = Number(state.cycle) || 1;
    const ledgerEntryId = lessonPackageLedgerEntryId(cleanLessonId, cycle, "restore");
    const ledgerRef = db.collection("packageLedger").doc(ledgerEntryId);
    const ledgerSignature = crypto.createHash("sha256").update(JSON.stringify({
      lessonId: cleanLessonId,
      studentPackageId: cleanPackageId,
      cycle,
      movement: "restore",
    })).digest("hex");
    const ledgerEntry = {
      studentPackageId: cleanPackageId,
      studentId: studentPackage.studentId || lesson.studentId || "",
      studentName: lesson.studentName || studentPackage.studentName || "—",
      packageProductId: studentPackage.packageProductId || "",
      packageProductName: studentPackage.packageProductName || "—",
      lessonId: cleanLessonId,
      lessonDate,
      lessonTopic: cleanText(lesson.topic, 200),
      cycle,
      entryType: "lesson_restoration",
      sourceType: "lesson_status",
      creditsDelta: movement.creditsDelta,
      balanceBefore: movement.balanceBefore,
      balanceAfter: movement.balanceAfter,
      restoresLedgerEntryId: state.consumptionEntryId || "",
      reason: "Lesson completion reversal restored one package credit",
      actor: actorData,
      createdAt: nowIso,
      requestId: mutationId,
      creationSignature: ledgerSignature,
    };
    const lessonFields = {
      packageAccountingSource: "package_ledger_v1",
      packageConsumptionStatus: "restored",
      packageStudentPackageId: cleanPackageId,
      packageProductName: studentPackage.packageProductName || "—",
      packageRestorationEntryId: ledgerEntryId,
      packageConsumptionCycle: cycle,
      packageSyncError: FieldValue.delete(),
      packageSyncedAt: nowIso,
    };
    transaction.set(packageRef, {
      ...movement.accountPatch,
      latestLedgerEntryId: ledgerEntryId,
      latestMovementAt: nowIso,
      latestMovementBy: actorData,
    }, { merge: true });
    transaction.create(ledgerRef, ledgerEntry);
    transaction.set(stateRef, {
      status: "restored",
      restorationEntryId: ledgerEntryId,
      restoredAt: nowIso,
      lastError: "",
      updatedAt: nowIso,
      updatedBy: actorData,
    }, { merge: true });
    transaction.set(lessonRef, lessonFields, { merge: true });
    transaction.create(auditRef, {
      entityType: "lesson_package_restoration",
      entityId: ledgerEntryId,
      action: "lesson.package_credit_restored",
      lessonId: cleanLessonId,
      lessonDate,
      studentId: ledgerEntry.studentId,
      studentName: ledgerEntry.studentName,
      studentPackageId: cleanPackageId,
      packageProductId: ledgerEntry.packageProductId,
      packageProductName: ledgerEntry.packageProductName,
      creditsDelta: movement.creditsDelta,
      balanceBefore: movement.balanceBefore,
      balanceAfter: movement.balanceAfter,
      cycle,
      restoresLedgerEntryId: state.consumptionEntryId || "",
      actor: actorData,
      reason: ledgerEntry.reason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    const result = {
      changed: true,
      status: "restored",
      lessonId: cleanLessonId,
      studentPackageId: cleanPackageId,
      ledgerEntryId,
      cycle,
      balanceAfter: movement.balanceAfter,
      lessonFields: {
        ...lessonFields,
        packageSyncError: "",
      },
    };
    transaction.create(requestRef, requestRecord(result));
    return { ...result, idempotent: false };
  });
}

function lessonActorCanWrite(actor, { lesson = {}, schedule = {}, student = {} } = {}) {
  if (isSuperAdmin(actor.decoded) || actor.roles.has("admin")) return true;
  const actorUid = String(actor.decoded.uid || "");
  const assignedUids = [lesson.teacherUid, schedule.teacherUid, student.teacherUid]
    .map(value => String(value || "").trim())
    .filter(Boolean);
  if (assignedUids.length) return assignedUids.includes(actorUid);
  const actorName = String(actor.profile.displayName || actor.decoded.name || "").trim().toLowerCase();
  const teacherNames = [lesson.teacher, schedule.teacher, student.teacher]
    .map(value => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  return Boolean(actorName) && teacherNames.some(name =>
    name === actorName || name === actorName.split(" ")[0] || actorName === name.split(" ")[0]
  );
}

function cleanLessonJournalInput(values = {}) {
  const date = validIsoDate(values.date, "lesson date");
  const status = normalizedLessonStatus(values.status);
  const duration = Math.round(Number(values.duration) || 0);
  if (duration < 15 || duration > 480) throw httpError(400, "Lesson duration must be between 15 and 480 minutes");
  const studentId = String(values.studentId || "").trim();
  if (!studentId || studentId === "ext" || values.isGroup) {
    throw httpError(409, "Individual lesson must reference a registered student");
  }
  const attachments = (Array.isArray(values.attachments) ? values.attachments : [])
    .slice(0, 20)
    .map(item => ({
      url: cleanText(item?.url, 2000000),
      name: cleanText(item?.name, 180),
      type: cleanText(item?.type, 160),
      size: Math.max(0, Number(item?.size) || 0),
      uploadedAt: cleanText(item?.uploadedAt, 60),
      ...(item?.inline ? { inline: true } : {}),
    }))
    .filter(item => item.url || item.name);
  const inlinePayloadSize = attachments
    .filter(item => item.inline || String(item.url || "").startsWith("data:"))
    .reduce((sum, item) => sum + String(item.url || "").length, 0);
  if (inlinePayloadSize > 800000) throw httpError(413, "Inline lesson attachments are too large");
  const primary = attachments[0] || {};
  const curriculumLanguageId = cleanText(values.curriculumLanguageId, 10);
  const curriculumSubject = cleanText(values.curriculumSubject, 80);
  const curriculumLevel = cleanText(values.curriculumLevel, 20).toUpperCase();
  const curriculumTopicId = cleanText(values.curriculumTopicId, 180);
  const curriculumTopicName = cleanText(values.curriculumTopicName, 300);
  const curriculumLessonIndex = Math.max(0, Math.min(20, Math.round(Number(values.curriculumLessonIndex) || 0)));
  const curriculumLessonGoal = cleanText(values.curriculumLessonGoal, 1200);
  if (curriculumTopicId) {
    if (!['est', 'eng'].includes(curriculumLanguageId)) throw httpError(400, "Invalid curriculum language");
    if (!['Eesti keel', 'Inglise keel'].includes(curriculumSubject)) throw httpError(400, "Invalid curriculum subject");
    if (!/^[ABC][12]$/.test(curriculumLevel)) throw httpError(400, "Invalid curriculum level");
    if (!curriculumTopicName || !curriculumLessonGoal) throw httpError(400, "Incomplete curriculum lesson link");
    if ((curriculumLanguageId === 'est' && curriculumSubject !== 'Eesti keel')
      || (curriculumLanguageId === 'eng' && curriculumSubject !== 'Inglise keel')) {
      throw httpError(400, "Curriculum language and subject do not match");
    }
  }
  return {
    studentId,
    studentName: cleanText(values.studentName, 180),
    groupId: cleanText(values.groupId, 180),
    groupName: cleanText(values.groupName, 180),
    sourceKey: cleanText(values.sourceKey, 500),
    scheduleId: cleanText(values.scheduleId, 500),
    scheduleTime: cleanText(values.scheduleTime, 20),
    date,
    topic: cleanText(values.topic, 300),
    grade: status === "Toimunud" ? Math.max(0, Math.min(5, Number(values.grade) || 0)) : 0,
    duration,
    status,
    comment: cleanText(values.comment, 4000),
    newWords: cleanText(values.newWords, 4000),
    grammar: cleanText(values.grammar, 4000),
    covered: cleanText(values.covered, 4000),
    nextNotes: cleanText(values.nextNotes, 4000),
    curriculumLanguageId,
    curriculumSubject,
    curriculumLevel,
    curriculumTopicId,
    curriculumTopicName,
    curriculumLessonIndex,
    curriculumLessonGoal,
    teacher: cleanText(values.teacher, 180),
    teacherUid: cleanText(values.teacherUid, 180),
    requestedStudentPackageId: cleanText(values.requestedStudentPackageId, 180),
    fileUrl: cleanText(primary.url || values.fileUrl, 2000000),
    fileName: cleanText(primary.name || values.fileName, 180),
    attachmentUrl: cleanText(primary.url || values.attachmentUrl, 2000000),
    attachmentName: cleanText(primary.name || values.attachmentName, 180),
    attachmentType: cleanText(primary.type || values.attachmentType, 160),
    attachmentSize: Math.max(0, Number(primary.size || values.attachmentSize) || 0),
    attachment: primary.url || primary.name ? primary : null,
    attachments,
  };
}

async function saveLessonJournal({ actor, lessonId, scheduleId, sourceKey, values, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const input = cleanLessonJournalInput({ ...values, scheduleId: scheduleId || values?.scheduleId });
  const cleanScheduleId = String(scheduleId || input.scheduleId || "").trim();
  const cleanSourceKey = String(sourceKey || input.sourceKey || "").trim();
  const requestedLessonId = String(lessonId || "").trim();
  const resolvedLessonId = requestedLessonId || (
    cleanScheduleId || cleanSourceKey
      ? stableLessonDocumentId({ scheduleId: cleanScheduleId || cleanSourceKey, occurrenceDate: input.date, studentId: input.studentId })
      : `journal_${mutationId}`
  );
  if (resolvedLessonId.includes("/")) throw httpError(400, "Invalid lessonId");
  const signature = lessonMutationSignature({
    lessonId: resolvedLessonId,
    scheduleId: cleanScheduleId || cleanSourceKey,
    lesson: input,
  });
  const requestRef = db.collection("lessonJournalRequests").doc(mutationId);
  const lessonRef = db.collection("lessons").doc(resolvedLessonId);
  const studentRef = db.collection("students").doc(input.studentId);
  const scheduleRef = cleanScheduleId ? db.collection("schedule").doc(cleanScheduleId) : null;
  const packagesQuery = db.collection("studentPackages").where("studentId", "==", input.studentId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  const saved = await db.runTransaction(async transaction => {
    const [requestSnap, lessonSnap, studentSnap, scheduleSnap, packagesSnap] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(lessonRef),
      transaction.get(studentRef),
      scheduleRef ? transaction.get(scheduleRef) : Promise.resolve(null),
      transaction.get(packagesQuery),
    ]);
    if (requestSnap.exists) {
      if (requestSnap.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for another lesson update");
      }
      return { ...(requestSnap.data().result || {}), idempotent: true };
    }
    if (!studentSnap.exists) throw httpError(404, "Student not found");
    const previous = lessonSnap.exists ? lessonSnap.data() : {};
    const student = studentSnap.data();
    const schedule = scheduleSnap?.exists ? scheduleSnap.data() : {};
    if (requestedLessonId && !lessonSnap.exists) throw httpError(404, "Lesson not found");
    if (cleanScheduleId && !scheduleSnap?.exists) throw httpError(404, "Schedule entry not found");
    if (schedule.studentId && schedule.studentId !== input.studentId) {
      throw httpError(409, "Schedule entry belongs to another student");
    }
    if (!lessonActorCanWrite(actor, { lesson: previous, schedule, student })) {
      throw httpError(403, "Lesson belongs to another teacher");
    }
    const protectedBilling = String(previous.invoiceId || "").trim()
      || ["invoiced", "paid_directly", "free", "written_off", "credited"].includes(previous.billingStatus);
    if (protectedBilling && (
      previous.studentId !== input.studentId
      || previous.date !== input.date
      || previous.status !== input.status
    )) {
      throw httpError(409, "Billed lesson basis cannot be changed");
    }
    await assertFinancialDateOpen(transaction, input.date);
    if (previous.date && previous.date !== input.date) await assertFinancialDateOpen(transaction, previous.date);

    const ledgerManaged = !packagesSnap.empty
      || previous.packageAccountingSource === "package_ledger_v1";
    const counterDelta = ledgerManaged
      ? 0
      : lessonCompletionCounterDelta(previous.status, input.status);
    const nextBillingStatus = protectedBilling
      ? previous.billingStatus || ""
      : input.status === "Toimunud" ? "unbilled" : "";
    const lesson = {
      ...input,
      scheduleId: cleanScheduleId,
      sourceKey: cleanSourceKey,
      teacher: input.teacher || schedule.teacher || student.teacher || actorData.name,
      teacherUid: input.teacherUid || schedule.teacherUid || student.teacherUid || actor.decoded.uid,
      billingStatus: nextBillingStatus,
      accountingSource: "lesson_journal_v2",
      submittedAt: nowIso,
      submittedAtIso: nowIso,
      updatedAt: nowIso,
      updatedBy: actorData,
      ...(lessonSnap.exists ? {} : { createdAt: nowIso, createdBy: actorData }),
      ...(ledgerManaged ? {
        packageAccountingSource: "package_ledger_v1",
        packageConsumptionStatus: "pending",
        packageSyncError: "",
      } : {}),
    };
    transaction.set(lessonRef, lesson, { merge: true });
    if (scheduleRef) {
      const scheduleStatus = scheduleStatusForLesson(input.status);
      const schedulePatch = schedule.recurring && !schedule.date
        ? {
            occurrenceStatuses: {
              ...(schedule.occurrenceStatuses || {}),
              [input.date]: {
                status: scheduleStatus,
                lessonEntryId: resolvedLessonId,
                updatedAt: nowIso,
              },
            },
            lessonUpdatedAt: nowIso,
          }
        : {
            status: scheduleStatus,
            lessonEntryId: resolvedLessonId,
            lessonOccurrenceDate: input.date,
            lessonUpdatedAt: nowIso,
          };
      transaction.set(scheduleRef, schedulePatch, { merge: true });
    }
    if (counterDelta !== 0) {
      transaction.set(studentRef, {
        packageUsed: Math.max(0, (Number(student.packageUsed) || 0) + counterDelta),
        lessonsSinceInvoice: Math.max(0, (Number(student.lessonsSinceInvoice) || 0) + counterDelta),
        lessonAccountingUpdatedAt: nowIso,
      }, { merge: true });
    }
    const result = {
      lesson: { id: resolvedLessonId, ...previous, ...lesson },
      lessonId: resolvedLessonId,
      scheduleId: cleanScheduleId,
      scheduleStatus: scheduleStatusForLesson(input.status),
      counterDelta,
      ledgerManaged,
    };
    const requestResult = {
      lessonId: resolvedLessonId,
      scheduleId: cleanScheduleId,
      scheduleStatus: result.scheduleStatus,
      counterDelta,
      ledgerManaged,
    };
    transaction.create(requestRef, {
      creationSignature: signature,
      requestId: mutationId,
      actor: actorData,
      createdAt: nowIso,
      result: requestResult,
    });
    return { ...result, idempotent: false };
  });

  if (!saved.lesson) {
    const lessonSnap = await lessonRef.get();
    if (!lessonSnap.exists) throw httpError(409, "Saved lesson no longer exists");
    saved.lesson = { id: lessonSnap.id, ...lessonSnap.data() };
  }
  if (saved.ledgerManaged) {
    try {
      const packageResult = await syncLessonPackageConsumption({
        actor,
        lessonId: saved.lessonId,
        requestId: `${mutationId}_package`,
      });
      const lessonFields = packageResult.lessonFields || {};
      return {
        ...saved,
        lesson: { ...saved.lesson, ...lessonFields },
        packageSync: packageResult,
      };
    } catch (error) {
      const message = cleanText(error.message || "Package sync failed", 500);
      await lessonRef.set({
        packageAccountingSource: "package_ledger_v1",
        packageConsumptionStatus: "needs_attention",
        packageSyncError: message,
        packageSyncedAt: nowIso,
      }, { merge: true });
      return {
        ...saved,
        lesson: {
          ...saved.lesson,
          packageAccountingSource: "package_ledger_v1",
          packageConsumptionStatus: "needs_attention",
          packageSyncError: message,
        },
        packageSync: { status: "needs_attention", reason: message },
      };
    }
  }
  return saved;
}

async function deleteLessonJournal({ actor, lessonId, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanLessonId = String(lessonId || "").trim();
  if (!cleanLessonId || cleanLessonId.includes("/")) throw httpError(400, "Valid lessonId required");
  const signature = crypto.createHash("sha256")
    .update(JSON.stringify({ action: "lesson.delete", lessonId: cleanLessonId }))
    .digest("hex");
  const lessonRef = db.collection("lessons").doc(cleanLessonId);
  const requestRef = db.collection("lessonJournalRequests").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const [requestSnap, lessonSnap] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(lessonRef),
    ]);
    if (requestSnap.exists) {
      if (requestSnap.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for another lesson operation");
      }
      return { ...(requestSnap.data().result || {}), idempotent: true };
    }
    if (!lessonSnap.exists) throw httpError(404, "Lesson not found");
    const lesson = lessonSnap.data();
    const studentRef = lesson.studentId && lesson.studentId !== "ext"
      ? db.collection("students").doc(lesson.studentId)
      : null;
    const scheduleRef = lesson.scheduleId
      ? db.collection("schedule").doc(lesson.scheduleId)
      : null;
    const [studentSnap, scheduleSnap] = await Promise.all([
      studentRef ? transaction.get(studentRef) : Promise.resolve(null),
      scheduleRef ? transaction.get(scheduleRef) : Promise.resolve(null),
    ]);
    const student = studentSnap?.exists ? studentSnap.data() : {};
    const schedule = scheduleSnap?.exists ? scheduleSnap.data() : {};
    if (!lessonActorCanWrite(actor, { lesson, schedule, student })) {
      throw httpError(403, "Lesson belongs to another teacher");
    }
    if (lesson.invoiceId || lesson.billingStatus) {
      throw httpError(409, "Lesson has a financial status and cannot be deleted");
    }
    if (["consumed", "needs_attention"].includes(lesson.packageConsumptionStatus)) {
      throw httpError(409, "Lesson package movement must be resolved before deletion");
    }
    await assertFinancialDateOpen(transaction, lesson.date);

    const counterDelta = lesson.status === "Toimunud"
      && lesson.packageAccountingSource !== "package_ledger_v1"
      ? -1
      : 0;
    if (studentRef && studentSnap?.exists && counterDelta) {
      transaction.set(studentRef, {
        packageUsed: Math.max(0, (Number(student.packageUsed) || 0) + counterDelta),
        lessonsSinceInvoice: Math.max(0, (Number(student.lessonsSinceInvoice) || 0) + counterDelta),
        lessonAccountingUpdatedAt: nowIso,
      }, { merge: true });
    }
    if (scheduleRef && scheduleSnap?.exists) {
      if (schedule.recurring && !schedule.date && lesson.date) {
        const occurrenceStatuses = { ...(schedule.occurrenceStatuses || {}) };
        delete occurrenceStatuses[lesson.date];
        transaction.set(scheduleRef, { occurrenceStatuses, lessonUpdatedAt: nowIso }, { merge: true });
      } else if (!schedule.lessonEntryId || schedule.lessonEntryId === cleanLessonId) {
        transaction.set(scheduleRef, {
          status: "Planeeritud",
          lessonEntryId: "",
          lessonOccurrenceDate: "",
          lessonUpdatedAt: nowIso,
        }, { merge: true });
      }
    }
    transaction.delete(lessonRef);
    const result = {
      deleted: true,
      lessonId: cleanLessonId,
      scheduleId: lesson.scheduleId || "",
      counterDelta,
    };
    transaction.create(auditRef, {
      entityType: "lesson",
      entityId: cleanLessonId,
      action: "lesson.deleted",
      studentId: lesson.studentId || "",
      studentName: lesson.studentName || "",
      lessonDate: lesson.date || "",
      lessonStatus: lesson.status || "",
      scheduleId: lesson.scheduleId || "",
      actor: actorData,
      reason: "Unbilled diary entry deleted",
      createdAt: nowIso,
      requestId: mutationId,
    });
    transaction.create(requestRef, {
      creationSignature: signature,
      requestId: mutationId,
      actor: actorData,
      createdAt: nowIso,
      result,
    });
    return { ...result, idempotent: false };
  });
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
  const tariffAssignmentsQuery = db.collection("studentTariffAssignments")
    .where("studentId", "==", cleanStudentId);
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
    const [studentSnap, counterSnap, studentLessonsSnap, tariffAssignmentsSnap] = await Promise.all([
      transaction.get(studentRef),
      transaction.get(counterRef),
      transaction.get(studentLessonsQuery),
      transaction.get(tariffAssignmentsQuery),
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
    for (const date of [...new Set([todayIso, ...selectedLessons.map(lesson => lesson.date)])]) {
      await assertFinancialDateOpen(transaction, date);
    }
    const lessonPrice = Number(student.lessonPrice) || 0;
    const tariffAssignments = tariffAssignmentsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }));
    const lessonData = buildLessonInvoiceLines(
      selectedLessons,
      lessonPrice,
      tariffAssignments,
    );
    let nextSequence = (Number(counterSnap.data()?.seq) || 0) + 1;
    let invoiceNum = "";
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = `KS-${todayIso.slice(0, 4)}-${String(nextSequence).padStart(3, "0")}`;
      const collision = await transaction.get(
        db.collection("invoices").where("num", "==", candidate).limit(1),
      );
      if (collision.empty) {
        invoiceNum = candidate;
        break;
      }
      nextSequence += 1;
    }
    if (!invoiceNum) throw httpError(409, "Invoice counter requires numbering repair");
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
      desc: cleanDescription || (
        lessonData.lessonPrice > 0
          ? `${lessonData.lessonCount} keeletundi x ${lessonData.lessonPrice}€`
          : `${lessonData.lessonCount} keeletundi tariifide järgi`
      ),
      lessonCount: lessonData.lessonCount,
      lessonPrice: lessonData.lessonPrice,
      lessonPriceCents: lessonData.lessonPriceCents,
      lessonIds: lessonData.lessonIds,
      lines: lessonData.lines,
      lineVersion: lessonData.tariffAssignmentIds.length ? 2 : 1,
      billingMode: "lesson_lines_v1",
      pricingMode: lessonData.pricingMode,
      tariffIds: lessonData.tariffIds,
      tariffAssignmentIds: lessonData.tariffAssignmentIds,
      autoGenerated: true,
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };

    transaction.create(invoiceRef, invoice);
    transaction.set(counterRef, { seq: nextSequence, updatedAt: nowIso }, { merge: true });
    const lineByLessonId = new Map(
      lessonData.lines.map((line, index) => [line.lessonId, { line, index }]),
    );
    lessonRefs.forEach(ref => {
      const pricedLine = lineByLessonId.get(ref.id);
      transaction.set(ref, {
        billingStatus: "invoiced",
        invoiceId: invoiceRef.id,
        invoiceNum,
        invoiceLineIndex: pricedLine.index,
        billedAmountCents: pricedLine.line.amountCents,
        billedAmount: pricedLine.line.amount,
        pricingSource: pricedLine.line.pricingSource,
        ...(pricedLine.line.tariffId ? { billedTariffId: pricedLine.line.tariffId } : {}),
        ...(pricedLine.line.tariffName
          ? { billedTariffName: pricedLine.line.tariffName }
          : {}),
        ...(pricedLine.line.tariffAssignmentId
          ? { billedTariffAssignmentId: pricedLine.line.tariffAssignmentId }
          : {}),
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
      pricingMode: lessonData.pricingMode,
      tariffIds: lessonData.tariffIds,
      tariffAssignmentIds: lessonData.tariffAssignmentIds,
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
    await assertFinancialDateOpen(transaction, lesson.date);

    const lessonPatch = {
      billingDispositionReason: cleanReason,
      billingUpdatedAt: nowIso,
      billingUpdatedBy: actorData,
    };
    if (disposition.billingStatus === null) {
      lessonPatch.billingStatus = FieldValue.delete();
      lessonPatch.billingDispositionReason = FieldValue.delete();
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
        resolutionIds: FieldValue.arrayUnion(mutationId),
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
        studentId: invoice.studentId || "",
        studentName: invoice.studentName || "",
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
        overpaymentResolutionIds: FieldValue.arrayUnion(mutationId),
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
      overpaymentResolutionIds: FieldValue.arrayUnion(mutationId),
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
    await assertFinancialDateOpen(transaction, refundDate);
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
      refundIds: FieldValue.arrayUnion(mutationId),
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
    await assertFinancialDateOpen(transaction, line.date || lesson.date);
    await assertFinancialDateOpen(transaction, todayIso);

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
      payerEmail: invoice.payerEmail || invoice.parentEmail || "",
      payerRegCode: invoice.payerRegCode || "",
      payerAddress: invoice.payerAddress || invoice.parentAddress || "",
      issuer: {
        company: PAYMENT_DETAILS.company,
        regCode: PAYMENT_DETAILS.regCode,
        email: PAYMENT_DETAILS.email,
      },
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
      creditNoteIds: FieldValue.arrayUnion(mutationId),
      corrections: FieldValue.arrayUnion(correction),
      ...(financialPatch.paidAt ? {} : { paidAt: FieldValue.delete() }),
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
    await assertFinancialDateOpen(transaction, paymentDate);
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

async function attachPaymentDocument({
  actor,
  paymentId,
  storagePath,
  fileName,
  contentType,
  size,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanPaymentId = String(paymentId || "").trim();
  const paymentRef = db.collection("payments").doc(cleanPaymentId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  const document = {
    ...paymentDocumentRecord({
      paymentId: cleanPaymentId,
      documentId: mutationId,
      storagePath,
      fileName,
      contentType,
      size,
      uploadedAt: nowIso,
    }),
    uploadedBy: actorData,
  };

  return db.runTransaction(async transaction => {
    const auditSnap = await transaction.get(auditRef);
    const paymentSnap = await transaction.get(paymentRef);
    if (!paymentSnap.exists) throw httpError(404, "Payment not found");
    const payment = paymentSnap.data();
    if (auditSnap.exists) {
      const audit = auditSnap.data();
      if (
        audit.action !== "payment.document_attached"
        || audit.paymentId !== cleanPaymentId
        || audit.documentId !== mutationId
        || audit.storagePath !== document.storagePath
      ) {
        throw httpError(409, "requestId already used for a different financial mutation");
      }
      return {
        payment: { id: paymentSnap.id, ...payment },
        document,
        idempotent: true,
      };
    }
    if (payment.status === "voided") {
      throw httpError(409, "Cannot attach a document to a voided payment");
    }
    await assertFinancialDateOpen(
      transaction,
      String(payment.paidAt || payment.createdAt || nowIso).slice(0, 10),
    );

    const documents = Array.isArray(payment.documents) ? payment.documents : [];
    if (documents.length >= 20) {
      throw httpError(409, "A payment can have at most 20 accounting documents");
    }
    if (documents.some(item => item?.id === mutationId || item?.storagePath === document.storagePath)) {
      throw httpError(409, "Payment document already attached");
    }
    const nextDocuments = [...documents, document];
    transaction.update(paymentRef, {
      documents: nextDocuments,
      documentCount: nextDocuments.length,
      documentsUpdatedAt: nowIso,
    });
    transaction.create(auditRef, {
      entityType: "payment",
      entityId: cleanPaymentId,
      invoiceId: payment.invoiceId || "",
      invoiceNum: payment.invoiceNum || "",
      paymentId: cleanPaymentId,
      documentId: mutationId,
      storagePath: document.storagePath,
      fileName: document.fileName,
      contentType: document.contentType,
      size: document.size,
      action: "payment.document_attached",
      beforeDocumentCount: documents.length,
      afterDocumentCount: nextDocuments.length,
      actor: actorData,
      reason: "Payment order attached for accounting",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      payment: {
        id: paymentSnap.id,
        ...payment,
        documents: nextDocuments,
        documentCount: nextDocuments.length,
        documentsUpdatedAt: nowIso,
      },
      document,
      idempotent: false,
    };
  });
}

async function savePaymentLineAllocation({
  actor,
  paymentId,
  allocations,
  effectiveDate,
  reason,
  requestId,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanPaymentId = String(paymentId || "").trim();
  if (!cleanPaymentId) throw httpError(400, "paymentId required");
  const allocationInput = (Array.isArray(allocations) ? allocations : []).map(item => ({
    lessonId: String(item?.lessonId || "").trim(),
    amount: Number(item?.amount),
  }));
  const cleanEffectiveDate = validIsoDate(effectiveDate, "effectiveDate");
  const cleanReason = cleanText(reason);
  const requestSignature = crypto.createHash("sha256").update(JSON.stringify({
    paymentId: cleanPaymentId,
    allocations: allocationInput,
    effectiveDate: cleanEffectiveDate,
    reason: cleanReason,
  })).digest("hex");
  const allocationRef = db.collection("paymentLineAllocations").doc(mutationId);
  const paymentRef = db.collection("payments").doc(cleanPaymentId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(allocationRef);
    if (existing.exists) {
      const data = existing.data();
      if (data.requestSignature !== requestSignature) {
        throw httpError(409, "requestId already used for a different payment allocation");
      }
      return { allocation: { id: existing.id, ...data }, idempotent: true };
    }
    const paymentSnap = await transaction.get(paymentRef);
    if (!paymentSnap.exists) throw httpError(404, "Payment not found");
    const payment = { id: paymentSnap.id, ...paymentSnap.data() };
    const invoiceRef = db.collection("invoices").doc(String(payment.invoiceId || ""));
    const invoiceSnap = await transaction.get(invoiceRef);
    if (!invoiceSnap.exists) throw httpError(404, "Invoice not found");
    const invoice = { id: invoiceSnap.id, ...invoiceSnap.data() };
    const invoicePayments = await activeInvoicePayments(transaction, invoice.id);
    const allocationIds = [...new Set(invoicePayments
      .filter(item => item.status !== "voided" && item.lineAllocationId)
      .map(item => String(item.lineAllocationId)))];
    const allocationSnaps = await Promise.all(allocationIds.map(id =>
      transaction.get(db.collection("paymentLineAllocations").doc(id)),
    ));
    const currentAllocationById = new Map(
      allocationSnaps.filter(snap => snap.exists).map(snap => [
        snap.id,
        { id: snap.id, ...snap.data() },
      ]),
    );
    const previousAllocation = payment.lineAllocationId
      ? currentAllocationById.get(String(payment.lineAllocationId)) || null
      : null;
    if (payment.lineAllocationId && !previousAllocation) {
      throw httpError(409, "Current payment allocation version is missing");
    }
    if (
      previousAllocation
      && (
        String(previousAllocation.paymentId || "") !== payment.id
        || String(previousAllocation.invoiceId || "") !== invoice.id
        || Number(previousAllocation.version || 0) !== Number(payment.lineAllocationVersion || 0)
      )
    ) {
      throw httpError(409, "Current payment allocation pointer is invalid");
    }
    const allocatedByLesson = {};
    invoicePayments
      .filter(item =>
        item.id !== payment.id
        && item.status !== "voided"
        && paymentNetAmountCents(item) > 0
        && item.lineAllocationId,
      )
      .forEach(item => {
        const current = currentAllocationById.get(String(item.lineAllocationId));
        if (
          !current
          || String(current.paymentId || "") !== String(item.id)
          || String(current.invoiceId || "") !== invoice.id
          || Number(current.version || 0) !== Number(item.lineAllocationVersion || 0)
        ) {
          throw httpError(409, "Another payment has an invalid allocation pointer");
        }
        (Array.isArray(current.lines) ? current.lines : []).forEach(line => {
          const lessonId = String(line?.lessonId || "");
          allocatedByLesson[lessonId] = (allocatedByLesson[lessonId] || 0)
            + Math.max(0, Number(line?.allocatedAmountCents) || 0);
        });
      });
    const plan = paymentLineAllocationPlan({
      payment,
      invoice,
      allocations: allocationInput,
      allocatedByLesson,
      effectiveDate: cleanEffectiveDate,
      reason: cleanReason,
      previousAllocation,
    });
    await assertFinancialDateOpen(transaction, cleanEffectiveDate);
    const allocation = {
      paymentId: payment.id,
      invoiceId: invoice.id,
      invoiceNum: invoice.num || "",
      studentId: invoice.studentId || payment.studentId || "",
      studentName: invoice.studentName || payment.studentName || "",
      allocationMethod: "explicit_invoice_lines_v1",
      version: plan.version,
      supersedesAllocationId: plan.supersedesAllocationId,
      effectiveDate: plan.effectiveDate,
      reason: plan.reason,
      paymentAmountCents: plan.paymentAmountCents,
      paymentAmount: centsToAmount(plan.paymentAmountCents),
      allocatedAmountCents: plan.allocatedAmountCents,
      allocatedAmount: centsToAmount(plan.allocatedAmountCents),
      unallocatedAmountCents: plan.unallocatedAmountCents,
      unallocatedAmount: centsToAmount(plan.unallocatedAmountCents),
      lines: plan.lines,
      requestSignature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.create(allocationRef, allocation);
    transaction.update(paymentRef, {
      lineAllocationId: mutationId,
      lineAllocationVersion: plan.version,
      lineAllocatedAmountCents: plan.allocatedAmountCents,
      lineAllocatedAmount: centsToAmount(plan.allocatedAmountCents),
      lineUnallocatedAmountCents: plan.unallocatedAmountCents,
      lineUnallocatedAmount: centsToAmount(plan.unallocatedAmountCents),
      allocationMethod: "explicit_invoice_lines_v1",
      lineAllocationUpdatedAt: nowIso,
    });
    transaction.create(auditRef, {
      entityType: "payment_line_allocation",
      entityId: mutationId,
      paymentId: payment.id,
      invoiceId: invoice.id,
      invoiceNum: invoice.num || "",
      action: previousAllocation
        ? "payment.line_allocation_corrected"
        : "payment.line_allocation_created",
      version: plan.version,
      supersedesAllocationId: plan.supersedesAllocationId,
      effectiveDate: plan.effectiveDate,
      before: previousAllocation ? {
        allocationId: previousAllocation.id,
        version: previousAllocation.version,
        allocatedAmountCents: previousAllocation.allocatedAmountCents,
        unallocatedAmountCents: previousAllocation.unallocatedAmountCents,
        lines: previousAllocation.lines,
      } : null,
      after: {
        allocationId: mutationId,
        version: plan.version,
        allocatedAmountCents: plan.allocatedAmountCents,
        unallocatedAmountCents: plan.unallocatedAmountCents,
        lines: plan.lines,
      },
      actor: actorData,
      reason: plan.reason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      allocation: { id: mutationId, ...allocation },
      payment: {
        ...payment,
        lineAllocationId: mutationId,
        lineAllocationVersion: plan.version,
        lineAllocatedAmountCents: plan.allocatedAmountCents,
        lineUnallocatedAmountCents: plan.unallocatedAmountCents,
        allocationMethod: "explicit_invoice_lines_v1",
      },
      idempotent: false,
    };
  });
}

async function previewFinancialPeriod({ month }) {
  const reviewMonth = validIsoMonth(month);
  const [invoiceSnap, paymentSnap, bankSnap, creditSnap, lessonSnap, lineAllocationSnap,
    periodSnap, workSessionSnap, expenseSnap, creditApplicationSnap, refundSnap,
    correctionSnap, exportSnap] =
    await Promise.all([
      db.collection("invoices").get(),
      db.collection("payments").get(),
      db.collection("bankTransactions").get(),
      db.collection("payerCredits").get(),
      db.collection("lessons").get(),
      db.collection("paymentLineAllocations").get(),
      db.collection("financialPeriods").doc(reviewMonth).get(),
      db.collection("workSessions").get(),
      db.collection("expenses").get(),
      db.collection("creditApplications").get(),
      db.collection("refunds").get(),
      db.collection("financialPeriodCorrections").get(),
      db.collection("financialPeriodExports").where("month", "==", reviewMonth).get(),
    ]);
  const withIds = snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const data = {
    invoices: withIds(invoiceSnap),
    payments: withIds(paymentSnap),
    bankTransactions: withIds(bankSnap),
    payerCredits: withIds(creditSnap),
    lessons: withIds(lessonSnap),
    paymentLineAllocations: withIds(lineAllocationSnap),
    workSessions: withIds(workSessionSnap),
    expenses: withIds(expenseSnap),
    creditApplications: withIds(creditApplicationSnap),
    refunds: withIds(refundSnap),
    corrections: withIds(correctionSnap),
  };
  const exports = withIds(exportSnap).sort((a, b) => String(b.generatedAt || "").localeCompare(String(a.generatedAt || "")));
  const latestExport = exports[0] || null;
  const closeSnapshot = periodCloseProjection({
    month: reviewMonth,
    period: periodSnap.exists ? periodSnap.data() : {},
    ...data,
    latestExport,
  });
  const { evidence: _billingEvidence, ...billingSnapshot } = closeSnapshot.billing;
  return {
    snapshot: billingSnapshot,
    closeSnapshot: {
      ...closeSnapshot,
      billing: billingSnapshot,
      evidence: undefined,
    },
    latestExport,
  };
}

async function previewFinancialAnalytics({ month }) {
  const snapshots = await Promise.all([
    db.collection("invoices").get(),
    db.collection("payments").get(),
    db.collection("bankTransactions").get(),
    db.collection("refunds").get(),
    db.collection("expenses").get(),
    db.collection("workSessions").get(),
    db.collection("studentRevenuePlans").get(),
    db.collection("financialPeriodCorrections").get(),
    db.collection("lessons").get(),
  ]);
  const records = snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const [invoices, payments, bankTransactions, refunds, expenses, workSessions,
    revenuePlans, corrections, lessons] = snapshots.map(records);
  try {
    return {
      snapshot: financialAnalyticsSnapshot({
        month,
        invoices,
        payments,
        bankTransactions,
        refunds,
        expenses,
        workSessions,
        revenuePlans,
        corrections,
        lessons,
      }),
    };
  } catch (error) {
    throw httpError(400, error.message);
  }
}

async function previewInvoiceNumbering() {
  const [invoiceSnap, counterSnap] = await Promise.all([
    db.collection("invoices").get(),
    db.collection("meta").doc("invoiceCounter").get(),
  ]);
  return {
    plan: invoiceNumberingPlan(
      invoiceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      { counterSeq: Number(counterSnap.data()?.seq) || 0 },
    ),
  };
}

async function repairInvoiceNumbering({ actor, reason, expectedFingerprint, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanReason = cleanText(reason, 500);
  if (!cleanReason) throw httpError(400, "Reason required");
  const fingerprint = String(expectedFingerprint || "").trim();
  if (!/^[a-f0-9]{64}$/.test(fingerprint)) throw httpError(400, "Valid numbering fingerprint required");
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const repairRef = db.collection("invoiceNumberRepairs").doc(mutationId);
  const counterRef = db.collection("meta").doc("invoiceCounter");
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const [auditSnap, repairSnap, invoiceSnap, counterSnap] = await Promise.all([
      transaction.get(auditRef),
      transaction.get(repairRef),
      transaction.get(db.collection("invoices")),
      transaction.get(counterRef),
    ]);
    if (auditSnap.exists || repairSnap.exists) {
      const repair = repairSnap.data();
      if (!repairSnap.exists || repair.fingerprint !== fingerprint || repair.reason !== cleanReason) {
        throw httpError(409, "requestId already used for a different financial mutation");
      }
      return { repair: { id: repairSnap.id, ...repair }, idempotent: true };
    }

    const invoices = invoiceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const invoiceById = new Map(invoices.map(invoice => [invoice.id, invoice]));
    const plan = invoiceNumberingPlan(invoices, {
      counterSeq: Number(counterSnap.data()?.seq) || 0,
    });
    if (plan.fingerprint !== fingerprint) {
      throw httpError(409, "Invoice data changed; run numbering preview again");
    }
    if (!plan.replacementCount) throw httpError(409, "No duplicate invoice numbers require repair");
    if (plan.replacementCount > 100) throw httpError(409, "Too many duplicate invoices for one repair");

    for (const date of [...new Set(plan.replacements
      .map(replacement => invoiceById.get(replacement.invoiceId)?.date)
      .filter(value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))))]) {
      await assertFinancialDateOpen(transaction, date);
    }

    plan.replacements.forEach(replacement => {
      const invoice = invoiceById.get(replacement.invoiceId);
      const invoiceRef = db.collection("invoices").doc(replacement.invoiceId);
      const previousNumbers = [...new Set([
        ...(Array.isArray(invoice.previousInvoiceNumbers) ? invoice.previousInvoiceNumbers : []),
        replacement.oldNumber,
      ].filter(Boolean))].slice(-20);
      const history = [
        ...(Array.isArray(invoice.renumberingHistory) ? invoice.renumberingHistory : []),
        {
          from: replacement.oldNumber,
          to: replacement.newNumber,
          reason: cleanReason,
          correctedAt: nowIso,
          correctedBy: actorData,
          requestId: mutationId,
        },
      ].slice(-20);
      transaction.update(invoiceRef, {
        num: replacement.newNumber,
        paymentReference: !invoice.paymentReference || invoice.paymentReference === replacement.oldNumber
          ? replacement.newNumber
          : invoice.paymentReference,
        previousInvoiceNumbers: previousNumbers,
        renumberingHistory: history,
        numberingStatus: "corrected",
        numberingCorrectedAt: nowIso,
        numberingCorrectedBy: actorData,
        numberingCorrectionReason: cleanReason,
        numberingRepairId: mutationId,
        correctedInvoiceDeliveryRequired: replacement.requiresResend,
        correctedInvoiceDeliveredAt: replacement.requiresResend ? "" : (invoice.correctedInvoiceDeliveredAt || ""),
        updatedAt: nowIso,
      });
    });

    const counterAfter = Math.max(Number(counterSnap.data()?.seq) || 0, plan.counterAfter);
    transaction.set(counterRef, {
      seq: counterAfter,
      numberingRepairedAt: nowIso,
      numberingRepairId: mutationId,
      updatedAt: nowIso,
    }, { merge: true });
    const repair = {
      status: "completed",
      fingerprint,
      reason: cleanReason,
      replacementCount: plan.replacementCount,
      duplicateGroupCount: plan.duplicateGroupCount,
      requiresResendCount: plan.requiresResendCount,
      riskyReplacementCount: plan.riskyReplacementCount,
      counterBefore: plan.counterBefore,
      counterAfter,
      replacements: plan.replacements,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.create(repairRef, repair);
    transaction.create(auditRef, {
      entityType: "invoice_numbering",
      entityId: mutationId,
      action: "invoice.numbering_repaired",
      fingerprint,
      replacementCount: plan.replacementCount,
      duplicateGroupCount: plan.duplicateGroupCount,
      requiresResendCount: plan.requiresResendCount,
      riskyReplacementCount: plan.riskyReplacementCount,
      counterBefore: plan.counterBefore,
      counterAfter,
      replacements: plan.replacements,
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { repair: { id: mutationId, ...repair }, plan, idempotent: false };
  });
}

async function reviewFinancialPeriod({ actor, month, requestId }) {
  const reviewMonth = validIsoMonth(month);
  const mutationId = cleanRequestId(requestId);
  const periodRef = db.collection("financialPeriods").doc(reviewMonth);
  const reviewRef = db.collection("financialPeriodReviews").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const reviewSnap = await transaction.get(reviewRef);
    if (reviewSnap.exists) {
      const review = reviewSnap.data();
      if (review.month !== reviewMonth || review.requestId !== mutationId) {
        throw httpError(409, "requestId already used for a different financial mutation");
      }
      return { review: { id: reviewSnap.id, ...review }, idempotent: true };
    }
    const [
      periodSnap,
      invoiceSnap,
      paymentSnap,
      bankSnap,
      creditSnap,
      lessonSnap,
      lineAllocationSnap,
    ] = await Promise.all([
      transaction.get(periodRef),
      transaction.get(db.collection("invoices")),
      transaction.get(db.collection("payments")),
      transaction.get(db.collection("bankTransactions")),
      transaction.get(db.collection("payerCredits")),
      transaction.get(db.collection("lessons")),
      transaction.get(db.collection("paymentLineAllocations")),
    ]);
    const withIds = snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const snapshot = financialPeriodReviewSnapshot({
      month: reviewMonth,
      invoices: withIds(invoiceSnap),
      payments: withIds(paymentSnap),
      bankTransactions: withIds(bankSnap),
      payerCredits: withIds(creditSnap),
      lessons: withIds(lessonSnap),
      paymentLineAllocations: withIds(lineAllocationSnap),
    });
    if (!snapshot.canReview) {
      throw httpError(
        409,
        `Period has ${snapshot.summary.blockingIssueCount} blocking financial issue(s)`,
      );
    }
    const previous = periodSnap.exists ? periodSnap.data() : {};
    const reviewVersion = Math.max(0, Number(previous.reviewVersion) || 0) + 1;
    const fingerprint = billingFingerprint(snapshot);
    const review = {
      month: reviewMonth,
      status: "reviewed",
      scope: snapshot.scope,
      dataVersion: snapshot.dataVersion,
      reviewVersion,
      summary: snapshot.summary,
      warnings: snapshot.issues.filter(issue => issue.severity === "warning").slice(0, 100),
      fingerprint,
      reviewedAt: nowIso,
      reviewedBy: actorData,
      requestId: mutationId,
    };
    transaction.create(reviewRef, review);
    transaction.set(periodRef, {
      month: reviewMonth,
      status: "reviewed",
      scope: snapshot.scope,
      dataVersion: snapshot.dataVersion,
      reviewVersion,
      lastReviewId: mutationId,
      lastReviewFingerprint: fingerprint,
      lastReviewedAt: nowIso,
      lastReviewedBy: actorData,
      lastReviewSummary: snapshot.summary,
      updatedAt: nowIso,
    }, { merge: true });
    transaction.create(auditRef, {
      entityType: "financial_period",
      entityId: reviewMonth,
      action: "financial_period.reviewed",
      month: reviewMonth,
      reviewId: mutationId,
      reviewVersion,
      scope: snapshot.scope,
      fingerprint,
      summary: snapshot.summary,
      warningCount: snapshot.summary.warningCount,
      actor: actorData,
      reason: "Monthly billing control reviewed",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { review: { id: mutationId, ...review }, idempotent: false };
  });
}

async function periodCloseData(transaction, month) {
  const reads = [
    transaction.get(db.collection("financialPeriods").doc(month)),
    transaction.get(db.collection("invoices")),
    transaction.get(db.collection("payments")),
    transaction.get(db.collection("bankTransactions")),
    transaction.get(db.collection("payerCredits")),
    transaction.get(db.collection("lessons")),
    transaction.get(db.collection("paymentLineAllocations")),
    transaction.get(db.collection("workSessions")),
    transaction.get(db.collection("expenses")),
    transaction.get(db.collection("creditApplications")),
    transaction.get(db.collection("refunds")),
    transaction.get(db.collection("financialPeriodCorrections")),
    transaction.get(db.collection("financialPeriodExports").where("month", "==", month)),
  ];
  const [periodSnap, invoiceSnap, paymentSnap, bankSnap, creditSnap, lessonSnap,
    allocationSnap, workSessionSnap, expenseSnap, applicationSnap, refundSnap,
    correctionSnap, exportSnap] = await Promise.all(reads);
  const withIds = snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const exports = withIds(exportSnap).sort((a, b) => String(b.generatedAt || "").localeCompare(String(a.generatedAt || "")));
  return {
    period: periodSnap.exists ? periodSnap.data() : {},
    data: {
      invoices: withIds(invoiceSnap),
      payments: withIds(paymentSnap),
      bankTransactions: withIds(bankSnap),
      payerCredits: withIds(creditSnap),
      lessons: withIds(lessonSnap),
      paymentLineAllocations: withIds(allocationSnap),
      workSessions: withIds(workSessionSnap),
      expenses: withIds(expenseSnap),
      creditApplications: withIds(applicationSnap),
      refunds: withIds(refundSnap),
      corrections: withIds(correctionSnap),
    },
    latestExport: exports[0] || null,
  };
}

async function generateFinancialPeriodExport({ actor, month, requestId }) {
  const exportMonth = validIsoMonth(month);
  const mutationId = cleanRequestId(requestId);
  const exportRef = db.collection("financialPeriodExports").doc(mutationId);
  const periodRef = db.collection("financialPeriods").doc(exportMonth);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);
  const nowIso = new Date().toISOString();

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(exportRef);
    if (existing.exists) {
      if (existing.data().month !== exportMonth) throw httpError(409, "requestId already used for another export");
      return { export: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    const loaded = await periodCloseData(transaction, exportMonth);
    const projection = periodCloseProjection({ month: exportMonth, period: loaded.period, ...loaded.data, latestExport: loaded.latestExport, nowIso });
    if (!projection.canGenerateExport) {
      throw httpError(409, "Period review, payroll, expenses, or supporting documents are not ready");
    }
    let archive;
    try {
      archive = accountantExportArchive({ projection, data: loaded.data, requestId: mutationId, actor: actorData, nowIso });
    } catch (error) {
      throw httpError(409, error.message);
    }
    transaction.create(exportRef, archive);
    transaction.set(periodRef, {
      month: exportMonth,
      latestExportId: mutationId,
      latestExportFingerprint: archive.evidenceFingerprint,
      latestExportAt: nowIso,
      latestExportBy: actorData,
      updatedAt: nowIso,
    }, { merge: true });
    transaction.create(auditRef, {
      entityType: "financial_period_export",
      entityId: mutationId,
      action: "financial_period.export_archived",
      month: exportMonth,
      exportId: mutationId,
      evidenceFingerprint: archive.evidenceFingerprint,
      rowCount: archive.rowCount,
      actor: actorData,
      reason: "Accountant export generated and archived",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { export: { id: mutationId, ...archive }, idempotent: false };
  });
}

function periodDates(month) {
  const [year, number] = validIsoMonth(month).split("-").map(Number);
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`);
}

async function closeFinancialPeriod({ actor, month, reason, requestId }) {
  const closeMonth = validIsoMonth(month);
  const mutationId = cleanRequestId(requestId);
  const cleanReason = cleanText(reason, 500);
  if (!cleanReason) throw httpError(400, "Close reason required");
  const closureRef = db.collection("financialPeriodClosures").doc(mutationId);
  const periodRef = db.collection("financialPeriods").doc(closeMonth);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);
  const nowIso = new Date().toISOString();

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(closureRef);
    if (existing.exists) {
      if (existing.data().month !== closeMonth || existing.data().reason !== cleanReason) {
        throw httpError(409, "requestId already used for another period close");
      }
      return { closure: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    const loaded = await periodCloseData(transaction, closeMonth);
    if (loaded.period.status === "closed") throw httpError(409, "Financial period is already closed");
    const projection = periodCloseProjection({ month: closeMonth, period: loaded.period, ...loaded.data, latestExport: loaded.latestExport, nowIso });
    if (!projection.canClose) {
      throw httpError(409, "Period cannot close until review, payroll, expenses, documents, and archived export all match");
    }
    const closure = {
      month: closeMonth,
      status: "closed",
      reason: cleanReason,
      reviewId: loaded.period.lastReviewId || "",
      reviewFingerprint: projection.billingFingerprint,
      exportId: loaded.latestExport.id,
      exportFingerprint: loaded.latestExport.evidenceFingerprint,
      evidenceFingerprint: projection.evidenceFingerprint,
      summary: projection.summary,
      openingBalances: projection.evidence.openingBalances,
      closingBalances: projection.evidence.closingBalances,
      closedAt: nowIso,
      closedBy: actorData,
      requestId: mutationId,
    };
    transaction.create(closureRef, closure);
    transaction.set(periodRef, {
      month: closeMonth,
      status: "closed",
      closureId: mutationId,
      closedAt: nowIso,
      closedBy: actorData,
      closeReason: cleanReason,
      closingEvidenceFingerprint: projection.evidenceFingerprint,
      closingExportId: loaded.latestExport.id,
      openingBalances: closure.openingBalances,
      closingBalances: closure.closingBalances,
      closeSummary: projection.summary,
      updatedAt: nowIso,
    }, { merge: true });
    periodDates(closeMonth).forEach(date => transaction.create(db.collection("financialLockedDates").doc(date), {
      date,
      month: closeMonth,
      closureId: mutationId,
      lockedAt: nowIso,
      lockedBy: actorData,
    }));
    transaction.create(auditRef, {
      entityType: "financial_period",
      entityId: closeMonth,
      action: "financial_period.closed",
      month: closeMonth,
      closureId: mutationId,
      reviewId: closure.reviewId,
      exportId: closure.exportId,
      evidenceFingerprint: closure.evidenceFingerprint,
      openingBalances: closure.openingBalances,
      closingBalances: closure.closingBalances,
      summary: closure.summary,
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { closure: { id: mutationId, ...closure }, idempotent: false };
  });
}

function signedMoneyCents(value, label, { allowZero = true } = {}) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(normalized)) throw httpError(400, `Valid ${label} required`);
  const result = Math.round(Number(normalized) * 100);
  if ((!allowZero && result === 0) || Math.abs(result) > 100000000) throw httpError(400, `${label} is outside the allowed range`);
  return result;
}

async function createFinancialPeriodCorrection({ actor, sourceMonth, effectiveDate, type, description, amountDelta, vatDelta, sourceEntityId, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanSourceMonth = validIsoMonth(sourceMonth);
  const cleanEffectiveDate = validIsoDate(effectiveDate, "effectiveDate");
  if (cleanEffectiveDate.slice(0, 7) <= cleanSourceMonth) throw httpError(400, "Correction date must be after the closed source month");
  const cleanType = String(type || "").trim();
  if (!["expense", "invoice", "payment", "payroll", "other"].includes(cleanType)) throw httpError(400, "Valid correction type required");
  const cleanDescription = cleanText(description, 500);
  const cleanReason = cleanText(reason, 500);
  if (!cleanDescription || !cleanReason) throw httpError(400, "Correction description and reason required");
  const amountDeltaCents = signedMoneyCents(amountDelta || 0, "correction amount");
  const vatDeltaCents = signedMoneyCents(vatDelta || 0, "correction VAT");
  if (amountDeltaCents === 0 && vatDeltaCents === 0) throw httpError(400, "Correction must change an amount or VAT");
  const correctionRef = db.collection("financialPeriodCorrections").doc(mutationId);
  const sourcePeriodRef = db.collection("financialPeriods").doc(cleanSourceMonth);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);
  const nowIso = new Date().toISOString();
  const signature = crypto.createHash("sha256").update(JSON.stringify({ cleanSourceMonth, cleanEffectiveDate, cleanType, cleanDescription, amountDeltaCents, vatDeltaCents, sourceEntityId: cleanText(sourceEntityId, 160), cleanReason })).digest("hex");

  return db.runTransaction(async transaction => {
    const [existing, sourcePeriodSnap] = await Promise.all([
      transaction.get(correctionRef),
      transaction.get(sourcePeriodRef),
    ]);
    if (existing.exists) {
      if (existing.data().signature !== signature) throw httpError(409, "requestId already used for another correction");
      return { correction: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    if (!sourcePeriodSnap.exists || sourcePeriodSnap.data().status !== "closed") throw httpError(409, "Source financial period is not closed");
    await assertFinancialDateOpen(transaction, cleanEffectiveDate);
    const correction = {
      sourceMonth: cleanSourceMonth,
      sourceClosureId: sourcePeriodSnap.data().closureId || "",
      effectiveDate: cleanEffectiveDate,
      type: cleanType,
      description: cleanDescription,
      amountDeltaCents,
      amountDelta: amountDeltaCents / 100,
      vatDeltaCents,
      vatDelta: vatDeltaCents / 100,
      sourceEntityId: cleanText(sourceEntityId, 160),
      reason: cleanReason,
      status: "active",
      signature,
      createdAt: nowIso,
      createdBy: actorData,
      requestId: mutationId,
    };
    transaction.create(correctionRef, correction);
    transaction.create(auditRef, {
      entityType: "financial_period_correction",
      entityId: mutationId,
      action: "financial_period.correction_created",
      sourceMonth: cleanSourceMonth,
      effectiveDate: cleanEffectiveDate,
      type: cleanType,
      amountDeltaCents,
      vatDeltaCents,
      sourceEntityId: correction.sourceEntityId,
      actor: actorData,
      reason: cleanReason,
      signature,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { correction: { id: mutationId, ...correction }, idempotent: false };
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
    const affectedDates = [...new Set([
      invoice.date,
      ...activePayments.map(payment => String(payment.paidAt || payment.createdAt || "").slice(0, 10)),
    ].filter(value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))))];
    for (const date of affectedDates) await assertFinancialDateOpen(transaction, date);

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
      paidAt: FieldValue.delete(),
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
  creditStudentId,
  reference,
  amount,
  allocations,
  lessonAllocations,
  note,
}) {
  const mutationId = cleanRequestId(requestId);
  const cleanExternalId = cleanText(externalId, 160);
  const normalized = normalizeBankDistribution(amount, allocations, lessonAllocations);
  const sortedAllocations = [...normalized.invoiceAllocations]
    .sort((a, b) => a.invoiceId.localeCompare(b.invoiceId));
  const sortedLessonAllocations = [...normalized.lessonAllocations]
    .sort((a, b) => a.lessonId.localeCompare(b.lessonId));
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    amountCents: normalized.transactionAmountCents,
    allocations: sortedAllocations,
    lessonAllocations: sortedLessonAllocations,
    externalId: cleanExternalId,
    paidAt: String(paidAt || ""),
    payerName: cleanText(payerName, 200),
    creditStudentId: cleanText(creditStudentId, 160),
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
  const cleanCreditStudentId = cleanText(creditStudentId, 160);
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
    if (cleanExternalId) {
      const duplicateExternal = await transaction.get(
        db.collection("bankTransactions").where("externalId", "==", cleanExternalId).limit(1),
      );
      if (!duplicateExternal.empty) {
        const duplicate = duplicateExternal.docs[0];
        if (duplicate.data().signature !== signature) {
          throw httpError(409, "Bank transaction externalId was already imported with different data");
        }
        return {
          bankTransaction: { id: duplicate.id, ...duplicate.data() },
          idempotent: true,
        };
      }
    }

    const invoiceRefs = sortedAllocations.map(allocation => db.collection("invoices").doc(allocation.invoiceId));
    const invoiceSnaps = await Promise.all(invoiceRefs.map(ref => transaction.get(ref)));
    invoiceSnaps.forEach((snap, index) => {
      if (!snap.exists) throw httpError(404, `Invoice ${sortedAllocations[index].invoiceId} not found`);
    });
    const lessonRefs = sortedLessonAllocations.map(allocation =>
      db.collection("lessons").doc(allocation.lessonId),
    );
    const lessonSnaps = await Promise.all(lessonRefs.map(ref => transaction.get(ref)));
    lessonSnaps.forEach((snap, index) => {
      if (!snap.exists) {
        throw httpError(404, `Lesson ${sortedLessonAllocations[index].lessonId} not found`);
      }
      const lesson = snap.data();
      if (!lessonIsBillable(lesson) || lesson.directPaymentId || lesson.billingStatus === "paid_directly") {
        throw httpError(409, `Lesson ${sortedLessonAllocations[index].lessonId} is not available for direct payment`);
      }
    });
    const requestedCreditStudentRef = cleanCreditStudentId
      ? db.collection("students").doc(cleanCreditStudentId)
      : null;
    const requestedCreditStudentSnap = requestedCreditStudentRef
      ? await transaction.get(requestedCreditStudentRef)
      : null;
    if (requestedCreditStudentSnap && !requestedCreditStudentSnap.exists) {
      throw httpError(404, "Advance student not found");
    }
    const allocationStudentIds = [...new Set(
      [...invoiceSnaps, ...lessonSnaps]
        .map(snap => String(snap.data()?.studentId || ""))
        .filter(Boolean),
    )];
    const derivedCreditStudentId = cleanCreditStudentId
      || (allocationStudentIds.length === 1 ? allocationStudentIds[0] : "");
    if (sortedLessonAllocations.length && !derivedCreditStudentId) {
      throw httpError(400, "Student required for direct lesson payment");
    }
    if (normalized.unappliedAmountCents > 0 && !derivedCreditStudentId) {
      throw httpError(400, "Student required for advance payment");
    }
    lessonSnaps.forEach((snap, index) => {
      if (String(snap.data()?.studentId || "") !== derivedCreditStudentId) {
        throw httpError(
          409,
          `Direct lesson payment belongs to another student than lesson ${sortedLessonAllocations[index].lessonId}`,
        );
      }
    });
    const derivedInvoiceStudent = derivedCreditStudentId
      ? invoiceSnaps.map(snap => snap.data()).find(invoice =>
        String(invoice?.studentId || "") === derivedCreditStudentId,
      )
      : null;
    const creditStudentName = requestedCreditStudentSnap?.data()?.name
      || derivedInvoiceStudent?.studentName
      || lessonSnaps.map(snap => snap.data()).find(lesson =>
        String(lesson?.studentId || "") === derivedCreditStudentId,
      )?.studentName
      || "";
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
    await assertFinancialDateOpen(transaction, transactionDate);
    for (const date of [...new Set(lessonSnaps.map(snap => snap.data()?.date))]) {
      await assertFinancialDateOpen(transaction, date);
    }

    const bankTransaction = {
      externalId: cleanExternalId,
      paidAt: transactionDate,
      payerName: cleanPayerName,
      payerKey: payerKey(cleanPayerName),
      creditStudentId: normalized.unappliedAmountCents > 0 ? derivedCreditStudentId : "",
      creditStudentName: normalized.unappliedAmountCents > 0 ? creditStudentName : "",
      reference: cleanReference,
      amountCents: normalized.transactionAmountCents,
      amount: centsToAmount(normalized.transactionAmountCents),
      allocatedAmountCents: normalized.allocatedAmountCents,
      allocatedAmount: centsToAmount(normalized.allocatedAmountCents),
      invoiceAllocatedAmountCents: normalized.invoiceAllocatedAmountCents,
      invoiceAllocatedAmount: centsToAmount(normalized.invoiceAllocatedAmountCents),
      lessonAllocatedAmountCents: normalized.lessonAllocatedAmountCents,
      lessonAllocatedAmount: centsToAmount(normalized.lessonAllocatedAmountCents),
      unappliedAmountCents: normalized.unappliedAmountCents,
      unappliedAmount: centsToAmount(normalized.unappliedAmountCents),
      allocationCount: sortedAllocations.length + sortedLessonAllocations.length,
      invoiceAllocationCount: sortedAllocations.length,
      lessonAllocationCount: sortedLessonAllocations.length,
      activeAllocationCount: sortedAllocations.length + sortedLessonAllocations.length,
      activeLessonAllocationCount: sortedLessonAllocations.length,
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
    const auditLessons = [];
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
        bankExternalId: cleanExternalId,
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

    sortedLessonAllocations.forEach((allocation, index) => {
      const lesson = lessonSnaps[index].data();
      const paymentId = `${mutationId}_l${index + 1}`;
      const paymentRef = db.collection("payments").doc(paymentId);
      const paidAmount = centsToAmount(allocation.amountCents);
      const payment = {
        kind: "direct_lesson",
        invoiceId: "",
        invoiceNum: "",
        lessonId: allocation.lessonId,
        studentId: lesson.studentId || derivedCreditStudentId,
        studentName: lesson.studentName || creditStudentName,
        payerName: cleanPayerName || lesson.studentName || "",
        amountCents: allocation.amountCents,
        amount: paidAmount,
        paidAt: transactionDate,
        method: "bank",
        reference: cleanReference,
        note: cleanNote || "Direct lesson payment without invoice",
        status: "active",
        bankTransactionId: mutationId,
        bankExternalId: cleanExternalId,
        allocationIndex: sortedAllocations.length + index,
        allocationMethod: "direct_lesson_v1",
        createdAt: nowIso,
        createdBy: actorData,
        requestId: paymentId,
      };
      transaction.create(paymentRef, payment);
      transaction.set(lessonRefs[index], {
        billingStatus: "paid_directly",
        directPaymentId: paymentId,
        directPaymentAmountCents: allocation.amountCents,
        directPaymentAmount: paidAmount,
        directPaidAt: transactionDate,
        bankTransactionId: mutationId,
        financialUpdatedAt: nowIso,
      }, { merge: true });
      paymentIds.push(paymentId);
      auditLessons.push({
        lessonId: allocation.lessonId,
        studentId: payment.studentId,
        studentName: payment.studentName,
        date: lesson.date || "",
        amount: paidAmount,
        paymentId,
      });
    });

    transaction.create(bankRef, bankTransaction);
    if (normalized.unappliedAmountCents > 0) {
      transaction.create(creditRef, {
        payerKey: bankTransaction.payerKey,
        payerName: cleanPayerName,
        studentId: derivedCreditStudentId,
        studentName: creditStudentName,
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
      action: sortedAllocations.length || sortedLessonAllocations.length
        ? "bank_transaction.allocated"
        : "bank_transaction.saved_as_advance",
      bankTransactionId: mutationId,
      paymentIds,
      invoices: auditInvoices,
      lessons: auditLessons,
      transactionAmount: bankTransaction.amount,
      allocatedAmount: bankTransaction.allocatedAmount,
      unappliedAmount: bankTransaction.unappliedAmount,
      payerKey: bankTransaction.payerKey,
      payerName: cleanPayerName,
      studentId: derivedCreditStudentId,
      studentName: creditStudentName,
      actor: actorData,
      reason: cleanNote || "Bank transaction allocated",
      createdAt: nowIso,
      requestId: mutationId,
    });
    return {
      bankTransaction: { id: mutationId, ...bankTransaction },
      paymentIds,
      directLessons: auditLessons,
      payerCredit: normalized.unappliedAmountCents > 0
        ? { id: mutationId, amount: centsToAmount(normalized.unappliedAmountCents) }
        : null,
      idempotent: false,
    };
  });
}

async function applyPayerCredit({ actor, creditId, allocations, lessonAllocations, note, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanCreditId = String(creditId || "").trim();
  if (!cleanCreditId) throw httpError(400, "creditId required");
  if (
    (!Array.isArray(allocations) || allocations.length === 0)
    && (!Array.isArray(lessonAllocations) || lessonAllocations.length === 0)
  ) {
    throw httpError(400, "At least one credit allocation required");
  }
  const requestedAmount = [
    ...(Array.isArray(allocations) ? allocations : []),
    ...(Array.isArray(lessonAllocations) ? lessonAllocations : []),
  ].reduce((sum, allocation) => sum + (Number(allocation?.amount) || 0), 0);
  const normalized = normalizeBankDistribution(requestedAmount, allocations, lessonAllocations);
  const sortedAllocations = [...normalized.invoiceAllocations]
    .sort((a, b) => a.invoiceId.localeCompare(b.invoiceId));
  const sortedLessonAllocations = [...normalized.lessonAllocations]
    .sort((a, b) => a.lessonId.localeCompare(b.lessonId));
  const cleanNote = cleanText(note);
  const signature = crypto.createHash("sha256").update(JSON.stringify({
    creditId: cleanCreditId,
    allocations: sortedAllocations,
    lessonAllocations: sortedLessonAllocations,
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
    if (credit.studentId) {
      invoiceSnaps.forEach((snap, index) => {
        if (String(snap.data()?.studentId || "") !== String(credit.studentId)) {
          throw httpError(
            409,
            `Payer credit belongs to another student than invoice ${sortedAllocations[index].invoiceId}`,
          );
        }
      });
    }
    const lessonRefs = sortedLessonAllocations.map(allocation =>
      db.collection("lessons").doc(allocation.lessonId),
    );
    const lessonSnaps = await Promise.all(lessonRefs.map(ref => transaction.get(ref)));
    lessonSnaps.forEach((snap, index) => {
      if (!snap.exists) {
        throw httpError(404, `Lesson ${sortedLessonAllocations[index].lessonId} not found`);
      }
      const lesson = snap.data();
      if (!credit.studentId) {
        throw httpError(409, "Assign the advance to a student before applying it to lessons");
      }
      if (String(lesson.studentId || "") !== String(credit.studentId)) {
        throw httpError(
          409,
          `Payer credit belongs to another student than lesson ${sortedLessonAllocations[index].lessonId}`,
        );
      }
      if (!lessonIsBillable(lesson) || lesson.directPaymentId || lesson.billingStatus === "paid_directly") {
        throw httpError(409, `Lesson ${sortedLessonAllocations[index].lessonId} is not available for direct payment`);
      }
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
    const auditLessons = [];

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

    sortedLessonAllocations.forEach((allocation, index) => {
      const lesson = lessonSnaps[index].data();
      const paymentId = `${mutationId}_l${index + 1}`;
      const paidAmount = centsToAmount(allocation.amountCents);
      const payment = {
        kind: "direct_lesson",
        invoiceId: "",
        invoiceNum: "",
        lessonId: allocation.lessonId,
        studentId: lesson.studentId || credit.studentId || "",
        studentName: lesson.studentName || credit.studentName || "",
        payerName: credit.payerName || lesson.studentName || "",
        amountCents: allocation.amountCents,
        amount: paidAmount,
        paidAt: nowIso.slice(0, 10),
        method: "credit",
        reference: `Avanss ${creditRef.id}`,
        note: cleanNote || "Payer credit applied directly to lesson",
        status: "active",
        sourceCreditId: creditRef.id,
        creditApplicationId: mutationId,
        allocationIndex: sortedAllocations.length + index,
        allocationMethod: "direct_lesson_v1",
        createdAt: nowIso,
        createdBy: actorData,
        requestId: paymentId,
      };
      transaction.create(db.collection("payments").doc(paymentId), payment);
      transaction.set(lessonRefs[index], {
        billingStatus: "paid_directly",
        directPaymentId: paymentId,
        directPaymentAmountCents: allocation.amountCents,
        directPaymentAmount: paidAmount,
        directPaidAt: nowIso.slice(0, 10),
        sourceCreditId: creditRef.id,
        financialUpdatedAt: nowIso,
      }, { merge: true });
      paymentIds.push(paymentId);
      auditLessons.push({
        lessonId: allocation.lessonId,
        studentId: payment.studentId,
        studentName: payment.studentName,
        date: lesson.date || "",
        amount: paidAmount,
        paymentId,
      });
    });

    const application = {
      creditId: creditRef.id,
      payerKey: credit.payerKey || "",
      payerName: credit.payerName || "",
      studentId: credit.studentId || "",
      studentName: credit.studentName || "",
      amountCents: normalized.allocatedAmountCents,
      amount: centsToAmount(normalized.allocatedAmountCents),
      originalAmountCents: normalized.allocatedAmountCents,
      originalAmount: centsToAmount(normalized.allocatedAmountCents),
      allocations: auditInvoices,
      lessonAllocations: auditLessons,
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
      lessons: auditLessons,
      amount: application.amount,
      beforeAvailableAmount: Number(credit.availableAmount) || 0,
      afterAvailableAmount: creditPatch.availableAmount,
      studentId: credit.studentId || "",
      studentName: credit.studentName || "",
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
      if (
        !["payment.voided", "direct_lesson_payment.voided"].includes(existingData.action)
        || existingData.paymentId !== paymentRef.id
      ) {
        throw httpError(409, "requestId already used for a different financial mutation");
      }
      return { paymentId: paymentRef.id, idempotent: true };
    }
    const paymentSnap = await transaction.get(paymentRef);
    if (!paymentSnap.exists) throw httpError(404, "Payment not found");
    const payment = paymentSnap.data();
    if (payment.status === "voided") throw httpError(409, "Payment is already voided");
    if (payment.kind === "direct_lesson") {
      const lessonRef = db.collection("lessons").doc(String(payment.lessonId || ""));
      const lessonSnap = await transaction.get(lessonRef);
      if (!lessonSnap.exists) throw httpError(404, "Directly paid lesson not found");
      const lesson = lessonSnap.data();
      if (String(lesson.directPaymentId || "") !== paymentRef.id) {
        throw httpError(409, "Lesson is linked to another direct payment");
      }
      const amountCents = paymentNetAmountCents(payment);
      if (amountCents <= 0) throw httpError(409, "Payment amount is invalid");
      let sourceCreditRef = null;
      let sourceCredit = null;
      let sourceCreditExists = false;
      let applicationRef = null;
      let application = null;
      let bankRef = null;
      let bankTransaction = null;
      if (payment.sourceCreditId) {
        sourceCreditRef = db.collection("payerCredits").doc(String(payment.sourceCreditId));
        applicationRef = payment.creditApplicationId
          ? db.collection("creditApplications").doc(String(payment.creditApplicationId))
          : null;
        const [creditSnap, applicationSnap] = await Promise.all([
          transaction.get(sourceCreditRef),
          applicationRef ? transaction.get(applicationRef) : Promise.resolve(null),
        ]);
        if (!creditSnap.exists) throw httpError(409, "Source payer credit not found");
        sourceCredit = creditSnap.data();
        sourceCreditExists = true;
        application = applicationSnap?.exists ? applicationSnap.data() : null;
      } else if (payment.bankTransactionId) {
        bankRef = db.collection("bankTransactions").doc(String(payment.bankTransactionId));
        sourceCreditRef = db.collection("payerCredits").doc(String(payment.bankTransactionId));
        const [bankSnap, creditSnap] = await Promise.all([
          transaction.get(bankRef),
          transaction.get(sourceCreditRef),
        ]);
        if (!bankSnap.exists) throw httpError(409, "Source bank transaction not found");
        bankTransaction = bankSnap.data();
        sourceCreditExists = creditSnap.exists;
        sourceCredit = creditSnap.exists ? creditSnap.data() : {
          payerKey: bankTransaction.payerKey || "",
          payerName: bankTransaction.payerName || payment.payerName || "",
          studentId: payment.studentId || bankTransaction.creditStudentId || "",
          studentName: payment.studentName || bankTransaction.creditStudentName || "",
          bankTransactionId: bankRef.id,
          originalAmountCents: amountCents,
          originalAmount: centsToAmount(amountCents),
          availableAmountCents: 0,
          availableAmount: 0,
          appliedAmountCents: 0,
          appliedAmount: 0,
          status: "open",
          createdAt: nowIso,
          createdBy: actorData,
        };
      }
      const restoredCreditPatch = sourceCreditRef && sourceCredit
        ? creditAfterRestoration(
          sourceCredit,
          amountCents,
          nowIso,
          { reverseApplication: Boolean(payment.sourceCreditId) },
        )
        : null;
      if (bankRef && restoredCreditPatch) {
        const originalAmountCents = sourceCreditExists
          ? (Number(sourceCredit.originalAmountCents) || 0) + amountCents
          : amountCents;
        restoredCreditPatch.originalAmountCents = originalAmountCents;
        restoredCreditPatch.originalAmount = centsToAmount(restoredCreditPatch.originalAmountCents);
      }
      await assertFinancialDateOpen(
        transaction,
        String(payment.paidAt || payment.createdAt || lesson.date || nowIso).slice(0, 10),
      );
      await assertFinancialDateOpen(transaction, lesson.date);
      transaction.set(paymentRef, {
        status: "voided",
        voidedAt: nowIso,
        voidedBy: actorData,
        voidReason: cleanReason,
        voidRequestId: mutationId,
      }, { merge: true });
      transaction.set(lessonRef, {
        billingStatus: "unbilled",
        directPaymentId: FieldValue.delete(),
        directPaymentAmountCents: FieldValue.delete(),
        directPaymentAmount: FieldValue.delete(),
        directPaidAt: FieldValue.delete(),
        bankTransactionId: FieldValue.delete(),
        sourceCreditId: FieldValue.delete(),
        financialUpdatedAt: nowIso,
      }, { merge: true });
      if (sourceCreditRef && sourceCredit && restoredCreditPatch) {
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
          activePaymentCount: Math.max(
            0,
            (Number(application.activePaymentCount) || application.paymentIds?.length || 0) - 1,
          ),
          status: remainingAmountCents === 0 ? "voided" : "partially_voided",
          voidedPaymentIds: FieldValue.arrayUnion(paymentRef.id),
          updatedAt: nowIso,
        }, { merge: true });
      }
      if (bankRef && bankTransaction) {
        const allocatedAmountCents = Math.max(
          0,
          (Number(bankTransaction.allocatedAmountCents) || 0) - amountCents,
        );
        const lessonAllocatedAmountCents = Math.max(
          0,
          (Number(bankTransaction.lessonAllocatedAmountCents) || 0) - amountCents,
        );
        const unappliedAmountCents = Math.max(
          0,
          (Number(bankTransaction.unappliedAmountCents) || 0) + amountCents,
        );
        transaction.set(bankRef, {
          allocatedAmountCents,
          allocatedAmount: centsToAmount(allocatedAmountCents),
          lessonAllocatedAmountCents,
          lessonAllocatedAmount: centsToAmount(lessonAllocatedAmountCents),
          unappliedAmountCents,
          unappliedAmount: centsToAmount(unappliedAmountCents),
          activeAllocationCount: Math.max(
            0,
            (Number(bankTransaction.activeAllocationCount) || bankTransaction.allocationCount || 0) - 1,
          ),
          activeLessonAllocationCount: Math.max(
            0,
            (
              Number(bankTransaction.activeLessonAllocationCount)
              || bankTransaction.lessonAllocationCount
              || 0
            ) - 1,
          ),
          status: allocatedAmountCents === 0 ? "unapplied" : "partially_allocated",
          updatedAt: nowIso,
        }, { merge: true });
      }
      transaction.create(auditRef, {
        entityType: "payment",
        entityId: paymentRef.id,
        action: "direct_lesson_payment.voided",
        paymentId: paymentRef.id,
        lessonId: lessonRef.id,
        studentId: payment.studentId || lesson.studentId || "",
        bankTransactionId: payment.bankTransactionId || "",
        sourceCreditId: payment.sourceCreditId || "",
        creditApplicationId: payment.creditApplicationId || "",
        amount: centsToAmount(amountCents),
        restoredCreditAmount: restoredCreditPatch?.availableAmount ?? null,
        actor: actorData,
        reason: cleanReason,
        createdAt: nowIso,
        requestId: mutationId,
      });
      return {
        payment: { id: paymentRef.id, ...payment, status: "voided" },
        lesson: { id: lessonRef.id, ...lesson, billingStatus: "unbilled" },
        restoredCredit: restoredCreditPatch
          ? { id: sourceCreditRef.id, ...sourceCredit, ...restoredCreditPatch }
          : null,
        idempotent: false,
      };
    }
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
    await assertFinancialDateOpen(
      transaction,
      String(payment.paidAt || payment.createdAt || nowIso).slice(0, 10),
    );
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
      ...(invoicePatch.paidAt ? {} : { paidAt: FieldValue.delete() }),
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
        voidedPaymentIds: FieldValue.arrayUnion(paymentRef.id),
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

async function loadCreditNote(creditNoteId) {
  if (!creditNoteId) throw httpError(400, "creditNoteId required");
  const ref = db.collection("creditNotes").doc(String(creditNoteId));
  const snap = await ref.get();
  if (!snap.exists) throw httpError(404, "Credit note not found");
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
  const previousNumber = Array.isArray(invoice.previousInvoiceNumbers)
    ? invoice.previousInvoiceNumbers.at(-1) || ""
    : "";
  const subject = isReminder
    ? `Meeldetuletus: arve ${invoice.num || ""} tasumine`
    : `${previousNumber ? "Parandatud " : ""}arve ${invoice.num || ""} - KeeleSepp`;
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
    previousNumber ? `Eelmine arvenumber: ${previousNumber}` : "",
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
  const numberingRow = previousNumber
    ? `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Eelmine arvenumber</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(previousNumber)}</td></tr>`
    : "";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1C2B3A;line-height:1.5;max-width:640px">
      <h2 style="margin:0 0 12px;color:#1C2B3A">${escapeHtml(subject)}</h2>
      <p>${escapeHtml(intro)}</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#fff">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Arve</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(invoice.num || "")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">${escapeHtml(partyKind)}</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(partyName)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Kirjeldus</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(desc)}</td></tr>
        ${numberingRow}
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
  const attachments = (Array.isArray(message.attachments) ? message.attachments : []).map(attachment => {
    const content = Buffer.isBuffer(attachment.content)
      ? attachment.content
      : Buffer.from(String(attachment.content || ""), "base64");
    return {
      filename: String(attachment.filename || "attachment"),
      contentType: String(attachment.contentType || "application/octet-stream"),
      content,
      contentBase64: content.toString("base64"),
      size: content.length,
    };
  });
  const attachmentBytes = attachments.reduce((sum, attachment) => sum + attachment.size, 0);
  if (attachmentBytes > 600000) {
    throw httpError(413, "Email attachments are too large for the delivery queue");
  }
  const ref = db.collection("emailQueue").doc();
  const queueBase = {
    ...context,
    to: message.to,
    from,
    replyTo,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: attachments.map(attachment => ({
      filename: attachment.filename,
      contentType: attachment.contentType,
      contentBase64: attachment.contentBase64,
      size: attachment.size,
    })),
    status: "queued",
    createdAt: FieldValue.serverTimestamp(),
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
        attachments: attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        })),
      });
      providerId = info.messageId || "";
      await ref.update({ status: "sent", provider: "smtp", providerId, sentAt: FieldValue.serverTimestamp() });
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
        attachments: attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.contentBase64,
        })),
      });
      providerId = data.id || "";
      await ref.update({ status: "sent", provider: "resend", providerId, sentAt: FieldValue.serverTimestamp() });
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
      attachments: attachments.map(attachment => ({
        content: attachment.contentBase64,
        type: attachment.contentType,
        filename: attachment.filename,
        disposition: "attachment",
      })),
    });
    providerId = data.id || "";
    await ref.update({ status: "sent", provider: "sendgrid", providerId, sentAt: FieldValue.serverTimestamp() });
    return { status: "sent", provider: "sendgrid", queueId: ref.id, providerId };
  } catch (e) {
    await ref.update({
      status: "failed",
      error: String(e.message || e).slice(0, 500),
      failedAt: FieldValue.serverTimestamp(),
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
  if (type === "invoice" && invoice.correctedInvoiceDeliveryRequired) {
    patch.correctedInvoiceDeliveryRequired = false;
    patch.correctedInvoiceDeliveredAt = nowIso;
  }
  if (type !== "invoice") {
    patch.lastReminderSentAt = nowIso;
    patch.reminderCount = FieldValue.increment(1);
    if (type === "due10") patch.due10ReminderMonth = monthKey(invoice.due || invoiceDueDate());
  }
  await invoice.ref.update(patch);
  return { ...delivery, to, invoiceId: invoice.id };
}

async function creditNoteDocumentData(creditNoteId) {
  const creditNote = await loadCreditNote(creditNoteId);
  const invoice = await loadInvoice(creditNote.invoiceId);
  const student = await loadInvoiceStudent(invoice);
  return { creditNote, invoice, student };
}

async function invoicePdf(invoiceId) {
  const invoice = await loadInvoice(invoiceId);
  const student = await loadInvoiceStudent(invoice);
  const content = await buildInvoicePdf({
    invoice,
    student,
    paymentDetails: PAYMENT_DETAILS,
  });
  return {
    invoice,
    content,
    filename: invoiceFileName(invoice),
  };
}

async function creditNotePdf(creditNoteId) {
  const data = await creditNoteDocumentData(creditNoteId);
  const content = await buildCreditNotePdf({
    ...data,
    paymentDetails: {
      ...PAYMENT_DETAILS,
      ...(data.creditNote.issuer || {}),
    },
  });
  return {
    ...data,
    content,
    filename: creditNoteFileName(data.creditNote),
  };
}

async function sendCreditNoteMessage(creditNoteId, { actor = null } = {}) {
  const data = await creditNotePdf(creditNoteId);
  const payload = composeCreditNoteEmail({
    creditNote: data.creditNote,
    invoice: data.invoice,
    student: data.student,
    appBaseUrl: APP_BASE_URL,
  });
  const to = firstEmail(payload.to);
  if (!to) throw httpError(400, "Recipient email is missing");
  const nowIso = new Date().toISOString();

  let delivery;
  try {
    delivery = await deliverEmail({
      ...payload,
      to,
      attachments: [{
        filename: data.filename,
        contentType: "application/pdf",
        content: data.content,
      }],
    }, {
      type: "credit_note",
      creditNoteId: data.creditNote.id,
      creditNoteNum: data.creditNote.num || "",
      invoiceId: data.invoice.id,
      invoiceNum: data.invoice.num || "",
      studentId: data.invoice.studentId || "",
      studentName: data.invoice.studentName || data.student?.name || "",
      createdByUid: actor?.decoded?.uid || "system",
      createdByEmail: actor?.decoded?.email || "system",
    });
  } catch (error) {
    await data.creditNote.ref.update({
      emailStatus: "failed",
      emailLastError: String(error.message || error).slice(0, 300),
      emailUpdatedAt: nowIso,
    });
    throw error;
  }

  const patch = {
    emailRecipient: to,
    emailStatus: delivery.status,
    emailUpdatedAt: nowIso,
  };
  if (delivery.status === "sent") patch.emailSentAt = nowIso;
  if (delivery.status === "queued") patch.emailQueuedAt = nowIso;
  await data.creditNote.ref.update(patch);
  return {
    ...delivery,
    to,
    creditNoteId: data.creditNote.id,
    filename: data.filename,
  };
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

// (findStudentByName удалена: поиск по имени теперь идёт по кэшу,
// собираемому один раз за прогон в syncTeacherCalendar)

function stripKeeleSeppCalendarMetadata(description) {
  return String(description || "")
    .split(/\r?\n/)
    .filter(line => !/^student:/i.test(line) && !/^KeeleSepp schedule:/i.test(line))
    .join("\n")
    .trim();
}

function googleRecurrenceDay(event) {
  const rrule = (event.recurrence || []).find(item => /^RRULE:/i.test(item)) || "";
  const match = rrule.match(/(?:^|;)BYDAY=(MO|TU|WE|TH|FR|SA|SU)(?:;|$)/i);
  return {
    MO: "Mon",
    TU: "Tue",
    WE: "Wed",
    TH: "Thu",
    FR: "Fri",
    SA: "Sat",
    SU: "Sun",
  }[String(match?.[1] || "").toUpperCase()] || "";
}

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

  const managedByKeeleSepp = isKeeleSeppManagedGoogleEvent(event);
  const recurrenceDay = managedByKeeleSepp ? googleRecurrenceDay(event) : "";
  const excludedDates = recurrenceDay ? googleRecurrenceExcludedDates(event) : [];
  return {
    gcalEventId:  event.id,
    gcalCalId:    event.calendarId || "primary",
    gcalEtag:     event.etag || "",
    title:        event.summary || "",
    studentId:    studentId || "",
    studentName:  studentName || extractCalendarStudentName(event.summary) || "",
    teacher:      teacher || "",
    teacherFull:  teacher || "",
    teacherUid:   teacherUid || "",
    date:         recurrenceDay ? "" : date,
    startDate:    recurrenceDay ? date : "",
    day:          recurrenceDay,
    recurring:    Boolean(recurrenceDay),
    ...(excludedDates.length ? { excludedDates } : {}),
    time,
    duration,
    notes:        managedByKeeleSepp
      ? stripKeeleSeppCalendarMetadata(event.description)
      : event.description || "",
    status:       "Planeeritud",
    source:       managedByKeeleSepp ? "keelesepp" : "gcal",
    gcalSyncStatus: "synced",
    gcalSyncedAt: new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  };
}

// ── STAFF TIME AND OWNER ASSISTANT ───────────────────────────
const openWorkSessionRef = uid => db.collection("workSessionOpen").doc(uid);
const staffProgramPresenceRef = uid => db.collection("staffProgramPresence").doc(uid);

function workTimeAuditPayload({ action, actor, sessionId, staffUid, before = null, after = null, reason = "" }) {
  return {
    action,
    sessionId,
    staffUid,
    actor: actorSnapshot(actor),
    before,
    after,
    reason: cleanText(reason, 500),
    createdAt: new Date().toISOString(),
  };
}

async function clockInStaff({ actor, note = "" }) {
  const staff = actorSnapshot(actor);
  const pointerRef = openWorkSessionRef(staff.uid);
  const sessionRef = db.collection("workSessions").doc();
  const auditRef = db.collection("workTimeAudit").doc();
  const now = new Date();
  const nowIso = now.toISOString();
  const startedDate = localDate(now, APP_TIME_ZONE);

  return db.runTransaction(async transaction => {
    const pointerSnap = await transaction.get(pointerRef);
    if (pointerSnap.exists) {
      const existingId = pointerSnap.data()?.sessionId;
      if (existingId) {
        const existingSnap = await transaction.get(db.collection("workSessions").doc(existingId));
        if (existingSnap.exists && existingSnap.data()?.status === "open") {
          return { idempotent: true, session: { id: existingSnap.id, ...existingSnap.data() } };
        }
      }
    }

    const session = {
      staffUid: staff.uid,
      staffName: staff.name,
      staffRole: staff.role,
      startedAt: nowIso,
      startedDate,
      endedAt: "",
      status: "open",
      breakMinutes: 0,
      durationMinutes: 0,
      note: cleanText(note, 500),
      source: "manual",
      approvalStatus: "open",
      hourlyRateCents: 0,
      payAmountCents: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    transaction.set(sessionRef, session);
    transaction.set(pointerRef, { sessionId: sessionRef.id, staffUid: staff.uid, startedAt: nowIso });
    transaction.set(auditRef, workTimeAuditPayload({
      action: "clock_in",
      actor,
      sessionId: sessionRef.id,
      staffUid: staff.uid,
      after: session,
    }));
    return { idempotent: false, session: { id: sessionRef.id, ...session } };
  });
}

async function clockOutStaff({ actor, breakMinutes = 0, note = "" }) {
  const staff = actorSnapshot(actor);
  const pointerRef = openWorkSessionRef(staff.uid);
  const auditRef = db.collection("workTimeAudit").doc();
  const nowIso = new Date().toISOString();

  return db.runTransaction(async transaction => {
    const pointerSnap = await transaction.get(pointerRef);
    if (!pointerSnap.exists || !pointerSnap.data()?.sessionId) {
      throw httpError(409, "No open work session");
    }
    const sessionRef = db.collection("workSessions").doc(pointerSnap.data().sessionId);
    const sessionSnap = await transaction.get(sessionRef);
    if (!sessionSnap.exists || sessionSnap.data()?.status !== "open") {
      transaction.delete(pointerRef);
      throw httpError(409, "Open work session is inconsistent");
    }
    const before = sessionSnap.data();
    if (before.staffUid !== staff.uid) throw httpError(403, "Work session does not belong to user");
    const cleanBreakMinutes = Number(breakMinutes || 0);
    let durationMinutes;
    try {
      durationMinutes = workDurationMinutes({
        ...before,
        endedAt: nowIso,
        breakMinutes: cleanBreakMinutes,
      });
    } catch (error) {
      throw httpError(400, error.message);
    }
    const after = {
      ...before,
      endedAt: nowIso,
      status: "closed",
      breakMinutes: cleanBreakMinutes,
      durationMinutes,
      note: cleanText(note || before.note, 500),
      approvalStatus: "pending",
      updatedAt: nowIso,
    };
    transaction.set(sessionRef, after);
    transaction.delete(pointerRef);
    transaction.set(auditRef, workTimeAuditPayload({
      action: "clock_out",
      actor,
      sessionId: sessionRef.id,
      staffUid: staff.uid,
      before,
      after,
    }));
    return { idempotent: false, session: { id: sessionRef.id, ...after } };
  });
}

async function setStaffHourlyRate({ actor, staffUid, hourlyRate }) {
  const cleanUid = String(staffUid || "").trim();
  if (!cleanUid) throw httpError(400, "Staff user required");
  let rateCents;
  try {
    rateCents = hourlyRateCents(hourlyRate, { allowZero: true });
  } catch (error) {
    throw httpError(400, error.message);
  }
  const userRef = db.collection("users").doc(cleanUid);
  const auditRef = db.collection("workTimeAudit").doc();
  const nowIso = new Date().toISOString();
  await db.runTransaction(async transaction => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) throw httpError(404, "Staff user not found");
    const target = userSnap.data() || {};
    const targetRoles = collectTrustedRoles(target, {});
    const targetEmail = String(target.email || "").trim().toLowerCase();
    if (![...targetRoles].some(role => STAFF_ROLES.has(role)) && !SUPER_ADMIN_EMAILS.has(targetEmail)) {
      throw httpError(409, "Hourly rate can be assigned only to staff");
    }
    const before = Number(target.workHourlyRateCents || 0);
    transaction.set(userRef, {
      workHourlyRateCents: rateCents,
      workHourlyRateUpdatedAt: nowIso,
      workHourlyRateUpdatedBy: actorSnapshot(actor),
    }, { merge: true });
    transaction.set(auditRef, workTimeAuditPayload({
      action: "rate_updated",
      actor,
      sessionId: "",
      staffUid: cleanUid,
      before: { hourlyRateCents: before },
      after: { hourlyRateCents: rateCents },
    }));
  });
  return { staffUid: cleanUid, hourlyRateCents: rateCents };
}

async function reviewWorkSession({ actor, sessionId, decision, reason = "", hourlyRate }) {
  const cleanId = String(sessionId || "").trim();
  if (!cleanId) throw httpError(400, "Work session required");
  if (!["approve", "reject"].includes(decision)) throw httpError(400, "Valid decision required");
  const sessionRef = db.collection("workSessions").doc(cleanId);
  const auditRef = db.collection("workTimeAudit").doc();
  const nowIso = new Date().toISOString();

  return db.runTransaction(async transaction => {
    const sessionSnap = await transaction.get(sessionRef);
    if (!sessionSnap.exists) throw httpError(404, "Work session not found");
    const before = sessionSnap.data();
    if (before.status !== "closed") throw httpError(409, "Only closed sessions can be reviewed");
    if (before.approvalStatus !== "pending") {
      throw httpError(409, "Session was already reviewed; adjust it before a new review");
    }
    await assertFinancialDateOpen(transaction, before.startedDate || before.startedAt);

    let rateCents = Number(before.hourlyRateCents || 0);
    if (decision === "approve") {
      if (String(hourlyRate ?? "").trim()) {
        try {
          rateCents = hourlyRateCents(hourlyRate);
        } catch (error) {
          throw httpError(400, error.message);
        }
      } else if (!rateCents) {
        const userSnap = await transaction.get(db.collection("users").doc(before.staffUid));
        rateCents = Number(userSnap.data()?.workHourlyRateCents || 0);
      }
      if (!rateCents) throw httpError(409, "Set an hourly rate before approval");
    }

    const after = {
      ...before,
      approvalStatus: decision === "approve" ? "approved" : "rejected",
      approvalReason: cleanText(reason, 500),
      reviewedAt: nowIso,
      reviewedBy: actorSnapshot(actor),
      hourlyRateCents: decision === "approve" ? rateCents : 0,
      payAmountCents: decision === "approve"
        ? payAmountCents(Number(before.durationMinutes || 0), rateCents)
        : 0,
      updatedAt: nowIso,
    };
    transaction.set(sessionRef, after);
    transaction.set(auditRef, workTimeAuditPayload({
      action: decision === "approve" ? "session_approved" : "session_rejected",
      actor,
      sessionId: cleanId,
      staffUid: before.staffUid,
      before,
      after,
      reason,
    }));
    return { session: { id: cleanId, ...after } };
  });
}

async function adjustWorkSession({ actor, sessionId, startedAt, endedAt, breakMinutes = 0, note = "", reason = "" }) {
  const cleanId = String(sessionId || "").trim();
  if (!cleanId) throw httpError(400, "Work session required");
  if (!cleanText(reason, 500)) throw httpError(400, "Adjustment reason required");
  const sessionRef = db.collection("workSessions").doc(cleanId);
  const auditRef = db.collection("workTimeAudit").doc();
  const nowIso = new Date().toISOString();
  return db.runTransaction(async transaction => {
    const sessionSnap = await transaction.get(sessionRef);
    if (!sessionSnap.exists) throw httpError(404, "Work session not found");
    const before = sessionSnap.data();
    await assertFinancialDateOpen(transaction, before.startedDate || before.startedAt);
    let openPointerSnap = null;
    if (before.status === "open") {
      openPointerSnap = await transaction.get(openWorkSessionRef(before.staffUid));
    }
    const nextStart = String(startedAt || before.startedAt || "");
    const nextEnd = String(endedAt || before.endedAt || "");
    if (!nextEnd) throw httpError(400, "End time required");
    let durationMinutes;
    try {
      durationMinutes = workDurationMinutes({
        startedAt: nextStart,
        endedAt: nextEnd,
        breakMinutes: Number(breakMinutes || 0),
      });
    } catch (error) {
      throw httpError(400, error.message);
    }
    const after = {
      ...before,
      startedAt: new Date(nextStart).toISOString(),
      startedDate: localDate(new Date(nextStart), APP_TIME_ZONE),
      endedAt: new Date(nextEnd).toISOString(),
      status: "closed",
      breakMinutes: Number(breakMinutes || 0),
      durationMinutes,
      note: cleanText(note || before.note, 500),
      approvalStatus: "pending",
      approvalReason: "",
      hourlyRateCents: 0,
      payAmountCents: 0,
      reviewedAt: "",
      reviewedBy: null,
      updatedAt: nowIso,
    };
    transaction.set(sessionRef, after);
    if (openPointerSnap?.data()?.sessionId === cleanId) {
      transaction.delete(openWorkSessionRef(before.staffUid));
    }
    transaction.set(auditRef, workTimeAuditPayload({
      action: "session_adjusted",
      actor,
      sessionId: cleanId,
      staffUid: before.staffUid,
      before,
      after,
      reason,
    }));
    return { session: { id: cleanId, ...after } };
  });
}

async function commitInChunks(writes, chunkSize = 400) {
  for (let index = 0; index < writes.length; index += chunkSize) {
    const batch = db.batch();
    writes.slice(index, index + chunkSize).forEach(write => {
      if (write.type === "set") batch.set(write.ref, write.data, write.options || {});
      if (write.type === "update") batch.update(write.ref, write.data);
    });
    await batch.commit();
  }
}

const teacherScopeMigrationRef = () => db.collection("securityMigrations").doc("teacherUidV1");

async function teacherScopeMigrationPlan() {
  const [usersSnap, studentsSnap, lessonsSnap, scheduleSnap] = await Promise.all([
    db.collection("users").get(),
    db.collection("students").get(),
    db.collection("lessons").get(),
    db.collection("schedule").get(),
  ]);
  const records = snapshot => snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  return planTeacherScopeBackfill({
    users: records(usersSnap),
    students: records(studentsSnap),
    lessons: records(lessonsSnap),
    schedule: records(scheduleSnap),
  });
}

function publicTeacherScopePlan(plan) {
  return {
    readyToApply: plan.readyToApply,
    summary: plan.summary,
    directoryConflicts: plan.directoryConflicts,
    unresolved: Object.fromEntries(Object.entries(plan.unresolved).map(([name, records]) => [name, records.slice(0, 100)])),
    unresolvedTruncated: Object.fromEntries(Object.entries(plan.unresolved).map(([name, records]) => [name, records.length > 100])),
    unassigned: Object.fromEntries(Object.entries(plan.unassigned).map(([name, records]) => [name, records.slice(0, 100)])),
    unassignedTruncated: Object.fromEntries(Object.entries(plan.unassigned).map(([name, records]) => [name, records.length > 100])),
  };
}

async function applyTeacherScopeBackfill({ actor }) {
  const currentSnapshot = await teacherScopeMigrationRef().get();
  if (currentSnapshot.exists && currentSnapshot.data()?.readEnforced === true) {
    throw httpError(409, "Roll back teacher scope enforcement before applying the backfill again");
  }
  const plan = await teacherScopeMigrationPlan();
  if (!plan.readyToApply) {
    const error = httpError(409, "Teacher UID migration has unresolved or ambiguous records");
    error.details = publicTeacherScopePlan(plan);
    throw error;
  }
  const nowIso = new Date().toISOString();
  const writes = [];
  Object.entries(plan.patches).forEach(([collectionName, patches]) => {
    patches.forEach(patch => writes.push({
      type: "set",
      ref: db.collection(collectionName).doc(patch.id),
      data: {
        ...patch.data,
        teacherUidMigrationVersion: 1,
        teacherUidMigratedAt: nowIso,
      },
      options: { merge: true },
    }));
  });
  await commitInChunks(writes);
  const actorData = actorSnapshot(actor);
  await db.collection("securityConfig").doc("teacherDirectoryV1").set({
    version: 1,
    teachers: plan.teacherDirectory,
    updatedAt: nowIso,
    updatedBy: actorData,
  });
  await teacherScopeMigrationRef().set({
    version: 1,
    status: "backfilled",
    backfillComplete: true,
    readEnforced: false,
    summary: plan.summary,
    appliedWrites: writes.length,
    appliedAt: nowIso,
    appliedBy: actorData,
    updatedAt: nowIso,
  }, { merge: true });
  return { ...publicTeacherScopePlan(plan), appliedWrites: writes.length, readEnforced: false };
}

async function setTeacherScopeReadEnforcement({ actor, enabled }) {
  const nowIso = new Date().toISOString();
  const currentSnapshot = await teacherScopeMigrationRef().get();
  const current = currentSnapshot.exists ? currentSnapshot.data() : {};
  if (enabled) {
    const directorySnapshot = await db.collection("securityConfig").doc("teacherDirectoryV1").get();
    if (current.backfillComplete !== true || !directorySnapshot.exists) {
      throw httpError(409, "Teacher UID backfill must be applied before read enforcement");
    }
    const plan = await teacherScopeMigrationPlan();
    const patchCount = Object.values(plan.patches).reduce((sum, patches) => sum + patches.length, 0);
    if (!plan.readyToApply || patchCount > 0) {
      const error = httpError(409, "Teacher UID backfill must be complete before read enforcement");
      error.details = publicTeacherScopePlan(plan);
      throw error;
    }
  }
  if (!enabled && current.readEnforced !== true) {
    return { readEnforced: false, updatedAt: current.updatedAt || "", changed: false };
  }
  const backfillComplete = enabled ? true : current.backfillComplete === true;
  const actorData = actorSnapshot(actor);
  await teacherScopeMigrationRef().set({
    version: 1,
    status: enabled ? "enforced" : (backfillComplete ? "backfilled" : "not_started"),
    backfillComplete,
    readEnforced: Boolean(enabled),
    updatedAt: nowIso,
    updatedBy: actorData,
    ...(enabled
      ? { enforcedAt: nowIso, enforcedBy: actorData }
      : { rolledBackAt: nowIso, rolledBackBy: actorData }),
  }, { merge: true });
  return { readEnforced: Boolean(enabled), updatedAt: nowIso, changed: true };
}

async function recordStaffProgramHeartbeat({ actor, pageInstanceId = "", area = "" }) {
  const staff = actorSnapshot(actor);
  const cleanInstanceId = cleanText(pageInstanceId, 120);
  if (!cleanInstanceId || !/^[A-Za-z0-9_-]+$/.test(cleanInstanceId)) {
    throw httpError(400, "Valid page instance required");
  }
  const now = new Date();
  const nowIso = now.toISOString();
  const date = localDate(now, APP_TIME_ZONE);
  const dayRef = db.collection("staffProgramDays").doc(`${staff.uid}_${date}`);
  const presenceRef = staffProgramPresenceRef(staff.uid);

  return db.runTransaction(async transaction => {
    const [presenceSnap, daySnap] = await Promise.all([
      transaction.get(presenceRef),
      transaction.get(dayRef),
    ]);
    const previous = presenceSnap.exists ? presenceSnap.data() : {};
    const existingDay = daySnap.exists ? daySnap.data() : {};
    const creditedSeconds = previous.date === date
      ? heartbeatDeltaSeconds(previous.lastHeartbeatAt, nowIso)
      : 0;
    const activeSeconds = Math.max(0, Number(existingDay.activeSeconds) || 0) + creditedSeconds;
    const heartbeatCount = Math.max(0, Number(existingDay.heartbeatCount) || 0) + 1;

    transaction.set(dayRef, {
      staffUid: staff.uid,
      staffName: staff.name,
      staffRole: staff.role,
      date,
      activeSeconds,
      heartbeatCount,
      firstActiveAt: existingDay.firstActiveAt || nowIso,
      lastActiveAt: nowIso,
      updatedAt: nowIso,
    }, { merge: true });
    transaction.set(presenceRef, {
      staffUid: staff.uid,
      date,
      lastHeartbeatAt: nowIso,
      lastPageInstanceId: cleanInstanceId,
      lastArea: cleanText(area, 120),
      updatedAt: nowIso,
    });

    return {
      date,
      activeSeconds,
      creditedSeconds,
      heartbeatCount,
    };
  });
}

async function refreshOperationalAlerts({ actor = null } = {}) {
  const now = new Date();
  const nowIso = now.toISOString();
  const todayIso = localDate(now, APP_TIME_ZONE);
  const [invoiceSnap, taskSnap, sessionSnap, userSnap, existingSnap] = await Promise.all([
    db.collection("invoices").get(),
    db.collection("tasks").get(),
    db.collection("workSessions").get(),
    db.collection("users").get(),
    db.collection("assistantAlerts").get(),
  ]);
  const mapDocs = snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const alerts = buildOperationalAlerts({
    invoices: mapDocs(invoiceSnap),
    tasks: mapDocs(taskSnap),
    workSessions: mapDocs(sessionSnap),
    users: mapDocs(userSnap),
    nowIso,
    todayIso,
  });
  const activeIds = new Set(alerts.map(alert => alert.id));
  const existingById = new Map(existingSnap.docs.map(doc => [doc.id, doc.data()]));
  const writes = alerts.map(alert => ({
    type: "set",
    ref: db.collection("assistantAlerts").doc(alert.id),
    data: {
      ...alert,
      active: true,
      firstDetectedAt: existingById.get(alert.id)?.firstDetectedAt || nowIso,
      lastDetectedAt: nowIso,
      refreshedAt: nowIso,
      refreshedBy: actor ? actorSnapshot(actor) : { uid: "system", role: "system" },
      resolvedAt: "",
    },
    options: { merge: true },
  }));
  existingSnap.docs.forEach(doc => {
    if (doc.data()?.active && !activeIds.has(doc.id)) {
      writes.push({
        type: "update",
        ref: doc.ref,
        data: { active: false, resolvedAt: nowIso, refreshedAt: nowIso },
      });
    }
  });
  if (writes.length) await commitInChunks(writes);
  return {
    activeCount: alerts.length,
    criticalCount: alerts.filter(alert => alert.severity === "critical").length,
    refreshedAt: nowIso,
  };
}

const STUDENT_REFERENCE_COLLECTIONS = [
  "lessons",
  "homework",
  "schedule",
  "messages",
  "worksheetAssignments",
  "exerciseResults",
  "invoices",
  "liveClassrooms",
  "studentPackages",
  "studentTariffAssignments",
  "payments",
  "paymentLineAllocations",
  "payerCredits",
];
const STUDENT_ID_DOCUMENT_COLLECTIONS = [
  "studentInitialAssessments",
  "studentRevenuePlans",
];

async function getStudentMergeCandidates(input) {
  let normalized;
  try {
    normalized = normalizedStudentMergeInput(input);
  } catch (error) {
    throw httpError(400, error.message);
  }
  const ids = [normalized.primaryStudentId, ...normalized.duplicateStudentIds];
  const snapshots = await db.getAll(...ids.map(id => db.collection("students").doc(id)));
  const missingIds = snapshots.filter(snapshot => !snapshot.exists).map(snapshot => snapshot.id);
  if (missingIds.length) {
    const error = httpError(404, "Student profile not found");
    error.details = { missingIds };
    throw error;
  }
  const students = snapshots.map(snapshot => ({ id: snapshot.id, ...snapshot.data() }));
  const primary = students[0];
  if (primary.active === false && primary.mergedIntoStudentId) {
    throw httpError(409, "The selected primary profile is already archived");
  }
  const invalidDuplicates = students.slice(1).filter(student =>
    student.mergedIntoStudentId && student.mergedIntoStudentId !== primary.id
  );
  if (invalidDuplicates.length) {
    const error = httpError(409, "A duplicate is already linked to another primary profile");
    error.details = { duplicateIds: invalidDuplicates.map(student => student.id) };
    throw error;
  }
  const userSnapshots = await db.getAll(...ids.map(id => db.collection("users").doc(id)));
  const userDocumentIds = userSnapshots.filter(snapshot => snapshot.exists).map(snapshot => snapshot.id);
  return { ...normalized, students, primary, duplicates: students.slice(1), userDocumentIds };
}

async function studentMergePlan(input) {
  const candidates = await getStudentMergeCandidates(input);
  const duplicateIds = candidates.duplicateStudentIds;
  const ownership = studentMergeOwnership(candidates.students, candidates.userDocumentIds);
  const profileData = mergeStudentProfileData(candidates.primary, candidates.duplicates);
  const documents = [];
  for (const collectionName of STUDENT_REFERENCE_COLLECTIONS) {
    for (let index = 0; index < duplicateIds.length; index += 10) {
      const ids = duplicateIds.slice(index, index + 10);
      const snapshot = await db.collection(collectionName).where("studentId", "in", ids).get();
      snapshot.docs.forEach(doc => documents.push({ collectionName, id: doc.id }));
    }
  }
  const groupsById = new Map();
  for (const duplicateId of duplicateIds) {
    const snapshot = await db.collection("groups").where("students", "array-contains", duplicateId).get();
    snapshot.docs.forEach(doc => groupsById.set(doc.id, { id: doc.id, ...doc.data() }));
  }
  const singletonDocuments = [];
  for (const collectionName of STUDENT_ID_DOCUMENT_COLLECTIONS) {
    const primarySnapshot = await db.collection(collectionName).doc(candidates.primaryStudentId).get();
    let primaryWillExist = primarySnapshot.exists;
    for (const duplicateId of duplicateIds) {
      const sourceSnapshot = await db.collection(collectionName).doc(duplicateId).get();
      if (sourceSnapshot.exists) {
        singletonDocuments.push({
          collectionName,
          sourceId: duplicateId,
          copyToPrimary: !primaryWillExist,
          conflict: primaryWillExist,
        });
        primaryWillExist = true;
      }
    }
  }
  const counts = documents.reduce((result, document) => {
    result[document.collectionName] = (result[document.collectionName] || 0) + 1;
    return result;
  }, {});
  return {
    ...candidates,
    ownership,
    documents,
    groups: [...groupsById.values()],
    singletonDocuments,
    publicPlan: {
      primary: {
        id: candidates.primary.id,
        name: candidates.primary.name || "",
        email: candidates.primary.email || candidates.primary.parentEmail || "",
      },
      duplicates: candidates.duplicates.map(student => ({
        id: student.id,
        name: student.name || "",
        email: student.email || student.parentEmail || "",
      })),
      linkedStudentAccountCount: ownership.linkedUserIds.length,
      linkedParentAccountCount: ownership.linkedParentIds.length,
      dependentDocumentCounts: counts,
      groupCount: groupsById.size,
      copiedProfileDocumentCount: singletonDocuments.filter(item => item.copyToPrimary).length,
      profileConflictCount: singletonDocuments.filter(item => item.conflict).length,
      preservedProfileCount: profileData.snapshots.length,
      profileConflicts: profileData.conflicts,
      preservedAliases: {
        names: profileData.patch.nameAliases,
        emails: profileData.patch.emailAliases,
        phones: profileData.patch.phoneAliases,
      },
      totalReferenceCount: documents.length + groupsById.size + singletonDocuments.length,
    },
    profileData,
  };
}

async function previewStudentMerge(input) {
  const plan = await studentMergePlan(input);
  return plan.publicPlan;
}

async function applyStudentMerge({ actor, primaryStudentId, duplicateStudentIds, requestId }) {
  const mutationId = cleanRequestId(requestId);
  let normalizedInput;
  try {
    normalizedInput = normalizedStudentMergeInput({ primaryStudentId, duplicateStudentIds });
  } catch (error) {
    throw httpError(400, error.message);
  }
  const operationRef = db.collection("studentMergeOperations").doc(mutationId);
  const existing = await operationRef.get();
  if (existing.exists) {
    const data = existing.data();
    if (data.primaryStudentId !== normalizedInput.primaryStudentId
      || JSON.stringify(data.duplicateStudentIds || []) !== JSON.stringify(normalizedInput.duplicateStudentIds)) {
      throw httpError(409, "requestId already used for another student merge");
    }
    if (data.status === "complete") return { ...data.result, idempotent: true };
  }

  const plan = await studentMergePlan(normalizedInput);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  await operationRef.set({
    status: "running",
    primaryStudentId: plan.primaryStudentId,
    duplicateStudentIds: plan.duplicateStudentIds,
    preview: plan.publicPlan,
    startedAt: existing.exists ? existing.data().startedAt || nowIso : nowIso,
    updatedAt: nowIso,
    actor: actorData,
  }, { merge: true });

  try {
    const writes = plan.documents.map(document => ({
      type: "set",
      ref: db.collection(document.collectionName).doc(document.id),
      data: {
        studentId: plan.primaryStudentId,
        studentName: plan.primary.name || "",
        mergedFromStudentIds: FieldValue.arrayUnion(...plan.duplicateStudentIds),
        mergedStudentAt: nowIso,
        mergedStudentBy: actorData,
      },
      options: { merge: true },
    }));
    plan.groups.forEach(group => {
      writes.push({
        type: "set",
        ref: db.collection("groups").doc(group.id),
        data: {
          ...mergeGroupStudentReferences(group, plan.primaryStudentId, plan.duplicateStudentIds),
          mergedStudentAt: nowIso,
        },
        options: { merge: true },
      });
    });
    for (const item of plan.singletonDocuments.filter(document => document.copyToPrimary)) {
      const source = await db.collection(item.collectionName).doc(item.sourceId).get();
      if (!source.exists) continue;
      writes.push({
        type: "set",
        ref: db.collection(item.collectionName).doc(plan.primaryStudentId),
        data: {
          ...source.data(),
          studentId: plan.primaryStudentId,
          copiedFromStudentId: item.sourceId,
          mergedStudentAt: nowIso,
        },
        options: { merge: true },
      });
    }
    if (writes.length) await commitInChunks(writes);

    const primaryRef = db.collection("students").doc(plan.primaryStudentId);
    await db.runTransaction(async transaction => {
      const operationSnapshot = await transaction.get(operationRef);
      if (operationSnapshot.data()?.status === "complete") return;
      transaction.set(primaryRef, {
        ...plan.profileData.patch,
        linkedUserIds: plan.ownership.linkedUserIds,
        linkedParentIds: plan.ownership.linkedParentIds,
        profileConflictFields: plan.profileData.conflicts.map(conflict => conflict.field),
        mergedDuplicateIds: FieldValue.arrayUnion(...plan.duplicateStudentIds),
        active: true,
        mergedAt: nowIso,
        mergedBy: actorData,
        updatedAt: nowIso,
      }, { merge: true });
      plan.duplicates.forEach(duplicate => {
        transaction.set(db.collection("students").doc(duplicate.id), {
          active: false,
          mergedIntoStudentId: plan.primaryStudentId,
          mergedIntoStudentName: plan.primary.name || "",
          mergedAt: nowIso,
          mergedBy: actorData,
          updatedAt: nowIso,
        }, { merge: true });
      });
      const result = {
        ...plan.publicPlan,
        operationId: mutationId,
        completedAt: nowIso,
      };
      transaction.set(operationRef, {
        status: "complete",
        result,
        completedAt: nowIso,
        updatedAt: nowIso,
      }, { merge: true });
      transaction.set(db.collection("activityLog").doc(`student-merge-${mutationId}`), {
        type: "student.duplicates_merged",
        action: "student.duplicates_merged",
        studentId: plan.primaryStudentId,
        studentName: plan.primary.name || "",
        duplicateStudentIds: plan.duplicateStudentIds,
        linkedUserIds: plan.ownership.linkedUserIds,
        linkedParentIds: plan.ownership.linkedParentIds,
        actor: actorData,
        createdAt: nowIso,
        operationId: mutationId,
      });
    });
    return { ...plan.publicPlan, operationId: mutationId, completedAt: nowIso, idempotent: false };
  } catch (error) {
    await operationRef.set({ status: "failed", error: cleanText(error.message, 500), updatedAt: new Date().toISOString() }, { merge: true });
    throw error;
  }
}

async function mergeParentAccounts({ actor, primaryParentId, duplicateParentIds, requestId, preview = false }) {
  const primaryId = cleanText(primaryParentId, 180);
  const duplicateIds = uniqueIds(duplicateParentIds).filter(id => id !== primaryId);
  if (!primaryId || !duplicateIds.length) throw httpError(400, "Primary parent and duplicate accounts required");
  const allParentIds = [primaryId, ...duplicateIds];
  const userSnapshots = await db.getAll(...allParentIds.map(id => db.collection("users").doc(id)));
  const missingIds = userSnapshots.filter(snapshot => !snapshot.exists).map(snapshot => snapshot.id);
  if (missingIds.length) {
    const error = httpError(404, "Parent account not found");
    error.details = { missingIds };
    throw error;
  }
  const studentsById = new Map();
  for (const parentId of allParentIds) {
    for (const field of ["linkedParentId", "parentUid", "guardianUid"]) {
      const snapshot = await db.collection("students").where(field, "==", parentId).get();
      snapshot.docs.forEach(doc => studentsById.set(doc.id, { id: doc.id, ...doc.data() }));
    }
    const arraySnapshot = await db.collection("students").where("linkedParentIds", "array-contains", parentId).get();
    arraySnapshot.docs.forEach(doc => studentsById.set(doc.id, { id: doc.id, ...doc.data() }));
  }
  const publicPlan = { primaryParentId: primaryId, duplicateParentIds: duplicateIds, studentProfileCount: studentsById.size };
  if (preview) return publicPlan;
  const mutationId = cleanRequestId(requestId);
  const operationRef = db.collection("parentMergeOperations").doc(mutationId);
  const previous = await operationRef.get();
  if (previous.exists) {
    const previousData = previous.data() || {};
    if (previousData.primaryParentId !== primaryId
      || JSON.stringify(previousData.duplicateParentIds || []) !== JSON.stringify(duplicateIds)) {
      throw httpError(409, "requestId already used for another parent merge");
    }
    if (previousData.status === "complete") return { ...previousData.result, idempotent: true };
  }
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  const writes = [...studentsById.values()].map(student => ({
    type: "set",
    ref: db.collection("students").doc(student.id),
    data: {
      linkedParentId: primaryId,
      parentUid: primaryId,
      linkedParentIds: uniqueIds([parentAccountIds(student), allParentIds]),
      updatedAt: nowIso,
    },
    options: { merge: true },
  }));
  duplicateIds.forEach(parentId => writes.push({
    type: "set",
    ref: db.collection("users").doc(parentId),
    data: { active: false, mergedIntoParentId: primaryId, parentMergedAt: nowIso, parentMergedBy: actorData },
    options: { merge: true },
  }));
  writes.push({
    type: "set",
    ref: db.collection("users").doc(primaryId),
    data: { mergedDuplicateParentIds: FieldValue.arrayUnion(...duplicateIds), parentMergedAt: nowIso, parentMergedBy: actorData },
    options: { merge: true },
  });
  await operationRef.set({ status: "running", ...publicPlan, actor: actorData, startedAt: nowIso });
  await commitInChunks(writes);
  const result = { ...publicPlan, operationId: mutationId, completedAt: nowIso };
  await operationRef.set({ status: "complete", result, completedAt: nowIso, updatedAt: nowIso }, { merge: true });
  return { ...result, idempotent: false };
}

async function studentOwnershipBackfill({ actor, apply = false }) {
  const [studentSnapshot, userSnapshot] = await Promise.all([
    db.collection("students").get(),
    db.collection("users").get(),
  ]);
  const userIds = new Set(userSnapshot.docs.map(doc => doc.id));
  const students = new Map(studentSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const ownershipByPrimary = new Map();
  const unresolved = [];
  const targetFor = student => {
    if (!student.mergedIntoStudentId) return student.id;
    const target = students.get(student.mergedIntoStudentId);
    if (!target) {
      unresolved.push({ studentId: student.id, missingPrimaryStudentId: student.mergedIntoStudentId });
      return "";
    }
    return target.id;
  };
  students.forEach(student => {
    const targetId = targetFor(student);
    if (!targetId) return;
    const current = ownershipByPrimary.get(targetId) || { linkedUserIds: [], linkedParentIds: [] };
    current.linkedUserIds = uniqueIds([
      current.linkedUserIds,
      studentAccountIds(student),
      userIds.has(student.id) ? student.id : "",
    ]);
    current.linkedParentIds = uniqueIds([current.linkedParentIds, parentAccountIds(student)]);
    ownershipByPrimary.set(targetId, current);
  });
  const patches = [];
  ownershipByPrimary.forEach((ownership, studentId) => {
    const student = students.get(studentId) || {};
    const sameUsers = JSON.stringify(uniqueIds(student.linkedUserIds).sort()) === JSON.stringify([...ownership.linkedUserIds].sort());
    const sameParents = JSON.stringify(uniqueIds(student.linkedParentIds).sort()) === JSON.stringify([...ownership.linkedParentIds].sort());
    if (!sameUsers || !sameParents) patches.push({ studentId, ...ownership });
  });
  const result = {
    studentCount: students.size,
    patchCount: patches.length,
    unresolvedCount: unresolved.length,
    unresolved: unresolved.slice(0, 100),
    patches: apply ? undefined : patches.slice(0, 100),
  };
  if (!apply || !patches.length) return result;
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  await commitInChunks(patches.map(patch => ({
    type: "set",
    ref: db.collection("students").doc(patch.studentId),
    data: {
      linkedUserIds: patch.linkedUserIds,
      linkedParentIds: patch.linkedParentIds,
      ownershipBackfilledAt: nowIso,
      ownershipBackfilledBy: actorData,
      updatedAt: nowIso,
    },
    options: { merge: true },
  })));
  await db.collection("securityMigrations").doc("studentOwnershipV2").set({
    version: 2,
    status: unresolved.length ? "applied_with_warnings" : "complete",
    appliedAt: nowIso,
    appliedBy: actorData,
    patchCount: patches.length,
    unresolved,
  }, { merge: true });
  return { ...result, appliedAt: nowIso };
}

async function listFirebaseAuthUsers() {
  const users = [];
  let pageToken;
  do {
    const page = await admin.auth().listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

async function previewDataQuality() {
  const [studentSnap, lessonSnap, invoiceSnap, groupSnap, userSnap, authUsers] = await Promise.all([
    db.collection("students").get(),
    db.collection("lessons").get(),
    db.collection("invoices").get(),
    db.collection("groups").get(),
    db.collection("users").get(),
    listFirebaseAuthUsers(),
  ]);
  const records = snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const students = records(studentSnap);
  const lessons = records(lessonSnap);
  const invoices = records(invoiceSnap);
  const groups = records(groupSnap);
  const userProfiles = new Map(records(userSnap).map(profile => [profile.id, profile]));
  const studentIds = new Set(students.map(student => student.id));
  const accountLinks = new Map();
  students.forEach(student => {
    studentAccountIds(student).forEach(uid => {
      const links = accountLinks.get(uid) || [];
      links.push({ studentId: student.id, studentName: student.name || "", relationship: "student" });
      accountLinks.set(uid, links);
    });
    parentAccountIds(student).forEach(uid => {
      const links = accountLinks.get(uid) || [];
      links.push({ studentId: student.id, studentName: student.name || "", relationship: "parent" });
      accountLinks.set(uid, links);
    });
  });
  const lessonQuality = classifyLessonDataQuality({ lessons, students, groups });
  const lessonSummary = lesson => ({
    id: lesson.id,
    studentId: lesson.studentId || "",
    studentName: lesson.studentName || lesson.name || "",
    groupId: lesson.groupId || "",
    groupName: lesson.groupName || "",
    date: lesson.date || lesson.lessonDate || "",
    teacher: lesson.teacher || "",
    status: lesson.status || "",
  });
  const orphanLessons = lessonQuality.orphanLessons.map(lessonSummary);
  const groupLessonsNeedingLink = lessonQuality.groupLessonsNeedingLink.map(lesson => ({
    ...lessonSummary(lesson),
    suggestedGroupId: lesson.suggestedGroupId || "",
    suggestedGroupName: lesson.suggestedGroupName || "",
    exactGroupMatch: lesson.exactGroupMatch === true,
    groupMatchCount: lesson.groupMatchCount || 0,
  }));
  const orphanInvoices = invoices.filter(invoice => {
    if (invoice.invoiceTargetType === "parent") return false;
    return !invoice.studentId || !studentIds.has(invoice.studentId);
  }).map(invoice => ({
    id: invoice.id,
    number: invoice.num || invoice.number || "",
    studentId: invoice.studentId || "",
    studentName: invoice.studentName || "",
    date: invoice.date || "",
    due: invoice.due || "",
    amount: Number(invoice.amount) || (Number(invoice.amountCents) || 0) / 100,
    status: invoice.status || "",
  }));
  const invalidInvoiceDates = invoices.filter(invoice =>
    /^\d{4}-\d{2}-\d{2}$/.test(String(invoice.date || ""))
      && /^\d{4}-\d{2}-\d{2}$/.test(String(invoice.due || ""))
      && invoice.due < invoice.date
  ).map(invoice => ({
    id: invoice.id,
    number: invoice.num || invoice.number || "",
    studentId: invoice.studentId || "",
    studentName: invoice.studentName || "",
    date: invoice.date,
    due: invoice.due,
  }));
  const accounts = authUsers.map(authUser => {
    const profile = userProfiles.get(authUser.uid) || {};
    const roles = [...collectTrustedRoles(profile, authUser.customClaims || {})];
    return {
      uid: authUser.uid,
      email: authUser.email || profile.email || "",
      displayName: authUser.displayName || profile.displayName || profile.name || "",
      disabled: authUser.disabled === true || profile.disabled === true,
      role: profile.role || "",
      roles: uniqueIds([roles, profile.roles]),
      financeAccess: roles.includes("admin") || SUPER_ADMIN_EMAILS.has(String(authUser.email || "").toLowerCase()),
      links: accountLinks.get(authUser.uid) || [],
      createdAt: authUser.metadata?.creationTime || "",
      lastSignInAt: authUser.metadata?.lastSignInTime || "",
    };
  });
  const unlinkedAccounts = accounts.filter(account => {
    if (account.links.length || account.disabled) return false;
    if (account.roles.some(role => STAFF_ROLES.has(role))) return false;
    return account.role === "student" || account.role === "parent" || account.roles.includes("student") || account.roles.includes("parent");
  });
  const duplicateGroups = findStudentDuplicateGroups(students);
  return {
    generatedAt: new Date().toISOString(),
    students: students.filter(student => student.active !== false).map(student => ({
      id: student.id,
      name: student.name || "",
      email: student.email || student.contactEmail || "",
      linkedUserIds: studentAccountIds(student),
      linkedParentIds: parentAccountIds(student),
    })),
    groups: groups.filter(group => group.active !== false).map(group => ({
      id: group.id,
      name: group.name || "",
      teacher: group.teacher || "",
      studentCount: Array.isArray(group.students) ? group.students.length : 0,
    })),
    orphanLessons,
    groupLessonsNeedingLink,
    orphanInvoices,
    invalidInvoiceDates,
    unlinkedAccounts,
    accounts,
    duplicateGroups,
    summary: {
      orphanLessonCount: orphanLessons.length,
      groupLessonLinkCount: groupLessonsNeedingLink.length,
      linkedGroupLessonCount: lessonQuality.linkedGroupLessonCount,
      orphanInvoiceCount: orphanInvoices.length,
      invalidInvoiceDateCount: invalidInvoiceDates.length,
      unlinkedAccountCount: unlinkedAccounts.length,
      duplicateGroupCount: duplicateGroups.length,
    },
  };
}

async function linkDataQualityGroupLesson({ actor, lessonId, groupId, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanLessonId = cleanText(lessonId, 180);
  const cleanGroupId = cleanText(groupId, 180);
  if (!cleanLessonId || !cleanGroupId) throw httpError(400, "Exact lesson and group IDs required");
  const lessonRef = db.collection("lessons").doc(cleanLessonId);
  const groupRef = db.collection("groups").doc(cleanGroupId);
  const auditRef = db.collection("activityLog").doc(`group-lesson-link-${mutationId}`);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  return db.runTransaction(async transaction => {
    const [existingAudit, lessonSnap, groupSnap] = await Promise.all([
      transaction.get(auditRef),
      transaction.get(lessonRef),
      transaction.get(groupRef),
    ]);
    if (existingAudit.exists) return { idempotent: true, lessonId: cleanLessonId, groupId: cleanGroupId };
    if (!lessonSnap.exists) throw httpError(404, "Lesson not found");
    if (!groupSnap.exists || groupSnap.data().active === false) throw httpError(404, "Active group not found");
    const lesson = lessonSnap.data();
    const group = groupSnap.data();
    const currentGroupId = String(lesson.groupId || "").trim();
    if (currentGroupId && currentGroupId !== cleanGroupId) throw httpError(409, "Lesson is already linked to another group");
    const lessonGroupName = lesson.groupName || lesson.studentName || lesson.name || "";
    if (normalizedIdentity(lessonGroupName) !== normalizedIdentity(group.name)) {
      throw httpError(409, "Lesson and group names must match exactly");
    }
    if (lesson.date) await assertFinancialDateOpen(transaction, lesson.date);
    transaction.set(lessonRef, {
      groupId: cleanGroupId,
      groupName: group.name || "",
      isGroup: true,
      lessonAudienceType: "group",
      groupLinkCorrectedAt: nowIso,
      groupLinkCorrectedBy: actorData,
      groupLinkCorrectionId: mutationId,
      previousGroupId: currentGroupId,
      updatedAt: nowIso,
    }, { merge: true });
    transaction.create(auditRef, {
      type: "lesson.group_link_corrected",
      action: "lesson.group_link_corrected",
      entityType: "lesson",
      entityId: cleanLessonId,
      previousGroupId: currentGroupId,
      groupId: cleanGroupId,
      groupName: group.name || "",
      actor: actorData,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { idempotent: false, lessonId: cleanLessonId, groupId: cleanGroupId, groupName: group.name || "" };
  });
}

async function relinkDataQualityRecord({ actor, entityType, entityId, studentId, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const type = String(entityType || "").trim();
  const collectionName = type === "lesson" ? "lessons" : type === "invoice" ? "invoices" : "";
  if (!collectionName) throw httpError(400, "Valid entityType required");
  const cleanEntityId = cleanText(entityId, 180);
  const cleanStudentId = cleanText(studentId, 180);
  if (!cleanEntityId || !cleanStudentId) throw httpError(400, "Exact entity and student IDs required");
  const entityRef = db.collection(collectionName).doc(cleanEntityId);
  const studentRef = db.collection("students").doc(cleanStudentId);
  const auditRef = db.collection("activityLog").doc(`data-link-${mutationId}`);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  return db.runTransaction(async transaction => {
    const [existingAudit, entitySnap, studentSnap] = await Promise.all([
      transaction.get(auditRef),
      transaction.get(entityRef),
      transaction.get(studentRef),
    ]);
    if (existingAudit.exists) return { idempotent: true, entityId: cleanEntityId, studentId: cleanStudentId };
    if (!entitySnap.exists) throw httpError(404, "Record not found");
    if (!studentSnap.exists || studentSnap.data().active === false) throw httpError(404, "Active student profile not found");
    const entity = entitySnap.data();
    if (type === "lesson" && entity.date) await assertFinancialDateOpen(transaction, entity.date);
    if (type === "invoice" && entity.date) await assertFinancialDateOpen(transaction, entity.date);
    const previousStudentId = entity.studentId || "";
    transaction.set(entityRef, {
      studentId: cleanStudentId,
      studentName: studentSnap.data().name || "",
      dataLinkCorrectedAt: nowIso,
      dataLinkCorrectedBy: actorData,
      dataLinkCorrectionId: mutationId,
      previousStudentId,
      updatedAt: nowIso,
    }, { merge: true });
    transaction.create(auditRef, {
      type: `${type}.student_link_corrected`,
      action: `${type}.student_link_corrected`,
      entityType: type,
      entityId: cleanEntityId,
      previousStudentId,
      studentId: cleanStudentId,
      studentName: studentSnap.data().name || "",
      actor: actorData,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { idempotent: false, entityId: cleanEntityId, studentId: cleanStudentId };
  });
}

async function correctInvoiceDueDate({ actor, invoiceId, due, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanInvoiceId = cleanText(invoiceId, 180);
  const cleanDue = validIsoDate(due, "due");
  const cleanReason = cleanText(reason, 500);
  if (!cleanInvoiceId || !cleanReason) throw httpError(400, "Invoice and correction reason required");
  const invoiceRef = db.collection("invoices").doc(cleanInvoiceId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  return db.runTransaction(async transaction => {
    const [auditSnap, invoiceSnap] = await Promise.all([transaction.get(auditRef), transaction.get(invoiceRef)]);
    if (auditSnap.exists) return { invoice: { id: invoiceSnap.id, ...invoiceSnap.data() }, idempotent: true };
    if (!invoiceSnap.exists) throw httpError(404, "Invoice not found");
    const invoice = invoiceSnap.data();
    await assertFinancialDateOpen(transaction, invoice.date || cleanDue);
    if (invoice.date && cleanDue < invoice.date) throw httpError(400, "Due date cannot be before invoice date");
    const history = [...(Array.isArray(invoice.dueDateHistory) ? invoice.dueDateHistory : []), {
      from: invoice.due || "",
      to: cleanDue,
      reason: cleanReason,
      correctedAt: nowIso,
      correctedBy: actorData,
      requestId: mutationId,
    }].slice(-20);
    transaction.update(invoiceRef, { due: cleanDue, dueDateHistory: history, updatedAt: nowIso });
    transaction.create(auditRef, {
      entityType: "invoice",
      entityId: cleanInvoiceId,
      action: "invoice.due_date_corrected",
      previousDue: invoice.due || "",
      due: cleanDue,
      actor: actorData,
      reason: cleanReason,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { invoice: { id: cleanInvoiceId, ...invoice, due: cleanDue, dueDateHistory: history }, idempotent: false };
  });
}

async function linkAccountToStudent({ actor, uid, studentId, relationship, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanUid = cleanText(uid, 180);
  const cleanStudentId = cleanText(studentId, 180);
  const cleanRelationship = String(relationship || "").trim();
  if (!cleanUid || !cleanStudentId || !["student", "parent"].includes(cleanRelationship)) {
    throw httpError(400, "Exact account, student, and relationship required");
  }
  let authUser;
  try { authUser = await admin.auth().getUser(cleanUid); } catch (error) { throw httpError(404, "Firebase account not found"); }
  const studentRef = db.collection("students").doc(cleanStudentId);
  const userRef = db.collection("users").doc(cleanUid);
  const auditRef = db.collection("activityLog").doc(`account-link-${mutationId}`);
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  return db.runTransaction(async transaction => {
    const [auditSnap, studentSnap, userSnap] = await Promise.all([
      transaction.get(auditRef), transaction.get(studentRef), transaction.get(userRef),
    ]);
    if (auditSnap.exists) return { uid: cleanUid, studentId: cleanStudentId, relationship: cleanRelationship, idempotent: true };
    if (!studentSnap.exists || studentSnap.data().active === false) throw httpError(404, "Active student profile not found");
    const student = studentSnap.data();
    const profile = userSnap.exists ? userSnap.data() : {};
    const existingRole = String(profile.role || "").toLowerCase();
    const profileRoles = uniqueIds([existingRole, profile.studentRole === true ? "student" : "", cleanRelationship]);
    const nextRole = STAFF_ROLES.has(existingRole) ? existingRole : existingRole || cleanRelationship;
    const studentPatch = cleanRelationship === "student" ? {
      linkedUserIds: uniqueIds([studentAccountIds(student), cleanUid]),
      linkedUserId: student.linkedUserId || cleanUid,
      studentUid: student.studentUid || cleanUid,
    } : {
      linkedParentIds: uniqueIds([parentAccountIds(student), cleanUid]),
      linkedParentId: student.linkedParentId || cleanUid,
      parentUid: student.parentUid || cleanUid,
    };
    transaction.set(studentRef, { ...studentPatch, accountLinkedAt: nowIso, accountLinkedBy: actorData, updatedAt: nowIso }, { merge: true });
    transaction.set(userRef, {
      uid: cleanUid,
      email: authUser.email || profile.email || "",
      displayName: authUser.displayName || profile.displayName || profile.name || "",
      role: nextRole,
      roles: profileRoles,
      linkedStudentIds: FieldValue.arrayUnion(cleanStudentId),
      accountLinkedAt: nowIso,
      accountLinkedBy: actorData,
      updatedAt: nowIso,
    }, { merge: true });
    transaction.create(auditRef, {
      type: "account.student_linked",
      action: "account.student_linked",
      uid: cleanUid,
      email: authUser.email || "",
      studentId: cleanStudentId,
      studentName: student.name || "",
      relationship: cleanRelationship,
      actor: actorData,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { uid: cleanUid, studentId: cleanStudentId, relationship: cleanRelationship, idempotent: false };
  });
}

async function setAccountDisabled({ actor, uid, disabled, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanUid = cleanText(uid, 180);
  const nextDisabled = disabled === true;
  const cleanReason = cleanText(reason, 500);
  if (!cleanUid || !cleanReason) throw httpError(400, "Account and reason required");
  if (cleanUid === actor.decoded.uid) throw httpError(409, "You cannot disable your own account");
  const auditRef = db.collection("activityLog").doc(`account-status-${mutationId}`);
  const existingAudit = await auditRef.get();
  if (existingAudit.exists) {
    const data = existingAudit.data();
    if (data.uid !== cleanUid || data.disabled !== nextDisabled) throw httpError(409, "requestId already used for another account change");
    return { uid: cleanUid, disabled: nextDisabled, idempotent: true };
  }
  let authUser;
  try { authUser = await admin.auth().getUser(cleanUid); } catch (error) { throw httpError(404, "Firebase account not found"); }
  if (SUPER_ADMIN_EMAILS.has(String(authUser.email || "").toLowerCase())) throw httpError(409, "Super administrator account cannot be disabled here");
  await admin.auth().updateUser(cleanUid, { disabled: nextDisabled });
  const nowIso = new Date().toISOString();
  const actorData = actorSnapshot(actor);
  await db.collection("users").doc(cleanUid).set({
    disabled: nextDisabled,
    active: !nextDisabled,
    accountStatusChangedAt: nowIso,
    accountStatusChangedBy: actorData,
    accountStatusReason: cleanReason,
    updatedAt: nowIso,
  }, { merge: true });
  await auditRef.create({
    type: nextDisabled ? "account.disabled" : "account.enabled",
    action: nextDisabled ? "account.disabled" : "account.enabled",
    uid: cleanUid,
    email: authUser.email || "",
    disabled: nextDisabled,
    actor: actorData,
    reason: cleanReason,
    createdAt: nowIso,
    requestId: mutationId,
  });
  return { uid: cleanUid, disabled: nextDisabled, idempotent: false };
}

async function teacherFutureScheduleClearPlan({ actor, fromDate, operationId = "preview", includeExternalGoogle = false }) {
  const cleanFromDate = validIsoDate(fromDate, "fromDate");
  const actorData = actorSnapshot(actor);
  const [scheduleSnap, groupsSnap] = await Promise.all([
    db.collection("schedule").get(),
    db.collection("groups").get(),
  ]);
  const records = snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return planTeacherFutureScheduleClear({
    schedule: records(scheduleSnap),
    groups: records(groupsSnap),
    teacherUid: actorData.uid,
    teacherName: actorData.name,
    fromDate: cleanFromDate,
    nowIso: new Date().toISOString(),
    operationId,
    includeExternalGoogle,
  });
}

function publicTeacherFutureScheduleClearPlan(plan) {
  return {
    fromDate: plan.fromDate,
    teacherName: plan.teacherName,
    summary: plan.summary,
  };
}

async function applyTeacherFutureScheduleClear({ actor, fromDate, requestId, confirmed, includeExternalGoogle = false }) {
  if (confirmed !== true) throw httpError(400, "Explicit confirmation required");
  const mutationId = cleanRequestId(requestId);
  const cleanFromDate = validIsoDate(fromDate, "fromDate");
  const actorData = actorSnapshot(actor);
  const auditRef = db.collection("activityLog").doc(`schedule-future-clear-${mutationId}`);
  const existingAudit = await auditRef.get();
  if (existingAudit.exists) {
    const audit = existingAudit.data();
    if (audit.fromDate !== cleanFromDate || audit.actor?.uid !== actorData.uid) {
      throw httpError(409, "requestId already used for another schedule operation");
    }
    return { ...(audit.result || {}), idempotent: true };
  }

  const preview = await teacherFutureScheduleClearPlan({
    actor,
    fromDate: cleanFromDate,
    operationId: mutationId,
    includeExternalGoogle,
  });
  const nowIso = new Date().toISOString();
  const actualKinds = { cancel_single: 0, cancel_series: 0, truncate_series: 0, cancel_external_google: 0 };
  let scheduleCount = 0;
  let groupLessonCount = 0;
  let groupDocumentCount = 0;

  const applyScheduleRecord = async item => db.runTransaction(async transaction => {
    const ref = db.collection("schedule").doc(item.id);
    const snap = await transaction.get(ref);
    if (!snap.exists) return null;
    const currentPlan = planTeacherFutureScheduleClear({
      schedule: [{ id: snap.id, ...snap.data() }],
      groups: [],
      teacherUid: actorData.uid,
      teacherName: actorData.name,
      fromDate: cleanFromDate,
      nowIso,
      operationId: mutationId,
      includeExternalGoogle,
    });
    const current = currentPlan.schedulePatches[0];
    if (!current) return null;
    transaction.update(ref, current.patch);
    return { kind: current.kind, schedule: { id: snap.id, ...snap.data() } };
  });
  for (let index = 0; index < preview.schedulePatches.length; index += 10) {
    const changes = await Promise.all(preview.schedulePatches.slice(index, index + 10).map(applyScheduleRecord));
    for (const change of changes.filter(Boolean)) {
      scheduleCount += 1;
      actualKinds[change.kind] = (actualKinds[change.kind] || 0) + 1;
      if (change.kind === "cancel_external_google") {
        await queueGoogleEventDeletion(change.schedule.id, change.schedule, "Teacher cleared future schedule in KeeleSepp");
      }
    }
  }

  for (const item of preview.groupPatches) {
    const changed = await db.runTransaction(async transaction => {
      const ref = db.collection("groups").doc(item.id);
      const snap = await transaction.get(ref);
      if (!snap.exists) return 0;
      const currentPlan = planTeacherFutureScheduleClear({
        schedule: [],
        groups: [{ id: snap.id, ...snap.data() }],
        teacherUid: actorData.uid,
        teacherName: actorData.name,
        fromDate: cleanFromDate,
        nowIso,
        operationId: mutationId,
      });
      const current = currentPlan.groupPatches[0];
      if (!current) return 0;
      transaction.update(ref, {
        lessons: current.lessons,
        futureScheduleClearedAt: nowIso,
        futureScheduleClearedFrom: cleanFromDate,
        futureScheduleClearedByUid: actorData.uid,
        futureScheduleClearOperationId: mutationId,
        updatedAt: nowIso,
      });
      return current.changedLessonCount;
    });
    if (changed > 0) {
      groupDocumentCount += 1;
      groupLessonCount += changed;
    }
  }

  const summary = {
    scheduleCount,
    groupLessonCount,
    groupDocumentCount,
    totalCount: scheduleCount + groupLessonCount,
    externalGoogleCount: preview.summary.externalGoogleCount,
    cancelledSingleCount: actualKinds.cancel_single || 0,
    cancelledSeriesCount: actualKinds.cancel_series || 0,
    truncatedSeriesCount: actualKinds.truncate_series || 0,
    cancelledExternalGoogleCount: actualKinds.cancel_external_google || 0,
  };
  let googleDeletion = { deleted: 0, failed: 0 };
  if (summary.cancelledExternalGoogleCount > 0) {
    const connection = await loadCalendarConnection(actorData.uid, { migrateLegacy: true });
    if (calendarConnectionCanWrite(connection)) {
      googleDeletion = await flushCalendarSyncOutbox(actorData.uid, connection);
    }
  }
  const result = {
    fromDate: cleanFromDate,
    teacherName: actorData.name,
    summary,
    completedAt: nowIso,
    operationId: mutationId,
    googleDeletion,
  };
  await auditRef.create({
    type: "schedule.future_cleared",
    action: "schedule.future_cleared",
    label: "Tulevane tunniplaan eemaldati alates valitud nädalast",
    fromDate: cleanFromDate,
    actor: actorData,
    summary,
    result,
    createdAt: nowIso,
    date: nowIso.slice(0, 10),
    operationId: mutationId,
  });
  return { ...result, idempotent: false };
}

function scheduleSyncRecoveryWindow(fromIso, toIso) {
  const from = new Date(String(fromIso || ""));
  const to = new Date(String(toIso || ""));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    throw httpError(400, "Valid recovery time window required");
  }
  if (to.getTime() - from.getTime() > 15 * 60 * 1000) {
    throw httpError(400, "Recovery time window cannot exceed 15 minutes");
  }
  return { fromIso: from.toISOString(), toIso: to.toISOString() };
}

async function previewScheduleSyncRecovery({ actor, fromIso, toIso }) {
  const window = scheduleSyncRecoveryWindow(fromIso, toIso);
  const actorData = actorSnapshot(actor);
  const snap = await db.collection("schedule").get();
  const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => {
    const cancelledAt = String(item.gcalDeletedInGoogleAt || "");
    return item.status === "Tühistatud"
      && !item.gcalSyncRecoveredAt
      && cancelledAt >= window.fromIso
      && cancelledAt <= window.toIso
      && teacherOwnsRecord(item, actorData.uid, actorData.name);
  }).sort((left, right) => String(left.date || left.startDate || "").localeCompare(String(right.date || right.startDate || ""))
    || String(left.time || "").localeCompare(String(right.time || "")));
  return {
    ...window,
    teacherName: actorData.name,
    count: items.length,
    items: items.map(item => ({
      id: item.id,
      studentId: String(item.studentId || ""),
      studentName: String(item.studentName || ""),
      date: String(item.date || item.startDate || ""),
      day: String(item.day || ""),
      time: String(item.time || ""),
      recurring: Boolean(item.recurring),
      cancelledAt: String(item.gcalDeletedInGoogleAt || ""),
    })),
  };
}

async function previewLatestScheduleSyncRecovery({ actor }) {
  const actorData = actorSnapshot(actor);
  const cutoffIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const snap = await db.collection("schedule").get();
  const cancelledTimes = snap.docs.map(doc => doc.data()).filter(item =>
    item.status === "Tühistatud"
      && !item.gcalSyncRecoveredAt
      && String(item.gcalDeletedInGoogleAt || "") >= cutoffIso
      && teacherOwnsRecord(item, actorData.uid, actorData.name)
  ).map(item => new Date(String(item.gcalDeletedInGoogleAt || "")).getTime())
    .filter(Number.isFinite).sort((left, right) => left - right);
  if (!cancelledTimes.length) {
    return {
      fromIso: "",
      toIso: "",
      teacherName: actorData.name,
      count: 0,
      items: [],
    };
  }
  const clusters = [];
  cancelledTimes.forEach(time => {
    const current = clusters[clusters.length - 1];
    if (!current || time - current[current.length - 1] > 90 * 1000) clusters.push([time]);
    else current.push(time);
  });
  const incident = clusters.sort((left, right) => right.length - left.length
    || right[right.length - 1] - left[left.length - 1])[0];
  return previewScheduleSyncRecovery({
    actor,
    fromIso: new Date(incident[0] - 5 * 1000).toISOString(),
    toIso: new Date(incident[incident.length - 1] + 5 * 1000).toISOString(),
  });
}

async function applyScheduleSyncRecovery({ actor, fromIso, toIso, requestId, confirmed }) {
  if (confirmed !== true) throw httpError(400, "Explicit confirmation required");
  const mutationId = cleanRequestId(requestId);
  const actorData = actorSnapshot(actor);
  const auditRef = db.collection("activityLog").doc(`schedule-sync-recovery-${mutationId}`);
  const existingAudit = await auditRef.get();
  if (existingAudit.exists) return { ...(existingAudit.data().result || {}), idempotent: true };
  const preview = await previewScheduleSyncRecovery({ actor, fromIso, toIso });
  const recoveredAt = new Date().toISOString();
  for (let offset = 0; offset < preview.items.length; offset += 300) {
    const batch = db.batch();
    preview.items.slice(offset, offset + 300).forEach(item => {
      batch.set(db.collection("schedule").doc(item.id), {
        status: "Planeeritud",
        gcalEventId: FieldValue.delete(),
        gcalEtag: FieldValue.delete(),
        gcalSyncHash: FieldValue.delete(),
        gcalSyncAttemptHash: FieldValue.delete(),
        gcalDeletedInGoogleAt: FieldValue.delete(),
        gcalSyncStatus: "queued",
        gcalSyncError: "",
        gcalSyncRecoveredAt: recoveredAt,
        gcalSyncRecoveredByUid: actorData.uid,
        gcalSyncRecoveryOperationId: mutationId,
        updatedAtIso: recoveredAt,
      }, { merge: true });
    });
    await batch.commit();
  }
  const result = {
    fromIso: preview.fromIso,
    toIso: preview.toIso,
    count: preview.count,
    items: preview.items,
    recoveredAt,
    operationId: mutationId,
  };
  await auditRef.create({
    type: "schedule.sync_recovered",
    action: "schedule.sync_recovered",
    label: "Google Calendar sünkroonimisel ekslikult tühistatud tunnid taastati",
    actor: actorData,
    result,
    createdAt: recoveredAt,
    date: recoveredAt.slice(0, 10),
    operationId: mutationId,
  });
  return { ...result, idempotent: false };
}

exports.staffOperationsApi = functions.https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }
  try {
    if (req.path === "/clock-in") {
      const actor = await requireStaffUser(req);
      const result = await clockInStaff({ actor, note: req.body?.note });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/clock-out") {
      const actor = await requireStaffUser(req);
      const result = await clockOutStaff({
        actor,
        breakMinutes: req.body?.breakMinutes,
        note: req.body?.note,
      });
      res.json(result);
      return;
    }
    if (req.path === "/activity/heartbeat") {
      const actor = await requireStaffUser(req);
      res.json(await recordStaffProgramHeartbeat({
        actor,
        pageInstanceId: req.body?.pageInstanceId,
        area: req.body?.area,
      }));
      return;
    }
    if (req.path === "/schedule/clear-future/preview") {
      const actor = await requireStaffUser(req);
      const plan = await teacherFutureScheduleClearPlan({
        actor,
        fromDate: req.body?.fromDate,
        includeExternalGoogle: req.body?.includeExternalGoogle === true,
      });
      res.json(publicTeacherFutureScheduleClearPlan(plan));
      return;
    }
    if (req.path === "/schedule/clear-future/apply") {
      const actor = await requireStaffUser(req);
      const result = await applyTeacherFutureScheduleClear({
        actor,
        fromDate: req.body?.fromDate,
        requestId: req.body?.requestId,
        confirmed: req.body?.confirmed,
        includeExternalGoogle: req.body?.includeExternalGoogle === true,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/schedule/sync-recovery/preview") {
      const actor = await requireStaffUser(req);
      res.json(await previewScheduleSyncRecovery({
        actor,
        fromIso: req.body?.fromIso,
        toIso: req.body?.toIso,
      }));
      return;
    }
    if (req.path === "/schedule/sync-recovery/latest-preview") {
      const actor = await requireStaffUser(req);
      res.json(await previewLatestScheduleSyncRecovery({ actor }));
      return;
    }
    if (req.path === "/schedule/sync-recovery/apply") {
      const actor = await requireStaffUser(req);
      const result = await applyScheduleSyncRecovery({
        actor,
        fromIso: req.body?.fromIso,
        toIso: req.body?.toIso,
        requestId: req.body?.requestId,
        confirmed: req.body?.confirmed,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    const actor = await requireAdminUser(req);
    if (req.path === "/rates") {
      res.json(await setStaffHourlyRate({
        actor,
        staffUid: req.body?.staffUid,
        hourlyRate: req.body?.hourlyRate,
      }));
      return;
    }
    if (req.path === "/sessions/approve" || req.path === "/sessions/reject") {
      res.json(await reviewWorkSession({
        actor,
        sessionId: req.body?.sessionId,
        decision: req.path.endsWith("/approve") ? "approve" : "reject",
        reason: req.body?.reason,
        hourlyRate: req.body?.hourlyRate,
      }));
      return;
    }
    if (req.path === "/sessions/adjust") {
      res.json(await adjustWorkSession({
        actor,
        sessionId: req.body?.sessionId,
        startedAt: req.body?.startedAt,
        endedAt: req.body?.endedAt,
        breakMinutes: req.body?.breakMinutes,
        note: req.body?.note,
        reason: req.body?.reason,
      }));
      return;
    }
    if (req.path === "/assistant/refresh") {
      res.json(await refreshOperationalAlerts({ actor }));
      return;
    }
    if (req.path === "/students/merge/preview") {
      res.json(await previewStudentMerge({
        primaryStudentId: req.body?.primaryStudentId,
        duplicateStudentIds: req.body?.duplicateStudentIds,
      }));
      return;
    }
    if (req.path === "/students/merge") {
      const result = await applyStudentMerge({
        actor,
        primaryStudentId: req.body?.primaryStudentId,
        duplicateStudentIds: req.body?.duplicateStudentIds,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/parents/merge/preview") {
      res.json(await mergeParentAccounts({
        actor,
        primaryParentId: req.body?.primaryParentId,
        duplicateParentIds: req.body?.duplicateParentIds,
        preview: true,
      }));
      return;
    }
    if (req.path === "/parents/merge") {
      const result = await mergeParentAccounts({
        actor,
        primaryParentId: req.body?.primaryParentId,
        duplicateParentIds: req.body?.duplicateParentIds,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/students/ownership/preview") {
      res.json(await studentOwnershipBackfill({ actor, apply: false }));
      return;
    }
    if (req.path === "/students/ownership/apply") {
      res.json(await studentOwnershipBackfill({ actor, apply: true }));
      return;
    }
    if (req.path === "/data-quality/preview") {
      res.json(await previewDataQuality());
      return;
    }
    if (req.path === "/data-quality/relink") {
      const result = await relinkDataQualityRecord({
        actor,
        entityType: req.body?.entityType,
        entityId: req.body?.entityId,
        studentId: req.body?.studentId,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/data-quality/group-lesson") {
      const result = await linkDataQualityGroupLesson({
        actor,
        lessonId: req.body?.lessonId,
        groupId: req.body?.groupId,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/data-quality/invoice-due") {
      const result = await correctInvoiceDueDate({
        actor,
        invoiceId: req.body?.invoiceId,
        due: req.body?.due,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/accounts/link") {
      const result = await linkAccountToStudent({
        actor,
        uid: req.body?.uid,
        studentId: req.body?.studentId,
        relationship: req.body?.relationship,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/accounts/status") {
      res.json(await setAccountDisabled({
        actor,
        uid: req.body?.uid,
        disabled: req.body?.disabled === true,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      }));
      return;
    }
    res.status(404).json({ error: "Not found" });
  } catch (error) {
    sendError(res, error);
  }
});

exports.teacherScopeMigrationApi = functions.https.onRequest(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST required" });
    return;
  }
  try {
    const actor = await requireAdminUser(req);
    if (req.path === "/preview") {
      res.json(publicTeacherScopePlan(await teacherScopeMigrationPlan()));
      return;
    }
    if (req.path === "/apply") {
      res.json(await applyTeacherScopeBackfill({ actor }));
      return;
    }
    if (req.path === "/enforce") {
      res.json(await setTeacherScopeReadEnforcement({ actor, enabled: true }));
      return;
    }
    if (req.path === "/rollback") {
      res.json(await setTeacherScopeReadEnforcement({ actor, enabled: false }));
      return;
    }
    if (req.path === "/status") {
      const snapshot = await teacherScopeMigrationRef().get();
      res.json(snapshot.exists ? snapshot.data() : {
        version: 1,
        status: "not_started",
        backfillComplete: false,
        readEnforced: false,
      });
      return;
    }
    res.status(404).json({ error: "Not found" });
  } catch (error) {
    sendError(res, error);
  }
});

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
    if (path === "/pdf") {
      await requireAdminUser(req);
      const result = await invoicePdf(req.body?.invoiceId);
      res.json({
        invoiceId: result.invoice.id,
        filename: result.filename,
        contentType: "application/pdf",
        contentBase64: result.content.toString("base64"),
      });
      return;
    }
    if (path === "/credit-note/pdf" || path === "/credit-note/send") {
      const actor = await requireAdminUser(req);
      if (path === "/credit-note/pdf") {
        const result = await creditNotePdf(req.body?.creditNoteId);
        res.json({
          creditNoteId: result.creditNote.id,
          filename: result.filename,
          contentType: "application/pdf",
          contentBase64: result.content.toString("base64"),
        });
        return;
      }
      const result = await sendCreditNoteMessage(req.body?.creditNoteId, { actor });
      res.json(result);
      return;
    }

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

async function createExpense({ actor, values, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const normalized = expenseRecord(values);
  const signature = crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  const expenseRef = db.collection("expenses").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);
  const nowIso = new Date().toISOString();

  return db.runTransaction(async transaction => {
    const existing = await transaction.get(expenseRef);
    if (existing.exists) {
      if (existing.data().creationSignature !== signature) {
        throw httpError(409, "requestId already used for a different expense");
      }
      return { expense: { id: existing.id, ...existing.data() }, idempotent: true };
    }
    await assertFinancialDateOpen(transaction, normalized.expenseDate);
    const expense = {
      ...normalized,
      currency: "EUR",
      status: "active",
      documents: [],
      documentCount: 0,
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      updatedAt: nowIso,
      requestId: mutationId,
    };
    transaction.create(expenseRef, expense);
    transaction.create(auditRef, {
      entityType: "expense",
      entityId: expenseRef.id,
      action: "expense.created",
      expenseId: expenseRef.id,
      expenseDate: normalized.expenseDate,
      category: normalized.category,
      amountCents: normalized.amountCents,
      amount: normalized.amount,
      vatAmountCents: normalized.vatAmountCents,
      vatAmount: normalized.vatAmount,
      actor: actorData,
      reason: normalized.description,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { expense: { id: expenseRef.id, ...expense }, idempotent: false };
  });
}

async function correctExpense({ actor, expenseId, values, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const sourceId = String(expenseId || "").trim();
  if (!sourceId) throw httpError(400, "expenseId required");
  const cleanReason = cleanText(reason, 500);
  if (!cleanReason) throw httpError(400, "Correction reason required");
  const normalized = expenseRecord(values);
  const signature = crypto.createHash("sha256").update(JSON.stringify({ sourceId, normalized, reason: cleanReason })).digest("hex");
  const sourceRef = db.collection("expenses").doc(sourceId);
  const replacementRef = db.collection("expenses").doc(mutationId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);
  const nowIso = new Date().toISOString();

  return db.runTransaction(async transaction => {
    const [existingReplacement, sourceSnap] = await Promise.all([
      transaction.get(replacementRef),
      transaction.get(sourceRef),
    ]);
    if (existingReplacement.exists) {
      if (existingReplacement.data().creationSignature !== signature || existingReplacement.data().correctsExpenseId !== sourceId) {
        throw httpError(409, "requestId already used for a different expense correction");
      }
      return { expense: { id: existingReplacement.id, ...existingReplacement.data() }, idempotent: true };
    }
    if (!sourceSnap.exists) throw httpError(404, "Expense not found");
    const source = sourceSnap.data();
    if (source.status !== "active") throw httpError(409, "Only an active expense can be corrected");
    await assertFinancialDateOpen(transaction, source.expenseDate);
    if (normalized.expenseDate !== source.expenseDate) await assertFinancialDateOpen(transaction, normalized.expenseDate);

    const replacement = {
      ...normalized,
      currency: "EUR",
      status: "active",
      documents: [],
      documentCount: 0,
      correctsExpenseId: sourceId,
      correctionReason: cleanReason,
      creationSignature: signature,
      createdAt: nowIso,
      createdBy: actorData,
      updatedAt: nowIso,
      requestId: mutationId,
    };
    transaction.update(sourceRef, {
      status: "corrected",
      correctedAt: nowIso,
      correctedBy: actorData,
      correctedByExpenseId: mutationId,
      correctionReason: cleanReason,
      updatedAt: nowIso,
    });
    transaction.create(replacementRef, replacement);
    transaction.create(auditRef, {
      entityType: "expense",
      entityId: sourceId,
      action: "expense.corrected",
      expenseId: sourceId,
      replacementExpenseId: mutationId,
      previous: {
        expenseDate: source.expenseDate || "",
        category: source.category || "",
        description: source.description || "",
        amountCents: Number(source.amountCents) || 0,
        vatAmountCents: Number(source.vatAmountCents) || 0,
      },
      current: normalized,
      actor: actorData,
      reason: cleanReason,
      signature,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { expense: { id: replacementRef.id, ...replacement }, idempotent: false };
  });
}

async function voidExpense({ actor, expenseId, reason, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanExpenseId = String(expenseId || "").trim();
  if (!cleanExpenseId) throw httpError(400, "expenseId required");
  const cleanReason = cleanText(reason, 500);
  if (!cleanReason) throw httpError(400, "Void reason required");
  const signature = crypto.createHash("sha256").update(JSON.stringify({ expenseId: cleanExpenseId, reason: cleanReason })).digest("hex");
  const expenseRef = db.collection("expenses").doc(cleanExpenseId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);
  const nowIso = new Date().toISOString();

  return db.runTransaction(async transaction => {
    const [auditSnap, expenseSnap] = await Promise.all([
      transaction.get(auditRef),
      transaction.get(expenseRef),
    ]);
    if (auditSnap.exists) {
      if (auditSnap.data().signature !== signature || auditSnap.data().action !== "expense.voided") {
        throw httpError(409, "requestId already used for a different financial mutation");
      }
      return { expense: { id: expenseSnap.id, ...expenseSnap.data() }, idempotent: true };
    }
    if (!expenseSnap.exists) throw httpError(404, "Expense not found");
    if (expenseSnap.data().status !== "active") throw httpError(409, "Only an active expense can be voided");
    await assertFinancialDateOpen(transaction, expenseSnap.data().expenseDate);
    transaction.update(expenseRef, {
      status: "voided",
      voidedAt: nowIso,
      voidedBy: actorData,
      voidReason: cleanReason,
      updatedAt: nowIso,
    });
    transaction.create(auditRef, {
      entityType: "expense",
      entityId: cleanExpenseId,
      action: "expense.voided",
      expenseId: cleanExpenseId,
      actor: actorData,
      reason: cleanReason,
      signature,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { expense: { id: expenseSnap.id, ...expenseSnap.data(), status: "voided", voidedAt: nowIso, voidedBy: actorData, voidReason: cleanReason, updatedAt: nowIso }, idempotent: false };
  });
}

async function attachExpenseDocument({ actor, expenseId, document, requestId }) {
  const mutationId = cleanRequestId(requestId);
  const cleanExpenseId = String(expenseId || "").trim();
  const nowIso = new Date().toISOString();
  const normalized = expenseDocumentRecord({
    expenseId: cleanExpenseId,
    documentId: mutationId,
    ...document,
    uploadedAt: nowIso,
  });
  const signature = crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
  const expenseRef = db.collection("expenses").doc(cleanExpenseId);
  const auditRef = db.collection("financialAudit").doc(mutationId);
  const actorData = actorSnapshot(actor);

  return db.runTransaction(async transaction => {
    const [auditSnap, expenseSnap] = await Promise.all([
      transaction.get(auditRef),
      transaction.get(expenseRef),
    ]);
    if (auditSnap.exists) {
      if (auditSnap.data().signature !== signature || auditSnap.data().action !== "expense.document_attached") {
        throw httpError(409, "requestId already used for a different expense document");
      }
      return { expense: { id: expenseSnap.id, ...expenseSnap.data() }, document: normalized, idempotent: true };
    }
    if (!expenseSnap.exists) throw httpError(404, "Expense not found");
    const expense = expenseSnap.data();
    if (expense.status !== "active") throw httpError(409, "Documents can only be added to an active expense");
    await assertFinancialDateOpen(transaction, expense.expenseDate);
    const documents = Array.isArray(expense.documents) ? expense.documents : [];
    if (documents.length >= 20) throw httpError(409, "Expense already has the maximum number of documents");
    if (documents.some(item => item.id === mutationId)) throw httpError(409, "Document already attached");
    const nextDocuments = [...documents, { ...normalized, uploadedBy: actorData }];
    transaction.update(expenseRef, {
      documents: nextDocuments,
      documentCount: nextDocuments.length,
      updatedAt: nowIso,
    });
    transaction.create(auditRef, {
      entityType: "expense",
      entityId: cleanExpenseId,
      action: "expense.document_attached",
      expenseId: cleanExpenseId,
      document: normalized,
      actor: actorData,
      reason: normalized.fileName,
      signature,
      createdAt: nowIso,
      requestId: mutationId,
    });
    return { expense: { id: expenseSnap.id, ...expense, documents: nextDocuments, documentCount: nextDocuments.length, updatedAt: nowIso }, document: normalized, idempotent: false };
  });
}

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
    if (req.path === "/lessons/journal") {
      const actor = await requireStaffUser(req);
      const result = await saveLessonJournal({
        actor,
        lessonId: req.body?.lessonId,
        scheduleId: req.body?.scheduleId,
        sourceKey: req.body?.sourceKey,
        values: req.body?.lesson,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/lessons/journal/delete") {
      const actor = await requireStaffUser(req);
      const result = await deleteLessonJournal({
        actor,
        lessonId: req.body?.lessonId,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/lessons/package-consumption/sync") {
      const actor = await requireStaffUser(req);
      const result = await syncLessonPackageConsumption({
        actor,
        lessonId: req.body?.lessonId,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    const actor = await requireAdminUser(req);
    if (req.path === "/expenses") {
      const result = await createExpense({ actor, values: req.body, requestId: req.body?.requestId });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/expenses/correct") {
      const result = await correctExpense({
        actor,
        expenseId: req.body?.expenseId,
        values: req.body,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/expenses/void") {
      const result = await voidExpense({
        actor,
        expenseId: req.body?.expenseId,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/expenses/documents") {
      const result = await attachExpenseDocument({
        actor,
        expenseId: req.body?.expenseId,
        document: {
          storagePath: req.body?.storagePath,
          fileName: req.body?.fileName,
          contentType: req.body?.contentType,
          size: req.body?.size,
        },
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/tariffs") {
      const result = await createTariffVersion({
        actor,
        name: req.body?.name,
        unitPrice: req.body?.unitPrice,
        effectiveFrom: req.body?.effectiveFrom,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/students/tariff-assignments") {
      const result = await assignStudentTariff({
        actor,
        studentId: req.body?.studentId,
        tariffId: req.body?.tariffId,
        effectiveFrom: req.body?.effectiveFrom,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/package-products") {
      const result = await createPackageProduct({
        actor,
        name: req.body?.name,
        lessonCredits: req.body?.lessonCredits,
        totalPrice: req.body?.totalPrice,
        effectiveFrom: req.body?.effectiveFrom,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/student-packages") {
      const result = await issueStudentPackage({
        actor,
        studentId: req.body?.studentId,
        packageProductId: req.body?.packageProductId,
        issuedAt: req.body?.issuedAt,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/student-packages/adjust") {
      const result = await adjustStudentPackage({
        actor,
        studentPackageId: req.body?.studentPackageId,
        creditsDelta: req.body?.creditsDelta,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
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
    if (req.path === "/payments/line-allocations") {
      const result = await savePaymentLineAllocation({
        actor,
        paymentId: req.body?.paymentId,
        allocations: req.body?.allocations,
        effectiveDate: req.body?.effectiveDate,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/payments/documents") {
      const result = await attachPaymentDocument({
        actor,
        paymentId: req.body?.paymentId,
        storagePath: req.body?.storagePath,
        fileName: req.body?.fileName,
        contentType: req.body?.contentType,
        size: req.body?.size,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/invoices/numbering/preview") {
      res.json(await previewInvoiceNumbering());
      return;
    }
    if (req.path === "/invoices/numbering/repair") {
      const result = await repairInvoiceNumbering({
        actor,
        reason: req.body?.reason,
        expectedFingerprint: req.body?.expectedFingerprint,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/financial-periods/preview") {
      const result = await previewFinancialPeriod({ month: req.body?.month });
      res.json(result);
      return;
    }
    if (req.path === "/financial-analytics/preview") {
      res.json(await previewFinancialAnalytics({ month: req.body?.month }));
      return;
    }
    if (req.path === "/financial-periods/review") {
      const result = await reviewFinancialPeriod({
        actor,
        month: req.body?.month,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/financial-periods/export") {
      const result = await generateFinancialPeriodExport({
        actor,
        month: req.body?.month,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/financial-periods/close") {
      const result = await closeFinancialPeriod({
        actor,
        month: req.body?.month,
        reason: req.body?.reason,
        requestId: req.body?.requestId,
      });
      res.status(result.idempotent ? 200 : 201).json(result);
      return;
    }
    if (req.path === "/financial-periods/corrections") {
      const result = await createFinancialPeriodCorrection({
        actor,
        sourceMonth: req.body?.sourceMonth,
        effectiveDate: req.body?.effectiveDate,
        type: req.body?.type,
        description: req.body?.description,
        amountDelta: req.body?.amountDelta,
        vatDelta: req.body?.vatDelta,
        sourceEntityId: req.body?.sourceEntityId,
        reason: req.body?.reason,
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
        creditStudentId: req.body?.creditStudentId,
        reference: req.body?.reference,
        amount: req.body?.amount,
        allocations: req.body?.allocations,
        lessonAllocations: req.body?.lessonAllocations,
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
        lessonAllocations: req.body?.lessonAllocations,
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
    console.warn("financeApi request rejected", {
      path: req.path,
      status: e.status || 500,
      error: String(e.message || e).slice(0, 500),
    });
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
        requestedWriteAccess: true,
        createdAt: FieldValue.serverTimestamp(),
      });
      const url = oauth2.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [GOOGLE_SCOPE_EVENTS_OWNED],
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
      const stateData = stateSnap.data();
      const { uid } = stateData;
      await stateRef.delete();
      const oauth2 = getOAuthClient();
      const { tokens } = await oauth2.getToken(code);
      const existing = await loadCalendarConnection(uid, { migrateLegacy: true });
      const grantedScopes = tokens.scope
        || (stateData.requestedWriteAccess ? GOOGLE_SCOPE_EVENTS_OWNED : existing?.grantedScopes)
        || "";
      const connection = await saveCalendarConnection(uid, {
        connected: true,
        accessToken: tokens.access_token || existing?.accessToken || "",
        refreshToken: tokens.refresh_token || existing?.refreshToken || "",
        expiryDate: tokens.expiry_date || existing?.expiryDate || null,
        grantedScopes,
        writeEnabled: hasCalendarWriteScope(grantedScopes),
        connectedAt: new Date().toISOString(),
        lastSyncAt: null,
        lastSyncCount: 0,
        lastSyncSkipped: 0,
        lastSyncRemoved: 0,
        lastSyncCancelled: 0,
        lastSyncExceptions: 0,
        lastSyncError: "",
        lastPushAt: null,
        lastPushError: "",
      });
      // Trigger initial sync
      await syncTeacherCalendar(uid, connection);
      await flushCalendarSyncOutbox(uid, connection);
      await backfillScheduleToGoogle(uid, connection);
      // Redirect back to app
      res.redirect(calendarReturnUrl("connected"));
    } catch (e) {
      console.error("OAuth callback error:", e);
      res.redirect(calendarReturnUrl("error"));
    }
    return;
  }

  // ── POST /gcal/sync ─────────────────────────────────────────
  if (path === "/gcal/sync" && req.method === "POST") {
    const { uid } = req.body;
    if (!uid) { res.status(400).json({ error: "uid required" }); return; }
    try {
      await requireCalendarOwner(req, uid);
      const connection = await loadCalendarConnection(uid, { migrateLegacy: true });
      if (!connection?.refreshToken) {
        res.status(404).json({ error: "Google Calendar not connected" });
        return;
      }
      const outbox = calendarConnectionCanWrite(connection)
        ? await flushCalendarSyncOutbox(uid, connection)
        : { deleted: 0, failed: 0 };
      const pushed = calendarConnectionCanWrite(connection)
        ? await backfillScheduleToGoogle(uid, connection, { force: true })
        : { synced: 0, skipped: 0, failed: 0 };
      const result = await syncTeacherCalendar(uid, connection);
      res.json({
        success: true,
        synced: result.synced,
        skipped: result.skipped,
        removed: result.removed,
        cancelled: result.cancelled,
        exceptions: result.exceptions,
        pushed: pushed.synced,
        pushFailed: pushed.failed + outbox.failed,
        deferredDeleted: outbox.deleted,
      });
    } catch (e) {
      console.error("Sync error:", e);
      const message=String(e.message||"Sync failed").slice(0,500);
      try {
        await calendarConnectionRef(uid).set({
          lastSyncError:message,
          updatedAt:new Date().toISOString(),
        },{merge:true});
        await db.collection("users").doc(uid).set({
          gcal: { lastSyncError: message },
        },{merge:true});
      } catch (statusError) {
        console.error("Could not persist Google Calendar sync error:",statusError);
      }
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
      await calendarConnectionRef(uid).delete();
      await db.collection("users").doc(uid).update({
        gcal: FieldValue.delete(),
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
      const connection = await loadCalendarConnection(uid, { migrateLegacy: true });
      const gcal = publicCalendarMetadata(connection || {});
      res.json({
        connected: !!gcal.connected,
        connectedAt: gcal.connectedAt || null,
        direction: gcal.direction,
        writeEnabled: gcal.writeEnabled,
        requiresWriteConsent: gcal.requiresWriteConsent,
        lastSyncAt: gcal.lastSyncAt || null,
        lastSyncCount: gcal.lastSyncCount || 0,
        lastSyncSkipped: gcal.lastSyncSkipped || 0,
        lastSyncRemoved: gcal.lastSyncRemoved || 0,
        lastSyncCancelled: gcal.lastSyncCancelled || 0,
        lastSyncExceptions: gcal.lastSyncExceptions || 0,
        lastSyncDeduplicated: gcal.lastSyncDeduplicated || 0,
        lastSyncDeduplicationFailed: gcal.lastSyncDeduplicationFailed || 0,
        lastSyncError: gcal.lastSyncError || "",
        lastPushAt: gcal.lastPushAt || null,
        lastPushError: gcal.lastPushError || "",
      });
    } catch (e) {
      sendError(res, e);
    }
    return;
  }

  res.status(404).json({ error: "Not found" });
});

// ── CORE SYNC FUNCTION ────────────────────────────────────────
async function listGoogleCalendarEvents(calendar, params, maxPages = 10) {
  const items = [];
  let pageToken = "";
  for (let page = 0; page < maxPages; page++) {
    const response = await calendar.events.list({
      ...params,
      ...(pageToken ? { pageToken } : {}),
    });
    items.push(...(response.data.items || []));
    pageToken = response.data.nextPageToken || "";
    if (!pageToken) break;
  }
  if (pageToken) {
    throw new Error("Google Calendar sync exceeded the safe pagination limit");
  }
  return items;
}

async function syncTeacherCalendar(uid, tokens) {
  const calendar = await authorizedGoogleCalendar(uid, tokens);

  // Get teacher name from Firestore
  const userDoc = await db.collection("users").doc(uid).get();
  const fullName = userDoc.data()?.displayName || "";
  // Use first name only to match KeeleSepp teacher format (e.g. "Pavel" not "Pavel Zakutailo")
  const teacherName = fullName.split(" ")[0] || fullName;

  // Fetch events: now → 60 days ahead
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
  const exceptionTimeMin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const exceptionTimeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const expandedEvents = await listGoogleCalendarEvents(calendar, {
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 500,
  });
  // With singleEvents=false Google returns recurring masters and only their
  // exceptional instances, not every ordinary occurrence.
  const compactEvents = await listGoogleCalendarEvents(calendar, {
    calendarId: "primary",
    timeMin: exceptionTimeMin,
    timeMax: exceptionTimeMax,
    singleEvents: false,
    showDeleted: true,
    maxResults: 500,
  });
  const deletedGoogleEventIds = explicitlyDeletedGoogleEventIds(compactEvents);

  const recurringMastersByGoogleId = new Map();
  compactEvents
    .filter(event => event.recurrence && isKeeleSeppManagedGoogleEvent(event))
    .forEach(event => recurringMastersByGoogleId.set(event.id, {
      ...event,
      calendarId: "primary",
    }));
  const managedRecurringIds = [...new Set([
    ...expandedEvents
      .filter(event => event.recurringEventId && isKeeleSeppManagedGoogleEvent(event))
      .map(event => event.recurringEventId),
    ...compactEvents
      .filter(event => event.recurringEventId && isKeeleSeppManagedGoogleEvent(event))
      .map(event => event.recurringEventId),
  ])];
  const missingMasterIds = managedRecurringIds.filter(id => !recurringMastersByGoogleId.has(id));
  if (missingMasterIds.length) {
    const recurringMasters = (await Promise.all(missingMasterIds.map(async eventId => {
      try {
        const response = await calendar.events.get({ calendarId: "primary", eventId });
        return { ...response.data, calendarId: "primary" };
      } catch (error) {
        if (!isGoogleGoneError(error)) {
          console.warn(`Could not load recurring Google event ${eventId}:`, error.message);
        }
        return null;
      }
    }))).filter(Boolean);
    recurringMasters
      .filter(isKeeleSeppManagedGoogleEvent)
      .forEach(event => recurringMastersByGoogleId.set(event.id, event));
  }
  const nativeOccurrenceExceptions = compactEvents.filter(event =>
    event.recurringEventId
    && recurringMastersByGoogleId.has(event.recurringEventId)
    && googleOriginalOccurrenceDate(event, APP_TIME_ZONE)
  );
  let events = [...new Map([
    ...expandedEvents.filter(event => !(
      event.recurringEventId && recurringMastersByGoogleId.has(event.recurringEventId)
    )),
    ...recurringMastersByGoogleId.values(),
    ...compactEvents.filter(event =>
      !event.recurringEventId
        && !event.recurrence
        && event.status !== "cancelled"
        && isKeeleSeppManagedGoogleEvent(event)
    ),
  ].filter(event => event?.id).map(event => [String(event.id), event])).values()];
  let synced = 0;
  let skipped = 0;
  let exceptions = 0;

  // Один запрос студентов на весь прогон вместо чтения на каждое событие
  // (раньше: doc.get() на каждый student:ID + полный скан коллекции на каждый
  // фолбэк по имени — до ~500 событий за прогон).
  const [studentsSnap, currentScheduleSnap] = await Promise.all([
    db.collection("students").get(),
    db.collection("schedule").where("teacherUid", "==", uid).get(),
  ]);
  const currentScheduleById = new Map(
    currentScheduleSnap.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]),
  );
  const currentScheduleByGoogleId = new Map(
    currentScheduleSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.gcalEventId)
      .map(item => [String(item.gcalEventId), item]),
  );
  let deduplicated = 0;
  let deduplicationFailed = 0;
  if (calendarConnectionCanWrite(tokens)) {
    const managedEventsByScheduleId = new Map();
    const dedupeCandidates = [...new Map([
      ...events,
      ...compactEvents.filter(event =>
        !event.recurringEventId
          && !event.recurrence
          && event.status !== "cancelled"
          && isKeeleSeppManagedGoogleEvent(event)
      ),
    ].filter(event => event?.id).map(event => [String(event.id), event])).values()];
    dedupeCandidates.forEach(event => {
      const scheduleId = managedGoogleScheduleId(event);
      if (!scheduleId) return;
      if (!managedEventsByScheduleId.has(scheduleId)) managedEventsByScheduleId.set(scheduleId, []);
      managedEventsByScheduleId.get(scheduleId).push(event);
    });
    const removedDuplicateEventIds = new Set();
    for (const [scheduleId, candidates] of managedEventsByScheduleId.entries()) {
      if (candidates.length < 2) continue;
      const linkedGoogleId = String(currentScheduleById.get(scheduleId)?.gcalEventId || "");
      const keep = candidates.find(event => String(event.id || "") === linkedGoogleId)
        || [...candidates].sort((left, right) => String(left.id || "").localeCompare(String(right.id || "")))[0];
      for (const duplicate of candidates) {
        if (duplicate === keep || !duplicate.id) continue;
        try {
          await calendar.events.delete({ calendarId: "primary", eventId: duplicate.id });
          removedDuplicateEventIds.add(String(duplicate.id));
          deduplicated++;
        } catch (error) {
          if (isGoogleGoneError(error)) {
            removedDuplicateEventIds.add(String(duplicate.id));
            deduplicated++;
          } else {
            deduplicationFailed++;
            console.warn(`Could not remove duplicate Google event ${duplicate.id} for ${scheduleId}:`, error.message);
          }
        }
      }
    }
    if (removedDuplicateEventIds.size) {
      events = events.filter(event => !removedDuplicateEventIds.has(String(event.id || "")));
    }
  }
  const studentsById = new Map();
  const studentsByName = new Map(); // normalizedName -> [{...student}]
  for (const doc of studentsSnap.docs) {
    const s = { id: doc.id, ...doc.data() };
    studentsById.set(doc.id, s);
    [...new Set([s.name, ...(Array.isArray(s.nameAliases) ? s.nameAliases : [])]
      .map(normalizeCalendarName).filter(Boolean))].forEach(key => {
        if (!studentsByName.has(key)) studentsByName.set(key, []);
        studentsByName.get(key).push(s);
      });
  }
  const findCachedStudentByName = (name) => {
    const candidates = studentsByName.get(normalizeCalendarName(name)) || [];
    if (!candidates.length) return null;
    const normTeacher = normalizeCalendarName(teacherName);
    const teacherMatches = candidates.filter(s =>
      normTeacher && normalizeCalendarName(s.teacher || "") === normTeacher
    );
    if (teacherMatches.length === 1) return teacherMatches[0];
    if (teacherMatches.length > 1) return null;
    return candidates.length === 1 ? candidates[0] : null;
  };

  const nativeDatesBySeries = new Map();
  nativeOccurrenceExceptions.forEach(event => {
    const master = recurringMastersByGoogleId.get(event.recurringEventId);
    const seriesId = managedGoogleScheduleId(master);
    const originalDate = googleOriginalOccurrenceDate(event, APP_TIME_ZONE);
    if (!seriesId || !originalDate) return;
    if (!nativeDatesBySeries.has(seriesId)) nativeDatesBySeries.set(seriesId, new Set());
    nativeDatesBySeries.get(seriesId).add(originalDate);
  });
  const parentScheduleById = new Map();
  const scheduleWrites = [];
  const nowIso = new Date().toISOString();
  const nativeWindowStart = localDate(new Date(exceptionTimeMin), APP_TIME_ZONE);
  const nativeWindowEnd = localDate(new Date(exceptionTimeMax), APP_TIME_ZONE);

  for (const event of events) {
    const managedScheduleId = managedGoogleScheduleId(event);
    const targetScheduleId = managedScheduleId || `gcal_${event.id}`;
    const existingSchedule = currentScheduleById.get(targetScheduleId)
      || currentScheduleByGoogleId.get(String(event.id || ""));
    if (existingSchedule?.gcalImportSuppressed) {
      skipped++;
      continue;
    }
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

    // Preserve a previously verified link even when the event title was later
    // shortened, translated or otherwise changed in Google Calendar.
    if (!student && existingSchedule?.studentId) {
      student = studentsById.get(String(existingSchedule.studentId)) || null;
    }

    // Fallback: try to extract name from title (legacy support)
    if (!student) {
      const studentName = extractCalendarStudentName(event.summary || "");
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
    if (!scheduleData?.time) { skipped++; continue; }

    const docRef = db.collection("schedule").doc(
      targetScheduleId,
    );
    if (managedScheduleId) {
      if (scheduleData.recurring) {
        const previous = currentScheduleById.get(managedScheduleId) || {};
        const exclusionState = googleNativeExclusionState({
          previousExcludedDates: previous.excludedDates,
          previousNativeDates: previous.gcalNativeExcludedDates,
          currentNativeDates: [...(nativeDatesBySeries.get(managedScheduleId) || [])],
          googleExcludedDates: scheduleData.excludedDates,
          windowStart: nativeWindowStart,
          windowEnd: nativeWindowEnd,
        });
        scheduleData.excludedDates = exclusionState.excludedDates;
        scheduleData.gcalNativeExcludedDates = exclusionState.nativeDates;
      }
      scheduleData.gcalSyncHash = scheduleSyncFingerprint(
        managedScheduleId,
        scheduleData,
        APP_TIME_ZONE,
      );
      scheduleData.gcalLastImportedAt = nowIso;
      if (scheduleData.recurring) {
        parentScheduleById.set(managedScheduleId, scheduleData);
      }
    }
    scheduleWrites.push({ ref: docRef, data: scheduleData });
    synced++;
  }

  for (const event of nativeOccurrenceExceptions) {
    const master = recurringMastersByGoogleId.get(event.recurringEventId);
    const seriesId = managedGoogleScheduleId(master);
    const parent = parentScheduleById.get(seriesId) || currentScheduleById.get(seriesId);
    const scheduleData = googleOccurrenceExceptionSchedule(
      seriesId,
      parent,
      {
        ...event,
        calendarId: "primary",
        description: stripKeeleSeppCalendarMetadata(event.description),
      },
      APP_TIME_ZONE,
      nowIso,
    );
    const exceptionId = managedGoogleOccurrenceExceptionId(seriesId, event.id);
    if (!scheduleData || !exceptionId) {
      skipped++;
      continue;
    }
    const docRef = db.collection("schedule").doc(exceptionId);
    scheduleWrites.push({ ref: docRef, data: scheduleData });
    synced++;
    exceptions++;
  }

  for (let offset = 0; offset < scheduleWrites.length; offset += 400) {
    const batch = db.batch();
    scheduleWrites.slice(offset, offset + 400).forEach(write => {
      batch.set(write.ref, write.data, { merge: true });
    });
    await batch.commit();
  }

  // Reconcile only explicit Google cancellation tombstones. An event missing
  // from this import can be unmatched, outside the page/window or temporarily
  // unavailable; absence alone must never delete a KeeleSepp record.
  const syncWindowStart = localDate(new Date(), APP_TIME_ZONE);
  const syncWindowEnd = localDate(new Date(timeMax), APP_TIME_ZONE);
  const activeManagedScheduleIds = new Set(
    events.map(managedGoogleScheduleId).filter(Boolean),
  );
  const importedSnap = await db.collection("schedule").where("teacherUid", "==", uid).get();
  const staleDocs = importedSnap.docs.filter(doc => {
    const event = doc.data();
    return event.source === "gcal"
      && !event.gcalImportSuppressed
      && shouldApplyExplicitGoogleDeletion(event, deletedGoogleEventIds, {
        windowStart: syncWindowStart,
        windowEnd: syncWindowEnd,
        nativeWindowStart,
        nativeWindowEnd,
      });
  });
  for (let offset = 0; offset < staleDocs.length; offset += 400) {
    const deleteBatch = db.batch();
    staleDocs.slice(offset, offset + 400).forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
  }
  const removed = staleDocs.length;
  const managedStaleDocs = importedSnap.docs.filter(doc => {
    const event = doc.data();
    return event.source === "keelesepp"
      && !activeManagedScheduleIds.has(doc.id)
      && shouldApplyExplicitGoogleDeletion(event, deletedGoogleEventIds, {
        windowStart: syncWindowStart,
        windowEnd: syncWindowEnd,
        nativeWindowStart,
        nativeWindowEnd,
      });
  });
  for (let offset = 0; offset < managedStaleDocs.length; offset += 400) {
    const cancelBatch = db.batch();
    managedStaleDocs.slice(offset, offset + 400).forEach(doc => {
      const cancelled = { ...doc.data(), status: "Tühistatud" };
      cancelBatch.set(doc.ref, {
        status: "Tühistatud",
        gcalEventId: FieldValue.delete(),
        gcalEtag: FieldValue.delete(),
        gcalSyncStatus: "deleted_in_google",
        gcalSyncHash: scheduleSyncFingerprint(doc.id, cancelled, APP_TIME_ZONE),
        gcalDeletedInGoogleAt: new Date().toISOString(),
        updatedAtIso: new Date().toISOString(),
      }, { merge: true });
    });
    await cancelBatch.commit();
  }
  const cancelled = managedStaleDocs.length;

  const syncMetadata = {
    connected: true,
    connectedAt: tokens.connectedAt || null,
    lastSyncAt: new Date().toISOString(),
    lastSyncCount: synced,
    lastSyncSkipped: skipped,
    lastSyncRemoved: removed,
    lastSyncCancelled: cancelled,
    lastSyncExceptions: exceptions,
    lastSyncDeduplicated: deduplicated,
    lastSyncDeduplicationFailed: deduplicationFailed,
    lastSyncError: "",
  };
  await saveCalendarConnection(uid, syncMetadata);

  console.log(`Synced ${synced} events for teacher ${teacherName}, including ${exceptions} native exceptions, skipped ${skipped}, explicitly removed ${removed}, explicitly cancelled ${cancelled}, deduplicated ${deduplicated}, duplicate cleanup failures ${deduplicationFailed}`);
  return { synced, skipped, removed, cancelled, exceptions, deduplicated, deduplicationFailed };
}

async function updateCalendarPushMetadata(uid, { error = "" } = {}) {
  const nowIso = new Date().toISOString();
  const patch = {
    lastPushError: String(error || "").slice(0, 500),
    updatedAt: nowIso,
  };
  if (!error) patch.lastPushAt = nowIso;
  await calendarConnectionRef(uid).set(patch, { merge: true });
  const publicGcalPatch = {
    lastPushError: patch.lastPushError,
  };
  if (!error) publicGcalPatch.lastPushAt = nowIso;
  await db.collection("users").doc(uid).set({
    gcal: publicGcalPatch,
  }, { merge: true });
}

function calendarConnectionCanWrite(connection) {
  return Boolean(
    connection?.connected
    && connection?.refreshToken
    && (connection.writeEnabled || hasCalendarWriteScope(connection.grantedScopes)),
  );
}

async function queueGoogleEventDeletion(scheduleId, schedule, reason) {
  if (!schedule?.gcalEventId || !schedule?.teacherUid) return;
  await db.collection("calendarSyncOutbox").add({
    action: "delete",
    scheduleId,
    teacherUid: schedule.teacherUid,
    calendarId: schedule.gcalCalId || "primary",
    eventId: schedule.gcalEventId,
    reason: String(reason || "Deferred Google Calendar deletion").slice(0, 300),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function flushCalendarSyncOutbox(uid, connection, calendarOverride = null) {
  if (!calendarConnectionCanWrite(connection)) return { deleted: 0, failed: 0 };
  const snap = await db.collection("calendarSyncOutbox")
    .where("teacherUid", "==", uid)
    .get();
  if (snap.empty) return { deleted: 0, failed: 0 };
  const calendar = calendarOverride || await authorizedGoogleCalendar(uid, connection);
  let deleted = 0;
  let failed = 0;
  for (const doc of snap.docs) {
    const entry = doc.data();
    if (entry.action !== "delete" || !entry.eventId) continue;

    // Verify current schedule state to prevent stale deletion (race condition fix)
    let shouldDefer = false;
    if (entry.scheduleId) {
      const scheduleSnap = await db.collection("schedule").doc(entry.scheduleId).get();
      if (scheduleSnap.exists) {
        const scheduleData = scheduleSnap.data();
        if (scheduleData.status !== "Tühistatud") {
          // The lesson is active again.
          if (scheduleData.gcalEventId === entry.eventId) {
            // Scenario A: current schedule uses THIS event.
            // DO NOT delete from Google, but remove the stale outbox job.
            await doc.ref.delete();
            continue;
          } else if (scheduleData.gcalEventId) {
            // Scenario B: current schedule uses a DIFFERENT event.
            // This queued event is an obsolete orphan. It SHOULD be deleted.
          } else {
            // Scenario C: current schedule has no gcalEventId yet.
            // Sync may be in progress. Defer this outbox job.
            shouldDefer = true;
          }
        }
      }
    }

    if (shouldDefer) continue;

    let successfulDeletion = false;
    try {
      await calendar.events.delete({
        calendarId: entry.calendarId || "primary",
        eventId: entry.eventId,
      });
      successfulDeletion = true;
    } catch (error) {
      if (isGoogleGoneError(error)) {
        successfulDeletion = true;
      } else {
        failed++;
        await doc.ref.set({
          lastError: String(error.message || error).slice(0, 500),
          lastAttemptAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    }

    if (successfulDeletion) {
      await doc.ref.delete();
      deleted++;

      // Scenario D: Check-then-delete race
      // Ensure the lesson wasn't restored between our initial read and the successful deletion.
      if (entry.scheduleId) {
        const postDeleteSnap = await db.collection("schedule").doc(entry.scheduleId).get();
        if (postDeleteSnap.exists) {
          const postDeleteData = postDeleteSnap.data();
          if (postDeleteData.status !== "Tühistatud" && postDeleteData.gcalEventId === entry.eventId) {
            // The event we just deleted is actively linked. We must mark it for re-sync.
            await postDeleteSnap.ref.set({
              gcalEventId: FieldValue.delete(),
              gcalSyncHash: FieldValue.delete(), // Invalidate hash to force a new sync
              gcalSyncStatus: "queued",
              gcalSyncUpdatedAt: new Date().toISOString(),
            }, { merge: true });
          }
        }
      }
    }
  }
  return { deleted, failed };
}

async function syncScheduleRecordToGoogle(
  scheduleId,
  before,
  after,
  { force = false, retryErrors = false, connectionOverride = null, calendarOverride = null } = {},
) {
  const schedule = after || before;
  if (!schedule || schedule.source === "gcal" || schedule.isGroup) {
    return { skipped: "external_or_group" };
  }
  const uid = String(schedule.teacherUid || "").trim();
  if (!uid) return { skipped: "missing_teacher_uid" };
  const connection = connectionOverride
    || await loadCalendarConnection(uid, { migrateLegacy: true });

  if (!after) {
    if (!schedule.gcalEventId) return { skipped: "not_linked" };
    if (!calendarConnectionCanWrite(connection)) {
      await queueGoogleEventDeletion(scheduleId, schedule, "Calendar write consent unavailable");
      return { queued: true };
    }
    try {
      const calendar = calendarOverride || await authorizedGoogleCalendar(uid, connection);
      await calendar.events.delete({
        calendarId: schedule.gcalCalId || "primary",
        eventId: schedule.gcalEventId,
      });
      const staleOutboxSnap = await db.collection("calendarSyncOutbox")
        .where("scheduleId", "==", scheduleId)
        .where("eventId", "==", schedule.gcalEventId)
        .get();
      if (!staleOutboxSnap.empty) {
        const batch = db.batch();
        staleOutboxSnap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }
      await updateCalendarPushMetadata(uid);
      return { deleted: true };
    } catch (error) {
      if (isGoogleGoneError(error)) return { deleted: true, alreadyGone: true };
      await queueGoogleEventDeletion(scheduleId, schedule, error.message || "Google deletion failed");
      await updateCalendarPushMetadata(uid, { error: error.message || "Google deletion failed" });
      return { queued: true, error: error.message || String(error) };
    }
  }

  const syncHash = scheduleSyncFingerprint(scheduleId, after, APP_TIME_ZONE);
  const isErrorMatch = after.gcalSyncAttemptHash === syncHash && after.gcalSyncStatus === "error";
  if (!force) {
    if (after.gcalSyncHash === syncHash && after.gcalSyncStatus !== "error") return { skipped: "already_synchronized" };
    if (isErrorMatch && !retryErrors) return { skipped: "already_synchronized" };
  }
  if (!calendarConnectionCanWrite(connection)) return { skipped: "write_consent_required" };

  const scheduleRef = db.collection("schedule").doc(scheduleId);
  const requestBody = scheduleToGoogleEvent(scheduleId, after, APP_TIME_ZONE);
  if (!requestBody && after.status !== "Tühistatud") {
    await scheduleRef.set({
      gcalSyncHash: syncHash,
      gcalSyncAttemptHash: syncHash,
      gcalSyncStatus: "skipped",
      gcalSyncError: "Tunnil puudub Google Calendariga sünkroonimiseks vajalik seos, kuupäev või kellaaeg.",
      gcalSyncUpdatedAt: new Date().toISOString(),
    }, { merge: true });
    return { skipped: "invalid_schedule" };
  }

  try {
    const calendar = calendarOverride || await authorizedGoogleCalendar(uid, connection);
    if (after.status === "Tühistatud") {
      if (after.gcalEventId) {
        try {
          await calendar.events.delete({
            calendarId: after.gcalCalId || "primary",
            eventId: after.gcalEventId,
          });
        } catch (error) {
          if (!isGoogleGoneError(error)) {
            await queueGoogleEventDeletion(scheduleId, after, error.message || "Google deletion failed during cancellation");
          }
        }
      }
      await scheduleRef.set({
        gcalEventId: FieldValue.delete(),
        gcalEtag: FieldValue.delete(),
        gcalSyncHash: syncHash,
        gcalSyncAttemptHash: syncHash,
        gcalSyncStatus: "cancelled",
        gcalSyncError: "",
        gcalSyncedAt: new Date().toISOString(),
      }, { merge: true });
      await updateCalendarPushMetadata(uid);
      return { cancelled: true };
    }

    let googleEvent;
    if (after.gcalEventId) {
      try {
        const response = await calendar.events.patch({
          calendarId: after.gcalCalId || "primary",
          eventId: after.gcalEventId,
          requestBody,
        });
        googleEvent = response.data;
      } catch (error) {
        if (!isGoogleGoneError(error)) throw error;
      }
    }
    if (!googleEvent) {
      const existingManagedEvents = await listGoogleCalendarEvents(calendar, {
        calendarId: "primary",
        privateExtendedProperty: `keeleseppScheduleId=${scheduleId}`,
        showDeleted: false,
        singleEvents: false,
        maxResults: 25,
      }, 1);
      const existingManagedEvent = existingManagedEvents.find(event =>
        managedGoogleScheduleId(event) === scheduleId
      );
      if (existingManagedEvent?.id) {
        const response = await calendar.events.patch({
          calendarId: "primary",
          eventId: existingManagedEvent.id,
          requestBody,
        });
        googleEvent = response.data;
      } else {
        const response = await calendar.events.insert({
          calendarId: "primary",
          requestBody,
        });
        googleEvent = response.data;
      }
    }

    await scheduleRef.set({
      gcalEventId: googleEvent.id,
      gcalCalId: "primary",
      gcalEtag: googleEvent.etag || "",
      gcalSyncHash: syncHash,
      gcalSyncAttemptHash: syncHash,
      gcalSyncStatus: "synced",
      gcalSyncError: "",
      gcalSyncedAt: new Date().toISOString(),
      source: "keelesepp",
    }, { merge: true });
    await updateCalendarPushMetadata(uid);
    return { synced: true, eventId: googleEvent.id };
  } catch (error) {
    const message = String(error.message || error).slice(0, 500);
    await scheduleRef.set({
      gcalSyncAttemptHash: syncHash,
      gcalSyncStatus: "error",
      gcalSyncError: message,
      gcalSyncUpdatedAt: new Date().toISOString(),
    }, { merge: true });
    await updateCalendarPushMetadata(uid, { error: message });
    return { error: message };
  }
}

function calendarTeacherKey(value) {
  const first = normalizeCalendarName(value).split(/\s+/)[0] || "";
  return {
    yelyzaveta: "elizaveta",
    elizaveta: "elizaveta",
    anhelina: "angelina",
    angelina: "angelina",
    elena: "jelena",
    jelena: "jelena",
  }[first] || first;
}

async function backfillScheduleToGoogle(uid, connection, { force = false, retryErrors = false } = {}) {
  if (!calendarConnectionCanWrite(connection)) return { synced: 0, skipped: 0, failed: 0 };
  const [scheduleSnap, userSnap] = await Promise.all([
    db.collection("schedule").get(),
    db.collection("users").doc(uid).get(),
  ]);
  const teacherKey = calendarTeacherKey(userSnap.data()?.displayName || "");
  const candidateDocs = scheduleSnap.docs.filter(doc => {
    const schedule = doc.data();
    if (schedule.teacherUid === uid) return true;
    return !schedule.teacherUid
      && teacherKey
      && calendarTeacherKey(schedule.teacherFull || schedule.teacher) === teacherKey;
  });
  const calendar = await authorizedGoogleCalendar(uid, connection);
  let synced = 0;
  let skipped = 0;
  let failed = 0;
  for (const doc of candidateDocs) {
    const schedule = doc.data();
    const scheduleDate = schedule.date || schedule.startDate || "";
    if (schedule.source === "gcal" || (!schedule.recurring && scheduleDate < localDate(new Date(), APP_TIME_ZONE))) {
      skipped++;
      continue;
    }
    if (!schedule.teacherUid) {
      await doc.ref.set({
        teacherUid: uid,
        teacherFull: schedule.teacherFull || userSnap.data()?.displayName || schedule.teacher || "",
        gcalSyncStatus: "queued",
        gcalSyncUpdatedAt: new Date().toISOString(),
      }, { merge: true });
      skipped++;
      continue;
    }
    const result = await syncScheduleRecordToGoogle(
      doc.id,
      null,
      schedule,
      { force, retryErrors, connectionOverride: connection, calendarOverride: calendar },
    );
    if (result.synced || result.cancelled) synced++;
    else if (result.error) failed++;
    else skipped++;
  }
  return { synced, skipped, failed };
}

exports.syncScheduleToGoogle = functions.firestore
  .document("schedule/{scheduleId}")
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    const result = await syncScheduleRecordToGoogle(
      context.params.scheduleId,
      before,
      after,
    );
    if (result.error) {
      console.error(`Google Calendar push failed for ${context.params.scheduleId}:`, result.error);
    }
    return null;
  });

// ── SCHEDULED: sync all connected teachers every hour ─────────
exports.syncAllCalendars = functions.pubsub
  .schedule("every 60 minutes")
  .timeZone(APP_TIME_ZONE)
  .onRun(async () => {
    const connectionsSnap = await db.collection("calendarConnections")
      .where("connected", "==", true)
      .get();
    const legacySnap = await db.collection("users")
      .where("gcal.connected", "==", true)
      .get();
    const connected = new Map();
    connectionsSnap.docs.forEach(doc => connected.set(doc.id, doc.data()));
    for (const doc of legacySnap.docs) {
      if (connected.has(doc.id)) continue;
      const migrated = await loadCalendarConnection(doc.id, { migrateLegacy: true });
      if (migrated) connected.set(doc.id, migrated);
    }

    console.log(`Syncing ${connected.size} connected teachers`);
    for (const [uid, connection] of connected.entries()) {
      try {
        if (calendarConnectionCanWrite(connection)) {
          await flushCalendarSyncOutbox(uid, connection);
          await backfillScheduleToGoogle(uid, connection, { retryErrors: true });
        }
        await syncTeacherCalendar(uid, connection);
      } catch (e) {
        console.error(`Sync failed for ${uid}:`, e.message);
        const message = String(e.message || "Sync failed").slice(0, 500);
        await calendarConnectionRef(uid).set({
          lastSyncError: message,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        await db.collection("users").doc(uid).set({
          gcal: { lastSyncError: message },
        }, { merge: true });
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

// ── SCHEDULED: rule-based owner assistant ───────────────────
// This monitor deliberately does not call an external AI provider. It keeps
// student, payroll and finance data inside the Firebase project.
exports.refreshSchoolAssistant = functions
  .pubsub
  .schedule("15 * * * *")
  .timeZone(APP_TIME_ZONE)
  .onRun(async () => {
    const result = await refreshOperationalAlerts();
    console.log("School assistant refreshed", result);
    return null;
  });
