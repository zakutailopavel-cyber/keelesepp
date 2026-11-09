import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PetLoop from './PetLoop.jsx';

const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
const word = (id, extra = {}) => ({ id, word: id, translation: `t-${id}`, box: 1, reviews: 2, dueAt: ago(1), reviewedAt: ago(4), ...extra });
const repository = (extra = {}) => ({
  update: vi.fn(async ({ current, ...flags }) => ({ ...current, ...flags })),
  updateOutfit: vi.fn(async ({ current, ...next }) => ({ ...current, ...next })),
  publish: vi.fn().mockResolvedValue(), lessonStats: vi.fn().mockResolvedValue([]), ...extra,
});
const user = { uid: 'u1' };
const pet = { kind: 'siil', name: 'Okki', playedAt: ago(5) };

function Page({ start, words: wordsProp, ...rest }) {
  const [words] = useState(wordsProp);
  return <MemoryRouter><PetLoop user={user} studentId="s1" pet={start} words={words} assignments={[]} {...rest} /></MemoryRouter>;
}

describe('PetLoop', () => {
  beforeEach(() => { window.localStorage.clear?.(); });

  it('asks for nothing (owner 2026-11-09: „Täna” decides): no request button, no need bar; ready → „Alustame?”', () => {
    window.localStorage.setItem('ks-pet-loop-seen-u1', String(Date.now() - 3600000));
    render(<Page start={pet} words={[word('a'), word('b'), word('c')]} repository={repository()} ready />);
    expect(screen.getByText('Alustame? Mina olen kohe siin.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Kordame|Mängime|Parandame/ })).toBeNull();
    expect(screen.queryByRole('meter', { name: 'Kõht' })).toBeNull();
  });

  it('reacts after a step of „Täna”, thanks at the end with a surprise from his data, shows the streak', () => {
    const { rerender } = render(<Page start={pet} words={[word('koer', { box: 3, reviewedAt: ago(1), dueAt: ago(-3) })]} repository={repository()} reaction="words" streak={3} />);
    expect(screen.getByRole('status')).toHaveTextContent('Aitäh! Sõnad on korratud.');
    expect(screen.getByText(/3 päeva/)).toBeInTheDocument();
    rerender(<Page start={pet} words={[word('koer', { box: 3, reviewedAt: ago(1), dueAt: ago(-3) })]} repository={repository()} reaction="finished" streak={3} />);
    expect(screen.getByText('Aitäh! Täna on kõik tehtud. Olen sinu üle uhke!')).toBeInTheDocument();
    expect(screen.getByText(/Sõna „koer”/)).toBeInTheDocument();
  });

  it('the level counts the practice XP of „Täna”', () => {
    render(<Page start={pet} words={[]} repository={repository()} practiceXp={25} />);
    expect(screen.getByText('3. tase')).toBeInTheDocument();
  });

  it('after days away it is glad, without counting them or shaming', () => {
    window.localStorage.setItem('ks-pet-loop-seen-u1', String(Date.now() - 20 * 86400000));
    const { container } = render(<Page start={pet} words={[word('a'), word('b'), word('c')].map((w) => ({ ...w, reviewedAt: ago(20) }))} repository={repository()} lessons={[]} />);
    expect(screen.getByText('Tore, et sa tagasi oled!')).toBeInTheDocument();
    expect(container.querySelector('svg.pet.m-happy')).not.toBeNull();
    expect(container.querySelector('svg.pet.m-sad')).toBeNull();
    expect(container.textContent).not.toMatch(/20|päeva/);
  });

  it('a reward he has reached takes one tap, with earned stars, and the public copy follows', async () => {
    const repo = repository();
    const lessons = Array.from({ length: 3 }, (_, i) => ({ date: ago(10 + i * 2).slice(0, 10), status: 'Toimunud' }));
    render(<Page start={pet} words={[]} repository={repo} lessons={lessons} />);
    expect(screen.getByText('Taevas on valmis!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pane selga' }));
    await waitFor(() => expect(repo.updateOutfit).toHaveBeenCalledWith(expect.objectContaining({ owned: ['bg-sky'], spentStars: 5 })));
    expect(await screen.findByText(/→ Lill/)).toBeInTheDocument();
    await waitFor(() => expect(repo.publish).toHaveBeenLastCalledWith(expect.objectContaining({ pet: expect.objectContaining({ wearing: { bg: 'bg-sky' } }) })));
  });

  it('shows a new level once', () => {
    window.localStorage.setItem('ks-pet-growth-u1', JSON.stringify({ stage: 1, level: 1, ready: '' }));
    const lessons = [{ date: ago(10).slice(0, 10), status: 'Toimunud' }];
    const first = render(<Page start={pet} words={[]} repository={repository()} lessons={lessons} />);
    expect(screen.getByText(/Okki jõudis 2\. tasemele!/)).toBeInTheDocument();
    first.unmount();
    render(<Page start={pet} words={[]} repository={repository()} lessons={lessons} />);
    expect(screen.queryByText(/jõudis/)).toBeNull();
  });

  it('staff see the same pet with no actions and nothing written; an opted-out learner has no pet at all', () => {
    const repo = repository({ lessonStatsForStudents: vi.fn().mockResolvedValue([]) });
    const { unmount } = render(<Page start={pet} words={[word('a'), word('b'), word('c')]} repository={repo} readOnly />);
    expect(screen.getByText('Okki')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    expect(repo.publish).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('ks-pet-growth-u1')).toBeNull();
    unmount();
    const { container } = render(<Page start={{ ...pet, optedOut: true }} words={[]} repository={repository()} />);
    expect(container.textContent).toBe('');
  });
});

describe('PetGames quick start', () => {
  it('opens the game at once, without the menu', async () => {
    const { default: PetGames } = await import('./PetGames.jsx');
    const topic = { id: 't', title: 'Minu pere', games: ['truth', 'pairs'], items: { pairs: [{ left: 'a', right: 'b' }, { left: 'c', right: 'd' }, { left: 'e', right: 'f' }], truth: [] } };
    render(<PetGames quick topics={[topic]} kind="siil" onClose={() => {}} />);
    expect(screen.getByLabelText('Paarid')).toBeInTheDocument();
    expect(screen.queryByText('Mängime sinu teemadega!')).toBeNull();
  });
});
