'use strict';
// KeeleSepp lesson transcriber: runs on the school Mac, free (whisper.cpp), no audio leaves our own Firebase.
// Loop: hand over forgotten recordings → transcribe "uploaded" ones → delete audio older than 60 days.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile, spawn } = require('node:child_process');
const { promisify } = require('node:util');
const admin = require('firebase-admin');
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

async function tick() {
  await handOverAbandoned();
  for (const rec of await claim()) await transcribe(rec);
  if (new Date().getMinutes() < 2) await deleteOldAudio(); // about once an hour
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
    if (Date.now() - lastTick >= EVERY_MS) {
      try { await tick(); } catch (err) { log('tick error', err.message); }
      lastTick = Date.now();
    }
    progress();
    await new Promise((r) => setTimeout(r, LIVE_MS));
  }
}

main().catch((err) => { log(err.message); process.exit(1); });
