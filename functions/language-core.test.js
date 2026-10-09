"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { cacheKey, translationRequest, keyFormsFromParadigms, pickEkilexWord, formsLine } = require("./language-core");

test("translation request: clean text, supported pairs only", () => {
  assert.deepEqual(translationRequest({ text: "  kass  magab ", src: "et", tgt: "ru" }), { text: "kass magab", src: "et", tgt: "ru", domain: "auto", application: "keelesepp-crm" });
  assert.throws(() => translationRequest({ text: "", src: "et", tgt: "ru" }), /Text required/);
  assert.throws(() => translationRequest({ text: "x", src: "et", tgt: "et" }), /Unsupported/);
  assert.throws(() => translationRequest({ text: "x", src: "et", tgt: "zz" }), /Unsupported/);
  assert.equal(cacheKey("tr", "et", "ru", "kass"), cacheKey("tr", "et", "ru", "kass"));
  assert.notEqual(cacheKey("tr", "et", "ru", "kass"), cacheKey("tr", "et", "en", "kass"));
});

test("key forms from an Ekilex paradigm: noun and verb", () => {
  const noun = [{ wordClass: "noomen", inflectionTypeNr: "22", forms: [
    { morphCode: "SgN", value: "kass" }, { morphCode: "SgG", value: "kassi" }, { morphCode: "SgP", value: "kassi" },
    { morphCode: "PlN", value: "kassid" }, { morphCode: "PlP", value: "kasse" }, { morphCode: "SgAdt", value: "-" },
  ] }];
  const n = keyFormsFromParadigms(noun);
  assert.equal(formsLine(n.forms), "kass, kassi, kassi, kasse");
  assert.equal(n.forms[1].label, "ainsuse omastav");
  const verb = [{ wordClass: "verb", forms: [{ morphCode: "Sup", value: "lugema" }, { morphCode: "Inf", value: "lugeda" }, { morphCode: "IndPrSg3", value: "loeb" }] }];
  assert.equal(formsLine(keyFormsFromParadigms(verb).forms), "lugema, lugeda, loeb");
  assert.deepEqual(keyFormsFromParadigms([]).forms, []);
  assert.deepEqual(keyFormsFromParadigms([{ forms: [{ morphCode: "Xyz", value: "a" }] }]).forms, []);
});

test("picks the Estonian headword among search hits", () => {
  const words = [{ wordId: 1, wordValue: "Kass", lang: "est" }, { wordId: 2, wordValue: "kass", lang: "est" }, { wordId: 3, wordValue: "kass", lang: "rus" }];
  assert.equal(pickEkilexWord(words, "kass").wordId, 1);
  assert.equal(pickEkilexWord([{ wordId: 9, wordValue: "kassike", lang: "est" }], "kass").wordId, 9);
  assert.equal(pickEkilexWord([], "kass"), null);
});

test("speech request: known voice, speed clamped, text required and limited", () => {
  const { speechRequest, MAX_SPEECH } = require("./language-core");
  assert.deepEqual(speechRequest({ text: "  Tere,   Mari! ", speaker: "Albert", speed: 0.8 }), { text: "Tere, Mari!", speaker: "albert", speed: 0.8 });
  assert.equal(speechRequest({ text: "Tere", speed: 9 }).speed, 2);
  assert.equal(speechRequest({ text: "Tere", speed: "x" }).speed, 1);
  assert.equal(speechRequest({ text: "Tere" }).speaker, "mari");
  assert.throws(() => speechRequest({ text: "", speaker: "mari" }), (e) => e.status === 400);
  assert.throws(() => speechRequest({ text: "Tere", speaker: "siri" }), (e) => e.status === 400);
  assert.throws(() => speechRequest({ text: "a".repeat(MAX_SPEECH + 1) }), (e) => e.status === 400);
});
