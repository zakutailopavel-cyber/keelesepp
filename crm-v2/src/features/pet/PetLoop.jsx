import { Flame, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeworkService } from '../../services/firebase/homework.js';
import { lessonWorksheetsService } from '../../services/firebase/lessonWorksheets.js';
import { petsService } from '../../services/firebase/pets.js';
import { localDate } from '../../utils/localDate.js';
import { petSvg } from './petArt.js';
import { announcePet } from './petEvents.js';
import { seasonalWear } from './petLife.js';
import { buyItem } from './petItems.js';
import {
  dailySurprise, growthNews, isBackAfterAbsence, langOf, moodLabel, nextReward, petLevel, playedToday, readLoopSeen, readSeenGrowth,
  thanksLine, welcomeLine, writeLoopSeen, writeSeenGrowth,
} from './petLoop.js';
import { petGreeting, petProgress } from './petModel.js';
import { usePetMaterial } from './usePetMaterial.js';
import './pet.css';

// Art only in `home`; on the pet's own page PetCard draws the room around it and takes the mood through `onMood`.
function Figure({ pet, mood, stage, jump }) {
  const { bg: _bg, ...worn } = pet.wearing || {};
  return <div className={`pl__art ${jump ? 'is-glad' : ''}`} dangerouslySetInnerHTML={{ __html: petSvg(pet.kind, mood, stage, seasonalWear(worn)) }} />;
}

/**
 * The pet on „Täna” and in „Lemmik” (owner 2026-11-09): it asks for nothing — „Täna” (students/nextStep.js) says what to
 * do — and only rewards. `reaction`: the key of the step just finished, or 'finished' at the end of the day; `ready`:
 * there is something to start today. One short bubble, the level (one progress meter: XP from real learning and the
 * capped practice XP), the streak of learning days, the reward in sight and a small surprise after the day is done.
 * The parent page stays complete when this renders nothing (`pet.optedOut`).
 */
export default function PetLoop({
  user, studentId = '', pet: initialPet, variant = 'home', readOnly = false, lessons = [], submissions = [], homework = [], assignments, words = [], subject = '', pendingHomework = 0, lessonToday = '', material,
  practiceXp = 0, streak = 0, reaction = '', ready = false,
  repository = petsService, assignmentsService = homeworkService, courseSheets = lessonWorksheetsService,
  onPetChange, onMood, now: nowProp,
}) {
  const [pet, setLocalPet] = useState(initialPet);
  useEffect(() => { setLocalPet(initialPet); }, [initialPet]);
  const setPet = (next) => { setLocalPet(next); onPetChange?.(next); announcePet(next); };
  const uid = user?.uid;
  const now = nowProp || Date.now();
  const today = localDate(new Date(now));
  const lang = langOf(subject);

  const own = usePetMaterial({ uid, studentId, readOnly, lessons, assignments, wantTopics: false, off: Boolean(material), repository, assignmentsService, courseSheets });
  const { speech } = material || own;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // the last time this pet was seen here, read once: „glad you're back” lasts for the visit
  const [lastSeenAt] = useState(() => readLoopSeen(uid));
  useEffect(() => { if (!readOnly && uid) writeLoopSeen(uid); }, [readOnly, uid]);

  const progress = petProgress({ lessons, submissions, homework, words, speech, practiceXp, now });
  const back = isBackAfterAbsence({ lastSeenAt, lastActivity: progress.lastActivity, now });
  const finished = reaction === 'finished';
  const done = finished || playedToday({ pet, today });
  const reward = nextReward({ progress, pet });

  // one-time news: remembered at once, shown for this visit
  const newsRef = useRef(undefined);
  if (newsRef.current === undefined && uid && !readOnly && pet?.kind) {
    const { news, seen } = growthNews({ progress, reward, seen: readSeenGrowth(uid), name: pet.name });
    newsRef.current = news;
    writeSeenGrowth(uid, seen);
  }
  const news = newsRef.current || null;

  const surprise = useMemo(() => (finished ? dailySurprise({ today, words, stats: speech, progress, lang, now }) : null), [finished, today, words, speech, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const glad = Boolean(reaction) || done || back || news;
  const mood = glad ? (progress.mood === 'proud' ? 'proud' : 'happy') : progress.mood === 'proud' ? 'proud' : 'calm';
  useEffect(() => { onMood?.(mood); }, [mood, onMood]);

  const buy = async () => {
    setBusy(true); setError('');
    try { setPet(await repository.updateOutfit({ uid, current: pet, ...buyItem(reward.item.id, progress, pet) })); }
    catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); }
    finally { setBusy(false); }
  };

  // the public copy (teacher, parents) follows the student's own pet; written only by the student
  const publishKey = pet?.kind && !pet.optedOut ? JSON.stringify([pet.kind, pet.name, pet.wearing || {}]) : '';
  useEffect(() => {
    if (readOnly || !publishKey || !studentId || !repository.publish) return;
    Promise.resolve().then(() => repository.publish({ uid, studentId, pet })).catch(() => {});
  }, [publishKey, readOnly, studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pet?.kind || pet.optedOut) return null;

  let line;
  if (reaction) line = thanksLine(reaction, lang);
  else if (back) line = welcomeLine(lang);
  else if (ready && variant === 'home') line = thanksLine('ready', lang);
  else line = petGreeting({ petName: pet.name, progress: { ...progress, mood: 'calm' }, pendingHomework, lessonToday, subject, lastSpeech: speech[0] || null, now });
  const feeling = moodLabel({ mood, done: Boolean(reaction) || done });

  return (
    <section className={`pl pl--${variant}`} aria-label={pet.name} data-tour="pet">
      {variant === 'home' ? <Figure pet={pet} mood={mood} stage={progress.stage} jump={Boolean(reaction || news)} /> : null}
      <div className="pl__talk">
        <div className="pl__head">
          <strong>{pet.name}</strong><span>{petLevel(progress.xp)}. tase</span>
          {streak ? <span className="pl__streak" title="Õppimise päevi järjest"><Flame size={14} aria-hidden="true" /> {streak} {streak === 1 ? 'päev' : 'päeva'}</span> : null}
          {variant === 'home' ? <span className={`pl__mood is-${feeling.key}`}>Tuju: {feeling.et} <small lang="ru">· {feeling.ru}</small></span> : null}
          {variant === 'home' ? <Link to="/student/lemmik">Vaata lähemalt</Link> : null}
        </div>
        {news ? <p className="pl__news" role="status"><Sparkles size={15} aria-hidden="true" /> <span>{news.text} <small lang="ru">{news.hint}</small></span></p> : null}
        <div className="pet-bubble pl__bubble" lang={line.lang} role={reaction ? 'status' : undefined}><p>{line.text}</p><small lang="ru">{line.hint}</small></div>
      </div>
      {finished && surprise ? <p className="pl__surprise" lang={surprise.lang}><Sparkles size={15} aria-hidden="true" /> <span>{surprise.text} <small lang="ru">{surprise.hint}</small></span></p> : null}
      {reward ? <div className={`pl__reward ${reward.ready ? 'is-ready' : ''}`}>
        <div className="pl__reward-text"><span>{reward.text}</span>{reward.ready && !readOnly ? <button type="button" className="link-button" disabled={busy} onClick={buy}>Pane selga</button> : null}</div>
        {reward.ready ? null : <div className="pet-xp__bar" role="meter" aria-label="Järgmise auhinnani" aria-valuemin={0} aria-valuemax={100} aria-valuenow={reward.pct}><i style={{ width: `${reward.pct}%` }} /></div>}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div> : null}
    </section>
  );
}
