import { checkDocument } from './registry.js';

// The score shown for a submitted structured worksheet.
//
// The stored `score` was computed once, when the student pressed „Esita”, with the rules of that day. Scores stored
// before 2026-10-27 counted every task she did not answer (done orally in the lesson) as wrong, so a sheet answered
// mostly right could read 0/28. The answers and the sheet she answered (`worksheetDoc`, the assignment's own copy) are
// both on the assignment, so the score is checked again here with the current rules — on display only, nothing is
// written back. The stored score stays when it agrees, and also when it is not obviously wrong.
//
// Returns { score, recomputed, stored }: `score` is what to show (null = nothing to score), `stored` the original.
export function effectiveScore({ score = null, worksheetDoc = null, answers = {}, status = 'done' } = {}) {
  const stored = score && typeof score === 'object' ? score : null;
  const keep = { score: stored, recomputed: false, stored };
  if (status !== 'done' || !stored || !worksheetDoc?.blocks?.length) return keep;
  const given = Object.keys(answers || {}).length;
  if (!given) return keep;
  let fresh;
  try { fresh = checkDocument(worksheetDoc, answers).score; } catch { return keep; }
  const total = Number(stored.total) || 0;
  const correct = Number(stored.correct) || 0;
  // obviously wrong: it counted items the current rules leave out (unanswered, unmatched or free tasks), or it says
  // nothing was right while her answers on this sheet are right
  const invalid = fresh.total < total || (correct === 0 && fresh.correct > 0);
  if (!invalid) return keep;
  return { score: fresh.total ? { ...fresh, recomputed: true } : null, recomputed: true, stored, unmatched: fresh.unmatched || 0 };
}

export const scorePct = (score) => (score?.total ? Math.round((Number(score.correct) / Number(score.total)) * 100) : null);
