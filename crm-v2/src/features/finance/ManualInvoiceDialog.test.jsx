import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    fireEvent.change(screen.getByLabelText('Märkus'), { target: { value: 'sisemine' } });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    await waitFor(() => expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's2', description: 'Õpik', amount: '12.50', note: 'sisemine' })));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith({ id: 'inv-1' }));
  });
});
