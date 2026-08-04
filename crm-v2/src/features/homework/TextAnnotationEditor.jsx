import { Check, MessageCircleMore, PencilLine, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { createTextAnnotation, splitAnnotatedText, validAnnotationsForText } from './annotations.js';

const emptyDraft = null;

function selectionOffsets(container) {
  const selection = window.getSelection?.();
  if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;
  const before = range.cloneRange();
  before.selectNodeContents(container);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const selectedText = range.toString();
  return selectedText.trim() ? { start, end: start + selectedText.length, selectedText } : null;
}

function AnnotationText({ field, annotations }) {
  return <p className="annotation-source-text" data-block-id={field.blockId}>{splitAnnotatedText(field.text, annotations, field.blockId).map((part, index) => part.type === 'annotation'
    ? <mark key={`${part.annotation.id}-${index}`} title={part.annotation.selgitus || part.annotation.parandus || 'Õpetaja parandus'}>{part.text}</mark>
    : <span key={`text-${index}`}>{part.text}</span>)}</p>;
}

export default function TextAnnotationEditor({ fields = [], annotations = [], editable = false, onChange }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectText = (event, field) => {
    if (!editable || saving) return;
    const offsets = selectionOffsets(event.currentTarget);
    if (!offsets) return;
    setDraft({ ...offsets, blockId: field.blockId, parandus: '', selgitus: '' });
    setError(''); setMessage('');
  };

  const persist = async (next, successMessage) => {
    setSaving(true); setError(''); setMessage('');
    try {
      await onChange(next);
      setDraft(emptyDraft);
      setMessage(successMessage);
      window.getSelection?.()?.removeAllRanges?.();
    } catch (saveError) {
      setError(saveError.message || 'Paranduse salvestamine ebaõnnestus.');
    } finally { setSaving(false); }
  };

  const saveDraft = async () => {
    try {
      const annotation = createTextAnnotation(draft || {});
      await persist([...annotations, annotation], 'Parandus salvestati.');
    } catch (validationError) { setError(validationError.message); }
  };

  if (!fields.length && !annotations.length) return null;
  return <section className={`annotation-editor${editable ? ' is-editable' : ''}`} aria-label="Tekstiparandused">
    <header><div><PencilLine size={20} /><div><h3>Tekstiparandused</h3><p>{editable ? 'Vali vastusest sõna või lause ja lisa täpne parandus.' : 'Õpetaja märkused sinu kirjalikus vastuses.'}</p></div></div>{annotations.length ? <span>{annotations.length} märkust</span> : null}</header>
    {message ? <div className="annotation-message" role="status"><Check size={16} /> {message}</div> : null}
    {error ? <div className="action-error" role="alert">{error}<button onClick={() => setError('')}>×</button></div> : null}
    <div className="annotation-fields">{fields.map((field) => {
      const fieldAnnotations = validAnnotationsForText(field.text, annotations, field.blockId);
      return <article className="annotation-field" key={field.blockId}>
        <strong>{field.label}</strong>
        <div onMouseUp={(event) => selectText(event, field)}><AnnotationText field={field} annotations={annotations} /></div>
        {fieldAnnotations.length ? <div className="annotation-list">{fieldAnnotations.map((annotation, index) => <div className="annotation-card" key={annotation.id}>
          <span>{index + 1}</span><div><small>“{annotation.selectedText || field.text.slice(annotation.start, annotation.end)}”</small>{annotation.parandus ? <p><b>Parandus:</b> {annotation.parandus}</p> : null}{annotation.selgitus ? <p><b>Selgitus:</b> {annotation.selgitus}</p> : null}</div>
          {editable ? <button aria-label={`Eemalda parandus ${index + 1}`} disabled={saving} onClick={() => persist(annotations.filter((item) => item.id !== annotation.id), 'Parandus eemaldati.')}><Trash2 size={16} /></button> : <MessageCircleMore size={17} />}
        </div>)}</div> : null}
      </article>;
    })}</div>
    {editable && draft ? <div className="annotation-draft">
      <header><div><span>Valitud tekst</span><strong>“{draft.selectedText}”</strong></div><button aria-label="Loobu parandusest" onClick={() => setDraft(emptyDraft)}><X size={18} /></button></header>
      <label><span>Parandus</span><input aria-label="Parandus" value={draft.parandus} onChange={(event) => setDraft({ ...draft, parandus: event.target.value })} placeholder="Kirjuta õige variant" /></label>
      <label><span>Selgitus</span><textarea aria-label="Selgitus" rows="3" value={draft.selgitus} onChange={(event) => setDraft({ ...draft, selgitus: event.target.value })} placeholder="Selgita õpilasele, mida parandada" /></label>
      <div><Button variant="secondary" onClick={() => setDraft(emptyDraft)}>Loobu</Button><Button loading={saving} onClick={saveDraft}><Check size={17} /> Salvesta parandus</Button></div>
    </div> : null}
  </section>;
}
