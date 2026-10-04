// Fills grammar patterns (grammarPatterns.js) from the Vabamorf lexicon. Deterministic for a seed, network-free.
// Every produced item carries its exact answer and same-word distractors; an instance that cannot be built cleanly
// (missing form, fewer than two distinct distractors) is skipped instead of being emitted with a guess.
import { lexemes, placeForms } from '../lexicon/index.js';
import { createSeededRandom, shuffleSeeded } from '../engine/seed.js';
import { ALL_PATTERNS as PATTERNS, GRAMMAR_POINTS, SUBJECTS } from './grammarPatterns.js';

const PLACE_FORMS = new Set(['where', 'whereTo', 'whereFrom']);
const MIN_DISTRACTORS = 2;

function candidates(spec) {
  if (spec.fixed) return spec.fixed.map((text) => ({ fixed: text }));
  if (spec.subject) return spec.subject.map((key) => ({ subject: key }));
  return lexemes().filter((entry) => {
    if (spec.pos && entry.pos !== spec.pos) return false;
    if (spec.lemmas && !spec.lemmas.includes(entry.lemma)) return false;
    if (spec.exclude?.includes(entry.lemma)) return false;
    if (spec.tags && !spec.tags.every((tag) => entry.tags.includes(tag))) return false;
    if (spec.anyTags && !spec.anyTags.some((tag) => entry.tags.includes(tag))) return false;
    if (PLACE_FORMS.has(spec.form) && !entry.locative) return false;
    if (spec.locative && entry.locative !== spec.locative) return false;
    return true;
  });
}

function formOf(entry, code) {
  if (PLACE_FORMS.has(code)) return placeForms(entry.lemma)?.[code] || '';
  return entry.forms?.[code]?.[0] || '';
}

function slotText(spec, choice, chosen) {
  if (choice.fixed) return choice.fixed;
  if (choice.subject) return SUBJECTS[choice.subject].text;
  if (spec.form === 'person') return formOf(choice, SUBJECTS[chosen[spec.person].subject].code);
  return formOf(choice, spec.form);
}

function distractorsFor(pattern, chosen) {
  const spec = pattern.slots[pattern.target];
  const entry = chosen[pattern.target];
  const answer = slotText(spec, entry, chosen);
  const out = [];
  pattern.contrast.forEach((code) => {
    const form = formOf(entry, code);
    if (form && form !== answer && !out.includes(form)) out.push(form);
  });
  return { answer, distractors: out };
}

const capitalize = (text) => text.charAt(0).toLocaleUpperCase('et') + text.slice(1);

// Build one sentence from explicit slot choices ({ slotName: lemma | subject key | fixed text }).
export function buildPatternSentence(pattern, choices) {
  const chosen = {};
  for (const [name, spec] of Object.entries(pattern.slots)) {
    const wanted = choices[name];
    const pool = candidates(spec);
    const match = pool.find((item) => item.lemma === wanted || item.subject === wanted || item.fixed === wanted);
    if (!match) return null;
    chosen[name] = match;
  }
  return assemble(pattern, chosen);
}

function assemble(pattern, chosen) {
  const texts = {};
  for (const [name, spec] of Object.entries(pattern.slots)) {
    const text = slotText(spec, chosen[name], chosen);
    if (!text) return null;
    texts[name] = text;
  }
  for (const [name, spec] of Object.entries(pattern.slots)) {
    if ((spec.distinctFrom || []).some((other) => chosen[other]?.lemma && chosen[other].lemma === chosen[name].lemma)) return null;
  }
  const { answer, distractors } = distractorsFor(pattern, chosen);
  if (!answer || distractors.length < MIN_DISTRACTORS) return null;
  // the gap must be unambiguous: the answer occurs exactly once as a word in the sentence
  const occurrences = Object.values(texts).filter((value) => value.toLocaleLowerCase('et') === answer.toLocaleLowerCase('et')).length
    + (pattern.text.toLocaleLowerCase('et').match(new RegExp(`(^|[^\\p{L}])${answer.toLocaleLowerCase('et').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^\\p{L}]|$)`, 'gu')) || []).length;
  if (occurrences !== 1) return null;
  let text = pattern.text;
  let gapped = pattern.text;
  for (const [name, value] of Object.entries(texts)) {
    text = text.replaceAll(`{${name}}`, value);
    gapped = gapped.replaceAll(`{${name}}`, name === pattern.target ? `[${value}]` : value);
  }
  const lemmas = Object.fromEntries(Object.entries(chosen).map(([name, item]) => [name, item.lemma || item.subject || item.fixed]));
  return {
    id: `${pattern.id}:${Object.values(lemmas).join('|')}`,
    patternId: pattern.id,
    grammar: pattern.grammar,
    context: pattern.context || '',
    text: capitalize(text),
    gapped: capitalize(gapped),
    answer,
    distractors,
    lemma: chosen[pattern.target].lemma || '',
    lemmas,
  };
}

function randomInstance(pattern, random) {
  const chosen = {};
  for (const [name, spec] of Object.entries(pattern.slots)) {
    const pool = candidates(spec);
    if (!pool.length) return null;
    chosen[name] = pool[Math.floor(random() * pool.length)];
  }
  return assemble(pattern, chosen);
}

export function patternsFor(grammar) {
  return PATTERNS.filter((pattern) => pattern.grammar === grammar);
}

// `count` distinct sentences for one grammar point, spread over its patterns, deterministic for `seed`.
export function generatePatternSentences({ grammar, count = 6, seed = 'patterns', exclude = [] } = {}) {
  const patterns = shuffleSeeded(patternsFor(grammar), `${seed}:patterns`);
  if (!patterns.length) return [];
  const random = createSeededRandom(`${seed}:${grammar}`);
  const seen = new Set(exclude);
  const result = [];
  for (let attempt = 0; attempt < count * 40 && result.length < count; attempt += 1) {
    const instance = randomInstance(patterns[attempt % patterns.length], random);
    if (!instance || seen.has(instance.id) || seen.has(instance.text)) continue;
    seen.add(instance.id);
    seen.add(instance.text);
    result.push(instance);
  }
  return result;
}

// How many distinct valid sentences each pattern can produce (all slot combinations), for coverage reports.
export function patternCoverage() {
  return PATTERNS.map((pattern) => {
    const names = Object.keys(pattern.slots);
    const pools = names.map((name) => candidates(pattern.slots[name]));
    let total = 0;
    let valid = 0;
    const walk = (index, chosen) => {
      if (index === names.length) {
        total += 1;
        if (assemble(pattern, chosen)) valid += 1;
        return;
      }
      pools[index].forEach((item) => walk(index + 1, { ...chosen, [names[index]]: item }));
    };
    walk(0, {});
    return { id: pattern.id, grammar: pattern.grammar, combinations: total, valid };
  });
}

export function grammarPoints() {
  return Object.entries(GRAMMAR_POINTS).map(([id, point]) => ({ id, ...point, patterns: patternsFor(id).length }));
}
