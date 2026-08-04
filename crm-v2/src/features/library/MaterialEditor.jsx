import { FileText, Plus, Trash2, UploadCloud } from 'lucide-react';
import { useId, useRef, useState } from 'react';
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
    files: source.files?.map((file) => ({ ...file })) || [],
  };
}

function formatFileSize(size) {
  if (!size) return '';
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
  const fileInput = useRef(null);
  const [values, setValues] = useState(() => initialValues(item));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saveError, setSaveError] = useState('');
  const structured = values.materialType === 'worksheet' || values.materialType === 'test';
  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));
  const updateBlock = (index, block) => update('blocks', values.blocks.map((current, currentIndex) => currentIndex === index ? block : current));
  const removeBlock = (index) => update('blocks', values.blocks.filter((_, currentIndex) => currentIndex !== index));

  const uploadFiles = async (fileList) => {
    const files = [...(fileList || [])];
    if (!files.length) return;
    setUploading(true);
    setSaveError('');
    try {
      for (const file of files) {
        setProgress(0);
        const uploaded = await repository.uploadFile({ file, user, onProgress: setProgress });
        setValues((current) => ({ ...current, files: [...current.files, { ...uploaded, _new: true }] }));
      }
    } catch (error) {
      setSaveError(error.message || 'Faili üleslaadimine ebaõnnestus.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removeFile = async (file, index) => {
    update('files', values.files.filter((_, currentIndex) => currentIndex !== index));
    if (!file._new) return;
    try {
      await repository.deleteUploadedFile(file);
    } catch {
      setSaveError('Fail eemaldati materjalist, kuid salvestusruumi puhastamine ebaõnnestus.');
    }
  };

  const discard = () => {
    if (uploading) {
      setSaveError('Oota, kuni faili üleslaadimine lõpeb.');
      return;
    }
    const temporaryFiles = values.files.filter((file) => file._new);
    Promise.allSettled(temporaryFiles.map((file) => repository.deleteUploadedFile(file))).finally(onClose);
  };

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
      onClose={discard}
      footer={<><Button variant="secondary" disabled={saving || uploading} onClick={discard}>Tühista</Button><Button type="submit" form={formId} loading={saving} disabled={uploading}>Salvesta</Button></>}
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
        <section className="material-attachments">
          <div className="section-heading"><div><span>Failid</span><h2>Manused</h2></div><small>Kuni 19 MB faili kohta</small></div>
          <input ref={fileInput} className="sr-only" aria-label="Lisa materjali failid" type="file" multiple accept="image/*,application/pdf,text/*,audio/*,video/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={(event) => uploadFiles(event.target.files)} />
          <button className="material-upload" type="button" disabled={uploading} onClick={() => fileInput.current?.click()} onDrop={(event) => { event.preventDefault(); uploadFiles(event.dataTransfer.files); }} onDragOver={(event) => event.preventDefault()}>
            <UploadCloud size={24} />
            <span><strong>{uploading ? `Laadin üles… ${progress}%` : 'Lisa failid'}</strong><small>PDF, pildid, dokumendid, heli või video</small></span>
          </button>
          {uploading ? <div className="upload-progress" role="progressbar" aria-label="Faili üleslaadimine" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div> : null}
          {values.files.length ? <div className="material-file-list">{values.files.map((file, index) => <div key={`${file.url}-${index}`}><FileText size={19} /><span><strong>{file.name}</strong><small>{[formatFileSize(file.size), file.type].filter(Boolean).join(' · ')}</small></span><Button variant="danger" aria-label={`Eemalda fail ${file.name}`} disabled={uploading} onClick={() => removeFile(file, index)}><Trash2 size={15} /></Button></div>)}</div> : null}
        </section>
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
