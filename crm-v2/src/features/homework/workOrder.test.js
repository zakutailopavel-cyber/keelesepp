import { describe, expect, it } from 'vitest';
import { sortWorks } from './workOrder.js';

describe('sortWorks', () => {
  it('earliest deadline first, then Avasta → Harjuta → Kasuta inside a lesson', () => {
    const at = '2026-10-26T14:23:10.000Z';
    const items = [
      { id: 'r2', title: 'Kordamine 2 · Harjuta', lessonId: 'a2-l04', phase: 'practice', dueDate: '2026-11-09', assignedAt: '2026-10-26T14:24:00.000Z' },
      { id: 'b3', title: 'Ei läinud · Kasuta', lessonId: 'a2-l02', phase: 'transfer', dueDate: '2026-11-02', assignedAt: at },
      { id: 'a2', title: 'Si- või i-minevik? · Harjuta', lessonId: 'a2-l01', phase: 'practice', dueDate: '2026-10-30', assignedAt: at },
      { id: 'b1', title: 'Ei läinud · Avasta', lessonId: 'a2-l02', phase: 'discover', dueDate: '2026-11-02', assignedAt: at },
      { id: 'a1', title: 'Si- või i-minevik? · Avasta', lessonId: 'a2-l01', dueDate: '2026-10-30', assignedAt: at },
      { id: 'a3', title: 'Si- või i-minevik? · Kasuta', lessonId: 'a2-l01', phase: 'transfer', dueDate: '2026-10-30', assignedAt: at },
    ];
    expect(sortWorks(items).map((i) => i.id)).toEqual(['a1', 'a2', 'a3', 'b1', 'b3', 'r2']);
  });
});
