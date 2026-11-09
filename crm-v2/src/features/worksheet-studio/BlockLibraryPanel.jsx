/* global setTimeout, clearTimeout */
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { loadCourseLibrary, searchLibrary, SKILLS, suggestedTags } from './blockLibrary.js';
import { lessonsToLoad, phaseEntries, standaloneEntries } from './sheetReuse.js';
import { sheetReuseService } from '../../services/firebase/sheetReuse.js';
import Sheet from './engine/Sheet.jsx';
import { LoadingState } from '../../components/ui/index.js';

const LEVEL_TAGS = ['a2', 'b1', 'b2', 'c1'];
const PHASES = [['avasta', 'Avasta'], ['harjuta', 'Harjuta'], ['kasuta', 'Kasuta']];

/**
 * Constructor „Kogu”: every task of the course sheets (A2…C1) by level, skill, topic and lesson. Words and #tags in one
 * search field („#A2 #rääkimine pere”, also „#говорение семья”); a click shows the task, „Lisa” puts it on the sheet.
 * „Salvestatud lehed”: the tasks of sheets saved in the CRM — standalone sheets right away (they are on the lesson list),
 * lesson phase sheets (Avasta / Harjuta / Kasuta / Õpik) of the open lesson and of up to 12 lessons whose name matches
 * the typed words; each lesson is read once and kept (services/firebase/sheetReuse.js).
 */
