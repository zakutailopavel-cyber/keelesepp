import { describe, expect, it, vi } from 'vitest';
import { shareInFlight } from './shareInFlight.js';

describe('shareInFlight', () => {
  it('runs one read for callers that ask at the same time, each gets its own copies', async () => {
    const read = vi.fn(async () => [{ id: 'a' }]);
    const [first, second] = await Promise.all([shareInFlight('k1', read), shareInFlight('k1', read)]);
    expect(read).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
  });

  it('reads again once the read has finished, so a change is never hidden', async () => {
    const read = vi.fn(async () => ({ items: [{ id: 'a' }], hasMore: false }));
    await shareInFlight('k2', read);
    const again = await shareInFlight('k2', read);
    expect(read).toHaveBeenCalledTimes(2);
    expect(again.items).toEqual([{ id: 'a' }]);
  });

  it('keeps different keys apart and passes a failure to every caller, then reads again', async () => {
    const other = vi.fn(async () => []);
    const failing = vi.fn(async () => { throw new Error('ei saa'); });
    const results = await Promise.allSettled([shareInFlight('k3', failing), shareInFlight('k3', failing), shareInFlight('k4', other)]);
    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected', 'fulfilled']);
    expect(failing).toHaveBeenCalledTimes(1);
    expect(other).toHaveBeenCalledTimes(1);
    await expect(shareInFlight('k3', async () => ['ok'])).resolves.toEqual(['ok']);
  });
});
