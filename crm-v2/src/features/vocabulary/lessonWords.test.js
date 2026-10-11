import { describe, expect, it, vi } from 'vitest';
import { IMPORT_LESSONS, importLessonWords, lessonImported, lessonWordCards, lessonWordId, lessonsToImport } from './lessonWords.js';

const NOW = new Date('2026-10-11T12:00:00').getTime();
const words = [{ et: 'kuhu', ru: 'куда', ex: 'Kuhu sa lähed?' }, { et: 'turg', ru: 'рынок', ex: 'Ma lähen turule.' }, { et: 'sild', ru: 'мост', ex: 'Mine üle silla.' }];

describe('lesson vocabulary', () => {
  it('makes deck cards with the Russian meaning and the example as hint', () => {
    expect(lessonWordCards(words, 'b1b2-006')[1]).toEqual({ id: 'lw:b1b2-006:1', front: 'turg', back: 'рынок', hint: 'Ma lähen turule.' });
  });

  it('imports the words of recent held lessons once, newest first, a few lessons at a time', () => {
    const lessons = [
      { date: '2026-10-09', status: 'Toimunud', topicLessonId: 'b1b2-006' },
      { date: '2026-10-08', status: 'Puudus_p', topicLessonId: 'b1b2-007' },
      { date: '2026-09-01', status: 'Toimunud', topicLessonId: 'b1b2-001' },
      { date: '2026-10-10', status: '', topicLessonId: 'est-c1-001' },
      { date: '2026-10-07', status: 'Toimunud', topicLessonId: 'a2-010' },
      { date: '2026-10-06', status: 'Toimunud', topicLessonId: 'a2b1-020' },
      { date: '2026-10-05', status: 'Toimunud', topicLessonId: 'custom-topic' },
    ];
    expect(lessonsToImport({ studentId: 's1', lessons, words: [], now: NOW })).toEqual(['est-c1-001', 'b1b2-006', 'a2-010']);
    expect(IMPORT_LESSONS).toBe(3);
    const imported = [{ id: lessonWordId('s1', 'est-c1-001', 0) }];
    expect(lessonImported('s1', 'est-c1-001', imported)).toBe(true);
    expect(lessonsToImport({ studentId: 's1', lessons, words: imported, now: NOW })).toEqual(['b1b2-006', 'a2-010', 'a2b1-020']);
  });

  it('writes the new words of a lesson in one batch under fixed ids and skips words the student already has', async () => {
    const service = { addLessonWords: vi.fn(async () => []) };
    const added = await importLessonWords({ studentId: 's1', lessonId: 'b1b2-006', words: [{ id: 'own', word: 'Turg' }], service, user: { uid: 'u1' }, load: async () => words });
    expect(added).toBe(2);
    expect(service.addLessonWords).toHaveBeenCalledTimes(1);
    expect(service.addLessonWords.mock.calls[0][0].items).toEqual([
      { id: 'lw_s1_b1b2-006_0', word: 'kuhu', translation: 'куда', example: 'Kuhu sa lähed?' },
      { id: 'lw_s1_b1b2-006_2', word: 'sild', translation: 'мост', example: 'Mine üle silla.' },
    ]);
  });
});
