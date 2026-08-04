import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LibraryPage from './LibraryPage.jsx';

const data = {
  curriculumLessons: [
    { id: 'lesson-1', title: 'Pere tunnikava', description: 'Tund perest', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere' },
    { id: 'worksheet-1', title: 'Pere tööleht', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere', worksheetData: { blocks: [{ type: 'fill' }] } },
  ],
  exercises: [
    { id: 'exercise-1', title: 'Family match', subject: 'Inglise keel', level: 'A1', topic: 'My family', type: 'match' },
  ],
};

function renderPage() {
  const repository = { list: vi.fn().mockResolvedValue(data) };
  render(<MemoryRouter><LibraryPage repository={repository} /></MemoryRouter>);
  return repository;
}

describe('LibraryPage', () => {
  it('opens the real subject, stage and topic hierarchy', async () => {
    const repository = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ }));
    fireEvent.click(screen.getByRole('button', { name: /A1.*2 materjali/ }));
    fireEvent.click(screen.getByRole('button', { name: /Minu pere.*2 materjali/ }));

    expect(screen.getByRole('button', { name: /Pere tunnikava/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pere tööleht/ })).toBeInTheDocument();
    expect(repository.list).toHaveBeenCalledOnce();
  });

  it('searches across both Firebase collections and opens material details', async () => {
    renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'family' } });
    const exercise = screen.getByRole('button', { name: /Family match/ });
    fireEvent.click(exercise);

    const dialog = screen.getByRole('dialog', { name: 'Family match' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava töövahend/ })).toHaveAttribute('href', 'https://www.epkoolitus.ee/haldus-exercises/?exercise=exercise-1');
  });
});
