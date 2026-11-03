import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { clipLabel, embedUrl, fileUrl, formatTime, parseTime, parseVideoUrl, videoSource, watchUrl } from './video.js';
import { qrMatrix, qrVersionFor } from './qr.js';
import { createBlock, scoreDocument } from './registry.js';
import Sheet from './Sheet.jsx';
import { sampleDocument } from './sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

describe('video links', () => {
  it('reads times in every usual form', () => {
    expect(parseTime('90')).toBe(90);
    expect(parseTime('1:30')).toBe(90);
    expect(parseTime('01:02:03')).toBe(3723);
    expect(parseTime('1m30s')).toBe(90);
    expect(parseTime('90s')).toBe(90);
    expect(parseTime('1h2m')).toBe(3720);
    expect(parseTime('')).toBe(0);
    expect(parseTime('kell kaks')).toBe(0);
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3723)).toBe('1:02:03');
  });

  it('finds the YouTube id and start in every link form', () => {
    const id = 'dQw4w9WgXcQ';
    expect(parseVideoUrl(`https://www.youtube.com/watch?v=${id}`)).toEqual({ provider: 'youtube', id, start: 0 });
    expect(parseVideoUrl(`https://youtu.be/${id}?t=90`)).toEqual({ provider: 'youtube', id, start: 90 });
    expect(parseVideoUrl(`youtube.com/watch?v=${id}&t=1m5s`)).toMatchObject({ id, start: 65 });
    expect(parseVideoUrl(`https://m.youtube.com/watch?v=${id}&list=x`)).toMatchObject({ id });
    expect(parseVideoUrl(`https://www.youtube.com/shorts/${id}`)).toMatchObject({ id });
    expect(parseVideoUrl(`https://www.youtube.com/embed/${id}?start=30`)).toMatchObject({ id, start: 30 });
    expect(parseVideoUrl(`https://www.youtube-nocookie.com/embed/${id}`)).toMatchObject({ provider: 'youtube', id });
    expect(parseVideoUrl(`https://www.youtube.com/live/${id}`)).toMatchObject({ id });
    expect(parseVideoUrl('https://www.youtube.com/watch?v=short')).toBeNull();
  });

  it('finds Vimeo ids, private hashes and start', () => {
    expect(parseVideoUrl('https://vimeo.com/76979871')).toEqual({ provider: 'vimeo', id: '76979871', start: 0 });
    expect(parseVideoUrl('https://vimeo.com/76979871#t=1m30s')).toMatchObject({ id: '76979871', start: 90 });
    expect(parseVideoUrl('https://vimeo.com/76979871/abc123def0')).toMatchObject({ id: '76979871', hash: 'abc123def0' });
    expect(parseVideoUrl('https://player.vimeo.com/video/76979871?h=abc123def0')).toMatchObject({ id: '76979871', hash: 'abc123def0' });
    expect(parseVideoUrl('https://vimeo.com/channels/staffpicks/76979871')).toMatchObject({ id: '76979871' });
  });

  it('rejects other sites and junk', () => {
    expect(parseVideoUrl('')).toBeNull();
    expect(parseVideoUrl('https://example.com/video.mp4')).toBeNull();
    expect(parseVideoUrl('ei ole link')).toBeNull();
    expect(parseVideoUrl('https://vimeo.com/about')).toBeNull();
  });

  it('embeds privacy-friendly players with start and end; paper gets the short watch link', () => {
    const yt = videoSource({ url: 'https://youtu.be/dQw4w9WgXcQ?t=30', end: '1:20' });
    expect(yt).toMatchObject({ kind: 'youtube', start: 30, end: 80 });
    expect(embedUrl(yt)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1&start=30&end=80');
    expect(watchUrl(yt)).toBe('https://youtu.be/dQw4w9WgXcQ?t=30');
    expect(clipLabel(yt)).toBe('0:30–1:20');
    // the block's start field wins over the link's time; an end before the start is ignored
    expect(videoSource({ url: 'https://youtu.be/dQw4w9WgXcQ?t=30', start: '5', end: '0:03' })).toMatchObject({ start: 5, end: 0 });
    const vimeo = videoSource({ url: 'https://vimeo.com/76979871/abc123def0', start: '10' });
    expect(embedUrl(vimeo)).toBe('https://player.vimeo.com/video/76979871?dnt=1&h=abc123def0#t=10s');
    expect(watchUrl(vimeo)).toBe('https://vimeo.com/76979871/abc123def0#t=10s');
    expect(clipLabel(vimeo)).toBe('alates 0:10');
  });

  it('an uploaded file wins over a link and plays only its part', () => {
    const src = 'https://firebasestorage.googleapis.com/v0/b/x/o/curriculum%2Fv.mp4?alt=media';
    const file = videoSource({ url: 'https://youtu.be/dQw4w9WgXcQ', file: { src, name: 'v.mp4' }, start: '0:10', end: '0:40' });
    expect(file).toMatchObject({ kind: 'file', src, start: 10, end: 40 });
    expect(embedUrl(file)).toBeNull();
    expect(fileUrl(file)).toBe(`${src}#t=10,40`);
    expect(fileUrl(videoSource({ file: { src } }))).toBe(src);
    expect(videoSource({ url: 'https://example.com' })).toBeNull();
  });
});

