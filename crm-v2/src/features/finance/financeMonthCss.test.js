/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/features/finance/financeMonth.css'), 'utf8');
const rules = css.split('}').map((rule) => rule.trim());

// #bug 2026-11-06 (Oleksiy): „Tunnipakett” showed only the selected lesson-count chip. The dialogs of „Lisa arve” and
// „Tunnipakett” (Modal is not a portal) render inside the page header's actions; a descendant rule painted every
// secondary button in the modal white on white. The header (2026-11-09: calm, no coloured hero) must not style buttons
// or text inside its actions, and its own text rules reach only its own title.
describe('finance month header rules', () => {
  it('no rule reaches a button or text inside the header actions (dialogs open there)', () => {
    const inside = rules.filter((rule) => /\.fm-header__actions\s+[^>{\s][^{]*\{/.test(rule) && !/\.fm-header__actions\s*>\s*\.button/.test(rule));
    expect(inside).toEqual([]);
  });

  it('the header text rules reach only its own title block', () => {
    const textRules = rules.filter((rule) => /\.fm-header\s[^{]*[\s>](h1|p)\s*\{/.test(rule));
    expect(textRules.length).toBe(2);
    for (const rule of textRules) expect(rule).toMatch(/\.fm-header\s*>\s*\.fm-header__title\s*>/);
  });

  it('the old white-on-green hero is gone', () => {
    expect(css).not.toMatch(/finance-month-hero/);
    expect(css).not.toMatch(/linear-gradient/);
  });
});
