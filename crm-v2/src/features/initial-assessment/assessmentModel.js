// Esmane hindamine — the student's baseline snapshot (`studentInitialAssessments/{studentId}`), the same document
// and shape as CRM v1 (`initial-assessment-core.js`) and the same Firestore validation (`validInitialAssessment`).
// Percentages never turn into a CEFR level automatically: levels and the overall status are the teacher's call.

export const GRAMMAR_TOPICS = [
  ['full_partial_object', 'Täis- ja osasihitis'], ['verb_rections', 'Tegusõna rektsioonid'], ['case_choice', 'Käändevalik'],
  ['word_order', 'Sõnajärg'], ['perfect_tense', 'Täisminevik'], ['pluperfect_tense', 'Enneminevik'],
  ['case_formation', 'Käändevormide moodustamine'], ['verb_tenses', 'Tegusõna ajavormid'], ['ma_da_infinitive', 'ma- ja da-infinitiiv'],
  ['comparison', 'Võrdlusastmed'], ['numerals_cases', 'Arvsõnad ja käänded'], ['conditional', 'Tingiv kõneviis'],
  ['quotative', 'Kaudne kõneviis'], ['impersonal', 'Umbisikuline tegumood'], ['participles', 'Kesksõnad'],
  ['conjunctions', 'Sidendid ja keerukad laused'], ['relative_clauses', 'Relatiivlaused'], ['adpositions', 'Kaassõnad'],
  ['negation', 'Eitus'], ['word_formation', 'Sõnamoodustus'],
];

export const VOCABULARY_TOPICS = [
  ['education', 'Haridus ja õppimine'], ['work', 'Töö ja karjäär'], ['society', 'Ühiskond ja sotsiaalsed suhted'],
  ['health', 'Tervis ja eluviis'], ['environment', 'Keskkond'], ['technology', 'Tehnoloogia ja digielu'],
  ['media', 'Meedia ja teave'], ['culture', 'Kultuur ja vaba aeg'], ['travel', 'Reisimine ja transport'],
  ['home', 'Eluase ja olme'], ['shopping', 'Ostlemine ja teenused'], ['economy', 'Majandus ja raha'],
  ['public_services', 'Riik ja avalikud teenused'], ['communication', 'Suhted ja suhtlemine'],
  ['argumentation', 'Argumenteerimine ja abstraktne sõnavara'],
];

export const SKILLS = [
  ['grammar', 'Grammatika'], ['vocabulary', 'Sõnavara'], ['reading', 'Lugemine'],
  ['writing', 'Kirjutamine'], ['speaking', 'Rääkimine'], ['listening', 'Kuulamine'],
];

export const STATUSES = {
  not_tested: { label: 'Hindamata', tone: 'neutral' },
  needs_work: { label: 'Vajab tööd', tone: 'danger' },
  developing: { label: 'Areneb', tone: 'warning' },
  near_target: { label: 'Eesmärgi lähedal', tone: 'info' },
  target_reached: { label: 'Eesmärk saavutatud', tone: 'success' },
};
// Firestore accepts every status except "not tested" for the whole assessment.
export const OVERALL_STATUSES = ['needs_work', 'developing', 'near_target', 'target_reached'];

export const PRIORITIES = {
  very_high: 'Väga kõrge', high: 'Kõrge', medium: 'Keskmine', maintain: 'Hoida taset', low: 'Madal',
};

export const LIMITS = { topics: 60, skills: 20, notes: 30, focus: 6000, level: 40 };

const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const actorName = (actor) => text(actor?.displayName || actor?.name || actor?.email || '', 160);

export function normalizeScore(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number)));
}

export function statusForScore(score) {
  const value = normalizeScore(score);
  if (value === null) return 'not_tested';
  if (value < 55) return 'needs_work';
  if (value < 70) return 'developing';
  if (value < 85) return 'near_target';
  return 'target_reached';
}

const topicRows = (definitions) => definitions.map(([id, name]) => ({ id, name, score: null, status: 'not_tested', priority: 'medium', comment: '' }));
const skillRows = () => SKILLS.map(([id, name]) => ({ id, name, score: null, status: 'not_tested', comment: '' }));

