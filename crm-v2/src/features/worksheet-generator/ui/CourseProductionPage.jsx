import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { Button, Card, ErrorState, LoadingState, Modal, PageHeader } from '../../../components/ui/index.js';
import { lessonWorksheetsService } from '../../../services/firebase/lessonWorksheets.js';
import { ROLES } from '../../../utils/roles.js';
import { analyzeWorksheet } from '../../worksheet-studio/quality.js';
import { sheetMinutes } from '../../worksheet-studio/didactics/timeEstimate.js';
import { COURSE_MODULES, COURSES, PHASES, moduleNumber, moduleSheets } from '../admin/course/registry.js';
import { moduleProblems, splitByBaseline } from '../admin/course/quality.js';
import { courseReadiness, GATE_LABEL } from '../admin/course/readiness.js';
import { TEXTBOOK_SHEETS, TEXTBOOK_SHEET_ID } from '../admin/course/textbook/index.js';
import { keysProblems } from '../../worksheet-studio/didactics/gates.js';

const StudioSheetPreview = lazy(() => import('../../library/StudioSheetPreview.jsx'));
const MISSING = 'Töölehte ei leitud.';

// „Kursuse tootmine”: the B1 / B2 course sheets written in code (admin/course/*), checked by the quality gate, previewed
// as they print and published lesson by lesson into Õppevara. A sheet that already exists is replaced only after an
// explicit confirmation; nothing is written without the admin's click.
export default function CourseProductionPage({ repository = lessonWorksheetsService, modules = COURSE_MODULES, textbookSheets = TEXTBOOK_SHEETS }) {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes(ROLES.ADMIN);
  const [moduleId, setModuleId] = useState(modules[0]?.MODULE.id || '');
  const mod = modules.find((m) => m.MODULE.id === moduleId) || modules[0];
  const sheets = useMemo(() => (mod ? moduleSheets(mod) : {}), [mod]);
  // a new problem locks publishing; a known one (qualityBaseline.json, the level audit's debt) is shown but does not
  const { fresh: problems, known } = useMemo(() => (mod ? splitByBaseline(mod.MODULE.id, moduleProblems(sheets)) : { fresh: [], known: [] }), [mod, sheets]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  // quality gates over the whole course (computed once): ready lessons per level and module
  const readiness = useMemo(() => courseReadiness(modules), [modules]);
  const report = readiness[mod?.MODULE.course]?.modules.find((m) => m.id === mod?.MODULE.id);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const next = {};
    try {
      for (const lessonId of Object.keys(sheets)) {
        for (const phase of Object.keys(sheets[lessonId])) {
          try { next[`${lessonId}:${phase}`] = await repository.load(lessonId, phase); }
          catch (cause) { if (cause?.message !== MISSING) throw cause; next[`${lessonId}:${phase}`] = null; }
        }
      }
      setRecords(next);
    } catch (cause) { setError(cause?.message || String(cause)); } finally { setLoading(false); }
  }, [repository, sheets]);
  useEffect(() => { if (isAdmin && mod) load(); }, [isAdmin, mod, load]);

  // „Õpik”: textbook sheets for the lessons of the course (admin/course/textbook); only the answer keys are checked,
  // the textbook's own content is copied 1:1 and is not measured against our lesson norms
  const [textbookRecords, setTextbookRecords] = useState({});
  useEffect(() => {
    if (!isAdmin || !textbookSheets.length) return;
    let alive = true;
    (async () => {
      const next = {};
      for (const { lessonId } of textbookSheets) {
        try { next[lessonId] = await repository.load(lessonId, TEXTBOOK_SHEET_ID); }
        catch (cause) { next[lessonId] = cause?.message === MISSING ? null : { error: cause?.message || String(cause) }; }
      }
      if (alive) setTextbookRecords(next);
    })();
    return () => { alive = false; };
  }, [isAdmin, repository, textbookSheets]);
  const publishTextbook = async ({ lessonId, doc, book }) => {
    const current = textbookRecords[lessonId];
    if (!window.confirm(`Avaldada ${lessonId}: Õpik („${book.title}”)?${current ? '\n\nNB! Olemasolev Õpik-leht asendatakse uue versiooniga.' : ''}`)) return;
    setBusy(`opik:${lessonId}`); setError('');
    try {
      const saved = await repository.publish({ lessonId, worksheetId: TEXTBOOK_SHEET_ID, worksheetDoc: doc, user, baseUpdatedAt: current?.worksheetDocUpdatedAt || '', role: 'focus', slot: 4, displayLabel: 'Õpik', source: 'manual' });
      setTextbookRecords((r) => ({ ...r, [lessonId]: saved }));
    } catch (cause) { setError(cause?.message || String(cause)); } finally { setBusy(''); }
  };

  if (!isAdmin) return <ErrorState title="Puudub ligipääs" message="Seda vaadet saab kasutada ainult administraator." />;
  if (!mod) return <ErrorState title="Mooduleid pole" message="Kursuse tootmises pole veel ühtegi moodulit." />;

  const publishLesson = async (lessonId) => {
    const phases = Object.keys(sheets[lessonId]);
    const replacing = phases.filter((p) => records[`${lessonId}:${p}`]);
    const text = `Avaldada ${lessonId}: ${phases.map((p) => PHASES[p].label).join(' + ')}?${replacing.length ? `\n\nNB! Olemasolev leht asendatakse uue versiooniga: ${replacing.map((p) => PHASES[p].label).join(', ')}.` : ''}`;
    if (!window.confirm(text)) return;
    setBusy(lessonId); setError('');
    try {
      for (const phase of phases) {
        const saved = await repository.publish({
          lessonId, worksheetId: phase, worksheetDoc: sheets[lessonId][phase], user,
          baseUpdatedAt: records[`${lessonId}:${phase}`]?.worksheetDocUpdatedAt || '',
          role: phase, slot: PHASES[phase].slot, displayLabel: PHASES[phase].label, source: 'manual',
        });
        setRecords((r) => ({ ...r, [`${lessonId}:${phase}`]: saved }));
      }
    } catch (cause) { setError(cause?.message || String(cause)); await load(); } finally { setBusy(''); }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Õppevara · kursuse tootmine" title="Kursuse töölehed" description="Töölehed on kirjutatud koodis, läbivad kvaliteedikontrolli (konstruktori kontroll, taseme normid, vaheldus) ja avaldatakse tund haaval." />
      <Card>
        <h2 style={{ marginTop: 0 }}>Kursuse valmidus</h2>
        <p className="form-hint">Tund on valmis, kui kõik kolm lehte läbivad kõik väravad: {Object.values(GATE_LABEL).join(', ')} ja keelekontroll (tools/course-audit/language.py).</p>
        <div role="table" aria-label="Kursuse valmidus" style={{ display: 'grid', gap: 6 }}>
          {Object.values(readiness).map((c) => (
            <div role="row" key={c.course} style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr', gap: 12, alignItems: 'center' }}>
              <b role="cell">{COURSES[c.course]?.label.split(' ·')[0] || c.course}</b>
              <span role="cell"><strong>{c.ready}</strong> / {c.total} tundi</span>
              <span role="cell" className="form-hint">{Object.entries(c.gates).sort((a, b) => b[1] - a[1]).map(([gate, n]) => `${GATE_LABEL[gate] || gate} ${n}`).join(' · ') || '✓ kõik väravad läbitud'}</span>
            </div>
          ))}
        </div>
      </Card>
      {textbookSheets.length ? (
        <Card>
          <h2 style={{ marginTop: 0 }}>Õpik</h2>
          <p className="form-hint">Litsentseeritud õpikute reegel ja harjutused (1:1) lisalehena „Õpik” selle tunni juures, mis õpetab sama grammatikat. Kontrollitakse ainult vastuste võtit.</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {textbookSheets.map((entry) => {
              const record = textbookRecords[entry.lessonId];
              const keys = keysProblems(entry.doc).filter((p) => p.level === 'error');
              return (
                <div key={entry.lessonId} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto auto auto', gap: 12, alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <b>{entry.lessonId}</b>
                  <span>{entry.doc.meta.title}<span className="form-hint"> · {entry.book.title}, lk {entry.pages} · {entry.doc.blocks.length} plokki{keys.length ? ` · ⚠ võtmes ${keys.length} viga` : ''}</span></span>
                  <span>{record?.error ? 'viga' : record ? `olemas v${record.worksheetDocVersion || 0}${record.publishedWorksheetDocVersion ? ' · avaldatud' : ''}` : 'uus'}</span>
                  <Button variant="secondary" onClick={() => setPreview({ lessonId: entry.lessonId, phase: TEXTBOOK_SHEET_ID, doc: entry.doc })}>Vaata</Button>
                  <Button onClick={() => publishTextbook(entry)} disabled={Boolean(busy) || keys.length > 0 || Boolean(record?.error)} loading={busy === `opik:${entry.lessonId}`}>Avalda</Button>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="radiogroup" aria-label="Moodul">
          {modules.map((m) => (
            <Button key={m.MODULE.id} variant={m.MODULE.id === mod.MODULE.id ? 'primary' : 'secondary'} role="radio" aria-checked={m.MODULE.id === mod.MODULE.id} onClick={() => setModuleId(m.MODULE.id)}>
              {COURSES[m.MODULE.course].label.split(' ·')[0]} · moodul {moduleNumber(m)} · {m.MODULE.title}{(() => { const r = readiness[m.MODULE.course]?.modules.find((x) => x.id === m.MODULE.id); return r ? ` · ${r.ready}/${r.total}` : ''; })()}
            </Button>
          ))}
        </div>
        <p className="form-hint" style={{ marginTop: 10 }}>
          {problems.length ? `⚠ Kvaliteedikontroll: ${problems.length} probleemi — avaldamine on lukus.` : '✓ Kvaliteedikontroll läbitud: vormid, taseme normid ja vaheldus on korras.'}
        </p>
        {problems.length ? <ul className="form-error">{problems.map((p, i) => <li key={i}>{p.lessonId} {p.phase}: {p.text}</li>)}</ul> : null}
        {known.length ? (
          <details style={{ marginTop: 8 }}>
            <summary className="form-hint">Teadaolevad puudused: {known.length} (taseme audit 12.10.2026 — parandatakse sisutöös, avaldamist ei lukusta)</summary>
            <ul className="form-hint">{known.map((p, i) => <li key={i}>{p.lessonId} {p.phase}: {p.text}</li>)}</ul>
          </details>
        ) : null}
      </Card>
      {error ? <ErrorState title="Viga" message={error} /> : null}
      {loading ? <LoadingState label="Kontrollin olemasolevaid töölehti…" /> : Object.entries(sheets).map(([lessonId, phases]) => (
        <Card key={lessonId}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div><h3 style={{ margin: 0 }}>{lessonId} · {mod.LESSONS[lessonId].title} {report?.lessons[lessonId]?.ready ? <span title="Kõik väravad läbitud">✓</span> : null}</h3><span className="form-hint">{mod.LESSONS[lessonId].canDo}</span></div>
              <Button onClick={() => publishLesson(lessonId)} disabled={Boolean(busy) || problems.length > 0} loading={busy === lessonId}>Avalda tund</Button>
            </div>
            {report?.lessons[lessonId]?.module.length ? <ul className="form-hint" style={{ margin: 0 }}>{report.lessons[lessonId].module.map((p, i) => <li key={i}><b>{GATE_LABEL[p.gate] || p.gate}</b>: {p.text}</li>)}</ul> : null}
            {Object.entries(phases).map(([phase, doc]) => {
              const record = records[`${lessonId}:${phase}`];
              const score = analyzeWorksheet(doc).didactics.score;
              return (
                <div key={phase} style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto auto', gap: 12, alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <b>{PHASES[phase].label}</b>
                  <span className="form-hint">{doc.blocks.length} plokki · {[...new Set(doc.blocks.map((b) => b.type))].join(', ')} · didaktika {score} · ≈ {sheetMinutes(doc)} min</span>
                  <span>{record ? `olemas v${record.worksheetDocVersion || 0}${record.publishedWorksheetDocVersion ? ' · avaldatud' : ''}` : 'uus'}</span>
                  <Button variant="secondary" onClick={() => setPreview({ lessonId, phase, doc })}>Vaata</Button>
                  {report?.lessons[lessonId]?.sheets[phase]?.length ? (
                    <details style={{ gridColumn: '1 / -1' }}>
                      <summary className="form-hint">Väravad: {report.lessons[lessonId].sheets[phase].length} märkust</summary>
                      <ul className="form-hint">{report.lessons[lessonId].sheets[phase].map((p, i) => <li key={i}><b>{GATE_LABEL[p.gate] || p.gate}</b>: {p.text}</li>)}</ul>
                    </details>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <Modal open={Boolean(preview)} title={preview ? `${preview.lessonId} · ${PHASES[preview.phase]?.label || 'Õpik'}` : ''} onClose={() => setPreview(null)} className="modal--editor">
        {preview ? <Suspense fallback={<LoadingState label="Laen eelvaadet…" />}><StudioSheetPreview doc={preview.doc} /></Suspense> : null}
      </Modal>
    </div>
  );
}
