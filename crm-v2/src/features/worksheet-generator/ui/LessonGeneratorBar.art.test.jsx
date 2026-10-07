import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import LessonGeneratorBar from './LessonGeneratorBar.jsx';

describe('LessonGeneratorBar textbook pictures', () => {
  it('offers the lesson picture of this sheet and inserts it once it is missing', async () => {
    const repository = { loadLesson: vi.fn().mockResolvedValue({ id: 'a2-001', title: 'A2 lähtediagnostika' }), list: vi.fn().mockResolvedValue([]) };
    const onInsertBlocks = vi.fn();
    const doc = { blocks: [{ id: 't', type: 'text', data: {} }] };
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a', roles: ['admin'] } }}><LessonGeneratorBar lessonId="a2-001" worksheetId="discover" doc={doc} onInsertBlocks={onInsertBlocks} repository={repository} vocabularyRepository={{ load: vi.fn().mockResolvedValue({ lexicon: [] }) }} /></AuthContext.Provider></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Lisa tunni pilt/ }));
    expect(onInsertBlocks).toHaveBeenCalledWith([expect.objectContaining({ type: 'image', data: expect.objectContaining({ artId: 'a2-001-avasta-1', caption: 'Pilt 1. Anna tutvustab ennast keelekeskuses.' }) })]);
    expect(screen.getByRole('status')).toHaveTextContent('Lehele lisati tunni pilt.');
  });
});
