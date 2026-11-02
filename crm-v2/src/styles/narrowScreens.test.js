/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/styles/index.css'), 'utf8');

// jsdom has no layout: these rules were measured in a browser (docs/PROJECT_STATE.md, agent/phone-layout)
describe('narrow screen rules', () => {
  it('a modal and a student card do not grow to their content', () => {
    expect(css).toContain('.modal-backdrop{grid-template-columns:minmax(0,1fr)}');
    expect(css).toContain('.students-mobile-list{grid-template-columns:minmax(0,1fr)}');
    expect(css).toContain('.student-mobile-card .row-actions{flex-wrap:wrap}');
  });

  it('page header buttons wrap instead of widening the page', () => {
    expect(css).toContain('.page-header__actions{flex-wrap:wrap');
  });

  it('on a narrow screen tasks come before submissions', () => {
    expect(css).not.toContain('.submission-card{order:-1}');
  });
});
