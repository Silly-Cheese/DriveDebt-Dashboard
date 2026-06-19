import { useMemo, useState } from 'react';
import { createRecord, deleteRecord, saveKnownRecord } from '../lib/firestoreService';
import { transactionCategories } from '../lib/categories';
import { formatMoney, toNumber } from '../lib/money';
import ProgressBar from '../components/ProgressBar';
import SafeActionButton from '../components/SafeActionButton';

function spentForCategory(transactions, category) {
  return transactions
    .filter((transaction) => transaction.category === category)
    .filter((transaction) => ['expense', 'car-payment', 'goal-contribution'].includes(transaction.type))
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
}

export default function BudgetPage({ uid, data }) {
  const [category, setCategory] = useState('Gas');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');

  const envelopes = useMemo(() => data.budgetRules.filter((rule) => rule.kind === 'envelope'), [data.budgetRules]);

  async function addEnvelope(event) {
    event.preventDefault();
    await createRecord(uid, 'budgetRules', {
      kind: 'envelope',
      name: category,
      category,
      amount: toNumber(amount),
      period,
      priority: 10,
      status: 'active',
    });
    setAmount('');
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Budget</p><h2>Envelope Budget</h2></div></header>
      <form className="panel" onSubmit={addEnvelope}>
        <h3>Create Budget Envelope</h3>
        <div className="form-grid">
          <label><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{transactionCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span>Budget Amount</span><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
          <label><span>Period</span><select value={period} onChange={(e) => setPeriod(e.target.value)}><option value="weekly">Weekly</option><option value="biweekly">Biweekly</option><option value="monthly">Monthly</option></select></label>
        </div>
        <button className="primary-button">Add Envelope</button>
      </form>
      <div className="goal-grid">
        {envelopes.length === 0 ? <div className="panel"><p className="muted">No budget envelopes yet.</p></div> : envelopes.map((envelope) => {
          const spent = spentForCategory(data.transactions, envelope.category);
          const budgeted = Number(envelope.amount || 0);
          const remaining = budgeted - spent;
          const progress = budgeted ? (spent / budgeted) * 100 : 0;
          return (
            <div className={`panel ${remaining < 0 ? 'danger' : ''}`} key={envelope.id}>
              <h3>{envelope.name}</h3>
              <p className="big-money">{formatMoney(remaining)} left</p>
              <ProgressBar value={Math.min(100, progress)} />
              <p className="muted">Budgeted {formatMoney(budgeted)} • Spent {formatMoney(spent)} • {envelope.period}</p>
              <div className="row-actions left-actions">
                <button className="mini-button" onClick={() => saveKnownRecord(uid, 'budgetRules', envelope.id, { status: envelope.status === 'active' ? 'paused' : 'active' })}>{envelope.status === 'active' ? 'Pause' : 'Resume'}</button>
                <SafeActionButton promptText="Delete this budget envelope?" onAction={() => deleteRecord(uid, 'budgetRules', envelope.id)}>Delete</SafeActionButton>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
