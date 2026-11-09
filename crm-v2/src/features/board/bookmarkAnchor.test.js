import { afterEach } from 'vitest';
import { anchorFromOffsets, anchorFromPoint, anchorFromRange, anchorKind, cleanAnchor, findAnchor, locateAnchor, makeAnchor, quoteParts, sentenceAt, textModel, wordAt } from './bookmarkAnchor.js';
import { bookmarkElement, isAnchoredBookmark, noteRecord, normalizeNote } from './bookmarkModel.js';
import { textAt, movable } from './boardModel.js';
import { letterBox } from './letters.js';

const sentence = (text, word) => {
  const at = text.indexOf(word);
  return sentenceAt(text, at, at + word.length).text;
};

describe('bookmark anchor: words and sentences', () => {
  it('takes the word around a click, Estonian letters and hyphens included', () => {
    const text = 'Õhtul sõi Mari üht-teist, „Jüri” jõi teed.';
    expect(wordAt(text, 2)).toEqual({ start: 0, end: 5 });
    expect(text.slice(...Object.values(wordAt(text, text.indexOf('teist'))))).toBe('üht-teist');
    expect(text.slice(...Object.values(wordAt(text, text.indexOf('Jüri') + 4)))).toBe('Jüri');
    expect(wordAt(text, 5)).toEqual({ start: 0, end: 5 }); // just after the last letter
    expect(wordAt('a , b', 2)).toBeNull();
    // word chips side by side: „hommikul” „päeval” are two words although the text has no space between them
    expect(wordAt('magamahommikulpäeval', 16, [6, 14])).toEqual({ start: 14, end: 20 });
    expect(wordAt('magamahommikulpäeval', 3, [6, 14])).toEqual({ start: 0, end: 6 });
  });

  it('finds the sentence, keeping Estonian quotes with it', () => {
    const text = 'Ema hüüdis: „Tule siia!” Siis läks Mari koju. „Kas sa tuled?” küsis ta.';
    expect(sentence(text, 'Tule')).toBe('Ema hüüdis: „Tule siia!”');
    expect(sentence(text, 'Mari')).toBe('Siis läks Mari koju.');
    // a question inside quotes followed by a small letter goes on
    expect(sentence(text, 'küsis')).toBe('„Kas sa tuled?” küsis ta.');
    expect(sentence(text, 'tuled')).toBe('„Kas sa tuled?” küsis ta.');
  });

  it('does not end a sentence after abbreviations, initials or ordinal numbers', () => {
    expect(sentence('Ostsin puuvilju, nt. Õunu ja pirne. Siis tulin koju.', 'pirne')).toBe('Ostsin puuvilju, nt. Õunu ja pirne.');
    expect(sentence('Hr. Tamm elab Tartus. Ta on õpetaja.', 'Tamm')).toBe('Hr. Tamm elab Tartus.');
    expect(sentence('Raamatu kirjutas A. H. Tammsaare. See on pikk.', 'kirjutas')).toBe('Raamatu kirjutas A. H. Tammsaare.');
    expect(sentence('Kool algab 1. septembril. Tule!', 'algab')).toBe('Kool algab 1. septembril.');
    expect(sentence('Vaata lk. 5 ja vrd. Tabel 2. Lõpp.', 'Tabel')).toBe('Vaata lk. 5 ja vrd. Tabel 2.');
    expect(sentence('Oot… Mis see oli? Ei tea.', 'see')).toBe('Mis see oli?');
  });

  it('stops at paragraph boundaries and new lines', () => {
    const text = 'LugemineMari elab Tallinnas';
    expect(sentenceAt(text, 10, 14, [8]).text).toBe('Mari elab Tallinnas');
    expect(sentenceAt('Pealkiri\nMari elab siin', 12, 16).text).toBe('Mari elab siin');
  });

  it('makes an anchor with context, sentence and kind', () => {
    const text = 'Mari elab Tallinnas. Ta käib koolis iga päev.';
    const at = text.indexOf('koolis');
    const anchor = makeAnchor({ text, start: at, end: at + 6, blockId: 'b-1' });
    expect(anchor).toEqual({ kind: 'word', quote: 'koolis', before: text.slice(0, at), after: ' iga päev.', sentence: 'Ta käib koolis iga päev.', blockId: 'b-1', start: at, end: at + 6 });
    // spaces around a selection are dropped
    expect(makeAnchor({ text, start: 20, end: text.length }).quote).toBe('Ta käib koolis iga päev.');
    expect(makeAnchor({ text, start: 20, end: text.length }).kind).toBe('sentence');
    expect(makeAnchor({ text, start: at, end: at + 15 }).kind).toBe('phrase');
    expect(makeAnchor({ text, start: 3, end: 3 })).toBeNull();
    expect(anchorKind('üht-teist')).toBe('word');
  });

  it('finds the quote again by offset, then by the quote with the best context', () => {
    const text = 'Kass magab. Koer haugub. Kass sööb.';
    const second = text.lastIndexOf('Kass');
    const anchor = makeAnchor({ text, start: second, end: second + 4 });
    expect(findAnchor(text, anchor)).toEqual({ start: second, end: second + 4 });
    // text added before it: the offset is wrong, the context picks the right one of two
    const moved = `Vastus: hästi. ${text}`;
    expect(findAnchor(moved, anchor)).toEqual({ start: moved.lastIndexOf('Kass'), end: moved.lastIndexOf('Kass') + 4 });
    const first = makeAnchor({ text, start: 0, end: 4 });
    expect(findAnchor(moved, first).start).toBe(moved.indexOf('Kass'));
    expect(findAnchor('Midagi muud.', anchor)).toBeNull();
  });

  it('cleans stored anchors and marks the quote inside its sentence', () => {
    expect(cleanAnchor(null)).toBeNull();
    expect(cleanAnchor({ quote: '  ' })).toBeNull();
    expect(cleanAnchor({ quote: 'kass', hack: 1, before: 'x'.repeat(99), start: -3 })).toEqual({ kind: 'word', quote: 'kass', before: 'x'.repeat(40), after: '', sentence: 'kass', blockId: '', start: 0, end: 4 });
    expect(quoteParts({ quote: 'kassi', sentence: 'Mari näeb kassi aias.' })).toEqual([{ text: 'Mari näeb ', quote: false }, { text: 'kassi', quote: true }, { text: ' aias.', quote: false }]);
    expect(quoteParts({ quote: 'Lause.', sentence: 'Lause.' })).toEqual([{ text: 'Lause.', quote: true }]);
  });
});

