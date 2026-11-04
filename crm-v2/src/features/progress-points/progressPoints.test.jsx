import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { normalizeProgressPoint, progressPointRecord } from '../../services/firebase/progressPoints.js';
import { tallinnDay } from '../parents/nowLearning.js';
import ProgressPointsCard from './ProgressPointsCard.jsx';
import { courseGoalKeys, courseLessonIdOf, examGaps, levelCurve, masteredOn, goalResults, targetLevelOf } from './levelCurve.js';
import { changeText, curveSummary } from './proficiencyCurve.js';

// a course of 5 lessons × 2 goals = 10 goals
const COURSE = Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`b1-00${n}`, { canDo: `Ma oskan ${n}`, goals: { g_read: 'Õpilane loeb', g_vocab: 'Õpilane teab' } }]));
const KEYS = courseGoalKeys(COURSE);
const sheet = (lesson, phase, day, perGoal, extra = {}) => ({ id: `${lesson}-${phase}-${day}`, status: 'done', completedAt: `${day}T15:00:00.000Z`, worksheetDoc: { id: `ws_${lesson}_${phase}` }, score: { perGoal }, ...extra });
const point = (date, percent, kind = 'teacher', label = '', extra = {}) => ({ id: `${date}-${kind}`, studentId: 's1', date, level: 'B1', percent, kind, label, createdBy: 't1', createdAt: `${date}T10:00:00Z`, ...extra });
const both = { g_read: { ok: 8, total: 10 }, g_vocab: { ok: 7, total: 10 } };

