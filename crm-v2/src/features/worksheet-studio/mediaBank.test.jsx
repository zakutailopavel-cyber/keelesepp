import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MediaBankPanel from './MediaBankPanel.jsx';
import { assetKey, extractAssets, gapsFromText, plainText, searchAssets, tagsOf, textbookArtAssets, vocabFromText, wordCount, wordOrderFromText } from './mediaBank.js';

const passage = 'Mari elab Tallinnas koos oma perega. Hommikul ärkab ta kell seitse ja joob kohvi. Siis sõidab ta bussiga tööle kesklinna. Õhtul vaatab Mari televiisorit ja loeb raamatut. Nädalavahetusel käib ta perega metsas jalutamas.';
const doc = { meta: { title: 'Minu päev', level: 'A2' }, blocks: [
  { id: 'i1', type: 'image', data: { img: { src: 'https://cdn.example/kass.jpg', storagePath: 'curriculum/kass.jpg', width: 800, height: 600 }, caption: 'Kass magab diivanil' } },
  { id: 'p1', type: 'pictures', data: { items: [{ img: { src: 'https://cdn.example/buss.jpg' }, label: 'buss' }] } },
  { id: 'r1', type: 'reading', data: { passageTitle: 'Mari päev', passage, questions: '' } },
  { id: 't1', type: 'text', data: { text: 'Lühike juhis.' } },
  { id: 'd1', type: 'dialogue', data: { speakerA: 'Mari', speakerB: 'Jaan', lines: [{ who: 'A', text: 'Tere! Kuidas sul [läheb] täna hommikul?' }, { who: 'B', text: 'Hästi, aitäh! Ma lähen kohe tööle ja sina?' }, { who: 'A', text: 'Mina lähen kooli.' }] } },
] };

describe('media bank model', () => {
  it('finds every picture and the longer texts of a sheet, with level and topic', () => {
    const { images, texts } = extractAssets(doc, { lessonId: 'a2-001', module: 'Igapäevaelu' });
    expect(images.map((asset) => asset.src)).toEqual(['https://cdn.example/kass.jpg', 'https://cdn.example/buss.jpg']);
    expect(images[0]).toMatchObject({ level: 'A2', caption: 'Kass magab diivanil', topic: 'Igapäevaelu · Minu päev', storagePath: 'curriculum/kass.jpg' });
    expect(images[0].tags).toEqual(expect.arrayContaining(['kass', 'magab', 'diivanil']));
    expect(images[1].caption).toBe('buss');
    expect(texts.map((asset) => asset.textType)).toEqual(['reading', 'dialogue']);
    expect(texts[0]).toMatchObject({ title: 'Mari päev', level: 'A2' });
    expect(texts[1].text).toContain('Mari: Tere! Kuidas sul läheb');
    expect(assetKey('img', 'x')).toBe(assetKey('img', 'x'));
    expect(assetKey('img', 'x')).not.toBe(assetKey('img', 'y'));
  });

  it('searches by word starts, level and kind', () => {
    const { images, texts } = extractAssets(doc);
    const all = [...images, ...texts, { kind: 'image', src: 'x', level: 'B1', tags: tagsOf('kass aias') }];
    expect(searchAssets(all, { query: 'kas', kind: 'image' }).map((asset) => asset.level)).toEqual(['A2', 'B1']);
    expect(searchAssets(all, { query: 'kass', kind: 'image', level: 'B1' })).toHaveLength(1);
    expect(searchAssets(all, { query: 'tallinn', kind: 'text' })[0].title).toBe('Mari päev');
    expect(searchAssets(all, { query: 'elevant' })).toEqual([]);
  });

  it('makes gaps, word order and vocabulary from a text, without the engine markup', () => {
    expect(plainText('Ma [ärkan|tõusen] *väga* vara.')).toBe('Ma ärkan väga vara.');
    expect(wordCount(passage)).toBeGreaterThan(25);
    const gaps = gapsFromText(passage, 3);
    expect(gaps.sentences.split('\n')).toHaveLength(3);
    expect(gaps.sentences).toMatch(/\[[^\]]+\]/);
    expect(gaps.bank.split(', ')).toHaveLength(3);
    expect(wordOrderFromText(passage).sentences.split('\n').length).toBeGreaterThan(0);
    expect(vocabFromText(passage).words).toContain('nädalavahetusel');
  });

  it('the textbook art is in the bank from the start', () => {
    const art = textbookArtAssets([{ id: 'a2-001-avasta-1', phase: 'discover', alt: 'Anna tutvustab end', caption: 'Pilt 1', scene: 'Keelekeskus', text: [], cast: ['Anna'] }]);
    expect(art[0]).toMatchObject({ kind: 'image', src: '/textbook-art/a2/a2-001/a2-001-avasta-1.webp', level: 'A2' });
    expect(art[0].tags).toEqual(expect.arrayContaining(['anna', 'keelekeskus']));
  });
});

describe('MediaBankPanel', () => {
  const { images, texts } = extractAssets(doc);
  const service = { list: vi.fn().mockResolvedValue([...images, ...texts].map((asset) => ({ id: asset.key, ...asset }))) };

  it('puts a picture on the sheet and a text with tasks made from it', async () => {
    const onImage = vi.fn();
    const onText = vi.fn();
    render(<MediaBankPanel level="A2" service={service} staticAssets={[]} onImage={onImage} onText={onText} onWebImage={vi.fn()} />);
    fireEvent.change(await screen.findByRole('searchbox', { name: 'Otsi pangast' }), { target: { value: 'kass' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Lisa pilt: Kass magab diivanil' }));
    expect(onImage).toHaveBeenCalledWith(expect.objectContaining({ src: 'https://cdn.example/kass.jpg' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Otsi pangast' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('tab', { name: /Tekstid/ }));
    fireEvent.click(screen.getByRole('button', { name: /Mari päev/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /sõnavara/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lisa lehele' }));
    expect(onText).toHaveBeenCalledWith(expect.objectContaining({ title: 'Mari päev' }), ['gaps', 'vocab']);
  });

  it('an admin fills the bank from the curriculum', async () => {
    const onIndex = vi.fn(async (progress) => { progress({ done: 1, total: 2, assets: 3 }); return { lessons: 2, images: 2, texts: 1 }; });
    render(<MediaBankPanel service={{ list: vi.fn().mockResolvedValue([]) }} staticAssets={[]} isAdmin onIndex={onIndex} onImage={vi.fn()} onText={vi.fn()} onWebImage={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Uuenda panka õppekavast' }));
    expect(await screen.findByText('Valmis: 2 pilti ja 1 teksti 2 tunnist.')).toBeInTheDocument();
    await waitFor(() => expect(onIndex).toHaveBeenCalled());
  });
});
