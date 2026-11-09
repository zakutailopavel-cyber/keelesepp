// Grammar points of the practice engine. The ids are the course grammar plan's ids (admin/course/grammarPlan.js, the
// module grammar spine of docs/CEFR_A2_B1_LEARNING_STANDARD.md §7 and docs/METHODOLOGY_STANDARD.md §5), so an item can
// be counted against the plan of its level. `test` finds the point in a task's own title and instruction — the course
// author's words, never the learner's sentence. Pure.
import { GRAMMAR_PLAN } from '../../worksheet-generator/admin/course/grammarPlan.js';

// et: the grammar term as the course uses it; ru: the same term for a Russian-speaking learner (UI text, not course
// content); en for English speakers
export const GRAMMAR_POINTS = [
  { id: 'word-order', et: 'sõnajärg', ru: 'порядок слов', en: 'word order', test: /sõnajär|järjekorda|kuhu tuleb tegusõna|tegusõna (on )?teisel|lause kokku/i },
  { id: 'connectors', et: 'sidesõnad', ru: 'союзы и связки', en: 'linking words', test: /sidesõn|sidend|\bsest\b|\bkuna\b|seepärast|sellepärast|seetõttu|mistõttu|kuigi|ühenda (kaks )?lause|põhjus ja tagajärg/i },
  { id: 'relative', et: 'kes/mis-kõrvallause', ru: 'придаточное с kes/mis', en: 'kes/mis clauses', test: /kõrvallause|relatiiv|\bkes\b-?lause|\bmis\b-?lause|\bkes\b ja \bmis\b|kes-, mis-/i },
  { id: 'if-clauses', et: 'kui-lause', ru: 'условное придаточное (kui…)', en: 'kui clauses', test: /kui-lause|kui …,? siis|kui\.\.\.,? siis|tingimuslause/i },
  { id: 'quotative', et: 'kaudne kõne ja kaudne kõneviis', ru: 'косвенная речь, косвенное наклонение', en: 'reported speech, quotative', test: /kaud\w* kõne|vat-vorm|refereeri|kaud\w* küsimus/i },
  { id: 'conditional', et: 'tingiv kõneviis', ru: 'условное наклонение', en: 'conditional', test: /tingiv|viisakam|viisakas palve|pehmenda/i },
  { id: 'imperative', et: 'käskiv kõneviis', ru: 'повелительное наклонение', en: 'imperative', test: /käskiv|käsk(e|u)/i },
  { id: 'past-simple', et: 'lihtminevik', ru: 'простое прошедшее', en: 'simple past', test: /lihtminevik|minevikku|minevikus|minevikuvorm/i },
  { id: 'perfect', et: 'täisminevik', ru: 'перфект (täisminevik)', en: 'perfect', test: /täisminevik/i },
  { id: 'pluperfect', et: 'enneminevik', ru: 'плюсквамперфект (enneminevik)', en: 'pluperfect', test: /enneminevik/i },
  { id: 'future', et: 'tuleviku väljendamine', ru: 'выражение будущего', en: 'future', test: /tulevik|hakkama \+|hakkan \+/i },
  { id: 'infinitives', et: 'ma- ja da-infinitiiv', ru: 'ma- и da-инфинитив', en: 'ma- and da-infinitive', test: /ma- (või|ja) da|ma-vorm|da-vorm|ma-infinitiiv|da-infinitiiv|ma- või da-/i },
  { id: 'ma-cases', et: 'mas-, mast-, mata-vorm', ru: 'формы на -mas, -mast, -mata', en: 'mas/mast/mata forms', test: /-mas\b|-mast\b|-mata\b|mas-vorm|mast-vorm|mata-vorm/i },
  { id: 'participles', et: 'kesksõnad, des-vorm, lauselühendid', ru: 'причастия, деепричастие (des), обороты', en: 'participles, des-form', test: /kesksõna|lauselühend|des-vorm|nud-vorm|tud-vorm|v-kesksõna/i },
  { id: 'impersonal', et: 'umbisikuline tegumood', ru: 'безличный залог', en: 'impersonal voice', test: /umbisikul|isikuline ja umbisikuline/i },
  { id: 'partitive', et: 'osastav', ru: 'частичный падеж (osastav)', en: 'partitive', test: /osastav|partitiiv|kogus(e)? \+/i },
  { id: 'genitive', et: 'omastav', ru: 'родительный падеж (omastav)', en: 'genitive', test: /omastav|kelle\?/i },
  { id: 'locatives', et: 'kohakäänded (kus? kuhu? kust?)', ru: 'местные падежи (где? куда? откуда?)', en: 'local cases', test: /kohakää|kohavorm|kus\?|kuhu\?|kust\?|sisseütlev|seesütlev|seestütlev|alaleütlev|alalütlev|alaltütlev/i },
  { id: 'object', et: 'täis- ja osasihitis', ru: 'полное и частичное дополнение', en: 'total and partial object', test: /sihitis|täis- ja osa/i },
  { id: 'subject', et: 'täis- ja osaalus', ru: 'полное и частичное подлежащее', en: 'total and partial subject', test: /\balus\b|osaalus|täisalus/i },
  { id: 'government', et: 'rektsioon (mida tegusõna nõuab)', ru: 'управление (какой падеж требует глагол)', en: 'verb government', test: /rektsioon|nõuab oma kääne|mida (eelnev )?(tegusõna|omadussõna|kaassõna)( või kaassõna)? nõuab|kaassõna/i },
  { id: 'translative', et: 'saav kääne', ru: 'превратительный падеж (saav)', en: 'translative', test: /saav(a|as)? kää|saavas|muutumine|muutuma \+/i },
  { id: 'essive', et: 'olev kääne', ru: 'существительный падеж (olev)', en: 'essive', test: /olev(a|as)? kää|olevas/i },
  { id: 'plural', et: 'mitmus', ru: 'множественное число', en: 'plural', test: /mitmus/i },
  { id: 'negation', et: 'eitus', ru: 'отрицание', en: 'negation', test: /eitus|eitav|eitavaks/i },
  { id: 'comparison', et: 'võrdlemine (keskvõrre, ülivõrre)', ru: 'сравнение (степени)', en: 'comparison', test: /võrdl|keskvõrre|ülivõrre/i },
  { id: 'nominalisation', et: 'nimisõnastamine (-mine, -ja)', ru: 'отглагольные существительные (-mine, -ja)', en: 'nominalisation', test: /-mine|mine-nimisõna|nimisõnal|nominalis/i },
  { id: 'clitics', et: '-ki / -gi', ru: 'частица -ki / -gi', en: '-ki / -gi', test: /-ki\b|-gi\b/i },
  { id: 'particle-verbs', et: 'ühendverbid', ru: 'составные глаголы', en: 'particle verbs', test: /ühendverb/i },
  { id: 'agreement', et: 'omadussõna ühildumine', ru: 'согласование прилагательного', en: 'adjective agreement', test: /ühildu/i },
  { id: 'numerals', et: 'arvsõnad', ru: 'числительные', en: 'numerals', test: /arvsõna|järgarv|kellaaeg|number|kuupäev/i },
  { id: 'tenses', et: 'ajavormid', ru: 'времена глагола', en: 'tenses', test: /ajavorm|õiges ajas|sobivas ajas/i },
  { id: 'moods', et: 'kõneviisid', ru: 'наклонения глагола', en: 'verb moods', test: /kõneviisid|kõneviisis\b(?!.*kaudne)/i },
  { id: 'modality', et: 'kindluse väljendamine', ru: 'степень уверенности', en: 'certainty and modality', test: /kindlus|kindluse aste|modaalsus/i },
  { id: 'comitative', et: 'kaasaütlev ja ilmaütlev (-ga, -ta)', ru: 'совместный и лишительный падеж (-ga, -ta)', en: 'comitative and abessive (-ga, -ta)', test: /-ga asemele|ilma …-ta|kaasaütlev|ilmaütlev/i },
  { id: 'questions', et: 'küsilause', ru: 'вопросительное предложение', en: 'questions', test: /kirjuta küsimus|küsimuseks|paranda küsimus|küsisõna/i },
  { id: 'forms', et: 'sõna vorm lauses', ru: 'форма слова в предложении', en: 'word forms in context', test: /(?!)/ },
  { id: 'possessive-clause', et: 'omajalause (mul on)', ru: 'конструкция «у меня есть» (mul on)', en: 'possessive clause (mul on)', test: /omajalause|\bmul on\b/i },
  { id: 'register', et: 'register ja viisakus', ru: 'стиль и вежливость', en: 'register', test: /register|ametlik(us|uks)|nimisõnaline stiil|viisakalt|teie-vorm/i },
];

