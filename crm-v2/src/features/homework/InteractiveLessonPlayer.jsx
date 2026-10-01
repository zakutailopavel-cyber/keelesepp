import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, LoadingState, Modal } from '../../components/ui/index.js';
import { interactiveAssignmentsService } from '../../services/firebase/interactiveAssignments.js';
import { ASSIGNMENT_STATUS_LABEL, RESPONSE_KIND_LABEL, answerText, inlineGapParts, missingRequired, progress } from './interactiveLessonModel.js';
import './interactiveLesson.css';

const draftKey = (uid, id) => `keelesepp.interactive.${uid}.${id}`;
function readDraft(uid, record) {
  try {
    const raw = JSON.parse(globalThis.localStorage?.getItem(draftKey(uid, record.id)) || 'null');
    return raw && raw.revision === record.revision ? raw : null;
  } catch { return null; }
}
function writeDraft(uid, record, answers, current) {
  try { globalThis.localStorage?.setItem(draftKey(uid, record.id), JSON.stringify({ revision: record.revision, answers, currentActivityId: current })); } catch { /* private mode */ }
}
function clearDraft(uid, id) {
  try { globalThis.localStorage?.removeItem(draftKey(uid, id)); } catch { /* private mode */ }
}

function Response({ activity, value, onChange, disabled }) {
  const spec = activity.response;
  if (!spec) return <p className="il-hint">See on suuline või õpetaja juhitud ülesanne: siia ei pea midagi kirjutama.</p>;
  const label = spec.required ? 'Sinu vastus *' : 'Sinu vastus';
  if (spec.mode === 'short_text' || spec.mode === 'long_text') {
    const Field = spec.mode === 'long_text' ? 'textarea' : 'input';
    return <label className="il-field"><span>{label}</span><Field aria-label="Sinu vastus" rows={spec.mode === 'long_text' ? 6 : undefined} maxLength={spec.mode === 'short_text' ? 500 : 10000} value={typeof value === 'string' ? value : ''} disabled={disabled} onChange={(event) => onChange(event.target.value)} /></label>;
  }
  if (spec.mode === 'gaps') {
    const parts = inlineGapParts(activity);
    const set = (id, text) => onChange({ ...(value || {}), [id]: text });
    if (parts) {
      return <fieldset className="il-inline-gaps"><legend>{label}</legend>{parts.map((part, index) => <span key={index}>{part}{index < spec.items.length ? <input aria-label={spec.items[index].label} maxLength={500} value={value?.[spec.items[index].id] || ''} disabled={disabled} onChange={(event) => set(spec.items[index].id, event.target.value)} /> : null}</span>)}</fieldset>;
    }
    return <fieldset className="il-options"><legend>{label}</legend>{spec.items.map((item) => <label key={item.id} className="il-gap"><span>{item.label}</span><input maxLength={500} value={value?.[item.id] || ''} disabled={disabled} onChange={(event) => set(item.id, event.target.value)} /></label>)}</fieldset>;
  }
  const single = spec.mode === 'single_choice';
  const toggle = (id, checked) => {
    if (single) { onChange(id); return; }
    const selected = new Set(Array.isArray(value) ? value : []);
    if (checked) selected.add(id); else selected.delete(id);
    onChange([...selected]);
  };
  return <fieldset className="il-options"><legend>{label}</legend>{spec.items.map((item) => <label key={item.id} className="il-choice"><input type={single ? 'radio' : 'checkbox'} name={`il-${activity.id}`} checked={single ? value === item.id : Array.isArray(value) && value.includes(item.id)} disabled={disabled} onChange={(event) => toggle(item.id, event.target.checked)} /><span>{item.label}</span></label>)}</fieldset>;
}

/**
 * An interactive lesson assigned in CRM v1, opened in CRM v2. Students answer, save and send it to the teacher;
 * teachers read the answers with the expected solution and send feedback. Data stays in the v1 assignment.
 */
