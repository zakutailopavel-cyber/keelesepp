import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import VoiceAnswer from './VoiceAnswer.jsx';

describe('VoiceAnswer', () => {
  it('records, lets the student listen and sends the recording as a file', async () => {
    const stop = vi.fn();
    globalThis.navigator.mediaDevices = { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })) };
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:take');
    globalThis.URL.revokeObjectURL = vi.fn();
    let recorder;
    const factory = () => { recorder = { mimeType: 'audio/webm;codecs=opus', state: 'recording', start: vi.fn(), stop: () => { recorder.state = 'inactive'; recorder.ondataavailable({ data: new globalThis.Blob(['x'], { type: 'audio/webm' }) }); recorder.onstop(); } }; return recorder; };
    const onSend = vi.fn();
    render(<VoiceAnswer prompts={['Mida sa eile tegid?']} onSend={onSend} onCancel={vi.fn()} recorderFactory={factory} />);
    expect(screen.getByText('Mida sa eile tegid?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saada õpetajale/ })).toBeDisabled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Alusta salvestamist/ })); });
    act(() => { fireEvent.click(screen.getByRole('button', { name: /Lõpeta/ })); });
    expect(screen.getByLabelText('Sinu salvestus')).toHaveAttribute('src', 'blob:take');
    expect(stop).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Saada õpetajale/ }));
    const sent = onSend.mock.calls[0][0].file;
    expect(sent.name).toMatch(/^haalvastus-\d+s\.webm$/);
    expect(sent.type).toBe('audio/webm');
  });

  it('says so when the microphone is not allowed', async () => {
    globalThis.navigator.mediaDevices = { getUserMedia: vi.fn(async () => { throw new Error('denied'); }) };
    render(<VoiceAnswer onSend={vi.fn()} onCancel={vi.fn()} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Alusta salvestamist/ })); });
    expect(screen.getByRole('alert')).toHaveTextContent('Mikrofon ei ole lubatud');
  });
});
