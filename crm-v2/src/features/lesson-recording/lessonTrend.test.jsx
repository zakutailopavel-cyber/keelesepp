import { render, screen } from '@testing-library/react';
import { lessonTrend, topErrorKinds } from './lessonTrend.js';
import LessonTrendCard from './LessonTrendCard.jsx';

const line = (speaker, startMs, endMs, text, lang = 'et') => ({ speaker, startMs, endMs, text, lang });
const lessons = [
  // newest first, as the list comes from Firestore
  {
    id: 'b', status: 'done', startedAt: '2026-10-20T10:00:00Z', language: 'et',
    transcript: [line('teacher', 0, 4000, 'Mida sa tegid?'), line('student', 4000, 10000, 'Ma käisin poes ja ostsin leiba.'), line('student', 11000, 14000, 'Как сказать?', 'ru')],
    analysis: { version: 7, errors: [{ said: 'a b', corrected: 'a c', kind: 'vorm' }], speech: { words: 8, langWords: 6 }, dismissedErrors: [{ said: 'x y' }] },
  },
  {
    id: 'a', status: 'done', startedAt: '2026-10-13T10:00:00Z', language: 'et',
    transcript: [line('teacher', 0, 6000, 'Tere! Kuidas läheb?'), line('student', 6000, 8000, 'Hästi. Ma käisin poes.')],
    analysis: { version: 7, errors: [{ said: 'a', corrected: 'b', kind: 'sõnajärg, vorm' }, { said: 'c', corrected: 'd', kind: 'vorm' }], speech: { words: 4, langWords: 4 } },
  },
  { id: 'c', status: 'transcribing', startedAt: '2026-10-27T10:00:00Z', transcript: [] },
  { id: 'd', status: 'done', startedAt: '2026-10-27T11:00:00Z', language: 'et', transcript: [line('student', 0, 1000, 'Jah, aitäh.')], analysis: { version: 7, error: 'Ollama 500' } },
];

describe('lessonTrend', () => {
  it('one row per lesson with text, oldest first, with the learner numbers', () => {
    const rows = lessonTrend(lessons);
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'd']);
    expect(rows[0]).toMatchObject({ share: 25, words: 4, utterance: 4, errors: 2, per100: 50, newWords: null, distinct: 4 });
    expect(rows[0].kinds).toEqual([{ kind: 'vorm', count: 2 }, { kind: 'sõnajärg', count: 1 }]);
    // b: 6 Estonian + 2 Russian words in 2 lines; one error in 6 Estonian words; new: ja, ostsin, leiba
    expect(rows[1]).toMatchObject({ words: 8, utterance: 4, errors: 1, per100: 16.7, newWords: 3, dismissed: 1 });
    expect(rows[1].share).toBe(Math.round((9000 / 13000) * 100));
    // an analysis that failed is not counted as „no errors”
    expect(rows[2]).toMatchObject({ errors: null, per100: null, kinds: [] });
  });

  it('error kinds, most frequent first', () => {
    expect(topErrorKinds([{ kind: 'vorm' }, { kind: 'vorm, sõnavara' }, {}], 2)).toEqual([{ kind: 'vorm', count: 2 }, { kind: 'sõnavara', count: 1 }]);
  });

  it('the card shows the numbers and nothing without analysed lessons', () => {
    render(<LessonTrendCard lessons={lessons} />);
    expect(screen.getByRole('heading', { name: /Areng tundide kaupa/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Õpilase osa kõnest tundide kaupa' })).toBeInTheDocument();
    expect(screen.getByText('16,7 (1)')).toBeInTheDocument();
    expect(screen.getByText('vorm 2, sõnajärg 1')).toBeInTheDocument();
    expect(screen.getByText(/„Pole viga” märgitud vead \(1\)/)).toBeInTheDocument();
    const { container } = render(<LessonTrendCard lessons={[lessons[2]]} />);
    expect(container.innerHTML).toBe('');
  });
});
