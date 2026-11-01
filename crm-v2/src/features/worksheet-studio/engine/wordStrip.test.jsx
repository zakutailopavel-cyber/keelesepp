import { render } from '@testing-library/react';
import Sheet from './Sheet.jsx';
import { BLOCKS, checkDocument, createBlock, numberTasks, paletteEntries } from './registry.js';
import { stepView } from './liveLesson.js';
import { packPages } from './pageSplit.js';
import { blockCatalog, normalizeSheet } from '../sheetKit.js';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';
import { SCHEMA } from './schema.js';
import { NON_TASK_TYPES } from '../didactics/taskCatalogue.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };

const strip = { id: 'wordstrip_x_practice_1', type: 'wordstrip', width: 'full', span: 12, tone: 'white', data: { artFor: 'words', items: [
  { id: 'kala', word: 'kala', alt: 'Pilt: kala', img: { src: '/w/kala.webp', width: 800, height: 800 } },
  { id: 'supp', word: 'supp', alt: 'Pilt: supp', img: { src: '/w/supp.webp', width: 800, height: 800 } },
  { id: 'piim', word: 'piim', alt: 'Pilt: piim', img: { src: '/w/piim.webp', width: 800, height: 800 } },
] } };
const docOf = (blocks) => ({ schema: SCHEMA, id: 'ws_x', meta: { title: 'T', level: 'A2', footer: {} }, blocks });

describe('word strip block', () => {
  it.each(['interactive', 'review', 'print', 'edit'])('shows pictures with alt text and words, without a number, in mode %s', (mode) => {
    const { container, unmount } = render(<Sheet doc={docOf([strip])} mode={mode} />);
    const card = container.querySelector(`[data-block="${strip.id}"]`);
    expect([...card.querySelectorAll('img')].map((img) => img.getAttribute('alt'))).toEqual(['Pilt: kala', 'Pilt: supp', 'Pilt: piim']);
    expect(card.querySelector('.ws-wordstrip').textContent).toBe('kalasupppiim');
    expect(card.querySelector('.ws-num')).toBeNull();
    expect(card.style.gridColumn).toBe('span 12');
    unmount();
  });

  it('is known everywhere, has no answers and no number, and is not offered in the picker', () => {
    expect(BLOCKS.wordstrip.task).toBe(false);
    expect(BLOCKS.wordstrip.score).toBeUndefined();
    expect(NON_TASK_TYPES.has('wordstrip')).toBe(true);
    expect(numberTasks([strip])).toEqual({ [strip.id]: null });
    expect(checkDocument(docOf([strip]), {}).score.total).toBe(0);
    expect(paletteEntries().some((entry) => entry.key === 'wordstrip')).toBe(false);
    expect(blockCatalog().some((entry) => entry.type === 'wordstrip')).toBe(false);
    expect(createBlock('wordstrip').data).toMatchObject({ artFor: 'words', items: [] });
    expect(validateWorksheetDoc(docOf([strip]))).toBe(true);
    expect(normalizeSheet(docOf([strip])).blocks[0]).toMatchObject({ id: strip.id, type: 'wordstrip', span: 12, data: strip.data });
  });

  it('comes with its task in step mode and is not counted as a hidden task', () => {
    const task = { id: 't1', type: 'gaps', data: {} };
    const other = { id: 't2', type: 'gaps', data: {} };
    const doc = docOf([other, strip, task]);
    const closed = stepView(doc, { on: true, open: ['t2'] });
    expect(closed.doc.blocks.map((block) => block.id)).toEqual(['t2']);
    expect(closed.hidden).toBe(1);
    const open = stepView(doc, { on: true, open: ['t1'] });
    expect(open.doc.blocks.map((block) => block.id)).toEqual([strip.id, 't1']);
    expect(open.hidden).toBe(1);
  });

  it('goes to the next page with its task instead of staying alone at the bottom', () => {
    const rows = [{ h: 70 }, { h: 20, keepWithNext: true }, { h: 30 }];
    expect(packPages(rows, { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1, 2]]);
    expect(packPages([{ h: 40 }, { h: 20, keepWithNext: true }, { h: 30 }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0, 1, 2]]);
    // a strip is never pushed off an empty page
    expect(packPages([{ h: 20, keepWithNext: true }, { h: 120 }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
  });
});
