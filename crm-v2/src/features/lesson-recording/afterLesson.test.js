import { describe, expect, it, vi } from 'vitest';
import { cardsFromErrors, focusTopics, homeworkFromAnalysis } from './afterLesson.js';

const analysis = {
  focus: [{ key: 'cases', topic: 'Падеж после глагола и места: kuhu? kus? kust? (lähen raamatukokku)', count: 8, teacher: 2, examples: [] }, { key: 'order', topic: 'Порядок слов: глагол на втором месте (Õhtuti teen ma…)', count: 6, teacher: 1, examples: [] }],
  errors: [
    { said: 'Ma lähen raamatukogu.', corrected: 'Ma lähen raamatukokku.', kind: 'vorm' },
    { said: 'Õhtuti ma teen süüa.', corrected: 'Õhtuti teen ma süüa.', kind: 'sõnajärg' },
    { said: 'Tõrje nii palun.', corrected: 'Tõrju nii palun.', unsure: true },
    { said: 'Ma lähen raamatukogu!', corrected: 'Ma lähen raamatukokku.' },
  ],
};

describe('after the lesson', () => {
  it('homework on the learner\'s topics with his sentences to correct', () => {
    const hw = homeworkFromAnalysis({ analysis, recording: { studentId: 's1', studentName: 'Monika', invitationId: 'inv' }, now: Date.parse('2026-10-12T10:00:00Z') });
    expect(hw.task).toBe('Korda tunni teemasid: Падеж после глагола и места; Порядок слов');
    expect(hw.note).toContain('• Ma lähen raamatukogu. → ?');
    expect(hw.note).not.toContain('Tõrje');
    expect(hw).toMatchObject({ studentId: 's1', due: '2026-10-15', invitationId: 'inv', source: 'lesson-analysis' });
    expect(focusTopics(analysis)).toHaveLength(2);
  });
  it('nothing to give without topics and errors', () => {
    expect(homeworkFromAnalysis({ analysis: { errors: [] }, recording: {} })).toBe(null);
  });
  it('cards: the right sentence on the front, the learner\'s own on the back, no repeats', () => {
    expect(cardsFromErrors(analysis.errors)).toEqual([
      { word: 'Ma lähen raamatukokku.', translation: 'Sinu lause: Ma lähen raamatukogu.' },
      { word: 'Õhtuti teen ma süüa.', translation: 'Sinu lause: Õhtuti ma teen süüa.' },
    ]);
  });
});

describe('Pärast tundi panel', () => {
  it('gives homework and adds the corrected sentences as cards when the teacher presses', async () => {
    const { render, screen, fireEvent, waitFor } = await import('@testing-library/react');
    const React = await import('react');
    const { AuthContext } = await import('../../app/AuthContext.jsx');
    const { AfterLesson } = await import('./TranscriptView.jsx');
    const homework = { create: vi.fn().mockResolvedValue({ id: 'h1' }) };
    const words = { add: vi.fn().mockResolvedValue({}) };
    const recording = { studentId: 's1', studentName: 'Monika', invitationId: 'inv' };
    render(React.createElement(AuthContext.Provider, { value: { user: { uid: 't1', displayName: 'Pavel' } } },
      React.createElement(AfterLesson, { analysis, recording, homework, words })));
    expect(screen.getByText(/Падеж после глагола и места/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Anna kodutöö teemade järgi/ }));
    await waitFor(() => expect(homework.create).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', teacherUid: 't1', source: 'lesson-analysis' })));
    fireEvent.click(screen.getByRole('button', { name: /Lisa parandused kaartidele \(2\)/ }));
    await waitFor(() => expect(words.add).toHaveBeenCalledTimes(2));
    expect(words.add).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', invitationId: 'inv', word: 'Ma lähen raamatukokku.' }));
    expect(await screen.findByText(/2 parandatud lauset/)).toBeInTheDocument();
  });
});

describe('Kokkuvõte vanemale (owner 2026-10-23)', () => {
  it('names the topics and the number of corrected sentences in Estonian and Russian, never the sentences', async () => {
    const { parentNoteFromAnalysis } = await import('./afterLesson.js');
    const text = parentNoteFromAnalysis({ analysis: {
      focus: [{ topic: 'Osastav kääne (partitiiv)', count: 4 }, { topic: 'Minevik: lihtminevik', count: 2 }],
      errors: [{ said: 'Ma läksin pank', corrected: 'Ma läksin panka' }, { said: 'x', corrected: 'y', unsure: true }],
    } });
    expect(text).toBe([
      'Tunnis rääkisime palju ja parandasime 1 lauset.',
      'Tähelepanu vajab: Osastav kääne; Minevik.',
      'Kodus: iga päev „Päeva 5 minutit” (Sõnavara) ja kodutöö.',
      '',
      'На уроке много говорили и исправили 1 фраз.',
      'Над чем поработать: Osastav kääne; Minevik.',
      'Дома: каждый день «Päeva 5 minutit» (Sõnavara) и домашнее задание.',
    ].join('\n'));
    expect(text).not.toContain('läksin');
    expect(parentNoteFromAnalysis({ analysis: {} })).toBe('');
  });
});
