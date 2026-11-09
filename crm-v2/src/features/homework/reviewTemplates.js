// Quick review: a grade suggested from the automatic check and ready-made feedback lines, so a teacher can confirm an
// auto-checked work in one click or write a comment with a few taps. The teacher's choice always wins.
import { describeAutoErrors } from '../worksheet-studio/engine/errorText.js';
import { suggestedGrade } from './gradeSuggestion.js';

// kept here for the existing importers; paperWork.js imports gradeSuggestion.js directly (no worksheet blocks)
export { suggestedGrade };

// one line for the one-click confirmation
export function quickFeedback(percentage) {
  const grade = suggestedGrade(percentage);
  if (grade === 5) return 'Suurepärane töö! Tubli!';
  if (grade === 4) return 'Tubli! Vaata vead üle ja jätka samas vaimus.';
  if (grade === 3) return 'Hea algus! Vaata vead üle ja korda neid teemasid.';
  return 'Vaata vead üle — järgmises tunnis kordame neid koos.';
}

// tasks with automatic errors, at most three, as „Korda: …”
export function repeatLine(worksheetDoc, errorLog = []) {
  if (!worksheetDoc?.blocks?.length || !errorLog?.length) return '';
  const tasks = [...new Set(describeAutoErrors(worksheetDoc, errorLog).map((item) => item.task).filter(Boolean))].slice(0, 3);
  return tasks.length ? `Korda: ${tasks.join(', ')}.` : '';
}

export function feedbackTemplates(submission = {}) {
  const lines = ['Tubli!', 'Suurepärane töö!', 'Vaata vead üle ja paranda need.', 'Järgmises tunnis kordame seda teemat.'];
  const repeat = repeatLine(submission.source?.worksheetDoc, submission.errorLog);
  return repeat ? [repeat, ...lines] : lines;
}

// adds a template line to the comment (on a new line, never twice)
export function addLine(text = '', line = '') {
  const current = String(text || '').trim();
  if (!line || current.split('\n').includes(line)) return current;
  return current ? `${current}\n${line}` : line;
}
