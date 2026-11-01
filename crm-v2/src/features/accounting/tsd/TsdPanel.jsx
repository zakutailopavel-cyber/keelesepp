import { AlertTriangle, Download, FilePlus2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, ErrorState, Input, LoadingState, Modal, Select } from '../../../components/ui/index.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { teachersService, tsdService, workTimeService } from '../../../services/firebase/index.js';
import { downloadWorkbook, tsdWorkbook } from '../accountingExcel.js';
import { COMPANY, amount, dmy, parseEuro } from '../accountingReports.js';
import { bookedSalary, defaultTsdMonth, dueDate, monthName, salaryEntry, shiftMonth, tsdReport } from './tsdCalc.js';
import { NOT_ON_LISA_1, PAYMENT_TYPES, PENSION_RATES, RATE_FIELDS, ratesForYear } from './tsdRates.js';

const blankPayee = (name = '', staffUid = '') => ({ name, idCode: '', code: '', exemptionApplied: null, exemptionCents: 0, pensionAge: false, pensionRate: null, minimumExempt: false, staffUid, active: true, note: '' });
const cents = (value) => (value ? amount(value) : '');
const newLineId = (payeeId) => `${payeeId}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const rateText = (key, kind, rates) => (kind === 'percent' ? `${(rates[key] / 100).toLocaleString('et-EE')} %` : `${amount(rates[key])} €`);

// „TSD” in Raamatupidamine: the month's Lisa 1 and the totals of the form. It computes and exports; nothing is sent to
// the tax board, and the accountant checks the numbers before she files them.
export default function TsdPanel({ accounts = [], entries = [], lockedThrough = '', canEdit = true, createEntry, onBooked, repository = tsdService, staffRepository = teachersService, timeRepository = workTimeService }) {
  const [month, setMonth] = useState(() => defaultTsdMonth());
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [person, setPerson] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [rateForm, setRateForm] = useState(null);
  const [entryOpen, setEntryOpen] = useState(false);
  const year = Number(month.slice(0, 4));

  const state = useAsyncData(async () => {
    const [saved, staff] = await Promise.all([repository.load(month), staffRepository.list()]);
    const sourceMonth = saved.month?.sourceMonth || shiftMonth(month, -1);
    const evidence = await timeRepository.listAll(sourceMonth);
    return { ...saved, staff, sessions: evidence.sessions || [], sourceMonth, forMonth: month };
  }, [month, repository, staffRepository, timeRepository]);
  const [draft, setDraft] = useState(null);
  const data = state.data && draft?.month === month ? { ...state.data, ...draft.values } : state.data;

  const payrollCents = useMemo(() => {
    const out = {};
    (data?.sessions || []).filter((session) => session.approvalStatus === 'approved').forEach((session) => { out[session.staffUid] = (out[session.staffUid] || 0) + Number(session.payAmountCents || 0); });
    return out;
  }, [data?.sessions]);
  const payees = useMemo(() => {
    const saved = data?.payees || [];
    const known = new Set(saved.map((payee) => payee.id));
    // someone with approved work time who has no TSD card yet still shows, with everything missing said out loud
    const extra = Object.keys(payrollCents).filter((id) => payrollCents[id] > 0 && !known.has(id)).map((id) => ({ id, ...blankPayee((data?.staff || []).find((item) => item.id === id)?.name || 'Töötaja', id), isNew: true }));
    return [...saved, ...extra];
  }, [data?.payees, data?.staff, payrollCents]);
  const rates = ratesForYear(year, data?.rates);
  const report = useMemo(() => (rates ? tsdReport({ payees, month: data?.month, payrollCents, rates }) : null), [payees, data?.month, payrollCents, rates]);
  const booked = useMemo(() => bookedSalary(entries, data?.sourceMonth || ''), [entries, data?.sourceMonth]);

  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  // the hook keeps the old month's data while the new month loads: never show or save the one under the other
  if (!data || data.forMonth !== month) return <LoadingState label="Laen TSD andmeid…" />;

  const sourceMonth = data.sourceMonth;
  const savedLines = () => data.month?.lines || [];
  const toSaved = (line) => ({ id: line.id.endsWith('-auto') ? newLineId(line.payeeId) : line.id, payeeId: line.payeeId, code: line.code || '', grossCents: line.grossCents ?? null, minimumIncreaseCents: line.minimumOverride ?? null });
  const persistMonth = async (values, message = '') => {
    if (!canEdit) return;
    setError('');
    try {
      const saved = await repository.saveMonth(month, { sourceMonth: values.sourceMonth ?? sourceMonth, lines: values.lines ?? savedLines() }, data.month);
      setDraft({ month, values: { month: saved, sourceMonth: saved.sourceMonth } });
      if (message) setNotice(message);
    } catch (nextError) { setError(nextError.message || 'Salvestamine ebaõnnestus.'); }
  };
  // a line still coming from the work time is not saved until she changes it, so later approvals keep flowing in
  const changeLine = (line, change) => {
    const lines = line.id.endsWith('-auto')
      ? [...savedLines(), { ...toSaved(line), ...change }]
      : savedLines().map((item) => (item.id === line.id ? { ...item, ...change } : item));
    persistMonth({ lines });
  };
  const addLine = (payee) => {
    const current = report.people.find((item) => item.payee.id === payee.id).lines;
    const used = new Set(current.map((line) => line.code));
    const code = Object.keys(PAYMENT_TYPES).find((item) => !used.has(item));
    const keep = current.filter((line) => line.id.endsWith('-auto')).map(toSaved);
    persistMonth({ lines: [...savedLines(), ...keep, { id: newLineId(payee.id), payeeId: payee.id, code, grossCents: null, minimumIncreaseCents: null }] });
  };
  const removeLine = (line) => persistMonth({ lines: savedLines().filter((item) => item.id !== line.id) });
  const changeSource = (value) => persistMonth({ sourceMonth: value }).then(() => state.reload()).then(() => setDraft(null));

  const openPerson = (payee) => {
    setPerson(payee);
    setForm({ ...blankPayee(), ...payee, exemptionEuro: payee.exemptionCents ? amount(payee.exemptionCents) : amount(rates?.exemptionGeneralCents || 0), exemption: payee.exemptionApplied === true ? 'yes' : payee.exemptionApplied === false ? 'no' : '', pension: payee.pensionRate === null || payee.pensionRate === undefined ? '' : String(payee.pensionRate), staffUid: payee.staffUid || '' });
    setError('');
  };
  const savePerson = async (event) => {
    event.preventDefault();
    const name = form.name.trim() || (data.staff.find((item) => item.id === form.staffUid)?.name || '');
    if (!name) { setError('Sisesta nimi.'); return; }
    const exemptionCents = form.exemption === 'yes' ? parseEuro(form.exemptionEuro) : 0;
    if (Number.isNaN(exemptionCents)) { setError('Kontrolli avalduse summat.'); return; }
    setSaving(true); setError('');
    try {
      const id = person.isNew || person.id ? person.id : form.staffUid || '';
      const values = { name, idCode: form.idCode.trim(), code: form.code, exemptionApplied: form.exemption === 'yes' ? true : form.exemption === 'no' ? false : null, exemptionCents: exemptionCents || 0, pensionAge: Boolean(form.pensionAge), pensionRate: form.pension === '' ? null : Number(form.pension), minimumExempt: Boolean(form.minimumExempt), staffUid: form.staffUid || '', active: form.active !== false, note: form.note.trim() };
      await repository.savePayee(id, values, person.isNew ? null : person);
      setPerson(null);
      setNotice(`${name}: andmed salvestatud.`);
      setDraft(null);
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };
  const openRates = () => {
    const values = data.rates || rates || {};
    setRateForm(Object.fromEntries(RATE_FIELDS.map(([key, , kind]) => [key, Number.isInteger(values[key]) ? (kind === 'percent' ? String(values[key] / 100).replace('.', ',') : amount(values[key])) : ''])));
    setError('');
  };
  const saveRates = async (event) => {
    event.preventDefault();
    const values = {};
    for (const [key, label] of RATE_FIELDS) {
      const parsed = parseEuro(rateForm[key]);
      if (!String(rateForm[key]).trim() || Number.isNaN(parsed)) { setError(`Kontrolli: ${label}.`); return; }
      values[key] = parsed; // both a percent and a euro amount have two decimals: 22,00 % = 2200 bps, 886,00 € = 88600 cents
    }
    setSaving(true); setError('');
    try {
      await repository.saveRates(year, values);
      setRateForm(null);
      setNotice(`${year}. aasta määrad salvestatud.`);
      setDraft(null);
      await state.reload();
    } catch (nextError) { setError(nextError.message || 'Salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };
  const exportExcel = () => {
    const rateRows = RATE_FIELDS.map(([key, label, kind]) => [label, rateText(key, kind, rates)]);
    downloadWorkbook(tsdWorkbook(report, { company: COMPANY, month, monthLabel: monthName(month), sourceLabel: monthName(sourceMonth), due: dueDate(month), rateRows }), `TSD_${month}.xls`);
  };
  const entry = report ? salaryEntry(report, sourceMonth, accounts) : null;
  const entryLocked = entry && lockedThrough && entry.date <= lockedThrough;
  const book = async () => {
    setSaving(true); setError('');
    try {
      const result = await createEntry(entry);
      setEntryOpen(false);
      setNotice(`Palgakanne ${result?.entry?.number || ''} loodud, see on päevaraamatus (PR).`);
      onBooked?.();
    } catch (nextError) { setError(nextError.message || 'Kannet ei saanud luua.'); }
    finally { setSaving(false); }
  };

  const noWorkTime = !Object.values(payrollCents).some(Boolean);
  const difference = report ? booked.cents - report.totals.grossCents : 0;

  return <div className="tsd-panel">
    {notice ? <div className="success-notice" role="status">{notice}<button aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}
    {error && !person && !rateForm && !entryOpen ? <div className="expense-error" role="alert">{error}<button aria-label="Sulge veateade" onClick={() => setError('')}>×</button></div> : null}
    <Card className="accounting-card">
      <div className="tsd-toolbar">
        <Input id="tsd-month" label="TSD kuu (väljamakse kuu)" type="month" value={month} onChange={(event) => { if (event.target.value) { setDraft(null); setMonth(event.target.value); } }} />
        <Input id="tsd-source" label="Töö kuu, mille palk selles kuus välja maksti" type="month" value={sourceMonth} disabled={!canEdit} onChange={(event) => { if (event.target.value) changeSource(event.target.value); }} />
        <p className="tsd-due">Esitada ja tasuda <strong>{dmy(dueDate(month))}</strong></p>
        <div className="tsd-toolbar__actions">
          {canEdit ? <Button variant="secondary" onClick={() => openPerson({ ...blankPayee(), id: '' })}><Plus size={16} /> Lisa väljamakse saaja</Button> : null}
          {report ? <Button variant="secondary" onClick={exportExcel}><Download size={16} /> Excel</Button> : null}
          <Button variant="secondary" onClick={() => setShowRates(!showRates)}>Määrad {year}</Button>
        </div>
      </div>
      <p className="tsd-note">TSD deklareerib <strong>välja makstud</strong> summad: tulumaks ja määrad lähevad väljamakse kuu järgi, mitte töö kuu järgi. Arvutus on abivahend: <strong>raamatupidaja kontrollib numbrid enne esitamist.</strong> CRM ei saada MTA-le midagi. Alates 01.10.2026 sisestatakse need andmed e-MTA väljamaksete vaatesse (lisa 1 asemel); väljamakse liikide koodid jäid samaks.</p>
      {noWorkTime ? <p className="tsd-warning" role="status"><AlertTriangle size={16} /> CRM-is ei ole kuu {monthName(sourceMonth)} kinnitatud tööaega: sisesta bruto käsitsi.</p> : null}
    </Card>

    {showRates ? <Card className="accounting-card tsd-rates">
      <h2>Määrad {year}</h2>
      {rates ? <table className="accounting-grid"><tbody>{RATE_FIELDS.map(([key, label, kind]) => <tr key={key}><td>{label}</td><td className="num">{rateText(key, kind, rates)}</td></tr>)}<tr><td>Kogumispension</td><td className="num">inimese valik: {PENSION_RATES.slice(1).join(', ')} %</td></tr></tbody></table> : null}
      <p className="tsd-note">Allikas: emta.ee „Maksumäärad”, TuMS § 4, § 23, § 23⁵, SMS § 2, § 7. {data.rates ? 'See aasta on muudetud CRM-is.' : ''}</p>
      {canEdit ? <Button variant="secondary" onClick={openRates}><Pencil size={15} /> Muuda määrasid</Button> : null}
    </Card> : null}

    {!rates ? <Card className="accounting-card tsd-empty"><p role="alert"><strong>{year}. aasta määrad on sisestamata.</strong> Vanade määradega CRM ei arvuta.</p>{canEdit ? <Button onClick={openRates}>Sisesta {year}. aasta määrad</Button> : null}</Card> : null}

    {report ? <>
      <Card className="accounting-card">
        <div className="accounting-grid-wrap"><table className="accounting-grid tsd-grid"><thead><tr>
          <th>Nimi<small>1010</small></th><th>Isikukood<small>1000</small></th><th>Liik<small>1020</small></th><th>Bruto<small>1030</small></th><th>MVT<small>1150, 1160</small></th><th>SM väljamakse<small>1060</small></th><th>KuuM suurendus<small>1090</small></th><th>Sotsiaalmaks<small>1100</small></th><th>Pension<small>1110</small></th><th>TK töötaja<small>1130</small></th><th>TK tööandja<small>1140</small></th><th>Tulumaks<small>1170</small></th><th>Neto</th><th aria-label="Tegevused" />
        </tr></thead><tbody>
          {report.people.length ? report.people.flatMap(({ payee, lines, warnings }) => [...lines.map((line, index) => <tr key={line.id}>
            <td>{index === 0 ? <><strong>{payee.name}</strong>{canEdit ? <button type="button" className="link-button tsd-edit" aria-label={`Muuda: ${payee.name}`} onClick={() => openPerson(payee)}><Pencil size={13} /></button> : null}</> : null}</td>
            <td className="tsd-id">{index === 0 ? payee.idCode || '—' : null}</td>
            <td><select aria-label={`Liik: ${payee.name}`} value={line.code || ''} disabled={!canEdit} onChange={(event) => changeLine(line, { code: event.target.value })}><option value="">—</option>{Object.entries(PAYMENT_TYPES).map(([code, type]) => <option key={code} value={code} title={type.label}>{code} {type.label}</option>)}</select></td>
            <td className="num"><GrossInput key={`${line.id}-${line.grossCents}`} value={line.grossCents} label={`Bruto: ${payee.name}`} disabled={!canEdit} onCommit={(grossCents) => changeLine(line, { grossCents })} />{line.fromPayroll ? <small className="tsd-source">tööajast</small> : null}</td>
            {line.calculated ? <><td className="num">{line.exemptionKind ? <small>{line.exemptionKind} </small> : null}{cents(line.exemptionCents)}</td><td className="num">{cents(line.socialBaseCents)}</td><td className="num">{PAYMENT_TYPES[line.code].minimum ? <GrossInput key={`${line.id}-m-${line.minimumOverride}`} value={line.minimumOverride} placeholder={amount(line.minimumIncreaseCents)} label={`Kuumäära suurendus: ${payee.name}`} disabled={!canEdit} onCommit={(minimumIncreaseCents) => changeLine(line, { minimumIncreaseCents })} /> : null}</td><td className="num">{cents(line.socialCents)}</td><td className="num">{cents(line.pensionCents)}</td><td className="num">{cents(line.unemploymentEmployeeCents)}</td><td className="num">{cents(line.unemploymentEmployerCents)}</td><td className="num">{amount(line.incomeTaxCents)}</td><td className="num"><strong>{amount(line.netCents)}</strong></td></> : <td colSpan="9" className="tsd-not-calculated">ei ole arvutatud</td>}
            <td>{canEdit && lines.length > 1 ? <button type="button" className="link-button" aria-label={`Eemalda rida: ${payee.name}`} onClick={() => removeLine(line)}><Trash2 size={14} /></button> : null}{canEdit && index === lines.length - 1 && lines.length < Object.keys(PAYMENT_TYPES).length ? <button type="button" className="link-button" aria-label={`Lisa liik: ${payee.name}`} onClick={() => addLine(payee)}><Plus size={14} /></button> : null}</td>
          </tr>), warnings.length ? <tr key={`${payee.id}-warnings`} className="tsd-warning-row"><td colSpan="14"><AlertTriangle size={14} /> {warnings.join('; ')}</td></tr> : null]) : <tr><td colSpan="14" className="tsd-not-calculated">Väljamakse saajaid ei ole. Lisa esimene: „Lisa väljamakse saaja”.</td></tr>}
        </tbody><tfoot><tr><td colSpan="3">Kokku</td><td className="num">{amount(report.totals.grossCents)}</td><td className="num">{cents(report.totals.exemptionCents)}</td><td className="num">{amount(report.totals.socialBaseCents)}</td><td className="num">{cents(report.totals.minimumIncreaseCents)}</td><td className="num">{amount(report.totals.socialCents)}</td><td className="num">{amount(report.totals.pensionCents)}</td><td className="num">{amount(report.totals.unemploymentEmployeeCents)}</td><td className="num">{amount(report.totals.unemploymentEmployerCents)}</td><td className="num">{amount(report.totals.incomeTaxCents)}</td><td className="num">{amount(report.totals.netCents)}</td><td /></tr></tfoot></table></div>
        {report.notOnLisa.length ? <p className="tsd-note">Lisa 1-le ei kuulu: {report.notOnLisa.map((payee) => `${payee.name} (${NOT_ON_LISA_1[payee.code]})`).join(', ')}.{canEdit ? ' ' : ''}{canEdit ? report.notOnLisa.map((payee) => <button key={payee.id} type="button" className="link-button" onClick={() => openPerson(payee)}>Muuda: {payee.name}</button>) : null}</p> : null}
      </Card>

      <div className="tsd-columns">
        <Card className="accounting-card tsd-form"><h2>Vorm TSD, {monthName(month)}</h2>
          <table className="accounting-grid"><tbody>
            <tr><td>110</td><td>Kinnipeetud tulumaks</td><td className="num">{amount(report.form[110])}</td></tr>
            <tr><td>115</td><td>Sotsiaalmaks</td><td className="num">{amount(report.form[115])}</td></tr>
            <tr><td>116</td><td>Töötuskindlustusmakse (töötaja + tööandja)</td><td className="num">{amount(report.form[116])}</td></tr>
            <tr><td>117</td><td>Kohustusliku kogumispensioni makse</td><td className="num">{amount(report.form[117])}</td></tr>
            <tr className="tsd-total"><td>118</td><td>Maksukohustus kokku</td><td className="num">{amount(report.form[118])}</td></tr>
          </tbody></table>
          <p className="tsd-note">Kood 114 (erijuhtude tulumaks, lisad 3–8: erisoodustused, kingitused, dividendid) ja lisa 2 ei ole CRM-is arvutatud.{report.incomplete ? <strong> {report.incomplete} väljamakse saajal on andmed puudu.</strong> : null}</p>
        </Card>
        <Card className="accounting-card tsd-form"><h2>Võrdlus pearaamatuga</h2>
          <table className="accounting-grid"><tbody>
            <tr><td>Konto 4710, {monthName(sourceMonth)}</td><td className="num">{amount(booked.cents)}</td></tr>
            <tr><td>TSD bruto kokku</td><td className="num">{amount(report.totals.grossCents)}</td></tr>
            <tr className="tsd-total"><td>Vahe</td><td className="num">{amount(difference)}</td></tr>
          </tbody></table>
          {booked.entries.length ? <p className="tsd-note">Palgakanne on olemas: {booked.entries.map((item) => item.number).join(', ')}.</p> : null}
          <h2 className="tsd-entry-title">Palgakanne (valikuline)</h2>
          <p className="tsd-note">Eraldi samm: tavaline käsitsi kanne (PR) kuupäevaga {dmy(entry.date)}. TSD arvutus ise raamatupidamist ei muuda.</p>
          {canEdit ? <Button variant="secondary" disabled={!report.totals.grossCents || entryLocked} onClick={() => { setError(''); setEntryOpen(true); }}><FilePlus2 size={16} /> Vaata ja loo palgakanne</Button> : null}
          {entryLocked ? <p className="tsd-note">Periood on suletud kuni {dmy(lockedThrough)}.</p> : null}
        </Card>
      </div>
    </> : null}

    <Modal open={Boolean(person && form)} title={person?.name ? `Väljamakse saaja: ${person.name}` : 'Uus väljamakse saaja'} onClose={() => !saving && setPerson(null)} footer={<><Button variant="secondary" disabled={saving} onClick={() => setPerson(null)}>Loobu</Button><Button type="submit" form="tsd-person-form" loading={saving}>Salvesta</Button></>}>
      {form ? <form id="tsd-person-form" className="form-grid" onSubmit={savePerson}>
        {error ? <p className="form-error form-grid__wide" role="alert">{error}</p> : null}
        {!person?.id ? <Select id="tsd-staff" label="Õpetaja CRM-ist (kui on)" value={form.staffUid} onChange={(event) => setForm({ ...form, staffUid: event.target.value, name: data.staff.find((item) => item.id === event.target.value)?.name || form.name })}><option value="">Keegi teine</option>{data.staff.filter((item) => !payees.some((payee) => payee.id === item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select> : null}
        <Input id="tsd-name" label="Ees- ja perekonnanimi" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <Input id="tsd-id" label="Isikukood" value={form.idCode} inputMode="numeric" autoComplete="off" onChange={(event) => setForm({ ...form, idCode: event.target.value })} />
        <Select id="tsd-code" label="Lepingu liik (väljamakse liik)" className="form-grid__wide" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })}><option value="">Märkimata</option>{Object.entries(PAYMENT_TYPES).map(([code, type]) => <option key={code} value={code}>{code}: {type.label}</option>)}{Object.entries(NOT_ON_LISA_1).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</Select>
        <Select id="tsd-exemption" label="Maksuvaba tulu avaldus" value={form.exemption} onChange={(event) => setForm({ ...form, exemption: event.target.value })}><option value="">Märkimata</option><option value="yes">Avaldus on esitatud</option><option value="no">Avaldust ei ole</option></Select>
        {form.exemption === 'yes' ? <Input id="tsd-exemption-sum" label="Avalduse summa kuus (€)" inputMode="decimal" value={form.exemptionEuro} onChange={(event) => setForm({ ...form, exemptionEuro: event.target.value })} /> : null}
        <Select id="tsd-pension" label="Kogumispensioni määr (II sammas)" value={form.pension} onChange={(event) => setForm({ ...form, pension: event.target.value })}><option value="">Märkimata</option><option value="0">Ei ole liitunud (0 %)</option>{PENSION_RATES.slice(1).map((rate) => <option key={rate} value={rate}>{rate} %</option>)}</Select>
        <label className="tsd-check form-grid__wide"><input type="checkbox" checked={Boolean(form.pensionAge)} onChange={(event) => setForm({ ...form, pensionAge: event.target.checked })} /> Vanaduspensioniealine (MVT liik 650, töötaja töötuskindlustust ei peeta kinni)</label>
        <label className="tsd-check form-grid__wide"><input type="checkbox" checked={Boolean(form.minimumExempt)} onChange={(event) => setForm({ ...form, minimumExempt: event.target.checked })} /> Sotsiaalmaksu kuumäär ei rakendu (SMS § 2 lg 2¹ või lg 4: nt väike laps, riiklik pension, vähenenud töövõime, teine tööandja arvestab maksuvaba tulu)</label>
        <Input id="tsd-note" label="Märkus" className="form-grid__wide" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        {person?.id && !person.isNew ? <label className="tsd-check form-grid__wide"><input type="checkbox" checked={form.active === false} onChange={(event) => setForm({ ...form, active: !event.target.checked })} /> Enam ei ole väljamakse saaja (ei näidata uutes kuudes)</label> : null}
      </form> : null}
    </Modal>

    <Modal open={Boolean(rateForm)} title={`Määrad ${year}`} onClose={() => !saving && setRateForm(null)} footer={<><Button variant="secondary" disabled={saving} onClick={() => setRateForm(null)}>Loobu</Button><Button type="submit" form="tsd-rates-form" loading={saving}>Salvesta</Button></>}>
      {rateForm ? <form id="tsd-rates-form" className="form-grid" onSubmit={saveRates}>
        {error ? <p className="form-error form-grid__wide" role="alert">{error}</p> : null}
        <p className="form-hint form-grid__wide">Võta numbrid emta.ee lehelt „Maksumäärad”. Protsendid ja eurod kahe komakohaga.</p>
        {RATE_FIELDS.map(([key, label, kind]) => <Input key={key} id={`tsd-rate-${key}`} label={`${label} (${kind === 'percent' ? '%' : '€'})`} inputMode="decimal" value={rateForm[key]} onChange={(event) => setRateForm({ ...rateForm, [key]: event.target.value })} required />)}
      </form> : null}
    </Modal>

    <Modal open={entryOpen} title="Palgakanne" onClose={() => !saving && setEntryOpen(false)} footer={<><Button variant="secondary" disabled={saving} onClick={() => setEntryOpen(false)}>Loobu</Button><Button loading={saving} onClick={book}>Loo kanne</Button></>}>
      {entry ? <div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {booked.entries.length ? <p className="form-error" role="alert"><strong>Selle kuu palgakanne on juba olemas</strong> ({booked.entries.map((item) => item.number).join(', ')}). Uus kanne topeldaks palgakulu.</p> : null}
        {report.incomplete ? <p className="form-error" role="alert">{report.incomplete} väljamakse saajal on andmed puudu.</p> : null}
        <p><strong>{dmy(entry.date)}</strong> · {entry.description} · {entry.documentRef}</p>
        <table className="accounting-grid"><thead><tr><th>Konto</th><th>Selgitus</th><th>Deebet</th><th>Kreedit</th></tr></thead><tbody>{entry.lines.map((line) => <tr key={`${line.account}-${line.note}`}><td>{line.account}</td><td>{line.note}</td><td className="num">{cents(line.debitCents)}</td><td className="num">{cents(line.creditCents)}</td></tr>)}</tbody></table>
      </div> : null}
    </Modal>
  </div>;
}

// a cell that saves when the cursor leaves it; empty = not entered (the bruto) or calculated (the monthly base)
function GrossInput({ value, label, disabled, placeholder = '', onCommit }) {
  const [text, setText] = useState(Number.isInteger(value) ? amount(value) : '');
  const commit = () => {
    if (!text.trim()) { if (value !== null && value !== undefined) onCommit(null); return; }
    const parsed = parseEuro(text);
    if (Number.isNaN(parsed)) { setText(Number.isInteger(value) ? amount(value) : ''); return; }
    if (parsed !== value) onCommit(parsed);
  };
  return <input className="tsd-gross" aria-label={label} inputMode="decimal" placeholder={placeholder} value={text} disabled={disabled} onChange={(event) => setText(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} />;
}
