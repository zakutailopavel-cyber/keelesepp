import { ChevronDown, ChevronUp, PanelsTopLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, EmptyState, Modal } from '../../components/ui/index.js';
import { lessonCopiesService } from '../../services/firebase/studentBoard.js';
import LessonBoardView from './LessonBoardView.jsx';
import { groupLessonCopies, lessonDateLabel } from './lessonBoards.js';
import './lessonBoards.css';

// one live list per student, merged
function useCopies(ids, service) {
  const [lists, setLists] = useState({});
  const key = ids.join('|');
  useEffect(() => {
    const stops = key.split('|').filter(Boolean).map((id) => {
      try { return service.subscribe(id, (items) => setLists((current) => ({ ...current, [id]: items })), () => {}); } catch { return () => {}; }
    });
    return () => stops.forEach((stop) => stop?.());
  }, [key, service]);
  return Object.values(lists).flat();
}

/**
 * „Tunni tahvlid” (student and parent): the board of every Live Classroom lesson as it was at the end, newest first,
 * by date and teacher; a page opens read-only. `names`: { studentId: name } when a parent has several children.
 */
export default function LessonBoardsCard({ studentIds = [], names = {}, limit = 8, service = lessonCopiesService }) {
  const lessons = groupLessonCopies(useCopies(studentIds, service));
  const [open, setOpen] = useState('');
  const [all, setAll] = useState(false);
  const [viewing, setViewing] = useState(null);
  const shown = all ? lessons : lessons.slice(0, limit);
  const expanded = open === '' ? shown[0]?.key || '' : open;
  return <Card>
    <div className="section-heading"><div><span className="eyebrow">Tunnid</span><h2>Tunni tahvlid</h2></div></div>
    {shown.length ? <div className="lb-list">{shown.map((lesson) => {
      const isOpen = expanded === lesson.key;
      const who = [lesson.teacher, studentIds.length > 1 ? names[lesson.studentId] : ''].filter(Boolean).join(' · ');
      const count = `${lesson.pages.length} ${lesson.pages.length === 1 ? 'leht' : 'lehte'}`;
      return <article key={lesson.key} className="lb-lesson">
        <button type="button" className="lb-lesson__head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? 'none' : lesson.key)}>
          <span><strong>{lessonDateLabel(lesson.at) || 'Tund'}</strong><small>{[who, count].filter(Boolean).join(' · ')}</small></span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isOpen ? <ul className="lb-pages">{lesson.pages.map((page) => <li key={page.id}>
          <button type="button" onClick={() => setViewing({ studentId: lesson.studentId, page, lesson })}><PanelsTopLeft size={15} aria-hidden="true" /> {page.title}</button>
        </li>)}</ul> : null}
      </article>;
    })}</div> : <EmptyState title="Tunni tahvleid veel ei ole" description="Pärast tundi jääb siia tunni tahvel, et saaksid märkmeid uuesti vaadata." />}
    {lessons.length > shown.length ? <button type="button" className="lb-more" onClick={() => setAll(true)}>Näita kõiki ({lessons.length})</button> : null}
    <Modal open={Boolean(viewing)} className="lb-modal" title={viewing ? [viewing.page.title, lessonDateLabel(viewing.lesson.at)].filter(Boolean).join(' · ') : ''} onClose={() => setViewing(null)}>
      {viewing ? <>
        <p className="lb-muted">Tahvel tunni lõpus{viewing.lesson.teacher ? ` · ${viewing.lesson.teacher}` : ''}. Seda saab ainult vaadata.</p>
        <LessonBoardView studentId={viewing.studentId} pageId={viewing.page.id} service={service} />
      </> : null}
    </Modal>
  </Card>;
}
