import MoneyForm from '../components/MoneyForm';
import ProgressBar from '../components/ProgressBar';
import { createRecord, saveKnownRecord } from '../lib/firestoreService';
import { estimateCarPayoffMonths, getCarProgress } from '../lib/calculations';
import { formatMoney, toNumber } from '../lib/money';

export default function CarPayoffPage({ uid, data }) {
  const car = data.carLoan || {};
  const progress = getCarProgress(car);
  const payoffMonths = estimateCarPayoffMonths(car, 0);
  const payoffWithExtra = estimateCarPayoffMonths(car, 50);

  async function saveLoan(form) {
    await saveKnownRecord(uid, 'carLoan', 'main', {
      lenderName: form.lenderName,
      originalBalance: toNumber(form.originalBalance),
      currentBalance: toNumber(form.currentBalance),
      interestRate: toNumber(form.interestRate),
      minimumPayment: toNumber(form.minimumPayment),
      dueDay: toNumber(form.dueDay),
      targetPayoffDate: form.targetPayoffDate,
    });
  }

  async function addPayment(form) {
    const amount = toNumber(form.amount);
    const newBalance = Math.max(0, toNumber(car.currentBalance) - amount);
    await createRecord(uid, 'carPayments', {
      paymentDate: form.paymentDate,
      amount,
      extraAmount: toNumber(form.extraAmount),
      notes: form.notes || '',
      balanceAfterPayment: newBalance,
    });
    await saveKnownRecord(uid, 'carLoan', 'main', { currentBalance: newBalance });
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Debt Attack</p><h2>Car Payoff Center</h2></div></header>
      <div className="stat-grid">
        <div className="stat-card"><p>Current Balance</p><strong>{formatMoney(car.currentBalance)}</strong><span>{car.lenderName || 'No lender set'}</span></div>
        <div className="stat-card"><p>Minimum Payment</p><strong>{formatMoney(car.minimumPayment)}</strong><span>Due day: {car.dueDay || 'not set'}</span></div>
        <div className="stat-card"><p>Payoff Estimate</p><strong>{payoffMonths ? `${payoffMonths} mo.` : 'N/A'}</strong><span>At minimum payment</span></div>
        <div className="stat-card stable"><p>With $50 Extra</p><strong>{payoffWithExtra ? `${payoffWithExtra} mo.` : 'N/A'}</strong><span>Simple projection</span></div>
      </div>
      <div className="panel"><h3>Payoff Progress</h3><ProgressBar value={progress} /></div>
      <div className="two-column">
        <MoneyForm title="Car Loan Settings" buttonText="Save Loan" onSave={saveLoan} fields={[
          { name: 'lenderName', label: 'Lender Name', value: car.lenderName || '' },
          { name: 'originalBalance', label: 'Original Balance', type: 'number', step: '0.01', value: car.originalBalance || '' },
          { name: 'currentBalance', label: 'Current Balance', type: 'number', step: '0.01', value: car.currentBalance || '' },
          { name: 'interestRate', label: 'Interest Rate %', type: 'number', step: '0.01', value: car.interestRate || '' },
          { name: 'minimumPayment', label: 'Minimum Payment', type: 'number', step: '0.01', value: car.minimumPayment || '' },
          { name: 'dueDay', label: 'Due Day', type: 'number', value: car.dueDay || '' },
          { name: 'targetPayoffDate', label: 'Target Payoff Date', type: 'date', value: car.targetPayoffDate || '' },
        ]} />
        <MoneyForm title="Log Car Payment" buttonText="Add Payment" onSave={addPayment} fields={[
          { name: 'paymentDate', label: 'Payment Date', type: 'date' },
          { name: 'amount', label: 'Total Payment Amount', type: 'number', step: '0.01' },
          { name: 'extraAmount', label: 'Extra Principal Amount', type: 'number', step: '0.01', value: '0' },
          { name: 'notes', label: 'Notes' },
        ]} />
      </div>
      <div className="panel"><h3>Payment History</h3>{data.carPayments.length === 0 ? <p className="muted">No car payments logged.</p> : data.carPayments.map((p) => <div className="row" key={p.id}><span>{p.paymentDate} • {p.notes}</span><strong>{formatMoney(p.amount)}</strong></div>)}</div>
    </section>
  );
}
