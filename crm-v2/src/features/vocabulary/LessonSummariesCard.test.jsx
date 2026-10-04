import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LessonSummariesCard from './LessonSummariesCard.jsx';

const summaries = [
  { id: 'inv-1', invitationId: 'inv-1', studentId: 's-1', teacherName: 'Kati', title: 'Eesti keel', endedAt: '2026-10-01T11:00:00Z', note: 'Tubli töö!', pages: [{ id: 'p1', title: 'Tund 1' }] },
  { id: 'inv-2', invitationId: 'inv-2', studentId: 's-1', teacherName: 'Kati', title: 'Eesti keel 2', endedAt: '2026-10-03T11:00:00Z', note: '', pages: [] },
];

it('shows the newest lesson open with its note, board pages, words and homework', async () => {
  const summaryService = { subscribeForStudent: vi.fn((id, onData) => { onData(summaries); return vi.fn(); }) };
  const wordsService = { subscribeForStudent: vi.fn((id, onData) => { onData([{ id: 'w1', invitationId: 'inv-1', word: 'kass', translation: 'кошка' }, { id: 'w2', invitationId: 'inv-2', word: 'koer' }]); return vi.fn(); }) };
  const homeworkService = { listForLesson: vi.fn(async ({ invitationId }) => (invitationId === 'inv-1' ? [{ id: 'h1', task: 'Korda sõnu', due: '2026-10-08' }] : [])) };
  render(<MemoryRouter><LessonSummariesCard studentIds={['s-1']} summaryService={summaryService} wordsService={wordsService} homeworkService={homeworkService} /></MemoryRouter>);
  const newest = screen.getByRole('button', { name: /Eesti keel 2/ });
  expect(newest).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('koer')).toBeInTheDocument();
  expect(await screen.findByText('Kodutööd ei antud.')).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { expanded: false })[0]);
  expect(screen.getByText('Tubli töö!')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Tund 1' })).toHaveAttribute('href', '/board?page=p1');
  expect(screen.getByText('kass')).toBeInTheDocument();
  expect(await screen.findByText('Korda sõnu')).toBeInTheDocument();
  expect(newest).toHaveAttribute('aria-expanded', 'false');
});

it('says when there are no summaries yet', () => {
  render(<MemoryRouter><LessonSummariesCard studentIds={['s-1']} summaryService={{ subscribeForStudent: (id, onData) => { onData([]); return () => {}; } }} wordsService={{ subscribeForStudent: (id, onData) => { onData([]); return () => {}; } }} homeworkService={{ listForLesson: async () => [] }} /></MemoryRouter>);
  expect(screen.getByText('Kokkuvõtteid veel ei ole')).toBeInTheDocument();
});
