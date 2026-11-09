// Lesson design v3 „stations” (docs/COURSE_DESIGN_STATIONS.md, owner 2026-11-09: „курс слабый, куча однотипных
// шаблонов … всё завязано на одном тексте или аудио — пропустишь его, и ничего не получается”).
// A lesson = 4–6 independent stations of 8–15 min. Each station starts with its own small input (a situation card, a
// chart, a short text, a short dialogue, an audio script) and can be skipped or reordered; at most one task of a lesson
// depends on an earlier station of the same sheet and then prints a fallback card. Every task says its purpose. The
// teacher gets one page per lesson (core 45-min path of three stations, one alternative, the short path, common errors).
//
// Authoring (module files, stationBlocks.js): `station(block, n, minutes, { final, needs })` marks the first block of a station,
// `purpose(block, text)` gives a task its purpose line, and the lesson carries `teacherPage: { goal, core, alt, short,
// errors }`. courseSheet.js puts the built teacher page on every sheet of the lesson (meta.teacherPage); the gates below
// read only the built sheets. Opt-in per module: MODULE.design: 'v3-stations' (the module's exam lessons keep v2 / v4).
import { ITEMS } from '../../../worksheet-studio/didactics/depth.js';
import { STATION_ITEMS, isStationSheet } from '../../../worksheet-studio/didactics/stations.js';
import { mainText, studentText, words } from './academicValue.js';
import { FINAL_KINDS, NOT_TASKS } from './stationBlocks.js';

export { STATIONS_DESIGN, isStationSheet } from '../../../worksheet-studio/didactics/stations.js';
export { FINAL_KINDS, fallbackLine, purpose, station } from './stationBlocks.js';

export const ST = Object.freeze({
  stations: [4, 6], minutes: [8, 15], blocks: 16, textWords: 120, audioWords: 320, dialogueLines: [4, 8],
  items: STATION_ITEMS, purposeWords: 6, dependsMax: 1, coreStations: 3, coreMinutes: [35, 50], errorsMin: 2, goalChars: 200,
});

const PHASES = ['discover', 'practice', 'transfer'];
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const gapsIn = (v) => (String(typeof v === 'string' ? v : JSON.stringify(v || '')).match(/\[[^\]]*\]/g) || []).length;
// every block type the course uses is a task except the content blocks (stationBlocks.js NOT_TASKS = engine `task: false`)
const isTask = (b) => Boolean(b?.type) && !NOT_TASKS.has(b.type);
const own = (doc) => (doc?.blocks || []).filter((b) => !b.data?.artFor && !b.data?.artId && !b.data?.review);

// ---------- the stations of a lesson ----------
// lesson: { discover: [blocks], practice: [...], transfer: [...] } (module file) or { phase: doc } (built sheets)
const blocksOfPhase = (x) => (Array.isArray(x) ? x : own(x));
export function stationsOf(lesson) {
  const out = [];
  for (const phase of PHASES) {
    let cur = null;
    for (const b of blocksOfPhase(lesson?.[phase] || [])) {
      if (b.data?.artFor || b.data?.artId || b.data?.review) continue;
      if (b.data?.station) { cur = { ...b.data.station, phase, blocks: [] }; out.push(cur); }
      if (cur && cur.phase === phase) cur.blocks.push(b);
      else (out.orphans ||= []).push({ phase, id: b.id });
    }
  }
  return out;
}

// the teacher's page of a lesson (Russian is fine for the teacher): goal, stations with minutes and sheet, the core
// 45-min path, one alternative, the short path, common errors
const PHASE_LABEL = { discover: 'Avasta', practice: 'Harjuta', transfer: 'Kasuta' };
export function teacherPage(lesson) {
  const page = lesson?.teacherPage;
  if (!page) return null;
  const list = stationsOf(lesson);
  const core = [...(page.core || [])];
  const stations = list.map((s) => ({
    n: s.n, title: s.title, minutes: s.minutes, sheet: PHASE_LABEL[s.phase], phase: s.phase,
    core: core.includes(s.n), alt: page.alt === s.n, final: s.final || '', needs: s.needs?.from || null,
    tasks: s.blocks.filter(isTask).map((b) => ({ id: b.id, type: b.type, purpose: b.data?.purpose || '' })),
  }));
  return {
    goal: String(page.goal || '').trim(), stations, core, alt: page.alt ?? null,
    coreMinutes: stations.filter((s) => s.core).reduce((n, s) => n + s.minutes, 0),
    totalMinutes: stations.reduce((n, s) => n + s.minutes, 0),
    short: String(page.short || '').trim(), errors: (page.errors || []).map(String), notes: (page.notes || []).map(String),
  };
}

