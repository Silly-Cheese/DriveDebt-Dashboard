import { accountBalanceWarnings } from '../lib/audit';
import { formatMoney } from '../lib/money';

export default function DataHealthPanel({ data }) {
  const balances = accountBalanceWarnings(data.accounts, data.transactions);
  const outOfSync = balances.filter((item) => !item.inSync);
  const unpaidBills = data.bills.filter((bill) => bill.status !== 'paid').length;
  const hasBackupData = data.transactions.length > 0 || data.paychecks.length > 0 || data.bills.length > 0;

  return (
    <div className="panel">
      <h3>Data Health</h3>
      <div className="health-list">
        <div className={outOfSync.length === 0 ? 'health-item good' : 'health-item warning'}>
          <strong>{outOfSync.length === 0 ? 'Balances look synced' : 'Balance check needed'}</strong>
          <span>{outOfSync.length === 0 ? 'No account mismatches detected.' : `${outOfSync.length} account(s) differ from ledger math.`}</span>
        </div>
        <div className="health-item">
          <strong>{unpaidBills} unpaid bills</strong>
          <span>Used for safe-to-spend warnings.</span>
        </div>
        <div className={hasBackupData ? 'health-item good' : 'health-item warning'}>
          <strong>{hasBackupData ? 'Data is active' : 'No finance records yet'}</strong>
          <span>{hasBackupData ? 'Export backups from Settings regularly.' : 'Use Quick Add to begin tracking.'}</span>
        </div>
      </div>
      {outOfSync.length > 0 && (
        <div className="mini-table">
          {outOfSync.map((item) => <span key={item.accountId}>{item.accountName}: difference {formatMoney(item.difference)}</span>)}
        </div>
      )}
    </div>
  );
}
