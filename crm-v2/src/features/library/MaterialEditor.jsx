import { Plus, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { Button, Input, Modal, Select } from '../../components/ui/index.js';

const MATERIAL_TYPES = [
  ['material', 'Materjal'],
  ['lesson', 'Tunnikava'],
  ['worksheet', 'Tööleht'],
  ['homework', 'Kodutöö'],
  ['test', 'Kontrolltöö'],
];
const BLOCK_TYPES = [
  ['text', 'Tekst'],
  ['fill', 'Lünkharjutus'],
  ['writing', 'Kirjutamisülesanne'],
];
const SUPPORTED_BLOCKS = new Set(BLOCK_TYPES.map(([value]) => value));

function blockId() {
  return globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function newBlock(type = 'text') {
  if (type === 'writing') return { id: blockId(), type, title: '', task: '', lines: 5 };
  return { id: blockId(), type, title: '', text: '' };
}

function initialValues(item) {
  const source = item?.source || {};
  return {
    title: item?.title || '',
    materialType: item?.type || 'material',
    subject: item?.subject || '',
    level: item?.level || '',
    topic: item?.topic || '',
    description: source.description || item?.description || '',
    order: source.order || 0,
    examPart: source.examPart || '',
    blocks: source.worksheetData?.blocks?.map((block) => ({ ...block })) || [],
  };
}

function MaterialBlockEditor({ block, index, onChange, onRemove }) {
  const fieldId = useId();
  const supported = SUPPORTED_BLOCKS.has(block.type);
  const changeType = (type) => onChange({ ...newBlock(type), id: block.id });
  return (
    <section className="material-block-editor">
      <header><strong>Ülesanne {index + 1}</strong><Button variant="danger" aria-label={`Eemalda ülesanne ${index + 1}`} onClick={onRemove}><Trash2 size={15} /> Eemalda</Button></header>
      {supported ? (
        <>
          <Select id={`${fieldId}-type`} label="Ülesande tüüp" value={block.type} onChange={(event) => changeType(event.target.value)}>
            {BLOCK_TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </Select>
          <Input id={`${fieldId}-title`} label="Juhis või alapealkiri" value={block.title || ''} maxLength={180} onChange={(event) => onChange({ ...block, title: event.target.value })} placeholder="Näiteks: Täida lüngad" />
          <label className="textarea-field"><span>{block.type === 'writing' ? 'Ülesanne' : 'Sisu'}</span><textarea rows={5} value={block.type === 'writing' ? block.task || '' : block.text || ''} onChange={(event) => onChange({ ...block, [block.type === 'writing' ? 'task' : 'text']: event.target.value })} placeholder={block.type === 'fill' ? 'Märgi vastus nurksulgudega: Minu [nimi] on…' : 'Sisesta materjali sisu…'} /></label>
          {block.type === 'writing' ? <Input id={`${fieldId}-lines`} label="Vastuseridade arv" type="number" min="1" max="12" value={block.lines || 5} onChange={(event) => onChange({ ...block, lines: Math.min(Math.max(Number(event.target.value) || 1, 1), 12) })} /> : null}
        </>
      ) : <p className="form-hint">Keerukas „{block.type}” plokk säilitatakse muutmata. Selle muutmine lisatakse konstruktori järgmises etapis.</p>}
    </section>
  );
}

export default function MaterialEditor({ item = null, repository, user, onClose, onSaved }) {
  const formId = useId();
  const [values, setValues] = useState(() => initialValues(item));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const structured = values.materialType === 'worksheet' || values.materialType === 'test';
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));
  const updateBlock = (index, block) => update('blocks', values.blocks.map((current, currentIndex) => currentIndex === index ? block : current));
  const removeBlock = (index) => update('blocks', values.blocks.filter((_, currentIndex) => currentIndex !== index));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Pealkiri on kohustuslik.';
    if (!values.subject.trim()) nextErrors.subject = 'Õppeaine on kohustuslik.';
    if (structured && !values.blocks.length) nextErrors.blocks = 'Lisa vähemalt üks ülesanne.';
    if (structured && values.blocks.some((block) => (['text', 'fill'].includes(block.type) && !String(block.text || '').trim()) || (block.type === 'writing' && !String(block.task || '').trim()))) nextErrors.blocks = 'Täida iga lisatud ülesande sisu.';
    if (!structured && !values.description.trim()) nextErrors.description = 'Sisesta materjali kirjeldus või sisu.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    setSaveError('');
    try {
      const result = await repository.saveMaterial({ item, values, user });
      onSaved(result);
    } catch (error) {
      setSaveError(error.message || 'Materjali salvestamine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={item ? `Muuda: ${item.title}` : 'Loo õppematerjal'}
      className="modal--editor"
      onClose={onClose}
      footer={<><Button variant="secondary" disabled={saving} onClick={onClose}>Tühista</Button><Button type="submit" form={formId} loading={saving}>Salvesta</Button></>}
    >
      <form id={formId} className="material-editor" onSubmit={submit}>
        {saveError ? <div className="action-error" role="alert">{saveError}</div> : null}
        <div className="form-grid">
          <Input id={`${formId}-title`} className="form-grid__wide" label="Pealkiri *" value={values.title} error={errors.title} maxLength={180} onChange={(event) => update('title', event.target.value)} />
          <Select id={`${formId}-type`} label="Materjali tüüp" value={values.materialType} disabled={Boolean(item)} onChange={(event) => update('materialType', event.target.value)}>
            {MATERIAL_TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </Select>
          <Input id={`${formId}-subject`} label="Õppeaine *" value={values.subject} error={errors.subject} maxLength={100} onChange={(event) => update('subject', event.target.value)} placeholder="Näiteks: Eesti keel" />
          <Input id={`${formId}-level`} label="Tase või vanus" value={values.level} maxLength={80} onChange={(event) => update('level', event.target.value)} placeholder="Näiteks: A2 või 7–9" />
          <Input id={`${formId}-topic`} label="Teema" value={values.topic} maxLength={140} onChange={(event) => update('topic', event.target.value)} placeholder="Näiteks: Minu pere" />
          <label className="textarea-field form-grid__wide"><span>Kirjeldus{structured ? '' : ' *'}</span><textarea className={errors.description ? 'is-invalid' : ''} aria-invalid={Boolean(errors.description)} rows={4} value={values.description} maxLength={4000} onChange={(event) => update('description', event.target.value)} placeholder="Mida õpilane selle materjaliga õpib?" />{errors.description ? <small className="field__error">{errors.description}</small> : null}</label>
        </div>
        {structured ? (
          <section className="material-block-list">
            <div className="section-heading"><div><span>Sisu</span><h2>Ülesanded</h2></div><Button variant="secondary" onClick={() => update('blocks', [...values.blocks, newBlock('text')])}><Plus size={16} /> Lisa ülesanne</Button></div>
            {errors.blocks ? <p className="form-error">{errors.blocks}</p> : null}
            {values.blocks.map((block, index) => <MaterialBlockEditor block={block} index={index} key={block.id || index} onChange={(next) => updateBlock(index, next)} onRemove={() => removeBlock(index)} />)}
            {!values.blocks.length ? <button className="material-block-empty" type="button" onClick={() => update('blocks', [newBlock('text')])}><Plus size={18} /> Lisa esimene ülesanne</button> : null}
          </section>
        ) : null}
      </form>
    </Modal>
  );
}
