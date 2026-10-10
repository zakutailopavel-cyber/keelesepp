import { Flame, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Input } from '../../components/ui/index.js';
import { petsService } from '../../services/firebase/index.js';
import { MOODS, SPECIES, STAGES, petSvg } from './petArt.js';
import { PET_KINDS, petGreeting, petProgress, validPetName } from './petModel.js';
import { announcePet } from './petEvents.js';
import PetWardrobe from './PetWardrobe.jsx';
import PetCare from './PetCare.jsx';
import { careGreeting, careMood, lowestNeed, petNeeds } from './petCare.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { roomSvg } from './petRoom.js';
import { seasonalWear } from './petLife.js';
import './pet.css';

// Estonian: singular after 1, partitive otherwise (1 tund, 3 tundi)
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Our own generated SVG (constants only), safe to inject.
export function PetArt({ kind, mood, stage, wearing = {}, className = '' }) {
  return <div className={`pet-art ${className}`} dangerouslySetInnerHTML={{ __html: petSvg(kind, mood, stage, wearing) }} />;
}

// The pet in its room: the room grows with learning (petRoom.js); a bought background shows in the window
function PetRoom({ progress, pet, mood }) {
  const { bg = '', ...wearing } = pet.wearing || {};
  return (
    <div className="pet-home__art pet-scene">
      <div className="pet-scene__room" dangerouslySetInnerHTML={{ __html: roomSvg({ progress, bg }) }} />
      <PetArt kind={pet.kind} mood={mood} stage={progress.stage} wearing={seasonalWear(wearing)} className="pet-scene__pet" />
    </div>
  );
}

