import { describe, expect, it } from 'vitest';
import { B, teach } from './blocks.js';
import { FINAL_KINDS, NOT_TASKS, purpose, station } from './stationBlocks.js';
import { ST, closedItems, lessonStationProblems, stationProblems, stationsOf, teacherPage, teacherPageText } from './stations.js';
import { sheetProblems } from './quality.js';
import { BLOCKS } from '../../../worksheet-studio/engine/registry.js';
import { depthProblems } from '../../../worksheet-studio/didactics/depth.js';
import { levelProblems } from '../../../worksheet-studio/didactics/gates.js';
import { COURSE_MODULES, buildCourseSheet, moduleSheets } from './registry.js';

// a small station lesson that passes every station rule; each test breaks one thing
const words = (n) => Array.from({ length: n }, (_, i) => `sõna${i}`).join(' ');
const P = 'Sinu naaber küsib nõu ja vajab vastust täna õhtul.';
function lesson(over = {}) {
  const base = {
    discover: [
      station(B.text('x_d_card', 'Olukord', 'Naaber küsib, millal tuleb äike.'), 1, 10),
      purpose(B.choice('x_d_choice', 'Vali.', 'Vali õige vastus.', [['Kas täna sajab vihma õhtul?', 'jah', 'ei', 'võib-olla'], ['Kas homme on palav päev?', 'ei', 'jah', 'võib-olla'], ['Kas tuul tugevneb õhtuks?', 'jah', 'ei', 'võib-olla'], ['Kas öösel tuleb äike?', 'ei', 'jah', 'võib-olla'], ['Kas pühapäeval sajab rahet?', 'ei', 'jah', 'võib-olla']]), P),
      station(B.text('x_d_card2', 'Arvamus', 'Mida sina arvad ilmast?'), 2, 10),
      teach(purpose(B.speaking('x_d_talk', 'Räägi.', 'Räägi oma arvamus.', ['Mis ilm sulle meeldib?'], [120, 180]), P), 'Üks-ühele: õpetaja on naaber.'),
    ],
    practice: [
      station(purpose(B.transformation('x_p_trans', 'Muuda.', 'Kirjuta ümber.', [['Õhtul on jahedam kui päeval täna.', 'läheb', 'Õhtul läheb jahedamaks.'], ['Pärastlõunal tuleb palju pilvi taevasse.', 'läheb', 'Pärastlõunal läheb pilviseks.'], ['Homme on tuul tugevam kui täna.', 'muutub', 'Homme muutub ilm tuuliseks.'], ['Õhtuks on kümme kraadi sooja ainult.', 'langeb', 'Õhtuks langeb temperatuur kümne kraadini.'], ['Meteoroloogid ootavad homseks äikest kindlasti.', 'oodatakse', 'Homseks oodatakse äikest.']]), P), 3, 10),
    ],
    transfer: [
      station(B.text('x_t_card', 'Otsus', 'Otsusta, millal minna.'), 4, 15, { final: 'decide' }),
      teach(purpose(B.rolecards('x_t_role', 'Leppige kokku.', 'A ja B lepivad kokku.', 'Sa tead ilma.', 'Sa tahad minna kell üks.', ['Äpi järgi…'], ['Aga…']), P), 'Üks-ühele: õpetaja on B.'),
    ],
    teacherPage: { goal: 'Ученик понимает прогноз и принимает решение.', core: [1, 3, 4], alt: 2, short: 'Станция 1 → станция 4.', errors: ['läheb jahe → läheb jahedaks', 'oodatakse äike → äikest'] },
  };
  return { ...base, ...over };
}
// the lesson as built sheets: meta.design marks the station lesson, the teacher page sits on every sheet
function sheets(l = lesson(), extra = {}) {
  const page = teacherPage(l);
  return Object.fromEntries(['discover', 'practice', 'transfer'].map((phase) => [phase, { meta: { design: 'v3-stations', level: 'B1', phase, teacherPage: page, ...extra }, blocks: l[phase] }]));
}
const codes = (problems) => problems.map((p) => p.code);

