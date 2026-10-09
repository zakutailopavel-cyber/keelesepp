'use strict';
// KeeleSepp lesson transcriber: runs on the school Mac, free (whisper.cpp), no audio leaves our own Firebase.
// Loop: hand over forgotten recordings → transcribe "uploaded" ones → delete audio older than 60 days.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, spawn } = require('node:child_process');
const { promisify } = require('node:util');
const admin = require('firebase-admin');
const { ekiEvaluate, summarizeEvaluation, sentencesOf, ekiGrammar, loadDidactics, hardWords, wordsOf, readingPrompt, parseReading, simplifyPrompt, petLessonStats, sentencesPrompt, parseSentences, withoutGap, lessonParts, joinedTranscript, partsFinished, ANALYSIS_VERSION, learnerSentences, isCorrection, GEC_PROMPT, summaryPrompt, parseSummary, needsAnalysis } = require('./analysis');
const { parseWhisperJson, mergeDialogue, isAudioExpired, isAbandoned, isStaleTranscribing, pickModel, workerId, heartbeat, parseVadSegments, groupChunks, parseDetectedLanguage, chooseLanguage } = require('./lib');

const run = promisify(execFile);
const env = (k, d) => process.env[k] || d;
const BUCKET = env('FIREBASE_STORAGE_BUCKET', 'keelesepp-5136b.firebasestorage.app');
const WHISPER = env('WHISPER_BIN', '/opt/homebrew/bin/whisper-cli');
const VAD_BIN = env('WHISPER_VAD_BIN', path.join(path.dirname(WHISPER), 'whisper-vad-speech-segments'));
const MODEL = env('WHISPER_MODEL', path.join(os.homedir(), 'KeeleSeppTranscriber', 'models', 'ggml-large-v3-turbo.bin'));
// TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604 (MIT), ggml file from its Hugging Face repo
const MODEL_ET = env('WHISPER_MODEL_ET', path.join(path.dirname(MODEL), 'ggml-taltech-et-verbatim-2604.bin'));
const modelFor = (lang) => pickModel(lang, { et: MODEL_ET, general: MODEL }, fs.existsSync);
const VAD_MODEL = env('WHISPER_VAD_MODEL', path.join(path.dirname(MODEL), 'ggml-silero-v5.1.2.bin'));
const FFMPEG = env('FFMPEG_BIN', fs.existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg');
const THREADS = env('WHISPER_THREADS', String(Math.max(2, os.cpus().length - 2)));
const EVERY_MS = Number(env('POLL_SECONDS', '60')) * 1000;
// during a lesson the new 5-min files (and „Tekst kohe”) are looked for this often
const LIVE_MS = Number(env('LIVE_POLL_SECONDS', '15')) * 1000;
const log = (...a) => console.log(new Date().toISOString(), ...a);
const HOST = os.hostname().replace(/\.local$/, '');
const STARTED_AT = new Date().toISOString();

admin.initializeApp({ storageBucket: BUCKET }); // credentials: GOOGLE_APPLICATION_CREDENTIALS
const db = admin.firestore();
const bucket = admin.storage().bucket();

async function claim() {
  const snap = await db.collection('lessonRecordings').where('status', '==', 'uploaded').limit(3).get();
  const mine = [];
  for (const d of snap.docs) {
    const ok = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(d.ref);
      if (fresh.data()?.status !== 'uploaded') return false;
      tx.update(d.ref, { status: 'transcribing', transcribeStartedAt: new Date().toISOString(), transcriber: os.hostname() });
      return true;
    });
    if (ok) mine.push({ id: d.id, ref: d.ref, ...d.data() });
  }
  return mine;
}

