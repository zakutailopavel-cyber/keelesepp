// Sheet errors become review cards (owner 2026-10-23, docs/LEARNER_PROFILE.md step 2): a wrong answer in a submitted
// worksheet comes back as the student's own sentence, corrected — the same card as a corrected sentence from a lesson
// („Minu vead”, „Päeva 5 minutit”): word = the right sentence, translation = „Sinu lause: …” with what he wrote.
// Only answers that make a whole sentence: a gap in a sentence (the sentence is rebuilt), or a task whose right answer
// is itself a sentence (rewrite, correct, translate). Empty answers and single-word tasks make no card.
import { expectedAnswer } from './errorText.js';

export const SENTENCE_PREFIX = 'Sinu lause:';
export const MAX_SHEET_CARDS = 5;
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const parts = (line) => String(line || '').split(/(\[[^\]]*\])/g).map((p) => (p.startsWith('[') ? { gap: p.slice(1, -1).split('|').map(clean) } : { text: p }));
const first = (value) => clean(String(value).split(/\s*\/\s*|\|/)[0]);

function gapSentence(block, row, gap, given) {
  const lines = String(block?.data?.sentences || '').split('\n').filter((line) => line.trim());
  const line = lines[row];
  if (!line) return null;
  let index = -1;
  const build = (useGiven) => clean(parts(line).map((part) => {
    if (!part.gap) return part.text;
    index += 1;
    return useGiven && index === gap ? given : part.gap[0];
  }).join(''));
  const right = build(false);
  index = -1;
  const said = build(true);
  return right && said && right !== said ? { right, said } : null;
}

export function errorCards(worksheetDoc, errorLog = [], max = MAX_SHEET_CARDS) {
  const blocks = worksheetDoc?.blocks || [];
  const cards = [];
  for (const entry of errorLog || []) {
    if (cards.length >= max) break;
    const given = clean(entry?.answer);
    if (!given) continue;
    const raw = String(entry?.key || '');
    const split = raw.indexOf(':');
    const block = blocks.find((item) => item.id === (split > 0 ? raw.slice(0, split) : raw));
    const sub = split > 0 ? raw.slice(split + 1) : '';
    if (!block) continue;
    let pair = null;
    const [row, gap] = sub.split('.').map(Number);
    if (sub.includes('.') && Number.isInteger(row) && Number.isInteger(gap)) pair = gapSentence(block, row, gap, given);
    else {
      const right = first(expectedAnswer(block, sub));
      if (right.split(' ').length >= 3 && clean(right).toLocaleLowerCase('et') !== given.toLocaleLowerCase('et')) pair = { right, said: given };
    }
    if (!pair || pair.right.length > 120 || cards.some((card) => card.word === pair.right)) continue;
    cards.push({ word: pair.right, translation: `${SENTENCE_PREFIX} ${pair.said}`.slice(0, 200) });
  }
  return cards;
}
