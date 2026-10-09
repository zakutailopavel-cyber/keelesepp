// The school's media bank for the worksheet constructor: every picture and every longer text already used in a
// worksheet (and every new upload) becomes a searchable asset with its level and topic. Pure helpers; storage is in
// services/firebase/mediaBank.js (`mediaAssets`).

import { ALL_VISUALS, artLevel, visualLessonId, visualSrc } from '../worksheet-generator/art/textbookArt.js';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const MIN_TEXT_WORDS = 25;

const norm = (value) => String(value || '').toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '');
// markup of the worksheet engine: [answer|alt] gaps, *italics*, **bold**
export const plainText = (value) => String(value || '')
  .replace(/\[([^\]|]*)(\|[^\]]*)?\]/g, '$1')
  .replace(/\*\*?([^*]+)\*\*?/g, '$1')
  .replace(/[ \t]+/g, ' ')
  .trim();
export const wordCount = (text) => plainText(text).split(/\s+/).filter((word) => /\p{L}/u.test(word)).length;

const STOP = new Set(['ja', 'on', 'ei', 'ka', 'see', 'et', 'kui', 'ma', 'sa', 'ta', 'me', 'te', 'nad', 'oli', 'olen', 'mis', 'kes', 'kus', 'aga', 'või', 'ning', 'siis', 'nii', 'veel', 'väga', 'the', 'a', 'and', 'и', 'в', 'на', 'не', 'с', 'что', 'это']);
// search words of an asset: lowercase, without accents, no short or very common words
export function tagsOf(...values) {
  const words = values.flat().join(' ').split(/[^\p{L}\p{N}-]+/u).map(norm).filter((word) => word.length > 2 && !STOP.has(word));
  return [...new Set(words)].slice(0, 60);
}

// a short stable key (FNV-1a) so the same picture or text is stored once
export function assetKey(kind, value) {
  let hash = 0x811c9dc5;
  for (const char of String(value || '')) { hash ^= char.codePointAt(0); hash = Math.imul(hash, 0x01000193) >>> 0; }
  return `${kind}_${hash.toString(36)}`;
}

const levelOf = (value) => {
  const match = /\b(A1|A2|B1|B2|C1)\b/i.exec(String(value || ''));
  return match ? match[1].toUpperCase() : '';
};

