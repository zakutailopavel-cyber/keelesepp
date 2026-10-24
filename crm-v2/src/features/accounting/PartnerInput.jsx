import { forwardRef, useState } from 'react';
import { partnerMatches } from './journalGrid.js';

// the partner cell of an entry line (the accountant 2026-10-24: each line on a partner account carries its partner,
// like Merit): a list of Tarnijad matching what is typed — the name from its start or anywhere, the registry code
// from its start; arrows + Enter / Tab or a click pick one (the same as AccountInput for accounts)
// tabMoves: Tab picks and still moves to the next field (the typed entry rows); in the päevaraamat grid the grid moves
const PartnerInput = forwardRef(function PartnerInput({ suppliers = [], value, onChange, onPick, label, onKeyDown, inputProps = {}, tabMoves = false }, ref) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const exact = suppliers.some((s) => String(s.name || '') === String(value || '') && s.active !== false);
  const matches = open && !exact ? partnerMatches(suppliers, value) : [];
  const pick = (supplier, key = '') => { setOpen(false); onPick?.(supplier, key); };
  return <span className="accounting-account-input accounting-partner-input">
    <input ref={ref} aria-label={label} value={value || ''} placeholder="tarnija (nimi või reg-kood)" autoComplete="off" role="combobox"
      aria-expanded={matches.length > 0} aria-autocomplete="list" {...inputProps}
      onFocus={(event) => { setOpen(true); inputProps.onFocus?.(event); }}
      onBlur={(event) => { setOpen(false); inputProps.onBlur?.(event); }}
      onChange={(event) => { onChange(event.target.value.trimStart()); setOpen(true); setIndex(0); }}
      onKeyDown={(event) => {
        if (matches.length && event.key === 'ArrowDown') { event.preventDefault(); event.stopPropagation(); setIndex((i) => (i + 1) % matches.length); return; }
        if (matches.length && event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); setIndex((i) => (i - 1 + matches.length) % matches.length); return; }
        if (matches.length && (event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey) {
          if (!(tabMoves && event.key === 'Tab')) { event.preventDefault(); event.stopPropagation(); }
          pick(matches[Math.min(index, matches.length - 1)], event.key);
          return;
        }
        if (event.key === 'Escape' && matches.length) { event.stopPropagation(); setOpen(false); return; }
        onKeyDown?.(event);
      }} />
    {matches.length ? <ul className="accounting-account-input__list" role="listbox" aria-label="Sobivad tarnijad">
      {matches.map((s, i) => <li key={s.id} role="option" aria-selected={i === index} className={i === index ? 'is-active' : ''}
        onMouseDown={(event) => { event.preventDefault(); pick(s); }}><strong>{s.name}</strong>{s.regCode ? ` ${s.regCode}` : ''}</li>)}
    </ul> : null}
  </span>;
});

export default PartnerInput;
