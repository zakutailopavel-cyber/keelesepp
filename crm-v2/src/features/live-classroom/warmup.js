// „Soojendus” and „Täna harjutada” (owner 2026-11-04): in a 1:1 lesson the teacher starts with the learner's own
// sentences from the previous analysed lesson, and keeps a small reminder of what to practise today.
// Everything here is pure: the lessons come from lessonRecordings (grouped by `groupRecordings`, so the teacher's
// „Pole viga” marks are already applied); nothing is invented — every sentence is one the learner said, with the
// correction the school Mac's model gave (tools/lesson-transcriber/analysis.js).
import { createBlock } from '../worksheet-studio/engine/registry.js';
import { newDocument } from '../worksheet-studio/engine/schema.js';
import { errorKey, errorTopicKeys, isActiveDismissal } from '../lesson-recording/errorReview.js';

export const WARMUP_MIN = 3;
export const WARMUP_MAX = 5;
const MAX_WORDS = 12;
const MIN_WORDS = 3;
const MAX_EDITS = 3;

// plain Estonian names of the Mac's topic keys (the Mac's own texts are Russian)
export const TOPIC_LABELS = Object.freeze({
  order: 'Sõnajärg (tegusõna teisel kohal)',
  cases: 'Käänded (kuhu? kus? kust? kellega?)',
  verb: 'Tegusõna vormid (aeg, isik, ma- / da-tegevusnimi)',
  form: 'Sõnavormid (kääne ja arv)',
  missing: 'Puuduvad sõnad (on, et, see, oma)',
  extra: 'Liigsed sõnad',
  vocab: 'Sõnavalik',
});

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
export const plainWords = (value) => clean(value).toLocaleLowerCase('et').replace(/[.,!?;:…"„“”«»()–—-]+/g, ' ').split(/\s+/).filter(Boolean);
const norm = (value) => plainWords(value).join(' ');
const time = (lesson) => { const t = Date.parse(lesson?.startedAt || ''); return Number.isNaN(t) ? 0 : t; };

// word-level edit distance (insert, delete, replace one word)
export function wordEdits(a = [], b = []) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
}

// A usable learner sentence: the learner's line (not the teacher's recast), short, a real change of one to three
// words — long lines and big rewrites are mostly transcription noise; stutters („ma ma lähen”) are left out too.
export function usableError(error) {
  if (!error || error.source === 'teacher' || error.unsure) return null;
  const said = clean(error.said);
  const corrected = clean(error.corrected);
  if (!said || !corrected) return null;
  const a = plainWords(said);
  const b = plainWords(corrected);
  if (a.length < MIN_WORDS || a.length > MAX_WORDS || b.length > MAX_WORDS) return null;
  if (a.some((w, i) => i > 0 && w === a[i - 1])) return null;
  const edits = wordEdits(a, b);
  if (edits < 1 || edits > MAX_EDITS || edits / Math.max(a.length, b.length) > 0.5) return null;
  return { said, corrected, edits };
}

// analysed lessons, newest first, without the lesson running now
export function analysedLessons(lessons = [], { currentInvitationId = '' } = {}) {
  return lessons
    .filter((lesson) => lesson && Array.isArray(lesson.analysis?.errors) && !lesson.analysis.error)
    .filter((lesson) => !currentInvitationId || lesson.invitationId !== currentInvitationId)
    .sort((a, b) => time(b) - time(a));
}

// said → corrected pairs the teacher marked „Pole viga” in any of these lessons (like the Mac, a pair dismissed once
// is not offered again in another lesson); `extra` = more pairs from elsewhere
export function dismissedPairs(lessons = [], extra = []) {
  const pairs = new Set();
  const add = (item) => { if (item?.said && item?.corrected) pairs.add(`${norm(item.said)}→${norm(item.corrected)}`); };
  for (const lesson of lessons) {
    (lesson?.analysis?.dismissedErrors || []).forEach(add);
    Object.values(lesson?.errorReview || {}).filter(isActiveDismissal).forEach(add);
  }
  extra.forEach(add);
  return pairs;
}

const topicRanks = (analysis) => {
  const focus = (Array.isArray(analysis?.focus) ? analysis.focus : []).filter((t) => t?.key && t.count > 0);
  return new Map([...focus].sort((a, b) => b.count - a.count).map((t, i) => [t.key, i]));
};

/**
 * The warm-up sentences: from the latest analysed lesson (older ones only when it gives fewer than three), the
 * learner's own short sentences with errors, those of the top focus topics first (at most two per topic before the
 * rest), without duplicates and without dismissed corrections.
 */
export function pickWarmupItems(lessons = [], { currentInvitationId = '', dismissed = [], max = WARMUP_MAX, maxLessons = 3 } = {}) {
  const list = analysedLessons(lessons, { currentInvitationId });
  const gone = dismissedPairs(list, dismissed);
  const picked = [];
  const seen = new Set();
  const used = [];
  for (const lesson of list.slice(0, maxLessons)) {
    if (picked.length >= WARMUP_MIN) break;
    const ranks = topicRanks(lesson.analysis);
    const review = lesson.errorReview || {};
    const candidates = lesson.analysis.errors.map((error) => {
      if (isActiveDismissal(review[errorKey(error)])) return null;
      const ok = usableError(error);
      if (!ok || gone.has(`${norm(ok.said)}→${norm(ok.corrected)}`)) return null;
      const keys = errorTopicKeys(error);
      const ranked = keys.filter((k) => ranks.has(k)).sort((a, b) => ranks.get(a) - ranks.get(b));
      const topicKey = ranked[0] || keys[0] || '';
      return { ...ok, topicKey, rank: ranked.length ? ranks.get(ranked[0]) : 99, startMs: Number(error.startMs) || 0, id: errorKey(error) };
    }).filter(Boolean).sort((a, b) => a.rank - b.rank || a.edits - b.edits || a.startMs - b.startMs);
    const perTopic = new Map();
    const take = (item) => {
      const s = norm(item.said); const c = norm(item.corrected);
      if (seen.has(s) || seen.has(`=${c}`) || picked.length >= max) return false;
      seen.add(s); seen.add(`=${c}`);
      picked.push({ id: `${lesson.id}:${item.id}`, said: item.said, corrected: item.corrected, topicKey: item.topicKey, topic: TOPIC_LABELS[item.topicKey] || '', lessonId: lesson.id, lessonDate: String(lesson.startedAt || '').slice(0, 10) });
      return true;
    };
    const later = [];
    for (const item of candidates) {
      const n = perTopic.get(item.topicKey) || 0;
      if (n >= 2) { later.push(item); continue; }
      if (take(item)) perTopic.set(item.topicKey, n + 1);
    }
    later.forEach(take);
    if (picked.some((item) => item.lessonId === lesson.id)) used.push(lesson);
  }
  return { items: picked, lessons: used, latest: list[0] || null };
}

/** The worksheet put on the board: one „Paranda lause” task per sentence, so „Näita vastust” opens one row at a time. */
export function warmupWorksheet(items = [], { date = '', level = '', studentName = '' } = {}) {
  const rows = items.map((item) => ({ wrong: clean(item.said), answer: clean(item.corrected) })).filter((row) => row.wrong && row.answer).slice(0, 10);
  if (!rows.length) return null;
  const doc = newDocument();
  doc.meta = { ...doc.meta, title: `Soojendus${date ? ` ${date}` : ''}`, subtitle: studentName ? `${studentName} · laused eelmisest tunnist` : 'Laused eelmisest tunnist', ...(level ? { level } : {}) };
  doc.blocks = rows.map((row, i) => {
    const block = createBlock('errorfix');
    block.data = {
      ...block.data,
      title: 'Paranda lause.',
      instruction: i === 0 ? 'Need laused ütlesid sa eelmises tunnis. Kirjuta lause õigesti.' : '',
      rows: [row],
    };
    return block;
  });
  return doc;
}

/**
 * „Täna harjutada”: 2–3 error topics of the last 1–3 analysed lessons (most frequent first) with one learner example
 * each, and the Mac's „Järgmiseks tunniks” advice of the latest lesson that has it.
 */
export function lessonHints(lessons = [], { currentInvitationId = '', maxLessons = 3, maxTopics = 3 } = {}) {
  const list = analysedLessons(lessons, { currentInvitationId }).slice(0, maxLessons);
  if (!list.length) return null;
  const gone = dismissedPairs(list);
  const topics = new Map();
  const example = (said, corrected) => {
    const ok = usableError({ said, corrected });
    return ok && !gone.has(`${norm(ok.said)}→${norm(ok.corrected)}`) ? { said: ok.said, corrected: ok.corrected } : null;
  };
  for (const lesson of list) {
    const focus = (Array.isArray(lesson.analysis.focus) ? lesson.analysis.focus : []).filter((t) => t?.key && t.count > 0);
    if (focus.length) {
      for (const t of focus) {
        const item = topics.get(t.key) || { key: t.key, count: 0, example: null };
        item.count += Number(t.count) || 0;
        if (!item.example) item.example = (t.examples || []).filter((x) => x?.source !== 'teacher').map((x) => example(x.said, x.corrected)).find(Boolean) || null;
        topics.set(t.key, item);
      }
    }
    // older analyses have no counted topics: count the learner's errors here (same rules as the Mac)
    for (const error of lesson.analysis.errors) {
      if (error?.source === 'teacher') continue;
      for (const key of errorTopicKeys(error)) {
        const item = topics.get(key) || { key, count: 0, example: null };
        if (!focus.length) item.count += 1;
        if (!item.example) item.example = example(error.said, error.corrected);
        topics.set(key, item);
      }
    }
  }
  const top = [...topics.values()].filter((t) => t.count > 0).sort((a, b) => b.count - a.count).slice(0, maxTopics)
    .map((t) => ({ ...t, topic: TOPIC_LABELS[t.key] || t.key }));
  const withNext = list.find((lesson) => Array.isArray(lesson.analysis.summary?.jargmiseks) && lesson.analysis.summary.jargmiseks.some((x) => clean(x)));
  const next = withNext ? withNext.analysis.summary.jargmiseks.map(clean).filter(Boolean).slice(0, 3) : [];
  if (!top.length && !next.length) return null;
  return { topics: top, next, lessonCount: list.length, latestDate: String(list[0].startedAt || '').slice(0, 10) };
}
