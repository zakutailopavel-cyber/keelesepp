import { createContext } from 'react';

// The text of a listening task (owner 2026-11-10: „чтобы можно было сам текст тоже увидеть и показать”).
// The course stores what is heard as `data.transcript`, one line per line of speech, often „Kõneleja: tekst”.
//
// Who sees it (transcriptAccess):
//   staff (studio, library preview, a teacher's read-only look, the Live Classroom teacher view) — always, for themselves;
//   the learner — when the teacher shows it in the live lesson (assignment.liveTranscripts), or after the answers of the
//   task are checked (the sheet is submitted, or the teacher showed that task's right answers); a task with nothing to
//   check opens its text after the recording has been played to the end once.
// Nothing is hidden on the server: the whole sheet (with its answers) is already the learner's copy. This is about
// learning — the text is for checking what she heard, not for reading instead of listening.

export const LISTENING_TYPES = new Set(['listening', 'examlisten']);

// „Grete: Tere, Sofia!” → speaker „Grete”. A name: one to three words, each with a capital letter, no digits
// („Proua Tamm:”, „Müüja:”); „Tartus avatakse raamatukogu: …” is a sentence, not a speaker.
const SPEAKER = /^(\p{Lu}[\p{L}'’.-]*(?: \p{Lu}[\p{L}'’.-]*){0,2}):\s+(\S.*)$/u;

// [{ speaker, text, first }] — `first`: the speaker changes here (the name is printed once per turn)
export function transcriptLines(text) {
  let last = '';
  return String(text || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const m = line.match(SPEAKER);
    const speaker = m && m[1].length <= 30 ? m[1] : '';
    const item = { speaker, text: speaker ? m[2].trim() : line, first: Boolean(speaker) && speaker !== last };
    last = speaker;
    return item;
  });
}

export const hasTranscript = (type, data) => LISTENING_TYPES.has(type) && !data?.partOf && String(data?.transcript || '').trim() !== '';

// the task has right answers to check (a listening task without gaps has none); def = BLOCKS[type] (registry.js)
export function hasCheck(def, data) {
  try { return Boolean((def?.answers?.(data || {}) || []).length || (def?.answerKeys?.(data || {}) || []).length); } catch { return false; }
}

// { can, why }: why = staff | teacher | checked | listened | check-first | listen-first | none
export function transcriptAccess({ role, check = true, submitted = false, revealed = false, answersShown = false, audioEnded = false }) {
  if (role === 'staff') return { can: true, why: 'staff' };
  if (role !== 'student') return { can: false, why: 'none' };
  if (revealed) return { can: true, why: 'teacher' };
  if (check) return submitted || answersShown ? { can: true, why: 'checked' } : { can: false, why: 'check-first' };
  return audioEnded ? { can: true, why: 'listened' } : { can: false, why: 'listen-first' };
}

// What the sheet tells its listening tasks (Sheet.jsx provides it; without a provider nothing is shown):
//   role: 'staff' | 'student' | ''   submitted   revealed: Set   answersShown: Set
//   onLive(blockId, on) → Promise | null (teacher in the live lesson)   busy
//   isOpen(id) / setOpen(id, open)   ended(id) / markEnded(id)
export const TranscriptContext = createContext(null);

export const TRANSCRIPT_TEXT = {
  et: { show: 'Näita teksti', hide: 'Peida tekst', title: 'Kuulamise tekst', showStudent: 'Näita õpilasele', hideStudent: 'Peida õpilaselt', shownStudent: 'Õpilane näeb teksti', byTeacher: 'Õpetaja näitab sulle teksti.' },
  en: { show: 'Show text', hide: 'Hide text', title: 'Transcript', showStudent: 'Näita õpilasele', hideStudent: 'Peida õpilaselt', shownStudent: 'Õpilane näeb teksti', byTeacher: 'Your teacher is showing you the text.' },
};
