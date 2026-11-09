#!/usr/bin/env node
/* global process, console, fetch, AbortSignal, Buffer, setTimeout */
// Real Estonian audio for every course word, its example sentence and the practice engine's listening sentences
// (docs/VOCABULARY_SRS.md „Sõnade heli”). Made ONCE with TartuNLP Neurokõne (free public API, voice „mari”), stored by us
// in Firebase Storage (audio/words/<key>.m4a), listed in crm-v2/public/word-audio.json. The app never calls the TTS.
//
//   node scripts/word-audio/build-word-audio.mjs --dry-run            # counts only: no TTS, no Storage, no files
//   node scripts/word-audio/build-word-audio.mjs --limit 30 --no-upload   # pilot: 30 files into the local cache
//   node scripts/word-audio/build-word-audio.mjs                      # everything missing → synthesize, upload, manifest
//
// Options: --limit N (new syntheses this run), --cache DIR (default ~/.cache/keelesepp-word-audio), --no-upload,
// --no-listen (words + examples only), --bucket NAME, --admin-modules DIR (node_modules holding firebase-admin),
// --ffmpeg PATH, --encoder aac_at|aac. Resumable: a key already in the cache or in Storage is never synthesized again.
// Credentials: GOOGLE_APPLICATION_CREDENTIALS (admin SDK; the upload bypasses storage.rules).
import fs from 'node:fs';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  AUDIO_CONTENT_TYPE, AUDIO_EXT, CACHE_CONTROL, backoffMs, buildManifest, keyOfPath, listenTexts, lessonWordTexts,
  loudnormMeasure, planWork, retryable, speechBounds, storagePath, STORAGE_PREFIX, uniqueTexts,
} from './lib.mjs';
import { WORD_AUDIO_SPEAKER } from '../../src/features/vocabulary/wordAudioKey.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const CRM = resolve(HERE, '../..');
const SRC = join(CRM, 'src/features');
const TTS_URL = 'https://api.tartunlp.ai/text-to-speech/v2';
const CONCURRENCY = 2;
const MIN_GAP_MS = 340; // ≤ ~3 requests per second in total
const MAX_TRIES = 6;

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const arg = (name, fallback = '') => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
const DRY = flag('--dry-run');
const UPLOAD = !flag('--no-upload') && !DRY;
const LIMIT = Number(arg('--limit', '0')) || 0;
const CACHE = resolve(arg('--cache', join(os.homedir(), '.cache/keelesepp-word-audio')));
const BUCKET = arg('--bucket', 'keelesepp-5136b.firebasestorage.app');
const FFMPEG = arg('--ffmpeg', fs.existsSync('/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg') ? '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg' : 'ffmpeg');
const ENCODER = arg('--encoder', process.platform === 'darwin' ? 'aac_at' : 'aac');
const ADMIN_MODULES = arg('--admin-modules', join(CRM, '../functions/node_modules'));
const MANIFEST = join(CRM, 'public/word-audio.json');

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const log = (...parts) => console.log(new Date().toISOString().slice(11, 19), ...parts);

async function collect() {
  const courses = {};
  for (const file of fs.readdirSync(join(SRC, 'vocabulary/lessonWords')).filter((name) => name.endsWith('.json')).sort()) {
    courses[file.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(join(SRC, 'vocabulary/lessonWords', file), 'utf8'));
  }
  const entries = lessonWordTexts(courses);
  const counts = { words: entries.filter((e) => e.source.endsWith(':word')).length, examples: entries.filter((e) => e.source.endsWith(':example')).length, listen: 0 };
  if (!flag('--no-listen')) {
    const load = (path) => import(pathToFileURL(join(SRC, path)).href);
    const { extractCourseItems } = await load('practice/engine/extract.js');
    const { fullSentence } = await load('practice/engine/items.js');
    const { LISTEN_TILES } = await load('practice/engine/lesson.js');
    for (const course of ['a2', 'b1', 'b2', 'c1']) {
      const { MODULES } = await load(`worksheet-generator/admin/course/courseModules.${course}.js`);
      const listen = listenTexts(extractCourseItems(course, MODULES), { fullSentence, maxTiles: LISTEN_TILES });
      counts.listen += listen.length;
      entries.push(...listen);
    }
  }
  return { entries, counts };
}

