// Design v4 „task-based” station gates (stations.js, docs/COURSE_DESIGN_STATIONS.md §7): `meta.format` on a station sheet
// switches them on; a v3 lesson keeps the old rules. A small lesson that passes; each test breaks one thing.
import { describe, expect, it } from 'vitest';
import { B, teach } from './blocks.js';
import { exitCheck, purpose, station } from './stationBlocks.js';
import { ST, lessonStationProblems, stationProblems, teacherPage } from './stations.js';
import { harnoTimedMinutes, isHarnoTimedSheet, sheetMinutes } from '../../../worksheet-studio/didactics/timeEstimate.js';
import { depthProblems } from '../../../worksheet-studio/didactics/depth.js';

const P = 'Sinu naaber küsib nõu ja vajab vastust täna õhtul.';
function lesson({ exit = true, page = true, extra = false } = {}) {
  return {
    discover: [
      station(B.text('x_d_card', 'Olukord', 'Naaber küsib, millal tuleb äike.'), 1, 10),
      purpose(B.choice('x_d_choice', 'Vali.', 'Vali õige vastus.', [['Kas täna sajab vihma õhtul?', 'jah', 'ei', 'võib-olla'], ['Kas homme on palav päev?', 'ei', 'jah', 'võib-olla'], ['Kas tuul tugevneb õhtuks?', 'jah', 'ei', 'võib-olla'], ['Kas öösel tuleb äike?', 'ei', 'jah', 'võib-olla'], ['Kas pühapäeval sajab rahet?', 'ei', 'jah', 'võib-olla']]), P),
      station(B.text('x_d_card2', 'Arvamus', 'Mida sina arvad ilmast?'), 2, 10),
      teach(purpose(B.speaking('x_d_talk', 'Räägi.', 'Räägi oma arvamus.', ['Mis ilm sulle meeldib?'], [120, 180]), P), 'Üks-ühele: õpetaja on naaber.'),
    ],
    practice: [
      station(purpose(B.transformation('x_p_trans', 'Muuda.', 'Kirjuta ümber.', [['Õhtul on jahedam kui päeval täna.', 'läheb', 'Õhtul läheb jahedamaks.'], ['Pärastlõunal tuleb palju pilvi taevasse.', 'läheb', 'Pärastlõunal läheb pilviseks.'], ['Homme on tuul tugevam kui täna.', 'muutub', 'Homme muutub ilm tuuliseks.'], ['Õhtuks on kümme kraadi sooja ainult.', 'langeb', 'Õhtuks langeb temperatuur kümne kraadini.'], ['Meteoroloogid ootavad homseks äikest kindlasti.', 'oodatakse', 'Homseks oodatakse äikest.']]), P), 3, 10),
      ...(extra ? [station(B.text('x_p_more', 'Veel', 'Loe ilmateadet.'), 4, 10)] : []),
    ],
    transfer: [
      station(B.text('x_t_card', 'Otsus', 'Otsusta, millal minna.'), extra ? 5 : 4, 15, { final: 'decide' }),
      teach(purpose(B.rolecards('x_t_role', 'Leppige kokku.', 'A ja B lepivad kokku.', 'Sa tead ilma.', 'Sa tahad minna kell üks.', ['Äpi järgi…'], ['Aga…']), P), 'Üks-ühele: õpetaja on B.'),
      ...(exit ? [
        exitCheck(purpose(B.gaps('x_t_exit', 'Kontrolli end.', 'Kirjuta sõna õiges vormis.', ['Täna on õues väga [külm] ilm. (külm)', 'Homme [sajab] terve päeva vihma. (sadama)']), P)),
        purpose(B.selfcheck('x_t_self', ['Ma oskan ilmast rääkida.'], 'Tehtud', 'Ma oskan …'), P),
      ] : []),
    ],
    teacherPage: {
      goal: 'Ученик понимает прогноз и принимает решение.', core: [1, 3, extra ? 5 : 4], alt: 2, short: 'Станция 1 → станция 4.', errors: ['läheb jahe → läheb jahedaks', 'oodatakse äike → äikest'],
      ...(page ? { hook: 'Küsi: mis ilm täna on?', plan: ['0–10 jaam 1', '10–20 jaam 2', '20–30 jaam 3', '30–45 jaam 4'], sources: 'ilmateenistus.ee' } : {}),
    },
  };
}
const sheets = (l, extra = { format: 'facts' }) => {
  const page = teacherPage(l);
  return Object.fromEntries(['discover', 'practice', 'transfer'].map((phase) => [phase, { meta: { design: 'v3-stations', level: 'B1', phase, teacherPage: page, ...extra }, blocks: l[phase] }]));
};
const codes = (problems) => problems.map((p) => p.code);

