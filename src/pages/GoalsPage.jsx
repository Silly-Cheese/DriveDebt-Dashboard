import MoneyForm from '../components/MoneyForm';
import ProgressBar from '../components/ProgressBar';
import { createRecord } from '../lib/firestoreService';
import { formatMoney, toNumber } from '../lib/money';

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
        {data.goals.map((goal) => {
          const value = goal.targetAmount ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          return <div className="panel" key={goal.id}><h3>{goal.name}</h3><p className="big-money">{formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}</p><ProgressBar value={value} /><p className="muted">Priority {goal.priority} • Deadline {goal.deadline || 'none'}</p></div>;
        })}
      </div>
    </section>
  );
}
