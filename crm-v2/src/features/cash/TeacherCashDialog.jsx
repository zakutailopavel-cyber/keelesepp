import { useId, useMemo, useState } from 'react';
import { Button, Input, Modal, askText } from '../../components/ui/index.js';
import { financeRequestId } from '../../services/firebase/financeApi.js';
import { euro, todayIso } from './cashModel.js';
import { amountCents, amountText } from './lessonCash.js';
import { matchStudents, teacherCashDayRange } from './myCashModel.js';

// „Sain sularaha” (owner 2026-11-26): a teacher records cash they got — from one of their own students (an admin: any
// student) or another payer („Muu maksja”, e.g. a parent without a card). The server keeps it in the cash box
// (functions/cash-core.js teacherReceiptEntry, `source: "teacher"`): held by the teacher, handed over like lesson cash,
// never in the accountant's books, never changing the lesson balance or the next invoice. `entry` = edit that entry
// (own, not handed over yet; an admin: any open one), with „Tühista kirje”.
const OTHER = '__other__';

export default function TeacherCashDialog({ api, students = [], studentsLoading = false, entry = null, onClose, onDone, today = todayIso() }) {
  const editing = Boolean(entry);
  const range = teacherCashDayRange(today);
  const [studentId, setStudentId] = useState(() => (editing ? (entry.studentId || OTHER) : ''));
  const [query, setQuery] = useState(() => (editing ? entry.studentName || (entry.studentId ? '' : 'Muu maksja') : ''));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [payerName, setPayerName] = useState(() => (editing && !entry.studentId ? entry.payerName || '' : ''));
  const [amount, setAmount] = useState(() => (editing ? amountText(entry.amountCents) : ''));
  const [receivedAt, setReceivedAt] = useState(() => (editing ? entry.receivedAt || today : today));
  const [purpose, setPurpose] = useState(() => (editing ? entry.purpose || 'lessons' : 'lessons'));
  const [lessons, setLessons] = useState(() => (editing && entry.lessons ? String(entry.lessons) : ''));
  const [note, setNote] = useState(() => (editing ? entry.note || '' : ''));
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [requestId] = useState(() => financeRequestId('cash_teacher'));
  const listId = useId();
  const inputId = useId();

  const matches = useMemo(() => matchStudents(students, query), [students, query]);
  const options = [...matches.map((student) => ({ id: student.id, label: student.name, hint: student.parentName || '' })), { id: OTHER, label: 'Muu maksja', hint: 'nt lapsevanem, kellel pole kaarti' }];
  const cents = amountCents(amount);
  const lessonCount = lessons.trim() ? Number(lessons.trim()) : null;
  const lessonsOk = lessonCount === null || (Number.isInteger(lessonCount) && lessonCount >= 1 && lessonCount <= 200);
  const dayKept = editing && receivedAt === entry.receivedAt;
  const dayOk = /^\d{4}-\d{2}-\d{2}$/.test(receivedAt) && receivedAt <= range.max && (dayKept || receivedAt >= range.min);
  const payerOk = studentId === OTHER ? Boolean(payerName.trim()) : Boolean(studentId);
  const ready = payerOk && Boolean(cents) && dayOk && (purpose !== 'lessons' || lessonsOk);

  const pick = (option) => {
    setStudentId(option.id);
    setQuery(option.label);
    setOpen(false);
    setError('');
  };
  const onQuery = (text) => {
    setQuery(text);
    setStudentId('');
    setOpen(true);
    setActive(0);
  };
  const onKeyDown = (event) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { setOpen(true); return; }
    if (!open) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((index) => (index + 1) % options.length); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((index) => (index - 1 + options.length) % options.length); }
    if (event.key === 'Enter') { event.preventDefault(); pick(options[Math.min(active, options.length - 1)]); }
    if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) {
      setError(!payerOk ? 'Vali, kellelt raha said.' : !cents ? 'Kirjuta summa eurodes, nt 25 või 25,50.' : !dayOk ? `Kuupäev võib olla ${range.min.split('-').reverse().join('.')} kuni täna.` : 'Tundide arv peab olema täisarv 1…200.');
      return;
    }
    const values = {
      studentId: studentId === OTHER ? null : studentId,
      ...(studentId === OTHER ? { payerName: payerName.trim() } : {}),
      amount: (cents / 100).toFixed(2),
      receivedAt,
      purpose,
      lessons: purpose === 'lessons' && lessonCount ? lessonCount : null,
      note: note.trim(),
    };
    setBusy('save'); setError('');
    try {
      if (editing) await api.editTeacherCash(entry.id, values);
      else await api.recordTeacherCash({ ...values, requestId });
      const who = studentId === OTHER ? payerName.trim() : query;
      await onDone?.(editing ? 'Kirje on parandatud.' : `${euro(cents)} (${who}) on sinu kassas.`);
    } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); setBusy(''); }
  };

  const cancelEntry = async () => {
    const reason = await askText('Miks see kirje tühistatakse?', { title: 'Tühista kirje', confirmLabel: 'Tühista kirje' });
    if (reason === null || reason === undefined) return;
    setBusy('void'); setError('');
    try {
      await api.voidTeacherCash(entry.id, String(reason).trim() || 'Õpetaja tühistas kirje');
      await onDone?.('Kirje on tühistatud — seda raha sinu kassas enam ei ole.');
    } catch (caught) { setError(caught.message || 'Tühistamine ebaõnnestus.'); setBusy(''); }
  };

  const showList = open && !studentId;
  return (
    <Modal open title={editing ? 'Paranda sularaha kirjet' : 'Sain sularaha'} onClose={onClose} className="my-cash-dialog"
      footer={<>
        {editing ? <Button variant="danger" className="my-cash-dialog__void" loading={busy === 'void'} disabled={Boolean(busy)} onClick={cancelEntry}>Tühista kirje</Button> : null}
        <Button variant="secondary" onClick={onClose}>Loobu</Button>
        <Button type="submit" form="my-cash-teacher" loading={busy === 'save'} disabled={Boolean(busy)}>Salvesta</Button>
      </>}>
      <form id="my-cash-teacher" className="my-cash-dialog__form" onSubmit={submit} noValidate>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="field my-cash-payer">
          <label className="field__label" htmlFor={inputId}>Kellelt?</label>
          <input id={inputId} role="combobox" aria-expanded={showList} aria-controls={listId} aria-autocomplete="list" autoComplete="off"
            value={query} placeholder={studentsLoading ? 'Laen õpilasi…' : 'Kirjuta õpilase nimi'}
            onChange={(event) => onQuery(event.target.value)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={onKeyDown} />
          {showList ? (
            <ul id={listId} role="listbox" aria-label="Õpilased" className="my-cash-payer__list">
              {options.map((option, index) => (
                <li key={option.id} role="option" aria-selected={index === active} className={`${index === active ? 'is-active' : ''} ${option.id === OTHER ? 'is-other' : ''}`}
                  onMouseDown={(event) => { event.preventDefault(); pick(option); }}>
                  <strong>{option.label}</strong>{option.hint ? <small>{option.hint}</small> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {studentId === OTHER ? <Input label="Maksja nimi" value={payerName} onChange={(event) => setPayerName(event.target.value)} placeholder="nt Kati Tamm (ema)" required /> : null}
        <div className="my-cash-dialog__pair">
          <Input label="Summa €" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="nt 100" required />
          <Input label="Kuupäev" type="date" min={dayKept ? undefined : range.min} max={range.max} value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} required />
        </div>
        <fieldset>
          <legend>Mille eest?</legend>
          <label className={`my-cash-choice ${purpose === 'lessons' ? 'is-chosen' : ''}`}>
            <input type="radio" name="cash-purpose" checked={purpose === 'lessons'} onChange={() => setPurpose('lessons')} />
            <span>Tunnid</span>
          </label>
          <label className={`my-cash-choice ${purpose === 'other' ? 'is-chosen' : ''}`}>
            <input type="radio" name="cash-purpose" checked={purpose === 'other'} onChange={() => setPurpose('other')} />
            <span>Muu</span>
          </label>
        </fieldset>
        {purpose === 'lessons' ? <Input label="Mitu tundi? (valikuline)" inputMode="numeric" value={lessons} onChange={(event) => setLessons(event.target.value.replace(/[^\d]/g, ''))} placeholder="nt 4" /> : null}
        <Input label="Märkus (valikuline)" value={note} onChange={(event) => setNote(event.target.value)} placeholder="nt detsembri tunnid, maksis ema" />
        <p className="form-hint">Raha läheb sinu kassasse „Käes, üle andmata” ja sa annad selle üle nagu tunniraha. Raamatupidamisse sularaha ei lähe ja õpilase tunnisaldot ega arvet see ei muuda.</p>
      </form>
    </Modal>
  );
}
