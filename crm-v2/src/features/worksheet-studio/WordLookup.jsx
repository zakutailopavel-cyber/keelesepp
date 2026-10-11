import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookmarkCheck, Loader2, X } from 'lucide-react';
import { languageToolsService } from '../../services/firebase/languageTools.js';

// The learner double-clicks a word on the sheet (owner, 2026-10-10): a small card shows the key forms (EKI) and the
// translation (TartuNLP), and the server adds the word to the learner's own „Sõnad” list.
const LETTERS = /^[^\p{L}]+|[^\p{L}]+$/gu;

export function wordFromSelection(selection) {
  const raw = String(selection?.toString?.() || '').trim().replace(LETTERS, '');
  return raw && !/\s/.test(raw) && raw.length <= 60 ? raw : '';
}

// the word under a finger: a touch screen has no double click and no selection after a double tap (owner
// 2026-10-11: on an iPad nothing happened), so the word is found from the point itself
const LETTER = /[\p{L}\p{M}]/u;
export function wordAtPoint(x, y, doc = globalThis.document) {
  let node = null; let offset = 0;
  if (doc?.caretRangeFromPoint) { const range = doc.caretRangeFromPoint(x, y); node = range?.startContainer; offset = range?.startOffset ?? 0; }
  else if (doc?.caretPositionFromPoint) { const pos = doc.caretPositionFromPoint(x, y); node = pos?.offsetNode; offset = pos?.offset ?? 0; }
  if (!node || node.nodeType !== 3) return null;
  const text = node.textContent || '';
  let start = offset; let end = offset;
  while (start > 0 && LETTER.test(text[start - 1])) start -= 1;
  while (end < text.length && LETTER.test(text[end])) end += 1;
  const word = text.slice(start, end);
  if (!word || word.length > 60) return null;
  let rect = null;
  try { const range = doc.createRange(); range.setStart(node, start); range.setEnd(node, end); rect = range.getBoundingClientRect(); } catch { rect = null; }
  return { word, rect, target: node.parentElement };
}

const DOUBLE_TAP_MS = 350;
const DOUBLE_TAP_PX = 24;
const SKIP = 'input, textarea, select, button, [contenteditable="true"], [contenteditable="plaintext-only"]';

export function useWordLookup({ studentId, enabled = true, service = languageToolsService }) {
  const [card, setCard] = useState(null);

  useEffect(() => {
    if (!card) return undefined;
    const close = (event) => { if (event.type === 'keydown' ? event.key === 'Escape' : !event.target.closest?.('.ws-word-card')) setCard(null); };
    globalThis.addEventListener('keydown', close);
    globalThis.addEventListener('pointerdown', close);
    return () => { globalThis.removeEventListener('keydown', close); globalThis.removeEventListener('pointerdown', close); };
  }, [card]);

  const lastTap = useRef(null);
  const active = () => enabled && studentId && typeof service.lookupStudentWord === 'function';

  const onDoubleClick = (event) => {
    if (!active()) return;
    if (event.target.closest?.(SKIP)) return;
    const selection = globalThis.getSelection?.();
    const word = wordFromSelection(selection);
    if (!word) return;
    lookup(word, selection.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : event.target.getBoundingClientRect());
  };

  // a double tap with a finger (iPad, phone)
  const onPointerUp = (event) => {
    if (event.pointerType !== 'touch' || !active()) return;
    const now = event.timeStamp || 0;
    const last = lastTap.current;
    if (last && now - last.t <= DOUBLE_TAP_MS && Math.hypot(event.clientX - last.x, event.clientY - last.y) <= DOUBLE_TAP_PX) {
      lastTap.current = null;
      if (event.target.closest?.(SKIP)) return;
      const hit = wordAtPoint(event.clientX, event.clientY);
      if (hit?.target?.closest?.(SKIP)) return;
      if (hit?.word) lookup(hit.word, hit.rect || event.target.getBoundingClientRect());
      return;
    }
    lastTap.current = { t: now, x: event.clientX, y: event.clientY };
  };

  const lookup = (word, rect) => {
    const place = { left: Math.max(8, Math.min((rect.left || 0), (globalThis.innerWidth || 800) - 288)), top: (rect.bottom || 0) + 8 };
    setCard({ word, ...place, loading: true });
    service.lookupStudentWord({ studentId, word })
      .then((data) => setCard((current) => (current?.word === word ? { ...current, loading: false, data } : current)))
      .catch((error) => setCard((current) => (current?.word === word ? { ...current, loading: false, error: error.message || 'Sõna ei leitud.' } : current)));
  };

  const forms = card?.data?.forms?.forms || [];
  const popupCard = card ? <div className="ws-word-card" role="dialog" aria-label={`Sõna ${card.word}`} style={{ left: card.left, top: card.top }}>
    <button type="button" className="ws-word-card__close" aria-label="Sulge" onClick={() => setCard(null)}><X size={14} /></button>
    <strong className="ws-word-card__word">{card.data?.word || card.word}</strong>
    {card.loading ? <p className="ws-word-card__muted"><Loader2 size={14} className="spin" aria-hidden="true" /> Otsin vorme ja tõlget…</p> : null}
    {card.error ? <p className="ws-word-card__muted" role="alert">{card.error}</p> : null}
    {card.data ? <>
      {card.data.translation ? <p className="ws-word-card__tr">{card.data.translation}</p> : null}
      {forms.length ? <ul className="ws-word-card__forms">{forms.slice(0, 4).map((form) => <li key={form.code}><span>{form.label}</span><b>{form.value}</b></li>)}</ul> : <p className="ws-word-card__muted">Vorme ei leitud.</p>}
      <p className="ws-word-card__saved"><BookmarkCheck size={14} aria-hidden="true" /> {card.data.already ? 'See sõna on juba sinu sõnavaras.' : 'Lisatud sinu sõnavarasse.'}</p>
    </> : null}
  </div> : null;
  // a portal: the sheet may sit in a scaled layer (the board), where position: fixed would not follow the viewport
  const popup = popupCard && globalThis.document?.body ? createPortal(popupCard, globalThis.document.body) : null;

  return { onDoubleClick, onPointerUp, popup };
}
