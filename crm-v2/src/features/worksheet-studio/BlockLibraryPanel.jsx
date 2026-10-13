import { useEffect, useMemo, useState } from 'react';
import { buildLibrary, searchLibrary, SKILLS, suggestedTags } from './blockLibrary.js';
import Sheet from './engine/Sheet.jsx';

// the course is big (thousands of blocks): read only when the teacher opens „Kogu”
const loadCourse = async () => {
  const { COURSE_MODULES, buildCourseSheet } = await import('../worksheet-generator/admin/course/registry.js');
  return buildLibrary(COURSE_MODULES, buildCourseSheet);
};
const LEVEL_TAGS = ['a2', 'b1', 'b2', 'c1'];
const PHASES = [['avasta', 'Avasta'], ['harjuta', 'Harjuta'], ['kasuta', 'Kasuta']];

/**
 * Constructor „Kogu”: every task of the course sheets (A2…C1) by level, skill, topic and lesson. Words and #tags in one
 * search field („#A2 #rääkimine pere”, also „#говорение семья”); a click shows the task, „Lisa” puts it on the sheet.
 */
export default function BlockLibraryPanel({ level = '', onInsert, load = loadCourse }) {
  const [state, setState] = useState({ loading: true, error: '', entries: [] });
  const startLevel = String(level || '').toLowerCase().replace(/[^abc12]/g, '').slice(0, 2);
  const [query, setQuery] = useState(LEVEL_TAGS.includes(startLevel) ? `#${startLevel} ` : '');
  const [open, setOpen] = useState('');
  const [added, setAdded] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(load)
      .then((entries) => { if (alive) setState({ loading: false, error: '', entries }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Kogu ei saanud laadida.', entries: [] }); });
    return () => { alive = false; };
  }, [load]);

  const result = useMemo(() => searchLibrary(state.entries, query), [state.entries, query]);
  const topics = useMemo(() => suggestedTags(searchLibrary(state.entries, query, 100000).items), [state.entries, query]);
  const hasTag = (tag) => query.toLocaleLowerCase('et').split(/\s+/).includes(`#${tag}`);
  const toggle = (tag) => setQuery((q) => (hasTag(tag) ? q.split(/\s+/).filter((w) => w.toLocaleLowerCase('et') !== `#${tag}`).join(' ') : `${q.trim()} #${tag}`.trim()) + ' ');
  const chip = (tag, label = `#${tag}`) => <button type="button" key={tag} className={hasTag(tag) ? 'is-active' : ''} aria-pressed={hasTag(tag)} onClick={() => toggle(tag)}>{label}</button>;

  return (
    <div className="st-bank st-library" aria-label="Ülesannete kogu">
      <input className="ed-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Otsi: #A2 #rääkimine pere" aria-label="Otsi kogust" />
      <div className="st-bank__levels" role="group" aria-label="Tase">{LEVEL_TAGS.map((t) => chip(t, t.toUpperCase()))}</div>
      <div className="st-bank__levels" role="group" aria-label="Oskus">{Object.entries(SKILLS).map(([tag, label]) => chip(tag, label))}</div>
      <div className="st-bank__levels" role="group" aria-label="Etapp">{PHASES.map(([tag, label]) => chip(tag, label))}</div>
      {topics.length ? <div className="st-bank__levels" role="group" aria-label="Teemad">{topics.map((t) => chip(t))}</div> : null}
      {state.loading ? <p className="ed-hint">Laen kursuse ülesandeid…</p> : state.error ? <p className="ed-hint" role="alert">{state.error}</p> : (
        <>
          <p className="ed-hint">{result.total} ülesannet{result.total > result.items.length ? ` (näitan ${result.items.length})` : ''}</p>
          {added ? <p className="ed-hint" role="status">{added}</p> : null}
          <ul className="st-library__list">
            {result.items.map((entry) => (
              <li key={entry.key} className={open === entry.key ? 'is-open' : ''}>
                <button type="button" className="st-library__item" onClick={() => setOpen(open === entry.key ? '' : entry.key)} aria-expanded={open === entry.key}>
                  <b>{entry.title}</b>
                  <small>{entry.label} · {entry.level} · {SKILLS[entry.skill] || ''} · {entry.lesson}</small>
                </button>
                {open === entry.key ? (
                  <div className="st-library__preview">
                    <div className="st-library__sheet"><Sheet doc={{ schema: 'keelesepp.worksheet/2', id: 'preview', meta: { level: entry.level }, blocks: [entry.block] }} mode="print" /></div>
                    <button type="button" className="st-btn primary" onClick={() => { onInsert([entry.block]); setAdded(`„${entry.title}” lisati lehele.`); }}>Lisa lehele</button>
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
