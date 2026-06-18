import { useMemo, useState } from 'react';
import MoneyForm from '../components/MoneyForm';
import { createRecord, deleteRecord, saveKnownRecord } from '../lib/firestoreService';
import { transactionCategories, transactionTypes } from '../lib/categories';
import { formatMoney, toNumber } from '../lib/money';

function applyTransactionToBalance(account, type, amount) {
  const current = toNumber(account?.balance);
  if (type === 'income') return current + amount;
  if (type === 'expense' || type === 'car-payment' || type === 'goal-contribution') return current - amount;
  return current;
}

export default function TransactionsPage({ uid, data }) {
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  async function addTransaction(form) {
    const amount = toNumber(form.amount);
    const account = data.accounts.find((item) => item.id === form.accountId);

    await createRecord(uid, 'transactions', {
      date: form.date,
      type: form.type,
      category: form.category,
      description: form.description,
      amount,
      accountId: form.accountId,
      affectsBalance: form.type !== 'transfer',
    });

    if (account && form.type !== 'transfer') {
      await saveKnownRecord(uid, 'accounts', account.id, {
        balance: applyTransactionToBalance(account, form.type, amount),
      });
    }
  }

  const filtered = useMemo(() => data.transactions.filter((transaction) => {
    const matchesSearch = !query || `${transaction.description} ${transaction.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesAccount = accountFilter === 'all' || transaction.accountId === accountFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesAccount && matchesType;
  }), [data.transactions, query, accountFilter, typeFilter]);

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Ledger</p><h2>Transactions</h2></div></header>
      <MoneyForm title="Add Transaction" buttonText="Add Transaction" onSave={addTransaction} fields={[
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'description', label: 'Description' },
        { name: 'amount', label: 'Amount', type: 'number', step: '0.01' },
        { name: 'category', label: 'Category', value: 'Other', options: transactionCategories.map((c) => ({ value: c, label: c })) },
        { name: 'accountId', label: 'Account', value: 'checking', options: data.accounts.map((a) => ({ value: a.id, label: a.name })) },
        { name: 'type', label: 'Type', value: 'expense', options: transactionTypes },
      ]} />
      <div className="panel">
        <h3>Filters</h3>
        <div className="form-grid">
          <label><span>Search</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search description/category" /></label>
          <label><span>Account</span><select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}><option value="all">All Accounts</option>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <label><span>Type</span><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">All Types</option>{transactionTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
        </div>
      </div>
      <div className="panel"><h3>Recent Transactions</h3>{filtered.length === 0 ? <p className="muted">No matching transactions.</p> : filtered.map((t) => <div className={`row transaction-row ${t.type}`} key={t.id}><span>{t.date} • {t.description} • {t.category} • {t.accountId}</span><strong>{formatMoney(t.amount)}</strong><button className="mini-button danger-button" onClick={() => deleteRecord(uid, 'transactions', t.id)}>Delete</button></div>)}</div>
    </section>
  );
}
