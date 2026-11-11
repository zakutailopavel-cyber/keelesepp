// „Õpik” (owner 2026-11-11): a teacher edits and saves the textbook page, the admin publishes it or turns it down.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import ConfirmHost from '../../../components/ui/ConfirmHost.jsx';
import LessonWorksheetStudioPage from './LessonWorksheetStudioPage.jsx';
import { sampleDocument } from '../../worksheet-studio/engine/sample.js';

vi.setConfig({ testTimeout: 20_000 });
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const doc = () => ({ ...sampleDocument(), meta: { ...sampleDocument().meta, title: 'Kus? Kuhu? Kust?' } });
const record = (extra = {}) => ({ worksheetId: 'opik', role: 'focus', worksheetDoc: doc(), worksheetDocUpdatedAt: 'at-1', worksheetDocVersion: 3, worksheetDocStatus: 'published', publishedWorksheetDoc: doc(), publishedWorksheetDocVersion: 3, ...extra });
const repository = (current, extra = {}) => ({
  load: vi.fn().mockResolvedValue(current),
  loadLesson: vi.fn().mockResolvedValue({ id: 'a2-017', title: 'Kohakäänded' }),
  list: vi.fn().mockResolvedValue([current]),
  listVersions: vi.fn().mockResolvedValue([]),
  saveDraft: vi.fn(async ({ worksheetDoc, user }) => ({ ...current, worksheetDoc, worksheetDocStatus: 'draft', worksheetDocVersion: 4, worksheetDocUpdatedAt: 'at-2', review: { state: 'pending', byUid: user.uid, byName: user.displayName, at: '2026-11-11T10:00:00Z' } })),
  publish: vi.fn(),
  rejectReview: vi.fn(async ({ note }) => ({ ...current, review: { ...current.review, state: 'rejected', note, rejectedByName: 'Pavel', rejectedAt: '2026-11-11T11:00:00Z' } })),
  ...extra,
});
const renderAs = (roles, repo) => render(
  <MemoryRouter initialEntries={['/library/lessons/a2-017/worksheets/opik']}>
    <AuthContext.Provider value={{ user: { uid: `${roles[0]}-1`, displayName: roles[0] === 'admin' ? 'Pavel' : 'Mari', roles } }}>
      <Routes><Route path="/library/lessons/:lessonId/worksheets/:worksheetId" element={<LessonWorksheetStudioPage repository={repo} vocabularyRepository={{ load: vi.fn().mockResolvedValue({ lexicon: [] }) }} />} /></Routes>
    </AuthContext.Provider>
    <ConfirmHost />
  </MemoryRouter>,
);

describe('Õpik page: teachers save, the admin publishes', () => {
  it('a teacher has no „Avalda”; „Salvesta” sends the change, the page says it waits for the admin', async () => {
    const repo = repository(record());
    renderAs(['teacher'], repo);
    expect(await screen.findByText(/Õpiku lehte avaldab admin/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Avalda' })).toBeNull();
    expect(screen.getByText('Avaldab admin')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fail'));
    fireEvent.click(screen.getByRole('button', { name: /Laadi näidisleht/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Asenda' }));
    await screen.findByText(/salvestamata/);
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repo.saveDraft).toHaveBeenCalled());
    expect(await screen.findByText('Ootab avaldamist', { selector: 'b' })).toBeInTheDocument();
    expect(screen.getByText('Ootab avaldamist', { selector: '.st-publish-lock' })).toBeInTheDocument();
    expect(repo.publish).not.toHaveBeenCalled();
  });

  it('the admin sees the waiting change, compares it with the published page and turns it down with a note', async () => {
    const repo = repository(record({ worksheetDocStatus: 'draft', review: { state: 'pending', byUid: 'teacher-1', byName: 'Mari', at: '2026-11-11T10:00:00Z' } }));
    const { container } = renderAs(['admin'], repo);
    await screen.findByText('Ootab avaldamist', { selector: 'b' });
    expect(container.querySelector('.st-review.is-pending')).toHaveTextContent('muutis Mari');
    expect(screen.getByRole('button', { name: 'Avalda' })).toBeEnabled();
    fireEvent.click(within(container.querySelector('.st-review')).getByRole('button', { name: 'Võrdle avaldatuga' }));
    expect(screen.getByRole('region', { name: /Versioon 3 võrreldes praegusega/ })).toBeInTheDocument();
    fireEvent.click(within(container.querySelector('.st-review')).getByRole('button', { name: 'Lükka tagasi' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'Tabelis on viga.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lükka tagasi' }));
    await waitFor(() => expect(repo.rejectReview).toHaveBeenCalledWith(expect.objectContaining({ lessonId: 'a2-017', worksheetId: 'opik', note: 'Tabelis on viga.', baseUpdatedAt: 'at-1' })));
    expect(await screen.findByText(/Muudatus lükati tagasi/)).toBeInTheDocument();
  });

  it('a teacher sees the admin\'s note on a turned-down change', async () => {
    const { container } = renderAs(['teacher'], repository(record({ worksheetDocStatus: 'draft', review: { state: 'rejected', note: 'Tabelis on viga.', rejectedByName: 'Pavel', rejectedAt: '2026-11-11T11:00:00Z' } })));
    await screen.findByText(/Muudatus lükati tagasi/);
    expect(container.querySelector('.st-review.is-rejected')).toHaveTextContent('„Tabelis on viga.”');
  });

  it('other sheets keep „Avalda” for teachers', async () => {
    const current = { ...record(), worksheetId: 'practice', worksheetDocStatus: 'draft' };
    render(
      <MemoryRouter initialEntries={['/library/lessons/a2-017/worksheets/practice']}>
        <AuthContext.Provider value={{ user: { uid: 't', displayName: 'Mari', roles: ['teacher'] } }}>
          <Routes><Route path="/library/lessons/:lessonId/worksheets/:worksheetId" element={<LessonWorksheetStudioPage repository={repository(current)} vocabularyRepository={{ load: vi.fn().mockResolvedValue({ lexicon: [] }) }} />} /></Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('button', { name: 'Avalda' })).toBeInTheDocument();
    expect(screen.queryByText(/avaldab admin/i)).toBeNull();
  });
});
