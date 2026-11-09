import { AlertTriangle, CheckCircle2, Pencil, Phone, UserMinus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { studentAvailabilityService } from '../../services/firebase/studentAvailability.js';
import { websiteLeadsService } from '../../services/firebase/websiteLeads.js';
import { timesFromLeads, withLeadTimes } from '../calendar/leadTimes.js';
import { ageOf, AUDIENCES } from './groupFill.js';
import { groupGaps, interestLabel } from './groupCheck.js';
import { INTEREST } from './groupContacts.js';

const DAYS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };

/** One group for the admin: every member with contacts and the offer status, and what the group still misses. */
export default function GroupDetailDialog({ group, members = [], saving = '', canEdit = false, onRemove, onFill, onEdit, onInterest, onClose, repositories = {} }) {
  const { times = studentAvailabilityService, leads = websiteLeadsService } = repositories;
  const timesState = useAsyncData(async () => {
    const [own, enquiries] = await Promise.all([times.list(null).catch(() => []), leads.list().catch(() => [])]);
    return withLeadTimes(new Map(own.map((entry) => [entry.studentId || entry.id, entry])), timesFromLeads(enquiries, members));
  }, [times, leads, members.map((student) => student.id).join(',')]);
  const studentTimes = timesState.data || new Map();
  const gaps = groupGaps(group, members, { studentTimes });
  const year = new Date().getFullYear();
  return (
    <Modal open title={group.name} onClose={onClose} className="modal--group-detail" footer={<>{canEdit && onEdit ? <Button variant="secondary" onClick={onEdit}><Pencil size={15} /> Muuda gruppi</Button> : null}{canEdit ? <Button variant="secondary" onClick={onFill}>Täida grupp</Button> : null}<Button onClick={onClose}>Valmis</Button></>}>
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
            <span className="group-contacts__who"><strong><Link to={`/students/${student.id}`}>{student.name}</Link>{student.active === false ? <> <Badge tone="warning">Arhiveeritud</Badge></> : null}</strong><small>{[age !== null ? `~${age} a` : '', student.level,studentTimes.get(student.id)?.slots?.length ? 'ajad teada' : 'ajad teadmata'].filter(Boolean).join(' · ')}</small></span>
            <span className="group-contacts__contact">{student.parentName ? <small>Vanem: {student.parentName}</small> : null}{phone ? <a href={`tel:${phone.replace(/\s/g, '')}`}><Phone size={13} /> {phone}</a> : null}{email ? <a href={`mailto:${email}`}>{email}</a> : null}</span>
            {/* the group offer answer: „Huvitatud” confirms the student's participation (admin bug 2026-11-03: the window
                only showed it, so the confirmation could not be given from the group) */}
            {/* 2026-11-06: the confirmation is also one clear button („Kinnita osalemine”), not only „Huvitatud” in the list */}
            <span>{canEdit && onInterest
              ? (student.groupInterest?.status === 'interested'
                ? <span className="group-detail__confirm"><CheckCircle2 size={14} /> Osalemine kinnitatud</span>
                : <Button variant="secondary" aria-label={`Kinnita osalemine: ${student.name}`} loading={saving === `interest:${student.id}`} disabled={Boolean(saving)} onClick={() => onInterest(student, 'interested')}><CheckCircle2 size={15} /> Kinnita osalemine</Button>)
              : null}{canEdit && onInterest
              ? <Select id={`gd-i-${student.id}`} label="" aria-label={`Osalemine: ${student.name}`} value={student.groupInterest?.status || ''} disabled={saving === `interest:${student.id}`} onChange={(event) => onInterest(student, event.target.value)}>{Object.entries(INTEREST).map(([value, label]) => <option key={value || 'none'} value={value}>{label}</option>)}</Select>
              : <Badge tone={student.groupInterest?.status === 'interested' ? 'success' : student.groupInterest?.status === 'declined' ? 'warning' : 'neutral'}>{interestLabel(student)}</Badge>}{student.groupInterest?.note ? <small className="group-detail__note">{student.groupInterest.note}</small> : null}</span>
            {canEdit ? <button type="button" className="text-button danger" aria-label={`Eemalda grupist: ${student.name}`} disabled={saving === `student:${student.id}`} onClick={() => onRemove(student)}><UserMinus size={16} /></button> : <span />}
          </div>;
        })}</div>
      </section>
    </Modal>
  );
}
