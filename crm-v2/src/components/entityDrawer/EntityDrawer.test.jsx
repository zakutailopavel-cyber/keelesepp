import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { openDrawer, openStudentDrawer } from './entityDrawer.js';

vi.mock('../../features/students/StudentProfilePage.jsx', () => ({ default: ({ studentId, embedded }) => <p>Kaart {studentId} {embedded ? 'paneelis' : ''}</p> }));
vi.mock('../../features/calendar/LessonDrawerPanel.jsx', () => ({ default: ({ scheduleId, date }) => <p>Tund {scheduleId} {date}</p> }));
vi.mock('../../features/finance/InvoiceDrawerPanel.jsx', () => ({ default: ({ invoiceId }) => <p>Arve {invoiceId}</p> }));
const { default: EntityDrawer } = await import('./EntityDrawer.jsx');

describe('EntityDrawer', () => {
  it('without a drawer nothing opens (the caller falls back to the page)', () => {
    expect(openStudentDrawer('s1')).toBe(false);
    expect(openDrawer({ kind: 'lesson', scheduleId: 'e1', date: '2026-11-09' })).toBe(false);
  });

  it('opens the full card over the page and closes with Escape', async () => {
    render(<MemoryRouter><EntityDrawer roles={['admin']} /></MemoryRouter>);
    let opened;
    act(() => { opened = openStudentDrawer('s1'); });
    expect(opened).toBe(true);
    expect(await screen.findByText('Kaart s1 paneelis')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava täislehena/ })).toHaveAttribute('href', '/students/s1');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Õpilase kaart' })).not.toBeInTheDocument();
  });

  it('one host shows a lesson and an invoice; an incomplete request opens nothing', async () => {
    render(<MemoryRouter><EntityDrawer roles={['teacher']} /></MemoryRouter>);
    expect(openDrawer({ kind: 'lesson', scheduleId: 'e1', date: '9.11' })).toBe(false);
    expect(openDrawer({ kind: 'nothing', id: 'x' })).toBe(false);
    act(() => { openDrawer({ kind: 'lesson', scheduleId: 'e1', date: '2026-11-09', studentId: 's1' }); });
    expect(await screen.findByText('Tund e1 2026-11-09')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava kalendris/ })).toHaveAttribute('href', `/calendar?lesson=${encodeURIComponent('e1:2026-11-09|2026-11-09')}`);
    // a teacher may not open Finantsid: the invoice opens, without the link to a page he cannot see
    act(() => { openDrawer({ kind: 'invoice', invoiceId: 'i1' }); });
    expect(await screen.findByText('Arve i1')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Arve' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ava Finantsid/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sulge: arve' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
