import { CheckCircle2, Languages, Sparkles } from 'lucide-react';
import { useStudentWords } from './useStudentWords.js';
import { wordGrowth } from './wordGrowth.js';

// numbers a student and a parent read at a glance (wordGrowth.js); nothing shown before the first words
export default function WordGrowthCard({ words = [], title = 'Minu sõnad ja vead', name = '' }) {
  const growth = wordGrowth(words);
  if (!growth.words && !growth.mistakes) return null;
  return <section className="word-growth" aria-label={name ? `${title}: ${name}` : title}>
    <span className="eyebrow">{name ? `${title} · ${name}` : title}</span>
    <div className="word-growth__grid">
      <div><Languages size={18} aria-hidden="true" /><strong>{growth.learned}</strong><small>sõna selgeks õpitud<span lang="ru"> · выучено слов</span></small></div>
      <div><Sparkles size={18} aria-hidden="true" /><strong>+{growth.newThisMonth}</strong><small>uut sõna 30 päevaga<span lang="ru"> · новых за месяц</span></small></div>
      {growth.mistakes ? <div><CheckCircle2 size={18} aria-hidden="true" /><strong>{growth.fixed}/{growth.mistakes}</strong><small>oma viga parandatud<span lang="ru"> · ошибок исправлено</span></small></div> : null}
    </div>
  </section>;
}

// the family's view: one card per child, from the same live word lists as „Minu sõnad”
export function ChildrenWordGrowth({ students = [], service }) {
  const words = useStudentWords(students.map((student) => student.id), ...(service ? [service] : []));
  return <>{students.map((student) => <WordGrowthCard key={student.id} title="Sõnad ja vead" name={students.length > 1 ? student.name : ''} words={words.filter((word) => word.studentId === student.id)} />)}</>;
}
