import { CalendarClock, Check, History, Pencil, RotateCcw, Search, Trash2, UserRoundX, Video, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, EmptyState } from '../../components/ui/index.js';
import { buildLibraryItems, searchLibrary, sortLibrary } from '../library/libraryModel.js';
import { INDIVIDUAL_TOPIC, pickFromRecord, suggestTopic, topicFromPick, topicLine } from './lessonTopic.js';
import { isGoogleOwned, lessonSyncState } from '../google-calendar/googleCalendarModel.js';
import '../google-calendar/googleCalendar.css';

const STATUS_LABEL = { Toimunud: 'Toimunud', Puudus_eta: 'Puudus (ei teatanud)', Puudus_p: 'Puudus (teatas ette)', Planeeritud: 'Planeeritud' };

function TopicPicker({ catalog, value, onChange }) {
  const level = catalog.levels.find((entry) => entry.key === value.level) || null;
  const module = level?.modules.find((entry) => entry.key === value.module) || null;
  return (
    <div className="lp-topic" role="group" aria-label="Tunni teema">
      <label><span>Tase</span>
        <select value={value.level} onChange={(event) => onChange({ level: event.target.value, module: '', lessonId: '' })}>
          <option value="">—</option>
          {catalog.levels.map((entry) => <option value={entry.key} key={entry.key}>{entry.label}</option>)}
        </select>
      </label>
      <label><span>Teema</span>
        <select value={value.module} disabled={!level} onChange={(event) => onChange({ ...value, module: event.target.value, lessonId: '' })}>
          <option value="">—</option>
          {(level?.modules || []).map((entry) => <option value={entry.key} key={entry.key}>{entry.label}</option>)}
        </select>
      </label>
      <label className="lp-topic__lesson"><span>Tund</span>
        <select value={value.lessonId} disabled={!module} onChange={(event) => onChange({ ...value, lessonId: event.target.value })}>
          <option value="">—</option>
          {(module?.lessons || []).map((entry) => <option value={entry.id} key={entry.id}>{entry.number ? `${entry.number}. ` : ''}{entry.title}</option>)}
        </select>
      </label>
    </div>
  );
}

function HomeworkPicker({ library, value, onChange }) {
  const [query, setQuery] = useState('');
  const items = useMemo(() => (library ? buildLibraryItems(library.curriculumLessons, library.exercises) : []), [library]);
  const results = query.trim() ? sortLibrary(searchLibrary(items, { query }), 'relevance').slice(0, 6) : [];
  if (value) {
    return <div className="lp-homework is-picked"><span><strong>{value.title}</strong><small>{[value.typeLabel, value.level].filter(Boolean).join(' · ')}</small></span><button type="button" aria-label="Eemalda kodutöö" onClick={() => onChange(null)}><X size={16} /></button></div>;
  }
  return (
    <div className="lp-homework">
      <label className="lp-search"><Search size={15} /><input aria-label="Otsi kodutööd Õppevarast" placeholder="Kodutöö Õppevarast (valikuline)…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {results.length ? <ul>{results.map(({ item }) => <li key={item.key}><button type="button" onClick={() => { onChange(item); setQuery(''); }}><strong>{item.title}</strong><small>{[item.typeLabel, item.level].filter(Boolean).join(' · ')}</small></button></li>)}</ul> : null}
    </div>
  );
}

/**
 * Side panel for one lesson occurrence: last time, "Toimus" with topic (level → theme → lesson), note, homework,
 * absence, edit time and cancel. Groups show the attendance sheet instead (children).
 */
// The note, topic and homework typed before the lesson is marked are a draft in this browser: closing the panel (or
// the tab) does not lose them; they are sent with „Tund toimus” / „Puudus” and the draft is then removed.
const draftKey = (item) => `ks-lesson-draft:${item?.occurrenceId || ''}`;
function readDraft(item) {
  if (!item?.occurrenceId) return null;
  try { return JSON.parse(window.localStorage.getItem(draftKey(item)) || 'null'); } catch { return null; }
}

