"use strict";
// /forms and /word speed (owner 2026-11-10, „kaua”): headword candidates are looked up in Ekilex side by side with the
// old priority, a time limit per request and for the whole lookup, and cached „no forms” / short-lived failures.
// No network: fetch and Firestore are fakes with delays in milliseconds.
const test = require("node:test");
const assert = require("node:assert/strict");
const rewire = require("rewire");
const { firstInOrder, createLimiter, cacheEntryFresh } = require("./language-core");

process.env.FIREBASE_CONFIG = '{"projectId": "test-project"}';
process.env.GCLOUD_PROJECT = "test-project";
const index = rewire("./index.js");
const estonianWordForms = index.__get__("estonianWordForms");
const languageBudget = index.__get__("languageBudget");
const timing = index.__get__("FORMS_TIMING");
const PRODUCTION_TIMING = { ...timing };
const KEY = "0123456789abcdef0123456789abcdef";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timer); reject(Object.assign(new Error("aborted"), { name: "AbortError" })); });
  });
}
function fakeDb() {
  const store = new Map();
  return {
    store,
    collection: (name) => ({ doc: (id) => ({
      get: async () => ({ exists: store.has(`${name}/${id}`), data: () => store.get(`${name}/${id}`) }),
      set: async (value) => { store.set(`${name}/${id}`, value); },
    }) }),
  };
}

// Ekilex fake. `words`: candidate → { id, value } (a headword), `paradigms`: id → forms; `delay(url)` in ms;
// `fail(url)` → HTTP 500. Every request is logged with its start time.
function fakeEkilex({ words = {}, paradigms = {}, delay = () => 0, fail = () => false } = {}) {
  const calls = [];
  let active = 0;
  let maxActive = 0;
  const fetch = async (url, options = {}) => {
    calls.push({ url, at: Date.now() });
    active += 1;
    maxActive = Math.max(maxActive, active);
    try {
      await wait(delay(url), options.signal);
      if (fail(url)) return { ok: false, status: 500, json: async () => ({}) };
      const search = url.match(/word\/search\/([^/]+)\/eki/);
      if (search) {
        const word = words[decodeURIComponent(search[1])];
        return { ok: true, json: async () => ({ totalCount: word ? 1 : 0, words: word ? [{ wordId: word.id, wordValue: word.value, lang: "est" }] : [] }) };
      }
      const id = url.match(/paradigm\/details\/(\d+)/)[1];
      return { ok: true, json: async () => ([{ wordClass: "noomen", forms: (paradigms[id] || []).map(([morphCode, value]) => ({ morphCode, value })) }]) };
    } finally { active -= 1; }
  };
  return { fetch, calls, get maxActive() { return maxActive; } };
}

const KOOL = {
  words: { kool: { id: 7, value: "kool" }, kooli: { id: 8, value: "kooli" } },
  paradigms: {
    7: [["SgN", "kool"], ["SgG", "kooli"], ["SgP", "kooli"], ["SgIn", "koolis"], ["PlP", "koole"]],
    8: [["SgN", "kooli"], ["SgIn", "koolis"]], // a made-up headword „kooli” that also has the form (for the order test)
  },
};

async function withFakes(fake, run) {
  const db = fakeDb();
  index.__set__("db", db);
  index.__set__("fetch", fake.fetch);
  index.__set__("ekilexLimiter", null);
  process.env.EKILEX_API_KEY = KEY;
  const log = console.log;
  console.log = () => {};
  try { return await run(db); } finally {
    console.log = log;
    index.__set__("fetch", global.fetch);
    Object.assign(timing, PRODUCTION_TIMING);
    delete process.env.EKILEX_API_KEY;
  }
}

// ── pure helpers ──

test("production timing: ≤ 4 candidates at once, 4.5 s per request, 7 s per lookup, no-forms kept 30 days", () => {
  assert.deepEqual(PRODUCTION_TIMING, { concurrency: 4, requestMs: 4500, totalMs: 7000, ekilexSlots: 8, negativeDays: 30, failMinutes: 10 });
});

test("firstInOrder: the first item in order with a value wins even if a later one answers first", async () => {
  const result = await firstInOrder(["a", "b", "c"], async (item) => {
    if (item === "a") { await sleep(30); return "A"; }
    if (item === "b") { await sleep(1); return "B"; }
    return null;
  });
  assert.deepEqual(result, { index: 0, value: "A", failedBefore: 0, failed: false });
});

test("firstInOrder: answers as soon as the earlier items are misses, later items are not started", async () => {
  const started = [];
  const result = await firstInOrder([1, 2, 3, 4, 5, 6], async (n) => { started.push(n); await sleep(5); return n === 2 ? "two" : null; }, { concurrency: 2 });
  assert.equal(result.value, "two");
  assert.equal(result.index, 1);
  assert.ok(!started.includes(5) && !started.includes(6), `started ${started}`);
});

