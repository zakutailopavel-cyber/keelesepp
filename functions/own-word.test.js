"use strict";
// „Lisa oma sõna” (POST languageApi /own-word): request limits, spelling result, suggestions, quota, translation fallback.
// No network: fetch and Firestore are fakes.
const test = require("node:test");
const assert = require("node:assert/strict");
const rewire = require("rewire");
const core = require("./language-core");

process.env.FIREBASE_CONFIG = '{"projectId": "test-project"}';
process.env.GCLOUD_PROJECT = "test-project";
const index = rewire("./index.js");
const checkOwnWord = index.__get__("checkOwnWord");

test("request: a word or a short phrase, length and word count limited, language pair fixed", () => {
  assert.deepEqual(core.ownWordRequest({ text: "  raamatukogu, " }), { text: "raamatukogu", lang: "et", tgt: "ru", words: ["raamatukogu"] });
  assert.equal(core.ownWordRequest({ text: "library", lang: "en", tgt: "en" }).tgt, "et");
  assert.equal(core.ownWordRequest({ text: "kass", tgt: "xx" }).tgt, "ru");
  assert.throws(() => core.ownWordRequest({ text: "" }), (error) => error.status === 400);
  assert.throws(() => core.ownWordRequest({ text: "123 !!" }), (error) => error.status === 400);
  assert.throws(() => core.ownWordRequest({ text: "a".repeat(61) }), /Too long/);
  assert.throws(() => core.ownWordRequest({ text: "üks kaks kolm neli viis" }), /Too many words/);
  assert.throws(() => core.ownWordRequest({ text: "x".repeat(5000) }), /Too long/);
});

test("edit distance and suggestions: closest real words, no proper names for a lowercase word", () => {
  assert.equal(core.editDistance("raamtu", "raamatu"), 1);
  assert.equal(core.editDistance("kass", "kass"), 0);
  assert.equal(core.editDistance("ab", "ba"), 1);
  assert.deepEqual(core.rankSuggestions("raamatukoggu", ["raamatukoguhoidja", "Raamatukogu", "raamatukogu", "raamatukogud", "raamatukogu"]), ["raamatukogu", "raamatukogud"]);
  assert.deepEqual(core.rankSuggestions("kasd", ["kass", "kast", "Kask", "koer"]), ["kass", "kast"]);
  assert.deepEqual(core.rankSuggestions("tere", ["tere"]), []);
  assert.deepEqual(core.suggestionSearches("raamatukoggu"), ["raamat*", "*ukoggu"]);
  assert.deepEqual(core.suggestionSearches("ok"), []);
});

test("etLex words and the verdict for the whole entry", () => {
  const words = core.etlexWords({ evaluatedText: [
    { token: "ärkan", lemma: "ärkama", root: "ärkama", level: "A2", pos: "V" },
    { token: ".", lemma: ".", pos: "Z" },
    { token: "tervisekeskus", lemma: "tervise_keskus", root: "tervise_keskus", level: "B1", pos: "S" },
  ] });
  assert.deepEqual(words, [
    { token: "ärkan", lemma: "ärkama", level: "A2", compound: false },
    { token: "tervisekeskus", lemma: "tervisekeskus", level: "B1", compound: true },
  ]);
  assert.equal(core.etlexWords(null).length, 0);
  assert.equal(core.spellVerdict([{ known: true }, { known: true }]), "ok");
  assert.equal(core.spellVerdict([{ known: true }, { known: false, suggestions: ["kass"] }]), "suggest");
  assert.equal(core.spellVerdict([{ known: false, suggestions: [] }]), "unknown");
  assert.equal(core.spellVerdict([{ known: null }]), "unchecked");
  assert.equal(core.spellVerdict([]), "unchecked");
  assert.equal(core.correctedText("käisin raamatukoggus", [{ text: "raamatukoggus", known: false, suggestions: ["raamatukogus"] }]), "käisin raamatukogus");
  assert.equal(core.correctedText("tere", [{ text: "tere", known: true }]), "");
});

test("quota: per minute and per day, counters reset in a new window", () => {
  const now = new Date("2026-11-04T10:00:30Z");
  const first = core.nextQuota({}, now, { perMinute: 2, perDay: 3 });
  assert.equal(first.allowed, true);
  const second = core.nextQuota(first.next, now, { perMinute: 2, perDay: 3 });
  assert.equal(core.nextQuota(second.next, now, { perMinute: 2, perDay: 3 }).reason, "minute");
  const later = core.nextQuota(second.next, new Date("2026-11-04T10:01:10Z"), { perMinute: 2, perDay: 3 });
  assert.equal(later.allowed, true);
  assert.equal(core.nextQuota(later.next, new Date("2026-11-04T10:02:00Z"), { perMinute: 2, perDay: 3 }).reason, "day");
  assert.equal(core.nextQuota(later.next, new Date("2026-11-05T08:00:00Z"), { perMinute: 2, perDay: 3 }).allowed, true);
});

function fakeDb() {
  const store = new Map();
  const ref = (id) => ({ id, get: async () => ({ exists: store.has(id), data: () => store.get(id) }), set: async (value) => { store.set(id, value); } });
  return {
    store,
    collection: (name) => ({ doc: (id) => ref(`${name}/${id}`) }),
    runTransaction: async (fn) => fn({ get: (r) => r.get(), set: (r, value) => { store.set(r.id, value); } }),
  };
}

