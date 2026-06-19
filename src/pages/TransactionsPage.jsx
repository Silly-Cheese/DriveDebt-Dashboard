import { useMemo, useState } from 'react';
import MoneyForm from '../components/MoneyForm';
import SafeActionButton from '../components/SafeActionButton';
import { deleteRecord } from '../lib/firestoreService';
import { addExpense, addIncome } from '../lib/moneyEngine';
import { transactionCategories, transactionTypes } from '../lib/categories';
import { formatMoney, toNumber } from '../lib/money';

export default function TransactionsPage({ uid, data }) {
  const [query, setQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  async function addTransaction(form) {
    const amount = toNumber(form.amount);
    if (form.type === 'income') {
      await addIncome(uid, data, {
        date: form.date,
        amount,
        accountId: form.accountId,
        category: form.category,
        description: form.description || 'Income',
      });
    } else {
      await addExpense(uid, data, {
        date: form.date,
        amount,
        accountId: form.accountId,
        type: form.type,
        category: form.category,
        description: form.description || 'Expense',
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
        { name: 'type', label: 'Type', value: 'expense', options: transactionTypes.filter((t) => !['transfer', 'adjustment'].includes(t.value)) },
      ]} />
      <div className="panel">
        <h3>Filters</h3>
        <div className="form-grid">
          <label><span>Search</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search description/category" /></label>
          <label><span>Account</span><select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}><option value="all">All Accounts</option>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <label><span>Type</span><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">All Types</option>{transactionTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
        </div>
      </div>
      <div className="panel"><h3>Recent Transactions</h3>{filtered.length === 0 ? <p className="muted">No matching transactions. Use Quick Add or add a transaction here to start building your ledger.</p> : filtered.map((t) => <div className={`row transaction-row ${t.type}`} key={t.id}><span>{t.date} • {t.description} • {t.category} • {t.accountId}</span><strong>{formatMoney(t.amount)}</strong><SafeActionButton promptText="Delete this transaction? This does not automatically reverse the account balance." onAction={() => deleteRecord(uid, 'transactions', t.id)}>Delete</SafeActionButton></div>)}</div>
    </section>
  );
}
