import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import MessagesPage from './MessagesPage.jsx';
import { buildConversations } from './messagesModel.js';

const students = [{ id: 'student-1', name: 'Mari Maasikas', teacher: 'Pavel' }, { id: 'student-2', name: 'Karl Kask', teacher: 'Pavel' }];
const incoming = { id: 'message-1', studentId: 'student-1', studentName: 'Mari Maasikas', teacher: 'Pavel', fromUid: 'parent-1', fromName: 'Mari ema', text: 'Kas tund toimub?', createdAt: '2026-08-04T09:00:00.000Z', read: false };

function repositories(messages = [incoming]) {
  return {
    repository: {
      list: vi.fn().mockResolvedValue(messages),
      listByStudentIds: vi.fn().mockResolvedValue(messages),
      send: vi.fn().mockResolvedValue({ id: 'sent-1' }),
      markConversationRead: vi.fn().mockResolvedValue(1),
    },
    studentRepository: {
      list: vi.fn().mockResolvedValue({ items: students }),
      listOwned: vi.fn().mockResolvedValue(students),
    },
  };
}

function renderPage(user, data) {
  render(<AuthContext.Provider value={{ user }}><MessagesPage {...data} /></AuthContext.Provider>);
}

describe('MessagesPage', () => {
  it('groups conversations chronologically and counts unread incoming messages', () => {
    const result = buildConversations([
      { ...incoming, id: 'later', createdAt: '2026-08-04T11:00:00.000Z' },
      { ...incoming, id: 'earlier', text: 'Tere', createdAt: '2026-08-04T08:00:00.000Z' },
      { ...incoming, id: 'own', fromUid: 'teacher-1', createdAt: '2026-08-04T10:00:00.000Z' },
    ], 'teacher-1');
    expect(result[0].messages.map((message) => message.id)).toEqual(['earlier', 'own', 'later']);
    expect(result[0].unread).toBe(2);
  });

  it('scopes a teacher to assigned students and marks the open conversation read', async () => {
    const data = repositories();
    renderPage({ uid: 'teacher-1', displayName: 'Pavel', roles: ['teacher'] }, data);
    expect(await screen.findAllByText('Kas tund toimub?')).toHaveLength(2);
    expect(data.studentRepository.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(data.repository.listByStudentIds).toHaveBeenCalledWith(['student-1', 'student-2']);
    expect(data.repository.list).not.toHaveBeenCalled();
    await waitFor(() => expect(data.repository.markConversationRead).toHaveBeenCalledWith({ messages: [incoming], userUid: 'teacher-1' }));
  });

  it('lets a parent start a conversation for an owned student and sends legacy-compatible data', async () => {
    const data = repositories([]);
    const user = { uid: 'parent-1', displayName: 'Lapsevanem', roles: ['parent'] };
    renderPage(user, data);
    const selector = await screen.findByLabelText('Alusta vestlust');
    fireEvent.change(selector, { target: { value: 'student-1' } });
    const conversation = screen.getByLabelText('Vestlus: Mari Maasikas');
    fireEvent.change(screen.getByLabelText('Sõnum'), { target: { value: 'Kas tund toimub homme?' } });
    fireEvent.click(within(conversation.parentElement).getByRole('button', { name: 'Saada' }));
    await waitFor(() => expect(data.repository.send).toHaveBeenCalledWith({ studentId: 'student-1', studentName: 'Mari Maasikas', teacher: 'Pavel', text: 'Kas tund toimub homme?' }, user));
    expect(data.studentRepository.listOwned).toHaveBeenCalledWith('parent-1');
  });

  it('uses the full message list only for administrators', async () => {
    const data = repositories();
    renderPage({ uid: 'admin-1', displayName: 'Admin', roles: ['admin'] }, data);
    expect(await screen.findAllByText('Kas tund toimub?')).toHaveLength(2);
    expect(data.repository.list).toHaveBeenCalledOnce();
    expect(data.repository.listByStudentIds).not.toHaveBeenCalled();
  });
});
