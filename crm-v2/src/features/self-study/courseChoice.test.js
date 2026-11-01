import { describe, expect, it } from 'vitest';
import { courseChoice } from './selfStudyModel.js';

const level = (key, lessonId = `${key}-1`) => ({ key, label: key, modules: [{ key: 'm', label: 'm', lessons: [{ id: lessonId }] }] });
const levels = ['A2', 'B1', 'B2', 'C1', 'English A2', 'English B1', 'Eelkool 5–6 a', 'Kooliks valmis 6–7 a', '2.–3. klass 8–9 a', '9. klass emakeel'].map((key) => level(key));
const keys = ({ offered }) => offered.map((entry) => entry.key);

describe('courseChoice', () => {
  it('A2 towards B1 opens the B1 course, as „Minu areng” says, and offers no children\'s course to a 9th-grader', () => {
    const choice = courseChoice({ level: 'A2', targetLevel: 'B1', grade: '9. klass', subject: 'Eesti keel' }, levels);
    expect(choice.current.key).toBe('B1');
    expect(keys(choice)).toEqual(['A2', 'B1']);
  });

  it('a level reached opens that level; a card without a target goes to the next one', () => {
    expect(courseChoice({ level: 'B2', targetLevel: 'B2' }, levels).current.key).toBe('B2');
    expect(courseChoice({ level: 'B1' }, levels).current.key).toBe('B2');
  });

  it('English goes by the English course, a second subject of the card is offered too', () => {
    expect(courseChoice({ level: 'A2', targetLevel: 'B1', subject: 'Inglise keel' }, levels).current.key).toBe('English B1');
    const both = courseChoice({ level: 'A2', targetLevel: 'B1', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', level: 'A2' }, { subject: 'Inglise keel', level: 'A2' }] }, levels);
    expect(both.current.key).toBe('B1');
    expect(keys(both)).toEqual(['A2', 'B1', 'English A2', 'English B1']);
  });

  it('a course named by the card\'s own level opens: a child, a school grade', () => {
    expect(courseChoice({ level: 'Eelkool', grade: '' }, levels).current.key).toBe('Eelkool 5–6 a');
    expect(courseChoice({ level: '9. klass', subject: 'Emakeel' }, levels).current.key).toBe('9. klass emakeel');
  });

  it('a course he already has work in stays reachable', () => {
    expect(keys(courseChoice({ level: 'B1', targetLevel: 'B2' }, levels, new Set(['A2-1'])))).toEqual(['A2', 'B1', 'B2']);
  });

  it('no matching course: everything except the children\'s courses for a pupil above grade 3', () => {
    const unknown = { level: '', targetLevel: '', grade: '9' };
    const only = [level('B2'), level('Eelkool 5–6 a'), level('2.–3. klass 8–9 a')];
    expect(keys(courseChoice(unknown, only))).toEqual(['B2']);
    expect(keys(courseChoice({ level: '', grade: '2' }, only))).toEqual(['B2', 'Eelkool 5–6 a', '2.–3. klass 8–9 a']);
    expect(courseChoice(null, only).current.key).toBe('B2');
  });
});
