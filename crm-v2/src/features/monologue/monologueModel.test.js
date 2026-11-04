import { describe, expect, it } from 'vitest';
import {
  MONOLOGUE_PROMPTS, countWords, defaultPair, monologueAudioPath, monologueLevel, monologueRecord, monologueStats,
  monologueTask, monthEnd, monthLabel, monthOf, promptForLevel,
} from './monologueModel.js';

const card = (extra = {}) => ({ id: 'c1', name: 'Mia', subject: 'Eesti keel', level: 'B1', ...extra });

describe('Kuu monoloog: model', () => {
  it('gives A2/B1 the self prompt and B2/C1 the argument prompt; A1 and English get none', () => {
    expect(promptForLevel('A2').id).toBe('et-self-v1');
    expect(promptForLevel('b1').title).toBe('Räägi endast, oma päevast ja plaanidest');
    expect(promptForLevel('B2').id).toBe('et-argument-v1');
    expect(promptForLevel('C1').id).toBe('et-argument-v1');
    expect(promptForLevel('A1')).toBeNull();
    expect(monologueLevel(card())).toBe('B1');
    expect(monologueLevel(card({ level: 'A1' }))).toBe('');
    expect(monologueLevel(card({ subject: 'Inglise keel' }))).toBe('');
    expect(monologueLevel(card({ enrollments: [{ subject: 'Inglise keel', level: 'B2' }, { subject: 'Eesti keel', level: 'b2' }] }))).toBe('B2');
    expect(monologueLevel(null)).toBe('');
    Object.values(MONOLOGUE_PROMPTS).forEach((prompt) => expect(prompt.hints.length).toBeGreaterThan(1));
  });

  it('months: local month, label, last day', () => {
    expect(monthOf(new Date(2026, 10, 30, 23, 30))).toBe('2026-11');
    expect(monthOf(new Date(2026, 0, 1))).toBe('2026-01');
    expect(monthLabel('2026-11')).toMatch(/november 2026/);
    expect(monthEnd('2026-02')).toBe('2026-02-28');
    expect(monthEnd('2026-11')).toBe('2026-11-30');
  });

  it('the record and its audio path follow the rules', () => {
    expect(monologueAudioPath('c1', '2026-11', 'audio/webm')).toBe('homework/c1/monologues/2026-11.webm');
    expect(monologueAudioPath('c1', '2026-11', 'audio/mp4')).toBe('homework/c1/monologues/2026-11.m4a');
    const record = monologueRecord({ student: card(), uid: 'u1', month: '2026-11', level: 'B1', audioPath: 'p', contentType: 'audio/webm;codecs=opus', seconds: 999, now: 'T' });
    expect(record).toEqual({ studentId: 'c1', studentUid: 'u1', month: '2026-11', promptId: 'et-self-v1', level: 'B1', audioPath: 'p', contentType: 'audio/webm', seconds: 130, createdAt: 'T', updatedAt: 'T' });
    expect(record).not.toHaveProperty('teacherNote');
    expect(monologueRecord({ student: card(), uid: 'u', month: '2026-11', level: 'B1', seconds: 0 }).seconds).toBe(1);
  });

  it('the task is due this month until it is recorded, then it is done', () => {
    const today = new Date(2026, 10, 4);
    const todo = monologueTask({ student: card(), monologues: [], today });
    expect(todo).toMatchObject({ kind: 'monologue', state: 'todo', title: expect.stringMatching(/^Kuu monoloog · november 2026/), due: '2026-11-30', minutes: 5 });
    expect(todo.goal).toContain('Räägi endast');
    const lastMonth = monologueTask({ student: card(), monologues: [{ studentId: 'c1', month: '2026-10' }], today });
    expect(lastMonth.state).toBe('todo');
    const done = monologueTask({ student: card(), monologues: [{ studentId: 'c1', month: '2026-11', createdAt: '2026-11-03T10:00:00Z' }], today });
    expect(done).toMatchObject({ state: 'waiting', due: '', goal: '', doneAt: '2026-11-03T10:00:00Z' });
    expect(monologueTask({ student: card({ level: 'A1' }), today })).toBeNull();
  });

  it('counts words and words per minute only when there is a text', () => {
    expect(countWords('Tere! Ma olen Mari-Liis, ma elan Tallinnas 5 aastat.')).toBe(9);
    expect(monologueStats({ seconds: 120 })).toEqual({ seconds: 120, words: null, wpm: null });
    expect(monologueStats({ seconds: 120, wordCount: 180 })).toEqual({ seconds: 120, words: 180, wpm: 90 });
    expect(monologueStats({ seconds: 60, transcriptText: 'üks kaks kolm' })).toEqual({ seconds: 60, words: 3, wpm: 3 });
    expect(monologueStats({ seconds: 5, wordCount: 10 }).wpm).toBeNull();
  });

  it('„Võrdle” starts with the oldest and the newest month', () => {
    expect(defaultPair([{ id: 'a', month: '2026-10' }])).toEqual([]);
    expect(defaultPair([{ id: 'b', month: '2026-11' }, { id: 'a', month: '2026-09' }, { id: 'c', month: '2026-10' }])).toEqual(['a', 'b']);
  });
});
