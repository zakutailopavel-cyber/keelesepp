// „Teekond sihttasemeni” (owner 2026-11-04, admin only): how far a student is from the card's target level, per skill,
// from data the CRM already has. Pure: no reads, no writes. The formula is described in docs/PROGRESS_ESTIMATE.md —
// change both together.
//
//   1. each skill gets a measure 0–100 from its own evidence (recent first, a fixed window)
//   2. the measure is placed in the skill's band: below `low` = 0 %, at or above `high` = 100 % („ready for the next
//      level” on the material of the course he works on now)
//   3. the band result is divided by the number of level steps between the level and the target (A2 → B2 = 2 steps),
//      so it reads „share of the way to the target”. Level ≥ target = 100 %.
//
// A skill with fewer data points than its minimum shows „vähe andmeid”, not a number. Trend: the same estimate with
// only the data that existed 4 weeks ago.
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { heldCourseLessons, lessonProgress, progressMap } from '../self-study/selfStudyModel.js';
import { courseKeyFor, coursePath } from './levelProgress.js';
import { tracksOf } from './subjects.js';

const DAY = 24 * 60 * 60 * 1000;
export const TREND_DAYS = 28;

// The numbers of the formula, in one place (the doc repeats this table).
export const ESTIMATE_RULES = Object.freeze({
  reading: { goal: 'g_read', window: 8, minWorks: 2, minItems: 8, low: 40, high: 85 },
  listening: { goal: 'g_listen', window: 8, minWorks: 2, minItems: 8, low: 40, high: 85 },
  vocabulary: { goal: 'g_vocab', window: 8, minWorks: 2, minItems: 8, low: 40, high: 85, cardsMin: 20, cardsLow: 10, cardsHigh: 60 },
  grammar: { window: 6, minLessons: 2, minChecked: 10, low: 30, high: 80 },
  // share = Estonian words / all the learner's words in a lesson; longest = his longest sentence in words
  speaking: { window: 6, minLessons: 2, minWords: 20, low: 30, high: 90, shareWeight: 0.7, longLow: 4 },
});
// the longest sentence that counts as „ready” for the target level (words)
export const LONGEST_FOR = Object.freeze({ A1: 6, A2: 8, B1: 12, B2: 16, C1: 20, C2: 24 });

export const SKILL_ORDER = [
  { key: 'reading', label: 'Lugemine' },
  { key: 'grammar', label: 'Grammatika täpsus' },
  { key: 'speaking', label: 'Kõnelemine' },
  { key: 'vocabulary', label: 'Sõnavara' },
  { key: 'listening', label: 'Kuulamine' },
];

const time = (value) => { const t = Date.parse(value || ''); return Number.isNaN(t) ? 0 : t; };
const clamp = (n) => Math.max(0, Math.min(100, n));
// the measure inside its band, 0–100
export const band = (value, low, high) => clamp(((value - low) / (high - low)) * 100);
const finite = (n) => Number.isFinite(Number(n));

// the card's Estonian track: its level and target (enrollments first, the card's own fields as fallback)
export function estimateLevels(student = {}) {
  const enrollments = Array.isArray(student.enrollments) ? student.enrollments.filter((t) => t && t.active !== false) : [];
  const track = enrollments.find((t) => /eesti/i.test(t.subject || '')) || (enrollments.length === 1 ? enrollments[0] : null);
  const level = track?.level || student.level || '';
  const target = track?.targetLevel || student.targetLevel || '';
  return { level, target, subject: tracksOf(student)[0]?.subject || 'Eesti keel', ...(track ? { fromTrack: true } : {}) };
}

// a submitted sheet's result for one goal, or null. Scores are already re-checked on load (storedScore.js via
// normalizeWorksheetAssignment); what still looks broken is left out.
export function goalResult(assignment, goal) {
  if (assignment?.status !== 'done') return null;
  const score = assignment.score;
  if (!score || typeof score !== 'object') return null;
  // an old score the loader could not check again (no copy of the sheet): 0 right of many with answers given
  if (!assignment.worksheetDoc && Number(score.correct) === 0 && Number(score.total) > 0 && Object.keys(assignment.answers || {}).length) return null;
  const g = score.perGoal?.[goal];
  if (!g || !finite(g.ok) || !finite(g.total)) return null;
  const ok = Number(g.ok); const total = Number(g.total);
  if (total <= 0 || ok < 0 || ok > total) return null;
  return { ok, total, at: time(assignment.completedAt) };
}

function goalMeasure(assignments, goal, rule, cutoff) {
  const rows = assignments.map((a) => goalResult(a, goal)).filter((r) => r && (!cutoff || (r.at && r.at <= cutoff)))
    .sort((a, b) => b.at - a.at).slice(0, rule.window);
  const ok = rows.reduce((n, r) => n + r.ok, 0);
  const total = rows.reduce((n, r) => n + r.total, 0);
  const enough = rows.length >= rule.minWorks && total >= rule.minItems;
  return { works: rows.length, items: total, value: total ? Math.round((ok / total) * 100) : null, enough };
}