describe('QR code for the printed sheet', () => {
  // reference: `qrencode -t ASCII -l M -8 -m 0 'https://youtu.be/dQw4w9WgXcQ'` (libqrencode 4.1.1 chose mask 0)
  const REFERENCE = '11111110001011001101101111111,10000010100010111101101000001,10111010001001101001001011101,10111010001011110111101011101,10111010110010100001001011101,10000010010101000011001000001,11111110101010101010101111111,00000000010001101111100000000,10101010000100110100000010010,00000100011100110100001001001,01010011101001000100011010111,01100100000100010110100000010,00010011100010001000001101011,11101100011001011010111001001,11001110111000111010010111011,00001001010101101101011001010,00001010110010110100011101011,01111101110010110101111001101,10011010001011000110101100011,01000000101010010111111011010,10011111111100001000111110000,00000000101101011111100010111,11111110001100111011101011011,10000010010111101110100011010,10111010101110110010111110010,10111010000111110000100110100,10111010100011000101000111001,10000010001100010001100000010,11111110100100001000111001011';

  it('matches a reference encoder module for module', () => {
    const rows = qrMatrix('https://youtu.be/dQw4w9WgXcQ', { mask: 0 }).map((row) => row.map((dark) => (dark ? '1' : '0')).join(''));
    expect(rows.join(',')).toBe(REFERENCE);
  });

  it('grows with the link and refuses what does not fit', () => {
    expect(qrVersionFor('a')).toBe(1);
    expect(qrVersionFor('https://youtu.be/dQw4w9WgXcQ?t=30')).toBe(3);
    expect(qrMatrix('x'.repeat(300)).length).toBe(69); // version 13
    expect(() => qrMatrix('x'.repeat(3000))).toThrow();
  });
});

describe('video block', () => {
  const make = (data) => {
    const block = createBlock('video');
    block.data = { ...block.data, ...data };
    return { block, doc: { ...sampleDocument(), blocks: [block] } };
  };

  it('student and live view play the video; builder and print show a QR code and the link', () => {
    const { doc } = make({ url: 'https://youtu.be/dQw4w9WgXcQ?t=30', caption: 'Turul', questions: 'Kus nad on? [turul]' });
    const student = render(<Sheet doc={doc} mode="interactive" />);
    const frame = student.container.querySelector('iframe.ws-video-frame');
    expect(frame.getAttribute('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(frame.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    expect(student.container.querySelector('.ws-video-paper.is-print-only svg.ws-qr')).not.toBeNull();
    expect(student.getAllByLabelText('Vastus 1').length).toBeGreaterThan(0);
    student.unmount();

    const live = render(<Sheet doc={doc} mode="review" answers={{}} />);
    expect(live.container.querySelector('iframe.ws-video-frame')).not.toBeNull();
    live.unmount();

    for (const mode of ['edit', 'print']) {
      const paper = render(<Sheet doc={doc} mode={mode} />);
      expect(paper.container.querySelector('iframe, video')).toBeNull();
      expect(paper.container.querySelector('.ws-video-paper:not(.is-print-only) svg.ws-qr')).not.toBeNull();
      expect(paper.container.textContent).toContain('youtu.be/dQw4w9WgXcQ?t=30');
      expect(paper.container.textContent).toContain('Turul');
      paper.unmount();
    }
  });

  it('an uploaded file plays in a video element; without any video the sheet still renders', () => {
    const { doc } = make({ file: { src: 'https://firebasestorage.googleapis.com/v/x.mp4', name: 'x.mp4' }, start: '5' });
    const view = render(<Sheet doc={doc} mode="interactive" />);
    expect(view.container.querySelector('video.ws-video-frame').getAttribute('src')).toBe('https://firebasestorage.googleapis.com/v/x.mp4#t=5');
    view.unmount();
    const empty = make({});
    const blank = render(<Sheet doc={empty.doc} mode="print" />);
    expect(blank.container.textContent).toContain('Video puudub');
    blank.unmount();
  });

  it('questions are scored like the reading block; no questions → nothing to score', () => {
    const { block, doc } = make({ url: 'https://youtu.be/dQw4w9WgXcQ', questions: 'Kus nad on? [turul]\nMis sulle meeldis?' });
    const items = scoreDocument(doc, { [`${block.id}:0`]: 'Nad on turul.' }).perBlock[block.id];
    expect(items).toEqual([{ key: '0', ok: true }]);
    const none = make({ url: 'https://youtu.be/dQw4w9WgXcQ' });
    expect(scoreDocument(none.doc, {}).perBlock[none.block.id]).toEqual([]);
  });
});
