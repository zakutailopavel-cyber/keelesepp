import { describe, expect, it, vi } from 'vitest';
import { addToDictionary, createLookupCache, wordCardSpot, isTap, lookupWord, rangeAnchor, stageTool, tapIntent, translationTarget, wordAround, wordRangeAt } from './wordTap.js';

describe('wordAround: the word at a tap', () => {
  it('finds the whole word from any letter, also just after its end', () => {
    expect(wordAround('Ma lähen koju.', 4)).toEqual({ start: 3, end: 8, word: 'lähen' });
    expect(wordAround('Ma lähen koju.', 3)).toEqual({ start: 3, end: 8, word: 'lähen' });
    expect(wordAround('Ma lähen koju.', 8)).toEqual({ start: 3, end: 8, word: 'lähen' });
    expect(wordAround('Ma lähen koju.', 13).word).toBe('koju');
  });
  it('keeps õ ä ö ü š ž and a hyphen inside a word, never punctuation', () => {
    expect(wordAround('Šokolaad ja žürii', 2).word).toBe('Šokolaad');
    expect(wordAround('Saada e-post!', 8).word).toBe('e-post');
    expect(wordAround('Tere - tere', 5)).toBeNull();
    expect(wordAround('12 345', 1)).toBeNull();
    expect(wordAround('', 0)).toBeNull();
  });
  it('refuses a too long run of letters', () => {
    expect(wordAround('a'.repeat(80), 3)).toBeNull();
  });
});

describe('wordRangeAt', () => {
  const setup = (text, offset) => {
    const node = document.createTextNode(text);
    document.body.appendChild(node);
    const doc = {
      caretRangeFromPoint: vi.fn(() => ({ startContainer: node, startOffset: offset })),
      createRange: () => { const range = document.createRange(); range.getBoundingClientRect = () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }); return range; },
    };
    return { node, doc };
  };
  it('gives the word and a range over it', () => {
    const { node, doc } = setup('Kass jookseb aeda', 7);
    const hit = wordRangeAt(10, 10, { doc });
    expect(hit.word).toBe('jookseb');
    expect(hit.node).toBe(node);
    expect(hit.range.toString()).toBe('jookseb');
    node.remove();
  });
  it('looks through the drawing layer when the first look finds no text, and restores it', () => {
    const { node } = setup('Tere hommikust', 1);
    const svg = document.createElement('div');
    svg.style.pointerEvents = 'auto';
    const seen = [];
    const doc = {
      caretRangeFromPoint: () => { seen.push(svg.style.pointerEvents); return svg.style.pointerEvents === 'none' ? { startContainer: node, startOffset: 1 } : { startContainer: svg, startOffset: 0 }; },
      createRange: () => document.createRange(),
    };
    expect(wordRangeAt(5, 5, { doc, cover: [svg] }).word).toBe('Tere');
    expect(seen).toEqual(['auto', 'none']);
    expect(svg.style.pointerEvents).toBe('auto');
    node.remove();
  });
  it('ignores a point beside the text (the caret snapped to the nearest letter)', () => {
    const node = document.createTextNode('maja');
    document.body.appendChild(node);
    const doc = {
      caretRangeFromPoint: () => ({ startContainer: node, startOffset: 2 }),
      createRange: () => { const range = document.createRange(); range.getBoundingClientRect = () => ({ left: 10, top: 10, right: 50, bottom: 30, width: 40, height: 20 }); return range; },
    };
    expect(wordRangeAt(20, 20, { doc })?.word).toBe('maja');
    expect(wordRangeAt(200, 20, { doc })).toBeNull();
    node.remove();
  });
  it('the anchor follows the range and finds the stage', () => {
    const stage = document.createElement('div');
    stage.className = 'sb-stage';
    const p = document.createElement('p');
    p.textContent = 'sõna';
    stage.appendChild(p);
    document.body.appendChild(stage);
    const range = { getBoundingClientRect: () => ({ left: 1, top: 2, right: 3, bottom: 4, width: 2, height: 2 }) };
    const anchor = rangeAnchor(range, p.firstChild);
    expect(anchor.getBoundingClientRect()).toMatchObject({ left: 1, top: 2, right: 3, bottom: 4 });
    expect(anchor.closest('.sb-stage')).toBe(stage);
    expect(anchor.isConnected()).toBe(true);
    stage.remove();
  });
});

