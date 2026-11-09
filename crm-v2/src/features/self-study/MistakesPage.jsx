import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { ArrowRight, Bookmark, Play, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { studentsService } from '../../services/firebase/students.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { studentNotesService } from '../../services/firebase/studentNotes.js';
import { INK_BOX } from '../board/bookmarkModel.js';
import { presenceService } from '../../services/firebase/presence.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { buildReview, ownErrors } from './reviewModel.js';
import { readDone, saveDone } from './reviewStore.js';
import ReviewDrill from './ReviewDrill.jsx';
import './selfStudy.css';
import { localDate } from '../../utils/localDate.js';

/**
 * „Minu vead” (owner 2026-10-12: a student has four things to do — tasks, words, my mistakes, the pet): the sentences
 * the student said wrong in lessons (the teacher saves them with „Pärast tundi”, word cards „Sinu lause: …”). A short
 * drill — choose the right sentence, put it together — and the list „you said → right”.
 */
// a note from the board's „Järjehoidja / Kleebis”: handwriting (if any) and text on its paper colour
function BoardNote({ note, canDelete, onDelete }) {
  const date = note.createdAt ? new Date(note.createdAt).toLocaleDateString('et-EE', { day: 'numeric', month: 'long' }) : '';
  return <article className="ss-note" style={{ background: note.color }}>
    {note.ink.length ? <svg viewBox={`0 0 ${INK_BOX.w} ${INK_BOX.h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Käsitsi kirjutatud märge">
      {note.ink.map((item, index) => <path key={index} d={item.d} stroke={item.c} strokeWidth={item.w} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
    </svg> : null}
    {note.text ? <p>{note.text}</p> : null}
    <footer>
      <span>{[note.byStaff ? `Õpetaja${note.createdByName ? ` ${note.createdByName}` : ''}` : 'Sina', date, note.pageTitle].filter(Boolean).join(' · ')}</span>
      {canDelete ? <button type="button" aria-label="Kustuta märge" title="Kustuta märge" onClick={() => onDelete(note)}><Trash2 size={14} /></button> : null}
    </footer>
  </article>;
}

export default function MistakesPage({ studentRepository = studentsService, wordsService = studentWordsService, practiceService = presenceService, notesService = studentNotesService }) {
  const { user, preview } = useAuth();
  const state = useAsyncData(async () => (preview?.studentId
    ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
    : studentRepository.listSelf(user.uid)), [preview?.studentId, user.uid]);
  const students = useMemo(() => state.data || [], [state.data]);
  const words = useStudentWords(students.map((student) => student.id), wordsService);
  const errors = useMemo(() => ownErrors(words), [words]);
  // notes from lessons (the board's bookmarks), newest first; the same live, merged subscription as the words
  const noteList = useStudentWords(students.map((student) => student.id), notesService);
  const notes = useMemo(() => [...noteList].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))), [noteList]);
  const [noteError, setNoteError] = useState('');
  const deleteNote = async (note) => {
    if (!(await askConfirm('Kustutada see märge?'))) return;
    setNoteError('');
    Promise.resolve().then(() => notesService.remove(note.id)).catch((error) => setNoteError(error?.message || 'Märget ei saanud kustutada.'));
  };
  const [drill, setDrill] = useState(null);
  const [done, setDone] = useState(() => readDone(user?.uid));

  if (state.loading) return <div className="page-content"><LoadingState label="Laen sinu vigu…" /></div>;
  if (state.error) return <div className="page-content"><ErrorState message={state.error.message || String(state.error)} onRetry={state.reload} /></div>;
  const today = localDate();
  const start = () => setDrill({ run: Date.now(), tasks: buildReview({ errors, seed: Date.now() % 100000, size: 10 }) });

  if (drill) {
    return <div className="page-content">
      <ReviewDrill key={drill.run} title="Minu vead" tasks={drill.tasks}
        onFinish={(pct) => {
          if (preview) return;
          setDone(saveDone(user?.uid, 'errors', { date: today, pct }));
          // the teacher sees the result too (presence.js); a failed save keeps the result on this device
          Promise.resolve().then(() => practiceService.savePractice(user?.uid, { date: today, pct })).catch(() => {});
        }}
        onAgain={start} onClose={() => setDrill(null)} />
    </div>;
  }

  const saved = user?.profile?.practice;
  const last = saved?.errorsDate && saved.errorsDate > (done.errors?.date || '') ? { date: saved.errorsDate, pct: saved.errorsPct } : done.errors;
  return <div className="page-content">
    <PageHeader title="Minu vead" description={<>Laused, mida ütlesid tunnis valesti. Harjuta neid, kuni need tulevad õigesti.<span lang="ru"> · Твои фразы с урока, которые можно потренировать.</span></>} />
    {errors.length ? <section className="ss-hero" aria-label="Harjuta vigu">
      <div><span className="eyebrow">{last?.date === today ? `Täna tehtud · ${last.pct}%` : 'Harjuta'}</span><h2>{errors.length} lauset tundidest</h2><p>Vali õige lause ja pane lause kokku · umbes 5 minutit</p></div>
      <Button onClick={start}><Play size={18} /> Alusta</Button>
    </section> : null}
    <Card>
      {errors.length ? <div className="simple-list">{errors.map((item) => <div key={item.corrected}>
        <div><span className="ss-muted">{item.said}</span><strong><ArrowRight size={14} aria-hidden="true" /> {item.corrected}</strong></div>
      </div>)}</div> : <EmptyState title="Vigu veel ei ole" description="Pärast tundi lisab õpetaja siia laused, mida ütlesid valesti. Siis saad neid harjutada." />}
    </Card>
    {notes.length ? <section className="ss-notes" aria-label="Märkmed tunnist">
      <h2><Bookmark size={18} aria-hidden="true" /> Märkmed tunnist <span className="ss-muted">· järjehoidjad tahvlilt</span></h2>
      {noteError ? <p className="form-error" role="alert">{noteError}</p> : null}
      <div className="ss-notes__grid">{notes.map((note) => <BoardNote key={note.id} note={note} canDelete={!preview && note.createdByUid === user?.uid} onDelete={deleteNote} />)}</div>
    </section> : null}
  </div>;
}
