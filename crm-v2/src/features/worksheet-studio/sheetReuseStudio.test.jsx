import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import WorksheetStudioPage from './WorksheetStudioPage.jsx';
import { sampleDocument } from './engine/sample.js';
import { createBlock } from './engine/registry.js';

vi.setConfig({ testTimeout: 20_000 });
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
const repo = (doc = sampleDocument()) => ({
  load: vi.fn().mockResolvedValue({ document: doc, source: 'worksheetDoc', lesson: {}, baseUpdatedAt: 't0', status: 'draft', version: 1 }),
  save: vi.fn().mockResolvedValue({ id: 'les-1', created: false, title: 'Minu päev', updatedAt: 't1', version: 2, status: 'draft' }),
  uploadImage: vi.fn(),
  uploadAudio: vi.fn(),
});
const quiet = { list: vi.fn().mockResolvedValue([]), create: vi.fn(), remove: vi.fn(), save: vi.fn().mockResolvedValue({}) };

function renderLesson({ repository, reuse, sheetTemplates, lessonSheets }) {
  return render(
    <MemoryRouter initialEntries={['/library/lessons/les-1/worksheets/discover']}>
      <AuthContext.Provider value={{ user }}>
        <Routes>
          <Route path="/library/lessons/:lessonId/worksheets/:worksheetId" element={<WorksheetStudioPage repository={repository} templates={quiet} mediaBank={quiet} reuse={reuse} sheetTemplates={sheetTemplates} lessonSheets={lessonSheets} allowCopy={false} />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('constructor reuse', () => {
  it('„Teisalda”: copies the block to another phase of the lesson, then removes it here and saves the draft', async () => {
    const reuse = {
      listLessons: vi.fn().mockResolvedValue([{ id: 'les-1', title: 'Minu päev', type: 'lesson', worksheetPhases: { discover: { status: 'draft' }, practice: { status: 'published' } } }, { id: 'les-2', title: 'Perekond', type: 'lesson' }]),
      copyBlocks: vi.fn().mockResolvedValue({ ids: ['n1'] }),
      loadLessonSheets: vi.fn().mockResolvedValue([]),
      forget: vi.fn(),
    };
    const repository = repo();
    const { container } = renderLesson({ repository, reuse, sheetTemplates: quiet, lessonSheets: quiet });
    await screen.findByText('Töölehe konstruktor');
    const cards = () => [...container.querySelectorAll('.ws-page .ws-card')];
    const count = cards().length;
    const target = cards()[1];
    const blockId = target.dataset.block;
    fireEvent.click(target);
    fireEvent.click(within(await screen.findByRole('toolbar', { name: 'Ploki tööriistad' })).getByRole('button', { name: 'Teisalda või kopeeri teisele lehele…' }));
    const dialog = await screen.findByRole('dialog', { name: 'Kopeeri / Teisalda' });
    expect(await within(dialog).findByText('avaldatud — muudatus jääb mustandiks')).toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: /Avasta/ })).toBeDisabled();
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Teisalda' })[0]);
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Teisalda' }).at(-1));
    await waitFor(() => expect(reuse.copyBlocks).toHaveBeenCalledTimes(1));
    expect(reuse.copyBlocks.mock.calls[0][0]).toMatchObject({ lessonId: 'les-1', worksheetId: 'practice', blocks: [expect.objectContaining({ id: blockId })] });
    await waitFor(() => expect(cards()).toHaveLength(count - 1));
    await waitFor(() => expect(repository.save).toHaveBeenCalledTimes(1));
    expect(repository.save.mock.calls[0][0]).toMatchObject({ lessonId: 'les-1', status: 'draft', baseUpdatedAt: 't0' });
    expect(repository.save.mock.calls[0][0].document.blocks.some((b) => b.id === blockId)).toBe(false);
  });

  it('saves the sheet and the whole lesson as templates; a lesson template fills only the empty phases', async () => {
    const blocks = [createBlock('gaps')];
    const lessonTemplate = { id: 'tpl-1', kind: 'lesson', title: 'Pere tund', ownerUid: 'teacher-2', sheets: [
      { phase: 'discover', label: 'Avasta', doc: { ...sampleDocument(), meta: { ...sampleDocument().meta, title: 'Mallist' } } },
      { phase: 'practice', label: 'Harjuta', doc: { ...sampleDocument(), blocks } },
      { phase: 'transfer', label: 'Kasuta', doc: { ...sampleDocument(), blocks } },
    ] };
    const sheetTemplates = { list: vi.fn().mockResolvedValue([lessonTemplate]), create: vi.fn().mockImplementation(async (input) => ({ id: 'new', ...input })), archive: vi.fn() };
    const lessonSheets = {
      list: vi.fn().mockResolvedValue([{ worksheetId: 'practice', worksheetDoc: { ...sampleDocument(), blocks }, worksheetDocUpdatedAt: 'tp' }]),
      saveDraft: vi.fn().mockResolvedValue({}),
    };
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Minu mall');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    try {
      renderLesson({ repository: repo(), reuse: { forget: vi.fn() }, sheetTemplates, lessonSheets });
      await screen.findByText('Töölehe konstruktor');
      fireEvent.click(screen.getByRole('button', { name: 'Salvesta leht mallina…' }));
      await waitFor(() => expect(sheetTemplates.create).toHaveBeenCalledTimes(1));
      expect(sheetTemplates.create.mock.calls[0][0]).toMatchObject({ kind: 'sheet', title: 'Minu mall', sheets: [expect.objectContaining({ phase: 'discover' })] });

      fireEvent.click(screen.getByRole('button', { name: 'Salvesta terve tund mallina…' }));
      await waitFor(() => expect(sheetTemplates.create).toHaveBeenCalledTimes(2));
      expect(sheetTemplates.create.mock.calls[1][0].kind).toBe('lesson');
      expect(sheetTemplates.create.mock.calls[1][0].sheets.map((s) => s.phase)).toEqual(['discover', 'practice']);

      fireEvent.click(screen.getByRole('button', { name: 'Uus mallist…' }));
      const dialog = await screen.findByRole('dialog', { name: 'Uus mallist' });
      expect(within(dialog).getByText('Kiri linnavalitsusele')).toBeInTheDocument();
      fireEvent.click(await within(dialog).findByRole('button', { name: 'Täida tund' }));
      await waitFor(() => expect(lessonSheets.saveDraft).toHaveBeenCalledTimes(1));
      expect(lessonSheets.saveDraft.mock.calls[0][0]).toMatchObject({ lessonId: 'les-1', worksheetId: 'transfer', baseUpdatedAt: '', role: 'transfer' });
      expect(await screen.findByText(/mustandina salvestati Kasuta/)).toBeInTheDocument();
      expect(screen.getByText('Mallist', { selector: '.st-title b' })).toBeInTheDocument();
    } finally {
      promptSpy.mockRestore();
      confirmSpy.mockRestore();
    }
  });
});
