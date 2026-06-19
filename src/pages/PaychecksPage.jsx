import { useState } from 'react';
import MoneyForm from '../components/MoneyForm';
import SafeActionButton from '../components/SafeActionButton';
import { createRecord, deleteRecord } from '../lib/firestoreService';
import { addIncome } from '../lib/moneyEngine';
import { suggestPaycheckPlan } from '../lib/calculations';
import { formatMoney, toNumber } from '../lib/money';

function AllocationWizard({ uid, data }) {
  const [amount, setAmount] = useState('');
  const plan = suggestPaycheckPlan({
    paycheckAmount: toNumber(amount),
    bills: data.bills,
    goals: data.goals,
    carLoan: data.carLoan,
  });

  async function savePlan() {
    await createRecord(uid, 'paycheckPlans', {
      date: new Date().toISOString().slice(0, 10),
      paycheckAmount: toNumber(amount),
      items: plan,
      status: 'planned',
    });
  }

  return (
    <div className="panel">
      <h3>Paycheck Allocation Wizard</h3>
      <p className="muted">Enter a paycheck amount and DriveDebt will suggest where it should go.</p>
      <div className="form-grid">
        <label><span>Paycheck Amount</span><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
      </div>
      <div className="allocation-list">
        {plan.map((item) => <div className="row" key={item.label}><span>{item.label}</span><strong>{formatMoney(item.amount)}</strong></div>)}
      </div>
      <button className="primary-button" onClick={savePlan} disabled={!toNumber(amount)}>Save Plan</button>
    </div>
  );
}

export default function PaychecksPage({ uid, data }) {
  async function addPaycheck(form) {
    const netAmount = toNumber(form.netAmount);
    await createRecord(uid, 'paychecks', {
      payDate: form.payDate,
      source: form.source,
      grossAmount: toNumber(form.grossAmount),
      netAmount,
      hours: toNumber(form.hours),
      status: form.status,
      notes: form.notes || '',
      accountId: form.accountId,
    });

    if (form.status === 'received') {
      await addIncome(uid, data, {
        date: form.payDate,
        amount: netAmount,
        accountId: form.accountId,
        description: `Paycheck from ${form.source}`,
        category: 'Income',
      });
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Income Engine</p><h2>Paychecks</h2></div></header>
      <div className="two-column">
        <MoneyForm
          title="Add Paycheck"
          buttonText="Add Paycheck"
          onSave={addPaycheck}
          fields={[
            { name: 'payDate', label: 'Pay Date', type: 'date' },
            { name: 'source', label: 'Income Source' },
            { name: 'grossAmount', label: 'Gross Amount', type: 'number', step: '0.01' },
            { name: 'netAmount', label: 'Net Amount', type: 'number', step: '0.01' },
            { name: 'hours', label: 'Hours Worked', type: 'number', step: '0.01' },
            { name: 'accountId', label: 'Deposit Account', value: 'checking', options: data.accounts.map((a) => ({ value: a.id, label: a.name })) },
            { name: 'status', label: 'Status', value: 'received', options: [
              { value: 'received', label: 'Received' },
              { value: 'expected', label: 'Expected' },
            ]},
            { name: 'notes', label: 'Notes' },
          ]}
        />
        <AllocationWizard uid={uid} data={data} />
      </div>
      <div className="panel">
        <h3>Paycheck History</h3>
        {data.paychecks.length === 0 ? <p className="muted">No paychecks yet. Add your first paycheck so DriveDebt can estimate income and build a safe plan.</p> : data.paychecks.map((paycheck) => (
          <div className="row" key={paycheck.id}>
            <span>{paycheck.payDate} • {paycheck.source} • {paycheck.status} • {paycheck.accountId || 'no account'}</span>
            <strong>{formatMoney(paycheck.netAmount)}</strong>
            <SafeActionButton promptText="Delete this paycheck record? This does not automatically reverse the account deposit." onAction={() => deleteRecord(uid, 'paychecks', paycheck.id)}>Delete</SafeActionButton>
          </div>
        ))}
      </div>
    </section>
  );
}
