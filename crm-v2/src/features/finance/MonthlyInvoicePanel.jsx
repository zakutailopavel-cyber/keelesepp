import { CalendarRange, Check, FileText, Send, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Input, LoadingState } from '../../components/ui/index.js';
import { invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { groupsService } from '../../services/firebase/groups.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { parentsService } from '../../services/firebase/parents.js';
import { defaultBillingMonth, monthlyBillingRows, monthlyInvoicePayload, shiftMonth } from './monthlyBilling.js';
import './monthlyInvoicePanel.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const num = (value) => String(Math.round(value * 100) / 100).replace('.', ',');
const dateLabel = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('et-EE') : '—');
const MODES = [['all', 'Kõik'], ['current', 'Jooksev kuu'], ['advance', 'Kuu ette']];
const STATUS = {
  ready: { label: 'Valmis', tone: 'info' },
  invoiced: { label: 'Arve olemas', tone: 'success' },
  'no-price': { label: 'Hind puudub', tone: 'danger' },
  'no-lessons': { label: 'Tunde pole', tone: 'neutral' },
  'nothing-to-pay': { label: 'Tasaarveldus katab', tone: 'neutral' },
};

// Finance v2 §2, tab "Kuuarved": one invoice per student for the lessons planned in the chosen month, with last
// month's difference. Nothing is created or e-mailed until the admin presses a button.
export default function MonthlyInvoicePanel({
  students = [], plans = [], lessons = [], invoices = [], user,
  scheduleRepository = scheduleService, groupRepository = groupsService,
  invoiceApi = manualInvoiceApi, deliveryApi = invoiceDeliveryApi, lessonRepository = lessonsService, parentRepository = parentsService,
  onChanged,
}) {
  const [month, setMonth] = useState(() => defaultBillingMonth());
  const [mode, setMode] = useState('all');
  const [calendar, setCalendar] = useState({ loading: true, schedule: [], groups: [], parents: [], error: '' });
  const [selected, setSelected] = useState(() => new Set());
  const [open, setOpen] = useState('');
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [waived, setWaived] = useState({});

  useEffect(() => {
    let alive = true;
    // parent accounts give the payer e-mail when the student card has none; not fatal when they cannot be read
    Promise.all([scheduleRepository.list(), groupRepository.list(), parentRepository?.list ? parentRepository.list().catch(() => []) : []])
      .then(([schedule, groups, parents]) => { if (alive) setCalendar({ loading: false, schedule, groups: Array.isArray(groups) ? groups : groups?.items || [], parents: parents || [], error: '' }); })
      .catch((caught) => { if (alive) setCalendar({ loading: false, schedule: [], groups: [], parents: [], error: caught.message || 'Tunniplaani ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [scheduleRepository, groupRepository, parentRepository]);

  const lessonsWithWaivers = useMemo(() => lessons.map((lesson) => (lesson.id in waived ? { ...lesson, billingWaived: waived[lesson.id] } : lesson)), [lessons, waived]);
  const rows = useMemo(() => (calendar.loading ? [] : monthlyBillingRows({ month, students, plans, schedule: calendar.schedule, groups: calendar.groups, lessons: lessonsWithWaivers, invoices, parents: calendar.parents })),
    [calendar, month, students, plans, lessonsWithWaivers, invoices]);
  const visible = rows.filter((row) => mode === 'all' || row.mode === mode);
  const ready = visible.filter((row) => row.status === 'ready');
  const chosen = ready.filter((row) => selected.has(row.student.id));
  const totalCents = chosen.reduce((sum, row) => sum + row.totalCents, 0);

  useEffect(() => { setSelected(new Set(ready.map((row) => row.student.id))); }, [month, mode, calendar.loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const create = async (send) => {
    setBusy(send ? 'send' : 'create'); setError('');
    let done = 0; let sent = 0;
    try {
      for (const row of chosen) {
        const { invoice } = await invoiceApi.createMonthly(monthlyInvoicePayload(row, month));
        done += 1;
        if (send && row.payerEmail) { await deliveryApi.send(invoice.id); sent += 1; }
        setProgress(`Loodud ${done} / ${chosen.length}${send ? `, saadetud ${sent}` : ''}`);
      }
      setProgress(`Valmis: ${done} arvet${send ? `, e-postiga saadetud ${sent}` : ''}.`);
      await onChanged?.();
    } catch (caught) {
      setError(`${caught.message || 'Arvete loomine katkes.'} Juba loodud arved (${done}) jäid alles; kordamisel neid uuesti ei looda.`);
    } finally { setBusy(''); }
  };

  const setWaiver = async (lesson, value) => {
    setWaived((current) => ({ ...current, [lesson.id]: value }));
    try { await lessonRepository.setBillingWaived(lesson.id, value, user); }
    catch (caught) { setWaived((current) => ({ ...current, [lesson.id]: !value })); setError(caught.message || 'Erandit ei saanud salvestada.'); }
  };

  return (
    <Card className="monthly-invoices" id="kuuarved">
      <div className="section-heading">
        <div><span className="eyebrow">Kuuarved</span><h2>Arved kuu tundide eest</h2><p className="form-hint">Planeeritud tunnid kalendrist × hind õpilase arveldusseadetest. Eelmise kuu erinevus lisatakse tasaarveldusena.</p></div>
      </div>
      <div className="monthly-invoices__controls">
        <Button variant="secondary" aria-label="Eelmine kuu" onClick={() => setMonth(shiftMonth(month, -1))}>‹</Button>
        <Input label="Arvelduskuu" type="month" value={month} onChange={(event) => event.target.value && setMonth(event.target.value)} />
        <Button variant="secondary" aria-label="Järgmine kuu" onClick={() => setMonth(shiftMonth(month, 1))}>›</Button>
        <div className="monthly-invoices__modes" role="group" aria-label="Arveldusviis">
          {MODES.map(([id, label]) => <button key={id} type="button" aria-pressed={mode === id} className={mode === id ? 'is-active' : ''} onClick={() => setMode(id)}>{label}</button>)}
        </div>
      </div>
      {calendar.error ? <p className="form-error" role="alert">{calendar.error}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {calendar.loading ? <LoadingState label="Loen tunniplaani…" /> : !visible.length ? <EmptyState title="Selle kuu kohta arveid ei ole" description="Õpilastel pole arveldusseadeid ega planeeritud tunde." action={<CalendarRange size={28} />} /> : (
        <div className="monthly-invoices__table" role="table" aria-label={`Kuuarved ${month}`}>
          <div className="monthly-invoices__head" role="row"><span /><span>Õpilane</span><span>Tunde</span><span>Tasaarveldus</span><span>Summa</span><span>Tähtaeg</span><span>Olek</span></div>
          {visible.map((row) => {
            const status = STATUS[row.status];
            const noShows = row.correction.noShows || [];
            return (
              <div key={row.student.id} className="monthly-invoices__group">
                <div className="monthly-invoices__row" role="row">
                  <span>{row.status === 'ready' ? <input type="checkbox" aria-label={`Vali ${row.student.name}`} checked={selected.has(row.student.id)} onChange={() => toggle(row.student.id)} /> : null}</span>
                  <span><strong>{row.student.name}</strong><small>{row.mode === 'advance' ? 'Kuu ette' : 'Jooksev kuu'} · {row.priceCents ? `${money(row.priceCents)} / ${row.plan?.lessonMinutes || 60} min` : 'hind määramata'}{row.payerEmail ? '' : ' · e-post puudub'}</small></span>
                  <span>{row.lessonCount}{row.plan && row.plannedUnits !== row.lessonCount ? <small>{num(row.plannedUnits)} ühikut</small> : null}</span>
                  <span>{row.correction.units ? <button type="button" className="linklike" aria-expanded={open === row.student.id} onClick={() => setOpen(open === row.student.id ? '' : row.student.id)}>{row.correction.units > 0 ? '+' : ''}{num(row.correction.units)}</button> : noShows.length ? <button type="button" className="linklike" onClick={() => setOpen(open === row.student.id ? '' : row.student.id)}>0</button> : '—'}</span>
                  <span><strong>{row.existing ? money(row.existing.amountCents) : row.priceCents ? money(row.totalCents) : '—'}</strong></span>
                  <span>{dateLabel(row.existing?.due || row.due)}</span>
                  <span><Badge tone={status.tone}>{row.existing ? `${status.label} ${row.existing.num || ''}` : status.label}</Badge></span>
                </div>
                {open === row.student.id ? (
                  <div className="monthly-invoices__detail">
                    <p>{row.correction.note || 'Eelmise kuu tunnid läksid plaanipäraselt.'}</p>
                    {noShows.length ? <><p className="form-hint">Ette teatamata puudumised eelmisel kuul. Linnukesega tund on erand ja seda ei arvestata:</p>
                      <ul>{noShows.map((lesson) => <li key={lesson.id}><label><input type="checkbox" checked={Boolean(waived[lesson.id] ?? lesson.billingWaived)} onChange={(event) => setWaiver(lesson, event.target.checked)} /> {dateLabel(lesson.date)} {lesson.time || ''} — erand, ära arvesta</label></li>)}</ul></> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      <div className="monthly-invoices__footer">
        <span aria-live="polite">{busy ? progress : ready.length ? `Valitud ${chosen.length} / ${ready.length} arvet · ${money(totalCents)}` : ''}</span>
        {rows.some((row) => row.status === 'no-price') ? <span className="monthly-invoices__warn"><TriangleAlert size={16} /> Osal õpilastel puudub hind: lisa see õpilase profiilis (Finantsid → Arveldus).</span> : null}
        <div>
          <Button variant="secondary" disabled={!chosen.length || Boolean(busy)} loading={busy === 'create'} onClick={() => create(false)}><FileText size={17} /> Koosta arved</Button>
          <Button disabled={!chosen.length || Boolean(busy)} loading={busy === 'send'} onClick={() => create(true)}><Send size={17} /> Koosta ja saada</Button>
        </div>
      </div>
      {progress.startsWith('Valmis') ? <p className="monthly-invoices__done" role="status"><Check size={16} /> {progress}</p> : null}
    </Card>
  );
}