test("firstInOrder: never more than `concurrency` at once; all misses → index -1", async () => {
  let active = 0;
  let max = 0;
  const result = await firstInOrder([1, 2, 3, 4, 5, 6, 7, 8, 9], async () => { active += 1; max = Math.max(max, active); await sleep(3); active -= 1; return null; }, { concurrency: 4 });
  assert.equal(max, 4);
  assert.deepEqual(result, { index: -1, value: null, failedBefore: 0, failed: false });
});

test("firstInOrder: a failing earlier item is counted, a later value still wins; empty list → no value", async () => {
  const result = await firstInOrder(["x", "y"], async (item) => { if (item === "x") throw new Error("down"); return "Y"; });
  assert.deepEqual(result, { index: 1, value: "Y", failedBefore: 1, failed: true });
  assert.deepEqual(await firstInOrder([], async () => "never"), { index: -1, value: null, failedBefore: 0, failed: false });
});

test("createLimiter: at most `size` tasks at once across callers", async () => {
  const limit = createLimiter(3);
  let active = 0;
  let max = 0;
  await Promise.all(Array.from({ length: 10 }, () => limit(async () => { active += 1; max = Math.max(max, active); await sleep(2); active -= 1; })));
  assert.equal(max, 3);
});

test("cacheEntryFresh: entries without expiresAt never expire, others until expiresAt", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  assert.equal(cacheEntryFresh({ value: {} }, now), true);
  assert.equal(cacheEntryFresh({ expiresAt: "2026-11-11T00:00:00Z" }, now), true);
  assert.equal(cacheEntryFresh({ expiresAt: "2026-11-10T11:00:00Z" }, now), false);
  assert.equal(cacheEntryFresh(null, now), false);
});

// ── estonianWordForms ──

test("koolis: candidates searched side by side, the first in the old order whose paradigm has „koolis” wins", async () => {
  // koolis → [koolis, koolima, kooli, kool]: „kooli” (made-up headword with the form) comes before „kool” and is slow;
  // „kool” answers first but must not win
  const fake = fakeEkilex({ ...KOOL, delay: (url) => (url.includes("/kooli/") ? 40 : 5) });
  await withFakes(fake, async () => {
    const result = await estonianWordForms({ word: "koolis" });
    assert.equal(result.headword, "kooli");
    assert.equal(result.found, true);
    const searches = fake.calls.filter((c) => c.url.includes("word/search"));
    assert.equal(searches.length, 4);
    assert.ok(searches[3].at - searches[0].at < 5, "all four searches start together");
  });
});

test("koolis with the real order (only „kool” has the form): forms found, answer kept without expiry", async () => {
  const fake = fakeEkilex({ words: { kool: KOOL.words.kool }, paradigms: KOOL.paradigms, delay: () => 5 });
  await withFakes(fake, async (db) => {
    const result = await estonianWordForms({ word: "koolis" });
    assert.equal(result.headword, "kool");
    assert.equal(result.line.startsWith("kool, kooli, kooli"), true);
    const [entry] = [...db.store.values()];
    assert.equal(entry.expiresAt, undefined);
    const again = await estonianWordForms({ word: "Koolis" });
    assert.equal(again.cached, true);
  });
});

test("parallel vs one-by-one with 50 ms per Ekilex request (kaua → kaua, kau, ka; no forms)", async () => {
  const words = { kaua: { id: 1, value: "kaua" }, ka: { id: 2, value: "ka" } };
  const run = async (concurrency) => {
    const fake = fakeEkilex({ words, paradigms: { 1: [], 2: [["SgN", "ka"]] }, delay: () => 50 });
    return withFakes(fake, async () => {
      timing.concurrency = concurrency;
      const t0 = Date.now();
      const result = await estonianWordForms({ word: "kaua" });
      assert.equal(result.found, false);
      return { ms: Date.now() - t0, calls: fake.calls.length };
    });
  };
  const sequential = await run(1);
  const parallel = await run(4);
  // one-by-one: kaua (search + paradigm) + kau (search) + ka (search + paradigm) = 5 × 50 ms; side by side: 2 × 50 ms
  assert.ok(sequential.ms >= 240, `sequential ${sequential.ms} ms`);
  assert.ok(parallel.ms < 160, `parallel ${parallel.ms} ms`);
  assert.equal(sequential.calls, parallel.calls);
  console.log(`  kaua, 50 ms per request: one-by-one ${sequential.ms} ms, side by side ${parallel.ms} ms`);
});

test("no forms: answered, kept 30 days; the next click comes from the cache with no Ekilex call", async () => {
  const fake = fakeEkilex({ delay: () => 2 });
  await withFakes(fake, async (db) => {
    const result = await estonianWordForms({ word: "kaua" });
    assert.deepEqual(result, { word: "kaua", available: true, found: false, forms: [], line: "" });
    const [entry] = [...db.store.values()];
    const days = (new Date(entry.expiresAt) - new Date(entry.createdAt)) / 86400000;
    assert.equal(Math.round(days), 30);
    const calls = fake.calls.length;
    const again = await estonianWordForms({ word: "kaua" });
    assert.equal(again.cached, true);
    assert.equal(fake.calls.length, calls);
  });
});

