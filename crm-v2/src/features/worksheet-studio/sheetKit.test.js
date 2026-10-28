import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { blockCatalog, checkSheet, normalizeSheet, sampleSheet } from './sheetKit.js';

const require = createRequire(import.meta.url);

describe('sheet kit (the ChatGPT connector checks sheets with it)', () => {
  it('the bundle in functions/generated is built from the current blocks — else run `npm run build:sheet-kit`', () => {
    const bundled = require('../../../../functions/generated/sheet-kit.cjs');
    expect(JSON.stringify(bundled.blockCatalog())).toBe(JSON.stringify(blockCatalog()));
    expect(bundled.checkSheet(sampleSheet()).issues.map((issue) => issue.code)).toEqual(checkSheet(sampleSheet()).issues.map((issue) => issue.code));
  });

  it('a hand-written sheet gets ids, widths and tones; unknown blocks and missing titles are errors', () => {
    const doc = normalizeSheet({ meta: { title: 'Proov' }, blocks: [{ type: 'gaps', data: { title: 'T', instruction: 'I', sentences: 'Ma [lähen].' } }, { type: 'gaps', id: 'x', data: {} }, { type: 'gaps', id: 'x', data: {} }] });
    expect(doc.schema).toBe('keelesepp.worksheet/2');
    expect(new Set(doc.blocks.map((b) => b.id)).size).toBe(3);
    expect(doc.blocks[0]).toMatchObject({ width: 'half', span: 6, tone: 'blue' });
    expect(checkSheet(normalizeSheet({ meta: { title: 'x' }, blocks: [{ type: 'foo' }] })).errors[0]).toMatch(/tundmatu tüüp "foo"/);
    expect(checkSheet(normalizeSheet({ meta: { title: '' }, blocks: [] })).ready).toBe(false);
  });
});
