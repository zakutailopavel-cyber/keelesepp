import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Euro, Pencil, Search, Settings2, ShieldCheck, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { teachersService, workTimeService } from '../../services/firebase/index.js';
import { payrollRows, payrollTotals } from './payroll.js';
import './payroll.css';

const currentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const duration = (minutes) => `${Math.floor(Number(minutes || 0) / 60)} h ${String(Number(minutes || 0) % 60).padStart(2, '0')} min`;
const dateTime = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('et-EE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
};
const localDateTimeInput = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const statusMeta = {
  open: ['Avatud', 'info'],
  pending: ['Ootel', 'neutral'],
  approved: ['Kinnitatud', 'success'],
  rejected: ['Tagasi lükatud', 'danger'],
};

export default function PayrollPage({ teacherRepository = teachersService, timeRepository = workTimeService }) {
  const [month, setMonth] = useState(currentMonth);
  const [query, setQuery] = useState('');
  const [review, setReview] = useState(null);
  const [adjust, setAdjust] = useState(null);
  const [adjustForm, setAdjustForm] = useState(null);
  const [rateTarget, setRateTarget] = useState(null);
  const [rate, setRate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const state = useAsyncData(async () => {
    const [teachers, evidence] = await Promise.all([teacherRepository.list(), timeRepository.listAll(month)]);
    return { teachers, ...evidence };
  }, [month, teacherRepository, timeRepository]);

  const rows = useMemo(() => state.data ? payrollRows(state.data.teachers, state.data.sessions, state.data.programDays) : [], [state.data]);
  const visibleRows = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('et');
    return search ? rows.filter((row) => `${row.teacher.name} ${row.teacher.email || ''}`.toLocaleLowerCase('et').includes(search)) : rows;
  }, [query, rows]);
  const totals = useMemo(() => payrollTotals(rows), [rows]);

  const openRate = (row) => {
    setRateTarget(row.teacher);
    setRate(row.teacher.workHourlyRateCents ? String(row.teacher.workHourlyRateCents / 100) : '');
    setError('');
  };
  const saveRate = async (event) => {
    event.preventDefault();
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(rate) || Number(rate.replace(',', '.')) <= 0) { setError('Sisesta korrektne tunnitasu.'); return; }
    setSaving(true); setError('');
    try {
      await timeRepository.setHourlyRate(rateTarget.id, rate);
      setSuccess(`${rateTarget.name} tunnitasu salvestati.`);
      setRateTarget(null);
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Tunnitasu salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };
  const openReview = (row, session, decision) => {
    setReview({ row, session, decision });
    setRate(session.hourlyRateCents ? String(session.hourlyRateCents / 100) : row.teacher.workHourlyRateCents ? String(row.teacher.workHourlyRateCents / 100) : '');
    setReason(''); setError('');
  };
  const submitReview = async (event) => {
    event.preventDefault();
    if (review.decision === 'approve' && (!rate || Number(rate.replace(',', '.')) <= 0)) { setError('Määra enne kinnitamist tunnitasu.'); return; }
    if (review.decision === 'reject' && !reason.trim()) { setError('Lisa tagasilükkamise põhjus.'); return; }
    setSaving(true); setError('');
    try {
      await timeRepository.reviewSession(review.session.id, review.decision, { reason: reason.trim(), hourlyRate: review.decision === 'approve' ? rate : '' });
      setSuccess(review.decision === 'approve' ? 'Tööaja kirje kinnitati ja tasu arvutati.' : 'Tööaja kirje lükati põhjendusega tagasi.');
      setReview(null);
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Tööaja otsust ei saanud salvestada.'); }
    finally { setSaving(false); }
  };
  const openAdjust = (row, session) => {
    setAdjust({ row, session });
    setAdjustForm({
      startedAt: localDateTimeInput(session.startedAt),
      endedAt: localDateTimeInput(session.endedAt),
      breakMinutes: String(session.breakMinutes || 0),
      note: session.note || '',
      reason: '',
    });
    setError('');
  };
  const submitAdjustment = async (event) => {
    event.preventDefault();
    const start = new Date(adjustForm.startedAt);
    const end = new Date(adjustForm.endedAt);
    const breakMinutes = Number(adjustForm.breakMinutes);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) { setError('Kontrolli tööaja algust ja lõppu.'); return; }
    if (!Number.isInteger(breakMinutes) || breakMinutes < 0) { setError('Paus peab olema null või positiivne täisarv.'); return; }
    if (!adjustForm.reason.trim()) { setError('Lisa paranduse põhjus.'); return; }
    setSaving(true); setError('');
    try {
      await timeRepository.adjustSession(adjust.session.id, {
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
        breakMinutes,
        note: adjustForm.note.trim(),
        reason: adjustForm.reason.trim(),
      });
      setSuccess('Tööaja kirje parandati ja saadeti uuesti kinnitamisele.');
      setAdjust(null);
      setAdjustForm(null);
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Tööaja kirje parandamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  if (state.loading) return <LoadingState label="Laen palgaarvestust…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  return <div className="page-content payroll-page">
    <Link className="back-link" to="/finance"><ArrowLeft size={17} /> Tagasi finantsidesse</Link>
    <PageHeader eyebrow="Töötasu" title="Õpetajate palgaarvestus" description="Serveri mõõdetud tööaeg, administraatori kinnitus ja fikseeritud tunnitasu ühes auditeeritavas vaates." />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    <section className="metric-grid">
      <Card className="metric-card metric-card--amber"><div className="metric-card__top"><span>Kinnitamise ootel</span><i><AlertTriangle size={19} /></i></div><strong>{totals.pendingCount}</strong><small>{duration(totals.pendingMinutes)}</small></Card>
      <Card className="metric-card metric-card--blue"><div className="metric-card__top"><span>Kinnitatud tööaeg</span><i><Clock3 size={19} /></i></div><strong>{duration(totals.approvedMinutes)}</strong><small>{month}</small></Card>
      <Card className="metric-card metric-card--green"><div className="metric-card__top"><span>Arvestatud töötasu</span><i><Euro size={19} /></i></div><strong>{money(totals.approvedPayCents)}</strong><small>ainult kinnitatud kirjed</small></Card>
      <Card className="metric-card metric-card--purple"><div className="metric-card__top"><span>Programmis aktiivne</span><i><ShieldCheck size={19} /></i></div><strong>{duration(totals.programMinutes)}</strong><small>kontrolltõend, mitte palgaalus</small></Card>
    </section>
    <Card className="payroll-toolbar"><div className="search-field"><Search size={17} /><input aria-label="Otsi õpetajat palgaarvestusest" placeholder="Otsi õpetajat…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Input aria-label="Palgaarvestuse kuu" type="month" value={month} onChange={(event) => setMonth(event.target.value)} /><Badge tone={totals.openCount ? 'danger' : 'success'}>{totals.openCount ? `${totals.openCount} avatud tööpäeva` : 'Avatud tööpäevi pole'}</Badge></Card>
    {visibleRows.length ? <div className="payroll-staff-list">{visibleRows.map((row) => <Card className="payroll-staff" key={row.teacher.id}>
      <header><div className="teacher-avatar">{row.teacher.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</div><span><strong>{row.teacher.name}</strong><small>{row.teacher.email || row.teacher.role || 'Õpetaja'}</small></span><div><Badge tone={row.pendingCount ? 'danger' : 'success'}>{row.pendingCount ? `${row.pendingCount} ootel` : 'Kontrollitud'}</Badge><Button variant="secondary" onClick={() => openRate(row)}><Settings2 size={16} /> {row.teacher.workHourlyRateCents ? `${money(row.teacher.workHourlyRateCents)} / h` : 'Määra tunnitasu'}</Button></div></header>
      <div className="payroll-staff-summary"><span><small>Programmis</small><strong>{duration(row.summary.programMinutes)}</strong></span><span><small>Ootel</small><strong>{duration(row.summary.pendingMinutes)}</strong></span><span><small>Kinnitatud</small><strong>{duration(row.summary.approvedMinutes)}</strong></span><span><small>Töötasu</small><strong>{money(row.summary.approvedPayCents)}</strong></span></div>
      {row.sessions.length ? <div className="students-table-wrap"><table className="students-table payroll-table"><thead><tr><th>Algus</th><th>Lõpp</th><th>Kestus</th><th>Olek</th><th>Tasu</th><th>Tegevus</th></tr></thead><tbody>{row.sessions.map((session) => { const status = session.status === 'open' ? 'open' : session.approvalStatus || 'pending'; const meta = statusMeta[status] || [status, 'neutral']; const pending = session.status === 'closed' && session.approvalStatus === 'pending'; return <tr key={session.id}><td>{dateTime(session.startedAt)}</td><td>{dateTime(session.endedAt)}</td><td>{duration(session.durationMinutes)}</td><td><Badge tone={meta[1]}>{meta[0]}</Badge>{session.approvalReason ? <small className="payroll-reason">{session.approvalReason}</small> : null}</td><td>{session.approvalStatus === 'approved' ? money(session.payAmountCents) : '—'}</td><td>{session.status === 'closed' ? <div className="payroll-actions">{pending ? <><Button onClick={() => openReview(row, session, 'approve')}><CheckCircle2 size={15} /> Kinnita</Button><Button variant="danger" onClick={() => openReview(row, session, 'reject')}><XCircle size={15} /> Lükka tagasi</Button></> : null}<Button variant="secondary" onClick={() => openAdjust(row, session)}><Pencil size={15} /> Paranda</Button></div> : '—'}</td></tr>; })}</tbody></table></div> : <EmptyState title="Selles kuus tööaja kirjeid ei ole" />}
    </Card>)}</div> : <Card><EmptyState title="Valitud kuul palgaarvestuse kirjeid ei ole" description="Kirjed ilmuvad pärast tööpäeva alustamist ja lõpetamist KeeleSepp CRM-is." /></Card>}

    <Modal open={Boolean(rateTarget)} title={`Tunnitasu: ${rateTarget?.name || ''}`} onClose={() => !saving && setRateTarget(null)} footer={<><Button variant="secondary" disabled={saving} onClick={() => setRateTarget(null)}>Loobu</Button><Button type="submit" form="payroll-rate-form" loading={saving}>Salvesta tunnitasu</Button></>}><form id="payroll-rate-form" onSubmit={saveRate}><p className="form-hint">Uus määr rakendub tulevastele kinnitamistele. Juba kinnitatud töötasu ei muutu.</p>{error ? <p className="form-error" role="alert">{error}</p> : null}<Input id="payroll-hourly-rate" label="Tunnitasu (€)" value={rate} onChange={(event) => setRate(event.target.value)} inputMode="decimal" autoFocus required /></form></Modal>
    <Modal open={Boolean(review)} title={review?.decision === 'approve' ? 'Kinnita tööaja kirje' : 'Lükka tööaja kirje tagasi'} onClose={() => !saving && setReview(null)} footer={<><Button variant="secondary" disabled={saving} onClick={() => setReview(null)}>Loobu</Button><Button variant={review?.decision === 'reject' ? 'danger' : 'primary'} type="submit" form="payroll-review-form" loading={saving}>{review?.decision === 'approve' ? 'Kinnita ja arvuta tasu' : 'Lükka tagasi'}</Button></>}><form id="payroll-review-form" className="payroll-review-form" onSubmit={submitReview}>{error ? <p className="form-error" role="alert">{error}</p> : null}<dl><div><dt>Õpetaja</dt><dd>{review?.row.teacher.name}</dd></div><div><dt>Tööaeg</dt><dd>{duration(review?.session.durationMinutes)}</dd></div><div><dt>Algus</dt><dd>{dateTime(review?.session.startedAt)}</dd></div></dl>{review?.decision === 'approve' ? <Input id="payroll-review-rate" label="Tunnitasu (€)" value={rate} onChange={(event) => setRate(event.target.value)} inputMode="decimal" required /> : null}<label className="textarea-field"><span>{review?.decision === 'reject' ? 'Tagasilükkamise põhjus *' : 'Administraatori märkus'}</span><textarea aria-label={review?.decision === 'reject' ? 'Tagasilükkamise põhjus' : 'Administraatori märkus'} rows="4" value={reason} onChange={(event) => setReason(event.target.value)} /></label></form></Modal>
    <Modal open={Boolean(adjust && adjustForm)} title={`Paranda tööaega: ${adjust?.row.teacher.name || ''}`} onClose={() => !saving && setAdjust(null)} footer={<><Button variant="secondary" disabled={saving} onClick={() => setAdjust(null)}>Loobu</Button><Button type="submit" form="payroll-adjust-form" loading={saving}>Salvesta parandus</Button></>}>
      {adjustForm ? <form id="payroll-adjust-form" className="form-grid" onSubmit={submitAdjustment}>{error ? <p className="form-error form-grid__wide" role="alert">{error}</p> : null}<p className="form-hint form-grid__wide">Parandus säilib auditis ja viib kirje uuesti kinnitamisele. Varem kinnitatud summa eemaldatakse kuni uue kinnituseni.</p><Input id="payroll-adjust-start" label="Algus" type="datetime-local" value={adjustForm.startedAt} required onChange={(event) => setAdjustForm({ ...adjustForm, startedAt: event.target.value })} /><Input id="payroll-adjust-end" label="Lõpp" type="datetime-local" value={adjustForm.endedAt} required onChange={(event) => setAdjustForm({ ...adjustForm, endedAt: event.target.value })} /><Input id="payroll-adjust-break" label="Paus (min)" type="number" min="0" step="1" value={adjustForm.breakMinutes} required onChange={(event) => setAdjustForm({ ...adjustForm, breakMinutes: event.target.value })} /><Input id="payroll-adjust-note" label="Märkus" value={adjustForm.note} onChange={(event) => setAdjustForm({ ...adjustForm, note: event.target.value })} /><label className="textarea-field form-grid__wide"><span>Paranduse põhjus *</span><textarea aria-label="Paranduse põhjus" rows="4" value={adjustForm.reason} required onChange={(event) => setAdjustForm({ ...adjustForm, reason: event.target.value })} /></label></form> : null}
    </Modal>
  </div>;
}
