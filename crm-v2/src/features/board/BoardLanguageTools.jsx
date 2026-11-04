import { useCallback, useEffect, useRef, useState } from 'react';
import { wordTapService } from '../../services/firebase/wordTap.js';
import LetterBar from './LetterBar.jsx';
import WordTapCard from './WordTapCard.jsx';
import { addToDictionary, createLookupCache, isTap, lookupWord, rangeAnchor, tapIntent, translationTarget, wordRangeAt } from './wordTap.js';
import './languageTools.css';

// one lookup per word and language for the whole session (per service: the tests pass their own)
const caches = new WeakMap();
function cacheFor(service) {
  if (!caches.has(service)) caches.set(service, createLookupCache((word, tgt) => lookupWord(service, word, tgt)));
  return caches.get(service);
}

/**
 * The lesson board's language helpers, mounted once inside the board (StudentBoard) and working on its stage:
 * „Puuduta sõna” — a tap (a double click with a mouse) on a word of the worksheet or of a board text → WordTapCard;
 * „õ ä ö ü” — LetterBar over the focused answer field / board text.
 * dictionaryFor: the student whose `studentWords` „Lisa sõnastikku” writes to ('' on a group board: lookup only).
 */
export default function BoardLanguageTools({ dictionaryFor = '', user = null, staff = false, service = wordTapService }) {
  const [root, setRoot] = useState(null);
  // the board's root (`.sb`): this component's marker sits directly in it
  const marker = useCallback((node) => setRoot(node?.parentElement || null), []);
  const [card, setCard] = useState(null);
  const seq = useRef(0);
  const live = useRef({ dictionaryFor, staff, service });
  useEffect(() => { live.current = { dictionaryFor, staff, service }; });

  const close = useCallback(() => setCard(null), []);

  useEffect(() => {
    if (!root) return undefined;
    // the sheet's own double-click card (WordLookup) stands aside on this board
    root.dataset.wordTap = '1';
    const doc = root.ownerDocument || globalThis.document;
    let down = null;
    let timer = 0;

    const open = (x, y, target) => {
      const stage = target?.closest?.('.sb-stage');
      if (!tapIntent({ target, stage, staff: live.current.staff, active: doc.activeElement })) return;
      const hit = wordRangeAt(x, y, { doc, cover: [...stage.querySelectorAll(':scope > svg')] });
      if (!hit || !stage.contains(hit.node)) return;
      const key = seq.current + 1;
      seq.current = key;
      const { service: words, dictionaryFor: student } = live.current;
      setCard({ key, word: hit.word, anchor: rangeAnchor(hit.range, hit.node), loading: true, tgt: '' });
      (async () => {
        const tgt = translationTarget(await Promise.resolve(words.preferredLanguage?.(student)).catch(() => ''));
        const data = await cacheFor(words).get(hit.word, tgt);
        setCard((current) => (current?.key === key ? { ...current, loading: false, tgt, data } : current));
      })().catch((error) => setCard((current) => (current?.key === key ? { ...current, loading: false, data: { word: hit.word, lemma: '', translation: '', error: error?.message || 'error' } } : current)));
    };

    const onDown = (event) => {
      if (event.pointerType !== 'touch') { down = null; return; }
      // a second finger: a pinch, not a tap
      down = event.isPrimary ? { id: event.pointerId, x: event.clientX, y: event.clientY, t: event.timeStamp || Date.now() } : null;
    };
    const onUp = (event) => {
      const start = down;
      down = null;
      if (!start || event.pointerType !== 'touch' || event.pointerId !== start.id) return;
      if (!isTap(start, { x: event.clientX, y: event.clientY, t: event.timeStamp || Date.now() })) return;
      open(event.clientX, event.clientY, event.target);
    };
    const onCancel = () => { down = null; };
    // a mouse: a double click. A board text the user may edit opens its editor on a double click — then no card.
    const onDouble = (event) => {
      const { clientX: x, clientY: y, target } = event;
      globalThis.clearTimeout(timer);
      timer = globalThis.setTimeout(() => {
        if (root.querySelector('.sb-editor')) return;
        open(x, y, target);
      }, 0);
    };
    root.addEventListener('pointerdown', onDown, true);
    root.addEventListener('pointerup', onUp, true);
    root.addEventListener('pointercancel', onCancel, true);
    root.addEventListener('dblclick', onDouble, true);
    return () => {
      delete root.dataset.wordTap;
      globalThis.clearTimeout(timer);
      root.removeEventListener('pointerdown', onDown, true);
      root.removeEventListener('pointerup', onUp, true);
      root.removeEventListener('pointercancel', onCancel, true);
      root.removeEventListener('dblclick', onDouble, true);
    };
  }, [root]);

  const add = async () => {
    if (!card?.data || card.saving) return;
    const key = card.key;
    setCard((current) => (current?.key === key ? { ...current, saving: true, addError: '' } : current));
    try {
      const result = await addToDictionary(service.words, { studentId: dictionaryFor, user, staff, card: { ...card.data, word: card.word } });
      setCard((current) => (current?.key === key ? { ...current, saving: false, saved: result.already ? 'already' : 'added' } : current));
    } catch (error) {
      setCard((current) => (current?.key === key ? { ...current, saving: false, addError: error?.message?.includes('permission') ? 'Sõna ei saanud lisada (õigused).' : 'Sõna ei saanud lisada.' } : current));
    }
  };

  return <>
    <span ref={marker} hidden data-board-language-tools="" />
    {card ? <WordTapCard key={card.key} card={card} canAdd={Boolean(dictionaryFor && user?.uid && service.words)} onAdd={add} onClose={close} /> : null}
    <LetterBar root={root} canHide={staff} />
  </>;
}
