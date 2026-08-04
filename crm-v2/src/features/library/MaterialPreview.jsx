import { CheckCircle2, FileQuestion, Image as ImageIcon } from 'lucide-react';
import { Badge, EmptyState, Modal } from '../../components/ui/index.js';
import { LIBRARY_TYPES } from './libraryModel.js';

function safeUrl(value) {
  try {
    const url = new globalThis.URL(String(value || ''), globalThis.location?.origin || 'https://www.epkoolitus.ee');
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function fileKind(file) {
  const value = `${file?.contentType || file?.type || ''} ${file?.name || ''} ${file?.url || ''}`.toLocaleLowerCase('et');
  if (/image\/|\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(value)) return 'image';
  if (/application\/pdf|\.pdf(\?|$)/.test(value)) return 'pdf';
  return 'other';
}

function materialFiles(source) {
  const phaseFiles = Object.values(source.phaseData || {}).flatMap((phase) => phase?.files || []);
  const unique = new Map();
  [...(source.files || []), ...phaseFiles].forEach((file) => {
    const url = safeUrl(file?.url || file?.downloadUrl);
    if (url) unique.set(url, { ...file, url });
  });
  return [...unique.values()];
}

function readableText(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value)) return value.map(readableText).filter(Boolean).join('\n');
  if (value && typeof value === 'object') return Object.entries(value).filter(([key]) => !['files', 'imageUrl', 'url'].includes(key)).map(([, nested]) => readableText(nested)).filter(Boolean).join('\n');
  return '';
}

function lessonPlanBlocks(source) {
  return Object.entries(source.phaseData || {}).map(([phase, value]) => ({
    id: `phase-${phase}`,
    type: 'text',
    title: phase.replaceAll('_', ' '),
    text: readableText(value),
  })).filter((block) => block.text);
}

function FillText({ text }) {
  return <p className="preview-fill">{String(text || '').split(/(\[[^\]]+\])/g).map((part, index) => part.startsWith('[') ? <span key={`${part}-${index}`}>{part.slice(1, -1)}</span> : part)}</p>;
}

function QuestionList({ questions = [] }) {
  return <div className="preview-questions">{questions.map((question, index) => { const options = question.options || question.opts || []; const correct = question.correct; return <section key={`${question.question || question.q}-${index}`}><strong>{index + 1}. {question.question || question.q || question.prompt}</strong>{options.length ? <ol type="A">{options.map((option, optionIndex) => <li className={optionIndex === correct ? 'is-correct' : ''} key={`${option}-${optionIndex}`}>{option}{optionIndex === correct ? <CheckCircle2 size={15} /> : null}</li>)}</ol> : null}</section>; })}</div>;
}

