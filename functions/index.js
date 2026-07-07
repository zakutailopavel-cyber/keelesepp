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
];

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
exports.syncAllCalendars = functions.pubsub
  .schedule("every 60 minutes")
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
