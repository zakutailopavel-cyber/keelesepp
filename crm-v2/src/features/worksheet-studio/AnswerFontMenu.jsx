import { useEffect, useId, useRef, useState } from 'react';
import { ANSWER_FONTS, useAnswerFont } from './answerFont.js';

// „Aa” in a worksheet's toolbar: the viewer picks the font typed answers are shown in (answerFont.js). Only how the
// sheet looks on this device changes; the answers themselves stay as they are.
export default function AnswerFontMenu({ className = '' }) {
  const [font, setFont] = useAnswerFont();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    globalThis.document?.addEventListener('pointerdown', onDown);
    globalThis.document?.addEventListener('keydown', onKey);
    return () => {
      globalThis.document?.removeEventListener('pointerdown', onDown);
      globalThis.document?.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const current = ANSWER_FONTS.find((item) => item.key === font) || ANSWER_FONTS[0];
  return (
    <div className={`ws-ansfont ${className}`} ref={wrapRef}>
      <button type="button" className="ws-ansfont-btn" aria-haspopup="true" aria-expanded={open} aria-controls={open ? listId : undefined}
        title={`Vastuste kiri: ${current.label}`} aria-label={`Vastuste kiri: ${current.label}`} onClick={() => setOpen((value) => !value)}>
        Aa
      </button>
      {open ? (
        <div className="ws-ansfont-pop" id={listId} role="radiogroup" aria-label="Kiri">
          <b>Kiri</b>
          {ANSWER_FONTS.map((item) => (
            <button key={item.key} type="button" role="radio" aria-checked={item.key === font} className={`ws-ansfont-opt is-${item.key}${item.key === font ? ' is-on' : ''}`}
              onClick={() => { setFont(item.key); setOpen(false); }}>
              <span>{item.label}</span><small>{item.hint}</small>
            </button>
          ))}
          <p>Muutub ainult see, kuidas vastuseid sinu ekraanil näed.</p>
        </div>
      ) : null}
    </div>
  );
}
