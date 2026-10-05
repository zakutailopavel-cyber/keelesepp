import { setPath, textPaths } from './inlineEdit.js';

describe('inline sheet editing helpers', () => {
  it('finds the one data string a text came from, ignoring spacing', () => {
    const data = { title: 'Minu päev', items: [{ text: 'Ma ärkan  kell 7.' }, { text: 'ja' }, { text: 'ja' }] };
    expect(textPaths(data, 'Ma ärkan kell 7.')).toEqual([['items', 0, 'text']]);
    expect(textPaths(data, 'ja')).toHaveLength(2);
    expect(textPaths(data, 'puudub')).toEqual([]);
    expect(textPaths(data, '   ')).toEqual([]);
  });

  it('sets a nested value without touching the original', () => {
    const data = { items: [{ text: 'a', ok: true }, { text: 'b' }] };
    const next = setPath(data, ['items', 0, 'text'], 'A');
    expect(next.items[0]).toEqual({ text: 'A', ok: true });
    expect(next.items[1]).toBe(data.items[1]);
    expect(data.items[0].text).toBe('a');
  });
});