export default function InteractiveLessonPlayer({ assignmentId, user, staff = false, repository = interactiveAssignmentsService, onClose, onChanged }) {
  const [record, setRecord] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const load = async () => {
    setError('');
    const next = await repository.get(assignmentId);
    const draft = !staff && next.status === 'active' ? readDraft(user.uid, next) : null;
    setRecord(next);
    setAnswers(draft?.answers || next.answers || {});
    setCurrent(draft?.currentActivityId || next.currentActivityId || next.lesson?.activities?.[0]?.id || '');
    setFeedback(next.feedback || '');
    if (draft) setMessage('Sinu salvestamata vastused taastati. Salvesta need.');
  };
  useEffect(() => {
    let alive = true;
    load().catch((loadError) => { if (alive) setError(loadError.message || 'Tundi ei saanud avada.'); });
    return () => { alive = false; };
  }, [assignmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activities = record?.lesson?.activities || [];
  const index = Math.max(0, activities.findIndex((activity) => activity.id === current));
  const activity = activities[index];
  const editable = !staff && record?.status === 'active';
  const counts = progress(activities, answers);

  const change = (value) => {
    const next = { ...answers, [activity.id]: value };
    setAnswers(next);
    writeDraft(user.uid, record, next, activity.id);
    setMessage('Salvestamata vastused (kohalik varukoopia).');
  };
  const go = (step) => {
    const next = activities[index + step];
    if (!next) return;
    setCurrent(next.id);
    if (editable) writeDraft(user.uid, record, answers, next.id);
  };
  const run = async (key, action) => {
    setBusy(key); setError('');
    try { await action(); } catch (actionError) { setError(actionError.message || 'Toiming ebaõnnestus.'); } finally { setBusy(''); }
  };
  const save = () => run('save', async () => {
    await repository.save(record, answers, activity.id);
    clearDraft(user.uid, record.id);
    await load();
    setMessage('Vastused salvestati.');
    onChanged?.();
  });
  const submit = () => {
    const missing = missingRequired(activities, answers);
    if (missing.length) { setError(`Vasta enne saatmist: ${missing.map((item) => item.title).join(', ')}.`); setCurrent(missing[0].id); return; }
    if (!globalThis.confirm('Saata vastused õpetajale? Pärast saatmist neid enam muuta ei saa.')) return;
    run('submit', async () => {
      await repository.submit(record, answers, activity.id);
      clearDraft(user.uid, record.id);
      await load();
      setMessage('Vastused saadeti õpetajale.');
      onChanged?.();
    });
  };
  const review = () => run('review', async () => {
    if (!feedback.trim()) throw new Error('Kirjuta tagasiside.');
    await repository.review(record, feedback.trim());
    await load();
    setMessage('Tagasiside saadeti õpilasele.');
    onChanged?.();
  });

  const expected = staff && activity ? record?.teacherContent?.activities?.find((item) => item.id === activity.id)?.routes?.[record.route] : null;
  const footer = record ? <>
    <span className="il-progress">{counts.answered}/{counts.total} vastatud</span>
    <Button variant="secondary" onClick={onClose}>Sulge</Button>
    {editable ? <Button variant="secondary" loading={busy === 'save'} disabled={Boolean(busy)} onClick={save}><Save size={16} /> Salvesta</Button> : null}
    {editable ? <Button loading={busy === 'submit'} disabled={Boolean(busy)} onClick={submit}><Send size={16} /> Saada õpetajale</Button> : null}
    {staff && record.status === 'submitted' ? <Button loading={busy === 'review'} disabled={Boolean(busy)} onClick={review}><Send size={16} /> Saada tagasiside</Button> : null}
  </> : <Button variant="secondary" onClick={onClose}>Sulge</Button>;

  return (
    <Modal open title={record?.title || 'Interaktiivne tund'} onClose={onClose} footer={footer}>
      {!record && !error ? <LoadingState label="Laen tundi…" /> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {record ? (
        <div className="il">
          <div className="il-head">
            <Badge tone={record.status === 'active' ? 'info' : 'success'}>{ASSIGNMENT_STATUS_LABEL[record.status] || record.status}</Badge>
            {staff ? <span className="il-student">{record.studentName}</span> : null}
            {message ? <span className="il-message" role="status">{message}</span> : null}
          </div>
          {record.feedback && !staff ? <div className="il-feedback"><strong>Õpetaja tagasiside</strong><p>{record.feedback}</p></div> : null}
          <nav className="il-steps" aria-label="Ülesanded">
            {activities.map((item, position) => <button type="button" key={item.id} aria-current={item.id === activity?.id ? 'step' : undefined} onClick={() => setCurrent(item.id)}>{position + 1}. {item.title}</button>)}
          </nav>
          {activity ? (
            <section className="il-activity" aria-label={activity.title}>
              <span className="eyebrow">Ülesanne {index + 1} / {activities.length} · {RESPONSE_KIND_LABEL[activity.response?.mode] || 'Suuline või õpetaja juhitud'}</span>
              <h3>{activity.title}</h3>
              {inlineGapParts(activity) && editable ? null : <p className="il-prompt">{activity.prompt}</p>}
              {(activity.assets || []).map((asset) => <figure key={asset.id}><img src={asset.url} alt={asset.alt} />{asset.caption ? <figcaption>{asset.caption}</figcaption> : null}</figure>)}
              {editable
                ? <Response activity={activity} value={answers[activity.id]} onChange={change} disabled={!editable || Boolean(busy)} />
                : <div className="il-answer"><span>{staff ? 'Õpilase vastus' : 'Sinu vastus'}</span><pre>{answerText(activity, answers[activity.id])}</pre></div>}
              {expected ? <div className="il-expected"><span>Õpetajale</span><pre>{[expected.expected, expected.teacherInstruction].filter(Boolean).join('\n\n') || '—'}</pre></div> : null}
              <div className="il-nav">
                <Button variant="secondary" disabled={index === 0} onClick={() => go(-1)}><ChevronLeft size={16} /> Eelmine</Button>
                <Button variant="secondary" disabled={index === activities.length - 1} onClick={() => go(1)}>Järgmine <ChevronRight size={16} /></Button>
              </div>
            </section>
          ) : null}
          {staff && record.status === 'submitted' ? <label className="il-field"><span>Tagasiside õpilasele</span><textarea rows={4} maxLength={10000} value={feedback} onChange={(event) => setFeedback(event.target.value)} /></label> : null}
        </div>
      ) : null}
    </Modal>
  );
}
