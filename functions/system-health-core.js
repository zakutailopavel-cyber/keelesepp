"use strict";
// „Süsteemi olek” (owner 2026-11-09: the admin learns about a breakage before the teachers do). Pure logic of the
// scheduled health check (`systemHealthTick`, every 10 min) and the morning error digest (`systemHealthDigest`,
// 07:00 Europe/Tallinn). Nothing here is e-mailed or sent to clients: the results live in `systemHealth/current` and
// `systemHealth/digest`, the CRM bell (admin only) derives its notices from those two documents.

const FAILS_TO_GO_DOWN = 2; // ok → down only after 2 failed checks in a row (one network hiccup is not an incident)
const HISTORY_LIMIT = 48; // 48 × 10 min = the last 8 hours of checks
const PROBE_TIMEOUT_MS = 15000;
const DAY_MS = 24 * 60 * 60 * 1000;

// What is checked. The CRM and the website are Vercel deployments (ARCHITECTURE.md: crm.epkoolitus.ee,
// www.epkoolitus.ee); `financeApi` and `staffOperationsApi` are the main HTTP functions (GET /health, no data read).
function healthTargets(projectId = "keelesepp-5136b", region = "us-central1") {
  const fn = (name) => `https://${region}-${projectId}.cloudfunctions.net/${name}/health`;
  return [
    { id: "crm", label: "CRM", url: "https://crm.epkoolitus.ee/login", expect: 'id="root"' },
    { id: "website", label: "Koduleht", url: "https://www.epkoolitus.ee/", expect: "</html>" },
    { id: "financeApi", label: "Finantsfunktsioon", url: fn("financeApi"), expect: "" },
    { id: "staffOperationsApi", label: "Töötajate funktsioon", url: fn("staffOperationsApi"), expect: "" },
  ];
}

// one probe's raw outcome ({ status, body } or { error }) → { ok, httpStatus, ms, error }
function classifyProbe(target, outcome = {}) {
  const ms = Number.isFinite(outcome.ms) ? Math.round(outcome.ms) : null;
  if (outcome.error) return { ok: false, httpStatus: 0, ms, error: String(outcome.error).slice(0, 200) };
  const status = Number(outcome.status) || 0;
  if (status < 200 || status >= 300) return { ok: false, httpStatus: status, ms, error: `HTTP ${status}` };
  if (target.expect && !String(outcome.body || "").includes(target.expect)) {
    return { ok: false, httpStatus: status, ms, error: "Leht vastas, aga sisu puudub" };
  }
  return { ok: true, httpStatus: status, ms, error: "" };
}

async function probeTarget(target, fetchImpl = globalThis.fetch, timeoutMs = PROBE_TIMEOUT_MS) {
  const started = Date.now();
  try {
    const response = await fetchImpl(target.url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "KeeleSepp-health/1", "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = target.expect ? await response.text() : "";
    return classifyProbe(target, { status: response.status, body, ms: Date.now() - started });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return classifyProbe(target, { error: timedOut ? `Ei vastanud ${Math.round(timeoutMs / 1000)} s jooksul` : (error?.message || "Ühendus ebaõnnestus"), ms: Date.now() - started });
  }
}

const incidentIdFor = (iso) => `inc_${String(iso).replace(/[^0-9]/g, "").slice(0, 14)}`;

/**
 * The previous `systemHealth/current` + this round's results → the next document and at most one event.
 * - a target is failing after FAILS_TO_GO_DOWN failed checks in a row;
 * - ok → down when any target is failing: event `down`, a new incident (one notice per incident);
 * - down → ok when every target answered: event `recovered`, the incident is closed and kept as `lastIncident`;
 * - while down, newly failing targets join the open incident (no second notice).
 */
function nextHealthState(previous, results, nowIso, labels = {}) {
  const prev = previous || {};
  const prevTargets = prev.targets || {};
  const targets = {};
  for (const [id, result] of Object.entries(results)) {
    const before = prevTargets[id] || {};
    const failStreak = result.ok ? 0 : (Number(before.failStreak) || 0) + 1;
    targets[id] = {
      label: labels[id] || before.label || id,
      ok: result.ok,
      httpStatus: result.httpStatus ?? 0,
      ms: result.ms ?? null,
      error: result.error || "",
      failStreak,
      lastOkAt: result.ok ? nowIso : (before.lastOkAt || ""),
    };
  }
  const failing = Object.keys(targets).filter((id) => targets[id].failStreak >= FAILS_TO_GO_DOWN);
  const wasDown = prev.status === "down" && prev.incident && !prev.incident.resolvedAt;
  const allOk = Object.values(targets).every((target) => target.ok);
  const failingLabels = (ids) => ids.map((id) => targets[id]?.label || id);

  let status = wasDown ? "down" : "ok";
  let incident = wasDown ? { ...prev.incident } : null;
  let lastIncident = prev.lastIncident || null;
  let event = null;

  if (!wasDown && failing.length) {
    status = "down";
    incident = { id: incidentIdFor(nowIso), startedAt: nowIso, failing, failingLabels: failingLabels(failing), resolvedAt: "" };
    event = { type: "down", incidentId: incident.id, failing };
  } else if (wasDown && allOk) {
    status = "ok";
    lastIncident = { ...incident, resolvedAt: nowIso };
    incident = null;
    event = { type: "recovered", incidentId: lastIncident.id };
  } else if (wasDown && failing.some((id) => !incident.failing.includes(id))) {
    const ids = [...new Set([...incident.failing, ...failing])];
    incident = { ...incident, failing: ids, failingLabels: failingLabels(ids) };
  }

  const history = [{ at: nowIso, ok: allOk, failing: Object.keys(targets).filter((id) => !targets[id].ok) }, ...(prev.history || [])].slice(0, HISTORY_LIMIT);
  return {
    state: { status, checkedAt: nowIso, targets, incident, lastIncident, history },
    event,
  };
}

// ── morning digest ─────────────────────────────────────────

// `clientErrors` records of the last 24 h (one per browser report, `count` = repeats in it) → total records,
// total repeats and the top 5 by message + route
function digestClientErrors(records = [], limit = 5) {
  const groups = new Map();
  let occurrences = 0;
  for (const record of records) {
    const count = Math.max(1, Number(record.count) || 1);
    occurrences += count;
    const message = String(record.message || "").slice(0, 160) || "(teadmata viga)";
    const route = String(record.route || "") || "—";
    const key = `${message}\u0000${route}`;
    const group = groups.get(key) || { message, route, records: 0, count: 0, users: new Set() };
    group.records += 1;
    group.count += count;
    if (record.uid) group.users.add(record.uid);
    groups.set(key, group);
  }
  const top = [...groups.values()]
    .sort((a, b) => b.count - a.count || b.records - a.records || a.message.localeCompare(b.message))
    .slice(0, limit)
    .map((group) => ({ message: group.message, route: group.route, records: group.records, count: group.count, users: group.users.size }));
  return { total: records.length, occurrences, groups: groups.size, top };
}

function digestWindow(now = new Date()) {
  return { since: new Date(now.getTime() - DAY_MS), until: now };
}

module.exports = {
  FAILS_TO_GO_DOWN,
  HISTORY_LIMIT,
  healthTargets,
  classifyProbe,
  probeTarget,
  nextHealthState,
  digestClientErrors,
  digestWindow,
};
