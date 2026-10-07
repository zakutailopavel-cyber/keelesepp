import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';

function nextDueDate() {
  const now = new Date();
  const currentMonthDue = new Date(now.getFullYear(), now.getMonth(), 10, 12);
  const target = now <= currentMonthDue
    ? currentMonthDue
    : new Date(now.getFullYear(), now.getMonth() + 1, 10, 12);
  return target.toISOString().slice(0, 10);
}

const emptyForm = () => ({
  studentId: '',
  description: '',
  amount: '',
  due: nextDueDate(),
  note: '',
});

export default function ManualInvoiceDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');

  // loadingStudents is not a dependency: setting it would re-run the effect, cancel this request and never load
  useEffect(() => {
    if (!open || students.length) return undefined;
    let active = true;
    setLoadingStudents(true);
    manualInvoiceApi
      .listStudents()
      .then((items) => {
        if (!active) return;
        setStudents([...items].sort((a, b) =>
          String(a.name || '').localeCompare(String(b.name || ''), 'et'),
        ));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Õpilaste laadimine ebaõnnestus.');
      })
      .finally(() => {
        if (active) setLoadingStudents(false);
      });
    return () => {
      active = false;
    };
  }, [open, students.length]);

  // the admin types part of the name (or parent / e-mail) and picks from the matches
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('et');
    if (!needle) return students;
    return students.filter((student) => `${student.name} ${student.hint || ''}`.toLocaleLowerCase('et').includes(needle));
  }, [query, students]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === form.studentId),
    [form.studentId, students],
  );

  const resetAndClose = () => {
    setOpen(false);
    setError('');
    setQuery('');
    setForm(emptyForm());
  };

  const close = () => {
    if (!saving) resetAndClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.studentId) return setError('Vali õpilane.');
    if (!form.description.trim()) return setError('Lisa arve kirjeldus.');
    if (!(Number(form.amount) > 0)) return setError('Lisa korrektne summa.');
    if (!form.due) return setError('Lisa maksetähtaeg.');

    setSaving(true);
    try {
      const result = await manualInvoiceApi.create(form);
      const invoice = result.invoice;
      resetAndClose();
      await onCreated?.(invoice);
    } catch (requestError) {
      setError(requestError.message || 'Arve loomine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={17} /> Lisa arve
      </Button>
      <Modal
        open={open}
        title="Lisa arve"
        onClose={close}
        footer={(
          <>
            <Button variant="secondary" disabled={saving} onClick={close}>Loobu</Button>
            <Button loading={saving} type="submit" form="manual-invoice-form">Loo arve</Button>
          </>
        )}
      >
        {/* noValidate: our own Estonian messages instead of the browser's barely visible bubble */}
        <form id="manual-invoice-form" className="form-grid" onSubmit={submit} noValidate>
          <Input
            className="form-grid__wide"
            label="Otsi õpilast"
            type="search"
            placeholder="Kirjuta nimi, lapsevanem või e-post"
            value={query}
            disabled={loadingStudents}
            onChange={(event) => {
              const next = event.target.value;
              setQuery(next);
              const needle = next.trim().toLocaleLowerCase('et');
              const found = needle ? students.filter((student) => `${student.name} ${student.hint || ''}`.toLocaleLowerCase('et').includes(needle)) : [];
              if (found.length === 1) setForm((current) => ({ ...current, studentId: found[0].id }));
            }}
          />
          <Select
            className="form-grid__wide"
            label="Õpilane"
            value={form.studentId}
            disabled={loadingStudents}
            onChange={(event) => setForm({ ...form, studentId: event.target.value })}
            required
          >
            <option value="">{loadingStudents ? 'Laen õpilasi…' : matches.length ? `Vali õpilane (${matches.length})` : 'Keegi ei vasta otsingule'}</option>
            {(selectedStudent && !matches.includes(selectedStudent) ? [selectedStudent, ...matches] : matches).map((student) => (
              <option key={student.id} value={student.id}>{student.hint ? `${student.name} · ${student.hint}` : student.name}</option>
            ))}
          </Select>
          <Input
            className="form-grid__wide"
            label="Kirjeldus"
            placeholder="Näiteks: õppematerjalid või eksamitasu"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          <Input
            label="Summa (€)"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            required
          />
          <Input
            label="Maksetähtaeg"
            type="date"
            value={form.due}
            onChange={(event) => setForm({ ...form, due: event.target.value })}
            required
          />
          <div className="field form-grid__wide">
            <label className="field__label" htmlFor="manual-invoice-note">Märkus</label>
            <textarea
              id="manual-invoice-note"
              className="field__textarea"
              rows="3"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="Sisemine märkus, soovi korral"
            />
          </div>
          {selectedStudent ? (
            <p className="form-hint form-grid__wide">
              Arve koostatakse õpilasele <strong>{selectedStudent.name}</strong> ja lisatakse kohe arvete nimekirja.
            </p>
          ) : null}
          {error ? <p className="action-error form-grid__wide" role="alert">{error}</p> : null}
        </form>
      </Modal>
    </>
  );
}
