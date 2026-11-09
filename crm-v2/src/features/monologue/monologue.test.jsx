import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import MonologuePage from './MonologuePage.jsx';
import MonologuesCard from './MonologuesCard.jsx';
import { monthOf } from './monologueModel.js';

const month = monthOf(new Date());
const card = { id: 'c1', name: 'Mia', subject: 'Eesti keel', level: 'B1', linkedUserId: 'u1' };
const asStudent = { uid: 'u1', displayName: 'Mia', roles: ['student'] };

function fakeService(items = [], notes = {}, analyses = {}) {
  return {
    listAnalysis: vi.fn(async () => analyses),
    listByStudent: vi.fn(async () => items),
    submit: vi.fn(async () => ({})),
    audioUrl: vi.fn(async (path) => `blob:${path}`),
    listNotes: vi.fn(async () => notes),
    saveNote: vi.fn(async ({ monologue, text }) => ({ id: monologue.id, text })),
  };
}

function installRecorder() {
  const stop = vi.fn();
  globalThis.navigator.mediaDevices = { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })) };
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:take');
  globalThis.URL.revokeObjectURL = vi.fn();
  let recorder;
  globalThis.MediaRecorder = function MediaRecorder() {
    recorder = { mimeType: 'audio/webm;codecs=opus', state: 'recording', start: vi.fn(), stop: () => { recorder.state = 'inactive'; recorder.ondataavailable({ data: new globalThis.Blob(['x'], { type: 'audio/webm' }) }); recorder.onstop(); } };
    return recorder;
  };
}

const renderPage = (service, user = asStudent, extra = {}) => render(<MemoryRouter><AuthContext.Provider value={{ user, ...extra }}>
  <MonologuePage service={service} studentRepository={{ listOwned: vi.fn(async () => [card]), getById: vi.fn(async () => card) }} />
</AuthContext.Provider></MemoryRouter>);

describe('MonologuePage (student)', () => {
  it('shows the fixed prompt, records up to 2 minutes and sends this month’s monologue', async () => {
    installRecorder();
    const service = fakeService();
    renderPage(service);
    expect(await screen.findByRole('heading', { name: 'Räägi endast, oma päevast ja plaanidest' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Alusta/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Alusta salvestamist/ })); });
    expect(screen.getByText(/\/ 2:00/)).toBeInTheDocument();
    act(() => { fireEvent.click(screen.getByRole('button', { name: /Lõpeta/ })); });
    expect(screen.getByRole('button', { name: /Salvesta uuesti/ })).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada monoloog/ })); });
    const sent = service.submit.mock.calls[0][0];
    expect(sent).toMatchObject({ student: card, uid: 'u1', month, level: 'B1', existing: null });
    expect(sent.blob.type).toBe('audio/webm');
    expect(await screen.findByText(/Monoloog on saadetud/)).toBeInTheDocument();
  });

  it('this month done: play it or record again (replaces); earlier months below', async () => {
    const service = fakeService([
      { id: `c1_${month}`, studentId: 'c1', month, seconds: 104, audioPath: 'p1' },
      { id: 'c1_2020-01', studentId: 'c1', month: '2020-01', seconds: 70, audioPath: 'p0' },
    ]);
    renderPage(service);
    expect(await screen.findByText(/Selle kuu monoloog on salvestatud/)).toBeInTheDocument();
    expect(screen.getAllByText(/1:44/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Salvesta uuesti/ })).toBeInTheDocument();
    expect(screen.getByText(/Minu varasemad monoloogid \(1\)/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/märkus/i);
  });

  it('a card below A2 has no monologue', async () => {
    render(<MemoryRouter><AuthContext.Provider value={{ user: asStudent }}>
      <MonologuePage service={fakeService()} studentRepository={{ listOwned: vi.fn(async () => [{ ...card, level: 'A1' }]) }} />
    </AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByText('Kuu monoloogi praegu ei ole')).toBeInTheDocument();
  });

  it('an admin preview cannot record', async () => {
    renderPage(fakeService(), { uid: 'admin', roles: ['student'] }, { preview: { studentId: 'c1' } });
    expect(await screen.findByText(/Eelvaade/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Alusta$/ })).not.toBeInTheDocument();
  });
});

