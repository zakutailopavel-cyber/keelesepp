// Lesson tokens (syncLessonTokens): a failed package sync must not disappear (audit 2026-11-28). Before, the trigger
// caught the error and only logged it: the lesson stayed marked, the credit was not taken and nobody saw it.
// Now: a temporary error (contention, unavailable, timeout) is tried again in the same run — the sync is idempotent by
// requestId, so a repeat cannot take a credit twice — and a sync that still fails leaves one record in „Vead”
// (`clientErrors`, the admin's page and the 07:00 digest in the bell). Pure helpers; index.js does the reads and writes.

const crypto = require("crypto");

const RETRY_DELAYS_MS = [400, 1500];
// gRPC codes of the Firestore client: ABORTED 10, UNAVAILABLE 14, DEADLINE_EXCEEDED 4, INTERNAL 13, RESOURCE_EXHAUSTED 8
const RETRYABLE_CODES = new Set([4, 8, 10, 13, 14, "aborted", "unavailable", "deadline-exceeded", "internal", "resource-exhausted"]);

// An httpError with a 4xx status is a decision of the ledger (closed period, another teacher, not found): trying again
// gives the same answer. Everything else that looks like the network or the database being busy is worth a repeat.
function tokenSyncErrorRetryable(error) {
  const status = Number(error?.status) || 0;
  if (status >= 400 && status < 500) return false;
  if (status >= 500) return true;
  return RETRYABLE_CODES.has(error?.code);
}

async function runTokenSyncWithRetry(run, { delays = RETRY_DELAYS_MS, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run(attempt);
    } catch (error) {
      if (attempt >= delays.length || !tokenSyncErrorRetryable(error)) throw error;
      await sleep(delays[attempt]);
    }
  }
}

// One „Vead” record per lesson (the same lesson failing again raises `count` instead of adding a row). Same fields as
// a browser report (firestore.rules validClientError), so the page and the digest read it as is. No names: the lesson
// id only. `firstAt` / `lastAt` / `count` are set by the caller (server time, increment).
function tokenSyncFailureRecord({ lessonId, error }) {
  const id = String(lessonId || "").trim();
  const reason = String(error?.message || error || "").replace(/\s+/g, " ").trim().slice(0, 300) || "teadmata viga";
  return {
    id: `lesson-tokens-${id}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 120),
    data: {
      message: `Tunni krediit jäi paketist maha arvamata või tagastamata: ${reason}`.slice(0, 500),
      kind: "call",
      route: "/server/syncLessonTokens",
      build: "server",
      role: "none",
      uid: "",
      browser: "Cloud Function",
      frame: `lessons/${id}`.slice(0, 200),
      // one group in „Vead” for all token-sync failures with the same reason
      fingerprint: crypto.createHash("sha256").update(`syncLessonTokens\u0000${reason}`).digest("hex").slice(0, 16),
      status: "new",
    },
  };
}

module.exports = {
  RETRY_DELAYS_MS,
  tokenSyncErrorRetryable,
  runTokenSyncWithRetry,
  tokenSyncFailureRecord,
};
