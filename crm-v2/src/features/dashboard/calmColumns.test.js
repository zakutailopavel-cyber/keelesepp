/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/features/dashboard/calm.css'), 'utf8');

// jsdom has no layout: measured in a browser (docs/PROJECT_STATE.md, agent/home-equal-columns)
describe('home page: „Vajab tähelepanu” and „Täna”', () => {
  it('are the same height (owner 2026-11-26): the shorter card stretches', () => {
    expect(css).toContain('.calm-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }');
    expect(css).not.toMatch(/\.calm-top \{[^}]*align-items: start/);
  });

  it('keep their last line at the bottom of the stretched card', () => {
    expect(css).toContain('.calm-top > * { display: flex; flex-direction: column; }');
    expect(css).toContain('.calm-top > * > .calm-more, .calm-top > * > .calm-today__foot { margin-top: auto;');
  });
});
