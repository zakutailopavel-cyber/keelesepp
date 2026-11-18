import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import { enrollmentKey } from '../../services/firebase/students.js';
import { groupsService } from '../../services/firebase/groups.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { isSameTeacher } from '../../utils/teachers.js';
import { canonicalSubject } from './studyDirections.js';
import { subjectName } from './subjects.js';
import SubjectSelect, { LevelSelect } from './SubjectSelect.jsx';
import { useStudyDirections } from './useStudyDirections.js';

import { TRACK_STATUSES, statusOf, statusPatch } from './studentDirectionsModel.js';
import { formatOf, trackFormat } from './directionFormat.js';
import { FormatBadge, FormatSwitch, GroupLinkSelect } from './DirectionFormat.jsx';

const NEW_ENROLLMENT = { subject: '', level: 'A1', targetLevel: 'B1', teacher: '', active: true, format: 'individual', groupId: '' };
// the stored shape of a format choice: only a group track stores its format (and its calendar group, when chosen)
const formatPatch = (draft) => (formatOf(draft.format) === 'group' ? { format: 'group', groupId: draft.groupId || '' } : { format: 'individual', groupId: '' });

// „Õppesuunad” of one child (owner 2026-10-20, Oleksiy 2026-10-24): several subjects with their own teacher and level
// on ONE card. Opened from the list „Õpilased” and from the student's card. Adding a subject never creates a card.
// The price of a further subject is set in Finantsid → Arveldus (studentRevenuePlans.subjectPrices).
// „Individuaalne / Grupp” (team 2026-11-18): every direction has a format; Eesti keel individually and Eesti keel in a
// group are two directions with their own price and lesson package (directionFormat.js). A group may name its calendar
// group. A track without a stored format reads as individual, or as „Grupp?” when the card is in a calendar group of
// that subject — saving it stores what the window shows.
export default function EnrollmentManager({ student, teachers, service, onClose, onChanged, onAdded, directions: givenDirections, groups: givenGroups, groupService = groupsService }) {
  const loadedDirections = useStudyDirections();
  const directions = givenDirections || loadedDirections;
  const [loadedGroups, setLoadedGroups] = useState([]);
  const groups = givenGroups || loadedGroups;
  useEffect(() => {
    if (givenGroups || !student) return undefined;
    let alive = true;
    // the calendar groups only help (link + „Grupp?”); without them the window works the same
    Promise.resolve().then(() => groupService.list()).then((list) => { if (alive) setLoadedGroups(Array.isArray(list) ? list : []); }).catch(() => {});
    return () => { alive = false; };
  }, [givenGroups, groupService, student]);
  const readFormat = (item) => trackFormat(item, { student, groups });
  const [drafts, setDrafts] = useState(() => Object.fromEntries((student?.enrollments || []).map((item) => [item.id, { ...item }])));
  const [newEnrollment, setNewEnrollment] = useState(NEW_ENROLLMENT);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  // a track added after the window opened has no draft yet: start from the track itself
  const updateDraft = (enrollment, field, value) => setDrafts((current) => ({ ...current, [enrollment.id]: { ...(current[enrollment.id] || enrollment), [field]: value } }));

  const saveExisting = async (enrollment) => {
    const draft = drafts[enrollment.id] || enrollment;
    if (!draft?.subject?.trim()) { setError('Õppeaine on kohustuslik.'); return; }
    setSaving(enrollment.id); setError('');
    try {
      const recordIds = enrollment.sourceRecordIds?.length ? enrollment.sourceRecordIds : [student.id];
      const read = readFormat(enrollment);
      const format = formatPatch({ format: draft.format || read.format, groupId: draft.groupId ?? read.groupId });
      await Promise.all(recordIds.map((recordId) => service.updateEnrollment(recordId, enrollmentKey(enrollment), { ...draft, ...format, subject: canonicalSubject(draft.subject, directions) })));
      await onChanged();
    } catch (err) { setError(firebaseErrorMessage(err)); }
    finally { setSaving(''); }
  };

  const add = async () => {
    const subject = canonicalSubject(newEnrollment.subject, directions);
    if (!subject) { setError('Vali õppesuund.'); return; }
    // the same subject, teacher AND format is one direction; the other format of the subject is a new one
    const format = formatOf(newEnrollment.format);
    const same = (student?.enrollments || []).find((item) => item.active !== false && canonicalSubject(subjectName(item.subject), directions) === subject && readFormat(item).format === format && (item.teacher || newEnrollment.teacher ? isSameTeacher(item.teacher, newEnrollment.teacher) : true));
    if (same) { setError(`${subject} (${format === 'group' ? 'grupp' : 'individuaalne'}) on sellel kaardil juba olemas. Muuda olemasolevat õppesuunda.`); return; }
    setSaving('new'); setError('');
    try {
      const { format: _format, groupId: _groupId, ...rest } = newEnrollment;
      const added = { ...rest, subject, ...(format === 'group' ? formatPatch(newEnrollment) : {}) };
      await service.addEnrollment(student.id, added);
      setNewEnrollment(NEW_ENROLLMENT);
      await onChanged();
      onAdded?.(added);
    } catch (err) { setError(firebaseErrorMessage(err)); }
    finally { setSaving(''); }
  };

  return <Modal open={Boolean(student)} title={student ? `Õppesuunad: ${student.name}` : 'Õppesuunad'} onClose={saving ? () => {} : onClose} className="modal--enrollments" footer={<Button variant="secondary" disabled={Boolean(saving)} onClick={onClose}>Valmis</Button>}>
    <div className="enrollment-manager">
      <p className="form-hint">Üks laps võib õppida mitut ainet eri õpetajatega ühel kaardil. Ära loo teise aine jaoks uut kaarti: lisa siia uus õppesuund. Muudatus ei muuda varasemat ajalugu. Uue aine tunnihinna saab määrata Finantsid → Arveldus. Õppesuundade loendit muudad Seaded → Õppesuunad.</p>
      <p className="form-hint">Vorm: <strong>Individuaalne</strong> või <strong>Grupp</strong>. Sama aine võib olla mõlemas vormis — kumbki saab oma hinna ja oma tunnipaketi (Finantsid → Arveldus / Tunnipakett). Grupitund (kalendrigrupi tund) arveldatakse grupi hinnaga.</p>
      <div className="enrollment-manager__list">{(student?.enrollments || []).map((enrollment) => {
        const draft = drafts[enrollment.id] || enrollment;
        const read = readFormat(enrollment);
        const format = formatOf(draft.format || read.format);
        const groupId = draft.groupId ?? read.groupId;
        return <section className="enrollment-editor" key={enrollment.id}>
          <div className="enrollment-editor__title"><span className="student-directions__title"><strong>{enrollment.subject || 'Õppesuund'}</strong> <FormatBadge format={format} inferred={read.inferred && !draft.format} /></span><Badge tone={statusOf(draft) === 'active' ? 'success' : 'neutral'}>{TRACK_STATUSES.find((item) => item.value === statusOf(draft)).label}</Badge></div>
          <div className="enrollment-editor__grid">
            <FormatSwitch name={`format-${enrollment.id}`} value={format} onChange={(value) => updateDraft(enrollment, 'format', value)} />
            {read.inferred && !draft.format ? <p className="direction-format-hint">Õpilane on selle aine kalendrigrupis, seepärast on vorm „Grupp”. Salvesta, et see kinnitada, või vali „Individuaalne”.</p> : null}
            <SubjectSelect directions={directions} value={draft.subject || ''} onChange={(event) => updateDraft(enrollment, 'subject', event.target.value)} />
            <Select label="Õpetaja" value={draft.teacher || ''} onChange={(event) => updateDraft(enrollment, 'teacher', event.target.value)}><option value="">Määramata</option>{[...new Set([...teachers, draft.teacher].filter(Boolean))].map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select>
            <LevelSelect label="Praegune tase" directions={directions} subject={draft.subject} value={draft.level || ''} onChange={(event) => updateDraft(enrollment, 'level', event.target.value)} />
            <LevelSelect label="Sihttase" directions={directions} subject={draft.subject} value={draft.targetLevel || ''} onChange={(event) => updateDraft(enrollment, 'targetLevel', event.target.value)} />
            <Select label="Staatus" value={statusOf(draft)} onChange={(event) => { const patch = statusPatch(event.target.value); setDrafts((current) => ({ ...current, [enrollment.id]: { ...(current[enrollment.id] || enrollment), ...patch } })); }}>{TRACK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
            {format === 'group' ? <GroupLinkSelect value={groupId} groups={groups} subject={draft.subject} onChange={(value) => updateDraft(enrollment, 'groupId', value)} /> : null}
          </div>
          <div className="enrollment-editor__actions"><Button loading={saving === enrollment.id} disabled={Boolean(saving)} onClick={() => saveExisting(enrollment)}>Salvesta õppesuund</Button></div>
        </section>;
      })}</div>
      <section className="enrollment-editor enrollment-editor--new">
        <div className="enrollment-editor__title"><strong>Lisa uus õppesuund</strong></div>
        <div className="enrollment-editor__grid">
          <FormatSwitch name="format-new" value={newEnrollment.format} onChange={(value) => setNewEnrollment({ ...newEnrollment, format: value })} />
          <SubjectSelect directions={directions} value={newEnrollment.subject} onChange={(event) => setNewEnrollment({ ...newEnrollment, subject: event.target.value, level: '', targetLevel: '' })} />
          <Select label="Õpetaja" value={newEnrollment.teacher} onChange={(event) => setNewEnrollment({ ...newEnrollment, teacher: event.target.value })}><option value="">Määramata</option>{teachers.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select>
          <LevelSelect label="Praegune tase" directions={directions} subject={newEnrollment.subject} value={newEnrollment.level} onChange={(event) => setNewEnrollment({ ...newEnrollment, level: event.target.value })} />
          <LevelSelect label="Sihttase" directions={directions} subject={newEnrollment.subject} value={newEnrollment.targetLevel} onChange={(event) => setNewEnrollment({ ...newEnrollment, targetLevel: event.target.value })} />
          {formatOf(newEnrollment.format) === 'group' ? <GroupLinkSelect value={newEnrollment.groupId} groups={groups} subject={newEnrollment.subject} onChange={(value) => setNewEnrollment({ ...newEnrollment, groupId: value })} /> : null}
        </div>
        <div className="enrollment-editor__actions"><Button variant="secondary" loading={saving === 'new'} disabled={Boolean(saving)} onClick={add}><Plus size={16} /> Lisa õppesuund</Button></div>
      </section>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  </Modal>;
}
