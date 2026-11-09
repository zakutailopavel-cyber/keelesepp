import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import FlashcardSession from './FlashcardSession.jsx';
import { onPractice } from '../practice/events.js';
import { exampleFor, formatWhen, formRows, meaningFor, posLabel } from './cardFace.js';

const NOW = new Date('2026-11-09T10:00:00Z');
const card = (id, front, back, extra = {}) => ({ id, key: `${id}:r`, dir: 'r', front, back, hint: '', side: null, ...extra });
const deck = () => [
  card('1', 'tegema', 'делать', { word: { id: '1', example: 'Mida sa täna teed?' } }),
  card('2', 'kass', 'кошка'),
];
const dictionary = { tegema: ['tegema', 'teha', 'teeb'], kass: ['kass', 'kassi', 'kassi'] };
const noVoice = { getVoices: () => [], addEventListener: vi.fn(), removeEventListener: vi.fn() };

// jsdom has no PointerEvent: a MouseEvent with a pointerId carries the coordinates
if (typeof globalThis.PointerEvent === 'undefined') {
  globalThis.PointerEvent = class PointerEvent extends globalThis.MouseEvent {
    constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; }
  };
}

function setup(props = {}) {
  const onRate = vi.fn();
  let clock = NOW.getTime();
  const now = () => new Date(clock);
  const utils = render(<FlashcardSession cards={deck()} dictionary={dictionary} language="ru" onRate={onRate} now={now} synth={noVoice} {...props} />);
  return { ...utils, onRate, tick: (minutes) => { clock += minutes * 60000; } };
}
const theCard = () => screen.getByRole('button', { name: /^(Küsimus|Vastus):/ });
const swipe = (dx, dy) => {
  const el = theCard();
  fireEvent.pointerDown(el, { clientX: 100, clientY: 300, pointerId: 1 });
  fireEvent.pointerMove(el, { clientX: 100 + dx / 2, clientY: 300 + dy / 2, pointerId: 1 });
  fireEvent.pointerMove(el, { clientX: 100 + dx, clientY: 300 + dy, pointerId: 1 });
  fireEvent.pointerUp(el, { clientX: 100 + dx, clientY: 300 + dy, pointerId: 1 });
};