// every `img` object anywhere in a block's data (image blocks, picture tasks, cards…)
function imagesIn(data, found = []) {
  if (!data || typeof data !== 'object') return found;
  if (Array.isArray(data)) { data.forEach((item) => imagesIn(item, found)); return found; }
  for (const [key, value] of Object.entries(data)) {
    if (key === 'img' && value?.src && /^https:\/\//.test(value.src)) found.push({ img: value, owner: data });
    else if (value && typeof value === 'object') imagesIn(value, found);
  }
  return found;
}

// Pictures and longer texts of one worksheet document, with its level and topic.
export function extractAssets(doc, { lessonId = '', lessonTitle = '', level = '', module = '', phase = '' } = {}) {
  const meta = doc?.meta || {};
  const sheetLevel = levelOf(level) || levelOf(meta.level);
  const topic = [module, lessonTitle || meta.title].filter(Boolean).join(' · ');
  const base = { level: sheetLevel, topic, lessonId, phase, sheetTitle: meta.title || lessonTitle || '' };
  const images = [];
  const texts = [];
  for (const block of doc?.blocks || []) {
    const data = block?.data || {};
    for (const { img, owner } of imagesIn(data)) {
      const caption = plainText(owner.caption || owner.label || owner.alt || owner.text || '');
      images.push({
        ...base, kind: 'image', key: assetKey('img', img.src), src: img.src, storagePath: img.storagePath || '',
        width: Number(img.width) || 0, height: Number(img.height) || 0, caption,
        credit: String(owner.credit || '').slice(0, 300),
        tags: tagsOf(caption, owner.bubble || '', meta.title || '', module, lessonTitle, data.title || ''),
      });
    }
    let text = '';
    let title = '';
    if (block.type === 'reading' || block.type === 'listening') { text = data.passage || data.transcript || ''; title = data.passageTitle || data.title || ''; }
    else if (block.type === 'text') { text = data.text || ''; title = data.heading || ''; }
    else if (block.type === 'dialogue' && Array.isArray(data.lines)) {
      text = data.lines.map((line) => `${line.who === 'B' ? data.speakerB || 'B' : data.speakerA || 'A'}: ${line.text || ''}`).join('\n');
      title = data.title || 'Dialoog';
    }
    const clean = plainText(text);
    if (clean && wordCount(clean) >= (block.type === 'dialogue' ? 12 : MIN_TEXT_WORDS)) {
      texts.push({
        ...base, kind: 'text', textType: block.type === 'dialogue' ? 'dialogue' : 'reading', key: assetKey('txt', clean),
        title: plainText(title) || meta.title || 'Tekst', text: clean.slice(0, 6000), words: wordCount(clean),
        tags: tagsOf(title, clean.slice(0, 1500), meta.title || '', module),
      });
    }
  }
  return { images, texts };
}

// Search: every query word must match a tag start (or the title / caption); level and kind filters; best first.
export function searchAssets(assets = [], { query = '', level = '', kind = '' } = {}) {
  const words = tagsOf(query);
  return assets
    .filter((asset) => (!kind || asset.kind === kind) && (!level || asset.level === level))
    .map((asset) => {
      const hay = `${norm(asset.title)} ${norm(asset.caption)} ${norm(asset.topic)}`;
      let score = 0;
      for (const word of words) {
        const tag = (asset.tags || []).some((item) => item === word) ? 3 : (asset.tags || []).some((item) => item.startsWith(word)) ? 2 : hay.includes(word) ? 1 : 0;
        if (!tag) return null;
        score += tag;
      }
      return { asset, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || String(b.asset.createdAt || '').localeCompare(String(a.asset.createdAt || '')))
    .map((item) => item.asset);
}

// ── tasks made from a bank text (no AI: plain rules) ─────────────
const sentencesOf = (text) => plainText(text).replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => wordCount(s) >= 4);

// gaps: one longer word blanked in each of up to `count` sentences; the blanked words become the word bank
export function gapsFromText(text, count = 6) {
  const picked = [];
  const lines = [];
  for (const sentence of sentencesOf(text)) {
    if (lines.length >= count) break;
    const words = sentence.split(/\s+/);
    const candidates = words.map((word, index) => ({ word, index, bare: word.replace(/[^\p{L}-]/gu, '') }))
      .filter((item) => item.index > 0 && item.bare.length >= 5 && !picked.includes(item.bare.toLocaleLowerCase('et')));
    if (!candidates.length) continue;
    const target = candidates.sort((a, b) => b.bare.length - a.bare.length)[0];
    picked.push(target.bare.toLocaleLowerCase('et'));
    words[target.index] = target.word.replace(target.bare, `[${target.bare}]`);
    lines.push(words.join(' '));
  }
  return { title: 'Täienda teksti laused.', instruction: 'Kasuta sõnapanga sõnu.', bank: picked.join(', '), showBank: 'yes', sentences: lines.join('\n') };
}

// word order: up to `count` short sentences of the text to put back together
export function wordOrderFromText(text, count = 4) {
  const short = sentencesOf(text).filter((sentence) => wordCount(sentence) <= 9).slice(0, count);
  return { title: 'Moodusta tekstist lause.', instruction: 'Pane sõnad õigesse järjekorda.', sentences: short.join('\n') };
}

// vocabulary: the longest different words of the text (the teacher edits the list)
export function vocabFromText(text, count = 10) {
  const words = [...new Set(plainText(text).split(/[^\p{L}-]+/u).filter((word) => word.length >= 6).map((word) => word.toLocaleLowerCase('et')))];
  return { title: 'Sõnavara', words: words.sort((a, b) => b.length - a.length).slice(0, count).join(', '), columns: '4' };
}

// The textbook's own illustrations are in the bank from the start (static files, no database).
export const textbookArtAssets = (visuals = ALL_VISUALS) => visuals.map((visual) => ({
  kind: 'image', key: assetKey('img', visualSrc(visual)), src: visualSrc(visual), caption: visual.caption || visual.alt || '',
  level: String(artLevel(visualLessonId(visual)) || '').toUpperCase(), topic: 'Õpiku illustratsioon', source: 'textbook',
  tags: tagsOf(visual.alt, visual.caption, visual.scene, (visual.text || []).join(' '), (visual.cast || []).join(' ')),
}));
