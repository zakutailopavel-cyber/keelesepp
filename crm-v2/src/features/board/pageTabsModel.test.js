import { chipLabel, isSheetTitle, pageTabItems, splitSheetTitle } from './pageTabsModel.js';

describe('compact page tab labels', () => {
  it('drops the „Tööleht:” prefix and splits off a known phase', () => {
    expect(splitSheetTitle('Tööleht: Probleemi lahendamine grammatikaga · Harjuta')).toEqual({ lesson: 'Probleemi lahendamine grammatikaga', phase: 'Harjuta' });
    expect(splitSheetTitle('Tööleht: Vahehindamine 1 — tunnid 1–20 · Avasta')).toEqual({ lesson: 'Vahehindamine 1 — tunnid 1–20', phase: 'Avasta' });
    expect(splitSheetTitle('Tööleht: Mina · õpik')).toEqual({ lesson: 'Mina', phase: 'Õpik' });
    expect(splitSheetTitle('Tööleht: Kontroll 1')).toEqual({ lesson: 'Kontroll 1', phase: '' });
    // a „·” that is not a phase stays part of the title
    expect(splitSheetTitle('Tööleht: B1 · Reisimine')).toEqual({ lesson: 'B1 · Reisimine', phase: '' });
    expect(isSheetTitle('Tund 3')).toBe(false);
  });

  it('groups the pages of one lesson into one tab with phase chips in Avasta → Harjuta → Kasuta → Õpik order', () => {
    const pages = [
      { id: 'p1', title: 'Tund 20.10.2026' },
      { id: 'k', title: 'Tööleht: Probleemi lahendamine · Kasuta' },
      { id: 'v', title: 'Tööleht: Vahehindamine 1 · Avasta' },
      { id: 'a', title: 'Tööleht: Probleemi lahendamine · Avasta' },
      { id: 'h', title: 'Tööleht: Probleemi lahendamine · Harjuta' },
      { id: 'x', title: 'Tööleht: Kontroll 1' },
    ];
    const items = pageTabItems(pages);
    expect(items.map((item) => (item.kind === 'page' ? item.label : `${item.lesson}: ${item.items.map(chipLabel).join(' · ')}`))).toEqual([
      'Tund 20.10.2026',
      'Probleemi lahendamine: Avasta · Harjuta · Kasuta',
      'Vahehindamine 1: Avasta',
      'Kontroll 1',
    ]);
    expect(items[1].items.map((entry) => entry.page.id)).toEqual(['a', 'h', 'k']);
  });

  it('a page without a phase next to phased pages of the same lesson becomes a chip „Leht”', () => {
    const items = pageTabItems([{ id: 'a', title: 'Tööleht: Mina · Avasta' }, { id: 'b', title: 'Tööleht: Mina' }]);
    expect(items).toHaveLength(1);
    expect(items[0].items.map(chipLabel)).toEqual(['Leht', 'Avasta']);
  });
});
