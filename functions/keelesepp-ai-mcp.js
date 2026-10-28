"use strict";
// KeeleSepp AI as a ChatGPT plugin (owner 2026-10-26: GPTs can no longer be created, plugins connect through MCP).
// The same tools as the Actions API (sheet-builder-api.js) over MCP Streamable HTTP (JSON-RPC, stateless JSON answers),
// and the OAuth 2.1 flow ChatGPT needs: protected-resource metadata, authorization-server metadata, dynamic client
// registration, an administrator's consent page in the CRM (/ai/connect) and the token endpoint with PKCE (S256).
// Public addresses live on the CRM domain (crm-v2/vercel.json rewrites them to this function):
//   https://crm.epkoolitus.ee/ai/mcp, /.well-known/oauth-protected-resource[/ai/mcp], /.well-known/oauth-authorization-server
// A token is a sheetBuilderKeys entry (kind "oauth"): only the drafts the key allows; revoked in Seaded like any key.
const crypto = require("crypto");

const PUBLIC = "https://crm.epkoolitus.ee";
const MCP_URL = `${PUBLIC}/ai/mcp`;
const PRM_URL = `${PUBLIC}/.well-known/oauth-protected-resource/ai/mcp`;
const SCOPE = "sheets";
const CODE_TTL_MS = 5 * 60 * 1000;
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
// ChatGPT's OAuth callbacks only: a registered client cannot send the code anywhere else
const REDIRECT_HOSTS = ["chatgpt.com", "chat.openai.com", "platform.openai.com"];

const sha = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const b64url = (buffer) => buffer.toString("base64url");
const text = (value, max = 200) => String(value ?? "").trim().slice(0, max);

function oauthError(status, error, description) {
  const err = new Error(description || error);
  err.status = status;
  err.oauth = { error, ...(description ? { error_description: description } : {}) };
  return err;
}

const allowedRedirect = (uri) => {
  try { const url = new URL(uri); return url.protocol === "https:" && REDIRECT_HOSTS.includes(url.hostname); } catch { return false; }
};

function protectedResource() {
  return { resource: MCP_URL, authorization_servers: [PUBLIC], scopes_supported: [SCOPE], bearer_methods_supported: ["header"], resource_name: "KeeleSepp AI" };
}

