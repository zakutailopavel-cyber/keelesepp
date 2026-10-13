import { CheckCircle2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { libraryService } from '../../services/firebase/library.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { loadWordsForLessons } from './lessonWords.js';
import { buildTopics, levelHasWords, topicReport } from './topicModel.js';
import './vocabulary.css';

const STATE_LABEL = { passed: 'läbitud', open: 'avatud', locked: 'lukus' };
const day = (iso) => { const d = new Date(iso); return iso && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('et-EE') : ''; };

/**
 * The student's „Sõnavara → Teemad” for staff, read only (student card → „Areng”): the topics of the student's level in
 * course order with their state, the words the student has of each, passed / all and when the last topic was passed.
 * Reads the curriculum and the student's studentWords (staff may read them); writes nothing.
 */
export default function StudentTopicsCard({ student, catalogApi = libraryService, wordsApi = studentWordsService, loadWords = loadWordsForLessons }) {
  const [state, setState] = useState({ loading: true, error: '', level: null, topics: [] });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    (async () => {
      const [curriculum, own] = await Promise.all([
        Promise.resolve().then(() => catalogApi.listCurriculum()),
        Promise.resolve().then(() => wordsApi.listForStudent(student.id)),
      ]);
      const levels = buildTopicCatalog(curriculum || []).levels.filter(levelHasWords);
      // the same level the student sees first in „Teemad”: his own, else the first level with words
      const level = levels.find((entry) => entry.key === student.level || entry.label === student.level) || levels[0] || null;
      if (!level) return { level: null, topics: [] };
      const words = await loadWords(level.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
      return { level, topics: topicReport(buildTopics(level, words, student.id), own || []) };
    })()
      .then((data) => { if (alive) setState({ loading: false, error: '', ...data }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error?.message || 'Teemasid ei saanud laadida.', level: null, topics: [] }); });
    return () => { alive = false; };
  }, [catalogApi, wordsApi, loadWords, student.id, student.level, attempt]);

  const { topics } = state;
  const passed = topics.filter((topic) => topic.state === 'passed');
  const last = passed.filter((topic) => topic.passedAt).sort((a, b) => a.passedAt.localeCompare(b.passedAt)).pop() || null;

  return (
    <Card className="vt-topics" aria-label="Sõnavara teemad">
      <div className="section-heading"><div><span className="eyebrow">Sõnavara</span><h2>Teemad{state.level ? ` · ${state.level.label}` : ''}</h2></div></div>
      {state.loading ? <LoadingState label="Laen teemasid…" />
        : state.error ? <ErrorState message={state.error} onRetry={() => { setState((current) => ({ ...current, loading: true, error: '' })); setAttempt((value) => value + 1); }} />
          : !topics.length ? <EmptyState title="Teemasid ei ole" description="Selle taseme kursuse tundidel pole veel sõnu." />
            : (
              <>
                <p className="vw-muted">
                  Läbitud {passed.length}/{topics.length} teemat.
                  {last ? ` Viimati läbitud: ${last.title} (${day(last.passedAt)}).` : passed.length ? '' : ' Ühtegi teemat pole veel läbitud.'}
                  {student.level && state.level && state.level.key !== student.level && state.level.label !== student.level ? ` Õpilase tasemel (${student.level}) teemasid pole, näidatud on ${state.level.label}.` : ''}
                </p>
                <ol className="vt-list">{topics.map((topic, index) => (
                  <li key={topic.key} className={`vt-topic is-${topic.state}`}>
                    <div className="vt-topic__head">
                      {topic.state === 'passed' ? <CheckCircle2 size={18} aria-hidden="true" /> : topic.state === 'locked' ? <Lock size={18} aria-hidden="true" /> : <span className="vt-num" aria-hidden="true">{index + 1}</span>}
                      <span><strong>{topic.title}</strong><small>{STATE_LABEL[topic.state]} · {topic.known}/{topic.words.length} sõna{topic.passedAt ? ` · ${day(topic.passedAt)}` : ''}</small></span>
                    </div>
                  </li>
                ))}</ol>
              </>
            )}
    </Card>
  );
}
