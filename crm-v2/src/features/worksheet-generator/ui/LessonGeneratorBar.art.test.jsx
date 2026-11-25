import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import LessonGeneratorBar from './LessonGeneratorBar.jsx';

describe('LessonGeneratorBar textbook pictures', () => {
  it('offers the lesson picture of this sheet and inserts it once it is missing', async () => {
    // A2 module 1 v5 (2026-11-25): a2-001 is the diagnostic without a picture; a2-002 Harjuta has the name badges
    const repository = { loadLesson: vi.fn().mockResolvedValue({ id: 'a2-002', title: 'Tere! Kes sa oled?' }), list: vi.fn().mockResolvedValue([]) };
    const onInsertBlocks = vi.fn();
    const doc = { blocks: [{ id: 't', type: 'text', data: {} }] };
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a', roles: ['admin'] } }}><LessonGeneratorBar lessonId="a2-002" worksheetId="practice" doc={doc} onInsertBlocks={onInsertBlocks} repository={repository} vocabularyRepository={{ load: vi.fn().mockResolvedValue({ lexicon: [] }) }} /></AuthContext.Provider></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Lisa tunni pilt/ }));
    expect(onInsertBlocks).toHaveBeenCalledWith([expect.objectContaining({ type: 'image', span: 8, data: expect.objectContaining({ artId: 'a2-002-harjuta-2', caption: 'Kes ma olen? Neli nimesilti ja kaks küsimust.' }) }), expect.objectContaining({ type: 'notice', span: 4 })]);
    expect(screen.getByRole('status')).toHaveTextContent('Lehele lisati tunni pilt.');
  });
});

describe('LessonGeneratorBar on course sheets', () => {
  it('does not offer to regenerate a course sheet; it offers an extra sheet instead', async () => {
    const sheets = ['discover', 'practice', 'transfer'].map((id) => ({ worksheetId: id, worksheetDocStatus: 'published', publishedWorksheetDoc: { id: `ws_a2-001_${id}`, blocks: [] } }));
    const repository = { loadLesson: vi.fn().mockResolvedValue({ id: 'a2-001', title: 'A2 lähtediagnostika' }), list: vi.fn().mockResolvedValue(sheets) };
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a', roles: ['admin'] } }}><LessonGeneratorBar lessonId="a2-001" worksheetId="practice" doc={{ blocks: [] }} onPreviewSheet={vi.fn()} onInsertBlocks={vi.fn()} repository={repository} vocabularyRepository={{ load: vi.fn().mockResolvedValue({ lexicon: [] }) }} flagsService={{ list: vi.fn().mockResolvedValue([]) }} /></AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByText(/Kursuse lehed · generaator teeb lisalehe/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Genereeri 3 lehte uuesti/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Ainult see leht/ })).toBeNull();
    expect(screen.getByText(/Lisaleht/)).toBeInTheDocument();
  });
});

describe('LessonGeneratorBar „Kordamisleht”', () => {
  it('builds a review sheet from the course tasks and saves it as the lesson’s review draft', async () => {
    const sheets = ['discover', 'practice', 'transfer'].map((id) => ({ worksheetId: id, worksheetDocStatus: 'published', publishedWorksheetDoc: { id: `ws_a2-005_${id}`, blocks: [] } }));
    const repository = { loadLesson: vi.fn().mockResolvedValue({ id: 'a2-005', title: 'Kontroll 1' }), list: vi.fn().mockResolvedValue(sheets), saveDraft: vi.fn().mockResolvedValue({}) };
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a', roles: ['admin'] } }}><LessonGeneratorBar lessonId="a2-005" worksheetId="practice" doc={{ blocks: [] }} onInsertBlocks={vi.fn()} repository={repository} vocabularyRepository={{ load: vi.fn().mockResolvedValue({ lexicon: [] }) }} flagsService={{ list: vi.fn().mockResolvedValue([]) }} /></AuthContext.Provider></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Kordamisleht/ }));
    await waitFor(() => expect(repository.saveDraft).toHaveBeenCalled(), { timeout: 15000 });
    const input = repository.saveDraft.mock.calls[0][0];
    expect(input).toMatchObject({ lessonId: 'a2-005', worksheetId: 'review', role: 'focus', displayLabel: 'Kordamine' });
    expect(input.worksheetDoc.blocks.length).toBeGreaterThan(8);
  }, 30000);
});
