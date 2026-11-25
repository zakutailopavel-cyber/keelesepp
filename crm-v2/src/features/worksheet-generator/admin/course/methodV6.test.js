import fs from 'node:fs';
import { COURSE_MODULES } from './registry.js';
import { B, tag, teach } from './blocks.js';
import { exitCheck, homeTask, purpose, station } from './stationBlocks.js';
import { methodV5Input } from './methodV5.js';
import {
  V6, GATES_V6, boldForms, formItems, formatMethodV6Report, mainTaskType, methodV6Problems, methodV6Report, wordLimit,
} from './methodV6.js';
import STRICT_V5 from './strictModulesV5.json';
import STRICT_V6 from './strictModulesV6.json';
import BASELINE from './methodV6Baseline.json';

// Methodology v6 (docs/METHODOLOGY_V6.md): a module listed in strictModulesV6.json passes G14–G25 (and, being a v5
// module too, G1–G13 in methodV5.test.js). The modules rewritten under v5 carry their retrofit backlog in
// methodV6Baseline.json: the count may fall, never rise. Before switching a module on:
//   node tools/course-audit/method-v6.mjs --course b1 --module 13

// the EKI level forms for the lexical profile (G22), read as the runner reads them (cwd = crm-v2)
const FORMS = Object.fromEntries(['A1', 'A2', 'B1', 'B2'].map((l) => [l, new Set(String(JSON.parse(fs.readFileSync(`src/features/worksheet-studio/didactics/levelForms.${l}.json`, 'utf8')).forms || '').split('\n'))]));

describe('strictModulesV6.json', () => {
  it('lists A2, B1 and B2 modules of the right course that are v5 modules too', () => {
    expect(Object.keys(STRICT_V6).sort()).toEqual(['a2', 'b1', 'b2']);
    for (const course of ['a2', 'b1', 'b2']) {
      for (const id of STRICT_V6[course]) {
        const mod = COURSE_MODULES.find((m) => m.MODULE.id === id);
        expect(mod, `${id} is not a course module`).toBeTruthy();
        expect(mod.MODULE.course).toBe(course);
        expect(STRICT_V5[course], `${id}: a v6 module is also listed in strictModulesV5.json`).toContain(id);
      }
    }
  });
  it('every strict module passes the v6 gates G14–G25', () => {
    const ids = Object.values(STRICT_V6).flat();
    const problems = COURSE_MODULES.filter((m) => ids.includes(m.MODULE.id))
      .flatMap((m) => methodV6Problems(methodV5Input(m), { forms: FORMS }).map((p) => `${m.MODULE.id} ${p.lessonId} ${p.phase} ${p.gate}: ${p.text}`));
    expect(problems).toEqual([]);
  });
});

describe('methodV6Baseline.json: the retrofit backlog of the v5 modules', () => {
  const listed = COURSE_MODULES.filter((m) => BASELINE[m.MODULE.id] && !Object.values(STRICT_V6).flat().includes(m.MODULE.id));
  it('covers the v5 modules it was written for', () => {
    expect(Object.keys(BASELINE).length).toBeGreaterThan(0);
    Object.keys(BASELINE).forEach((id) => expect(COURSE_MODULES.some((m) => m.MODULE.id === id), id).toBe(true));
  });
  it.each(listed.map((m) => [m.MODULE.id, m]))('%s does not grow (lower it with method-v6.mjs --retrofit --write-baseline)', (id, m) => {
    const { total } = methodV6Report(m, { forms: FORMS });
    expect(total, `${id}: ${total} v6 violations, baseline ${BASELINE[id].total}`).toBeLessThanOrEqual(BASELINE[id].total);
  });
});

describe('helpers', () => {
  it('reads the word limit of an instruction', () => {
    expect(wordLimit('Vasta lühidalt: üks-kaks sõna või arv.')).toBe(2);
    expect(wordLimit('Kirjuta lünka üks sõna.')).toBe(1);
    expect(wordLimit('Vasta 1–3 sõnaga.')).toBe(3);
    expect(wordLimit('Kuula ja vasta.')).toBe(null);
  });
  it('reads the bold forms of a rule box, not the grammar terms', () => {
    expect(boldForms(B.notice('n', 'Märka.', ['**tugeva tuule tõttu** · **seepärast** · **osasihitis** · **-ks**:']))).toEqual(['tugeva tuule tõttu', 'seepärast', '-ks']);
  });
  it('reads the items of a form task', () => {
    expect(formItems(B.gaps('g', 'Lüngad.', 'Kirjuta.', ['Ma ostsin [tomateid|tomatid] (tomatid).']))).toEqual([{ answer: ['tomateid', 'tomatid'], prompt: 'Ma ostsin   (tomatid).' }]);
  });
  it('infers the main-task type', () => {
    expect(mainTaskType(tag(B.speaking('s', 'R.', 'R.', ['?'], [60, 90]), { task: 'S04' }))).toBe('phone');
    expect(mainTaskType(B.letter('l', 'K.', 'K.', '', '', [40, 60]))).toBe('message');
    expect(mainTaskType({ ...B.letter('l', 'K.', 'K.', '', '', [40, 60]), data: { taskType: 'mediation' } })).toBe('mediation');
  });
});

