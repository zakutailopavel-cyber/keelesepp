/* global Blob, File */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AssetContext } from '../engine/assets.jsx';
import { AudioPick } from '../engine/blocks/extra.jsx';
import { BLOCKS } from '../engine/registry.js';
import { recordingExt, recordingType } from './VoiceRecorder.jsx';
import MediaBankPanel from '../MediaBankPanel.jsx';
import { extractAssets, mediaAsset, searchAssets } from '../mediaBank.js';

class FakeRecorder {
  constructor(stream, options) { this.stream = stream; this.mimeType = options?.mimeType || 'audio/webm'; this.state = 'inactive'; FakeRecorder.last = this; }
  start() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['voice'], { type: this.mimeType }) });
    this.onstop?.();
  }
}
FakeRecorder.isTypeSupported = (type) => type === 'audio/webm;codecs=opus';

describe('teacher voice recording („Salvesta hääl”)', () => {
  const track = { stop: vi.fn() };
  beforeEach(() => {
    window.MediaRecorder = FakeRecorder;
    globalThis.MediaRecorder = FakeRecorder;
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track] }) } });
    URL.createObjectURL = vi.fn(() => 'blob:take');
    URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => { delete window.MediaRecorder; delete globalThis.MediaRecorder; });

  it('records, previews, records again and saves through the normal audio upload', async () => {
    const audio = vi.fn(async (file) => ({ src: 'https://storage/haal.webm', storagePath: 'curriculum/haal.webm', name: file.name, type: file.type }));
    const onChange = vi.fn();
    render(<AssetContext.Provider value={{ audio }}><AudioPick value={null} onChange={onChange} /></AssetContext.Provider>);
    fireEvent.click(screen.getByRole('button', { name: /Salvesta hääl/ }));
    fireEvent.click(screen.getByRole('button', { name: /Alusta salvestamist/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Lõpeta/ }));
    expect(track.stop).toHaveBeenCalled();
    expect(await screen.findByLabelText('Salvestuse eelkuulamine')).toHaveAttribute('src', 'blob:take');
    // once more
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta uuesti' }));
    fireEvent.click(await screen.findByRole('button', { name: /Lõpeta/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Kasuta seda' }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const file = audio.mock.calls[0][0];
    expect(file.type).toBe('audio/webm');
    expect(file.name).toMatch(/^haal-\d+\.webm$/);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ src: 'https://storage/haal.webm', recorded: true }));
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('says so when the microphone is refused', async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('NotAllowedError'));
    render(<AudioPick value={null} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Salvesta hääl/ }));
    fireEvent.click(screen.getByRole('button', { name: /Alusta salvestamist/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Mikrofoni ei saanud kasutada');
  });

  it('picks a recording format the browser has', () => {
    expect(recordingType((type) => type === 'audio/mp4')).toBe('audio/mp4');
    expect(recordingType(() => false)).toBe('');
    expect(recordingExt('audio/mp4')).toBe('m4a');
    expect(recordingExt('audio/ogg')).toBe('ogg');
    expect(recordingExt('audio/webm')).toBe('webm');
  });

  it('is hidden where the browser cannot record', () => {
    delete window.MediaRecorder;
    delete globalThis.MediaRecorder;
    render(<AudioPick value={null} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Salvesta hääl/ })).toBeNull();
  });
});

