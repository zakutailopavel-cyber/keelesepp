import { CalendarClock, Check, History, Pencil, Search, Trash2, UserRoundX, X, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, EmptyState } from '../../components/ui/index.js';
import { buildLibraryItems, searchLibrary, sortLibrary } from '../library/libraryModel.js';
import { INDIVIDUAL_TOPIC, suggestTopic, topicFields, topicLine } from './lessonTopic.js';
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
export default function LessonPanel({ item, history = [], catalog, library, loadingLibrary = false, student, saving = false, error = '', onClose, onDone, onEdit, onCancelLesson, onDeleteLesson, children }) {
  const done = Boolean(item?.lessonRecordId || ['Toimunud', 'Puudus_eta', 'Puudus_p'].includes(item?.status));
  const suggestion = useMemo(() => (catalog && item && !item.isGroup ? suggestTopic(catalog, { studentLevel: student?.level || '', history }) : null), [catalog, history, item, student?.level]);
  const [picked, setPicked] = useState(null);
  const [notes, setNotes] = useState('');
  const [homework, setHomework] = useState(null);
  if (!item) return null;
  const topic = picked || (suggestion ? { level: suggestion.level, module: suggestion.moduleKey, lessonId: suggestion.id } : { level: '', module: '', lessonId: '' });
  const chosen = topic.lessonId ? catalog?.byId.get(topic.lessonId) || null : null;
  const last = history[0];
  const record = item.record;
  const save = (status) => (status === 'Toimunud'
    ? onDone({ status, ...topicFields(chosen, notes), homework })
    : onDone({ status, ...topicFields(null, notes), topic: '', homework: null }));
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

      {!item.isGroup ? (
        <section className="lp-last">
          <History size={16} aria-hidden="true" />
          <div><span>Eelmine kord</span>{last ? <><strong>{topicLine(last) || INDIVIDUAL_TOPIC}</strong><small>{last.date}{last.notes ? ` · ${last.notes}` : ''}</small></> : <strong>Varasemaid tunde pole</strong>}</div>
        </section>
      ) : null}

      {children}

      {!item.isGroup && done ? (
        <section className="lp-done">
          <Badge tone={absent ? 'danger' : 'success'}>{STATUS_LABEL[record?.status || item.status] || 'Arvestatud'}</Badge>
          {record ? <><strong>{topicLine(record) || INDIVIDUAL_TOPIC}</strong>{record.notes ? <p>{record.notes}</p> : null}</> : null}
        </section>
      ) : null}

      {!item.isGroup && !done ? (
        <section className="lp-form" aria-label="Tund toimus">
          <h3>Mida tunnis tehti?</h3>
          {!catalog ? <p className="lp-hint">{loadingLibrary ? 'Laen Õppevara teemasid…' : 'Teemad pole saadaval.'}</p> : (
            <>
              <TopicPicker catalog={catalog} value={topic} onChange={setPicked} />
              <p className="lp-hint">{chosen ? <>Õpilane ja lapsevanem näevad: <b>{topicLine(topicFields(chosen))}</b></> : <>Teemata tund salvestub kui <b>„{INDIVIDUAL_TOPIC}”</b>.</>}{chosen || topic.level ? <> · <button type="button" className="link-button" onClick={() => setPicked({ level: '', module: '', lessonId: '' })}>Ilma teemata</button></> : null}</p>
            </>
          )}
          <label className="lp-notes"><span>Märkus (näeb ka õpilane ja lapsevanem)</span><textarea rows={2} maxLength={1000} placeholder="Nt: harjutasime partitiivi, kooli kodutöö matemaatikas…" value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          <HomeworkPicker library={library} value={homework} onChange={setHomework} />
          <div className="lp-actions">
            <Button loading={saving} onClick={() => save('Toimunud')}><Check size={17} /> Tund toimus</Button>
            <Button variant="secondary" disabled={saving} onClick={() => save('Puudus_p')}><UserRoundX size={16} /> Puudus (teatas ette)</Button>
            <Button variant="secondary" disabled={saving} onClick={() => save('Puudus_eta')}><UserRoundX size={16} /> Puudus (ei teatanud)</Button>
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
      {item.isGroup && !children ? <EmptyState title="Grupi andmed puuduvad" /> : null}
      {!item.isGroup && item.recurring && !googleOwned ? <p className="lp-hint lp-series"><CalendarClock size={14} /> Kordub igal nädalal. Lohista kalendris, et muuta ühte tundi või kõiki järgmisi.</p> : null}
    </aside>
  );
}
