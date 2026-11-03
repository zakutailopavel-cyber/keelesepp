import { AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/index.js';
import { dmy, euro } from './accountingReports.js';
import { MAX_DAYS } from './duplicateReceipts.js';

// „Võimalikud topeltlaekumised”: display only. Nothing here deletes or changes an entry; the accountant checks the bank
// statement and removes or reverses the wrong one herself in the päevaraamat.
export default function DuplicateReceiptsPanel({ pairs = [], labels = new Map() }) {
  if (!pairs.length) return null;
  const name = (entry) => labels.get(entry.id) || entry.number || entry.id;
  return <Card className="accounting-card" aria-label="Võimalikud topeltlaekumised">
    <details>
      <summary style={{ cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
        <AlertTriangle size={18} aria-hidden="true" />
        <strong>Võimalikud topeltlaekumised ({pairs.length})</strong>
      </summary>
      <p className="field__hint">
        CRM-i makse laekumiskanne ja käsitsi tehtud kanne kontol 1010 on sama summaga ning sama kliendi või viitega
        (kuni {MAX_DAYS} päeva vahe). Kontrolli pangaväljavõttest, kas raha laekus üks või kaks korda. Süsteem ei kustuta
        ega muuda midagi ise.
      </p>
      <div className="students-table-wrap">
        <table className="students-table accounting-table">
          <thead><tr><th>Summa</th><th>CRM-i laekumine</th><th>Käsitsi kanne</th><th>Vahe</th><th>Miks</th></tr></thead>
          <tbody>{pairs.map((pair) => <tr key={pair.id}>
            <td className="num">{euro(pair.amountCents)} €</td>
            <td><strong>{name(pair.crm)}</strong> · {dmy(pair.crm.date)}<br /><small>{pair.crm.description}</small></td>
            <td><strong>{name(pair.manual)}</strong> · {dmy(pair.manual.date)}<br /><small>{pair.manual.description}{pair.manual.documentRef ? ` · ${pair.manual.documentRef}` : ''}</small></td>
            <td>{pair.days} p</td>
            <td>{pair.reason}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  </Card>;
}
