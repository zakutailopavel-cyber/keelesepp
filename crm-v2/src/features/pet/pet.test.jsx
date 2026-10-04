import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import PetCard from './PetCard.jsx';
import PetOverview from './PetOverview.jsx';
import { availableStars, buyItem, canBuy, cleanWearing, toggleWear } from './petItems.js';
import { learningStreak, petGreeting, petProgress, validPetName } from './petModel.js';

const NOW = new Date('2026-09-29T12:00:00Z').getTime();
const day = (n) => new Date(NOW - n * 86400000).toISOString();
const done = (daysAgo, perGoal = {}) => ({ status: 'done', completedAt: day(daysAgo), score: { perGoal } });

describe('pet model', () => {
  it('does not count absences or cancelled lessons', () => {
    const p = petProgress({ lessons: [
      { date: day(3).slice(0, 10), status: 'Toimunud' },
      { date: day(4).slice(0, 10), status: 'Puudus_eta' },
      { date: day(5).slice(0, 10), status: 'Puudus_p' },
      { date: day(6).slice(0, 10), status: 'Tühistatud' },
    ], now: NOW });
    expect(p.lessons).toBe(1);
    expect(p.xp).toBe(10);
  });

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

  it('grows from homework done, learned words and a learning streak (capped)', () => {
    const p = petProgress({
      homework: [{ status: 'Tehtud', submittedAt: day(0) }, { status: 'Ootel' }],
      words: [{ box: 3, reviewedAt: day(1) }, { box: 5 }, { box: 1, reviewedAt: day(2) }],
      now: NOW,
    });
    expect(p.homework).toBe(1);
    expect(p.learnedWords).toBe(2);
    expect(p.streak).toBe(3);
    expect(p.xp).toBe(10 + 2 * 2 + 3 * 3);
    expect(p.stars).toBe(Math.floor(p.xp / 5));
    const long = petProgress({ words: Array.from({ length: 20 }, (_, i) => ({ box: 0, reviewedAt: day(i) })), now: NOW });
    expect(long.streak).toBe(20);
    expect(long.xp).toBe(30);
  });

  it('keeps the streak until the day is over and breaks it after a missed day', () => {
    expect(learningStreak([NOW - 86400000, NOW - 2 * 86400000], NOW)).toBe(2);
    expect(learningStreak([NOW - 2 * 86400000], NOW)).toBe(0);
    expect(learningStreak([], NOW)).toBe(0);
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

describe('pet outfits', () => {
  const lessons = Array.from({ length: 3 }, (_, i) => ({ date: day(10 + i).slice(0, 10), status: 'Toimunud' }));

  it('buys with earned stars, puts it on, and keeps the public copy in step', async () => {
    const repository = {
      get: vi.fn().mockResolvedValue({ kind: 'siil', name: 'Okas' }),
      updateOutfit: vi.fn(async ({ current, ...next }) => ({ ...current, ...next })),
      publish: vi.fn().mockResolvedValue(),
    };
    const { container } = render(<PetCard user={{ uid: 'u1' }} studentId="s1" repository={repository} lessons={lessons} />);
    await waitFor(() => expect(repository.publish).toHaveBeenCalledWith({ uid: 'u1', studentId: 's1', pet: { kind: 'siil', name: 'Okas' } }));
    fireEvent.click(await screen.findByRole('button', { name: 'Riidekapp' }));
    const wardrobe = screen.getByRole('region', { name: 'Riidekapp' });
    expect(within(wardrobe).getByText('6 tähte')).toBeInTheDocument();
    expect(within(wardrobe).getByRole('button', { name: 'Osta Kroon (40 tähte)' })).toBeDisabled();
    fireEvent.click(within(wardrobe).getByRole('button', { name: 'Osta Taevas (5 tähte)' }));
    await waitFor(() => expect(repository.updateOutfit).toHaveBeenCalledWith(expect.objectContaining({ owned: ['bg-sky'], wearing: { bg: 'bg-sky' }, spentStars: 5 })));
    expect(await within(wardrobe).findByText('1 tähte')).toBeInTheDocument();
    expect(container.querySelector('.pet-home__art').innerHTML).toContain('#dbeafe');
    await waitFor(() => expect(repository.publish).toHaveBeenLastCalledWith(expect.objectContaining({ pet: expect.objectContaining({ wearing: { bg: 'bg-sky' } }) })));
    fireEvent.click(within(wardrobe).getByRole('button', { name: 'Võta ära: Taevas' }));
    await waitFor(() => expect(repository.updateOutfit).toHaveBeenLastCalledWith(expect.objectContaining({ wearing: {} })));
  });

  it('the item rules: one per slot, no double buying, no buying without stars', () => {
    const progress = { stars: 12 };
    expect(canBuy('crown', progress, {}).reason).toBe('Vaja on veel 28 tähte.');
    const next = buyItem('cap', progress, {});
    expect(next).toEqual({ owned: ['cap'], wearing: { hat: 'cap' }, spentStars: 10 });
    expect(canBuy('cap', progress, next).ok).toBe(false);
    expect(availableStars(progress, next)).toBe(2);
    expect(cleanWearing({ hat: 'bow', glasses: 'round', shoes: 'x' })).toEqual({ glasses: 'round' });
    expect(toggleWear('cap', next)).toEqual({});
    expect(toggleWear('crown', next)).toEqual({ hat: 'cap' });
  });
});

describe('PetOverview (teacher, parent)', () => {
  it('shows the pet from the public copy with streak and stars', async () => {
    const repository = { listForStudents: vi.fn().mockResolvedValue([{ id: 'u1', studentId: 's1', kind: 'rebane', name: 'Rebu', wearing: { hat: 'crown' } }]) };
    const wordsService = { subscribeForStudent: vi.fn((id, onData) => { onData([{ studentId: 's1', box: 4, reviewedAt: new Date().toISOString() }]); return () => {}; }) };
    const { container } = render(<PetOverview studentIds={['s1']} lessons={[]} repository={repository} wordsService={wordsService} />);
    expect(await screen.findByRole('heading', { name: 'Rebu' })).toBeInTheDocument();
    expect(screen.getByText(/1 päev järjest/)).toBeInTheDocument();
    expect(screen.getByText('1 õpitud sõna')).toBeInTheDocument();
    expect(container.innerHTML).toContain('#f5b301');
  });

  it('shows nothing without a pet', async () => {
    const repository = { listForStudents: vi.fn().mockResolvedValue([]) };
    const { container } = render(<PetOverview studentIds={['s1']} repository={repository} wordsService={{ subscribeForStudent: () => () => {} }} />);
    await waitFor(() => expect(repository.listForStudents).toHaveBeenCalled());
    expect(container.textContent).toBe('');
  });
});
