import { useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { supplierDuplicate } from '../purchases/purchases.js';
import { isPersonalCode, maskCode } from './accountingReports.js';
import { OTHER_FIELDS, OTHER_KINDS, blankOther, otherChanged } from './partnerRegister.js';

// Partnerid „Muu” as a ruled grid like Tarnijad (SuppliersGrid): every cell typed in place, a changed row shows
// „Salvesta” (Enter saves), the last row adds a partner. Nothing is deleted — inactive instead. A personal code
// (isikukood) is shown masked until the cell is focused.
export default function OtherPartnersGrid({ partners, all = partners, onSave, busy }) {
  const [edits, setEdits] = useState({});
  const [fresh, setFresh] = useState(blankOther);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  const save = async (row, isNew) => {
    const error = await onSave(isNew ? '' : row.id, row);
    setErrors((current) => ({ ...current, [isNew ? 'new' : row.id]: error || '' }));
    if (!error && isNew) setFresh(blankOther());
    if (!error && !isNew) setEdits((current) => { const next = { ...current }; delete next[row.id]; return next; });
  };
  const duplicateHint = (row, selfId) => {
    if (!String(row.name || '').trim() && !String(row.regCode || '').trim()) return null;
    const dup = supplierDuplicate(row, all, selfId);
    return dup ? <small className="is-off" role="status">Võimalik duplikaat: {dup.name}{dup.regCode ? ` (${maskCode(dup.regCode)})` : ''}</small> : null;
  };
  const cells = (row, setRow, isNew) => OTHER_FIELDS.map(([key, label]) => {
    const id = `${isNew ? 'new' : row.id}-${key}`;
    const aria = `${isNew ? 'Uus partner' : row.name}: ${label}`;
    if (key === 'kind') {
      return <td key={key}><select aria-label={aria} value={row.kind || 'other'} onChange={(event) => setRow({ ...row, kind: event.target.value })}>
        {OTHER_KINDS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select></td>;
    }
    const masked = key === 'regCode' && focused !== id && isPersonalCode(row.regCode);
    return <td key={key}>
      <input aria-label={aria} value={masked ? maskCode(row.regCode) : row[key] || ''} placeholder={isNew && key === 'name' ? 'uus partner…' : ''}
        onFocus={() => setFocused(id)} onBlur={() => setFocused('')}
        onChange={(event) => setRow({ ...row, [key]: event.target.value })}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (String(row.name || '').trim()) save(row, isNew); } }} />
    </td>;
  });

  return <div className="accounting-grid-wrap"><table className="accounting-grid accounting-draft purchases-suppliers accounting-other-partners">
    <thead><tr>{OTHER_FIELDS.map(([key, label]) => <th key={key}>{label}</th>)}<th>Aktiivne</th><th /></tr></thead>
    <tbody>
      {partners.map((original) => {
        const row = { ...original, ...edits[original.id] };
        const dirty = otherChanged(row, original);
        const setRow = (next) => setEdits((current) => ({ ...current, [original.id]: next }));
        return <tr key={row.id} className={row.active === false ? 'is-inactive' : ''}>
          {cells(row, setRow, false)}
          <td className="center"><input type="checkbox" aria-label={`${row.name}: aktiivne`} checked={row.active !== false} onChange={(event) => setRow({ ...row, active: event.target.checked })} /></td>
          <td>{dirty ? <Button disabled={busy || !String(row.name || '').trim()} onClick={() => save(row, false)}>Salvesta</Button> : null}{dirty ? duplicateHint(row, row.id) : null}{errors[row.id] ? <small className="is-off" role="alert">{errors[row.id]}</small> : null}</td>
        </tr>;
      })}
      <tr className="purchases-new-row">
        {cells(fresh, setFresh, true)}
        <td />
        <td>{fresh.name.trim() ? <Button disabled={busy} onClick={() => save(fresh, true)}>Lisa partner</Button> : null}{duplicateHint(fresh, '')}{errors.new ? <small className="is-off" role="alert">{errors.new}</small> : null}</td>
      </tr>
    </tbody>
  </table></div>;
}
