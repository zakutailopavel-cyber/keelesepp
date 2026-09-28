import { useRef, useState } from 'react';
import { ASPECTS } from '../engine/schema.js';
import { objectPosition } from '../engine/image.js';
import { useAssets } from '../engine/assets.jsx';

// Small form controls for the block inspector. Values are plain strings/objects stored in block.data.

export function Field({ label, hint, children }) {
  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>
      {children}
      {hint && <span className="ed-hint">{hint}</span>}
    </label>
  );
}

export const Text = ({ label, value, onChange, hint, placeholder }) => (
  <Field label={label} hint={hint}>
    <input className="ed-input" value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

export const Area = ({ label, value, onChange, hint, rows = 3, placeholder }) => (
  <Field label={label} hint={hint}>
    <textarea className="ed-input" rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </Field>
);

export const Num = ({ label, value, onChange, min = 1, max = 20 }) => (
  <Field label={label}>
    <input className="ed-input" type="number" min={min} max={max} value={value ?? min} onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))} />
  </Field>
);

export const Select = ({ label, value, onChange, options }) => (
  <Field label={label}>
    <select className="ed-input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  </Field>
);

// Photo picker with focal point: click on the preview to choose which part stays visible in the slot.
export function ImagePick({ label = 'Foto', value, onChange, aspect = '4:3', onAspect, allowAspect = true }) {
  const input = useRef(null);
  const assets = useAssets();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      onChange({ focus: { x: 50, y: 50 }, ...(await assets.image(file)) });
    } catch (e) {
      setErr(e?.message || 'Foto üleslaadimine ebaõnnestus.');
    } finally {
      setBusy(false);
    }
  };
  const setFocus = (e) => {
    if (!value?.src) return;
    const r = e.currentTarget.getBoundingClientRect();
    onChange({ ...value, focus: { x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) } });
  };
  return (
    <div className="ed-field">
      <span className="ed-label">{label}</span>
      <div className="ed-img" onClick={setFocus} title={value?.src ? 'Klõpsa, et valida fookus' : ''}>
        {value?.src ? (
          <>
            <img src={value.src} alt="" style={{ objectPosition: objectPosition(value), aspectRatio: String(ASPECTS[aspect] || 4 / 3) }} />
            <span className="ed-focus" style={{ left: `${value.focus?.x ?? 50}%`, top: `${value.focus?.y ?? 50}%` }} />
          </>
        ) : (
          <span className="ed-img-empty">Foto puudub</span>
        )}
      </div>
      <div className="ed-row">
        <button type="button" className="ed-btn" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Laadin…' : value?.src ? 'Vaheta foto' : 'Lisa foto'}</button>
        {value?.src && <button type="button" className="ed-btn ghost" onClick={() => onChange(null)}>Eemalda</button>}
        {allowAspect && onAspect && (
          <select className="ed-input small" value={aspect} onChange={(e) => onAspect(e.target.value)} aria-label="Kuvasuhe">
            {Object.keys(ASPECTS).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
      </div>
      {value?.src && <span className="ed-hint">Klõpsa pildil, et valida, milline osa jääb nähtavaks.</span>}
      {err && <span className="ed-hint ed-err">{err}</span>}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

// Editable list of rows (each row = object). `render(row, set)` draws the row editor.
export function Rows({ label, rows, onChange, make, render, max = 20, addLabel = 'Lisa rida' }) {
  const set = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const del = (i) => onChange(rows.filter((_, j) => j !== i));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="ed-field">
      <span className="ed-label">{label}</span>
      <div className="ed-rows">
        {rows.map((row, i) => (
          <div className="ed-rowitem" key={i}>
            <span className="ed-rownum">{i + 1}</span>
            <div className="ed-rowbody">{render(row, (patch) => set(i, patch), i)}</div>
            <div className="ed-rowtools">
              <button type="button" onClick={() => move(i, -1)} aria-label="Üles">↑</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Alla">↓</button>
              <button type="button" onClick={() => del(i)} aria-label="Kustuta">×</button>
            </div>
          </div>
        ))}
      </div>
      {rows.length < max && <button type="button" className="ed-btn ghost" onClick={() => onChange([...rows, make()])}>+ {addLabel}</button>}
    </div>
  );
}
