import fs from 'node:fs';
import { COURSE_MODULES } from './registry.js';
import { B, hide, teach } from './blocks.js';
import { buildCourseSheet, isMethodV5, moduleSheets } from './courseSheet.js';
import { CAST, V5, castMentions, isAnalyticRubric, methodV5Input, methodV5Problems, methodV5Report, formatMethodV5Report, words } from './methodV5.js';
import { sheetProblems } from './quality.js';
import { depthProblems } from '../../../worksheet-studio/didactics/depth.js';
import { RUBRIC_SCALES } from '../../../worksheet-studio/engine/blocks/harnoScales.js';
import STRICT_V5 from './strictModulesV5.json';

// Methodology v5 „lesson budget” (docs/METHODOLOGY_B1_B2_V5.md §6): a B1 / B2 module listed in strictModulesV5.json
// passes every gate G1–G13. A module is switched on when it is rewritten; before that,
//   node tools/course-audit/method-v5.mjs --course b1 --module 1
// prints its gaps (blocks and minutes per sheet, every violation).

describe('strictModulesV5.json', () => {
  it('lists B1 and B2 module ids of the right course', () => {
    expect(Object.keys(STRICT_V5).sort()).toEqual(['b1', 'b2']);
    for (const course of ['b1', 'b2']) {
      for (const id of STRICT_V5[course]) {
        const mod = COURSE_MODULES.find((m) => m.MODULE.id === id);
        expect(mod, `${id} is not a course module`).toBeTruthy();
        expect(mod.MODULE.course).toBe(course);
      }
    }
  });
  it('every strict module passes the v5 gates G1–G13', () => {
    const strict = COURSE_MODULES.filter((m) => isMethodV5(m));
    const problems = strict.flatMap((m) => methodV5Problems(methodV5Input(m)).map((p) => `${m.MODULE.id} ${p.lessonId} ${p.phase} ${p.gate}: ${p.text}`));
    expect(problems).toEqual([]);
  });
});

describe('G7 cast names come from docs/COURSE_CAST.md', () => {
  const cast = fs.readFileSync('../docs/COURSE_CAST.md', 'utf8');
  it.each(CAST)('%s is in the cast document', (name) => expect(cast).toMatch(new RegExp(`\\b${name}\\b`)));
  it('finds case forms, not the verb „anna”', () => {
    expect(castMentions('Me läksime Sofiaga ja Markusele kinno. Jaani koer jäi koju.')).toEqual(['Sofia', 'Markus', 'Jaan']);
    expect(castMentions('Anna mulle pliiats. Palun anna andeks.')).toEqual([]);
    expect(castMentions('Anna elab Sauel.')).toEqual(['Anna']);
  });
});

describe('words without task markup', () => {
  it('counts one option of a cloze, the sentence of an insertion and the form of a gap', () => {
    expect(words('Ma {*käisin|käin} eile [poes|kaupluses]. [[Siis tulin koju.]]')).toBe(7);
  });
});

// ---- a small synthetic module that passes every gate, then one change per gate ----------------------------------
const text = (n) => Array.from({ length: n }, (_, i) => (i % 10 === 9 ? 'lõpp.' : 'sõna')).join(' ');
const sheet = (phase, blocks, meta = {}) => ({ meta: { level: 'B1', phase, methodV5: true, ...meta }, blocks });
const gaps = (id, n, bank = '') => B.gaps(id, 'Lüngad.', 'Kirjuta sõna õiges vormis.', Array.from({ length: n }, (_, i) => `Lause ${i + 1} on siin [vastus] ja edasi.`), bank);
const hiddenCard = (id) => teach(B.rolecards(id, 'Helista.', 'Õpetaja on töötaja.', 'Sina helistad.', 'Õpetaja kaart.', [], []), 'Varjatud info: maja on remondis. Takistus: aeg on täis.');
const link = (id) => B.text(id, 'Päris allikas', 'Loe ERR uudist „Linnas avatakse uus raamatukogu” (https://www.err.ee/uudised) ja too üks fakt tundi.');
const freeSpeech = (id) => B.speaking(id, 'Räägi.', 'Räägi oma kogemusest.', ['Mis juhtus?', 'Miks?'], [120, 150]);
const freeLetter = (id) => B.letter(id, 'Kiri.', 'Kirjuta kiri vallale.', '', '', [60, 100]);

