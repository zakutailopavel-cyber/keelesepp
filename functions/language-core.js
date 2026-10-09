"use strict";

// Translation (TartuNLP / Neurotõlge public API) and Estonian word forms (EKI Ekilex API) for the teacher's
// word tools. Pure helpers; the HTTP calls and the Firestore cache live in index.js (languageApi).
const crypto = require("crypto");

const LANGS = ["et", "ru", "en", "uk", "de", "fi"];
const MAX_TEXT = 500;

function cleanTerm(value, max = MAX_TEXT) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cacheKey(kind, ...parts) {
  return `${kind}_${crypto.createHash("sha256").update(parts.map(part => String(part ?? "")).join("\u0001")).digest("hex").slice(0, 40)}`;
}

function translationRequest({ text, src = "et", tgt = "ru" } = {}) {
  const clean = cleanTerm(text);
  if (!clean) throw Object.assign(new Error("Text required"), { status: 400 });
  if (!LANGS.includes(src) || !LANGS.includes(tgt) || src === tgt) throw Object.assign(new Error("Unsupported language pair"), { status: 400 });
  return { text: clean, src, tgt, domain: "auto", application: "keelesepp-crm" };
}

// The forms a learner needs, in the order teachers say them: nouns/adjectives the three principal forms (+ plural
// partitive), verbs ma-, da- and present 3rd person.
const KEY_FORMS = [
  { code: "SgN", label: "ainsuse nimetav", ru: "им. п. ед. ч." },
  { code: "SgG", label: "ainsuse omastav", ru: "род. п. ед. ч." },
  { code: "SgP", label: "ainsuse osastav", ru: "частит. п. ед. ч." },
  { code: "PlP", label: "mitmuse osastav", ru: "частит. п. мн. ч." },
  { code: "Sup", label: "ma-tegevusnimi", ru: "ma-инфинитив" },
  { code: "Inf", label: "da-tegevusnimi", ru: "da-инфинитив" },
  { code: "IndPrSg3", label: "olevik, tema", ru: "наст. вр., он/она" },
  { code: "IndIpfSg3", label: "lihtminevik, tema", ru: "прош. вр., он/она" },
];

// Ekilex paradigm(s) → { wordClass, forms: [{ code, label, ru, value }] } (first paradigm that has key forms)
function keyFormsFromParadigms(paradigms = []) {
  for (const paradigm of Array.isArray(paradigms) ? paradigms : []) {
    const forms = Array.isArray(paradigm?.forms) ? paradigm.forms : [];
    const byCode = new Map();
    forms.forEach(form => {
      const value = cleanTerm(form?.value || form?.valuePrese || form?.displayForm, 80);
      if (form?.morphCode && value && value !== "-" && !byCode.has(form.morphCode)) byCode.set(form.morphCode, value);
    });
    const picked = KEY_FORMS.filter(item => byCode.has(item.code)).map(item => ({ ...item, value: byCode.get(item.code) }));
    if (picked.length) return { wordClass: String(paradigm.wordClass || ""), inflectionType: String(paradigm.inflectionTypeNr || ""), forms: picked };
  }
  return { wordClass: "", inflectionType: "", forms: [] };
}

// the Estonian word itself among the search hits (exact value first, Estonian language)
function pickEkilexWord(words = [], term = "") {
  const list = (Array.isArray(words) ? words : []).filter(word => word && (word.lang === "est" || !word.lang));
  const key = cleanTerm(term).toLocaleLowerCase("et");
  return list.find(word => String(word.wordValue || "").toLocaleLowerCase("et") === key) || list[0] || null;
}

// one short line for the word card: "kass, kassi, kassi, kasse" / "lugema, lugeda, loeb"
function formsLine(forms = []) {
  return forms.map(form => form.value).join(", ");
}

// Speech (TartuNLP / Neurokõne): Estonian voices the constructor offers, speed 0.5–2 (1 = normal).
const TTS_SPEAKERS = ["mari", "liivika", "vesta", "kylli", "lee", "albert", "tambet", "peeter", "kalev", "indrek", "meelis", "luukas"];
const MAX_SPEECH = 1200;

function speechRequest({ text, speaker = "mari", speed = 1 } = {}) {
  const clean = cleanTerm(text, MAX_SPEECH + 1);
  if (!clean) throw Object.assign(new Error("Text required"), { status: 400 });
  if (clean.length > MAX_SPEECH) throw Object.assign(new Error(`Text too long (max ${MAX_SPEECH} characters)`), { status: 400 });
  const voice = String(speaker || "").toLowerCase();
  if (!TTS_SPEAKERS.includes(voice)) throw Object.assign(new Error("Unknown voice"), { status: 400 });
  const pace = Number(speed);
  return { text: clean, speaker: voice, speed: Number.isFinite(pace) ? Math.min(2, Math.max(0.5, Math.round(pace * 100) / 100)) : 1 };
}

// EKI etLex „Õppeteksti hindamine” (https://sonaveeb.ee/teacher-tools/#/rating): the level of every word (lexical) and of
// every grammatical form. Summary for the constructor: shares per level, and what lies above the sheet's level.
const ETLEX_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const MAX_EVALUATION_TEXT = 8000;
function evaluationRequest({ text = "" } = {}) {
  const clean = String(text || "").replace(/\s+/g, " ").trim().slice(0, MAX_EVALUATION_TEXT);
  if (clean.length < 3) { const error = new Error("Text required"); error.status = 400; throw error; }
  return { text: clean };
}
function summarizeEvaluation(data, level = "A2") {
  const cap = ETLEX_LEVELS.indexOf(String(level || "").toUpperCase().slice(0, 2));
  const limit = cap >= 0 ? cap : 1;
  const words = (data?.evaluatedText || []).filter((t) => t.pos !== "Z");
  const forms = (data?.evaluatedGrammarText || []).filter((t) => ETLEX_LEVELS.includes(t.level));
  const count = (list) => Object.fromEntries(ETLEX_LEVELS.map((l) => [l, list.filter((t) => t.level === l).length]));
  const above = (list, pick) => {
    const seen = new Set();
    return list.filter((t) => ETLEX_LEVELS.indexOf(t.level) > limit).map(pick).filter((x) => { const k = `${x.text}|${x.level}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 40);
  };
  return {
    words: words.length,
    wordLevels: count(words),
    unknownWords: words.filter((t) => !ETLEX_LEVELS.includes(t.level)).length,
    formLevels: count(forms),
    aboveWords: above(words, (t) => ({ text: t.text, lemma: t.lemma, level: t.level })),
    aboveForms: above(forms, (t) => ({ text: t.text, lemma: t.lemma, level: t.level, form: t.formXinfo || t.form || "" })),
    lix: data?.textStat?.LixIndex ?? null,
  };
}

module.exports = { evaluationRequest, summarizeEvaluation, LANGS, KEY_FORMS, TTS_SPEAKERS, MAX_SPEECH, cleanTerm, cacheKey, translationRequest, speechRequest, keyFormsFromParadigms, pickEkilexWord, formsLine };
