import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PetCard from './PetCard.jsx';
import { careMood, feedingWords, gameRounds, lowestNeed, petNeeds } from './petCare.js';

const NOW = new Date('2026-10-09T12:00:00Z').getTime();
const hoursAgo = (n) => new Date(NOW - n * 3600000).toISOString();
const daysAgo = (n) => hoursAgo(n * 24);
const word = (id, extra = {}) => ({ id, word: `sõna${id}`, translation: `слово${id}`, box: 1, dueAt: daysAgo(1), ...extra });

describe('pet care model', () => {
  it('is full when there is nothing to do: no due words, no open homework, no game', () => {
    expect(petNeeds({ now: NOW })).toMatchObject({ food: 100, energy: 100, joy: 100, canPlay: false });
    const notDue = [word('a', { dueAt: daysAgo(-3) })];
    expect(petNeeds({ words: notDue, now: NOW }).food).toBe(100);
  });

  it('food: three fresh word reviews fill it, it empties in two days', () => {
    const due = [word('x'), word('y'), word('z')];
    expect(petNeeds({ words: due, now: NOW }).food).toBe(0);
    const fed = [...due, word('a', { reviewedAt: hoursAgo(0), dueAt: daysAgo(-1) }), word('b', { reviewedAt: hoursAgo(0), dueAt: daysAgo(-1) }), word('c', { reviewedAt: hoursAgo(0), dueAt: daysAgo(-1) })];
    expect(petNeeds({ words: fed, now: NOW }).food).toBe(100);
    expect(petNeeds({ words: fed, now: NOW + 24 * 3600000 }).food).toBe(50);
    expect(petNeeds({ words: fed, now: NOW + 48 * 3600000 }).food).toBe(0);
  });

  it('energy: open homework drains it from the last finished work (or from when it was given)', () => {
    const homework = [{ status: 'Ootel', createdAt: daysAgo(4) }, { status: 'Tehtud', submittedAt: daysAgo(1) }];
    expect(petNeeds({ homework, now: NOW }).energy).toBe(80);
    expect(petNeeds({ homework: [{ status: 'Ootel', createdAt: daysAgo(5) }], now: NOW }).energy).toBe(0);
    expect(petNeeds({ homework: [{ status: 'Suletud', createdAt: daysAgo(9) }], now: NOW }).energy).toBe(100);
  });

  it('joy: an attended lesson lasts a week, the game two days', () => {
    const words = [word('a'), word('b'), word('c')];
    expect(petNeeds({ words, now: NOW }).joy).toBe(0);
    expect(petNeeds({ words, lessons: [{ date: daysAgo(1).slice(0, 10), status: 'Toimunud' }], now: NOW }).joy).toBeGreaterThan(80);
    expect(petNeeds({ words, lessons: [{ date: daysAgo(1).slice(0, 10), status: 'Puudus_eta' }], now: NOW }).joy).toBe(0);
    expect(petNeeds({ words, playedAt: daysAgo(1), now: NOW }).joy).toBe(50);
  });

  it('a low need makes the pet sad, but proud and asleep win', () => {
    expect(lowestNeed({ food: 10, energy: 5, joy: 90 })).toBe('energy');
    expect(lowestNeed({ food: 30, energy: 25, joy: 90 })).toBe('');
    expect(careMood('happy', { food: 10, energy: 100, joy: 100 })).toBe('sad');
    expect(careMood('proud', { food: 0, energy: 0, joy: 0 })).toBe('proud');
    expect(careMood('sleep', { food: 0, energy: 0, joy: 0 })).toBe('sleep');
  });

  it('feeds with at most three due words and builds a word game with three options', () => {
    expect(feedingWords([word('a'), word('b', { dueAt: daysAgo(-2) }), word('c'), word('d'), word('e')], NOW).map((w) => w.id)).toEqual(['a', 'c', 'd']);
    const rounds = gameRounds([word('a'), word('b'), word('c'), word('d'), word('e', { translation: '' })], () => 0.5);
    expect(rounds).toHaveLength(4);
    rounds.forEach((round) => {
      expect(round.options).toHaveLength(3);
      expect(round.options).toContain(round.answer);
      expect(new Set(round.options).size).toBe(3);
    });
    expect(gameRounds([word('a'), word('b')])).toEqual([]);
  });
});

describe('PetCard care', () => {
  it('a hungry pet asks for words and is fed by repeating them', async () => {
    const words = [word('a'), word('b'), word('c'), word('d')];
    const repository = { get: vi.fn().mockResolvedValue({ kind: 'siil', name: 'Okas' }), update: vi.fn(async ({ current, ...flags }) => ({ ...current, ...flags })) };
    const wordsService = { review: vi.fn().mockResolvedValue({}) };
    const { container } = render(<MemoryRouter><PetCard user={{ uid: 'u1' }} repository={repository} words={words} wordsService={wordsService} lessons={[{ date: new Date().toISOString().slice(0, 10) }]} /></MemoryRouter>);
    expect(await screen.findByText('Mul on kõht tühi. Kordame kolm sõna?')).toBeInTheDocument();
    expect(container.querySelector('svg.pet.m-sad')).not.toBeNull();
    expect(screen.getByRole('meter', { name: 'Kõht' })).toHaveAttribute('aria-valuenow', '0');
    fireEvent.click(screen.getByRole('button', { name: /Toida \(3 sõna\)/ }));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Näita' }));
    fireEvent.click(screen.getByRole('button', { name: 'Teadsin' }));
    await waitFor(() => expect(wordsService.review).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }), true));
  });

  it('the word game cheers the pet up and stores only when it was played', async () => {
    const words = [word('a', { dueAt: '2099-01-01' }), word('b', { dueAt: '2099-01-01' }), word('c', { dueAt: '2099-01-01' })];
    const repository = { get: vi.fn().mockResolvedValue({ kind: 'kakk', name: 'Tark' }), update: vi.fn(async ({ current, ...flags }) => ({ ...current, ...flags })) };
    render(<MemoryRouter><PetCard user={{ uid: 'u1' }} repository={repository} words={words} /></MemoryRouter>);
    expect(await screen.findByText('Mul on igav. Mängime sõnamängu?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toida/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Mängi/ }));
    for (let i = 0; i < 3; i += 1) {
      const options = screen.getByRole('group', { name: 'Vastused' }).querySelectorAll('button');
      fireEvent.click(options[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));
    }
    expect(await screen.findByText(/Mäng läbi!/)).toBeInTheDocument();
    await waitFor(() => expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({ uid: 'u1', playedAt: expect.any(String) })));
    fireEvent.click(screen.getByRole('button', { name: 'Sulge' }));
    expect(await screen.findByRole('meter', { name: 'Rõõm' })).toHaveAttribute('aria-valuenow', '100');
  });

  it('parents and the staff preview see the needs without actions', async () => {
    const repository = { get: vi.fn().mockResolvedValue({ kind: 'siil', name: 'Okas' }) };
    render(<MemoryRouter><PetCard user={{ uid: 'u1' }} readOnly repository={repository} words={[word('a')]} /></MemoryRouter>);
    expect(await screen.findByRole('meter', { name: 'Kõht' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Toida/ })).toBeNull();
  });
});
