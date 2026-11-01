import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PetLoop from './PetLoop.jsx';
import { PET_QUIET_EVENT } from './petEvents.js';

const ago = (days) => new Date(Date.now() - days * 86400000).toISOString();
const word = (id, extra = {}) => ({ id, word: id, translation: `t-${id}`, box: 1, reviews: 2, dueAt: ago(1), reviewedAt: ago(4), ...extra });
const repository = (extra = {}) => ({
  update: vi.fn(async ({ current, ...flags }) => ({ ...current, ...flags })),
  updateOutfit: vi.fn(async ({ current, ...next }) => ({ ...current, ...next })),
  publish: vi.fn().mockResolvedValue(), lessonStats: vi.fn().mockResolvedValue([]), ...extra,
});
const user = { uid: 'u1' };
const pet = { kind: 'siil', name: 'Okki', playedAt: ago(5) };

// the words live on the page, as with the real subscription
function Page({ start, words: wordsProp, ...rest }) {
  const [words, setWords] = useState(wordsProp);
  const wordsService = { review: vi.fn(async (card) => { setWords((list) => list.map((w) => (w.id === card.id ? { ...w, reviewedAt: new Date().toISOString(), dueAt: ago(-3) } : w))); }) };
  return <MemoryRouter><PetLoop user={user} studentId="s1" pet={start} words={words} wordsService={wordsService} assignments={[]} {...rest} /></MemoryRouter>;
}

describe('PetLoop', () => {
  beforeEach(() => { window.localStorage.clear?.(); });

  it('one bubble, one button; one tap plays on the page; the pet is thankful and does not ask again today', async () => {
    window.localStorage.setItem('ks-pet-loop-seen-u1', String(Date.now() - 3600000));
    const repo = repository();
    const quiet = [];
    window.addEventListener(PET_QUIET_EVENT, (event) => quiet.push(event.detail));
    render(<Page start={pet} words={[word('a'), word('b'), word('c')]} repository={repo} />);
    expect(screen.getByText(/Mul on kõht tühi\. Kas mäletad sõna/)).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Kõht' })).toHaveAttribute('aria-valuenow', '0');
    fireEvent.click(screen.getByRole('button', { name: /Kordame 3 sõna/ }));
    expect(quiet).toEqual([true]);
    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(await screen.findByRole('button', { name: 'Näita' }));
      fireEvent.click(screen.getByRole('button', { name: 'Teadsin' }));
    }
    expect(await screen.findByText('Aitäh! Nüüd on kõht täis.')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Kõht' })).toHaveAttribute('aria-valuenow', '100');
    expect(screen.queryByRole('button', { name: /Kordame/ })).toBeNull();
    await waitFor(() => expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ playedAt: expect.any(String) })));
    expect(quiet).toEqual([true, false]);
  });

  it('after today is done: content, no request, and a surprise from his data', () => {
    render(<Page start={{ ...pet, playedAt: new Date().toISOString() }} words={[word('koer', { box: 3, reviewedAt: ago(1), dueAt: ago(-3) })]} repository={repository()} />);
    expect(screen.getByText('Täna on mul kõik hästi. Aitäh!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Kordame|Mängime|Parandame/ })).toBeNull();
    expect(screen.getByText(/Sõna „koer”/)).toBeInTheDocument();
  });

  it('after days away it is glad, without counting them or shaming', () => {
    window.localStorage.setItem('ks-pet-loop-seen-u1', String(Date.now() - 20 * 86400000));
    const { container } = render(<Page start={pet} words={[word('a'), word('b'), word('c')].map((w) => ({ ...w, reviewedAt: ago(20) }))} repository={repository()} lessons={[]} />);
    expect(screen.getByText(/^Tore, et sa tagasi oled! Kas mäletad sõna/)).toBeInTheDocument();
    expect(screen.queryByText(/kõht tühi/)).toBeNull();
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
