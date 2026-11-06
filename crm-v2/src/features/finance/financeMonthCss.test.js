/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/features/finance/financeMonth.css'), 'utf8');

// #bug 2026-11-06 (Oleksiy): „Tunnipakett” showed only the selected lesson-count chip. The dialog's Modal is not a
// portal, so it renders inside .finance-month-hero__actions; a descendant rule painted every secondary button in the
// modal white on white. The hero's button rules must reach only the hero's own buttons (direct children).
describe('finance month hero button rules', () => {
  const heroRules = css.split('}').map((rule) => rule.trim()).filter((rule) => rule.includes('.finance-month-hero__actions') && rule.includes('.button'));

  it('has hero button rules to check', () => {
    expect(heroRules.length).toBeGreaterThanOrEqual(3);
  });

  it('scopes every hero button rule to direct children, so dialogs opened from the hero keep normal buttons', () => {
    for (const rule of heroRules) expect(rule).toMatch(/\.finance-month-hero__actions\s*>\s*\.button/);
  });

  it('the hero text rules reach only its own heading, and a dialog inside the hero gets dark text back', () => {
    const textRules = css.split('}').map((rule) => rule.trim()).filter((rule) => /\.finance-month-hero\s[^{]*[\s>](h1|p|\.eyebrow)\s*\{/.test(rule));
    expect(textRules.length).toBe(3);
    for (const rule of textRules) expect(rule).toMatch(/\.finance-month-hero\s*>\s*div\s*>/);
    expect(css).toMatch(/\.finance-month-hero \.modal-backdrop \{ color: #162033; \}/);
  });
});
