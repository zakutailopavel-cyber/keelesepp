// Word tiles: tap a tile in the bank to put it in the sentence, tap it in the sentence to take it back. Keyboard: every
// tile is a button (Tab, Enter / Space); Backspace takes the last tile back. `value` is the list of chosen tile indexes.
export default function SentenceBuilder({ tiles, value, onChange, disabled = false, label = 'Sinu lause' }) {
  const chosen = new Set(value);
  const put = (i) => { if (!disabled && !chosen.has(i)) onChange([...value, i]); };
  const takeBack = (pos) => { if (!disabled) onChange(value.filter((_, k) => k !== pos)); };
  const onKeyDown = (event) => {
    if (event.key === 'Backspace' && value.length && !disabled && event.target.tagName !== 'INPUT') {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="pr-builder" onKeyDown={onKeyDown}>
      <div className="pr-builder__line" role="group" aria-label={label} data-empty={value.length ? undefined : 'true'}>
        {value.length ? value.map((i, pos) => (
          <button key={`${i}-${pos}`} type="button" className="pr-tile pr-tile--placed" onClick={() => takeBack(pos)} disabled={disabled} aria-label={`${tiles[i]} — võta tagasi`}>
            {tiles[i]}
          </button>
        )) : <span className="pr-builder__hint">Puuduta sõnu õiges järjekorras</span>}
      </div>
      <div className="pr-builder__bank" role="group" aria-label="Sõnad">
        {tiles.map((t, i) => (
          <button key={i} type="button" className={`pr-tile${chosen.has(i) ? ' pr-tile--used' : ''}`} onClick={() => put(i)} disabled={disabled || chosen.has(i)} aria-hidden={chosen.has(i) || undefined} tabIndex={chosen.has(i) ? -1 : 0}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