export default function BlockLibraryPanel({ level = '', onInsert, load = loadCourseLibrary, saved = sheetReuseService, currentLessonId = '' }) {
  const [source, setSource] = useState('course');
  const [state, setState] = useState({ loading: true, error: '', entries: [] });
  const startLevel = String(level || '').toLowerCase().replace(/[^abc12]/g, '').slice(0, 2);
  const [query, setQuery] = useState(LEVEL_TAGS.includes(startLevel) ? `#${startLevel} ` : '');
  const deferredQuery = useDeferredValue(query);
  const [open, setOpen] = useState('');
  const [added, setAdded] = useState('');
  // saved sheets: the lesson list (read when the source is first chosen) and the phase entries of the lessons read so far
  const [savedState, setSavedState] = useState({ loading: false, error: '', lessons: null, standalone: [] });
  const [phaseByLesson, setPhaseByLesson] = useState({});
  const [phaseNote, setPhaseNote] = useState({ loading: 0, more: 0 });

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(load)
      .then((entries) => { if (alive) setState({ loading: false, error: '', entries }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Kogu ei saanud laadida.', entries: [] }); });
    return () => { alive = false; };
  }, [load]);

  // the lesson list is read when „Salvestatud lehed” is first chosen (and again after an error)
  const chooseSaved = () => {
    setSource('saved'); setOpen('');
    if (savedState.lessons || savedState.loading) return;
    setSavedState({ loading: true, error: '', lessons: null, standalone: [] });
    Promise.resolve().then(() => saved.listLessons())
      .then((lessons) => setSavedState({ loading: false, error: '', lessons, standalone: standaloneEntries(lessons) }))
      .catch((err) => setSavedState({ loading: false, error: err.message || 'Salvestatud lehti ei saanud laadida.', lessons: null, standalone: [] }));
  };

  // phase sheets of the lessons the query names: read 400 ms after the typing stops, never twice
  useEffect(() => {
    if (source !== 'saved' || !savedState.lessons) return undefined;
    let alive = true;
    const timer = setTimeout(() => {
      const plan = lessonsToLoad(savedState.lessons, query, { always: currentLessonId ? [currentLessonId] : [] });
      const missing = plan.lessons.filter((lesson) => !phaseByLesson[lesson.id]);
      setPhaseNote({ loading: missing.length, more: plan.more });
      missing.forEach((lesson) => {
        Promise.resolve().then(() => saved.loadLessonSheets(lesson.id))
          .then((records) => phaseEntries(lesson, records || []))
          .catch(() => [])
          .then((entries) => {
            if (!alive) return;
            setPhaseByLesson((map) => ({ ...map, [lesson.id]: entries }));
            setPhaseNote((note) => ({ ...note, loading: Math.max(0, note.loading - 1) }));
          });
      });
    }, 400);
    return () => { alive = false; clearTimeout(timer); };
  }, [source, savedState.lessons, query, currentLessonId, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedEntries = useMemo(() => [...savedState.standalone, ...Object.values(phaseByLesson).flat()], [savedState.standalone, phaseByLesson]);
  const entries = source === 'saved' ? savedEntries : state.entries;
  const result = useMemo(() => searchLibrary(entries, deferredQuery), [entries, deferredQuery]);
  const topics = useMemo(() => suggestedTags(searchLibrary(entries, deferredQuery, 100000).items), [entries, deferredQuery]);
  const loading = source === 'saved' ? savedState.loading : state.loading;
  const error = source === 'saved' ? savedState.error : state.error;
  const hasTag = (tag) => query.toLocaleLowerCase('et').split(/\s+/).includes(`#${tag}`);
  const toggle = (tag) => setQuery((q) => (hasTag(tag) ? q.split(/\s+/).filter((w) => w.toLocaleLowerCase('et') !== `#${tag}`).join(' ') : `${q.trim()} #${tag}`.trim()) + ' ');
  const chip = (tag, label = `#${tag}`) => <button type="button" key={tag} className={hasTag(tag) ? 'is-active' : ''} aria-pressed={hasTag(tag)} onClick={() => toggle(tag)}>{label}</button>;

  return (
    <div className="st-bank st-library" aria-label="Ülesannete kogu">
      <div className="st-bank__levels" role="group" aria-label="Allikas">
        <button type="button" className={source === 'course' ? 'is-active' : ''} aria-pressed={source === 'course'} onClick={() => { setSource('course'); setOpen(''); }}>Kursus</button>
        <button type="button" className={source === 'saved' ? 'is-active' : ''} aria-pressed={source === 'saved'} onClick={chooseSaved}>Salvestatud lehed</button>
      </div>
      <input className="ed-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Otsi: #A2 #rääkimine pere" aria-label="Otsi kogust" />
      <div className="st-bank__levels" role="group" aria-label="Tase">{LEVEL_TAGS.map((t) => chip(t, t.toUpperCase()))}</div>
      <div className="st-bank__levels" role="group" aria-label="Oskus">{Object.entries(SKILLS).map(([tag, label]) => chip(tag, label))}</div>
      <div className="st-bank__levels" role="group" aria-label="Etapp">{PHASES.map(([tag, label]) => chip(tag, label))}</div>
      {topics.length ? <div className="st-bank__levels" role="group" aria-label="Teemad">{topics.map((t) => chip(t))}</div> : null}
      {source === 'saved' ? <p className="ed-hint">Kõik eraldi lehed; tundide lehed (Avasta, Harjuta, Kasuta, Õpik) selle tunni ja nende tundide omad, mille nime kirjutad (nt „perekond”).{phaseNote.loading ? ` Laen ${phaseNote.loading} tunni lehti…` : ''}{phaseNote.more ? ` Veel ${phaseNote.more} tundi sobib — täpsusta otsingut.` : ''}</p> : null}
      {loading ? <LoadingState inline className="ed-hint" label={source === 'saved' ? 'Laen salvestatud lehti…' : 'Laen kursuse ülesandeid…'} /> : error ? <p className="ed-hint" role="alert">{error}</p> : (
        <>
          <p className="ed-hint">{result.total} ülesannet{result.total > result.items.length ? ` (näitan ${result.items.length})` : ''}</p>
          {added ? <p className="ed-hint" role="status">{added}</p> : null}
          <ul className="st-library__list">
            {result.items.map((entry) => (
              <li key={entry.key} className={open === entry.key ? 'is-open' : ''}>
                <button type="button" className="st-library__item" onClick={() => setOpen(open === entry.key ? '' : entry.key)} aria-expanded={open === entry.key}>
                  <b>{entry.title}</b>
                  <small>{entry.label} · {entry.level} · {SKILLS[entry.skill] || ''} · {entry.source === 'saved' ? `${entry.sheetTitle} · ${entry.status}` : entry.lesson}</small>
                </button>
                {open === entry.key ? (
                  <div className="st-library__preview">
                    <div className="st-library__sheet"><Sheet doc={{ schema: 'keelesepp.worksheet/2', id: 'preview', meta: { level: entry.level }, blocks: [entry.block] }} mode="print" /></div>
                    <button type="button" className="st-btn primary" onClick={() => { onInsert([entry.block], { goals: entry.goals || {} }); setAdded(`„${entry.title}” lisati lehele.`); }}>Lisa lehele</button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
