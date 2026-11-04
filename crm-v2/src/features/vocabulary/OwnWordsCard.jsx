import { Pencil, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card } from '../../components/ui/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { languageToolsService } from '../../services/firebase/languageTools.js';
import OwnWordForm from './OwnWordForm.jsx';
import { CHECK_LABEL, wordLanguagesFor } from './ownWord.js';
import { newestFirst } from './wordsModel.js';
import './vocabulary.css';

/**
 * Student „Sõnad” → „Minu sõnad”: „Lisa oma sõna” (spelling check + translation, everything editable) and the whole
 * list, where the words the student added himself can be edited. A word already in the list is opened instead of
 * being added twice. Preview (staff looking as the student) shows the list only.
 */
export default function OwnWordsCard({ students = [], words = [], user, preview = false, service = studentWordsService, toolsService = languageToolsService }) {
  const studentId = students[0]?.id || '';
  const [adding, setAdding] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [openId, setOpenId] = useState('');
  const [editId, setEditId] = useState('');
  const listRef = useRef(null);
  const languages = wordLanguagesFor(students);
  const mine = newestFirst(words.filter((word) => !studentId || word.studentId === studentId));
  const own = (word) => Boolean(user?.uid) && word.createdByUid === user.uid;

  const openWord = (word) => {
    setListOpen(true);
    setOpenId(word.id);
    setEditId(own(word) ? word.id : '');
  };
  useEffect(() => {
    if (!openId) return;
    listRef.current?.querySelector?.(`[data-word-id="${openId}"]`)?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [openId, listOpen]);

  return (
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Minu sõnad</span><h2>Lisa oma sõna</h2></div>
        {!preview && studentId && !adding ? <button type="button" className="vw-btn is-primary" onClick={() => setAdding(true)}><Plus size={16} aria-hidden="true" /> Lisa sõna</button> : null}
      </div>
      <p className="vw-muted">Kirjuta uus sõna või väljend: kontrollime kirjapildi ja pakume tõlke. Kõike saad muuta. · Напиши новое слово — проверим написание и предложим перевод.</p>
      {adding && !preview && studentId ? (
        <OwnWordForm studentId={studentId} user={user} words={mine} languages={languages} service={service} toolsService={toolsService} onOpen={openWord} />
      ) : null}
      {mine.length ? (
        <div className="vw-actions">
          <button type="button" className="vw-btn" aria-expanded={listOpen} onClick={() => setListOpen(!listOpen)}>{listOpen ? 'Peida sõnad' : `Kõik minu sõnad (${mine.length})`}</button>
        </div>
      ) : null}
      {listOpen ? (
        <ul className="vw-list own-words__list" ref={listRef}>{mine.map((item) => (
          <li key={item.id} data-word-id={item.id} className={openId === item.id ? 'is-open' : ''}>
            <span>
              <strong>{item.word}</strong>{item.translation ? <> — {item.translation}</> : null}
              {item.forms ? <small className="vw-forms">{item.forms}</small> : null}
              {item.example ? <small>{item.example}</small> : null}
              {own(item) ? <span className="own-word__meta"><span className="own-word__tag">lisasin ise</span>
                {item.checked ? <span className={`own-word__tag${item.checked === 'ok' ? '' : ' is-warn'}`}>{CHECK_LABEL[item.checked] || item.checked}</span> : null}</span> : null}
            </span>
            {own(item) && !preview && editId !== item.id ? <button type="button" className="vw-icon" aria-label={`Muuda „${item.word}”`} onClick={() => { setEditId(item.id); setOpenId(item.id); }}><Pencil size={15} /></button> : null}
            {editId === item.id && !preview ? (
              <OwnWordForm key={item.id} editing={item} studentId={studentId} user={user} words={mine} languages={languages} service={service} toolsService={toolsService}
                onOpen={openWord} onDone={() => setEditId('')} />
            ) : null}
          </li>
        ))}</ul>
      ) : null}
    </Card>
  );
}
