import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ConfirmHost, { askConfirm, askText } from './ConfirmHost.jsx';

describe('ConfirmHost', () => {
  it('falls back to the browser box when no host is mounted', async () => {
    const spy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    await expect(askConfirm('Kas kustutada?')).resolves.toBe(true);
    expect(spy).toHaveBeenCalledWith('Kas kustutada?');
    spy.mockRestore();
  });

  it('asks in the CRM dialog: yes, no and typed text', async () => {
    const view = render(<ConfirmHost />);
    let answer;
    act(() => { answer = askConfirm('Tühistada tund?', { confirmLabel: 'Tühista', danger: true }); });
    expect(screen.getByRole('dialog')).toHaveTextContent('Tühistada tund?');
    fireEvent.click(screen.getByRole('button', { name: 'Tühista' }));
    await expect(answer).resolves.toBe(true);

    act(() => { answer = askConfirm('Veel üks?'); });
    fireEvent.click(screen.getByRole('button', { name: 'Loobu' }));
    await expect(answer).resolves.toBe(false);

    act(() => { answer = askText('Põhjus?'); });
    fireEvent.change(screen.getByLabelText('Põhjus?'), { target: { value: 'Haige' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await expect(answer).resolves.toBe('Haige');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    view.unmount();
  });
});