// fake EKI + TartuNLP: etLex knows „raamatukogu” forms, Ekilex has a few headwords
function fakeServices({ translationFails = false, headwords = ["raamatukogu", "raamatukogud", "kass", "ärkama"] } = {}) {
  const calls = [];
  const fetch = async (url, options = {}) => {
    calls.push(url);
    if (url.includes("etlex")) {
      const { text } = JSON.parse(options.body);
      return { ok: true, json: async () => ({ evaluatedText: text.split(" ").map((token) => ({ token, lemma: token === "raamatukogus" ? "raamatukogu" : token, root: token, level: token === "raamatukogus" ? "A2" : "", pos: "S" })) }) };
    }
    if (url.includes("word/search/")) {
      const pattern = decodeURIComponent(url.split("word/search/")[1].split("/")[0]);
      const re = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`, "i");
      return { ok: true, json: async () => ({ words: headwords.filter((word) => re.test(word)).map((wordValue, i) => ({ wordId: i + 1, wordValue, lang: "est" })) }) };
    }
    if (url.includes("paradigm")) return { ok: true, json: async () => ([]) };
    if (url.includes("translation")) {
      if (translationFails) return { ok: false, status: 503, json: async () => ({}) };
      const { text, tgt } = JSON.parse(options.body);
      return { ok: true, json: async () => ({ result: `${tgt}:${text}` }) };
    }
    throw new Error(`unexpected ${url}`);
  };
  return { fetch, calls };
}

const decoded = { uid: "student-1" };

test("a misspelled word: „Kas mõtlesid” suggestions from Ekilex, the typed word translated", async () => {
  const services = fakeServices();
  index.__set__("db", fakeDb());
  index.__set__("fetch", services.fetch);
  process.env.EKILEX_API_KEY = "0123456789abcdef0123456789abcdef";
  try {
    const result = await checkOwnWord({ decoded, body: { text: "raamatukoggu", tgt: "uk" } });
    assert.equal(result.status, "suggest");
    assert.deepEqual(result.words[0].suggestions, ["raamatukogu", "raamatukogud"]);
    assert.equal(result.suggestion, "raamatukogu");
    assert.equal(result.lemma, "");
    assert.equal(result.translation, "uk:raamatukoggu");
  } finally { index.__set__("fetch", global.fetch); delete process.env.EKILEX_API_KEY; }
});

test("an inflected correct word: known by its base form, the base form is translated", async () => {
  const services = fakeServices();
  index.__set__("db", fakeDb());
  index.__set__("fetch", services.fetch);
  process.env.EKILEX_API_KEY = "0123456789abcdef0123456789abcdef";
  try {
    const result = await checkOwnWord({ decoded, body: { text: "raamatukogus" } });
    assert.equal(result.status, "ok");
    assert.equal(result.lemma, "raamatukogu");
    assert.equal(result.translation, "ru:raamatukogu");
    assert.ok(result.sources.includes("TartuNLP Neurotõlge"));
  } finally { index.__set__("fetch", global.fetch); delete process.env.EKILEX_API_KEY; }
});

test("translation service down: the spelling answer still comes, translation empty (the student types it)", async () => {
  const services = fakeServices({ translationFails: true });
  index.__set__("db", fakeDb());
  index.__set__("fetch", services.fetch);
  process.env.EKILEX_API_KEY = "0123456789abcdef0123456789abcdef";
  try {
    const result = await checkOwnWord({ decoded, body: { text: "kass" } });
    assert.equal(result.status, "ok");
    assert.equal(result.translation, "");
  } finally { index.__set__("fetch", global.fetch); delete process.env.EKILEX_API_KEY; }
});

test("without the Ekilex key: no suggestions, unknown words stay unchecked; English is only translated", async () => {
  const services = fakeServices();
  index.__set__("db", fakeDb());
  index.__set__("fetch", services.fetch);
  try {
    const et = await checkOwnWord({ decoded, body: { text: "raamatukoggu" } });
    assert.equal(et.status, "unchecked");
    assert.equal(services.calls.some((url) => url.includes("ekilex")), false);
    const en = await checkOwnWord({ decoded, body: { text: "library", lang: "en" } });
    assert.equal(en.status, "unchecked");
    assert.equal(en.translation, "ru:library");
    assert.equal(services.calls.filter((url) => url.includes("etlex")).length, 1);
  } finally { index.__set__("fetch", global.fetch); }
});

test("the quota stops a user after the per-minute limit (429)", async () => {
  const services = fakeServices();
  const db = fakeDb();
  index.__set__("db", db);
  index.__set__("fetch", services.fetch);
  try {
    db.store.set("languageQuotas/student-1", { minute: new Date().toISOString().slice(0, 16), minuteCount: core.OWN_WORD_LIMITS.perMinute, day: new Date().toISOString().slice(0, 10), dayCount: 1 });
    await assert.rejects(checkOwnWord({ decoded, body: { text: "kass" } }), (error) => error.status === 429);
    await assert.rejects(checkOwnWord({ decoded: { uid: "student-2" }, body: { text: "" } }), (error) => error.status === 400);
    assert.equal(services.calls.length, 0);
  } finally { index.__set__("fetch", global.fetch); }
});
