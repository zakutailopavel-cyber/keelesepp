'use strict';
// „Kuu monoloog” on the school Mac: a student's monthly two-minute Estonian monologue
// (`studentMonologues/{studentId}_{YYYY-MM}`, audio `homework/{studentId}/monologues/{YYYY-MM}.{webm|m4a|ogg}`) becomes
// text with the same whisper models as the lessons, and the student's sentences get the same error check (GEC) as a
// lesson. Written by the worker through the Admin SDK (service account), so no Firestore rule lets anyone else set it.
//
// On the monologue doc (the student reads it too): transcript (text), words, wpm, transcribedAt, transcriber,
// transcriptModel, transcribedTake (= the take's updatedAt; a new take in the same month makes the text stale and it is
// done again). The error analysis is a model's guess and, like a lesson's, for staff only: it goes to
// `studentMonologueAnalysis/{monologueId}` { studentId, monologueId, month, take, errors, checked, focus, models,
// analyzedAt } (read: the card's teacher and admins; nobody writes it from the app). The monologue doc only gets
// `analyzedTake` (or `analysisError` + `analysisAttempts`) so the worker knows what is done.
// The I/O is injected (db, bucket-backed transcription, GEC) so the job selection and the writes are tested with mocks.
const { learnerSentences, judgeCorrection, isDismissed, errorTopics, wordsOf } = require('./analysis');

const COLLECTION = 'studentMonologues';
const ANALYSIS_COLLECTION = 'studentMonologueAnalysis';
const MAX_ATTEMPTS = 3;
// only these fields are read when looking for work (a transcript is never downloaded just to decide)
const SCAN_FIELDS = ['studentId', 'month', 'audioPath', 'seconds', 'updatedAt', 'createdAt', 'transcribedTake', 'transcribeError', 'transcribeErrorTake', 'transcribeAttempts', 'audioDeletedAt', 'analyzedTake', 'analysisError', 'analysisErrorTake', 'analysisAttempts'];

// the take a text belongs to: a re-record in the same month changes updatedAt (and only the take fields, by the rules)
const takeOf = (doc = {}) => String(doc.updatedAt || doc.createdAt || '');

function needsTranscript(doc = {}) {
  if (typeof doc.audioPath !== 'string' || !doc.audioPath || doc.audioDeletedAt) return false;
  const take = takeOf(doc);
  if (doc.transcribedTake === take) return false;
  // a broken file of this take is tried at most three times; a new take starts again
  if (doc.transcribeError && doc.transcribeErrorTake === take && (Number(doc.transcribeAttempts) || 1) >= MAX_ATTEMPTS) return false;
  return true;
}

function needsAnalysis(doc = {}) {
  const take = takeOf(doc);
  if (doc.transcribedTake !== take || doc.analyzedTake === take) return false;
  if (doc.analysisError && doc.analysisErrorTake === take && (Number(doc.analysisAttempts) || 1) >= MAX_ATTEMPTS) return false;
  return true;
}

