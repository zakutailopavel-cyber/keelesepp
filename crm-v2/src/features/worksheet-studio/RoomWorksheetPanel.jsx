import { useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { Button, Card } from '../../components/ui/index.js';
import { homeworkService, lessonWorksheetsService, lessonsService, libraryService } from '../../services/firebase/index.js';
import { publishedPhaseDoc } from './bookProgram.js';
import { curriculumSheetChoices, filterChoices, nextLessonSuggestion, prepRoomKey, studentSheetChoices } from './roomWorksheetChoices.js';
import DocWorksheetPlayer from './DocWorksheetPlayer.jsx';
import LiveWorksheetView from './LiveWorksheetView.jsx';
import './worksheetStudio.css';

// A structured worksheet inside a Live Classroom room (materials of the lesson).
// Teacher: picks a studio worksheet → it is assigned to this student (normal assignment, so it also stays in
// homework history) and tagged with the room key; the teacher then watches answers live and points at tasks.
// Student: sees the worksheet of this room inline and fills it in; answers autosave.
// The worksheet itself (teacher: live answers; student: fill in). In the Live Classroom room it lies on the board.
export function RoomWorksheetContent({ current, role, homework = homeworkService }) {
  if (!current) return null;
  return role === 'teacher'
    ? <LiveWorksheetView key={current.id} assignmentId={current.id} repository={homework} embedded board />
    : <DocWorksheetPlayer key={`${current.id}-${current.status === 'done' ? 'done' : 'open'}`} assignment={current} repository={homework} inline board />;
}

const errorText = (err, fallback) => err?.message || fallback;

// „Lisa tööleht”: search the student's own open worksheets and the curriculum (published Avasta / Harjuta / Kasuta,
// older lesson sheets) and put the chosen one on the lesson board — before the lesson (room key prep_<student>) or
// during it. Each chosen curriculum sheet becomes a normal assignment, so it also stays in the student's history.
// Puts one choice on the board: a curriculum sheet becomes the student's assignment first, then it gets the room key.
async function placeChoice({ choice, studentId, studentName, roomKey, note, user, homework, library, lessonWorksheets }) {
  let assignmentId = choice.assignmentId || '';
  if (!assignmentId) {
    let source = choice.lesson;
    if (choice.kind === 'phase') {
      const records = await lessonWorksheets.list(choice.lessonId);
      const doc = publishedPhaseDoc(records.find((record) => (record.worksheetId || record.id) === choice.phase));
      if (!doc) throw new Error('Sellel lehel pole avaldatud versiooni.');
      source = { id: choice.lessonId, title: choice.title, subject: choice.subject, level: choice.level, topic: choice.topic, publishedWorksheetDoc: doc, worksheetDocStatus: 'published', files: [] };
    }
    const item = { kind: 'curriculum', type: 'worksheet', sourceId: choice.lessonId, title: choice.title, subject: source.subject || '', level: source.level || '', topic: source.topic || '', source };
    const result = await library.assign({ item, students: [{ id: studentId, name: studentName }], note, user });
    assignmentId = result.assignments?.[0]?.id;
    if (!assignmentId) throw new Error('Töölehte ei saanud avada.');
  }
  await homework.openWorksheetInRoom({ assignmentId, roomKey });
}

export function RoomWorksheetPicker({ studentId, studentName = '', studentLevel = '', roomKey, note = 'Live Classroom', user, homework = homeworkService, library = libraryService, lessonWorksheets = lessonWorksheetsService, lessons = lessonsService, onOpened }) {
  const [state, setState] = useState({ loading: true, error: '', lessons: [], assignments: [], records: [] });
  const [tab, setTab] = useState('curriculum');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [opening, setOpening] = useState('');
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([
      Promise.resolve().then(() => library.list()).catch(() => ({ curriculumLessons: [] })),
      homework.listWorksheetAssignmentsByStudentIds ? homework.listWorksheetAssignmentsByStudentIds([studentId]).catch(() => []) : [],
      // the journal tells where the student is in the curriculum (a teacher may not read another teacher's lessons)
      Promise.resolve().then(() => lessons?.listByStudent?.(studentId) || []).catch(() => []),
    ]).then(([res, assignments, records]) => {
      if (alive) setState({ loading: false, error: '', lessons: res.curriculumLessons || [], assignments: assignments || [], records: records || [] });
    });
    return () => { alive = false; };
  }, [library, homework, lessons, studentId, reload]);

  const curriculum = useMemo(() => curriculumSheetChoices(state.lessons), [state.lessons]);
  const own = useMemo(() => studentSheetChoices(state.assignments, roomKey), [state.assignments, roomKey]);
  const levels = useMemo(() => [...new Set(curriculum.map((choice) => choice.level).filter(Boolean))], [curriculum]);
  const list = filterChoices(tab === 'own' ? own : curriculum, { query, level: tab === 'own' ? '' : level });
  const next = useMemo(() => nextLessonSuggestion({ curriculum, lessonRecords: state.records, assignments: state.assignments, studentLevel, roomKey }), [curriculum, state.records, state.assignments, studentLevel, roomKey]);
  const context = { studentId, studentName, roomKey, note, user, homework, library, lessonWorksheets };

  const open = async (choice) => {
    setOpening(choice.key); setError('');
    try {
      await placeChoice({ choice, ...context });
      onOpened?.(choice);
      setReload((value) => value + 1);
    } catch (err) {
      setError(errorText(err, 'Töölehte ei saanud avada.'));
    } finally {
      setOpening('');
    }
  };
  // „Järgmine tund”: all its sheets (Avasta, Harjuta, Kasuta) on the board with one click
  const placeNext = async () => {
    setOpening('next'); setError('');
    try {
      for (const choice of next.choices) await placeChoice({ choice, ...context });
      onOpened?.({ title: `${next.number ? `${next.number}. ` : ''}${next.lessonTitle}`, key: 'next' });
      setReload((value) => value + 1);
    } catch (err) {
      setError(errorText(err, 'Töölehte ei saanud avada.'));
      setReload((value) => value + 1);
    } finally {
      setOpening('');
    }
  };

  return (
    <div className="room-sheet-picker">
      <div className="ed-seg" role="tablist" aria-label="Töölehtede allikas">
        <button type="button" role="tab" aria-pressed={tab === 'curriculum'} className={tab === 'curriculum' ? 'is-active' : ''} onClick={() => setTab('curriculum')}>Õppekava ({curriculum.length})</button>
        <button type="button" role="tab" aria-pressed={tab === 'own'} className={tab === 'own' ? 'is-active' : ''} onClick={() => setTab('own')}>Õpilase töölehed ({own.length})</button>
      </div>
      <input className="ed-input" type="search" aria-label="Otsi töölehte" placeholder="Otsi: pealkiri, teema, moodul…" value={query} onChange={(event) => setQuery(event.target.value)} />
      {tab === 'curriculum' && levels.length > 1 ? (
        <div className="room-sheet-picker__levels" role="group" aria-label="Tase">
          <button type="button" aria-pressed={!level} className={!level ? 'is-active' : ''} onClick={() => setLevel('')}>Kõik</button>
          {levels.map((item) => <button type="button" key={item} aria-pressed={level === item} className={level === item ? 'is-active' : ''} onClick={() => setLevel(level === item ? '' : item)}>{item}</button>)}
        </div>
      ) : null}
      {next?.choices.length && tab === 'curriculum' && !query ? (
        <div className="room-sheet-picker__next" role="group" aria-label="Järgmine tund">
          <span><small>Järgmine tund · {[next.level, next.module].filter(Boolean).join(' · ')}</small><strong>{next.number ? `${next.number}. ` : ''}{next.lessonTitle}</strong><small>{next.choices.map((choice) => choice.phaseLabel || 'Tööleht').join(' · ')}</small></span>
          <Button loading={opening === 'next'} disabled={Boolean(opening)} onClick={placeNext}>Pane tahvlile</Button>
        </div>
      ) : null}
      {error ? <div className="action-error" role="alert">{error}</div> : null}
      {state.loading ? <p className="form-hint">Laen töölehti…</p> : !list.length ? <p className="form-hint">{tab === 'own' ? 'Õpilasel pole lõpetamata töölehti.' : 'Midagi ei leitud.'}</p> : (
        <ul className="room-sheet-picker__list">
          {list.slice(0, 80).map((choice) => (
            <li key={choice.key}>
              <span><strong>{choice.title}</strong><small>{[choice.level, choice.detail].filter(Boolean).join(' · ')}</small></span>
              <Button variant="secondary" loading={opening === choice.key} disabled={Boolean(opening)} onClick={() => open(choice)} aria-label={`Lisa tahvlile: ${choice.title}`}>Lisa tahvlile</Button>
            </li>
          ))}
          {list.length > 80 ? <li className="form-hint">… veel {list.length - 80}. Täpsusta otsingut.</li> : null}
        </ul>
      )}
    </div>
  );
}

