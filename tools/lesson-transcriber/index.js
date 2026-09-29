'use strict';
// KeeleSepp lesson transcriber: runs on the school Mac, free (whisper.cpp), no audio leaves our own Firebase.
// Loop: hand over forgotten recordings → transcribe "uploaded" ones → delete audio older than 60 days.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const admin = require('firebase-admin');
const { parseWhisperJson, mergeDialogue, isAudioExpired, isAbandoned } = require('./lib');

const run = promisify(execFile);
const env = (k, d) => process.env[k] || d;
const BUCKET = env('FIREBASE_STORAGE_BUCKET', 'keelesepp-5136b.firebasestorage.app');
const WHISPER = env('WHISPER_BIN', '/opt/homebrew/bin/whisper-cli');
const MODEL = env('WHISPER_MODEL', path.join(os.homedir(), 'KeeleSeppTranscriber', 'models', 'ggml-large-v3-turbo.bin'));
const VAD_MODEL = env('WHISPER_VAD_MODEL', path.join(path.dirname(MODEL), 'ggml-silero-v5.1.2.bin'));
const FFMPEG = env('FFMPEG_BIN', fs.existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg');
const THREADS = env('WHISPER_THREADS', String(Math.max(2, os.cpus().length - 2)));
const EVERY_MS = Number(env('POLL_SECONDS', '60')) * 1000;
const log = (...a) => console.log(new Date().toISOString(), ...a);

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

async function transcribeSegment(seg, lang, dir) {
  const src = path.join(dir, path.basename(seg.path));
  const wav = `${src}.wav`;
  await bucket.file(seg.path).download({ destination: src });
  await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', src, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav]);
  // voice activity detection: exact start times per phrase and no invented text on silence
  const vad = fs.existsSync(VAD_MODEL) ? ['--vad', '-vm', VAD_MODEL] : [];
  await run(WHISPER, ['-m', MODEL, '-l', lang, '-t', THREADS, '-f', wav, '-oj', '-of', src, '-np', ...vad], { maxBuffer: 64 * 1024 * 1024 });
  const json = JSON.parse(fs.readFileSync(`${src}.json`, 'utf8'));
  return parseWhisperJson(json, { speaker: seg.track, offsetMs: seg.startMs || 0 });
}

async function transcribe(rec) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ks-rec-${rec.id}-`));
  const started = Date.now();
  try {
    const lines = [];
    for (const seg of [...(rec.segments || [])].sort((a, b) => a.startMs - b.startMs)) {
      lines.push(...await transcribeSegment(seg, rec.language || 'et', dir));
    }
    const transcript = mergeDialogue(lines);
    await rec.ref.update({
      status: 'done', transcript, transcribedAt: new Date().toISOString(),
      transcriptModel: path.basename(MODEL), transcribeSeconds: Math.round((Date.now() - started) / 1000), error: admin.firestore.FieldValue.delete(),
    });
    log('done', rec.id, `${transcript.length} lines`);
  } catch (err) {
    await rec.ref.update({ status: 'failed', error: String(err.message || err).slice(0, 500), failedAt: new Date().toISOString() });
    log('failed', rec.id, err.message);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function handOverAbandoned() {
  const snap = await db.collection('lessonRecordings').where('status', '==', 'recording').get();
  for (const d of snap.docs) {
    if (isAbandoned(d.data())) { await d.ref.update({ status: 'uploaded', endedAt: d.data().updatedAt || new Date().toISOString(), abandoned: true }); log('handed over', d.id); }
  }
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

async function tick() {
  await handOverAbandoned();
  for (const rec of await claim()) await transcribe(rec);
  if (new Date().getMinutes() < 2) await deleteOldAudio(); // about once an hour
}

async function main() {
  if (!fs.existsSync(MODEL)) throw new Error(`Whisper model not found: ${MODEL}`);
  log('lesson transcriber started', { bucket: BUCKET, model: path.basename(MODEL), vad: fs.existsSync(VAD_MODEL) });
  if (process.argv.includes('--once')) { await tick(); await deleteOldAudio(); return; }
  for (;;) {
    try { await tick(); } catch (err) { log('tick error', err.message); }
    await new Promise((r) => setTimeout(r, EVERY_MS));
  }
}

main().catch((err) => { log(err.message); process.exit(1); });
