import { autoSkills, speakingFromStats, speakingOf } from './autoSkills.js';
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
    // the true/false task was not answered (done in the lesson): no evidence for reading, not 0 % (owner 2026-10-27)
    expect(rows.find((r) => r.skill === 'Lugemine')).toBeUndefined();
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
    expect(row).toEqual({ skill: 'Rääkimine', pct: 87, basis: '1 tund · tunnikeeles räägitud osa · vigadeta lauseid 75%' });
    expect(autoSkills({ now, recordings: [{ ...rec, transcript: transcript.slice(2) }] })).toEqual([]);
  });

  it('the teacher and the student read one number for speaking: the lesson stats, the newer lesson counting more', () => {
    const stats = [
      { date: '2026-10-08T10:00:00Z', studentWords: 100, share: 30 },
      { date: '2026-07-01T10:00:00Z', studentWords: 100, share: 60 },
      { date: '2026-10-09T10:00:00Z', studentWords: 5, share: 0 }, // hardly spoke
    ];
    const student = speakingFromStats(stats, now);
    expect(student.pct).toBeLessThan(45); // not the plain average 45
    expect(student.basis).toBe('2 tundi · tunnikeeles räägitud osa');
    // the teacher's recordings may differ in number and say how many sentences had no error: beside the number, not in it
    const rec = { status: 'done', endedAt: '2026-10-09T10:00:00Z', language: 'et', transcript: [{ speaker: 'student', text: 'üks kaks kolm neli viis kuus seitse kaheksa üheksa kümme üks kaks kolm neli viis kuus seitse kaheksa üheksa kümme. Tere tere.', lang: 'et' }], analysis: { errors: [] } };
    const [teacher] = autoSkills({ now, recordings: [rec], stats });
    expect(teacher.pct).toBe(student.pct);
    expect(teacher.basis).toContain('vigadeta lauseid 100%');
  });
});

describe('speaking from the cleaned analysis', () => {
  it('uses the Mac analysis word counts and checked sentences when present', () => {
    const transcript = [{ speaker: 'student', text: 'The bovli out of the book', lang: 'et' }];
    const r = speakingOf({ transcript, analysis: { errors: [{}, {}], checked: 10, speech: { words: 100, langWords: 40 } } });
    expect(r).toEqual({ share: 40, accuracy: 80 });
  });
});

