// Answer boxes in the teacher's text on a board (owner 2026-11-25): wherever the teacher wrote three or more dots or
// underscores („____”, „....”, „…”), the student gets a box to type into. The teacher's text itself stays read-only;
// the answers are kept on the same element as `fills` ({ "0": "jope", "1": "suppi" }), one key per gap in order.
import { teacherMaterial } from './boardModel.js';

export const BLANK = /(_{3,}|\.{3,}|…+)/g;
export const FILL_MAX = 200;
export const FILLS_MAX = 200;

// the text cut into pieces: { text } and { gap: index }
export function blankParts(text = '') {
  const parts = [];
  let gap = 0;
  String(text).split(BLANK).forEach((piece, index) => {
    if (!piece) return;
    if (index % 2 === 1) parts.push({ gap: gap++, raw: piece });
    else parts.push({ text: piece });
  });
  return parts;
}

export const blankCount = (text = '') => (String(text).match(BLANK) || []).length;

// a teacher's text with gaps becomes a fill-in text (a student's own text never does)
export const fillable = (element) => element?.type === 'text' && teacherMaterial(element) && blankCount(element.text) > 0;

export const fillPatch = (gap, value) => ({ [`fills.${gap}`]: String(value ?? '').slice(0, FILL_MAX) });
