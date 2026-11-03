// „Areng” without manual grading (owner, 2026-10-10): every skill is computed from what the CRM already has.
//   worksheets — every checked field of a submitted worksheet counts for the skill its task trains (gaps → Grammatika,
//                reading → Lugemine…), the newer the work the more it counts (half weight after HALF_LIFE_DAYS)
//   lessons    — „Rääkimine” from recorded Live Classroom lessons: how much of what the learner said was in the lesson
//                language, the newer the lesson the more it counts. One number and one source, petLessonStats, for the
//                teacher's „Areng” and the student's „Minu areng”: the student may read only those stats, not the
//                recordings. Sentences without an error come from the recordings and stay beside it for the teacher.
// The teacher's own grades (students.skillMap) stay next to it; nothing here is written anywhere.
import { scoreDocument } from '../worksheet-studio/engine/registry.js';
import { TASK_SKILL } from './skillTasks.js';

export const AUTO_SKILLS = ['Rääkimine', 'Grammatika', 'Sõnavara', 'Lugemine', 'Kuulamine', 'Kirjutamine'];
const HALF_LIFE_DAYS = 45;
const DAY = 24 * 60 * 60 * 1000;
const CYRILLIC = /[а-яё]/i;
const time = (value) => { const t = Date.parse(value || ''); return Number.isNaN(t) ? 0 : t; };
const weightAt = (at, now) => (at ? 0.5 ** (Math.max(0, now - at) / DAY / HALF_LIFE_DAYS) : 0.5);
const wordsIn = (text) => String(text || '').split(/\s+/).filter(Boolean).length;

function worksheetEvidence(assignments, now) {
  const acc = {};
  for (const a of assignments) {
    if (a.status !== 'done' || !a.worksheetDoc?.blocks?.length) continue;
    const w = weightAt(time(a.completedAt), now);
    let perBlock = {};
    let left = new Set();
    try { const scored = scoreDocument(a.worksheetDoc, a.answers || {}); perBlock = scored.perBlock; left = new Set((scored.skipped || []).map((item) => item.id)); } catch { continue; }
    for (const block of a.worksheetDoc.blocks) {
      // a task done in the lesson (no answers in the sheet) or marked „Ei hinnata” is no evidence (owner 2026-10-27)
      if (left.has(block.id)) continue;
      const skill = TASK_SKILL[block.type];
      const items = perBlock[block.id];
      if (!skill || !items?.length) continue;
      const s = acc[skill] || (acc[skill] = { ok: 0, total: 0, items: 0, works: new Set() });
      s.ok += w * items.filter((i) => i.ok).length;
      s.total += w * items.length;
      s.items += items.length;
      s.works.add(a.id);
    }
  }
  return acc;
}

// one recorded lesson → { share, accuracy } in percent, or null when the learner hardly spoke
export function speakingOf(recording) {
  const lang = recording.language === 'en' ? 'en' : 'et';
  const said = (recording.transcript || []).filter((l) => l.speaker === 'student');
  const all = said.reduce((n, l) => n + wordsIn(l.text), 0);
  // analysis 4+ (school Mac) counts without recognition noise and form lists: its own word counts and checked sentences
  const speech = recording.analysis?.speech;
  const checked = Number(recording.analysis?.checked) || 0;
  if (speech?.words >= 20) {
    return {
      share: Math.round((speech.langWords / speech.words) * 100),
      accuracy: !Array.isArray(recording.analysis?.errors) || !checked ? null : Math.round(Math.max(0, 1 - recording.analysis.errors.length / checked) * 100),
    };
  }
  if (all < 20) return null;
  const inLang = said.filter((l) => (l.lang ? l.lang === lang : !CYRILLIC.test(l.text))).reduce((n, l) => n + wordsIn(l.text), 0);
  const sentences = said.filter((l) => (l.lang ? l.lang === lang : !CYRILLIC.test(l.text)))
    .flatMap((l) => String(l.text).split(/(?<=[.!?…])\s+/)).filter((s) => wordsIn(s) >= 2).length;
  const errors = Array.isArray(recording.analysis?.errors) ? recording.analysis.errors.length : null;
  return {
    share: Math.round((inLang / all) * 100),
    accuracy: errors === null || !sentences ? null : Math.round(Math.max(0, 1 - errors / sentences) * 100),
  };
}

const SPOKE_ENOUGH = 20; // words: below this a lesson says nothing about speaking
const lessonCount = (n) => `${n} ${n === 1 ? 'tund' : 'tundi'}`;
const SPEAKING_BASIS = 'tunnikeeles räägitud osa';

// petLessonStats → the „Rääkimine” row, or null
export function speakingFromStats(stats = [], now = Date.now()) {
  const list = stats.filter((s) => Number(s?.studentWords) >= SPOKE_ENOUGH && Number.isFinite(Number(s?.share)));
  if (!list.length) return null;
  let sum = 0; let weight = 0;
  for (const s of list) { const w = weightAt(time(s.date), now); sum += w * Number(s.share); weight += w; }
  return { skill: 'Rääkimine', pct: Math.round(sum / weight), basis: `${lessonCount(list.length)} · ${SPEAKING_BASIS}` };
}

export function autoSkills({ assignments = [], recordings = [], stats = [], now = Date.now() } = {}) {
  const acc = worksheetEvidence(assignments, now);
  const rows = AUTO_SKILLS.flatMap((skill) => {
    const s = acc[skill];
    if (skill === 'Rääkimine') {
      let sum = 0; let weight = 0; let lessons = 0; let accuracy = 0; let accN = 0;
      for (const r of recordings) {
        if (r.status !== 'done') continue;
        const sp = speakingOf(r);
        if (!sp) continue;
        const w = weightAt(time(r.endedAt || r.startedAt), now);
        sum += w * sp.share; weight += w; lessons += 1;
        if (sp.accuracy !== null) { accuracy += sp.accuracy; accN += 1; }
      }
      // a recorded lesson without stats yet (not through the school Mac's newer step) still shows from its recording
      const row = speakingFromStats(stats, now) || (lessons ? { skill, pct: Math.round(sum / weight), basis: `${lessonCount(lessons)} · ${SPEAKING_BASIS}` } : null);
      if (!row) return [];
      return [accN ? { ...row, basis: `${row.basis} · vigadeta lauseid ${Math.round(accuracy / accN)}%` } : row];
    }
    if (!s?.total) return [];
    return [{ skill, pct: Math.round((s.ok / s.total) * 100), basis: `${s.works.size} ${s.works.size === 1 ? 'tööleht' : 'töölehte'} · ${s.items} vastust` }];
  });
  return rows;
}
