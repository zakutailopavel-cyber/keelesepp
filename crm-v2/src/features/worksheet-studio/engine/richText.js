// Formatting inside worksheet texts (instructions, text blocks, reading passages), stored as short markup so the
// documents stay plain strings: **bold**, *italic*, ==highlight==, {red}coloured{/red}. {{term}} = a curriculum
// keyword (kept as it was). Rendered by <Md>; edited on the sheet with Tiptap (RichInlineEditor).

export const MARK_COLORS = Object.freeze({ red: '#B42318', blue: '#175CD3', green: '#067647', orange: '#B54708', purple: '#6941C6' });
const COLOR_BY_HEX = Object.fromEntries(Object.entries(MARK_COLORS).map(([name, hex]) => [hex.toLowerCase(), name]));
const COLOR_NAMES = Object.keys(MARK_COLORS).join('|');

// one inline token: keyword, colour, bold, highlight, italic (in this order: ** before *)
export const MARK_TOKEN = new RegExp(`(\\{\\{[^{}]+\\}\\}|\\{(?:${COLOR_NAMES})\\}[\\s\\S]+?\\{\\/(?:${COLOR_NAMES})\\}|\\*\\*[^*]+\\*\\*|==[^=]+==|\\*[^*]+\\*)`, 'g');

// the visible text without the markup (search, matching the sheet text to the data)
export function stripMarks(text) {
  return String(text ?? '')
    .replace(new RegExp(`\\{(?:${COLOR_NAMES})\\}([\\s\\S]+?)\\{\\/(?:${COLOR_NAMES})\\}`, 'g'), '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/==([^=]+)==/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// markup → HTML that Tiptap reads (paragraphs on blank lines, single newlines as <br>)
export function markupToHtml(markup) {
  const inline = (text) => escapeHtml(text)
    .replace(new RegExp(`\\{(${COLOR_NAMES})\\}([\\s\\S]+?)\\{\\/\\1\\}`, 'g'), (_, name, inner) => `<span style="color: ${MARK_COLORS[name]}">${inner}</span>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
  return String(markup ?? '').split(/\n{2,}/).map((part) => `<p>${inline(part)}</p>`).join('');
}

const colorName = (value) => {
  const hex = String(value || '').trim().toLowerCase();
  if (COLOR_BY_HEX[hex]) return COLOR_BY_HEX[hex];
  const rgb = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(hex);
  if (!rgb) return '';
  const asHex = `#${rgb.slice(1).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  return COLOR_BY_HEX[asHex] || '';
};

// Tiptap JSON → markup (bold / italic / highlight / colour; anything else becomes plain text)
export function docToMarkup(doc) {
  const textOf = (node) => {
    if (node.type === 'hardBreak') return '\n';
    if (node.type !== 'text') return (node.content || []).map(textOf).join('');
    let text = node.text || '';
    const marks = node.marks || [];
    const has = (type) => marks.some((mark) => mark.type === type);
    if (has('italic')) text = `*${text}*`;
    if (has('bold')) text = `**${text}**`;
    if (has('highlight')) text = `==${text}==`;
    const color = colorName(marks.find((mark) => mark.type === 'textStyle')?.attrs?.color);
    if (color) text = `{${color}}${text}{/${color}}`;
    return text;
  };
  return (doc?.content || []).map((block) => textOf(block)).join('\n\n').replace(/[ \t]+$/gm, '').trim();
}
