/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/features/cash/cash.css'), 'utf8');

// jsdom has no layout: measured in a browser (docs/PROJECT_STATE.md, agent/kassa-rows-align). Fixed 92px / 120px
// columns were narrower than „õpetaja märkis” and „Raamatupidamisest väljas”, so badges ran over the name and buttons.
describe('„Kassa” entries rows', () => {
  it('share one column grid, so every column starts at the same place in every row', () => {
    expect(css).toContain('.cash-row { display: grid; grid-template-columns: subgrid; grid-column: 1 / -1;');
    expect(css).toMatch(/\.cash-table \{ display: grid; grid-template-columns: max-content max-content minmax\(0, 1fr\) max-content fit-content\(230px\) max-content;/);
    expect(css).not.toContain('96px 92px');
  });

  it('a long status wraps inside its column instead of covering the buttons', () => {
    expect(css).toContain('.cash-row > :nth-child(5) .badge { white-space: normal; }');
  });

  it('on a phone the rows are stacked again, with the buttons on their own line', () => {
    expect(css).toContain('.cash-table { display: block; }');
    expect(css).toContain('.cash-row__actions { grid-column: 1 / -1; }');
  });
});
