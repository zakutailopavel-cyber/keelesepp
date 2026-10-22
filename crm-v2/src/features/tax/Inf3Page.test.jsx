import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Inf3Page from './Inf3Page.jsx';
import TaxFormPage from './TaxFormPage.jsx';
import { isValidIsikukood, maskCode } from './isikukood.js';
import { Route, Routes } from 'react-router-dom';

const report = {
  year: 2025, regCode: '17270880', totalCents: 16000, companyCents: 0, xml: '<deklaratsioon/>',
  rows: [
    { studentId: 's1', studentName: 'Mia Tamm', studentCode: '49403136526', payerName: 'Kati Tamm', payerCode: '37605030299', amountCents: 12000, trainingType: 2, problems: [], ready: true },
    { studentId: 's2', studentName: 'Oskar Saar', studentCode: '', payerName: 'Pere Saar', payerCode: '', amountCents: 4000, trainingType: 2, problems: ['Õpilase isikukood puudub', 'Maksja isikukood puudub'], ready: false },
  ],
};

describe('INF 3', () => {
  it('the isikukood check matches the server rule and codes are shown masked', () => {
    expect(isValidIsikukood('37605030299')).toBe(true);
    expect(isValidIsikukood('37605030290')).toBe(false);
    expect(maskCode('37605030299')).toBe('376•••••299');
  });

  it('lists the rows with masked codes, the missing ones and a form link', async () => {
    const repository = { report: vi.fn().mockResolvedValue(report), save: vi.fn().mockResolvedValue({}), link: vi.fn().mockResolvedValue({ url: 'https://crm/maksuandmed/abc' }) };
    render(<MemoryRouter><Inf3Page repository={repository} /></MemoryRouter>);
    expect(await screen.findByText('Mia Tamm')).toBeInTheDocument();
    expect(screen.getByText('494•••••526')).toBeInTheDocument();
    expect(screen.queryByText('49403136526')).not.toBeInTheDocument();
    expect(screen.getByText('Õpilase isikukood puudub · Maksja isikukood puudub')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Vormi link' })).toHaveLength(1);
    fireEvent.click(screen.getAllByRole('button', { name: 'Muuda' })[1]);
    fireEvent.change(screen.getByLabelText('Õppija isikukood'), { target: { value: '49403136527' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByText('Isikukood ei ole korrektne.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Õppija isikukood'), { target: { value: '49403136526' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.save).toHaveBeenCalledWith('s2', { studentCode: '49403136526', payerCode: '', payerName: 'Pere Saar', trainingType: 2 }));
  });

  it("the parents' form checks the codes and sends one payer code for an adult learner", async () => {
    const post = vi.fn((path) => Promise.resolve(path === '/info' ? { ok: true, status: 200, body: { studentFirstName: 'Mia', school: 'E&P Koolitus OÜ' } } : { ok: true, status: 201, body: { ok: true } }));
    render(<MemoryRouter initialEntries={['/maksuandmed/tok123']}><Routes><Route path="/maksuandmed/:token" element={<TaxFormPage post={post} />} /></Routes></MemoryRouter>);
    expect(await screen.findByText(/Mia/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ET' }));
    fireEvent.change(screen.getByLabelText('Koolituse eest tasunud isiku ees- ja perekonnanimi'), { target: { value: 'Mia Tamm' } });
    fireEvent.click(screen.getByLabelText(/Õpin ise ja maksan ise/));
    fireEvent.change(screen.getByLabelText('Õppija isikukood'), { target: { value: '494 0313 6526' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saada' }));
    expect(await screen.findByText('Märgi kinnitus.')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Kinnitan, et andmed on õiged/));
    fireEvent.click(screen.getByRole('button', { name: 'Saada' }));
    await waitFor(() => expect(post).toHaveBeenCalledWith('/submit', { token: 'tok123', payerName: 'Mia Tamm', payerCode: '49403136526', studentCode: '49403136526', consent: true }));
    expect(await screen.findByText('Aitäh! Andmed on salvestatud.')).toBeInTheDocument();
  });
});
