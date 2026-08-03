import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';

const levels = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const emptyForm = { name: '', parentName: '', email: '', phone: '', level: 'A1', targetLevel: 'B1', subject: 'Eesti keel', grade: '', group: '', teacher: '', active: true };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Nimi on kohustuslik.';
  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Kontrolli e-posti aadressi.';
  if (values.phone && values.phone.replace(/\D/g, '').length < 5) errors.phone = 'Kontrolli telefoninumbrit.';
  return errors;
}

export default function StudentForm({ open, student, teachers = [], onClose, onSubmit }) {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open) { setValues(student ? { ...emptyForm, ...student } : emptyForm); setErrors({}); setSubmitError(''); }
  }, [open, student]);

  const change = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true); setSubmitError('');
    try { await onSubmit(values); onClose(); } catch (error) { setSubmitError(error.message); } finally { setSubmitting(false); }
  };

  return (
    <Modal open={open} onClose={submitting ? () => {} : onClose} title={student ? 'Muuda õpilast' : 'Lisa õpilane'} footer={<><Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>Loobu</Button><Button type="submit" form="student-form" loading={submitting}>Salvesta</Button></>}>
      <form id="student-form" className="form-grid" onSubmit={submit}>
        <Input label="Õpilase nimi *" name="name" value={values.name} onChange={change} error={errors.name} />
        <Input label="Lapsevanema nimi" name="parentName" value={values.parentName} onChange={change} />
        <Input label="E-post" name="email" type="email" value={values.email} onChange={change} error={errors.email} />
        <Input label="Telefon" name="phone" value={values.phone} onChange={change} error={errors.phone} />
        <Select label="Praegune tase" name="level" value={values.level} onChange={change}>{levels.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
        <Select label="Sihttase" name="targetLevel" value={values.targetLevel} onChange={change}>{levels.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
        <Input label="Õppeaine" name="subject" value={values.subject} onChange={change} />
        <Input label="Klass / vanuserühm" name="grade" value={values.grade} onChange={change} />
        <Input label="Rühm" name="group" value={values.group} onChange={change} />
        <Select label="Õpetaja" name="teacher" value={values.teacher} onChange={change}><option value="">Määramata</option>{teachers.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select>
        {submitError ? <p className="form-error form-grid__wide" role="alert">{submitError}</p> : null}
      </form>
    </Modal>
  );
}
