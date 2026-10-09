import { useEffect, useMemo, useState } from 'react';
import { Badge, Modal } from '../../components/ui/index.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { lessonSummariesService } from '../../services/firebase/lessonSummaries.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import LessonsCard from '../lesson-recording/TranscriptView.jsx';
import { dayKey, lessonTimeline } from '../lesson-recording/lessonTimeline.js';

// One lesson of the student card („Tunnid”) opened on its own: the mark, topic and notes, and everything from that day —
// homework given, the lesson summary, new words, the recording with its analysis and the board page.

const quiet = (subscribe) => {
  try { return subscribe(); } catch { return undefined; }
};

export default function LessonDetailModal({
  lesson, student, user, isAdmin = false, markLabel, onClose,
  homeworkApi = homeworkService, summaryApi = lessonSummariesService, wordsApi = studentWordsService,
  recordingApi = lessonRecordingsService, boardApi = studentBoardService,
}) {
  const day = lesson.date;
  const [homework, setHomework] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [words, setWords] = useState([]);
  const [recordings, setRecordings] = useState({ loading: true, error: '', items: [] });
  const [pages, setPages] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => homeworkApi.listByStudentIds([student.id])).then((items) => { if (alive) setHomework(items || []); }).catch(() => {});
    Promise.resolve().then(() => recordingApi.listForStudent({ studentId: student.id, user, isAdmin }))
      .then((items) => { if (alive) setRecordings({ loading: false, error: '', items: items || [] }); })
      .catch((error) => { if (alive) setRecordings({ loading: false, error: error.message || 'Salvestisi ei saanud laadida.', items: [] }); });
    const stops = [
      quiet(() => summaryApi.subscribeForStudent(student.id, setSummaries, () => setSummaries([]))),
      quiet(() => wordsApi.subscribeForStudent(student.id, setWords, () => setWords([]))),
      quiet(() => boardApi.subscribePages(student.id, setPages, () => setPages([]))),
    ];
    return () => { alive = false; stops.forEach((stop) => stop?.()); };
  }, [boardApi, homeworkApi, isAdmin, recordingApi, student.id, summaryApi, user, wordsApi]);

  const dayHomework = homework.filter((item) => (item.date || dayKey(item.createdAt)) === day);
  const daySummaries = summaries.filter((item) => dayKey(item.startedAt || item.endedAt) === day);
  const dayWords = words.filter((item) => dayKey(item.createdAt) === day);
  const rows = useMemo(() => lessonTimeline(recordings.items, pages).filter((row) => row.day === day), [day, pages, recordings.items]);
  const nothing = !dayHomework.length && !daySummaries.length && !dayWords.length && !rows.length && !recordings.loading;

  return (
    <Modal open title={`Tund ${day || ''}${lesson.time ? ` · ${lesson.time}` : ''}`} onClose={onClose} className="lesson-detail">
      <div className="lesson-detail__body">
        <dl className="detail-list">
          <div><dt>Staatus</dt><dd><Badge tone={lesson.verified ? 'success' : 'info'}>{markLabel}</Badge>{lesson.verified && lesson.verifiedByName ? <small> · kontrollis {lesson.verifiedByName}</small> : null}</dd></div>
          <div><dt>Õpetaja</dt><dd>{lesson.teacher || student.teacher || '—'}</dd></div>
          <div><dt>Õppeaine</dt><dd>{lesson.subject || student.subject || '—'}</dd></div>
          <div><dt>Kestus</dt><dd>{lesson.duration ? `${lesson.duration} min` : '—'}</dd></div>
          <div><dt>Teema</dt><dd>{[lesson.topic, lesson.topicLevel, lesson.topicModule].filter(Boolean).join(' · ') || '—'}</dd></div>
        </dl>
        {lesson.notes ? <section><h3>Märkmed</h3><p className="lesson-detail__note">{lesson.notes}</p></section> : null}
        {daySummaries.map((summary) => (
          <section key={summary.id}>
            <h3>Tunni kokkuvõte</h3>
            {summary.note ? <p className="lesson-detail__note">{summary.note}</p> : null}
            {summary.pages.length ? <p className="form-hint">Tahvlilehed: {summary.pages.map((page) => page.title || 'leht').join(', ')}</p> : null}
          </section>
        ))}
        {dayHomework.length ? (
          <section>
            <h3>Kodutöö</h3>
            <ul className="lesson-detail__list">{dayHomework.map((item) => <li key={item.id}><span>{item.task || item.title || 'Kodutöö'}</span><small>{[item.due ? `tähtaeg ${item.due}` : '', item.status].filter(Boolean).join(' · ')}</small></li>)}</ul>
          </section>
        ) : null}
        {dayWords.length ? (
          <section>
            <h3>Uued sõnad ({dayWords.length})</h3>
            <p className="lesson-detail__words">{dayWords.map((item) => [item.word, item.translation].filter(Boolean).join(' – ')).join(' · ')}</p>
          </section>
        ) : null}
        {rows.length || recordings.error ? <LessonsCard rows={rows} studentId={student.id} loading={false} error={recordings.error} inline /> : null}
        {recordings.loading ? <p className="form-hint">Laen tunni materjale…</p> : null}
        {nothing ? <p className="form-hint">Selle päeva kohta pole kodutööd, kokkuvõtet, sõnu ega salvestist.</p> : null}
      </div>
    </Modal>
  );
}