function PetPicker({ initial, onSave, onCancel, onDecline, saving, error }) {
  const [kind, setKind] = useState(initial?.kind || '');
  const [name, setName] = useState(initial?.name || '');
  const nameError = name ? validPetName(name) : '';
  return (
    <div className="pet-picker">
      <div className="pet-picker__head">
        <strong>Vali endale sõber</strong>
        <span>Ta kasvab koos sinuga: iga tunni, iga töölehe ja iga täidetud eesmärgiga. Kui sõpra ei soovi, vajuta „Ei, aitäh” — selle saab hiljem seadetes sisse lülitada.</span>
      </div>
      <div className="pet-picker__grid" role="radiogroup" aria-label="Sõber">
        {PET_KINDS.map((k) => (
          <button type="button" role="radio" aria-checked={kind === k} key={k} className="pet-choice" onClick={() => { setKind(k); if (!name || PET_KINDS.some((x) => SPECIES[x].name === name)) setName(SPECIES[k].name); }}>
            <PetArt kind={k} mood="happy" stage={1} />
            <b>{SPECIES[k].name}</b>
          </button>
        ))}
      </div>
      <div className="pet-picker__name">
        <Input id="pet-name" label="Nimi" value={name} maxLength={24} onChange={(event) => setName(event.target.value)} error={nameError || undefined} />
        <div className="pet-picker__actions">
          {onCancel ? <Button variant="secondary" onClick={onCancel}>Loobu</Button> : null}
          {onDecline ? <Button variant="secondary" disabled={saving} onClick={onDecline}>Ei, aitäh</Button> : null}
          <Button loading={saving} disabled={!kind || Boolean(validPetName(name))} onClick={() => onSave({ kind, name })}>Vali {kind ? SPECIES[kind].name : 'sõber'}</Button>
        </div>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}

// The student's pet on "Minu õpingud": chosen once, then grows from lessons, submitted worksheets and goals.
export default function PetCard({ user, studentId = '', readOnly = false, lessons = [], submissions = [], homework = [], words = [], pendingHomework = 0, lessonToday = '', subject = '', repository = petsService, wordsService = studentWordsService }) {
  const [pet, setPet] = useState(undefined);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [wardrobe, setWardrobe] = useState(false);

  // the learner's recorded lessons: simple numbers and his own corrected sentences (petLessonStats, school Mac)
  const [speech, setSpeech] = useState([]);
  useEffect(() => {
    let alive = true;
    if (readOnly || typeof repository.lessonStats !== 'function' || !user?.uid) return undefined;
    Promise.resolve().then(() => repository.lessonStats(user.uid)).then((list) => { if (alive) setSpeech(list || []); }).catch(() => {});
    return () => { alive = false; };
  }, [repository, readOnly, user?.uid]);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.get(user?.uid))
      .then((value) => { if (alive) setPet(value || null); })
      .catch(() => { if (alive) setPet(null); });
    return () => { alive = false; };
  }, [repository, user?.uid]);

  // the public copy (teacher, parents) follows the student's own pet; written only by the student
  const publishKey = pet?.kind && !pet.optedOut ? JSON.stringify([pet.kind, pet.name, pet.wearing || {}]) : '';
  useEffect(() => {
    if (readOnly || !publishKey || !studentId || !repository.publish) return;
    Promise.resolve().then(() => repository.publish({ uid: user.uid, studentId, pet })).catch(() => {});
  }, [publishKey, readOnly, studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (pet === undefined) return null;
  if (pet?.optedOut) return null;
  if (!pet?.kind && readOnly) return null;

  const save = async (choice) => {
    setSaving(true); setError('');
    try { const saved = await repository.save({ uid: user.uid, current: pet, ...choice }); setPet(saved); setEditing(false); announcePet(saved); }
    catch (err) { setError(err.message || 'Salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  const decline = async () => {
    setSaving(true); setError('');
    try { const saved = await repository.update({ uid: user.uid, current: pet, optedOut: true }); setPet(saved); announcePet(saved); }
    catch (err) { setError(err.message || 'Salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  if (!pet?.kind || editing) {
    return <Card className="pet-card"><PetPicker initial={pet} onSave={save} onCancel={pet?.kind ? () => setEditing(false) : null} onDecline={pet?.kind ? null : decline} saving={saving} error={error} /></Card>;
  }

  const progress = petProgress({ lessons, submissions, homework, words, speech });
  const changeOutfit = async (next) => {
    const saved = await repository.updateOutfit({ uid: user.uid, current: pet, ...next });
    setPet(saved);
  };
  // tamagotchi care: needs filled only by learning; a low need makes the pet sad (never more)
  const needs = petNeeds({ words, homework, submissions, lessons, playedAt: pet.playedAt, canFix: speech.some((s) => s.practice?.length) });
  const mood = careMood(progress.mood, needs);
  const hungry = mood === 'sad' ? lowestNeed(needs) : '';
  const greeting = petGreeting({ petName: pet.name, progress, pendingHomework, lessonToday, subject, lastSpeech: speech[0] || null });
  const say = hungry ? careGreeting(hungry, greeting.lang) : greeting;
  const played = async () => {
    const saved = await Promise.resolve().then(() => repository.update({ uid: user.uid, current: pet, playedAt: new Date().toISOString() })).catch(() => null);
    setPet(saved || { ...pet, playedAt: new Date().toISOString() });
  };
  const pct = progress.stageSize ? Math.round((progress.stageXp / progress.stageSize) * 100) : 100;
  return (
    <Card className="pet-card">
      <div className="pet-home">
        <PetRoom progress={progress} pet={pet} mood={mood} />
        <div className="pet-home__body">
          <div className="pet-bubble" lang={say.lang}><p>{say.text}</p><small lang="ru">{say.hint}</small></div>
          <div className="pet-home__meta">
            <strong>{pet.name}</strong>
            <span>{STAGES[progress.stage]} · {MOODS[mood].label}</span>
            {!readOnly ? <button type="button" className="pet-home__edit" onClick={() => setEditing(true)}>Muuda</button> : null}
            {!readOnly && repository.updateOutfit ? <button type="button" className="pet-home__edit" aria-expanded={wardrobe} onClick={() => setWardrobe(!wardrobe)}>Riidekapp</button> : null}
          </div>
          <PetCare needs={needs} words={words} wordsService={wordsService} readOnly={readOnly} onPlayed={played} stats={speech} />
          <div className="pet-xp" aria-label={`Kasv ${pct}%`}>
            <div className="pet-xp__bar"><i style={{ width: `${pct}%` }} /></div>
            <div className="pet-xp__row"><span>{progress.nextItem ? `Järgmine: ${progress.nextItem}` : 'Täiskasvanud sõber'}</span><span>{count(progress.lessons, 'tund', 'tundi')} · {count(progress.submissions, 'töö', 'tööd')} · {count(progress.goals, 'eesmärk', 'eesmärki')}</span></div>
          </div>
          <div className="pet-stats">
            <span className={progress.streak ? 'pet-stat is-hot' : 'pet-stat'} title="Päevi järjest õppimist (tund, töö, kodutöö või sõnade kordamine)"><Flame size={15} aria-hidden="true" /> {count(progress.streak, 'päev', 'päeva')} järjest</span>
            <span className="pet-stat" title="Tähed kasvavad koos õppimisega"><Star size={15} aria-hidden="true" /> {progress.stars} tähte</span>
            <span className="pet-stat">{count(progress.learnedWords, 'õpitud sõna', 'õpitud sõna')} · {count(progress.homework, 'kodutöö', 'kodutööd')}</span>
          </div>
        </div>
      </div>
      {wardrobe && !readOnly ? <PetWardrobe pet={pet} progress={progress} onChange={changeOutfit} onClose={() => setWardrobe(false)} /> : null}
    </Card>
  );
}
