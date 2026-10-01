import { analyzeWorksheet } from './quality.js';
import { createBlock } from './engine/registry.js';
import { newDocument } from './engine/schema.js';

describe('worksheet publication quality', () => {
  it('rejects an empty or placeholder worksheet', () => {
    const result = analyzeWorksheet(newDocument());
    expect(result.ready).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toEqual(expect.arrayContaining(['blocks', 'tasks']));
    expect(result.warnings.map((issue) => issue.code)).toContain('title');
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

  it('allows publishing listening without an audio file and a placeholder sheet title', () => {
    const doc = newDocument();
    const block = createBlock('listening');
    doc.blocks = [block];
    const result = analyzeWorksheet(doc);
    expect(result.ready).toBe(true);
    expect(result.warnings.map((issue) => issue.code)).toEqual(expect.arrayContaining(['title', `${block.id}:audio`]));
  });

  it('still blocks tasks with missing titles or checked answers', () => {
    const doc = newDocument();
    const block = createBlock('listening');
    block.data.title = '';
    block.data.sentences = 'Kus ta elab?';
    doc.blocks = [block];
    expect(analyzeWorksheet(doc).errors.map((issue) => issue.code)).toEqual(expect.arrayContaining([`${block.id}:title`, `${block.id}:answers`]));
  });
});