test("an expired „no forms” entry is asked again; an old entry without expiresAt is still used", async () => {
  const fake = fakeEkilex({ delay: () => 1 });
  await withFakes(fake, async (db) => {
    await estonianWordForms({ word: "kaua" });
    const [id, entry] = [...db.store.entries()][0];
    db.store.set(id, { ...entry, expiresAt: "2020-01-01T00:00:00Z" });
    const calls = fake.calls.length;
    await estonianWordForms({ word: "kaua" });
    assert.ok(fake.calls.length > calls, "asked again");
    db.store.set(id, { value: { word: "kaua", available: true, found: false, forms: [], line: "" }, createdAt: "2026-10-01T00:00:00Z" });
    const n = fake.calls.length;
    assert.equal((await estonianWordForms({ word: "kaua" })).cached, true);
    assert.equal(fake.calls.length, n);
  });
});

test("a hanging Ekilex: each request stops at requestMs, the lookup ends with 504; repeated click fails at once", async () => {
  const fake = fakeEkilex({ delay: () => 10000 });
  await withFakes(fake, async (db) => {
    timing.requestMs = 60;
    timing.totalMs = 200;
    const t0 = Date.now();
    await assert.rejects(estonianWordForms({ word: "kaua" }), (error) => error.status === 504);
    assert.ok(Date.now() - t0 < 150, `took ${Date.now() - t0} ms`);
    const [entry] = [...db.store.values()];
    assert.equal(entry.failed, true);
    assert.equal(Math.round((new Date(entry.expiresAt) - new Date(entry.createdAt)) / 60000), 10);
    const calls = fake.calls.length;
    const t1 = Date.now();
    await assert.rejects(estonianWordForms({ word: "kaua" }), (error) => error.status === 504);
    assert.ok(Date.now() - t1 < 20);
    assert.equal(fake.calls.length, calls, "no Ekilex call within 10 minutes");
  });
});

test("the whole lookup stops at totalMs even when every single request is still within requestMs", async () => {
  // raamatukogus → 4 candidates, concurrency 1: each search 40 ms (< requestMs) but four in a row pass totalMs
  const fake = fakeEkilex({ delay: () => 40 });
  await withFakes(fake, async () => {
    Object.assign(timing, { concurrency: 1, requestMs: 1000, totalMs: 100 });
    const t0 = Date.now();
    await assert.rejects(estonianWordForms({ word: "raamatukogus" }), (error) => error.status === 504);
    assert.ok(Date.now() - t0 < 160, `took ${Date.now() - t0} ms`);
    assert.ok(fake.calls.length < 4);
  });
});

test("an earlier candidate fails, a later one has the form: answer shown, not kept; the caller's trace counts it", async () => {
  const fake = fakeEkilex({ words: { kool: KOOL.words.kool }, paradigms: KOOL.paradigms, fail: (url) => url.includes("/koolis/") });
  await withFakes(fake, async (db) => {
    const trace = { failed: 0 };
    const result = await languageBudget.run({ until: Date.now() + 5000, trace }, () => estonianWordForms({ word: "koolis" }));
    assert.equal(result.headword, "kool");
    assert.equal(db.store.size, 0, "not cached");
    assert.equal(trace.failed, 1);
  });
});

test("a caller's shorter budget wins and its timeout is not remembered as a failure", async () => {
  const fake = fakeEkilex({ delay: () => 10000 });
  await withFakes(fake, async (db) => {
    const t0 = Date.now();
    await assert.rejects(languageBudget.run({ until: Date.now() + 50, trace: { failed: 0 } }, () => estonianWordForms({ word: "kaua" })));
    assert.ok(Date.now() - t0 < 120);
    assert.equal(db.store.size, 0);
  });
});

test("Ekilex politeness: never more than 8 requests at once, also for several words together", async () => {
  const fake = fakeEkilex({ delay: () => 10 });
  await withFakes(fake, async () => {
    await Promise.all(["raamatukogus", "koolis", "kaua", "majades", "lauale"].map((word) => estonianWordForms({ word })));
    assert.ok(fake.maxActive <= 8, `max ${fake.maxActive}`);
  });
});

test("the lookup is decided: requests still running are cancelled, queued ones never go out", async () => {
  // kool answers fast with the form at candidate 0 („kool” itself); the other candidates are slow
  const fake = fakeEkilex({ words: { kool: KOOL.words.kool }, paradigms: KOOL.paradigms, delay: (url) => (url.includes("/kool/") || url.includes("paradigm") ? 2 : 300) });
  await withFakes(fake, async () => {
    const t0 = Date.now();
    const result = await estonianWordForms({ word: "kool" });
    assert.equal(result.headword, "kool");
    assert.ok(Date.now() - t0 < 100);
  });
});