describe('levelCurve: level % from the course goals', () => {
  it('reads the course goals and the lesson of a course sheet', () => {
    expect(KEYS).toHaveLength(10);
    expect(courseLessonIdOf({ worksheetDoc: { id: 'ws_a2b1-012_practice' } })).toBe('a2b1-012');
    expect(courseLessonIdOf({ lessonId: 'x-1' })).toBe('x-1');
    expect(targetLevelOf({ enrollments: [{ subject: 'Matemaatika', targetLevel: '7. klass' }, { subject: 'Eesti keel', targetLevel: 'b1' }] })).toBe('B1');
  });

  it('a goal is „Oskan” only with ≥ 2 auto-checked sheets and ≥ 70 % together', () => {
    const results = goalResults([
      sheet('b1-001', 'discover', '2026-09-01', both),
      sheet('b1-001', 'practice', '2026-09-03', { g_read: { ok: 6, total: 10 }, g_vocab: { ok: 5, total: 10 } }), // read 70 %, vocab 60 %
      sheet('b1-002', 'discover', '2026-09-02', both), // one sheet only
      sheet('b1-003', 'discover', '2026-09-02', { g_read: { ok: 10, total: 10 }, g_use: { ok: 1, total: 1 } }), // g_use not a course goal here
      sheet('b1-003', 'practice', '2026-09-04', { g_read: { ok: 0, total: 0 } }), // nothing scored: not a sheet for the goal
      sheet('x-999', 'discover', '2026-09-02', both), // another course
      { ...sheet('b1-004', 'discover', '2026-09-02', both), status: 'new', completedAt: '' }, // not handed in
    ], new Set(KEYS));
    expect(masteredOn(results, '2026-09-02')).toBe(0);
    expect(masteredOn(results, '2026-09-03')).toBe(1); // b1-001 g_read: 14 / 20 = 70 %
    expect(masteredOn(results, '2026-12-31')).toBe(1);
  });

  it('no start point: Oskan goals / all goals, weekly from the first sheet', () => {
    const assignments = [1, 2, 3, 4].flatMap((n) => [sheet(`b1-00${n}`, 'discover', '2026-10-0' + n, both), sheet(`b1-00${n}`, 'practice', '2026-10-0' + (n + 1), both)]);
    const curve = levelCurve({ assignments, goalKeys: KEYS, level: 'B1', today: '2026-10-20' });
    expect(curve.line[0]).toMatchObject({ date: '2026-10-01', percent: 0, kind: 'computed' });
    expect(curve.line.find((item) => item.date === '2026-10-08').percent).toBe(80);
    expect(curve.line.at(-1)).toMatchObject({ date: '2026-10-20', percent: 80 });
  });

  it('the start point („Algus”) counts what he knew; only new goals move the rest of the way; exams never move it', () => {
    // start 40 % on 1.10; by 20.10 he masters 5 of the 10 goals → 40 + 60 × 5 / 10 = 70 %
    const assignments = [1, 2].flatMap((n) => [sheet(`b1-00${n}`, 'discover', '2026-10-05', both), sheet(`b1-00${n}`, 'practice', '2026-10-06', both)])
      .concat([sheet('b1-003', 'discover', '2026-10-12', both), sheet('b1-003', 'practice', '2026-10-13', { g_read: { ok: 9, total: 10 }, g_vocab: { ok: 1, total: 10 } })]);
    const points = [point('2026-10-01', 40, 'teacher', 'Algus'), point('2026-10-10', 99, 'exam', 'Proovieksam')];
    const curve = levelCurve({ assignments, goalKeys: KEYS, points, level: 'B1', today: '2026-10-20' });
    expect(curve.line[0]).toMatchObject({ date: '2026-10-01', percent: 40, kind: 'teacher' });
    expect(curve.line.at(-1)).toMatchObject({ date: '2026-10-20', percent: 70, mastered: 5 });
    expect(curve.exams).toHaveLength(1);
    expect(curve.line.some((item) => item.percent === 99)).toBe(false);
    const summary = curveSummary(curve);
    expect(changeText(summary)).toBe('+30 % alates oktoobrist');
    // the exam (99 %) is far from the curve (64 % in the week of 10.10: 40 + 60 × 4 / 10): the admin is warned
    expect(examGaps(curve)).toEqual([expect.objectContaining({ curve: 64, gap: 35 })]);
  });

  it('a later teacher point is a correction: the curve restarts from it', () => {
    const assignments = [1, 2].flatMap((n) => [sheet(`b1-00${n}`, 'discover', '2026-10-02', both), sheet(`b1-00${n}`, 'practice', '2026-10-03', both)]);
    const points = [point('2026-10-01', 40, 'teacher', 'Algus'), point('2026-10-15', 50, 'teacher', 'Parandus')];
    const curve = levelCurve({ assignments, goalKeys: KEYS, points, level: 'B1', today: '2026-10-20' });
    expect(curve.line.find((item) => item.date === '2026-10-08').percent).toBe(64); // 40 + 60 × 4 / 10
    expect(curve.line.find((item) => item.date === '2026-10-15')).toMatchObject({ percent: 50, kind: 'teacher' });
    expect(curve.line.at(-1).percent).toBe(50);
  });

  it('nothing: no line; another level\'s points are not used; never above 100 %', () => {
    expect(levelCurve({ goalKeys: KEYS, level: 'B1', today: '2026-10-20' }).line).toEqual([]);
    expect(levelCurve({ goalKeys: KEYS, points: [point('2026-10-01', 40, 'teacher', '', { level: 'A2' })], level: 'B1', today: '2026-10-20' }).line).toEqual([]);
    const all = [1, 2, 3, 4, 5].flatMap((n) => [sheet(`b1-00${n}`, 'discover', '2026-10-02', both), sheet(`b1-00${n}`, 'practice', '2026-10-03', both)]);
    const curve = levelCurve({ assignments: all, goalKeys: KEYS, points: [point('2026-10-01', 90, 'teacher')], level: 'B1', today: '2026-10-10' });
    expect(curve.line.at(-1).percent).toBe(100);
  });
});

