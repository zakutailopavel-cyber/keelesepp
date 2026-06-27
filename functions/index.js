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

admin.initializeApp();
const db = admin.firestore();

// ── CONFIG ────────────────────────────────────────────────────
// Set these in Firebase Functions config:
// firebase functions:config:set gcal.client_id="..." gcal.client_secret="..." gcal.redirect_uri="..."
const getConfig = () => ({
  clientId:     functions.config().gcal?.client_id     || process.env.GCAL_CLIENT_ID,
  clientSecret: functions.config().gcal?.client_secret || process.env.GCAL_CLIENT_SECRET,
  redirectUri:  functions.config().gcal?.redirect_uri  || process.env.GCAL_REDIRECT_URI ||
                "https://keelesepp-5136b.web.app/api/gcal/callback",
});

// ── OAUTH CLIENT ──────────────────────────────────────────────
function getOAuthClient() {
  const cfg = getConfig();
  return new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
}

// ── HELPERS ───────────────────────────────────────────────────

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
function gcalEventToSchedule(event, teacher, studentId, studentName) {
  const start = event.start?.dateTime || event.start?.date;
  const end   = event.end?.dateTime   || event.end?.date;
  if (!start) return null;

  const startDate = new Date(start);
  const date = startDate.toISOString().split("T")[0];
  const time = event.start?.dateTime
    ? startDate.toLocaleTimeString("et-EE", { hour: "2-digit", minute: "2-digit" })
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
    date,
    time,
    duration,
    status:       "Planeeritud",
    source:       "gcal",
    updatedAt:    new Date().toISOString(),
  };
}

// ── API: GET /api/gcal/auth-url ───────────────────────────────
exports.api = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const path = req.path;

  // ── GET /gcal/auth-url ──────────────────────────────────────
  if (path === "/gcal/auth-url" && req.method === "GET") {
    const uid = req.query.uid;
    if (!uid) { res.status(400).json({ error: "uid required" }); return; }
    const oauth2 = getOAuthClient();
    const url = oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar.readonly"],
      state: uid, // pass uid through OAuth flow
    });
    res.json({ url });
    return;
  }

  // ── GET /gcal/callback ──────────────────────────────────────
  if (path === "/gcal/callback" && req.method === "GET") {
    const { code, state: uid } = req.query;
    if (!code || !uid) { res.status(400).send("Missing code or state"); return; }
    try {
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
      res.redirect("https://keelesepp-5136b.web.app/haldus.html?gcal=connected");
    } catch (e) {
      console.error("OAuth callback error:", e);
      res.redirect("https://keelesepp-5136b.web.app/haldus.html?gcal=error");
    }
    return;
  }

  // ── POST /gcal/sync ─────────────────────────────────────────
  if (path === "/gcal/sync" && req.method === "POST") {
    const { uid } = req.body;
    if (!uid) { res.status(400).json({ error: "uid required" }); return; }
    try {
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
      await db.collection("users").doc(uid).update({
        gcal: admin.firestore.FieldValue.delete(),
      });
      // Remove synced events from schedule
      const snap = await db.collection("schedule")
        .where("source", "==", "gcal")
        .where("teacher", "==", uid)
        .get();
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
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
    const userDoc = await db.collection("users").doc(uid).get();
    const gcal = userDoc.data()?.gcal || {};
    res.json({
      connected: !!gcal.connected,
      connectedAt: gcal.connectedAt || null,
    });
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
  const teacherName = userDoc.data()?.displayName || "";

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
    // Skip all-day events without a title pattern we recognize
    const studentName = extractStudentName(event.summary || "");
    if (!studentName) { skipped++; continue; }

    // Find matching student
    const student = await findStudentByName(studentName, teacherName);

    const scheduleData = gcalEventToSchedule(
      { ...event, calendarId: "primary" },
      teacherName,
      student?.id || "",
      student?.name || studentName,
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
