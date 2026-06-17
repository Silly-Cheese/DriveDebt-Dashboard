import MoneyForm from '../components/MoneyForm';
import { createRecord } from '../lib/firestoreService';
import { formatMoney, toNumber } from '../lib/money';

export default function BillsPage({ uid, data }) {
  async function addBill(form) {
    await createRecord(uid, 'bills', {
      name: form.name,
      amount: toNumber(form.amount),
      dueDate: form.dueDate,
      frequency: form.frequency,
      status: 'unpaid',
      category: form.category,
    });
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Obligations</p><h2>Bills</h2></div></header>
      <MoneyForm
        title="Add Bill"
        buttonText="Add Bill"
        onSave={addBill}
        fields={[
          { name: 'name', label: 'Bill Name' },
          { name: 'amount', label: 'Amount', type: 'number', step: '0.01' },
          { name: 'dueDate', label: 'Due Date', type: 'date' },
          { name: 'category', label: 'Category' },
          { name: 'frequency', label: 'Frequency', value: 'monthly', options: [
            { value: 'one-time', label: 'One-time' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'biweekly', label: 'Biweekly' },
            { value: 'monthly', label: 'Monthly' },
          ]},
        ]}
      />
      <div className="panel">
        <h3>Bill List</h3>
        {data.bills.length === 0 ? <p className="muted">No bills yet.</p> : data.bills.map((bill) => (
          <div className="row" key={bill.id}>
            <span>{bill.dueDate} • {bill.name} • {bill.frequency}</span>
            <strong>{formatMoney(bill.amount)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
