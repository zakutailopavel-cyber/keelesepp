/* global ResizeObserver, Highlight, CSS, setTimeout, clearTimeout */
import { BookmarkPlus, Check, Loader2, MessageCircleWarning, StickyNote, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HIGHLIGHT, fieldTextRects, fieldsOf, isSheetAnnotation, offsetsOf, rangeOf } from './sheetAnnotationsModel.js';
import { singleWord, correctedAnswer } from './annotationWords.js';
import './sheetAnnotations.css';

const nextFrame = (fn) => (globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame(fn) : setTimeout(fn, 16));
const cancelFrame = (id) => (globalThis.cancelAnimationFrame ? globalThis.cancelAnimationFrame(id) : clearTimeout(id));

// Teacher annotations drawn on a worksheet (spec §4). The teacher selects text in a task (or in the student's
// answer field) and adds a mark: "Viga" (mistake, with the right form) or "Märkus" (note). The student sees the
// same marks. Text is highlighted with the CSS Custom Highlight API (no DOM changes under React); answer fields
// get an outline box; every mark has a numbered pin that opens its comment.
//
// Annotation shape (stored on the assignment, next to the older writing-field annotations):
//   { id, kind: 'text' | 'field', blockId, start, end, selectedText, fieldIndex?, color: 'error' | 'note',
//     parandus, selgitus, createdAt }

