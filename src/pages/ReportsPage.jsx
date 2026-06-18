import StatCard from '../components/StatCard';
import { estimateCarPayoffMonths, getIncomeStats, sumBy } from '../lib/calculations';
import { formatMoney, percent } from '../lib/money';

function BarRow({ label, value, max }) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <div className="bar-label"><span>{label}</span><strong>{formatMoney(value)}</strong></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${width}%` }} /></div>
    </div>
  );
}

export default function ReportsPage({ data }) {
  const income = getIncomeStats(data.paychecks);
  const expenses = sumBy(data.transactions.filter((t) => t.type === 'expense'), (t) => t.amount);
  const carPaid = sumBy(data.carPayments, (p) => p.amount);
  const goalSaved = sumBy(data.goals, (g) => g.currentAmount);
  const payoffMonths = estimateCarPayoffMonths(data.carLoan, 0);
  const categoryTotals = data.transactions.reduce((map, transaction) => {
    if (transaction.type === 'expense' || transaction.type === 'car-payment' || transaction.type === 'goal-contribution') {
      map[transaction.category || 'Other'] = (map[transaction.category || 'Other'] || 0) + Number(transaction.amount || 0);
    }
    return map;
  }, {});
  const categoryRows = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategory = categoryRows[0]?.[1] || 0;

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Reports</p><h2>Financial Health</h2></div></header>
      <div className="stat-grid">
        <StatCard label="90-Day Income" value={formatMoney(income.last90)} hint="Rolling received income" />
        <StatCard label="Average Paycheck" value={formatMoney(income.average)} hint={`Lowest: ${formatMoney(income.lowest)}`} />
        <StatCard label="Logged Expenses" value={formatMoney(expenses)} hint="All-time ledger expenses" />
        <StatCard label="Volatility" value={percent(income.volatility)} hint="Income predictability risk" />
        <StatCard label="Car Paid" value={formatMoney(carPaid)} hint={`${payoffMonths || 'N/A'} months estimated`} />
        <StatCard label="Saved in Goals" value={formatMoney(goalSaved)} hint="Current goal balances" />
      </div>
      <div className="two-column">
        <div className="panel">
          <h3>Spending by Category</h3>
          {categoryRows.length === 0 ? <p className="muted">No expenses yet.</p> : categoryRows.map(([label, value]) => <BarRow key={label} label={label} value={value} max={maxCategory} />)}
        </div>
        <div className="panel">
          <h3>Goal Progress Overview</h3>
          {data.goals.length === 0 ? <p className="muted">No goals yet.</p> : data.goals.map((goal) => <BarRow key={goal.id} label={goal.name} value={Number(goal.currentAmount || 0)} max={Number(goal.targetAmount || 0)} />)}
        </div>
      </div>
      <div className="panel">
        <h3>System Interpretation</h3>
        <p className="muted">This dashboard uses paycheck-based planning because fluctuating income makes fixed monthly budgeting unreliable. The safest approach is to protect required bills first, then emergency savings, then attack the car with extra cash.</p>
      </div>
    </section>
  );
}