describe('design v4 task-based station gates', () => {
  it('passes a v4 lesson: 4 stations, an exit check of 2 items and one self-check on Kasuta, the v4 teacher page', () => {
    expect(codes(lessonStationProblems('x', sheets(lesson())))).toEqual([]);
  });

  it('keeps a v3 lesson on the old rules: there the 2-item exit check is a short closed task', () => {
    expect(codes(lessonStationProblems('x', sheets(lesson(), {})))).toContain('st-items');
  });

  it('wants exactly 4 stations', () => {
    expect(codes(lessonStationProblems('x', sheets(lesson({ extra: true }))))).toContain('st-stations');
  });

  it('wants the exit check and the self-check', () => {
    expect(codes(lessonStationProblems('x', sheets(lesson({ exit: false }))))).toContain('st-exit');
  });

  it('wants the hook, the minute plan and the answer sources on the teacher page', () => {
    expect(codes(lessonStationProblems('x', sheets(lesson({ page: false }))))).toContain('st-teacher');
  });

  it('allows one self-check a v4 lesson (a v3 module keeps ≤ 1 a module) and caps the stations at 75 minutes', () => {
    const two = { a: sheets(lesson()), b: sheets(lesson()) };
    expect(codes(stationProblems(two))).not.toContain('st-selfcheck');
    expect(codes(stationProblems({ a: sheets(lesson(), {}), b: sheets(lesson(), {}) }))).toContain('st-selfcheck');
    expect(ST.taskMinutes).toBe(75);
    expect(teacherPage(lesson()).totalMinutes).toBeLessThanOrEqual(ST.taskMinutes);
  });

  it('times a v4 exam sheet by its Harno part headers; an older exam sheet keeps the block estimate', () => {
    const blocks = [
      B.tip('e_d_how', 'Eksam', 'Lugemine kestab 45 minutit.'),
      B.choice('e_d_lang', 'Keeleosa.', 'Vali õige vorm.', [['Pean …', 'minema', 'minna'], ['Tuleb …', 'minna', 'minema'], ['Ei tohi …', 'minna', 'minema'], ['Hakkan …', 'minema', 'minna'], ['Võid …', 'minna', 'minema']]),
      { ...B.examPart('e_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4 }), goal: 'g_read' },
      B.choice('e_d_mc', 'Osa 1.', 'Vali õige vastus.', [['Mis on teksti mõte?', 'küsi üle', 'ära küsi', 'oota'], ['Kes aitab?', 'apteeker', 'naaber', 'keegi'], ['Millal?', 'kohe', 'homme', 'kunagi'], ['Kus?', 'jaamas', 'kodus', 'tööl'], ['Miks?', 'tõend', 'hääl', 'raha']]),
    ];
    const v4 = { meta: { format: 'exam', assessment: true, phase: 'discover', level: 'B1+', template: 'v4' }, blocks };
    const old = { meta: { assessment: true, phase: 'discover', level: 'B1+', template: 'v4' }, blocks };
    expect(isHarnoTimedSheet(v4)).toBe(true);
    expect(isHarnoTimedSheet(old)).toBe(false);
    // the header's 45 minutes + the estimate of the blocks before it (the intro and the language part)
    expect(harnoTimedMinutes(v4)).toBeGreaterThan(45);
    expect(sheetMinutes(v4)).toBeGreaterThanOrEqual(45);
    expect(sheetMinutes(old)).toBeLessThan(20);
    expect(depthProblems(v4).map((p) => p.code)).not.toContain('thin');
    expect(depthProblems(old).map((p) => p.code)).toContain('thin');
  });
});
