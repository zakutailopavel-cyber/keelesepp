from pathlib import Path
import os
import re

ROOT=Path(__file__).resolve().parents[1]

def replace_once(path, old, new, label):
    p=ROOT/path
    text=p.read_text(encoding='utf-8')
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{label}: expected 1 match, got {count}')
    p.write_text(text.replace(old,new,1),encoding='utf-8')

# Shared legacy library classification: a visual image with answerable overlay fields is a worksheet.
replace_once(Path('learning-library-core.js'),
"""  const hasWorksheet=lesson=>Boolean(
    lesson?.worksheetData
    && Array.isArray(lesson.worksheetData.blocks)
    && lesson.worksheetData.blocks.length
  );""",
"""  const visualWorksheetElements=lesson=>(Array.isArray(lesson?.files)?lesson.files:[])
    .flatMap(file=>Array.isArray(file?.interactiveOverlay?.elements)?file.interactiveOverlay.elements:[])
    .filter(element=>['input','textarea','choice','checkbox'].includes(element?.type));
  const hasWorksheet=lesson=>Boolean(
    (lesson?.worksheetData&&Array.isArray(lesson.worksheetData.blocks)&&lesson.worksheetData.blocks.length)
    || visualWorksheetElements(lesson).length
  );""",
'legacy visual worksheet classification')

# CRM v2 library classification mirrors the legacy library contract.
replace_once(Path('crm-v2/src/features/library/libraryModel.js'),
"""function hasWorksheet(record) {
  return Boolean(record?.worksheetData?.blocks?.length);
}""",
"""function hasWorksheet(record) {
  const visualFields = (record?.files || []).flatMap((file) => file?.interactiveOverlay?.elements || [])
    .filter((element) => ['input', 'textarea', 'choice', 'checkbox'].includes(element?.type));
  return Boolean(record?.worksheetData?.blocks?.length || visualFields.length);
}""",
'crm visual worksheet classification')

# Preserve and bound interactive overlay metadata when CRM saves material files.
p=ROOT/'crm-v2/src/services/firebase/library.js'
s=p.read_text(encoding='utf-8')
old="""function storedFiles(files = []) {
  return files.map(({ name, url, size, type, storagePath }) => ({
    name: String(name || 'Fail'),
    url: String(url || ''),
    size: Number(size) || 0,
    type: String(type || ''),
    ...(storagePath ? { storagePath } : {}),
  })).filter((file) => file.url);
}"""
new="""const VISUAL_OVERLAY_TYPES = new Set(['word', 'input', 'textarea', 'choice', 'checkbox']);

function boundedText(value, max = 1000) {
  return String(value ?? '').slice(0, max);
}

function boundedUnit(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : fallback;
}

function storedInteractiveOverlay(file = {}) {
  const source = Array.isArray(file?.interactiveOverlay?.elements) ? file.interactiveOverlay.elements : [];
  const elements = source.slice(0, 250).map((element, index) => {
    const type = String(element?.type || '');
    if (!VISUAL_OVERLAY_TYPES.has(type)) return null;
    const x = boundedUnit(element.x);
    const y = boundedUnit(element.y);
    const w = Math.max(0.01, Math.min(1 - x, boundedUnit(element.w, 0.12)));
    const h = Math.max(0.01, Math.min(1 - y, boundedUnit(element.h, 0.04)));
    const options = (Array.isArray(element.options) ? element.options : []).slice(0, 20).map((option) => boundedText(option, 250));
    return {
      id: boundedText(element.id || `overlay-${index}`, 180),
      type,
      x,
      y,
      w,
      h,
      ...(Number.isInteger(Number(element.page)) && Number(element.page) > 0 ? { page: Number(element.page) } : {}),
      label: boundedText(element.label, 250),
      placeholder: boundedText(element.placeholder, 250),
      text: boundedText(element.text, 500),
      translation: boundedText(element.translation, 500),
      lemma: boundedText(element.lemma, 250),
      options,
      correctAnswer: boundedText(element.correctAnswer, 1000),
    };
  }).filter(Boolean);
  return elements.length ? { version: 1, elements } : null;
}

function storedFiles(files = []) {
  return files.map(({ name, url, size, type, storagePath, interactiveOverlay }) => {
    const overlay = storedInteractiveOverlay({ interactiveOverlay });
    return {
      name: String(name || 'Fail'),
      url: String(url || ''),
      size: Number(size) || 0,
      type: String(type || ''),
      ...(storagePath ? { storagePath } : {}),
      ...(overlay ? { interactiveOverlay: overlay } : {}),
    };
  }).filter((file) => file.url);
}"""
if s.count(old)!=1: raise SystemExit('storedFiles anchor mismatch')
s=s.replace(old,new,1)
old_assign="""          worksheetData: item.source.worksheetData,
          studentId: student.id,"""
new_assign="""          worksheetData: item.source.worksheetData || {
            meta: { title: item.title, subject: item.subject, level: item.level, topic: item.topic },
            blocks: [],
          },
          files: storedFiles(item.source.files || []),
          studentId: student.id,"""
if s.count(old_assign)!=1: raise SystemExit('library assignment anchor mismatch')
s=s.replace(old_assign,new_assign,1)
p.write_text(s,encoding='utf-8')

# Student assignment normalization keeps the visual page snapshot.
replace_once(Path('crm-v2/src/services/firebase/homework.js'),
"""    answers: data.answers || {},
    errorLog: data.errorLog || [],
    worksheetData: data.worksheetData || { meta: {}, blocks: [] },
  };""",
"""    answers: data.answers || {},
    errorLog: data.errorLog || [],
    worksheetData: data.worksheetData || { meta: {}, blocks: [] },
    files: Array.isArray(data.files) ? data.files : [],
  };""",
'worksheet assignment visual files')

