import { Button } from '../../components/ui/index.js';
import { ARCHIVED_LINK_QUESTION } from './childPicker.js';

// the question before an archived card is linked to a parent: „Taasta ja seo” makes the card active again (lists,
// calendar, monthly invoices), „Seo arhiveerituna” links it and the card stays archived (the parent's „Minu pere”
// shows only active cards — students.listOwned). Inline (not a second modal):
// the pickers already sit inside a modal.
export default function ArchivedLinkAsk({ name, busy = false, onRestore, onKeep, onCancel }) {
  return <div className="archived-link-ask" role="group" aria-label="Arhiveeritud õpilane" style={{ gridColumn: '1 / -1', flexBasis: '100%', display: 'grid', gap: 8, padding: 12, border: '1px solid #f0c36d', borderRadius: 10, background: '#fff8e6' }}>
    <p style={{ margin: 0 }}><strong>{ARCHIVED_LINK_QUESTION}</strong></p>
    <p className="form-hint" style={{ margin: 0 }}>{name ? `${name}: ` : ''}taastatud kaart on taas õpilaste nimekirjas, kalendris ja kuuarvetes. Arhiveerituna jääb seos alles (arved, ajalugu), aga lapsevanem näeb last oma kontol alles pärast taastamist.</p>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button type="button" loading={busy === 'restore'} disabled={Boolean(busy)} onClick={onRestore}>Taasta ja seo</Button>
      <Button type="button" variant="secondary" loading={busy === 'keep'} disabled={Boolean(busy)} onClick={onKeep}>Seo arhiveerituna</Button>
      <Button type="button" variant="secondary" disabled={Boolean(busy)} onClick={onCancel}>Loobu</Button>
    </div>
  </div>;
}