describe('tapIntent: when a tap is a word lookup', () => {
  const board = (tool, html) => {
    const stage = document.createElement('div');
    stage.className = `sb-stage tool-${tool}`;
    stage.innerHTML = html;
    document.body.appendChild(stage);
    return stage;
  };
  it('works with answering, selecting and moving, never while drawing', () => {
    for (const tool of ['fill', 'select', 'hand']) {
      const stage = board(tool, '<div class="sb-underlay"><p>Tere</p></div>');
      expect(tapIntent({ target: stage.querySelector('p'), stage })).toBe(true);
      stage.remove();
    }
    for (const tool of ['pen', 'marker', 'eraser', 'text', 'note', 'rect', 'laser']) {
      const stage = board(tool, '<p>Tere</p>');
      expect(tapIntent({ target: stage.querySelector('p'), stage })).toBe(false);
      stage.remove();
    }
  });
  it('never on fields, buttons, the editor, or while an answer is being typed', () => {
    const stage = board('fill', '<div class="sb-underlay"><p>Tere</p><input /><button>OK</button><label>valik</label><div class="sb-editor">x</div></div>');
    expect(tapIntent({ target: stage.querySelector('input'), stage })).toBe(false);
    expect(tapIntent({ target: stage.querySelector('button'), stage })).toBe(false);
    expect(tapIntent({ target: stage.querySelector('label'), stage })).toBe(false);
    expect(tapIntent({ target: stage.querySelector('.sb-editor'), stage })).toBe(false);
    expect(tapIntent({ target: stage.querySelector('p'), stage, active: stage.querySelector('input') })).toBe(false);
    expect(tapIntent({ target: stage.querySelector('p'), stage, active: document.body })).toBe(true);
    stage.remove();
  });
  it('a teacher filling the sheet keeps the sheet’s own word tools; elsewhere the card works for him too', () => {
    const stage = board('fill', '<div class="sb-underlay"><p>Tere</p></div><div class="sb-text">Tahvel</div>');
    expect(tapIntent({ target: stage.querySelector('p'), stage, staff: true })).toBe(false);
    expect(tapIntent({ target: stage.querySelector('.sb-text'), stage, staff: true })).toBe(true);
    // „Vali ja täida” is the same tool: the teacher's Viga / Märkus / Sõna on the sheet keep working under it
    stage.className = 'sb-stage tool-select';
    expect(tapIntent({ target: stage.querySelector('p'), stage, staff: true })).toBe(false);
    expect(tapIntent({ target: stage.querySelector('.sb-text'), stage, staff: true })).toBe(true);
    stage.className = 'sb-stage tool-hand';
    expect(tapIntent({ target: stage.querySelector('p'), stage, staff: true })).toBe(true);
    stage.remove();
  });
  it('reads the tool from the stage (the reading page is answering)', () => {
    const stage = document.createElement('div');
    stage.className = 'sb-stage has-worksheet is-reading';
    expect(stageTool(stage)).toBe('select');
    // the old „Täida töölehte” class is read as the one pointer tool
    stage.className = 'sb-stage tool-fill has-worksheet';
    expect(stageTool(stage)).toBe('select');
    stage.className = 'sb-stage tool-hand has-worksheet';
    expect(stageTool(stage)).toBe('hand');
  });
  it('a tap is short and still', () => {
    expect(isTap({ x: 0, y: 0, t: 0 }, { x: 4, y: 3, t: 200 })).toBe(true);
    expect(isTap({ x: 0, y: 0, t: 0 }, { x: 40, y: 0, t: 100 })).toBe(false);
    expect(isTap({ x: 0, y: 0, t: 0 }, { x: 0, y: 0, t: 900 })).toBe(false);
  });
});

