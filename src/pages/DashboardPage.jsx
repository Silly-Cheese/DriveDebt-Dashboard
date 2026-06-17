import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { formatMoney, percent } from '../lib/money';
import { getCarProgress, getIncomeStats, getSafeToSpend, suggestPaycheckPlan } from '../lib/calculations';

export default function DashboardPage({ data }) {
  const safe = getSafeToSpend(data);
  const income = getIncomeStats(data.paychecks);
  const carProgress = getCarProgress(data.carLoan);
  const suggested = suggestPaycheckPlan({
    paycheckAmount: income.lowest || income.average,
    bills: data.bills,
    goals: data.goals,
    carLoan: data.carLoan,
  });

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Command Center</p>
          <h2>Financial Dashboard</h2>
        </div>
        <div className={`status-pill ${safe.pressure}`}>{safe.pressure.toUpperCase()}</div>
      </header>

      <div className="stat-grid">
        <StatCard label="Available Cash" value={formatMoney(safe.cash)} hint="Checking + cash accounts" />
        <StatCard label="Safe To Spend" value={formatMoney(safe.safeToSpend)} hint="After bills, car reserve, and priority goals" tone={safe.pressure} />
        <StatCard label="30-Day Income" value={formatMoney(income.last30)} hint="Received paychecks only" />
        <StatCard label="Income Volatility" value={percent(income.volatility)} hint="Higher means less predictable" />
      </div>

      <div className="two-column">
        <div className="panel">
          <h3>Car Payoff Progress</h3>
          <p className="big-money">{formatMoney(data.carLoan?.currentBalance || 0)}</p>
          <ProgressBar value={carProgress} />
        </div>

        <div className="panel">
          <h3>Bills Due Soon</h3>
          {safe.upcomingBills.length === 0 ? <p className="muted">No upcoming unpaid bills found.</p> : safe.upcomingBills.map((bill) => (
            <div className="row" key={bill.id}>
              <span>{bill.name}</span>
              <strong>{formatMoney(bill.amount)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Recommended Paycheck Split</h3>
        <p className="muted">Based on your lower recent income, upcoming bills, emergency fund, and car payoff priority.</p>
        <div className="allocation-list">
          {suggested.map((item) => (
            <div className="row" key={item.label}>
              <span>{item.label}</span>
              <strong>{formatMoney(item.amount)}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
