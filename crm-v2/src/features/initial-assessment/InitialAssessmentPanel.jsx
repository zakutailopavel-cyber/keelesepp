import { ClipboardCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Select } from '../../components/ui/index.js';
import { initialAssessmentsService } from '../../services/firebase/initialAssessments.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import {
  averageScore, buildInitialAssessment, focusTopics, LIMITS, newTopicId, normalizeScore, OVERALL_STATUSES, PRIORITIES, STATUSES, statusForScore,
} from './assessmentModel.js';
import './initialAssessment.css';

const scoreLabel = (score) => (score === null || score === undefined ? '—' : `${score}%`);
const StatusBadge = ({ status }) => <Badge tone={STATUSES[status]?.tone || 'neutral'}>{STATUSES[status]?.label || status}</Badge>;

function RowsView({ title, rows, withPriority }) {
  return <section className="ia-section"><h3>{title} <small>keskmine {scoreLabel(averageScore(rows))}</small></h3>
    <div className="ia-table-wrap"><table className="ia-table"><thead><tr><th>Teema</th><th>Tulemus</th><th>Seis</th>{withPriority ? <th>Prioriteet</th> : null}<th>Kommentaar</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}><td>{row.name}</td><td className="ia-score">{scoreLabel(row.score)}</td><td><StatusBadge status={row.status} /></td>{withPriority ? <td>{PRIORITIES[row.priority]}</td> : null}<td>{row.comment || '—'}</td></tr>)}</tbody></table></div>
  </section>;
}

function RowsEditor({ title, rows, withPriority, max, onChange }) {
  const [newName, setNewName] = useState('');
  const patch = (index, change) => onChange(rows.map((row, i) => {
    if (i !== index) return row;
    const next = { ...row, ...change };
    // a new score suggests a status; the teacher can still pick another one afterwards
    if ('score' in change) next.status = statusForScore(next.score);
    return next;
  }));
  const add = () => {
    const name = newName.trim();
    if (!name || rows.length >= max) return;
    onChange([...rows, { id: newTopicId(name, rows), name, score: null, status: 'not_tested', comment: '', ...(withPriority ? { priority: 'medium' } : {}) }]);
    setNewName('');
  };
  return <section className="ia-section"><h3>{title}</h3>
    <div className="ia-table-wrap"><table className="ia-table ia-table--edit"><thead><tr><th>Teema</th><th>Tulemus %</th><th>Seis</th>{withPriority ? <th>Prioriteet</th> : null}<th>Kommentaar</th>{withPriority ? <th><span className="sr-only">Eemalda</span></th> : null}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={row.id}>
        <td><input aria-label={`${title}: teema ${index + 1}`} value={row.name} maxLength={160} onChange={(event) => patch(index, { name: event.target.value })} /></td>
        <td><input aria-label={`${row.name}: tulemus`} inputMode="numeric" className="ia-score-input" value={row.score ?? ''} onChange={(event) => patch(index, { score: normalizeScore(event.target.value) })} /></td>
        <td><select aria-label={`${row.name}: seis`} value={row.status} onChange={(event) => patch(index, { status: event.target.value })}>{Object.entries(STATUSES).map(([id, status]) => <option key={id} value={id}>{status.label}</option>)}</select></td>
        {withPriority ? <td><select aria-label={`${row.name}: prioriteet`} value={row.priority} onChange={(event) => patch(index, { priority: event.target.value })}>{Object.entries(PRIORITIES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></td> : null}
        <td><input aria-label={`${row.name}: kommentaar`} value={row.comment} maxLength={1000} onChange={(event) => patch(index, { comment: event.target.value })} /></td>
        {withPriority ? <td><button type="button" className="ia-remove" aria-label={`Eemalda ${row.name}`} onClick={() => onChange(rows.filter((_, i) => i !== index))}><Trash2 size={15} /></button></td> : null}
      </tr>)}</tbody></table></div>
    {withPriority ? <div className="ia-add"><Input label={`Uus teema (${title.toLocaleLowerCase('et')})`} value={newName} maxLength={160} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} /><Button variant="secondary" disabled={!newName.trim() || rows.length >= max} onClick={add}><Plus size={16} /> Lisa teema</Button></div> : null}
  </section>;
}

const asText = (list) => (Array.isArray(list) ? list.join('\n') : String(list || ''));

