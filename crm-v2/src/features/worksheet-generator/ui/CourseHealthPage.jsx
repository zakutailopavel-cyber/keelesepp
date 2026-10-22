import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Button, Card, ErrorState, PageHeader } from '../../../components/ui/index.js';
import { lessonWorksheetsService } from '../../../services/firebase/lessonWorksheets.js';
import { ROLES } from '../../../utils/roles.js';
import { COURSE_MODULES, COURSES, moduleNumber, moduleSheets } from '../admin/course/registry.js';
import { courseReadiness, GATE_LABEL } from '../admin/course/readiness.js';
import { TEXTBOOK_SHEETS } from '../admin/course/textbook/index.js';
import { HEALTH_STATE, healthCounts, lessonHealth } from '../admin/course/health.js';

// „Kursuste tervis” (owner 2026-10-22): is a course whole? For each lesson: do its sheets pass the quality gates (code),
// and does Õppevara hold the same published sheets as the code — or is a sheet missing, only a draft, or different
// (edited in the CRM, or the code changed and was not published)? Read-only: nothing is written from this page.
const SHEET_LABEL = { discover: 'Avasta', practice: 'Harjuta', transfer: 'Kasuta', opik: 'Õpik' };
const TONE = { ok: { background: '#e7f5f1', color: '#0b5c4d', borderColor: '#9fd8c8' }, warn: { background: '#fff6e0', color: '#8a5a00', borderColor: '#f1d38a' }, bad: { background: '#fdecea', color: '#b42318', borderColor: '#f5b5ad' }, info: { background: '#eef4ff', color: '#3559c7', borderColor: '#bcd0fb' } };
const chip = (tone) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 999, border: '1px solid', fontSize: '.8rem', fontWeight: 700, textDecoration: 'none', ...TONE[tone] });
const CONCURRENCY = 6;

