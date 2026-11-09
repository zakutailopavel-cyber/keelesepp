import { vi } from 'vitest';
import { announcePractice, onPractice } from './events.js';

describe('practice events (hook for the path / streak / XP / pet)', () => {
  it('delivers each event to every listener until it unsubscribes; a broken listener does not stop the rest', () => {
    const seen = vi.fn();
    const broken = vi.fn(() => { throw new Error('boom'); });
    const stopBroken = onPractice(broken);
    const stop = onPractice(seen);
    const event = announcePractice({ kind: 'words', reviewed: 12, correct: 9, minutes: 4.5 });
    expect(event).toMatchObject({ kind: 'words', reviewed: 12, correct: 9, minutes: 4.5, at: expect.any(String) });
    expect(seen).toHaveBeenCalledWith(event);
    stop();
    stopBroken();
    announcePractice({ kind: 'words' });
    expect(seen).toHaveBeenCalledTimes(1);
    expect(onPractice('not a function')).toBeTypeOf('function');
  });
});