function PreviewBlock({ block, index }) {
  const heading = block.instruction || block.title || `Ülesanne ${index + 1}`;
  if (block.type === 'image') return safeUrl(block.imageUrl || block.url) ? <section className="preview-block"><h3>{heading}</h3><img src={safeUrl(block.imageUrl || block.url)} alt={block.alt || heading} /></section> : null;
  if (block.type === 'fill') return <section className="preview-block"><h3>{heading}</h3><FillText text={block.text} /></section>;
  if (block.type === 'choice') return <section className="preview-block"><h3>{heading}</h3><QuestionList questions={block.questions} /></section>;
  if (block.type === 'reading') return <section className="preview-block"><h3>{heading}</h3><p className="preview-passage">{block.passage || block.text}</p><QuestionList questions={block.questions} /></section>;
  if (block.type === 'writing') return <section className="preview-block"><h3>{heading}</h3><p>{block.task || block.prompt}</p><div className="preview-writing-lines">{Array.from({ length: Math.min(Number(block.lines) || 5, 12) }, (_, line) => <i key={line} />)}</div></section>;
  if (block.type === 'match') return <section className="preview-block"><h3>{heading}</h3><div className="preview-pairs">{(block.pairs || []).map((pair, pairIndex) => <div key={pairIndex}><span>{pair.l || pair.left}</span><b>↔</b><span>{pair.r || pair.right}</span></div>)}</div></section>;
  if (block.type === 'order') return <section className="preview-block"><h3>{heading}</h3><div className="preview-words">{String(block.sentence || block.text || '').split(/\s+/).filter(Boolean).map((word, wordIndex) => <span key={`${word}-${wordIndex}`}>{word}</span>)}</div></section>;
  if (block.type === 'table') { const headers = block.headers || []; const rows = Math.max(Number(block.rows) || 0, 1); return <section className="preview-block"><h3>{heading}</h3><div className="preview-table-wrap"><table><thead><tr>{headers.map((header, column) => <th key={`${header}-${column}`}>{header}</th>)}</tr></thead><tbody>{Array.from({ length: rows }, (_, row) => <tr key={row}>{headers.map((_, column) => <td key={column}>{block.cellData?.[`${row},${column}`] || block.cellData?.[`${row + 1},${column}`] || ''}</td>)}</tr>)}</tbody></table></div></section>; }
  if (block.type === 'dialogue') return <section className="preview-block"><h3>{heading}</h3><div className="preview-dialogue">{(block.lines || []).map((line, lineIndex) => <p key={lineIndex}><strong>{line.speaker}:</strong> {line.text}</p>)}</div></section>;
  if (block.type === 'error_correction') return <section className="preview-block"><h3>{heading}</h3>{(block.sentences || []).map((sentence, sentenceIndex) => <p key={sentenceIndex}><s>{sentence.wrong}</s> → <strong>{sentence.correct || '…'}</strong></p>)}</section>;
  if (block.type === 'transformation') return <section className="preview-block"><h3>{heading}</h3>{(block.sentences || []).map((sentence, sentenceIndex) => <p key={sentenceIndex}>{typeof sentence === 'string' ? sentence : `${sentence.from || ''} → ${sentence.to || ''}`}</p>)}</section>;
  if (block.type === 'translate') return <section className="preview-block"><h3>{heading}</h3><div className="preview-pairs">{(block.items || block.pairs || []).map((pair, pairIndex) => <div key={pairIndex}><span>{pair.from || pair.l}</span><b>→</b><span>{pair.to || pair.r}</span></div>)}</div></section>;
  return <section className="preview-block"><h3>{heading}</h3><p>{block.text || block.body || block.task || block.description || 'Sisu puudub.'}</p></section>;
}

function FilePreview({ file }) {
  const kind = fileKind(file);
  if (kind === 'image') return <figure className="preview-file"><img src={file.url} alt={file.name || 'Materjali pilt'} /><figcaption>{file.name || 'Pilt'}</figcaption></figure>;
  if (kind === 'pdf') return <section className="preview-file preview-file--pdf"><strong>{file.name || 'PDF-dokument'}</strong><iframe title={`PDF: ${file.name || 'materjal'}`} src={`${file.url}#toolbar=0&navpanes=0`} /></section>;
  return <div className="preview-unsupported"><FileQuestion size={22} /><div><strong>{file.name || 'Fail'}</strong><span>Seda failivormingut ei saa brauseris turvaliselt eelvaadata.</span></div></div>;
}

export default function MaterialPreview({ item, onClose }) {
  const source = item.source || {};
  const structuredBlocks = source.worksheetData?.blocks?.length ? source.worksheetData.blocks : item.kind === 'exercise' ? [source] : lessonPlanBlocks(source);
  const blocks = structuredBlocks.length ? structuredBlocks : item.description ? [{ id: 'description', type: 'text', title: 'Sisu', text: item.description }] : [];
  const files = materialFiles(source);
  return (
    <Modal open title={`Eelvaade: ${item.title}`} onClose={onClose} className="modal--preview">
      <article className="material-preview">
        <header><div><Badge tone={LIBRARY_TYPES[item.type]?.tone}>{item.typeLabel}</Badge><h2>{source.worksheetData?.meta?.title || item.title}</h2><p>{item.description}</p></div><ImageIcon size={26} /></header>
        {blocks.length ? <div className="preview-blocks">{blocks.map((block, index) => <PreviewBlock block={block} index={index} key={block.id || `${block.type}-${index}`} />)}</div> : null}
        {files.length ? <section className="preview-files"><h2>Lisatud failid</h2>{files.map((file) => <FilePreview file={file} key={file.url} />)}</section> : null}
        {!blocks.length && !files.length ? <EmptyState title="Eelvaate sisu puudub" description="Materjalil on ainult kirjeldus või selle sisu on vanemas formaadis." /> : null}
      </article>
    </Modal>
  );
}
