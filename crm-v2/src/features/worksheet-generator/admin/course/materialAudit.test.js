/* global process */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { auditWorks, renderAuditMarkdown, summarize } from './materialAudit.js';
import { lessonChecklist, sheetChecklist } from './materialChecklist.js';

const sheet = (phase, blocks) => ({ meta: { phase }, blocks });
const task = (type, data = {}) => ({ id: `${type}-${Math.random()}`, type, data: { title: type, instruction: 'Tee ülesanne.', ...data } });

describe('material checklist', () => {
  it('flags a free task followed by a controlled one and a missing self-check', () => {
    const codes = sheetChecklist(sheet('practice', [task('speaking', { questions: 'Kes?' }), task('gaps')])).map((p) => p.code);
    expect(codes).toEqual(expect.arrayContaining(['J1', 'J5']));
  });

  it('accepts a lesson with all four skills, pair work, an open task and a picture', () => {
    const docs = [
      sheet('discover', [{ id: 'i', type: 'image', data: { img: { src: '/a.webp' } } }, task('reading', { passage: 'Tekst.' }), task('listening'), task('selfcheck')]),
      sheet('transfer', [{ id: 't', type: 'text', data: { text: 'Olukord.' } }, task('rolecards', { phrasesA: 'Tere!' }), task('writing', { keywords: 'tere' }), task('selfcheck')]),
    ];
    expect(lessonChecklist(docs)).toEqual([]);
  });

  it('runs over every worksheet the repository produces', () => {
    const audited = auditWorks();
    const summary = summarize(audited);
    expect(Object.keys(summary)).toEqual(expect.arrayContaining(['A2', 'B1', 'B2', 'C1']));
    expect(audited.every((w) => Object.keys(w.lessons).length > 0)).toBe(true);
    // the report is advisory: regenerate docs/MATERIAL_QUALITY_AUDIT.md on demand
    if (process.env.WRITE_MATERIAL_AUDIT) {
      const markdown = renderAuditMarkdown(audited, { date: process.env.AUDIT_DATE || new Date().toISOString().slice(0, 10), commit: process.env.AUDIT_COMMIT || '?' });
      writeFileSync(resolve(process.cwd(), '../docs/MATERIAL_QUALITY_AUDIT.md'), markdown);
    }
  }, 120000);
});
