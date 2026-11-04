// „Kiirküsimus” (quick poll / mini-game) of a Live Classroom room (owner 2026-11-04). The teacher asks one question with
// 2–4 options (or „Vali õige vorm”: a sentence with a gap and its forms), the students tap an answer, the teacher sees
// who answered what and reveals the right one. One doc per room `livePolls/{kind}_{roomId}` (a new question = the next
// `round`), the answers in `livePolls/{id}/answers/{uid}`, the right option only in the teacher's
// `livePolls/{id}/key/current` until „Näita vastust”. Pure helpers; Firestore in services/firebase/livePolls.js.

export const POLL_MODES = Object.freeze([
  { id: 'choice', label: 'Küsimus' },
  { id: 'gap', label: 'Vali õige vorm' },
]);
export const GAP = '___';
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 4;
export const QUESTION_MAX = 300;
export const OPTION_MAX = 120;
export const POLL_TIME_LIMITS = Object.freeze([
  { sec: 0, label: 'Ilma ajata' },
  { sec: 15, label: '15 s' },
  { sec: 30, label: '30 s' },
  { sec: 60, label: '1 min' },
  { sec: 120, label: '2 min' },
]);
export const POLL_TIMER_LABEL = 'Kiirküsimus';
export const GAP_DEFAULT_QUESTION = 'Vali õige vorm';

const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export const pollIdFor = (kind, roomId) => `${kind === 'group' ? 'group' : 'lesson'}_${roomId}`;

// a gap written as „...”, „…”, „__” or longer becomes the one marker ___
export function normalizeGap(sentence = '') {
  return clean(sentence, QUESTION_MAX).replace(/_{2,}|\.{3,}|…/g, GAP);
}

// the sentence around the first gap: [before, after] (no gap: [sentence, ''])
export function gapParts(sentence = '') {
  const text = String(sentence || '');
  const at = text.indexOf(GAP);
  if (at < 0) return [text, ''];
  return [text.slice(0, at), text.slice(at + GAP.length)];
}

/**
 * The teacher's form → the poll to start, or the first problem in plain Estonian.
 * input: { mode, question, sentence, options: string[], correctIndex, timeLimitSec }
 */
export function pollDraft(input = {}) {
  const mode = input.mode === 'gap' ? 'gap' : 'choice';
  const raw = Array.isArray(input.options) ? input.options : [];
  // empty option rows are dropped; the right one keeps pointing at the same text
  const kept = raw.map((text, index) => ({ text: clean(text, OPTION_MAX), index })).filter((item) => item.text);
  const options = kept.map((item) => item.text);
  const correctIndex = kept.findIndex((item) => item.index === Number(input.correctIndex));
  const sentence = mode === 'gap' ? normalizeGap(input.sentence) : '';
  const question = clean(input.question, QUESTION_MAX) || (mode === 'gap' ? GAP_DEFAULT_QUESTION : '');
  const timeLimitSec = POLL_TIME_LIMITS.some((item) => item.sec === Number(input.timeLimitSec)) ? Number(input.timeLimitSec) : 0;
  let error = '';
  if (mode === 'choice' && !question) error = 'Kirjuta küsimus.';
  else if (mode === 'gap' && !sentence.includes(GAP)) error = 'Kirjuta lause ja märgi lünk: ___';
  else if (options.length < MIN_OPTIONS) error = `Lisa vähemalt ${MIN_OPTIONS} vastusevarianti.`;
  else if (options.length > MAX_OPTIONS) error = `Kõige rohkem ${MAX_OPTIONS} vastusevarianti.`;
  else if (new Set(options.map((item) => item.toLocaleLowerCase('et'))).size !== options.length) error = 'Vastusevariandid peavad olema erinevad.';
  else if (correctIndex < 0) error = 'Märgi õige vastus.';
  if (error) return { ok: false, error };
  return { ok: true, value: { mode, question, sentence, options, correctIndex, timeLimitSec } };
}

const millis = (value) => value?.toMillis?.() || (Number.isFinite(value) ? value : Date.parse(value || '') || 0);

