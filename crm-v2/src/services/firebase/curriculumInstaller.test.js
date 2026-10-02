import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  set: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: mocks.doc,
  writeBatch: (...args) => mocks.writeBatch(...args),
}));

vi.mock('./client.js', () => ({
  requireFirebaseClient: () => ({ db: { name: 'test-db' } }),
}));

import { curriculumInstallerService } from './curriculumInstaller.js';

describe('curriculumInstallerService', () => {
  beforeEach(() => {
    mocks.set.mockClear();
    mocks.commit.mockClear();
    mocks.doc.mockClear();
    mocks.writeBatch.mockReset();
    mocks.writeBatch.mockReturnValue({ set: mocks.set, commit: mocks.commit });
  });

  it('installs exactly 100 stable A2 lessons with merge semantics', async () => {
    const user = { uid: 'teacher-1', displayName: 'Õpetaja' };
    const result = await curriculumInstallerService.installA2({ user });

    expect(result).toMatchObject({ curriculumId: 'est-a2-curriculum-v1', count: 100 });
    expect(mocks.set).toHaveBeenCalledTimes(100);
    expect(mocks.commit).toHaveBeenCalledOnce();

    const [firstRef, firstPayload, firstOptions] = mocks.set.mock.calls[0];
    const [lastRef, lastPayload, lastOptions] = mocks.set.mock.calls[99];

    expect(firstRef).toEqual({ collectionName: 'curriculumLessons', id: 'a2-001' });
    expect(lastRef).toEqual({ collectionName: 'curriculumLessons', id: 'a2-100' });
    expect(firstOptions).toEqual({ merge: true });
    expect(lastOptions).toEqual({ merge: true });
    expect(firstPayload).toMatchObject({
      curriculumId: 'est-a2-curriculum-v1',
      level: 'A2',
      roadmapLessonNumber: 1,
      roadmapUpdatedBy: 'teacher-1',
    });
    expect(lastPayload).toMatchObject({
      curriculumId: 'est-a2-curriculum-v1',
      level: 'A2',
      roadmapLessonNumber: 100,
      roadmapKind: 'assessment',
    });
    expect(firstPayload).not.toHaveProperty('worksheetDoc');
    expect(firstPayload).not.toHaveProperty('generatorProfile');
  });

  it('rejects installation without an authenticated user', async () => {
    await expect(curriculumInstallerService.installA2()).rejects.toThrow(/sisse logitud/);
    expect(mocks.writeBatch).not.toHaveBeenCalled();
  });
});
