import { Plus, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';

const EXERCISE_TYPES = [
  ['fill', 'Täida lünk'],
  ['choice', 'Vali vastus'],
  ['writing', 'Kirjutamine'],
  ['order', 'Koosta lause'],
  ['match', 'Sobita paarid'],
  ['reading', 'Lugemine'],
  ['translate', 'Tõlkimine'],
];

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correct: 0 });
const emptyPair = () => ({ left: '', right: '' });

function initialValues(item) {
  const source = item?.source || {};
  const questions = (source.questions || []).map((question) => {
    const options = [...(question.options || question.opts || [])];
    while (options.length < 4) options.push('');
    return { ...question, question: question.question || question.q || '', options, correct: question.correct ?? 0 };
  });
  return {
    title: item?.title || '',
    exerciseType: source.type || 'fill',
    subject: item?.subject || '',
    level: item?.level || '',
    topic: item?.topic || '',
    description: source.description || item?.description || '',
    tags: (source.tags || []).join(', '),
    text: source.text || '',
    task: source.task || source.prompt || '',
    lines: source.lines || 7,
    sentence: source.sentence || '',
    passage: source.passage || '',
    questions,
    pairs: (source.pairs || source.items || []).map((pair) => ({ left: pair.l || pair.left || pair.from || '', right: pair.r || pair.right || pair.to || '' })),
  };
}

function QuestionEditor({ question, index, onChange, onRemove }) {
  const fieldId = useId();
  const updateOption = (optionIndex, value) => onChange({ ...question, options: question.options.map((option, currentIndex) => currentIndex === optionIndex ? value : option) });
  return (
    <section className="exercise-row-editor">
      <header><strong>Küsimus {index + 1}</strong><Button variant="danger" aria-label={`Eemalda küsimus ${index + 1}`} onClick={onRemove}><Trash2 size={15} /></Button></header>
      <Input id={`${fieldId}-question`} className="form-grid__wide" label="Küsimus" value={question.question} onChange={(event) => onChange({ ...question, question: event.target.value })} />
      {question.options.map((option, optionIndex) => <Input id={`${fieldId}-option-${optionIndex}`} label={`Vastus ${optionIndex + 1}`} value={option} key={optionIndex} onChange={(event) => updateOption(optionIndex, event.target.value)} />)}
      <Select id={`${fieldId}-correct`} label="Õige vastus" value={question.correct} onChange={(event) => onChange({ ...question, correct: Number(event.target.value) })}>
        {question.options.map((_, optionIndex) => <option value={optionIndex} key={optionIndex}>Vastus {optionIndex + 1}</option>)}
      </Select>
    </section>
  );
}

function PairEditor({ pair, index, translate, onChange, onRemove }) {
  const fieldId = useId();
  return (
    <section className="exercise-pair-editor">
      <Input id={`${fieldId}-left`} label={translate ? 'Lähtetekst' : 'Vasak pool'} value={pair.left} onChange={(event) => onChange({ ...pair, left: event.target.value })} />
      <Input id={`${fieldId}-right`} label={translate ? 'Tõlge' : 'Parem pool'} value={pair.right} onChange={(event) => onChange({ ...pair, right: event.target.value })} />
      <Button variant="danger" aria-label={`Eemalda paar ${index + 1}`} onClick={onRemove}><Trash2 size={15} /></Button>
    </section>
  );
}

