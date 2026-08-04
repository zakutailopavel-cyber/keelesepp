const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  getDocs: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { libraryService } from './library.js';

describe('libraryService', () => {
  it('loads the existing curriculum and exercise collections without changing their records', async () => {
    firestore.getDocs.mockImplementation(async (name) => ({
      docs: name === 'curriculumLessons'
        ? [{ id: 'lesson-1', data: () => ({ title: 'Tunnikava' }) }]
        : [{ id: 'exercise-1', data: () => ({ title: 'Harjutus' }) }],
    }));

    await expect(libraryService.list()).resolves.toEqual({
      curriculumLessons: [{ id: 'lesson-1', title: 'Tunnikava' }],
      exercises: [{ id: 'exercise-1', title: 'Harjutus' }],
    });
    expect(firestore.collection).toHaveBeenCalledWith('firebase-db', 'curriculumLessons');
    expect(firestore.collection).toHaveBeenCalledWith('firebase-db', 'exercises');
  });
});
