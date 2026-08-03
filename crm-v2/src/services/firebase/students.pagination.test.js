import { beforeEach, vi } from 'vitest';

const { getDocs } = vi.hoisted(() => ({ getDocs: vi.fn() }));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs,
  limit: vi.fn((value) => ({ limit: value })),
  orderBy: vi.fn(),
  query: vi.fn(),
  startAfter: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock('./client.js', () => ({
  requireFirebaseClient: () => ({ db: {} }),
}));

import { studentsService } from './students.js';

function studentDoc(id, teacher) {
  return { id, data: () => ({ name: id, teacher, active: true }) };
}

describe('students service pagination', () => {
  beforeEach(() => getDocs.mockReset());

  it('stops on the exact filtered page boundary and preserves the next cursor', async () => {
    const firstMatch = studentDoc('first-match', 'Pavel');
    const nextMatch = studentDoc('next-match', 'Pavel');
    const deferredMatch = studentDoc('deferred-match', 'Pavel');
    getDocs
      .mockResolvedValueOnce({
        size: 2,
        docs: [studentDoc('not-a-match', 'Jelena'), firstMatch],
      })
      .mockResolvedValueOnce({
        size: 2,
        docs: [nextMatch, deferredMatch],
      });

    const result = await studentsService.list({
      scopeTeacher: 'Pavel Zakutailo',
      pageSize: 2,
    });

    expect(result.items.map((student) => student.id)).toEqual(['first-match', 'next-match']);
    expect(result.cursor).toBe(nextMatch);
    expect(result.hasMore).toBe(true);
  });
});
