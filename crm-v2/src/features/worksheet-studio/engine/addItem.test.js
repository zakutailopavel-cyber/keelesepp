import { addItem, addItemLabel } from './addItem.js';
import { createBlock } from './registry.js';

describe('add item on the sheet', () => {
  it('appends a blank picture and stops at 12', () => {
    const block = createBlock('pictures');
    const next = addItem(block);
    expect(next.data.items).toHaveLength(block.data.items.length + 1);
    expect(next.data.items.at(-1)).toEqual({ img: null, caption: '', answer: '' });
    const full = { ...block, data: { ...block.data, items: Array.from({ length: 12 }, () => ({ img: null, caption: '', answer: '' })) } };
    expect(addItemLabel(full)).toBeNull();
    expect(addItem(full)).toBe(full);
  });

  it('adds lines to newline lists and alternates dialogue speakers', () => {
    const gaps = addItem(createBlock('gaps'));
    expect(gaps.data.sentences.split('\n').at(-1)).toBe('Uus lause [vastus].');
    const dialogue = createBlock('dialogue');
    expect(addItem(dialogue).data.lines.at(-1).who).toBe('A');
    const table = addItem(createBlock('table'));
    expect(table.data.rows.split('\n').at(-1)).toBe('sõna | [vastus] | [vastus]');
    expect(addItemLabel(createBlock('clock'))).toBe('Lisa kell');
  });

  it('has no button for blocks without items', () => {
    expect(addItemLabel(createBlock('writing'))).toBeNull();
    expect(addItemLabel(createBlock('text'))).toBeNull();
  });
});