function authorizationServer() {
  return {
    issuer: PUBLIC,
    authorization_endpoint: `${PUBLIC}/ai/connect`,
    token_endpoint: `${PUBLIC}/ai/oauth/token`,
    registration_endpoint: `${PUBLIC}/ai/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [SCOPE],
  };
}

// RFC 7591: ChatGPT registers itself; only its own https callbacks are accepted
async function register(db, body = {}) {
  const uris = Array.isArray(body.redirect_uris) ? body.redirect_uris.map((uri) => text(uri, 500)) : [];
  if (!uris.length || !uris.every(allowedRedirect)) throw oauthError(400, "invalid_redirect_uri", "Only ChatGPT callback addresses are allowed.");
  const clientId = `kai_${b64url(crypto.randomBytes(18))}`;
  const record = { client_name: text(body.client_name, 120) || "ChatGPT", redirect_uris: uris, createdAt: new Date().toISOString() };
  await db.collection("sheetBuilderClients").doc(clientId).set(record);
  return { client_id: clientId, ...record, token_endpoint_auth_method: "none", grant_types: ["authorization_code"], response_types: ["code"], client_id_issued_at: Math.floor(Date.now() / 1000) };
}

async function clientFor(db, clientId, redirectUri) {
  if (!/^kai_[A-Za-z0-9_-]{10,40}$/.test(String(clientId || ""))) throw oauthError(400, "invalid_client", "Unknown client.");
  const snap = await db.collection("sheetBuilderClients").doc(clientId).get();
  if (!snap.exists) throw oauthError(400, "invalid_client", "Unknown client.");
  if (!snap.data().redirect_uris.includes(redirectUri)) throw oauthError(400, "invalid_request", "redirect_uri does not match the registration.");
  return snap.data();
}

// the consent page (/ai/connect) asks what is being connected
async function describe(db, query = {}) {
  const client = await clientFor(db, query.client_id, query.redirect_uri);
  return { clientName: client.client_name, redirectHost: new URL(query.redirect_uri).hostname, scope: SCOPE };
}

// an administrator pressed „Luba”: a one-time code for ChatGPT (PKCE S256 required)
async function approve(db, actor, body = {}) {
  const redirectUri = text(body.redirect_uri, 500);
  await clientFor(db, body.client_id, redirectUri);
  if (body.response_type && body.response_type !== "code") throw oauthError(400, "unsupported_response_type");
  if (body.code_challenge_method !== "S256" || !/^[A-Za-z0-9_-]{43,128}$/.test(String(body.code_challenge || ""))) throw oauthError(400, "invalid_request", "PKCE S256 is required.");
  const code = b64url(crypto.randomBytes(32));
  await db.collection("sheetBuilderCodes").doc(sha(code)).set({
    clientId: body.client_id, redirectUri, challenge: body.code_challenge, uid: actor.uid, name: actor.name || "",
    expiresAt: Date.now() + CODE_TTL_MS, used: false,
  });
  const url = new URL(redirectUri);
  url.searchParams.set("code", code);
  if (body.state) url.searchParams.set("state", text(body.state, 500));
  return { redirect: url.toString() };
}

async function token(db, body = {}, { createKey }) {
  if (body.grant_type !== "authorization_code") throw oauthError(400, "unsupported_grant_type");
  const ref = db.collection("sheetBuilderCodes").doc(sha(body.code || ""));
  const record = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    tx.update(ref, { used: true });
    return snap.data();
  });
  if (!record || record.used || record.expiresAt < Date.now()) throw oauthError(400, "invalid_grant", "The code is unknown, used or expired.");
  if (record.clientId !== body.client_id || record.redirectUri !== body.redirect_uri) throw oauthError(400, "invalid_grant", "client_id or redirect_uri does not match.");
  if (b64url(crypto.createHash("sha256").update(String(body.code_verifier || "")).digest()) !== record.challenge) throw oauthError(400, "invalid_grant", "PKCE check failed.");
  const made = await createKey(db, { uid: record.uid, name: record.name }, { label: "ChatGPT plugin" }, { kind: "oauth", clientId: record.clientId });
  return { access_token: made.key, token_type: "Bearer", scope: SCOPE };
}

// ---------- MCP ----------
const obj = (properties, required = []) => ({ type: "object", properties, required, additionalProperties: false });
const TOOLS = [
  { name: "get_guide", description: "Reeglid (rules), faasid, dokumendi kuju, plokkide nimekiri ja näidisleht. Kutsu alati esimesena.", inputSchema: obj({}) },
  { name: "get_block", description: "Ühe plokitüübi täidetud näide: data kuju ja vastuste süntaks.", inputSchema: obj({ type: { type: "string" } }, ["type"]) },
  { name: "get_textbooks", description: "Omaniku õpikud: raamatud ja litsents (granted = Õpik-leht 1:1 lubatud).", inputSchema: obj({}) },
  { name: "get_textbook", description: "Ühe õpiku peatükid: grammatika, leheküljed, lähimad kursuse tunnid.", inputSchema: obj({ bookId: { type: "string" } }, ["bookId"]) },
  { name: "list_lessons", description: "Kursuse tunnid taseme ja otsingusõna järgi.", inputSchema: obj({ level: { type: "string" }, q: { type: "string" }, limit: { type: "integer" } }) },
  { name: "get_lesson", description: "Tunni eesmärk, keelefookus, lehtede olek; phase annab praeguse lehe (worksheetDoc).", inputSchema: obj({ lessonId: { type: "string" }, phase: { type: "string", enum: ["discover", "practice", "transfer", "opik"] } }, ["lessonId"]) },
  { name: "check_sheet", description: "Kontrolli lehte konstruktori kontrollidega (ei salvesta). Tagastab errors, issues ja normaliseeritud worksheetDoc.", inputSchema: obj({ worksheetDoc: { type: "object" } }, ["worksheetDoc"]) },
  { name: "save_draft", description: "Salvesta leht tunni mustandiks märkega „KeeleSepp AI” (ei avalda). note = allikas, nt „E nagu Eesti lk 10–13”.", inputSchema: obj({ lessonId: { type: "string" }, phase: { type: "string", enum: ["discover", "practice", "transfer", "opik"] }, worksheetDoc: { type: "object" }, note: { type: "string" } }, ["lessonId", "phase", "worksheetDoc"]) },
];

const INSTRUCTIONS = [
  "Sa oled KeeleSepp AI — KeeleSepa töölehtede koostaja. Räägi omanikuga vene keeles; õppijale nähtav tekst töölehel on eesti keeles.",
  "1. Kutsu alguses get_guide ja järgi selle reegleid ja dokumendi kuju; iga ploki kuju saad get_block kaudu.",
  "2. Leia tund: list_lessons; vaata get_lesson. Olemasoleva lehe parandamiseks võta get_lesson(lessonId, phase).worksheetDoc.",
  "3. Õpiku fotode puhul vaata get_textbooks / get_textbook: peatükk, kursuse tund, license. Käsitsi kirjutatud vastuseid ära kopeeri.",
  "4. Kontrolli check_sheet-iga ja paranda kõik errors. 5. Salvesta save_draft. 6. Anna omanikule editorUrl — avaldab tema.",
].join("\n");

async function callTool(name, args = {}, ctx) {
  const { api, db, key } = ctx;
  switch (name) {
    case "get_guide": return api.guide();
    case "get_block": return api.blockDetail(String(args.type || ""));
    case "get_textbooks": return api.textbooks();
    case "get_textbook": return api.textbooks(String(args.bookId || ""));
    case "list_lessons": return api.listLessons(db, args);
    case "get_lesson": return api.lessonDetail(db, String(args.lessonId || ""), args);
    case "check_sheet": { const { doc, result } = api.checkBody(args); return { ...result, worksheetDoc: doc }; }
    case "save_draft": return api.saveDraft(db, key, args);
    default: throw Object.assign(new Error(`Unknown tool: ${name}`), { rpc: -32602 });
  }
}

async function rpc(message, ctx) {
  const { method, params = {}, id } = message || {};
  const reply = (result) => ({ jsonrpc: "2.0", id, result });
  if (method === "initialize") {
    const version = PROTOCOL_VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOL_VERSIONS[0];
    return reply({ protocolVersion: version, capabilities: { tools: { listChanged: false } }, serverInfo: { name: "KeeleSepp AI", version: "1.0.0" }, instructions: INSTRUCTIONS });
  }
  if (method === "ping") return reply({});
  if (method === "tools/list") return reply({ tools: TOOLS });
  if (method === "tools/call") {
    try {
      const data = await callTool(params.name, params.arguments || {}, ctx);
      return reply({ content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data, isError: false });
    } catch (error) {
      if (error.rpc) return { jsonrpc: "2.0", id, error: { code: error.rpc, message: error.message } };
      // a tool's own error (a refused sheet, an unknown lesson) goes back to the model to fix
      return reply({ content: [{ type: "text", text: JSON.stringify({ error: error.message, ...(error.details ? { details: error.details } : {}) }) }], isError: true });
    }
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}

async function mcp(req, res, { db, api }) {
  if (req.method !== "POST") { res.set("Allow", "POST").status(405).json({ error: "POST required" }); return; }
  let key;
  try { key = await api.keyFrom(db, req); } catch {
    res.set("WWW-Authenticate", `Bearer resource_metadata="${PRM_URL}", scope="${SCOPE}"`).status(401).json({ error: "unauthorized" });
    return;
  }
  const body = req.body;
  const messages = Array.isArray(body) ? body : [body];
  const answers = (await Promise.all(messages.map((message) => (message && message.id !== undefined && message.id !== null ? rpc(message, { api, db, key }) : null)))).filter(Boolean);
  if (!answers.length) { res.status(202).send(""); return; } // notifications only
  res.json(Array.isArray(body) ? answers : answers[0]);
}

// ChatGPT discovers, registers and calls from its own pages (chatgpt.com): these addresses answer any origin. Safe:
// no cookies are used, every call carries its own bearer token.
const isPublic = (path) => path === "/mcp" || path.startsWith("/oauth/");
function cors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID");
  res.set("Access-Control-Expose-Headers", "WWW-Authenticate, Mcp-Session-Id");
  res.set("Access-Control-Max-Age", "600");
}

// routes under the function (vercel.json maps the public addresses here); returns true when handled
async function handle(req, res, path, { db, api, requireAdminUser, actorSnapshot }) {
  try {
    if (path === "/oauth/protected-resource" && req.method === "GET") { res.json(protectedResource()); return true; }
    if (path === "/oauth/authorization-server" && req.method === "GET") { res.json(authorizationServer()); return true; }
    if (path === "/oauth/register" && req.method === "POST") { res.status(201).json(await register(db, req.body || {})); return true; }
    if (path === "/oauth/describe" && req.method === "GET") { await requireAdminUser(req); res.json(await describe(db, req.query || {})); return true; }
    if (path === "/oauth/approve" && req.method === "POST") { const actor = actorSnapshot(await requireAdminUser(req)); res.json(await approve(db, actor, req.body || {})); return true; }
    if (path === "/oauth/token" && req.method === "POST") { res.set("Cache-Control", "no-store").json(await token(db, req.body || {}, api)); return true; }
    if (path === "/mcp") { await mcp(req, res, { db, api }); return true; }
  } catch (error) {
    const status = error.status || 500;
    if (error.oauth) { res.status(status).json(error.oauth); return true; }
    throw error;
  }
  return false;
}

module.exports = { handle, isPublic, cors, register, approve, token, rpc, TOOLS, INSTRUCTIONS, protectedResource, authorizationServer, allowedRedirect, MCP_URL, PRM_URL };