// YYYY-MM of a date minus `days` (a re-take is only possible in the current month, +3 h for Tallinn)
function monthSince(now = new Date(), days = 40) {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// whisper lines of one track → the text the teacher reads (all languages, in time order) and the words spoken in
// Estonian (a Russian aside is shown but not counted)
function monologueText(lines = []) {
  const sorted = [...lines].sort((a, b) => (a.startMs || 0) - (b.startMs || 0));
  const transcript = sorted.map((l) => String(l.text || '').trim()).filter(Boolean).join(' ');
  const words = sorted.filter((l) => !l.lang || l.lang === 'et').reduce((n, l) => n + wordsOf(l.text), 0);
  return { transcript, words };
}

const wpmOf = (words, seconds) => (Number(seconds) >= 10 ? Math.round((words / Number(seconds)) * 60) : null);

function transcriptFields({ lines, seconds, take, host, model, now = new Date(), deleteField }) {
  const { transcript, words } = monologueText(lines);
  const wpm = wpmOf(words, seconds);
  return {
    transcript: transcript.slice(0, 20000), words, ...(wpm != null ? { wpm } : { wpm: deleteField() }),
    transcribedAt: now.toISOString(), transcriber: String(host || '').slice(0, 100), transcriptModel: model || '',
    transcribedTake: take, transcribeError: deleteField(), transcribeErrorTake: deleteField(), transcribeAttempts: deleteField(),
  };
}

// the learner's sentences (the whole monologue is the student's) checked one by one; same rules as a lesson
async function analyseText({ lines, gec, forms = null, dismissed = new Set() }) {
  const transcript = lines.map((l) => ({ ...l, speaker: 'student' }));
  const sentences = learnerSentences(transcript, 'et', forms);
  const errors = [];
  for (const s of sentences) {
    const corrected = String(await gec(s.text) || '').trim();
    const judged = judgeCorrection(s.text, corrected);
    if (judged && !isDismissed(dismissed, s.text, corrected)) errors.push({ startMs: s.startMs, said: s.text, corrected, kind: judged.kind });
  }
  const focus = errorTopics(errors).map(({ key, topic, count, examples }) => ({ key, topic, count, examples }));
  return { errors, checked: sentences.length, focus };
}

/**
 * deps: db (firebase-admin Firestore), transcribe(audioPath) → whisper lines, gec(sentence) → corrected text or null
 * when the GEC model is not there, forms() / dismissed() for the filters, deleteField() (FieldValue.delete), host,
 * model (file name), log, now().
 */
function createMonologueWorker(deps) {
  const { db, transcribe, deleteField, host = '', model = '', log = () => {}, now = () => new Date() } = deps;
  const forms = deps.forms || (async () => null);
  const dismissed = deps.dismissed || (async () => new Set());
  const col = () => db.collection(COLLECTION);

  // what needs work: recent months on every scan, all months when `all` (at start and hourly: old monologues recorded
  // before this worker learned them, or ones that waited for the GEC model)
  async function findJobs({ all = false, gecReady = false, limit = 5 } = {}) {
    const base = all ? col() : col().where('month', '>=', monthSince(now()));
    const snap = await base.select(...SCAN_FIELDS).get();
    const docs = snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }));
    const transcribe = docs.filter(needsTranscript).map((d) => ({ kind: 'transcribe', ...d }));
    const analyse = gecReady ? docs.filter(needsAnalysis).map((d) => ({ kind: 'analyse', ...d })) : [];
    // newest month first: a teacher is most likely waiting for this month's
    return [...transcribe, ...analyse].sort((a, b) => String(b.month).localeCompare(String(a.month))).slice(0, limit);
  }

  // writes only when the take is still the one that was worked on (the student may record again meanwhile)
  async function writeIfSameTake(ref, take, fields) {
    return db.runTransaction(async (tx) => {
      const fresh = await tx.get(ref);
      if (!fresh.exists || takeOf(fresh.data()) !== take) return false;
      tx.update(ref, fields);
      return true;
    });
  }

  async function transcribeOne(job) {
    const take = takeOf(job);
    try {
      const lines = await transcribe(job.audioPath);
      const ok = await writeIfSameTake(job.ref, take, transcriptFields({ lines, seconds: job.seconds, take, host, model, now: now(), deleteField }));
      log(ok ? 'monologue text' : 'monologue re-recorded meanwhile', job.id);
      return ok ? lines : null;
    } catch (err) {
      const attempts = (job.transcribeErrorTake === take ? Number(job.transcribeAttempts) || 0 : 0) + 1;
      await writeIfSameTake(job.ref, take, { transcribeError: String(err.message || err).slice(0, 300), transcribeErrorTake: take, transcribeAttempts: attempts });
      log('monologue failed', job.id, err.message);
      return null;
    }
  }

  async function analyseOne(job, gec, linesKnown = null) {
    const take = takeOf(job);
    try {
      let lines = linesKnown;
      if (!lines) {
        // the doc keeps only the text: its sentences are checked (no times, no per-line language)
        const full = (await job.ref.get()).data() || {};
        if (takeOf(full) !== take) return false;
        lines = [{ speaker: 'student', startMs: 0, text: String(full.transcript || ''), lang: 'et' }];
      }
      const result = await analyseText({ lines, gec, forms: await forms(), dismissed: await dismissed() });
      const analyzedAt = now().toISOString();
      const ok = await writeIfSameTake(job.ref, take, { analyzedTake: take, analysisError: deleteField(), analysisErrorTake: deleteField(), analysisAttempts: deleteField() });
      if (!ok) return false;
      await db.collection(ANALYSIS_COLLECTION).doc(job.id).set({
        studentId: job.studentId, monologueId: job.id, month: job.month, take, ...result, models: { gec: deps.gecModel || 'gec' }, analyzedAt,
      });
      log('monologue analysed', job.id, `${result.errors.length} errors`);
      return true;
    } catch (err) {
      const attempts = (job.analysisErrorTake === take ? Number(job.analysisAttempts) || 0 : 0) + 1;
      await writeIfSameTake(job.ref, take, { analysisError: String(err.message || err).slice(0, 300), analysisErrorTake: take, analysisAttempts: attempts }).catch(() => {});
      log('monologue analysis failed', job.id, err.message);
      return false;
    }
  }

  // one pass: text first; the analysis right after it when the GEC model is there (else on a later pass)
  async function work({ all = false, gec = null } = {}) {
    const jobs = await findJobs({ all, gecReady: Boolean(gec) });
    for (const job of jobs) {
      if (job.kind === 'transcribe') {
        const lines = await transcribeOne(job);
        if (lines && gec) await analyseOne(job, gec, lines);
      } else await analyseOne(job, gec);
    }
    return jobs.length;
  }

  return { findJobs, transcribeOne, analyseOne, work };
}

module.exports = { COLLECTION, ANALYSIS_COLLECTION, SCAN_FIELDS, MAX_ATTEMPTS, takeOf, needsTranscript, needsAnalysis, monthSince, monologueText, wpmOf, transcriptFields, analyseText, createMonologueWorker };
