import { B, shape, tag, withShapes } from './blocks.js';
import { buildCourseSheet, lessonOrder } from './registry.js';

// The final-shape authoring helpers (docs/COURSE_FINAL_SHAPE_B1.md §9 items 1–2, docs/FINAL_SHAPE_AUTHORING.md).
describe('tag(): didactic tags on a block', () => {
  const reading = B.reading('x_read', 'Loe.', 'Loe ja vasta.', 'Pealkiri', 'Tekst.', [['Küsimus?', 'vastus']]);
  it('adds the tags to block.tag and keeps the learner data as it was', () => {
    const tagged = tag(reading, { task: 'R13', harno: 'R2', level: 3, fluency: false });
    expect(tagged.tag).toEqual({ task: 'R13', harno: 'R2', level: 3 });
    expect(tagged.data).toBe(reading.data);
    expect(tag(tagged, { main: true }).tag).toEqual({ task: 'R13', harno: 'R2', level: 3, main: true });
  });
  it('refuses unknown ids, formats, levels and keys at once', () => {
    expect(() => tag(reading, { task: 'R99' })).toThrow(/R99/);
    expect(() => tag(reading, { harno: 'R9' })).toThrow(/R9/);
    expect(() => tag(reading, { level: 5 })).toThrow(/1–4/);
    expect(() => tag(reading, { harnoo: 'R1' })).toThrow(/harnoo/);
    expect(() => tag(reading, { topic: ['sõna'] })).toThrow(/sõnavarakasti/);
    expect(tag(B.vocab('v', 'Sõnad.', ['kontor — офис']), { topic: ['kontor'] }).tag.topic).toEqual(['kontor']);
  });
});

describe('shape() and withShapes(): archetype and lead skills of a lesson', () => {
  it('reads „R→W” (also „R->W”) and keeps exam lessons without a lead', () => {
    expect(shape('LUGU', 'R→W')).toEqual({ archetype: 'LUGU', lead: { input: 'R', output: 'W' } });
    expect(shape('KUUL', 'L -> S')).toEqual({ archetype: 'KUUL', lead: { input: 'L', output: 'S' } });
    expect(shape('EKS')).toEqual({ archetype: 'EKS' });
    expect(() => shape('LOOD', 'R→W')).toThrow(/LOOD/);
    expect(() => shape('LUGU', 'S→W')).toThrow(/L→S/);
  });
  it('declares a whole module at once and refuses a lesson that is not there', () => {
    const lessons = withShapes({ 'a2b1-021': { title: 'A' }, 'a2b1-025': { title: 'E' } }, { 'a2b1-021': 'LUGU R→W', 'a2b1-025': 'EKS' });
    expect(lessons['a2b1-021']).toMatchObject({ title: 'A', archetype: 'LUGU', lead: { input: 'R', output: 'W' } });
    expect(lessons['a2b1-025'].archetype).toBe('EKS');
    expect(() => withShapes({}, { 'a2b1-099': 'LUGU R→W' })).toThrow(/a2b1-099/);
  });
});

describe('review items name their lesson', () => {
  it('keeps the text the learner sees and the `from` list aligned with it', () => {
    const r = B.review('r', [['Mida Markus eile tegi?', 'a2b1-021'], 'Mis kell sa ärkad?', ['Kes on Helgi?', 'a2b1-009']]);
    expect(r.data.text).toBe('Mida Markus eile tegi?\nMis kell sa ärkad?\nKes on Helgi?');
    expect(r.data.from).toEqual(['a2b1-021', '', 'a2b1-009']);
    expect(B.review('r2', ['Üks', 'Kaks']).data.from).toBeUndefined();
  });
});

describe('the sheet keeps the author’s order and the lesson shape', () => {
  it('moves only the rubric and the self-check to the end', () => {
    const blocks = [{ id: 'a', type: 'selfcheck' }, { id: 'b', type: 'speaking' }, { id: 'c', type: 'rubric' }, { id: 'd', type: 'gaps' }, { id: 'e', type: 'examrubric' }];
    expect(lessonOrder(blocks).map((b) => b.id)).toEqual(['b', 'd', 'c', 'e', 'a']);
    expect(lessonOrder([{ id: 'w', type: 'writing' }, { id: 's', type: 'speaking' }, { id: 'p', type: 'planning' }, { id: 'g', type: 'gaps' }]).map((b) => b.id)).toEqual(['w', 's', 'p', 'g']);
    expect(lessonOrder([{ id: 'r', type: 'rubric' }, { id: 'x', type: 'selfcheck' }, { id: 'w', type: 'writing' }]).map((b) => b.id)).toEqual(['w', 'r', 'x']);
  });
  it('carries the archetype and lead into the sheet meta', () => {
    const mod = { MODULE: { id: 'a2b1-module-99', course: 'b1', title: 'Test', level: 'B1' }, LESSONS: { 'a2b1-991': { title: 'T', canDo: 'Ma räägin.', ...shape('RÄÄK', 'L→S'), practice: [B.speaking('s', 'Räägi.', 'Räägi.', ['Mis?'], [60, 90])] } } };
    expect(buildCourseSheet(mod, 'a2b1-991', 'practice').meta).toMatchObject({ archetype: 'RÄÄK', lead: { input: 'L', output: 'S' } });
  });
});
