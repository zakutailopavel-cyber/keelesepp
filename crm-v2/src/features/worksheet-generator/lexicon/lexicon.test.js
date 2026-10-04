import { describe, expect, it } from 'vitest';
import source from './source.json';
import { CASE, formVariants, inflect, lexeme, lexemes, lexemesWithTags, placeForms, sameWordDistractors, VERB } from './index.js';

const NOMINAL_REQUIRED = ['sg n', 'sg g', 'sg p', 'sg ill', 'sg in', 'sg el', 'sg all', 'sg ad', 'sg abl', 'sg tr', 'sg ter', 'sg es', 'sg kom'];
const PLURAL_REQUIRED = ['pl n', 'pl g', 'pl p'];
const VERB_REQUIRED = ['ma', 'da', 'n', 'd', 'b', 'me', 'te', 'vad', 'o', 's', 'sin', 'nud', 'tud', 'takse'];

describe('generator lexicon (Vabamorf forms)', () => {
  it('contains every source entry with all required forms and no gaps', () => {
    expect(lexemes()).toHaveLength(source.entries.length);
    lexemes().forEach((entry) => {
      expect(entry.ru, entry.lemma).toMatch(/[А-Яа-яЁё]/);
      expect(entry.tags.length, entry.lemma).toBeGreaterThan(0);
      const required = entry.pos === 'verb' ? VERB_REQUIRED : [...NOMINAL_REQUIRED, ...(entry.pos === 'name' ? [] : PLURAL_REQUIRED)];
      required.forEach((code) => expect(entry.forms[code]?.[0], `${entry.lemma} ${code}`).toBeTruthy());
      Object.values(entry.forms).flat().forEach((form) => expect(form, entry.lemma).not.toMatch(/[А-Яа-яЁё\s]/));
      if (entry.pos === 'verb') expect(entry.forms.ma[0]).toBe(entry.lemma);
      else expect(entry.forms['sg n'][0]).toBe(entry.lemma);
    });
  });

  it('places all have a local-case class', () => {
    lexemesWithTags('place').forEach((entry) => expect(['in', 'ad'], entry.lemma).toContain(entry.locative));
  });

  // Checked by hand against standard Estonian (ÕS); these are the forms learners must get right at A2.
  it.each([
    ['kool', CASE.genitive, 'kooli'], ['kool', CASE.inessive, 'koolis'], ['kool', CASE.illative, 'koolisse'],
    ['pood', CASE.genitive, 'poe'], ['pood', CASE.partitive, 'poodi'], ['pood', CASE.inessive, 'poes'],
    ['õde', CASE.genitive, 'õe'], ['vend', CASE.genitive, 'venna'], ['laps', CASE.partitive, 'last'], ['laps', CASE.pluralPartitive, 'lapsi'],
    ['tütar', CASE.genitive, 'tütre'], ['käsi', CASE.partitive, 'kätt'], ['vesi', CASE.partitive, 'vett'], ['vesi', CASE.shortIllative, 'vette'],
    ['pea', CASE.shortIllative, 'pähe'], ['kodu', CASE.shortIllative, 'koju'], ['tuba', CASE.shortIllative, 'tuppa'], ['maja', CASE.shortIllative, 'majja'],
    ['Tartu', CASE.inessive, 'Tartus'], ['Narva', CASE.elative, 'Narvast'], ['Tallinn', CASE.genitive, 'Tallinna'], ['Toomas', CASE.genitive, 'Toomase'],
    ['raamat', CASE.partitive, 'raamatut'], ['raamat', CASE.pluralNominative, 'raamatud'], ['leib', CASE.partitive, 'leiba'], ['piim', CASE.partitive, 'piima'],
    ['tund', CASE.genitive, 'tunni'], ['tund', CASE.partitive, 'tundi'], ['kurk', CASE.genitive, 'kurgi'], ['sool', CASE.partitive, 'soola'],
    ['väike', CASE.genitive, 'väikese'], ['ilus', CASE.partitive, 'ilusat'], ['uus', CASE.genitive, 'uue'], ['tee', CASE.pluralPartitive, 'teesid'],
  ])('%s %s = %s', (lemma, code, expected) => {
    expect(inflect(lemma, code)).toBe(expected);
  });

  it.each([
    ['sööma', VERB.daInfinitive, 'süüa'], ['sööma', VERB.past3sg, 'sõi'], ['jooma', VERB.daInfinitive, 'juua'],
    ['minema', VERB.present1sg, 'lähen'], ['minema', VERB.present1pl, 'läheme'], ['minema', VERB.present3pl, 'lähevad'], ['minema', VERB.past3sg, 'läks'],
    ['tegema', VERB.daInfinitive, 'teha'], ['nägema', VERB.present1sg, 'näen'], ['lugema', VERB.present1sg, 'loen'],
    ['pidama', VERB.present1sg, 'pean'], ['pidama', VERB.past3sg, 'pidi'], ['võtma', VERB.daInfinitive, 'võtta'],
    ['andma', VERB.present1sg, 'annan'], ['jooksma', VERB.daInfinitive, 'joosta'], ['olema', VERB.present3sg, 'on'],
    ['õppima', VERB.present1sg, 'õpin'], ['rääkima', VERB.present1sg, 'räägin'], ['sõitma', VERB.present1sg, 'sõidan'],
  ])('%s %s = %s', (lemma, code, expected) => {
    expect(inflect(lemma, code, 'verb')).toBe(expected);
  });

  it('gives kus/kuhu/kust for inner and outer places', () => {
    expect(placeForms('kool')).toEqual({ where: 'koolis', whereTo: 'kooli', whereFrom: 'koolist' });
    expect(placeForms('kodu')).toEqual({ where: 'kodus', whereTo: 'koju', whereFrom: 'kodust' });
    expect(placeForms('turg')).toEqual({ where: 'turul', whereTo: 'turule', whereFrom: 'turult' });
    expect(placeForms('töö')).toEqual({ where: 'tööl', whereTo: 'tööle', whereFrom: 'töölt' });
    expect(placeForms('Tallinn')).toEqual({ where: 'Tallinnas', whereTo: 'Tallinna', whereFrom: 'Tallinnast' });
    expect(placeForms('laud')).toBeNull();
  });

  it('offers other forms of the same word as gap distractors, never the answer', () => {
    const distractors = sameWordDistractors('Tartu', CASE.inessive);
    expect(distractors).toEqual(expect.arrayContaining(['Tartu', 'Tartusse', 'Tartust']));
    expect(distractors).not.toContain('Tartus');
    expect(sameWordDistractors('pood', CASE.partitive)).not.toContain('poodi');
  });

  it('keeps variant order and unknown words safe', () => {
    expect(formVariants('kool', 'pl p')).toEqual(['koole', 'koolisid']);
    expect(inflect('olematu-sõna', CASE.genitive)).toBe('');
    expect(lexeme('Kool')?.lemma).toBe('kool');
  });
});
