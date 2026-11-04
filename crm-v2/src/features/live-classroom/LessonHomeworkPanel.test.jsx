import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LessonHomeworkPanel from './LessonHomeworkPanel.jsx';
import { worksheetPageId } from '../board/boardModel.js';

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

  it('a worksheet page („Tööleht: …”) gives the worksheet behind it, not the page (2026-11-04, Demjan)', async () => {
    const service = { listForLesson: vi.fn(async () => []), createFromLesson: vi.fn(async (data) => ({ id: 'h2', task: data.task, worksheetTitle: data.worksheet?.title })) };
    const title = 'Tööleht: Loodus · Õpik';
    const sheets = [{ id: 'as-new', title: 'Minu päev · Avasta', legacyTitle: 'Minu päev' }, { id: 'as-opik', title: 'Loodus · Õpik', legacyTitle: 'Loodus' }];
    render(<LessonHomeworkPanel invitation={{ id: 'inv1', studentId: 's1' }} user={{ uid: 't1' }} boardPage={{ id: worksheetPageId(title), title }}
      worksheet={{ id: 'as-new', title: 'Minu päev · Avasta' }} sheets={sheets} assignPage service={service} />);
    expect(screen.getByRole('textbox')).toHaveValue('Tee tööleht „Loodus · Õpik”.');
    expect(screen.queryByRole('checkbox', { name: /Lisa tahvlileht/ })).toBeNull();
    expect(screen.getByRole('checkbox', { name: /Tööleht „Loodus · Õpik” kodutööks/ })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Anna kodutöö' }));
    await waitFor(() => expect(service.createFromLesson).toHaveBeenCalledWith(expect.objectContaining({ boardPage: null, worksheet: { id: 'as-opik', title: 'Loodus · Õpik' } })));
  });

  it('a worksheet page without a known sheet is never attached as a board page; the room sheet stays offered', () => {
    const service = { listForLesson: vi.fn(async () => []), createFromLesson: vi.fn() };
    render(<LessonHomeworkPanel invitation={{ id: 'inv1', studentId: 's1' }} user={{ uid: 't1' }} boardPage={{ id: 'ws-0000abcd', title: 'Tööleht: Kadunud' }}
      worksheet={{ id: 'as-room', title: 'Minu päev' }} service={service} />);
    expect(screen.queryByRole('checkbox', { name: /Lisa tahvlileht/ })).toBeNull();
    expect(screen.getByRole('checkbox', { name: /Tööleht „Minu päev” kodutööks/ })).toBeChecked();
  });

  it('a real board page (drawings, notes) is still given as a board page', () => {
    const service = { listForLesson: vi.fn(async () => []), createFromLesson: vi.fn() };
    render(<LessonHomeworkPanel invitation={{ id: 'inv1', studentId: 's1' }} user={{ uid: 't1' }} boardPage={{ id: 'pg7', title: 'Selgitus' }} sheets={[{ id: 'a', title: 'Selgitus' }]} service={service} />);
    expect(screen.getByRole('checkbox', { name: /Lisa tahvlileht „Selgitus”/ })).toBeInTheDocument();
  });
});
