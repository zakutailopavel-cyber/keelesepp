const test = require('node:test');
const assert = require('node:assert/strict');
const { appToday } = require('./local-date-core');

test('finance today follows Tallinn, not UTC', () => {
  assert.equal(appToday('2025-12-31T23:30:00.000Z'), '2026-01-01');
  assert.equal(appToday('2026-06-30T21:30:00.000Z'), '2026-07-01');
  assert.equal(appToday('2026-03-10T12:00:00.000Z'), '2026-03-10');
  assert.equal(appToday('2026-10-25T21:59:00.000Z'), '2026-10-25');
});
