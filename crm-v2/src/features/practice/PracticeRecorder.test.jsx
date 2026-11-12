import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { announcePractice } from './events.js';
import PracticeRecorder from './PracticeRecorder.jsx';

describe('PracticeRecorder: practice XP for the pet', () => {
  beforeEach(() => { globalThis.localStorage?.clear?.(); });

  it('saves the XP of a finished round (right answers only); other kinds keep the day streak without XP', async () => {
    const service = { saveToday: vi.fn(async () => null) };
    render(<AuthContext.Provider value={{ user: { uid: 'u1', profile: {} } }}><PracticeRecorder service={service} /></AuthContext.Provider>);
    await act(async () => { announcePractice({ kind: 'words', reviewed: 10, correct: 7 }); });
    await act(async () => { announcePractice({ kind: 'homework', correct: 5 }); });
    await act(async () => { announcePractice({ kind: 'words', reviewed: 0, correct: 0 }); });
    expect(service.saveToday).toHaveBeenCalledTimes(2);
    expect(service.saveToday).toHaveBeenNthCalledWith(1, 'u1', expect.objectContaining({ xp: 7, learned: true }));
    expect(service.saveToday).toHaveBeenNthCalledWith(2, 'u1', expect.objectContaining({ xp: 0, learned: true }));
  });

  it('a submitted worksheet, a pet game and a word round on one day are one learning day', async () => {
    const service = { saveToday: vi.fn(async () => null) };
    render(<AuthContext.Provider value={{ user: { uid: 'u2', profile: {} } }}><PracticeRecorder service={service} /></AuthContext.Provider>);
    await act(async () => { announcePractice({ kind: 'worksheet' }); });
    await act(async () => { announcePractice({ kind: 'pet', correct: 4 }); });
    await act(async () => { announcePractice({ kind: 'words', reviewed: 5, correct: 2 }); });
    expect(service.saveToday).toHaveBeenCalledTimes(3);
    const stored = JSON.parse(globalThis.localStorage.getItem('ks-tana-u2'));
    expect(stored.learnDays).toHaveLength(1);
    expect(stored.xp).toBe(2);
  });

  it('writes nothing in the staff preview', async () => {
    const service = { saveToday: vi.fn(async () => null) };
    render(<AuthContext.Provider value={{ user: { uid: 'u1', profile: {} }, preview: { studentId: 's1' } }}><PracticeRecorder service={service} /></AuthContext.Provider>);
    await act(async () => { announcePractice({ kind: 'grammar', items: 10, correct: 9 }); });
    expect(service.saveToday).not.toHaveBeenCalled();
  });
});
