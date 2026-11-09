import { Bold, Highlighter, Italic, Underline } from 'lucide-react';
import { useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { FONTS } from './boardModel.js';
import { HIGHLIGHTS, applyStyle, stepSize, clearKey, domToSpans, insertText, plainText, selectionOffsets, setSelectionOffsets, spansToHtml, styleAt, toggleStyle } from './richText.js';

/**
 * The editor of a board text element: a contenteditable whose content is built from the element's runs (richText.js)
 * and read back into runs on every input. Formatting goes through the model (never the browser's execCommand styling),
 * so what is stored is exactly what the board shows. The selection is kept as character offsets.
 *
 * handle (ref): style(patch | key) — on the selection, or on the whole text when nothing is selected;
 *               selection() → { start, end } | null; spans() → current runs.
 */
export default function RichTextEditor({ handle, initialSpans, baseSize = 18, style, className, onChange, onBlur, label = 'Tekst', maxLength = 4000, nodeRef }) {
  const root = useRef(null);
  const spans = useRef(initialSpans || []);
  const lastSelection = useRef(null);
  // the content is set once (and after formatting); React never re-renders the children, so the caret stays put
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    node.innerHTML = spansToHtml(spans.current, baseSize);
    node.focus();
    const end = plainText(spans.current).length;
    setSelectionOffsets(node, end, end);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const setRef = (node) => { root.current = node; if (nodeRef) nodeRef.current = node; };
  const commit = (next, selection) => {
    spans.current = next;
    const node = root.current;
    if (node) {
      node.innerHTML = spansToHtml(next, baseSize);
      if (selection && globalThis.document?.activeElement === node) setSelectionOffsets(node, selection.start, selection.end);
    }
    onChange?.(next);
  };
  const currentSelection = () => selectionOffsets(root.current) || lastSelection.current;
  const rangeOf = () => {
    const selection = currentSelection();
    const length = plainText(spans.current).length;
    if (selection && selection.start !== selection.end) return { ...selection, whole: false };
    return { start: 0, end: length, whole: true, caret: selection };
  };
  useImperativeHandle(handle, () => ({
    style(patch) {
      const range = rangeOf();
      const next = typeof patch === 'string' ? toggleStyle(spans.current, range.start, range.end, patch) : applyStyle(spans.current, range.start, range.end, patch);
      commit(next, range.whole ? range.caret || { start: range.end, end: range.end } : range);
      return range;
    },
    // the element-wide size / font: single runs lose their own
    clear(key) { commit(clearKey(spans.current, key), currentSelection()); },
    selection: () => {
      const range = rangeOf();
      return range.whole ? null : range;
    },
    state: () => { const range = rangeOf(); return styleAt(spans.current, range.start, range.end); },
    spans: () => spans.current,
  }));
  const remember = () => { const selection = selectionOffsets(root.current); if (selection) lastSelection.current = selection; };
  const input = () => {
    const next = domToSpans(root.current);
    if (plainText(next).length > maxLength) { commit(spans.current, lastSelection.current); return; }
    spans.current = next;
    remember();
    onChange?.(next);
  };
  const insert = (value) => {
    const selection = selectionOffsets(root.current) || { start: plainText(spans.current).length, end: plainText(spans.current).length };
    const room = maxLength - (plainText(spans.current).length - Math.abs(selection.end - selection.start));
    const text = String(value).slice(0, Math.max(0, room));
    if (!text) return;
    const caret = Math.min(selection.start, selection.end) + text.length;
    commit(insertText(spans.current, selection.start, selection.end, text), { start: caret, end: caret });
  };
  const keyDown = (event) => {
    const mod = event.metaKey || event.ctrlKey;
    const key = String(event.key || '').toLowerCase();
    if (event.key === 'Escape') { event.preventDefault(); event.currentTarget.blur(); return; }
    if (event.key === 'Enter') { event.preventDefault(); insert('\n'); return; }
    if (mod && ['b', 'i', 'u'].includes(key)) {
      event.preventDefault();
      const range = rangeOf();
      if (range.whole && range.caret) return; // a caret alone: the shortcut needs a selection
      commit(toggleStyle(spans.current, range.start, range.end, key), range);
    }
  };
  const paste = (event) => {
    event.preventDefault();
    insert(event.clipboardData?.getData('text/plain') || '');
  };
  return <div ref={setRef} className={className} style={style} role="textbox" aria-multiline="true" aria-label={label} tabIndex={0}
    contentEditable suppressContentEditableWarning spellCheck
    onInput={input} onKeyDown={keyDown} onKeyUp={remember} onMouseUp={remember} onSelect={remember} onPaste={paste} onDrop={(event) => event.preventDefault()} onBlur={onBlur} />;
}

// the format bar over an open text: bold / italic / underline, colour, highlight, font and size — on the selection, or
// on the whole text when nothing is selected
export function FormatBar({ editor, colors = [], onWhole, baseSize = 18, position }) {
  const keep = (event) => event.preventDefault(); // the editor keeps its selection
  const act = (patch) => {
    const target = editor.current;
    if (!target) return;
    const selection = target.selection();
    if (!selection && onWhole && typeof patch === 'object') {
      // nothing selected: colour, font and size change the whole element (and runs lose their own of that key)
      const [key, value] = Object.entries(patch)[0];
      if (key === 'c') { target.clear('c'); onWhole({ color: value }); return; }
      if (key === 'f') { target.clear('f'); onWhole({ fontFamily: value }); return; }
      if (key === 's') { target.clear('s'); onWhole({ fontSize: value }); return; }
    }
    target.style(patch);
  };
  return <div className="sb-format" role="toolbar" aria-label="Teksti vorming" style={position} onPointerDown={(event) => event.stopPropagation()} onMouseDown={keep}>
    <button type="button" aria-label="Paks kiri" title="Paks (Ctrl+B)" onClick={() => act('b')}><Bold size={15} /></button>
    <button type="button" aria-label="Kaldkiri" title="Kaldkiri (Ctrl+I)" onClick={() => act('i')}><Italic size={15} /></button>
    <button type="button" aria-label="Allajoonitud" title="Allajoonitud (Ctrl+U)" onClick={() => act('u')}><Underline size={15} /></button>
    <span className="sb-format__sep" />
    {colors.slice(0, 8).map((value) => <button type="button" key={value} className="sb-format__swatch" style={{ background: value }} aria-label={`Teksti värv ${value}`} title="Teksti värv" onClick={() => act({ c: value })} />)}
    <span className="sb-format__sep" />
    <Highlighter size={14} aria-hidden="true" className="sb-format__icon" />
    {HIGHLIGHTS.map((value) => <button type="button" key={value} className="sb-format__swatch is-square" style={{ background: value }} aria-label={`Taustavärv ${value}`} title="Esiletõst" onClick={() => act({ h: value })} />)}
    <button type="button" className="sb-format__swatch is-square is-none" aria-label="Eemalda esiletõst" title="Eemalda esiletõst" onClick={() => editor.current?.style({ h: null })} />
    <span className="sb-format__sep" />
    {Object.entries(FONTS).map(([key, item]) => <button type="button" key={key} className="sb-format__font" style={{ fontFamily: item.css }} aria-label={`Kiri: ${item.label}`} title={item.label} onClick={() => act({ f: key })}>Aa</button>)}
    <span className="sb-format__sep" />
    <button type="button" className="sb-format__size" aria-label="Väiksem kiri" title="Väiksem kiri" onClick={() => act({ s: stepSize(editor.current?.state().s || baseSize, -1) })}>A−</button>
    <button type="button" className="sb-format__size" aria-label="Suurem kiri" title="Suurem kiri" onClick={() => act({ s: stepSize(editor.current?.state().s || baseSize, 1) })}>A+</button>
  </div>;
}
