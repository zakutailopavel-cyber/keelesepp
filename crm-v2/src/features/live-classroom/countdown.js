// The teacher's countdown timer in a Live Classroom room (owner 2026-11-04). One map `countdown` on the invitation
// (1:1) or the group room doc: { running, remainingMs, durationMs, label, by, updatedAt }. `updatedAt` is the server
// time of the write (serverTimestamp) and `remainingMs` the time left at that moment, so every reader derives the time
// left from timestamps — nobody writes every second. The reader's clock may differ from the server's: `offset` (server
// minus local, ms) is estimated from fresh writes arriving live (see `offsetSample`).

export const COUNTDOWN_PRESETS = [1, 2, 3, 5, 10];
export const COUNTDOWN_MAX_MS = 2 * 60 * 60 * 1000;
// the last seconds are highlighted for everyone
export const COUNTDOWN_WARN_MS = 10 * 1000;

const clampMs = (value) => Math.max(0, Math.min(COUNTDOWN_MAX_MS, Math.round(Number(value) || 0)));

// a Firestore Timestamp, a Date, an ISO string or ms → ms (0 when unknown)
export function toMillis(value) {
  if (!value) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// the stored map → a plain value (null when there is no timer)
export function normalizeCountdown(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const updatedAt = toMillis(raw.updatedAt);
  if (!updatedAt) return null;
  return {
    running: raw.running === true,
    remainingMs: clampMs(raw.remainingMs),
    durationMs: clampMs(raw.durationMs),
    label: String(raw.label || '').slice(0, 80),
    by: String(raw.by || ''),
    updatedAt,
  };
}

// time left (ms) at the reader's local time `localNow`, with `offset` = server time − local time
export function countdownRemaining(countdown, localNow = Date.now(), offset = 0) {
  if (!countdown) return 0;
  if (!countdown.running) return countdown.remainingMs;
  const serverNow = localNow + offset;
  return Math.max(0, countdown.updatedAt + countdown.remainingMs - serverNow);
}

// a fresh write seen live: its server time minus the local time it arrived is one estimate of the offset (the
// network delay makes it a little too small, never by more than the delay). Old docs (opened later) are no sample.
export function offsetSample(serverMs, receivedLocalMs) {
  if (!serverMs || !receivedLocalMs) return null;
  return serverMs - receivedLocalMs;
}

// several samples: the largest one is the closest to the truth (every sample is short by its own network delay);
// samples older than the newest 5 are dropped, so a changed clock is followed
export function combineOffset(samples = []) {
  const recent = samples.filter((value) => Number.isFinite(value)).slice(-5);
  return recent.length ? Math.max(...recent) : 0;
}

// mm:ss (h:mm:ss over an hour), rounded up so 0:01 shows until the very end
export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// minutes + seconds typed by the teacher → ms (0 when not a valid time)
export function durationFrom(minutes, seconds = 0) {
  const ms = (Math.max(0, Math.floor(Number(minutes) || 0)) * 60 + Math.max(0, Math.floor(Number(seconds) || 0))) * 1000;
  return ms > 0 ? Math.min(COUNTDOWN_MAX_MS, ms) : 0;
}

// ── the teacher's actions: the value to write (without `updatedAt`, which the service sets to the server time) ──
export function startCountdown(durationMs, { label = '', by = '' } = {}) {
  const ms = clampMs(durationMs);
  return { running: true, remainingMs: ms, durationMs: ms, label: String(label || '').slice(0, 80), by };
}

export function pauseCountdown(countdown, localNow, offset, by) {
  if (!countdown) return null;
  return { ...base(countdown, by), running: false, remainingMs: Math.round(countdownRemaining(countdown, localNow, offset)) };
}

export function resumeCountdown(countdown, by) {
  if (!countdown) return null;
  return { ...base(countdown, by), running: true, remainingMs: countdown.remainingMs };
}

export function addMinute(countdown, localNow, offset, by) {
  if (!countdown) return null;
  const left = countdownRemaining(countdown, localNow, offset);
  return { ...base(countdown, by), running: countdown.running || left <= 0, remainingMs: clampMs(left + 60000), durationMs: clampMs(countdown.durationMs + 60000) };
}

function base(countdown, by) {
  return { running: countdown.running, remainingMs: countdown.remainingMs, durationMs: countdown.durationMs, label: countdown.label || '', by: by || countdown.by };
}
