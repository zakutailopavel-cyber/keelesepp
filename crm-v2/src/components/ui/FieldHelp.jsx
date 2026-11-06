import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './fieldHelp.css';

/**
 * „?” next to a form field (owner 2026-11-06: forms must explain themselves). A tap / click / Enter opens a short
 * popover saying in plain Estonian what to enter, with an example. Escape, a second tap, a tap outside or Tab away
 * closes it; Escape returns the focus to the „?” button and does not close the surrounding Modal.
 *
 * Usage: `<Input label="Grupi nimi" help="Lühike nimi …" example="Eesti keel B1 · teisipäev 18:00" />` (Input and
 * Select take `help` / `helpExample`), or on its own `<FieldHelp label="Grupi nimi" text="…" example="…" />`.
 * The popover is absolutely positioned, so opening it never moves the form (no layout shift).
 */
export default function FieldHelp({ label = '', text, example = '', className = '' }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState(null);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const popoverId = useId();
  const titleId = `${popoverId}-title`;

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  // the popover stays inside the screen with a 16 px gutter (phones, the last column of a form): its left edge is
  // shifted from the „?” as far as needed, never past the left gutter
  useLayoutEffect(() => {
    if (!open || !wrapRef.current || typeof window === 'undefined') return;
    const left = wrapRef.current.getBoundingClientRect().left;
    const width = Math.min(300, window.innerWidth - 32);
    setPlace({ width, left: Math.max(16 - left, Math.min(-8, window.innerWidth - 16 - width - left)) });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    popoverRef.current?.focus();
    const outside = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  if (!text) return null;
  const name = label || 'väli';
  return (
    <span
      ref={wrapRef}
      className={`field-help ${className}`}
      onKeyDown={(event) => {
        // only the popover closes; the Modal around the form listens on document and must not see this Escape
        if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(true); }
      }}
      onBlur={(event) => { if (open && !wrapRef.current?.contains(event.relatedTarget)) setOpen(false); }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="field-help__button"
        aria-label={`Abi: ${name}`}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpen((value) => !value)}
      >?</button>
      {open ? (
        <span ref={popoverRef} id={popoverId} role="dialog" aria-modal="false" aria-labelledby={titleId} tabIndex={-1} className="field-help__popover" style={place ? { left: place.left, width: place.width } : undefined}>
          <strong id={titleId} className="field-help__title">{name}</strong>
          <span className="field-help__text">{text}</span>
          {example ? <span className="field-help__example"><b>Näide:</b> {example}</span> : null}
        </span>
      ) : null}
    </span>
  );
}

/** The label row of Input / Select: the label and, when `help` is given, its „?” right after it. */
export function FieldLabel({ htmlFor, label, help, helpExample }) {
  if (!label) return null;
  if (!help) return <label className="field__label" htmlFor={htmlFor}>{label}</label>;
  return <span className="field__label-row"><label className="field__label" htmlFor={htmlFor}>{label}</label><FieldHelp label={typeof label === 'string' ? label : ''} text={help} example={helpExample} /></span>;
}
