import { Select } from '../../../components/ui/index.js';
import { FIE_ISSUER_OPTIONS } from './fieModel.js';
import { useIsOwner } from './useIsOwner.js';

/**
 * „Arve väljastaja” on a new invoice (owner only, 2026-11-09). "" = the card's default (E&P Koolitus OÜ unless the
 * owner set the card to FIE). The server checks again: FIE only for the owner's own lessons and only with the FIE
 * name and IBAN filled. Anyone else sees nothing and always issues the card's default.
 */
export default function IssuerSelect({ value = '', onChange, id = 'invoice-issuer' }) {
  const isOwner = useIsOwner();
  if (!isOwner) return null;
  return <Select id={id} label="Arve väljastaja" value={value} onChange={(event) => onChange(event.target.value)}>
    {FIE_ISSUER_OPTIONS.map((option) => <option key={option.value || 'default'} value={option.value}>{option.label}</option>)}
  </Select>;
}