export const GRAMMAR_BY_ID = Object.fromEntries(GRAMMAR_POINTS.map((g) => [g.id, g]));

// the course plan names some points differently; a plan id counts the engine points listed here
export const PLAN_ALIASES = {
  linking: ['connectors'],
  cause: ['connectors'],
  connectors: ['connectors'],
  modals: ['infinitives'],
  pasts: ['past-simple', 'perfect', 'pluperfect'],
  tenses: ['past-simple', 'perfect', 'pluperfect'],
  nonfinite: ['participles', 'ma-cases'],
  'des-form': ['participles'],
  'participle-attributes': ['participles'],
  'complex-sentences': ['word-order', 'relative', 'if-clauses', 'connectors'],
  clauses: ['relative', 'if-clauses'],
  'reported-speech': ['quotative'],
  'indirect-questions': ['quotative'],
  'plural-cases': ['plural'],
  'short-illative': ['locatives'],
  'possessive-clause': ['possessive-clause'],
  change: ['translative'],
  moods: ['conditional', 'impersonal', 'quotative'],
  voice: ['impersonal'],
  cases: ['government', 'partitive', 'genitive', 'locatives'],
};
export const planPoints = (planId) => PLAN_ALIASES[planId] || [planId];

// grammar term of a point in the learner's language (falls back to Estonian)
export function grammarLabel(id, lang = 'et') {
  const g = GRAMMAR_BY_ID[id];
  if (g) return g[lang] || g.et;
  const plan = Object.values(GRAMMAR_PLAN).flat().find((p) => p.id === id);
  return plan?.label || id;
}

