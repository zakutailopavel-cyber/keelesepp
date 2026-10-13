// a gap whose answer is a whole sentence („vali lause” tasks) gets its own growing line instead of a 2–3 cm field
// (owner 2026-10-13: the answer did not fit and was hard to read); short gaps keep their width
export const LONG_GAP = 24;
export function gapWidth(accept, base) {
  const answers = (Array.isArray(accept) ? accept : String(accept || '').split(/[|/]/)).map((a) => String(a).trim());
  return Math.max(0, ...answers.map((a) => a.length)) > LONG_GAP ? '100%' : base;
}
