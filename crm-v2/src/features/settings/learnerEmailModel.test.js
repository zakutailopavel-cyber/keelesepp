import { createRequire } from 'node:module';
import { DEFAULT_TEXTS, EMAIL_TYPES, logRow, normalizeEmailSettings, toggleType, unknownPlaceholders } from './learnerEmailModel.js';
import { settingsRecord } from '../../services/firebase/learnerEmails.js';

const require = createRequire(import.meta.url);
const server = require('../../../../functions/learner-email-core.js');

describe('E-kirjad model', () => {
  it('has the same types, default texts and placeholders as the server', () => {
    expect(EMAIL_TYPES.map((type) => type.id)).toEqual(server.TYPES);
    expect(DEFAULT_TEXTS).toEqual(server.DEFAULT_TEXTS);
    expect(Object.fromEntries(EMAIL_TYPES.map((type) => [type.id, type.placeholders]))).toEqual(server.PLACEHOLDERS);
  });

  it('is off by default and stores the full shape the rules require', () => {
    const settings = normalizeEmailSettings({});
    expect(EMAIL_TYPES.some(({ id }) => settings.types[id].enabled)).toBe(false);
    const record = settingsRecord(settings, { uid: 'admin-1', displayName: 'Owner' });
    expect(Object.keys(record).sort()).toEqual(['dailyHour', 'siteAddress', 'types', 'updatedAt', 'updatedBy', 'updatedByName']);
    expect(Object.keys(record.types)).toEqual(server.TYPES);
    expect(Object.keys(record.types.announcement).sort()).toEqual(['enabled', 'enabledAt', 'introEt', 'introRu', 'subjectEt', 'subjectRu']);
    expect(record.updatedBy).toBe('admin-1');
  });

  it('switching on records the time once; switching off keeps it', () => {
    const on = toggleType(normalizeEmailSettings({}), 'announcement', true, new Date('2026-10-25T10:00:00Z'));
    expect(on.types.announcement).toMatchObject({ enabled: true, enabledAt: '2026-10-25T10:00:00.000Z' });
    const again = toggleType(on, 'announcement', true, new Date('2026-10-26T10:00:00Z'));
    expect(again.types.announcement.enabledAt).toBe('2026-10-25T10:00:00.000Z');
    expect(toggleType(on, 'announcement', false).types.announcement).toMatchObject({ enabled: false, enabledAt: '2026-10-25T10:00:00.000Z' });
  });

  it('warns about placeholders the type does not know; the log row has no addresses', () => {
    expect(unknownPlaceholders('Homme {kell} {pealkiri}', 'lessonReminder')).toEqual(['pealkiri']);
    expect(unknownPlaceholders('Teade: {pealkiri}', 'announcement')).toEqual([]);
    expect(logRow({ id: '1', kind: 'lessonReminder', status: 'sent', recipientCount: 2, optedOut: 1, at: '2026-10-24T14:00:00Z' })).toMatchObject({ kind: 'Tunni meeldetuletus', status: 'saadetud', detail: '2 saajat · 1 loobunud' });
    expect(logRow({ id: '2', kind: 'lessonMoved', status: 'skipped', reason: 'unchanged' }).detail).toBe('muudatus võeti tagasi');
  });
});