function run(cmd, args) {
  return new Promise((done, fail) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', fail);
    child.on('close', (code) => (code === 0 ? done(stderr) : fail(new Error(`${cmd} exited ${code}: ${stderr.slice(-400)}`))));
  });
}

// WAV (22 050 Hz mono float) → trimmed, loudness-normalised AAC-LC 48 kb/s mono in .m4a
async function encode(wavPath, outPath) {
  const probe = await run(FFMPEG, ['-hide_banner', '-nostats', '-i', wavPath, '-af', 'silencedetect=n=-50dB:d=0.1,loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  const { start, end } = speechBounds(probe);
  const m = loudnormMeasure(probe);
  const norm = m
    ? `loudnorm=I=-18:TP=-1.5:LRA=11:linear=true:measured_I=${m.i}:measured_TP=${m.tp}:measured_LRA=${m.lra}:measured_thresh=${m.thresh}:offset=${m.offset}`
    : 'loudnorm=I=-18:TP=-1.5:LRA=11';
  const filter = `atrim=start=${start.toFixed(3)}:end=${end.toFixed(3)},asetpts=N/SR/TB,${norm},aresample=22050`;
  const tmp = `${outPath}.part.${AUDIO_EXT}`;
  await run(FFMPEG, ['-hide_banner', '-nostats', '-y', '-i', wavPath, '-af', filter, '-ac', '1', '-ar', '22050', '-c:a', ENCODER, '-b:a', '48k', '-movflags', '+faststart', '-map_metadata', '-1', tmp]);
  fs.renameSync(tmp, outPath);
  return { seconds: Math.max(0, end - start) };
}

let nextSlot = 0;
async function politeSlot() {
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + MIN_GAP_MS;
  if (at > now) await sleep(at - now);
}

async function synthesize(text) {
  for (let attempt = 0; attempt < MAX_TRIES; attempt += 1) {
    await politeSlot();
    let status = 0;
    let retryAfter = '';
    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'audio/wav', 'User-Agent': 'KeeleSepp word-audio (one-time course audio)' },
        body: JSON.stringify({ text, speaker: WORD_AUDIO_SPEAKER, speed: 1 }),
        signal: AbortSignal.timeout(60000),
      });
      status = response.status;
      retryAfter = response.headers.get('retry-after') || '';
      if (response.ok) {
        const body = Buffer.from(await response.arrayBuffer());
        if (body.length > 1000 && body.subarray(0, 4).toString() === 'RIFF') return body;
        status = 502; // an answer that is not audio: try again
      } else if (!retryable(status)) {
        throw Object.assign(new Error(`TTS ${status}: ${(await response.text()).slice(0, 200)}`), { final: true });
      }
    } catch (error) {
      if (error.final) throw error;
    }
    if (attempt + 1 < MAX_TRIES) {
      const wait = backoffMs(attempt + 1, { retryAfter });
      log(`  retry ${attempt + 1} after ${status || 'network'} in ${Math.round(wait / 1000)} s`);
      await sleep(wait);
    }
  }
  throw new Error(`TTS failed ${MAX_TRIES} times`);
}

async function pool(list, size, worker) {
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(size, list.length) }, async () => {
    while (index < list.length) {
      const item = list[index];
      index += 1;
      await worker(item);
    }
  }));
}

function localKeys() {
  if (!fs.existsSync(CACHE)) return new Set();
  return new Set(fs.readdirSync(CACHE).filter((name) => name.endsWith(`.${AUDIO_EXT}`) && !name.includes('.part.')).map((name) => name.slice(0, -AUDIO_EXT.length - 1)));
}

async function storageBucket() {
  const require = createRequire(join(resolve(ADMIN_MODULES), 'noop.js'));
  const admin = require('firebase-admin');
  if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault(), storageBucket: BUCKET });
  return admin.storage().bucket(BUCKET);
}

