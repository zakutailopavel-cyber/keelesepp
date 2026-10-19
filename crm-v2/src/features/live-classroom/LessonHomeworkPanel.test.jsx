import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LessonHomeworkPanel from './LessonHomeworkPanel.jsx';

describe('LessonHomeworkPanel', () => {
  it('opened from a page\'s ⋯ menu, gives that page to the student to study', async () => {
    const service = { listForLesson: vi.fn(async () => []), createFromLesson: vi.fn(async (data) => ({ id: 'h1', task: data.task, boardPageTitle: data.boardPage?.title })) };
    const invitation = { id: 'inv1', studentId: 's1' };
    render(<LessonHomeworkPanel invitation={invitation} user={{ uid: 't1' }} boardPage={{ id: 'pg1', title: 'Tund 3' }} worksheet={{ id: 'w1', title: 'Leht' }} assignPage service={service} />);
    expect(screen.getByRole('textbox')).toHaveValue('Õpi tahvlilehe „Tund 3” materjal.');
    expect(screen.getByRole('checkbox', { name: /Lisa tahvlileht/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /kodutööks/ })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Anna kodutöö' }));
    await waitFor(() => expect(service.createFromLesson).toHaveBeenCalledWith(expect.objectContaining({ boardPage: { id: 'pg1', title: 'Tund 3' }, worksheet: null })));
  });
});
