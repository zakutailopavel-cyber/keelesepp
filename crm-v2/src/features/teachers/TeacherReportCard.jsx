import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, lessonsService } from '../../services/firebase/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { teacherReport } from './teacherReport.js';

const api = {
  lessons: () => lessonsService.listForCalendar({}),
  words: (ids) => studentWordsService.listForStudentIds(ids),
  assignments: (ids) => homeworkService.listWorksheetAssignmentsByStudentIds(ids),
};
const cell = (value, suffix = '') => (value === null || value === undefined ? '—' : `${value}${suffix}`);

// „Õpetajate võrdlus” (teacherReport.js) — rendered only for an administrator (TeachersPage)
export default function TeacherReportCard({ teachers = [], students = [], repository = api }) {
  const ids = useMemo(() => students.map((student) => student.id), [students]);
  const state = useAsyncData(async () => {
    const settle = (load) => Promise.resolve().then(load).catch(() => []);
    const [lessons, words, assignments] = await Promise.all([settle(() => repository.lessons()), settle(() => repository.words(ids)), settle(() => repository.assignments(ids))]);
    return { lessons, words, assignments };
  }, [repository, ids]);
  const rows = useMemo(() => (state.data ? teacherReport({ teachers, students, ...state.data }) : []), [state.data, teachers, students]);
  return <Card className="teacher-report">
    <div className="section-heading"><div><span className="eyebrow"><BarChart3 size={14} aria-hidden="true" /> Ainult administraatorile · 30 päeva</span><h2>Õpetajate võrdlus</h2></div></div>
    {state.loading && !state.data ? <p className="form-hint">Arvutan…</p> : rows.length ? <div className="students-table-wrap"><table className="students-table" aria-label="Õpetajate võrdlus">
      <thead><tr><th>Õpetaja</th><th className="num">Õpilasi</th><th className="num">Tunde</th><th className="num">Ära jäänud</th><th className="num">Harjutab ise</th><th className="num">Töölehed</th><th className="num">Uusi sõnu õpilase kohta</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}>
        <td><strong>{row.name}</strong></td><td className="num">{row.students}</td><td className="num">{row.held}</td><td className="num">{cell(row.missedRate, '%')}</td>
        <td className="num">{cell(row.practising, '%')}</td><td className="num">{row.sheets ? `${row.sheets} · ${cell(row.sheetScore, '%')}` : '—'}</td><td className="num">{cell(row.newWordsPerStudent)}</td>
      </tr>)}</tbody></table></div> : <p className="form-hint">Andmeid veel ei ole.</p>}
    <p className="form-hint">„Harjutab ise”: õpilased, kes kordasid sõnu viimase 14 päeva jooksul (neist, kellel on sõnu). „—”: liiga vähe andmeid õiglaseks võrdluseks.</p>
  </Card>;
}