describe('lookup, language and the session cache', () => {
  it('the student card’s language, else the one chosen on this device, else Russian', () => {
    const storage = (value) => ({ getItem: () => value });
    expect(translationTarget('en', storage('uk'))).toBe('en');
    expect(translationTarget('uk', storage(null))).toBe('uk');
    expect(translationTarget('et', storage('en'))).toBe('en');
    expect(translationTarget('', storage(null))).toBe('ru');
    expect(translationTarget('', { getItem: () => { throw new Error('private'); } })).toBe('ru');
  });
  it('asks the server once per word and language; a failed answer is asked again', async () => {
    const check = vi.fn(async (word) => (word === 'viga' ? { error: 'x' } : { word }));
    const cache = createLookupCache(check);
    await cache.get('Lähen', 'ru');
    await cache.get('lähen', 'ru');
    await cache.get('lähen', 'en');
    expect(check).toHaveBeenCalledTimes(2);
    await cache.get('viga', 'ru');
    await cache.get('viga', 'ru');
    expect(check).toHaveBeenCalledTimes(4);
  });
  it('the base form and translation from languageApi /own-word', async () => {
    const service = { checkOwnWord: vi.fn(async () => ({ status: 'ok', lemma: 'minema', translation: 'идти', words: [{ text: 'lähen', lemma: 'minema', known: true }], forms: { line: 'minema, minna, läheb', forms: [] } })) };
    const card = await lookupWord(service, 'lähen', 'ru');
    expect(service.checkOwnWord).toHaveBeenCalledWith({ text: 'lähen', lang: 'et', tgt: 'ru' });
    expect(card).toMatchObject({ word: 'lähen', lemma: 'minema', translation: 'идти', status: 'ok', formsLine: 'minema, minna, läheb' });
    const same = await lookupWord({ checkOwnWord: async () => ({ lemma: 'maja', translation: 'дом' }) }, 'Maja', 'ru');
    expect(same.lemma).toBe('');
    const failed = await lookupWord({ checkOwnWord: async () => { throw new Error('429'); } }, 'maja', 'ru');
    expect(failed.error).toBe('429');
  });
  it('a partial answer (a slow service) carries what is missing and is asked again next time', async () => {
    const service = { checkOwnWord: vi.fn(async () => ({ status: 'unchecked', lemma: '', translation: 'идти', partial: true, missing: ['spelling', 'forms', 'bogus'] })) };
    const card = await lookupWord(service, 'lähen', 'ru');
    expect(card).toMatchObject({ translation: 'идти', partial: true, missing: ['spelling', 'forms'] });
    const cache = createLookupCache((word, tgt) => lookupWord(service, word, tgt));
    await cache.get('lähen', 'ru');
    await cache.get('lähen', 'ru');
    expect(service.checkOwnWord).toHaveBeenCalledTimes(3);
  });
});

describe('„Lisa sõnastikku”', () => {
  const user = { uid: 'u1', displayName: 'Mari' };
  const card = { word: 'lähen', lemma: 'minema', translation: 'идти', status: 'ok', formsLine: 'minema, minna', formItems: [] };
  it('the student adds the base form as his own word', async () => {
    const words = { listForStudent: vi.fn(async () => []), add: vi.fn(), addStudentWord: vi.fn(async (input) => ({ id: 'w1', ...input })) };
    expect(await addToDictionary(words, { studentId: 's1', user, card })).toMatchObject({ added: true });
    expect(words.addStudentWord).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', word: 'minema', translation: 'идти', forms: 'minema, minna', checked: 'ok' }));
    expect(words.add).not.toHaveBeenCalled();
  });
  it('the teacher adds a normal lesson word to the student', async () => {
    const words = { listForStudent: vi.fn(async () => []), add: vi.fn(async (input) => input), addStudentWord: vi.fn() };
    await addToDictionary(words, { studentId: 's1', user, staff: true, card });
    expect(words.add).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', word: 'minema' }));
    expect(words.addStudentWord).not.toHaveBeenCalled();
  });
  it('a word already there (same text or base form) is not added twice', async () => {
    const words = { listForStudent: async () => [{ id: 'old', word: 'Minema' }], add: vi.fn(), addStudentWord: vi.fn() };
    expect(await addToDictionary(words, { studentId: 's1', user, card })).toMatchObject({ already: true, word: { id: 'old' } });
    expect(words.addStudentWord).not.toHaveBeenCalled();
  });
  it('needs a student', async () => {
    await expect(addToDictionary({}, { studentId: '', user, card })).rejects.toThrow('Õpilane puudub.');
  });
});

describe('wordCardSpot: the card beside its word', () => {
  const bounds = { left: 0, top: 0, right: 1200, bottom: 800 };
  it('right of the word when there is room, else left, else under it', () => {
    expect(wordCardSpot({ anchor: { left: 100, top: 100, right: 160, bottom: 120 }, clip: bounds, bounds, height: 120 })).toMatchObject({ hidden: false, side: 'right', left: 168, top: 100 });
    expect(wordCardSpot({ anchor: { left: 1000, top: 100, right: 1060, bottom: 120 }, clip: bounds, bounds, height: 120 })).toMatchObject({ side: 'left', left: 1000 - 8 - 260 });
    const phone = { left: 0, top: 0, right: 360, bottom: 700 };
    expect(wordCardSpot({ anchor: { left: 120, top: 100, right: 180, bottom: 120 }, clip: phone, bounds: phone, height: 120 })).toMatchObject({ side: 'below', top: 128 });
  });
  it('hidden while the word is out of the board’s frame', () => {
    expect(wordCardSpot({ anchor: { left: 100, top: 900, right: 160, bottom: 920 }, clip: bounds, bounds, height: 120 }).hidden).toBe(true);
    expect(wordCardSpot({ anchor: { left: 100, top: 100, right: 160, bottom: 120 }, clip: { left: 300, top: 0, right: 900, bottom: 800 }, bounds, height: 120 }).hidden).toBe(true);
  });
});
