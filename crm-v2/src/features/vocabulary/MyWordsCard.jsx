import { useEffect, useState } from 'react';
import { Badge, Card, EmptyState } from '../../components/ui/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { isDue, newestFirst } from './wordsModel.js';
import WordPractice from './WordPractice.jsx';
import './vocabulary.css';

/** Student (and parent) dashboard card „Minu sõnad”: the words from lessons, practice with flashcards. */
export default function MyWordsCard({ studentIds = [], service = studentWordsService, readOnly = false }) {
  const [byStudent, setByStudent] = useState({});
  const [error, setError] = useState('');
  const [mode, setMode] = useState('');
  const key = studentIds.join('|');
  useEffect(() => {
    const stops = key.split('|').filter(Boolean).map((id) => {
      try {
        return service.subscribeForStudent(id, (items) => setByStudent((current) => ({ ...current, [id]: items })), (next) => setError(next?.message || 'Sõnu ei saanud laadida.'));
      } catch (next) {
        globalThis.queueMicrotask(() => setError(next?.message || 'Sõnu ei saanud laadida.'));
        return () => {};
      }
    });
    return () => stops.forEach((stop) => stop?.());
  }, [key, service]);
  const words = newestFirst(Object.values(byStudent).flat());
  const due = words.filter((word) => isDue(word));

  return (
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Sõnavara</span><h2>Minu sõnad</h2></div>
        {words.length ? <Badge tone={due.length ? 'info' : 'success'}>{due.length ? `${due.length} kordamiseks` : 'Kõik korratud'}</Badge> : null}</div>
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      {mode === 'practice' ? <WordPractice words={words} service={service} onClose={() => setMode('')} />
        : words.length ? <>
          <div className="vw-actions">
            {readOnly ? null : <button type="button" className="vw-btn is-primary" disabled={!due.length} onClick={() => setMode('practice')}>Harjuta ({due.length})</button>}
            <button type="button" className="vw-btn" aria-expanded={mode === 'list'} onClick={() => setMode(mode === 'list' ? '' : 'list')}>{mode === 'list' ? 'Peida sõnad' : `Kõik sõnad (${words.length})`}</button>
          </div>
          {mode === 'list' ? <ul className="vw-list">{words.map((item) => <li key={item.id}><span><strong>{item.word}</strong>{item.translation ? <> — {item.translation}</> : null}{item.forms ? <small className="vw-forms">{item.forms}</small> : null}{item.example ? <small>{item.example}</small> : null}</span></li>)}</ul> : null}
        </> : <EmptyState title="Sõnu veel ei ole" description="Õpetaja lisab tunnis uued sõnad siia." />}
    </Card>
  );
}