# Legacy/embedded assignment flow snapshots image pages + overlays as well.
p=ROOT/'haldus-exercises/index.html'
s=p.read_text(encoding='utf-8')
old="""            worksheetData:item.source.worksheetData,
            ...(window.WorksheetWorkflow?.curriculumFieldsFor(item.source)||{}),"""
new="""            worksheetData:item.source.worksheetData||{meta:{title:item.title,subject:item.subject,level:item.level,topic:item.topic},blocks:[]},
            files:(item.source.files||[]).map(file=>({
              name:String(file?.name||'Fail'),url:String(file?.url||''),size:Number(file?.size)||0,type:String(file?.type||''),
              ...(file?.storagePath?{storagePath:file.storagePath}:{}),
              ...(Array.isArray(file?.interactiveOverlay?.elements)&&file.interactiveOverlay.elements.length?{interactiveOverlay:file.interactiveOverlay}:{})
            })).filter(file=>file.url),
            ...(window.WorksheetWorkflow?.curriculumFieldsFor(item.source)||{}),"""
if s.count(old)!=1: raise SystemExit('haldus assignment anchor mismatch')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Pure helpers for student-side visual worksheet progress and scoring.
wp=ROOT/'crm-v2/src/features/homework/worksheetPlayer.js'
wp.write_text(r'''function clean(value) {
  return String(value ?? '').trim().toLocaleLowerCase('et').replace(/\s+/g, ' ');
}

function hasAnswer(value) {
  return value !== undefined && value !== null && (typeof value === 'number' || String(value).trim() !== '');
}

function questions(block) {
  return block.questions || [];
}

function options(question) {
  return question.opts || question.options || [];
}

const VISUAL_ANSWER_TYPES = new Set(['input', 'textarea', 'choice', 'checkbox']);

function visualElements(file = {}) {
  return Array.isArray(file?.interactiveOverlay?.elements) ? file.interactiveOverlay.elements : [];
}

function isImageWorksheetFile(file = {}) {
  const type = String(file.type || '').toLocaleLowerCase('en');
  const name = String(file.name || '').toLocaleLowerCase('en');
  return type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(name);
}

function hasOwnAnswer(answers, key) {
  return Object.prototype.hasOwnProperty.call(answers || {}, key);
}

function hasExpectedAnswer(element = {}) {
  return element.correctAnswer !== undefined && element.correctAnswer !== null && String(element.correctAnswer).trim() !== '';
}

function expectedVisualAnswer(element = {}) {
  const raw = element.correctAnswer;
  if (element.type === 'choice' && /^\d+$/.test(String(raw ?? '').trim())) {
    const index = Number(raw);
    if (Array.isArray(element.options) && element.options[index] !== undefined) return element.options[index];
  }
  if (element.type === 'checkbox') {
    return ['true', '1', 'yes', 'jah', 'checked'].includes(clean(raw));
  }
  return raw;
}

export function visualAnswerKey(fileIndex, element = {}) {
  const id = String(element.id || 'field').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 180);
  return `visual_${fileIndex}_${id}`;
}

export function visualWorksheetPages(files = []) {
  return (Array.isArray(files) ? files : []).map((file, fileIndex) => ({
    file,
    fileIndex,
    elements: visualElements(file),
  })).filter(({ file, elements }) => isImageWorksheetFile(file) && elements.length);
}

export function visualWorksheetProgress(files = [], answers = {}) {
  let answered = 0;
  let total = 0;
  visualWorksheetPages(files).forEach(({ fileIndex, elements }) => {
    elements.filter((element) => VISUAL_ANSWER_TYPES.has(element?.type)).forEach((element) => {
      const key = visualAnswerKey(fileIndex, element);
      total += 1;
      if (element.type === 'checkbox' ? hasOwnAnswer(answers, key) : hasAnswer(answers[key])) answered += 1;
    });
  });
  return { answered, total, complete: total === 0 || answered === total };
}

export function visualAnswerMatches(element = {}, value) {
  if (!hasExpectedAnswer(element)) return null;
  const expected = expectedVisualAnswer(element);
  if (element.type === 'checkbox') return Boolean(value) === Boolean(expected);
  return clean(value) === clean(expected);
}

export function calculateVisualWorksheetResult(files = [], answers = {}) {
  let correct = 0;
  let total = 0;
  const errorLog = [];
  visualWorksheetPages(files).forEach(({ file, fileIndex, elements }) => {
    elements.filter((element) => VISUAL_ANSWER_TYPES.has(element?.type) && hasExpectedAnswer(element)).forEach((element) => {
      const key = visualAnswerKey(fileIndex, element);
      const given = answers[key];
      total += 1;
      if (visualAnswerMatches(element, given)) correct += 1;
      else errorLog.push({
        type: `visual_${element.type}`,
        blockLabel: element.label || file.name || `Leht ${fileIndex + 1}`,
        correct: String(expectedVisualAnswer(element) ?? ''),
        given: hasOwnAnswer(answers, key) ? String(given) : '(vastamata)',
      });
    });
  });
  return {
    score: total ? { correct, total, pct: Math.round((correct / total) * 100) } : null,
    errorLog: errorLog.slice(0, 20),
  };
}

export function mergeWorksheetResults(...results) {
  const valid = results.filter(Boolean);
  const scored = valid.map((result) => result.score).filter((score) => score && Number(score.total) > 0);
  const correct = scored.reduce((sum, score) => sum + Number(score.correct || 0), 0);
  const total = scored.reduce((sum, score) => sum + Number(score.total || 0), 0);
  return {
    score: total ? { correct, total, pct: Math.round((correct / total) * 100) } : null,
    errorLog: valid.flatMap((result) => result.errorLog || []).slice(0, 20),
  };
}

export function parseFillText(text = '') {
  let blankIndex = 0;
  return String(text).split(/\[([^\]]+)\]/g).map((value, index) => (
    index % 2 === 0 ? { type: 'text', value } : { type: 'blank', answer: value, index: blankIndex++ }
  ));
}

export function answerKey(block, ...parts) {
  return [block.id, ...parts].join('_');
}

export function worksheetProgress(blocks = [], answers = {}) {
  let answered = 0;
  let total = 0;
  const add = (key) => { total += 1; if (hasAnswer(answers[key])) answered += 1; };
  blocks.forEach((block) => {
    if (block.type === 'fill') parseFillText(block.text).filter((part) => part.type === 'blank').forEach((part) => add(answerKey(block, part.index)));
    else if (['choice', 'reading'].includes(block.type)) questions(block).forEach((_, index) => add(answerKey(block, index)));
    else if (block.type === 'match') (block.pairs || []).forEach((_, index) => add(answerKey(block, index)));
    else if (['writing', 'order'].includes(block.type)) add(block.id);
    else if (block.type === 'dialogue') (block.lines || []).forEach((line, lineIndex) => parseFillText(line.text).filter((part) => part.type === 'blank').forEach((part) => add(answerKey(block, lineIndex, part.index))));
    else if (['error_correction', 'transformation'].includes(block.type)) (block.sentences || []).forEach((_, index) => add(answerKey(block, index)));
    else if (block.type === 'translate') (block.items || block.pairs || []).forEach((_, index) => add(answerKey(block, index)));
    else if (block.type === 'table') Array.from({ length: Math.max(Number(block.rows) || 0, 1) }, (_, row) => (block.headers || []).forEach((_, column) => add(answerKey(block, row, column))));
  });
  return { answered, total, complete: total === 0 || answered === total };
}

export function calculateWorksheetResult(blocks = [], answers = {}) {
  let correct = 0;
  let total = 0;
  const errorLog = [];
  const check = ({ block, key, expected, type, question = '' }) => {
    total += 1;
    const given = answers[key];
    if (clean(given) === clean(expected)) correct += 1;
    else errorLog.push({
      type,
      blockLabel: block.label || block.instruction || 'Ülesanne',
      ...(question ? { question } : {}),
      correct: String(expected ?? ''),
      given: hasAnswer(given) ? String(given) : '(vastamata)',
    });
  };

  blocks.forEach((block) => {
    if (block.type === 'fill') parseFillText(block.text).filter((part) => part.type === 'blank').forEach((part) => check({ block, key: answerKey(block, part.index), expected: part.answer, type: 'fill' }));
    else if (['choice', 'reading'].includes(block.type)) questions(block).forEach((question, index) => {
      const expectedIndex = Number(question.correct ?? 0);
      const selected = answers[answerKey(block, index)];
      total += 1;
      if (Number(selected) === expectedIndex) correct += 1;
      else errorLog.push({ type: block.type, blockLabel: block.label || block.instruction || 'Valikvastus', question: question.q || question.question || '', correct: options(question)[expectedIndex] || '', given: options(question)[Number(selected)] || '(vastamata)' });
    });
    else if (block.type === 'match') (block.pairs || []).forEach((pair, index) => check({ block, key: answerKey(block, index), expected: pair.r || pair.right, type: 'match', question: pair.l || pair.left }));
    else if (block.type === 'dialogue') (block.lines || []).forEach((line, lineIndex) => parseFillText(line.text).filter((part) => part.type === 'blank').forEach((part) => check({ block, key: answerKey(block, lineIndex, part.index), expected: part.answer, type: 'dialogue' })));
    else if (block.type === 'error_correction') (block.sentences || []).forEach((sentence, index) => check({ block, key: answerKey(block, index), expected: sentence.correct, type: 'error_correction', question: sentence.wrong }));
    else if (block.type === 'translate') (block.items || block.pairs || []).forEach((pair, index) => check({ block, key: answerKey(block, index), expected: pair.to || pair.r || pair.right, type: 'translate', question: pair.from || pair.l || pair.left }));
    else if (block.type === 'order' && block.sentence) check({ block, key: block.id, expected: block.sentence, type: 'order' });
  });
  return {
    score: total ? { correct, total, pct: Math.round((correct / total) * 100) } : null,
    errorLog: errorLog.slice(0, 20),
  };
}

export function blockTitle(type) {
  return ({
    text: 'Juhis', image: 'Pilt', fill: 'Täida lüngad', choice: 'Vali vastus', reading: 'Lugemistekst', writing: 'Kirjutamine', match: 'Sobita paarid', order: 'Järjesta sõnad', table: 'Täida tabel', dialogue: 'Dialoog', error_correction: 'Paranda vead', transformation: 'Muuda lauseid', translate: 'Tõlgi',
  })[type] || 'Ülesanne';
}
''',encoding='utf-8')

