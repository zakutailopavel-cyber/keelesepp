import { useEffect, useRef } from 'react';

// Options as big buttons; number keys 1–9 pick one (the lesson listens for them, see PracticeLesson).
export function OptionChoice({ options, value, onChange, disabled = false, verdict = '', expected = '' }) {
  return (
    <div className="pr-options" role="radiogroup" aria-label="Vali vastus">
      {options.map((opt, i) => {
        const picked = value === opt;
        const state = verdict && (opt === expected ? 'right' : picked ? 'wrong' : '');
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={picked}
            className={`pr-option${picked ? ' is-picked' : ''}${state ? ` is-${state}` : ''}`}
            onClick={() => !disabled && onChange(opt)}
            disabled={disabled}
          >
            <kbd aria-hidden="true">{i + 1}</kbd>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

const LETTERS = ['õ', 'ä', 'ö', 'ü', 'š', 'ž'];

// A typed answer with the Estonian letters as buttons (a phone keyboard without them is common).
export function TypedAnswer({ value, onChange, onSubmit, disabled = false, multiline = false, label = 'Sinu vastus', autoFocus = true }) {
  const ref = useRef(null);
  useEffect(() => { if (autoFocus && !disabled) ref.current?.focus({ preventScroll: true }); }, [autoFocus, disabled]);
  const insert = (ch) => {
    const el = ref.current;
    if (!el || disabled) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + ch + value.slice(end));
    window.requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + ch.length, start + ch.length); });
  };
  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onSubmit?.(); }
  };
  const Field = multiline ? 'textarea' : 'input';
  return (
    <div className="pr-typed">
      <Field
        ref={ref}
        className="pr-typed__field"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={multiline ? 2 : undefined}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        lang="et"
        placeholder="Kirjuta siia…"
      />
      <div className="pr-typed__letters" aria-label="Eesti tähed">
        {LETTERS.map((ch) => (
          <button key={ch} type="button" className="pr-letter" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(ch)} disabled={disabled} aria-label={`Lisa täht ${ch}`}>{ch}</button>
        ))}
      </div>
    </div>
  );
}
