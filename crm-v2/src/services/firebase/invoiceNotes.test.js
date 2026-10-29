import { describe, expect, it, vi } from 'vitest';
import { INVOICE_NOTE_MAX, invoiceNoteRecord, saveCreationNote } from './invoiceNotes.js';

describe('invoice internal note', () => {
  const now = new Date('2026-10-29T10:00:00.000Z');
  it('keeps exactly the fields the rules allow, with the writer and the time', () => {
    expect(invoiceNoteRecord('inv-1', '  8 tundi + õpik  ', { uid: 'u1', displayName: 'Admin' }, now)).toEqual({
      invoiceId: 'inv-1', text: '8 tundi + õpik', updatedAt: '2026-10-29T10:00:00.000Z', updatedByUid: 'u1', updatedByName: 'Admin',
    });
  });
  it('allows an empty text (clears the note) but not a missing invoice, writer or an over-long text', () => {
    expect(invoiceNoteRecord('inv-1', '', { uid: 'u1', email: 'a@example.com' }, now)).toMatchObject({ text: '', updatedByName: 'a@example.com' });
    expect(() => invoiceNoteRecord('', 'x', { uid: 'u1' })).toThrow('Arve puudub');
    expect(() => invoiceNoteRecord('inv-1', 'x', {})).toThrow('Sisselogimine');
    expect(() => invoiceNoteRecord('inv-1', 'x'.repeat(INVOICE_NOTE_MAX + 1), { uid: 'u1' })).toThrow(String(INVOICE_NOTE_MAX));
  });
  it('saves a note typed when the invoice was made and reports a failure without throwing', async () => {
    const repository = { save: vi.fn().mockResolvedValue({ id: 'inv-1', text: 'x' }) };
    expect(await saveCreationNote(repository, { id: 'inv-1' }, '  ')).toEqual({});
    expect(repository.save).not.toHaveBeenCalled();
    expect(await saveCreationNote(repository, { id: 'inv-1' }, ' x ')).toEqual({ note: { id: 'inv-1', text: 'x' } });
    expect(repository.save).toHaveBeenCalledWith('inv-1', 'x');
    repository.save.mockRejectedValueOnce(new Error('Missing or insufficient permissions.'));
    expect(await saveCreationNote(repository, { id: 'inv-1' }, 'x')).toEqual({ noteError: 'Missing or insufficient permissions.' });
  });
});
