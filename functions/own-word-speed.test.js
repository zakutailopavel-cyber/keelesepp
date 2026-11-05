"use strict";
// /own-word speed (production 2026-11-05: 9–13 s, 20 s timeouts in a live lesson): the whole-answer cache, parallel
// upstream calls with a time budget, partial answers, and no caching of failures. No network: fetch and Firestore are
// fakes; the budget is shortened so the tests run in milliseconds.
const test = require("node:test");
const assert = require("node:assert/strict");
const rewire = require("rewire");

process.env.FIREBASE_CONFIG = '{"projectId": "test-project"}';
process.env.GCLOUD_PROJECT = "test-project";
const index = rewire("./index.js");
const checkOwnWord = index.__get__("checkOwnWord");
const timing = index.__get__("OWN_WORD_TIMING");
const PRODUCTION_TIMING = { ...timing };
const KEY = "0123456789abcdef0123456789abcdef";

function fakeDb() {
  const store = new Map();
  const ref = (id) => ({ id, get: async () => ({ exists: store.has(id), data: () => store.get(id) }), set: async (value) => { store.set(id, value); } });
  return {
    store,
    collection: (name) => ({ doc: (id) => ref(`${name}/${id}`) }),
    runTransaction: async (fn) => fn({ get: (r) => r.get(), set: (r, value) => { store.set(r.id, value); } }),
  };
}
const ownWordEntries = (db) => [...db.store.entries()].filter(([id]) => id.startsWith("languageCache/ownword1_"));

// a fetch that waits `ms` (or until aborted) before answering
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timer); reject(Object.assign(new Error("aborted"), { name: "AbortError" })); });
  });
}

// EKI + TartuNLP fakes: „ärkan” → lemma „ärkama”; delays and failures per service
function fakeServices({ slow = {}, fail = {} } = {}) {
  const calls = [];
  const fetch = async (url, options = {}) => {
    const kind = url.includes("etlex") ? "etlex" : url.includes("translation") ? "translation" : "ekilex";
    calls.push({ kind, url, body: options.body ? JSON.parse(options.body) : null, at: Date.now() });
    if (slow[kind]) await wait(slow[kind], options.signal);
    if (fail[kind]) return { ok: false, status: 503, json: async () => ({}) };
    if (kind === "etlex") {
      const { text } = JSON.parse(options.body);
      return { ok: true, json: async () => ({ evaluatedText: text.split(" ").map((token) => ({ token, lemma: token === "ärkan" ? "ärkama" : token, root: token, level: "A2", pos: "V" })) }) };
    }
    if (url.includes("word/search/")) {
      const pattern = decodeURIComponent(url.split("word/search/")[1].split("/")[0]);
      return { ok: true, json: async () => ({ words: ["ärkama", "kass"].filter((word) => word === pattern).map((wordValue, i) => ({ wordId: i + 1, wordValue, lang: "est" })) }) };
    }
    if (url.includes("paradigm")) return { ok: true, json: async () => ([]) };
    const { text, tgt } = JSON.parse(options.body);
    return { ok: true, json: async () => ({ result: `${tgt}:${text}` }) };
  };
  return { fetch, calls };
}

function setup(services, { budget = true } = {}) {
  const db = fakeDb();
  index.__set__("db", db);
  index.__set__("fetch", services.fetch);
  process.env.EKILEX_API_KEY = KEY;
  if (budget) Object.assign(timing, { upstreamMs: 120, totalMs: 160, lemmaMinMs: 20 });
  return db;
}
function teardown() {
  index.__set__("fetch", global.fetch);
  delete process.env.EKILEX_API_KEY;
  Object.assign(timing, PRODUCTION_TIMING);
}

test("production budget: each upstream ≤ 4.5 s, the answer ≤ 5 s, kept 90 days", () => {
  assert.deepEqual(PRODUCTION_TIMING, { upstreamMs: 4500, totalMs: 5000, lemmaMinMs: 700, cacheDays: 90 });
});

test("cache miss → complete answer kept; the next check (any case) comes from the cache with no upstream call", async () => {
  const services = fakeServices();
  const db = setup(services);
  try {
    const first = await checkOwnWord({ decoded: { uid: "u1" }, body: { text: "ärkan", tgt: "ru" } });
    assert.equal(first.lemma, "ärkama");
    assert.equal(first.translation, "ru:ärkama");
    assert.equal(first.translationOf, "ärkama");
    assert.equal(first.partial, false);
    assert.deepEqual(first.missing, []);
    const [[, entry]] = ownWordEntries(db);
    assert.equal(entry.value.translation, "ru:ärkama");
    const days = (Date.parse(entry.expiresAt) - Date.parse(entry.createdAt)) / 86400000;
    assert.equal(Math.round(days), 90);

    const before = services.calls.length;
    const started = Date.now();
    const second = await checkOwnWord({ decoded: { uid: "u1" }, body: { text: "Ärkan", tgt: "ru" } });
    assert.ok(Date.now() - started < 300);
    assert.equal(services.calls.length, before);
    assert.equal(second.cached, true);
    assert.equal(second.text, "Ärkan");
    assert.equal(second.translation, "ru:ärkama");
    // another target language is another entry
    await checkOwnWord({ decoded: { uid: "u1" }, body: { text: "ärkan", tgt: "en" } });
    assert.ok(services.calls.length > before);
  } finally { teardown(); }
});