export default function LessonPanel({ item, notice = '', history = [], catalog, library, loadingLibrary = false, student, saving = false, error = '', today = '', onClose, onDone, onUpdateDetails, onEdit, onCancelLesson, onDeleteLesson, onChangeMark, onRemoveMark, onCancelGroupLesson, onStartLive, liveBlocked = '', startingLive = false, children }) {
  const done = Boolean(item?.recordProblem || item?.lessonRecordId || ['Toimunud', 'Puudus_eta', 'Puudus_p'].includes(item?.status));
  const suggestion = useMemo(() => (catalog && item && !item.isGroup ? suggestTopic(catalog, { studentLevel: student?.level || '', history }) : null), [catalog, history, item, student?.level]);
  const [draft] = useState(() => readDraft(item));
  const [picked, setPicked] = useState(draft?.picked || null);
  const [notes, setNotes] = useState(draft?.notes || '');
  const [homework, setHomework] = useState(draft?.homework || null);
  const [fixing, setFixing] = useState(false);
  // editing the topic and the note of a marked lesson: { pick, notes } or null
  const [editing, setEditing] = useState(null);
  useEffect(() => {
    if (!item?.occurrenceId) return;
    try {
      if (notes.trim() || picked || homework) window.localStorage.setItem(draftKey(item), JSON.stringify({ notes, picked, homework, savedAt: Date.now() }));
      else window.localStorage.removeItem(draftKey(item));
    } catch { /* storage may be disabled */ }
  }, [item, notes, picked, homework]);
  if (!item) return null;
  // A lesson can be marked held only on its day or later; an absence announced in advance can be marked any time.
  const future = Boolean(today && item.occurrenceDate > today);
  const topic = picked || (suggestion ? { level: suggestion.level, module: suggestion.moduleKey, lessonId: suggestion.id } : { level: '', module: '', lessonId: '' });
  const chosen = topic.lessonId ? catalog?.byId.get(topic.lessonId) || null : null;
  // "Last time" is the lesson before this one, never this lesson's own mark.
  const last = history.find((lesson) => lesson.id !== item.lessonRecordId && (lesson.date < item.occurrenceDate || (lesson.date === item.occurrenceDate && !item.lessonRecordId)));
  const record = item.record;
  const save = async (status) => {
    const ok = await (status === 'Toimunud'
      ? onDone({ status, ...topicFromPick(catalog, topic, notes), homework })
      : onDone({ status, ...topicFromPick(null, {}, notes), topic: '', homework: null }));
    if (ok) { try { window.localStorage.removeItem(draftKey(item)); } catch { /* storage may be disabled */ } }
  };
  const googleOwned = isGoogleOwned(item);
  const sync = lessonSyncState(item);
  const absent = item.status === 'Puudus_eta' || item.status === 'Puudus_p' || ['Puudus_eta', 'Puudus_p'].includes(record?.status);

  return (
    <aside className="lp" role="dialog" aria-modal="false" aria-label={`Tund: ${item.studentName || ''}`}>
      <header className="lp-head">
        <div>
          <span className="eyebrow">{new Date(`${item.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' })} · {item.time} · {item.duration} min</span>
          <h2>{item.studentName || 'Õpilane'}{item.isGroup ? <Badge tone="success">Grupp</Badge> : null}</h2>
          <p>{[item.teacher, student?.level].filter(Boolean).join(' · ')}</p>
        </div>
        <button type="button" className="lp-close" aria-label="Sulge" onClick={onClose}><X size={18} /></button>
      </header>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="lp-hint lp-notice" role="status">{notice}</p> : null}

      {onStartLive && !item.isGroup && !done && item.occurrenceDate === today ? (
        <section className="lp-live" aria-label="Live Classroom">
          <Button loading={startingLive} disabled={Boolean(liveBlocked) || saving} onClick={onStartLive}><Video size={17} /> Alusta tundi</Button>
          <p className="lp-hint">{liveBlocked || `${item.studentName || 'Õpilane'} saab kutse oma kabinetti; tunniruum avaneb kohe.`}</p>
        </section>
      ) : null}

      {!item.isGroup ? (
        <section className="lp-last">
          <History size={16} aria-hidden="true" />
          <div><span>Eelmine kord</span>{last ? <><strong>{topicLine(last) || INDIVIDUAL_TOPIC}</strong><small>{last.date}{last.notes ? ` · ${last.notes}` : ''}</small></> : <strong>Varasemaid tunde pole</strong>}</div>
        </section>
      ) : null}

      {item.recordProblem ? <section className="lp-fix" role="alert">
        <p>{item.recordProblem === 'duplicate' ? 'Selle kuupäeva kohta leiti mitu tunni märget.' : 'Tund on märgitud arvestatuks, kuid seotud päevikukannet ei leitud.'} Kontrolli päevikut enne uue märke lisamist.</p>
        <a className="link-button" href={`/students/${encodeURIComponent(item.studentId)}`}>Ava õpilase päevik</a>
      </section> : null}
      {children}

      {!item.isGroup && done ? (
        <section className="lp-done">
          <Badge tone={absent ? 'danger' : 'success'}>{STATUS_LABEL[record?.status || item.status] || 'Arvestatud'}</Badge>
          {record && !editing ? <><strong>{topicLine(record) || INDIVIDUAL_TOPIC}</strong>{record.notes ? <p>{record.notes}</p> : null}</> : null}
          {record && onUpdateDetails && !editing ? <button type="button" className="link-button" onClick={() => setEditing({ pick: pickFromRecord(catalog, record), notes: record.notes || '' })}><Pencil size={13} /> Muuda teemat või märkust</button> : null}
          {record && editing ? (
            <div className="lp-notes-edit" role="group" aria-label="Muuda teemat või märkust">
              {catalog ? <TopicPicker catalog={catalog} value={editing.pick} onChange={(pick) => setEditing({ ...editing, pick })} /> : <p className="lp-hint">{loadingLibrary ? 'Laen Õppevara teemasid…' : 'Teemad pole saadaval.'}</p>}
              <p className="lp-hint">Õpilane ja lapsevanem näevad: <b>{topicLine(topicFromPick(catalog, editing.pick)) || INDIVIDUAL_TOPIC}</b></p>
              <label className="lp-notes"><span>Märkus (näeb ka õpilane ja lapsevanem)</span><textarea rows={3} maxLength={1000} value={editing.notes} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} /></label>
              <div className="lp-actions"><Button loading={saving} onClick={async () => { if (await onUpdateDetails(topicFromPick(catalog, editing.pick, editing.notes))) setEditing(null); }}>Salvesta</Button><Button variant="secondary" disabled={saving} onClick={() => setEditing(null)}>Loobu</Button></div>
            </div>
          ) : null}
          {record && onChangeMark && !fixing ? <button type="button" className="link-button" onClick={() => setFixing(true)}>Märkisid valesti? Paranda</button> : null}
          {record && fixing ? (
            <div className="lp-fix" role="group" aria-label="Paranda märge">
              {['Toimunud', 'Puudus_p', 'Puudus_eta'].filter((status) => status !== record.status && !(future && status !== 'Puudus_p')).map((status) => (
                <Button key={status} variant="secondary" disabled={saving} onClick={() => onChangeMark(status)}>{STATUS_LABEL[status]}</Button>
              ))}
              <Button variant="secondary" disabled={saving} onClick={onRemoveMark}><RotateCcw size={15} /> Eemalda märge (tund planeeritud)</Button>
              <button type="button" className="link-button" onClick={() => setFixing(false)}>Loobu</button>
            </div>
          ) : null}
        </section>
      ) : null}

      {!item.isGroup && !done ? (
        <section className="lp-form" aria-label="Tund toimus">
          {future ? <p className="lp-hint">Tund on {new Date(`${item.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' })}. Toimunuks saab selle märkida tunni päeval; ette saab märkida ainult etteteatatud puudumise.</p> : <>
          <h3>Mida tunnis tehti?</h3>
          {!catalog ? <p className="lp-hint">{loadingLibrary ? 'Laen Õppevara teemasid…' : 'Teemad pole saadaval.'}</p> : (
            <>
              <TopicPicker catalog={catalog} value={topic} onChange={setPicked} />
              <p className="lp-hint">{chosen || topic.module ? <>Õpilane ja lapsevanem näevad: <b>{topicLine(topicFromPick(catalog, topic))}</b></> : <>Teemata tund salvestub kui <b>„{INDIVIDUAL_TOPIC}”</b>.</>}{chosen || topic.level ? <> · <button type="button" className="link-button" onClick={() => setPicked({ level: '', module: '', lessonId: '' })}>Ilma teemata</button></> : null}</p>
            </>
          )}
          <label className="lp-notes"><span>Märkus (näeb ka õpilane ja lapsevanem)</span><textarea rows={2} maxLength={1000} placeholder="Nt: harjutasime partitiivi, kooli kodutöö matemaatikas…" value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          {notes.trim() || picked || homework ? <p className="lp-hint lp-draft">Mustand on selles brauseris alles ka akna sulgemisel. Õpilane näeb märkust pärast „Tund toimus”.</p> : null}
          <HomeworkPicker library={library} value={homework} onChange={setHomework} />
          </>}
          <div className="lp-actions">
            {future ? null : <Button loading={saving} onClick={() => save('Toimunud')}><Check size={17} /> Tund toimus</Button>}
            <Button variant="secondary" disabled={saving} onClick={() => save('Puudus_p')}><UserRoundX size={16} /> Puudus (teatas ette)</Button>
            {future ? null : <Button variant="secondary" disabled={saving} onClick={() => save('Puudus_eta')}><UserRoundX size={16} /> Puudus (ei teatanud)</Button>}
          </div>
        </section>
      ) : null}

      {sync ? (
        <section className="lp-gcal" aria-label="Google Calendar">
          <Badge tone={sync.tone}>{sync.label}</Badge>
          {sync.hint ? <p>{sync.hint}</p> : null}
        </section>
      ) : null}

      {!done && !item.isGroup && !googleOwned ? (
        <footer className="lp-foot">
          <Button variant="secondary" disabled={saving} onClick={onEdit}><Pencil size={15} /> Muuda aega</Button>
          <Button variant="danger" disabled={saving} onClick={onCancelLesson}><XCircle size={15} /> Tühista tund</Button>
          {onDeleteLesson ? <Button variant="danger" disabled={saving} onClick={onDeleteLesson}><Trash2 size={15} /> Kustuta</Button> : null}
          {onDeleteLesson ? <p className="lp-hint">„Tühista” — tund jääb ära. „Kustuta” — tund lisati kogemata (vale õpilane või päev).</p> : null}
        </footer>
      ) : null}
      {item.isGroup && onCancelGroupLesson ? (
        <footer className="lp-foot">
          <Button variant="danger" disabled={saving} onClick={onCancelGroupLesson}><XCircle size={15} /> Tühista see grupitund</Button>
        </footer>
      ) : null}
      {item.isGroup && !children ? <EmptyState title="Grupi andmed puuduvad" /> : null}
      {!item.isGroup && item.recurring && !googleOwned ? <p className="lp-hint lp-series"><CalendarClock size={14} /> Kordub igal nädalal. Lohista kalendris, et muuta ühte tundi või kõiki järgmisi.</p> : null}
    </aside>
  );
}
