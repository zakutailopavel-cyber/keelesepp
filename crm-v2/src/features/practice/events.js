/* global CustomEvent */
// The practice area's in-page signal (docs/PRACTICE_ENGINE.md „Events”): a finished practice — word cards (phase 1) or a
// grammar / sentence lesson (phase 2) — is announced once, and whoever cares (pet, streak, XP — phase 3) listens.
// Nothing is stored here.
//
//   announcePractice({ kind: 'words' | 'grammar' | 'sentences', items, correct, minutes, grammarPoints? })
//   onPractice(fn) → unsubscribe
export const PRACTICE_EVENT = 'ks-practice-done';

export function announcePractice(detail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PRACTICE_EVENT, { detail }));
}

export function onPractice(fn) {
  if (typeof window === 'undefined') return () => {};
  const handler = (event) => fn(event.detail || {});
  window.addEventListener(PRACTICE_EVENT, handler);
  return () => window.removeEventListener(PRACTICE_EVENT, handler);
}
