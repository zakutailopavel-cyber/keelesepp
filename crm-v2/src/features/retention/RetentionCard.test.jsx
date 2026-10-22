import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RetentionCard from './RetentionCard.jsx';

describe('RetentionCard', () => {
  it('shows who is at risk and links to the card; a failing source is left out', async () => {
    const repository = { lessons: vi.fn(async () => { throw new Error('no access'); }), words: vi.fn(async () => []) };
    render(<MemoryRouter><RetentionCard students={[{ id: 's1', name: 'Mia', active: true }]} unplanned={[{ student: { id: 's1' }, lastLesson: '' }]} overdueInvoices={[{ studentId: 's1' }]} repository={repository} /></MemoryRouter>);
    expect(await screen.findByText('Mia')).toBeInTheDocument();
    expect(screen.getByText('järgmist tundi pole kalendris · tasumata arve')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mia/ })).toHaveAttribute('href', '/students/s1');
  });

  it('says so when nobody is at risk', async () => {
    render(<MemoryRouter><RetentionCard students={[{ id: 's1', name: 'Mia', active: true }]} repository={{ lessons: vi.fn(async () => []), words: vi.fn(async () => []) }} /></MemoryRouter>);
    expect(await screen.findByText(/riskis õpilasi pole/)).toBeInTheDocument();
  });
});