// ---- a small synthetic module that passes every v6 gate, then one change per gate --------------------------------
const sheet = (phase, blocks, meta = {}) => ({ meta: { level: 'B1', phase, methodV5: true, ...meta }, blocks });
const text = (extra = '') => `Öösel oli torm. Kask kukkus katusele. ${extra} Tugeva tuule tõttu ei olnud elektrit, seepärast jäid poed kinni.`;
const vocab = (id, review = ['torm', 'kask', 'katus']) => ({ ...B.vocab(id, 'Tunni sõnad.', ['tõttu — из-за', 'seepärast — поэтому']), data: { ...B.vocab(id, 'Tunni sõnad.', ['tõttu — из-за', 'seepärast — поэтому']).data, review } });
const pron = (id) => ({ ...B.speaking(id, 'Hääldusnurk.', 'Kuula ja korda: sada, saada, saaada.', ['sada / saada'], [20, 40]), data: { ...B.speaking(id, 'Hääldusnurk.', 'Kuula ja korda: sada, saada, saaada.', ['sada / saada'], [20, 40]).data, pronunciation: 'välted' } });
const main = (id, type) => {
  const b = tag(teach(B.phoneCards(id, 'Helista.', 'Helista kindlustusse ja lepi kokku.', 'Torm murdis katuse.', ['Klient', ['Küsi.']], ['Teenindaja', ['Vasta.']], [120, 240]), 'Varjatud info: maja on remondis.'), { task: 'S04', main: true });
  return { ...b, data: { ...b.data, taskType: type, support: ['Ma helistan, sest …', 'Tormi tõttu …'], stretch: 'Lisa üks tingimus: kui …, siis …' } };
};
const exitTalk = (id) => exitCheck(B.speaking(id, 'Kontrolli end.', 'Ütle 30 sekundiga, mis juhtus ja miks.', ['Mis juhtus?'], [20, 40]));
const self = (id) => ({ ...B.selfcheck(id, ['Ma helistan.'], 'Tehtud'), data: { ...B.selfcheck(id, ['Ma helistan.'], 'Tehtud').data, criteria: ['põhjus', 'tagajärg', 'kokkulepe'], evidence: true } });
const home = (id) => homeTask(B.writing(id, 'Kodus.', 'Kirjuta 5 lauset. Siis Harjuta → moodul 15.', [5, 7]));
const peer = (id) => ({ ...B.text(id, 'Kaaslasele', 'Saada oma sõnum kaaslasele. Kaaslane vastab ühe küsimusega.'), data: { heading: 'Kaaslasele', text: 'Saada oma sõnum kaaslasele. Kaaslane vastab ühe küsimusega.', peerReply: true, mediaLog: true } });
const lesson = (n, type, { minutes = 10 } = {}) => {
  const id = String(n).padStart(3, '0');
  return { kind: 'lesson', n, sheets: {
    discover: sheet('discover', [vocab(`${id}_d_vocab`), station(B.reading(`${id}_d_read`, 'Loe.', 'Loe ja vasta ühe-kahe sõnaga.', 'Torm', text(), [['Mis kukkus?', 'kask']]), 1, minutes), pron(`${id}_d_pron`)]),
    practice: sheet('practice', [B.notice(`${id}_p_rule`, 'Reegel.', ['**tõttu** · **seepärast**']), station(B.gaps(`${id}_p_gaps`, 'Lüngad.', 'Kirjuta sobiv sõna.', ['Tuule [tõttu] jäi buss hiljaks (põhjus).', 'Tee oli kinni, [seepärast] jäime koju (tagajärg).']), 2, 15)]),
    transfer: sheet('transfer', [station(main(`${id}_t_call`, type), 3, 25), exitTalk(`${id}_t_exit`), self(`${id}_t_self`), home(`${id}_t_home`), peer(`${id}_t_peer`)]),
  } };
};
function cleanB1() {
  return {
    id: 'a2b1-module-15', course: 'b1', title: 'Proov',
    lessons: {
      'a2b1-071': lesson(71, 'phone', { minutes: 8 }),
      'a2b1-072': lesson(72, 'message', { minutes: 10 }),
      'a2b1-073': lesson(73, 'jigsaw', { minutes: 12 }),
      'a2b1-074': lesson(74, 'phone', { minutes: 14 }),
      'a2b1-075': { kind: 'control', n: 75, sheets: { discover: sheet('discover', [
        B.text('075_d_intro', 'Kontroll', 'Harno: alates 60 % ja ükski osa ei tohi olla 0 punkti. KeeleSepp: 70 % / 80 %.'),
        B.examPart('075_d_part', 'R', { points: 2, tasks: 1 }),
        B.truefalse('075_d_tf', 'Loe.', 'Õige või vale?', [['Torm oli öösel.', true], ['Kask kukkus autole.', false]]),
        B.examPart('075_t_wpart', 'W', { points: 12, tasks: 1 }),
        B.examWriting('075_t_w', 'Kirjuta.', 'Kirjuta kiri.', 'kiri', { situation: 'Kiri.', words: [60, 90] }),
        B.rubricW2('075_t_r'),
      ], { assessment: true }) } },
    },
  };
}
const codes = (input, opts) => methodV6Problems(input, opts).map((p) => p.code);
const edit = (fn, opts) => { const input = cleanB1(); fn(input.lessons, input); return codes(input, opts); };
const blockOf = (lessons, id, phase, blockId) => lessons[id].sheets[phase].blocks.find((b) => b.id === blockId);