function cleanB1() {
  return {
    id: 'a2b1-module-99', course: 'b1', title: 'Proov',
    lessons: {
      'a2b1-071': { kind: 'lesson', n: 71, sheets: {
        discover: sheet('discover', [B.reading('071_d_read', 'Loe.', 'Loe ja vasta.', 'Tekst', `Sofia kirjutab. ${text(220)}`, [['Mis juhtus?', 'midagi']]), B.notice('071_d_notice', 'Märka.', ['reegel']), freeSpeech('071_d_talk')]),
        practice: sheet('practice', [B.notice('071_p_rule', 'Reegel.', ['reegel']), gaps('071_p_gaps', 9), B.transformation('071_p_tr', 'Muuda.', 'Kirjuta terve lause.', Array.from({ length: 8 }, (_, i) => [`Lause ${i}.`, 'eile', `Lause ${i} eile.`]))]),
        transfer: sheet('transfer', [B.text('071_t_sit', 'Olukord', 'Sinu majas on probleem.'), hiddenCard('071_t_call'), freeLetter('071_t_letter'), link('071_t_link')]),
      } },
      'a2b1-072': { kind: 'lesson', n: 72, sheets: {
        discover: sheet('discover', [{ ...B.listening('072_d_radio', 'Kuula.', 'Kuula ja kirjuta.', text(260), ['Uudis räägib [linnast].']), data: { ...B.listening('072_d_radio', 'Kuula.', 'Kuula ja kirjuta.', text(260), ['Uudis räägib [linnast].']).data, plays: 2 } }, B.notice('072_d_notice', 'Märka.', ['reegel'])]),
        practice: sheet('practice', [gaps('072_p_gaps', 10), B.errorfix('072_p_fix', 'Paranda.', 'Kirjuta terve lause.', Array.from({ length: 8 }, (_, i) => [`Vale lause ${i}.`, `Õige lause ${i}.`]))]),
        transfer: sheet('transfer', [B.text('072_t_sit', 'Olukord', 'Sõber küsib nõu.'), freeSpeech('072_t_talk'), B.tip('072_t_tip', 'Nõuanne', 'Räägi rahulikult.')]),
      } },
      'a2b1-075': { kind: 'control', n: 75, sheets: {
        discover: sheet('discover', [
          B.text('075_d_intro', 'Kontroll', 'Harno: sooritatud alates 60 %. KeeleSepp: eksamiks valmis alates 70 %, meie sertifikaat alates 80 % (sisemine lävend).'),
          { ...B.examListen('075_d_listen', 'Kuula.', 'Kuulad kaks korda.', 'truefalse', text(150), [['Väide', true]]), data: { ...B.examListen('075_d_listen', 'Kuula.', 'Kuulad kaks korda.', 'truefalse', text(150), [['Väide', true]]).data, lockPlays: true } },
          B.examWriting('075_d_write', 'Kirjuta.', 'Kirjuta kiri.', 'kiri', { situation: 'Kiri.', points: ['a', 'b'], words: [50, 100] }),
          { ...B.rubricSpeaking('075_d_rs'), data: { ...B.rubricSpeaking('075_d_rs').data, criteria: RUBRIC_SCALES.S.criteria.map((c) => ({ ...c, hint: c.hint.replace('räägib pausideta', 'räägib sidusalt') })) } },
        ], { assessment: true }),
      } },
    },
  };
}
const codes = (input) => methodV5Problems(input).map((p) => p.code);
const edit = (fn) => { const input = cleanB1(); fn(input.lessons); return codes(input); };
const sheetOf = (lessons, id, phase) => lessons[id].sheets[phase];

