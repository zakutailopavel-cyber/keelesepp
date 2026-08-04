import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'generated-message', path: `${parts[0]}:generated-message` } : parts.join(':')),
  getDocs: vi.fn(),
  query: vi.fn((name, ...constraints) => ({ name, constraints })),
  updateDoc: vi.fn(),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  batch: { set: vi.fn(), update: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ db: 'firebase-db' }) }));

import { messagesService, normalizeMessage } from './messages.js';

describe('messagesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('normalizes Firestore timestamps and legacy message fields', () => {
    expect(normalizeMessage('message-1', { studentId: 'student-1', text: 'Tere', createdAt: { toDate: () => new Date('2026-08-04T10:00:00.000Z') } })).toMatchObject({
      id: 'message-1', studentId: 'student-1', studentName: 'Vestlus', text: 'Tere', createdAt: '2026-08-04T10:00:00.000Z', read: false,
    });
  });

  it('uses the canonical teacher name in conversations', () => {
    expect(normalizeMessage('message-1', { teacher: 'Pavel' }).teacher).toBe('Pavel Zakutailo');
  });

  it('loads only owned student conversations in Firestore query chunks', async () => {
    firestore.getDocs.mockImplementation(async ({ constraints }) => ({ docs: constraints[0].value.map((studentId) => ({ id: `message-${studentId}`, data: () => ({ studentId, studentName: studentId, text: 'Tere', createdAt: studentId }) })) }));
    const result = await messagesService.listByStudentIds(Array.from({ length: 11 }, (_, index) => `student-${index + 1}`));
    expect(firestore.getDocs).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(11);
    expect(firestore.where).toHaveBeenCalledWith('studentId', 'in', expect.any(Array));
  });

  it('atomically sends a bounded message and writes an audit event', async () => {
    const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
    await expect(messagesService.send({ studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', text: '  Tere!  ' }, user)).resolves.toMatchObject({ id: 'generated-message', text: 'Tere!', read: false });
    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({ studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', text: 'Tere!', fromUid: 'teacher-1', read: false });
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({ type: 'message.sent', studentId: 'student-1', byUid: 'teacher-1' });
    expect(firestore.batch.commit).toHaveBeenCalledOnce();
    await expect(messagesService.send({ studentId: 'student-1', studentName: 'Mari', text: 'x'.repeat(4001) }, user)).rejects.toThrow('4000');
  });

  it('marks only unread incoming messages as read', async () => {
    const count = await messagesService.markConversationRead({
      messages: [
        { id: 'incoming', fromUid: 'parent-1', read: false },
        { id: 'own', fromUid: 'teacher-1', read: false },
        { id: 'read', fromUid: 'parent-1', read: true },
      ],
      userUid: 'teacher-1',
    });
    expect(count).toBe(1);
    expect(firestore.batch.update).toHaveBeenCalledOnce();
    expect(firestore.batch.update).toHaveBeenCalledWith('firebase-db:messages:incoming', { read: true });
    expect(firestore.batch.commit).toHaveBeenCalledOnce();
  });
});