describe('the v6 gates on a synthetic B1 module', () => {
  it('a clean v6 module has no problem', () => {
    expect(methodV6Problems(cleanB1())).toEqual([]);
  });
  it('G14 the exit check is a performance of the main skill, with at most one form item', () => {
    expect(edit((l) => { l['a2b1-071'].sheets.transfer.blocks.splice(1, 1); })).toContain('G14-none');
    expect(edit((l) => { l['a2b1-071'].sheets.transfer.blocks[1] = exitCheck(B.gaps('071_t_exit', 'Kontrolli.', 'Kirjuta.', ['Tuule [tõttu] (põhjus).', 'Ta [läks] (minema).', '[Seepärast] (tagajärg).'])); })).toContain('G14-forms');
    expect(edit((l) => { l['a2b1-071'].sheets.transfer.blocks[1] = exitCheck(B.writing('071_t_exit', 'Kontrolli.', 'Kirjuta üks lause.', [1, 1])); })).toContain('G14-skill');
    expect(edit((l) => { l['a2b1-071'].sheets.transfer.blocks.splice(2, 0, exitCheck(B.gaps('071_t_ex2', 'Vorm.', 'Kirjuta.', ['Tuule [tõttu] (põhjus).', 'Ta [läks] (minema).']))); })).toContain('G14-form-items');
    expect(edit((l) => { l['a2b1-071'].sheets.transfer.blocks.splice(2, 0, exitCheck(B.gaps('071_t_ex2', 'Vorm.', 'Kirjuta.', ['Tuule [tõttu] (põhjus).']))); })).not.toContain('G14-form-items');
  });
  it('G15 the form task covers ≥ 60 % of the bold forms; the hint does not give the answer', () => {
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'practice', '071_p_rule').data.lines = '**tõttu** · **seepärast** · **sest** · **kuna** · **nii et**'; })).toContain('G15-coverage');
    expect(edit((l) => { l['a2b1-071'].sheets.practice.blocks.splice(1, 1); })).toContain('G15-none');
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'practice', '071_p_gaps').data.sentences = 'Ostsin [tomatid] (tomatid).\nTuule [tõttu] (põhjus).\nTee oli kinni, [seepärast] (tagajärg).'; })).toContain('G15-hint');
  });
  it('G17 at most two lessons a module with the same main-task type; the station rhythm varies', () => {
    expect(edit((l) => { blockOf(l, 'a2b1-073', 'transfer', '073_t_call').data.taskType = 'phone'; })).toContain('G17-same');
    expect(edit((l) => ['a2b1-071', 'a2b1-072', 'a2b1-073', 'a2b1-074'].forEach((id) => { const [, b] = Object.entries(l[id].sheets.discover.blocks).find(([, x]) => x.data?.station); b.data.station.minutes = 9; }))).toContain('G17-rhythm');
  });
  it('G18 old words reused and Harjuta named in the home task', () => {
    expect(edit((l) => { blockOf(l, 'a2b1-072', 'discover', '072_d_vocab').data.review = ['lennuk', 'rong', 'buss']; })).toContain('G18-review');
    expect(edit((l) => { delete blockOf(l, 'a2b1-072', 'discover', '072_d_vocab').data.review; })).toContain('G18-review');
    expect(edit((l) => { blockOf(l, 'a2b1-072', 'transfer', '072_t_home').data.instruction = 'Kirjuta 5 lauset.'; })).toContain('G18-harjuta');
  });
  it('G19 keys fit the word limit; free rewrites are open', () => {
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'discover', '071_d_read').data.questions = 'Mis kukkus? [suur vana kask maja katusele]'; })).toContain('G19-key-length');
    const rewrite = () => B.transformation('071_p_tr', 'Ümber.', 'Ütle viisakamalt.', [['Anna raha.', 'viisakalt', 'Kas sa saaksid mulle raha anda?']]);
    expect(edit((l) => l['a2b1-071'].sheets.practice.blocks.push(rewrite()))).toContain('G19-open');
    expect(edit((l) => l['a2b1-071'].sheets.practice.blocks.push({ ...rewrite(), data: { ...rewrite().data, open: true } }))).not.toContain('G19-open');
  });
  it('G20 the points of a control part add up; open parts have descriptors', () => {
    expect(edit((l) => { blockOf(l, 'a2b1-075', 'discover', '075_d_part').data.points = 4; })).toContain('G20-sum');
    expect(edit((l) => { l['a2b1-075'].sheets.discover.blocks.pop(); })).toContain('G20-rubric');
  });
  it('G21 every control names Harno\'s no-zero rule', () => {
    expect(edit((l) => { blockOf(l, 'a2b1-075', 'discover', '075_d_intro').data.text = 'Harno: alates 60 %. KeeleSepp: 70 % / 80 %.'; })).toContain('G21-zero');
  });
  it('G22 instruction ceilings by stage and the lexical profile', () => {
    const long = 'Loe tekst läbi ja vasta küsimustele ühe-kahe sõnaga, aga enne seda räägi paarilisega, mida sa tormist tead ja mida sinu pere tormi ajal tavaliselt kodus teeb ja miks see oluline on.';
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'discover', '071_d_read').data.instruction = long; })).toContain('G22-instruction');
    // 20 words are fine for B1 041+, not for 001–040
    const mid = 'Loe tekst läbi ja vasta küsimustele ühe-kahe sõnaga, siis räägi paarilisega, mida sa tormist tead ja miks see oli.';
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'discover', '071_d_read').data.instruction = mid; })).not.toContain('G22-instruction');
    expect(edit((l) => { l['a2b1-071'].n = 21; blockOf(l, 'a2b1-071', 'discover', '071_d_read').data.instruction = mid; })).toContain('G22-instruction');
    // a purpose line printed in the instruction counts (5 + 19 words in a B1 001–040 lesson)
    expect(edit((l) => { l['a2b1-071'].n = 21; l['a2b1-071'].sheets.discover.blocks[1] = station(purpose(B.reading('071_d_read', 'Loe.', 'Loe ja vasta ühe-kahe sõnaga.', 'Torm', text(), [['Mis kukkus?', 'kask']]), 'Need sõnad ja laused on sinu kõne materjal tunni lõpus, kui sa helistad kindlustusse ja seletad, mis juhtus.'), 1, 8); })).toContain('G22-instruction');
    const known = new Set(text('üks kaks kolm neli viis kuus seitse kaheksa üheksa kümme maja auto koer kass laud tool aken uks').toLocaleLowerCase('et').split(/[^\p{L}-]+/u));
    const forms = { A1: known, A2: new Set(), B1: new Set() };
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'discover', '071_d_read').data.passage = text('üks kaks kolm neli viis kuus seitse kaheksa üheksa kümme maja auto koer kass laud tool aken uks'); }, { forms })).not.toContain('G22-lexis');
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'discover', '071_d_read').data.passage = text('üks kaks kolm neli viis kuus seitse kaheksa üheksa kümme maja auto koer kass laud tool aken uks kahjukäsitleja katkestusteade omavalitsused tekstiilijäätmed'); }, { forms })).toContain('G22-lexis');
  });
  it('G23 a pronunciation corner in every A2 / B1 lesson', () => {
    expect(edit((l) => { l['a2b1-071'].sheets.discover.blocks.pop(); })).toContain('G23-pron');
  });
  it('G24 the main task has a support card and a stretch line; the self-check has criteria and evidence', () => {
    expect(edit((l) => { delete blockOf(l, 'a2b1-071', 'transfer', '071_t_call').data.support; })).toContain('G24-support');
    expect(edit((l) => { delete blockOf(l, 'a2b1-071', 'transfer', '071_t_call').data.stretch; })).toContain('G24-stretch');
    expect(edit((l) => { delete blockOf(l, 'a2b1-071', 'transfer', '071_t_self').data.evidence; })).toContain('G24-selfcheck');
  });
  it('G25 a peer exchange and a media log a module; from module 2 the teacher is no real addressee', () => {
    const strip = (l, key) => ['a2b1-071', 'a2b1-072', 'a2b1-073', 'a2b1-074'].forEach((id) => { delete l[id].sheets.transfer.blocks[4].data[key]; });
    expect(edit((l) => strip(l, 'peerReply'))).toContain('G25-peer');
    expect(edit((l) => strip(l, 'mediaLog'))).toContain('G25-media');
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'transfer', '071_t_home').data.realAddressee = 'sinu õpetaja'; })).toContain('G25-teacher');
    expect(edit((l) => { blockOf(l, 'a2b1-071', 'transfer', '071_t_home').data.realAddressee = 'Tallinna Keskraamatukogu'; })).not.toContain('G25-teacher');
  });
});