describe('progressPoints record', () => {
  const user = { uid: 't1', displayName: 'Kadri' };
  it('builds the stored shape and refuses bad input', () => {
    expect(progressPointRecord({ studentId: 's1', date: '2026-11-04', level: 'B1', percent: '62,5', kind: 'exam', label: ' Proovieksam ' }, user, 'NOW'))
      .toEqual({ studentId: 's1', date: '2026-11-04', level: 'B1', percent: 62.5, kind: 'exam', label: 'Proovieksam', createdBy: 't1', createdByName: 'Kadri', createdAt: 'NOW', updatedAt: 'NOW' });
    expect(() => progressPointRecord({ studentId: 's1', date: '2026-11-04', level: 'B1', percent: '120' }, user)).toThrow('0–100');
    expect(() => progressPointRecord({ studentId: 's1', date: '', level: 'B1', percent: '10' }, user)).toThrow('kuupäev');
    expect(() => progressPointRecord({ studentId: 's1', date: '2026-11-04', level: 'X', percent: '10' }, user)).toThrow('tase');
    expect(() => progressPointRecord({ studentId: 's1', date: '2026-11-04', level: 'B1', percent: '' }, user)).toThrow('0–100');
  });
  it('normalizes a stored point', () => {
    expect(normalizeProgressPoint('x', { studentId: 's1', date: 'bad', level: 'Z', percent: 140, kind: 'odd' })).toMatchObject({ date: '', level: '', percent: 100, kind: 'teacher' });
  });
});

describe('Tallinn day', () => {
  it('puts a moment in its Tallinn day in winter and summer time', () => {
    expect(tallinnDay('2026-10-31T22:30:00.000Z')).toBe('2026-11-01');
    expect(tallinnDay('2026-06-30T21:30:00.000Z')).toBe('2026-07-01');
    expect(tallinnDay({ toMillis: () => Date.parse('2026-10-31T22:30:00.000Z') })).toBe('2026-11-01');
    expect(tallinnDay('2026-10-31')).toBe('2026-10-31');
    expect(tallinnDay('nope')).toBe('');
  });
});

describe('ProgressPointsCard (student card)', () => {
  const student = { id: 's1', name: 'Aleksandr', targetLevel: 'B1' };
  const service = (points) => ({
    listForStudents: vi.fn().mockResolvedValue(points),
    add: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(),
  });
  const loadGoals = vi.fn().mockResolvedValue(KEYS);

  it('a teacher adds a measured point; he changes only his own; no exam warning for a teacher', async () => {
    const api = service([point('2026-10-02', 43, 'teacher', 'Algus', { createdBy: 'other' }), point('2026-10-05', 99, 'exam', 'Proovieksam', { createdBy: 't1' })]);
    const teacher = { uid: 't1', displayName: 'Kadri', roles: ['teacher'] };
    render(<ProgressPointsCard student={student} user={teacher} service={api} loadSheets={async () => []} loadGoals={loadGoals} />);
    const list = await screen.findByRole('list', { name: 'Mõõtmised' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Proovieksam');
    expect(within(rows[0]).getByRole('button', { name: 'Muuda' })).toBeInTheDocument();
    expect(within(rows[1]).queryByRole('button', { name: 'Muuda' })).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    const form = screen.getByRole('form', { name: 'Lisa mõõtmine' });
    fireEvent.change(within(form).getByLabelText('Tulemus %'), { target: { value: '62' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Lisa mõõtmine' }));
    await waitFor(() => expect(api.add).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', level: 'B1', percent: '62', kind: 'teacher' }), teacher));
  });

  it('the admin may change any point and is warned when a mock exam is > 15 points from the curve', async () => {
    const api = service([point('2026-10-02', 43, 'teacher', 'Algus', { createdBy: 'other' }), point('2026-10-05', 80, 'exam', 'Proovieksam')]);
    render(<ProgressPointsCard student={student} user={{ uid: 'a1', roles: ['admin'] }} isAdmin service={api} loadSheets={async () => []} loadGoals={loadGoals} />);
    expect((await screen.findAllByRole('button', { name: 'Muuda' })).length).toBe(2);
    expect(await screen.findByRole('alert')).toHaveTextContent('vahe +37 punkti');
  });
});
