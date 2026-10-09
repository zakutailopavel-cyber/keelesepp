import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { RICH_EXTENSIONS } from './richExtensions.js';
import { MARK_COLORS, docToMarkup, markupToHtml } from './richText.js';


const COLOR_LABEL = { red: 'Punane', blue: 'Sinine', green: 'Roheline', orange: 'Oranž', purple: 'Lilla' };

/**
 * Edits one formatted text right where it is on the sheet: the field lies over the text with the same font; selecting
 * words shows a small bar (bold, italic, colours, highlight). Enter or a click away saves, Esc cancels,
 * Shift+Enter makes a new line (two = a new paragraph where the field allows it).
 */
export default function RichInlineEditor({ rect, value, multiline = true, textStyle = {}, onCommit, onCancel }) {
  const done = useRef(false);
  const finish = (save, editor) => {
    if (done.current) return;
    done.current = true;
    if (save && editor) {
      const next = docToMarkup(editor.getJSON());
      if (next !== value) { onCommit(next); return; }
    }
    onCancel();
  };
  const editor = useEditor({
    extensions: RICH_EXTENSIONS,
    content: markupToHtml(value),
    autofocus: 'end',
    editorProps: {
      attributes: { class: 'ws-tiptap-content', 'aria-label': 'Muuda teksti' },
      handleKeyDown: (view, event) => {
        if (event.key === 'Escape') { event.preventDefault(); finish(false); return true; }
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); finish(true, editorRef.current); return true; }
        if (event.key === 'Enter' && event.shiftKey && !multiline) { event.preventDefault(); return true; }
        return false;
      },
    },
    onBlur: ({ editor: current, event }) => {
      // a click on the formatting bar keeps the editor open
      if (event?.relatedTarget?.closest?.('.ws-tiptap-bar')) return;
      finish(true, current);
    },
  });
  const editorRef = useRef(null);
  useEffect(() => { editorRef.current = editor; }, [editor]);

  if (!editor) return null;
  const keep = (event) => event.preventDefault();
  const color = (name) => editor.chain().focus().setColor(MARK_COLORS[name]).run();
  const style = {
    position: 'absolute', left: rect.left, top: rect.top, width: Math.max(rect.width, 180), minHeight: rect.height,
    zIndex: 1000, ...textStyle,
  };
  return createPortal(
    <div className="ws-tiptap" style={style} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <BubbleMenu editor={editor} className="ws-tiptap-bar" options={{ placement: 'top' }}>
        <button type="button" onMouseDown={keep} aria-label="Paks kiri" className={editor.isActive('bold') ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button type="button" onMouseDown={keep} aria-label="Kaldkiri" className={editor.isActive('italic') ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" onMouseDown={keep} aria-label="Marker" className={editor.isActive('highlight') ? 'is-on' : ''} onClick={() => editor.chain().focus().toggleHighlight().run()}><span className="ws-tiptap-hl">ab</span></button>
        <span className="ws-tiptap-sep" aria-hidden="true" />
        {Object.keys(MARK_COLORS).map((name) => (
          <button type="button" key={name} onMouseDown={keep} aria-label={`Värv: ${COLOR_LABEL[name]}`} onClick={() => color(name)}><span className="ws-tiptap-dot" style={{ background: MARK_COLORS[name] }} /></button>
        ))}
        <button type="button" onMouseDown={keep} aria-label="Eemalda vorming" onClick={() => editor.chain().focus().unsetAllMarks().run()}>⌫</button>
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>,
    document.body,
  );
}
