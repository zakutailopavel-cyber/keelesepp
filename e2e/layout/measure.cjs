// Measures one opened worksheet in the page: what a phone user would run into, per block card.
// Own-scroll boxes (overflow-x auto/scroll inside the card) are allowed: what scrolls inside its own box does not move the page.
function measureInPage() {
  const vw = document.documentElement.clientWidth;
  const ownScroll = (el, stop) => { for (let n = el.parentElement; n && n !== stop; n = n.parentElement) { const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  const visible = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0; };
  const zoomOf = (el) => { let z = 1; for (let n = el; n; n = n.parentElement) { const v = parseFloat(getComputedStyle(n).zoom); if (v) z *= v; } return z; };
  const scrollers = [document.documentElement, ...document.querySelectorAll('.modal__body, .sb-reading, .st-canvas, .modal')].filter(Boolean);
  const page = {
    viewport: vw,
    docOverflowX: document.documentElement.scrollWidth - vw,
    scrollers: scrollers.map((el) => ({ el: el.className || el.tagName, overflowX: el.scrollWidth - el.clientWidth, style: getComputedStyle(el).overflowX })),
    zoom: (() => { const z = document.querySelector('.st-zoom'); return z ? zoomOf(z) : null; })(),
  };
  const CONTROL = 'input:not([type=hidden]), textarea, select, button, [role=button], audio, li.pick, label:has(input[type=checkbox])';
  const cards = [...document.querySelectorAll('.ws-page [data-block]')].filter((c) => !c.closest('.ws-measure'));
  const seen = new Map();
  for (const card of cards) {
    const id = card.dataset.block;
    const type = (window.__labDoc?.blocks || []).find((b) => b.id === id)?.type || '?';
    const zoom = zoomOf(card);
    const out = { id, type, zoom: +zoom.toFixed(2), width: Math.round(card.getBoundingClientRect().width), overflowRight: 0, overflowLeft: 0, cardScroll: card.scrollWidth - card.clientWidth, minTapW: null, minTapH: null, tapFails: 0, tapTotal: 0, minInputFont: null, minTextFont: null, worst: null };
    const cr = document.documentElement.clientWidth;
    card.querySelectorAll('*').forEach((el) => {
      if (!visible(el) || ownScroll(el, card.parentElement) || el.closest('svg')?.parentElement && el.tagName.toLowerCase() !== 'svg' && el.closest('svg')) return;
      const r = el.getBoundingClientRect();
      if (r.right - cr > out.overflowRight) { out.overflowRight = Math.round(r.right - cr); out.worst = el.className?.baseVal ?? el.className ?? el.tagName; }
      if (-r.left > out.overflowLeft) out.overflowLeft = Math.round(-r.left);
    });
    const controls = [...card.querySelectorAll(CONTROL)].filter(visible);
    for (const el of controls) {
      if (el.matches('input[type=checkbox]') && el.closest('label')) continue; // its label is the target
      if (el.closest('.ws-marks')) continue;
      const r = el.getBoundingClientRect();
      out.tapTotal += 1;
      const inline = el.matches('.ws-coloring-region, .ws-coloring-region *');
      if (!inline && (r.height < 43.5 || r.width < 43.5)) out.tapFails += 1;
      out.minTapW = out.minTapW === null ? r.width : Math.min(out.minTapW, r.width);
      out.minTapH = out.minTapH === null ? r.height : Math.min(out.minTapH, r.height);
      if (el.matches('input:not([type=checkbox]), textarea, select')) {
        const f = parseFloat(getComputedStyle(el).fontSize) * zoomOf(el);
        out.minInputFont = out.minInputFont === null ? f : Math.min(out.minInputFont, f);
      }
    }
    const walker = document.createTreeWalker(card, 4);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (!t.data.trim() || !t.parentElement || !visible(t.parentElement) || t.parentElement.closest('svg, option, .ws-marks, small')) continue;
      const f = parseFloat(getComputedStyle(t.parentElement).fontSize) * zoomOf(t.parentElement);
      out.minTextFont = out.minTextFont === null ? f : Math.min(out.minTextFont, f);
    }
    for (const k of ['minTapW', 'minTapH', 'minInputFont', 'minTextFont']) if (out[k] !== null) out[k] = +out[k].toFixed(1);
    seen.set(id, out);
  }
  return { page, blocks: [...seen.values()] };
}
module.exports = { measureInPage };
