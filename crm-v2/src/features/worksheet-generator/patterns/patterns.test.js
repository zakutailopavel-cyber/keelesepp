import { describe, expect, it } from 'vitest';
import { buildPatternSentence, generatePatternSentences, grammarPoints, patternCoverage } from './engine.js';
import { PATTERNS } from './grammarPatterns.js';

const byId = (id) => PATTERNS.find((pattern) => pattern.id === id);

describe('grammar pattern engine', () => {
  // Hand-checked target sentences: the lexicon inflects, the pattern only places the words.
  it.each([
    ['local-goes-to', { name: 'Mari', place: 'kool' }, 'Mari läheb kooli.', 'kooli'],
    ['local-goes-to', { name: 'Jaan', place: 'töö' }, 'Jaan läheb tööle.', 'tööle'],
    ['local-goes-to', { name: 'Anna', place: 'kodu' }, 'Anna läheb koju.', 'koju'],
    ['local-is-at', { name: 'Toomas', place: 'turg' }, 'Toomas on praegu turul.', 'turul'],
    ['local-comes-from', { name: 'Olga', place: 'apteek' }, 'Olga tuleb apteegist.', 'apteegist'],
    ['local-from-country', { name: 'Sergei', country: 'Venemaa' }, 'Sergei on pärit Venemaalt.', 'Venemaalt'],
    ['local-from-country', { name: 'Kati', country: 'Soome' }, 'Kati on pärit Soomest.', 'Soomest'],
    ['local-travel-city', { city: 'Tallinn' }, 'Homme sõidame Tallinna.', 'Tallinna'],
    ['present-elama-city', { s: 'nad', verb: 'elama', city: 'Pärnu' }, 'Nad elavad Pärnus.', 'elavad'],
    ['present-tootama-place', { s: 'me', verb: 'töötama', place: 'pank' }, 'Me töötame pangas.', 'töötame'],
    ['present-olema-profession', { s: 'sa', verb: 'olema', job: 'arst' }, 'Sa oled arst.', 'oled'],
    ['genitive-minu-family-thing', { family: 'vend', thing: 'kott' }, 'See on minu venna kott.', 'venna'],
    ['genitive-name-family-works', { name: 'Toomas', family: 'õde', place: 'haigla' }, 'Toomase õde töötab haiglas.', 'Toomase'],
    ['genitive-whose-thing', { thing: 'telefon', name: 'Martin' }, 'Kelle telefon see on? See on Martini telefon.', 'Martini'],
    ['partitive-eat', { s: 'ma', verb: 'sööma', food: 'puder' }, 'Ma söön hommikul putru.', 'putru'],
    ['partitive-drink', { name: 'Liisa', drink: 'vesi' }, 'Liisa joob õhtul vett.', 'vett'],
    ['partitive-negation', { thing: 'auto' }, 'Mul ei ole autot.', 'autot'],
    ['partitive-buy-two', { food: 'leib', food2: 'piim' }, 'Ma ostan poest leiba ja piima.', 'leiba'],
    ['adjective-home', { name: 'Anna', adj: 'suur', home: 'korter' }, 'Anna elab suures korteris.', 'suures'],
    ['adjective-want', { adj: 'uus', thing: 'telefon' }, 'Ma tahan osta uut telefoni.', 'uut'],
    ['adjective-have', { adj: 'punane', thing: 'kott' }, 'Mul on punane kott.', 'punane'],
    ['numeral-family', { number: 'kaks', person: 'laps' }, 'Mul on kaks last.', 'last'],
    ['numeral-things', { number: 'kolm', thing: 'raamat' }, 'Kotis on kolm raamatut.', 'raamatut'],
  ])('%s %j → %s', (id, choices, text, answer) => {
    const sentence = buildPatternSentence(byId(id), choices);
    expect(sentence).not.toBeNull();
    expect(sentence.text).toBe(text);
    expect(sentence.answer).toBe(answer);
    expect(sentence.gapped).toContain(`[${answer}]`);
    expect(sentence.distractors).not.toContain(answer);
  });

  it('every pattern yields enough valid sentences and every one is well formed', () => {
    const coverage = patternCoverage();
    coverage.forEach((item) => expect(item.valid, item.id).toBeGreaterThanOrEqual(10));
    for (const point of grammarPoints()) {
      for (const seed of ['a', 'b', 'c']) {
        const sentences = generatePatternSentences({ grammar: point.id, count: 10, seed });
        expect(sentences.length, point.id).toBe(10);
        expect(new Set(sentences.map((item) => item.text)).size).toBe(10);
        sentences.forEach((item) => {
          expect(item.text).toMatch(/^[A-ZÕÄÖÜŠŽ].*[.?]$/u);
          expect(item.text).not.toMatch(/[{}]/);
          expect(item.text.includes(item.answer)).toBe(true);
          expect(item.distractors.length).toBeGreaterThanOrEqual(2);
          expect(item.distractors).not.toContain(item.answer);
          expect(new Set(item.distractors).size).toBe(item.distractors.length);
        });
      }
    }
  });

  it('is deterministic for a seed and varies across seeds', () => {
    const first = generatePatternSentences({ grammar: 'local-cases', count: 8, seed: 'x' });
    expect(generatePatternSentences({ grammar: 'local-cases', count: 8, seed: 'x' })).toEqual(first);
    expect(generatePatternSentences({ grammar: 'local-cases', count: 8, seed: 'y' }).map((item) => item.text)).not.toEqual(first.map((item) => item.text));
  });

  it('keeps meaning restrictions: no "külla" (visiting) as a place, colours only on describable things', () => {
    const all = generatePatternSentences({ grammar: 'local-cases', count: 400, seed: 'all' });
    expect(all.some((item) => /\bküla/.test(item.text))).toBe(false);
    const adjectives = generatePatternSentences({ grammar: 'adjective-agreement', count: 300, seed: 'all' });
    expect(adjectives.some((item) => /(piletit|vihikut|raamatut|pliiatsit)\.$/.test(item.text))).toBe(false);
  });

  it('skips words whose forms would not give two different wrong options', () => {
    // Mari: genitive = nominative, so it can never be the target of a genitive gap
    expect(buildPatternSentence(byId('genitive-whose-thing'), { thing: 'kott', name: 'Mari' })).toBeNull();
    expect(generatePatternSentences({ grammar: 'genitive-possession', count: 100, seed: 'g' }).some((item) => item.answer === 'Mari')).toBe(false);
  });

  it('excludes ids and texts already used', () => {
    const first = generatePatternSentences({ grammar: 'numeral-partitive', count: 5, seed: 'e' });
    const next = generatePatternSentences({ grammar: 'numeral-partitive', count: 5, seed: 'e', exclude: first.map((item) => item.id) });
    expect(next.some((item) => first.some((used) => used.id === item.id))).toBe(false);
  });
});
