/* global __APP_BUILD__ */
// In-house client error tracking (admin 2026-11-04: learn about breakages before the screenshots arrive). Every page
// error, unhandled promise rejection, page crash (error boundary), Firestore write refused by the rules and Live
// Classroom call / camera failure becomes ONE small record in `clientErrors` (firestore.rules validates every field).
//
// Privacy: never document data, form contents, names, e-mails, tokens or URLs with a query string. Messages are
// sanitized (e-mails, long numbers, ids / tokens, query strings and hashes removed) and cut to 500 characters; the
// route is the path only, with ids / link tokens replaced by `:id`; the user is the uid + role only.
// Throttle: the same fingerprint at most once per 10 minutes per browser session, at most 20 records per session.

export const CLIENT_ERRORS_COLLECTION = 'clientErrors';
export const ERROR_KINDS = Object.freeze(['error', 'rejection', 'render', 'permission', 'call', 'media']);
export const REPORTER_ROLES = Object.freeze(['admin', 'teacher', 'finance', 'parent', 'student', 'guest', 'none']);
export const LIMITS = Object.freeze({ message: 500, frame: 200, route: 200, build: 40, browser: 60, uid: 128 });
export const THROTTLE_MS = 10 * 60 * 1000;
export const MAX_PER_SESSION = 20;
const MAX_PENDING = 5;
const STORAGE_KEY = 'ks-client-errors';
// set on an error the Firestore wrapper already reported, so the unhandled-rejection listener skips it
export const REPORTED = Symbol.for('keelesepp.clientErrorReported');

