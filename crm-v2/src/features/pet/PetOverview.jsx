import { Flame, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/index.js';
import { homeworkService, petsService } from '../../services/firebase/index.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { MOODS, STAGES } from './petArt.js';
import { PetArt } from './PetCard.jsx';
import { petProgress } from './petModel.js';
import { careMood, petNeeds } from './petCare.js';
import './pet.css';

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * The student's pet for the teacher (student card) and parents (dashboard): what it looks like, how it grows,
 * the learning streak. Read-only, from the student's public copy `petProfiles/{uid}`; nothing shows if the student
 * has no pet (or switched it off). Growth is derived, so it reads what the student's own page reads: lessons, homework,
 * submitted work, words and lesson stats. What a viewer may not read stays empty: a parent has no lesson stats and a
 * teacher only his own lessons (firestore.rules), and only the student's own page knows the last game (`playedAt`).
 */
export default function PetOverview({ studentIds = [], lessons = [], homework, submissions, speech, repository = petsService, workRepository = homeworkService, wordsService, names = {} }) {
  const [pets, setPets] = useState([]);
  const [loaded, setLoaded] = useState({ homework: [], submissions: [], speech: [] });
  const key = studentIds.filter(Boolean).join('|');
  const words = useStudentWords(key.split('|').filter(Boolean), ...(wordsService ? [wordsService] : []));
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.listForStudents?.(key.split('|').filter(Boolean)) || [])
      .then((items) => { if (alive) setPets(items); }).catch(() => { if (alive) setPets([]); });
    return () => { alive = false; };
  }, [key, repository]);
  const hasPet = pets.length > 0;
  useEffect(() => {
    if (!hasPet) return undefined;
    let alive = true;
    const ids = key.split('|').filter(Boolean);
    const read = (given, load) => (given ? Promise.resolve(given) : Promise.resolve().then(load).then((list) => list || []).catch(() => []));
    Promise.all([
      read(homework, () => workRepository?.listByStudentIds?.(ids)),
      read(submissions, () => workRepository?.listSubmissionsByStudentIds?.(ids)),
      read(speech, () => repository.lessonStatsForStudents?.(ids)),
    ]).then(([nextHomework, nextSubmissions, nextSpeech]) => { if (alive) setLoaded({ homework: nextHomework, submissions: nextSubmissions, speech: nextSpeech }); });
    return () => { alive = false; };
  }, [hasPet, homework, key, repository, speech, submissions, workRepository]);
  if (!pets.length) return null;
  return (
    <Card className="pet-overview">
      <div className="section-heading"><div><span className="eyebrow">Õpisõber</span><h2>{pets.length === 1 ? `${pets[0].name}` : 'Õpisõbrad'}</h2></div></div>
      <div className="pet-overview__list">{pets.map((pet) => {
        // one card: all of its data; several children: each pet grows from its own child's data
        const mine = (list) => (studentIds.length === 1 ? list : list.filter((item) => item.studentId === pet.studentId));
        const own = { lessons: mine(lessons), homework: mine(loaded.homework), submissions: mine(loaded.submissions), words: mine(words) };
        const progress = petProgress({ ...own, speech: mine(loaded.speech) });
        // as on the student's page, except the need for play: its last game is not readable here
        const mood = careMood(progress.mood, { ...petNeeds(own), joy: 100 });
        return (
          <article key={pet.id} className="pet-overview__item">
            <PetArt kind={pet.kind} mood={mood} stage={progress.stage} wearing={pet.wearing || {}} className="pet-overview__art" />
            <div>
              <strong>{pet.name}{names[pet.studentId] ? ` · ${names[pet.studentId]}` : ''}</strong>
              <span>{STAGES[progress.stage]} · {MOODS[mood].label}</span>
              <div className="pet-stats">
                {progress.streak ? <span className="pet-stat is-hot"><Flame size={14} aria-hidden="true" /> {count(progress.streak, 'päev', 'päeva')} järjest</span> : null}
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
