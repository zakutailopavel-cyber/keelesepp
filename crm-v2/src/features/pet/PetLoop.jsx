import { Gamepad2, Sparkles, Utensils } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeworkService } from '../../services/firebase/homework.js';
import { lessonWorksheetsService } from '../../services/firebase/lessonWorksheets.js';
import { petsService } from '../../services/firebase/pets.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { localDate } from '../../utils/localDate.js';
import WordPractice from '../vocabulary/WordPractice.jsx';
import { PetFixGame, PetGame } from './PetCare.jsx';
import PetGames from './PetGames.jsx';
import { petSvg } from './petArt.js';
import { petNeeds } from './petCare.js';
import { announcePet, petQuiet } from './petEvents.js';
import { seasonalWear } from './petLife.js';
import { buyItem } from './petItems.js';
import {
  dailySurprise, growthNews, isBackAfterAbsence, langOf, moodLabel, nextReward, petLevel, petRequest, readLoopSeen, readSeenGrowth,
  requestDoneToday, requestWords, thanksLine, welcomeLine, writeLoopSeen, writeSeenGrowth,
} from './petLoop.js';
import { petGreeting, petProgress } from './petModel.js';
import { usePetMaterial } from './usePetMaterial.js';
import './pet.css';

const NEED_LABEL = { food: 'Kõht', joy: 'Rõõm', energy: 'Energia' };
const NEED_ICON = { food: Utensils, joy: Gamepad2 };

// Art only in `home`; on the pet's own page PetCard draws the room around it and takes the mood through `onMood`.
function Figure({ pet, mood, stage, jump }) {
  const { bg: _bg, ...worn } = pet.wearing || {};
  return <div className={`pl__art ${jump ? 'is-glad' : ''}`} dangerouslySetInnerHTML={{ __html: petSvg(pet.kind, mood, stage, seasonalWear(worn)) }} />;
}

/**
 * The daily loop: art, one short bubble, ONE request with one button; one tap plays it right here (word cards, the word
 * game, „Paranda” or a topic game), the pet reacts at once and is content for the day. Then the day's small surprise.
 * The reward is always in sight. The parent page stays complete when this renders nothing (`pet.optedOut`).
 */
