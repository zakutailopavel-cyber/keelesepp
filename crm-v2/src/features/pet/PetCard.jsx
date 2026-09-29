import { useEffect, useState } from 'react';
import { Button, Card, Input } from '../../components/ui/index.js';
import { petsService } from '../../services/firebase/index.js';
import { MOODS, SPECIES, STAGES, petSvg } from './petArt.js';
import { PET_KINDS, petGreeting, petProgress, validPetName } from './petModel.js';
import { announcePet } from './petEvents.js';
import './pet.css';

// Estonian: singular after 1, partitive otherwise (1 tund, 3 tundi)
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Our own generated SVG (constants only), safe to inject.
function PetArt({ kind, mood, stage, className = '' }) {
  return <div className={`pet-art ${className}`} dangerouslySetInnerHTML={{ __html: petSvg(kind, mood, stage) }} />;
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
export default function PetCard({ user, readOnly = false, lessons = [], submissions = [], pendingHomework = 0, lessonToday = '', subject = '', repository = petsService }) {
  const [pet, setPet] = useState(undefined);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const progress = petProgress({ lessons, submissions });
  const say = petGreeting({ petName: pet.name, progress, pendingHomework, lessonToday, subject });
  const pct = progress.stageSize ? Math.round((progress.stageXp / progress.stageSize) * 100) : 100;
  return (
    <Card className="pet-card">
      <div className="pet-home">
        <PetArt kind={pet.kind} mood={progress.mood} stage={progress.stage} className="pet-home__art" />
        <div className="pet-home__body">
          <div className="pet-bubble" lang={say.lang}><p>{say.text}</p><small lang="ru">{say.hint}</small></div>
          <div className="pet-home__meta">
            <strong>{pet.name}</strong>
            <span>{STAGES[progress.stage]} · {MOODS[progress.mood].label}</span>
            {!readOnly ? <button type="button" className="pet-home__edit" onClick={() => setEditing(true)}>Muuda</button> : null}
          </div>
          <div className="pet-xp" aria-label={`Kasv ${pct}%`}>
            <div className="pet-xp__bar"><i style={{ width: `${pct}%` }} /></div>
            <div className="pet-xp__row"><span>{progress.nextItem ? `Järgmine: ${progress.nextItem}` : 'Täiskasvanud sõber'}</span><span>{count(progress.lessons, 'tund', 'tundi')} · {count(progress.submissions, 'töö', 'tööd')} · {count(progress.goals, 'eesmärk', 'eesmärki')}</span></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
