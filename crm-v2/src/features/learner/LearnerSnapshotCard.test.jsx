import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LearnerSnapshotCard from './LearnerSnapshotCard.jsx';

const repo = (overrides = {}) => ({
  words: vi.fn(async () => [{ id: 'w1', word: 'eelarve', translation: 'бюджет', box: 0, reviews: 2, reviewedAt: new Date().toISOString() }]),
  assignments: vi.fn(async () => []),
  homework: vi.fn(async () => []),
  lessons: vi.fn(async () => { throw new Error('Missing permissions'); }),
  ...overrides,
});

describe('LearnerSnapshotCard', () => {
  it('shows the forgotten words and puts them on the board as a review page', async () => {
    const onReviewPage = vi.fn(async () => {});
    render(<LearnerSnapshotCard studentId="s1" studentName="Mia" repository={repo()} onReviewPage={onReviewPage} />);
    expect(await screen.findByText('eelarve')).toBeInTheDocument();
    expect(screen.getByText('1 sõna ununeb — alusta tundi nende kordamisega.')).toBeInTheDocument();
    // the journal could not be read: the rest is shown, with a note
    expect(screen.getByText(/Osa andmeid jäi laadimata/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Pane kordamine tahvlile/ }));
    expect(await screen.findByText('Kordamise leht on tahvlil.')).toBeInTheDocument();
    expect(onReviewPage).toHaveBeenCalledWith('Kordame:\neelarve — бюджет');
  });

  it('without forgotten words there is nothing to put on the board', async () => {
    render(<LearnerSnapshotCard studentId="s1" repository={repo({ words: vi.fn(async () => []) })} onReviewPage={vi.fn()} />);
    expect(await screen.findByText(/Sõnu veel pole/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pane kordamine tahvlile/ })).toBeNull();
  });
});
