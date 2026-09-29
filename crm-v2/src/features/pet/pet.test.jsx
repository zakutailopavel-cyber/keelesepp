import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PetCard from './PetCard.jsx';
import { petGreeting, petProgress, validPetName } from './petModel.js';

const NOW = new Date('2026-09-29T12:00:00Z').getTime();
const day = (n) => new Date(NOW - n * 86400000).toISOString();
const done = (daysAgo, perGoal = {}) => ({ status: 'done', completedAt: day(daysAgo), score: { perGoal } });

describe('pet model', () => {
  it('grows from lessons, submitted work and reached goals only', () => {
    const lessons = Array.from({ length: 6 }, (_, i) => ({ date: day(10 + i).slice(0, 10), status: 'Toimunud' }));
    const p = petProgress({ lessons: [...lessons, { date: day(1).slice(0, 10), status: 'Tühistatud' }], submissions: [done(20, { g1: { ok: 2, total: 2 }, g2: { ok: 1, total: 3 } }), done(30)], now: NOW });
    expect(p.xp).toBe(6 * 10 + 2 * 15 + 1 * 5);
    expect(p.stage).toBe(1);
    expect(p.stageXp).toBe(95);
    expect(petProgress({ lessons: Array.from({ length: 31 }, () => ({ date: day(20).slice(0, 10) })), now: NOW }).stage).toBe(3);
  });

  it('is proud after a reached goal, happy after recent work, asleep after a long pause, never punished', () => {
    expect(petProgress({ submissions: [done(1, { g1: { ok: 1, total: 1 } })], now: NOW }).mood).toBe('proud');
    expect(petProgress({ lessons: [{ date: day(1).slice(0, 10) }], now: NOW }).mood).toBe('happy');
    expect(petProgress({ lessons: [{ date: day(30).slice(0, 10) }], now: NOW }).mood).toBe('sleep');
    expect(petProgress({ now: NOW }).mood).toBe('calm');
  });

  it('speaks the language being learned, with a Russian hint', () => {
    const progress = petProgress({ now: NOW });
    expect(petGreeting({ petName: 'Okas', progress, subject: 'Eesti keel' })).toMatchObject({ text: 'Tere! Mina olen Okas.', lang: 'et' });
    expect(petGreeting({ petName: 'Okas', progress, lessonToday: '17:00', subject: 'Inglise keel' }).text).toBe('You have a lesson today at 17:00. Ready?');
    expect(petGreeting({ petName: 'Okas', progress, pendingHomework: 2 }).hint).toBe('У тебя 2 домашних заданий. Сделаем?');
    expect(validPetName('')).toMatch(/nimi/);
    expect(validPetName('x'.repeat(25))).toMatch(/24/);
  });
});

describe('PetCard', () => {
  it('lets a student choose and name a pet once, then greets them', async () => {
    const repository = { get: vi.fn().mockResolvedValue(null), save: vi.fn(async ({ kind, name }) => ({ kind, name })), update: vi.fn() };
    const { container } = render(<PetCard user={{ uid: 'u1' }} repository={repository} pendingHomework={1} subject="Eesti keel" />);
    expect(await screen.findByText('Vali endale sõber')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Kakk/ }));
    expect(screen.getByLabelText('Nimi')).toHaveValue('Kakk');
    fireEvent.change(screen.getByLabelText('Nimi'), { target: { value: 'Tark' } });
    fireEvent.click(screen.getByRole('button', { name: 'Vali Kakk' }));
    await waitFor(() => expect(repository.save).toHaveBeenCalledWith({ uid: 'u1', current: null, kind: 'kakk', name: 'Tark' }));
    expect(await screen.findByText('Sul on üks kodutöö. Teeme ära?')).toBeInTheDocument();
    expect(screen.getByText('Tark')).toBeInTheDocument();
    expect(container.querySelector('svg.pet')).not.toBeNull();
    expect(screen.getByText('0 tundi · 0 tööd · 0 eesmärki')).toBeInTheDocument();
  });

  it('shows nothing in staff preview when the student has no pet yet', async () => {
    const repository = { get: vi.fn().mockResolvedValue(null), save: vi.fn() };
    const { container } = render(<PetCard user={{ uid: 'staff' }} readOnly repository={repository} />);
    await waitFor(() => expect(repository.get).toHaveBeenCalled());
    expect(container.textContent).toBe('');
  });

  it('lets a student say no thanks, and then stays away', async () => {
    const repository = { get: vi.fn().mockResolvedValue(null), save: vi.fn(), update: vi.fn(async ({ current, ...flags }) => ({ ...(current || {}), ...flags })) };
    const { container } = render(<PetCard user={{ uid: 'u1' }} repository={repository} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Ei, aitäh' }));
    await waitFor(() => expect(repository.update).toHaveBeenCalledWith({ uid: 'u1', current: null, optedOut: true }));
    await waitFor(() => expect(container.textContent).toBe(''));
  });
});
