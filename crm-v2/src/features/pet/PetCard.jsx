import { Flame, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card, Input } from '../../components/ui/index.js';
import { petsService } from '../../services/firebase/index.js';
import { SPECIES, STAGES, petSvg } from './petArt.js';
import { PET_KINDS, petProgress, validPetName } from './petModel.js';
import { announcePet } from './petEvents.js';
import PetWardrobe from './PetWardrobe.jsx';
import PetCare from './PetCare.jsx';
import { petNeeds } from './petCare.js';
import PetLoop from './PetLoop.jsx';
import { usePetMaterial } from './usePetMaterial.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { homeworkService, lessonWorksheetsService } from '../../services/firebase/index.js';
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

// The pet's own page: chosen once, then it lives in its room. The one request of the day, then games and the wardrobe as
// simple tabs, and one line of numbers. Staff (read-only) see the same pet and no actions.
export default function PetCard({ user, studentId = '', readOnly = false, lessons = [], submissions = [], homework = [], words = [], pendingHomework = 0, lessonToday = '', subject = '', repository = petsService, wordsService = studentWordsService, assignmentsService = homeworkService, courseSheets = lessonWorksheetsService }) {
  const [pet, setPet] = useState(undefined);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('games');
  const [mood, setMood] = useState('calm');
  const material = usePetMaterial({ uid: user?.uid, studentId, readOnly, lessons, repository, assignmentsService, courseSheets });
  const { speech, topics } = material;
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.get(user?.uid))
      .then((value) => { if (alive) setPet(value || null); })
      .catch(() => { if (alive) setPet(null); });
    return () => { alive = false; };
  }, [repository, user?.uid]);

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
  const needs = petNeeds({ words, homework, submissions, lessons, playedAt: pet.playedAt, canFix: speech.some((s) => s.practice?.length) });
  const played = async () => {
    const saved = await Promise.resolve().then(() => repository.update({ uid: user.uid, current: pet, playedAt: new Date().toISOString() })).catch(() => null);
    setPet(saved || { ...pet, playedAt: new Date().toISOString() });
  };
  const hasWardrobe = !readOnly && repository.updateOutfit;
  return (
    <Card className="pet-card">
      <div className="pet-page">
        <div className="pet-page__room"><PetRoom progress={progress} pet={pet} mood={mood} /></div>
        <div className="pet-home__body">
          <PetLoop user={user} studentId={studentId} pet={pet} variant="page" readOnly={readOnly} lessons={lessons} submissions={submissions} homework={homework} words={words} subject={subject}
            pendingHomework={pendingHomework} lessonToday={lessonToday} material={material} repository={repository} wordsService={wordsService} onPetChange={setPet} onMood={setMood} />
          <div className="pet-page__meta">
            <span>{STAGES[progress.stage]}</span>
            {progress.streak ? <span className="pet-stat is-hot"><Flame size={14} aria-hidden="true" /> {count(progress.streak, 'päev', 'päeva')} järjest</span> : null}
            <span><Star size={14} aria-hidden="true" /> {progress.stars} tähte</span>
            <span>{count(progress.learnedWords, 'õpitud sõna', 'õpitud sõna')}</span>
            <span>{count(progress.lessons, 'tund', 'tundi')}</span>
            {!readOnly ? <button type="button" className="pet-home__edit" onClick={() => setEditing(true)}>Muuda</button> : null}
          </div>
        </div>
      </div>
      {readOnly ? <PetCare needs={needs} words={words} wordsService={wordsService} readOnly stats={speech} topics={topics} kind={pet.kind} /> : <>
        <div className="pet-page__tabs" role="tablist" aria-label={pet.name}>
          <button type="button" role="tab" aria-selected={tab === 'games'} onClick={() => setTab('games')}>Mängud</button>
          {hasWardrobe ? <button type="button" role="tab" aria-selected={tab === 'wardrobe'} onClick={() => setTab('wardrobe')}>Riidekapp</button> : null}
        </div>
        {tab === 'games' ? <PetCare needs={needs} words={words} wordsService={wordsService} onPlayed={played} stats={speech} topics={topics} kind={pet.kind} /> : null}
        {tab === 'wardrobe' && hasWardrobe ? <PetWardrobe pet={pet} progress={progress} onChange={changeOutfit} /> : null}
      </>}
    </Card>
  );
}
