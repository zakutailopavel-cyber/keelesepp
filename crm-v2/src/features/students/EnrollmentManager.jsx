import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Input, Modal, Select } from '../../components/ui/index.js';
import { enrollmentKey } from '../../services/firebase/students.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { isSameTeacher } from '../../utils/teachers.js';
import { STUDENT_LEVELS } from './studentOptions.js';
import { SUBJECT_CHOICES, subjectName } from './subjects.js';

// „Õppesuunad” of one child (owner 2026-10-20, Oleksiy 2026-10-24): several subjects with their own teacher and level
// on ONE card. Opened from the list „Õpilased” and from the student's card. Adding a subject never creates a card.
// The price of a further subject is set in Finantsid → Arveldus (studentRevenuePlans.subjectPrices).
export default function EnrollmentManager({ student, teachers, service, onClose, onChanged, onAdded }) {
  const [drafts, setDrafts] = useState(() => Object.fromEntries((student?.enrollments || []).map((item) => [item.id, { ...item }])));
  const [newEnrollment, setNewEnrollment] = useState({ subject: '', level: 'A1', targetLevel: 'B1', teacher: '', active: true });
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const subjectChoices = [...new Set([...SUBJECT_CHOICES, ...(student?.enrollments || []).map((item) => subjectName(item.subject)).filter(Boolean)])];

  // a track added after the window opened has no draft yet: start from the track itself
  const updateDraft = (enrollment, field, value) => setDrafts((current) => ({ ...current, [enrollment.id]: { ...(current[enrollment.id] || enrollment), [field]: value } }));

  const saveExisting = async (enrollment) => {
    const draft = drafts[enrollment.id] || enrollment;
    if (!draft?.subject?.trim()) { setError('Õppeaine on kohustuslik.'); return; }
    setSaving(enrollment.id); setError('');
    try {
      const recordIds = enrollment.sourceRecordIds?.length ? enrollment.sourceRecordIds : [student.id];
      await Promise.all(recordIds.map((recordId) => service.updateEnrollment(recordId, enrollmentKey(enrollment), { ...draft, subject: subjectName(draft.subject) })));
      await onChanged();
    } catch (err) { setError(firebaseErrorMessage(err)); }
    finally { setSaving(''); }
  };

  const add = async () => {
    const subject = subjectName(newEnrollment.subject);
    if (!subject) { setError('Sisesta õppeaine.'); return; }
    const same = (student?.enrollments || []).find((item) => item.active !== false && subjectName(item.subject) === subject && (item.teacher || newEnrollment.teacher ? isSameTeacher(item.teacher, newEnrollment.teacher) : true));
    if (same) { setError(`${subject} on sellel kaardil juba olemas. Muuda olemasolevat õppesuunda.`); return; }
    setSaving('new'); setError('');
    try {
      const added = { ...newEnrollment, subject };
      await service.addEnrollment(student.id, added);
      setNewEnrollment({ subject: '', level: 'A1', targetLevel: 'B1', teacher: '', active: true });
      await onChanged();
      onAdded?.(added);
    } catch (err) { setError(firebaseErrorMessage(err)); }
    finally { setSaving(''); }
  };

  return <Modal open={Boolean(student)} title={student ? `Õppesuunad: ${student.name}` : 'Õppesuunad'} onClose={saving ? () => {} : onClose} className="modal--enrollments" footer={<Button variant="secondary" disabled={Boolean(saving)} onClick={onClose}>Valmis</Button>}>
    <div className="enrollment-manager">
      <p className="form-hint">Üks laps võib õppida mitut ainet eri õpetajatega ühel kaardil. Ära loo teise aine jaoks uut kaarti: lisa siia uus õppesuund. Muudatus ei muuda varasemat ajalugu. Uue aine tunnihinna saab määrata Finantsid → Arveldus.</p>
      <datalist id="enrollment-subjects">{subjectChoices.map((subject) => <option key={subject} value={subject} />)}</datalist>
      <div className="enrollment-manager__list">{(student?.enrollments || []).map((enrollment) => {
        const draft = drafts[enrollment.id] || enrollment;
        return <section className="enrollment-editor" key={enrollment.id}>
          <div className="enrollment-editor__title"><strong>{enrollment.subject || 'Õppesuund'}</strong><Badge tone={draft.active !== false ? 'success' : 'neutral'}>{draft.active !== false ? 'Aktiivne' : 'Mitteaktiivne'}</Badge></div>
          <div className="enrollment-editor__grid">
            <Input label="Õppeaine" list="enrollment-subjects" value={draft.subject || ''} onChange={(event) => updateDraft(enrollment, 'subject', event.target.value)} />
            <Select label="Õpetaja" value={draft.teacher || ''} onChange={(event) => updateDraft(enrollment, 'teacher', event.target.value)}><option value="">Määramata</option>{[...new Set([...teachers, draft.teacher].filter(Boolean))].map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select>
            <Select label="Praegune tase" value={draft.level || ''} onChange={(event) => updateDraft(enrollment, 'level', event.target.value)}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
            <Select label="Sihttase" value={draft.targetLevel || ''} onChange={(event) => updateDraft(enrollment, 'targetLevel', event.target.value)}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
            <Select label="Staatus" value={draft.active === false ? 'inactive' : 'active'} onChange={(event) => updateDraft(enrollment, 'active', event.target.value === 'active')}><option value="active">Aktiivne</option><option value="inactive">Mitteaktiivne</option></Select>
          </div>
          <div className="enrollment-editor__actions"><Button loading={saving === enrollment.id} disabled={Boolean(saving)} onClick={() => saveExisting(enrollment)}>Salvesta õppesuund</Button></div>
        </section>;
      })}</div>
      <section className="enrollment-editor enrollment-editor--new">
        <div className="enrollment-editor__title"><strong>Lisa uus õppesuund</strong></div>
        <div className="enrollment-editor__grid">
          <Input label="Õppeaine" list="enrollment-subjects" placeholder="nt Matemaatika" value={newEnrollment.subject} onChange={(event) => setNewEnrollment({ ...newEnrollment, subject: event.target.value })} />
          <Select label="Õpetaja" value={newEnrollment.teacher} onChange={(event) => setNewEnrollment({ ...newEnrollment, teacher: event.target.value })}><option value="">Määramata</option>{teachers.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select>
          <Select label="Praegune tase" value={newEnrollment.level} onChange={(event) => setNewEnrollment({ ...newEnrollment, level: event.target.value })}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
          <Select label="Sihttase" value={newEnrollment.targetLevel} onChange={(event) => setNewEnrollment({ ...newEnrollment, targetLevel: event.target.value })}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
        </div>
        <div className="enrollment-editor__actions"><Button variant="secondary" loading={saving === 'new'} disabled={Boolean(saving)} onClick={add}><Plus size={16} /> Lisa õppesuund</Button></div>
      </section>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  </Modal>;
}
