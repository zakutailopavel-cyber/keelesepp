import { useEffect, useMemo, useState } from 'react';
import { Card, PageHeader, Select, Button, LoadingState, ErrorState } from '../../components/ui/index.js';
import { COURSE_LOADERS } from '../worksheet-generator/admin/course/courseLoaders.js';
import { COURSE_LEVELS, PRACTICE_COURSES, extractCourseItems, moduleList } from './engine/extract.js';
import { coverageOf } from './engine/coverage.js';
import { buildLesson, LESSON_MAX, LESSON_MIN } from './engine/lesson.js';
import { grammarLabel } from './engine/grammar.js';
import { estonianVoice } from './engine/speech.js';
import { TYPE_LABELS } from './engine/items.js';
import PracticeLesson from './PracticeLesson.jsx';
import './practice.css';

// „Harjutuste eelvaade” (staff): try a practice lesson of any level, module and grammar point, with the coverage of the
// course items next to it. Reads the course files only; nothing is stored (docs/PRACTICE_ENGINE.md).
const COURSE_NAMES = { a2: 'A2', b1: 'B1 (A2 → B1)', b2: 'B2 (B1 → B2)', c1: 'C1 (B2 → C1)' };
const LANGS = { ru: 'vene', en: 'inglise', et: 'ainult eesti' };

function useEstonianVoice() {
  const [has, setHas] = useState(() => Boolean(estonianVoice()));
  useEffect(() => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth?.addEventListener) return undefined;
    const update = () => setHas(Boolean(estonianVoice(synth)));
    synth.addEventListener('voiceschanged', update);
    return () => synth.removeEventListener('voiceschanged', update);
  }, []);
  return has;
}