// words (optional, Live Classroom): { lookup(word) → { word, translation, forms: [3] }, add(card), addError({ said, corrected }) }
export default function SheetAnnotations({ annotations = [], editable = false, onChange, words = null, children }) {
  const wrapRef = useRef(null);
  const justPicked = useRef(false);
  const [marks, setMarks] = useState([]);
  const [open, setOpen] = useState('');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // stable while the marks are the same (callers often pass a fresh [] each render)
  const listKey = JSON.stringify(annotations.filter(isSheetAnnotation));
  const list = useMemo(() => JSON.parse(listKey), [listKey]);

  const layout = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const base = wrap.getBoundingClientRect();
    // on the Live Classroom board the sheet is inside a CSS transform (scale): screen pixels → the layer's own pixels
    const k = wrap.offsetWidth ? base.width / wrap.offsetWidth || 1 : 1;
    const u = (v) => v / k;
    const ranges = { error: [], note: [] };
    const next = [];
    list.forEach((item, index) => {
      const card = wrap.querySelector(`.ws-page [data-block="${String(item.blockId).replace(/["\\]/g, '\\$&')}"]`);
      if (!card) return;
      let rect = null;
      let box = null;
      let words = null;
      if (item.kind === 'field') {
        const field = fieldsOf(card)[item.fieldIndex];
        if (!field) return;
        // a selected word or phrase in the answer is marked by itself; the whole field only when nothing was selected
        const partial = item.end > item.start && item.end - item.start < String(field.value || '').length;
        const parts = partial ? fieldTextRects(field, item.start, item.end) : [];
        if (parts.length) {
          words = parts.map((r) => ({ left: u(r.left - base.left) - 1, top: u(r.top - base.top), width: u(r.width) + 2, height: u(r.height) }));
          rect = parts[parts.length - 1];
          rect = { right: rect.left + rect.width, top: rect.top };
        } else {
          const r = field.getBoundingClientRect();
          box = { left: u(r.left - base.left) - 2, top: u(r.top - base.top) - 2, width: u(r.width) + 4, height: u(r.height) + 4 };
          rect = r;
        }
      } else {
        const range = rangeOf(card, item);
        if (!range) return;
        (ranges[item.color] || ranges.error).push(range);
        const rects = range.getClientRects();
        rect = rects[rects.length - 1] || range.getBoundingClientRect();
      }
      next.push({ item, index, box, words, pin: { left: u(rect.right - base.left) - 2, top: u(rect.top - base.top) - 10 } });
    });
    if (typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined') {
      Object.entries(HIGHLIGHT).forEach(([color, name]) => CSS.highlights.set(name, new Highlight(...ranges[color])));
    }
    setMarks(next);
  }, [list]);

  useLayoutEffect(() => {
    let frame = nextFrame(layout);
    const wrap = wrapRef.current;
    const ro = typeof ResizeObserver !== 'undefined' && wrap ? new ResizeObserver(() => { cancelFrame(frame); frame = nextFrame(layout); }) : null;
    ro?.observe(wrap);
    return () => { cancelFrame(frame); ro?.disconnect(); };
  }, [layout]);
  useEffect(() => () => {
    if (typeof CSS !== 'undefined' && CSS.highlights) Object.values(HIGHLIGHT).forEach((name) => CSS.highlights.delete(name));
  }, []);

  // the click that follows this mouseup (same task) is swallowed; later clicks are not
  const markPicked = () => { justPicked.current = true; setTimeout(() => { justPicked.current = false; }, 0); };
  const pick = (event) => {
    justPicked.current = false;
    if (!editable) return;
    const wrap = wrapRef.current;
    const base = wrap.getBoundingClientRect();
    const target = event.target;
    const card = target.closest?.('.ws-page [data-block]');
    if (!card || target.closest('.sa-layer, .sa-composer')) return;
    const k = wrap.offsetWidth ? base.width / wrap.offsetWidth || 1 : 1;
    const at = { left: Math.min((event.clientX - base.left) / k, base.width / k - 300), top: (event.clientY - base.top) / k + 12 };
    if (target.matches?.('input.ws-line, textarea')) {
      const value = target.value || '';
      const hasSel = target.selectionEnd > target.selectionStart;
      // a plain click in a written answer only places the cursor (to select a word next); an empty or one-word
      // answer is marked as a whole
      if (!hasSel && value.trim().split(/\s+/).length > 1) return;
      markPicked();
      setDraft({ kind: 'field', blockId: card.dataset.block, fieldIndex: fieldsOf(card).indexOf(target), start: hasSel ? target.selectionStart : 0, end: hasSel ? target.selectionEnd : value.length, selectedText: hasSel ? value.slice(target.selectionStart, target.selectionEnd) : value, value, color: 'error', parandus: '', selgitus: '', toErrors: true, at });
      setError('');
      return;
    }
    const selection = wrap.ownerDocument.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!card.contains(range.startContainer) || !card.contains(range.endContainer)) return;
    const offsets = offsetsOf(card, range);
    const selectedText = range.toString();
    if (!offsets || !selectedText.trim()) return;
    markPicked();
    // a word of the task text is most often a word to learn; a mistake is marked in the student's answer
    setDraft({ kind: 'text', blockId: card.dataset.block, ...offsets, selectedText, color: words && singleWord(selectedText) ? 'word' : 'error', parandus: '', selgitus: '', at });
    setError('');
  };

  // „Sõna”: looked up once per picked word
  const [word, setWord] = useState(null);
  const picked = draft && words ? singleWord(draft.selectedText) : '';
  useEffect(() => {
    if (!picked || draft?.color !== 'word') return undefined;
    let alive = true;
    setWord({ asked: picked, loading: true });
    Promise.resolve().then(() => words.lookup(picked))
      .then((found) => { if (alive) setWord({ asked: picked, ...found, loading: false }); })
      .catch((caught) => { if (alive) setWord({ asked: picked, word: picked, translation: '', forms: [], loading: false, error: caught.message || 'Sõna ei leitud.' }); });
    return () => { alive = false; };
  }, [picked, draft?.color]); // eslint-disable-line react-hooks/exhaustive-deps
  const addWord = async () => {
    setSaving(true); setError('');
    try {
      const result = await words.add({ word: word.word || picked, translation: word.translation || '', forms: (word.forms || []).join(', '), formItems: word.formItems || [] });
      setWord({ ...word, saved: true, already: Boolean(result?.already) });
    } catch (caught) { setError(caught.message || 'Sõna ei saanud lisada.'); } finally { setSaving(false); }
  };

  const save = async () => {
    if (!draft.parandus.trim() && !draft.selgitus.trim()) { setError('Lisa õige variant või selgitus.'); return; }
    setSaving(true); setError('');
    try {
      const { at, value, toErrors, ...rest } = draft; // eslint-disable-line no-unused-vars
      await onChange([...annotations, { ...rest, id: `a${Date.now()}`, createdAt: new Date().toISOString() }]);
      if (words?.addError && toErrors && draft.kind === 'field' && draft.color === 'error' && draft.parandus.trim() && String(value || '').trim()) {
        await words.addError({ said: String(value).trim(), corrected: correctedAnswer(value, draft.start, draft.end, draft.parandus.trim()) });
      }
      setDraft(null);
      globalThis.getSelection?.()?.removeAllRanges();
    } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); } finally { setSaving(false); }
  };
  const remove = async (id) => {
    setSaving(true);
    try { await onChange(annotations.filter((item) => item.id !== id)); setOpen(''); } finally { setSaving(false); }
  };

  return (
    <div className={`sa-wrap ${editable ? 'is-editable' : ''}`} ref={wrapRef} onMouseUp={pick}
      // a selection that opened the composer must not also count as a click on the task (live "point at task")
      onClickCapture={(event) => { if (justPicked.current) { justPicked.current = false; event.stopPropagation(); } }}>
      {children}
      <div className="sa-layer" aria-label="Õpetaja märkused">
        {marks.map(({ item, index, box, words, pin }) => (
          <div key={item.id}>
            {box ? <div className={`sa-box is-${item.color}`} style={box} /> : null}
            {words ? words.map((w, i) => <div key={i} className={`sa-word is-${item.color}`} style={w} />) : null}
            <button type="button" className={`sa-pin is-${item.color}`} style={pin} aria-label={`Märkus ${index + 1}: ${item.parandus || item.selgitus}`} aria-expanded={open === item.id} onClick={() => setOpen(open === item.id ? '' : item.id)}>{index + 1}</button>
            {open === item.id ? (
              <div className={`sa-pop is-${item.color}`} style={{ left: Math.max(4, pin.left - 120), top: pin.top + 26 }} role="dialog" aria-label="Märkus">
                <header>{item.color === 'note' ? <StickyNote size={15} /> : <MessageCircleWarning size={15} />}<b>{item.color === 'note' ? 'Märkus' : 'Parandus'}</b><button type="button" aria-label="Sulge" onClick={() => setOpen('')}><X size={14} /></button></header>
                {item.selectedText ? <p className="sa-quote">„{item.selectedText}”</p> : null}
                {item.parandus ? <p className="sa-fix">→ <b>{item.parandus}</b></p> : null}
                {item.selgitus ? <p>{item.selgitus}</p> : null}
                {editable ? <button type="button" className="sa-remove" disabled={saving} onClick={() => remove(item.id)}><Trash2 size={14} /> Eemalda</button> : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {draft ? (
        <div className="sa-composer" style={draft.at} role="dialog" aria-label="Uus märkus">
          <div className="sa-colors" role="group" aria-label="Märkuse liik">
            <button type="button" aria-pressed={draft.color === 'error'} className={draft.color === 'error' ? 'on is-error' : ''} onClick={() => setDraft({ ...draft, color: 'error' })}>Viga</button>
            <button type="button" aria-pressed={draft.color === 'note'} className={draft.color === 'note' ? 'on is-note' : ''} onClick={() => setDraft({ ...draft, color: 'note' })}>Märkus</button>
            {picked ? <button type="button" aria-pressed={draft.color === 'word'} className={draft.color === 'word' ? 'on is-word' : ''} onClick={() => setDraft({ ...draft, color: 'word' })}>Sõna</button> : null}
          </div>
          {draft.color === 'word' ? <div className="sa-word-card" aria-live="polite">
            {word?.loading ? <p className="sa-muted"><Loader2 size={14} className="spin" aria-hidden="true" /> Otsin vorme ja tõlget…</p> : null}
            {word && !word.loading ? <>
              <p className="sa-headword"><b>{word.word || picked}</b>{word.word && word.word !== picked ? <span> ← {picked}</span> : null}</p>
              {(word.forms || []).length ? <ol className="sa-forms" aria-label="Kolm põhivormi">{word.forms.map((form, i) => <li key={i}>{form}</li>)}</ol> : <p className="sa-muted">Vorme ei leitud.</p>}
              <input aria-label="Tõlge" placeholder="Tõlge" value={word.translation || ''} onChange={(e) => setWord({ ...word, translation: e.target.value })} />
            </> : null}
          </div> : <>
            <p className="sa-quote">„{draft.selectedText || '(tühi vastus)'}”</p>
            {draft.color === 'error' ? <input aria-label="Õige variant" placeholder="Õige variant (nt osastav: koera)" value={draft.parandus} onChange={(e) => setDraft({ ...draft, parandus: e.target.value })} /> : null}
            <textarea aria-label="Selgitus" rows={2} placeholder={draft.color === 'error' ? 'Selgitus (valikuline)' : 'Mida õpilane peaks märkama?'} value={draft.selgitus} onChange={(e) => setDraft({ ...draft, selgitus: e.target.value })} />
            {words?.addError && draft.kind === 'field' && draft.color === 'error' ? <label className="sa-check"><input type="checkbox" checked={draft.toErrors !== false} onChange={(e) => setDraft({ ...draft, toErrors: e.target.checked })} /> Lisa õpilase „Minu vigadesse”</label> : null}
          </>}
          {error ? <p className="sa-error" role="alert">{error}</p> : null}
          <div className="sa-actions"><button type="button" onClick={() => { setDraft(null); setWord(null); }}>{word?.saved ? 'Sulge' : 'Loobu'}</button>
            {draft.color === 'word'
              ? <button type="button" className="primary" disabled={saving || !word || word.loading || word.saved} onClick={addWord}>{word?.saved ? <><Check size={14} aria-hidden="true" /> {word.already ? 'Juba sõnavaras' : 'Lisatud'}</> : <><BookmarkPlus size={14} aria-hidden="true" /> Lisa õpilase sõnadesse</>}</button>
              : <button type="button" className="primary" disabled={saving} onClick={save}>Lisa märkus</button>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
