// Builds the audio of every listening block of the course sheets (crm-v2 …/admin/course/registry.js) with the free
// Estonian TTS of TartuNLP (Neurokõne). See README.md next to this file.
//   node tools/listening-audio/build.mjs            # only blocks whose transcript changed (hash in the manifest)
//   node tools/listening-audio/build.mjs --force    # everything again
//   node tools/listening-audio/build.mjs --only a2-12-1   # blocks whose „lessonId:blockId” contains the text
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listeningPlan } from './plan.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CRM = join(ROOT, 'crm-v2');
const COURSE = join(CRM, 'src/features/worksheet-generator/admin/course');
const MANIFEST = join(COURSE, 'listeningAudio.json');
const PUBLIC = join(CRM, 'public');
const CACHE = join(ROOT, 'tools/listening-audio/.cache');
const FFMPEG = process.env.FFMPEG || '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg';
const FFPROBE = process.env.FFPROBE || '/opt/homebrew/opt/ffmpeg-full/bin/ffprobe';
const API = 'https://api.tartunlp.ai/text-to-speech/v2';
const RATE = 22050;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';

const sha1 = (s) => createHash('sha1').update(s).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastCall = 0;
async function tts(text, speaker, speed) {
  const key = sha1(JSON.stringify([text, speaker, speed]));
  const file = join(CACHE, `${key}.wav`);
  if (existsSync(file) && statSync(file).size > 1000) return file;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const wait = lastCall + 1100 - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, speaker, speed }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error(`short answer ${buf.length} B`);
      writeFileSync(file, buf);
      return file;
    } catch (err) {
      const backoff = 2000 * 2 ** attempt;
      console.warn(`  TTS viga (${err.message}), proovin uuesti ${backoff / 1000} s pärast`);
      await sleep(backoff);
    }
  }
  throw new Error(`TTS ebaõnnestus: ${speaker} „${text.slice(0, 60)}…”`);
}

function silence(seconds) {
  const file = join(CACHE, `silence_${seconds}.wav`);
  if (!existsSync(file)) execFileSync(FFMPEG, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `anullsrc=r=${RATE}:cl=mono`, '-t', String(seconds), '-c:a', 'pcm_f32le', file]);
  return file;
}

function duration(file) {
  return Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
}

async function render(item, out) {
  const parts = [];
  item.segments.forEach((seg, i) => {
    if (i > 0) parts.push({ pause: seg.newTurn ? 0.45 : 0.25 });
    parts.push(seg);
  });
  const files = [];
  for (const p of parts) files.push(p.pause ? silence(p.pause) : await tts(p.text, p.voice, item.speed));
  const list = join(CACHE, `list_${process.pid}.txt`);
  // the API answers 22.05 kHz mono float WAV; the pauses are made in the same format, so the concat demuxer joins them
  writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
  mkdirSync(dirname(out), { recursive: true });
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
    '-af', `aresample=${RATE},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=${RATE}`,
    '-ac', '1', '-ar', String(RATE), '-c:a', 'libmp3lame', '-b:a', '32k', out]);
  rmSync(list, { force: true });
  return Math.round(duration(out) * 10) / 10;
}

async function main() {
  mkdirSync(CACHE, { recursive: true });
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  const plan = (await listeningPlan()).filter((it) => !ONLY || it.key.includes(ONLY));
  let built = 0; let skipped = 0; const failed = [];
  for (const [n, item] of plan.entries()) {
    const src = `/audio/${item.lessonId}/${item.blockId}.mp3`;
    const out = join(PUBLIC, src);
    const prev = manifest[item.key];
    if (!FORCE && prev?.hash === item.hash && existsSync(out)) { skipped += 1; continue; }
    console.log(`[${n + 1}/${plan.length}] ${item.key} · ${item.segments.length} lõiku · ${[...new Set(item.segments.map((s) => s.voice))].join(', ')}`);
    try {
      const seconds = await render(item, out);
      manifest[item.key] = { src, seconds, hash: item.hash };
      built += 1;
      // saved after every block, so an interrupted run continues where it stopped
      writeFileSync(MANIFEST, `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`);
    } catch (err) {
      console.error(`  VIGA ${item.key}: ${err.message}`);
      failed.push(item.key);
    }
  }
  const all = Object.values(manifest);
  console.log(`Valmis: ${built} uut, ${skipped} muutmata, ${failed.length} viga. Kokku ${all.length} faili, ${Math.round(all.reduce((s, x) => s + x.seconds, 0) / 6) / 10} min.`);
  if (failed.length) { console.error(failed.join('\n')); process.exitCode = 1; }
}

main();
