import { useEffect, useMemo, useState } from 'react';
import { Modal, LoadingState } from '../../../components/ui/index.js';
import { BLOCKS } from '../engine/registry.js';
import { filterTemplates, PHASE_SHEETS, phaseLabel, targetLessons, TEMPLATE_KINDS } from '../sheetReuse.js';

/**
 * „Kopeeri / Teisalda…” of one block: to another phase sheet of this lesson (Avasta / Harjuta / Kasuta / Õpik) or of
 * another lesson. The copy goes to the end of that sheet's draft (conflict-checked save, never published); „Teisalda”
 * then removes the block here (the caller does that after the copy is saved).
 */
export function CopyMoveDialog({ block, doc, lessonId = '', worksheetId = '', reuse, user, onClose, onDone }) {
  const [mode, setMode] = useState('copy');
  const [lessons, setLessons] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [lessonQuery, setLessonQuery] = useState('');
  const [target, setTarget] = useState(worksheetId ? lessonId : '');
  const [phase, setPhase] = useState(() => PHASE_SHEETS.find((p) => !(worksheetId && p.id === worksheetId))?.id || 'discover');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => reuse.listLessons())
      .then((list) => { if (alive) setLessons(list || []); })
      .catch((err) => { if (alive) setLoadError(err.message || 'Tundide nimekirja ei saanud laadida.'); });
    return () => { alive = false; };
  }, [reuse]);

  const found = useMemo(() => targetLessons(lessons || [], lessonQuery), [lessons, lessonQuery]);
  const targetLesson = (lessons || []).find((l) => l.id === target) || null;
  const sameSheet = target === lessonId && phase === worksheetId;
  const title = block.data?.title || BLOCKS[block.type]?.label || 'Plokk';
  const phaseState = (id) => {
    const summary = targetLesson?.worksheetPhases?.[id];
    if (!summary) return 'uus leht';
    return summary.status === 'published' ? 'avaldatud — muudatus jääb mustandiks' : 'mustand';
  };

  const submit = async () => {
    if (!target || sameSheet) return;
    setBusy(true); setError('');
    try {
      const result = await reuse.copyBlocks({ lessonId: target, worksheetId: phase, blocks: [block], sourceMeta: doc.meta, lesson: targetLesson || {}, user });
      onDone({ mode, label: `${target === lessonId ? 'selle tunni' : `tunni „${targetLesson?.title || target}”`} lehele ${phaseLabel(phase)}`, result });
    } catch (err) {
      setError(err.message || 'Kopeerimine ebaõnnestus.');
      setBusy(false);
    }
  };

  return (
    <Modal open title="Kopeeri / Teisalda" onClose={onClose} className="st-reuse-modal" footer={<>
      <button type="button" className="st-btn" onClick={onClose}>Loobu</button>
      <button type="button" className="st-btn primary" disabled={busy || !target || sameSheet} onClick={submit}>{busy ? 'Salvestan…' : mode === 'move' ? 'Teisalda' : 'Kopeeri'}</button>
    </>}>
      <div className="st-reuse">
        <p>Ülesanne: <b>{title}</b></p>
        <div className="st-bank__levels" role="group" aria-label="Toiming">
          <button type="button" className={mode === 'copy' ? 'is-active' : ''} aria-pressed={mode === 'copy'} onClick={() => setMode('copy')}>Kopeeri</button>
          <button type="button" className={mode === 'move' ? 'is-active' : ''} aria-pressed={mode === 'move'} onClick={() => setMode('move')}>Teisalda</button>
        </div>
        <fieldset>
          <legend>Tund</legend>
          {lessonId && worksheetId ? <label className="st-reuse__row"><input type="radio" name="reuse-lesson" checked={target === lessonId} onChange={() => setTarget(lessonId)} /> See tund</label> : null}
          <input className="ed-input" type="search" value={lessonQuery} onChange={(e) => setLessonQuery(e.target.value)} placeholder="Otsi tundi: nimi, tase, moodul" aria-label="Otsi tundi" />
          {loadError ? <p className="ed-hint" role="alert">{loadError}</p> : !lessons ? <LoadingState inline className="ed-hint" label="Laen tunde…" /> : (
            <ul className="st-reuse__list">
              {found.items.filter((l) => l.id !== lessonId || !worksheetId).map((l) => (
                <li key={l.id}><label className="st-reuse__row"><input type="radio" name="reuse-lesson" checked={target === l.id} onChange={() => setTarget(l.id)} /> {l.title || l.id}<small>{[l.levelStage || l.level, l.roadmapModuleTitle || l.module].filter(Boolean).join(' · ')}</small></label></li>
              ))}
              {found.total > found.items.length ? <li className="ed-hint">Veel {found.total - found.items.length} tundi — täpsusta otsingut.</li> : null}
            </ul>
          )}
        </fieldset>
        <fieldset>
          <legend>Leht</legend>
          {PHASE_SHEETS.map((p) => (
            <label key={p.id} className="st-reuse__row"><input type="radio" name="reuse-phase" checked={phase === p.id} disabled={target === lessonId && p.id === worksheetId} onChange={() => setPhase(p.id)} /> {p.label}{target ? <small>{target === lessonId && p.id === worksheetId ? 'see leht' : phaseState(p.id)}</small> : null}</label>
          ))}
        </fieldset>
        <p className="ed-hint">Ülesanne lisatakse valitud lehe lõppu mustandina; avaldatud versiooni õpilased ei näe enne, kui keegi lehe avaldab.{mode === 'move' ? ' Teisaldamisel eemaldatakse see siit lehelt pärast kopeerimist.' : ''}</p>
        {error ? <p className="st-banner error" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}

/**
 * „Uus mallist”: the built-in sheets and the templates staff saved (whole sheets and whole lessons). A sheet template
 * replaces the open sheet in the editor (undoable); a lesson template on a lesson page also fills the empty phases.
 */
export function TemplateDialog({ service, user, builtIns = [], lessonPage = false, onClose, onUseSheet, onUseLesson }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const isAdmin = Boolean(user?.roles?.includes?.('admin'));

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => service?.list?.() || [])
      .then((items) => { if (alive) setList(items); })
      .catch((err) => { if (alive) { setList([]); setError(err.message || 'Malle ei saanud laadida.'); } });
    return () => { alive = false; };
  }, [service]);

  const archive = async (template) => {
    if (!globalThis.confirm(`Arhiveeri mall „${template.title}”? Seda ei näidata enam kellelegi.`)) return;
    try {
      await service.archive(template.id, user);
      setList((items) => items.filter((item) => item.id !== template.id));
    } catch (err) { setError(err.message || 'Malli ei saanud arhiveerida.'); }
  };
  const shown = filterTemplates(list || [], text);

  return (
    <Modal open title="Uus mallist" onClose={onClose} className="st-reuse-modal">
      <div className="st-reuse">
        <input className="ed-input" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Otsi malli" aria-label="Otsi malli" />
        <ul className="st-reuse__list st-reuse__templates">
          {builtIns.filter((b) => !text || b.title.toLocaleLowerCase('et').includes(text.toLocaleLowerCase('et'))).map((b) => (
            <li key={b.id}><span><b>{b.title}</b><small>Leht · KeeleSepa näidis</small></span><button type="button" className="st-btn" onClick={() => onUseSheet(b.make(), b.title)}>Kasuta</button></li>
          ))}
          {shown.map((t) => (
            <li key={t.id}>
              <span><b>{t.title}</b><small>{TEMPLATE_KINDS[t.kind] || 'Mall'}{t.kind === 'lesson' ? ` · ${t.sheets.map((s) => s.label || phaseLabel(s.phase)).join(', ')}` : ''}{t.level ? ` · ${t.level}` : ''}{t.ownerName ? ` · ${t.ownerName}` : ''}</small></span>
              {t.kind === 'lesson' && lessonPage ? <button type="button" className="st-btn primary" onClick={() => onUseLesson(t)}>Täida tund</button> : null}
              {t.kind === 'lesson'
                ? t.sheets.map((s, i) => <button key={`${s.phase}-${i}`} type="button" className="st-btn" onClick={() => onUseSheet(s.doc, `${t.title} · ${s.label || phaseLabel(s.phase)}`)} title="Ainult see leht sellele lehele">{s.label || phaseLabel(s.phase) || `Leht ${i + 1}`}</button>)
                : <button type="button" className="st-btn" onClick={() => onUseSheet(t.sheets[0].doc, t.title)}>Kasuta</button>}
              {t.ownerUid === user?.uid || isAdmin ? <button type="button" className="st-btn" onClick={() => archive(t)} aria-label={`Arhiveeri mall ${t.title}`}>Arhiveeri</button> : null}
            </li>
          ))}
          {list === null ? <li className="ed-hint">Laen malle…</li> : null}
          {list && !list.length && !error ? <li className="ed-hint">Salvestatud malle veel pole. Tee leht valmis ja vali „Fail” → „Salvesta leht mallina…”.</li> : null}
        </ul>
        {error ? <p className="ed-hint" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}