describe('the gates on a synthetic B1 module', () => {
  it('a clean v5 module has no problem', () => {
    expect(methodV5Problems(cleanB1())).toEqual([]);
  });
  it('G1 block budget per sheet, per lesson and the lesson minutes; a control is one sheet of ≤ 10 blocks', () => {
    expect(edit((l) => sheetOf(l, 'a2b1-071', 'discover').blocks.push(B.notice('x1', 'a', ['a']), B.notice('x2', 'a', ['a']), B.notice('x3', 'a', ['a'])))).toContain('G1-sheet');
    expect(edit((l) => ['discover', 'practice', 'transfer'].forEach((p) => sheetOf(l, 'a2b1-072', p).blocks.push(...Array.from({ length: 3 }, (_, i) => B.notice(`${p}${i}`, 'a', ['a'])))))).toContain('G1-lesson');
    expect(edit((l) => sheetOf(l, 'a2b1-072', 'practice').blocks.push(B.writing('w', 'Kirjuta.', 'Kirjuta.', [60, 90]), B.writing('w2', 'Kirjuta.', 'Kirjuta.', [60, 90])))).toContain('G1-minutes');
    expect(edit((l) => { l['a2b1-075'].sheets.practice = sheet('practice', [B.notice('c', 'a', ['a'])], { assessment: true }); })).toContain('G1-control-sheets');
    expect(edit((l) => sheetOf(l, 'a2b1-075', 'discover').blocks.push(...Array.from({ length: 7 }, (_, i) => B.notice(`c${i}`, 'a', ['a']))))).toContain('G1-control-blocks');
  });
  it('the textbook picture, word strips and hidden blocks do not count', () => {
    expect(edit((l) => sheetOf(l, 'a2b1-071', 'discover').blocks.push(
      { id: 'art', type: 'image', data: { artId: 'a' } }, { id: 'artq', type: 'notice', data: { artFor: 'a' } }, { id: 'ws', type: 'wordstrip', data: {} }, hide(B.notice('h1', 'a', ['a'])), hide(B.notice('h2', 'a', ['a'])), hide(B.notice('h3', 'a', ['a']))))).toEqual([]);
  });
  it('G2 a strict sheet is a v5 sheet', () => {
    expect(edit((l) => { delete sheetOf(l, 'a2b1-071', 'practice').meta.methodV5; })).toContain('G2-flag');
  });
  it('G3 lengths with ceilings (and floors) by the lesson number; one input', () => {
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'discover').blocks[0].data.passage = text(320); })).toContain('G3-text');
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'discover').blocks[0].data.passage = text(100); })).toContain('G3-input-short');
    expect(edit((l) => { sheetOf(l, 'a2b1-072', 'discover').blocks[0].data.transcript = text(500); })).toContain('G3-audio');
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'transfer').blocks[2].data.maxWords = 150; })).toContain('G3-writing');
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'discover').blocks[2].data.maxSec = 300; })).toContain('G3-speech');
    expect(edit((l) => sheetOf(l, 'a2b1-071', 'practice').blocks.push(B.reading('071_p_read2', 'Loe.', 'Loe.', 'Teine', text(200), [['Mis?', 'x']])))).toContain('G3-inputs');
    // an A2 lesson (001–020): the B1-length text is over the ceiling
    expect(edit((l) => { l['a2b1-071'].n = 3; })).toContain('G3-text');
  });
  it('G5 no dictation', () => {
    expect(edit((l) => sheetOf(l, 'a2b1-072', 'practice').blocks.push(B.dictation('d', 'Etteütlus.', 'Kirjuta.', ['Lause.'])))).toContain('G5-dictation');
  });
  it('G6 the play count is set (2×) and locked in a control', () => {
    expect(edit((l) => { delete sheetOf(l, 'a2b1-072', 'discover').blocks[0].data.plays; })).toContain('G6-plays');
    expect(edit((l) => { sheetOf(l, 'a2b1-072', 'discover').blocks[0].data.plays = 3; })).toContain('G6-plays');
    expect(edit((l) => { delete sheetOf(l, 'a2b1-075', 'discover').blocks[1].data.lockPlays; })).toContain('G6-lock');
  });
  it('G7 the cast in at most one lesson', () => {
    expect(edit((l) => { sheetOf(l, 'a2b1-072', 'transfer').blocks[0].data.text = 'Markus küsib nõu.'; })).toContain('G7-cast');
  });
  it('G8 one tip a lesson, examrubric only in a control, drills to Harjuta', () => {
    expect(edit((l) => sheetOf(l, 'a2b1-072', 'discover').blocks.push(B.know('k', 'Fakt.', 'Statistikaamet')))).toContain('G8-tips');
    expect(edit((l) => sheetOf(l, 'a2b1-071', 'transfer').blocks.push(B.rubricW2('r')))).toContain('G8-examrubric');
    expect(edit((l) => sheetOf(l, 'a2b1-072', 'transfer').blocks.push(B.match('m', 'Ühenda.', 'Ühenda.', [['a', 'b']])))).toContain('G8-off-sheet');
    expect(edit((l) => { sheetOf(l, 'a2b1-072', 'practice').blocks[0] = gaps('072_p_gaps', 14); })).toContain('G8-drill-long');
    // before lesson 041 a match may still stand on the sheet
    expect(edit((l) => { l['a2b1-072'].n = 30; sheetOf(l, 'a2b1-072', 'transfer').blocks.push(B.match('m', 'Ühenda.', 'Ühenda.', [['a', 'b']])); })).not.toContain('G8-off-sheet');
  });
  it('G9 one free speech, one free text and one hidden-information card per module', () => {
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'transfer').blocks[1] = B.rolecards('071_t_call', 'Helista.', 'Helista.', 'A', 'B', ['Tere'], ['Tere']); })).toContain('G9-hidden-card');
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'discover').blocks[2].data.tipText = 'Kasuta: sest'; sheetOf(l, 'a2b1-072', 'transfer').blocks[1].data.tipText = 'Kasuta: sest'; })).toContain('G9-speech');
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'transfer').blocks[2].data.opening = 'Lugupeetud vald!'; })).toContain('G9-writing');
    expect(edit((l) => sheetOf(l, 'a2b1-071', 'transfer').blocks.unshift(B.phrasebank('pb', [['Fraasid', ['Ma arvan, et …']]])))).toContain('G9-writing');
  });
  it('G11 the thresholds named one way', () => {
    expect(edit((l) => { sheetOf(l, 'a2b1-075', 'discover').blocks[0].data.text = 'Harno: sooritatud alates 60 %. Sertifikaat alates 80 %.'; })).toContain('G11-thresholds');
    expect(edit((l) => sheetOf(l, 'a2b1-071', 'transfer').blocks[0].data.text += ' Harno eksami lävend on 70 %.')).toContain('G11-harno');
  });
  it('G12 no „pausideta” in an A2 / B1 rubric', () => {
    expect(edit((l) => { sheetOf(l, 'a2b1-075', 'discover').blocks[3] = B.rubricSpeaking('075_d_rs'); })).toContain('G12-pauses');
  });
  it('G13 a real source or addressee', () => {
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'transfer').blocks.pop(); })).toContain('G13-link');
    expect(edit((l) => { sheetOf(l, 'a2b1-071', 'transfer').blocks.pop(); sheetOf(l, 'a2b1-071', 'transfer').blocks[2].data.realAddressee = 'Tallinna Keskraamatukogu'; })).not.toContain('G13-link');
  });
});