async function main() {
  const began = Date.now();
  const { entries, counts } = await collect();
  const { items, skipped } = uniqueTexts(entries);
  const wanted = new Set(items.map((item) => item.key));
  log(`texts: ${counts.words} words, ${counts.examples} examples, ${counts.listen} listening sentences → ${items.length} unique (${skipped} empty/long skipped)`);

  fs.mkdirSync(CACHE, { recursive: true });
  const index = join(CACHE, 'index.json');
  const known = fs.existsSync(index) ? JSON.parse(fs.readFileSync(index, 'utf8')) : {};
  items.forEach((item) => { known[item.key] = item.text; });
  if (!DRY) fs.writeFileSync(index, JSON.stringify(known, null, 0));

  const bucket = UPLOAD ? await storageBucket() : null;
  const remote = new Set();
  if (bucket) {
    const [files] = await bucket.getFiles({ prefix: STORAGE_PREFIX });
    files.forEach((file) => { const key = keyOfPath(file.name); if (key) remote.add(key); });
    log(`Storage already has ${remote.size} files under ${STORAGE_PREFIX}`);
  }
  const plan = planWork(items, { local: localKeys(), remote, limit: LIMIT });
  log(`plan: synthesize ${plan.synth.length}${plan.waiting ? ` (+${plan.waiting} left for a later run)` : ''}, upload ${plan.upload.length + (UPLOAD ? plan.synth.length : 0)}, already stored ${plan.done.length}`);
  if (DRY) return;

  const failures = [];
  let made = 0;
  let seconds = 0;
  const tmpDir = fs.mkdtempSync(join(os.tmpdir(), 'word-audio-'));
  await pool(plan.synth, CONCURRENCY, async (item) => {
    const wav = join(tmpDir, `${item.key}.wav`);
    try {
      fs.writeFileSync(wav, await synthesize(item.text));
      const out = await encode(wav, join(CACHE, `${item.key}.${AUDIO_EXT}`));
      made += 1;
      seconds += out.seconds;
      if (made % 50 === 0 || made === plan.synth.length) log(`synthesized ${made}/${plan.synth.length}`);
    } catch (error) {
      failures.push({ key: item.key, text: item.text, error: String(error?.message || error).slice(0, 300) });
      log(`  FAILED ${item.key} „${item.text.slice(0, 60)}”: ${failures[failures.length - 1].error}`);
    } finally {
      fs.rmSync(wav, { force: true });
    }
  });
  fs.rmSync(tmpDir, { recursive: true, force: true });

  let uploaded = 0;
  if (bucket) {
    const local = localKeys();
    const toUpload = items.filter((item) => local.has(item.key) && !remote.has(item.key));
    await pool(toUpload, 4, async (item) => {
      try {
        await bucket.upload(join(CACHE, `${item.key}.${AUDIO_EXT}`), {
          destination: storagePath(item.key),
          resumable: false,
          metadata: { contentType: AUDIO_CONTENT_TYPE, cacheControl: CACHE_CONTROL, metadata: { speaker: WORD_AUDIO_SPEAKER, voice: 'Neurokõne (TartuNLP)' } },
        });
        remote.add(item.key);
        uploaded += 1;
        if (uploaded % 200 === 0) log(`uploaded ${uploaded}/${toUpload.length}`);
      } catch (error) {
        failures.push({ key: item.key, text: item.text, error: `upload: ${String(error?.message || error).slice(0, 300)}` });
      }
    });
    const keys = [...remote].filter((key) => wanted.has(key));
    fs.writeFileSync(MANIFEST, `${JSON.stringify(buildManifest(keys, { bucket: BUCKET, generatedAt: new Date().toISOString().slice(0, 10) }))}\n`);
    log(`manifest: ${keys.length} keys → ${MANIFEST} (${fs.statSync(MANIFEST).size} bytes)`);
  }

  const local = localKeys();
  const bytes = [...local].filter((key) => wanted.has(key)).reduce((sum, key) => sum + fs.statSync(join(CACHE, `${key}.${AUDIO_EXT}`)).size, 0);
  if (failures.length) fs.writeFileSync(join(CACHE, 'failures.json'), JSON.stringify(failures, null, 1));
  log(`done in ${Math.round((Date.now() - began) / 1000)} s: synthesized ${made} (${Math.round(seconds)} s of speech), uploaded ${uploaded}, failed ${failures.length}; cache ${local.size} files, ${(bytes / 1048576).toFixed(1)} MB`);
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exit(1); });