# Student player renders the original page as background and answer controls at authored percentage coordinates.
player=ROOT/'crm-v2/src/features/homework/WorksheetPlayer.jsx'
player.write_text(r'''import { CheckCircle2, Clock3, Send, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import {
  answerKey,
  blockTitle,
  calculateVisualWorksheetResult,
  calculateWorksheetResult,
  mergeWorksheetResults,
  parseFillText,
  visualAnswerKey,
  visualAnswerMatches,
  visualWorksheetPages,
  visualWorksheetProgress,
  worksheetProgress,
} from './worksheetPlayer.js';

function questionText(question) { return question.q || question.question || question.prompt || 'Küsimus'; }
function questionOptions(question) { return question.opts || question.options || []; }
function pairLeft(pair) { return pair.l || pair.left || pair.from || ''; }
function pairRight(pair) { return pair.r || pair.right || pair.to || ''; }

function WorksheetBlock({ block, index, answers, done, readOnly, onAnswer }) {
  const disabled = done || readOnly;
  const set = (key, value) => onAnswer((current) => ({ ...current, [key]: value }));
  const choiceList = (block.questions || []).map((question, questionIndex) => {
    const key = answerKey(block, questionIndex);
    const selected = answers[key];
    return <div className="worksheet-question" key={key}><strong>{questionIndex + 1}. {questionText(question)}</strong><div>{questionOptions(question).filter(Boolean).map((option, optionIndex) => {
      const correct = done && optionIndex === Number(question.correct ?? 0);
      const wrong = done && Number(selected) === optionIndex && !correct;
      return <button type="button" className={`${Number(selected) === optionIndex ? 'is-selected' : ''} ${correct ? 'is-correct' : ''} ${wrong ? 'is-wrong' : ''}`} disabled={disabled} onClick={() => set(key, optionIndex)} key={`${option}-${optionIndex}`}>{option}{correct ? ' ✓' : wrong ? ' ✕' : ''}</button>;
    })}</div></div>;
  });

  return <section className="worksheet-block">
    <header><span>{index + 1}</span><div><strong>{block.label || blockTitle(block.type)}</strong>{block.instruction ? <small>{block.instruction}</small> : null}</div></header>
    {block.type === 'text' ? <p className="worksheet-copy">{block.content || block.text}</p> : null}
    {block.type === 'image' && block.imageUrl ? <figure><img src={block.imageUrl} alt={block.caption || 'Töölehe pilt'} />{block.caption ? <figcaption>{block.caption}</figcaption> : null}</figure> : null}
    {block.type === 'fill' ? <p className="worksheet-fill">{parseFillText(block.text).map((part, partIndex) => part.type === 'text' ? <span key={partIndex}>{part.value}</span> : <label key={partIndex}><span className="sr-only">Lünk {part.index + 1}</span><input value={answers[answerKey(block, part.index)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, part.index), event.target.value)} />{done && String(answers[answerKey(block, part.index)] || '').trim().toLocaleLowerCase('et') !== part.answer.trim().toLocaleLowerCase('et') ? <small>{part.answer}</small> : null}</label>)}</p> : null}
    {block.type === 'choice' ? <div className="worksheet-questions">{choiceList}</div> : null}
    {block.type === 'reading' ? <><p className="worksheet-passage">{block.passage || block.text}</p><div className="worksheet-questions">{choiceList}</div></> : null}
    {block.type === 'match' ? <div className="worksheet-match">{(block.pairs || []).map((pair, pairIndex) => <label key={answerKey(block, pairIndex)}><strong>{pairIndex + 1}. {pairLeft(pair)}</strong><Select aria-label={`Paar ${pairIndex + 1}`} value={answers[answerKey(block, pairIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, pairIndex), event.target.value)}><option value="">Vali paar</option>{(block.pairs || []).map((option, optionIndex) => <option value={pairRight(option)} key={`${pairRight(option)}-${optionIndex}`}>{pairRight(option)}</option>)}</Select>{done && answers[answerKey(block, pairIndex)] !== pairRight(pair) ? <small>Õige: {pairRight(pair)}</small> : null}</label>)}</div> : null}
    {block.type === 'writing' ? <><p className="worksheet-task">{block.task || block.prompt}</p><textarea aria-label={`Kirjalik vastus ${index + 1}`} rows={Math.min(Number(block.lines) || 5, 12)} value={answers[block.id] || ''} disabled={disabled} onChange={(event) => set(block.id, event.target.value)} placeholder="Kirjuta vastus siia…" /></> : null}
    {block.type === 'order' ? <><div className="worksheet-words">{String(block.sentence || '').split(/\s+/).filter(Boolean).reverse().map((word, wordIndex) => <span key={`${word}-${wordIndex}`}>{word}</span>)}</div><input className="worksheet-long-input" aria-label={`Järjestatud lause ${index + 1}`} value={answers[block.id] || ''} disabled={disabled} onChange={(event) => set(block.id, event.target.value)} placeholder="Kirjuta õige lause" />{done && String(answers[block.id] || '').trim().toLocaleLowerCase('et') !== String(block.sentence || '').trim().toLocaleLowerCase('et') ? <small className="worksheet-correction">Õige: {block.sentence}</small> : null}</> : null}
    {block.type === 'table' ? <div className="worksheet-table-wrap"><table><thead><tr>{(block.headers || []).map((header, column) => <th key={`${header}-${column}`}>{header}</th>)}</tr></thead><tbody>{Array.from({ length: Math.max(Number(block.rows) || 0, 1) }, (_, row) => <tr key={row}>{(block.headers || []).map((_, column) => <td key={column}><input aria-label={`Tabel ${row + 1}, ${column + 1}`} value={answers[answerKey(block, row, column)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, row, column), event.target.value)} /></td>)}</tr>)}</tbody></table></div> : null}
    {block.type === 'dialogue' ? <div className="worksheet-dialogue">{(block.lines || []).map((line, lineIndex) => <p key={lineIndex}><strong>{line.speaker}:</strong>{parseFillText(line.text).map((part, partIndex) => part.type === 'text' ? <span key={partIndex}>{part.value}</span> : <input aria-label={`Dialoogi lünk ${lineIndex + 1}.${part.index + 1}`} key={partIndex} value={answers[answerKey(block, lineIndex, part.index)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, lineIndex, part.index), event.target.value)} />)}</p>)}</div> : null}
    {block.type === 'error_correction' ? <div className="worksheet-repeat">{(block.sentences || []).map((sentence, sentenceIndex) => <label key={answerKey(block, sentenceIndex)}><span><s>{sentence.wrong}</s></span><input value={answers[answerKey(block, sentenceIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, sentenceIndex), event.target.value)} placeholder="Parandatud lause" />{done ? <small>Õige: {sentence.correct}</small> : null}</label>)}</div> : null}
    {block.type === 'transformation' ? <div className="worksheet-repeat">{block.example?.from || block.example?.to ? <p className="worksheet-example"><strong>Näide:</strong> {block.example.from} → {block.example.to}</p> : null}{(block.sentences || []).map((sentence, sentenceIndex) => <label key={answerKey(block, sentenceIndex)}><span>{typeof sentence === 'string' ? sentence : sentence.from}</span><input value={answers[answerKey(block, sentenceIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, sentenceIndex), event.target.value)} placeholder="Muudetud lause" /></label>)}</div> : null}
    {block.type === 'translate' ? <div className="worksheet-repeat">{(block.items || block.pairs || []).map((pair, pairIndex) => <label key={answerKey(block, pairIndex)}><span>{pairLeft(pair)}</span><input value={answers[answerKey(block, pairIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, pairIndex), event.target.value)} placeholder="Tõlge" />{done ? <small>Õige: {pairRight(pair)}</small> : null}</label>)}</div> : null}
    {!['text', 'image', 'fill', 'choice', 'reading', 'match', 'writing', 'order', 'table', 'dialogue', 'error_correction', 'transformation', 'translate'].includes(block.type) ? <p className="worksheet-copy">{block.content || block.text || block.task || 'Seda ülesandetüüpi saab praegu ainult vaadata.'}</p> : null}
  </section>;
}

function clampPercent(value) {
  const number = Number(value);
  return Math.max(0, Math.min(1, Number.isFinite(number) ? number : 0)) * 100;
}

function VisualWorksheetPage({ page, answers, done, readOnly, onAnswer }) {
  const [activeWord, setActiveWord] = useState('');
  const disabled = done || readOnly;
  const url = page.file.url || page.file.downloadUrl || '';
  const set = (key, value) => onAnswer((current) => ({ ...current, [key]: value }));
  const elementStyle = (element) => ({
    left: `${clampPercent(element.x)}%`,
    top: `${clampPercent(element.y)}%`,
    width: `${Math.max(1, clampPercent(element.w))}%`,
    height: `${Math.max(1, clampPercent(element.h))}%`,
  });

  return <figure className="visual-worksheet-page">
    <div className="visual-worksheet-canvas">
      <img src={url} alt={`${page.file.name || 'Tööleht'} · leht ${page.fileIndex + 1}`} draggable="false" />
      <div className="visual-worksheet-layer">
        {page.elements.map((element, elementIndex) => {
          const key = visualAnswerKey(page.fileIndex, element);
          const label = element.label || element.placeholder || `Vastus ${elementIndex + 1}`;
          const status = done ? visualAnswerMatches(element, answers[key]) : null;
          const className = `visual-worksheet-control visual-worksheet-${element.type}${status === true ? ' is-correct' : status === false ? ' is-wrong' : ''}`;
          if (element.type === 'word') return <button key={key} type="button" className="visual-worksheet-word" style={elementStyle(element)} aria-label={element.text || element.lemma || 'Sõna'} onClick={() => setActiveWord((current) => current === element.id ? '' : element.id)}><span className="sr-only">{element.text || element.lemma || 'Sõna'}</span>{activeWord === element.id ? <span className="visual-word-tip">{element.translation || element.text || element.lemma || 'Selgitus puudub'}</span> : null}</button>;
          if (element.type === 'input') return <input key={key} className={className} style={elementStyle(element)} aria-label={label} value={answers[key] ?? ''} disabled={disabled} onChange={(event) => set(key, event.target.value)} placeholder={element.placeholder || ''} autoComplete="off" />;
          if (element.type === 'textarea') return <textarea key={key} className={className} style={elementStyle(element)} aria-label={label} value={answers[key] ?? ''} disabled={disabled} onChange={(event) => set(key, event.target.value)} placeholder={element.placeholder || ''} />;
          if (element.type === 'choice') return <select key={key} className={className} style={elementStyle(element)} aria-label={label} value={answers[key] ?? ''} disabled={disabled} onChange={(event) => set(key, event.target.value)}><option value="">Vali…</option>{(element.options || []).filter(Boolean).map((option, optionIndex) => <option value={option} key={`${option}-${optionIndex}`}>{option}</option>)}</select>;
          if (element.type === 'checkbox') return <label key={key} className={className} style={elementStyle(element)} title={label}><input type="checkbox" aria-label={label} checked={Boolean(answers[key])} disabled={disabled} onChange={(event) => set(key, event.target.checked)} /></label>;
          return null;
        })}
      </div>
    </div>
    <figcaption><strong>Leht {page.fileIndex + 1}</strong><span>{page.file.name || 'Tööleht'}</span></figcaption>
  </figure>;
}

export default function WorksheetPlayer({ assignment, repository, readOnly = false, onClose, onSubmitted }) {
  const blocks = useMemo(() => assignment.worksheetData?.blocks || [], [assignment]);
  const visualPages = useMemo(() => visualWorksheetPages(assignment.files || []), [assignment]);
  const [answers, setAnswers] = useState(assignment.answers || {});
  const [submitted, setSubmitted] = useState(assignment.status === 'done');
  const [score, setScore] = useState(assignment.score || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState(assignment.selfAssessment?.difficulty || '');
  const [comment, setComment] = useState(assignment.selfAssessment?.comment || '');
  const [assessmentSaved, setAssessmentSaved] = useState(Boolean(assignment.selfAssessment));
  const structuredProgress = useMemo(() => worksheetProgress(blocks, answers), [answers, blocks]);
  const visualProgress = useMemo(() => visualWorksheetProgress(assignment.files || [], answers), [answers, assignment]);
  const progress = useMemo(() => ({
    answered: structuredProgress.answered + visualProgress.answered,
    total: structuredProgress.total + visualProgress.total,
    complete: structuredProgress.complete && visualProgress.complete,
  }), [structuredProgress, visualProgress]);

  const submit = async () => {
    if (!progress.complete) { setError(`Täida kõik vastused (${progress.answered}/${progress.total}).`); return; }
    setSaving(true); setError('');
    try {
      const result = mergeWorksheetResults(
        calculateWorksheetResult(blocks, answers),
        calculateVisualWorksheetResult(assignment.files || [], answers),
      );
      await repository.submitWorksheet({ assignmentId: assignment.id, answers, ...result });
      setScore(result.score); setSubmitted(true); onSubmitted?.();
    } catch (submitError) { setError(submitError.message || 'Töölehe esitamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  const saveAssessment = async () => {
    setSaving(true); setError('');
    try { await repository.saveSelfAssessment({ assignmentId: assignment.id, difficulty, comment }); setAssessmentSaved(true); onSubmitted?.(); }
    catch (assessmentError) { setError(assessmentError.message || 'Tagasiside salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  const hasWork = blocks.length > 0 || visualPages.length > 0;
  const footer = !submitted && !readOnly && hasWork
    ? <><span className="worksheet-progress">{progress.answered}/{progress.total} vastust</span><Button variant="secondary" onClick={onClose}>Sulge</Button><Button loading={saving} onClick={submit}><Send size={17} /> Esita tööleht</Button></>
    : <Button variant="secondary" onClick={onClose}>Sulge</Button>;

  return <Modal open title={assignment.title} onClose={onClose} className="modal--worksheet" footer={footer}>
    <article className="worksheet-player">
      <header><div><span className="eyebrow">{assignment.subject || 'Õppetöö'} · {assignment.level || 'Tööleht'}</span><p>{assignment.topic || assignment.note || 'Õpetaja määratud tööleht'}</p></div>{submitted ? <Badge tone="success">Esitatud</Badge> : readOnly ? <Badge tone="neutral">Ainult vaatamiseks</Badge> : <Badge tone="info">Täitmisel</Badge>}</header>
      {assignment.note ? <div className="worksheet-note"><strong>Õpetaja märkus</strong><p>{assignment.note}</p></div> : null}
      {submitted && score ? <div className="worksheet-result"><CheckCircle2 size={24} /><div><strong>{score.pct}% · {score.correct}/{score.total} õiget</strong><span>{score.pct >= 80 ? 'Suurepärane töö!' : score.pct >= 50 ? 'Tubli! Vaata vead üle.' : 'Harjuta veel ja küsi õpetajalt abi.'}</span></div></div> : null}
      {error ? <div className="action-error" role="alert">{error}<button onClick={() => setError('')}>×</button></div> : null}
      {visualPages.length ? <div className="visual-worksheet-pages">{visualPages.map((page) => <VisualWorksheetPage page={page} answers={answers} done={submitted} readOnly={readOnly} onAnswer={setAnswers} key={`${page.file.url || page.file.name}-${page.fileIndex}`} />)}</div> : null}
      {blocks.length ? <div className="worksheet-blocks">{blocks.map((block, index) => <WorksheetBlock block={{ ...block, id: block.id || `block-${index}` }} index={index} answers={answers} done={submitted} readOnly={readOnly} onAnswer={setAnswers} key={block.id || `${block.type}-${index}`} />)}</div> : null}
      {!hasWork ? <div className="worksheet-empty">Töölehel ei ole täidetavaid ülesandeid.</div> : null}
      {submitted ? <section className="worksheet-assessment"><div><Star size={21} /><div><strong>Kuidas tööleht tundus?</strong><span>Tagasiside aitab õpetajal järgmisi ülesandeid kohandada.</span></div></div>{assessmentSaved ? <p><CheckCircle2 size={17} /> Tagasiside salvestatud. Aitäh!</p> : <><Select id="worksheet-difficulty" label="Raskusaste" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">Vali</option><option value="1">Väga lihtne</option><option value="2">Lihtne</option><option value="3">Paras</option><option value="4">Raske</option><option value="5">Väga raske</option></Select><label className="textarea-field"><span>Kommentaar</span><textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Mis oli raske või jäi arusaamatuks?" /></label><Button loading={saving} disabled={!difficulty} onClick={saveAssessment}>Saada tagasiside</Button></>}</section> : null}
      {readOnly && !submitted ? <div className="worksheet-readonly"><Clock3 size={19} /><p>Õpilane ei ole seda töölehte veel esitanud.</p></div> : null}
    </article>
  </Modal>;
}
''',encoding='utf-8')

