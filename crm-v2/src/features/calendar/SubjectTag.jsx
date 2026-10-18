import { subjectCode } from './calendarView.js';

// the lesson's subject as a short pictogram (ET / EN / MA …); the full name is the tooltip and the screen-reader label
export default function SubjectTag({ subject }) {
  const code = subjectCode(subject);
  if (!code) return null;
  return <span className={`subject-tag subject-tag--${code.toLowerCase()}`} title={subject} aria-label={`Õppeaine: ${subject}`}>{code}</span>;
}
