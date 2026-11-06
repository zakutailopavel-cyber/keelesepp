import { describe, expect, it } from 'vitest';
import { CUSTOM_DURATION, GROUP_HELP, durationChoice, groupFormError, lessonDuration } from './groupForm.js';

const teachers = [{ id: 't1', name: 'Mari' }];
const ok = { name: 'Eesti keel B1 · teisipäev 18:00', teacherUid: 't1', subject: 'Eesti keel', level: 'B1', audience: '', capacity: '' };

describe('groupFormError (create and edit alike)', () => {
  it('accepts a complete form', () => {
    expect(groupFormError(ok, { teachers })).toBe('');
    expect(groupFormError({ ...ok, audience: 'school', ageFrom: '7', ageTo: '10', capacity: '6' }, { teachers })).toBe('');
  });
  it('names the first problem in plain Estonian', () => {
    expect(groupFormError({ ...ok, name: '  ' }, { teachers })).toBe('Sisesta grupi nimi.');
    expect(groupFormError({ ...ok, teacherUid: 'gone' }, { teachers })).toBe('Vali õpetaja.');
    expect(groupFormError({ ...ok, subject: '' }, { teachers })).toBe('Vali õppeaine.');
    expect(groupFormError({ ...ok, capacity: '31' }, { teachers })).toBe('Kohti saab olla 1–30.');
    expect(groupFormError({ ...ok, capacity: '2.5' }, { teachers })).toBe('Kohti saab olla 1–30.');
    expect(groupFormError({ ...ok, audience: 'school', ageFrom: '2' }, { teachers })).toBe('Vanus „alates” peab olema 3–18 aastat.');
    expect(groupFormError({ ...ok, audience: 'school', ageFrom: '12', ageTo: '9' }, { teachers })).toBe('Vanus „alates” on suurem kui „kuni”.');
  });
  it('ignores ages of an adult group and asks for the date of a teacher change', () => {
    expect(groupFormError({ ...ok, audience: 'adult', ageFrom: '1' }, { teachers })).toBe('');
    expect(groupFormError({ ...ok, teacherFrom: '' }, { teachers, teacherChanged: true })).toBe('Vali kuupäev, millest alates uus õpetaja tunde annab.');
    expect(groupFormError({ ...ok, teacherFrom: '2026-11-10' }, { teachers, teacherChanged: true })).toBe('');
  });
});

describe('group lesson length', () => {
  it('offers 45 / 60 / 90 / 120 and any other length as „custom”', () => {
    expect(durationChoice(60)).toBe('60');
    expect(durationChoice('120')).toBe('120');
    expect(durationChoice(75)).toBe(CUSTOM_DURATION);
  });
  it('accepts 5–480 minutes', () => {
    expect(lessonDuration('75')).toEqual({ minutes: 75 });
    expect(lessonDuration('')).toEqual({ error: 'Sisesta tunni kestus minutites.' });
    expect(lessonDuration('4').error).toMatch('5–480');
    expect(lessonDuration('481').error).toMatch('5–480');
  });
});

describe('help texts', () => {
  it('every help has a text and an example', () => {
    Object.values(GROUP_HELP).forEach((entry) => { expect(entry.text.length).toBeGreaterThan(10); expect(entry.example).toBeTruthy(); });
  });
});
