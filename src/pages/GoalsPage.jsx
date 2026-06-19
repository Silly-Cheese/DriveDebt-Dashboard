import { useState } from 'react';
import MoneyForm from '../components/MoneyForm';
import ProgressBar from '../components/ProgressBar';
import SafeActionButton from '../components/SafeActionButton';
import { createRecord, deleteRecord, saveKnownRecord } from '../lib/firestoreService';
import { fundGoal } from '../lib/moneyEngine';
import { formatMoney, toNumber } from '../lib/money';

function GoalCard({ uid, data, goal }) {
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('checking');
  const value = goal.targetAmount ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  async function contribute(event) {
    event.preventDefault();
    await fundGoal(uid, data, goal, { amount: toNumber(amount), accountId });
    setAmount('');
  }

  async function archiveGoal() {
    await saveKnownRecord(uid, 'goals', goal.id, { status: 'archived' });
  }

  return (
    <div className={`panel goal-card ${goal.status}`}>
      <h3>{goal.name}</h3>
      <p className="big-money">{formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}</p>
      <ProgressBar value={value} />
      <p className="muted">Priority {goal.priority} • Deadline {goal.deadline || 'none'} • {goal.status}</p>
      <form className="inline-form" onSubmit={contribute}>
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Contribution" required />
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <button className="mini-button">Add</button>
      </form>
      <div className="row-actions left-actions">
        <button className="mini-button" onClick={archiveGoal}>Archive</button>
        <SafeActionButton promptText="Delete this savings goal?" onAction={() => deleteRecord(uid, 'goals', goal.id)}>Delete</SafeActionButton>
      </div>
    </div>
  );
}

export default function GoalsPage({ uid, data }) {
  async function addGoal(form) {
    await createRecord(uid, 'goals', {
      name: form.name,
      targetAmount: toNumber(form.targetAmount),
      currentAmount: toNumber(form.currentAmount),
      monthlyTarget: toNumber(form.monthlyTarget),
      priority: toNumber(form.priority),
      deadline: form.deadline,
      status: 'active',
    });
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Goal Vault</p><h2>Savings Goals</h2></div></header>
      <MoneyForm title="Add Goal" buttonText="Create Goal" onSave={addGoal} fields={[
        { name: 'name', label: 'Goal Name' },
        { name: 'targetAmount', label: 'Target Amount', type: 'number', step: '0.01' },
        { name: 'currentAmount', label: 'Current Amount', type: 'number', step: '0.01', value: '0' },
        { name: 'monthlyTarget', label: 'Monthly Target', type: 'number', step: '0.01', value: '0' },
        { name: 'priority', label: 'Priority', type: 'number', value: '3' },
        { name: 'deadline', label: 'Deadline', type: 'date' },
      ]} />
      <div className="goal-grid">
        {data.goals.length === 0 ? <div className="panel"><p className="muted">No goals yet. Add emergency savings, car maintenance, or a personal goal to track progress.</p></div> : data.goals.map((goal) => <GoalCard key={goal.id} uid={uid} data={data} goal={goal} />)}
      </div>
    </section>
  );
}
