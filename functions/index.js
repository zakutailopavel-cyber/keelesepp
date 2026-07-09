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

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { google } = require("googleapis");
const crypto = require("crypto");

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
const APP_BASE_URL = process.env.APP_BASE_URL || "https://www.epkoolitus.ee/haldus/";
const INVOICE_REMINDER_INTERVAL_DAYS = Number(process.env.INVOICE_REMINDER_INTERVAL_DAYS || 3);

// ── CONFIG ────────────────────────────────────────────────────
// Set these in Firebase Functions config:
// firebase functions:config:set gcal.client_id="..." gcal.client_secret="..." gcal.redirect_uri="..."
const getConfig = () => ({
  clientId:     functions.config().gcal?.client_id     || process.env.GCAL_CLIENT_ID,
  clientSecret: functions.config().gcal?.client_secret || process.env.GCAL_CLIENT_SECRET,
  redirectUri:  functions.config().gcal?.redirect_uri  || process.env.GCAL_REDIRECT_URI ||
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

function runtimeConfig() {
  try {
    return functions.config() || {};
  } catch (e) {
    return {};
  }
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

function composeInvoiceEmail(invoice, student, type = "invoice") {
  const amount = money(invoice.amount);
  const due = invoice.due || invoiceDueDate();
  const reference = invoice.paymentReference || invoice.num || "";
  const studentName = invoice.studentName || student?.name || "õpilane";
  const desc = invoice.desc || "Keeletunnid";
  const isReminder = type === "reminder" || type === "due10";
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
    `Õpilane: ${studentName}`,
    `Kirjeldus: ${desc}`,
    `Summa: ${amount} EUR`,
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
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1C2B3A;line-height:1.5;max-width:640px">
      <h2 style="margin:0 0 12px;color:#1C2B3A">${escapeHtml(subject)}</h2>
      <p>${escapeHtml(intro)}</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#fff">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Arve</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(invoice.num || "")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Õpilane</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(studentName)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Kirjeldus</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(desc)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Summa</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(amount)} EUR</td></tr>
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
  const cfg = runtimeConfig().mail || {};
  const resendKey = process.env.RESEND_API_KEY || cfg.resend_api_key || cfg.resendKey;
  const sendgridKey = process.env.SENDGRID_API_KEY || cfg.sendgrid_api_key || cfg.sendgridKey;
  const from = process.env.MAIL_FROM || cfg.from || MAIL_FROM;
  const replyTo = process.env.MAIL_REPLY_TO || cfg.reply_to || PAYMENT_DETAILS.email;
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

  if (!resendKey && !sendgridKey) {
    await ref.set({ ...queueBase, provider: "firestore" });
    return { status: "queued", provider: "firestore", queueId: ref.id };
  }

  await ref.set({ ...queueBase, status: "sending", provider: resendKey ? "resend" : "sendgrid" });
  try {
    let providerId = "";
    if (resendKey) {
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

// Find matching student in Firestore by name
async function findStudentByName(name, teacherName) {
  if (!name) return null;
  const norm = normalizeName(name);
  const snap = await db.collection("students").get();
  let best = null;
  for (const doc of snap.docs) {
    const s = doc.data();
    if (normalizeName(s.name) === norm) {
      // Prefer student assigned to this teacher
      if (teacherName && normalizeName(s.teacher || "") === normalizeName(teacherName)) {
        return { id: doc.id, ...s };
      }
      best = { id: doc.id, ...s };
    }
  }
  return best;
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
exports.invoiceApi = functions.https.onRequest(async (req, res) => {
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
      const studentDoc = await db.collection("students").doc(studentIdFromDesc).get();
      if (studentDoc.exists) {
        student = { id: studentDoc.id, ...studentDoc.data() };
      }
    }

    // Fallback: try to extract name from title (legacy support)
    if (!student) {
      const studentName = extractStudentName(event.summary || "");
      if (studentName) {
        student = await findStudentByName(studentName, teacherName);
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
exports.syncAllCalendars = onSchedule({
  schedule: "every 60 minutes",
  timeZone: APP_TIME_ZONE,
}, async () => {
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
exports.sendInvoicePaymentReminders = onSchedule({
  schedule: "0 9 * * *",
  timeZone: APP_TIME_ZONE,
}, async () => {
    const due10 = await sendInvoiceBatch({ type: "due10", force: false });
    const overdue = await sendInvoiceBatch({ type: "reminder", force: false });
    console.log("Invoice reminders", { due10, overdue });
    return null;
  });
