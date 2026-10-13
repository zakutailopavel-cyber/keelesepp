import { describe, expect, it } from 'vitest';
import { crosswordLayout, crosswordWord, withLetter } from './crosswordLayout.js';

const rows = [['paber, mille annab arst', 'tõend'], ['avaldus', 'taotlus'], ['kord, kus inimesed ootavad', 'järjekord'], ['hinna vähendus', 'soodustus'], ['koht, kus elad', 'elukoht'], ['nimi dokumendi all', 'allkiri']].map(([clue, answer]) => ({ clue, answer }));

describe('crossword layout', () => {
  it('places every word, crossing where letters match, without two letters disagreeing', () => {
    const layout = crosswordLayout(rows);
    expect(layout.words.map((w) => w.i).sort()).toEqual([0, 1, 2, 3, 4, 5]);
    const cells = new Map();
    for (const w of layout.words) {
      const letters = crosswordWord(rows[w.i].answer);
      letters.forEach((ch, k) => {
        const id = w.dir === 'across' ? `${w.x + k},${w.y}` : `${w.x},${w.y + k}`;
        if (cells.has(id)) expect(cells.get(id)).toBe(ch);
        cells.set(id, ch);
      });
    }
    expect(layout.cells).toHaveLength(cells.size);
    expect(layout.cells.some((c) => c.refs.length === 2)).toBe(true); // at least one crossing
    expect(Math.max(...layout.cells.map((c) => c.x)) + 1).toBe(layout.width);
  });

  it('numbers start cells in reading order and keeps the result the same every time', () => {
    const a = crosswordLayout(rows);
    expect(crosswordLayout(rows)).toEqual(a);
    const numbers = a.cells.filter((c) => c.number).map((c) => c.number);
    expect(numbers).toEqual([...numbers].sort((x, y) => x - y));
    expect(numbers[0]).toBe(1);
  });

  it('puts a word that crosses nothing on its own line and ignores empty answers', () => {
    const layout = crosswordLayout([{ clue: 'a', answer: 'abc' }, { clue: 'b', answer: 'xyz' }, { clue: 'c', answer: '' }]);
    expect(layout.words).toHaveLength(2);
    expect(layout.words.every((w) => w.dir === 'across')).toBe(true);
    expect(new Set(layout.words.map((w) => w.y)).size).toBe(2);
  });

  it('lets a word that crosses nothing yet wait, so it does not block the others', () => {
    // kool shares no letter with õpetaja; placed alone first it took the cell õpik needs (live check 2026-10-14)
    const layout = crosswordLayout([{ clue: 'a', answer: 'kool' }, { clue: 'b', answer: 'õpetaja' }, { clue: 'c', answer: 'õpik' }]);
    const shared = layout.cells.filter((c) => c.refs.length > 1);
    expect(shared).toHaveLength(2);
    expect(layout.height).toBeLessThan(5);
  });

  it('writes one letter into the answer of a word', () => {
    expect(withLetter('', 4, 2, 'o')).toBe('  o');
    expect(withLetter('ko l', 4, 2, 'o')).toBe('kool');
    expect(withLetter('kool', 4, 3, '')).toBe('koo');
    expect(crosswordWord('järje-kord, järjekord')).toEqual([...'järjekord']);
  });
});
