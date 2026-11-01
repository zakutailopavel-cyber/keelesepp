import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotificationCenter from './NotificationCenter.jsx';

const overdueTask = { id: 't1', title: 'Helista vanemale', status: 'open', dueDate: '2020-01-01', assignedToUid: 'u1' };

describe('NotificationCenter bell', () => {
  it('shows no number until the slow sources have arrived', async () => {
    let finish;
    const repositories = {
      tasks: { subscribe: (next) => { next([overdueTask]); return () => {}; } },
      students: { list: () => new Promise((resolve) => { finish = resolve; }) },
      messages: { list: vi.fn().mockResolvedValue([]) },
      homework: { listSubmissionsByStudentIds: vi.fn().mockResolvedValue([]) },
      invoices: { list: vi.fn().mockResolvedValue([]) },
    };
    globalThis.localStorage?.clear?.();
    const { container } = render(<MemoryRouter><NotificationCenter user={{ uid: 'u1', roles: ['admin'] }} repositories={repositories} /></MemoryRouter>);
    expect(container.querySelector('.nc-count')).toBeNull();
    expect(container.querySelector('.nc-dot')).toBeNull();
    await act(async () => { finish({ items: [] }); });
    expect(container.querySelector('.nc-count, .nc-dot')).not.toBeNull();
  });
});
