import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import PracticeLesson from './PracticeLesson.jsx';
import SentenceBuilder from './SentenceBuilder.jsx';
import { onPractice } from './events.js';

const build = {
  id: 'b', type: 'build', tiles: ['Kuna', 'päeval', 'pole', 'aega', 'õpib', 'Anna', 'õhtul'], shown: ['õpib', 'Kuna', 'Anna', 'päeval', 'õhtul', 'pole', 'aega'],
  orders: [['Kuna', 'päeval', 'pole', 'aega', 'õpib', 'Anna', 'õhtul']], answers: ['Kuna päeval pole aega, õpib Anna õhtul.'], grammar: ['word-order'],
  explain: { et: 'Pärast kuna-osa tuleb tegusõna.' },
};
const form = { id: 'f', type: 'form', before: 'Markus puudus kolmest', after: '.', base: 'tund', answers: ['tunnist'], options: null, grammar: ['government'], explain: { et: 'Puuduma nõuab seestütlevat.' } };
const choice = { id: 'c', type: 'connector', before: 'Ta õppis öösel,', after: 'oli ta väsinud.', answers: ['seepärast'], options: ['seepärast', 'sest', 'kuna'], grammar: ['connectors'], explain: { et: '' } };

// the drag-and-drop live region (dnd-kit) is a status region too
const feedbackStatus = () => screen.getAllByRole('status').find((el) => el.classList.contains('pr-feedback'));
const tile = (name) => within(screen.getByRole('group', { name: 'Sõnad' })).getByRole('button', { name });

describe('SentenceBuilder', () => {
  it('puts tiles in the line, takes them back, Backspace removes the last', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SentenceBuilder tiles={['Ma', 'tulen', 'koju']} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'tulen' }));
    expect(onChange).toHaveBeenLastCalledWith([1]);
    rerender(<SentenceBuilder tiles={['Ma', 'tulen', 'koju']} value={[1, 0]} onChange={onChange} />);
    const line = screen.getByRole('group', { name: 'Sinu lause' });
    fireEvent.click(within(line).getByRole('button', { name: 'tulen — võta tagasi' }));
    expect(onChange).toHaveBeenLastCalledWith([0]);
    fireEvent.keyDown(line, { key: 'Backspace' });
    expect(onChange).toHaveBeenLastCalledWith([1]);
    // a used tile leaves the tab order
    expect(within(screen.getByRole('group', { name: 'Sõnad' })).getAllByRole('button', { hidden: true })[1]).toHaveAttribute('tabindex', '-1');
  });
});

describe('PracticeLesson', () => {
  it('builds a sentence from tiles, shows the rule on a wrong answer, retries it at the end and announces the result', () => {
    const seen = [];
    const off = onPractice((d) => seen.push(d));
    let t = 0;
    render(<PracticeLesson items={[build, form, choice]} lang="ru" now={() => { t += 60000; return t; }} onExit={() => {}} />);

    // 1: wrong order (English-like: Anna õpib)
    expect(screen.getByRole('button', { name: 'Kontrolli' })).toBeDisabled();
    ['Kuna', 'päeval', 'pole', 'aega', 'Anna', 'õpib', 'õhtul'].forEach((w) => fireEvent.click(tile(w)));
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    const status = feedbackStatus();
    expect(status).toHaveTextContent('Õige vastus:');
    expect(status).toHaveTextContent('Kuna päeval pole aega, õpib Anna õhtul.');
    expect(status).toHaveTextContent('Pärast kuna-osa tuleb tegusõna.');
    expect(status).toHaveTextContent('порядок слов');
    expect(screen.getByRole('button', { name: 'Edasi' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));

    // 2: typed form without ä/õ… is right here; Enter checks
    const input = screen.getByRole('textbox', { name: 'Sinu vastus' });
    fireEvent.change(input, { target: { value: 'tunnist' } });
    expect(screen.getByLabelText('lünk: tunnist')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(feedbackStatus()).toHaveTextContent('Õige!');
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));

    // 3: options with the number key
    act(() => { fireEvent.keyDown(window, { key: '1' }); });
    expect(screen.getByRole('radio', { name: /seepärast/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));

    // retry round: the word-order item again
    expect(screen.getByText(/Kordame vigu/)).toBeInTheDocument();
    ['Kuna', 'päeval', 'pole', 'aega', 'õpib', 'Anna', 'õhtul'].forEach((w) => fireEvent.click(tile(w)));
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    expect(feedbackStatus()).toHaveTextContent('Õige!');
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));

    expect(screen.getByRole('region', { name: 'Tulemus' })).toHaveTextContent('2 / 3');
    expect(screen.getByText('Parandatud kordamisel').nextSibling).toHaveTextContent('1 / 1');
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ kind: 'grammar', items: 3, correct: 2, grammarPoints: ['word-order', 'government', 'connectors'] });
    expect(seen[0].minutes).toBeGreaterThan(0);
    off();
  });

  it('typing without the Estonian letters is „almost”, with the hint and the letters to fix', () => {
    const item = { ...form, id: 'g', before: 'Ma tulen', after: 'koju.', base: 'täna', answers: ['täna'] };
    render(<PracticeLesson items={[item]} lang="en" />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Sinu vastus' }), { target: { value: 'tana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    const status = feedbackStatus();
    expect(status).toHaveTextContent('Peaaegu!');
    expect(status).toHaveTextContent('Check the letters õ, ä, ö, ü.');
    expect(status).toHaveTextContent('(ä)');
  });

  it('the letter buttons type õ ä ö ü into the answer', () => {
    render(<PracticeLesson items={[form]} lang="et" />);
    const input = screen.getByRole('textbox', { name: 'Sinu vastus' });
    fireEvent.change(input, { target: { value: 'k' } });
    input.setSelectionRange(1, 1);
    fireEvent.click(screen.getByRole('button', { name: 'Lisa täht õ' }));
    expect(input).toHaveValue('kõ');
  });
});