// grammar: share of the learner's checked sentences that had no error (teacher-added corrections are not counted:
// they are not the analyser's check, and „Pole viga” marks are already applied by groupRecordings)
function grammarMeasure(lessons, rule, cutoff) {
  const rows = lessons.filter((r) => r?.status === 'done' && Number(r.analysis?.checked) > 0 && Array.isArray(r.analysis?.errors))
    .map((r) => ({ at: time(r.startedAt), checked: Number(r.analysis.checked), errors: r.analysis.errors.filter((e) => e?.source !== 'teacher').length }))
    .filter((r) => !cutoff || (r.at && r.at <= cutoff))
    .sort((a, b) => b.at - a.at).slice(0, rule.window);
  const checked = rows.reduce((n, r) => n + r.checked, 0);
  const errors = Math.min(checked, rows.reduce((n, r) => n + r.errors, 0));
  const enough = rows.length >= rule.minLessons && checked >= rule.minChecked;
  return { lessons: rows.length, checked, errors, errorShare: checked ? Math.round((errors / checked) * 100) : null, value: checked ? Math.round((1 - errors / checked) * 100) : null, enough };
}

// speaking: petLessonStats first (one per analysed lesson); a lesson without stats from its analysis.speech
function speakingMeasure(stats, lessons, rule, cutoff, targetLevel) {
  const seen = new Set();
  const rows = [];
  for (const s of stats) {
    if (!(Number(s?.studentWords) >= rule.minWords) || !finite(s.share)) continue;
    const at = time(s.date);
    seen.add(String(s.date || '').slice(0, 16));
    rows.push({ at, words: Number(s.studentWords), share: Number(s.share), longest: finite(s.longest) ? Number(s.longest) : null });
  }
  for (const r of lessons) {
    const sp = r?.analysis?.speech;
    if (r?.status !== 'done' || !(Number(sp?.words) >= rule.minWords) || seen.has(String(r.startedAt || '').slice(0, 16))) continue;
    rows.push({ at: time(r.startedAt), words: Number(sp.words), share: Math.round((Number(sp.langWords) / Number(sp.words)) * 100), longest: null });
  }
  const recent = rows.filter((r) => !cutoff || (r.at && r.at <= cutoff)).sort((a, b) => b.at - a.at).slice(0, rule.window);
  if (!recent.length) return { lessons: 0, value: null, enough: false };
  const avg = (list) => list.reduce((n, x) => n + x, 0) / list.length;
  const share = Math.round(avg(recent.map((r) => r.share)));
  const longs = recent.map((r) => r.longest).filter((n) => n !== null);
  const longest = longs.length ? Math.round(avg(longs)) : null;
  const words = Math.round(avg(recent.map((r) => r.words)));
  const longHigh = LONGEST_FOR[targetLevel] || LONGEST_FOR.B1;
  // the band of the share, and (when known) of the longest sentence, weighted 70 / 30
  const shareBand = band(share, rule.low, rule.high);
  const longBand = longest === null ? null : band(longest, rule.longLow, longHigh);
  const banded = longBand === null ? shareBand : rule.shareWeight * shareBand + (1 - rule.shareWeight) * longBand;
  return { lessons: recent.length, share, longest, words, minShare: Math.min(...recent.map((r) => r.share)), maxShare: Math.max(...recent.map((r) => r.share)), banded, value: share, enough: recent.length >= rule.minLessons };
}

// word cards: share learned (Leitner box ≥ 3) of his plain word cards („Sinu lause” cards are mistakes, not words)
function cardsMeasure(words, rule) {
  const plain = words.filter((w) => !String(w?.translation || '').startsWith('Sinu lause:'));
  const learned = plain.filter((w) => (Number(w.box) || 0) >= 3).length;
  return { cards: plain.length, learned, value: plain.length ? Math.round((learned / plain.length) * 100) : null, enough: plain.length >= rule.cardsMin };
}

// all five measures at one moment (`cutoff` = only data from before it; 0 = everything)
function measures({ assignments, lessons, stats, words, target, cutoff = 0 }) {
  const R = ESTIMATE_RULES;
  return {
    reading: goalMeasure(assignments, R.reading.goal, R.reading, cutoff),
    listening: goalMeasure(assignments, R.listening.goal, R.listening, cutoff),
    vocabulary: { goal: goalMeasure(assignments, R.vocabulary.goal, R.vocabulary, cutoff), cards: cutoff ? null : cardsMeasure(words, R.vocabulary) },
    grammar: grammarMeasure(lessons, R.grammar, cutoff),
    speaking: speakingMeasure(stats, lessons, R.speaking, cutoff, target),
  };
}

