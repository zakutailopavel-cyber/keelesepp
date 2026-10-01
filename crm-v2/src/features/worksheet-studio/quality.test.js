import { analyzeWorksheet } from './quality.js';
import { createBlock } from './engine/registry.js';
import { newDocument } from './engine/schema.js';

describe('worksheet publication quality', () => {
  it('rejects an empty or placeholder worksheet', () => {
    const result = analyzeWorksheet(newDocument());
    expect(result.ready).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toEqual(expect.arrayContaining(['title', 'blocks', 'tasks']));
  });

  it('accepts a complete teacher-created open task and keeps missing goals as a warning', () => {
    const doc = newDocument();
    doc.meta.title = 'Kiri linnavalitsusele';
    doc.blocks = [createBlock('guidedletter')];
    const result = analyzeWorksheet(doc);
    expect(result.ready).toBe(true);
    expect(result.warnings.map((issue) => issue.code)).toContain('goals');
  });

  it('requires answer keys for automatically checked tasks', () => {
    const doc = newDocument();
    doc.meta.title = 'Vormid';
    const block = createBlock('wordforms');
    block.data.rows[0].answer = '';
    doc.blocks = [block];
    expect(analyzeWorksheet(doc).errors.some((issue) => issue.code.endsWith(':answers'))).toBe(true);
  });
});
