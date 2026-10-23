import { BookOpen, ChevronRight, GraduationCap, Play, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { lessonsService, lessonWorksheetsService, libraryService, studentsService } from '../../services/firebase/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { deckFromSheets, deckFromWords, lessonDecks } from './deckModel.js';
import SentenceAnalyzer from './SentenceBreakdown.jsx';
import StudySession from './StudySession.jsx';
import TopicsSection from './TopicsSection.jsx';
import { loadWordsForLessons } from './lessonWords.js';
import { isDue, sameWord } from './wordsModel.js';
import { useStudentWords } from './useStudentWords.js';
import { dailyPlan } from './dailyReview.js';
import DailyReminder from './DailyReminder.jsx';
import './vocabulary.css';

/**
 * Student „Sõnavara” (owner, 2026-10-10): learn words like in Quizlet. Decks: the student's own words (from lessons)
 * and the words of every course lesson (vocabulary lists and matching tasks of the published sheets); the lessons
 * the student has had come first, any lesson of a level can be opened.
 */
export default function VocabularyPage({
  studentRepository = studentsService,
  lessonRepository = lessonsService,
  catalogRepository = libraryService,
  worksheetRepository = lessonWorksheetsService,
  wordsService = studentWordsService,
  loadWords = loadWordsForLessons,
}) {
  const { user, preview } = useAuth();
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const [lessonLists, curriculumLessons] = await Promise.all([
      Promise.all(students.map((student) => lessonRepository.listByStudent(student.id).catch(() => []))),
      catalogRepository.listCurriculum(),
    ]);
    return { students, lessons: lessonLists.flat(), catalog: buildTopicCatalog(curriculumLessons) };
  }, [preview?.studentId, user.uid]);
  const students = useMemo(() => state.data?.students || [], [state.data]);
  const words = useStudentWords(students.map((student) => student.id), wordsService);
  const [open, setOpen] = useState(null);
  const [level, setLevel] = useState('');
  const [notice, setNotice] = useState('');
  const reviewed = useRef(new Set());

  const catalog = state.data?.catalog;
  // lessons the student has had (newest first), as course decks
  const myLessons = useMemo(() => {
    if (!catalog) return [];
    const seen = new Set();
    return (state.data?.lessons || []).map((lesson) => lesson.topicLessonId).filter((id) => id && catalog.byId.has(id) && !seen.has(id) && seen.add(id))
      .map((id) => catalog.byId.get(id)).slice(0, 12);
  }, [catalog, state.data]);
  const studentLevel = students[0]?.level || '';
  const levels = catalog?.levels || [];
  const shownLevel = level || levels.find((entry) => entry.key === studentLevel || entry.label === studentLevel)?.key || myLessons[0]?.level || levels[0]?.key || '';
  const modules = levels.find((entry) => entry.key === shownLevel)?.modules || [];
  const myDeck = useMemo(() => deckFromWords(words), [words]);
  const byLesson = useMemo(() => lessonDecks(words), [words]);
  const dueDeck = useMemo(() => deckFromWords(words.filter((word) => isDue(word))), [words]);
  // „Päeva 5 minutit”: one button, about ten cards (dailyReview.js); `?paev=1` (from the home page) starts it at once
  const daily = useMemo(() => dailyPlan(words), [words]);
  const openDaily = () => setOpen({ key: 'daily', title: 'Päeva 5 minutit', lessonId: '', deck: daily.deck, mode: daily.deck.length >= 4 ? 'learn' : 'cards' });
  const [params, setParams] = useSearchParams();
  const startedDaily = useRef(false);
  useEffect(() => {
    if (params.get('paev') !== '1' || startedDaily.current || daily.deck.length < 2) return;
    startedDaily.current = true;
    openDaily();
    setParams((current) => { const next = new globalThis.URLSearchParams(current); next.delete('paev'); return next; }, { replace: true });
  }, [params, daily.deck.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const openLesson = async (lesson) => {
    setNotice('');
    setOpen({ title: `${lesson.number ? `${lesson.number}. ` : ''}${lesson.title}`, lessonId: lesson.id, loading: true, deck: [] });
    try {
      const records = await worksheetRepository.list(lesson.id);
      setOpen((current) => (current?.lessonId === lesson.id ? { ...current, loading: false, deck: deckFromSheets(records, lesson.id) } : current));
    } catch (error) {
      setOpen((current) => (current?.lessonId === lesson.id ? { ...current, loading: false, error: error?.message || 'Sõnu ei saanud laadida.' } : current));
    }
  };

  // own words move in their Leitner boxes once per session; course cards are practice only
  const onResult = async (card, knew) => {
    if (!card.word || preview || reviewed.current.has(card.id)) return;
    reviewed.current.add(card.id);
    try { await wordsService.review(card.word, knew); } catch { /* the practice goes on */ }
  };
  const addMissed = async (cards) => {
    const studentId = students[0]?.id;
    if (!studentId || preview) return;
    const fresh = cards.filter((card) => !card.word && !sameWord(words, card.front));
    try {
      await Promise.all(fresh.map((card) => wordsService.addOwn({ studentId, word: card.front, translation: card.back, user })));
      setNotice(fresh.length ? `${fresh.length} sõna lisati sinu sõnade hulka.` : 'Need sõnad on sinu sõnade hulgas juba olemas.');
    } catch (error) {
      setNotice(error?.message || 'Sõnu ei saanud lisada.');
    }
  };

  if (state.loading) return <div className="page-content"><LoadingState label="Laen sõnavara…" /></div>;
  if (state.error) return <div className="page-content"><ErrorState message={state.error?.message || String(state.error)} onRetry={state.reload} /></div>;

  return (
    <div className="page-content vocabulary-page">
      <PageHeader eyebrow="Minu õpingud" title="Sõnavara" description="Iga päev natuke: korda oma sõnu, siis tundide sõnu." />
      {notice ? <p className="vw-notice" role="status">{notice}</p> : null}
      {open ? (
        <Card>
          {open.loading ? <LoadingState label="Laen tunni sõnu…" />
            : open.error ? <ErrorState message={open.error} onRetry={() => openLesson(catalog.byId.get(open.lessonId))} />
              : open.deck.length < 2 ? <EmptyState title="Selles tunnis sõnu veel ei ole" description="Vali mõni teine tund." action={<button type="button" className="vw-btn" onClick={() => setOpen(null)}>Tagasi</button>} />
                : <StudySession key={open.key || open.lessonId || 'mine'} initialMode={open.mode || ''} deck={open.deck} title={open.title} onResult={onResult} onAddMissed={preview ? undefined : addMissed} onBack={() => setOpen(null)} />}
        </Card>
      ) : (
        <div className="vocabulary-decks">
          <section className="vd-hero" aria-label="Täna">
            <div>
              <span className="eyebrow">Täna</span>
              <h2>{daily.done ? 'Tänased 5 minutit on tehtud!' : daily.count >= 2 ? `Päeva 5 minutit: ${daily.count} kaarti` : myDeck.length ? 'Kõik sõnad on korratud' : 'Alusta tundide sõnadest'}</h2>
              <p>{daily.count >= 2 && !daily.done ? [daily.forgotten ? `${daily.forgotten} ununeb` : '', daily.fresh ? `${daily.fresh} uut` : '', 'ülejäänud on kordamise aeg'].filter(Boolean).join(' · ') : daily.done ? 'Tubli! Homme ootavad uued kaardid.' : myDeck.length ? 'Tubli! Harjuta veel või vali tunni sõnad allpool.' : 'Vali allpool tund ja õpi selle sõnu.'}</p>
            </div>
            {daily.count >= 2 && !daily.done ? <button type="button" className="vd-hero__go" onClick={openDaily}><Play size={18} /> Alusta</button>
              : dueDeck.length >= 2 ? <button type="button" className="vd-hero__go" onClick={() => setOpen({ key: 'due', title: 'Tänased sõnad', lessonId: '', deck: dueDeck, mode: dueDeck.length >= 4 ? 'learn' : 'cards' })}><Play size={18} /> Korda nüüd</button>
              : myDeck.length >= 2 ? <button type="button" className="vd-hero__go is-soft" onClick={() => setOpen({ key: 'all', title: 'Minu sõnad', lessonId: '', deck: myDeck, mode: 'match' })}><Play size={18} /> Mängi paare</button> : null}
          </section>
          {!preview && myDeck.length ? <DailyReminder /> : null}
          <Card>
            <div className="section-heading"><div><span className="eyebrow">Lause lahti</span><h2>Võta lause lahti</h2></div></div>
            <SentenceAnalyzer />
          </Card>
          <TopicsSection catalog={catalog} studentId={students[0]?.id || ''} studentLevel={studentLevel} words={words.filter((word) => word.studentId === students[0]?.id)}
            wordsService={wordsService} user={user} preview={Boolean(preview)} loadWords={loadWords} />
          <Card>
            <div className="section-heading"><div><span className="eyebrow">Minu sõnad</span><h2>Sõnad minu tundidest</h2></div></div>
            {myDeck.length >= 2 ? (
              <button type="button" className="vd-deck is-mine" onClick={() => setOpen({ title: 'Minu sõnad', lessonId: '', deck: myDeck })}>
                <Star size={18} /><span><strong>Minu sõnad</strong><small>{myDeck.length} sõna · {words.filter((word) => isDue(word)).length} kordamiseks</small></span><ChevronRight size={16} />
              </button>
            ) : <EmptyState title="Sinu sõnu veel ei ole" description="Õpetaja lisab tunnis uued sõnad. Kursuse tundide sõnu saad õppida kohe allpool." />}
            {byLesson.length ? <div className="vd-list vd-lessons">{byLesson.slice(0, 8).map((item) => {
              const label = `Tund ${new Date(`${item.day}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'short' })}`;
              return <button type="button" key={item.key} className="vd-deck" onClick={() => setOpen({ key: item.key, title: label, lessonId: '', deck: item.deck })}>
                <GraduationCap size={17} /><span><strong>{label}</strong><small>{item.deck.length} sõna tunnist</small></span><ChevronRight size={16} />
              </button>;
            })}</div> : null}
          </Card>
          {myLessons.length ? (
            <Card>
              <div className="section-heading"><div><span className="eyebrow">Minu tunnid</span><h2>Tundide sõnad</h2></div></div>
              <div className="vd-list">{myLessons.map((lesson) => (
                <button type="button" key={lesson.id} className="vd-deck" onClick={() => openLesson(lesson)}>
                  <GraduationCap size={17} /><span><strong>{lesson.number ? `${lesson.number}. ` : ''}{lesson.title}</strong><small>{lesson.level} · {lesson.moduleTitle}</small></span><ChevronRight size={16} />
                </button>
              ))}</div>
            </Card>
          ) : null}
          <Card>
            <div className="section-heading"><div><span className="eyebrow">Kursus</span><h2>Kõik tunnid</h2></div>
              {levels.length ? <select className="vd-level" aria-label="Tase" value={shownLevel} onChange={(event) => setLevel(event.target.value)}>{levels.map((entry) => <option key={entry.key} value={entry.key}>{entry.label}</option>)}</select> : null}
            </div>
            {modules.length ? modules.map((module) => (
              <details key={module.key} className="vd-module">
                <summary><BookOpen size={16} /> {module.label} <small>{module.lessons.length} tundi</small></summary>
                <div className="vd-list">{module.lessons.map((lesson) => (
                  <button type="button" key={lesson.id} className="vd-deck" onClick={() => openLesson(lesson)}>
                    <span><strong>{lesson.number ? `${lesson.number}. ` : ''}{lesson.title}</strong></span><ChevronRight size={16} />
                  </button>
                ))}</div>
              </details>
            )) : <EmptyState title="Kursuse tunde ei leitud" />}
          </Card>
        </div>
      )}
    </div>
  );
}
