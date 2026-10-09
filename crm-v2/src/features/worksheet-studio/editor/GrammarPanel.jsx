import { useEffect, useState } from 'react';
import { BookMarked } from 'lucide-react';
import { grammarFor, loadGrammarProfile } from '../didactics/grammarProfile.js';
import { levelKey } from '../didactics/levels.js';

// „Leht”: the grammar of the sheet's level by EKI's grammar profile (topic, „oskab” statement, example).
export default function GrammarPanel({ level }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => { let alive = true; loadGrammarProfile().then((p) => { if (alive) setProfile(p); }); return () => { alive = false; }; }, []);
  if (!profile) return null;
  const { level: eki, targets } = grammarFor(profile, levelKey(level));
  const groups = targets.reduce((m, t) => { (m[t.category] = m[t.category] || []).push(t); return m; }, {});
  return (
    <details className="ed-grammar">
      <summary className="ed-label"><BookMarked size={14} aria-hidden="true" /> Tasemel {eki} õpitav grammatika (EKI) · {targets.length} teemat</summary>
      {Object.entries(groups).map(([category, list]) => (
        <div key={category} className="ed-grammar__group">
          <b>{category}</b>
          <ul>{list.map((t, i) => <li key={i} title={t.can}><span>{t.topic}</span>{t.example ? <small>{t.example}</small> : null}</li>)}</ul>
        </div>
      ))}
      <p className="ed-hint">Allikas: Eesti Keele Instituut, õpetaja tööriistad (Sõnaveeb), CC BY.</p>
      <p className="ed-hint">EKI õpetaja tööriistad: <a href="https://sonaveeb.ee/teacher-tools/#/vocabulary" target="_blank" rel="noreferrer">sõnavara</a> · <a href="https://sonaveeb.ee/teacher-tools/#/grammar" target="_blank" rel="noreferrer">grammatika</a> · <a href="https://sonaveeb.ee/teacher-tools/#/usecase" target="_blank" rel="noreferrer">kasutusolukorrad</a> · <a href="https://sonaveeb.ee/teacher-tools/#/rating" target="_blank" rel="noreferrer">teksti hindamine</a> · <a href="https://sonaveeb.ee/teacher-tools/#/educational-material" target="_blank" rel="noreferrer">õppevara loend</a></p>
    </details>
  );
}