describe('station builders (stationBlocks.js)', () => {
  it('marks the station on its first block and shows number, title and minutes', () => {
    const b = station(B.text('a', 'Raadio', 'Kuula.'), 2, 12);
    expect(b.data.heading).toBe('Jaam 2 · Raadio · 12 min');
    expect(b.data.station).toEqual({ n: 2, title: 'Raadio', minutes: 12 });
    const t = station(B.choice('c', 'Vali õige.', 'Vali.', [['a', 'b', 'c', 'd']]), 1, 8);
    expect(t.data.title).toBe('Jaam 1 · Vali õige · 8 min');
  });

  it('prints the fallback card of a dependent station where the learner reads it', () => {
    const card = station(B.text('a', 'Kõne', 'Helista.'), 6, 15, { needs: { from: 5, card: 'kask kukkus katusele' } });
    expect(card.data.text).toMatch(/Kui jätsid jaama 5 vahele, kasuta seda kaarti:\*\* kask kukkus katusele$/);
    const task = station(B.speaking('s', 'Räägi.', 'Räägi.', ['?'], [60, 90]), 3, 10, { needs: { from: 2, card: 'nimekiri' } });
    expect(task.data.instruction).toMatch(/Kui jätsid jaama 2 vahele/);
  });

  it('refuses a wrong number, an unknown final kind or a dependency without a card', () => {
    expect(() => station(B.text('a', 'x', 'y'), 0, 10)).toThrow(/jaama number/);
    expect(() => station(B.text('a', 'x', 'y'), 1, 10, { final: 'sing' })).toThrow(/tundmatu/);
    expect(() => station(B.text('a', 'x', 'y'), 2, 10, { needs: { from: 1 } })).toThrow(/asenduskaarti/);
    expect(Object.keys(FINAL_KINDS)).toEqual(['decide', 'plan', 'complain', 'advise', 'explain', 'negotiate', 'present']);
  });

  it('puts the purpose line before the instruction and only on tasks', () => {
    const b = purpose(B.speaking('s', 'Räägi.', 'Vasta küsimustele.', ['?'], [60, 90]), 'Kolleeg küsib nõu ja ostab selle järgi riided.');
    expect(b.data.purpose).toBe('Kolleeg küsib nõu ja ostab selle järgi riided.');
    expect(b.data.instruction).toBe('*Kolleeg küsib nõu ja ostab selle järgi riided.* Vasta küsimustele.');
    expect(() => purpose(B.text('t', 'x', 'y'), 'midagi')).toThrow(/ülesande omadus/);
  });

  it('knows the same non-task blocks as the engine (the module files stay node-importable)', () => {
    const engine = Object.values(BLOCKS).filter((d) => !d.task).map((d) => d.type).sort();
    expect([...NOT_TASKS].sort()).toEqual(engine);
  });
});

