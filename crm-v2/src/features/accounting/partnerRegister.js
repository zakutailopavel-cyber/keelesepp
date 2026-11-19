// Partnerid — one partner register for the books (the accountant 2026-11-19: „Партнёров нет в бухгалтерии, есть только
// tarnijad”; docs/ACCOUNTING.md „Partnerid”). Three sources, one list:
//   Tarnijad  — suppliers/{id} (edited in SuppliersPanel, as before);
//   Ostjad    — derived from the CRM invoices on the server (functions/accounting-partners-core.js customersFromInvoices):
//               company payer = name + registry code, private payer = the name only; read-only here;
//   Muud      — accountingPartners/{id}: Maksu- ja Tolliamet, Töötukassa, osanik, töötaja, pank … (OtherPartnersGrid).
// Pure helpers; the server checks everything again.
import { PARTNER_TYPE_LABELS, maskCode } from './accountingReports.js';
import { ibanProblem, supplierDuplicate } from '../purchases/purchases.js';

export const OTHER_KINDS = [
  ['tax', 'Maksuamet'],
  ['public', 'Riigiasutus'],
  ['owner', 'Osanik'],
  ['employee', 'Töötaja'],
  ['bank', 'Pank'],
  ['other', 'Muu'],
];
export const kindLabel = (kind) => OTHER_KINDS.find(([id]) => id === kind)?.[1] || 'Muu';

// one-click „Lisa” (functions/accounting-partners-core.js PARTNER_PRESETS — keep the same)
export const PARTNER_PRESETS = [
  { key: 'mta', name: 'Maksu- ja Tolliamet', kind: 'tax', regCode: '70000349' },
  { key: 'tootukassa', name: 'Eesti Töötukassa', kind: 'public', regCode: '70009770' },
  { key: 'osanik', name: 'Pavel Zakutailo', kind: 'owner', regCode: '' },
  { key: 'lhv', name: 'AS LHV Pank', kind: 'bank', regCode: '10539549' },
];
// the presets not in the register yet (the same registry code or name counts as there)
export const missingPresets = (others = []) => PARTNER_PRESETS.filter((preset) => !supplierDuplicate(preset, others));

// every partner as a card for the partner cell of a journal line (PartnerInput): `partnerType` says which kind
export function partnerCards({ suppliers = [], others = [], customers = [] } = {}) {
  return [
    ...suppliers.map((s) => ({ ...s, partnerType: 'supplier' })),
    ...customers.map((c) => ({ ...c, partnerType: 'customer' })),
    ...others.map((o) => ({ ...o, partnerType: 'other' })),
  ];
}

