import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { teacherChoices, useTeacherNames } from './useTeacherNames.js';

describe('teacher choices for a student', () => {
  it('adds approved staff accounts to the legacy names and leaves out disabled ones', async () => {
    const repository = { list: vi.fn().mockResolvedValue([{ id: 'u1', name: 'Jegor Tamm' }, { id: 'u2', name: 'Vana Õpetaja', disabled: true }, { id: 'u3', name: 'Jelena' }]) };
    const { result } = renderHook(() => useTeacherNames(true, repository));
    await waitFor(() => expect(result.current).toEqual(['Jegor Tamm', 'Elena Zakutailo']));
    const choices = teacherChoices(result.current, ['pavel']);
    expect(choices).toContain('Jegor Tamm');
    expect(choices).not.toContain('Vana Õpetaja');
    expect(choices.filter((name) => name === 'Elena Zakutailo')).toHaveLength(1);
    expect(choices.filter((name) => name === 'Pavel Zakutailo')).toHaveLength(1);
  });

  it('does not ask for staff when the user may not assign teachers', () => {
    const repository = { list: vi.fn() };
    renderHook(() => useTeacherNames(false, repository));
    expect(repository.list).not.toHaveBeenCalled();
  });
});
