import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

const api = vi.hoisted(() => ({ listStudents: vi.fn(), create: vi.fn() }));
vi.mock('../../services/firebase/manualInvoiceApi.js', () => ({ manualInvoiceApi: api }));

import ManualInvoiceDialog from './ManualInvoiceDialog.jsx';

describe('ManualInvoiceDialog', () => {
  it('loads the students once the dialog opens and creates the invoice', async () => {
    api.listStudents.mockResolvedValue([{ id: 's2', name: 'Milan' }, { id: 's1', name: 'Anna' }]);
    api.create.mockResolvedValue({ invoice: { id: 'inv-1' } });
    const onCreated = vi.fn();
    render(<ManualInvoiceDialog onCreated={onCreated} />);
    fireEvent.click(screen.getByRole('button', { name: /Lisa arve/ }));
    const select = await screen.findByLabelText('Õpilane');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Milan' })).toBeInTheDocument());
    expect(select).not.toBeDisabled();
    expect(api.listStudents).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Otsi õpilast'), { target: { value: 'mil' } });
    expect(screen.queryByRole('option', { name: 'Anna' })).not.toBeInTheDocument();
    expect(select).toHaveValue('s2');
    fireEvent.change(screen.getByLabelText('Kirjeldus'), { target: { value: 'Õpik' } });
    fireEvent.change(screen.getByLabelText('Summa (€)'), { target: { value: '12.50' } });
    const preview = screen.getByLabelText('Arve eelvaade');
    expect(within(preview).getByText('Milan')).toBeInTheDocument();
    expect(within(preview).getByText('Õpik')).toBeInTheDocument();
    expect(within(preview).getAllByText(/12,50/)).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Märkus'), { target: { value: 'sisemine' } });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    await waitFor(() => expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's2', description: 'Õpik', amount: '12.50', note: 'sisemine' })));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith({ id: 'inv-1' }));
  });

  it('creates the invoice and downloads the real generated PDF', async () => {
    api.listStudents.mockResolvedValue([{ id: 's1', name: 'Anna' }]);
    api.create.mockResolvedValue({ invoice: { id: 'inv-pdf' } });
    const deliveryApi = { pdf: vi.fn().mockResolvedValue({
      filename: 'arve-KS-2026-101.pdf', contentType: 'application/pdf', contentBase64: 'UERG',
    }) };
    const click = vi.spyOn(globalThis.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:invoice') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    render(<ManualInvoiceDialog deliveryApi={deliveryApi} />);
    fireEvent.click(screen.getByRole('button', { name: /Lisa arve/ }));
    await screen.findByRole('option', { name: 'Anna' });
    fireEvent.change(screen.getByLabelText('Õpilane'), { target: { value: 's1' } });
    fireEvent.change(screen.getByLabelText('Kirjeldus'), { target: { value: 'Keeletunnid' } });
    fireEvent.change(screen.getByLabelText('Summa (€)'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Loo ja laadi PDF/ }));
    await waitFor(() => expect(deliveryApi.pdf).toHaveBeenCalledWith('inv-pdf'));
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it('says what is missing when „Loo arve” is pressed on an empty form', async () => {
    api.listStudents.mockResolvedValue([{ id: 's1', name: 'Anna' }]);
    api.create.mockClear();
    render(<ManualInvoiceDialog />);
    fireEvent.click(screen.getByRole('button', { name: /Lisa arve/ }));
    await screen.findByRole('option', { name: 'Anna' });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Vali õpilane.');
    fireEvent.change(screen.getByLabelText('Õpilane'), { target: { value: 's1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Lisa arve kirjeldus.');
    expect(api.create).not.toHaveBeenCalled();
  });
});
