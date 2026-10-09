import { render } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { Md } from './ui.jsx';
import { RICH_EXTENSIONS } from './richExtensions.js';
import { docToMarkup, markupToHtml, stripMarks } from './richText.js';
import { findEditable } from './inlineEdit.js';

const roundTrip = (markup) => {
  const editor = new Editor({ extensions: RICH_EXTENSIONS, content: markupToHtml(markup) });
  const out = docToMarkup(editor.getJSON());
  editor.destroy();
  return out;
};

describe('formatted worksheet texts', () => {
  it('keeps bold, italic, highlight and colours through the Tiptap editor', () => {
    expect(roundTrip('Loe **hoolikalt** ja *kirjuta* vastus.')).toBe('Loe **hoolikalt** ja *kirjuta* vastus.');
    expect(roundTrip('See on ==tähtis== ja {red}punane{/red}.')).toBe('See on ==tähtis== ja {red}punane{/red}.');
    expect(roundTrip('Esimene lõik.\n\nTeine lõik\nuus rida.')).toBe('Esimene lõik.\n\nTeine lõik\nuus rida.');
    expect(roundTrip('<b>pole</b> HTML & ohutu')).toBe('<b>pole</b> HTML & ohutu');
  });

  it('shows the formatting on the sheet and finds the text again without the markup', () => {
    const { container } = render(<p><Md text={'Loe **hoolikalt**, ==märgi== ja {blue}vasta{/blue}. {{võtmesõna}}'} /></p>);
    expect(container.querySelector('strong').textContent).toBe('hoolikalt');
    expect(container.querySelector('mark').textContent).toBe('märgi');
    expect(container.querySelector('span[style]').getAttribute('style')).toContain('color');
    expect(container.querySelector('.ws-keyword').textContent).toBe('võtmesõna');
    expect(stripMarks('Loe **hoolikalt**, ==märgi== ja {blue}vasta{/blue}.')).toBe('Loe hoolikalt, märgi ja vasta.');
    const data = { instruction: 'Loe **hoolikalt** teksti.' };
    const { container: sheet } = render(<div><p className="i"><Md text={data.instruction} /></p></div>);
    const hit = findEditable(sheet.querySelector('strong'), sheet, data);
    expect(hit.path).toEqual(['instruction']);
  });
});
