import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LeadsPage from './LeadsPage.jsx';

const lead = { id: 'l1', name: 'Mari Maasikas', email: 'mari@example.com', language: 'Eesti keel', level: 'A2', status: 'contacted', createdAt: '2031-05-04T10:00:00+03:00' };
const renderPage = (service) => render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a1', roles: ['admin'] } }}><LeadsPage service={service} studentRepository={{ list: vi.fn().mockResolvedValue({ items: [] }) }} /></AuthContext.Provider></MemoryRouter>);

describe('LeadsPage', () => {
  it('closes a lead', async () => {
    const service = { list: vi.fn().mockResolvedValue([lead]), updateStatus: vi.fn().mockResolvedValue({}) };
    renderPage(service);
    fireEvent.click(await screen.findByRole('button', { name: 'Sulge' }));
    expect(service.updateStatus).toHaveBeenCalledWith('l1', 'closed', expect.objectContaining({ uid: 'a1' }));
  });

  it('says so when a save fails', async () => {
    const service = { list: vi.fn().mockResolvedValue([lead]), updateStatus: vi.fn().mockRejectedValue(new Error('permission-denied')) };
    renderPage(service);
    fireEvent.click(await screen.findByRole('button', { name: 'Õppijaks' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Mari Maasikas: ei õnnestunud salvestada');
  });

  it('„Õppijaks” marks the lead and opens the new card with its details (router state, not the URL)', async () => {
    const service = { list: vi.fn().mockResolvedValue([{ ...lead, phone: '5551234' }]), updateStatus: vi.fn().mockResolvedValue({}) };
    let seen = null;
    function Students() { const location = useLocation(); seen = location; return <p>Õpilased</p>; }
    render(<MemoryRouter initialEntries={['/leads']}><AuthContext.Provider value={{ user: { uid: 'a1', roles: ['admin'] } }}><Routes><Route path="/leads" element={<LeadsPage service={service} studentRepository={{ list: vi.fn().mockResolvedValue({ items: [] }) }} />} /><Route path="/students" element={<Students />} /></Routes></AuthContext.Provider></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Õppijaks' }));
    expect(await screen.findByText('Õpilased')).toBeInTheDocument();
    expect(service.updateStatus).toHaveBeenCalledWith('l1', 'converted', expect.anything());
    expect(seen.search).toBe('');
    expect(seen.state.newStudent).toEqual(expect.objectContaining({ name: 'Mari Maasikas', email: 'mari@example.com', phone: '5551234', level: 'A2', subject: 'Eesti keel' }));
  });
});
