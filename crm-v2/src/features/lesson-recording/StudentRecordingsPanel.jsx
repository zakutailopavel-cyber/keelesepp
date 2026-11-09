import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mic } from 'lucide-react';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { lessonMomentsService } from '../../services/firebase/lessonMoments.js';
import LessonsCard from './TranscriptView.jsx';
import { lessonTimeline } from './lessonTimeline.js';
import LessonTrendCard from './LessonTrendCard.jsx';

// Student card → „Areng”: the recorded lessons with their text. The recording consent is set in the student's form
// („Muuda” → „Tundi võib salvestada”).
export default function StudentRecordingsPanel({ student, user, isAdmin = false, service = lessonRecordingsService, boardService = studentBoardService, momentsService = lessonMomentsService }) {
  const [state, setState] = useState({ loading: true, error: '', items: [] });
  // „Hetk” marks from the room (a failed load only leaves them out)
  const [moments, setMoments] = useState([]);

  const load = useCallback(() => {
    Promise.resolve().then(() => { setState((s) => ({ ...s, loading: true, error: '' })); return service.listForStudent({ studentId: student.id, user, isAdmin }); })
      .then((items) => setState({ loading: false, error: '', items }))
      .catch((err) => setState({ loading: false, error: err.message || 'Salvestisi ei saanud laadida.', items: [] }));
    Promise.resolve().then(() => momentsService?.listForStudent?.({ studentId: student.id, user, isAdmin }) || [])
      .then((items) => setMoments(items || [])).catch(() => setMoments([]));
  }, [isAdmin, momentsService, service, student.id, user]);
  useEffect(() => { load(); }, [load]);
  // board lesson pages, so every lesson row can open its own page of the board
  const [pages, setPages] = useState([]);
  useEffect(() => {
    try { return boardService.subscribePages(student.id, setPages, () => setPages([])); } catch { return undefined; }
  }, [boardService, student.id]);
  const rows = useMemo(() => lessonTimeline(state.items, pages, moments), [moments, pages, state.items]);
  // „Areng tundide kaupa”: the same lessons (marks of „Pole viga” already applied)
  const lessons = useMemo(() => rows.map((row) => row.recording).filter(Boolean), [rows]);

  return (
    <>
      {student.recordingConsent === true ? null : <p className="form-hint profile-wide"><Mic size={15} aria-hidden="true" /> Tundi ei salvestata: nõusolekut pole. Selle saab märkida nupu „Muuda” all.</p>}
      <LessonTrendCard lessons={lessons} className="profile-wide" />
      <div className="profile-wide"><LessonsCard rows={rows} studentId={student.id} loading={state.loading} error={state.error} onReload={load} transcriberService={service} /></div>
    </>
  );
}
