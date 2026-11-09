import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LinkReviewsCard from './LinkReviewsCard.jsx';

// incident 2026-11-09: the card was created at sign-up next to the teacher's card; the administrator compares and merges
const notice = {
  id: 'r-created', uid: 'kid-uid', displayName: 'Stefania Šabanova', email: 'kid@example.test', relationship: 'student', childName: '',
  reason: 'possible_existing_card_created', reasonText: 'Uus konto võib kuuluda olemasolevale kaardile',
  createdStudentId: 'self_kid-uid', createdStudentName: 'Stefania Šabanova',
  candidates: [{ id: 'card-stefania', name: 'Stefania', email: '', parentEmail: '', matchText: 'sama eesnimi ja perekonnanimi (ka lapsevanema oma)' }],
};

function setup(overrides = {}) {
  const service = {
    dismissReview: vi.fn().mockResolvedValue({ dismissed: true }),
    createCardForReview: vi.fn(),
    linkToStudent: vi.fn(),
    mergeStudents: vi.fn(async ({ keepId, sourceId, apply }) => (apply ? { merged: true } : {
      keep: { id: keepId, name: 'Stefania' }, source: { id: sourceId, name: 'Stefania Šabanova' }, names: ['Stefania'], totals: {}, move: [],
    })),
    ...overrides,
  };
  const students = { list: vi.fn().mockResolvedValue({ items: [{ id: 'card-stefania', name: 'Stefania' }, { id: 'self_kid-uid', name: 'Stefania Šabanova' }] }) };
  const onChanged = vi.fn();
  render(<MemoryRouter><LinkReviewsCard reviews={[notice]} service={service} students={students} onChanged={onChanged} /></MemoryRouter>);
  return { service, onChanged };
}

describe('LinkReviewsCard: a card created next to a likely existing card', () => {
  it('opens both cards and offers the merge instead of a new card or a link', () => {
    setup();
    const item = screen.getByRole('article', { name: 'Otsus: Stefania Šabanova' });
    expect(within(item).getByText('Uus konto võib kuuluda olemasolevale kaardile')).toBeInTheDocument();
    expect(within(item).getByRole('link', { name: 'Stefania Šabanova' })).toHaveAttribute('href', '/students/self_kid-uid');
    expect(within(item).getByRole('link', { name: 'Stefania' })).toHaveAttribute('href', '/students/card-stefania');
    expect(within(item).getByText(/sama eesnimi ja perekonnanimi/)).toBeInTheDocument();
    expect(within(item).queryByRole('button', { name: /Loo uus kaart/ })).toBeNull();
    expect(within(item).queryByRole('button', { name: /Seo selle kaardiga/ })).toBeNull();
    expect(within(item).getByRole('button', { name: /Pole sama inimene/ })).toBeInTheDocument();
  });

  it('merges the new card into the existing one and closes the notice', async () => {
    const { service, onChanged } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Ava ühendamine/ }));
    await waitFor(() => expect(service.mergeStudents).toHaveBeenCalledWith({ keepId: 'card-stefania', sourceId: 'self_kid-uid' }));
    fireEvent.click(await screen.findByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Liida kaardid' }));
    await waitFor(() => expect(service.mergeStudents).toHaveBeenCalledWith(expect.objectContaining({ keepId: 'card-stefania', sourceId: 'self_kid-uid', apply: true, confirmed: true })));
    await waitFor(() => expect(service.dismissReview).toHaveBeenCalledWith('r-created'));
    expect(onChanged).toHaveBeenCalled();
    expect(await screen.findByText(/Kaardid on liidetud/)).toBeInTheDocument();
  });
});
