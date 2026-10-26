import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AiConnectPage from './AiConnectPage.jsx';

const query = '?response_type=code&client_id=kai_abcdefghijkl&redirect_uri=https%3A%2F%2Fchatgpt.com%2Fcb&state=s1&code_challenge=x&code_challenge_method=S256&scope=sheets';

describe('Ühenda KeeleSepp AI (OAuth consent)', () => {
  it('names the client, and „Luba” sends ChatGPT back with the code', async () => {
    const service = { describeClient: vi.fn().mockResolvedValue({ clientName: 'ChatGPT', redirectHost: 'chatgpt.com' }), approveClient: vi.fn().mockResolvedValue({ redirect: 'https://chatgpt.com/cb?code=c&state=s1' }) };
    const go = vi.fn();
    render(<MemoryRouter initialEntries={[`/ai/connect${query}`]}><AiConnectPage service={service} go={go} /></MemoryRouter>);
    expect(await screen.findByText(/soovib kasutada KeeleSepa konstruktorit/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Luba/ })); });
    expect(service.approveClient).toHaveBeenCalledWith(expect.objectContaining({ client_id: 'kai_abcdefghijkl', state: 's1', code_challenge_method: 'S256' }));
    expect(go).toHaveBeenCalledWith('https://chatgpt.com/cb?code=c&state=s1');
  });

  it('„Keela” answers access_denied; an unknown client shows an error', async () => {
    const go = vi.fn();
    const { unmount } = render(<MemoryRouter initialEntries={[`/ai/connect${query}`]}><AiConnectPage service={{ describeClient: vi.fn().mockResolvedValue({ clientName: 'ChatGPT', redirectHost: 'chatgpt.com' }), approveClient: vi.fn() }} go={go} /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /Keela/ }));
    expect(go).toHaveBeenCalledWith('https://chatgpt.com/cb?error=access_denied&state=s1');
    unmount();
    render(<MemoryRouter initialEntries={[`/ai/connect${query}`]}><AiConnectPage service={{ describeClient: vi.fn().mockRejectedValue(new Error('Unknown client.')) }} go={go} /></MemoryRouter>);
    expect(await screen.findByText('Unknown client.')).toBeInTheDocument();
  });
});
