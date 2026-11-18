// Design v4 „task-based” station gates (stations.js, docs/COURSE_DESIGN_STATIONS.md §7): `meta.format` on a station sheet
// switches them on; a v3 lesson keeps the old rules. A small lesson that passes; each test breaks one thing.
import { describe, expect, it } from 'vitest';
import { B, tag, teach } from './blocks.js';
import { exitCheck, homeTask, purpose, station } from './stationBlocks.js';
import { ST, lessonStationProblems, stationProblems, teacherPage, v4TopicProblems } from './stations.js';
import { harnoTimedMinutes, isHarnoTimedSheet, sheetMinutes } from '../../../worksheet-studio/didactics/timeEstimate.js';
import { depthProblems } from '../../../worksheet-studio/didactics/depth.js';
import { lessonAcademicProblems, lessonRound2Problems } from './academicValue.js';
import { V4_INPUT, dialogueGaps, isHomeWriting, isListeningRow } from '../../../worksheet-studio/didactics/stations.js';
import { didacticCheck } from '../../../worksheet-studio/didactics/didacticCheck.js';
import { finalShapeProblems } from '../../../worksheet-studio/didactics/finalShape.js';

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

// §7.3 round 3 (owner OK 2026-11-17): four rules changed for v4 only; each test shows the v4 result and the unchanged v3 one
describe('design v4 gate adjustments (v3 / v2 unchanged)', () => {
  const words = (n) => `${Array.from({ length: n }, () => 'linn').join(' ')}.`;
  const meta = (format, phase) => ({ design: 'v3-stations', level: 'B1+', phase, canDo: 'Ma räägin linnast.', ...(format ? { format } : {}) });
  const doc = (format, phase, blocks) => ({ meta: meta(format, phase), blocks });

  it('1. the long writing done at home is not lesson time: a W1 corner on it has no washback in v4, but still in v3', () => {
    const letter = tag(homeTask(B.letter('y_t_letter', 'Kiri.', 'Kirjuta kiri.', 'Tere!', 'Lugupidamisega', [120, 150])), { harno: 'W1', task: 'W13', main: true });
    const make = (format) => ({
      id: 'b1b2-007', num: 7, module: 2, moduleId: 'b1b2-module-02', assessment: false, archetype: '', lead: null, canDo: 'Ma kirjutan kirja.', goals: {}, canDoGoal: 'g_use', level: 'B1+',
      stations: true, task: Boolean(format),
      sheets: { transfer: doc(format, 'transfer', [B.rolecards('y_t_role', 'Räägi.', 'Räägi.', 'A', 'B', ['a'], ['b']), letter]) },
    });
    const wash = (format) => finalShapeProblems([make(format)], { profile: 'b2' }).filter((p) => p.check === 'V12-washback');
    expect(isHomeWriting(letter)).toBe(true);
    expect(isHomeWriting(homeTask(B.speaking('y_t_home', 'Räägi.', 'Räägi.', ['?'], [60, 120])))).toBe(false);
    expect(wash('case')).toEqual([]);
    expect(wash('').length).toBe(1);
  });

  it('2. a chat without gaps is an input, not a closed task of one item', () => {
    const chat = purpose(B.dialogue('x_d_chat', 'Vestlus', 'Loe.', 'A', 'B', [['A', 'Tere!'], ['B', 'Tere.'], ['A', 'Kas vesi on ära?'], ['B', 'Jah, kella kolmeni.']]), P);
    const withChat = () => { const l = lesson(); l.discover.splice(3, 0, chat); return l; };
    expect(dialogueGaps(chat.data)).toBe(0);
    expect(codes(lessonStationProblems('x', sheets(withChat())))).not.toContain('st-items');
    expect(codes(lessonStationProblems('x', sheets(withChat(), {})))).toContain('st-items');
    const items = (format) => didacticCheck(doc(format, 'discover', [chat])).issues.filter((i) => /x_d_chat:did-items/.test(i.code));
    expect(items('facts')).toEqual([]);
    expect(items('').length).toBe(1);
  });

  it('3. a v4 lesson needs one input of ≥ 120 words or ≥ 60 s of audio besides the hook (station 1)', () => {
    const hook = station(B.text('z_d_hook', 'Konks', words(130)), 1, 10);
    const later = (n) => station(B.text('z_d_card', 'Kaart', words(n)), 2, 12);
    const audio = station(B.listening('z_p_audio', 'Kuula.', 'Kuula.', [words(115)], ['Ta [tuli].']), 3, 12);
    const av = (format, blocks) => codes(lessonAcademicProblems('z', { discover: doc(format, 'discover', blocks) }));
    const r2 = (format, blocks) => codes(lessonRound2Problems('z', { discover: doc(format, 'discover', blocks) }));
    expect(V4_INPUT).toEqual({ textWords: 120, audioWords: 110 });
    expect(av('quest', [hook, later(125)])).not.toContain('av-voice');
    expect(r2('quest', [hook, later(125)])).not.toContain('av-boltedon');
    expect(av('quest', [hook, later(100), audio])).not.toContain('av-voice');
    expect(av('quest', [hook, later(100)])).toContain('av-voice');
    expect(r2('quest', [hook, later(100)])).toContain('av-boltedon');
    // v3: the old rule (≥ 150 words at B1+) — 125 words do not pass
    expect(av('', [hook, later(125)])).toContain('av-voice');
  });

  it('4. short listening rows stay out of the sentence-length check in v4 only', () => {
    const rows = B.choice('w_d_rows', 'Kuula.', 'Märgi sõna.', [['Rida üks?', 'kurk', 'kurg', 'kark'], ['Rida kaks?', 'vaba', 'vana', 'raba'], ['Rida kolm?', 'aeg', 'aed', 'aer'], ['Rida neli?', 'nina', 'tina', 'lina'], ['Rida viis?', 'valu', 'vala', 'palu'], ['Rida kuus?', 'kõrv', 'korv', 'kõrb']], 'full', 'g_listen');
    const avg = (format) => didacticCheck(doc(format, 'discover', [rows, rows, rows])).issues.filter((i) => i.code === 'did-sentence-avg');
    expect(isListeningRow(rows)).toBe(true);
    expect(avg('quest')).toEqual([]);
    expect(avg('').length).toBe(1);
  });
});

