import { useState } from 'react';
import { ArrowRightLeft, Banknote, Landmark, PiggyBank } from 'lucide-react';
import { createRecord, saveKnownRecord, transferBetweenAccounts } from '../lib/firestoreService';
import { exportJson, exportTransactionsCsv } from '../lib/exportData';
import { formatMoney, toNumber } from '../lib/money';

const accountDetails = {
  checking: {
    title: 'Checking',
    icon: Landmark,
    description: 'Main spending account. This is included in Safe To Spend.',
  },
  savings: {
    title: 'Savings',
    icon: PiggyBank,
    description: 'Protected savings account. This is not counted as spending money.',
  },
};

function AccountEditor({ uid, account }) {
  const details = accountDetails[account.id] || { title: account.name, icon: Banknote, description: 'Tracked account.' };
  const Icon = details.icon;
  const [balance, setBalance] = useState(account.balance ?? 0);
  const [institution, setInstitution] = useState(account.institution || '');
  const [saving, setSaving] = useState(false);

  async function saveAccount(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await createRecord(uid, 'transactions', {
        date: new Date().toISOString().slice(0, 10),
        type: 'adjustment',
        accountId: account.id,
        category: 'Balance Adjustment',
        description: `${details.title} manual balance adjustment`,
        amount: toNumber(balance) - toNumber(account.balance),
        balanceBefore: toNumber(account.balance),
        balanceAfter: toNumber(balance),
      });
      await saveKnownRecord(uid, 'accounts', account.id, {
        name: details.title,
        type: account.id,
        balance: toNumber(balance),
        institution,
        includeInSafeToSpend: account.id === 'checking',
        isPrimarySpendingAccount: account.id === 'checking',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel account-panel" onSubmit={saveAccount}>
      <div className="account-heading">
        <div className="brand-mark"><Icon size={22} /></div>
        <div>
          <h3>{details.title}</h3>
          <p className="muted">{details.description}</p>
        </div>
      </div>
      <p className="big-money">{formatMoney(account.balance)}</p>
      <div className="form-grid one-column">
        <label>
          <span>Current Balance</span>
          <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </label>
        <label>
          <span>Bank / Institution</span>
          <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Optional" />
        </label>
      </div>
      <button className="primary-button" disabled={saving}>{saving ? 'Saving...' : `Save ${details.title}`}</button>
    </form>
  );
}

function TransferTool({ uid, checking, savings }) {
  const [direction, setDirection] = useState('checking-to-savings');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Transfer between accounts');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const from = direction === 'checking-to-savings' ? checking : savings;
    const to = direction === 'checking-to-savings' ? savings : checking;
    setSaving(true);
    try {
      await transferBetweenAccounts(uid, from, to, toNumber(amount), note);
      setAmount('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <div className="account-heading">
        <div className="brand-mark"><ArrowRightLeft size={22} /></div>
        <div><h3>Transfer Money</h3><p className="muted">Move money between Checking and Savings with a matching ledger record.</p></div>
      </div>
      <div className="form-grid">
        <label><span>Direction</span><select value={direction} onChange={(e) => setDirection(e.target.value)}><option value="checking-to-savings">Checking to Savings</option><option value="savings-to-checking">Savings to Checking</option></select></label>
        <label><span>Amount</span><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
        <label><span>Note</span><input value={note} onChange={(e) => setNote(e.target.value)} /></label>
      </div>
      <button className="primary-button" disabled={saving}>{saving ? 'Transferring...' : 'Record Transfer'}</button>
    </form>
  );
}

export default function AccountsPage({ uid, data }) {
  const checking = data.accounts.find((account) => account.id === 'checking') || { id: 'checking', name: 'Checking', balance: 0 };
  const savings = data.accounts.find((account) => account.id === 'savings') || { id: 'savings', name: 'Savings', balance: 0 };
  const netCash = toNumber(checking.balance) + toNumber(savings.balance);

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Accounts</p>
          <h2>Checking & Savings</h2>
        </div>
        <div className="status-pill stable">TOTAL {formatMoney(netCash)}</div>
      </header>

      <div className="stat-grid two-stats">
        <div className="stat-card">
          <p>Checking</p>
          <strong>{formatMoney(checking.balance)}</strong>
          <span>Used for Safe To Spend</span>
        </div>
        <div className="stat-card stable">
          <p>Savings</p>
          <strong>{formatMoney(savings.balance)}</strong>
          <span>Protected from spending calculations</span>
        </div>
      </div>

      <div className="two-column">
        <AccountEditor uid={uid} account={checking} />
        <AccountEditor uid={uid} account={savings} />
      </div>

      <TransferTool uid={uid} checking={checking} savings={savings} />

      <div className="panel button-row">
        <button className="secondary-button" onClick={() => exportJson(data)}>Export Full Backup</button>
        <button className="secondary-button" onClick={() => exportTransactionsCsv(data.transactions)}>Export Transactions CSV</button>
      </div>
    </section>
  );
}
