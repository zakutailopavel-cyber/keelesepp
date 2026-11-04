/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ANSWER_FONTS, ANSWER_FONT_KEY, DEFAULT_ANSWER_FONT, answerFontClass, readAnswerFont, saveAnswerFont } from './answerFont.js';
import AnswerFontMenu from './AnswerFontMenu.jsx';
import Sheet from './engine/Sheet.jsx';
import { createBlock } from './engine/registry.js';
import { sampleDocument } from './engine/sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const memoryStorage = () => {
  const data = new Map();
  return { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k), data };
};
const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };

afterEach(() => { saveAnswerFont(DEFAULT_ANSWER_FONT); globalThis.localStorage?.clear(); });

describe('answer font preference („Kiri”)', () => {
  it('offers a plain default, handwriting, a serif and a large size', () => {
    expect(DEFAULT_ANSWER_FONT).toBe('plain');
    expect(ANSWER_FONTS.map((f) => f.key)).toEqual(['plain', 'hand', 'serif', 'large']);
    expect(ANSWER_FONTS.map((f) => f.label)).toEqual(['Tavaline', 'Käekiri', 'Raamatukiri', 'Suur']);
  });

  it('is plain when nothing is stored, the stored value is unknown or storage is blocked', () => {
    const store = memoryStorage();
    expect(readAnswerFont(store)).toBe('plain');
    store.setItem(ANSWER_FONT_KEY, 'comic');
    expect(readAnswerFont(store)).toBe('plain');
    expect(readAnswerFont(broken)).toBe('plain');
    expect(readAnswerFont(null)).toBe('plain');
  });

  it('remembers a choice on the device and forgets it when the default is picked again', () => {
    const store = memoryStorage();
    expect(saveAnswerFont('hand', store)).toBe('hand');
    expect(store.getItem(ANSWER_FONT_KEY)).toBe('hand');
    expect(readAnswerFont(store)).toBe('hand');
    expect(saveAnswerFont('plain', store)).toBe('plain');
    expect(store.data.has(ANSWER_FONT_KEY)).toBe(false);
    expect(saveAnswerFont('nonsense', store)).toBe('plain');
  });

  it('does not throw when storage is blocked', () => {
    expect(() => saveAnswerFont('serif', broken)).not.toThrow();
    expect(saveAnswerFont('serif', broken)).toBe('serif');
  });

  it('maps a choice to the sheet class, unknown keys to the plain one', () => {
    expect(answerFontClass('hand')).toBe('ans-hand');
    expect(answerFontClass(undefined)).toBe('ans-plain');
    expect(answerFontClass('x')).toBe('ans-plain');
  });
});

describe('answers on the sheet', () => {
  const doc = () => ({ ...sampleDocument(), blocks: [createBlock('writing')] });

  it('are shown in the plain font by default', () => {
    const { container } = render(<Sheet doc={doc()} mode="interactive" />);
    const root = container.querySelector('.ws-root');
    expect(root).toHaveClass('ans-plain');
    expect(root).not.toHaveClass('ans-hand');
  });

  it('follow the viewer’s choice from the „Aa” menu at once, on every open sheet', () => {
    const { container } = render(<><AnswerFontMenu /><Sheet doc={doc()} mode="review" /></>);
    fireEvent.click(screen.getByRole('button', { name: /Vastuste kiri: Tavaline/ }));
    act(() => { fireEvent.click(screen.getByRole('radio', { name: /Käekiri/ })); });
    expect(container.querySelector('.ws-root')).toHaveClass('ans-hand');
    expect(globalThis.localStorage.getItem(ANSWER_FONT_KEY)).toBe('hand');
    expect(screen.getByRole('button', { name: /Vastuste kiri: Käekiri/ })).toBeInTheDocument();
  });

  it('use the answer font variables in the sheet styles, plain by default (not the handwriting font)', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/features/worksheet-studio/engine/sheet.css'), 'utf8');
    const root = css.match(/\n\.ws-root \{[^}]*\}/)[0];
    expect(root).toMatch(/--ans-font: var\(--font-body\)/);
    for (const sel of ['.ws-line {', '.ws-ruled {', '.ws-cat-item {']) {
      const rule = css.slice(css.indexOf(`\n${sel}`), css.indexOf('}', css.indexOf(`\n${sel}`)));
      expect(rule, sel).toMatch(/var\(--ans-font\)/);
      expect(rule, sel).not.toMatch(/--font-hand/);
    }
    // the ruled writing lines keep their 7.4 mm step for every choice
    expect(css).toMatch(/\.ws-ruled \{[^}]*\/7\.4mm var\(--ans-font\)/);
    expect(css).toMatch(/\.ws-root\.ans-hand \{[^}]*--ans-font: var\(--font-hand\)/);
  });
});
