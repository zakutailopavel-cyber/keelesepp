import { describe, expect, it } from 'vitest';
import { noteId, notesFor } from './lessonNotes.js';

const note = (scheduleId, date, text, updatedAt = '2026-11-01T10:00:00Z') => ({ id: noteId(scheduleId, date), scheduleId, date, text, updatedAt });

describe('notesFor', () => {
  it('finds the series note and the note of the date', () => {
    const notes = [note('s1', '', 'maksab isa'), note('s1', '2026-11-03', 'tuleb vennaga'), note('s1', '2026-11-10', 'veebis')];
    expect(notesFor(notes, { id: 's1', recurring: true, occurrenceDate: '2026-11-03' }).map((n) => n.text)).toEqual(['tuleb vennaga', 'maksab isa']);
    expect(notesFor(notes, { id: 's1', recurring: true, occurrenceDate: '2026-11-17' }).map((n) => n.text)).toEqual(['maksab isa']);
  });

  it('keeps the note of a one-off lesson moved to another day', () => {
    const notes = [note('one', '2026-11-03', 'vanem tasub sularahas')];
    expect(notesFor(notes, { id: 'one', recurring: false, occurrenceDate: '2026-11-05' }).map((n) => n.text)).toEqual(['vanem tasub sularahas']);
    // written again after the move: the newest is shown
    const again = [...notes, note('one', '2026-11-05', 'uus märkus', '2026-11-02T10:00:00Z')];
    expect(notesFor(again, { id: 'one', recurring: false, occurrenceDate: '2026-11-05' }).map((n) => n.text)).toEqual(['uus märkus']);
  });

  it('keeps the date note and the series note of a series lesson moved alone', () => {
    const notes = [note('s1', '', 'maksab isa'), note('s1', '2026-11-03', 'tuleb vennaga')];
    const moved = { id: 'new', recurring: false, occurrenceDate: '2026-11-04', movedFromSeriesId: 's1', movedFromDate: '2026-11-03' };
    expect(notesFor(notes, moved).map((n) => n.text)).toEqual(['tuleb vennaga', 'maksab isa']);
    // a note written on the moved lesson itself comes first
    const own = [...notes, note('new', '2026-11-04', 'oma märkus')];
    expect(notesFor(own, moved).map((n) => n.text)).toEqual(['oma märkus', 'maksab isa']);
  });

  it('keeps the series note when the series moves from a date on', () => {
    const notes = [note('s1', '', 'maksab isa')];
    expect(notesFor(notes, { id: 's2', recurring: true, occurrenceDate: '2026-11-12', continuesSeriesId: 's1' }).map((n) => n.text)).toEqual(['maksab isa']);
  });
});
