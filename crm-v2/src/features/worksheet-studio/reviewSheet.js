/* global structuredClone */
// „Kordamisleht”: a review sheet of the last lessons, built only from the course's own checked tasks („Kogu”,
// blockLibrary.js) — no AI, no invented sentences (owner 2026-10-13: the generator should use the course's material).
// Words → reading / listening → forms and sentences → speaking, 40–50 minutes, a self-check of the lessons at the end.
import { blockMinutes } from './didactics/timeEstimate.js';

const lessonNumber = (id) => Number(String(id).match(/(\d+)$/)?.[1] || 0);
const coursePrefix = (id) => String(id).replace(/-?\d+$/, '');

function rng(seedText) {
  let h = 1779033703;
  for (const ch of String(seedText)) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const shuffle = (list, random) => list.map((x) => [random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

// tasks that work on another sheet without their lesson's context (no long writing, no role play, no planning)
const REVIEW_TYPES = new Set(['vocab', 'match', 'manymatch', 'categorize', 'crossword', 'translation', 'gaps', 'wordforms', 'transformation', 'errorfix', 'wordorder', 'choice', 'truefalse', 'cloze', 'reading', 'listening', 'dictation', 'speaking', 'profiles']);
// the order of the sheet and how many of each skill
const PLAN = [['sõnavara', 2], ['lugemine', 1], ['kuulamine', 1], ['grammatika', 5], ['rääkimine', 1]];
const ORDER = ['sõnavara', 'lugemine', 'kuulamine', 'grammatika', 'rääkimine'];

export const REVIEW_MINUTES = { min: 40, max: 50 };

// entries: buildLibrary(...) of the whole course; lessonId: the lesson the review is for (it and up to 4 before it)
export function buildReviewSheet(entries, lessonId, { variant = 1, span = 5 } = {}) {
  const prefix = coursePrefix(lessonId);
  const n = lessonNumber(lessonId);
  const inWindow = entries.filter((e) => coursePrefix(e.lessonId) === prefix && lessonNumber(e.lessonId) <= n && lessonNumber(e.lessonId) > n - span
    && e.phase !== 'transfer' && REVIEW_TYPES.has(e.block.type));
  if (!inWindow.length) throw new Error('Selle tunni kohta pole kursuse ülesandeid, millest kordamislehte teha.');
  const random = rng(`${lessonId}:review:${variant}`);
  const level = inWindow.find((e) => e.lessonId === lessonId)?.level || inWindow[0].level;
  const picked = [];
  const used = new Set();
  let minutes = 0;
  const take = (entry) => { picked.push(entry); used.add(entry.key); minutes += blockMinutes(entry.block, level); };
  // every lesson of the window contributes: the plan is filled round-robin over the lessons
  const lessons = [...new Set(inWindow.map((e) => e.lessonId))].sort((a, b) => lessonNumber(a) - lessonNumber(b));
  for (const [skill, count] of PLAN) {
    const pool = shuffle(inWindow.filter((e) => e.skill === skill), random);
    for (let k = 0; k < count; k += 1) {
      const lesson = lessons[(k + picked.length) % lessons.length];
      const entry = pool.find((e) => !used.has(e.key) && e.lessonId === lesson) || pool.find((e) => !used.has(e.key));
      if (entry) take(entry);
    }
  }
  // up to the lesson length with more form and word tasks, never more than 14 tasks
  const extra = shuffle(inWindow.filter((e) => ['grammatika', 'sõnavara'].includes(e.skill)), random);
  for (const entry of extra) {
    if (minutes >= REVIEW_MINUTES.min || picked.length >= 14) break;
    if (used.has(entry.key) || minutes + blockMinutes(entry.block, level) > REVIEW_MINUTES.max) continue;
    take(entry);
  }
  const ordered = [...picked].sort((a, b) => ORDER.indexOf(a.skill) - ORDER.indexOf(b.skill) || lessonNumber(a.lessonId) - lessonNumber(b.lessonId));
  const titles = lessons.map((id) => inWindow.find((e) => e.lessonId === id)?.lesson).filter(Boolean);
  const blocks = ordered.map((entry, i) => ({ ...structuredClone(entry.block), id: `rv_${i + 1}_${entry.block.id}` }));
  blocks.push({
    id: 'rv_self', type: 'selfcheck', width: 'full', span: 12, tone: 'sky', goal: '',
    data: { title: 'Kontrolli end.', titleMore: 'Mida ma kordasin?', instruction: 'Märgi, mida juba oskad.', items: titles.map((t) => `Ma kordasin teemat „${t}”.`).join('\n'), stamp: 'Kordamine tehtud' },
  });
  return {
    schema: 'keelesepp.worksheet/2',
    id: `ws_review_${lessonId}_${variant}`,
    meta: {
      title: `Kordamine: ${titles.length > 1 ? `${titles[0]} … ${titles[titles.length - 1]}` : titles[0] || lessonId}`,
      subtitle: 'Korda viimaste tundide sõnu, vorme ja oskusi.', level, phase: 'practice', displayLabel: 'Kordamine',
      canDo: 'Ma kasutan viimaste tundide sõnu ja vorme ilma abita.',
      goals: { g_vocab: 'Õpilane kordab viimaste tundide sõnu.', g_read: 'Õpilane saab aru tekstist ja kuulatud infost.', g_notice: 'Õpilane kasutab tundide vorme õigesti.', g_use: 'Õpilane räägib tundide teemadel.' }, review: { lessons, variant },
    },
    blocks,
  };
}