// e-mails, URLs (query string / hash dropped), long numbers (phones, personal codes, IBANs, card numbers), ids / tokens
export function sanitizeText(value, max = LIMITS.message) {
  return String(value ?? '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[e-post]')
    .replace(/\b((?:https?|wss?|blob):\/\/[^\s?#"'<>)]*)[?#][^\s"'<>)]*/gi, '$1')
    .replace(/\b(?:bearer|token|key|secret|password|parool)\s*[:=]\s*\S+/gi, '[peidetud]')
    .replace(/\beyJ[\w-]{10,}(?:\.[\w-]+){0,2}/g, '[token]')
    .replace(/\b[A-Za-z0-9_-]*\d[A-Za-z0-9_-]*[A-Za-z][A-Za-z0-9_-]*\b|\b[A-Za-z0-9_-]*[A-Za-z][A-Za-z0-9_-]*\d[A-Za-z0-9_-]*\b/g, (word) => (word.length >= 20 ? '[id]' : word))
    .replace(/\+?\d[\d -]{5,}\d/g, (match) => (match.replace(/\D/g, '').length >= 6 ? '[nr]' : match))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// path segments after these words are ids or link tokens (guest lesson link, invoice payment, tax form, e-mail settings)
const ID_AFTER = new Set(['tund', 'maksa', 'maksuandmed', 'e-kirjad', 'students', 'teachers', 'board', 'vaatle', 'lessons', 'live']);

export function sanitizeRoute(pathname) {
  const path = String(pathname || '/').split(/[?#]/)[0] || '/';
  const parts = path.split('/');
  const masked = parts.map((part, index) => {
    if (!part) return part;
    if (ID_AFTER.has(parts[index - 1])) return ':id';
    if (/[@%]/.test(part)) return ':id';
    if (part.length >= 16 && /\d/.test(part) && /^[A-Za-z0-9_-]+$/.test(part) && !/^[a-z]+(-[a-z0-9]+)+$/.test(part)) return ':id';
    return part;
  });
  return masked.join('/').slice(0, LIMITS.route) || '/';
}

// „Chrome 130 · macOS”: browser family + major version + system; nothing else from the user agent
export function browserLabel(userAgent = '') {
  const ua = String(userAgent || '');
  const pick = (re) => ua.match(re)?.[1]?.split('.')[0];
  let name = 'Muu';
  let version = '';
  if (/Edg\//.test(ua)) { name = 'Edge'; version = pick(/Edg\/([\d.]+)/); }
  else if (/OPR\//.test(ua)) { name = 'Opera'; version = pick(/OPR\/([\d.]+)/); }
  else if (/SamsungBrowser\//.test(ua)) { name = 'Samsung'; version = pick(/SamsungBrowser\/([\d.]+)/); }
  else if (/Firefox\/|FxiOS\//.test(ua)) { name = 'Firefox'; version = pick(/(?:Firefox|FxiOS)\/([\d.]+)/); }
  else if (/CriOS\//.test(ua)) { name = 'Chrome'; version = pick(/CriOS\/([\d.]+)/); }
  else if (/Chrome\//.test(ua)) { name = 'Chrome'; version = pick(/Chrome\/([\d.]+)/); }
  else if (/Safari\//.test(ua)) { name = 'Safari'; version = pick(/Version\/([\d.]+)/); }
  if (/FBAN|FBAV|Instagram/.test(ua)) name = `${name} (app)`;
  let system = '';
  if (/iPhone|iPod/.test(ua)) system = 'iPhone';
  else if (/iPad/.test(ua)) system = 'iPad';
  else if (/Android/.test(ua)) system = 'Android';
  else if (/Windows/.test(ua)) system = 'Windows';
  else if (/Mac OS X|Macintosh/.test(ua)) system = 'macOS';
  else if (/CrOS/.test(ua)) system = 'ChromeOS';
  else if (/Linux/.test(ua)) system = 'Linux';
  return [version ? `${name} ${version}` : name, system].filter(Boolean).join(' · ').slice(0, LIMITS.browser);
}

// the first stack line that points at a file: „assets/index-abc.js:1:2345” (origin, query string and hash dropped)
export function topFrame(stack = '') {
  const lines = String(stack || '').split('\n');
  for (const line of lines) {
    const match = line.match(/((?:https?|blob|webpack|chrome-extension|moz-extension|safari-extension):\/\/[^\s)]+|\/[^\s)]+\.[cm]?jsx?[^\s)]*)/);
    if (!match) continue;
    const url = match[1].replace(/[?#][^:]*(?=:\d+:\d+$)|[?#].*$/, '');
    return url.replace(/^https?:\/\/[^/]+/, '').slice(0, LIMITS.frame);
  }
  return '';
}

// 64-bit FNV-1a as 16 hex characters (two 32-bit halves with different offsets), stable across browsers
export function fingerprintOf(kind, message, frame = '') {
  const text = `${kind}|${message}|${String(frame).replace(/:\d+$/, '')}`;
  let a = 0x811c9dc5;
  let b = 0x01000193 ^ 0x5bd1e995;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    a = Math.imul(a ^ code, 0x01000193) >>> 0;
    b = Math.imul(b ^ code, 0x01000193 ^ 0x9e3779b9) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

// `students/abc/notes/def` → `students/{id}/notes/{id}`: the collection, never which document
export function collectionPattern(path = '') {
  return String(path || '').split('/').filter(Boolean).map((part, index) => (index % 2 ? '{id}' : part)).join('/').slice(0, 160);
}

export function primaryRole(roles = []) {
  const list = Array.isArray(roles) ? roles : [];
  return ['admin', 'teacher', 'finance', 'parent', 'student'].find((role) => list.includes(role)) || 'none';
}

const NOISE = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i,
  /dynamically imported module|Importing a module script failed|error loading dynamically imported|ChunkLoadError|Unable to preload CSS/i, // handled by the stale-build reload
  /AbortError|The user aborted a request|signal is aborted/i,
];

export function isPermissionDenied(error) {
  const code = String(error?.code || '');
  return code === 'permission-denied' || code === 'firestore/permission-denied' || /Missing or insufficient permissions/i.test(String(error?.message || ''));
}

function errorText(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error || typeof error?.message === 'string') {
    const name = error.name && error.name !== 'Error' && error.name !== 'FirebaseError' ? `${error.name}: ` : '';
    return `${name}${error.message || ''}`;
  }
  // plain objects (`reject({...})`) may carry form data: only their type
  return `Mitte-Error väärtus (${typeof error})`;
}

function readState(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
    if (parsed && typeof parsed === 'object' && parsed.seen && typeof parsed.sent === 'number') return parsed;
  } catch { /* blocked or broken: start fresh */ }
  return { sent: 0, seen: {} };
}

export function createReporter({
  send = null,
  now = () => Date.now(),
  storage = (() => { try { return globalThis.sessionStorage; } catch { return null; } })(),
  location = globalThis.location,
  navigator = globalThis.navigator,
  build = '',
} = {}) {
  let sender = send;
  let identity = null;
  let guestUid = '';
  const memory = readState(storage);
  const pending = [];

  const save = () => { try { storage?.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch { /* memory only */ } };

  const deliver = (record) => {
    if (!sender) return;
    try {
      const result = sender(record);
      if (result?.catch) result.catch(() => {});
    } catch { /* a reporter never throws */ }
  };

  const withIdentity = (record) => {
    const role = identity.uid === guestUid ? 'guest' : identity.role;
    return { ...record, uid: String(identity.uid).slice(0, LIMITS.uid), role: REPORTER_ROLES.includes(role) ? role : 'none' };
  };

  const flush = () => {
    if (!identity?.uid || !sender) return;
    while (pending.length) deliver(withIdentity(pending.shift()));
  };

  // returns the record it sent (or queued), null when dropped / throttled
  function report(kind, error, { detail = '', stack } = {}) {
    try {
      const safeKind = ERROR_KINDS.includes(kind) ? kind : 'error';
      const raw = [errorText(error), detail].filter(Boolean).join(' · ');
      if (!raw || NOISE.some((re) => re.test(raw))) return null;
      const frame = topFrame(stack ?? error?.stack ?? '');
      if (/^(chrome|moz|safari)-extension:/.test(frame)) return null; // a browser extension's own error
      const message = sanitizeText(raw);
      if (!message) return null;
      const fingerprint = fingerprintOf(safeKind, message, frame);
      const at = now();
      const entry = memory.seen[fingerprint] || { firstAt: at, lastSentAt: 0, pending: 0 };
      entry.pending += 1;
      memory.seen[fingerprint] = entry;
      if (memory.sent >= MAX_PER_SESSION || (entry.lastSentAt && at - entry.lastSentAt < THROTTLE_MS)) { save(); return null; }
      const record = {
        message,
        kind: safeKind,
        route: sanitizeRoute(location?.pathname),
        build: String(build || '').slice(0, LIMITS.build),
        browser: browserLabel(navigator?.userAgent),
        frame,
        count: entry.pending,
        firstAt: entry.firstAt,
        lastAt: at,
        fingerprint,
      };
      entry.pending = 0;
      entry.lastSentAt = at;
      memory.sent += 1;
      save();
      if (identity?.uid && sender) {
        const full = withIdentity(record);
        deliver(full);
        return full;
      }
      if (pending.length < MAX_PENDING) pending.push(record);
      return record;
    } catch {
      return null;
    }
  }

  return {
    report,
    // `paths`: one document / collection path or a list (a batch); only the collection pattern is kept
    reportPermissionDenied(paths, operation = 'write') {
      const list = [...new Set((Array.isArray(paths) ? paths : [paths]).map((path) => collectionPattern(path)).filter(Boolean))].sort();
      const where = list.slice(0, 4).join(', ') || '?';
      return report('permission', `Missing or insufficient permissions (${operation} ${where})`, { stack: new Error().stack });
    },
    setIdentity(user) {
      identity = user?.uid ? { uid: user.uid, role: user.role || primaryRole(user.roles) } : null;
      flush();
    },
    setGuest(uid) {
      guestUid = uid || '';
      if (uid && (!identity || identity.uid !== uid)) identity = { uid, role: 'guest' };
      flush();
    },
    setSender(next) { sender = next; flush(); },
    get state() { return { sent: memory.sent, pending: pending.length }; },
  };
}

const MEDIA_ERRORS = /^(NotAllowedError|NotFoundError|NotReadableError|OverconstrainedError|SecurityError|AbortError|TypeError)$/;
// Live Classroom: a camera / microphone error (getUserMedia names) is `media`, anything else `call`
export function callErrorKind(error) {
  return MEDIA_ERRORS.test(String(error?.name || '')) && error?.name !== 'AbortError' ? 'media' : 'call';
}

// the app's one reporter (main.jsx gives it the Firestore sender and the window listeners)
export const clientErrors = createReporter({ build: typeof __APP_BUILD__ === 'string' ? __APP_BUILD__ : '' });

export function installClientErrorListeners(target = globalThis, reporter = clientErrors) {
  if (!target?.addEventListener) return () => {};
  const onError = (event) => {
    // a failed <img> / <script> load fires 'error' without an Error: not a code error
    if (!event?.error && !event?.message) return;
    reporter.report('error', event.error || event.message, { stack: event.error?.stack || (event.filename ? `at ${event.filename}:${event.lineno || 0}:${event.colno || 0}` : '') });
  };
  const onRejection = (event) => {
    const reason = event?.reason;
    if (reason?.[REPORTED]) return; // already reported with its collection by the Firestore wrapper
    reporter.report('rejection', reason);
  };
  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);
  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
  };
}
