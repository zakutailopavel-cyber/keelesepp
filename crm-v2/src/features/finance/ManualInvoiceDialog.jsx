import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal } from '../../components/ui/index.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';

function nextDueDate() {
  const now = new Date();
  const currentMonthDue = new Date(now.getFullYear(), now.getMonth(), 10, 12);
  const target = now <= currentMonthDue ? currentMonthDue : new Date(now.getFullYear(), now.getMonth() + 1, 10, 12);
  return target.toISOString().slice(0, 10);
}

const emptyForm = () => ({ studentId: '', description: '', amount: '', due: nextDueDate(), note: '' });

export default function ManualInvoiceDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentQuery, setStudentQuery] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open || students.length || loadingStudents) return;
    let active = true;
    setLoadingStudents(true);
    setError('');
    manualInvoiceApi.listStudents()
      .then((items) => active && setStudents([...items].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'et'))))
      .catch((requestError) => active && setError(requestError.message || 'Õpilaste laadimine ebaõnnestus.'))
      .finally(() => active && setLoadingStudents(false));
    return () => { active = false; };
  }, [loadingStudents, open, students.length]);

  const selectedStudent = useMemo(() => students.find((student) => student.id === form.studentId), [form.studentId, students]);
  const filteredStudents = useMemo(() => {
    const query = studentQuery.trim().toLocaleLowerCase('et');
    if (!query) return students;
    return students.filter((student) => String(student.name || '').toLocaleLowerCase('et').includes(query));
  }, [studentQuery, students]);

  const amount = Number(form.amount || 0);
  const resetAndClose = () => {
    setOpen(false); setError(''); setStudentQuery(''); setForm(emptyForm());
  };
  const close = () => { if (!saving) resetAndClose(); };

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!form.studentId) return setError('Vali õpilane.');
    if (!form.description.trim()) return setError('Lisa arve kirjeldus.');
    if (!(amount > 0)) return setError('Lisa korrektne summa.');
    if (!form.due) return setError('Lisa maksetähtaeg.');
    setSaving(true);
    try {
      const result = await manualInvoiceApi.create(form);
      resetAndClose();
      await onCreated?.(result.invoice);
    } catch (requestError) {
      setError(requestError.message || 'Arve loomine ebaõnnestus.');
    } finally { setSaving(false); }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus size={17} /> Lisa arve</Button>
      <Modal open={open} title="Lisa arve" onClose={close} footer={<><Button variant="secondary" disabled={saving} onClick={close}>Loobu</Button><Button loading={saving} type="submit" form="manual-invoice-form">Loo arve</Button></>}>
        <form id="manual-invoice-form" className="manual-invoice-layout" onSubmit={submit}>
          <div className="manual-invoice-fields">
            <label className="form-field manual-student-field">
              <span>Õpilane</span>
              <div className="manual-student-search"><Search size={17} /><input value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} placeholder={loadingStudents ? 'Laen õpilasi…' : 'Otsi õpilast…'} disabled={loadingStudents} /></div>
              {!loadingStudents && filteredStudents.length > 0 ? <div className="manual-student-options">{filteredStudents.slice(0, 8).map((student) => <button type="button" key={student.id} className={student.id === form.studentId ? 'is-selected' : ''} onClick={() => { setForm({ ...form, studentId: student.id }); setStudentQuery(student.name); }}>{student.name}</button>)}</div> : null}
            </label>
            <Input label="Kirjeldus" placeholder="Näiteks: õppematerjalid või eksamitasu" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            <div className="manual-invoice-row"><Input label="Summa (€)" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /><Input label="Maksetähtaeg" type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} required /></div>
            <label className="form-field"><span>Märkus</span><textarea rows="3" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Sisemine märkus, soovi korral" /></label>
            {error ? <p className="action-error">{error}</p> : null}
          </div>
          <aside className="manual-invoice-preview">
            <div className="manual-invoice-preview__eyebrow">ARVE EELVAADE</div>
            <h3>{selectedStudent?.name || 'Õpilane valimata'}</h3>
            <p>{form.description.trim() || 'Arve kirjeldus ilmub siia.'}</p>
            <div className="manual-invoice-preview__line"><span>Summa</span><strong>{amount > 0 ? `${amount.toFixed(2).replace('.', ',')} €` : '0,00 €'}</strong></div>
            <div className="manual-invoice-preview__line"><span>Maksetähtaeg</span><strong>{form.due || '—'}</strong></div>
            <div className="manual-invoice-preview__total"><span>Tasuda</span><strong>{amount > 0 ? `${amount.toFixed(2).replace('.', ',')} €` : '0,00 €'}</strong></div>
            <small>Pärast loomist lisatakse arve kohe arvete nimekirja.</small>
          </aside>
        </form>
      </Modal>
    </>
  );
}