export default function InitialAssessmentPanel({ student, user, service = initialAssessmentsService }) {
  const [state, setState] = useState({ loading: true, error: '', assessment: null });
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => service.get(student))
      .then((assessment) => { if (alive) setState({ loading: false, error: '', assessment }); })
      .catch((error) => { if (alive) setState({ loading: false, error: firebaseErrorMessage(error), assessment: null }); });
    return () => { alive = false; };
  }, [service, student]);

  if (state.loading) return <Card><LoadingState label="Laen esmast hindamist…" /></Card>;
  if (state.error) return <Card><ErrorState message={state.error} /></Card>;

  const startEdit = () => {
    const source = state.assessment || buildInitialAssessment(student, user);
    setDraft({ ...source, strengths: asText(source.strengths), developmentAreas: asText(source.developmentAreas) });
    setSaveError('');
  };
  const save = async () => {
    setSaving(true); setSaveError('');
    try {
      const assessment = await service.save(student, draft, user, state.assessment);
      setState({ loading: false, error: '', assessment });
      setDraft(null);
    } catch (error) {
      setSaveError(firebaseErrorMessage(error));
    } finally { setSaving(false); }
  };

  if (draft) {
    const set = (change) => setDraft((current) => ({ ...current, ...change }));
    return <Card className="ia-card" aria-label="Esmase hindamise muutmine">
      <div className="section-heading"><div><span className="eyebrow">Esmane hindamine</span><h2>{state.assessment ? 'Muuda hindamist' : 'Uus esmane hindamine'}</h2></div></div>
      <p className="form-hint">Protsendid ei määra taset automaatselt: praeguse taseme, eesmärgi ja üldseisu valib õpetaja.</p>
      <div className="ia-meta-form">
        <Input label="Hindamise kuupäev" type="date" value={draft.assessmentDate} onChange={(event) => set({ assessmentDate: event.target.value })} />
        <Input label="Praegune tase" value={draft.currentLevel} maxLength={LIMITS.level} onChange={(event) => set({ currentLevel: event.target.value })} />
        <Input label="Sihttase" value={draft.targetLevel} maxLength={LIMITS.level} onChange={(event) => set({ targetLevel: event.target.value })} />
        <Select label="Üldseis" value={draft.overallStatus} onChange={(event) => set({ overallStatus: event.target.value })}>{OVERALL_STATUSES.map((id) => <option key={id} value={id}>{STATUSES[id].label}</option>)}</Select>
      </div>
      <RowsEditor title="Oskused" rows={draft.skillsData} max={LIMITS.skills} onChange={(skillsData) => set({ skillsData })} />
      <RowsEditor title="Grammatika" rows={draft.grammarData} withPriority max={LIMITS.topics} onChange={(grammarData) => set({ grammarData })} />
      <RowsEditor title="Sõnavara" rows={draft.vocabularyData} withPriority max={LIMITS.topics} onChange={(vocabularyData) => set({ vocabularyData })} />
      <div className="ia-notes-form">
        <label className="field"><span className="field__label">Tugevused (üks rea kohta)</span><textarea rows={4} value={draft.strengths} onChange={(event) => set({ strengths: event.target.value })} /></label>
        <label className="field"><span className="field__label">Arenguvajadused (üks rea kohta)</span><textarea rows={4} value={draft.developmentAreas} onChange={(event) => set({ developmentAreas: event.target.value })} /></label>
        <label className="field ia-wide"><span className="field__label">Lähim õppefookus</span><textarea rows={4} maxLength={LIMITS.focus} value={draft.learningFocus} onChange={(event) => set({ learningFocus: event.target.value })} /></label>
      </div>
      {saveError ? <p className="form-error" role="alert">{saveError}</p> : null}
      <div className="ia-actions"><Button variant="secondary" disabled={saving} onClick={() => setDraft(null)}>Loobu</Button><Button loading={saving} onClick={save}>Salvesta hindamine</Button></div>
    </Card>;
  }

  const assessment = state.assessment;
  if (!assessment) {
    return <Card><EmptyState title="Esmast hindamist ei ole veel tehtud" description="Salvesta õpilase algtase teemade kaupa: see jääb võrdluspunktiks ega muuda tunde ega oskuste kaarti." action={<Button onClick={startEdit}><ClipboardCheck size={17} /> Loo esmane hindamine</Button>} /></Card>;
  }
  const focus = focusTopics(assessment);
  return <Card className="ia-card" aria-label="Esmane hindamine">
    <div className="section-heading"><div><span className="eyebrow">Esmane hindamine · {assessment.assessmentDate}</span><h2>{assessment.currentLevel || 'Tase määramata'} → {assessment.targetLevel || 'eesmärk määramata'}</h2></div><Button variant="secondary" onClick={startEdit}><Pencil size={16} /> Muuda</Button></div>
    <div className="ia-summary"><div><small>Üldseis</small><StatusBadge status={assessment.overallStatus} /></div><div><small>Grammatika</small><strong>{scoreLabel(averageScore(assessment.grammarData))}</strong></div><div><small>Sõnavara</small><strong>{scoreLabel(averageScore(assessment.vocabularyData))}</strong></div><div><small>Hindas</small><strong>{assessment.updatedByName || assessment.createdByName || '—'}</strong></div></div>
    {focus.length ? <section className="ia-section"><h3>Esimesena harjutada</h3><ul className="ia-focus">{focus.map((row) => <li key={row.id}><span>{row.name}</span><strong>{scoreLabel(row.score)}</strong></li>)}</ul></section> : null}
    <RowsView title="Oskused" rows={assessment.skillsData} />
    <RowsView title="Grammatika" rows={assessment.grammarData} withPriority />
    <RowsView title="Sõnavara" rows={assessment.vocabularyData} withPriority />
    <div className="ia-notes"><section><h3>Tugevused</h3>{assessment.strengths.length ? <ul>{assessment.strengths.map((item) => <li key={item}>{item}</li>)}</ul> : <p>—</p>}</section><section><h3>Arenguvajadused</h3>{assessment.developmentAreas.length ? <ul>{assessment.developmentAreas.map((item) => <li key={item}>{item}</li>)}</ul> : <p>—</p>}</section><section className="ia-wide"><h3>Lähim õppefookus</h3><p className="ia-pre">{assessment.learningFocus || '—'}</p></section></div>
  </Card>;
}