# Visual worksheet student styles: image remains the original design, controls sit on top in percentage coordinates.
css=ROOT/'crm-v2/src/styles/index.css'
style=css.read_text(encoding='utf-8')
marker='\n.exercise-launch{color:#175cd3}'
if marker not in style: raise SystemExit('worksheet CSS insertion marker missing')
visual_css=r'''
.visual-worksheet-pages{display:grid;gap:22px;padding:18px 20px}.visual-worksheet-page{width:min(100%,1040px);margin:0 auto;background:#fff;border:1px solid #d0d5dd;border-radius:14px;overflow:hidden;box-shadow:0 10px 28px rgba(15,23,42,.09)}.visual-worksheet-canvas{position:relative;width:100%;background:#fff}.visual-worksheet-canvas>img{display:block;width:100%;height:auto;user-select:none}.visual-worksheet-layer{position:absolute;inset:0}.visual-worksheet-control,.visual-worksheet-word{position:absolute;z-index:2;margin:0;border:1.5px solid rgba(34,107,90,.58);border-radius:6px;background:rgba(255,255,255,.92);color:#162033;box-shadow:0 1px 4px rgba(15,23,42,.08);font:600 clamp(10px,1.35vw,17px) 'DM Sans',system-ui,sans-serif;outline:0}.visual-worksheet-control:focus{border-color:#175cd3;box-shadow:0 0 0 3px rgba(23,92,211,.15);background:#fff}.visual-worksheet-input,.visual-worksheet-choice{padding:2px 6px}.visual-worksheet-textarea{padding:4px 6px;resize:none;line-height:1.25}.visual-worksheet-checkbox{display:grid;place-items:center;padding:0;background:rgba(255,255,255,.84)}.visual-worksheet-checkbox input{width:min(70%,26px);height:min(70%,26px);accent-color:var(--green)}.visual-worksheet-control:disabled{opacity:1;color:#162033;-webkit-text-fill-color:#162033}.visual-worksheet-control.is-correct{border-color:#12b76a;background:rgba(236,253,243,.94)}.visual-worksheet-control.is-wrong{border-color:#f04438;background:rgba(254,243,242,.94)}.visual-worksheet-word{border:1px dashed rgba(23,92,211,.34);background:rgba(239,248,255,.12);box-shadow:none;cursor:help}.visual-worksheet-word:hover,.visual-worksheet-word:focus{background:rgba(239,248,255,.42);border-color:#175cd3}.visual-word-tip{position:absolute;left:0;top:calc(100% + 6px);z-index:8;min-width:150px;max-width:260px;padding:8px 10px;border-radius:9px;background:#162033;color:#fff;font-size:12px;font-weight:700;line-height:1.35;text-align:left;white-space:normal;box-shadow:0 8px 24px rgba(15,23,42,.2)}.visual-worksheet-page figcaption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 13px;border-top:1px solid #eef0f3;background:#f8fafc;color:var(--muted);font-size:.74rem}.visual-worksheet-page figcaption strong{color:#344054}.visual-worksheet-page figcaption span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.visual-worksheet-pages+.worksheet-blocks{padding-top:0}
@media(max-width:700px){.visual-worksheet-pages{padding:14px;gap:16px}.visual-worksheet-page{border-radius:10px}.visual-worksheet-control,.visual-worksheet-word{border-radius:4px;font-size:clamp(8px,2.7vw,13px)}.visual-worksheet-input,.visual-worksheet-choice,.visual-worksheet-textarea{padding:1px 3px}.visual-word-tip{min-width:120px;max-width:210px;font-size:11px}.visual-worksheet-page figcaption{padding:8px 10px}}
'''
style=style.replace(marker,'\n'+visual_css+marker,1)
css.write_text(style,encoding='utf-8')

