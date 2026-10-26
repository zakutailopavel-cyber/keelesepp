"use strict";
// The worksheet constructor for ChatGPT (owner 2026-10-26: „листы будет делать гпт”). A Custom GPT calls this API
// (OpenAPI at /openapi.json) with its own key: it reads the rules and the block catalogue, finds the course lesson,
// checks a sheet with the constructor's own checks (generated/sheet-kit.cjs, built from crm-v2) and saves it as the
// lesson sheet's DRAFT. The published sheet the students see never changes here: a person opens the draft in the
// constructor and presses „Avalda”. Keys: sheetBuilderKeys/{sha256} (no client access, firestore.rules catch-all);
// an administrator creates and revokes them (CRM „Seaded” → ChatGPT, Firebase token).
const crypto = require("crypto");

const KEY_PREFIX = "kss_";
const CRM_URL = "https://crm.epkoolitus.ee";
const PHASES = ["discover", "practice", "transfer", "opik"];
const PHASE_LABEL = { discover: "Avasta", practice: "Harjuta", transfer: "Kasuta", opik: "Õpik" };
const LESSON_SCHEMA = "keelesepp.lesson-worksheet/1";
const SUMMARY_IDS = new Set(PHASES);
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

let kitCache = null;
const kit = () => (kitCache ||= require("./generated/sheet-kit.cjs"));

const hashKey = (key) => crypto.createHash("sha256").update(String(key)).digest("hex");
const newKey = () => `${KEY_PREFIX}${crypto.randomBytes(30).toString("base64url")}`;
const clean = (value) => JSON.parse(JSON.stringify(value));
const text = (value, max = 300) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function apiError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

// ---------- the rules the GPT follows (docs/CEFR_A2_B1_LEARNING_STANDARD.md, docs/GPT_SHEET_BUILDER.md) ----------
const RULES = [
  "Kirjuta õppijale nähtav tekst eesti keeles; tõlked (vene) ainult sõnavarakastides ja vihjetes.",
  "Üks tund = kolm eraldi töölehte samal eesmärgil: discover (Avasta), practice (Harjuta), transfer (Kasuta). Õpiku leht = phase \"opik\" (õpiku reegel ja harjutused 1:1).",
  "Avasta: aktiveerimine, sõnavara tugi, loomulik tekst/dialoog (A2+/B1- 100–180 sõna), üldmõistmine, detail + järeldus, keele märkamine näidetest, lühike esimene kasutus, väike isiklik vastus, enesekontroll. 7–9 sisukat plokki; küsimusi vähemalt 5.",
  "Harjuta: lühike meenutus, vormi äratundmine, teisendus, kontrollitud loome, vigade parandus, segaharjutus varasema materjaliga, lühike suuline ülesanne, väljumiskontroll. Vähemalt kaks ülesannet nõuavad teisendust, mitte valikut.",
  "Kasuta: meenutus ilma vastusteta, üks autentne olukord/roll, pikem rääkimine või dialoog, lühike kirjutamine; B1- alates ootamatu muutus; enesehindamine „Ma oskan…” eesmärgi järgi. Valmis näidisvastust ei näidata enne.",
  "Igal ülesandel on title ja instruction. Vastused kirjuta blokkide süntaksiga: lünk [vastus], valikvastuse õige variant *tärniga*, ridade vastused answer-väljal — vaata iga ploki näidet (GET /blocks).",
  "meta.goals = 2–4 eesmärki „Ma oskan…” stiilis (võti g_*), ja iga ülesande block.goal viitab ühele neist.",
  "Pilte ja heli ei saa lisada: jäta image-väljad tühjaks; õpetaja lisab pildi konstruktoris.",
  "Ära kasuta toorest Markdowni (**, _, #) õppijale nähtavas tekstis.",
  "Enne salvestamist kutsu POST /check ja paranda kõik errors; salvesta POST /drafts. Leht jääb mustandiks, avaldab inimene.",
];

function guide() {
  const k = kit();
  return {
    schema: k.KIT_SCHEMA,
    phases: PHASES.map((phase) => ({ phase, label: PHASE_LABEL[phase] })),
    levels: ["A1", "A2", "A2+", "B1-", "B1", "B2", "C1"],
    tones: k.tones(),
    rules: RULES,
    documentShape: {
      schema: k.KIT_SCHEMA,
      meta: { title: "…", subtitle: "…", level: "B1", module: "…", canDo: "Ma oskan …", goals: { g_1: "Ma oskan …" } },
      blocks: [{ type: "gaps", width: "half | full", tone: "blue", goal: "g_1", data: "— vaata ploki näidet —" }],
    },
    blocks: k.blockCatalog().map(({ type, label, group, task, width, variants }) => ({ type, label, group, task, width, ...(variants ? { variants: variants.map((v) => v.variant) } : {}) })),
    sample: k.sampleSheet(),
  };
}

