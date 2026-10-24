import { forwardRef, useState } from 'react';

// accounts that match what is typed: a number from its start, a name anywhere (the accountant 2026-10-24 typed „so”
// for sotsiaalmaks and had to remember the number)
function accountMatches(accounts = [], text = '', limit = 8) {
  const query = String(text || '').trim().toLowerCase();
  if (!query) return [];
  const open = accounts.filter((a) => a.active !== false);
  const byCode = open.filter((a) => String(a.code).startsWith(query));
  const byName = open.filter((a) => !String(a.code).startsWith(query) && String(a.name || '').toLowerCase().includes(query));
  return [...byCode, ...byName].slice(0, limit);
}

// an account cell of a typed entry: a list of matching accounts under the input; arrows + Enter or a click pick one
const AccountInput = forwardRef(function AccountInput({ accounts, value, onChange, label, onKeyDown }, ref) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const exact = accounts.some((a) => String(a.code) === String(value) && a.active !== false);
  const matches = open && !exact ? accountMatches(accounts, value) : [];
  const pick = (account) => { onChange(String(account.code)); setOpen(false); };
  return <span className="accounting-account-input">
    <input ref={ref} aria-label={label} value={value} placeholder="konto (nr või nimi)" autoComplete="off" role="combobox"
      aria-expanded={matches.length > 0} aria-autocomplete="list"
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onChange={(event) => { onChange(event.target.value.trimStart()); setOpen(true); setIndex(0); }}
      onKeyDown={(event) => {
        if (matches.length && event.key === 'ArrowDown') { event.preventDefault(); setIndex((i) => (i + 1) % matches.length); return; }
        if (matches.length && event.key === 'ArrowUp') { event.preventDefault(); setIndex((i) => (i - 1 + matches.length) % matches.length); return; }
        if (matches.length && (event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey) { if (event.key === 'Enter') event.preventDefault(); pick(matches[Math.min(index, matches.length - 1)]); return; }
        if (event.key === 'Escape') { setOpen(false); return; }
        onKeyDown?.(event);
      }} />
    {matches.length ? <ul className="accounting-account-input__list" role="listbox" aria-label="Sobivad kontod">
      {matches.map((a, i) => <li key={a.code} role="option" aria-selected={i === index} className={i === index ? 'is-active' : ''}
        onMouseDown={(event) => { event.preventDefault(); pick(a); }}><strong>{a.code}</strong> {a.name}</li>)}
    </ul> : null}
  </span>;
});

export default AccountInput;
