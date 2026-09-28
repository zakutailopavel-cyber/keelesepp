import { CalendarCheck2, CalendarDays, GraduationCap, Mail, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { scheduleService, studentsService, teachersService } from '../../services/firebase/index.js';
import { isSameTeacher } from '../../utils/teachers.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';

export default function TeachersPage({ teacherRepository = teachersService, studentRepository = studentsService, scheduleRepository = scheduleService }) {
  const [query, setQuery] = useState('');
  const state = useAsyncData(async () => Promise.all([teacherRepository.list(), studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true }), scheduleRepository.list()]), [teacherRepository, studentRepository, scheduleRepository]);
  const filtered = useMemo(() => (state.data?.[0] || []).filter((teacher) => `${teacher.name} ${teacher.email || ''}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))), [state.data, query]);
  if (state.loading) return <LoadingState label="Laen õpetajaid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const [teachers, students, schedule] = state.data; const today = toIsoDate(); const upcomingDates = Array.from({ length: 30 }, (_, index) => shiftDate(today, index)); const scheduleOccurrences = occurrencesForDates(schedule, upcomingDates);
  const activeTeachers = teachers.filter((teacher) => !teacher.disabled).length;
  const assignedStudents = students.items.filter((student) => student.teacherUid || student.teacher).length;
  return <div className="page-content"><PageHeader eyebrow="Meeskond" title="Õpetajad" description="Õpetajate profiilid, õpilased ja lähinädala koormus." />
    <PeopleOverview label="Õpetajate kokkuvõte" eyebrow="Meeskonna ülevaade" title="Õpetajate töökoormus" description="Aktiivne meeskond, õpilased ja lähima 30 päeva tunnid ühes vaates." metrics={[
      { icon: ShieldCheck, label: 'Aktiivsed', value: activeTeachers, hint: `${teachers.length} kontot kokku` },
      { icon: GraduationCap, label: 'Õpilasi', value: assignedStudents, hint: 'õpetajaga seotud' },
      { icon: CalendarDays, label: 'Lähitunnid', value: scheduleOccurrences.length, hint: '30 päeva jooksul' },
      { icon: CalendarCheck2, label: 'Täna', value: scheduleOccurrences.filter((item) => item.occurrenceDate === today).length, hint: 'planeeritud tundi' },
    ]} />
    <Card className="teacher-search people-directory-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi õpetajat" placeholder="Otsi nime või e-posti järgi" value={query} onChange={(e) => setQuery(e.target.value)} /></div></Card>
    {filtered.length ? <div className="teacher-grid">{filtered.map((teacher) => { const ownStudents = students.items.filter((student) => student.teacherUid === teacher.id || isSameTeacher(student.teacher, teacher.name)); const lessons = scheduleOccurrences.filter((item) => item.teacherUid === teacher.id || isSameTeacher(item.teacher, teacher.name)); return <Link className="teacher-card-link" to={`/teachers/${teacher.id}`} key={teacher.id}><Card className="teacher-card"><div className="teacher-card__head"><div className="teacher-avatar">{teacher.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><h2>{teacher.name}</h2><Badge tone={teacher.disabled ? 'danger' : 'success'}>{teacher.disabled ? 'Peatatud' : teacher.role === 'admin' ? 'Administraator' : 'Aktiivne'}</Badge></div></div><span className="teacher-email"><Mail size={16} /> {teacher.email || 'E-post puudub'}</span><div className="teacher-stats"><div><GraduationCap size={19} /><strong>{ownStudents.length}</strong><span>õpilast</span></div><div><CalendarDays size={19} /><strong>{lessons.length}</strong><span>järgmise 30 päeva tundi</span></div></div></Card></Link>; })}</div> : <EmptyState title="Õpetajaid ei leitud" />}
  </div>;
}
