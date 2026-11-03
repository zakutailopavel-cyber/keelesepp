import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { altText, aspectOfCrop, aspectRatioOf, cropPixels, fitCrop, moveCrop, normRotation, resizeCrop, rotatedSize } from './image.js';
import { createBlock } from './registry.js';
import Sheet from './Sheet.jsx';
import { sampleDocument } from './sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const close = (rect, expected) => Object.entries(expected).forEach(([key, value]) => expect(rect[key], key).toBeCloseTo(value, 6));

describe('crop and rotate math', () => {
  it('turns by quarter turns and swaps the sides', () => {
    expect([90, -90, 180, 450, 0, 360].map(normRotation)).toEqual([90, 270, 180, 90, 0, 0]);
    expect(rotatedSize(800, 600, 90)).toEqual({ width: 600, height: 800 });
    expect(rotatedSize(800, 600, 180)).toEqual({ width: 800, height: 600 });
    expect(rotatedSize(800, 600, -90)).toEqual({ width: 600, height: 800 });
  });

  it('a fixed ratio gets the biggest centred rectangle; free = the whole picture', () => {
    close(fitCrop(1, 800, 600), { x: 0.125, y: 0, w: 0.75, h: 1 });
    close(fitCrop(16 / 9, 800, 800), { x: 0, w: 1, h: 0.5625, y: 0.21875 });
    expect(fitCrop(0, 800, 600)).toEqual({ x: 0, y: 0, w: 1, h: 1 });
    const { sw, sh } = cropPixels(fitCrop(4 / 3, 1000, 1000), 1000, 1000);
    expect(sw / sh).toBeCloseTo(4 / 3, 2);
  });

  it('moving stays inside the picture', () => {
    close(moveCrop({ x: 0.1, y: 0.1, w: 0.5, h: 0.5 }, 0.9, -0.5), { x: 0.5, y: 0 });
  });

  it('a free corner drag keeps the opposite corner and stays inside', () => {
    const r = resizeCrop({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 }, 'se', 0.5, 0.1);
    close(r, { x: 0.2, y: 0.2, w: 0.8, h: 0.6 });
    const nw = resizeCrop({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 }, 'nw', 0.1, -0.5);
    close(nw, { x: 0.3, y: 0, w: 0.4, h: 0.7 });
    // never smaller than the minimum
    expect(resizeCrop({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 }, 'se', -1, -1).w).toBeCloseTo(0.05, 6);
  });

  it('a fixed-ratio corner drag keeps the shape in pixels', () => {
    const W = 800;
    const H = 600;
    const start = fitCrop(1, W, H);
    const r = resizeCrop(start, 'se', -0.2, 0, { ratio: 1, W, H });
    expect((r.w * W) / (r.h * H)).toBeCloseTo(1, 6);
    expect(r.x).toBeCloseTo(start.x, 6);
    const grown = resizeCrop({ x: 0.1, y: 0.1, w: 0.3, h: 0.4 }, 'se', 0.9, 0.9, { ratio: 1, W, H });
    expect((grown.w * W) / (grown.h * H)).toBeCloseTo(1, 6);
    expect(grown.x + grown.w).toBeLessThanOrEqual(1 + 1e-9);
    expect(grown.y + grown.h).toBeLessThanOrEqual(1 + 1e-9);
  });

  it('pixels are whole, inside and at least 1', () => {
    expect(cropPixels({ x: 0.25, y: 0.5, w: 0.5, h: 0.5 }, 800, 600)).toEqual({ sx: 200, sy: 300, sw: 400, sh: 300 });
    expect(cropPixels({ x: 0.999, y: 0.999, w: 0.0001, h: 0.5 }, 100, 100)).toEqual({ sx: 99, sy: 99, sw: 1, sh: 1 });
  });

  it('the slot follows the cut: a fixed ratio by name, a free cut the picture itself', () => {
    expect(aspectOfCrop('1:1')).toBe('1:1');
    expect(aspectOfCrop('free')).toBe('orig');
    expect(aspectRatioOf('orig', { width: 300, height: 600 })).toBe(0.5);
    expect(aspectRatioOf('orig', {})).toBeCloseTo(4 / 3, 6);
    expect(aspectRatioOf('16:9')).toBeCloseTo(16 / 9, 6);
  });
});

describe('Alt-tekst', () => {
  it('falls back to the caption without markup', () => {
    expect(altText({ alt: ' Kass diivanil ', caption: 'Pilt 1' })).toBe('Kass diivanil');
    expect(altText({ alt: '', caption: '**Kass**  magab' })).toBe('Kass magab');
    expect(altText({})).toBe('');
  });

  it('the picture on the sheet carries it', () => {
    const block = createBlock('image');
    block.data = { ...block.data, img: { src: 'https://cdn.example/kass.png', width: 300, height: 600 }, aspect: 'orig', caption: 'Kass', alt: 'Hall kass magab diivanil' };
    const view = render(<Sheet doc={{ ...sampleDocument(), blocks: [block] }} mode="interactive" />);
    const img = view.getAllByAltText('Hall kass magab diivanil')[0];
    expect(img.closest('.ws-photo').style.aspectRatio).toMatch(/^0\.5( \/ 1)?$/);
    view.unmount();
    block.data.alt = '';
    const fallback = render(<Sheet doc={{ ...sampleDocument(), blocks: [block] }} mode="print" />);
    expect(fallback.getAllByAltText('Kass').length).toBeGreaterThan(0);
    fallback.unmount();
  });
});
