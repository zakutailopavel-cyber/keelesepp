// The labels the course builders print in Estonian (admin/course/blocks.js B.know „Kas teadsid?” / „Allikas:”,
// B.topicOpener „Mõtle kaasa:”) and the exam blocks (engine/blocks/harno.jsx) in the sheet's language
// (docs/COURSE_FINAL_SHAPE_EN_B2.md §8, §9 items 5). A module with MODULE.language 'en' gets English labels on every sheet;
// an Estonian sheet is returned unchanged (the published Estonian sheets stay byte for byte the same).
//
// B.know and B.topicOpener keep their structured data (`know` + `source`, `opener: { source, questions }`), so the labels
// are swapped exactly, not guessed: „*Allikas: <source>.*” → „*Source: <source>.*”, the „Mõtle kaasa:” paragraph →
// „Think about it:”. The exam blocks get `data.lang`, which their View reads (harno.jsx EXAM_TEXT).
export const KNOW_TITLE = { et: 'Kas teadsid?', en: 'Did you know?' };
export const SOURCE_LABEL = { et: 'Allikas', en: 'Source' };
export const THINK_LABEL = { et: 'Mõtle kaasa', en: 'Think about it' };
// the exam blocks whose View prints fixed Estonian text (harno.jsx)
export const EXAM_BLOCKS = new Set(['exampart', 'examlisten', 'examwriting', 'speakcard', 'examrubric', 'adsmatch']);

const swap = (text, from, to) => (String(text ?? '').includes(from) ? String(text).split(from).join(to) : text);

export function localiseBlock(b, language) {
  if (!language || language === 'et' || !KNOW_TITLE[language]) return b;
  const d = b.data || {};
  if (d.know && d.source !== undefined) {
    return {
      ...b,
      data: {
        ...d,
        title: d.title === KNOW_TITLE.et ? KNOW_TITLE[language] : d.title,
        text: swap(d.text, `*${SOURCE_LABEL.et}: ${d.source}.*`, `*${SOURCE_LABEL[language]}: ${d.source}.*`),
        lang: language,
      },
    };
  }
  if (d.opener) {
    const text = swap(swap(d.text, `*${SOURCE_LABEL.et}: ${d.opener.source}*`, `*${SOURCE_LABEL[language]}: ${d.opener.source}*`), `\n\n${THINK_LABEL.et}:\n\n`, `\n\n${THINK_LABEL[language]}:\n\n`);
    return { ...b, data: { ...d, text, lang: language } };
  }
  if (EXAM_BLOCKS.has(b.type) && !d.lang) return { ...b, data: { ...d, lang: language } };
  return b;
}

export const withSheetLanguage = (blocks = [], language) => (!language || language === 'et' ? blocks : blocks.map((b) => localiseBlock(b, language)));
