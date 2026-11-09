// The grade suggested from the automatic check. Its own file: paperWork.js (and through it the homework service on the
// student's home) needs only this, not the feedback lines of reviewTemplates.js, which load every worksheet block.

// percentage of correct answers → grade 1–5 (null when the work was not checked automatically)
export function suggestedGrade(percentage) {
  if (percentage == null || !Number.isFinite(Number(percentage))) return null;
  const p = Number(percentage);
  if (p >= 90) return 5;
  if (p >= 75) return 4;
  if (p >= 50) return 3;
  if (p >= 30) return 2;
  return 1;
}