export default function CourseHealthPage({ repository = lessonWorksheetsService, modules = COURSE_MODULES, textbookSheets = TEXTBOOK_SHEETS }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes(ROLES.ADMIN);
  const courses = useMemo(() => [...new Set(modules.map((m) => m.MODULE.course))].filter((key) => COURSES[key]), [modules]);
  const [course, setCourse] = useState(courses[0] || '');
  const [onlyProblems, setOnlyProblems] = useState(true);
  const [check, setCheck] = useState({ course: '', running: false, done: 0, total: 0, records: {}, errors: {} });
  const courseModules = useMemo(() => modules.filter((m) => m.MODULE.course === course), [modules, course]);
  // the code side: every lesson's sheets (+ its Õpik sheet) and the quality gates (computed only for the chosen course)
  const code = useMemo(() => courseModules.map((mod) => ({
    mod,
    lessons: Object.entries(moduleSheets(mod)).map(([lessonId, phases]) => ({
      lessonId,
      title: mod.LESSONS[lessonId]?.title || lessonId,
      sheets: { ...phases, ...Object.fromEntries(textbookSheets.filter((t) => t.lessonId === lessonId).map((t) => ['opik', t.doc])) },
    })),
  })), [courseModules, textbookSheets]);
  const readiness = useMemo(() => courseReadiness(courseModules)[course], [courseModules, course]);
  const allLessons = code.flatMap((m) => m.lessons);

  if (!isAdmin) return <ErrorState title="Puudub ligipääs" message="Seda vaadet saab kasutada ainult administraator." />;

  const run = async () => {
    const ids = allLessons.map((lesson) => lesson.lessonId);
    const records = {};
    const errors = {};
    setCheck({ course, running: true, done: 0, total: ids.length, records, errors });
    let next = 0;
    let done = 0;
    const worker = async () => {
      while (next < ids.length) {
        const id = ids[next++];
        try { records[id] = await repository.list(id); } catch (cause) { errors[id] = cause?.message || String(cause); }
        done += 1;
        setCheck((current) => ({ ...current, done }));
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setCheck({ course, running: false, done, total: ids.length, records: { ...records }, errors: { ...errors } });
  };
  const checked = check.course === course && !check.running && check.total > 0;
  const health = checked ? allLessons.map((lesson) => ({ ...lesson, sheets: lessonHealth(lesson.sheets, check.records[lesson.lessonId] || []), error: check.errors[lesson.lessonId] })) : [];
  const counts = healthCounts(health);
  const gateProblems = (lessonId) => {
    const report = readiness?.modules.flatMap((m) => Object.entries(m.lessons)).find(([id]) => id === lessonId)?.[1];
    return report ? report.count : 0;
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Õppevara · kursused" title="Kursuste tervis" description="Kas kursus on terviklik: kas iga tunni lehed läbivad kvaliteedikontrolli ja kas Õppevaras on avaldatud samad lehed, mis koodis. Leht ainult loeb — midagi ei muudeta." />
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="radiogroup" aria-label="Kursus">
          {courses.map((key) => <Button key={key} variant={key === course ? 'primary' : 'secondary'} role="radio" aria-checked={key === course} onClick={() => setCourse(key)}>{COURSES[key].label.split(' ·')[0]}</Button>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 14, alignItems: 'center' }}>
          <span><b>{allLessons.length}</b> tundi · <b>{allLessons.reduce((n, l) => n + Object.keys(l.sheets).length, 0)}</b> lehte koodis</span>
          {readiness ? <span>Kvaliteet: <b>{readiness.ready}</b> / {readiness.total} tundi läbib kõik väravad{Object.keys(readiness.gates).length ? <span className="form-hint"> · {Object.entries(readiness.gates).sort((a, b) => b[1] - a[1]).map(([gate, n]) => `${GATE_LABEL[gate] || gate} ${n}`).join(' · ')}</span> : null}</span> : null}
          <Button onClick={run} disabled={check.running || !allLessons.length} loading={check.running}>{check.running ? `Kontrollin… ${check.done}/${check.total}` : 'Kontrolli Õppevaraga'}</Button>
        </div>
        {checked ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }} aria-label="Kokkuvõte">
            {Object.entries(HEALTH_STATE).map(([key, state]) => <span key={key} style={chip(state.tone)}>{state.label}: {counts[key]}</span>)}
            {Object.keys(check.errors).length ? <span style={chip('bad')}>Lugemine ebaõnnestus: {Object.keys(check.errors).length}</span> : null}
          </div>
        ) : <p className="form-hint" style={{ marginTop: 12 }}>„Kontrolli Õppevaraga” loeb iga tunni lehed andmebaasist ja võrdleb neid koodiga.</p>}
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}><input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} /> Näita ainult probleemidega tunde</label>
      </Card>
      {code.map(({ mod, lessons }) => {
        const rows = lessons.map((lesson) => {
          const sheets = checked ? health.find((h) => h.lessonId === lesson.lessonId)?.sheets || [] : [];
          const gates = gateProblems(lesson.lessonId);
          const problem = gates > 0 || sheets.some((s) => s.state !== 'same') || Boolean(check.errors[lesson.lessonId]);
          return { lesson, sheets, gates, problem };
        }).filter((row) => !onlyProblems || row.problem);
        if (!rows.length) return null;
        return (
          <Card key={mod.MODULE.id}>
            <h3 style={{ marginTop: 0 }}>{COURSES[course].label.split(' ·')[0]} · moodul {moduleNumber(mod)} · {mod.MODULE.title}</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
              {rows.map(({ lesson, sheets, gates }) => (
                <li key={lesson.lessonId} style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto', gap: 10, alignItems: 'center', borderTop: '1px solid var(--border, #eef1f4)', paddingTop: 6 }}>
                  <span><b>{lesson.lessonId}</b> · {lesson.title}{gates ? <span style={{ ...chip('warn'), marginLeft: 8 }} title="Kvaliteedivärava märkused (vt Kursuse tootmine)">väravad: {gates}</span> : null}{check.errors[lesson.lessonId] ? <span style={{ ...chip('bad'), marginLeft: 8 }}>{check.errors[lesson.lessonId]}</span> : null}</span>
                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                    {(checked ? sheets : Object.keys(lesson.sheets).map((sheet) => ({ sheet, state: null }))).map(({ sheet, state }) => (
                      <Link key={sheet} to={`/library/lessons/${encodeURIComponent(lesson.lessonId)}/worksheets/${sheet}`} style={state ? chip(HEALTH_STATE[state].tone) : { ...chip('info'), opacity: 0.6 }} title={state ? HEALTH_STATE[state].label : 'Kontrollimata'}>{SHEET_LABEL[sheet] || sheet}</Link>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
