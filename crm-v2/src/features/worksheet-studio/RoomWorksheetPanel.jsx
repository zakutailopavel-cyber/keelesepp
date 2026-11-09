import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { lazyComponent } from '../../app/lazyComponent.js';
import RoomPartBoundary from '../live-classroom/RoomPartBoundary.jsx';
import { FileText } from 'lucide-react';
import { Button, Card, LoadingState } from '../../components/ui/index.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { lessonWorksheetsService } from '../../services/firebase/lessonWorksheets.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { libraryService } from '../../services/firebase/library.js';
import { publishedPhaseDoc } from './bookProgram.js';
import { curriculumSheetChoices, filterChoices, findLessonRows, lessonRows, moduleGroups, nextLessonSuggestion, prepRoomKey, studentSheetChoices } from './roomWorksheetChoices.js';

// the worksheet itself (every block's views and rules) downloads when a sheet is on the board, not with the room
const DocWorksheetPlayer = lazyComponent(() => import('./DocWorksheetPlayer.jsx'));
const LiveWorksheetView = lazyComponent(() => import('./LiveWorksheetView.jsx'));
const RoomStepControl = lazyComponent(() => import('./RoomStepControl.jsx'));
import './worksheetStudio.css';

// A structured worksheet inside a Live Classroom room (materials of the lesson).
// Teacher: picks a studio worksheet → it is assigned to this student (normal assignment, so it also stays in
// homework history) and tagged with the room key; the teacher then watches answers live and points at tasks.
// Student: sees the worksheet of this room inline and fills it in; answers autosave.
// The worksheet itself (teacher: live answers; student: fill in). In the Live Classroom room it lies on the board.
export function RoomWorksheetContent({ current, role, homework = homeworkService }) {
  if (!current) return null;
  return <RoomPartBoundary label="Töölehte"><Suspense fallback={<LoadingState label="Laen töölehte…" />}>{role === 'teacher'
    ? <LiveWorksheetView key={current.id} assignmentId={current.id} repository={homework} embedded board />
    : <DocWorksheetPlayer key={`${current.id}-${current.status === 'done' ? 'done' : 'open'}`} assignment={current} repository={homework} inline board />}</Suspense></RoomPartBoundary>;
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
    const item = { kind: 'curriculum', type: 'worksheet', sourceId: choice.lessonId, title: choice.title, subject: source.subject || '', level: source.publishedWorksheetDoc?.meta?.level || source.level || '', topic: source.topic || '', source, ...(choice.kind === 'phase' ? { phase: choice.phase } : {}) };
    const result = await library.assign({ item, students: [{ id: studentId, name: studentName }], note, user });
    assignmentId = result.assignments?.[0]?.id;
    if (!assignmentId) throw new Error('Töölehte ei saanud avada.');
  }
  await homework.openWorksheetInRoom({ assignmentId, roomKey });
}

// a curriculum lesson: its number and title, where it is in the course, and a button for each of its sheets
// (inside its module the place in the course is known, so the line says what the lesson teaches)
function LessonRow({ row, isNext, opening, onOpen, inModule = false }) {
  const place = [row.level, row.module].filter(Boolean).join(' · ');
  return (
    <li className="room-sheet-picker__lesson">
      <span>
        <strong>{row.number ? `${row.number}. ` : ''}{row.lessonTitle}{isNext ? <em className="room-sheet-picker__tag">järgmine</em> : null}</strong>
        {!inModule && place ? <small>{place}</small> : null}
        {row.hint ? <small className="room-sheet-picker__hint">{row.hint}</small> : null}
      </span>
      <span className="room-sheet-picker__phases">
        {row.choices.map((choice) => (
          <Button key={choice.key} variant="secondary" loading={opening === choice.key} disabled={Boolean(opening)} onClick={() => onOpen(choice)} aria-label={`Lisa tahvlile: ${choice.title}`}>{choice.phaseLabel || 'Lisa tahvlile'}</Button>
        ))}
      </span>
    </li>
  );
}