# Focused pure tests.
(ROOT/'crm-v2/src/features/homework/worksheetPlayer.visual.test.js').write_text(r'''import { describe, expect, it } from 'vitest';
import {
  calculateVisualWorksheetResult,
  mergeWorksheetResults,
  visualAnswerKey,
  visualWorksheetPages,
  visualWorksheetProgress,
} from './worksheetPlayer.js';

const files = [{
  name: 'page-1.png',
  url: 'https://example.invalid/page-1.png',
  type: 'image/png',
  interactiveOverlay: { version: 1, elements: [
    { id: 'short', type: 'input', x: .1, y: .2, w: .3, h: .04, correctAnswer: 'Tere' },
    { id: 'essay', type: 'textarea', x: .1, y: .3, w: .5, h: .12, correctAnswer: '' },
    { id: 'choice', type: 'choice', x: .1, y: .5, w: .3, h: .05, options: ['A', 'B'], correctAnswer: 'B' },
    { id: 'check', type: 'checkbox', x: .6, y: .5, w: .05, h: .05, correctAnswer: 'true' },
    { id: 'word', type: 'word', x: .2, y: .7, w: .1, h: .03, translation: 'слово' },
  ] },
}];

describe('visual worksheet student contract', () => {
  it('keeps image pages and counts only answerable overlays', () => {
    expect(visualWorksheetPages(files)).toHaveLength(1);
    const answers = {
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[0])]: 'Tere',
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[1])]: 'Minu vastus',
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[2])]: 'B',
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[3])]: true,
    };
    expect(visualWorksheetProgress(files, answers)).toEqual({ answered: 4, total: 4, complete: true });
  });

  it('scores only fields with an explicit answer key and keeps open writing unscored', () => {
    const elements = files[0].interactiveOverlay.elements;
    const answers = {
      [visualAnswerKey(0, elements[0])]: 'tere',
      [visualAnswerKey(0, elements[1])]: 'Vaba vastus',
      [visualAnswerKey(0, elements[2])]: 'A',
      [visualAnswerKey(0, elements[3])]: true,
    };
    const result = calculateVisualWorksheetResult(files, answers);
    expect(result.score).toEqual({ correct: 2, total: 3, pct: 67 });
    expect(result.errorLog).toHaveLength(1);
  });

  it('merges structured and visual auto-score totals', () => {
    expect(mergeWorksheetResults(
      { score: { correct: 2, total: 2, pct: 100 }, errorLog: [] },
      { score: { correct: 1, total: 2, pct: 50 }, errorLog: [{ type: 'visual_choice' }] },
    )).toEqual({ score: { correct: 3, total: 4, pct: 75 }, errorLog: [{ type: 'visual_choice' }] });
  });
});
''',encoding='utf-8')