// one skill's band result 0–100, or null when there is too little data
function banded(key, m) {
  const R = ESTIMATE_RULES;
  if (key === 'speaking') return m.enough ? m.banded : null;
  if (key === 'vocabulary') {
    const goal = m.goal.enough ? band(m.goal.value, R.vocabulary.low, R.vocabulary.high) : null;
    const cards = m.cards?.enough ? band(m.cards.value, R.vocabulary.cardsLow, R.vocabulary.cardsHigh) : null;
    const parts = [goal, cards].filter((x) => x !== null);
    return parts.length ? parts.reduce((n, x) => n + x, 0) / parts.length : null;
  }
  return m.enough ? band(m.value, R[key].low, R[key].high) : null;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function describe(key, m) {
  if (key === 'reading' || key === 'listening') return { points: m.works, basis: m.works ? `${plural(m.works, 'tööleht', 'töölehte')} · ${m.items} vastust · õigeid ${m.value}%` : 'töölehtedel pole veel neid ülesandeid' };
  if (key === 'grammar') return { points: m.lessons, basis: m.lessons ? `${plural(m.lessons, 'tund', 'tundi')} · ${m.checked} kontrollitud lauset · veaga ${m.errorShare}%` : 'analüüsitud tunde pole' };
  if (key === 'speaking') return { points: m.lessons, basis: m.lessons ? `${plural(m.lessons, 'tund', 'tundi')} · eesti keeles ${m.minShare === m.maxShare ? `${m.share}%` : `${m.minShare}–${m.maxShare}% (keskm. ${m.share}%)`} · keskm. ${m.words} sõna tunnis${m.longest !== null ? ` · pikim lause ~${m.longest} sõna` : ''}` : 'analüüsitud tunde pole' };
  const goal = m.goal.works ? `${plural(m.goal.works, 'tööleht', 'töölehte')} · õigeid ${m.goal.value}%` : '';
  const cards = m.cards?.cards ? `${m.cards.cards} kaarti · selgeks õpitud ${m.cards.learned}` : '';
  return { points: m.goal.works + (m.cards?.cards ? 1 : 0), basis: [goal, cards].filter(Boolean).join(' · ') || 'sõnakaarte ega sõnavaraülesandeid pole' };
}

// the course of the step he works on: lessons done (three sheets, or held with the teacher) / all lessons
export function coursePosition({ curriculum = [], assignments = [], lessons = [], step, subject = '' }) {
  if (!curriculum.length || !step) return null;
  const catalog = buildTopicCatalog(curriculum);
  const key = courseKeyFor(step, subject);
  const entry = catalog.levels.find((level) => level.key === key);
  if (!entry) return null;
  const list = entry.modules.flatMap((module) => module.lessons);
  if (!list.length) return null;
  const map = progressMap(assignments);
  const held = heldCourseLessons(lessons);
  const done = list.filter((lesson) => held.has(lesson.id) || lessonProgress(lesson.id, map).done === 3).length;
  return { key, label: entry.label || key, done, total: list.length, pct: Math.round((done / list.length) * 100) };
}

/**
 * @param {object} input { level, target, assignments, lessons (groupRecordings), stats (petLessonStats), words, now }
 * @returns {{ from, to, step, steps, reached, levelKnown, skills: Array, average, averageTrend, enoughSkills }}
 */
export function skillEstimate({ level = '', target = '', assignments = [], lessons = [], stats = [], words = [], now = Date.now() } = {}) {
  const path = coursePath(level, target);
  const steps = Math.max(1, path.b - path.a);
  const toTarget = (bandValue) => (bandValue === null ? null : path.reached ? 100 : Math.round(bandValue / steps));
  const data = { assignments, lessons, stats, words, target: path.to };
  const nowM = measures(data);
  const pastM = measures({ ...data, cutoff: now - TREND_DAYS * DAY });
  const skills = SKILL_ORDER.map(({ key, label }) => {
    const m = nowM[key];
    const pct = toTarget(banded(key, m));
    // Sõnavara's trend compares the worksheet part only (a card's box 4 weeks ago is not stored)
    const pastBand = banded(key, pastM[key]);
    const nowForTrend = key === 'vocabulary' ? banded(key, { goal: m.goal, cards: null }) : banded(key, m);
    const past = toTarget(pastBand);
    const nowT = toTarget(nowForTrend);
    const { points, basis } = describe(key, m);
    return { key, label, pct, enough: pct !== null, points, basis, trend: past !== null && nowT !== null ? nowT - past : null, measure: m };
  });
  const known = skills.filter((s) => s.enough);
  const average = known.length ? Math.round(known.reduce((n, s) => n + s.pct, 0) / known.length) : null;
  // the average's trend over the skills that have both numbers
  const both = skills.filter((s) => s.trend !== null);
  const averageTrend = both.length ? Math.round(both.reduce((n, s) => n + s.trend, 0) / both.length) : null;
  return { from: path.from, to: path.to, step: path.step, steps, reached: path.reached, levelKnown: path.known, targetKnown: Boolean(target), skills, average, averageTrend, enoughSkills: known.length };
}
