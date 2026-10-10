import { useMemo, useState } from 'react';
import { createBlock } from '../engine/registry.js';
import { TEXT_TASKS, autoGapChoice, sentencesOf, tasksFromText, tokensOf } from './textToTasks.js';

/** „Tekstist”: paste a text, choose the tasks, click the words to gap; the tasks go onto the sheet. */
export default function TextToTasks({ onInsert }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [keys, setKeys] = useState(['reading', 'gaps', 'wordorder']);
  const [manual, setManual] = useState(false);
  const [chosen, setChosen] = useState([]);
  const [bank, setBank] = useState(true);
  const tokens = useMemo(() => tokensOf(text), [text]);
  const sentences = useMemo(() => sentencesOf(text), [text]);
  const auto = useMemo(() => autoGapChoice(text), [text]);
  const gapSet = new Set(manual ? chosen : auto);
  const made = useMemo(() => tasksFromText(text, keys, { chosen: manual ? chosen : null, bank, title }), [text, keys, manual, chosen, bank, title]);

  const toggleKey = (k) => setKeys((list) => (list.includes(k) ? list.filter((x) => x !== k) : [...list, k]));
  const toggleWord = (i) => { setManual(true); setChosen((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...(manual ? list : auto), i].filter((x, n, a) => a.indexOf(x) === n))); };
  const insert = () => {
    const type = Object.fromEntries(TEXT_TASKS.map((t) => [t.key, t.type]));
    onInsert(made.map(([k, data]) => { const b = createBlock(type[k]); b.data = { ...b.data, ...data }; return b; }));
    setText(''); setTitle(''); setChosen([]); setManual(false);
  };

  return (
    <div className="st-text2tasks">
      <p className="st-hint">Kleebi tekst. Sellest saab lugemise, lüngad, sõnajärje ja muud ülesanded.</p>
      <input className="st-input" aria-label="Teksti pealkiri" placeholder="Pealkiri (valikuline)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="st-input" aria-label="Tekst" rows={7} placeholder="Kleebi siia tekst…" value={text} onChange={(e) => { setText(e.target.value); setChosen([]); setManual(false); }} />
      {text ? <small className="st-hint">{sentences.length} lauset · {tokens.length} sõna</small> : null}
      <fieldset className="st-t2t-kinds"><legend>Ülesanded</legend>
        {TEXT_TASKS.map((t) => <label key={t.key}><input type="checkbox" checked={keys.includes(t.key)} onChange={() => toggleKey(t.key)} /> {t.label}</label>)}
      </fieldset>
      {keys.includes('gaps') && tokens.length ? (
        <div className="st-t2t-gaps">
          <div className="st-t2t-row"><b>Lüngad:</b>
            <label><input type="radio" name="t2t-mode" checked={!manual} onChange={() => { setManual(false); setChosen([]); }} /> automaatselt</label>
            <label><input type="radio" name="t2t-mode" checked={manual} onChange={() => { setManual(true); setChosen(auto); }} /> vali ise</label>
            <label><input type="checkbox" checked={bank} onChange={(e) => setBank(e.target.checked)} /> sõnapank</label>
          </div>
          <p className="st-hint">Klõpsa sõnal, et see lüngaks teha või lünk eemaldada.</p>
          <div className="st-t2t-words" aria-label="Teksti sõnad">
            {tokens.map((t) => <button type="button" key={t.i} className={gapSet.has(t.i) ? 'on' : ''} aria-pressed={gapSet.has(t.i)} onClick={() => toggleWord(t.i)}>{t.word}</button>)}
          </div>
        </div>
      ) : null}
      <button type="button" className="st-btn primary" disabled={!made.length} onClick={insert}>Lisa {made.length} ülesanne{made.length === 1 ? '' : 't'} lehele</button>
      {made.length ? <small className="st-hint">Tulevad: {made.map(([k]) => TEXT_TASKS.find((t) => t.key === k).label.split(' (')[0]).join(', ')}. Lugemisele kirjuta küsimused (või „Paku küsimused”).</small> : null}
    </div>
  );
}