function blockDetail(type) {
  const found = kit().blockCatalog().find((item) => item.type === type);
  if (!found) throw apiError(404, `Tundmatu ploki tüüp: ${type}`);
  return found;
}

// ---------- keys ----------
async function keyFrom(db, req) {
  const header = String(req.get?.("Authorization") || req.headers?.authorization || "");
  const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!key.startsWith(KEY_PREFIX) || key.length < 30) throw apiError(401, "Võti puudub või on vigane.");
  const ref = db.collection("sheetBuilderKeys").doc(hashKey(key));
  const snap = await ref.get();
  if (!snap.exists || snap.data().revokedAt) throw apiError(401, "Võti ei kehti.");
  ref.set({ lastUsedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
  return { id: snap.id, label: snap.data().label || "ChatGPT" };
}

async function createKey(db, actor, body = {}) {
  const key = newKey();
  const id = hashKey(key);
  const record = { label: text(body.label, 60) || "ChatGPT", createdAt: new Date().toISOString(), createdByUid: actor.uid, createdByName: actor.name || "", hint: `${key.slice(0, 8)}…${key.slice(-4)}`, revokedAt: "" };
  await db.collection("sheetBuilderKeys").doc(id).set(record);
  return { id, key, ...record };
}

async function listKeys(db) {
  const snap = await db.collection("sheetBuilderKeys").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function revokeKey(db, actor, body = {}) {
  const id = String(body.id || "");
  if (!/^[0-9a-f]{64}$/.test(id)) throw apiError(400, "Võtme ID on vigane.");
  await db.collection("sheetBuilderKeys").doc(id).set({ revokedAt: new Date().toISOString(), revokedByUid: actor.uid }, { merge: true });
  return { ok: true };
}

// ---------- lessons ----------
function lessonSummary(id, data = {}) {
  const phases = data.worksheetPhases || {};
  return {
    id,
    level: data.level || "",
    module: data.roadmapModuleNumber ? `${data.roadmapModuleNumber}. ${data.roadmapModuleTitle || ""}`.trim() : data.topic || "",
    lesson: data.roadmapLessonNumber || data.order || null,
    title: data.title || "",
    goal: text(data.goal || data.description, 400),
    sheets: Object.fromEntries(PHASES.filter((phase) => phases[phase]).map((phase) => [phase, { status: phases[phase].status, title: phases[phase].title, version: phases[phase].version, publishedVersion: phases[phase].publishedVersion }])),
  };
}

async function listLessons(db, query = {}) {
  const level = text(query.level, 20);
  const needle = text(query.q, 80).toLocaleLowerCase("et");
  const limit = Math.min(200, Math.max(1, Number(query.limit) || 50));
  const snap = level ? await db.collection("curriculumLessons").where("level", "==", level).get() : await db.collection("curriculumLessons").get();
  const items = snap.docs.map((d) => ({ d, data: d.data() }))
    .filter(({ data }) => data.roadmapManaged || data.curriculumId)
    .filter(({ d, data }) => !needle || `${d.id} ${data.title} ${data.roadmapModuleTitle} ${data.goal} ${data.languageFocus}`.toLocaleLowerCase("et").includes(needle))
    .sort((a, b) => String(a.data.level).localeCompare(String(b.data.level)) || (a.data.roadmapModuleNumber || 0) - (b.data.roadmapModuleNumber || 0) || (a.data.roadmapLessonNumber || a.data.order || 0) - (b.data.roadmapLessonNumber || b.data.order || 0));
  return { total: items.length, lessons: items.slice(0, limit).map(({ d, data }) => lessonSummary(d.id, data)) };
}

async function lessonDetail(db, lessonId, query = {}) {
  if (!ID_PATTERN.test(lessonId)) throw apiError(400, "Tunni ID on vigane.");
  const snap = await db.collection("curriculumLessons").doc(lessonId).get();
  if (!snap.exists) throw apiError(404, "Õppetundi ei leitud.");
  const data = snap.data();
  const result = {
    ...lessonSummary(snap.id, data),
    languageFocus: text(data.languageFocus, 600),
    successCriteria: Array.isArray(data.successCriteria) ? data.successCriteria.slice(0, 10) : text(data.successCriteria, 600),
    moduleGoal: text(data.roadmapModuleGoal, 400),
    editorUrls: Object.fromEntries(PHASES.map((phase) => [phase, `${CRM_URL}/library/lessons/${snap.id}/worksheets/${phase}`])),
  };
  const phase = String(query.phase || "");
  if (PHASES.includes(phase)) {
    const sheet = await snap.ref.collection("worksheets").doc(phase).get();
    // the current draft to improve (it falls back to the published sheet)
    result.worksheetDoc = sheet.exists ? sheet.data().worksheetDoc || sheet.data().publishedWorksheetDoc || null : null;
  }
  return result;
}

// ---------- check and save ----------
function checkBody(body = {}) {
  const k = kit();
  if (!body.worksheetDoc || typeof body.worksheetDoc !== "object") throw apiError(400, "worksheetDoc puudub.");
  const doc = k.normalizeSheet(body.worksheetDoc);
  return { doc, result: k.checkSheet(doc) };
}

async function saveDraft(db, key, body = {}) {
  const lessonId = String(body.lessonId || "");
  const phase = String(body.phase || "");
  if (!ID_PATTERN.test(lessonId)) throw apiError(400, "lessonId puudub või on vigane.");
  if (!PHASES.includes(phase)) throw apiError(400, `phase peab olema üks: ${PHASES.join(", ")}.`);
  const { doc, result } = checkBody(body);
  if (result.errors.length || !result.ready) throw apiError(422, "Leht ei läbinud kontrolli — paranda ja proovi uuesti.", { errors: result.errors, issues: result.issues.filter((issue) => issue.level === "error") });
  const lessonRef = db.collection("curriculumLessons").doc(lessonId);
  const sheetRef = lessonRef.collection("worksheets").doc(phase);
  const now = new Date().toISOString();
  const by = `gpt:${key.id.slice(0, 12)}`;
  const byName = `ChatGPT (${key.label})`;
  const note = text(body.note, 300);
  const saved = await db.runTransaction(async (tx) => {
    const [lessonSnap, sheetSnap] = await Promise.all([tx.get(lessonRef), tx.get(sheetRef)]);
    if (!lessonSnap.exists) throw apiError(404, "Õppetundi ei leitud.");
    const current = sheetSnap.exists ? sheetSnap.data() : null;
    const version = (Number(current?.worksheetDocVersion) || 0) + 1;
    const storedDoc = clean({ ...doc, updatedAt: now, updatedBy: by, version, status: "draft" });
    const record = {
      schema: LESSON_SCHEMA,
      lessonId,
      worksheetId: phase,
      role: phase === "opik" ? "focus" : phase,
      slot: current?.slot ?? null,
      displayLabel: String(current?.displayLabel || storedDoc.meta?.title || "").trim(),
      title: String(storedDoc.meta?.title || "").trim(),
      source: "manual",
      ...(current?.generation ? { generation: current.generation } : {}),
      contentOrigin: { kind: "gpt-connector", keyLabel: key.label, note, savedAt: now },
      worksheetDoc: storedDoc,
      worksheetDocStatus: "draft",
      worksheetDocVersion: version,
      worksheetDocUpdatedAt: now,
      createdAt: current?.createdAt || now,
      createdBy: current?.createdBy || by,
      updatedAt: now,
      updatedBy: by,
      ...(current?.publishedWorksheetDoc ? {
        publishedWorksheetDoc: current.publishedWorksheetDoc,
        publishedWorksheetDocVersion: current.publishedWorksheetDocVersion,
        publishedWorksheetDocUpdatedAt: current.publishedWorksheetDocUpdatedAt,
      } : {}),
    };
    tx.set(sheetRef, clean(record)); // older sheets may lack a field (undefined is not a Firestore value)
    tx.set(db.collection("worksheetVersions").doc(`${lessonId}_${phase}_studio_v${version}`), {
      lessonId, worksheetId: phase, role: record.role, version, status: "draft", worksheetDoc: storedDoc, title: record.title,
      createdAt: now, createdBy: by, createdByName: byName, source: "gpt-connector", note,
    });
    if (SUMMARY_IDS.has(phase)) {
      tx.set(lessonRef, { worksheetPhases: { [phase]: {
        title: record.title, status: "draft", version, publishedVersion: Number(current?.publishedWorksheetDocVersion) || 0, updatedAt: now,
      } } }, { merge: true });
    }
    return { version, created: !current, published: Boolean(current?.publishedWorksheetDoc) };
  });
  return {
    saved: true,
    ...saved,
    status: "draft",
    editorUrl: `${CRM_URL}/library/lessons/${lessonId}/worksheets/${phase}`,
    message: `Mustand v${saved.version} on salvestatud. Õpilased näevad endiselt ${saved.published ? "avaldatud versiooni" : "mitte midagi"}, kuni inimene vajutab konstruktoris „Avalda”.`,
    issues: result.issues,
  };
}

// ---------- OpenAPI for the Custom GPT (Actions) ----------
function openapi(serverUrl) {
  const json = { "application/json": { schema: { type: "object" } } };
  const docBody = { required: true, content: { "application/json": { schema: { type: "object", properties: { worksheetDoc: { type: "object", description: "keelesepp.worksheet/2 dokument (vaata /guide)" } }, required: ["worksheetDoc"] } } } };
  return {
    openapi: "3.1.0",
    info: { title: "KeeleSepp töölehtede konstruktor", version: "1.0.0", description: "Loe reeglid ja plokid, leia tund, kontrolli lehte ja salvesta see tunni mustandiks. Avaldab inimene." },
    servers: [{ url: serverUrl }],
    components: { securitySchemes: { key: { type: "http", scheme: "bearer" } }, schemas: {} },
    security: [{ key: [] }],
    paths: {
      "/guide": { get: { operationId: "getGuide", summary: "Reeglid, faasid, plokkide nimekiri ja näidisleht", responses: { 200: { description: "ok", content: json } } } },
      "/blocks/{type}": { get: { operationId: "getBlock", summary: "Ühe ploki täidetud näide (data kuju ja vastuste süntaks)", parameters: [{ name: "type", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "ok", content: json } } } },
      "/lessons": { get: { operationId: "listLessons", summary: "Kursuse tunnid (tase, otsing)", parameters: [{ name: "level", in: "query", schema: { type: "string" } }, { name: "q", in: "query", schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "ok", content: json } } } },
      "/lessons/{lessonId}": { get: { operationId: "getLesson", summary: "Tunni eesmärk, keelefookus ja lehtede olek; phase=… annab praeguse lehe", parameters: [{ name: "lessonId", in: "path", required: true, schema: { type: "string" } }, { name: "phase", in: "query", schema: { type: "string", enum: PHASES } }], responses: { 200: { description: "ok", content: json } } } },
      "/check": { post: { operationId: "checkSheet", summary: "Kontrolli lehte konstruktori kontrollidega (ei salvesta)", requestBody: docBody, responses: { 200: { description: "ok", content: json } } } },
      "/drafts": { post: { operationId: "saveDraft", summary: "Salvesta leht tunni mustandiks (ei avalda)", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { lessonId: { type: "string" }, phase: { type: "string", enum: PHASES }, note: { type: "string" }, worksheetDoc: { type: "object" } }, required: ["lessonId", "phase", "worksheetDoc"] } } } }, responses: { 200: { description: "ok", content: json }, 422: { description: "kontroll ei läbinud", content: json } } } },
    },
  };
}