export default function PetLoop({
  user, studentId = '', pet: initialPet, variant = 'home', readOnly = false, lessons = [], submissions = [], homework = [], assignments, words = [], subject = '', pendingHomework = 0, lessonToday = '', material,
  repository = petsService, wordsService = studentWordsService, assignmentsService = homeworkService, courseSheets = lessonWorksheetsService,
  onPetChange, onMood, now: nowProp,
}) {
  const [pet, setLocalPet] = useState(initialPet);
  useEffect(() => { setLocalPet(initialPet); }, [initialPet]);
  const setPet = (next) => { setLocalPet(next); onPetChange?.(next); announcePet(next); };
  const uid = user?.uid;
  const now = nowProp || Date.now();
  const today = localDate(new Date(now));
  const lang = langOf(subject);

  // a topic game is the last choice: its sheets load only when words and own sentences cannot be used
  const hasWords = useMemo(() => words.length > 0, [words]);
  const own = usePetMaterial({ uid, studentId, readOnly, lessons, assignments, wantTopics: !hasWords, off: Boolean(material), repository, assignmentsService, courseSheets });
  const { speech, topics } = material || own;

  const [mode, setMode] = useState('');        // '' | the kind being played
  const [justDone, setJustDone] = useState(null); // { kind, right }: the moment after playing
  const [cards, setCards] = useState([]);
  const [playLine, setPlayLine] = useState(null); // what the pet asked stays while it is being done, though the words change
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const playing = Boolean(mode);
  useEffect(() => { if (!playing) return undefined; petQuiet(true); return () => petQuiet(false); }, [playing]);

  // the last time this pet was seen here, read once: „glad you're back” lasts for the visit
  const [lastSeenAt] = useState(() => readLoopSeen(uid));
  useEffect(() => { if (!readOnly && uid) writeLoopSeen(uid); }, [readOnly, uid]);

  const progress = petProgress({ lessons, submissions, homework, words, speech, now });
  const needs = petNeeds({ words, homework, submissions, lessons, playedAt: pet?.playedAt, canFix: speech.some((s) => s.practice?.length), now });
  const back = isBackAfterAbsence({ lastSeenAt, lastActivity: progress.lastActivity, now });
  const request = petRequest({ needs, words, stats: speech, topics, lang, gentle: back, now });
  const done = requestDoneToday({ pet, words, today }) || Boolean(justDone);
  const reward = nextReward({ progress, pet });

  // one-time news: remembered at once, shown for this visit
  const newsRef = useRef(undefined);
  if (newsRef.current === undefined && uid && !readOnly && pet?.kind) {
    const { news, seen } = growthNews({ progress, reward, seen: readSeenGrowth(uid), name: pet.name });
    newsRef.current = news;
    writeSeenGrowth(uid, seen);
  }
  const news = newsRef.current || null;

  const surprise = useMemo(() => (done ? dailySurprise({ today, words, stats: speech, progress, lang, now }) : null), [done, today, words, speech, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const mood = justDone || done || back || news ? (progress.mood === 'proud' ? 'proud' : 'happy') : progress.mood === 'proud' ? 'proud' : 'calm';
  useEffect(() => { onMood?.(mood); }, [mood, onMood]);

  const finish = async (kind, right = null) => {
    setMode('');
    setJustDone({ kind, right });
    if (readOnly) return;
    const playedAt = new Date().toISOString();
    const saved = await Promise.resolve().then(() => repository.update({ uid, current: pet, playedAt })).catch(() => null);
    setPet(saved || { ...pet, playedAt });
  };
  const start = () => {
    setPlayLine(line);
    if (request.kind === 'feed') setCards(requestWords(words, now));
    setJustDone(null);
    setMode(request.kind);
  };
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
  if (justDone) line = thanksLine(justDone.kind, lang);
  else if (done) line = thanksLine('', lang);
  else if (request) line = back ? { ...request, text: `${welcomeLine(lang).text} ${request.text}`, hint: `${welcomeLine(lang).hint} ${request.hint}` } : request;
  else if (back) line = welcomeLine(lang);
  else line = petGreeting({ petName: pet.name, progress: { ...progress, mood: 'calm' }, pendingHomework, lessonToday, subject, lastSpeech: speech[0] || null, now });

  if (playing && playLine) line = playLine;
  const NeedIcon = NEED_ICON[request?.need];
  const needValue = request ? needs[request.need] : 0;
  const shownNeed = justDone?.kind === 'feed' ? 'food' : justDone ? 'joy' : request?.need;
  const canAsk = !readOnly && !done && request;
  const feeling = moodLabel({ mood, request, needs, done });

  return (
    <section className={`pl pl--${variant}`} aria-label={pet.name} data-tour="pet">
      {variant === 'home' ? <Figure pet={pet} mood={mood} stage={progress.stage} jump={Boolean(justDone || news)} /> : null}
      <div className="pl__talk">
        <div className="pl__head"><strong>{pet.name}</strong><span>{petLevel(progress.xp)}. tase</span>{variant === 'home' ? <span className={`pl__mood is-${feeling.key}`}>Tuju: {feeling.et} <small lang="ru">· {feeling.ru}</small></span> : null}{variant === 'home' ? <Link to="/student/lemmik">Vaata lähemalt</Link> : null}</div>
        {news && !playing ? <p className="pl__news" role="status"><Sparkles size={15} aria-hidden="true" /> <span>{news.text} <small lang="ru">{news.hint}</small></span></p> : null}
        <div className="pet-bubble pl__bubble" lang={line.lang}><p>{line.text}</p><small lang="ru">{line.hint}</small>
          {justDone?.right != null ? <small className="pl__score" role="status">Õigeid vastuseid: {justDone.right}</small> : null}
        </div>
        {canAsk && !playing ? (request.to
          ? <Link className="pl__do" to={request.to}>{request.button}</Link>
          : <button type="button" className="pl__do" onClick={start}>{NeedIcon ? <NeedIcon size={16} aria-hidden="true" /> : null} {request.button}</button>) : null}
        {variant === 'home' && !playing && (canAsk || justDone) && shownNeed ? <div className="pl__need"><span>{NEED_LABEL[shownNeed]}</span><div className="pet-need__bar" role="meter" aria-label={NEED_LABEL[shownNeed]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={justDone ? 100 : needValue}><i style={{ width: `${justDone ? 100 : needValue}%` }} /></div></div> : null}
      </div>
      {playing ? <div className="pl__play">
        {mode === 'feed' ? <WordPractice words={cards} service={wordsService} onFinished={() => finish('feed')} onClose={() => setMode('')} />
          : mode === 'fix' ? <PetFixGame stats={speech} onDone={(right) => finish('fix', right)} onClose={() => setMode('')} />
          : mode === 'game' ? <PetGame words={words} onDone={(right) => finish('game', right)} onClose={() => setMode('')} />
          : <PetGames quick topics={topics} kind={pet.kind} onDone={(right) => finish('topic', right)} onClose={() => setMode('')} />}
      </div> : null}
      {!playing && done && surprise ? <p className="pl__surprise" lang={surprise.lang}><Sparkles size={15} aria-hidden="true" /> <span>{surprise.text} <small lang="ru">{surprise.hint}</small></span></p> : null}
      {!playing && reward ? <div className={`pl__reward ${reward.ready ? 'is-ready' : ''}`}>
        <div className="pl__reward-text"><span>{reward.text}</span>{reward.ready && !readOnly ? <button type="button" className="link-button" disabled={busy} onClick={buy}>Pane selga</button> : null}</div>
        {reward.ready ? null : <div className="pet-xp__bar" aria-hidden="true"><i style={{ width: `${reward.pct}%` }} /></div>}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </div> : null}
    </section>
  );
}