export function buildInitialAssessment(student, actor, now = new Date().toISOString()) {
  return {
    studentId: student?.id || '',
    assessmentDate: now.slice(0, 10),
    currentLevel: text(student?.level, LIMITS.level),
    targetLevel: text(student?.targetLevel, LIMITS.level),
    overallStatus: 'needs_work',
    grammarData: topicRows(GRAMMAR_TOPICS),
    vocabularyData: topicRows(VOCABULARY_TOPICS),
    skillsData: skillRows(),
    strengths: [],
    developmentAreas: [],
    learningFocus: '',
    createdAt: now,
    updatedAt: now,
    createdByUid: actor?.uid || '',
    createdByName: actorName(actor),
    updatedByUid: actor?.uid || '',
    updatedByName: actorName(actor),
    version: 1,
  };
}

function normalizeRows(rows, withPriority, max) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    const score = normalizeScore(row?.score);
    const normalized = {
      id: text(row?.id, 80),
      name: text(row?.name, 160),
      score,
      status: STATUSES[row?.status] ? row.status : statusForScore(score),
      comment: text(row?.comment, 1000),
    };
    if (withPriority) normalized.priority = PRIORITIES[row?.priority] ? row.priority : 'medium';
    return normalized;
  }).filter((row) => row.id && row.name).slice(0, max);
}

const lines = (value) => (Array.isArray(value) ? value : String(value || '').split('\n')).map((item) => text(item, 300)).filter(Boolean).slice(0, LIMITS.notes);

// The exact document that is written (every key the rules require, nothing else). `existing` keeps the
// immutable creation fields.
export function assessmentPayload(draft, student, actor, existing = null, now = new Date().toISOString()) {
  const base = buildInitialAssessment(student, actor, now);
  const source = draft || {};
  return {
    studentId: student.id,
    assessmentDate: /^\d{4}-\d{2}-\d{2}$/.test(source.assessmentDate || '') ? source.assessmentDate : base.assessmentDate,
    currentLevel: text(source.currentLevel, LIMITS.level),
    targetLevel: text(source.targetLevel, LIMITS.level),
    overallStatus: OVERALL_STATUSES.includes(source.overallStatus) ? source.overallStatus : 'needs_work',
    grammarData: normalizeRows(source.grammarData ?? base.grammarData, true, LIMITS.topics),
    vocabularyData: normalizeRows(source.vocabularyData ?? base.vocabularyData, true, LIMITS.topics),
    skillsData: normalizeRows(source.skillsData ?? base.skillsData, false, LIMITS.skills),
    strengths: lines(source.strengths),
    developmentAreas: lines(source.developmentAreas),
    learningFocus: String(source.learningFocus || '').slice(0, LIMITS.focus),
    createdAt: existing?.createdAt || base.createdAt,
    updatedAt: now,
    createdByUid: existing ? (existing.createdByUid || '') : base.createdByUid,
    createdByName: existing ? (existing.createdByName || '') : base.createdByName,
    updatedByUid: actor?.uid || '',
    updatedByName: actorName(actor),
    version: 1,
  };
}

// Reading tolerates older/partial documents; missing tables fall back to the standard topics.
export function normalizeAssessment(data, student) {
  if (!data) return null;
  return {
    ...assessmentPayload(data, student, { uid: data.updatedByUid, displayName: data.updatedByName }, data, data.updatedAt || new Date().toISOString()),
    createdAt: data.createdAt || '',
  };
}

export function averageScore(rows = []) {
  const scores = rows.map((row) => row.score).filter((score) => score !== null && score !== undefined);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
}

// The next topics to work on: lowest scores first, then the teacher's priority.
export function focusTopics(assessment, limit = 5) {
  const rank = { very_high: 0, high: 1, medium: 2, maintain: 3, low: 4 };
  return [...(assessment?.grammarData || []), ...(assessment?.vocabularyData || [])]
    .filter((row) => row.score !== null && row.status !== 'target_reached')
    .sort((a, b) => a.score - b.score || (rank[a.priority] ?? 2) - (rank[b.priority] ?? 2))
    .slice(0, limit);
}

export function newTopicId(name, rows = []) {
  const slug = String(name || 'teema').toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'teema';
  const taken = new Set(rows.map((row) => row.id));
  let id = `custom_${slug}`;
  for (let index = 2; taken.has(id); index += 1) id = `custom_${slug}_${index}`;
  return id;
}