// plain text of the teacher page (for print, the review and a quick look in a test)
export function teacherPageText(page, title = '') {
  if (!page) return '';
  const row = (s) => `${s.n}. ${s.title} — ${s.minutes} мин · лист ${s.sheet}${s.core ? ' · ЯДРО' : ''}${s.alt ? ' · альтернатива' : ''}${s.final ? ` · финал (${s.final})` : ''}${s.needs ? ` · нужна станция ${s.needs} (есть карточка-замена)` : ''}`;
  return [
    title ? `Страница учителя: ${title}` : 'Страница учителя',
    `Цель: ${page.goal}`,
    'Станции:', ...page.stations.map(row),
    `Ядро на 45 минут: станции ${page.core.join(', ')} (${page.coreMinutes} мин). Альтернатива: станция ${page.alt}.`,
    `Если мало времени: ${page.short}`,
    'Типичные ошибки:', ...page.errors.map((e) => `– ${e}`),
    ...(page.notes.length ? ['Заметки:', ...page.notes.map((e) => `– ${e}`)] : []),
  ].join('\n');
}

// ---------- gates ----------
// what the learner reads or hears at a station, and how long it may be
const TEXT_INPUT = ['reading', 'cloze', 'formtext', 'insertion', 'text', 'profiles', 'adsmatch'];
const AUDIO_INPUT = ['listening', 'examlisten'];
// a closed, scored task (one per station input at most) and its item count
const CLOSED_EXTRA = {
  listening: (d) => gapsIn(d.sentences),
  reading: (d) => lines(d.questions).filter((q) => /\[[^\]]+\]\s*$/.test(q)).length,
  cloze: (d) => (String(d.passage || '').match(/\{/g) || []).length,
  diagram: (d) => gapsIn([d.nodes, d.center, d.leftItems, d.rightItems, d.both].join('\n')),
  dialogue: (d) => gapsIn(d.lines),
  table: (d) => gapsIn(d.rows),
  crossword: (d) => (d.rows || []).length,
};
export const closedItems = (b) => {
  const f = ITEMS[b.type] || CLOSED_EXTRA[b.type];
  return f ? f(b.data || {}) : 0;
};
const isClosed = (b) => isTask(b) && closedItems(b) > 0;
// no group work at all (the course runs one-to-one) and no monologue said again
const GROUP = /(?:kolm|kolmelt|kolmele|mitu|mitmelt|kõigilt)\s+(?:inimes|kaaslas|õpilas|naabri)|kaaslastelt|klassikaaslas|kursusekaaslas|(?<!\p{L})rühma|(?<!\p{L})grupis|käi ringi|küsitle (?:kolme|mitut|kõiki)/iu;
const REPEAT = /(?:kaks|kolm) korda|teist korda|teisel korral|uuesti|iga kord lühemalt|3\s*[-–]\s*2\s*[-–]\s*1|4\s*[-–]\s*3\s*[-–]\s*2/iu;
const SPEAK = ['speaking', 'speakcard', 'rolecards'];
// the student's text of a block without its purpose line (the purpose is checked on its own)
const taskText = (b) => studentText({ ...b, data: { ...b.data, purpose: '' } });
const inputWords = (b) => words(mainText(b));