describe('bookmark anchor: the page DOM', () => {
  const page = () => {
    const root = document.createElement('div');
    // the sheet's hidden measuring copy comes first, with the same block ids
    root.innerHTML = '<div class="ws-measure"><section data-block="t1"><p>Mari elab Tallinnas.</p></section></div><div class="ws-page"><section data-block="t1"><h3>Lugemine</h3><p>Mari elab <b>Tallinnas</b>. Ta käib koolis.</p></section>'
      + '<section data-block="t2"><p>Kass magab. Kass sööb.</p></section></div><div class="sa-layer">1</div>';
    document.body.appendChild(root);
    return root;
  };
  afterEach(() => { document.body.innerHTML = ''; delete document.caretRangeFromPoint; });

  it('reads a block as one text with its paragraph breaks, without the marks layer', () => {
    const root = page();
    const model = textModel(root.querySelector('.ws-page [data-block="t1"]'));
    expect(model.text).toBe('LugemineMari elab Tallinnas. Ta käib koolis.');
    expect(model.breaks).toEqual([8]);
    expect(textModel(root).text).not.toContain('1');
  });

  it('anchors a selection inside a block and finds it again after a re-render', () => {
    const root = page();
    const strong = root.querySelector('b').firstChild;
    const range = document.createRange();
    range.setStart(strong, 0); range.setEnd(strong, 9);
    const anchor = anchorFromRange(root, range);
    expect(anchor).toMatchObject({ kind: 'word', quote: 'Tallinnas', blockId: 't1', sentence: 'Mari elab Tallinnas.', start: 18, end: 27 });
    // the same block drawn again with an answer added before the text
    root.querySelector('.ws-page [data-block="t1"]').innerHTML = '<p>Vastus</p><h3>Lugemine</h3><p>Mari elab Tallinnas. Ta käib koolis.</p>';
    const found = locateAnchor(root, anchor);
    expect(found.toString()).toBe('Tallinnas');
    expect(root.querySelector('.ws-page').contains(found.startContainer)).toBe(true);
    // the block is gone: the whole page is searched
    root.querySelector('.ws-page [data-block="t1"]').removeAttribute('data-block');
    expect(locateAnchor(root, anchor).toString()).toBe('Tallinnas');
  });

  it('builds the anchor of the teacher popup\'s offsets and of a point under the pointer', () => {
    const root = page();
    expect(anchorFromOffsets(root, { blockId: 't2', start: 12, end: 16 })).toMatchObject({ quote: 'Kass', sentence: 'Kass sööb.', blockId: 't2' });
    const node = root.querySelector('[data-block="t2"] p').firstChild;
    document.caretRangeFromPoint = () => { const r = document.createRange(); r.setStart(node, 14); return r; };
    expect(anchorFromPoint(root, 10, 10)).toMatchObject({ kind: 'word', quote: 'Kass', start: 12 });
    expect(anchorFromPoint(root, 10, 10, { sentence: true })).toMatchObject({ kind: 'sentence', quote: 'Kass sööb.' });
  });
});

describe('anchored bookmark records', () => {
  const anchor = { kind: 'word', quote: 'kassi', before: 'näeb ', after: ' aias', sentence: 'Mari näeb kassi aias.', blockId: 'b', start: 10, end: 15 };

  it('a board element with an anchor is a small marker; without it the old free sheet', () => {
    const pinned = bookmarkElement({ x: 10, y: 20, text: 'Kordan', anchor });
    expect(pinned).toMatchObject({ w: 22, h: 22, anchor });
    expect(isAnchoredBookmark({ id: 'x', ...pinned })).toBe(true);
    const free = bookmarkElement({ x: 10, y: 20, text: 'Kordan' });
    expect(free).not.toHaveProperty('anchor');
    expect(free).toMatchObject({ w: 220, h: 170 });
    // the marker is not grabbed as a text sheet or dragged
    expect(textAt([{ id: 'a', ...pinned }], { x: 15, y: 25 })).toBeNull();
    expect(movable(pinned)).toBe(false);
  });

  it('the note keeps the anchor; old notes have none', () => {
    const record = noteRecord({ studentId: 's', text: 'x', anchor, pageTitle: 'Tööleht: Avasta', now: 'n' });
    expect(record.anchor).toEqual(anchor);
    expect(noteRecord({ studentId: 's', text: 'x', now: 'n' })).not.toHaveProperty('anchor');
    expect(normalizeNote('n1', { text: 'vana' }).anchor).toBeNull();
    expect(normalizeNote('n1', { text: 'uus', anchor }).anchor).toEqual(anchor);
  });

  it('the letters bar is placed beside the whole bookmark sheet', () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('data-letters-box', '');
    const field = document.createElement('textarea');
    dialog.appendChild(field);
    expect(letterBox(field)).toBe(dialog);
    const plain = document.createElement('input');
    expect(letterBox(plain)).toBe(plain);
  });
});
