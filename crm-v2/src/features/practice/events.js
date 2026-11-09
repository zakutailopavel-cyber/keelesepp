// One tiny signal for everything the student practises at home (2026-11-09, the Duolingo-like learning area).
// Senders: the word flashcards (`kind: 'words'`), later the sentence/grammar exercise engine. Listeners: phase 3 (path,
// streak, XP, pet). Keep it minimal — two functions, no state, no React — so every feature can import it freely.
//
// event: { kind: 'words' | string, reviewed: number, correct: number, minutes: number, ...extra }
const listeners = new Set();

export function announcePractice(event = {}) {
  const detail = {
    ...event,
    kind: String(event.kind || ''),
    reviewed: Math.max(0, Number(event.reviewed) || 0),
    correct: Math.max(0, Number(event.correct) || 0),
    minutes: Math.max(0, Number(event.minutes) || 0),
    at: event.at || new Date().toISOString(),
  };
  [...listeners].forEach((listener) => {
    try { listener(detail); } catch { /* one broken listener never stops the others or the practice */ }
  });
  return detail;
}

// returns the unsubscribe function
export function onPractice(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}