export function lessonStationProblems(lessonId, phases) {
  const docs = Object.entries(phases || {});
  if (!docs.length || !docs.some(([, d]) => isStationSheet(d))) return [];
  const out = [];
  const add = (phase, code, text) => out.push({ lessonId, phase, code, text });
  const list = stationsOf(phases);
  const [lo, hi] = ST.stations;
  if (list.length < lo || list.length > hi) add('*', 'st-stations', `${list.length} jaama (v3-stations: ${lo}–${hi})`);
  (list.orphans || []).forEach((o) => add(o.phase, 'st-stations', `${o.id}: plokk enne lehe esimest jaama — iga leht algab jaamaga (station())`));
  list.forEach((s, i) => { if (s.n !== i + 1) add(s.phase, 'st-stations', `jaam ${s.n} on ${i + 1}. kohal — jaamad on nummerdatud järjest`); });
  const blocks = docs.flatMap(([, d]) => own(d));
  if (blocks.length > ST.blocks) add('*', 'st-blocks', `${blocks.length} plokki tunnis (v3-stations: kuni ${ST.blocks})`);

  const depends = list.filter((s) => s.needs);
  if (depends.length > ST.dependsMax) add('*', 'st-depends', `${depends.length} jaama sõltub eelmisest (kuni ${ST.dependsMax})`);
  depends.forEach((s) => {
    const from = list.find((x) => x.n === s.needs.from);
    if (!from || from.n >= s.n) add(s.phase, 'st-depends', `jaam ${s.n} sõltub jaamast ${s.needs.from}, mis ei ole enne seda`);
    else if (from.phase !== s.phase) add(s.phase, 'st-depends', `jaam ${s.n} sõltub teise lehe jaamast ${from.n} (lehtede vahel sõltuvust ei ole)`);
    const printed = s.blocks.some((b) => /Kui jätsid jaama \d+ vahele/.test(studentText(b)));
    if (!printed) add(s.phase, 'st-depends', `jaam ${s.n}: asenduskaart („Kui jätsid jaama … vahele”) ei ole lehel`);
  });

  for (const s of list) {
    const [mlo, mhi] = ST.minutes;
    if (!(s.minutes >= mlo && s.minutes <= mhi)) add(s.phase, 'st-minutes', `jaam ${s.n} „${s.title}”: ${s.minutes} min (${mlo}–${mhi})`);
    const closed = s.blocks.filter(isClosed);
    if (closed.length > 1) add(s.phase, 'st-closed', `jaam ${s.n}: ${closed.length} suletud ülesannet (${closed.map((b) => b.id).join(', ')}; kuni 1 ühe sisendi kohta)`);
    for (const b of s.blocks) {
      if (b.data?.opener) continue; // the module's front page (docs/COURSE_DESIGN_COMMUNICATIVE.md §13.2) is its own genre
      if (TEXT_INPUT.includes(b.type) && inputWords(b) > ST.textWords) add(s.phase, 'st-input', `${b.id}: tekst ${inputWords(b)} sõna (kuni ${ST.textWords})`);
      if (AUDIO_INPUT.includes(b.type) && inputWords(b) > ST.audioWords) add(s.phase, 'st-input', `${b.id}: helitekst ${inputWords(b)} sõna (kuni ${ST.audioWords}, ≈ 2,5 min)`);
      if (b.type === 'dialogue') {
        const n = (b.data?.lines || []).length;
        if (n < ST.dialogueLines[0] || n > ST.dialogueLines[1]) add(s.phase, 'st-input', `${b.id}: dialoogis ${n} repliiki (${ST.dialogueLines.join('–')})`);
      }
    }
  }

  for (const [phase, doc] of docs) {
    for (const b of own(doc).filter(isTask)) {
      const p = String(b.data?.purpose || '').trim();
      if (p.split(/\s+/).filter(Boolean).length < ST.purposeWords) add(phase, 'st-purpose', `${b.id}: eesmärgirida puudub või on liiga lühike (purpose(block, 'kes, kellele, mis tulemus'))`);
      const n = closedItems(b);
      if (n && b.type !== 'insertion' && (n < ST.items[0] || n > ST.items[1])) add(phase, 'st-items', `${b.id}: ${n} punkti (suletud ülesanne: ${ST.items.join('–')})`);
      if (GROUP.test(taskText(b))) add(phase, 'st-group', `${b.id}: rühmatöö või „küsi mitmelt” — tund on üks-ühele, õpetaja on partner päris põhjusega`);
      if (SPEAK.includes(b.type) && REPEAT.test(taskText(b))) add(phase, 'st-repeat', `${b.id}: sama monoloog uuesti („kaks korda”, „uuesti” …)`);
    }
  }

  const finals = list.filter((s) => s.final);
  if (finals.length !== 1) add('transfer', 'st-final', `lõpujaamu ${finals.length} (täpselt 1: station(…, { final }))`);
  else if (finals[0].phase !== 'transfer') add(finals[0].phase, 'st-final', `lõpujaam ${finals[0].n} on lehel ${finals[0].phase} (Kasuta lehel)`);

  const page = docs[0][1].meta?.teacherPage;
  if (!page) add('*', 'st-teacher', 'õpetaja leht puudub (tunni teacherPage: goal, core, alt, short, errors)');
  else {
    const nums = list.map((s) => s.n);
    if (!page.goal || page.goal.length > ST.goalChars || /\n/.test(page.goal)) add('*', 'st-teacher', `eesmärk on üks rida (kuni ${ST.goalChars} märki)`);
    const core = page.core || [];
    if (core.length !== ST.coreStations || new Set(core).size !== core.length || !core.every((n) => nums.includes(n))) add('*', 'st-teacher', `põhitee on ${ST.coreStations} olemasolevat jaama (praegu ${core.join(', ') || '—'})`);
    else if (page.coreMinutes < ST.coreMinutes[0] || page.coreMinutes > ST.coreMinutes[1]) add('*', 'st-teacher', `põhitee ${page.coreMinutes} min (${ST.coreMinutes.join('–')})`);
    if (!nums.includes(page.alt) || core.includes(page.alt)) add('*', 'st-teacher', 'alternatiivne jaam on olemas ja ei ole põhiteel');
    if (finals.length === 1 && !core.includes(finals[0].n)) add('*', 'st-teacher', `lõpujaam ${finals[0].n} kuulub põhiteele`);
    if (!page.short) add('*', 'st-teacher', '„kui aega on vähe” tee puudub');
    if ((page.errors || []).length < ST.errorsMin) add('*', 'st-teacher', `tüüpvigu ${(page.errors || []).length} (vähemalt ${ST.errorsMin})`);
  }
  return out;
}

