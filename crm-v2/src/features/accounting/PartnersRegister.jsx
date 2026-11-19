import { Download, FileSpreadsheet, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import SuppliersPanel from '../purchases/SuppliersPanel.jsx';
import { clipboardRows } from './journalGrid.js';
import { dmy } from './accountingReports.js';
import OtherPartnersGrid from './OtherPartnersGrid.jsx';
import { filterRegister, kindLabel, missingPresets, otherImportPreview, parseOtherPaste, registerRows } from './partnerRegister.js';

const VIEWS = [
  ['', 'Kõik'],
  ['supplier', 'Tarnijad'],
  ['customer', 'Ostjad'],
  ['other', 'Muud'],
];
const STATUS_TEXT = { new: 'Imporditakse', duplicate: 'Duplikaat — jääb vahele', error: 'Viga — jääb vahele' };

// Partnerid — one register for the books (the accountant 2026-11-19: „Партнёров нет в бухгалтерии, есть только
// tarnijad”; docs/ACCOUNTING.md „Partnerid”): Kõik | Tarnijad (the Tarnijad grid as before) | Ostjad (from the CRM
// invoices, read-only) | Muud (Maksu- ja Tolliamet, Töötukassa, osanik, töötaja, pank …: typed here).
export default function PartnersRegister({
  suppliers = [], others = [], customers = [], customersStatus = '', accounts = [], busy = false,
  onSaveSupplier, onImportSuppliers, onExportSuppliers, onSaveOther, onImportOthers, onExport,
}) {
  const [view, setView] = useState('');
  const [query, setQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [importing, setImporting] = useState(null);
  const [presetError, setPresetError] = useState('');
  const rows = useMemo(() => registerRows({ suppliers, others, customers }), [suppliers, others, customers]);
  const counts = useMemo(() => ({ '': rows.length, supplier: suppliers.length, customer: customers.length, other: others.length }), [rows, suppliers, customers, others]);
  const visible = useMemo(() => filterRegister(rows, { type: view, query, showInactive }), [rows, view, query, showInactive]);
  const visibleOthers = useMemo(() => {
    const ids = new Set(visible.filter((r) => r.partnerType === 'other').map((r) => r.id));
    return others.filter((o) => ids.has(o.id));
  }, [visible, others]);
  const presets = useMemo(() => missingPresets(others), [others]);
  const preview = useMemo(() => (importing?.text ? otherImportPreview(parseOtherPaste(importing.text, clipboardRows), others) : []), [importing?.text, others]);
  const fresh = preview.filter((p) => p.status === 'new');
  const runImport = async () => {
    setImporting((current) => ({ ...current, busy: true, error: '' }));
    try {
      await onImportOthers(fresh.map((p) => p.values));
      setImporting(null);
    } catch (error) {
      setImporting((current) => ({ ...current, busy: false, error: error.message || 'Import ebaõnnestus.' }));
    }
  };
  const inactive = rows.filter((r) => r.active === false && (!view || r.partnerType === view)).length;

  const tools = <div className="suppliers-panel__tools">
    <label className="suppliers-panel__search"><Search size={15} /><input aria-label="Otsi partnerit" placeholder="Otsi nime, koodi, IBAN-i…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    {inactive ? <label className="accounting-check"><input type="checkbox" checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} /> Näita mitteaktiivseid ({inactive})</label> : null}
    <span className="suppliers-panel__count">{visible.length} / {counts[view]} partnerit</span>
    {view === 'other' && onImportOthers ? <Button variant="secondary" aria-pressed={Boolean(importing)} onClick={() => setImporting(importing ? null : { text: '', busy: false, error: '' })}><FileSpreadsheet size={16} /> Impordi Excelist</Button> : null}
    {onExport ? <Button variant="secondary" onClick={() => onExport(view === 'other' ? others.map((o) => ({ ...o, kindLabel: kindLabel(o.kind) })) : visible, { others: view === 'other' })}><Download size={16} /> Excel</Button> : null}
  </div>;

  return <div className="partners-register">
    <nav className="partners-register__views" aria-label="Partnerite tüüp">
      {VIEWS.map(([id, label]) => <button key={id || 'all'} type="button" className={view === id ? 'is-active' : ''} aria-pressed={view === id} onClick={() => { setView(id); setImporting(null); }}>{label} <small>{counts[id]}</small></button>)}
    </nav>

    {view === 'supplier' ? <>
      <p className="form-hint">Tarnijad on kannete partnerid: ostuarve (OA) ja tasumise (VM) kanded saavad tarnija igale reale ise; käsitsi kandes vali partner päevaraamatu veerus „Partner”.</p>
      <SuppliersPanel suppliers={suppliers} accounts={accounts} onSave={onSaveSupplier} onImport={onImportSuppliers} onExport={onExportSuppliers} busy={busy} />
    </> : null}

    {view === '' || view === 'customer' ? <>
      {view === 'customer' ? <p className="form-hint">Ostjad tulevad CRM-i arvetest (ainult ettevõtte arved, FIE arved mitte): ettevõte nime ja registrikoodiga, eraisik ainult nimega. Neid ei muudeta siin — nimi ja kood tulevad arvelt.</p> : <p className="form-hint">Kõik kannete partnerid: Tarnijad, Ostjad (CRM-i arvetest) ja Muud (maksuamet, töötukassa, osanik, töötaja, pank …). Muuta saab vaates „Tarnijad” või „Muud”.</p>}
      {customersStatus === 'loading' ? <p className="form-hint" role="status">Ostjate nimekiri laeb…</p> : null}
      {customersStatus === 'error' ? <p className="form-error" role="alert">Ostjate nimekirja ei saanud laadida (arved). Tarnijad ja muud partnerid on olemas.</p> : null}
      {tools}
      <div className="accounting-grid-wrap"><table className="accounting-grid partners-register__table">
        <thead>{view === 'customer'
          ? <tr><th>Nimi</th><th>Liik</th><th>Reg-kood</th><th className="num">Arveid</th><th>Viimane arve</th><th>Allikas</th></tr>
          : <tr><th>Nimi</th><th>Tüüp</th><th>Reg-kood / isikukood</th><th>KMKR</th><th>IBAN</th><th>E-post</th><th>Aktiivne</th><th>Allikas</th></tr>}</thead>
        <tbody>{visible.map((r) => (view === 'customer'
          ? <tr key={r.key}><td>{r.name}</td><td>{r.kindLabel}</td><td>{r.code}</td><td className="num">{r.invoiceCount}</td><td>{dmy(r.lastInvoiceDate)}</td><td>{r.source}</td></tr>
          : <tr key={r.key} className={r.active === false ? 'is-inactive' : ''}><td>{r.name}</td><td><span className={`partner-badge partner-badge--${r.partnerType}`}>{r.typeLabel}</span>{r.kindLabel ? <small> {r.kindLabel}</small> : null}</td><td>{r.code}</td><td>{r.vatNumber}</td><td>{r.iban}</td><td>{r.email}</td><td className="center">{r.active === false ? 'ei' : 'jah'}</td><td>{r.source}</td></tr>))}
        {!visible.length ? <tr><td colSpan="8">Partnereid ei leitud.</td></tr> : null}</tbody>
      </table></div>
    </> : null}

    {view === 'other' ? <>
      <p className="form-hint">Muud partnerid: Maksu- ja Tolliamet, Töötukassa, osanik (tasaarvestus osanikuga), töötajad, pank … Isikukood näidatakse nimekirjas peidetult.</p>
      {presets.length && onSaveOther ? <div className="partners-register__presets" role="group" aria-label="Lisa kiiresti">
        <span>Lisa kiiresti:</span>
        {presets.map((p) => <Button key={p.key} variant="secondary" disabled={busy} onClick={async () => setPresetError(await onSaveOther('', { name: p.name, kind: p.kind, regCode: p.regCode, active: true }) || '')}><Plus size={14} /> {p.name}</Button>)}
      </div> : null}
      {presetError ? <p className="form-error" role="alert">{presetError}</p> : null}
      {tools}
      {importing ? <div className="suppliers-import" role="region" aria-label="Partnerite import">
        <p className="form-hint">Kopeeri Excelist read ja kleebi siia. Veerud: Nimi | Liik | Reg-kood / isikukood | KMKR nr | E-post | IBAN | Märkus | Aktiivne — või esimene rida veergude nimedega. Topelt ja vigased read jäävad vahele.</p>
        <textarea aria-label="Kleebi partnerid Excelist" rows="5" value={importing.text} onChange={(event) => setImporting({ ...importing, text: event.target.value, error: '' })} />
        {preview.length ? <div className="accounting-grid-wrap"><table className="accounting-grid suppliers-import__preview">
          <thead><tr><th>Rida</th><th>Nimi</th><th>Liik</th><th>Olek</th></tr></thead>
          <tbody>{preview.map((p) => <tr key={p.row} className={p.status === 'new' ? '' : 'is-inactive'}>
            <td>{p.row}</td><td>{p.values.name}</td><td>{kindLabel(p.values.kind)}</td>
            <td className={p.status === 'new' ? 'is-ok' : 'is-off'}>{STATUS_TEXT[p.status]}{p.status !== 'new' ? `: ${p.message}` : ''}</td>
          </tr>)}</tbody>
        </table></div> : null}
        {importing.error ? <p className="form-error" role="alert">{importing.error}</p> : null}
        <div className="suppliers-import__actions">
          <Button disabled={!fresh.length || importing.busy || busy} loading={importing.busy} onClick={runImport}>Impordi {fresh.length} {fresh.length === 1 ? 'partner' : 'partnerit'}</Button>
          <button type="button" className="link-button" onClick={() => setImporting(null)}>Loobu</button>
        </div>
      </div> : null}
      <OtherPartnersGrid partners={visibleOthers} all={others} onSave={onSaveOther} busy={busy} />
    </> : null}
  </div>;
}
