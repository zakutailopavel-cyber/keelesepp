'use strict';
// „Prügikast” rules (functions/card-trash-core.js): trash / restore fields, what blocks a delete, and the purge
// decision delete vs anonymise vs block.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('./card-trash-core');

const NOW = '2026-11-03T10:00:00.000Z';
const LATER = '2026-11-10T10:00:01.000Z';
const actor = { uid: 'admin-1', name: 'Oleksiy' };

test('trash: a student is hidden (active false), the old value and a 7-day purge date are kept', () => {
  const patch = core.trashPatch('student', { name: 'Mari', active: true }, { actor, nowIso: NOW });
  assert.equal(patch.active, false);
  assert.equal(patch.deletedAt, NOW);
  assert.deepEqual(patch.deletedBy, { uid: 'admin-1', name: 'Oleksiy' });
  assert.equal(patch.purgeAfter, '2026-11-10T10:00:00.000Z');
  assert.deepEqual(patch.trashState, { active: true });
  assert.equal(core.trashPatch('student', { active: false }, { actor, nowIso: NOW }).trashState.active, false, 'an archived card stays archived after restore');
});

test('trash: a teacher is disabled (signed out by the rules), restore gives back the old value', () => {
  const patch = core.trashPatch('teacher', { displayName: 'Jelena', role: 'teacher' }, { actor, nowIso: NOW });
  assert.equal(patch.disabled, true);
  assert.deepEqual(patch.trashState, { disabled: false });
  const back = core.restoreChange('teacher', { ...patch }, { nowIso: LATER });
  assert.equal(back.set.disabled, false);
  assert.deepEqual(back.remove, core.TRASH_FIELDS);
  const wasPaused = core.restoreChange('teacher', core.trashPatch('teacher', { disabled: true }, { nowIso: NOW }), { nowIso: LATER });
  assert.equal(wasPaused.set.disabled, true);
});

test('restore: only a card in the trash, never a purged one', () => {
  const back = core.restoreChange('student', core.trashPatch('student', { active: true }, { nowIso: NOW }), { nowIso: LATER });
  assert.equal(back.set.active, true);
  assert.equal(back.set.restoredFromTrashAt, LATER);
  assert.throws(() => core.restoreChange('student', { active: true }), /ei ole prügikastis/);
  assert.throws(() => core.restoreChange('student', { deletedAt: NOW, purgedAt: LATER }), /lõplikult/);
});

test('blockers: lessons ahead and an active group block, past and cancelled lessons do not', () => {
  const card = { name: 'Mari', active: true };
  const today = '2026-11-03';
  assert.deepEqual(core.trashBlockers('student', { id: 's1', card, schedule: [
    { date: '2026-10-01', status: 'Toimunud' },
    { date: '2026-11-20', status: 'Tühistatud' },
    { day: 'E', recurring: true, endDate: '2026-10-31' },
  ], today }), []);
  const ahead = core.trashBlockers('student', { id: 's1', card, schedule: [{ date: '2026-11-03', status: 'Planeeritud' }, { day: 'K', time: '10:00' }], today });
  assert.equal(ahead.length, 1);
  assert.equal(ahead[0].code, 'future-lessons');
  assert.equal(ahead[0].count, 2);
  assert.match(ahead[0].message, /2 eesootavat tundi/);
  const group = core.trashBlockers('student', { id: 's1', card, groups: [{ id: 'g1', name: 'A2 õhtu', active: true }, { id: 'g2', active: false }], today });
  assert.deepEqual(group.map((item) => item.code), ['active-group']);
  assert.match(group[0].message, /A2 õhtu/);
});

test('blockers: a teacher card — only role teacher, never the own account, lessons ahead block', () => {
  const today = '2026-11-03';
  assert.deepEqual(core.trashBlockers('teacher', { id: 't1', card: { role: 'teacher' }, today, actorUid: 'admin-1' }), []);
  assert.deepEqual(core.trashBlockers('teacher', { id: 't1', card: { role: 'admin' }, today }).map((b) => b.code), ['not-teacher']);
  assert.deepEqual(core.trashBlockers('teacher', { id: 'admin-1', card: { role: 'teacher' }, today, actorUid: 'admin-1' }).map((b) => b.code), ['self']);
  const lessons = core.trashBlockers('teacher', { id: 't1', card: { role: 'teacher' }, schedule: [{ date: '2026-12-01' }], today });
  assert.equal(lessons[0].code, 'future-lessons');
  assert.match(lessons[0].message, /teisele õpetajale/);
  assert.deepEqual(core.trashBlockers('teacher', { id: 't1', card: { role: 'teacher', deletedAt: NOW }, today }).map((b) => b.code), ['trashed']);
});

test('purge decision: wait before the week is over, skip what is not in the trash', () => {
  const trashed = { name: 'Mari', ...core.trashPatch('student', { active: true }, { nowIso: NOW }) };
  assert.equal(core.purgeDecision({ card: trashed, now: '2026-11-09T10:00:00.000Z' }).action, 'wait');
  assert.equal(core.purgeDecision({ card: { name: 'Mari' }, now: LATER }).action, 'skip');
  assert.equal(core.purgeDecision({ card: { ...trashed, purgedAt: LATER }, now: LATER }).action, 'skip');
});

test('purge decision: no history → delete; audit records alone are not history', () => {
  const card = core.trashPatch('student', { active: true }, { nowIso: NOW });
  const decision = core.purgeDecision({ card, now: LATER, today: '2026-11-10', references: [
    { collection: 'activityLog', field: 'studentId', count: 3 },
    { collection: 'financialAudit', field: 'studentId', count: 1 },
    { collection: 'emailQueue', field: 'studentId', count: 1 },
  ] });
  assert.equal(decision.action, 'delete');
  assert.deepEqual(decision.references, []);
});

