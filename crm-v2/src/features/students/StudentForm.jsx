import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { canonicalTeacherName } from '../../utils/teachers.js';
import { STUDENT_LEVELS } from './studentOptions.js';
import { facebookContact, instagramContact } from '../../utils/socialLinks.js';

const emptyForm = { name: '', parentName: '', email: '', phone: '', facebook: '', instagram: '', level: 'A1', targetLevel: 'B1', subject: 'Eesti keel', grade: '', group: '', teacher: '', active: true };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Nimi on kohustuslik.';
  if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Kontrolli e-posti aadressi.';
  if (values.phone && values.phone.replace(/\D/g, '').length < 5) errors.phone = 'Kontrolli telefoninumbrit.';
  if (values.facebook && !facebookContact(values.facebook)) errors.facebook = 'Sisesta Facebooki kasutajanimi või profiili link.';
  if (values.instagram && !instagramContact(values.instagram)) errors.instagram = 'Sisesta Instagrami kasutajanimi (@nimi) või profiili link.';
  return errors;
}

export default function StudentForm({ open, student, teachers = [], canAssignTeacher = false, defaultTeacher = '', showConsent = false, onClose, onSubmit }) {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(student
        ? { ...emptyForm, ...student, teacher: canonicalTeacherName(student.teacher), recordingConsent: student.recordingConsent === true }
        : { ...emptyForm, teacher: canonicalTeacherName(defaultTeacher) });
      setErrors({});
      setSubmitError('');
    }
  }, [defaultTeacher, open, student]);

  const change = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      event.currentTarget.elements.namedItem(firstInvalidField)?.focus();
      return;
    }
    setSubmitting(true); setSubmitError('');
    try { await onSubmit(values); onClose(); } catch (error) { setSubmitError(firebaseErrorMessage(error)); } finally { setSubmitting(false); }
  };

  return (
    <Modal open={open} onClose={submitting ? () => {} : onClose} title={student ? 'Muuda õpilast' : 'Lisa õpilane'} footer={<><Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>Loobu</Button><Button type="submit" form="student-form" loading={submitting}>Salvesta</Button></>}>
      <form id="student-form" className="form-grid" onSubmit={submit} noValidate>
        <Input label="Õpilase nimi *" name="name" value={values.name} onChange={change} error={errors.name} />
        <Input label="Lapsevanema nimi" name="parentName" value={values.parentName} onChange={change} />
        <Input label="E-post" name="email" type="email" value={values.email} onChange={change} error={errors.email} />
        <Input label="Telefon" name="phone" value={values.phone} onChange={change} error={errors.phone} />
        {canAssignTeacher ? <Input label="Facebook (kasutajanimi või link)" name="facebook" value={values.facebook || ''} onChange={change} error={errors.facebook} /> : null}
        {canAssignTeacher ? <Input label="Instagram (@kasutajanimi või link)" name="instagram" value={values.instagram || ''} onChange={change} error={errors.instagram} /> : null}
        <Select label="Praegune tase" name="level" value={values.level} onChange={change}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
        <Select label="Sihttase" name="targetLevel" value={values.targetLevel} onChange={change}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
        <Input label="Õppeaine" name="subject" value={values.subject} onChange={change} />
        <Input label="Klass / vanuserühm" name="grade" value={values.grade} onChange={change} />
        <Input label="Rühm" name="group" value={values.group} onChange={change} />
        {canAssignTeacher ? <Select label="Õpetaja" name="teacher" value={values.teacher} onChange={change}><option value="">Määramata</option>{teachers.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select> : <Input label="Õpetaja" name="teacher" value={values.teacher || defaultTeacher} disabled />}
        {/* consent for recording Live Classroom lessons (was a big card in „Areng”; owner, 2026-10-10: into the settings) */}
        {showConsent ? <label className="student-form__check form-grid__wide"><input type="checkbox" name="recordingConsent" checked={values.recordingConsent === true} onChange={(e) => setValues((current) => ({ ...current, recordingConsent: e.target.checked }))} />
          <span><b>Tundi võib salvestada</b><small>Õpilane (alaealise puhul lapsevanem) on nõus. Salvestamise ajal näeb õpilane märki „Tundi salvestatakse”. Heli kustutatakse 60 päeva pärast, tekst jääb.</small></span></label> : null}
        {submitError ? <p className="form-error form-grid__wide" role="alert">{submitError}</p> : null}
      </form>
    </Modal>
  );
}
