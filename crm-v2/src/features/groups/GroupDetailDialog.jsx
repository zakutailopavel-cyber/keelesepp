import { AlertTriangle, CheckCircle2, Phone, UserMinus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Modal } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { studentAvailabilityService, websiteLeadsService } from '../../services/firebase/index.js';
import { timesFromLeads, withLeadTimes } from '../calendar/leadTimes.js';
import { ageOf, AUDIENCES } from './groupFill.js';
import { groupGaps, interestLabel } from './groupCheck.js';

const DAYS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };

/** One group for the admin: every member with contacts and the offer status, and what the group still misses. */
export default function GroupDetailDialog({ group, members = [], saving = '', canEdit = false, onRemove, onFill, onClose, repositories = {} }) {
  const { times = studentAvailabilityService, leads = websiteLeadsService } = repositories;
  const timesState = useAsyncData(async () => {
    const [own, enquiries] = await Promise.all([times.list(null).catch(() => []), leads.list().catch(() => [])]);
    return withLeadTimes(new Map(own.map((entry) => [entry.studentId || entry.id, entry])), timesFromLeads(enquiries, members));
  }, [times, leads, members.map((student) => student.id).join(',')]);
  const studentTimes = timesState.data || new Map();
  const gaps = groupGaps(group, members, { studentTimes });
  const year = new Date().getFullYear();
  return (
    <Modal open title={group.name} onClose={onClose} className="modal--group-detail" footer={<>{canEdit ? <Button variant="secondary" onClick={onFill}>Täida grupp</Button> : null}<Button onClick={onClose}>Valmis</Button></>}>
      <p className="form-hint">{[group.subject, group.level, group.audience ? AUDIENCES[group.audience] : '', group.teacher, (group.lessons || []).map((lesson) => `${DAYS[lesson.day] || lesson.day} ${lesson.time}`).join(', ')].filter(Boolean).join(' · ')}</p>
      <section className="group-detail__gaps" aria-label="Mis puudub">
        <h3>Mis puudub</h3>
        <ul>{gaps.map((item) => <li key={item.key} className={item.ok ? 'is-ok' : 'is-open'}>{item.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />} {item.text}</li>)}</ul>
      </section>
      <section aria-label="Grupi õpilased">
        <h3>Õpilased ({members.length})</h3>
        <div className="group-contacts__list">{members.map((student) => {
          const age = ageOf(student, year);
          const phone = student.parentPhone || student.phone || '';
          const email = student.parentEmail || student.email || '';
          return <div className="group-detail__row" key={student.id}>
            <span className="group-contacts__who"><strong><Link to={`/students/${student.id}`}>{student.name}</Link></strong><small>{[age !== null ? `~${age} a` : '', student.level, student.active === false ? 'arhiivis' : '', studentTimes.get(student.id)?.slots?.length ? 'ajad teada' : 'ajad teadmata'].filter(Boolean).join(' · ')}</small></span>
            <span className="group-contacts__contact">{student.parentName ? <small>Vanem: {student.parentName}</small> : null}{phone ? <a href={`tel:${phone.replace(/\s/g, '')}`}><Phone size={13} /> {phone}</a> : null}{email ? <a href={`mailto:${email}`}>{email}</a> : null}</span>
            <span><Badge tone={student.groupInterest?.status === 'interested' ? 'success' : student.groupInterest?.status === 'declined' ? 'warning' : 'neutral'}>{interestLabel(student)}</Badge>{student.groupInterest?.note ? <small className="group-detail__note">{student.groupInterest.note}</small> : null}</span>
            {canEdit ? <button type="button" className="text-button danger" aria-label={`Eemalda grupist: ${student.name}`} disabled={saving === `student:${student.id}`} onClick={() => onRemove(student)}><UserMinus size={16} /></button> : <span />}
          </div>;
        })}</div>
      </section>
    </Modal>
  );
}
