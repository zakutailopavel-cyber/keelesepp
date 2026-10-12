import { Download, Plus } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import { invoiceDeliveryApi } from '../../services/firebase/financeApi.js';
import { base64DocumentBlob } from '../../services/firebase/paymentDocuments.js';

function nextDueDate() {
  const now = new Date();
  const currentMonthDue = new Date(now.getFullYear(), now.getMonth(), 10, 12);
  const target = now <= currentMonthDue
    ? currentMonthDue
    : new Date(now.getFullYear(), now.getMonth() + 1, 10, 12);
  return target.toISOString().slice(0, 10);
}

// „Mõlemad ained”: one invoice per subject card of the same student, each with its own amount (owner 2026-10-12)
const ALL_SUBJECTS = '__all__';

const emptyForm = () => ({
  studentId: '',
  amounts: {},
  description: '',
  amount: '',
  due: nextDueDate(),
  note: '',
});

const formatDate = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : '—';
};

const formatMoney = (value) => new Intl.NumberFormat('et-EE', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
}).format(Number(value) || 0);

function downloadDocument(document) {
  const url = document.url || URL.createObjectURL(base64DocumentBlob(document));
  const link = globalThis.document.createElement('a');
  link.href = url;
  link.download = document.filename || document.fileName || 'arve.pdf';
  link.click();
  if (!document.url) URL.revokeObjectURL(url);
}

// the student cards the finance page already holds (owner 2026-10-12: the list took long to load through the function)
function invoiceStudents(cards = []) {
  return cards
    .filter((card) => card && card.active !== false && !card.convertedToParent && String(card.name || '').trim())
    .map((card) => {
      const subject = String(card.subject || '').trim();
      const hint = [card.parentName, card.parentEmail || card.email, subject].map((value) => String(value || '').trim()).filter(Boolean).join(' · ');
      return { id: card.id, name: String(card.name).trim(), subject, parent: String(card.parentName || card.parentEmail || card.email || '').trim(), hint };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'et'));
}

// one row per name; a student learning two subjects has two cards (one per subject) → the „Aine” field
function groupByName(students = []) {
  const groups = new Map();
  for (const student of students) {
    const list = groups.get(student.name) || [];
    list.push(student);
    groups.set(student.name, list);
  }
  return [...groups.entries()].map(([name, cards]) => ({ name, cards }));
}

const subjectOf = (student) => student.subject || String(student.hint || '').split(' · ').at(-1) || '';
const cardLabel = (student, cards) => {
  const subject = subjectOf(student) || 'Aine määramata';
  const sameSubject = cards.filter((card) => subjectOf(card) === subjectOf(student)).length > 1;
  return sameSubject && student.parent ? `${subject} · ${student.parent}` : subject;
};

