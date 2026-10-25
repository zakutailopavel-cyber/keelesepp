import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { SUPPLIER_FIELDS, blankSupplier, supplierChanged, supplierDuplicate } from './purchases.js';

// Tarnijad as a ruled grid like Excel (the accountant 2026-10-23): every cell is typed in place; a changed row shows
// „Salvesta” (Enter in any cell saves it); the last row adds a new supplier. Nothing is deleted — a supplier that is no
// longer used is made inactive.
// `all` is every saved supplier (the duplicate warning looks at all of them, `suppliers` may be filtered); a header
// click sorts (sort / onSort from SuppliersPanel).
export default function SuppliersGrid({ suppliers, all = suppliers, accounts, onSave, busy, sort = null, onSort = null }) {
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
  // a possible duplicate is said under the row before saving (the server refuses it)
  const duplicateHint = (row, selfId) => {
    if (!String(row.name || '').trim() && !String(row.regCode || '').trim()) return null;
    const dup = supplierDuplicate(row, all, selfId);
    return dup ? <small className="is-off" role="status">Võimalik duplikaat: {dup.name}{dup.regCode ? ` (${dup.regCode})` : ''}</small> : null;
  };
  const header = (key, label) => <th key={key} aria-sort={sort?.key === key ? (sort.dir === 'desc' ? 'descending' : 'ascending') : undefined}>
    {onSort ? <button type="button" className="accounting-sort" title="Sorteeri" onClick={() => onSort(key)}>{label} {sort?.key === key ? (sort.dir === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />) : null}</button> : label}</th>;
  const cells = (row, setRow, isNew) => SUPPLIER_FIELDS.map(([key, label]) => <td key={key}>
    <input aria-label={`${isNew ? 'Uus tarnija' : row.name}: ${label}`} value={row[key] || ''} placeholder={isNew && key === 'name' ? 'uus tarnija…' : ''}
      onChange={(event) => setRow({ ...row, [key]: event.target.value })}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (row.name.trim()) save(row, isNew); } }} />
    {key === 'defaultAccount' && row.defaultAccount ? <small>{accountName(row.defaultAccount) || 'konto puudub'}</small> : null}
  </td>);

  return <div className="accounting-grid-wrap"><table className="accounting-grid accounting-draft purchases-suppliers">
    <thead><tr>{SUPPLIER_FIELDS.map(([key, label]) => header(key, label))}{header('active', 'Aktiivne')}<th /></tr></thead>
    <tbody>
      {suppliers.map((original) => {
        const row = { ...original, ...edits[original.id] };
        const dirty = supplierChanged(row, original);
        const setRow = (next) => setEdits((current) => ({ ...current, [original.id]: next }));
        return <tr key={row.id} className={row.active === false ? 'is-inactive' : ''}>
          {cells(row, setRow, false)}
          <td className="center"><input type="checkbox" aria-label={`${row.name}: aktiivne`} checked={row.active !== false} onChange={(event) => setRow({ ...row, active: event.target.checked })} /></td>
          <td>{dirty ? <Button disabled={busy || !row.name.trim()} onClick={() => save(row, false)}>Salvesta</Button> : null}{dirty ? duplicateHint(row, row.id) : null}{errors[row.id] ? <small className="is-off" role="alert">{errors[row.id]}</small> : null}</td>
        </tr>;
      })}
      <tr className="purchases-new-row">
        {cells(fresh, setFresh, true)}
        <td />
        <td>{fresh.name.trim() ? <Button disabled={busy} onClick={() => save(fresh, true)}>Lisa tarnija</Button> : null}{duplicateHint(fresh, '')}{errors.new ? <small className="is-off" role="alert">{errors.new}</small> : null}</td>
      </tr>
    </tbody>
  </table></div>;
}