describe('FlashcardSession', () => {
  it('turns the card on tap and Space; the back shows meaning, forms, example and part of speech', () => {
    setup();
    expect(theCard()).toHaveAttribute('aria-label', 'Küsimus: tegema. Vajuta, et pöörata');
    expect(screen.getAllByText('tegusõna').length).toBeGreaterThan(0);
    expect(screen.queryByRole('group', { name: 'Kui hästi sa teadsid?' })).toBeNull();
    fireEvent.click(theCard());
    expect(theCard()).toHaveAttribute('aria-label', 'Vastus: делать');
    const forms = screen.getByLabelText('Põhivormid');
    expect(within(forms).getByText('da-vorm')).toBeInTheDocument();
    expect(within(forms).getByText('teha')).toBeInTheDocument();
    expect(screen.getByText('Mida sa täna teed?')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: ' ' });
    expect(theCard()).toHaveAttribute('aria-pressed', 'false');
    fireEvent.keyDown(window, { key: ' ' });
    expect(theCard()).toHaveAttribute('aria-pressed', 'true');
  });

  it('keys 1–4 rate only after the answer is shown; the buttons tell the next interval', () => {
    const { onRate } = setup();
    fireEvent.keyDown(window, { key: '3' });
    expect(onRate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Näita vastust' }));
    expect(screen.getByRole('button', { name: 'Uuesti (1 min)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hea (10 min)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Lihtne \(\d+ p\)$/ })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: '3' });
    expect(onRate).toHaveBeenCalledWith(expect.objectContaining({ key: '1:r' }), 'good', expect.objectContaining({ state: 'learning', step: 1 }));
    expect(theCard()).toHaveAttribute('aria-label', 'Küsimus: kass. Vajuta, et pöörata');
  });

  it('swipes: the first swipe shows the answer, then right = Hea, left = Uuesti, up = Lihtne', () => {
    const { onRate } = setup();
    swipe(150, 0);
    expect(onRate).not.toHaveBeenCalled();
    expect(theCard()).toHaveAttribute('aria-pressed', 'true');
    swipe(150, 0);
    expect(onRate).toHaveBeenLastCalledWith(expect.objectContaining({ key: '1:r' }), 'good', expect.anything());
    fireEvent.click(screen.getByRole('button', { name: 'Näita vastust' }));
    swipe(-150, 10);
    expect(onRate).toHaveBeenLastCalledWith(expect.objectContaining({ key: '2:r' }), 'again', expect.anything());
    fireEvent.click(screen.getByRole('button', { name: 'Näita vastust' }));
    swipe(10, -160);
    expect(onRate).toHaveBeenLastCalledWith(expect.anything(), 'easy', expect.objectContaining({ state: 'review' }));
    // a short drag is neither a tap nor a rating
    const before = onRate.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Näita vastust' }));
    swipe(30, 0);
    expect(onRate.mock.calls.length).toBe(before);
  });

  it('an „Uuesti” card comes back; the end screen is honest and announces the practice', () => {
    const events = [];
    const stop = onPractice((event) => events.push(event));
    const { tick } = setup();
    const answer = (name) => { fireEvent.click(screen.getByRole('button', { name: 'Näita vastust' })); fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}`) })); };
    answer('Uuesti'); // tegema → 1 min
    answer('Lihtne'); // kass → done
    tick(1);
    expect(theCard()).toHaveAttribute('aria-label', 'Küsimus: tegema. Vajuta, et pöörata');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    answer('Lihtne');
    const done = screen.getByRole('status');
    expect(within(done).getByText('50%')).toBeInTheDocument();
    expect(within(done).getByText('Esimesel korral õigesti').nextSibling).toHaveTextContent('1/2');
    expect(within(done).getByText('Uusi sõnu õpitud').nextSibling).toHaveTextContent('2');
    expect(within(done).getByText(/Järgmine kordamine/)).toBeInTheDocument();
    expect(within(done).getByLabelText('Raskemad sõnad')).toHaveTextContent('tegema — делать');
    expect(events).toEqual([expect.objectContaining({ kind: 'words', reviewed: 3, correct: 2, cards: 2, learned: 2 })]);
    stop();
    fireEvent.click(screen.getByRole('button', { name: /Korda raskemaid/ }));
    expect(theCard()).toHaveAttribute('aria-label', 'Küsimus: tegema. Vajuta, et pöörata');
  });

  it('meaning → Estonian asks the meaning and answers with the word', () => {
    setup({ cards: [card('2', 'kass', 'кошка', { key: '2:p', dir: 'p' })] });
    expect(theCard()).toHaveAttribute('aria-label', 'Küsimus: кошка. Vajuta, et pöörata');
    expect(screen.getByText('Kuidas on see eesti keeles?')).toBeInTheDocument();
    fireEvent.click(theCard());
    expect(theCard()).toHaveAttribute('aria-label', 'Vastus: kass');
  });

  it('audio: hidden without an Estonian voice; with one it speaks et-EE', () => {
    const { unmount } = setup();
    expect(screen.queryByRole('button', { name: /Kuula/ })).toBeNull();
    unmount();
    const spoken = [];
    globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    const synth = { getVoices: () => [{ lang: 'en-US' }, { lang: 'et-EE', name: 'Anu' }], speak: (u) => spoken.push(u), cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
    setup({ synth });
    fireEvent.click(screen.getAllByRole('button', { name: 'Kuula: tegema' })[0]);
    expect(spoken).toEqual([expect.objectContaining({ text: 'tegema', lang: 'et-EE', voice: expect.objectContaining({ name: 'Anu' }) })]);
    expect(theCard()).toHaveAttribute('aria-pressed', 'false'); // the sound button does not turn the card
    delete globalThis.SpeechSynthesisUtterance;
  });

  it('respects prefers-reduced-motion (no flying card)', () => {
    const original = globalThis.matchMedia;
    globalThis.matchMedia = (query) => ({ matches: query.includes('reduce'), addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { container } = setup();
    expect(theCard()).toHaveClass('is-still');
    fireEvent.click(theCard());
    act(() => { fireEvent.keyDown(window, { key: '4' }); });
    expect(container.querySelector('.fc-ghost')).toBeNull();
    globalThis.matchMedia = original;
  });
});

describe('cardFace', () => {
  it('names forms, parts of speech and the time of the next review', () => {
    expect(formRows({ front: 'kass', word: { formItems: [{ code: 'PlP', label: 'mitmuse osastav', value: 'kasse' }, { code: 'SgG', label: 'ainsuse omastav', value: 'kassi' }] } }, dictionary))
      .toEqual([{ label: 'nimetav', value: 'kass' }, { label: 'omastav', value: 'kassi' }, { label: 'osastav', value: 'kassi' }, { label: 'mitmuse osastav', value: 'kasse' }]);
    expect(posLabel({ front: 'tere hommikust' })).toBe('väljend');
    expect(posLabel({ front: 'x', pos: 'noun' })).toBe('nimisõna');
    expect(posLabel({ front: 'kass' }, dictionary)).toBe('käändsõna');
    expect(posLabel({ front: 'zzz' })).toBe('');
    expect(meaningFor({ back: 'кошка', meanings: { en: 'cat' } }, 'en')).toBe('cat');
    expect(meaningFor({ back: 'кошка' }, 'en')).toBe('кошка');
    expect(exampleFor({ front: 'a', example: 'a' })).toBe('');
    const now = new Date(2026, 10, 9, 10, 0);
    expect(formatWhen(new Date(2026, 10, 9, 10, 10).toISOString(), now)).toBe('10 min pärast');
    expect(formatWhen(new Date(2026, 10, 9, 18, 5).toISOString(), now)).toBe('täna kell 18:05');
    expect(formatWhen(new Date(2026, 10, 10, 9, 0).toISOString(), now)).toBe('homme');
    expect(formatWhen('', now)).toBe('');
  });
});