// the register's rows (column Tüüp); a personal code is masked in `code`
export function registerRows({ suppliers = [], others = [], customers = [] } = {}) {
  const rows = [
    ...suppliers.map((s) => ({ key: `supplier:${s.id}`, id: s.id, partnerType: 'supplier', kindLabel: '', regCode: s.regCode || '', vatNumber: s.vatNumber || '', iban: s.iban || '', email: s.email || '', active: s.active !== false, source: 'Tarnijad', name: s.name || '' })),
    ...customers.map((c) => ({ key: `customer:${c.id}`, id: c.id, partnerType: 'customer', kindLabel: c.kind === 'company' ? 'Ettevõte' : 'Eraisik', regCode: c.regCode || '', vatNumber: '', iban: '', email: '', active: true, source: 'CRM arved', name: c.name || '', invoiceCount: c.invoiceCount || 0, lastInvoiceDate: c.lastInvoiceDate || '' })),
    ...others.map((o) => ({ key: `other:${o.id}`, id: o.id, partnerType: 'other', kindLabel: kindLabel(o.kind), regCode: o.regCode || '', vatNumber: o.vatNumber || '', iban: o.iban || '', email: o.email || '', note: o.note || '', active: o.active !== false, source: 'Partnerid', name: o.name || '' })),
  ];
  return rows.map((r) => ({ ...r, typeLabel: PARTNER_TYPE_LABELS[r.partnerType], code: maskCode(r.regCode) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'et') || a.typeLabel.localeCompare(b.typeLabel, 'et'));
}

// search over name, code, KMKR, IBAN, e-mail and Tüüp / Liik (a personal code is searched in full but shown masked)
export function filterRegister(rows = [], { type = '', query = '', showInactive = true } = {}) {
  const needle = String(query || '').trim().toLocaleLowerCase('et');
  return rows.filter((r) => (!type || r.partnerType === type) && (showInactive || r.active !== false)
    && (!needle || [r.name, r.regCode, r.vatNumber, r.iban, r.email, r.typeLabel, r.kindLabel].some((v) => String(v || '').toLocaleLowerCase('et').includes(needle))));
}

// ---- Muud: the editable grid and the import from Excel (like Tarnijad) ----
export const blankOther = () => ({ name: '', kind: 'other', regCode: '', vatNumber: '', email: '', iban: '', note: '', active: true });
export const OTHER_FIELDS = [
  ['name', 'Nimi'],
  ['kind', 'Liik'],
  ['regCode', 'Reg-kood / isikukood'],
  ['vatNumber', 'KMKR nr'],
  ['email', 'E-post'],
  ['iban', 'IBAN'],
  ['note', 'Märkus'],
];
export const otherChanged = (a, b) => OTHER_FIELDS.some(([key]) => String(a[key] || '') !== String(b[key] || '')) || (a.active !== false) !== (b.active !== false);

const HEADER_FIELDS = [
  [/^(nimi|nimetus|partner|name)$/, 'name'],
  [/^(liik|tüüp|tyyp|kind|type)$/, 'kind'],
  [/^(registrikood|reg\.?\s*-?\s*kood|reg\.?\s*nr|isikukood|reg-kood \/ isikukood|kood|regcode)$/, 'regCode'],
  [/^(kmkr|kmkr nr|km nr|vat|vat number)$/, 'vatNumber'],
  [/^(e-post|epost|e-mail|email)$/, 'email'],
  [/^(iban|arveldusarve|pangakonto)$/, 'iban'],
  [/^(märkus|markus|note|kommentaar)$/, 'note'],
  [/^(aktiivne|active)$/, 'active'],
];
const DEFAULT_ORDER = [...OTHER_FIELDS.map(([key]) => key), 'active'];
const headerField = (cell) => HEADER_FIELDS.find(([pattern]) => pattern.test(String(cell || '').trim().toLowerCase().replace(/[:*]/g, '')))?.[1] || '';
// „Maksuamet” / „tax” / „osanik” … → the kind id
const kindOf = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (!text) return 'other';
  return OTHER_KINDS.find(([id, label]) => id === text || label.toLowerCase() === text)?.[0] || 'other';
};

// rows pasted from Excel (tab separated) → „Muu” partner values; a first row of column names maps the columns in any
// order, without it: Nimi | Liik | Reg-kood / isikukood | KMKR nr | E-post | IBAN | Märkus | Aktiivne (the Muud export)
export function parseOtherPaste(text, rowsOf) {
  const rows = rowsOf(text);
  if (!rows.length) return [];
  const mapped = rows[0].map(headerField);
  const hasHeader = mapped.filter(Boolean).length >= 2;
  const order = hasHeader ? mapped : DEFAULT_ORDER;
  return (hasHeader ? rows.slice(1) : rows).map((cells) => {
    const values = blankOther();
    order.forEach((key, index) => {
      if (!key || cells[index] === undefined) return;
      if (key === 'active') values.active = !/^(ei|no|false|0|mitteaktiivne)$/i.test(String(cells[index]).trim());
      else if (key === 'kind') values.kind = kindOf(cells[index]);
      else values[key] = String(cells[index]).trim();
    });
    return values;
  }).filter((values) => values.name || values.regCode || values.iban || values.email);
}

export function otherImportPreview(rows = [], existing = []) {
  const seen = [...existing];
  return rows.map((values, index) => {
    const row = index + 1;
    const email = String(values.email || '').trim();
    const error = !String(values.name || '').trim() ? 'nimi puudub'
      : ibanProblem(values.iban) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'e-post on vigane' : '');
    if (error) return { row, values, status: 'error', message: error };
    const dup = supplierDuplicate(values, seen);
    if (dup) return { row, values, status: 'duplicate', message: dup.importRow ? `sama mis rida ${dup.importRow}` : `juba olemas: ${dup.name}` };
    seen.push({ ...values, id: `row-${row}`, importRow: row });
    return { row, values, status: 'new', message: 'uus' };
  });
}
