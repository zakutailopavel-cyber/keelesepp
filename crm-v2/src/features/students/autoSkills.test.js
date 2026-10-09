import { autoSkills, speakingOf } from './autoSkills.js';
import { createBlock } from '../worksheet-studio/engine/registry.js';

const now = Date.parse('2026-10-10T12:00:00Z');

describe('autoSkills', () => {
  it('counts checked fields of done worksheets for the skill each task trains, newer works more', () => {
    const tf = { ...createBlock('truefalse'), id: 'tf' };
    const choice = { ...createBlock('choice'), id: 'ch', data: { title: '', questions: [{ q: 'a', options: '*x\ny' }, { q: 'b', options: '*x\ny' }] } };
    const doc = { meta: {}, blocks: [tf, choice] };
    const rows = autoSkills({ now, assignments: [
      { id: 'a1', status: 'done', completedAt: '2026-10-09T10:00:00Z', worksheetDoc: doc, answers: { 'ch:0': 0, 'ch:1': 1 } },
      { id: 'a2', status: 'new', worksheetDoc: doc, answers: {} },
    ] });
    const grammar = rows.find((r) => r.skill === 'Grammatika');
    expect(grammar.pct).toBe(50);
    expect(grammar.basis).toBe('1 tööleht · 2 vastust');
    expect(rows.find((r) => r.skill === 'Lugemine').pct).toBe(0);
  });

  it('speaking comes from recorded lessons: share in Estonian and sentences without errors', () => {
    const transcript = [
      { speaker: 'student', text: 'Ma elan Tallinnas koos oma emaga ja isaga. Mul on kaks venda ja üks õde.', lang: 'et' },
      { speaker: 'student', text: 'Eile ma läksin poodi ja ostsin leiba. Täna on ilus ilm.', lang: 'et' },
      { speaker: 'student', text: 'Как сказать по-эстонски сестра?', lang: 'ru' },
      { speaker: 'teacher', text: 'Õde.', lang: 'et' },
    ];
    const rec = { status: 'done', endedAt: '2026-10-09T10:00:00Z', language: 'et', transcript, analysis: { errors: [{ said: 'x', corrected: 'y' }] } };
    expect(speakingOf(rec)).toEqual({ share: 87, accuracy: 75 });
    const [row] = autoSkills({ now, recordings: [rec] });
    expect(row).toEqual({ skill: 'Rääkimine', pct: 81, basis: '1 tund · eesti keeles 87% · vigadeta lauseid 75%' });
    expect(autoSkills({ now, recordings: [{ ...rec, transcript: transcript.slice(2) }] })).toEqual([]);
  });
});
