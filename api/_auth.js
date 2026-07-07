import crypto from 'crypto';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'keelesepp-5136b';
const CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const DEFAULT_ORIGINS = [
  'https://keelesepp.vercel.app',
  'https://epkoolitus.ee',
  'https://www.epkoolitus.ee',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080'
];
const STAFF_ROLES = new Set(['teacher', 'admin']);
const ALLOWED_MODELS = new Set(
  (process.env.ANTHROPIC_ALLOWED_MODELS || 'claude-sonnet-4-6,claude-haiku-4-5-20251001')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
);
const SUPER_ADMIN_EMAILS = new Set(
  (process.env.SUPER_ADMIN_EMAILS || 'zakutailo.pavel@gmail.com')
    .split(',')
    .map(v => v.trim().toLowerCase())
    .filter(Boolean)
);
const WINDOW_MS = 15 * 60 * 1000;
const RATE_BUCKETS = new Map();
let certCache = { expiresAt: 0, certs: {} };

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function b64urlToBuffer(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  return Buffer.from(padded, 'base64');
}

function b64urlJson(value) {
  return JSON.parse(b64urlToBuffer(value).toString('utf8'));
}

async function loadSecureTokenCerts() {
  if (Date.now() < certCache.expiresAt && Object.keys(certCache.certs).length) {
    return certCache.certs;
  }
  const response = await fetch(CERT_URL);
  if (!response.ok) throw httpError(503, 'Firebase token certificates unavailable');
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number((cacheControl.match(/max-age=(\d+)/) || [])[1] || 300);
  certCache = {
    expiresAt: Date.now() + Math.max(60, maxAge - 60) * 1000,
    certs: await response.json()
  };
  return certCache.certs;
}

async function verifyFirebaseToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw httpError(401, 'Invalid Firebase ID token');
  const header = b64urlJson(parts[0]);
  const payload = b64urlJson(parts[1]);
  if (header.alg !== 'RS256' || !header.kid) throw httpError(401, 'Invalid Firebase ID token');

  const certs = await loadSecureTokenCerts();
  const cert = certs[header.kid];
  if (!cert) throw httpError(401, 'Unknown Firebase token key');

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  if (!verifier.verify(cert, b64urlToBuffer(parts[2]))) {
    throw httpError(401, 'Invalid Firebase ID token signature');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== PROJECT_ID) throw httpError(401, 'Invalid Firebase token audience');
  if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) throw httpError(401, 'Invalid Firebase token issuer');
  if (!payload.sub || typeof payload.sub !== 'string') throw httpError(401, 'Invalid Firebase token subject');
  if (payload.exp <= now || payload.iat > now + 300) throw httpError(401, 'Expired Firebase ID token');
  return { ...payload, uid: payload.sub, _token: token };
}

async function fetchUserRole(decoded) {
  if (decoded.admin === true) return 'admin';
  if (typeof decoded.role === 'string') return decoded.role;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${encodeURIComponent(decoded.uid)}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${decoded._token}` } });
    if (!response.ok) return '';
    const doc = await response.json();
    return doc.fields?.role?.stringValue || '';
  } catch (err) {
    return '';
  }
}

export function setCors(req, res) {
  const allowedOrigins = new Set([
    ...DEFAULT_ORIGINS,
    ...(process.env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean)
  ]);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

export function handleOptions(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function sendError(res, err) {
  const status = err.status || 500;
  const message = status >= 500 ? 'Internal error' : err.message;
  return res.status(status).json({ error: message });
}

export async function requireFirebaseUser(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw httpError(401, 'Firebase ID token required');
  return verifyFirebaseToken(match[1]);
}

export async function requireStaff(req) {
  const decoded = await requireFirebaseUser(req);
  const role = await fetchUserRole(decoded);
  const email = String(decoded.email || '').toLowerCase();
  if (STAFF_ROLES.has(role) || SUPER_ADMIN_EMAILS.has(email)) return { decoded, role: role || 'admin' };
  throw httpError(403, 'Teacher or admin access required');
}

export function checkRateLimit(key, limit = 30) {
  const now = Date.now();
  const bucketKey = String(key || 'anonymous');
  const bucket = RATE_BUCKETS.get(bucketKey) || { start: now, count: 0 };
  if (now - bucket.start > WINDOW_MS) {
    bucket.start = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  RATE_BUCKETS.set(bucketKey, bucket);
  if (bucket.count > limit) throw httpError(429, 'Too many requests');
}

export function normalizeAnthropicBody(body, { maxTokens = 8000 } = {}) {
  if (!body || typeof body !== 'object') throw httpError(400, 'JSON body required');
  const next = { ...body };
  if (!ALLOWED_MODELS.has(next.model)) throw httpError(400, 'Unsupported model');
  const requestedTokens = Number(next.max_tokens || 1024);
  next.max_tokens = Math.max(1, Math.min(maxTokens, Number.isFinite(requestedTokens) ? requestedTokens : 1024));
  return next;
}