export function RoomWorksheetPicker({ studentId, studentName = '', studentLevel = '', roomKey, note = 'Live Classroom', user, homework = homeworkService, library = libraryService, lessonWorksheets = lessonWorksheetsService, lessons = lessonsService, onOpened }) {
  const [state, setState] = useState({ loading: true, error: '', lessons: [], assignments: [], records: [] });
  const [tab, setTab] = useState('curriculum');
  const [query, setQuery] = useState('');
  // null: the student's level (or the level of their next lesson) until the teacher picks one; '' is „Kõik”
  const [level, setLevel] = useState(null);
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
  const rows = useMemo(() => lessonRows(curriculum), [curriculum]);
  const next = useMemo(() => nextLessonSuggestion({ curriculum, lessonRecords: state.records, assignments: state.assignments, studentLevel, roomKey }), [curriculum, state.records, state.assignments, studentLevel, roomKey]);
  const ownLevel = String(studentLevel || '').toUpperCase();
  const activeLevel = level ?? (levels.includes(ownLevel) ? ownLevel : levels.includes(next?.level) ? next.level : '');
  const list = tab === 'own' ? filterChoices(own, { query }) : [];
  const found = tab === 'curriculum' ? findLessonRows(rows, { query, level: activeLevel }) : [];
  const groups = moduleGroups(found, { withLevel: !activeLevel });
  // a search inside one level says how many lessons match on the other levels
  const elsewhere = tab === 'curriculum' && query && activeLevel ? findLessonRows(rows, { query }).length - found.length : 0;
  const nextModule = next ? `${next.level}|${next.module}` : '';
  // the module of the next lesson is scrolled to the top of the list, so the teacher starts where the student is
  const modulesRef = useRef(null);
  const showModules = tab === 'curriculum' && !query && !state.loading;
  useEffect(() => {
    const box = modulesRef.current;
    const target = box?.querySelector('details[data-next]');
    if (showModules && box && target) box.scrollTop = target.offsetTop;
  }, [showModules, nextModule, activeLevel]);
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
        <button type="button" role="tab" aria-pressed={tab === 'curriculum'} className={tab === 'curriculum' ? 'is-active' : ''} onClick={() => setTab('curriculum')}>Õppekava ({rows.length} tundi)</button>
        <button type="button" role="tab" aria-pressed={tab === 'own'} className={tab === 'own' ? 'is-active' : ''} onClick={() => setTab('own')}>Õpilase töölehed ({own.length})</button>
      </div>
      <input className="ed-input" type="search" aria-label="Otsi töölehte" placeholder={tab === 'own' ? 'Otsi: pealkiri, teema…' : 'Otsi: tunni nr, teema, grammatika, sõna…'} value={query} onChange={(event) => setQuery(event.target.value)} />
      {tab === 'curriculum' && levels.length > 1 ? (
        <div className="room-sheet-picker__levels" role="group" aria-label="Tase">
          <button type="button" aria-pressed={!activeLevel} className={!activeLevel ? 'is-active' : ''} onClick={() => setLevel('')}>Kõik</button>
          {levels.map((item) => <button type="button" key={item} aria-pressed={activeLevel === item} className={activeLevel === item ? 'is-active' : ''} onClick={() => setLevel(activeLevel === item ? '' : item)}>{item}</button>)}
        </div>
      ) : null}
      {next?.choices.length && tab === 'curriculum' && !query ? (
        <div className="room-sheet-picker__next" role="group" aria-label="Järgmine tund">
          <span><small>Järgmine tund · {[next.level, next.module].filter(Boolean).join(' · ')}</small><strong>{next.number ? `${next.number}. ` : ''}{next.lessonTitle}</strong><small>{next.choices.map((choice) => choice.phaseLabel || 'Tööleht').join(' · ')}</small></span>
          <Button loading={opening === 'next'} disabled={Boolean(opening)} onClick={placeNext}>Pane tahvlile</Button>
        </div>
      ) : null}
      {error ? <div className="action-error" role="alert">{error}</div> : null}
      {state.loading ? <LoadingState inline className="form-hint" label="Laen töölehti…" /> : tab === 'curriculum' ? (
        !found.length ? (
          <p className="form-hint">{activeLevel ? 'Sellel tasemel ei leitud.' : 'Midagi ei leitud.'}{elsewhere > 0 ? <> <button type="button" className="room-sheet-picker__more" onClick={() => setLevel('')}>Teistel tasemetel {elsewhere} {elsewhere === 1 ? 'tund' : 'tundi'} — näita</button></> : ''}</p>
        )
          : query ? (
            <ul className="room-sheet-picker__list">
              {found.slice(0, 40).map((row) => <LessonRow key={row.lessonId} row={row} isNext={row.lessonId === next?.lessonId} opening={opening} onOpen={open} />)}
              {found.length > 40 ? <li className="form-hint">… veel {found.length - 40} tundi. Täpsusta otsingut.</li> : null}
              {elsewhere > 0 ? <li><button type="button" className="room-sheet-picker__more" onClick={() => setLevel('')}>Teistel tasemetel veel {elsewhere} {elsewhere === 1 ? 'tund' : 'tundi'} — näita kõiki</button></li> : null}
            </ul>
          ) : (
            // no search: the course by modules; the module of the student's next lesson is open
            <div className="room-sheet-picker__modules" ref={modulesRef}>
              {groups.map((group) => (
                <details key={group.key} open={group.key === nextModule || groups.length === 1} data-next={group.key === nextModule || undefined}>
                  <summary><span>{group.title}</span><small>{group.range || `${group.rows.length} tundi`}</small></summary>
                  <ul className="room-sheet-picker__list">
                    {group.rows.map((row) => <LessonRow key={row.lessonId} row={row} isNext={row.lessonId === next?.lessonId} opening={opening} onOpen={open} inModule />)}
                  </ul>
                </details>
              ))}
            </div>
          )
      ) : !list.length ? <p className="form-hint">Õpilasel pole lõpetamata töölehti.</p> : (
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
      {/* fallback={null}: a small optional control bar above the sheet; the sheet itself stays visible meanwhile */}
      {role === 'teacher' && current?.liveStep?.on ? <RoomPartBoundary label="Sammude juhtimist"><Suspense fallback={null}><RoomStepControl current={current} homework={homework} /></Suspense></RoomPartBoundary> : null}
      {role === 'teacher' ? <RoomWorksheetPicker studentId={invitation.studentId} studentName={invitation.studentName} roomKey={roomKey} note={invitation.title ? `Live Classroom: ${invitation.title}` : 'Live Classroom'} user={user} homework={homework} library={library} lessonWorksheets={lessonWorksheets} lessons={lessons} /> : null}
      {showSheet ? <RoomWorksheetContent current={current} role={role} homework={homework} /> : null}
    </Card>
  );
}
