// Stored word audio (docs/VOCABULARY_SRS.md „Sõnade heli”): the key of one spoken text. Shared by the browser and by the
// generator script (crm-v2/scripts/word-audio/), so both must stay byte-for-byte the same. Pure, no browser / Node API.
//
// text  → normalised: Unicode NFC, trimmed, every run of white space one plain space (nothing else changes: case and
//         punctuation are kept, because the voice reads them).
// key   → the first 12 hex digits of sha1(speaker + "|" + text); the file is audio/words/<key>.m4a in Storage.
//         12 hex = 48 bits: for ~10 000 texts the chance of any clash is about 2 in 10 million.

export const WORD_AUDIO_SPEAKER = 'mari';
export const WORD_AUDIO_KEY_LENGTH = 12;

export function normalizeAudioText(text) {
  return String(text ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();
}

// sha1 of a string's UTF-8 bytes, as hex (small, synchronous: the browser must find a key at click time, inside the tap)
export function sha1Hex(input) {
  const bytes = new globalThis.TextEncoder().encode(String(input));
  const length = bytes.length;
  const words = new Array((((length + 8) >> 6) + 1) * 16).fill(0);
  for (let i = 0; i < length; i += 1) words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  words[length >> 2] |= 0x80 << (24 - (length % 4) * 8);
  words[words.length - 1] = length * 8;
  let [h0, h1, h2, h3, h4] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const w = new Array(80);
  const rotl = (x, n) => (x << n) | (x >>> (32 - n));
  for (let block = 0; block < words.length; block += 16) {
    for (let t = 0; t < 16; t += 1) w[t] = words[block + t] | 0;
    for (let t = 16; t < 80; t += 1) w[t] = rotl(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
    let [a, b, c, d, e] = [h0, h1, h2, h3, h4];
    for (let t = 0; t < 80; t += 1) {
      const f = t < 20 ? (b & c) | (~b & d) : t < 40 ? b ^ c ^ d : t < 60 ? (b & c) | (b & d) | (c & d) : b ^ c ^ d;
      const k = t < 20 ? 0x5a827999 : t < 40 ? 0x6ed9eba1 : t < 60 ? 0x8f1bbcdc : 0xca62c1d6;
      const temp = (rotl(a, 5) + f + e + k + w[t]) | 0;
      e = d; d = c; c = rotl(b, 30); b = a; a = temp;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  return [h0, h1, h2, h3, h4].map((h) => (h >>> 0).toString(16).padStart(8, '0')).join('');
}

// '' for an empty text (nothing to say)
export function wordAudioKey(text, speaker = WORD_AUDIO_SPEAKER) {
  const clean = normalizeAudioText(text);
  return clean ? sha1Hex(`${speaker}|${clean}`).slice(0, WORD_AUDIO_KEY_LENGTH) : '';
}