describe('MonologuesCard (student card → Areng)', () => {
  const items = [
    { id: 'c1_2026-11', studentId: 'c1', month: '2026-11', promptId: 'et-self-v1', seconds: 120, wordCount: 190, audioPath: 'b' },
    { id: 'c1_2026-10', studentId: 'c1', month: '2026-10', promptId: 'et-self-v1', seconds: 75, audioPath: 'a' },
  ];

  it('lists months with duration, words and words per minute', async () => {
    render(<MonologuesCard student={card} user={{ uid: 't1' }} service={fakeService(items)} />);
    const list = await screen.findByRole('list');
    const rows = within(list).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent(/november 2026/);
    expect(rows[0]).toHaveTextContent('2:00');
    expect(rows[0]).toHaveTextContent('190 sõna');
    expect(rows[0]).toHaveTextContent('95 sõna/min');
    expect(rows[1]).toHaveTextContent('1:15');
    expect(rows[1]).toHaveTextContent('teksti veel pole');
  });

  it('„Võrdle” puts the oldest and the newest month side by side and plays them', async () => {
    const service = fakeService(items);
    render(<MonologuesCard student={card} user={{ uid: 't1' }} service={service} />);
    fireEvent.click(await screen.findByRole('button', { name: /Võrdle/ }));
    const compare = screen.getByLabelText('Kahe kuu võrdlus');
    const selects = within(compare).getAllByRole('combobox');
    expect(selects.map((select) => select.value)).toEqual(['c1_2026-10', 'c1_2026-11']);
    const plays = within(compare).getAllByRole('button', { name: 'Kuula' });
    await act(async () => { fireEvent.click(plays[0]); });
    expect(service.audioUrl).toHaveBeenCalledWith('a');
    expect(within(compare).getByLabelText(/Monoloog oktoober 2026/)).toHaveAttribute('src', 'blob:a');
  });

  it('the teacher writes a short note', async () => {
    const service = fakeService(items, { 'c1_2026-10': { id: 'c1_2026-10', text: 'Pausid pikad.' } });
    render(<MonologuesCard student={card} user={{ uid: 't1' }} service={service} />);
    expect(await screen.findByText(/Pausid pikad\./)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Lisa märkus/ })[0]);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Palju vabam.' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta' })); });
    expect(service.saveNote).toHaveBeenCalledWith(expect.objectContaining({ monologue: items[0], text: 'Palju vabam.' }));
    await waitFor(() => expect(screen.getByText(/Palju vabam\./)).toBeInTheDocument());
  });

  it('shows the Mac\'s error check of this take: top topics, the text and the flagged sentences', async () => {
    const withText = [{ ...items[0], updatedAt: 't2', transcriptText: 'Eile ma läksin pood.' }, items[1]];
    const analyses = {
      'c1_2026-11': { id: 'c1_2026-11', take: 't2', checked: 6, errors: [{ said: 'Eile ma läksin pood.', corrected: 'Eile ma läksin poodi.', kind: 'vorm' }],
        focus: [{ key: 'cases', topic: 'Падеж после глагола и места: kuhu? kus?', count: 2 }] },
      'c1_2026-10': { id: 'c1_2026-10', take: 'old', checked: 3, errors: [], focus: [] },
    };
    render(<MonologuesCard student={card} user={{ uid: 't1' }} service={fakeService(withText, {}, analyses)} />);
    const rows = [...(await screen.findAllByRole('list'))[0].children];
    expect(rows[0]).toHaveTextContent('6 lauset kontrollitud, 1 võimalikku viga: Падеж после глагола и места (2)');
    expect(within(rows[0]).getByText('Tekst ja vead')).toBeInTheDocument();
    expect(rows[0]).toHaveTextContent('Eile ma läksin poodi.');
    expect(rows[1]).not.toHaveTextContent('lauset kontrollitud');
  });

  it('works without the error check (rules not deployed)', async () => {
    const service = fakeService(items);
    service.listAnalysis = vi.fn(async () => { throw new Error('Missing or insufficient permissions.'); });
    render(<MonologuesCard student={card} user={{ uid: 't1' }} service={service} />);
    expect(await screen.findByText('190 sõna')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('no recordings yet', async () => {
    render(<MonologuesCard student={card} user={{ uid: 't1' }} service={fakeService([])} />);
    expect(await screen.findByText('Salvestusi veel pole.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Võrdle/ })).not.toBeInTheDocument();
  });
});