test("an expired cache entry is not used", async () => {
  const services = fakeServices();
  const db = setup(services);
  try {
    await checkOwnWord({ decoded: { uid: "u2" }, body: { text: "kass" } });
    const [[id, entry]] = ownWordEntries(db);
    db.store.set(id, { ...entry, value: { ...entry.value, translation: "old" }, expiresAt: new Date(Date.now() - 1000).toISOString() });
    const again = await checkOwnWord({ decoded: { uid: "u2" }, body: { text: "kass" } });
    assert.equal(again.cached, undefined);
    assert.equal(again.translation, "ru:kass");
  } finally { teardown(); }
});

test("spelling and translation run side by side: the translation is asked before etLex answers", async () => {
  const services = fakeServices({ slow: { etlex: 40 } });
  setup(services);
  try {
    await checkOwnWord({ decoded: { uid: "u3" }, body: { text: "kass" } });
    const firstTranslation = services.calls.find((call) => call.kind === "translation");
    const etlex = services.calls.find((call) => call.kind === "etlex");
    assert.ok(firstTranslation.at - etlex.at < 30, "the translation does not wait for the spelling chain");
  } finally { teardown(); }
});

test("both upstreams slow: the answer leaves at the budget, partial, both parts missing, nothing kept", async () => {
  const services = fakeServices({ slow: { etlex: 5000, translation: 5000 } });
  const db = setup(services);
  try {
    const started = Date.now();
    const result = await checkOwnWord({ decoded: { uid: "u4" }, body: { text: "ärkan" } });
    const took = Date.now() - started;
    assert.ok(took >= 100 && took < 400, `answered in ${took} ms`);
    assert.equal(result.partial, true);
    assert.ok(result.missing.includes("spelling"));
    assert.ok(result.missing.includes("translation"));
    assert.equal(result.translation, "");
    assert.equal(ownWordEntries(db).length, 0);
  } finally { teardown(); }
});

test("translation down, spelling fine: base form and forms come, translation missing, nothing kept", async () => {
  const services = fakeServices({ fail: { translation: true } });
  const db = setup(services);
  try {
    const result = await checkOwnWord({ decoded: { uid: "u5" }, body: { text: "ärkan" } });
    assert.equal(result.status, "ok");
    assert.equal(result.lemma, "ärkama");
    assert.equal(result.translation, "");
    assert.deepEqual(result.missing, ["translation"]);
    assert.equal(result.partial, true);
    assert.equal(ownWordEntries(db).length, 0);
  } finally { teardown(); }
});

test("spelling slow, translation fine: the typed word's translation comes at the budget, spelling missing, nothing kept", async () => {
  const services = fakeServices({ slow: { etlex: 5000 } });
  const db = setup(services);
  try {
    const result = await checkOwnWord({ decoded: { uid: "u6" }, body: { text: "ärkan" } });
    assert.equal(result.translation, "ru:ärkan");
    assert.equal(result.translationOf, "ärkan");
    assert.equal(result.status, "unchecked");
    assert.ok(result.missing.includes("spelling"));
    assert.equal(ownWordEntries(db).length, 0);
  } finally { teardown(); }
});

test("an Ekilex error inside the check: the answer comes, but it is not kept", async () => {
  const services = fakeServices({ fail: { ekilex: true } });
  const db = setup(services);
  try {
    const result = await checkOwnWord({ decoded: { uid: "u7" }, body: { text: "ärkan" } });
    assert.equal(result.translation, "ru:ärkama");
    assert.equal(ownWordEntries(db).length, 0);
  } finally { teardown(); }
});

test("an English word: translation only, kept when it succeeded", async () => {
  const services = fakeServices();
  const db = setup(services);
  try {
    const result = await checkOwnWord({ decoded: { uid: "u8" }, body: { text: "library", lang: "en", tgt: "ru" } });
    assert.equal(result.translation, "ru:library");
    assert.equal(result.partial, false);
    assert.equal(services.calls.some((call) => call.kind === "etlex"), false);
    assert.equal(ownWordEntries(db).length, 1);
  } finally { teardown(); }
});
