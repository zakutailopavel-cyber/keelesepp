import { describe, expect, it } from 'vitest';
import { kidsCurriculumRecords } from './kidsCurriculum.js';
import { KIDS_MODULES } from '../worksheet-generator/admin/course/kids/sheets.js';

describe('children’s courses in Õppevara', () => {
  const records = kidsCurriculumRecords();
  it('56 lessons with the ids, titles and levels of the sheets', () => {
    expect(records).toHaveLength(56);
    const lessons = Object.assign({}, ...KIDS_MODULES.map((mod) => Object.fromEntries(Object.entries(mod.LESSONS).map(([id, l]) => [id, { ...l, module: mod.MODULE }]))));
    records.forEach((r) => {
      expect(lessons[r.id], r.id).toBeDefined();
      expect(r.title).toBe(lessons[r.id].title);
      expect(r.level).toBe(lessons[r.id].module.level);
    });
  });
  it('every lesson has the teacher’s plan minute by minute and a home task', () => {
    records.forEach((r) => {
      expect(r.description, r.id).toMatch(/Ход урока \((45|60) мин\)|УРОК 1 \(45 мин\)/);
      expect(r.description, r.id).toMatch(/Домой \(родителям\)/);
      expect(r.description.split('\n').filter((l) => /^\d\. /.test(l)).length, r.id).toBeGreaterThanOrEqual(5);
    });
    expect(records.filter((r) => r.roadmapTag === 'Pidu').map((r) => r.id)).toEqual(['k56-012', 'k67-012', 'k89-012', 'k11-020']);
  });

  it('the speaking club 10–12: two lessons of 45 min with a snack, 12 meetings, in the „Lastele” tab', () => {
    const club = records.filter((r) => r.id.startsWith('k11-'));
    expect(club).toHaveLength(20);
    expect(club.map((r) => r.roadmapModuleNumber)).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]);
    expect(club.filter((r) => r.roadmapTag === 'Projekt').map((r) => r.id)).toEqual(['k11-004', 'k11-008', 'k11-012', 'k11-016']);
    club.forEach((r) => {
      expect(r.level).toBe('Klubi 10–12 a');
      expect(r.description, r.id).toMatch(/УРОК 1 \(45 мин\)[\s\S]*ПЕРЕКУС[\s\S]*УРОК 2 \(45 мин\)/);
      expect(r.contactMinutes).toBe(90);
    });
  });
});

describe('speaking club variety (owner 2026-11-21: „давай разбавим”)', () => {
  const club = kidsCurriculumRecords().filter((r) => r.id.startsWith('k11-'));
  it('every meeting has two movement breaks, a „Leia keegi” format, no stickers and the crossword at home', () => {
    for (const r of club) {
      expect(r.description.match(/Разминка-движение \(3 мин\)/g)?.length, r.id).toBe(2);
      expect(r.description, r.id).toMatch(/— сегодня (подписи|бинго|репортёр|наперегонки)/);
      expect(r.description, r.id).not.toMatch(/наклейк|Паспорт клуба/); // owner 2026-11-22: no stickers for 9–11
      expect(r.description, r.id).toMatch(/Кроссворд.* дома/);
    }
  });
  it('neighbouring meetings differ: other breaks, other „Leia keegi” format, other start of lesson 1', () => {
    const breaks = (d) => d.match(/Разминка-движение \(3 мин\): «([^»]+)»/g).join('|');
    const find = (d) => d.match(/— сегодня (\S+)/)[1];
    const first = (d) => d.split('УРОК 1 (45 мин):\n')[1].split('\n')[1];
    for (let i = 1; i < club.length; i += 1) {
      expect(breaks(club[i].description), club[i].id).not.toBe(breaks(club[i - 1].description));
      expect(find(club[i].description), club[i].id).not.toBe(find(club[i - 1].description));
      expect(first(club[i].description), club[i].id).not.toBe(first(club[i - 1].description));
    }
  });
  it('the talk grows: pairs in modules 1–2, threes in 3–4, the whole group in module 5', () => {
    const byId = Object.fromEntries(club.map((r) => [r.id, r.description]));
    expect(byId['k11-002']).toMatch(/Рассказ в парах/);
    expect(byId['k11-010']).toMatch(/Рассказ в тройках/);
    expect(byId['k11-018']).toMatch(/Минута рассказа \(8 мин\)/);
  });
});

describe('preschool module 1 with Kriksu (owner 2026-11-22)', () => {
  const young = kidsCurriculumRecords().filter((r) => /^k56-00[1-4]$/.test(r.id));
  it('lessons 1–4: comic, board game, stickers, 45 minutes; from lesson 2 a review of the last lesson', () => {
    for (const r of young) {
      expect(r.description, r.id).toMatch(/Kriksu \(4 мин\)/);
      expect(r.description, r.id).toMatch(/Lauamäng/);
      expect(r.description, r.id).toMatch(/наклейка в карточку Kriksu/);
      const minutes = [...r.description.matchAll(/^\d+\. [^(]*\((\d+) мин\)/gm)].reduce((sum, m) => sum + Number(m[1]), 0);
      expect(minutes, r.id).toBe(45);
      if (r.id !== 'k56-001') expect(r.description, r.id).toMatch(/Повторение с Kriksu/);
    }
  });
});

describe('speaking club module 1: every lesson is exactly 45 minutes (review 2026-11-22)', () => {
  const club = kidsCurriculumRecords().filter((r) => /^k11-00[1-4]$/.test(r.id));
  it('lesson 1 and lesson 2 add up to 45', () => {
    for (const r of club) {
      for (const part of ['УРОК 1 (45 мин):', 'УРОК 2 (45 мин):']) {
        const body = r.description.split(part)[1].split('\n\n')[0];
        const minutes = [...body.matchAll(/^\d+\. [^\n]*?\((\d+) мин/gm)].reduce((sum, m) => sum + Number(m[1]), 0);
        expect(minutes, `${r.id} ${part}`).toBe(45);
      }
    }
  });
});
