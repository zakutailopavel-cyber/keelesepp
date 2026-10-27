import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import GroupContactsPanel from './GroupContactsPanel.jsx';

describe('GroupContactsPanel', () => {
  it('shows families without lessons, saves the offer and adds the selected to a group', async () => {
    const students = {
      list: vi.fn(async ({ status }) => ({ items: status === 'active' ? [{ id: 's1', name: 'Mia', active: true, parentName: 'Ema', parentPhone: '5551 111', subject: 'Eesti keel', level: 'A1' }] : [] })),
      saveGroupInterest: vi.fn(async () => ({})),
    };
    const empty = { list: vi.fn(async () => []), listForCalendar: vi.fn(async () => []) };
    const onAddToGroup = vi.fn(async () => {});
    render(<MemoryRouter><GroupContactsPanel groups={[{ id: 'g1', name: 'A1 lapsed', students: [] }]} user={{ displayName: 'Admin' }} onAddToGroup={onAddToGroup}
      repositories={{ students, leads: empty, schedule: empty, lessons: empty, times: empty }} /></MemoryRouter>);
    const panel = await screen.findByRole('region', { name: 'Kellele pakkuda grupitunde' });
    expect(within(panel).getByText('Vanem: Ema')).toBeInTheDocument();
    fireEvent.change(within(panel).getByLabelText('Pakkumine: Mia'), { target: { value: 'interested' } });
    await waitFor(() => expect(students.saveGroupInterest).toHaveBeenCalledWith('s1', expect.objectContaining({ status: 'interested' }), expect.anything()));
    fireEvent.click(within(panel).getByLabelText('Vali Mia'));
    fireEvent.change(within(panel).getByLabelText('Grupp'), { target: { value: 'g1' } });
    fireEvent.click(within(panel).getByRole('button', { name: 'Lisa 1 valitut gruppi' }));
    await waitFor(() => expect(onAddToGroup).toHaveBeenCalledWith(expect.objectContaining({ id: 'g1' }), expect.objectContaining({ id: 's1' })));
    expect(await within(panel).findByText(/1 õpilast lisati gruppi/)).toBeInTheDocument();
  });
});
