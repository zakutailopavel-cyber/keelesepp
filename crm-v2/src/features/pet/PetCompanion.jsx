import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { homeworkService, petsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { liveLessonInvitationsService } from '../../services/firebase/liveLessonInvitations.js';
import { INVITATION_STATUS, newestInvitation, normalizeInvitation } from '../live-classroom/invitationModel.js';
import { occurrencesForDates, toIsoDate } from '../calendar/calendarView.js';
import { petSvg } from './petArt.js';
import { PAGE_HINTS, TOUR_STEPS, celebrationHint, companionHint } from './companionModel.js';
import { PET_CELEBRATE_EVENT, PET_EVENT, PET_QUIET_EVENT } from './petEvents.js';
import './pet.css';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';

const SIZE = 92;
const store = {
  get: (key) => { try { return window.localStorage.getItem(key); } catch { return null; } },
  set: (key, value) => { try { window.localStorage.setItem(key, value); } catch { /* private mode */ } },
};
const reducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function PetFigure({ kind, mood, stage = 1 }) {
  return <span className="pet-figure" dangerouslySetInnerHTML={{ __html: petSvg(kind, mood, stage) }} />;
}

// First-visit tour: the pet points at the menu items one by one.
function PetTour({ pet, onDone }) {
  // targets are looked up after the page (including the pet itself) has been drawn
  const [steps, setSteps] = useState(null);
  useEffect(() => {
    const t = window.setTimeout(() => setSteps(TOUR_STEPS.filter((s) => {
      const r = document.querySelector(s.target)?.getBoundingClientRect();
      // skip targets that are not on screen (e.g. the closed mobile menu)
      return r && r.width > 0 && r.right > 0 && r.left < window.innerWidth;
    })), 0);
    return () => window.clearTimeout(t);
  }, []);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const nextRef = useRef(null);
  const step = steps?.[i];

  useEffect(() => {
    if (!step) return undefined;
    const measure = () => {
      const r = document.querySelector(step.target)?.getBoundingClientRect();
      setRect(r && r.width ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [step]);

  // keyboard users land on the tour card
  useEffect(() => { nextRef.current?.focus(); }, [i, steps]);

  useEffect(() => {
    const key = (event) => { if (event.key === 'Escape') onDone(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onDone]);

  if (!step) return null;
  const last = i === steps.length - 1;
  const cardStyle = rect
    ? (rect.left + rect.width + 360 < window.innerWidth
      ? { top: Math.max(12, rect.top - 20), left: rect.left + rect.width + 16 }
      : { top: Math.max(12, rect.top - 190), left: Math.max(12, Math.min(rect.left, window.innerWidth - 352)) })
    : { top: '30%', left: '50%', transform: 'translateX(-50%)' };
  return (
    <div className="pet-tour" role="dialog" aria-modal="true" aria-label="Tutvustus">
      {rect ? <div className="pet-tour__ring" style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} /> : <div className="pet-tour__dim" />}
      <div className="pet-tour__card" style={cardStyle}>
        <PetFigure kind={pet.kind} mood="happy" />
        <div>
          <p>{step.text}</p>
          <small lang="ru">{step.hint}</small>
          <div className="pet-tour__actions">
            <button type="button" className="pet-link" onClick={onDone}>Jäta vahele</button>
            <button type="button" ref={nextRef} className="pet-btn" onClick={() => (last ? onDone() : setI(i + 1))}>{last ? 'Selge!' : `Edasi (${i + 1}/${steps.length})`}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// The student's pet walks along the bottom of every page, reacts to lesson invitations, reminds about lessons
// and homework, and gives a short tour on the first visit. Students only; never in staff preview.
export default function PetCompanion({
  pets = petsService, invitationsService = liveLessonInvitationsService, students = studentsService,
  schedule = scheduleService, homework = homeworkService, now: nowProp,
}) {
  const { user, preview } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isStudent = Boolean(user?.roles?.includes('student')) && !preview;
  const uid = user?.uid;
  const [pet, setPet] = useState(null);
  // hidden / tour done are kept on the account (pet.hidden, pet.tourDoneAt); the browser copy only avoids a flash
  const [localHidden, setLocalHidden] = useState(() => { const v = store.get(`ks-pet-hidden-${uid}`); return v === null ? null : v === '1'; });
  const [localTourDone, setLocalTourDone] = useState(() => store.get(`ks-pet-tour-${uid}`) === '1');
  const [quietCount, setQuietCount] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [seenPages, setSeenPages] = useState(() => new Set(Object.keys(PAGE_HINTS).filter((path) => store.get(`ks-pet-page-${uid}-${path}`) === '1')));
  const [invites, setInvites] = useState([]);
  const [info, setInfo] = useState({ lessons: [], dueToday: 0, overdue: 0, lang: 'et' });
  const [tick, setTick] = useState(() => nowProp || Date.now());
  const [tipIndex, setTipIndex] = useState(0);
  const [openHint, setOpenHint] = useState(null);
  const [closedKeys, setClosedKeys] = useState(() => new Set());
  const [x, setX] = useState(0);
  const [dir, setDir] = useState(1);
  const [walking, setWalking] = useState(false);
  const laneRef = useRef(null);
  const [laneW, setLaneW] = useState(0);

  // pet (and changes made on "Minu õpingud")
  useEffect(() => {
    if (!isStudent) return undefined;
    let alive = true;
    Promise.resolve().then(() => pets.get(uid)).then((p) => { if (alive) setPet(p || null); }).catch(() => {});
    const onChange = (event) => setPet(event.detail || null);
    window.addEventListener(PET_EVENT, onChange);
    return () => { alive = false; window.removeEventListener(PET_EVENT, onChange); };
  }, [isStudent, pets, uid]);

  // a worksheet being filled in keeps the pet silent; a submitted worksheet makes it celebrate
  useEffect(() => {
    if (!isStudent) return undefined;
    const onQuiet = (event) => setQuietCount((n) => Math.max(0, n + (event.detail ? 1 : -1)));
    const onCelebrate = (event) => setCelebration(event.detail || { xp: 15, goals: 0 });
    window.addEventListener(PET_QUIET_EVENT, onQuiet);
    window.addEventListener(PET_CELEBRATE_EVENT, onCelebrate);
    return () => { window.removeEventListener(PET_QUIET_EVENT, onQuiet); window.removeEventListener(PET_CELEBRATE_EVENT, onCelebrate); };
  }, [isStudent]);

  // lesson invitations
  useEffect(() => {
    if (!isStudent || !pet?.kind || pet?.optedOut) return undefined;
    try { return invitationsService.subscribeIncoming(uid, setInvites, () => {}); } catch { return undefined; }
  }, [invitationsService, isStudent, pet, uid]);

  // today's lessons and homework, once per visit
  useEffect(() => {
    if (!isStudent || !pet?.kind || pet?.optedOut) return undefined;
    let alive = true;
    (async () => {
      const mine = await students.listSelf(uid);
      const ids = mine.map((s) => s.id);
      const [scheduleLists, hw, sheets] = await Promise.all([
        Promise.all(ids.map((id) => schedule.listByStudent(id))),
        homework.listByStudentIds(ids),
        homework.listWorksheetAssignmentsByStudentIds ? homework.listWorksheetAssignmentsByStudentIds(ids) : [],
      ]);
      const today = toIsoDate();
      const lessons = occurrencesForDates(scheduleLists.flat(), [today]);
      const open = [
        ...hw.filter(isHomeworkOpen).map((h) => h.due),
        ...sheets.filter((w) => w.status !== 'done').map((w) => w.dueDate),
      ].filter(Boolean);
      if (alive) setInfo({ lessons, dueToday: open.filter((d) => d === today).length, overdue: open.filter((d) => d < today).length, lang: /inglise|english/i.test(mine[0]?.subject || '') ? 'en' : 'et' });
    })().catch(() => {});
    return () => { alive = false; };
  }, [homework, isStudent, pet, schedule, students, uid]);

  useEffect(() => {
    if (!isStudent || nowProp) return undefined;
    const t = window.setInterval(() => setTick(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, [isStudent, nowProp]);

  const invitation = useMemo(() => newestInvitation(invites.map((i) => normalizeInvitation(i.id, i, tick)), [INVITATION_STATUS.PENDING]), [invites, tick]);
  const hint = companionHint({ now: tick, invitation, todayLessons: info.lessons, dueToday: info.dueToday, overdue: info.overdue, petName: pet?.name || '', tipIndex, lang: info.lang });

  const laneWidth = useCallback(() => Math.max(0, (laneRef.current?.clientWidth || 0) - SIZE - 16), []);

  useEffect(() => {
    const measure = () => setLaneW(laneWidth());
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [laneWidth, pet, localHidden, quietCount]);

  // urgent news (invitation, lesson soon) opens the bubble by itself until the student closes it;
  // an invitation calls the pet next to the invitation card
  const active = Boolean(pet?.kind) && !pet?.optedOut;
  const hidden = localHidden ?? Boolean(pet?.hidden);
  const tourDone = localTourDone || Boolean(pet?.tourDoneAt);
  const quiet = quietCount > 0;
  const inRoom = location.pathname.startsWith('/live-classroom');
  const pagePath = Object.keys(PAGE_HINTS).find((path) => location.pathname.startsWith(path));
  const touring = active && !hidden && !tourDone && !inRoom;
  const cheer = celebration ? { ...celebrationHint({ ...celebration, lang: info.lang }), key: 'celebrate' } : null;
  const pageHint = pagePath && !seenPages.has(pagePath) && tourDone ? { ...PAGE_HINTS[pagePath], key: `page-${pagePath}`, page: pagePath } : null;
  // in the lesson room the pet stays put and only says the one page hint
  const urgent = !inRoom && hint.urgent && !closedKeys.has(hint.key) ? hint : null;
  const bubble = openHint || cheer || urgent || pageHint;
  const atInvitation = Boolean(invitation && bubble?.urgent);
  const shownX = atInvitation ? Math.max(0, laneW - (window.innerWidth > 640 ? 470 : 0)) : x;
  const talking = Boolean(bubble);
  const closeBubble = () => {
    if (bubble?.celebrate || bubble?.key === 'celebrate') setCelebration(null);
    if (bubble?.page) { store.set(`ks-pet-page-${uid}-${bubble.page}`, '1'); setSeenPages((p) => new Set(p).add(bubble.page)); }
    if (bubble) setClosedKeys((k) => new Set(k).add(bubble.key));
    setOpenHint(null);
  };

  // idle walk along the bottom lane
  useEffect(() => {
    if (!active || hidden || touring || inRoom || quiet || reducedMotion()) return undefined;
    const t = window.setInterval(() => {
      if (talking) return;
      const w = laneWidth();
      setX((prev) => {
        const next = Math.round(Math.random() * w);
        setDir(next >= prev ? 1 : -1);
        return next;
      });
      setWalking(true);
      window.setTimeout(() => setWalking(false), 3800);
    }, 9000);
    return () => window.clearInterval(t);
  }, [active, talking, hidden, inRoom, laneWidth, quiet, touring]);

  if (!isStudent || !active || quiet) return null;

  const remember = (flags) => Promise.resolve().then(() => pets.update({ uid, current: pet, ...flags })).then((next) => setPet(next)).catch(() => {});
  const hide = () => { store.set(`ks-pet-hidden-${uid}`, '1'); setLocalHidden(true); closeBubble(); remember({ hidden: true }); };
  const show = () => { store.set(`ks-pet-hidden-${uid}`, '0'); setLocalHidden(false); remember({ hidden: false }); };
  const finishTour = () => { store.set(`ks-pet-tour-${uid}`, '1'); setLocalTourDone(true); remember({ tourDoneAt: new Date().toISOString() }); };
  const talk = () => {
    if (bubble) { closeBubble(); return; }
    setOpenHint(hint);
    if (!hint.urgent) setTipIndex((n) => n + 1);
  };

  if (hidden) {
    return <button type="button" className="pet-dock" onClick={show} aria-label={`Kutsu ${pet.name} tagasi`}><PetFigure kind={pet.kind} mood="calm" /></button>;
  }

  const mood = bubble?.key === 'celebrate' ? 'proud' : bubble?.urgent ? 'happy' : 'calm';
  return (
    <>
      <div className={`pet-lane ${atInvitation ? 'is-above-card' : ''}`} ref={laneRef} aria-live="polite">
        <div className={`pet-walker ${walking ? 'is-walking' : ''} ${bubble?.urgent || bubble?.key === 'celebrate' ? 'is-excited' : ''}`} style={{ transform: `translateX(${shownX}px)` }}>
          {bubble ? (
            <div className={`pet-talk ${shownX > laneW / 2 ? 'is-left' : ''}`} role="status">
              <p>{bubble.text}</p>
              <small lang="ru">{bubble.hint}</small>
              <div className="pet-talk__actions">
                {bubble.action ? <button type="button" className="pet-btn" onClick={() => { closeBubble(); navigate(bubble.action.to); }}>{bubble.action.label}</button> : null}
                <button type="button" className="pet-link" onClick={closeBubble}>Selge</button>
                <button type="button" className="pet-link" onClick={hide}>Peida mind</button>
              </div>
            </div>
          ) : null}
          <button type="button" className="pet-body" data-tour="pet" onClick={talk} aria-label={`${pet.name}: vajuta, et saada abi`} style={{ transform: `scaleX(${dir})` }}>
            <PetFigure kind={pet.kind} mood={mood} />
          </button>
        </div>
      </div>
      {touring ? <PetTour pet={pet} onDone={finishTour} /> : null}
    </>
  );
}