// One track segment (5 min of one speaker): speech is cut into chunks (VAD), the language of each chunk is detected
// (Estonian → TalTech's Estonian model, Russian / English → the general model) and every chunk is transcribed on its
// own without carrying text from the previous one (-mc 0), which stops whisper's repetition loops.
async function transcribeSegment(seg, lessonLang, dir) {
  const src = path.join(dir, path.basename(seg.path));
  const wav = `${src}.wav`;
  await bucket.file(seg.path).download({ destination: src });
  await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', src, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav]);
  const totalMs = Math.round(((fs.statSync(wav).size - 44) / 32000) * 1000);
  let chunks = [{ startMs: 0, endMs: totalMs }];
  if (fs.existsSync(VAD_BIN) && fs.existsSync(VAD_MODEL)) {
    const { stdout } = await run(VAD_BIN, ['-vm', VAD_MODEL, '-f', wav], { maxBuffer: 16 * 1024 * 1024 });
    chunks = groupChunks(parseVadSegments(stdout), { totalMs });
  }
  const lines = [];
  for (const [index, chunk] of chunks.entries()) {
    if (chunk.endMs - chunk.startMs < 400) continue;
    const piece = `${src}.${index}.wav`;
    await run(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(chunk.startMs / 1000), '-t', String((chunk.endMs - chunk.startMs) / 1000), '-i', wav, '-c', 'copy', piece]);
    const detect = await run(WHISPER, ['-m', MODEL, '-l', 'auto', '-dl', '-t', THREADS, '-f', piece], { maxBuffer: 16 * 1024 * 1024 }).catch((err) => err);
    const lang = chooseLanguage(parseDetectedLanguage(`${detect?.stderr || ''}${detect?.stdout || ''}`), lessonLang, { ruMin: seg.track === 'student' ? 0.8 : 0.5 });
    // -ojf: token probabilities, so words whisper was unsure of are marked in the transcript
    await run(WHISPER, ['-m', modelFor(lang), '-l', lang, '-t', THREADS, '-f', piece, '-ojf', '-of', piece, '-np', '-mc', '0', '-sns'], { maxBuffer: 64 * 1024 * 1024 });
    const json = JSON.parse(fs.readFileSync(`${piece}.json`, 'utf8'));
    lines.push(...parseWhisperJson(json, { speaker: seg.track, offsetMs: (seg.startMs || 0) + chunk.startMs }).map((line) => ({ ...line, lang })));
    progress();
  }
  return lines;
}

// heartbeat for the lesson room („Transkribeerija töötab”); a failed write never stops the work
let current = { state: 'idle', recordingId: '' };
async function beat() {
  try {
    await db.collection('transcriberStatus').doc(workerId(HOST)).set(heartbeat({ host: HOST, startedAt: STARTED_AT, ...current }));
  } catch (err) { log('heartbeat error', err.message); }
}

// keep the Mac awake while a lesson is being transcribed (macOS caffeinate; ignored elsewhere)
function stayAwake() {
  if (process.platform !== 'darwin') return () => {};
  try {
    const child = spawn('/usr/bin/caffeinate', ['-i', '-w', String(process.pid)], { stdio: 'ignore' });
    child.on('error', () => {});
    return () => child.kill();
  } catch { return () => {}; }
}

// Segments already turned into text during the lesson (`doneSegments`, raw lines in `rawLines`) are not done again.
const segmentsLeft = (rec) => [...(rec.segments || [])]
  .filter((seg) => !(rec.doneSegments || []).includes(seg.path))
  .sort((a, b) => a.startMs - b.startMs);