test('purge decision: invoices, payments, held lessons, homework, results, pay → anonymise (history stays)', () => {
  const card = core.trashPatch('student', { active: true }, { nowIso: NOW });
  for (const collection of ['invoices', 'payments', 'accountingEntries', 'lessons', 'schedule', 'homework', 'exerciseResults', 'worksheetAssignments', 'packageLedger', 'taxIdentities']) {
    const decision = core.purgeDecision({ card, now: LATER, today: '2026-11-10', references: [{ collection, field: 'studentId', count: 1 }] });
    assert.equal(decision.action, 'anonymise', collection);
    assert.equal(decision.references[0].collection, collection);
  }
  const teacher = core.trashPatch('teacher', { role: 'teacher' }, { nowIso: NOW });
  assert.equal(core.purgeDecision({ card: teacher, now: LATER, today: '2026-11-10', references: [{ collection: 'workSessions', field: 'staffUid', count: 4 }] }).action, 'anonymise');
});

test('purge decision: lessons ahead or an active group added during the week → block (nothing changes)', () => {
  const card = core.trashPatch('student', { active: true }, { nowIso: NOW });
  const ahead = core.purgeDecision({ card, now: LATER, today: '2026-11-10', schedule: [{ date: '2026-11-12' }], references: [{ collection: 'invoices', field: 'studentId', count: 1 }] });
  assert.equal(ahead.action, 'block');
  assert.equal(ahead.reason, 'future-lessons');
  assert.equal(core.purgeDecision({ card, now: LATER, today: '2026-11-10', groups: [{ active: true }] }).reason, 'active-group');
  assert.equal(core.purgeDecision({ card, now: LATER, today: '2026-11-10', schedule: [{ date: '2026-11-01' }] }).action, 'delete');
});

test('anonymised student: no name, contact or account link; ids and learning meaning stay', () => {
  const card = {
    name: 'Mari Maasikas', email: 'mari@example.com', phone: '+372 5555', parentName: 'Ema', parentEmail: 'ema@example.com',
    parentContacts: [{ name: 'Isa', phone: '1' }], facebook: 'mari.m', contactNotes: 'helistada õhtul', birthDate: '2012-01-01',
    linkedUserId: 'u1', studentUid: 'u1', linkedUserIds: ['u1'], linkedParentIds: ['p1'], linkedParentId: 'p1',
    subject: 'Eesti keel', level: 'A2', teacher: 'Jelena', teacherUid: 't1', enrollments: [{ subject: 'Eesti keel' }], skillMap: { a: 1 }, personId: 'person-1',
    ...core.trashPatch('student', { active: true }, { actor, nowIso: NOW }),
  };
  const out = core.anonymisedCard('student', 'AbC-123xyz', card, { nowIso: LATER });
  assert.equal(out.name, 'Kustutatud õpilane #AbC123');
  for (const key of ['email', 'phone', 'parentName', 'parentEmail', 'linkedUserId', 'studentUid', 'linkedParentId']) assert.equal(out[key], '', key);
  assert.deepEqual(out.linkedUserIds, []);
  assert.deepEqual(out.linkedParentIds, []);
  for (const key of ['parentContacts', 'facebook', 'contactNotes', 'birthDate', 'purgeAfter', 'trashState']) assert.equal(key in out, false, key);
  assert.equal(out.subject, 'Eesti keel');
  assert.equal(out.teacherUid, 't1');
  assert.deepEqual(out.skillMap, { a: 1 });
  assert.equal(out.personId, 'person-1');
  assert.equal(out.deletedAt, NOW);
  assert.equal(out.purgedAt, LATER);
  assert.equal(out.active, false);
  assert.equal(out.anonymised, true);
});

test('anonymised teacher: disabled, no e-mail or notes, role kept', () => {
  const out = core.anonymisedCard('teacher', 'uid9876543', { displayName: 'Jelena Tamm', email: 'j@example.com', phone: '5', staffNotes: 'x', role: 'teacher', calendarTone: 3, deletedAt: NOW }, { nowIso: LATER });
  assert.equal(out.displayName, 'Kustutatud õpetaja #uid987');
  assert.equal(out.email, '');
  assert.equal(out.disabled, true);
  assert.equal(out.role, 'teacher');
  assert.equal(out.calendarTone, 3);
  assert.equal('staffNotes' in out, false);
  assert.equal('phone' in out, false);
});

test('reference queries and skipped collections', () => {
  assert.deepEqual(core.referenceQueries('student', 's1').map((q) => q.field), ['studentId', 'studentIds', 'students', 'mergedInto']);
  assert.deepEqual(core.referenceQueries('teacher', 't1', { displayName: 'Jelena' }).map((q) => q.field), ['teacherUid', 'teacherUids', 'staffUid', 'assignedBy', 'createdByUid', 'teacher', 'teacherFull']);
  assert.equal(core.skipCollection('student', 'activityLog'), true);
  assert.equal(core.skipCollection('student', 'users'), true);
  assert.equal(core.skipCollection('student', 'studentAvailability'), true);
  assert.equal(core.skipCollection('student', 'invoices'), false);
  assert.equal(core.skipCollection('teacher', 'students'), false);
  assert.deepEqual(core.linkedAccountIds({ linkedUserId: 'u1', studentUid: 'u1', linkedParentIds: ['p1', 'p2'], parentUid: 'p1' }).sort(), ['p1', 'p2', 'u1']);
  assert.throws(() => core.cleanKind('parent'), /student või teacher/);
  assert.throws(() => core.cleanId('a/b'), /vigane/);
});
