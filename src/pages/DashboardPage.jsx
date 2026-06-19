import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import { formatMoney, percent, toNumber } from '../lib/money';
import { getCarProgress, getIncomeStats, getSafeToSpend, suggestPaycheckPlan } from '../lib/calculations';
import { buildWarnings } from '../lib/audit';

export default function DashboardPage({ data }) {
  const safe = getSafeToSpend(data);
  const income = getIncomeStats(data.paychecks);
  const carProgress = getCarProgress(data.carLoan);
  const checking = data.accounts.find((account) => account.id === 'checking') || { balance: 0 };
  const savings = data.accounts.find((account) => account.id === 'savings') || { balance: 0 };
  const totalAccounts = toNumber(checking.balance) + toNumber(savings.balance);
  const alerts = buildWarnings(data);
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

      {alerts.length > 0 && (
        <div className="warning-grid">
          {alerts.slice(0, 4).map((item) => (
            <div className={`warning-card ${item.type}`} key={`${item.title}-${item.message}`}>
              <strong>{item.title}</strong>
              <span>{item.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Checking" value={formatMoney(checking.balance)} hint="Used for Safe To Spend" />
        <StatCard label="Savings" value={formatMoney(savings.balance)} hint="Protected money" tone="stable" />
        <StatCard label="Safe To Spend" value={formatMoney(safe.safeToSpend)} hint="Checking after obligations" tone={safe.pressure} />
        <StatCard label="Total Accounts" value={formatMoney(totalAccounts)} hint="Checking + Savings" />
      </div>

      <div className="stat-grid">
        <StatCard label="30-Day Income" value={formatMoney(income.last30)} hint="Received paychecks only" />
        <StatCard label="90-Day Income" value={formatMoney(income.last90)} hint="Rolling income window" />
        <StatCard label="Average Paycheck" value={formatMoney(income.average)} hint={`Lowest: ${formatMoney(income.lowest)}`} />
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
