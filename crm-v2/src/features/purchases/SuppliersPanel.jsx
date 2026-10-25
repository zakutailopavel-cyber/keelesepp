import { Download, FileSpreadsheet, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { clipboardRows } from '../accounting/journalGrid.js';
import SuppliersGrid from './SuppliersGrid.jsx';
import { filterSuppliers, parseSupplierPaste, sortSuppliers, supplierImportPreview } from './purchases.js';
import '../accounting/accounting.css';
import './purchases.css';

const STATUS_TEXT = { new: 'Imporditakse', duplicate: 'Duplikaat — jääb vahele', error: 'Viga — jääb vahele' };

// Tarnijad (the accountant 2026-10-24: „Поставщиков сначала”): search, header sort, the ruled grid and an import of
// rows pasted from Excel with a preview (new / duplicate / error per row). Used on Ostuarved and on Raamatupidamine.
export default function SuppliersPanel({ suppliers = [], accounts = [], onSave, onImport, onExport, busy = false }) {
  const [query, setQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [importing, setImporting] = useState(null);
  const visible = useMemo(() => sortSuppliers(filterSuppliers(suppliers, { query, showInactive }), sort), [suppliers, query, showInactive, sort]);
  const onSort = (key) => setSort((current) => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }));
  const inactive = suppliers.filter((s) => s.active === false).length;

  const preview = useMemo(() => (importing?.text ? supplierImportPreview(parseSupplierPaste(importing.text, clipboardRows), suppliers, accounts) : []), [importing?.text, suppliers, accounts]);
  const fresh = preview.filter((p) => p.status === 'new');
  const runImport = async () => {
    setImporting((current) => ({ ...current, busy: true, error: '' }));
    try {
      await onImport(fresh.map((p) => p.values));
      setImporting(null);
    } catch (error) {
      setImporting((current) => ({ ...current, busy: false, error: error.message || 'Import ebaõnnestus.' }));
    }
  };

  return <div className="suppliers-panel">
    <div className="suppliers-panel__tools">
      <label className="suppliers-panel__search"><Search size={15} /><input aria-label="Otsi tarnijat" placeholder="Otsi nime, registrikoodi, IBAN-i…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {inactive ? <label className="accounting-check"><input type="checkbox" checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} /> Näita mitteaktiivseid ({inactive})</label> : null}
      <span className="suppliers-panel__count">{visible.length === suppliers.length ? `${suppliers.length} tarnijat` : `${visible.length} / ${suppliers.length} tarnijat`}</span>
      {onImport ? <Button variant="secondary" aria-pressed={Boolean(importing)} onClick={() => setImporting(importing ? null : { text: '', busy: false, error: '' })}><FileSpreadsheet size={16} /> Impordi Excelist</Button> : null}
      {onExport ? <Button variant="secondary" onClick={onExport}><Download size={16} /> Excel</Button> : null}
    </div>
    {importing ? <div className="suppliers-import" role="region" aria-label="Tarnijate import">
      <p className="form-hint">Kopeeri Excelist read (Ctrl/Cmd+C) ja kleebi siia. Veerud: Nimi | Registrikood | KMKR nr | Aadress | E-post | IBAN | Vaikekonto | Aktiivne — või esimene rida veergude nimedega (järjekord vaba). Topelt (sama registrikood või sama nimi) ja vigased read jäävad vahele.</p>
      <textarea aria-label="Kleebi tarnijad Excelist" rows="5" value={importing.text} placeholder="Nimi&#9;Registrikood&#9;…" onChange={(event) => setImporting({ ...importing, text: event.target.value, error: '' })} />
      {preview.length ? <div className="accounting-grid-wrap"><table className="accounting-grid suppliers-import__preview">
        <thead><tr><th>Rida</th><th>Nimi</th><th>Registrikood</th><th>IBAN</th><th>Vaikekonto</th><th>Olek</th></tr></thead>
        <tbody>{preview.map((p) => <tr key={p.row} className={p.status === 'new' ? '' : 'is-inactive'}>
          <td>{p.row}</td><td>{p.values.name}</td><td>{p.values.regCode}</td><td>{p.values.iban}</td><td>{p.values.defaultAccount}</td>
          <td className={p.status === 'new' ? 'is-ok' : 'is-off'}>{STATUS_TEXT[p.status]}{p.status !== 'new' ? `: ${p.message}` : ''}</td>
        </tr>)}</tbody>
      </table></div> : null}
      {importing.error ? <p className="form-error" role="alert">{importing.error}</p> : null}
      <div className="suppliers-import__actions">
        <Button disabled={!fresh.length || importing.busy || busy} loading={importing.busy} onClick={runImport}>Impordi {fresh.length} {fresh.length === 1 ? 'tarnija' : 'tarnijat'}</Button>
        <button type="button" className="link-button" onClick={() => setImporting(null)}>Loobu</button>
      </div>
    </div> : null}
    <SuppliersGrid suppliers={visible} all={suppliers} accounts={accounts} onSave={onSave} busy={busy} sort={sort} onSort={onSort} />
  </div>;
}
