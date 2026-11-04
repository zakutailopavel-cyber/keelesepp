import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chipLabel, pageTabItems } from './pageTabsModel.js';

// The board's page tabs as a toolbar (owner 2026-11-04): a solid bar above the board, one tab per lesson with a chip
// per phase, the active tab scrolled into view, arrows at the edges instead of cut text; on a narrow bar (iPad / phone)
// that cannot fit the tabs only „Tahvel”, the open page and a menu „Lehed ▾” stay.
// StudentBoard renders each page's own tab (`renderTab`: rename, × and „…” stay there); this file only lays them out.

const NARROW = 1000; // px of bar width below which the tabs fold into „Lehed ▾” when they do not fit

export default function BoardPageTabs({ className, pages, pageId, onBoard, onChoose, renderTab, trailing = null, insetRight = 0 }) {
  const scroller = useRef(null);
  const bar = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useMemo(() => pageTabItems(pages), [pages]);
  const signature = useMemo(() => items.map((item) => (item.kind === 'lesson' ? `${item.key}:${item.items.length}` : item.key)).join('|'), [items]);
  // folded for this set of tabs (a new set is measured unfolded first); `needed` = bar width at which they fit again
  const [fold, setFold] = useState({ signature: '', needed: 0 });
  const folded = fold.signature === signature;

  const measure = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    const width = bar.current?.clientWidth || 0;
    const overflow = element.scrollWidth > element.clientWidth + 1;
    if (!folded && width > 0 && width < NARROW && overflow) {
      setFold({ signature, needed: width + (element.scrollWidth - element.clientWidth) });
      return;
    }
    if (folded && width >= Math.min(NARROW, fold.needed)) { setFold({ signature: '', needed: 0 }); return; }
    const left = element.scrollLeft > 2;
    const right = element.scrollLeft + element.clientWidth < element.scrollWidth - 2;
    setEdges((current) => (current.left === left && current.right === right ? current : { left, right }));
  }, [folded, fold.needed, signature]);

  useEffect(() => {
    const frame = globalThis.requestAnimationFrame?.(measure);
    return () => globalThis.cancelAnimationFrame?.(frame);
  }, [measure, pageId]);
  useEffect(() => {
    const target = bar.current;
    const Observer = globalThis.ResizeObserver;
    if (!target || !Observer) return undefined;
    const observer = new Observer(() => measure());
    observer.observe(target);
    return () => observer.disconnect();
  }, [measure]);

  // the open page is always in view
  useEffect(() => {
    const element = scroller.current;
    const active = element?.querySelector('[aria-selected="true"]');
    if (!element || !active?.getBoundingClientRect) return;
    const box = element.getBoundingClientRect();
    const tab = active.getBoundingClientRect();
    const pad = 32;
    let shift = 0;
    if (tab.left < box.left + pad) shift = tab.left - box.left - pad;
    else if (tab.right > box.right - pad) shift = tab.right - box.right + pad;
    if (shift) element.scrollLeft += shift;
  }, [pageId, signature, folded]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => { if (event.type === 'keydown' ? event.key === 'Escape' : !bar.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [menuOpen]);

  const scrollBy = (direction) => {
    const element = scroller.current;
    if (!element) return;
    const delta = direction * Math.max(120, element.clientWidth * 0.7);
    if (element.scrollBy) element.scrollBy({ left: delta, behavior: 'smooth' }); else element.scrollLeft += delta;
  };

  const tabOf = (item) => {
    if (item.kind === 'page') return <Fragment key={item.key}>{renderTab(item.page, { label: item.label, className: 'sb-tab' })}</Fragment>;
    const open = item.items.some((entry) => entry.page.id === pageId);
    return <span key={item.key} className={`sb-tabgroup${open ? ' is-open' : ''}`} role="group" aria-label={item.lesson}>
      <span className="sb-tabgroup__title" title={item.lesson}>{item.lesson}</span>
      {item.items.map((entry) => <Fragment key={entry.page.id}>{renderTab(entry.page, { label: chipLabel(entry), className: 'sb-tab sb-tab--chip' })}</Fragment>)}
    </span>;
  };
  const shown = folded ? items.filter((item) => (item.kind === 'page' ? item.page.id === pageId : item.items.some((entry) => entry.page.id === pageId))) : items;
  const choose = (page) => { setMenuOpen(false); if (page) onChoose(page); else onBoard(); };

  return <div ref={bar} className={`${className} sb-tabbar${folded ? ' is-folded' : ''}`} style={insetRight ? { '--sb-tabbar-right': `${Math.round(insetRight)}px` } : undefined}>
    <div className={`sb-tabbar__scroll${edges.left ? ' has-left' : ''}${edges.right ? ' has-right' : ''}`}>
      {edges.left && !folded ? <button type="button" className="sb-tabbar__arrow is-left" tabIndex={-1} aria-label="Keri lehti vasakule" onClick={() => scrollBy(-1)}><ChevronLeft size={16} aria-hidden="true" /></button> : null}
      <div ref={scroller} className="sb-tabbar__tabs" role="tablist" aria-label="Tahvli lehed" onScroll={measure}>
        <button type="button" role="tab" className="sb-tab" aria-selected={pageId === null} onClick={onBoard}>Tahvel</button>
        {shown.map(tabOf)}
      </div>
      {edges.right && !folded ? <button type="button" className="sb-tabbar__arrow is-right" tabIndex={-1} aria-label="Keri lehti paremale" onClick={() => scrollBy(1)}><ChevronRight size={16} aria-hidden="true" /></button> : null}
    </div>
    {folded ? <span className="sb-tabbar__more">
      <button type="button" className="sb-tabbar__menu-btn" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>Lehed <ChevronDown size={14} aria-hidden="true" /></button>
      {menuOpen ? <div className="sb-tabbar__menu" role="menu" aria-label="Lehed">
        <button type="button" role="menuitemradio" aria-checked={pageId === null} onClick={() => choose(null)}>Tahvel</button>
        {items.map((item) => (item.kind === 'page'
          ? <button key={item.key} type="button" role="menuitemradio" aria-checked={item.page.id === pageId} title={item.page.title || 'Leht'} onClick={() => choose(item.page)}>{item.label}</button>
          : <div key={item.key} className="sb-tabbar__menu-group" role="group" aria-label={item.lesson}>
            <span className="sb-tabbar__menu-title" title={item.lesson}>{item.lesson}</span>
            <span className="sb-tabbar__menu-chips">{item.items.map((entry) => <button key={entry.page.id} type="button" role="menuitemradio" aria-checked={entry.page.id === pageId} aria-label={entry.page.title || 'Leht'} onClick={() => choose(entry.page)}>{chipLabel(entry)}</button>)}</span>
          </div>))}
      </div> : null}
    </span> : null}
    {trailing}
  </div>;
}