// owner 2026-11-18 (module 6 „Tööelu”): a module with a declared theme may be about that theme in every lesson, but each
// lesson names its own sub-topic; a module without a theme keeps „every topic once, work at most once”
describe('design v4 topics: a themed module (MODULE.theme)', () => {
  const L = (topic, subtopic) => ({ topic, ...(subtopic ? { subtopic } : {}) });
  const exam = { 'x-005': { topic: '', assessment: true } };
  it('keeps the old rule without a theme: two work lessons fail, four different topics pass', () => {
    expect(v4TopicProblems({}, { a: L('work'), b: L('home'), c: L('work'), d: L('health'), ...exam })).toEqual(['sama teema mitmes tunnis: work']);
    expect(v4TopicProblems({}, { a: L('work'), b: L('home'), c: L('money'), d: L('health'), ...exam })).toEqual([]);
  });
  it('allows the theme in every lesson when each has its own sub-topic', () => {
    const lessons = { a: L('work', 'job-search'), b: L('work', 'rights'), c: L('work', 'colleagues'), d: L('work', 'own-business'), ...exam };
    expect(v4TopicProblems({ theme: 'work' }, lessons)).toEqual([]);
    // the same lessons without the theme: work four times
    expect(v4TopicProblems({}, lessons)).toEqual(['sama teema mitmes tunnis: work']);
  });
  it('wants a sub-topic on every themed lesson, all different; other topics still once', () => {
    expect(v4TopicProblems({ theme: 'work' }, { a: L('work', 'rights'), b: L('work'), c: L('home'), d: L('home') }))
      .toEqual(['sama teema mitmes tunnis: home', 'b: mooduli teema tunnil puudub alateema (subtopic)']);
    expect(v4TopicProblems({ theme: 'work' }, { a: L('work', 'rights'), b: L('work', 'rights') })).toEqual(['sama alateema mitmes tunnis: rights']);
    expect(v4TopicProblems({ theme: 'space' }, { a: L('work', 'x') })).toEqual(['mooduli teema space ei ole loendis']);
  });
});