describe('video block editor', () => {
  it('a link shows its preview; a strange link is named; a video file goes through assets.video', async () => {
    const set = vi.fn();
    const Editor = BLOCKS.video.Editor;
    const { rerender } = render(<Editor data={{ ...BLOCKS.video.create(), url: 'https://example.com/x' }} set={set} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Seda linki ei tunne');
    rerender(<Editor data={{ ...BLOCKS.video.create(), url: 'https://youtu.be/dQw4w9WgXcQ', start: '0:30' }} set={set} />);
    expect(screen.getByTitle('Eelvaade').getAttribute('src')).toContain('start=30');
    expect(screen.getByText(/YouTube · alates 0:30/)).toBeInTheDocument();

    const video = vi.fn(async (file) => ({ src: 'https://storage/v.mp4', storagePath: 'curriculum/v.mp4', name: file.name }));
    rerender(<AssetContext.Provider value={{ video }}><Editor data={BLOCKS.video.create()} set={set} /></AssetContext.Provider>);
    const input = screen.getByLabelText('Videofail');
    fireEvent.change(input, { target: { files: [new File(['x'], 'tund.mp4', { type: 'video/mp4' })] } });
    await waitFor(() => expect(set).toHaveBeenCalledWith({ file: expect.objectContaining({ src: 'https://storage/v.mp4' }) }));
    const big = new File(['x'], 'suur.mp4', { type: 'video/mp4' });
    Object.defineProperty(big, 'size', { value: 25 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [big] } });
    expect(await screen.findByText(/liiga suur/)).toBeInTheDocument();
    expect(video).toHaveBeenCalledTimes(1);
  });
});

describe('media bank: sounds and videos', () => {
  const doc = { meta: { title: 'Turul', level: 'B1' }, blocks: [
    { id: 'l1', type: 'listening', data: { title: 'Kuula.', audio: { src: 'https://storage/turg.mp3', storagePath: 'curriculum/turg.mp3', name: 'turg.mp3' } } },
    { id: 'v1', type: 'video', data: { url: 'https://youtu.be/dQw4w9WgXcQ', caption: 'Intervjuu turul' } },
    { id: 'v2', type: 'video', data: { file: { src: 'https://storage/kala.mp4', storagePath: 'curriculum/kala.mp4', name: 'kala.mp4' }, caption: '' } },
    { id: 'r1', type: 'reading', data: { audio: { src: 'data:audio/wav;base64,AAAA' } } },
  ] };

  it('finds every sound and video of a sheet (not inline data)', () => {
    const { media } = extractAssets(doc);
    expect(media.map((asset) => [asset.kind, asset.src])).toEqual([
      ['audio', 'https://storage/turg.mp3'], ['video', 'https://youtu.be/dQw4w9WgXcQ'], ['video', 'https://storage/kala.mp4'],
    ]);
    expect(media[0]).toMatchObject({ level: 'B1', title: 'turg.mp3', storagePath: 'curriculum/turg.mp3' });
    expect(media[1].caption).toBe('Intervjuu turul');
    expect(searchAssets(media, { query: 'intervjuu', kind: 'video' })).toHaveLength(1);
    expect(mediaAsset('audio', { src: 'x' }).key).not.toBe(mediaAsset('video', { src: 'x' }).key);
  });

  it('the bank has sound and video tabs (the type filter) that put the item on the sheet', async () => {
    const { media } = extractAssets(doc);
    const service = { list: vi.fn().mockResolvedValue(media.map((asset) => ({ id: asset.key, ...asset }))) };
    const onAudio = vi.fn();
    const onVideo = vi.fn();
    render(<MediaBankPanel service={service} staticAssets={[]} onImage={vi.fn()} onText={vi.fn()} onWebImage={vi.fn()} onAudio={onAudio} onVideo={onVideo} />);
    fireEvent.click(await screen.findByRole('tab', { name: 'Heli (1)' }));
    expect(screen.getByLabelText('Kuula: turg.mp3')).toHaveAttribute('src', 'https://storage/turg.mp3');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa lehele: turg.mp3' }));
    expect(onAudio).toHaveBeenCalledWith(expect.objectContaining({ kind: 'audio', src: 'https://storage/turg.mp3' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Video (2)' }));
    expect(screen.getByText(/YouTube/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lisa lehele: Intervjuu turul' }));
    expect(onVideo).toHaveBeenCalledWith(expect.objectContaining({ kind: 'video', src: 'https://youtu.be/dQw4w9WgXcQ' }));
  });
});