describe('the B2 gates on a synthetic B2 lesson', () => {
  const inference = [['Mida autor arvab linnast?', 'x'], ['Millele kirjutaja vihjab?', 'y']];
  const lesson = (blocks) => ({ id: 'b1b2-module-99', course: 'b2', title: 'Proov', lessons: { 'b1b2-071': { kind: 'lesson', n: 71, sheets: { discover: { meta: { level: 'B2', phase: 'discover', methodV5: true }, blocks } } } } });
  const b2codes = (blocks) => codes(lesson(blocks));
  it('G4 a long reading with inference or a long listening; gaps without a bank', () => {
    expect(b2codes([B.reading('r', 'Loe.', 'Loe.', 'T', text(300), inference)])).toContain('G4-input');
    expect(b2codes([B.reading('r', 'Loe.', 'Loe.', 'T', text(450), [['Mis on pealkiri?', 'x']])])).toContain('G4-input');
    expect(b2codes([B.reading('r', 'Loe.', 'Loe.', 'T', text(450), inference)])).not.toContain('G4-input');
    const long = B.examListen('l', 'Kuula.', 'Kuula.', 'truefalse', text(420), Array.from({ length: 10 }, (_, i) => [`Väide ${i}`, true]));
    expect(b2codes([long])).not.toContain('G4-input');
    expect(b2codes([B.reading('r', 'Loe.', 'Loe.', 'T', text(450), inference), gaps('g', 9, ['a', 'b'])])).toContain('G4-bank');
  });
  it('G6 a B2 recording over a minute is not heard once', () => {
    const once = B.examListen('l', 'Kuula.', 'Kuula.', 'truefalse', text(420), [['V', true]], 'g_read', 1);
    expect(b2codes([once])).toContain('G6-plays');
  });
  it('G10 B2 writing is graded by an analytic rubric (which may then stand in the lesson)', () => {
    const letter = B.letter('w', 'Kiri.', 'Kirjuta.', '', '', [140, 180]);
    const read = B.reading('r', 'Loe.', 'Loe.', 'T', text(450), inference);
    expect(b2codes([read, letter])).toContain('G10-rubric');
    const done = b2codes([read, letter, B.rubricW2('rw')]);
    expect(done).not.toContain('G10-rubric');
    expect(done).not.toContain('G8-examrubric');
    expect(isAnalyticRubric(B.rubricW2('rw'))).toBe(true);
    expect(isAnalyticRubric(B.rubric('c', 'Kontrolli.', 'Märgi.', ['a', 'b']))).toBe(false);
  });
});

