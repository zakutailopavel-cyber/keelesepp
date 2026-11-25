import { useEffect, useRef, useState } from 'react';
import { FILL_MAX, blankParts } from './blankFill.js';

// The teacher's text with an input in every gap. Typing is saved shortly after the learner stops (and on leaving the
// box); a value arriving from the other side (the teacher in Live) replaces the box only while it is not being typed in.
function Gap({ gap, value, onSave, readOnly, width }) {
  const [draft, setDraft] = useState(value || '');
  const focused = useRef(false);
  const timer = useRef(null);
  useEffect(() => { if (!focused.current) setDraft(value || ''); }, [value]);
  useEffect(() => () => globalThis.clearTimeout(timer.current), []);
  const save = (next) => { globalThis.clearTimeout(timer.current); if (next !== (value || '')) onSave(gap, next); };
  return <input
    className={`sb-gap${draft ? ' is-filled' : ''}`}
    aria-label={`Lünk ${gap + 1}`}
    value={draft}
    maxLength={FILL_MAX}
    readOnly={readOnly}
    style={{ width: `${Math.max(width, Math.min(22, draft.length + 2))}ch` }}
    onPointerDown={(event) => event.stopPropagation()}
    onDoubleClick={(event) => event.stopPropagation()}
    // Enter goes on to the next box (the „õ ä ö ü” bar under the box may cover the next line), the last one closes
    onKeyDown={(event) => {
      event.stopPropagation();
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const boxes = [...(event.currentTarget.closest('.sb-text')?.querySelectorAll('.sb-gap') || [])];
      const next = boxes[boxes.indexOf(event.currentTarget) + 1];
      if (next) next.focus(); else event.currentTarget.blur();
    }}
    onFocus={() => { focused.current = true; }}
    onBlur={() => { focused.current = false; save(draft); }}
    onChange={(event) => {
      const next = event.target.value;
      setDraft(next);
      globalThis.clearTimeout(timer.current);
      timer.current = globalThis.setTimeout(() => save(next), 700);
    }}
  />;
}

export default function BlankFillText({ element, onSave, readOnly = false }) {
  const fills = element.fills || {};
  return blankParts(element.text).map((part, index) => (part.text != null
    ? <span key={index}>{part.text}</span>
    : <Gap key={index} gap={part.gap} value={fills[part.gap] ?? fills[String(part.gap)]} onSave={onSave} readOnly={readOnly} width={Math.min(14, Math.max(6, part.raw.length))} />));
}
