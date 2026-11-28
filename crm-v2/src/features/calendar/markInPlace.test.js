import { describe, expect, it } from 'vitest';
import { withMarkedLesson } from './markInPlace.js';

const data = () => [
  [{ id: 'series-1', recurring: true, status: 'Planeeritud' }, { id: 'once-1', recurring: false, status: 'Planeeritud' }],
  { items: [{ id: 's1' }] },
  [],
  [{ id: 'old', status: 'Toimunud' }],
  [],
];

describe('a marked lesson shown without a reload', () => {
  it('adds the new record in front and leaves a weekly series entry alone', () => {
    const before = data();
    const after = withMarkedLesson(before, { id: 'new', status: 'Toimunud', scheduleId: 'series-1' }, { id: 'series-1', recurring: true });
    expect(after[3].map((lesson) => lesson.id)).toEqual(['new', 'old']);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(before[3]).toHaveLength(1); // the loaded data itself is not changed
  });

  it('a one-off lesson gets its status on the schedule entry too', () => {
    const after = withMarkedLesson(data(), { id: 'new', status: 'Puudus_eta' }, { id: 'once-1', recurring: false });
    expect(after[0].find((event) => event.id === 'once-1').status).toBe('Puudus_eta');
    expect(after[0].find((event) => event.id === 'series-1').status).toBe('Planeeritud');
  });

  it('a record that is already in the list is replaced, not doubled', () => {
    const after = withMarkedLesson(data(), { id: 'old', status: 'Puudus_p', alreadyMarked: true }, { id: 'series-1', recurring: true });
    expect(after[3]).toEqual([{ id: 'old', status: 'Puudus_p', alreadyMarked: true }]);
  });

  it('nothing loaded or no record: the data comes back untouched', () => {
    const before = data();
    expect(withMarkedLesson(before, null, {})).toBe(before);
    expect(withMarkedLesson(null, { id: 'x' }, {})).toBe(null);
  });
});
