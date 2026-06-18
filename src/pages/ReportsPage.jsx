import StatCard from '../components/StatCard';
import { estimateCarPayoffMonths, getIncomeStats, sumBy } from '../lib/calculations';
import { formatMoney, percent } from '../lib/money';

export default function ReportsPage({ data }) {
  const income = getIncomeStats(data.paychecks);
  const expenses = sumBy(data.transactions.filter((t) => t.type === 'expense'), (t) => t.amount);
  const carPaid = sumBy(data.carPayments, (p) => p.amount);
  const goalSaved = sumBy(data.goals, (g) => g.currentAmount);
  const payoffMonths = estimateCarPayoffMonths(data.carLoan, 0);

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
      <div className="panel">
        <h3>System Interpretation</h3>
        <p className="muted">This dashboard uses paycheck-based planning because fluctuating income makes fixed monthly budgeting unreliable. The safest approach is to protect required bills first, then emergency savings, then attack the car with extra cash.</p>
      </div>
    </section>
  );
}