describe('the course-specific v6 gates', () => {
  const asB2 = (input) => {
    input.course = 'b2'; input.id = 'b1b2-module-15';
    Object.values(input.lessons).forEach((l) => Object.values(l.sheets).forEach((s) => { s.meta.level = 'B2'; }));
    return input;
  };
  const b2 = (fn) => { const input = asB2(cleanB1()); fn(input.lessons); return codes(input); };
  it('G16 B2: a draft in class and „Parandatud versioon” next lesson (revisionOf)', () => {
    const letter = (id, home) => (home ? homeTask : (b) => b)(B.letter(id, 'Kiri.', 'Kirjuta kiri. Harjuta → moodul 15.', '', '', [140, 160]));
    expect(b2((l) => { l['a2b1-071'].sheets.transfer.blocks[3] = letter('071_t_home', true); })).toEqual(expect.arrayContaining(['G16-draft', 'G16-revision']));
    expect(b2((l) => {
      l['a2b1-071'].sheets.transfer.blocks[3] = letter('071_t_home', true);
      l['a2b1-071'].sheets.transfer.blocks.push(letter('071_t_draft', false));
      l['a2b1-072'].sheets.discover.blocks.push({ ...B.writing('072_d_fix', 'Parandatud versioon.', 'Kirjuta kolm märgitud lauset ümber.', [3, 3]), data: { ...B.writing('072_d_fix', 'Parandatud versioon.', 'Kirjuta kolm märgitud lauset ümber.', [3, 3]).data, revisionOf: 'a2b1-071' } });
    })).not.toEqual(expect.arrayContaining(['G16-draft']));
  });
  it('G23 is not asked of B2; B2 keeps a 25-word instruction ceiling', () => {
    expect(b2((l) => { l['a2b1-071'].sheets.discover.blocks.pop(); })).not.toContain('G23-pron');
  });
  it('G20 B2: the control is not lighter than the lessons (≥ 150 s, paraphrased gap answers)', () => {
    const listen = B.listening('075_d_listen', 'Kuula.', 'Kuula ja kirjuta.', ['Torm oli öösel ja kask kukkus.'], ['Öösel oli [torm].', 'Kukkus [kask].']);
    expect(b2((l) => { l['a2b1-075'].sheets.discover.blocks.push(listen); })).toContain('G20-level');
  });
  it('A2: 12-word instructions', () => {
    const input = cleanB1();
    input.course = 'a2'; input.id = 'a2-module-15';
    blockOf(input.lessons, 'a2b1-071', 'discover', '071_d_read').data.instruction = 'Loe tekst läbi ja vasta küsimustele ühe-kahe sõnaga, siis räägi oma paarilisega tormist.';
    expect(codes(input)).toContain('G22-instruction');
  });
});

describe('the report', () => {
  it('names every gate and counts the retrofit backlog per gate', () => {
    const mod = COURSE_MODULES.find((m) => m.MODULE.id === 'a2b1-module-12');
    const r = methodV6Report(mod);
    expect(Object.keys(r.byGate)).toEqual(Object.keys(GATES_V6));
    expect(r.total).toBe(r.problems.length);
    expect(formatMethodV6Report(r, { baseline: 1 })[0]).toMatch(/v6 järeltöö \d+ \(baseline 1\)/);
    expect(V6.coverage).toBe(0.6);
  });
});
