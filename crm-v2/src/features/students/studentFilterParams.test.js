import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STUDENT_FILTERS,
  studentFiltersFromParams,
  studentFiltersToParams,
  studentListHref,
} from './studentFilterParams.js';

describe('student filter URL helpers', () => {
  it('uses stable defaults for an empty URL', () => {
    expect(studentFiltersFromParams(new URLSearchParams())).toEqual(DEFAULT_STUDENT_FILTERS);
  });

  it('restores every supported filter from URL parameters', () => {
    const params = new URLSearchParams({
      search: 'mari',
      status: 'archived',
      level: 'B2',
      teacher: 'Pavel',
      sort: 'teacher',
    });

    expect(studentFiltersFromParams(params)).toEqual({
      search: 'mari',
      status: 'archived',
      level: 'B2',
      teacher: 'Pavel',
      sort: 'teacher',
    });
  });

  it('omits default values from generated URLs', () => {
    expect(studentFiltersToParams(DEFAULT_STUDENT_FILTERS).toString()).toBe('');
    expect(studentListHref({ ...DEFAULT_STUDENT_FILTERS, level: 'C1' })).toBe('/students?level=C1');
  });
});
