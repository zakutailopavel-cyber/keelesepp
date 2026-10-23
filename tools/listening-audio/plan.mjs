// Turns every listening block of the course into a list of TTS segments with a voice each (no network here).
//   node tools/listening-audio/plan.mjs   # prints the plan summary: blocks, speakers and their voices
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTRY = join(ROOT, 'crm-v2/src/features/worksheet-generator/admin/course/registry.js');

export const FEMALE_VOICES = ['mari', 'liivika', 'külli', 'vesta'];
export const MALE_VOICES = ['albert', 'kalev', 'tambet', 'indrek', 'meelis', 'peeter'];
const NARRATORS = ['mari', 'tambet', 'liivika', 'kalev', 'külli', 'meelis', 'vesta', 'albert'];

// names and roles of the course texts; anything else alternates female / male
const FEMALE = new Set(['anna', 'liis', 'sofia', 'kati', 'olga', 'kristi', 'kadri', 'irina', 'kersti', 'mari', 'liina', 'sandra', 'anne', 'tiina', 'ema', 'tütar', 'vanaema', 'yuki', 'maria', 'kaja', 'helen', 'piret', 'tiiu', 'ene', 'eva', 'laura', 'kristiina', 'maarja', 'svetlana', 'natalja', 'elena', 'tatjana', 'katrin', 'merike', 'õde', 'mia', 'helgi', 'maie', 'kertu', 'teadustaja', 'maret', 'olena', 'daria', 'kristel', 'merilin', 'mailis', 'egle', 'heli', 'eha', 'ülle', 'triin', 'tatjana', 'malle', 'elina', 'grete', 'svetlana', 'aino', 'anu', 'tuuli', 'laine', 'leili', 'kai', 'elo', 'helve', 'triinu', 'urve', 'hilja', 'piia', 'reelika', 'maarika', 'kaidi', 'mirjam', 'vaike', 'pille', 'ilze', 'inese', 'signe', 'marje', 'helen', 'evelin', 'ingrid', 'eda', 'tamara', 'laura', 'merle', 'dace', 'maarja', 'kertu', 'kaire', 'marina', 'irina', 'natalja', 'li', 'margit', 'reet', 'inga', 'kristiina', 'siret', 'eneli', 'aili', 'kerli', 'leida', 'piret', 'kärt', 'registraator', 'õe']);
const MALE = new Set(['markus', 'viktor', 'jaan', 'marko', 'rasmus', 'margus', 'toomas', 'peeter', 'jüri', 'tõnu', 'mihkel', 'andres', 'mart', 'isa', 'vanaisa', 'poeg', 'jaanus', 'tarmo', 'priit', 'sergei', 'aleksei', 'dmitri', 'ivan', 'andrei', 'kalle', 'ants', 'rein', 'tiit', 'martin', 'karl', 'oliver', 'oskar', 'kaspar', 'urmas', 'raul', 'ott', 'mati', 'raivo', 'priit', 'rando', 'kuldar', 'rene', 'vello', 'tarmo', 'valdur', 'rainer', 'tarvo', 'ülo', 'kristo', 'valeri', 'oleg', 'taavi', 'hannes', 'allan', 'gert', 'urmo', 'artur', 'hendrik', 'ruslan', 'ilmar', 'igor', 'aleksei', 'kristjan', 'kalev', 'ragnar', 'toivo', 'diktor', 'turvatöötaja']);
// „Kordame:”, „Kokkuvõtteks:” … start a sentence of the narrator, they are not people
const NOT_SPEAKER = new Set(['ja', 'aga', 'kõigepealt', 'esiteks', 'teiseks', 'kolmandaks', 'kokkuvõtteks', 'kordame', 'küsisime', 'üks', 'lõpuks', 'näiteks', 'tähelepanu', 'nb', 'kell', 'märkus']);

const LABEL = /^\s*([A-ZÕÄÖÜŠŽ][\p{L}-]*(?: [\p{L}-]+)?):\s+(.+)$/u;
const sha1 = (s) => createHash('sha1').update(s).digest('hex');

export const speedFor = (level) => (String(level || '').startsWith('A2') ? 0.9 : 1);

function genderOf(label) {
  const words = label.toLowerCase().split(' ');
  for (const w of [words[words.length - 1], words[0]]) {
    if (FEMALE.has(w)) return 'f';
    if (MALE.has(w)) return 'm';
  }
  return '';
}

