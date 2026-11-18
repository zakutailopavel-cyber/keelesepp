// The texts of the drag layouts of `insertion` (bankDrop.jsx), without React.

// the paragraphs of a text with [[taken-out parts]]: [[{ text } | { gap: n }]], n counted over the whole text
export function gapParagraphs(passage) {
  let n = -1;
  return String(passage || '').split(/\n{2,}/).filter((p) => p.trim()).map((p) => p.split(/(\[\[[^\]]*\]\])/g).filter((piece) => piece !== '')
    .map((piece) => (piece.startsWith('[[') ? { gap: (n += 1) } : { text: piece })));
}

// 2.1, the conversation: „**Name:** text” a line (or a paragraph) each; a reply taken out is the whole line „**Name:**
// [[reply]]”. The first speaker is side 'a' (left), the others 'b' (right). [{ who, text, gap: n | null, side }]
const SAY = /^\s*\**\s*([^:*\n]{1,40}?)\s*:\s*\**\s*([\s\S]*)$/;
export function chatTurns(passage) {
  let n = -1;
  let firstSpeaker = '';
  return String(passage || '').split(/\n+/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const m = SAY.exec(line);
    const who = m ? m[1].trim() : '';
    const rest = m ? m[2].trim() : line;
    if (who && !firstSpeaker) firstSpeaker = who;
    const gap = /^\[\[[^\]]*\]\]$/.test(rest) ? (n += 1) : null;
    return { who, text: gap === null ? rest : '', gap, side: who && who !== firstSpeaker ? 'b' : 'a' };
  });
}
