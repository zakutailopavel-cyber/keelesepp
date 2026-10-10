import { useEffect, useState } from 'react';
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

export function useWordLookup({ studentId, enabled = true, service = languageToolsService }) {
  const [card, setCard] = useState(null);

  useEffect(() => {
    if (!card) return undefined;
    const close = (event) => { if (event.type === 'keydown' ? event.key === 'Escape' : !event.target.closest?.('.ws-word-card')) setCard(null); };
    globalThis.addEventListener('keydown', close);
    globalThis.addEventListener('pointerdown', close);
    return () => { globalThis.removeEventListener('keydown', close); globalThis.removeEventListener('pointerdown', close); };
  }, [card]);

  const onDoubleClick = (event) => {
    if (!enabled || !studentId || typeof service.lookupStudentWord !== 'function') return;
    if (event.target.closest?.('input, textarea, select, button, [contenteditable="true"], [contenteditable="plaintext-only"]')) return;
    const selection = globalThis.getSelection?.();
    const word = wordFromSelection(selection);
    if (!word) return;
    const rect = selection.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : event.target.getBoundingClientRect();
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

  return { onDoubleClick, popup };
}
