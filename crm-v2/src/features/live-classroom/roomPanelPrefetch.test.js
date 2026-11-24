import { vi } from 'vitest';
import { prefetchRoomPanels } from './roomPanels.js';

describe('room panels download once the room is open', () => {
  it('fetches the teacher panels, the student only his words, and a failed file never throws', async () => {
    const ok = vi.fn(() => Promise.resolve({ default: () => null }));
    const gone = vi.fn(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')));
    const loaders = { teacher: [ok, gone], student: [ok] };
    prefetchRoomPanels(true, loaders);
    prefetchRoomPanels(false, loaders);
    await new Promise((resolve) => { globalThis.setTimeout(resolve, 0); });
    expect(ok).toHaveBeenCalledTimes(2);
    expect(gone).toHaveBeenCalledTimes(1);
  });
});
