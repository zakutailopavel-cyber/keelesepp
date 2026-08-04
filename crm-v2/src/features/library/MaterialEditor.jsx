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
  ['text', 'Tekst või juhis'],
  ['fill', 'Lünkharjutus'],
  ['choice', 'Valikvastused'],
  ['reading', 'Lugemistekst'],
  ['writing', 'Kirjutamisülesanne'],
  ['match', 'Sobita paarid'],
  ['order', 'Järjesta sõnad'],
  ['table', 'Tabel'],
  ['image', 'Pilt'],
  ['dialogue', 'Dialoog'],
  ['error_correction', 'Leia viga'],
  ['transformation', 'Muuda lauset'],
];
const SUPPORTED_BLOCKS = new Set(BLOCK_TYPES.map(([value]) => value));

function blockId() {
  return globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function newBlock(type = 'text') {
  const base = { id: blockId(), type, instruction: '', size: 'full' };
  if (type === 'text') return { ...base, content: '', bold: false };
  if (type === 'fill') return { ...base, text: '' };
  if (type === 'choice') return { ...base, questions: [] };
  if (type === 'reading') return { ...base, passage: '', questions: [] };
  if (type === 'writing') return { ...base, task: '', lines: 5 };
  if (type === 'match') return { ...base, pairs: [] };
  if (type === 'order') return { ...base, sentence: '' };
  if (type === 'table') return { ...base, headers: ['', ''], rows: 4 };
  if (type === 'image') return { ...base, imageUrl: '', caption: '', imagePos: 'top' };
  if (type === 'dialogue') return { ...base, lines: [] };
  if (type === 'error_correction') return { ...base, sentences: [] };
  if (type === 'transformation') return { ...base, example: { from: '', to: '' }, sentences: [] };
  return base;
}

function serializeQuestions(questions = []) {
  return questions.map((question) => [question.q || question.question || '', ...(question.opts || question.options || []), Number(question.correct ?? 0) + 1].join(' | ')).join('\n');
}

function parseQuestions(value) {
  return value.split('\n').filter((line) => line.trim()).map((line) => {
    const parts = line.split('|').map((part) => part.trim());
    const q = parts.shift() || '';
    const correctPart = /^\d+$/.test(parts.at(-1) || '') ? Number(parts.pop()) - 1 : 0;
    return { q, opts: parts, correct: Math.max(correctPart, 0) };
  });
}

function serializePairs(items = [], leftKey, rightKey) {
  return items.map((item) => `${item[leftKey] || ''} | ${item[rightKey] || ''}`).join('\n');
}

function parsePairs(value, leftKey, rightKey) {
  return value.split('\n').filter((line) => line.trim()).map((line) => {
    const [left = '', ...right] = line.split('|');
    return { [leftKey]: left.trim(), [rightKey]: right.join('|').trim() };
  });
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

function MaterialBlockEditor({ block, index, availableImages = [], onChange, onRemove }) {
  const fieldId = useId();
  const [drafts, setDrafts] = useState(() => ({
    questions: serializeQuestions(block.questions),
    pairs: serializePairs(block.pairs, 'l', 'r'),
    dialogue: serializePairs(block.lines, 'speaker', 'text'),
    errors: serializePairs(block.sentences, 'wrong', 'correct'),
    headers: (block.headers || []).join(' | '),
    transformations: (block.sentences || []).filter((sentence) => typeof sentence === 'string').join('\n'),
  }));
  const supported = SUPPORTED_BLOCKS.has(block.type);
  const changeType = (type) => onChange({ ...newBlock(type), id: block.id });
  const changeDraft = (field, value, patch) => { setDrafts((current) => ({ ...current, [field]: value })); onChange({ ...block, ...patch(value) }); };
  return (
    <section className="material-block-editor">
      <header><strong>Ülesanne {index + 1}</strong><Button variant="danger" aria-label={`Eemalda ülesanne ${index + 1}`} onClick={onRemove}><Trash2 size={15} /> Eemalda</Button></header>
      {supported ? (
        <>
          <Select id={`${fieldId}-type`} label="Ülesande tüüp" value={block.type} onChange={(event) => changeType(event.target.value)}>
            {BLOCK_TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </Select>
          <Input id={`${fieldId}-instruction`} label="Juhis või alapealkiri" value={block.instruction || block.title || ''} maxLength={180} onChange={(event) => onChange({ ...block, instruction: event.target.value })} placeholder="Näiteks: Täida lüngad" />
          {block.type === 'text' ? <div className="textarea-field"><label htmlFor={`${fieldId}-content`}>Tekst</label><textarea id={`${fieldId}-content`} rows={5} value={block.content ?? block.text ?? ''} onChange={(event) => onChange({ ...block, content: event.target.value })} /></div> : null}
          {block.type === 'fill' ? <div className="textarea-field"><label htmlFor={`${fieldId}-fill`}>Tekst koos vastustega</label><textarea id={`${fieldId}-fill`} rows={5} value={block.text || ''} onChange={(event) => onChange({ ...block, text: event.target.value })} placeholder="Minu [nimi] on Mari." /><small>Õiged vastused märgitakse nurksulgudega.</small></div> : null}
          {block.type === 'writing' ? <div className="textarea-field"><label htmlFor={`${fieldId}-task`}>Ülesanne</label><textarea id={`${fieldId}-task`} rows={5} value={block.task || ''} onChange={(event) => onChange({ ...block, task: event.target.value })} /></div> : null}
          {block.type === 'writing' ? <Input id={`${fieldId}-lines`} label="Vastuseridade arv" type="number" min="1" max="12" value={block.lines || 5} onChange={(event) => onChange({ ...block, lines: Math.min(Math.max(Number(event.target.value) || 1, 1), 12) })} /> : null}
          {block.type === 'choice' || block.type === 'reading' ? <div className="textarea-field"><label htmlFor={`${fieldId}-questions`}>Küsimused ja vastused</label><textarea id={`${fieldId}-questions`} rows={6} value={drafts.questions} onChange={(event) => changeDraft('questions', event.target.value, (value) => ({ questions: parseQuestions(value) }))} placeholder="Küsimus | variant 1 | variant 2 | 1" /><small>Üks küsimus real. Viimane number näitab õige vastuse järjekorda.</small></div> : null}
          {block.type === 'reading' ? <div className="textarea-field"><label htmlFor={`${fieldId}-passage`}>Lugemistekst</label><textarea id={`${fieldId}-passage`} rows={8} value={block.passage || ''} onChange={(event) => onChange({ ...block, passage: event.target.value })} /></div> : null}
          {block.type === 'match' ? <div className="textarea-field"><label htmlFor={`${fieldId}-pairs`}>Paarid</label><textarea id={`${fieldId}-pairs`} rows={6} value={drafts.pairs} onChange={(event) => changeDraft('pairs', event.target.value, (value) => ({ pairs: parsePairs(value, 'l', 'r') }))} placeholder="ema | mother" /><small>Üks paar real, pooled eraldatakse märgiga |.</small></div> : null}
          {block.type === 'order' ? <div className="textarea-field"><label htmlFor={`${fieldId}-sentence`}>Õige lause</label><textarea id={`${fieldId}-sentence`} rows={4} value={block.sentence || ''} onChange={(event) => onChange({ ...block, sentence: event.target.value })} /></div> : null}
          {block.type === 'table' ? <><Input id={`${fieldId}-headers`} label="Veerud" value={drafts.headers} onChange={(event) => changeDraft('headers', event.target.value, (value) => ({ headers: value.split('|').map((header) => header.trim()) }))} placeholder="Sõna | Tõlge | Näide" /><Input id={`${fieldId}-rows`} label="Ridade arv" type="number" min="1" max="20" value={block.rows || 4} onChange={(event) => onChange({ ...block, rows: Math.min(Math.max(Number(event.target.value) || 1, 1), 20) })} /></> : null}
          {block.type === 'image' ? <>{availableImages.length ? <Select id={`${fieldId}-uploaded-image`} label="Üleslaaditud pilt" value={availableImages.some((file) => file.url === block.imageUrl) ? block.imageUrl : ''} onChange={(event) => onChange({ ...block, imageUrl: event.target.value })}><option value="">Vali pilt…</option>{availableImages.map((file) => <option value={file.url} key={file.url}>{file.name}</option>)}</Select> : null}<Input id={`${fieldId}-image`} label="Pildi URL" type="url" value={block.imageUrl || ''} onChange={(event) => onChange({ ...block, imageUrl: event.target.value })} /><Input id={`${fieldId}-caption`} label="Pildi allkiri" value={block.caption || ''} onChange={(event) => onChange({ ...block, caption: event.target.value })} /></> : null}
          {block.type === 'dialogue' ? <div className="textarea-field"><label htmlFor={`${fieldId}-dialogue`}>Dialoogi read</label><textarea id={`${fieldId}-dialogue`} rows={7} value={drafts.dialogue} onChange={(event) => changeDraft('dialogue', event.target.value, (value) => ({ lines: parsePairs(value, 'speaker', 'text') }))} placeholder="A | Tere!\nB | [vastus]" /><small>Üks kõnevoor real: kõneleja | tekst.</small></div> : null}
          {block.type === 'error_correction' ? <div className="textarea-field"><label htmlFor={`${fieldId}-errors`}>Vigased ja õiged laused</label><textarea id={`${fieldId}-errors`} rows={7} value={drafts.errors} onChange={(event) => changeDraft('errors', event.target.value, (value) => ({ sentences: parsePairs(value, 'wrong', 'correct') }))} placeholder="Ma lähen eile poodi. | Ma läksin eile poodi." /></div> : null}
          {block.type === 'transformation' ? <><Input id={`${fieldId}-example-from`} label="Näite algne lause" value={block.example?.from || ''} onChange={(event) => onChange({ ...block, example: { ...block.example, from: event.target.value } })} /><Input id={`${fieldId}-example-to`} label="Näite tulemus" value={block.example?.to || ''} onChange={(event) => onChange({ ...block, example: { ...block.example, to: event.target.value } })} /><div className="textarea-field"><label htmlFor={`${fieldId}-transform`}>Laused muutmiseks</label><textarea id={`${fieldId}-transform`} rows={6} value={drafts.transformations} onChange={(event) => changeDraft('transformations', event.target.value, (value) => ({ sentences: value.split('\n').filter((line) => line.trim()) }))} /></div></> : null}
        </>
      ) : <p className="form-hint">Tundmatu „{block.type}” plokk säilitatakse muutmata.</p>}
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
    if (structured && values.blocks.some((block) => (block.type === 'text' && !String(block.content || block.text || '').trim()) || (block.type === 'fill' && !String(block.text || '').trim()) || (block.type === 'writing' && !String(block.task || '').trim()))) nextErrors.blocks = 'Täida iga lisatud ülesande sisu.';
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
            {values.blocks.map((block, index) => <MaterialBlockEditor block={block} index={index} availableImages={values.files.filter((file) => String(file.type || '').startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file.name || ''))} key={`${block.id || index}-${block.type}`} onChange={(next) => updateBlock(index, next)} onRemove={() => removeBlock(index)} />)}
            {!values.blocks.length ? <button className="material-block-empty" type="button" onClick={() => update('blocks', [newBlock('text')])}><Plus size={18} /> Lisa esimene ülesanne</button> : null}
          </section>
        ) : null}
      </form>
    </Modal>
  );
}