// splits one spoken line into requests of < 280 characters at sentence (then comma) boundaries
export function chunks(text, max = 280) {
  const sentences = String(text).trim().split(/(?<=[.!?…])\s+/).flatMap((s) => (s.length <= max ? [s] : s.split(/(?<=[,;:])\s+/)));
  const out = [];
  for (const s of sentences) {
    if (out.length && out[out.length - 1].length + 1 + s.length <= max) out[out.length - 1] += ` ${s}`;
    else out.push(s);
  }
  return out.filter((s) => /[\p{L}\d]/u.test(s));
}

// transcript → [{ text, voice, newTurn }]
export function segmentsOf(transcript, seed = 0) {
  const lines = String(transcript || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const parsed = lines.map((line) => {
    const m = line.match(LABEL);
    if (!m || NOT_SPEAKER.has(m[1].split(' ')[0].toLowerCase())) return { label: '', text: line };
    return { label: m[1], text: m[2] };
  });
  // one labelled line in a plain text is a narrator's phrase („Müüja ütles: …”), not a dialogue
  const labelled = parsed.filter((p) => p.label);
  if (labelled.length < 2) parsed.forEach((p) => { if (p.label) { p.text = `${p.label}: ${p.text}`; p.label = ''; } });
  // „Linnavolinik” … „Volinik”, „Kolleeg Anne” … „Anne” are one person
  const canon = new Map();
  for (const p of parsed.filter((x) => x.label)) {
    const low = p.label.toLowerCase();
    const same = [...canon.keys()].find((k) => k !== low && (k.endsWith(low) || low.endsWith(` ${k}`) || k.endsWith(` ${low}`)));
    if (!canon.has(low)) canon.set(low, same ? canon.get(same) : low);
    p.who = canon.get(low);
  }
  const voices = new Map();
  const used = new Set();
  let alt = seed % 2;
  // the cast changes voices from text to text (seed = transcript hash), but stays stable for one transcript
  const rotate = (list) => list.slice(seed % list.length).concat(list.slice(0, seed % list.length));
  const pick = (list) => rotate(list).find((v) => !used.has(v)) || list[used.size % list.length];
  for (const p of parsed.filter((x) => x.label)) {
    if (voices.has(p.who)) continue;
    let g = genderOf(p.label) || genderOf(p.who);
    if (!g) { g = alt ? 'm' : 'f'; alt = 1 - alt; }
    const voice = pick(g === 'f' ? FEMALE_VOICES : MALE_VOICES);
    voices.set(p.who, voice); used.add(voice);
  }
  // a narrator who introduces himself („Minu nimi on Kati”, „Siin treener Mart”) speaks with a voice of that gender
  const self = String(transcript || '').match(/(?:minu nimi on|mina olen|siin(?: on)?(?: \p{Ll}+)?)\s+(\p{Lu}\p{Ll}+)/iu);
  const selfGender = self ? genderOf(self[1]) : '';
  const narrators = selfGender ? (selfGender === 'f' ? FEMALE_VOICES : MALE_VOICES) : NARRATORS;
  const narrator = narrators.slice(seed % narrators.length).concat(narrators).find((v) => !used.has(v)) || narrators[0];
  const segments = [];
  parsed.forEach((p) => {
    const voice = p.label ? voices.get(p.who) : narrator;
    chunks(p.text).forEach((text, i) => segments.push({ text, voice, newTurn: i === 0 }));
  });
  return segments;
}

export async function listeningPlan() {
  const { COURSE_MODULES } = await import(pathToFileURL(REGISTRY).href);
  const plan = [];
  for (const mod of COURSE_MODULES) {
    for (const [lessonId, lesson] of Object.entries(mod.LESSONS)) {
      for (const phase of ['discover', 'practice', 'transfer']) {
        for (const block of lesson[phase] || []) {
          if (block.type !== 'listening' || !String(block.data?.transcript || '').trim()) continue;
          const transcript = block.data.transcript;
          const hash = sha1(transcript);
          const level = lesson.level || mod.MODULE.level;
          plan.push({ key: `${lessonId}:${block.id}`, course: mod.MODULE.course, lessonId, phase, blockId: block.id, level, speed: speedFor(level), hash, segments: segmentsOf(transcript, parseInt(hash.slice(0, 6), 16)) });
        }
      }
    }
  }
  return plan;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const plan = await listeningPlan();
  const voices = {};
  plan.forEach((it) => it.segments.forEach((s) => { voices[s.voice] = (voices[s.voice] || 0) + 1; }));
  console.log(`${plan.length} plokki, ${plan.reduce((s, it) => s + it.segments.length, 0)} TTS-päringut, ${plan.reduce((s, it) => s + it.segments.reduce((a, x) => a + x.text.length, 0), 0)} tähemärki`);
  console.log(voices);
  if (process.argv[2]) plan.filter((it) => it.key.includes(process.argv[2])).forEach((it) => console.log(it.key, it.speed, it.segments));
}