// a stored poll (missing fields filled), or null
export function normalizePoll(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const options = Array.isArray(raw.options) ? raw.options.map((item) => String(item ?? '')).slice(0, MAX_OPTIONS) : [];
  if (options.length < MIN_OPTIONS) return null;
  const status = ['open', 'revealed', 'closed'].includes(raw.status) ? raw.status : 'closed';
  const correctIndex = Number.isInteger(raw.correctIndex) && raw.correctIndex >= 0 && raw.correctIndex < options.length ? raw.correctIndex : -1;
  return {
    kind: raw.kind === 'group' ? 'group' : 'lesson',
    roomId: String(raw.roomId || ''),
    teacherUid: String(raw.teacherUid || ''),
    participantUids: Array.isArray(raw.participantUids) ? raw.participantUids.map(String) : [],
    round: Number.isInteger(raw.round) ? raw.round : 0,
    mode: raw.mode === 'gap' ? 'gap' : 'choice',
    question: String(raw.question || ''),
    sentence: String(raw.sentence || ''),
    options,
    timeLimitSec: Number.isInteger(raw.timeLimitSec) ? raw.timeLimitSec : 0,
    status,
    correctIndex: status === 'revealed' ? correctIndex : -1,
    startedAt: millis(raw.startedAt),
  };
}

export function normalizeAnswer(id, raw = {}) {
  return {
    uid: String(raw.uid || id || ''),
    name: String(raw.name || ''),
    round: Number.isInteger(raw.round) ? raw.round : 0,
    choice: Number.isInteger(raw.choice) ? raw.choice : -1,
    answeredAt: millis(raw.answeredAt),
  };
}

// answers of this round only (a student's doc keeps his answer of an older question until he answers the new one)
export const roundAnswers = (poll, answers = []) => (poll ? answers.filter((item) => item.round === poll.round && item.choice >= 0 && item.choice < poll.options.length) : []);

/**
 * The teacher's live view: per option the count and the names; who has not answered yet.
 * `names`: { uid: name } of the room's students (an answer carries its own name too).
 */
export function tallyAnswers(poll, answers = [], { correctIndex = -1, names = {} } = {}) {
  if (!poll) return { options: [], answered: 0, total: 0, missing: [], rows: [] };
  const current = roundAnswers(poll, answers).sort((a, b) => a.answeredAt - b.answeredAt);
  const nameOf = (item) => item.name || names[item.uid] || 'Õpilane';
  const options = poll.options.map((text, index) => {
    const who = current.filter((item) => item.choice === index);
    return { index, text, count: who.length, names: who.map(nameOf), correct: index === correctIndex };
  });
  const answeredUids = new Set(current.map((item) => item.uid));
  const missing = poll.participantUids.filter((uid) => !answeredUids.has(uid)).map((uid) => names[uid] || 'Õpilane');
  const rows = current.map((item) => ({
    uid: item.uid, name: nameOf(item), choice: item.choice, text: poll.options[item.choice],
    correct: correctIndex >= 0 ? item.choice === correctIndex : null,
  }));
  return { options, answered: current.length, total: poll.participantUids.length, missing, rows };
}

/** The student's card: 'answer' (choose), 'sent' (answered, waiting), 'right' / 'wrong' (revealed), 'missed'. */
export function studentPollState(poll, answer, { expired = false } = {}) {
  if (!poll || poll.status === 'closed') return 'none';
  const mine = answer && answer.round === poll.round && answer.choice >= 0 ? answer : null;
  if (poll.status === 'revealed') {
    if (!mine) return 'missed';
    return mine.choice === poll.correctIndex ? 'right' : 'wrong';
  }
  if (expired) return mine ? 'sent' : 'late';
  return mine ? 'sent' : 'answer';
}

// the question as one line (the gap shown as „___”), for lists and notes
export const pollTitle = (poll) => (poll?.mode === 'gap' ? [poll.question && poll.question !== GAP_DEFAULT_QUESTION ? poll.question : '', poll.sentence].filter(Boolean).join(' — ') : poll?.question || '');

// the text of a „Minu vead” note from a wrong answer (studentNotes `text`, ≤ 2000)
export function mistakeNoteText(poll, choice, correctIndex) {
  if (!poll) return '';
  const right = poll.options[correctIndex] || '';
  const given = poll.options[choice] || '';
  const lines = poll.mode === 'gap'
    ? [`Kiirküsimus: ${pollTitle(poll)}`, `Õige: ${gapParts(poll.sentence).join(right)}`, `Sinu vastus: ${given}`]
    : [`Kiirküsimus: ${poll.question}`, `Õige vastus: ${right}`, `Sinu vastus: ${given}`];
  return lines.join('\n').slice(0, 2000);
}

// the time limit runs out with the room's countdown (started with the poll, label „Kiirküsimus”)
export const pollTimeUp = (poll, timer) => Boolean(poll?.status === 'open' && poll.timeLimitSec > 0 && timer?.countdown?.label === POLL_TIMER_LABEL && timer.expired);

// a new question: the next round
export const nextRound = (poll) => (poll?.round || 0) + 1;
