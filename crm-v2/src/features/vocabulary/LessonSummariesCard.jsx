import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, EmptyState } from '../../components/ui/index.js';
import { homeworkService as defaultHomework } from '../../services/firebase/homework.js';
import { lessonSummariesService } from '../../services/firebase/lessonSummaries.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import './vocabulary.css';

const when = (iso) => {
  const date = new Date(iso || '');
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// one live list per student, merged; `service.subscribeForStudent(id, onData, onError)`
function useSubscribedLists(ids, service) {
  const [lists, setLists] = useState({});
  const key = ids.join('|');
  useEffect(() => {
    const stops = key.split('|').filter(Boolean).map((id) => {
      try { return service.subscribeForStudent(id, (items) => setLists((current) => ({ ...current, [id]: items })), () => {}); } catch { return () => {}; }
    });
    return () => stops.forEach((stop) => stop?.());
  }, [key, service]);
  return Object.values(lists).flat();
}

function SummaryDetails({ summary, words, homeworkService, boardLink }) {
  const [homework, setHomework] = useState(null);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => homeworkService.listForLesson?.({ studentId: summary.studentId, invitationId: summary.invitationId }) || [])
      .then((items) => { if (alive) setHomework(items); }).catch(() => { if (alive) setHomework([]); });
    return () => { alive = false; };
  }, [homeworkService, summary.invitationId, summary.studentId]);
  const lessonWords = words.filter((item) => item.invitationId === summary.invitationId);
  return (
    <div className="vw-summary__body">
      {summary.note ? <p className="vw-summary__note">{summary.note}</p> : null}
      {summary.pages.length ? <><h4>Tahvli lehed</h4><ul className="vw-links">{summary.pages.map((page) => <li key={page.id}><Link to={boardLink(summary, page)}>{page.title || 'Leht'}</Link></li>)}</ul></> : null}
      <h4>Uued sõnad ({lessonWords.length})</h4>
      {lessonWords.length ? <ul className="vw-list">{lessonWords.map((item) => <li key={item.id}><span><strong>{item.word}</strong>{item.translation ? <> — {item.translation}</> : null}</span></li>)}</ul> : <p className="vw-muted">Selles tunnis sõnu ei lisatud.</p>}
      <h4>Kodutöö</h4>
      {homework === null ? <p className="vw-muted">Laen…</p> : homework.length ? <ul className="vw-list">{homework.map((item) => <li key={item.id}><span><strong>{item.task}</strong><small>{item.due ? `Tähtaeg ${item.due}` : 'Tähtajata'}</small></span></li>)}</ul> : <p className="vw-muted">Kodutööd ei antud.</p>}
    </div>
  );
}

/** Student and parent dashboards: „Tunni kokkuvõtted” of Live Classroom lessons, newest first. */
export default function LessonSummariesCard({
  studentIds = [], limit = 5,
  summaryService = lessonSummariesService, wordsService = studentWordsService, homeworkService = defaultHomework,
}) {
  const summaries = useSubscribedLists(studentIds, summaryService);
  const words = useSubscribedLists(studentIds, wordsService);
  const [open, setOpen] = useState('');
  const list = [...summaries].sort((a, b) => String(b.endedAt).localeCompare(String(a.endedAt))).slice(0, limit);
  const latest = list[0]?.id || '';
  const expanded = open === '' ? latest : open;
  // students and parents open the child's own board (/board), straight on that lesson page
  const boardLink = (summary, page) => `/board?page=${encodeURIComponent(page.id)}`;

  return (
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Tunnid</span><h2>Tunni kokkuvõtted</h2></div></div>
      {list.length ? <div className="vw-summaries">{list.map((summary) => {
        const isOpen = expanded === summary.id;
        return <article key={summary.id} className="vw-summary">
          <button type="button" className="vw-summary__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? 'none' : summary.id)}>
            <span><strong>{summary.title || summary.subject || 'Tund'}</strong><small>{[when(summary.endedAt || summary.startedAt), summary.teacherName].filter(Boolean).join(' · ')}</small></span>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {isOpen ? <SummaryDetails summary={summary} words={words} homeworkService={homeworkService} boardLink={boardLink} /> : null}
        </article>;
      })}</div> : <EmptyState title="Kokkuvõtteid veel ei ole" description="Pärast Live Classroomi tundi ilmub siia, mida tunnis tehti." />}
    </Card>
  );
}
