"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { cacheKey, translationRequest, keyFormsFromParadigms, pickEkilexWord, formsLine, headwordCandidates, paradigmHasForm, isProperFor } = require("./language-core");

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

test('summarizes the EKI text evaluation against the sheet level', () => {
  const { summarizeEvaluation, evaluationRequest } = require('./language-core');
  const data = {
    evaluatedText: [
      { text: 'Kui', lemma: 'kui', pos: 'J', level: 'A1' }, { text: 'ostaksin', lemma: 'ostma', pos: 'V', level: 'A1' },
      { text: 'keskkonnasõbralik', lemma: 'keskkonnasõbralik', pos: 'A', level: 'B1' }, { text: '.', pos: 'Z', level: '' }, { text: 'Xyz', lemma: 'xyz', pos: 'S', level: '' },
    ],
    evaluatedGrammarText: [{ text: 'ostaksin', lemma: 'ostma', level: 'B1', formXinfo: 'tingiv kõneviis' }, { text: 'Kui', level: 'määramata' }],
    textStat: { LixIndex: 31 },
  };
  const s = summarizeEvaluation(data, 'A2');
  assert.equal(s.words, 4);
  assert.equal(s.unknownWords, 1);
  assert.deepEqual(s.aboveWords, [{ text: 'keskkonnasõbralik', lemma: 'keskkonnasõbralik', level: 'B1' }]);
  assert.deepEqual(s.aboveForms, [{ text: 'ostaksin', lemma: 'ostma', level: 'B1', form: 'tingiv kõneviis' }]);
  assert.equal(summarizeEvaluation(data, 'B1').aboveForms.length, 0);
  assert.throws(() => evaluationRequest({ text: ' ' }));
});

test("Ekilex paradigmForms and headwords for inflected forms", () => {
  const paradigms = [{ paradigmForms: [{ morphCode: "Sup", value: "ärkama" }, { morphCode: "Inf", value: "ärgata" }, { morphCode: "IndPrSg3", value: "ärkab" }, { morphCode: "IndPrSg1", value: "ärkan" }] }];
  assert.equal(formsLine(keyFormsFromParadigms(paradigms).forms), "ärkama, ärgata, ärkab");
  assert.ok(headwordCandidates("ärkan").includes("ärkama"));
  assert.ok(headwordCandidates("söön").includes("sööma"));
  assert.equal(headwordCandidates("Kass")[0], "kass");
  assert.equal(paradigmHasForm(paradigms, "Ärkan"), true);
  assert.equal(paradigmHasForm(paradigms, "magan"), false);
  assert.ok(headwordCandidates("kassi").includes("kass"));
  assert.ok(headwordCandidates("raamatut").includes("raamat"));
  assert.equal(isProperFor({ wordValue: "Kassi" }, "kassi"), true);
  assert.equal(isProperFor({ wordValue: "kass" }, "kassi"), false);
});
