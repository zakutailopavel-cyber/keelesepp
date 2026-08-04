import { CalendarDays, GraduationCap, Mail, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
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
  const [, students, schedule] = state.data; const today = toIsoDate(); const upcomingDates = Array.from({ length: 30 }, (_, index) => shiftDate(today, index)); const scheduleOccurrences = occurrencesForDates(schedule, upcomingDates);
  return <div className="page-content"><PageHeader eyebrow="Meeskond" title="Õpetajad" description="Õpetajate profiilid, õpilased ja lähinädala koormus." /><Card className="teacher-search"><div className="search-field"><Search size={18} /><input aria-label="Otsi õpetajat" placeholder="Otsi nime või e-posti järgi" value={query} onChange={(e) => setQuery(e.target.value)} /></div></Card>
    {filtered.length ? <div className="teacher-grid">{filtered.map((teacher) => { const ownStudents = students.items.filter((student) => student.teacherUid === teacher.id || isSameTeacher(student.teacher, teacher.name)); const lessons = scheduleOccurrences.filter((item) => item.teacherUid === teacher.id || isSameTeacher(item.teacher, teacher.name)); return <Link className="teacher-card-link" to={`/teachers/${teacher.id}`} key={teacher.id}><Card className="teacher-card"><div className="teacher-card__head"><div className="teacher-avatar">{teacher.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><h2>{teacher.name}</h2><Badge tone={teacher.disabled ? 'danger' : 'success'}>{teacher.disabled ? 'Peatatud' : teacher.role === 'admin' ? 'Administraator' : 'Aktiivne'}</Badge></div></div><span className="teacher-email"><Mail size={16} /> {teacher.email || 'E-post puudub'}</span><div className="teacher-stats"><div><GraduationCap size={19} /><strong>{ownStudents.length}</strong><span>õpilast</span></div><div><CalendarDays size={19} /><strong>{lessons.length}</strong><span>järgmise 30 päeva tundi</span></div></div></Card></Link>; })}</div> : <EmptyState title="Õpetajaid ei leitud" />}
  </div>;
}