describe('G2: the old sheet norms are off for a v5 sheet', () => {
  const doc = (methodV5) => ({ meta: { level: 'B1', phase: 'practice', design: 'v2', template: 'v4', ...(methodV5 ? { methodV5: true } : {}) }, blocks: [gaps('g', 8), B.errorfix('e', 'Paranda.', 'Kirjuta terve lause.', [['Vale.', 'Õige.']])] });
  it('no 40–55 min and block count in quality.js, no ≥ 25 min drills in depth.js', () => {
    const old = [...sheetProblems(doc(false)).map((p) => p.code), ...depthProblems(doc(false)).map((p) => p.code)];
    const v5 = [...sheetProblems(doc(true)).map((p) => p.code), ...depthProblems(doc(true)).map((p) => p.code)];
    expect(old).toEqual(expect.arrayContaining(['minutes', 'length', 'thin']));
    ['minutes', 'length', 'thin', 'live-fast', 'no-sentences'].forEach((code) => expect(v5).not.toContain(code));
  });
  it('the course builder marks only the listed modules', () => {
    expect(isMethodV5({ MODULE: { id: 'a2b1-module-01', course: 'b1' } })).toBe(STRICT_V5.b1.includes('a2b1-module-01'));
  });
});

describe('hidden blocks (blocks.js hide)', () => {
  const mod = {
    MODULE: { id: 'a2b1-module-99', course: 'b1', title: 'Proov', level: 'B1', design: 'v2', template: 'v4' },
    LESSONS: { 'a2b1-099': { title: 'Proov', discover: [B.text('099_d_a', 'A', 'Tekst.'), hide(B.text('099_d_b', 'B', 'Peidus.'), 'Harjutasse')], practice: [hide(B.text('099_p_a', 'C', 'Peidus.'))] } },
  };
  it('stay in the module file but on no sheet; a phase with only hidden blocks is no sheet', () => {
    expect(mod.LESSONS['a2b1-099'].discover[1]).toMatchObject({ id: '099_d_b', hidden: true, hiddenWhy: 'Harjutasse' });
    expect(buildCourseSheet(mod, 'a2b1-099', 'discover').blocks.map((b) => b.id)).toEqual(['099_d_a']);
    expect(Object.keys(moduleSheets(mod)['a2b1-099'])).toEqual(['discover']);
  });
});

describe('the report', () => {
  it('prints blocks and minutes per sheet and the violations of a real module', () => {
    const mod = COURSE_MODULES.find((m) => m.MODULE.id === 'a2b1-module-01');
    const report = methodV5Report(mod);
    expect(report.lessons.map((l) => l.id)).toEqual(Object.keys(mod.LESSONS));
    const lines = formatMethodV5Report(report);
    expect(lines[0]).toMatch(/^a2b1-module-01/);
    expect(lines.some((l) => /a2b1-002 \[lesson\]/.test(l))).toBe(true);
    expect(V5.budget.b1.lesson).toBe(15);
  });
});