(ROOT/'visual-worksheet-student-v1.test.js').write_text(r'''const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const libraryCore=require('./learning-library-core.js');

const haldus=fs.readFileSync('haldus-exercises/index.html','utf8');
const library=fs.readFileSync('crm-v2/src/services/firebase/library.js','utf8');
const homework=fs.readFileSync('crm-v2/src/services/firebase/homework.js','utf8');
const player=fs.readFileSync('crm-v2/src/features/homework/WorksheetPlayer.jsx','utf8');
const styles=fs.readFileSync('crm-v2/src/styles/index.css','utf8');

test('visual overlays classify an image material as a worksheet',()=>{
  const item=libraryCore.libraryItem('curriculum',{id:'visual-1',type:'material',files:[{name:'page.png',interactiveOverlay:{version:1,elements:[{id:'a',type:'input'}]}}]});
  assert.equal(item.type,'worksheet');
  assert.equal(item.assignMode,'worksheet');
});

test('worksheet assignment snapshots visual pages and overlay metadata',()=>{
  assert.match(haldus,/files:\(item\.source\.files\|\|\[\]\)\.map/);
  assert.match(haldus,/interactiveOverlay:file\.interactiveOverlay/);
  assert.match(library,/files: storedFiles\(item\.source\.files \|\| \[\]\)/);
  assert.match(library,/storedInteractiveOverlay/);
  assert.match(homework,/files: Array\.isArray\(data\.files\) \? data\.files : \[\]/);
});

test('student player renders answer controls on the original image and submits them through existing assignment flow',()=>{
  assert.match(player,/function VisualWorksheetPage/);
  assert.match(player,/className="visual-worksheet-canvas"/);
  assert.match(player,/visualAnswerKey\(page\.fileIndex, element\)/);
  assert.match(player,/element\.type === 'input'/);
  assert.match(player,/element\.type === 'textarea'/);
  assert.match(player,/element\.type === 'choice'/);
  assert.match(player,/element\.type === 'checkbox'/);
  assert.match(player,/repository\.submitWorksheet\(\{ assignmentId: assignment\.id, answers, \.\.\.result \}\)/);
  assert.match(styles,/\.visual-worksheet-layer\{position:absolute;inset:0\}/);
});
''',encoding='utf-8')

