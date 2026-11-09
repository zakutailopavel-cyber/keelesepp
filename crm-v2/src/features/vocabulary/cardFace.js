// What one flashcard shows (2026-11-09): part of speech, the meaning in the student's language, the key forms with
// their names, the course example sentence and the time of the next review. Pure helpers for FlashcardSession.jsx.
import { keyForms } from './wordForms.js';

const POS = {
  noun: 'nimisõna', verb: 'tegusõna', adj: 'omadussõna', adjective: 'omadussõna', adv: 'määrsõna', adverb: 'määrsõna',
  pron: 'asesõna', num: 'arvsõna', phrase: 'väljend', conj: 'sidesõna', prep: 'kaassõna', post: 'kaassõna', interj: 'hüüdsõna',
};
const SENTENCE = 'Sinu lause:';

export const isVerbForms = (forms = []) => forms.length >= 3 && /ma$/i.test(forms[0]) && /(da|ta|a)$/i.test(forms[1]);

// „tegusõna”, „käändsõna”, „väljend”, „lause” or '' when we cannot tell honestly
export function posLabel(card = {}, dictionary = {}) {
  const given = POS[String(card.pos || '').toLowerCase()];
  if (given) return given;
  if (String(card.back || '').startsWith(SENTENCE)) return 'lause';
  const front = String(card.front || '').trim();
  if (/\s/.test(front)) return 'väljend';
  const forms = keyForms(front, card.hint, dictionary);
  if (isVerbForms(forms)) return 'tegusõna';
  return forms.length ? 'käändsõna' : '';
}

// [{ label, value }]: nimetav · omastav · osastav (or ma · da · tema for a verb), then up to two more forms the teacher
// saved with the word (mitmus first)
export function formRows(card = {}, dictionary = {}) {
  const forms = keyForms(card.front, card.hint, dictionary);
  const labels = isVerbForms(forms) ? ['ma-vorm', 'da-vorm', 'tema'] : ['nimetav', 'omastav', 'osastav'];
  const rows = forms.slice(0, 3).map((value, index) => ({ label: labels[index], value }));
  const seen = new Set(rows.map((row) => row.value.toLocaleLowerCase('et')));
  const items = Array.isArray(card.word?.formItems) ? card.word.formItems : [];
  const extra = [...items].sort((a, b) => Number(!String(b.code).startsWith('Pl')) - Number(!String(a.code).startsWith('Pl')))
    .filter((item) => item?.value && item?.label && !seen.has(String(item.value).toLocaleLowerCase('et')));
  extra.slice(0, 2).forEach((item) => rows.push({ label: String(item.label), value: String(item.value) }));
  return rows;
}

// the meaning in the student's language when the card has several, else the one it has
export function meaningFor(card = {}, language = '') {
  const lang = String(language || '').toLowerCase();
  return String(card.meanings?.[lang] || card.back || '').replace(/^Sinu lause:\s*/, '');
}

export const meaningLang = (text = '') => (/[Ѐ-ӿ]/.test(text) ? 'ru' : undefined);

export function exampleFor(card = {}) {
  const example = String(card.word?.example || card.example || '').trim();
  return example && example !== card.front ? example : '';
}

// „5 min pärast”, „täna kell 14:20”, „homme”, „12. november”
export function formatWhen(iso, now = new Date()) {
  const time = Date.parse(iso || '');
  if (!Number.isFinite(time)) return '';
  const at = new Date(time);
  const minutes = Math.round((time - now.getTime()) / 60000);
  if (minutes <= 0) return 'kohe';
  if (minutes < 60) return `${minutes} min pärast`;
  const day = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((day(at) - day(now)) / 86400000);
  if (days === 0) return `täna kell ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
  if (days === 1) return 'homme';
  if (days === 2) return 'ülehomme';
  return at.toLocaleDateString('et-EE', { day: 'numeric', month: 'long' });
}

// the Estonian voice of the browser (free, on the device), or null
export function estonianVoice(synth = globalThis.speechSynthesis) {
  try { return (synth?.getVoices?.() || []).find((voice) => /^et([-_]|$)/i.test(String(voice?.lang || ''))) || null; } catch { return null; }
}
