import { Flame, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/index.js';
import { petsService } from '../../services/firebase/index.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { MOODS, STAGES } from './petArt.js';
import { PetArt } from './PetCard.jsx';
import { petProgress } from './petModel.js';
import './pet.css';

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * The student's pet for the teacher (student card) and parents (dashboard): what it looks like, how it grows,
 * the learning streak. Read-only, from the student's public copy `petProfiles/{uid}`; nothing shows if the student
 * has no pet (or switched it off).
 */
export default function PetOverview({ studentIds = [], lessons = [], homework = [], submissions = [], repository = petsService, wordsService, names = {} }) {
  const [pets, setPets] = useState([]);
  const key = studentIds.filter(Boolean).join('|');
  const words = useStudentWords(key.split('|').filter(Boolean), ...(wordsService ? [wordsService] : []));
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.listForStudents?.(key.split('|').filter(Boolean)) || [])
      .then((items) => { if (alive) setPets(items); }).catch(() => { if (alive) setPets([]); });
    return () => { alive = false; };
  }, [key, repository]);
  if (!pets.length) return null;
  return (
    <Card className="pet-overview">
      <div className="section-heading"><div><span className="eyebrow">Õpisõber</span><h2>{pets.length === 1 ? `${pets[0].name}` : 'Õpisõbrad'}</h2></div></div>
      <div className="pet-overview__list">{pets.map((pet) => {
        // one card: all of its data; several children: each pet grows from its own child's data
        const mine = (list) => (studentIds.length === 1 ? list : list.filter((item) => item.studentId === pet.studentId));
        const progress = petProgress({ lessons: mine(lessons), homework: mine(homework), submissions: mine(submissions), words: mine(words) });
        return (
          <article key={pet.id} className="pet-overview__item">
            <PetArt kind={pet.kind} mood={progress.mood} stage={progress.stage} wearing={pet.wearing || {}} className="pet-overview__art" />
            <div>
              <strong>{pet.name}{names[pet.studentId] ? ` · ${names[pet.studentId]}` : ''}</strong>
              <span>{STAGES[progress.stage]} · {MOODS[progress.mood].label}</span>
              <div className="pet-stats">
                <span className={progress.streak ? 'pet-stat is-hot' : 'pet-stat'}><Flame size={14} aria-hidden="true" /> {count(progress.streak, 'päev', 'päeva')} järjest</span>
                <span className="pet-stat"><Star size={14} aria-hidden="true" /> {progress.stars} tähte</span>
                <span className="pet-stat">{count(progress.learnedWords, 'õpitud sõna', 'õpitud sõna')}</span>
              </div>
            </div>
          </article>
        );
      })}</div>
    </Card>
  );
}
