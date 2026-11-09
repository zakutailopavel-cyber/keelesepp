import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { announcePractice } from './events.js';
import PracticeRecorder from './PracticeRecorder.jsx';

describe('PracticeRecorder: practice XP for the pet', () => {
  beforeEach(() => { globalThis.localStorage?.clear?.(); });

  it('saves the XP of a finished round (right answers only); nothing for a kind without items', async () => {
    const service = { saveToday: vi.fn(async () => null) };
    render(<AuthContext.Provider value={{ user: { uid: 'u1', profile: {} } }}><PracticeRecorder service={service} /></AuthContext.Provider>);
    await act(async () => { announcePractice({ kind: 'words', reviewed: 10, correct: 7 }); });
    await act(async () => { announcePractice({ kind: 'homework', correct: 5 }); });
    expect(service.saveToday).toHaveBeenCalledTimes(1);
    expect(service.saveToday).toHaveBeenCalledWith('u1', expect.objectContaining({ xp: 7 }));
  });

  it('writes nothing in the staff preview', async () => {
    const service = { saveToday: vi.fn(async () => null) };
    render(<AuthContext.Provider value={{ user: { uid: 'u1', profile: {} }, preview: { studentId: 's1' } }}><PracticeRecorder service={service} /></AuthContext.Provider>);
    await act(async () => { announcePractice({ kind: 'grammar', items: 10, correct: 9 }); });
    expect(service.saveToday).not.toHaveBeenCalled();
  });
});
