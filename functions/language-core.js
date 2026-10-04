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

module.exports = { LANGS, KEY_FORMS, cleanTerm, cacheKey, translationRequest, keyFormsFromParadigms, pickEkilexWord, formsLine };
