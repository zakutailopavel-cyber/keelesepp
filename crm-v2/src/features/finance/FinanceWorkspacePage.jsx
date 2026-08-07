import { useState } from 'react';
import FinancePage from './FinancePage.jsx';
import ManualInvoiceDialog from './ManualInvoiceDialog.jsx';
import './manualInvoice.css';

export default function FinanceWorkspacePage(props) {
  const [financePageKey, setFinancePageKey] = useState(0);
  const [notice, setNotice] = useState('');

  const handleManualInvoiceCreated = async (invoice) => {
    setNotice(`Arve ${invoice?.num || ''} loodi edukalt.`.trim());
    setFinancePageKey((current) => current + 1);
  };

  return (
    <>
      <div className="finance-workspace-actions">
        <ManualInvoiceDialog onCreated={handleManualInvoiceCreated} />
      </div>
      {notice ? (
        <div className="finance-workspace-notice" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Sulge teade" onClick={() => setNotice('')}>×</button>
        </div>
      ) : null}
      <FinancePage key={financePageKey} {...props} />
    </>
  );
}