export default function PracticePreviewPage({ loaders = COURSE_LOADERS }) {
  const [course, setCourse] = useState('b1');
  const [state, setState] = useState({ course: '', modules: [], items: [], error: '' });
  const [moduleId, setModuleId] = useState('');
  const [grammar, setGrammar] = useState('');
  const [size, setSize] = useState(10);
  const [lang, setLang] = useState('ru');
  const [seed, setSeed] = useState(1);
  const [running, setRunning] = useState(null);
  const canListen = useEstonianVoice();

  useEffect(() => {
    let alive = true;
    loaders[course]()
      .then((file) => { if (alive) setState({ course, modules: moduleList(file.MODULES), items: extractCourseItems(course, file.MODULES), error: '' }); })
      .catch((error) => { if (alive) setState({ course, modules: [], items: [], error: error?.message || 'Kursust ei saanud laadida' }); });
    return () => { alive = false; };
  }, [course, loaders]);

  const loading = state.course !== course;
  const coverage = useMemo(() => (loading ? null : coverageOf(course, state.items)), [loading, course, state.items]);
  const scoped = useMemo(() => state.items.filter((it) => !moduleId || it.moduleId === moduleId), [state.items, moduleId]);
  const points = useMemo(() => {
    const counts = {};
    scoped.forEach((it) => it.grammar.forEach((g) => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [scoped]);

  const start = () => {
    const lesson = buildLesson({ pool: state.items, level: COURSE_LEVELS[course], moduleId, grammarFocus: grammar, size, canListen, seed: `preview-${seed}` });
    setRunning(lesson);
  };
  const restart = () => { setSeed((s) => s + 1); setRunning(null); };

  return (
    <div className="pr-preview">
      <PageHeader eyebrow="Õppevara" title="Harjutuste eelvaade" description="Lauseehituse ja grammatika harjutused kursuse ülesannetest. Proovi tundi nagu õpilane; midagi ei salvestata." compact />
      <Card>
        <div className="pr-preview__controls">
          <Select label="Kursus" value={course} onChange={(e) => { setCourse(e.target.value); setModuleId(''); setGrammar(''); setRunning(null); }}>
            {PRACTICE_COURSES.map((c) => <option key={c} value={c}>{COURSE_NAMES[c]}</option>)}
          </Select>
          <Select label="Moodul" value={moduleId} onChange={(e) => { setModuleId(e.target.value); setGrammar(''); }} disabled={loading}>
            <option value="">Kõik moodulid</option>
            {state.modules.map((m) => <option key={m.id} value={m.id}>{m.supplement ? m.title : `${m.index + 1}. ${m.title}`}</option>)}
          </Select>
          <Select label="Grammatika" value={grammar} onChange={(e) => setGrammar(e.target.value)} disabled={loading}>
            <option value="">Mooduli segu</option>
            {points.map(([id, n]) => <option key={id} value={id}>{grammarLabel(id)} ({n})</option>)}
          </Select>
          <Select label="Ülesandeid" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {Array.from({ length: LESSON_MAX - LESSON_MIN + 1 }, (_, i) => LESSON_MIN + i).map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Select label="Õpilase keel" value={lang} onChange={(e) => setLang(e.target.value)}>
            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <div className="pr-preview__actions">
            <Button onClick={start} disabled={loading || !state.items.length}>Koosta tund</Button>
            {running ? <Button variant="secondary" onClick={() => { setSeed((s) => s + 1); setRunning(null); }}>Uus segu</Button> : null}
          </div>
        </div>
        <p className="pr-preview__meta">{canListen ? 'Brauseris on eesti hääl: kuulamisülesanded on sees.' : 'Brauseris pole eesti häält: kuulamisülesanded jäävad välja.'}</p>
      </Card>

      {state.error ? <ErrorState title="Kursust ei saanud avada" message={state.error} /> : null}
      {loading && !state.error ? <LoadingState label="Laen kursuse ülesandeid…" /> : null}

      {!loading && !state.error ? (
        <div className="pr-preview__grid">
          <div>
            {running ? (
              running.items.length ? (
                <>
                  <p className="pr-preview__meta">{running.items.length} ülesannet · {running.types.map((t) => TYPE_LABELS[t].et).join(', ')} · teema {running.focusCount}, kordamine {running.spacedCount}{running.short ? ' · materjali on vähe' : ''}</p>
                  <PracticeLesson key={`${seed}-${moduleId}-${grammar}`} items={running.items} lang={lang} onExit={() => setRunning(null)} onRestart={restart} />
                </>
              ) : <p className="pr-preview__empty">Selle valikuga ülesandeid ei leitud.</p>
            ) : <p className="pr-preview__empty">Vali kursus, moodul ja grammatika ning vajuta „Koosta tund”.</p>}
          </div>
          {coverage ? <CoveragePanel coverage={coverage} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function CoveragePanel({ coverage }) {
  const max = Math.max(1, ...coverage.plan.map((p) => p.count));
  return (
    <Card className="pr-coverage">
      <h3>Katvus: {COURSE_NAMES[coverage.course]}</h3>
      <dl className="pr-coverage__nums">
        <div><dt>Ülesandeid</dt><dd>{coverage.total}</dd></div>
        <div><dt>Eri lauseid</dt><dd>{coverage.sentences}</dd></div>
        {Object.entries(coverage.byType).map(([t, n]) => <div key={t}><dt>{TYPE_LABELS[t]?.et || t}</dt><dd>{n}</dd></div>)}
        <div><dt>Ilma grammatikasildita</dt><dd>{coverage.untagged}</dd></div>
      </dl>
      <h3>Kursuse grammatikaplaan</h3>
      <ul className="pr-bars">
        {coverage.plan.map((p) => (
          <li key={p.id} className={p.gap ? 'is-gap' : ''}>
            <span>{p.label}</span><strong>{p.count}</strong>
            <i><b style={{ width: `${Math.round((p.count / max) * 100)}%` }} /></i>
          </li>
        ))}
      </ul>
      {coverage.gaps.length ? (
        <>
          <h3>Lüngad (alla 16 ülesande)</h3>
          <ul className="pr-gaps">{coverage.gaps.map((g) => <li key={g.id}>{g.label}: {g.count}</li>)}</ul>
        </>
      ) : null}
    </Card>
  );
}
