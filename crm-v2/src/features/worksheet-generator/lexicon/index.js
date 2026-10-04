// Inflected-form lexicon for the network-free worksheet generator.
// forms.json is built offline from source.json with Vabamorf (tools/lexicon/build_forms.py); nothing here calls an API.
// Every form is a real Estonian word form produced by the morphological synthesizer, so a generated gap always has an
// exact answer and wrong options can be other forms of the same word.
import data from './forms.json';

export const LEXICON_SCHEMA = 'keelesepp.generator-lexicon/1';

// Readable names for the Vabamorf form codes the generator uses.
export const CASE = Object.freeze({
  nominative: 'sg n', genitive: 'sg g', partitive: 'sg p', illative: 'sg ill', shortIllative: 'adt',
  inessive: 'sg in', elative: 'sg el', allative: 'sg all', adessive: 'sg ad', ablative: 'sg abl',
  translative: 'sg tr', terminative: 'sg ter', essive: 'sg es', comitative: 'sg kom',
  pluralNominative: 'pl n', pluralGenitive: 'pl g', pluralPartitive: 'pl p',
});

export const VERB = Object.freeze({
  maInfinitive: 'ma', daInfinitive: 'da', present1sg: 'n', present2sg: 'd', present3sg: 'b', present1pl: 'me',
  present2pl: 'te', present3pl: 'vad', negative: 'o', imperative2sg: 'o', imperative2pl: 'ge', past3sg: 's',
  past1sg: 'sin', past1pl: 'sime', pastParticiple: 'nud', passiveParticiple: 'tud', presentPassive: 'takse', conditional: 'ks',
});

const ENTRIES = Object.freeze(data.entries || []);
const BY_KEY = new Map();
ENTRIES.forEach((entry) => {
  const key = entry.lemma.toLocaleLowerCase('et');
  if (!BY_KEY.has(key)) BY_KEY.set(key, []);
  BY_KEY.get(key).push(entry);
});

export function lexemes() {
  return ENTRIES;
}

export function lexeme(lemma, pos = '') {
  const found = BY_KEY.get(String(lemma || '').toLocaleLowerCase('et')) || [];
  return (pos ? found.find((entry) => entry.pos === pos) : found[0]) || null;
}

// All accepted variants of one form, preferred first ([] when the word has no such form).
export function formVariants(lemma, code, pos = '') {
  return [...(lexeme(lemma, pos)?.forms?.[code] || [])];
}

// The preferred form, or '' when the lexicon does not know it.
export function inflect(lemma, code, pos = '') {
  return formVariants(lemma, code, pos)[0] || '';
}

// Kus? Kuhu? Kust? — places take the inner (-s/-sse/-st) or the outer (-l/-le/-lt) local cases.
// "Kuhu" prefers the short illative when the word has one (kooli, poodi, koju, Tallinna).
export function placeForms(lemma) {
  const entry = lexeme(lemma);
  if (!entry?.locative) return null;
  const forms = entry.forms;
  if (entry.locative === 'ad') return { where: forms['sg ad']?.[0] || '', whereTo: forms['sg all']?.[0] || '', whereFrom: forms['sg abl']?.[0] || '' };
  return { where: forms['sg in']?.[0] || '', whereTo: forms.adt?.[0] || forms['sg ill']?.[0] || '', whereFrom: forms['sg el']?.[0] || '' };
}

export function lexemesWithTags(...tags) {
  return ENTRIES.filter((entry) => tags.every((tag) => entry.tags.includes(tag)));
}

// Every other form of the same word: grammatical distractors for a gap (Tartus → Tartu, Tartusse, Tartust).
export function sameWordDistractors(lemma, code, pos = '', codes = ['sg n', 'sg g', 'sg p', 'adt', 'sg ill', 'sg in', 'sg el', 'sg ad', 'sg all', 'sg abl']) {
  const answer = new Set(formVariants(lemma, code, pos));
  const entry = lexeme(lemma, pos);
  if (!entry) return [];
  const out = [];
  codes.filter((other) => other !== code).forEach((other) => (entry.forms[other] || []).forEach((form) => {
    if (!answer.has(form) && !out.includes(form)) out.push(form);
  }));
  return out;
}
