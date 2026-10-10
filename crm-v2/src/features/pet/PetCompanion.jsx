import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { homeworkService, petsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { liveLessonInvitationsService } from '../../services/firebase/liveLessonInvitations.js';
import { INVITATION_STATUS, newestInvitation, normalizeInvitation } from '../live-classroom/invitationModel.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { petSvg } from './petArt.js';
import { PAGE_HINTS, TOUR_STEPS, celebrationHint, companionHint } from './companionModel.js';
import { REACTIONS, dayPart, lifeLines, nextLesson, season, seasonalWear } from './petLife.js';
import { PET_CELEBRATE_EVENT, PET_EVENT, PET_QUIET_EVENT } from './petEvents.js';
import './pet.css';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';

const SIZE = 92;
const store = {
  get: (key) => { try { return window.localStorage.getItem(key); } catch { return null; } },
  set: (key, value) => { try { window.localStorage.setItem(key, value); } catch { /* private mode */ } },
};
const reducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function PetFigure({ kind, mood, stage = 1, wearing = {}, figureRef = null }) {
  return <span className="pet-figure" ref={figureRef} dangerouslySetInnerHTML={{ __html: petSvg(kind, mood, stage, wearing) }} />;
}
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
const IDLE_MS = { night: 40 * 1000, day: 150 * 1000 };

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
  schedule = scheduleService, homework = homeworkService, wordsService = studentWordsService, now: nowProp,
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
  const [laneLeft, setLaneLeft] = useState(0);
  // alive: dragged with the mouse, falls down when let go, sleeps when nobody moves, follows the cursor with its eyes
  const [y, setY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [falling, setFalling] = useState(false);
  const [landed, setLanded] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [waking, setWaking] = useState(false);
  const [petted, setPetted] = useState(false);
  const [chatter, setChatter] = useState(null);
  const drag = useRef(null);
  const justDragged = useRef(false);
  const asleepRef = useRef(false);
  const dirRef = useRef(1);
  const figureRef = useRef(null);
  const pettingTimer = useRef(0);
  const [lastSeenAt] = useState(() => Number(store.get(`ks-pet-seen-${uid}`)) || 0);

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
      const upcoming = occurrencesForDates(scheduleLists.flat(), Array.from({ length: 14 }, (_, i) => shiftDate(today, i)));
      const lessons = upcoming.filter((l) => l.occurrenceDate === today);
      const [words, speech] = await Promise.all([
        ids[0] && wordsService?.listForStudent ? wordsService.listForStudent(ids[0]).catch(() => []) : [],
        pets.lessonStats ? Promise.resolve().then(() => pets.lessonStats(uid)).catch(() => []) : [],
      ]);
      const open = [
        ...hw.filter(isHomeworkOpen).map((h) => h.due),
        ...sheets.filter((w) => w.status !== 'done').map((w) => w.dueDate),
      ].filter(Boolean);
      if (alive) setInfo({ loaded: true, upcoming, words, speech, lessons, dueToday: open.filter((d) => d === today).length, overdue: open.filter((d) => d < today).length, lang: /inglise|english/i.test(mine[0]?.subject || '') ? 'en' : 'et' });
    })().catch(() => {});
    return () => { alive = false; };
  }, [homework, isStudent, pet, pets, schedule, students, uid, wordsService]);

  // the last visit, for „I missed you”
  useEffect(() => { if (isStudent) store.set(`ks-pet-seen-${uid}`, String(Date.now())); }, [isStudent, uid]);

  useEffect(() => {
    if (!isStudent || nowProp) return undefined;
    const t = window.setInterval(() => setTick(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, [isStudent, nowProp]);

  const invitation = useMemo(() => newestInvitation(invites.map((i) => normalizeInvitation(i.id, i, tick)), [INVITATION_STATUS.PENDING]), [invites, tick]);
  const personal = useMemo(() => (info.loaded ? lifeLines({ now: tick, lastSeenAt, lesson: nextLesson(info.upcoming, tick), speech: info.speech, words: info.words, lang: info.lang }) : []), [info, lastSeenAt, tick]);
  const hint = companionHint({ now: tick, invitation, todayLessons: info.lessons, dueToday: info.dueToday, overdue: info.overdue, petName: pet?.name || '', tipIndex, lang: info.lang, personal });

  const laneWidth = useCallback(() => Math.max(0, (laneRef.current?.clientWidth || 0) - SIZE - 16), []);

  useEffect(() => {
    const measure = () => { setLaneW(laneWidth()); setLaneLeft(laneRef.current?.getBoundingClientRect().left || 0); };
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
  const bubble = dragging ? null : openHint || cheer || urgent || pageHint || chatter;
  const atInvitation = Boolean(invitation && bubble?.urgent) && !dragging && !y;
  const shownX = atInvitation ? Math.max(0, laneW - (window.innerWidth > 640 ? 470 : 0)) : x;
  const talking = Boolean(bubble);
  const closeBubble = () => {
    if (bubble?.celebrate || bubble?.key === 'celebrate') setCelebration(null);
    if (bubble?.page) { store.set(`ks-pet-page-${uid}-${bubble.page}`, '1'); setSeenPages((p) => new Set(p).add(bubble.page)); }
    if (bubble) setClosedKeys((k) => new Set(k).add(bubble.key));
    setOpenHint(null);
    setChatter(null);
  };

  // a short line that closes by itself (reactions, the daily personal greeting)
  useEffect(() => {
    if (!chatter) return undefined;
    const t = window.setTimeout(() => setChatter(null), chatter.ttl || 4000);
    return () => window.clearTimeout(t);
  }, [chatter]);

  // once a day the pet says something personal by itself (missed you, good morning, the next lesson …)
  const ready = active && !hidden && !touring && !inRoom && personal.length > 0;
  useEffect(() => {
    if (!ready) return undefined;
    const key = `ks-pet-said-${uid}`;
    const today = toIsoDate();
    if (store.get(key) === today) return undefined;
    const t = window.setTimeout(() => { store.set(key, today); setChatter({ ...personal[0], key: `life-${personal[0].key}`, ttl: 9000 }); }, 3000);
    return () => window.clearTimeout(t);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // falls asleep when nobody moves (sooner at night); any movement wakes it with a stretch
  useEffect(() => { asleepRef.current = asleep; }, [asleep]);
  useEffect(() => {
    if (!active || hidden || inRoom) return undefined;
    let timer = 0;
    let last = 0;
    const later = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setAsleep(true), dayPart(Date.now()) === 'night' ? IDLE_MS.night : IDLE_MS.day);
    };
    const onActivity = () => {
      const t = Date.now();
      if (t - last < 800) return;
      last = t;
      if (asleepRef.current) { setAsleep(false); setWaking(true); window.setTimeout(() => setWaking(false), 1300); }
      later();
    };
    later();
    const events = ['pointermove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((name) => window.addEventListener(name, onActivity, { passive: true, capture: true }));
    return () => { window.clearTimeout(timer); events.forEach((name) => window.removeEventListener(name, onActivity, { capture: true })); };
  }, [active, hidden, inRoom]);

  // the eyes follow the cursor (a few SVG units, no re-render)
  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => {
    if (!active || hidden || reducedMotion()) return undefined;
    let frame = 0;
    const onMove = (event) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const el = figureRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = event.clientX - (r.left + r.width / 2);
        const dy = event.clientY - (r.top + r.height * 0.4);
        const len = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, len / 240) * 3.5;
        el.style.setProperty('--lx', `${((dx / len) * k * dirRef.current).toFixed(2)}px`);
        el.style.setProperty('--ly', `${((dy / len) * k).toFixed(2)}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); if (frame) window.cancelAnimationFrame(frame); };
  }, [active, hidden]);

  // idle walk along the bottom lane
  useEffect(() => {
    if (!active || hidden || touring || inRoom || quiet || reducedMotion()) return undefined;
    const t = window.setInterval(() => {
      if (talking || asleepRef.current || drag.current) return;
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
    if (justDragged.current) { justDragged.current = false; return; }
    if (asleep) { setAsleep(false); setWaking(true); window.setTimeout(() => setWaking(false), 1300); }
    if (bubble) { closeBubble(); return; }
    setOpenHint(hint);
    if (!hint.urgent) setTipIndex((n) => n + 1);
  };

  if (hidden) {
    return <button type="button" className="pet-dock" onClick={show} aria-label={`Kutsu ${pet.name} tagasi`}><PetFigure kind={pet.kind} mood="calm" /></button>;
  }

  // drag: press and move to pick the pet up; let go and it falls back down onto the bottom lane
  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    // no text selection or native image drag while the pet is held
    if (event.pointerType === 'mouse') event.preventDefault();
    drag.current = { sx: event.clientX, sy: event.clientY, x0: shownX, y0: y, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.sx;
    const dy = event.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    if (!d.moved) { d.moved = true; setDragging(true); setFalling(false); setAsleep(false); setPetted(false); setOpenHint(null); setChatter(null); }
    const rect = laneRef.current?.getBoundingClientRect();
    const lane = { left: rect?.left || 0, bottom: rect?.bottom || window.innerHeight };
    const minX = 4 - (lane.left + 8);
    const maxX = window.innerWidth - lane.left - 8 - SIZE - 4;
    setX(Math.round(Math.max(minX, Math.min(maxX, d.x0 + dx))));
    setY(Math.round(Math.max(Math.min(0, SIZE + 4 - lane.bottom), Math.min(0, d.y0 + dy))));
    if (Math.abs(event.movementX || 0) > 1) setDir(event.movementX > 0 ? 1 : -1);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    justDragged.current = true;
    // the click that ends a drag must not press whatever is under the pet
    const swallow = (event) => { event.stopPropagation(); event.preventDefault(); };
    window.addEventListener('click', swallow, { capture: true, once: true });
    window.setTimeout(() => { justDragged.current = false; window.removeEventListener('click', swallow, { capture: true }); }, 0);
    setDragging(false);
    setFalling(true);
    setX((prev) => Math.max(0, Math.min(laneWidth(), prev)));
    setY(0);
    window.setTimeout(() => { setFalling(false); setLanded(true); }, 560);
    window.setTimeout(() => setLanded(false), 1000);
    const [text, ru] = pickOne(REACTIONS.drop);
    setChatter({ key: `drop-${Date.now()}`, text, hint: ru, ttl: 2500, quick: true });
  };
  const startPetting = () => { window.clearTimeout(pettingTimer.current); pettingTimer.current = window.setTimeout(() => {
    setPetted(true);
    const [text, ru] = pickOne(REACTIONS.tickle);
    setChatter((c) => c || { key: `tickle-${Date.now()}`, text, hint: ru, ttl: 2000, quick: true });
  }, 900); };
  const stopPetting = () => { window.clearTimeout(pettingTimer.current); setPetted(false); };

  const mood = dragging ? 'happy' : bubble?.key === 'celebrate' ? 'proud' : bubble?.urgent ? 'happy' : asleep ? 'sleep' : petted ? 'happy' : 'calm';
  const { bg: _bg, ...worn } = pet.wearing || {};
  const wearing = seasonalWear(worn, { now: tick, asleep });
  const weather = { christmas: 'snow', winter: 'snow', autumn: 'leaves' }[season(tick)] || '';
  // the bubble opens towards the middle and always stays inside the window
  const talkW = Math.min(300, window.innerWidth - 32);
  const walkerAt = laneLeft + 8 + shownX;
  const talkLeft = Math.round(Math.max(8 - walkerAt, Math.min(window.innerWidth - 8 - talkW - walkerAt, shownX > laneW / 2 ? SIZE - talkW : 0)));
  const walkerClass = ['pet-walker', walking && !dragging && !asleep ? 'is-walking' : '', bubble?.urgent || bubble?.key === 'celebrate' ? 'is-excited' : '',
    dragging ? 'is-dragging' : '', falling ? 'is-falling' : '', landed ? 'is-landed' : '', waking ? 'is-waking' : ''].filter(Boolean).join(' ');
  return (
    <>
      <div className={`pet-lane ${atInvitation ? 'is-above-card' : ''}`} ref={laneRef} aria-live="polite">
        <div className={walkerClass} style={{ transform: `translate(${shownX}px, ${y}px)` }}>
          {weather && !dragging ? <span className={`pet-weather is-${weather}`} aria-hidden="true"><i /><i /><i /></span> : null}
          {petted && !dragging ? <span className="pet-hearts" aria-hidden="true"><i>♥</i><i>♥</i></span> : null}
          {bubble ? (
            <div className="pet-talk" role="status" style={{ left: talkLeft }}>
              <p>{bubble.text}</p>
              <small lang="ru">{bubble.hint}</small>
              {bubble.quick ? null : <div className="pet-talk__actions">
                {bubble.action ? <button type="button" className="pet-btn" onClick={() => { closeBubble(); navigate(bubble.action.to); }}>{bubble.action.label}</button> : null}
                <button type="button" className="pet-link" onClick={closeBubble}>Selge</button>
                <button type="button" className="pet-link" onClick={hide}>Peida mind</button>
              </div>}
            </div>
          ) : null}
          <button type="button" className="pet-body" data-tour="pet" onClick={talk} aria-label={`${pet.name}: vajuta, et saada abi`} style={{ transform: `scaleX(${dir})` }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
            onPointerEnter={startPetting} onPointerLeave={stopPetting}>
            <PetFigure kind={pet.kind} mood={mood} wearing={wearing} figureRef={figureRef} />
          </button>
        </div>
      </div>
      {touring ? <PetTour pet={pet} onDone={finishTour} /> : null}
    </>
  );
}
