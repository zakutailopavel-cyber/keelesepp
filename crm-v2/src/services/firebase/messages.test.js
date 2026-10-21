import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, name) => name),
  doc: vi.fn((...parts) => parts.length === 1 ? { id: 'generated-message', path: `${parts[0]}:generated-message` } : parts.join(':')),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn((name, ...constraints) => ({ name, constraints })),
  updateDoc: vi.fn(),
  where: vi.fn((field, operator, value) => ({ field, operator, value })),
  batch: { set: vi.fn(), update: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) },
  writeBatch: vi.fn(),
}));
const firebaseClient = vi.hoisted(() => ({
  auth: { currentUser: { getIdToken: vi.fn().mockResolvedValue('firebase-id-token') } },
  db: 'firebase-db',
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('./client.js', () => ({ requireFirebaseClient: () => firebaseClient }));

import { messagesService, normalizeMessage, normalizeMessageChannel } from './messages.js';

describe('messagesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firestore.writeBatch.mockReturnValue(firestore.batch);
  });

  it('normalizes Firestore timestamps and legacy message fields', () => {
    expect(normalizeMessage('message-1', { studentId: 'student-1', text: 'Tere', createdAt: { toDate: () => new Date('2026-08-04T10:00:00.000Z') } })).toMatchObject({
      id: 'message-1', channel: 'internal', conversationId: '', studentId: 'student-1', studentName: 'Vestlus', text: 'Tere', createdAt: '2026-08-04T10:00:00.000Z', read: false,
    });
  });

  it('normalizes external channel aliases without using array position as identity', () => {
    expect(normalizeMessageChannel('messenger')).toBe('facebook');
    expect(normalizeMessageChannel('IG')).toBe('instagram');
    expect(normalizeMessage('fb-1', {
      source: 'facebook_messenger',
      conversationId: 'facebook:page-1:thread-99',
      externalThreadId: 'thread-99',
      externalMessageId: 'mid.123',
      externalSenderId: 'sender-1',
    })).toMatchObject({
      id: 'fb-1',
      channel: 'facebook',
      conversationId: 'facebook:page-1:thread-99',
      externalThreadId: 'thread-99',
      externalMessageId: 'mid.123',
      externalSenderId: 'sender-1',
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

  it('atomically sends a bounded internal message with stable conversation identity and audit event', async () => {
    const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
    await expect(messagesService.send({ studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', text: '  Tere!  ' }, user)).resolves.toMatchObject({
      id: 'generated-message', channel: 'internal', conversationId: 'student-1', text: 'Tere!', read: false,
    });
    expect(firestore.batch.set).toHaveBeenCalledTimes(2);
    expect(firestore.batch.set.mock.calls[0][1]).toMatchObject({
      channel: 'internal', conversationId: 'student-1', studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', text: 'Tere!', fromUid: 'teacher-1', read: false,
    });
    expect(firestore.batch.set.mock.calls[1][1]).toMatchObject({
      type: 'message.sent', studentId: 'student-1', byUid: 'teacher-1', meta: expect.objectContaining({ channel: 'internal', conversationId: 'student-1' }),
    });
    expect(firestore.batch.commit).toHaveBeenCalledOnce();
    await expect(messagesService.send({ studentId: 'student-1', studentName: 'Mari', text: 'x'.repeat(4001) }, user)).rejects.toThrow('4000');
  });

  it('sends external replies only through the authenticated Meta endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'meta-message-1' }),
    });
    await expect(messagesService.sendExternal({
      channel: 'facebook',
      conversationId: 'facebook:sender-1',
      externalSenderId: 'sender-1',
      text: ' Tere! ',
    })).resolves.toEqual({ id: 'meta-message-1' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://us-central1-keelesepp-5136b.cloudfunctions.net/metaMessagingApi/reply',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer firebase-id-token' }),
        body: JSON.stringify({ channel: 'facebook', conversationId: 'facebook:sender-1', recipientId: 'sender-1', text: 'Tere!' }),
      }),
    );
    fetchMock.mockRestore();
  });

  it('counts a teacher\'s unread badge only over their own students (the rules allow nothing else)', async () => {
    const listeners = [];
    firestore.onSnapshot.mockImplementation((target, next) => { listeners.push({ target, next }); return vi.fn(); });
    const students = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1' }, { id: 'student-2' }] }) };
    const onCount = vi.fn();
    const stop = messagesService.subscribeUnreadCount({ uid: 'teacher-1', students }, onCount);
    await vi.waitFor(() => expect(listeners).toHaveLength(1));
    expect(students.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(listeners[0].target.constraints).toEqual([{ field: 'studentId', operator: 'in', value: ['student-1', 'student-2'] }]);
    listeners[0].next({ docs: [
      { id: 'a', data: () => ({ studentId: 'student-1', fromUid: 'parent-1', read: false }) },
      { id: 'b', data: () => ({ studentId: 'student-1', fromUid: 'teacher-1', read: false }) },
      { id: 'c', data: () => ({ studentId: 'student-2', fromUid: 'parent-2', read: true }) },
    ] });
    expect(onCount).toHaveBeenLastCalledWith(1);
    stop();
  });

  it('counts every unread message for an administrator', () => {
    firestore.onSnapshot.mockImplementation(() => vi.fn());
    messagesService.subscribeUnreadCount({ uid: 'admin-1', all: true }, vi.fn());
    expect(firestore.onSnapshot.mock.calls[0][0].constraints).toEqual([{ field: 'read', operator: '==', value: false }]);
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
