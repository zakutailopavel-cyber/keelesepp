import { ArrowLeft, Copy, Download, FileCheck2, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { isValidIsikukood, maskCode } from './isikukood.js';
import './tax.css';

// INF 3 „Füüsiliste isikute tasutud koolituskulude deklaratsioon” (owner 2026-10-22, docs/INF3.md): the year's paid
// training costs by trainee, the missing personal codes, the parents' form links and the e-MTA XML file.
const TYPES = [[1, '1 · tasemekoolitus'], [2, '2 · täienduskoolitus / keeleõpe'], [3, '3 · huviharidus (alla 18)']];
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const defaultYear = () => { const now = new Date(); return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear(); };
const api = { report: (year) => financeApi.inf3Report(year), save: (studentId, identity) => financeApi.saveTaxIdentity(studentId, identity), link: (studentId) => financeApi.createTaxFormLink(studentId) };

export default function Inf3Page({ repository = api }) {
  const [year, setYear] = useState(defaultYear);
  const state = useAsyncData(() => repository.report(year), [repository, year]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const report = state.data;
  const counts = useMemo(() => ({ ready: (report?.rows || []).filter((r) => r.ready).length, missing: (report?.rows || []).filter((r) => !r.ready).length }), [report]);

  const open = (row) => { setEditing(row); setForm({ studentCode: '', payerCode: '', payerName: row.payerName, trainingType: row.trainingType }); setError(''); };
  const save = async (event) => {
    event.preventDefault();
    const studentCode = form.studentCode.replace(/\s/g, '') || editing.studentCode;
    const payerCode = form.payerCode.replace(/\s/g, '') || editing.payerCode;
    if ((studentCode && !isValidIsikukood(studentCode)) || (payerCode && !isValidIsikukood(payerCode))) { setError('Isikukood ei ole korrektne.'); return; }
    setBusy(true); setError('');
    try {
      await repository.save(editing.studentId, { studentCode, payerCode, payerName: form.payerName, trainingType: Number(form.trainingType) });
      setEditing(null); setNotice('Andmed salvestati.');
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Salvestamine ebaõnnestus.'); }
    finally { setBusy(false); }
  };
  const copyLink = async (row) => {
    setError('');
    try {
      const { url } = await repository.link(row.studentId);
      await globalThis.navigator?.clipboard?.writeText(url);
      setNotice(`Vormi link kopeeriti (${row.studentName}). Saada see tasujale e-kirja või sõnumiga; link kehtib 60 päeva.`);
    } catch (nextError) { setError(nextError.message || 'Lingi loomine ebaõnnestus.'); }
  };
  const download = () => {
    const blob = new globalThis.Blob([report.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `INF3_${report.regCode}_${report.year}.xml`;
    document.body.appendChild(link); link.click(); link.remove();
    globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="page-content inf3-page">
    <Link className="back-link" to="/finance/raamatupidamine"><ArrowLeft size={17} /> Tagasi raamatupidamisse</Link>
    <PageHeader eyebrow="Maksu- ja Tolliamet" title="INF 3 · tasutud koolituskulud" description="Eraisikute poolt aasta jooksul tasutud koolituskulud õppija kaupa. Esitatakse e-MTA-s järgmise aasta 1. veebruariks; üle 10 rea — failina."
      actions={<Button disabled={!report?.xml} onClick={download}><Download size={17} /> Laadi XML (e-MTA)</Button>} />
    {notice ? <div className="success-notice" role="status">{notice}<button aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}
    {error && !editing ? <div className="expense-error" role="alert">{error}<button aria-label="Sulge veateade" onClick={() => setError('')}>×</button></div> : null}
    <Card className="inf3-toolbar">
      <Select id="inf3-year" label="Kalendriaasta" value={year} onChange={(event) => setYear(Number(event.target.value))}>{[0, 1, 2].map((back) => new Date().getFullYear() - back).map((y) => <option key={y} value={y}>{y}</option>)}</Select>
      {report ? <p><strong>{counts.ready}</strong> rida valmis · <strong>{counts.missing}</strong> rida ilma isikukoodita · kokku {money(report.totalCents)}{report.companyCents ? ` · ettevõtete makstud ${money(report.companyCents)} ei kuulu deklareerimisele` : ''}</p> : null}
    </Card>
    {state.loading && !report ? <LoadingState label="Arvutan INF 3 ridu…" /> : null}
    {state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : null}
    {report ? <Card className="accounting-card">
      {report.rows.length ? <div className="students-table-wrap"><table className="students-table accounting-table"><thead><tr><th>Õppija</th><th>Isikukood</th><th>Tasuja</th><th>Isikukood</th><th className="num">Tasutud</th><th>Liik</th><th>Olek</th><th /></tr></thead>
        <tbody>{report.rows.map((row) => <tr key={row.studentId}>
          <td><strong>{row.studentName}</strong></td><td>{maskCode(row.studentCode) || '—'}</td>
          <td>{row.payerName || '—'}</td><td>{maskCode(row.payerCode) || '—'}</td>
          <td className="num">{money(row.amountCents)}</td><td>{row.trainingType}</td>
          <td>{row.ready ? <Badge tone="success"><FileCheck2 size={13} /> Valmis</Badge> : <Badge tone="warning">{row.problems.join(' · ')}</Badge>}</td>
          <td><div className="expense-actions"><Button variant="secondary" onClick={() => open(row)}><Pencil size={15} /> Muuda</Button>{!row.ready ? <Button variant="secondary" onClick={() => copyLink(row)}><Copy size={15} /> Vormi link</Button> : null}</div></td>
        </tr>)}</tbody></table></div> : <EmptyState title="Selle aasta makseid ei ole" description="Vali teine aasta." />}
    </Card> : null}
    <Card className="inf3-notes"><h2>Enne esitamist</h2><ul>
      <li>Deklareerida võib ainult siis, kui E&amp;P Koolitus OÜ-l on täienduskoolituse majandustegevusteade EHIS-es (vorm INF 3, täitmise kord p 2).</li>
      <li>Keeleõpe on liik <strong>2</strong>. Liik 3 (huviharidus) ainult huvikooli õppekava alusel.</li>
      <li>Summa on aastal tegelikult laekunud raha (pank, kaart, sularaha, ettemaks) miinus tagastused; ettevõtte tasutud arved ei kuulu.</li>
      <li>e-MTA: Vormid → INF 3 → „Laadi fail” ja vali alla laaditud XML.</li>
    </ul></Card>

    <Modal open={Boolean(editing)} title={editing ? `INF 3 · ${editing.studentName}` : ''} onClose={() => !busy && setEditing(null)} footer={<><Button variant="secondary" disabled={busy} onClick={() => setEditing(null)}>Loobu</Button><Button type="submit" form="inf3-form" loading={busy}>Salvesta</Button></>}>
      <form id="inf3-form" className="expense-form" onSubmit={save}>
        <p className="form-hint">Isikukoodid on nähtavad ainult administraatorile. Tühi väli jätab olemasoleva koodi alles.</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="form-grid">
          <Input id="inf3-student-code" label={`Õppija isikukood${editing?.studentCode ? ` (praegu ${maskCode(editing.studentCode)})` : ''}`} inputMode="numeric" value={form.studentCode || ''} onChange={(event) => setForm({ ...form, studentCode: event.target.value })} />
          <Select id="inf3-type" label="Koolituse liik" value={form.trainingType || 2} onChange={(event) => setForm({ ...form, trainingType: event.target.value })}>{TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <Input id="inf3-payer-name" label="Tasuja nimi" value={form.payerName || ''} onChange={(event) => setForm({ ...form, payerName: event.target.value })} />
          <Input id="inf3-payer-code" label={`Tasuja isikukood${editing?.payerCode ? ` (praegu ${maskCode(editing.payerCode)})` : ''}`} inputMode="numeric" value={form.payerCode || ''} onChange={(event) => setForm({ ...form, payerCode: event.target.value })} />
        </div>
      </form>
    </Modal>
  </div>;
}