export default function ExerciseEditor({ item = null, repository, user, onClose, onSaved }) {
  const formId = useId();
  const [values, setValues] = useState(() => initialValues(item));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));
  const updateQuestion = (index, question) => update('questions', values.questions.map((current, currentIndex) => currentIndex === index ? question : current));
  const updatePair = (index, pair) => update('pairs', values.pairs.map((current, currentIndex) => currentIndex === index ? pair : current));
  const questionsVisible = ['choice', 'reading'].includes(values.exerciseType);
  const pairsVisible = ['match', 'translate'].includes(values.exerciseType);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Pealkiri on kohustuslik.';
    if (!values.subject.trim()) nextErrors.subject = 'Õppeaine on kohustuslik.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    setSaveError('');
    try {
      onSaved(await repository.saveExercise({ item, values, user }));
    } catch (error) {
      setSaveError(error.message || 'Harjutuse salvestamine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title={item ? `Muuda harjutust: ${item.title}` : 'Loo interaktiivne harjutus'} className="modal--editor" onClose={onClose} footer={<><Button variant="secondary" disabled={saving} onClick={onClose}>Tühista</Button><Button type="submit" form={formId} loading={saving}>Salvesta harjutus</Button></>}>
      <form id={formId} className="material-editor" onSubmit={submit}>
        {saveError ? <div className="action-error" role="alert">{saveError}</div> : null}
        <div className="form-grid">
          <Input id={`${formId}-title`} className="form-grid__wide" label="Pealkiri *" value={values.title} error={errors.title} maxLength={180} onChange={(event) => update('title', event.target.value)} />
          <Select id={`${formId}-type`} label="Harjutuse tüüp" value={values.exerciseType} disabled={Boolean(item)} onChange={(event) => update('exerciseType', event.target.value)}>{EXERCISE_TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Select>
          <Input id={`${formId}-subject`} label="Õppeaine *" value={values.subject} error={errors.subject} maxLength={100} onChange={(event) => update('subject', event.target.value)} />
          <Input id={`${formId}-level`} label="Tase" value={values.level} maxLength={80} onChange={(event) => update('level', event.target.value)} />
          <Input id={`${formId}-topic`} label="Teema" value={values.topic} maxLength={140} onChange={(event) => update('topic', event.target.value)} />
          <Input id={`${formId}-tags`} className="form-grid__wide" label="Märksõnad" value={values.tags} onChange={(event) => update('tags', event.target.value)} placeholder="komadega eraldatud" />
          <label className="textarea-field form-grid__wide"><span>Kirjeldus</span><textarea rows={3} value={values.description} onChange={(event) => update('description', event.target.value)} /></label>
        </div>

        <section className="exercise-content-editor">
          <div className="section-heading"><div><span>Interaktiivne sisu</span><h2>{EXERCISE_TYPES.find(([value]) => value === values.exerciseType)?.[1]}</h2></div></div>
          {values.exerciseType === 'fill' ? <div className="textarea-field"><label htmlFor={`${formId}-fill-text`}>Tekst koos vastustega</label><textarea id={`${formId}-fill-text`} rows={7} value={values.text} onChange={(event) => update('text', event.target.value)} placeholder="Hommikul ma [ärkan] kell seitse." /><small>Õige vastus kirjutatakse nurksulgudesse.</small></div> : null}
          {values.exerciseType === 'writing' ? <><div className="textarea-field"><label htmlFor={`${formId}-writing-task`}>Ülesanne</label><textarea id={`${formId}-writing-task`} rows={6} value={values.task} onChange={(event) => update('task', event.target.value)} /></div><Input id={`${formId}-lines`} label="Vastuseridade arv" type="number" min="1" max="20" value={values.lines} onChange={(event) => update('lines', event.target.value)} /></> : null}
          {values.exerciseType === 'order' ? <div className="textarea-field"><label htmlFor={`${formId}-sentence`}>Õige lause</label><textarea id={`${formId}-sentence`} rows={4} value={values.sentence} onChange={(event) => update('sentence', event.target.value)} placeholder="Ma õpin iga päev eesti keelt." /><small>Õpilasele näidatakse sõnu segatud järjekorras.</small></div> : null}
          {values.exerciseType === 'reading' ? <div className="textarea-field"><label htmlFor={`${formId}-passage`}>Lugemistekst</label><textarea id={`${formId}-passage`} rows={9} value={values.passage} onChange={(event) => update('passage', event.target.value)} /></div> : null}
          {questionsVisible ? <div className="exercise-repeat-list">{values.questions.map((question, index) => <QuestionEditor question={question} index={index} key={index} onChange={(next) => updateQuestion(index, next)} onRemove={() => update('questions', values.questions.filter((_, currentIndex) => currentIndex !== index))} />)}<Button variant="secondary" onClick={() => update('questions', [...values.questions, emptyQuestion()])}><Plus size={16} /> Lisa küsimus</Button></div> : null}
          {pairsVisible ? <div className="exercise-repeat-list">{values.pairs.map((pair, index) => <PairEditor pair={pair} index={index} translate={values.exerciseType === 'translate'} key={index} onChange={(next) => updatePair(index, next)} onRemove={() => update('pairs', values.pairs.filter((_, currentIndex) => currentIndex !== index))} />)}<Button variant="secondary" onClick={() => update('pairs', [...values.pairs, emptyPair()])}><Plus size={16} /> Lisa paar</Button></div> : null}
        </section>
      </form>
    </Modal>
  );
}
