import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WarmupPanel from './WarmupPanel.jsx';
import LessonHints from './LessonHints.jsx';

const invitation = { id: 'inv-now', studentId: 'st-1', studentName: 'Mari' };
const lessons = [{
  id: 'r1', invitationId: 'inv-old', startedAt: '2026-11-03T10:00:00Z',
  analysis: {
    errors: [
      { said: 'Täna ma olen väsinud.', corrected: 'Täna olen ma väsinud.', kind: 'sõnajärg', startMs: 1 },
      { said: 'Ma lähen koolis homme.', corrected: 'Ma lähen kooli homme.', kind: 'vorm', startMs: 2 },
      { said: 'Ma ei tea see.', corrected: 'Ma ei tea seda.', kind: 'vorm', startMs: 3 },
    ],
    focus: [{ key: 'order', count: 2, examples: [{ said: 'Täna ma olen väsinud.', corrected: 'Täna olen ma väsinud.' }] }],
    summary: { jargmiseks: ['Harjuta sõnajärge.'] },
  },
}];

describe('WarmupPanel', () => {
  it('lets the teacher remove and edit a sentence, then puts the worksheet on the board', async () => {
    const library = { assign: vi.fn(async () => ({ assignments: [{ id: 'as-1' }] })) };
    const homework = { openWorksheetInRoom: vi.fn(async () => ({})) };
    const onPlaced = vi.fn();
    render(<WarmupPanel invitation={invitation} user={{ uid: 't1' }} lessons={lessons} library={library} homework={homework} onPlaced={onPlaced} />);
    expect(screen.getByDisplayValue('Täna ma olen väsinud.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Eemalda lause 3' }));
    fireEvent.change(screen.getByLabelText('Õige lause 1'), { target: { value: 'Täna olen ma väga väsinud.' } });
    fireEvent.click(screen.getByRole('button', { name: /Pane tahvlile \(2\)/ }));
    await waitFor(() => expect(onPlaced).toHaveBeenCalledWith('as-1'));
    const { item, students } = library.assign.mock.calls[0][0];
    expect(students).toEqual([{ id: 'st-1', name: 'Mari' }]);
    expect(item.source.worksheetDoc.blocks).toHaveLength(2);
    expect(item.source.worksheetDoc.blocks[0].data.rows[0]).toEqual({ wrong: 'Täna ma olen väsinud.', answer: 'Täna olen ma väga väsinud.' });
    expect(homework.openWorksheetInRoom).toHaveBeenCalledWith({ assignmentId: 'as-1', roomKey: 'inv-now' });
  });

  it('says when there is no analysed lesson', () => {
    render(<WarmupPanel invitation={invitation} user={{ uid: 't1' }} lessons={[]} />);
    expect(screen.getByText(/pole veel analüüsitud tundi/)).toBeTruthy();
  });
});

describe('LessonHints', () => {
  it('shows topics, an example and the advice; hides while sharing the screen', () => {
    const onWarmup = vi.fn();
    const { rerender, container } = render(<LessonHints invitation={invitation} lessons={lessons} onWarmup={onWarmup} />);
    expect(screen.getByText('Täna harjutada')).toBeTruthy();
    expect(screen.getByText(/Sõnajärg/)).toBeTruthy();
    expect(screen.getByText('Harjuta sõnajärge.')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Tunni analüüs/ }).getAttribute('href')).toBe('/students/st-1?tab=learning');
    fireEvent.click(screen.getByRole('button', { name: /Soojendus/ }));
    expect(onWarmup).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Täna harjutada/ }));
    expect(screen.queryByText('Harjuta sõnajärge.')).toBeNull();
    rerender(<LessonHints invitation={invitation} lessons={lessons} hidden />);
    expect(container.innerHTML).toBe('');
  });
});