export default function ManualInvoiceDialog({ onCreated, deliveryApi = invoiceDeliveryApi, studentCards = null }) {
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
    if (studentCards?.length) { setStudents(invoiceStudents(studentCards)); return undefined; }
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
  }, [open, students.length, studentCards]);

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
  const groups = useMemo(() => groupByName(matches), [matches]);
  const [pickedName, setPickedName] = useState('');
  const name = selectedStudent?.name || pickedName;
  const sameName = useMemo(() => students.filter((student) => student.name === name), [students, name]);
  const allSubjects = form.studentId === ALL_SUBJECTS && sameName.length > 1;
  const bothLines = allSubjects ? sameName.map((card) => ({ card, amount: form.amounts[card.id] || '' })) : [];
  const bothTotal = bothLines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const pickName = (value) => {
    setPickedName(value);
    const cards = students.filter((student) => student.name === value);
    setForm((current) => ({ ...current, studentId: cards.length === 1 ? cards[0].id : '' }));
  };

  const resetAndClose = () => {
    setOpen(false);
    setError('');
    setQuery('');
    setPickedName('');
    setForm(emptyForm());
  };

  const close = () => {
    if (!saving) resetAndClose();
  };

  const submit = async (event, downloadPdf = false) => {
    event.preventDefault();
    setError('');
    if (!form.studentId) return setError(pickedName && sameName.length > 1 ? 'Vali aine.' : 'Vali õpilane.');
    if (!form.description.trim()) return setError('Lisa arve kirjeldus.');
    if (allSubjects) {
      if (bothLines.some((line) => !(Number(line.amount) > 0))) return setError('Lisa summa igale ainele.');
    } else if (!(Number(form.amount) > 0)) return setError('Lisa korrektne summa.');
    if (!form.due) return setError('Lisa maksetähtaeg.');

    if (allSubjects) {
      setSaving(true);
      let last = null;
      const left = { ...form.amounts };
      try {
        // one by one; a created subject leaves the form, so a retry after an error never makes it twice
        for (const line of bothLines) {
          const result = await manualInvoiceApi.create({ ...form, studentId: line.card.id, amount: line.amount });
          last = result.invoice;
          delete left[line.card.id];
          if (downloadPdf) downloadDocument(await deliveryApi.pdf(last.id));
        }
        resetAndClose();
        await onCreated?.(last);
      } catch (requestError) {
        setForm((current) => ({ ...current, amounts: left }));
        const done = bothLines.length - Object.keys(left).length;
        setError(`${done ? `${done} arve loodud. ` : ''}${requestError.message || 'Arve loomine ebaõnnestus.'}`);
        if (done) await onCreated?.(last);
      } finally {
        setSaving(false);
      }
      return undefined;
    }

    setSaving(true);
    try {
      const result = await manualInvoiceApi.create(form);
      const invoice = result.invoice;
      if (downloadPdf) downloadDocument(await deliveryApi.pdf(invoice.id));
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
        className="modal--manual-invoice"
        title="Lisa arve"
        onClose={close}
        footer={(
          <>
            <Button variant="secondary" disabled={saving} onClick={close}>Loobu</Button>
            <Button
              variant="secondary"
              loading={saving}
              type="button"
              onClick={(event) => submit(event, true)}
            ><Download size={17} /> Loo ja laadi PDF</Button>
            <Button loading={saving} type="submit" form="manual-invoice-form">{allSubjects ? `Loo arved (${sameName.length})` : 'Loo arve'}</Button>
          </>
        )}
      >
        {/* noValidate: our own Estonian messages instead of the browser's barely visible bubble */}
        <div className="manual-invoice-layout">
        <form id="manual-invoice-form" className="form-grid manual-invoice-form" onSubmit={submit} noValidate>
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
              const names = [...new Set(found.map((student) => student.name))];
              if (names.length === 1) pickName(names[0]);
            }}
          />
          <Select
            className="form-grid__wide"
            label="Õpilane"
            value={name}
            disabled={loadingStudents}
            onChange={(event) => pickName(event.target.value)}
            required
          >
            <option value="">{loadingStudents ? 'Laen õpilasi…' : groups.length ? `Vali õpilane (${groups.length})` : 'Keegi ei vasta otsingule'}</option>
            {(name && !groups.some((group) => group.name === name) ? [{ name, cards: sameName }, ...groups] : groups).map((group) => (
              <option key={group.name} value={group.name}>{group.cards.length > 1 ? `${group.name} · ${group.cards.length} ainet` : group.cards[0]?.hint ? `${group.name} · ${group.cards[0].hint}` : group.name}</option>
            ))}
          </Select>
          {sameName.length > 1 ? (
            <Select
              className="form-grid__wide"
              label="Aine"
              value={form.studentId}
              onChange={(event) => setForm({ ...form, studentId: event.target.value })}
              required
            >
              <option value="">Vali aine ({sameName.length})</option>
              {sameName.map((student) => <option key={student.id} value={student.id}>{cardLabel(student, sameName)}</option>)}
              <option value={ALL_SUBJECTS}>Mõlemad ained ({sameName.length} arvet)</option>
            </Select>
          ) : null}
          <Input
            className="form-grid__wide"
            label="Kirjeldus"
            placeholder="Näiteks: õppematerjalid või eksamitasu"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
          {allSubjects ? bothLines.map((line) => (
            <Input
              key={line.card.id}
              label={`Summa — ${subjectOf(line.card) || 'aine'} (€)`}
              type="number"
              min="0.01"
              step="0.01"
              value={line.amount}
              onChange={(event) => setForm({ ...form, amounts: { ...form.amounts, [line.card.id]: event.target.value } })}
              required
            />
          )) : (
            <Input
              label="Summa (€)"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              required
            />
          )}
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
          {allSubjects ? (
            <p className="form-hint form-grid__wide">
              Luuakse <strong>{sameName.length} eraldi arvet</strong> õpilasele <strong>{name}</strong>: igal arvel oma aine ja summa.
            </p>
          ) : null}
          {selectedStudent ? (
            <p className="form-hint form-grid__wide">
              Arve koostatakse õpilasele <strong>{selectedStudent.name}</strong>{subjectOf(selectedStudent) ? <> ({subjectOf(selectedStudent)})</> : null} ja lisatakse kohe arvete nimekirja.
            </p>
          ) : null}
          {error ? <p className="action-error form-grid__wide" role="alert">{error}</p> : null}
        </form>
        <aside className="manual-invoice-preview" aria-label="Arve eelvaade">
          <div className="manual-invoice-preview__label">Arve eelvaade</div>
          <div className="manual-invoice-paper">
            <header>
              <div><strong>EP Koolitus</strong><span>KeeleSepp</span></div>
              <dl>
                <div><dt>Arve nr.</dt><dd>Tekib loomisel</dd></div>
                <div><dt>Kuupäev</dt><dd>{formatDate(new Date().toISOString().slice(0, 10))}</dd></div>
                <div><dt>Tähtaeg</dt><dd>{formatDate(form.due)}</dd></div>
                <div><dt>Valuuta</dt><dd>EUR</dd></div>
              </dl>
            </header>
            <h3>ARVE</h3>
            <section className="manual-invoice-paper__payer">
              <span>Maksja / õpilane</span>
              <strong>{selectedStudent?.name || name || 'Vali õpilane'}</strong>
              <small>{selectedStudent?.hint || 'Maksja andmed lisatakse õpilase kaardilt'}</small>
            </section>
            <div className="manual-invoice-paper__line">
              <span>Nimetus</span><span>Kogus</span><span>Summa</span>
              {allSubjects ? bothLines.map((line) => <Fragment key={line.card.id}><strong>{form.description.trim() || 'Arve kirjeldus'} · {subjectOf(line.card)}</strong><span>1</span><strong>{formatMoney(line.amount)}</strong></Fragment>)
                : <><strong>{form.description.trim() || 'Arve kirjeldus'}{selectedStudent && subjectOf(selectedStudent) ? ` · ${subjectOf(selectedStudent)}` : ''}</strong><span>1</span><strong>{formatMoney(form.amount)}</strong></>}
            </div>
            <div className="manual-invoice-paper__total"><span>{allSubjects ? `Kokku (${sameName.length} arvet)` : 'Summa tasumiseks'}</span><strong>{formatMoney(allSubjects ? bothTotal : form.amount)}</strong></div>
            <footer><span>Makseinfo lisatakse ettevõtte seadetest.</span><span>PDF luuakse pärast arve salvestamist.</span></footer>
          </div>
        </aside>
        </div>
      </Modal>
    </>
  );
}
