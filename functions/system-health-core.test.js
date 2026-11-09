"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  FAILS_TO_GO_DOWN, HISTORY_LIMIT, healthTargets, classifyProbe, probeTarget, nextHealthState, digestClientErrors, digestWindow,
} = require("./system-health-core");

const OK = { ok: true, httpStatus: 200, ms: 120, error: "" };
const BAD = { ok: false, httpStatus: 502, ms: 80, error: "HTTP 502" };
const at = (minute) => new Date(Date.UTC(2026, 10, 9, 10, minute)).toISOString();
const run = (prev, results, minute) => nextHealthState(prev, results, at(minute), { crm: "CRM", website: "Koduleht" });

test("targets: CRM, website and two function health paths of the project", () => {
  const targets = healthTargets("demo-project");
  assert.deepEqual(targets.map((t) => t.id), ["crm", "website", "financeApi", "staffOperationsApi"]);
  assert.equal(targets[2].url, "https://us-central1-demo-project.cloudfunctions.net/financeApi/health");
  assert.match(targets[0].url, /^https:\/\/crm\.epkoolitus\.ee\//);
});

test("classifyProbe: 2xx with the expected text is ok; errors, non-2xx and empty pages are not", () => {
  const target = { expect: 'id="root"' };
  assert.equal(classifyProbe(target, { status: 200, body: '<div id="root"></div>', ms: 10 }).ok, true);
  assert.equal(classifyProbe(target, { status: 200, body: "<html></html>" }).ok, false);
  assert.deepEqual(classifyProbe(target, { status: 503 }), { ok: false, httpStatus: 503, ms: null, error: "HTTP 503" });
  assert.equal(classifyProbe({ expect: "" }, { status: 200 }).ok, true);
  assert.equal(classifyProbe(target, { error: "ECONNREFUSED" }).httpStatus, 0);
});

test("probeTarget: uses fetch, turns a throw into a failure", async () => {
  const good = await probeTarget({ url: "https://x", expect: "ok" }, async () => ({ status: 200, text: async () => "ok" }));
  assert.equal(good.ok, true);
  const bad = await probeTarget({ url: "https://x", expect: "" }, async () => { throw new Error("getaddrinfo ENOTFOUND"); });
  assert.equal(bad.ok, false);
  assert.match(bad.error, /ENOTFOUND/);
});

test("one failure is not an incident; the second in a row opens exactly one", () => {
  assert.equal(FAILS_TO_GO_DOWN, 2);
  const first = run(null, { crm: OK, website: OK }, 0);
  assert.equal(first.state.status, "ok");
  assert.equal(first.event, null);
  const blip = run(first.state, { crm: BAD, website: OK }, 10);
  assert.equal(blip.state.status, "ok");
  assert.equal(blip.event, null);
  assert.equal(blip.state.targets.crm.failStreak, 1);
  assert.equal(blip.state.targets.crm.lastOkAt, at(0));
  const down = run(blip.state, { crm: BAD, website: OK }, 20);
  assert.equal(down.state.status, "down");
  assert.deepEqual(down.event, { type: "down", incidentId: down.state.incident.id, failing: ["crm"] });
  assert.deepEqual(down.state.incident.failingLabels, ["CRM"]);
  assert.equal(down.state.incident.startedAt, at(20));
  // still down: no second notice; a target that starts failing later joins the same incident
  const still = run(down.state, { crm: BAD, website: BAD }, 30);
  assert.equal(still.event, null);
  const joined = run(still.state, { crm: BAD, website: BAD }, 40);
  assert.equal(joined.event, null);
  assert.equal(joined.state.incident.id, down.state.incident.id);
  assert.deepEqual(joined.state.incident.failing, ["crm", "website"]);
});

test("a blip that recovers resets the streak", () => {
  const a = run(null, { crm: BAD }, 0);
  const b = run(a.state, { crm: OK }, 10);
  const c = run(b.state, { crm: BAD }, 20);
  assert.equal(c.state.status, "ok");
  assert.equal(c.event, null);
});

test("down → ok only when every target answers; the incident is kept as lastIncident", () => {
  let s = run(null, { crm: BAD, website: BAD }, 0).state;
  s = run(s, { crm: BAD, website: BAD }, 10).state;
  assert.equal(s.status, "down");
  const partly = run(s, { crm: OK, website: BAD }, 20);
  assert.equal(partly.state.status, "down");
  assert.equal(partly.event, null);
  const back = run(partly.state, { crm: OK, website: OK }, 30);
  assert.equal(back.state.status, "ok");
  assert.deepEqual(back.event, { type: "recovered", incidentId: s.incident.id });
  assert.equal(back.state.incident, null);
  assert.equal(back.state.lastIncident.resolvedAt, at(30));
  assert.equal(back.state.lastIncident.startedAt, at(10));
  // the next breakage is a new incident with a new id
  let again = run(back.state, { crm: BAD, website: OK }, 50).state;
  const second = run(again, { crm: BAD, website: OK }, 59);
  assert.equal(second.event.type, "down");
  assert.notEqual(second.state.incident.id, s.incident.id);
  assert.equal(second.state.lastIncident.id, s.incident.id);
});

test("history is newest first and capped", () => {
  let s = null;
  for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) s = nextHealthState(s, { crm: i % 2 ? BAD : OK }, new Date(Date.UTC(2026, 10, 9, 0, i)).toISOString()).state;
  assert.equal(s.history.length, HISTORY_LIMIT);
  assert.equal(s.history[0].at, s.checkedAt);
  assert.equal(s.history[0].ok, true);
  assert.deepEqual(s.history[1].failing, ["crm"]);
});

test("digest: totals, top 5 by message + route, repeats counted", () => {
  const rec = (message, route, count = 1, uid = "u1") => ({ message, route, count, uid });
  const records = [
    rec("TypeError: a", "/calendar", 5, "u1"), rec("TypeError: a", "/calendar", 2, "u2"), rec("TypeError: a", "/students"),
    rec("b", "/x"), rec("c", "/x"), rec("d", "/x"), rec("e", "/x", 3), rec("f", "/x"), rec("", ""),
  ];
  const digest = digestClientErrors(records);
  assert.equal(digest.total, 9);
  assert.equal(digest.occurrences, 16);
  assert.equal(digest.groups, 8);
  assert.equal(digest.top.length, 5);
  assert.deepEqual(digest.top[0], { message: "TypeError: a", route: "/calendar", records: 2, count: 7, users: 2 });
  assert.equal(digest.top[1].message, "e");
  assert.deepEqual(digestClientErrors([]), { total: 0, occurrences: 0, groups: 0, top: [] });
  assert.equal(digestClientErrors([rec("", "")]).top[0].message, "(teadmata viga)");
});

test("digest window is the last 24 h", () => {
  const now = new Date("2026-11-09T05:00:00Z");
  assert.equal(digestWindow(now).since.toISOString(), "2026-11-08T05:00:00.000Z");
});