// ---------- the HTTP handler ----------
function createHandler({ db, requireAdminUser, actorSnapshot, applyCors }) {
  return async (req, res) => {
    applyCors(req, res);
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
    const path = String(req.path || "/").replace(/\/+$/, "") || "/";
    try {
      if (path === "/openapi.json") { res.json(openapi(`https://${req.get("host")}/sheetBuilderApi`)); return; }
      if (path.startsWith("/keys")) {
        const actor = actorSnapshot(await requireAdminUser(req));
        if (path === "/keys" && req.method === "GET") { res.json({ keys: await listKeys(db) }); return; }
        if (path === "/keys" && req.method === "POST") { res.json(await createKey(db, actor, req.body || {})); return; }
        if (path === "/keys/revoke" && req.method === "POST") { res.json(await revokeKey(db, actor, req.body || {})); return; }
        throw apiError(404, "Tundmatu aadress.");
      }
      const key = await keyFrom(db, req);
      if (path === "/guide" && req.method === "GET") { res.json(guide()); return; }
      if (path.startsWith("/blocks/") && req.method === "GET") { res.json(blockDetail(decodeURIComponent(path.slice(8)))); return; }
      if (path === "/lessons" && req.method === "GET") { res.json(await listLessons(db, req.query || {})); return; }
      if (path.startsWith("/lessons/") && req.method === "GET") { res.json(await lessonDetail(db, decodeURIComponent(path.slice(9)), req.query || {})); return; }
      if (path === "/check" && req.method === "POST") { const { doc, result } = checkBody(req.body || {}); res.json({ ...result, worksheetDoc: doc }); return; }
      if (path === "/drafts" && req.method === "POST") { res.json(await saveDraft(db, key, req.body || {})); return; }
      throw apiError(404, "Tundmatu aadress.");
    } catch (error) {
      const status = error.status || error.statusCode || 500;
      if (status >= 500) console.error("sheetBuilderApi", error);
      res.status(status).json({ error: status >= 500 ? "Serveri viga." : error.message, ...(error.details ? { details: error.details } : {}) });
    }
  };
}

module.exports = { createHandler, hashKey, guide, openapi, PHASES, KEY_PREFIX, lessonSummary };
