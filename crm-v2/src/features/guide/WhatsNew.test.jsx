import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { WhatsNewDialog } from './WhatsNew.jsx';
import { LATEST, releaseFor } from './whatsNew.js';

const memory = () => { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) }; };

describe('Mis uut (owner 2026-10-27)', () => {
  it('shows the newest release once after signing in; „Selge” hides it until the next release', () => {
    const storage = memory();
    const user = { uid: 'n1', roles: ['admin'] };
    const { unmount } = render(<MemoryRouter><WhatsNewDialog user={user} storage={storage} /></MemoryRouter>);
    expect(screen.getByRole('dialog', { name: new RegExp(LATEST.title) })).toBeInTheDocument();
    expect(screen.getByText(/Что сделать/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Selge' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    unmount();
    render(<MemoryRouter><WhatsNewDialog user={user} storage={storage} /></MemoryRouter>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('a teacher gets no admin to-dos; students and the preview get nothing', () => {
    const teacherView = releaseFor(LATEST, ['teacher']);
    expect(teacherView.todo).toEqual([]);
    expect(teacherView.sections.flatMap((section) => section.items).some((item) => item.audience === 'admin')).toBe(false);
    render(<MemoryRouter><WhatsNewDialog user={{ uid: 's1', roles: ['student'] }} storage={memory()} /><WhatsNewDialog user={{ uid: 'a', roles: ['admin'] }} preview={{}} storage={memory()} /></MemoryRouter>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
