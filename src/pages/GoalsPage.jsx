import { useState } from 'react';
import MoneyForm from '../components/MoneyForm';
import ProgressBar from '../components/ProgressBar';
import { createRecord, deleteRecord, saveKnownRecord } from '../lib/firestoreService';
import { formatMoney, toNumber } from '../lib/money';

function GoalCard({ uid, goal }) {
  const [amount, setAmount] = useState('');
  const value = goal.targetAmount ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  async function contribute(event) {
    event.preventDefault();
    const contribution = toNumber(amount);
    await createRecord(uid, 'transactions', {
      date: new Date().toISOString().slice(0, 10),
      type: 'goal-contribution',
      category: 'Savings',
      description: `Goal contribution: ${goal.name}`,
      amount: contribution,
      goalId: goal.id,
    });
    await saveKnownRecord(uid, 'goals', goal.id, {
      currentAmount: toNumber(goal.currentAmount) + contribution,
    });
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
        <button className="mini-button">Add</button>
      </form>
      <div className="row-actions left-actions">
        <button className="mini-button" onClick={archiveGoal}>Archive</button>
        <button className="mini-button danger-button" onClick={() => deleteRecord(uid, 'goals', goal.id)}>Delete</button>
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
        {data.goals.map((goal) => <GoalCard key={goal.id} uid={uid} goal={goal} />)}
      </div>
    </section>
  );
}
