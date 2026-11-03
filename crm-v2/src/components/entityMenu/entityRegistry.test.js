import { describe, expect, it } from 'vitest';
import { rolesForRoute } from '../../app/accessPolicy.js';
import { hasAnyRole } from '../../utils/roles.js';
import { actionsFor, ENTITY_TYPES, entityAt, sheetPath } from './entityRegistry.js';

const ids = (type, roles, data = {}, extra) => actionsFor(type, roles, data, extra).map((action) => action.id);
const student = { studentId: 's1' };
const record = { name: 'Mia', active: true, parentPhone: '555' };

describe('entity menu registry: who gets which actions', () => {
  it('students and parents get no menu anywhere', () => {
    for (const type of Object.keys(ENTITY_TYPES)) {
      for (const roles of [['student'], ['parent'], []]) expect(ids(type, roles, { studentId: 's1', lessonId: 'l1', worksheetId: 'discover', blockId: 'b1', invoiceId: 'i1', teacherUid: 't1' }, { record })).toEqual([]);
    }
  });

  it('a teacher keeps the student actions; the finance tab is for the administrator', () => {
    expect(ids('student', ['teacher'], student, { record })).toEqual(['open', 'rename', 'edit', 'write', 'calendar', 'new-sheet', 'board', 'copy-phone', 'archive']);
    expect(ids('student', ['admin'], student, { record })).toContain('finance');
    expect(ids('student', ['finance'], student, { record })).toEqual([]);
  });

  it('„Kustuta (prügikasti)” is for the administrator and opens the card window; a trashed card has no archive / delete', () => {
    expect(ids('student', ['teacher'], student, { record })).not.toContain('delete');
    expect(ids('student', ['admin'], student, { record })).toContain('delete');
    const remove = actionsFor('student', ['admin'], student, { record }).find((action) => action.id === 'delete');
    expect(remove.to(student)).toBe('/students/s1?kustuta=1');
    const trashed = { ...record, active: false, deletedAt: '2026-11-03T10:00:00.000Z' };
    expect(ids('student', ['admin'], student, { record: trashed })).not.toEqual(expect.arrayContaining(['delete']));
    expect(ids('student', ['admin'], student, { record: trashed })).not.toContain('restore');
    expect(ids('student', ['admin'], student, { record: trashed })).not.toContain('archive');
    expect(actionsFor('teacher', ['admin'], { teacherUid: 't1' }).find((action) => action.id === 'delete').to({ teacherUid: 't1' })).toBe('/teachers/t1?kustuta=1');
  });

  it('invoices are for the administrator and the accountant only', () => {
    expect(ids('invoice', ['teacher'], { invoiceId: 'i1' })).toEqual([]);
    expect(ids('invoice', ['finance'], { invoiceId: 'i1', studentId: 's1' })).not.toContain('student-finance');
    expect(ids('invoice', ['admin'], { invoiceId: 'i1', studentId: 's1' })).toContain('student-finance');
    expect(ids('invoice', ['finance'], { invoiceId: 'i1', invoiceNumber: '7' })).toContain('copy-number');
  });

  it('sheets and tasks are for staff; the accountant gets none', () => {
    const block = { lessonId: 'l1', worksheetId: 'practice', blockId: 'b1' };
    expect(ids('block', ['teacher'], block)).toEqual(['edit-block', 'edit-sheet', 'copy-link']);
    expect(ids('sheet', ['admin'], block)).toEqual(['edit', 'view', 'copy-link']);
    expect(ids('block', ['finance'], block)).toEqual([]);
    expect(ids('block', ['teacher'], { blockId: 'b1' })).toEqual([]); // a block outside a sheet has nowhere to open
  });

  it('teachers and admin-only actions follow the route access', () => {
    expect(ids('teacher', ['teacher'], { teacherUid: 't1' })).toEqual([]);
    expect(ids('teacher', ['admin'], { teacherUid: 't1' })).toEqual(['open', 'calendar', 'delete']);
    expect(ids('group', ['teacher'])).toEqual(['open']);
    expect(ids('group', ['admin'])).toEqual(['open', 'fill']);
  });

  it('no action offers a page its roles cannot open', () => {
    const data = { studentId: 's1', lessonId: 'l1', worksheetId: 'discover', blockId: 'b1', invoiceId: 'i1', teacherUid: 't1', invoiceNumber: '1', email: 'a@b.ee', phone: '1' };
    for (const roles of [['admin'], ['teacher'], ['finance']]) {
      for (const type of Object.keys(ENTITY_TYPES)) {
        for (const action of actionsFor(type, roles, data, { record })) {
          if (!action.to) continue;
          const path = action.to(data, { pathname: '/' }).split('?')[0];
          const pattern = typeof action.route === 'function' ? action.route(data) : action.route;
          expect(pattern, `${type}.${action.id}`).toBeTruthy();
          expect(hasAnyRole(roles, rolesForRoute(pattern)), `${roles} ${path}`).toBe(true);
        }
      }
    }
  });

  it('press actions appear only when the row has that button enabled', () => {
    const row = document.createElement('div');
    row.innerHTML = '<button data-entity-action="print">P</button><button data-entity-action="send" disabled>S</button>';
    expect(ids('invoice', ['finance'], {}, { element: row })).toEqual(['print']);
  });
});

describe('entityAt', () => {
  it('reads the nearest entity, a block with its sheet, and a student link inside a row', () => {
    const box = document.createElement('div');
    box.innerHTML = `
      <section data-entity="sheet" data-lesson-id="l1" data-worksheet-id="practice"><div data-entity="block" data-block-id="b2"><b id="task">x</b></div><h2 id="title">t</h2></section>
      <div data-entity="lesson" data-schedule-id="e1" data-date="2026-11-02" data-student-id="s9"><span id="lesson">10:00</span></div>
      <div data-entity="invoice" data-invoice-id="i1"><a id="name" href="/students/s3">Mia</a><span id="sum">10 €</span></div>`;
    expect(entityAt(box.querySelector('#task'))).toMatchObject({ type: 'block', data: { lessonId: 'l1', worksheetId: 'practice', blockId: 'b2' } });
    expect(entityAt(box.querySelector('#title'))).toMatchObject({ type: 'sheet', data: { lessonId: 'l1' } });
    expect(entityAt(box.querySelector('#lesson'))).toMatchObject({ type: 'lesson', data: { scheduleId: 'e1', studentId: 's9' } });
    expect(entityAt(box.querySelector('#name'))).toMatchObject({ type: 'student', data: { studentId: 's3' } });
    expect(entityAt(box.querySelector('#sum'))).toMatchObject({ type: 'invoice' });
  });

  it('builds the studio path of a lesson sheet and of an older one-sheet lesson', () => {
    expect(sheetPath({ lessonId: 'a b', worksheetId: 'opik' }, { plokk: 'x', tagasi: '' })).toBe('/library/lessons/a%20b/worksheets/opik?plokk=x');
    expect(sheetPath({ lessonId: 'w1' })).toBe('/library/worksheets/w1');
  });
});
