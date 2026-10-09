import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Color, TextStyle } from '@tiptap/extension-text-style';

// What the on-sheet editor may do: paragraphs and line breaks, bold, italic, highlight and the five colours.
export const RICH_EXTENSIONS = [
  StarterKit.configure({ heading: false, blockquote: false, bulletList: false, orderedList: false, listItem: false, listKeymap: false, codeBlock: false, code: false, horizontalRule: false, strike: false, underline: false, link: false }),
  Highlight,
  TextStyle,
  Color,
];
