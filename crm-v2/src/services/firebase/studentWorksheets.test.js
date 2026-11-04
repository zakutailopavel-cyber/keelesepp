import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => {
  const transaction = { get: vi.fn(async () => ({ exists: () => false })), set: vi.fn() };
  return {
    transaction,
    collection: vi.fn((_db, name) => name),
    doc: vi.fn((...parts) => ({ id: parts.length > 2 ? parts[2] : 'newdraft', path: parts.slice(1).join('/') || 'newdraft' })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    runTransaction: vi.fn(async (_db, run) => run(transaction)),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('firebase/storage', () => ({ ref: vi.fn(), uploadBytesResumable: vi.fn(), getDownloadURL: vi.fn() }));
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'db', storage: 'storage' }) }));

import { studentWorksheetsService } from './studentWorksheets.js';
import { newDocument } from '../../features/worksheet-studio/engine/schema.js';

describe('studentWorksheetsService.save origin', () => {
  beforeEach(() => vi.clearAllMocks());

  it('publishing keeps the link back to the lesson recording on the draft and the assignment', async () => {
    const document = { ...newDocument(), meta: { ...newDocument().meta, title: 'Kodutöö tunnist 4.11' } };
    await studentWorksheetsService.forStudent({ id: 's1', name: 'Anna' }).save({
      document, user: { uid: 't1' }, status: 'published', origin: { kind: 'lesson-errors', recordingId: 'inv1_1', invitationId: 'inv1' },
    });
    const [draftWrite, assignmentWrite] = firestore.transaction.set.mock.calls;
    expect(draftWrite[1]).toMatchObject({ origin: 'lesson-errors', sourceRecordingId: 'inv1_1', sourceInvitationId: 'inv1' });
    expect(assignmentWrite[1]).toMatchObject({ source: 'student_private_worksheet', status: 'new', origin: 'lesson-errors', sourceRecordingId: 'inv1_1', sourceInvitationId: 'inv1', studentId: 's1' });
  });

  it('without an origin nothing extra is written', async () => {
    const document = { ...newDocument(), meta: { ...newDocument().meta, title: 'Isiklik tööleht' } };
    await studentWorksheetsService.forStudent({ id: 's1' }).save({ document, user: { uid: 't1' }, status: 'published' });
    const [, assignmentWrite] = firestore.transaction.set.mock.calls;
    expect(assignmentWrite[1]).not.toHaveProperty('origin');
    expect(assignmentWrite[1]).not.toHaveProperty('sourceRecordingId');
  });
});
