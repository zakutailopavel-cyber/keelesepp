import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import StudentParentsCard from './StudentParentsCard.jsx';

const student = { id: 's1', name: 'Mari', linkedParentIds: ['p1'] };
const service = () => ({
  list: vi.fn(async () => [{ id: 'p1', displayName: 'Vanem Üks', email: 'a@example.com' }, { id: 'p2', displayName: 'Vanem Kaks', email: 'b@example.com' }]),
  listByIds: vi.fn(async () => [{ id: 'p1', displayName: 'Vanem Üks', email: 'a@example.com' }]),
});

describe('StudentParentsCard reads', () => {
  it('names the linked parent without reading every account; opening the search reads them', async () => {
    const api = service();
    render(<MemoryRouter><StudentParentsCard student={student} user={{ uid: 'a' }} service={api} /></MemoryRouter>);
    expect(await screen.findByText('Vanem Üks')).toBeInTheDocument();
    expect(api.listByIds).toHaveBeenCalledWith(['p1']);
    expect(api.list).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Seo/ }));
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(1));
  });

  it('a service without listByIds reads the whole list as before', async () => {
    const { list } = service();
    render(<MemoryRouter><StudentParentsCard student={student} user={{ uid: 'a' }} service={{ list }} /></MemoryRouter>);
    expect(await screen.findByText('Vanem Üks')).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(1);
  });
});
