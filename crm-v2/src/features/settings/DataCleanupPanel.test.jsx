import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import DataCleanupPanel from './DataCleanupPanel.jsx';
import { findCleanup } from './cleanupModel.js';

const students = [
  { id: 's1', name: 'Aleksandr Smirnov', active: true, teacher: '', enrollments: [] },
  { id: 's2', name: 'Mari', active: true, teacher: 'Pavel' },
  { id: 's3', name: 'Uus Õpilane', active: true, teacher: '' },
];
const schedule = [{ id: 'l1', studentId: 's1', teacher: 'Pavel Zakutailo', status: 'Planeeritud' }];
const lessons = [{ id: 'r1', studentId: 's1', date: '2026-09-28', topic: 'Uus tööleht', teacher: 'Pavel' }, { id: 'r2', studentId: 's2', topic: 'Kellaajad' }];
const homework = [
  { id: 'h1', studentId: 's2', status: 'Ootel', due: '2026-06-21', task: 'Kirjuta tegevusi' },
  { id: 'h2', studentId: 's2', status: 'Ootel', due: '2099-01-01' },
  { id: 'h3', studentId: 's2', status: 'Tehtud', due: '2026-06-01' },
];
const messages = [
  { id: 'm1', channel: 'internal', studentId: 'test', studentName: 'test', text: 'yrooo', fromUid: 'x' },
  { id: 'm2', channel: 'instagram', conversationId: 'ig1', externalSenderName: 'Instagrami kasutaja', text: 'Instagram CRM smoke', fromUid: 'meta' },
  { id: 'm3', channel: 'internal', studentId: 's2', studentName: 'Mari', text: 'Tere!', fromUid: 'x' },
];

describe('admin data cleanup', () => {
  it('finds students without a teacher (with a suggestion from the calendar), placeholder topics, old open homework and test conversations', () => {
    const found = findCleanup({ students, schedule, lessons, homework, messages, userUid: 'admin' });
    expect(found.noTeacher.map((row) => [row.id, row.suggestion])).toEqual([['s1', 'Pavel Zakutailo'], ['s3', '']]);
    expect(found.topics.map((row) => row.id)).toEqual(['r1']);
    expect(found.oldHomework.map((row) => row.id)).toEqual(['h1']);
    expect(found.conversations.map((row) => row.messageIds)).toEqual(expect.arrayContaining([['m2']]));
    expect(found.conversations.some((row) => row.messageIds.includes('m3'))).toBe(false);
  });

  it('changes only ticked rows after confirming', async () => {
    const repositories = {
      students: { list: vi.fn().mockResolvedValue({ items: students }), update: vi.fn().mockResolvedValue({}) },
      schedule: { list: vi.fn().mockResolvedValue(schedule) },
      homework: { list: vi.fn().mockResolvedValue(homework) },
      messages: { list: vi.fn().mockResolvedValue(messages) },
      teachers: { list: vi.fn().mockResolvedValue([{ name: 'Yelyzaveta Lukianenko' }]) },
      maintenance: { listLessons: vi.fn().mockResolvedValue(lessons), clearLessonTopics: vi.fn(), closeHomework: vi.fn(), deleteMessages: vi.fn() },
    };
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    try {
      render(<DataCleanupPanel user={{ uid: 'admin', displayName: 'Admin' }} repositories={repositories} />);
      fireEvent.click(screen.getByRole('button', { name: /Otsi korrastamist/ }));
      fireEvent.click(await screen.findByRole('button', { name: 'Määra õpetaja (1)' }));
      await waitFor(() => expect(repositories.students.update).toHaveBeenCalledWith('s1', { teacher: 'Pavel Zakutailo' }));
      expect(repositories.students.update).toHaveBeenCalledTimes(1);

      fireEvent.click(await screen.findByRole('button', { name: 'Sulge (1)' }));
      await waitFor(() => expect(repositories.maintenance.closeHomework).toHaveBeenCalledWith([expect.objectContaining({ id: 'h1' })], expect.anything()));
      const tests = (await screen.findByText('Testvestlused')).closest('section');
      within(tests).getAllByRole('checkbox').forEach((box) => { if (box.checked) fireEvent.click(box); });
      expect(within(tests).getByRole('button', { name: /Kustuta vestlused \(0\)/ })).toBeDisabled();
    } finally {
      confirm.mockRestore();
    }
  });
});
