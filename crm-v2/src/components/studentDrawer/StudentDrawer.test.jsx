import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { openStudentDrawer } from './studentDrawer.js';

vi.mock('../../features/students/StudentProfilePage.jsx', () => ({ default: ({ studentId, embedded }) => <p>Kaart {studentId} {embedded ? 'paneelis' : ''}</p> }));
const { default: StudentDrawer } = await import('./StudentDrawer.jsx');

describe('StudentDrawer', () => {
  it('without a drawer nothing opens (the caller falls back to the page)', () => {
    expect(openStudentDrawer('s1')).toBe(false);
  });

  it('opens the full card over the page and closes with Escape', async () => {
    render(<MemoryRouter><StudentDrawer /></MemoryRouter>);
    let opened;
    act(() => { opened = openStudentDrawer('s1'); });
    expect(opened).toBe(true);
    expect(await screen.findByText('Kaart s1 paneelis')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava täislehena/ })).toHaveAttribute('href', '/students/s1');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Õpilase kaart' })).not.toBeInTheDocument();
  });
});
