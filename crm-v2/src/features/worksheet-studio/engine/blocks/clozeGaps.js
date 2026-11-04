// „Valiklünktekst” gaps (exam.jsx): „Ma {*käin|käisin|käima} …” — the right option starts with *. A file of its own,
// without React: the pet's games (pet/petGames.js) read the gaps on the student's home without loading the block views.
export const CLOZE_GAP = /\{([^}]*)\}/g;

export function clozeGaps(passage) {
  return [...String(passage || '').matchAll(CLOZE_GAP)].map((m) => m[1].split('|').map((o) => o.trim()).filter(Boolean)
    .map((o, oi) => ({ text: o.replace(/^\*/, ''), correct: o.startsWith('*'), oi })));
}
