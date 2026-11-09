import { describe, expect, it } from 'vitest';
import { keyWords, legacySameMeaning, sameMeaningWords, wordMatches } from './readingMatch.js';
import { norm } from './schema.js';
import { checkDocument } from './registry.js';
import { effectiveScore } from './storedScore.js';
import { buildCourseSheet } from '../../worksheet-generator/admin/course/registry.js';
import * as v3b2m05 from '../../worksheet-generator/admin/course/archive/v3/b2/module05.js';

const same = (right, answer) => sameMeaningWords(norm(right), norm(answer));

describe('open reading answers: key words, any case, compounds (owner 2026-11-04)', () => {
  it('„rannavõrkpalli” counts for „võrkpall”: the student who understood the text is right', () => {
    expect(wordMatches('võrkpall', 'rannavõrkpalli')).toBe(true);
    expect(same('buss, lõuna, võrkpall, grillipidu', 'Bussisõitu, lõunat, rannavõrkpalli turniiri ja grillipidu.')).toBe(true);
    // the 2026-10-27 rule said no
    expect(legacySameMeaning(norm('buss, lõuna, võrkpall, grillipidu'), norm('Bussisõitu, lõunat, rannavõrkpalli turniiri ja grillipidu.'))).toBe(false);
  });

  it('stop words are not key words', () => {
    expect(keyWords(norm('suvel on rand rahvarohke'))).toEqual(['suvel', 'rand', 'rahvarohke']);
    expect(keyWords(norm('Ta ei võtnud kooki, sest seda oleks liiga palju.'))).toEqual(['võtnud', 'kooki', 'oleks', 'liiga', 'palju']);
  });

  it('a wrong answer that shares only stop words stays wrong', () => {
    expect(same('suvel on rand rahvarohke', 'talvel on see ja ka nii')).toBe(false);
    expect(same('buss, lõuna, võrkpall, grillipidu', 'see on ja ka ning kui aga sest')).toBe(false);
    expect(same('saal ja spaa', 'ja')).toBe(false);
  });

  it('more than 3 key words: 70 % is enough; up to 3: all of them', () => {
    expect(same('meeskonnamängud, leivatöötuba, saun, õhtusöök', 'meeskonnamänge, sauna ja õhtusööki')).toBe(true); // 3 / 4
    expect(same('meeskonnamängud, leivatöötuba, saun, õhtusöök', 'sauna ja õhtusööki')).toBe(false); // 2 / 4
    expect(same('suvel on rand rahvarohke', 'suvel on rannas palju inimesi')).toBe(false); // 2 / 3
    expect(same('saal ja spaa', 'Hotelli saali ja spaad')).toBe(true);
  });

  it('numbers: digits and number words are the same, other numbers are not', () => {
    expect(same('hotelli bussisõit on kaks tundi, talu oma tund', 'Hotelli bussisõit kestab 2 tundi, talus üks tund')).toBe(true);
    expect(same('2 tundi', 'kaks tundi')).toBe(true);
    expect(same('kaks tundi', '2 tundi')).toBe(true);
    expect(same('20 eurot', '2 eurot')).toBe(false);
    expect(same('kell 7', 'kell 8')).toBe(false);
  });

  it('õ / ä / ö / ü typed without the marks: whole word only', () => {
    expect(same('õhtusöök', 'ohtusook')).toBe(true);
    expect(wordMatches('lõuna', 'louna')).toBe(true);
    expect(same('kohvi', 'Ta joob teed.')).toBe(false);
  });

  it('everything the 2026-10-27 rule accepted is still accepted', () => {
    expect(same('teisipäeval kell kümme', 'Õde pakkus teisipäeva kella kümmet.')).toBe(true);
    expect(same('teisipäeval kell kümme', 'teisipäeval kell 10')).toBe(true);
    expect(same('see oleks liiga palju', 'Ta ei võtnud kooki, sest seda oleks liiga palju.')).toBe(true);
    expect(same('avada uue konto', 'Ta soovis uut kontot.')).toBe(false);
  });
});

// b1b2-024 „Kahe lahenduse võrdlemine”, Kasuta, as assigned (archive v3): the 4/18 report
describe('the real sheet: reading 024_t_read with a student who understood the text', () => {
  const sheet = buildCourseSheet(v3b2m05, 'b1b2-024', 'transfer');
  const answers = {
    '024_t_read:0': 'Bussisõitu, lõunat, rannavõrkpalli turniiri ja grillipidu.',
    '024_t_read:1': 'Hotelli saali ja spaad.',
    '024_t_read:2': 'Suvel on rand rahvarohke.',
    '024_t_read:3': 'Meeskonnamänge, leivatöötuba, sauna ja õhtusööki.',
    '024_t_read:4': '1900 eurot',
    '024_t_read:5': 'Mobiililevi on nõrk ja transport tuleb ise korraldada.',
    '024_t_read:6': 'Metsarada on kitsas.',
    '024_t_read:7': 'Hotelli bussisõit on 2 tundi, talu oma üks tund.',
  };

  it('the reading counts as understood', () => {
    const { results, score } = checkDocument(sheet, answers);
    expect(score).toMatchObject({ total: 8 });
    expect(score.correct).toBeGreaterThanOrEqual(7);
    expect(results['024_t_read:0']).toBe('ok');
    expect(results['024_t_read:6']).toBe('bad'); // 1 of 3 key words missing („juurikaline”): the teacher decides
  });

  it('an old stored score with the same items is shown with the new, higher result; nothing is written', () => {
    const stored = { correct: 2, total: 8, pct: 25, perGoal: {} };
    const result = effectiveScore({ score: stored, worksheetDoc: sheet, answers, status: 'done' });
    expect(result.recomputed).toBe(true);
    expect(result.stored).toBe(stored);
    expect(result.score.correct).toBeGreaterThan(2);
    expect(stored.correct).toBe(2);
  });

  it('a stored score is never lowered by the new rule', () => {
    const stored = { correct: 8, total: 8, pct: 100, perGoal: {} };
    expect(effectiveScore({ score: stored, worksheetDoc: sheet, answers, status: 'done' }).recomputed).toBe(false);
  });
});