// what a station does: its task types in order (the input card, notes and words are not counted)
const signature = (s) => s.blocks.filter(isTask).map((b) => b.type).join('+') || s.blocks.map((b) => b.type).join('+');
export function stationProblems(sheets) {
  const ids = Object.keys(sheets || {});
  const station = ids.filter((id) => Object.values(sheets[id]).some(isStationSheet));
  if (!station.length) return [];
  const out = station.flatMap((id) => lessonStationProblems(id, sheets[id]));
  const add = (code, text, lessonId = '*') => out.push({ lessonId, phase: '*', code, text });
  const lists = station.map((id) => [id, stationsOf(sheets[id])]);
  // variety: no two lessons open with the same two stations, and the final task kinds rotate
  const openings = new Map();
  lists.forEach(([id, list]) => {
    const key = list.slice(0, 2).map(signature).join(' | ');
    if (openings.has(key)) add('st-opening', `algab samade jaamadega kui ${openings.get(key)} (${key})`, id);
    else openings.set(key, id);
  });
  const kinds = new Map();
  lists.forEach(([id, list]) => {
    const kind = list.find((s) => s.final)?.final;
    if (kind && kinds.has(kind)) add('st-final-kind', `lõpuülesanne „${kind}” nagu tunnis ${kinds.get(kind)} (otsus / plaan / kaebus / nõuanne / selgitus / läbirääkimine / esitlus)`, id);
    else if (kind) kinds.set(kind, id);
  });
  // a self-check at most once a module
  const checks = ids.reduce((n, id) => n + Object.values(sheets[id]).reduce((m, d) => m + own(d).filter((b) => b.type === 'selfcheck').length, 0), 0);
  if (checks > 1) add('st-selfcheck', `enesehinnang ${checks} korda moodulis (v3-stations: kuni 1)`);
  return out;
}
