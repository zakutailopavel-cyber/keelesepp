import { useState } from 'react';
import { Button, Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { PROGRESS_KINDS, PROGRESS_LEVELS, progressPointsService } from '../../services/firebase/progressPoints.js';
import { localDate } from '../../utils/localDate.js';
import ProficiencyChart from './ProficiencyChart.jsx';
import { examGaps, targetLevelOf } from './levelCurve.js';
import { changeText, curveSummary, formatPercent } from './proficiencyCurve.js';
import { useLevelCurve } from './useLevelCurve.js';
import './proficiency.css';

const KIND_CHOICES = ['teacher', 'exam'];
const emptyForm = (level) => ({ date: localDate(), level: PROGRESS_LEVELS.includes(level) ? level : 'B1', percent: '', kind: 'teacher', label: '' });
const listSheets = (studentId) => homeworkService.listWorksheetAssignmentsByStudentIds([studentId]);

// „Keeleoskus tasemele” on the student card (owner 2026-11-04): the curve computed from the course goals the student
// masters (levelCurve.js), and the measured points the admin and the student's teacher add: the start („Algus”),
// corrections, mock exams. A teacher changes / deletes his own points, the admin any. The student and the linked
// parents see the curve. The admin is warned when a mock exam is far from the curve.
export default function ProgressPointsCard({ student, user, isAdmin = false, service = progressPointsService, loadSheets = listSheets, loadGoals, className = 'profile-wide' }) {
  const studentId = student?.id;
  const sheets = useAsyncData(() => (studentId ? Promise.resolve().then(() => loadSheets(studentId)).catch(() => []) : Promise.resolve([])), [loadSheets, studentId]);
  const targetLevel = targetLevelOf(student);
  const { curve, level, points, failed, reload } = useLevelCurve({ studentIds: [studentId], assignments: sheets.data || [], targetLevel, service, ...(loadGoals ? { loadGoals } : {}) });
  const [form, setForm] = useState(() => emptyForm(targetLevel));
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!studentId) return null;
  const mine = (point) => isAdmin || point.createdBy === user?.uid;
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const reset = () => { setEditing(null); setForm(emptyForm(targetLevel)); setError(''); };
  const summary = curve ? curveSummary(curve) : null;
  const gaps = isAdmin && curve ? examGaps(curve) : [];

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const input = { ...form, studentId };
      if (editing) await service.update(editing.id, input, user, editing);
      else await service.add(input, user);
      reset();
      reload();
    } catch (failure) {
      setError(failure?.message || 'Salvestamine ebaõnnestus.');
    } finally { setBusy(false); }
  }
  async function remove(point) {
    if (!globalThis.confirm?.(`Kustuta mõõtmine ${point.date} (${formatPercent(point.percent)})?`)) return;
    setBusy(true);
    try { await service.remove(point.id); reload(); } catch (failure) { setError(failure?.message || 'Kustutamine ebaõnnestus.'); } finally { setBusy(false); }
  }

  return <Card className={`${className} pf-staff`}>
    <div className="section-heading"><div><span className="eyebrow">Näevad õpilane ja lapsevanem</span><h2>Keeleoskus tasemele {level || ''}</h2></div></div>
    {failed ? <p className="form-hint">Mõõtmisi ei saanud laadida.</p> : null}
    {summary?.latest ? <p className="form-hint"><strong>{formatPercent(summary.latest.percent)}</strong>{summary.change !== null ? ` · ${changeText(summary)}` : ''} · {curve.total} kursuse eesmärki, „Oskan” = ≥ 70 % vähemalt kahes töölehes.</p> : null}
    {gaps.map((item) => <p key={item.exam.id || item.exam.date} className="pf-warn" role="alert">{item.exam.label || 'Proovieksam'} {item.exam.date.split('-').reverse().join('.')}: {formatPercent(item.exam.percent)}, kõver samal ajal {formatPercent(item.curve)} (vahe {item.gap > 0 ? '+' : ''}{item.gap} punkti). Vaata üle alguspunkt või eksam.</p>)}
    {curve && curve.line.length + curve.exams.length >= 2 ? <ProficiencyChart line={curve.line} exams={curve.exams} level={level} /> : null}
    {points.length ? <ul className="pf-points" aria-label="Mõõtmised">{[...points].reverse().map((point) => <li key={point.id}>
      <span><strong>{point.date.split('-').reverse().join('.')} · {point.level} · {formatPercent(point.percent)}</strong> <small>{point.label || PROGRESS_KINDS[point.kind]?.label}{point.createdByName ? ` · ${point.createdByName}` : ''}</small></span>
      {mine(point) ? <span className="pf-actions">
        <Button variant="secondary" disabled={busy} onClick={() => { setEditing(point); setForm({ date: point.date, level: point.level, percent: String(point.percent), kind: point.kind, label: point.label }); }}>Muuda</Button>
        <Button variant="secondary" disabled={busy} onClick={() => remove(point)}>Kustuta</Button>
      </span> : null}
    </li>)}</ul> : <p className="form-hint">Mõõtmisi veel pole. Lisa alguspunkt („Õpetaja hinnang”, nimetus „Algus”): kui suur osa tasemest oli õppima tulles käes (0–100 %).</p>}
    <form onSubmit={save} aria-label={editing ? 'Muuda mõõtmist' : 'Lisa mõõtmine'}>
      <label>Kuupäev<input type="date" value={form.date} onChange={set('date')} required /></label>
      <label>Tase<select value={form.level} onChange={set('level')}>{PROGRESS_LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Tulemus %<input type="number" inputMode="decimal" min="0" max="100" step="0.5" value={form.percent} onChange={set('percent')} required /></label>
      <label>Liik<select value={form.kind} onChange={set('kind')}>{(form.kind === 'estimate' ? [...KIND_CHOICES, 'estimate'] : KIND_CHOICES).map((kind) => <option key={kind} value={kind}>{PROGRESS_KINDS[kind].label}</option>)}</select></label>
      <label>Nimetus (valikuline)<input type="text" maxLength={80} value={form.label} placeholder={form.kind === 'exam' ? 'Proovieksam' : 'Algus'} onChange={set('label')} /></label>
      <span className="pf-actions">
        <Button type="submit" loading={busy}>{editing ? 'Salvesta' : 'Lisa mõõtmine'}</Button>
        {editing ? <Button variant="secondary" onClick={reset}>Loobu</Button> : null}
      </span>
    </form>
    <p className="form-hint">Õpetaja hinnang (alguspunkt või parandus) on kõvera uus algus; edasi liigutavad kõverat ainult uued „Oskan” eesmärgid. Proovieksam on ainult kontroll ega muuda kõverat.</p>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </Card>;
}