async function transcribe(rec) {
  current = { state: 'transcribing', recordingId: rec.id };
  await beat();
  const awake = stayAwake();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ks-rec-${rec.id}-`));
  const started = Date.now();
  try {
    const lines = [...(rec.rawLines || [])];
    for (const seg of segmentsLeft(rec)) {
      lines.push(...await transcribeSegment(seg, rec.language || 'et', dir));
    }
    const transcript = mergeDialogue(lines);
    await rec.ref.update({
      rawLines: lines, doneSegments: (rec.segments || []).map((seg) => seg.path),
      status: 'done', transcript, transcribedAt: new Date().toISOString(),
      transcriptModel: path.basename(modelFor(rec.language || 'et')), transcribeSeconds: Math.round((Date.now() - started) / 1000), error: admin.firestore.FieldValue.delete(),
    });
    log('done', rec.id, `${transcript.length} lines`);
  } catch (err) {
    await rec.ref.update({ status: 'failed', error: String(err.message || err).slice(0, 500), failedAt: new Date().toISOString() });
    log('failed', rec.id, err.message);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    awake();
    current = { state: 'idle', recordingId: '' };
    await beat();
  }
}

async function handOverAbandoned() {
  const snap = await db.collection('lessonRecordings').where('status', '==', 'recording').get();
  for (const d of snap.docs) {
    if (isAbandoned(d.data())) { await d.ref.update({ status: 'uploaded', endedAt: d.data().updatedAt || new Date().toISOString(), abandoned: true }); log('handed over', d.id); }
  }
  // work a dead transcriber had taken (this Mac restarted, or the claim is hours old) goes back to the queue
  const stuck = await db.collection('lessonRecordings').where('status', '==', 'transcribing').get();
  for (const d of stuck.docs) {
    if (isStaleTranscribing(d.data(), { host: os.hostname(), startedAt: STARTED_AT })) { await d.ref.update({ status: 'uploaded', requeuedAt: new Date().toISOString() }); log('requeued', d.id); }
  }
}

// Watchdog: after a network outage a Firestore call may hang forever (seen 2026-10-09). Without progress for this
// long the program exits and launchd (KeepAlive) starts it again.
const STALL_MS = 30 * 60 * 1000;
let lastProgress = Date.now();
const progress = () => { lastProgress = Date.now(); };
function watchdog() {
  if (Date.now() - lastProgress > STALL_MS) { log('no progress for 30 min, restarting'); process.exit(1); }
}

async function deleteOldAudio() {
  for (const status of ['done', 'failed']) {
    const snap = await db.collection('lessonRecordings').where('status', '==', status).get();
    for (const d of snap.docs) {
      if (!isAudioExpired(d.data())) continue;
      await bucket.deleteFiles({ prefix: `lessonRecordings/${d.id}/` });
      await d.ref.update({ audioDeletedAt: new Date().toISOString() });
      log('audio deleted', d.id);
    }
  }
}

// While a lesson is still being recorded: every new 5-min file (or the one closed by „Tekst kohe”) becomes text right
// away, so the teacher sees it in the room. A „Tekst kohe” request goes first.
async function liveWork() {
  const snap = await db.collection('lessonRecordings').where('status', '==', 'recording').get();
  const live = snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }))
    .filter((rec) => segmentsLeft(rec).length)
    .sort((a, b) => String(b.textRequestedAt || '').localeCompare(String(a.textRequestedAt || '')));
  for (const rec of live) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ks-live-${rec.id}-`));
    current = { state: 'transcribing', recordingId: rec.id };
    try {
      for (const seg of segmentsLeft(rec)) {
        const lines = await transcribeSegment(seg, rec.language || 'et', dir);
        // read again: other segments may have been added meanwhile; only this segment's text is appended
        const fresh = (await rec.ref.get()).data() || {};
        const raw = [...(fresh.rawLines || []), ...lines];
        await rec.ref.update({
          rawLines: raw, transcript: mergeDialogue(raw),
          doneSegments: admin.firestore.FieldValue.arrayUnion(seg.path), textDoneAt: new Date().toISOString(),
        });
        log('live', rec.id, seg.path, `${lines.length} lines`);
      }
    } catch (err) {
      log('live error', rec.id, err.message);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      current = { state: 'idle', recordingId: '' };
    }
  }
}

