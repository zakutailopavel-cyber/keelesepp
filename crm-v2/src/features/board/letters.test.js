import { describe, expect, it } from 'vitest';
import { LETTERS, barSpot, insertLetter, isLetterField, lettersHidden, rememberLettersHidden, spliceText, upper } from './letters.js';

describe('spliceText: a letter at the caret', () => {
  it('goes in at the caret, over a selection, or at the end', () => {
    expect(spliceText('ma lhen', 4, 4, 'ä')).toEqual({ value: 'ma lähen', caret: 5, inserted: true });
    expect(spliceText('tere XX', 5, 7, 'õ')).toEqual({ value: 'tere õ', caret: 6, inserted: true });
    expect(spliceText('sk', null, null, 'õ')).toEqual({ value: 'skõ', caret: 3, inserted: true });
    expect(spliceText('', 0, 0, 'ü')).toEqual({ value: 'ü', caret: 1, inserted: true });
  });
  it('keeps maxLength', () => {
    expect(spliceText('abc', 3, 3, 'ö', 3)).toEqual({ value: 'abc', caret: 3, inserted: false });
    expect(spliceText('abc', 1, 2, 'ö', 3)).toEqual({ value: 'aöc', caret: 2, inserted: true });
  });
  it('odd positions are clamped', () => {
    expect(spliceText('ab', 9, 1, 'š').value).toBe('abš');
    expect(spliceText('ab', -3, -1, 'ž').value).toBe('žab');
  });
  it('letters and capitals', () => {
    expect(LETTERS).toEqual(['õ', 'ä', 'ö', 'ü', 'š', 'ž']);
    expect(LETTERS.map((letter) => upper(letter, true)).join('')).toBe('ÕÄÖÜŠŽ');
    expect(upper('õ', false)).toBe('õ');
  });
});

describe('insertLetter', () => {
  it('a text input: native value, caret and an input event', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.value = 'sur';
    input.focus();
    input.setSelectionRange(1, 1);
    const seen = [];
    input.addEventListener('input', (event) => seen.push([event.type, input.value, event.bubbles]));
    expect(insertLetter(input, 'õ')).toBe(true);
    expect(input.value).toBe('sõur');
    expect(input.selectionStart).toBe(2);
    expect(seen).toEqual([['input', 'sõur', true]]);
    input.remove();
  });
  it('a textarea at the end, and not past maxLength', () => {
    const area = document.createElement('textarea');
    area.maxLength = 3;
    area.value = 'tä';
    area.setSelectionRange(2, 2);
    expect(insertLetter(area, 'ü')).toBe(true);
    expect(area.value).toBe('täü');
    expect(insertLetter(area, 'ü')).toBe(false);
    expect(area.value).toBe('täü');
  });
  it('contenteditable: the caret position gets the letter and an input event', () => {
    const box = document.createElement('div');
    box.setAttribute('contenteditable', 'true');
    box.textContent = 'tre';
    document.body.appendChild(box);
    box.focus();
    const range = document.createRange();
    range.setStart(box.firstChild, 1);
    range.collapse(true);
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    let inputs = 0;
    box.addEventListener('input', () => { inputs += 1; });
    expect(insertLetter(box, 'ä')).toBe(true);
    expect(box.textContent).toBe('täre');
    expect(inputs).toBe(1);
    box.remove();
  });
  it('which fields take letters', () => {
    const make = (html) => { const wrap = document.createElement('div'); wrap.innerHTML = html; return wrap.firstChild; };
    expect(isLetterField(make('<input>'))).toBe(true);
    expect(isLetterField(make('<input type="search">'))).toBe(true);
    expect(isLetterField(make('<textarea></textarea>'))).toBe(true);
    expect(isLetterField(make('<div contenteditable="true"></div>'))).toBe(true);
    expect(isLetterField(make('<input type="number">'))).toBe(false);
    expect(isLetterField(make('<input type="checkbox">'))).toBe(false);
    expect(isLetterField(make('<input readonly>'))).toBe(false);
    expect(isLetterField(make('<input disabled>'))).toBe(false);
    expect(isLetterField(make('<p></p>'))).toBe(false);
    expect(isLetterField(null)).toBe(false);
  });
});

describe('barSpot: where the bar floats', () => {
  const bounds = { left: 0, top: 0, right: 1000, bottom: 700 };
  const size = { w: 260, h: 40 };
  it('under the field, left edges together', () => {
    expect(barSpot({ field: { left: 100, top: 100, right: 300, bottom: 130 }, size, bounds })).toEqual({ left: 100, top: 136, side: 'below' });
  });
  it('over the field near the bottom (the keyboard)', () => {
    expect(barSpot({ field: { left: 100, top: 640, right: 300, bottom: 670 }, size, bounds })).toEqual({ left: 100, top: 594, side: 'above' });
  });
  it('kept on screen at the right edge and for a field taller than the screen', () => {
    expect(barSpot({ field: { left: 900, top: 100, right: 990, bottom: 130 }, size, bounds }).left).toBe(1000 - 6 - 260);
    expect(barSpot({ field: { left: -50, top: -20, right: 900, bottom: 900 }, size, bounds })).toEqual({ left: 6, top: 654, side: 'inside' });
  });
});

describe('the teacher folds the bar on this device', () => {
  it('remembers, and a storage that throws is fine', () => {
    const map = new Map();
    const storage = { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: (key) => map.delete(key) };
    expect(lettersHidden(storage)).toBe(false);
    rememberLettersHidden(true, storage);
    expect(lettersHidden(storage)).toBe(true);
    rememberLettersHidden(false, storage);
    expect(lettersHidden(storage)).toBe(false);
    const broken = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); } };
    expect(lettersHidden(broken)).toBe(false);
    expect(() => rememberLettersHidden(true, broken)).not.toThrow();
  });
});
