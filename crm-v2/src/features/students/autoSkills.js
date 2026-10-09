// „Areng” without manual grading (owner, 2026-10-10): every skill is computed from what the CRM already has.
//   worksheets — every checked field of a submitted worksheet counts for the skill its task trains (gaps → Grammatika,
//                reading → Lugemine…), the newer the work the more it counts (half weight after HALF_LIFE_DAYS)
//   lessons    — „Rääkimine” from recorded Live Classroom lessons: how much of what the learner said was in the
//                lesson language, and how many of his sentences had no error (analysis made on the school Mac)
// The teacher's own grades (students.skillMap) stay next to it; nothing here is written anywhere.
import { scoreDocument } from '../worksheet-studio/engine/registry.js';

export const AUTO_SKILLS = ['Rääkimine', 'Grammatika', 'Sõnavara', 'Lugemine', 'Kuulamine', 'Kirjutamine'];
const TASK_SKILL = {
  gaps: 'Grammatika', choice: 'Grammatika', wordforms: 'Grammatika', errorfix: 'Grammatika', transformation: 'Grammatika',
  wordorder: 'Grammatika', table: 'Grammatika', categorize: 'Grammatika',
  match: 'Sõnavara', manymatch: 'Sõnavara', crossword: 'Sõnavara', wordsearch: 'Sõnavara', pictures: 'Sõnavara', clock: 'Sõnavara', vocab: 'Sõnavara',
  reading: 'Lugemine', truefalse: 'Lugemine',
  listening: 'Kuulamine', dictation: 'Kuulamine',
  writing: 'Kirjutamine', guidedletter: 'Kirjutamine', translation: 'Kirjutamine',
};
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
    try { perBlock = scoreDocument(a.worksheetDoc, a.answers || {}).perBlock; } catch { continue; }
    for (const block of a.worksheetDoc.blocks) {
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

export function autoSkills({ assignments = [], recordings = [], now = Date.now() } = {}) {
  const acc = worksheetEvidence(assignments, now);
  const rows = AUTO_SKILLS.flatMap((skill) => {
    const s = acc[skill];
    if (skill === 'Rääkimine') {
      let sum = 0; let weight = 0; let lessons = 0; let share = 0; let accuracy = 0; let accN = 0;
      for (const r of recordings) {
        if (r.status !== 'done') continue;
        const sp = speakingOf(r);
        if (!sp) continue;
        const w = weightAt(time(r.endedAt || r.startedAt), now);
        const value = sp.accuracy === null ? sp.share : (sp.share + sp.accuracy) / 2;
        sum += w * value; weight += w; lessons += 1; share += sp.share;
        if (sp.accuracy !== null) { accuracy += sp.accuracy; accN += 1; }
      }
      if (!lessons) return [];
      const basis = [`${lessons} ${lessons === 1 ? 'tund' : 'tundi'}`, `eesti keeles ${Math.round(share / lessons)}%`];
      if (accN) basis.push(`vigadeta lauseid ${Math.round(accuracy / accN)}%`);
      return [{ skill, pct: Math.round(sum / weight), basis: basis.join(' · ') }];
    }
    if (!s?.total) return [];
    return [{ skill, pct: Math.round((s.ok / s.total) * 100), basis: `${s.works.size} ${s.works.size === 1 ? 'tööleht' : 'töölehte'} · ${s.items} vastust` }];
  });
  return rows;
}
