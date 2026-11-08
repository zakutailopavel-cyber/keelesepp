import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { installTranslateGuard } from './translateGuard.js';

// what the browser's translator does: every text node is replaced by <font>translated text</font>
function translatePage(root) {
  const walker = document.createTreeWalker(root, globalThis.NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((text) => {
    const font = document.createElement('font');
    font.textContent = `[ru] ${text.textContent}`;
    text.parentNode.replaceChild(font, text);
  });
}

function Lesson() {
  const [show, setShow] = useState(true);
  return <div><button type="button" onClick={() => setShow(false)}>Lõpeta</button>{show ? 'Tund algab' : null}{show ? <b>Ava tund</b> : 'Tund on läbi'}</div>;
}

describe('translateGuard', () => {
  it('keeps React working after the page was translated', () => {
    expect(installTranslateGuard()).toBe(true);
    expect(installTranslateGuard()).toBe(false);
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    act(() => root.render(<Lesson />));
    translatePage(host);
    expect(() => act(() => host.querySelector('button').click())).not.toThrow();
    expect(host.textContent).toContain('Tund on läbi');
    act(() => root.unmount());
    host.remove();
  });

  it('leaves ordinary removals and insertions alone', () => {
    const parent = document.createElement('div');
    const a = document.createElement('i');
    const b = document.createElement('u');
    parent.append(a);
    parent.insertBefore(b, a);
    expect([...parent.children]).toEqual([b, a]);
    parent.removeChild(b);
    expect([...parent.children]).toEqual([a]);
  });
});
