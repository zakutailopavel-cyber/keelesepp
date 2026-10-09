import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AssetContext } from '../engine/assets.jsx';
import { SpeakPanel } from './Speak.jsx';

function wavBlob(samples = 20) {
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);
  const w = (at, t) => [...t].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  w(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); w(8, 'WAVE'); w(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, 22050, true); view.setUint32(28, 44100, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); w(36, 'data'); view.setUint32(40, samples * 2, true);
  return { arrayBuffer: async () => buf };
}

describe('SpeakPanel', () => {
  it('is hidden where the host cannot speak', () => {
    const { container } = render(<SpeakPanel type="listening" data={{ sentences: 'Tere.' }} set={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('reads a dialogue with two voices, joins it and saves it as the block audio', async () => {
    const speak = vi.fn(async () => wavBlob());
    const audio = vi.fn(async (file) => ({ src: 'https://storage/x.wav', name: file.name, type: file.type }));
    const set = vi.fn();
    const data = { speakerA: 'Mari', speakerB: 'Jaan', voiceB: 'tambet', speed: 0.9, lines: [{ who: 'A', text: 'Tere, [Jaan]!' }, { who: 'B', text: 'Tere!' }] };
    render(<AssetContext.Provider value={{ image: vi.fn(), audio, speak }}><SpeakPanel type="dialogue" data={data} set={set} roles={[['voiceA', 'Mari'], ['voiceB', 'Jaan']]} /></AssetContext.Provider>);
    fireEvent.change(screen.getByLabelText('Mari: hääl'), { target: { value: 'vesta' } });
    expect(set).toHaveBeenCalledWith({ voiceA: 'vesta' });
    fireEvent.click(screen.getByRole('button', { name: 'Kiire' }));
    expect(set).toHaveBeenCalledWith({ speed: 1.15 });
    fireEvent.click(screen.getByRole('button', { name: 'Loo heli' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Valmis'));
    expect(speak.mock.calls.map(([r]) => r)).toEqual([{ text: 'Tere, Jaan!', speaker: 'mari', speed: 0.9 }, { text: 'Tere!', speaker: 'tambet', speed: 0.9 }]);
    expect(audio.mock.calls[0][0].type).toBe('audio/wav');
    expect(set).toHaveBeenLastCalledWith({ audio: expect.objectContaining({ src: 'https://storage/x.wav', tts: { speed: 0.9, voices: { voiceA: 'mari', voiceB: 'tambet' } } }) });
  });

  it('shows the service error', async () => {
    const speak = vi.fn(async () => { throw new Error('Kõnesüntees ei vastanud.'); });
    render(<AssetContext.Provider value={{ image: vi.fn(), audio: vi.fn(), speak }}><SpeakPanel type="reading" data={{ passage: 'Tere.' }} set={vi.fn()} /></AssetContext.Provider>);
    fireEvent.click(screen.getByRole('button', { name: 'Loo heli' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kõnesüntees ei vastanud.');
  });
});