describe('station gates (stations.js)', () => {
  it('a good station lesson has no problem', () => {
    expect(lessonStationProblems('x', sheets())).toEqual([]);
    expect(stationsOf(sheets()).map((s) => [s.n, s.phase, s.minutes])).toEqual([[1, 'discover', 10], [2, 'discover', 10], [3, 'practice', 10], [4, 'transfer', 15]]);
  });

  it('counts 4–6 stations, numbered in order, and every sheet starts with one', () => {
    const l = lesson();
    expect(codes(lessonStationProblems('x', sheets({ ...l, practice: [], transfer: l.transfer })))).toContain('st-stations');
    const orphan = lesson({ practice: [B.text('loose', 'x', 'y'), ...lesson().practice] });
    expect(lessonStationProblems('x', sheets(orphan)).map((p) => p.text).join()).toMatch(/loose: plokk enne lehe esimest jaama/);
  });

  it('allows at most one dependency, on the same sheet, earlier, with its card printed', () => {
    const l = lesson();
    const two = lesson({ discover: [l.discover[0], l.discover[1], station(B.text('x_d_card2', 'Arvamus', 'Mida?'), 2, 10, { needs: { from: 1, card: 'kaart' } }), l.discover[3]],
      transfer: [station(B.text('x_t_card', 'Otsus', 'Otsusta.'), 4, 15, { final: 'decide', needs: { from: 3, card: 'kaart' } }), l.transfer[1]] });
    const out = lessonStationProblems('x', sheets(two));
    expect(out.filter((p) => p.code === 'st-depends').map((p) => p.text).join(' | ')).toMatch(/2 jaama sõltub.*teise lehe jaamast 3/);
    const silent = lesson({ discover: [l.discover[0], l.discover[1], { ...l.discover[2], data: { ...l.discover[2].data, station: { ...l.discover[2].data.station, needs: { from: 1, card: 'k' } } } }, l.discover[3]] });
    expect(lessonStationProblems('x', sheets(silent)).map((p) => p.text).join()).toMatch(/asenduskaart/);
  });

  it('wants a purpose on every task, 5–8 items in a closed task and one closed task per station', () => {
    const l = lesson();
    const noPurpose = lesson({ discover: [l.discover[0], { ...l.discover[1], data: { ...l.discover[1].data, purpose: '' } }, l.discover[2], l.discover[3]] });
    expect(codes(lessonStationProblems('x', sheets(noPurpose)))).toContain('st-purpose');
    const q = ['Kas täna sajab vihma õhtul?', 'jah', 'ei', 'võib-olla'];
    const long = purpose(B.choice('x_d_choice', 'Vali.', 'Vali.', Array(10).fill(q)), P);
    expect(codes(lessonStationProblems('x', sheets(lesson({ discover: [l.discover[0], long, l.discover[2], l.discover[3]] }))))).toContain('st-items');
    const second = purpose(B.truefalse('x_d_tf', 'Õige?', 'Märgi.', Array(5).fill(['Täna on ilus ilm õues.', true])), P);
    expect(codes(lessonStationProblems('x', sheets(lesson({ discover: [l.discover[0], l.discover[1], second, l.discover[2], l.discover[3]] }))))).toContain('st-closed');
    expect(closedItems(l.discover[1])).toBe(5);
  });

  it('keeps stations 8–15 min, inputs short and the lesson within 16 blocks', () => {
    const l = lesson();
    const slow = lesson({ practice: [{ ...l.practice[0], data: { ...l.practice[0].data, station: { ...l.practice[0].data.station, minutes: 25 } } }] });
    expect(codes(lessonStationProblems('x', sheets(slow)))).toContain('st-minutes');
    const longText = lesson({ discover: [station(B.text('x_d_card', 'Olukord', words(150)), 1, 10), ...l.discover.slice(1)] });
    expect(codes(lessonStationProblems('x', sheets(longText)))).toContain('st-input');
    const many = lesson({ transfer: [...l.transfer, ...Array.from({ length: 12 }, (_, i) => B.tip(`x_t_tip${i}`, 'Vihje', 'x'))] });
    expect(codes(lessonStationProblems('x', sheets(many)))).toContain('st-blocks');
    expect(ST.blocks).toBe(16);
  });

  it('refuses group work and a monologue said again (the lesson is one-to-one)', () => {
    const l = lesson();
    const group = teach(purpose(B.speaking('x_d_talk', 'Küsitlus.', 'Küsi kolmelt kaaslaselt, mida nad arvavad.', ['?'], [120, 180]), P), 'Üks-ühele: …');
    expect(codes(lessonStationProblems('x', sheets(lesson({ discover: [...l.discover.slice(0, 3), group] }))))).toContain('st-group');
    const again = teach(purpose(B.speaking('x_d_talk', 'Räägi.', 'Räägi sama lugu kaks korda: kolme ja kahe minutiga.', ['?'], [120, 180]), P), 'Üks-ühele: …');
    expect(codes(lessonStationProblems('x', sheets(lesson({ discover: [...l.discover.slice(0, 3), again] }))))).toContain('st-repeat');
  });

  it('needs one final station on Kasuta and a complete teacher page', () => {
    const l = lesson();
    const noFinal = lesson({ transfer: [station(B.text('x_t_card', 'Otsus', 'Otsusta.'), 4, 15), l.transfer[1]] });
    expect(codes(lessonStationProblems('x', sheets(noFinal)))).toContain('st-final');
    const noPage = sheets(lesson({ teacherPage: undefined }));
    expect(lessonStationProblems('x', noPage).map((p) => p.text).join()).toMatch(/õpetaja leht puudub/);
    const thin = sheets(lesson({ teacherPage: { goal: 'Цель.', core: [1, 4], alt: 4, short: '', errors: ['x'] } }));
    const text = lessonStationProblems('x', thin).filter((p) => p.code === 'st-teacher').map((p) => p.text).join(' | ');
    expect(text).toMatch(/põhitee on 3/);
    expect(text).toMatch(/alternatiivne jaam/);
    expect(text).toMatch(/kui aega on vähe/);
    expect(text).toMatch(/tüüpvigu 1/);
  });

  it('module: openings and final kinds differ, one self-check a module', () => {
    const a = sheets();
    const b = sheets();
    const out = stationProblems({ 'x-1': a, 'x-2': b });
    expect(codes(out)).toEqual(expect.arrayContaining(['st-opening', 'st-final-kind']));
    const check = { ...a, transfer: { ...a.transfer, blocks: [...a.transfer.blocks, B.selfcheck('s1', ['Ma oskan.'], 'x')] } };
    const check2 = { ...a, transfer: { ...a.transfer, blocks: [...a.transfer.blocks, B.selfcheck('s2', ['Ma oskan.'], 'x')] } };
    expect(codes(stationProblems({ 'x-1': check, 'x-3': check2 }))).toContain('st-selfcheck');
  });

  it('is opt-in: a v2 / v4 module gets none of the station rules', () => {
    const v4 = Object.fromEntries(Object.entries(sheets()).map(([p, d]) => [p, { ...d, meta: { ...d.meta, design: 'v2', template: 'v4' } }]));
    expect(stationProblems({ 'x-1': v4 })).toEqual([]);
  });
});

