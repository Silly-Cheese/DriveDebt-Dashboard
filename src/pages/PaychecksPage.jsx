import MoneyForm from '../components/MoneyForm';
import { createRecord } from '../lib/firestoreService';
import { formatMoney, toNumber } from '../lib/money';

export default function PaychecksPage({ uid, data }) {
  async function addPaycheck(form) {
    await createRecord(uid, 'paychecks', {
      payDate: form.payDate,
      source: form.source,
      grossAmount: toNumber(form.grossAmount),
      netAmount: toNumber(form.netAmount),
      hours: toNumber(form.hours),
      status: form.status,
      notes: form.notes || '',
    });
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Income Engine</p><h2>Paychecks</h2></div></header>
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
          { name: 'status', label: 'Status', value: 'received', options: [
            { value: 'received', label: 'Received' },
            { value: 'expected', label: 'Expected' },
          ]},
          { name: 'notes', label: 'Notes' },
        ]}
      />
      <div className="panel">
        <h3>Paycheck History</h3>
        {data.paychecks.length === 0 ? <p className="muted">No paychecks yet.</p> : data.paychecks.map((paycheck) => (
          <div className="row" key={paycheck.id}>
            <span>{paycheck.payDate} • {paycheck.source} • {paycheck.status}</span>
            <strong>{formatMoney(paycheck.netAmount)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
