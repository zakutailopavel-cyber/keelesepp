import { useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { SUPPLIER_FIELDS, blankSupplier, supplierChanged } from './purchases.js';

// Tarnijad as a ruled grid like Excel (the accountant 2026-10-23): every cell is typed in place; a changed row shows
// „Salvesta” (Enter in any cell saves it); the last row adds a new supplier. Nothing is deleted — a supplier that is no
// longer used is made inactive.
export default function SuppliersGrid({ suppliers, accounts, onSave, busy }) {
  // the cells typed but not saved yet, by supplier id; the saved values come from `suppliers`
  const [edits, setEdits] = useState({});
  const [fresh, setFresh] = useState(blankSupplier);
  const [errors, setErrors] = useState({});

  const accountName = (code) => accounts.find((a) => a.code === code && a.active !== false)?.name;
  const save = async (row, isNew) => {
    const error = await onSave(isNew ? '' : row.id, row);
    setErrors((current) => ({ ...current, [isNew ? 'new' : row.id]: error || '' }));
    if (!error && isNew) setFresh(blankSupplier());
    if (!error && !isNew) setEdits((current) => { const next = { ...current }; delete next[row.id]; return next; });
  };
  const cells = (row, setRow, isNew) => SUPPLIER_FIELDS.map(([key, label]) => <td key={key}>
    <input aria-label={`${isNew ? 'Uus tarnija' : row.name}: ${label}`} value={row[key] || ''} placeholder={isNew && key === 'name' ? 'uus tarnija…' : ''}
      onChange={(event) => setRow({ ...row, [key]: event.target.value })}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (row.name.trim()) save(row, isNew); } }} />
    {key === 'defaultAccount' && row.defaultAccount ? <small>{accountName(row.defaultAccount) || 'konto puudub'}</small> : null}
  </td>);

  return <div className="accounting-grid-wrap"><table className="accounting-grid accounting-draft purchases-suppliers">
    <thead><tr>{SUPPLIER_FIELDS.map(([key, label]) => <th key={key}>{label}</th>)}<th>Aktiivne</th><th /></tr></thead>
    <tbody>
      {suppliers.map((original) => {
        const row = { ...original, ...edits[original.id] };
        const dirty = supplierChanged(row, original);
        const setRow = (next) => setEdits((current) => ({ ...current, [original.id]: next }));
        return <tr key={row.id} className={row.active === false ? 'is-inactive' : ''}>
          {cells(row, setRow, false)}
          <td className="center"><input type="checkbox" aria-label={`${row.name}: aktiivne`} checked={row.active !== false} onChange={(event) => setRow({ ...row, active: event.target.checked })} /></td>
          <td>{dirty ? <Button disabled={busy || !row.name.trim()} onClick={() => save(row, false)}>Salvesta</Button> : null}{errors[row.id] ? <small className="is-off" role="alert">{errors[row.id]}</small> : null}</td>
        </tr>;
      })}
      <tr className="purchases-new-row">
        {cells(fresh, setFresh, true)}
        <td />
        <td>{fresh.name.trim() ? <Button disabled={busy} onClick={() => save(fresh, true)}>Lisa tarnija</Button> : null}{errors.new ? <small className="is-off" role="alert">{errors.new}</small> : null}</td>
      </tr>
    </tbody>
  </table></div>;
}