describe('old sheet rules are skipped only for station sheets', () => {
  const doc = sheets().practice;
  const v4 = { ...doc, meta: { ...doc.meta, design: 'v2', template: 'v4' } };
  it('quality.js: no sheet-length, minutes, variety or Kasuta-shape rule on a station sheet', () => {
    const own = codes(sheetProblems(doc));
    ['length', 'minutes', 'variety', 'end', 'transfer-situation', 'transfer-use', 'transfer-rubric', 'v4-use'].forEach((c) => expect(own).not.toContain(c));
    expect(codes(sheetProblems(v4))).toEqual(expect.arrayContaining(['length', 'minutes', 'variety']));
    expect(codes(sheetProblems(sheets().transfer))).not.toContain('transfer-rubric');
    expect(codes(sheetProblems({ ...sheets().transfer, meta: { ...sheets().transfer.meta, design: 'v2', template: 'v4' } }))).toContain('transfer-rubric');
  });
  it('the one-to-one note of pair work is still required', () => {
    const t = sheets().transfer;
    const bare = { ...t, blocks: t.blocks.map((b) => (b.type === 'rolecards' ? { ...b, data: { ...b.data, teacher: '' } } : b)) };
    expect(codes(sheetProblems(bare))).toContain('v4-one-to-one');
  });
  it('depth.js: 5 items are enough and the exercise minutes are not a sheet norm', () => {
    expect(codes(depthProblems(doc))).toEqual([]);
    expect(codes(depthProblems(v4))).toEqual(expect.arrayContaining(['short-tasks', 'thin']));
  });
  it('gates.js: no 140-word text per sheet (the station inputs are short on purpose)', () => {
    const d = sheets().discover;
    expect(codes(levelProblems(d))).not.toContain('text-short');
    expect(codes(levelProblems({ ...d, meta: { ...d.meta, design: 'v2' } }))).toContain('text-short');
  });
});

describe('the pilot module (b1 module 12)', () => {
  const mod = COURSE_MODULES.find((m) => m.MODULE.id === 'a2b1-module-12');
  const built = moduleSheets(mod);
  it('is a station module; its mock exam keeps design v2 and template v4', () => {
    expect(mod.MODULE.design).toBe('v3-stations');
    expect(buildCourseSheet(mod, 'a2b1-056', 'discover').meta).toMatchObject({ design: 'v3-stations' });
    expect(buildCourseSheet(mod, 'a2b1-056', 'discover').meta.template).toBeUndefined();
    expect(buildCourseSheet(mod, 'a2b1-060', 'practice').meta).toMatchObject({ design: 'v2', template: 'v4', assessment: true });
    expect(buildCourseSheet(mod, 'a2b1-060', 'practice').meta.teacherPage).toBeUndefined();
  });
  it('passes every station gate', () => {
    expect(stationProblems(built)).toEqual([]);
  });
  it('has 4–6 stations a lesson, one dependency in the module, four different final tasks', () => {
    const ids = ['a2b1-056', 'a2b1-057', 'a2b1-058', 'a2b1-059'];
    const lists = ids.map((id) => stationsOf(built[id]));
    lists.forEach((list) => expect(list.length).toBeGreaterThanOrEqual(4));
    expect(lists.flat().filter((s) => s.needs).length).toBe(1);
    expect(lists.map((list) => list.find((s) => s.final).final)).toEqual(['decide', 'explain', 'complain', 'negotiate']);
  });
  it('gives the teacher one page per lesson: core path of three stations ≈ 45 min, an alternative, errors', () => {
    const page = built['a2b1-058'].discover.meta.teacherPage;
    expect(page.core).toHaveLength(3);
    expect(page.coreMinutes).toBeGreaterThanOrEqual(35);
    expect(page.stations.find((s) => s.n === 6)).toMatchObject({ final: 'complain', needs: 5, core: true });
    expect(teacherPageText(page, 'a2b1-058')).toMatch(/Ядро на 45 минут: станции 1, 5, 6/);
  });
});