# Architecture: assignment now snapshots visual page contract; student answers stay in existing answers map.
arch=ROOT/'ARCHITECTURE.md'
a=arch.read_text(encoding='utf-8')
anchor="""Assignment records copy display metadata for historical readability and also store stable
`sourceId` and `curriculumId` references when available.
"""
addition=anchor+"""Visual worksheet assignments may additionally snapshot image `files` with a bounded
`interactiveOverlay` (`version: 1`, percentage-positioned elements). The source image remains immutable;
student input is stored only in the assignment's existing `answers` map under visual field keys and is
submitted through the existing worksheet completion contract. This adds no second assignment store and
keeps legacy structured `worksheetData.blocks` assignments compatible.
"""
if anchor not in a: raise SystemExit('architecture anchor missing')
a=a.replace(anchor,addition,1)
arch.write_text(a,encoding='utf-8')

# Current state documentation.
state=ROOT/'docs/PROJECT_STATE.md'
d=state.read_text(encoding='utf-8')
pr_url=os.getenv('VISUAL_WORKSHEET_PR_URL','').strip() or 'draft PR pending'
d=re.sub(r'Last verified:.*?\nRepository:', 'Last verified: 2026-09-14, Europe/Tallinn\nRepository:', d, count=1)
d=re.sub(r'Verified main:.*?\n', 'Verified main: `ab69a0e05c0b449a1de36242ffa2e7545b076779` — base for Student Visual Worksheet v1\n', d, count=1)
d=re.sub(r'Current implementation branch:.*?\n', 'Current implementation branch: `agent/visual-worksheet-student-v1`\n', d, count=1)
d=re.sub(r'Current draft PR:.*?\n', f'Current draft PR: {pr_url}\n', d, count=1)
section=f'''\n## Student Visual Worksheet v1 — DRAFT\n\nThis slice connects the already-merged manual image overlay authoring from #143 to the student assignment flow.\nA curriculum image with answerable `interactiveOverlay` fields is classified as a worksheet; assignment creation\nsnapshots the image pages and bounded overlay metadata into `worksheetAssignments`. The student `WorksheetPlayer`\nrenders the original page image unchanged and places short answer, long answer, choice and checkbox controls at\nthe authored percentage coordinates. Answers use the existing assignment `answers` map and existing\n`submitWorksheet` write boundary. Open responses are required for completion but are not auto-scored unless the\nteacher explicitly configured `correctAnswer`; word-translation hotspots remain informational.\n\nChanged data contract: optional `worksheetAssignments.files[]` snapshot with optional\n`interactiveOverlay: {{version:1,elements:[]}}`. Existing assignments without `files` are unchanged. No Firestore\nrule, Function, index, migration, financial data, curriculum skill credit or production deployment is included.\nThe open PDF overlay PR #144 remains separate; this slice intentionally implements the current PNG/JPG workflow\nwithout modifying PDF.js authoring.\n\nValidation: __VALIDATION_RESULT__\n\nKnown limitation: visual field placement depends on the teacher-authored overlay coordinates; this slice does not\nperform OCR/AI field detection. PDF student rendering remains a follow-up after #144 is reconciled.\n\nExactly one next safe step: review one real two-page image worksheet in the Vercel preview from teacher assignment\nthrough student completion and teacher submission view before merge.\n\n'''
marker='\n## Õppevara Visual Navigation v1 — DRAFT\n'
if marker not in d: raise SystemExit('project state insertion marker missing')
d=d.replace(marker,section+marker,1)
state.write_text(d,encoding='utf-8')

print('patched Student Visual Worksheet v1')
