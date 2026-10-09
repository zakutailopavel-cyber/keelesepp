"use strict";
// languageApi helpers with a fake Firestore cache and a fake fetch (no network in tests).
const test = require("node:test");
const assert = require("node:assert/strict");
const rewire = require("rewire");

process.env.FIREBASE_CONFIG = '{"projectId": "test-project"}';
process.env.GCLOUD_PROJECT = "test-project";
const index = rewire("./index.js");
const translateText = index.__get__("translateText");
const estonianWordForms = index.__get__("estonianWordForms");

function fakeDb() {
  const store = new Map();
  return {
    store,
    collection: () => ({ doc: (id) => ({
      get: async () => ({ exists: store.has(id), data: () => store.get(id) }),
      set: async (value) => { store.set(id, value); },
    }) }),
  };
}

test("translation goes to TartuNLP once, then comes from the cache", async () => {
  const db = fakeDb();
  index.__set__("db", db);
  const calls = [];
  index.__set__("fetch", async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return { ok: true, json: async () => ({ result: "кошка" }) }; });
  try {
    const first = await translateText({ text: "Kass", src: "et", tgt: "ru" });
    assert.equal(first.result, "кошка");
    assert.equal(calls[0].url, "https://api.tartunlp.ai/translation/v2");
    assert.deepEqual(calls[0].body, { text: "Kass", src: "et", tgt: "ru", domain: "auto", application: "keelesepp-crm" });
    const second = await translateText({ text: "kass", src: "et", tgt: "ru" });
    assert.equal(second.cached, true);
    assert.equal(calls.length, 1);
  } finally { index.__set__("fetch", global.fetch); }
});

test("word forms need the Ekilex key; with it: search → paradigm → key forms", async () => {
  index.__set__("db", fakeDb());
  const urls = [];
  index.__set__("fetch", async (url, options) => {
    urls.push({ url, key: options.headers["ekilex-api-key"] });
    if (url.includes("word/search")) return { ok: true, json: async () => ({ totalCount: 1, words: [{ wordId: 42, wordValue: "kass", lang: "est" }] }) };
    return { ok: true, json: async () => ([{ wordClass: "noomen", inflectionTypeNr: "22", forms: [{ morphCode: "SgN", value: "kass" }, { morphCode: "SgG", value: "kassi" }, { morphCode: "SgP", value: "kassi" }, { morphCode: "PlP", value: "kasse" }] }]) };
  });
  try {
    delete process.env.EKILEX_API_KEY;
    assert.deepEqual(await estonianWordForms({ word: "kass" }), { word: "kass", available: false, forms: [], line: "" });
    assert.equal(urls.length, 0, "no call without a key");
    process.env.EKILEX_API_KEY = "0123456789abcdef0123456789abcdef";
    const result = await estonianWordForms({ word: "kass" });
    assert.equal(result.line, "kass, kassi, kassi, kasse");
    assert.equal(urls[0].url, "https://ekilex.ee/api/word/search/kass/eki");
    assert.equal(urls[1].url, "https://ekilex.ee/api/paradigm/details/42");
    assert.equal(urls[0].key, "0123456789abcdef0123456789abcdef");
    await assert.rejects(estonianWordForms({ word: "kaks sõna" }), /One Estonian word/);
  } finally { index.__set__("fetch", global.fetch); delete process.env.EKILEX_API_KEY; }
});

test("a failing service gives a clean 502", async () => {
  index.__set__("db", fakeDb());
  index.__set__("fetch", async () => ({ ok: false, status: 503, json: async () => ({}) }));
  try {
    await assert.rejects(translateText({ text: "tere", src: "et", tgt: "ru" }), (error) => error.status === 502);
  } finally { index.__set__("fetch", global.fetch); }
});

test("speech goes to TartuNLP Neurokõne and comes back as WAV; a non-audio answer is an error", async () => {
  const synthesizeSpeech = index.__get__("synthesizeSpeech");
  const calls = [];
  const wav = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(60)]);
  index.__set__("fetch", async (url, options) => { calls.push({ url, body: JSON.parse(options.body), headers: options.headers }); return { ok: true, arrayBuffer: async () => wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.length) }; });
  try {
    const audio = await synthesizeSpeech({ text: "Tere!", speaker: "vesta", speed: 0.8 });
    assert.equal(audio.toString("ascii", 0, 4), "RIFF");
    assert.equal(calls[0].url, "https://api.tartunlp.ai/text-to-speech/v2");
    assert.deepEqual(calls[0].body, { text: "Tere!", speaker: "vesta", speed: 0.8 });
    assert.equal(calls[0].headers["x-api-key"], "public");
    index.__set__("fetch", async () => ({ ok: true, arrayBuffer: async () => new TextEncoder().encode("{\"error\":1}").buffer }));
    await assert.rejects(synthesizeSpeech({ text: "Tere!" }), (error) => error.status === 502);
    index.__set__("fetch", async () => ({ ok: false, status: 503 }));
    await assert.rejects(synthesizeSpeech({ text: "Tere!" }), (error) => error.status === 502);
  } finally { index.__set__("fetch", global.fetch); }
});
