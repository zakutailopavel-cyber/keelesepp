import { Layers, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import { enrollmentKey } from '../../services/firebase/students.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { canonicalTeacherName } from '../../utils/teachers.js';
import { directionRows, priceLabel, statusPatch } from './studentDirectionsModel.js';
import { groupsService } from '../../services/firebase/groups.js';
import { FormatBadge } from './DirectionFormat.jsx';
import './directions.css';

const day = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}` : '');

// „Õppesuunad” on the student card (owner 2026-10-24): every direction the learner attends, with its teacher, level,
// price and whether lessons are planned ahead; the administrator pauses, ends or resumes one here and edits it in
// the „Õppesuunad” window
// „Individuaalne / Grupp” (2026-11-18): a badge per direction; a track without a stored format shows „Grupp?” when the
// card is in a calendar group of that subject (staff only: the groups are read for the administrator)
export default function StudentDirectionsCard({ student, schedule = [], lessons = [], plan = null, directions = [], groups: givenGroups, groupService = groupsService, canEdit = false, canViewFinance = false, service, onEdit, onChanged, today }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [loadedGroups, setLoadedGroups] = useState([]);
  useEffect(() => {
    if (givenGroups || !canEdit) return undefined;
    let alive = true;
    Promise.resolve().then(() => groupService.list()).then((list) => { if (alive) setLoadedGroups(Array.isArray(list) ? list : []); }).catch(() => {});
    return () => { alive = false; };
  }, [canEdit, givenGroups, groupService]);
  const groups = givenGroups || loadedGroups;
  const rows = directionRows({ student, schedule, lessons, plan, directions, groups, ...(today ? { today } : {}) });

  const setStatus = async (row, value) => {
    setBusy(`${row.id}:${value}`); setError('');
    try {
      await service.updateEnrollment(student.id, enrollmentKey(row.track), { ...row.track, ...statusPatch(value) });
      await onChanged?.();
    } catch (err) { setError(firebaseErrorMessage(err)); } finally { setBusy(''); }
  };

  return (
    <Card className="student-directions">
      <div className="student-directions__head"><h2>Õppesuunad</h2>{canEdit ? <Button variant="secondary" onClick={() => onEdit?.()}><Plus size={16} /> Lisa / muuda</Button> : null}</div>
      <ul className="student-directions__list">
        {rows.map((row) => (
          <li key={row.id} className={`student-directions__row is-${row.state}`}>
            <span className="student-directions__dot" style={row.color ? { background: row.color } : undefined} aria-hidden="true">{row.shortLabel || row.subject.slice(0, 2).toUpperCase()}</span>
            <div className="student-directions__main">
              <span className="student-directions__title"><strong>{row.subject}{row.known ? '' : <small className="student-directions__unknown"> (pole loendis)</small>}</strong> <FormatBadge format={row.format} inferred={row.formatInferred} />{row.format === 'group' && row.groupId && groups.some((group) => group.id === row.groupId) ? <small>{groups.find((group) => group.id === row.groupId).name}</small> : null}</span>
              <span>{canonicalTeacherName(row.teacher) || 'õpetaja määramata'}{row.level ? ` · ${row.level}` : ''}{row.targetLevel ? ` → ${row.targetLevel}` : ''}</span>
              <span className="student-directions__when">{row.next ? (row.next.weekly ? `Iga nädal${row.next.time ? ` kell ${row.next.time}` : ''}` : `Järgmine tund ${day(row.next.date)}${row.next.time ? ` kell ${row.next.time}` : ''}${row.upcomingCount > 1 ? ` · ${row.upcomingCount} tundi 8 nädala jooksul` : ''}`) : row.lastLesson ? `Viimane tund ${day(row.lastLesson)}` : 'Tunde pole olnud'}</span>
              {canViewFinance ? <span className={row.price.kind === 'none' || row.price.kind === 'fallback' ? 'student-directions__price is-missing' : 'student-directions__price'}>{row.format === 'group' ? 'Grupi hind' : 'Hind'}: {priceLabel(row.price)}</span> : null}
            </div>
            <div className="student-directions__side">
              <Badge tone={row.tone}>{row.stateLabel}</Badge>
              {canEdit ? <div className="student-directions__actions">
                {row.status === 'active' ? <Button variant="secondary" loading={busy === `${row.id}:paused`} disabled={Boolean(busy)} onClick={() => setStatus(row, 'paused')}>Paus</Button> : null}
                {row.status !== 'active' ? <Button variant="secondary" loading={busy === `${row.id}:active`} disabled={Boolean(busy)} onClick={() => setStatus(row, 'active')}>{row.status === 'ended' ? 'Ava uuesti' : 'Jätka'}</Button> : null}
                {row.status !== 'ended' ? <Button variant="secondary" loading={busy === `${row.id}:ended`} disabled={Boolean(busy)} onClick={() => setStatus(row, 'ended')}>Lõpeta</Button> : null}
              </div> : null}
            </div>
          </li>
        ))}
      </ul>
      {!rows.length ? <p className="form-hint"><Layers size={15} /> Õppesuundi pole.</p> : null}
      {canEdit ? <p className="form-hint">„Käib” = 8 nädala jooksul on tunde plaanis. „Paus” jätab õpetajale ligipääsu, „Lõpetanud” sulgeb suuna (ajalugu jääb).{canViewFinance ? ' Hinda muudad vahekaardil Finantsid → Arveldus.' : ''}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </Card>
  );
}
