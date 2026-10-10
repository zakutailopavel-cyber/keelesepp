import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { levelKey } from '../didactics/levels.js';

// EKI's language use situations (etLex „Kasutusolukorrad”, CEFR illustrative scales, written for young learners in the
// „mina” form): ready „Saan aru … / Oskan …” statements of the sheet's level. `actions`: [[label, (text) => void]].
const USE_LEVEL = { A1: 'A1', A2: 'A2', 'A2+': 'A2', 'B1-': 'B1', B1: 'B1', 'B1+': 'B1', 'B2-': 'B2', B2: 'B2', C1: 'B2' };
let loading = null;
const loadUseCases = () => { if (!loading) loading = import('../didactics/useCases.json').then((m) => (m.default || m).levels || null).catch(() => null); return loading; };

export default function UseCases({ level, actions = [], title = 'Ma oskan … (EKI kasutusolukorrad)' }) {
  const [data, setData] = useState(null);
  const [category, setCategory] = useState('');
  useEffect(() => { let alive = true; loadUseCases().then((d) => { if (alive) setData(d); }); return () => { alive = false; }; }, []);
  const eki = USE_LEVEL[levelKey(level)] || 'A2';
  const list = data?.[eki] || [];
  if (!list.length) return null;
  const categories = [...new Set(list.map((u) => u.category))];
  const shown = list.filter((u) => !category || u.category === category);
  return (
    <details className="ed-usecases">
      <summary className="ed-label"><MessagesSquare size={14} aria-hidden="true" /> {title} · tase {eki}</summary>
      <div className="ed-presets" role="group" aria-label="Tegevus">
        {['', ...categories].map((c) => <button type="button" key={c || 'all'} className={`ed-preset ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>{c || 'Kõik'}</button>)}
      </div>
      <ul>{shown.map((u, i) => (
        <li key={i}><b>{u.topic}</b> <small>{u.skill}{u.form ? ` · ${u.form}` : ''}</small>
          <ul>{u.examples.map((x) => <li key={x}><span>{x}</span>{actions.map(([label, act]) => <button type="button" key={label} className="ed-btn ghost" onClick={() => act(x)}>{label}</button>)}</li>)}</ul>
        </li>
      ))}</ul>
      <p className="ed-hint">Allikas: Eesti Keele Instituut, õpetaja tööriistad — kasutusolukorrad (Euroopa keeleõppe raamdokumendi näidisskaalad), CC BY.</p>
    </details>
  );
}