// `showSheet`: false when the room shows the worksheet on the board and this panel only picks/announces it.
// onSheetsChange: every worksheet of this room, newest first (the board shows each on its own page).
export default function RoomWorksheetPanel({ invitation, role, user, homework = homeworkService, library = libraryService, lessonWorksheets = lessonWorksheetsService, lessons = lessonsService, onCurrentChange, onSheetsChange, showSheet = true }) {
  const roomKey = invitation.roomKey || invitation.id;
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      return homework.subscribeRoomWorksheets(
        { studentId: invitation.studentId, roomKey },
        (next) => { setItems(next); setError(''); },
        (err) => setError(err.message || 'Töölehte ei saanud laadida.'),
      );
    } catch (err) {
      globalThis.queueMicrotask(() => setError(err.message || 'Töölehte ei saanud laadida.'));
      return undefined;
    }
  }, [homework, invitation.studentId, roomKey]);

  // worksheets the teacher prepared before inviting the student come into this lesson
  useEffect(() => {
    if (role !== 'teacher' || !homework.adoptPreparedWorksheets) return;
    homework.adoptPreparedWorksheets({ studentId: invitation.studentId, fromKey: prepRoomKey(invitation.studentId), toKey: roomKey }).catch(() => {});
  }, [homework, invitation.studentId, roomKey, role]);

  const current = items?.[0] || null;
  // the Live Classroom room shows a marker on „Ülesanded” and opens it for the student when a worksheet appears
  useEffect(() => { onCurrentChange?.(current); }, [current, onCurrentChange]);
  useEffect(() => { onSheetsChange?.(items || []); }, [items, onSheetsChange]);

  return (
    <Card className="live-room-worksheet">
      <div className="live-room-worksheet__head">
        <FileText size={20} aria-hidden="true" />
        <div><strong>Töölehed tunnis</strong><small>{role === 'teacher' ? 'Lisa tööleht: see tuleb tahvlile oma lehele, õpilane täidab seda ja vastused jõuavad sinuni kohe.' : 'Kui õpetaja lisab töölehe, ilmub see tahvlile.'}</small></div>
      </div>
      {error ? <div className="action-error" role="alert">{error}</div> : null}
      {!showSheet && items?.length ? <p className="form-hint">Tahvlil: {items.map((item) => item.title || item.worksheetDoc?.meta?.title || 'Tööleht').join(' · ')}</p> : null}
      {role === 'teacher' ? <RoomWorksheetPicker studentId={invitation.studentId} studentName={invitation.studentName} roomKey={roomKey} note={invitation.title ? `Live Classroom: ${invitation.title}` : 'Live Classroom'} user={user} homework={homework} library={library} lessonWorksheets={lessonWorksheets} lessons={lessons} /> : null}
      {showSheet ? <RoomWorksheetContent current={current} role={role} homework={homework} /> : null}
    </Card>
  );
}