// linking words — a gap whose answer is one of them is a connector choice
export const CONNECTORS = new Set([
  'ja', 'aga', 'või', 'ega', 'sest', 'kuna', 'et', 'kui', 'kuigi', 'kuid', 'ent', 'vaid', 'siis', 'seega', 'seepärast',
  'sellepärast', 'sellepärast et', 'seetõttu', 'mistõttu', 'mispärast', 'niisiis', 'järelikult', 'samas', 'samal ajal',
  'enne kui', 'pärast seda kui', 'kuni', 'kuniks', 'nagu', 'nii et', 'selleks et', 'ometi', 'siiski', 'ka', 'samuti',
  'lisaks', 'peale selle', 'teisalt', 'ühelt poolt', 'teiselt poolt', 'kuigi', 'olgugi et', 'vaatamata sellele',
  'sellegipoolest', 'kes', 'mis', 'kas', 'seejärel', 'lõpuks', 'kõigepealt', 'esiteks', 'teiseks', 'kokkuvõttes', 'näiteks', 'tegelikult', 'muide', 'ehk',
]);
export const isConnector = (word) => CONNECTORS.has(String(word || '').trim().toLocaleLowerCase('et'));

// the grammar points a task's own wording names
export function detectGrammar(text) {
  const s = String(text || '');
  return GRAMMAR_POINTS.filter((g) => g.test.test(s)).map((g) => g.id);
}

// the points the course plan says a lesson teaches (by level key a2/b1/b2/c1)
const LESSON_PLAN = new Map();
for (const [level, items] of Object.entries(GRAMMAR_PLAN)) {
  for (const item of items) {
    for (const lessonId of item.lessons) {
      const key = `${level}:${lessonId}`;
      LESSON_PLAN.set(key, [...(LESSON_PLAN.get(key) || []), planPoints(item.id)[0]]);
    }
  }
}
export const plannedGrammar = (course, lessonId) => LESSON_PLAN.get(`${course}:${lessonId}`) || [];
