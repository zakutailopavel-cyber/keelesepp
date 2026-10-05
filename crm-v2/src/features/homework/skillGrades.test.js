import { applySkillGrades, scoreToDelta, skillList, suggestedSkills } from './skillGrades.js';

describe('skill grades from a checked work', () => {
  it('moves a known skill by the methodology rule and starts a new one at the grade', () => {
    expect([95, 80, 65, 45, 20].map(scoreToDelta)).toEqual([5, 3, 1, 0, -3]);
    const { values, deltas } = applySkillGrades({ Grammatika: 50, Lugemine: 98 }, { Grammatika: 5, Lugemine: 5, Sõnavara: 4 });
    expect(values).toEqual({ Grammatika: 55, Lugemine: 100, Sõnavara: 80 });
    expect(deltas).toEqual({ Grammatika: 5, Lugemine: 5, Sõnavara: 0 });
  });

  it('a second check of the same work replaces the first instead of adding to it', () => {
    const first = applySkillGrades({ Grammatika: 50 }, { Grammatika: 5, Sõnavara: 4 });
    const map = { Grammatika: first.values.Grammatika, Sõnavara: first.values.Sõnavara };
    const second = applySkillGrades(map, { Grammatika: 1, Sõnavara: 2 }, first);
    expect(second.values).toEqual({ Grammatika: 47, Sõnavara: 45 });
    expect(second.created).toEqual(['Sõnavara']);
    const third = applySkillGrades({ Grammatika: 47, Sõnavara: 45 }, {}, second);
    expect(third.values).toEqual({ Grammatika: 50, Sõnavara: null });
  });

  it('lists core skills plus existing ones and suggests skills from block types', () => {
    expect(skillList({ Hääldus: 40 })).toContain('Hääldus');
    expect(suggestedSkills({ blocks: [{ type: 'gaps' }, { type: 'match' }, { type: 'image' }] })).toEqual(['Grammatika', 'Sõnavara']);
  });
});
