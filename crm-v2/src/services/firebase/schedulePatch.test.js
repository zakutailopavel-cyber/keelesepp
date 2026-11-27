import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateDoc = vi.fn(async () => {});
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(), collection: vi.fn(), deleteDoc: vi.fn(), getDoc: vi.fn(), getDocs: vi.fn(), query: vi.fn(), setDoc: vi.fn(), where: vi.fn(),
  doc: (_db, name, id) => `${name}/${id}`,
  updateDoc: (...args) => updateDoc(...args),
  arrayUnion: (...dates) => ({ union: dates }),
  arrayRemove: (...dates) => ({ remove: dates }),
}));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: {} }) }));

const { scheduleService } = await import('./schedule.js');

describe('scheduleService.patch — one excluded date of a weekly series', () => {
  beforeEach(() => updateDoc.mockClear());

  it('adds only that date in place: a date another device excluded meanwhile is not overwritten', async () => {
    // this tab still thinks the list is empty; the stored list may already hold another date
    const result = await scheduleService.patch('s1', { excludedDates: ['2026-12-07'] }, { excludeAdd: ['2026-12-07'] });
    expect(updateDoc).toHaveBeenCalledWith('schedule/s1', expect.objectContaining({ excludedDates: { union: ['2026-12-07'] } }));
    // the caller still gets its own local view back
    expect(result).toEqual({ id: 's1', excludedDates: ['2026-12-07'] });
  });

  it('undo removes only that date', async () => {
    await scheduleService.patch('s1', { excludedDates: [] }, { excludeRemove: ['2026-12-07'] });
    expect(updateDoc).toHaveBeenCalledWith('schedule/s1', expect.objectContaining({ excludedDates: { remove: ['2026-12-07'] } }));
  });

  it('without a delta the fields are written as given (drag and drop of time, teacher, dates)', async () => {
    await scheduleService.patch('s1', { time: '11:00' });
    expect(updateDoc).toHaveBeenCalledWith('schedule/s1', expect.objectContaining({ time: '11:00' }));
  });
});
