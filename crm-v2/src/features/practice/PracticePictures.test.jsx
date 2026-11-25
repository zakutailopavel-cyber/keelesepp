import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import PracticeLesson from './PracticeLesson.jsx';
import { pictureItem, pictureOf } from './engine/pictures.js';

const entry = (word, meaning = '') => ({ ...pictureOf(word), meaning, wordId: '' });
const feedbackStatus = () => screen.getAllByRole('status').find((el) => el.classList.contains('pr-feedback'));

describe('picture items in the lesson', () => {
  it('„Mis on pildil?”: the picture, 4 words; after the answer the picture, word and meaning with a play button', () => {
    const item = pictureItem(entry('leib', 'хлеб'), { seed: 1 });
    const { container } = render(<PracticeLesson items={[item]} lang="ru" onExit={() => {}} />);
    expect(screen.getByText('Mis on pildil?')).toBeInTheDocument();
    expect(container.querySelector('.pr-picture img')).toHaveAttribute('src', '/textbook-art/words/a2/leib.webp');
    // the picture's text does not give the word away
    expect(container.querySelector('.pr-picture img').getAttribute('alt')).not.toMatch(/leib/);
    const options = within(screen.getByRole('radiogroup', { name: 'Vali vastus' })).getAllByRole('radio');
    expect(options).toHaveLength(4);
    fireEvent.click(screen.getByRole('radio', { name: /leib/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    const status = feedbackStatus();
    expect(status).toHaveTextContent('Õige!');
    expect(status).toHaveTextContent('leib');
    expect(status).toHaveTextContent('хлеб');
    expect(within(status).getByRole('button', { name: 'Kuula: leib' })).toBeInTheDocument();
  });

  it('typed: the field asks for the word; a wrong answer shows the right word with its picture', () => {
    const item = pictureItem(entry('köök'), { input: 'type' });
    render(<PracticeLesson items={[item]} lang="ru" onExit={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Mis sõna see on?' }), { target: { value: 'tuba' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    expect(feedbackStatus()).toHaveTextContent('Õige vastus:');
    expect(feedbackStatus()).toHaveTextContent('köök');
  });

  it('„Kuula ja vali pilt”: a play button and 4 pictures without their words; after the answer the words show', () => {
    const item = pictureItem(entry('kohv', 'кофе'), { kind: 'hear', seed: 2 });
    render(<PracticeLesson items={[item]} lang="ru" onExit={() => {}} />);
    expect(screen.getByText('Kuula ja vali pilt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kuula sõna' })).toBeInTheDocument();
    const group = screen.getByRole('radiogroup', { name: 'Vali pilt' });
    const pics = within(group).getAllByRole('radio');
    expect(pics).toHaveLength(4);
    expect(group).not.toHaveTextContent('kohv');
    const right = item.choices.findIndex((pic) => pic.word === 'kohv');
    const wrong = right === 0 ? 1 : 0;
    // number keys pick a picture too
    fireEvent.keyDown(window, { key: String(wrong + 1) });
    expect(pics[wrong]).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    expect(feedbackStatus()).toHaveTextContent('кофе');
    expect(within(group).getByRole('radio', { name: `Pilt ${right + 1}: kohv` })).toHaveClass('is-right');
    expect(within(group).getAllByRole('radio')[wrong]).toHaveClass('is-wrong');
  });

  it('a sentence item of a lesson with art shows the scene picture', () => {
    const form = { id: 'f', type: 'form', before: 'Ma ostan', after: '.', base: 'leib', answers: ['leiba'], options: ['leiba', 'leib'], grammar: [], scene: { src: '/textbook-art/a2/a2-026/x.webp', alt: 'Pood' } };
    render(<PracticeLesson items={[form]} lang="ru" onExit={() => {}} />);
    expect(screen.getByRole('img', { name: 'Pood' })).toHaveAttribute('src', '/textbook-art/a2/a2-026/x.webp');
  });
});
