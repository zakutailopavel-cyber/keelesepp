// Estonian speech for the constructor (TartuNLP Neurokõne via our languageApi /speak). Pure helpers: the voices, what
// each block reads out, splitting long text and joining the returned WAV pieces into one file.

export const VOICES = [
  ['mari', 'Mari (naine)'], ['liivika', 'Liivika (naine)'], ['vesta', 'Vesta (naine)'], ['kylli', 'Külli (naine)'], ['lee', 'Lee (naine)'],
  ['albert', 'Albert (mees)'], ['tambet', 'Tambet (mees)'], ['peeter', 'Peeter (mees)'], ['kalev', 'Kalev (mees)'], ['indrek', 'Indrek (mees)'],
  ['meelis', 'Meelis (mees)'], ['luukas', 'Luukas (poiss)'],
];
export const SPEEDS = [[0.75, 'Aeglane'], [0.9, 'Rahulik'], [1, 'Tavaline'], [1.15, 'Kiire']];
const MAX_PIECE = 900;

// „Mari ärkab kell [seitse|7].” → „Mari ärkab kell seitse.” (the first right answer is read out)
export const fillGaps = (text) => String(text || '').replace(/\[([^\]]*)\]/g, (_, inner) => inner.split('|')[0].trim()).replace(/\{\{([^{}]+)\}\}/g, '$1').replace(/\*([^*]+)\*/g, '$1');

// long text → pieces of at most MAX_PIECE characters, cut after a sentence where possible
export function splitForSpeech(text, max = MAX_PIECE) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…]+[.!?…]*["»”]?\s*/g) || [clean];
  const pieces = [];
  let current = '';
  sentences.forEach((sentence) => {
    let rest = sentence;
    while (rest.length > max) { // one very long sentence: cut at a space
      const at = rest.lastIndexOf(' ', max) > 0 ? rest.lastIndexOf(' ', max) : max;
      if (current) { pieces.push(current.trim()); current = ''; }
      pieces.push(rest.slice(0, at).trim());
      rest = rest.slice(at);
    }
    if ((current + rest).length > max) { pieces.push(current.trim()); current = ''; }
    current += rest;
  });
  if (current.trim()) pieces.push(current.trim());
  return pieces.filter(Boolean);
}

// What a block reads out: [{ text, speaker }] in order, already split into pieces the service accepts.
export function speechScript(type, data = {}) {
  const voice = data.voice || 'mari';
  const one = (text, speaker = voice) => splitForSpeech(fillGaps(text)).map((piece) => ({ text: piece, speaker }));
  if (type === 'dialogue') {
    return (data.lines || []).filter((line) => String(line.text || '').trim())
      .flatMap((line) => one(line.text, line.who === 'B' ? data.voiceB || 'albert' : data.voiceA || 'mari'));
  }
  if (type === 'reading') return one([data.passageTitle, data.passage].filter(Boolean).join('. '));
  if (type === 'listening') return one(String(data.transcript || '').trim() || String(data.sentences || '').split('\n').filter((l) => l.trim()).join(' '));
  return one(data.text || '');
}

// ---- WAV: read the format and the samples, join pieces with a short pause ----
function readWav(buffer) {
  const view = new DataView(buffer);
  const tag = (at) => String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));
  if (buffer.byteLength < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('Heli ei ole WAV-vormingus.');
  let at = 12;
  let fmt = null;
  let data = null;
  while (at + 8 <= buffer.byteLength) {
    const id = tag(at);
    const size = view.getUint32(at + 4, true);
    const body = at + 8;
    if (id === 'fmt ') fmt = { format: view.getUint16(body, true), channels: view.getUint16(body + 2, true), rate: view.getUint32(body + 4, true), bits: view.getUint16(body + 14, true) };
    if (id === 'data') data = new Uint8Array(buffer, body, Math.min(size, buffer.byteLength - body));
    at = body + size + (size % 2);
  }
  if (!fmt || !data) throw new Error('Helifail on vigane.');
  return { fmt, data };
}

export function joinWav(buffers, pauseMs = 450) {
  const parts = buffers.map(readWav);
  if (!parts.length) throw new Error('Heli puudub.');
  const { fmt } = parts[0];
  if (parts.some((p) => p.fmt.rate !== fmt.rate || p.fmt.channels !== fmt.channels || p.fmt.bits !== fmt.bits || p.fmt.format !== fmt.format)) throw new Error('Helitükid on eri vormingus.');
  const frame = fmt.channels * (fmt.bits / 8);
  const pause = Math.round((fmt.rate * pauseMs) / 1000) * frame;
  const total = parts.reduce((sum, p) => sum + p.data.length, 0) + pause * (parts.length - 1);
  const out = new ArrayBuffer(44 + total);
  const view = new DataView(out);
  const write = (at, text) => [...text].forEach((ch, i) => view.setUint8(at + i, ch.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, 36 + total, true); write(8, 'WAVE');
  write(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, fmt.format, true); view.setUint16(22, fmt.channels, true);
  view.setUint32(24, fmt.rate, true); view.setUint32(28, fmt.rate * frame, true); view.setUint16(32, frame, true); view.setUint16(34, fmt.bits, true);
  write(36, 'data'); view.setUint32(40, total, true);
  const bytes = new Uint8Array(out);
  let at = 44;
  parts.forEach((p, i) => {
    if (i) at += pause; // silence = zero bytes (16-bit PCM)
    bytes.set(p.data, at);
    at += p.data.length;
  });
  return out;
}

// seconds of a WAV (for the label next to the player)
export function wavSeconds(buffer) {
  const { fmt, data } = readWav(buffer);
  return data.length / (fmt.rate * fmt.channels * (fmt.bits / 8));
}