// ── didactic analysis (local Ollama; skipped quietly when Ollama is not running) ──
const OLLAMA = env('OLLAMA_URL', 'http://127.0.0.1:11434');
const GEC_MODEL = env('GEC_MODEL', 'llammas-gec');
const SUMMARY_MODEL = env('SUMMARY_MODEL', 'gemma3:12b');
async function ollama(body, timeoutMs = 10 * 60 * 1000) {
  const res = await fetch(`${OLLAMA}/api/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stream: false, ...body }), signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  return (await res.json()).response || '';
}
async function ollamaModels() {
  try {
    const res = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(5000) });
    return res.ok ? ((await res.json()).models || []).map((m) => m.name.replace(/:latest$/, '')) : [];
  } catch { return []; }
}

// the learner's pet gets the lesson's simple numbers and his own corrected sentences (petLessonStats/{first part})
async function writePetStats(parts, transcript, errors, lang) {
  const stats = petLessonStats({ parts, transcript, errors, lang });
  if (!stats) return;
  await db.collection('petLessonStats').doc(parts[0].id).set({ ...stats, updatedAt: new Date().toISOString() });
}
// lessons analysed before the pet got its numbers: written once, no model needed
async function backfillPetStats() {
  const snap = await db.collection('lessonRecordings').where('status', '==', 'done').get();
  for (const d of snap.docs) {
    const a = d.data().analysis;
    if (!Array.isArray(a?.parts) || a.parts[0] !== d.id || a.petStatsAt) continue;
    const parts = (await Promise.all(a.parts.map((id) => db.collection('lessonRecordings').doc(id).get())))
      .filter((x) => x.exists).map((x) => ({ id: x.id, ref: x.ref, ...x.data() }))
      .sort((x, y) => String(x.startedAt).localeCompare(String(y.startedAt)));
    await writePetStats(parts, joinedTranscript(parts), a.errors || [], d.data().language || 'et');
    await d.ref.update({ 'analysis.petStatsAt': new Date().toISOString() });
    log('pet stats', d.id);
  }
}

// one finished recording per tick: the learner's errors (GEC) and the summary for the teacher, saved as `analysis`
async function analyzeNext() {
  if (env('ANALYSIS', 'on') === 'off') return;
  const models = await ollamaModels();
  const hasGec = models.includes(GEC_MODEL);
  const hasSummary = models.includes(SUMMARY_MODEL);
  if (!hasGec && !hasSummary) return;
  const snap = await db.collection('lessonRecordings').where('status', '==', 'done').get();
  const done = snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() })).filter(needsAnalysis)
    .sort((a, b) => String(b.endedAt || b.startedAt || '').localeCompare(String(a.endedAt || a.startedAt || '')));
  // one lesson = all parts of its invitation that day (a reload starts a new recording); wait until all are finished
  let rec = null;
  let parts = [];
  for (const candidate of done) {
    const sameInvitation = candidate.invitationId
      ? (await db.collection('lessonRecordings').where('invitationId', '==', candidate.invitationId).get()).docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }))
      : [candidate];
    const group = lessonParts(candidate, sameInvitation);
    if (partsFinished(group)) { rec = candidate; parts = group; break; }
  }
  if (!rec) return;
  const transcript = joinedTranscript(parts);
  const ids = parts.map((p) => p.id);
  current = { state: 'analyzing', recordingId: rec.id, recordingIds: ids, detail: 'alustan' };
  await beat();
  const started = Date.now();
  try {
    const errors = [];
    if (hasGec) {
      const sentences = learnerSentences(transcript, rec.language || 'et');
      for (const [i, s] of sentences.entries()) {
        if (i % 8 === 0) { current = { ...current, detail: `vead ${i}/${sentences.length}` }; await beat(); }
        const corrected = (await ollama({ model: GEC_MODEL, prompt: GEC_PROMPT(s.text), raw: true, options: { temperature: 0, num_predict: 200, stop: ['\n', '###'] } }, 60 * 1000)).trim();
        if (isCorrection(s.text, corrected)) errors.push({ startMs: s.startMs, said: s.text, corrected, ...(s.unsure ? { unsure: true } : {}) });
        progress();
      }
    }
    let summary = null;
    if (hasSummary) {
      current = { ...current, detail: 'kokkuvõte' };
      await beat();
      summary = parseSummary(await ollama({ model: SUMMARY_MODEL, prompt: summaryPrompt(transcript), format: 'json', options: { temperature: 0.2, num_ctx: 32768 } }));
      progress();
    }
    // the whole lesson's analysis goes on its first part; the other parts only point to it
    const analyzedAt = new Date().toISOString();
    const [first, ...rest] = parts;
    await first.ref.update({ analysis: {
      version: ANALYSIS_VERSION, parts: parts.map((p) => p.id), errors, ...(summary ? { summary } : {}),
      models: { ...(hasGec ? { gec: GEC_MODEL } : {}), ...(hasSummary ? { summary: SUMMARY_MODEL } : {}) },
      analyzedAt, petStatsAt: analyzedAt, seconds: Math.round((Date.now() - started) / 1000),
    } });
    for (const part of rest) await part.ref.update({ analysis: { version: ANALYSIS_VERSION, partOf: first.id, analyzedAt } });
    await writePetStats(parts, transcript, errors, rec.language || 'et');
    log('analyzed', first.id, `${parts.length} part(s)`, `${errors.length} errors`, summary ? 'summary' : 'no summary');
  } catch (err) {
    // saved so a broken recording is not tried again every minute; a new ANALYSIS_VERSION retries all
    await rec.ref.update({ analysis: { version: ANALYSIS_VERSION, error: String(err.message || err).slice(0, 300), analyzedAt: new Date().toISOString() } });
    log('analysis failed', rec.id, err.message);
  } finally {
    current = { state: 'idle', recordingId: '' };
  }
}

// „Paku laused” from the constructor: answered right away (checked every loop, before transcription waits)
async function answerAiRequests() {
  const snap = await db.collection('aiRequests').where('status', '==', 'new').limit(3).get();
  if (snap.empty) return;
  const models = await ollamaModels();
  for (const d of snap.docs) {
    // writing needs gemma3; the EKI evaluation needs nothing local; a learner text uses the GEC model when it is there
    if (['sentences', 'reading'].includes(d.data().kind) && !models.includes(SUMMARY_MODEL)) continue;
    const claimed = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(d.ref);
      if (fresh.data()?.status !== 'new') return false;
      tx.update(d.ref, { status: 'working', startedAt: new Date().toISOString() });
      return true;
    });
    if (!claimed) continue;
    const req = d.data();
    try {
      const did = await loadDidactics();
      const key = did ? did.levelKey(req.level) : 'A2';
      const norm = did?.LEVELS?.[key] || null;
      // what the learner already knows: EKI's grammar profile (the levels before), else levels.js GRAMMAR
      const eki = did?.grammarProfile ? ekiGrammar(did.grammarProfile, key) : null;
      const grammarList = eki ? [...eki.known.slice(-6), ...eki.targets.slice(0, 6)] : did ? did.LEVEL_ORDER.slice(0, did.LEVEL_ORDER.indexOf(key) + 1).flatMap((l) => did.GRAMMAR[l] || []) : [];
      const gec = async (sentence) => {
        if (!models.includes(GEC_MODEL)) return '';
        const corrected = (await ollama({ model: GEC_MODEL, prompt: GEC_PROMPT(sentence), raw: true, options: { temperature: 0, num_predict: 200, stop: ['\n', '###'] } }, 60 * 1000)).trim();
        return isCorrection(sentence, corrected) ? corrected : '';
      };
      if (req.kind === 'evaluate') {
        const result = summarizeEvaluation(await ekiEvaluate(req.text), req.level);
        await d.ref.update({ status: 'done', result, doneAt: new Date().toISOString() });
        log('ai evaluate', d.id, `${result.words} words`);
        continue;
      }
      if (req.kind === 'learnerText') {
        // a learner's written answer: TartuNLP corrections per sentence + the EKI levels of what he used
        const corrections = [];
        const sentences = sentencesOf(req.text).slice(0, 40);
        for (const sentence of sentences) {
          const corrected = await gec(sentence);
          if (corrected) corrections.push({ said: sentence, corrected });
          progress();
        }
        const evaluation = await ekiEvaluate(req.text).then((data) => summarizeEvaluation(data, req.level)).catch(() => null);
        const result = { sentences: sentences.length, corrections, ...(evaluation ? { evaluation } : {}) };
        await d.ref.update({ status: 'done', result, doneAt: new Date().toISOString(), models: { ...(models.includes(GEC_MODEL) ? { check: GEC_MODEL } : {}), ...(evaluation ? { levels: 'EKI etLex' } : {}) } });
        log('ai learner text', d.id, `${sentences.length} sentences`, `${corrections.length} corrections`);
        continue;
      }
      if (req.kind === 'reading') {
        let reading = parseReading(await ollama({ model: SUMMARY_MODEL, prompt: readingPrompt({ ...req, norm }), format: 'json', options: { temperature: 0.6, num_ctx: 8192 } }, 4 * 60 * 1000));
        if (!reading) throw new Error('Mudel ei kirjutanud sobivat teksti. Proovi uuesti.');
        let hard = hardWords(reading.passage, key, did?.forms);
        // too many words above the level: one simplification round
        if (hard.length > wordsOf(reading.passage) * 0.08) {
          const simpler = await ollama({ model: SUMMARY_MODEL, prompt: simplifyPrompt(reading.passage, hard, norm?.label || key), format: 'json', options: { temperature: 0.3, num_ctx: 8192 } }, 4 * 60 * 1000).catch(() => '');
          try { const text = String(JSON.parse(simpler).tekst || '').trim(); if (wordsOf(text) >= wordsOf(reading.passage) * 0.6) { reading = { ...reading, passage: text }; hard = hardWords(text, key, did?.forms); } } catch { /* keep the first text */ }
        }
        const flagged = [];
        for (const sentence of reading.passage.split(/(?<=[.!?…])\s+/).filter((x) => wordsOf(x) >= 3).slice(0, 30)) {
          const suggestion = await gec(sentence);
          if (suggestion) flagged.push({ sentence, suggestion });
          progress();
        }
        const result = { ...reading, words: wordsOf(reading.passage), hard: hard.slice(0, 30), flagged, level: norm?.label || key };
        await d.ref.update({ status: 'done', result, doneAt: new Date().toISOString(), models: { write: SUMMARY_MODEL, ...(models.includes(GEC_MODEL) ? { check: GEC_MODEL } : {}) } });
        log('ai reading', d.id, `${result.words} words`, `${hard.length} hard`, `${flagged.length} flagged`);
        continue;
      }
      const count = Math.max(1, Math.min(12, Number(req.count) || 8));
      // twice as many as asked: what is too long or above the level is dropped
      const candidates = parseSentences(await ollama({ model: SUMMARY_MODEL, prompt: sentencesPrompt({ ...req, count: Math.min(20, count * 2), norm, grammarList }), format: 'json', options: { temperature: 0.5 } }, 3 * 60 * 1000), 20);
      const result = [];
      for (const text of candidates) {
        if (result.filter((r) => r.ok).length >= count) break;
        const plain = withoutGap(text);
        if (norm && wordsOf(plain) > norm.sentence.max) continue;
        const gapWord = (text.match(/\[([^\]]+)\]/) || [])[1] || '';
        const hard = hardWords(plain, key, did?.forms).filter((w) => !gapWord.toLocaleLowerCase('et').split(/\s+/).includes(w));
        if (hard.length > 1) continue;
        const suggestion = await gec(plain);
        result.push({ text, ok: !suggestion && !hard.length, ...(suggestion ? { suggestion } : {}), ...(hard.length ? { hard } : {}) });
        progress();
      }
      result.sort((a, b) => Number(b.ok) - Number(a.ok));
      result.splice(count);
      await d.ref.update({ status: 'done', result, doneAt: new Date().toISOString(), models: { write: SUMMARY_MODEL, ...(models.includes(GEC_MODEL) ? { check: GEC_MODEL } : {}) } });
      log('ai sentences', d.id, `${candidates.length} written`, `${result.length} kept`, `${result.filter((r) => !r.ok).length} flagged`);
    } catch (err) {
      await d.ref.update({ status: 'failed', error: String(err.message || err).slice(0, 300), doneAt: new Date().toISOString() });
      log('ai sentences failed', d.id, err.message);
    }
  }
}
async function deleteOldAiRequests() {
  const old = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const snap = await db.collection('aiRequests').where('createdAt', '<', old).limit(200).get();
  for (const d of snap.docs) await d.ref.delete();
}

async function tick() {
  await handOverAbandoned();
  for (const rec of await claim()) await transcribe(rec);
  // only when no lesson waits for its text: one analysis per tick
  try { await analyzeNext(); } catch (err) { log('analysis tick error', err.message); }
  try { await backfillPetStats(); } catch (err) { log('pet stats error', err.message); }
  if (new Date().getMinutes() < 2) { await deleteOldAudio(); await deleteOldAiRequests().catch(() => {}); } // about once an hour
}

async function main() {
  if (!fs.existsSync(MODEL)) throw new Error(`Whisper model not found: ${MODEL}`);
  log('lesson transcriber started', { bucket: BUCKET, model: path.basename(MODEL), modelEt: path.basename(modelFor('et')), vad: fs.existsSync(VAD_MODEL) });
  if (process.argv.includes('--once')) { await tick(); await deleteOldAudio(); return; }
  await beat();
  setInterval(beat, 60 * 1000).unref?.();
  setInterval(watchdog, 60 * 1000).unref?.();
  let lastTick = 0;
  for (;;) {
    try { await liveWork(); } catch (err) { log('live tick error', err.message); }
    try { await answerAiRequests(); } catch (err) { log('ai requests error', err.message); }
    if (Date.now() - lastTick >= EVERY_MS) {
      try { await tick(); } catch (err) { log('tick error', err.message); }
      lastTick = Date.now();
    }
    progress();
    await new Promise((r) => setTimeout(r, LIVE_MS));
  }
}

main().catch((err) => { log(err.message); process.exit(1); });
