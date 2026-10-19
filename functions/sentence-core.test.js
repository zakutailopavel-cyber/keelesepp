"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { analysisRequest, tokensFromEvaluation, findExpressions, glossLemmas, formOf } = require("./sentence-core");

// a real EKI etLex answer (trimmed) for „Ma saan kõigest eesti keeles aru, aga midagi öelda ei oska.”
const SAMPLE = {"evaluatedGrammarText": [{"token": "Ma", "lemma": "mina", "pos": "P", "form": "sg n", "formXinfo": "ainsuse nimetav", "level": "A1"}, {"token": "saan", "lemma": "saama", "pos": "V", "form": "n", "formXinfo": "kindel kõneviis jaatav isikuline olevik", "level": "A1"}, {"token": "kõigest", "lemma": "kõik", "pos": "P", "form": "sg el", "formXinfo": "ainsuse seestültev", "level": "A2"}, {"token": "eesti", "lemma": "eesti", "pos": "G", "form": "", "formXinfo": null, "level": "määramata"}, {"token": "keeles", "lemma": "keel", "pos": "S", "form": "sg in", "formXinfo": "ainsuse seesütlev", "level": "A1"}, {"token": "aru", "lemma": "aru", "pos": "S", "form": "sg p", "formXinfo": "ainsuse osastav", "level": "A1"}, {"token": ",", "lemma": ",", "pos": "Z", "form": "", "formXinfo": null, "level": "määramata"}, {"token": "aga", "lemma": "aga", "pos": "J", "form": "", "formXinfo": null, "level": "määramata"}, {"token": "midagi", "lemma": "miski", "pos": "P", "form": "sg p", "formXinfo": "ainsuse osastav", "level": "A2"}, {"token": "öelda", "lemma": "ütlema", "pos": "V", "form": "da", "formXinfo": "kindel kõneviis eitav isikuline olevik", "level": "A1"}, {"token": "ei", "lemma": "ei", "pos": "V", "form": "neg", "formXinfo": "kindel kõneviis eitav isikuline olevik", "level": "A1"}, {"token": "oska", "lemma": "oskama", "pos": "V", "form": "o", "formXinfo": "kindel kõneviis eitav isikuline olevik", "level": "A1"}, {"token": ".", "lemma": ".", "pos": "Z", "form": "", "formXinfo": null, "level": "määramata"}]};

test("a sentence is cleaned and limited; an empty or letterless text is refused", () => {
  assert.deepEqual(analysisRequest({ text: "  Ma  saan aru. " }), { text: "Ma saan aru." });
  assert.throws(() => analysisRequest({ text: " " }), /Text required/);
  assert.throws(() => analysisRequest({ text: "123 !" }), /Text required/);
  assert.equal(analysisRequest({ text: "a".repeat(900) }).text.length, 400);
});

test("every word gets its base form, part of speech and form in Estonian and Russian", () => {
  const tokens = tokensFromEvaluation(SAMPLE);
  const by = Object.fromEntries(tokens.map((t) => [t.text, t]));
  assert.equal(by.saan.lemma, "saama");
  assert.equal(by.saan.posRu, "глагол");
  assert.equal(by.saan.formRu, "наст. вр., 1 л. ед. ч. (ma)");
  assert.equal(by.kõigest.formEt, "ainsuse seestütlev");
  assert.match(by.kõigest.formRu, /о чём/);
  assert.equal(by.öelda.formRu, "da-инфинитив");
  assert.equal(by[","].punct, true);
  assert.equal(by.aru.space, false, "no space before the comma");
  assert.deepEqual(glossLemmas(tokens).slice(0, 3), ["mina", "saama", "kõik"]);
});

test("multi-word verbs are found with what they govern, wherever the particle stands", () => {
  const tokens = tokensFromEvaluation(SAMPLE);
  assert.deepEqual(findExpressions(tokens), [{ phrase: "aru saama", ru: "понимать", government: "elatiiv (kellest/millest)", tokens: [1, 5] }]);
  const t = (text, lemma, pos = "D") => ({ text, lemma, pos });
  assert.deepEqual(findExpressions([t("Ta", "tema", "P"), t("jättis", "jätma", "V"), t("suitsetamise", "suitsetamine", "S"), t("maha", "maha")]).map((e) => e.phrase), ["maha jätma"]);
  assert.deepEqual(findExpressions([t("Ta", "tema", "P"), t("jättis", "jätma", "V"), t("koera", "koer", "S")]), []);
});

test("verb forms without a tense of their own stay short", () => {
  assert.deepEqual(formOf("V", "nud", "kindel kõneviis jaatav isikuline täisminevik"), { et: "mineviku kesksõna (-nud)", ru: "причастие прош. вр. (-nud)" });
  assert.match(formOf("V", "ksin", "tingiv kõneviis jaatav isikuline olevik").ru, /условное/);
  assert.deepEqual(formOf("S", "pl kom", ""), { et: "mitmuse kaasaütlev", ru: "мн. ч., с кем/чем (kellega? millega?)" });
});
