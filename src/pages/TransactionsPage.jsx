import MoneyForm from '../components/MoneyForm';
import { createRecord, saveKnownRecord } from '../lib/firestoreService';
import { formatMoney, toNumber } from '../lib/money';

function applyTransactionToBalance(account, type, amount) {
  const current = toNumber(account?.balance);
  if (type === 'income') return current + amount;
  if (type === 'expense' || type === 'car-payment' || type === 'goal-contribution') return current - amount;
  return current;
}

export default function TransactionsPage({ uid, data }) {
  async function addTransaction(form) {
    const amount = toNumber(form.amount);
    const account = data.accounts.find((item) => item.id === form.accountId);

    await createRecord(uid, 'transactions', {
      date: form.date,
      type: form.type,
      category: form.category,
      description: form.description,
      amount,
      accountId: form.accountId,
      affectsBalance: form.type !== 'transfer',
    });

    if (account && form.type !== 'transfer') {
      await saveKnownRecord(uid, 'accounts', account.id, {
        balance: applyTransactionToBalance(account, form.type, amount),
      });
    }
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Ledger</p><h2>Transactions</h2></div></header>
      <MoneyForm title="Add Transaction" buttonText="Add Transaction" onSave={addTransaction} fields={[
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'description', label: 'Description' },
        { name: 'amount', label: 'Amount', type: 'number', step: '0.01' },
        { name: 'category', label: 'Category' },
        { name: 'accountId', label: 'Account', value: 'checking', options: data.accounts.map((a) => ({ value: a.id, label: a.name })) },
        { name: 'type', label: 'Type', value: 'expense', options: [
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
          { value: 'transfer', label: 'Transfer' },
          { value: 'car-payment', label: 'Car Payment' },
          { value: 'goal-contribution', label: 'Goal Contribution' },
        ]},
      ]} />
      <div className="panel"><h3>Recent Transactions</h3>{data.transactions.length === 0 ? <p className="muted">No transactions yet.</p> : data.transactions.map((t) => <div className="row" key={t.id}><span>{t.date} • {t.description} • {t.category} • {t.accountId}</span><strong>{formatMoney(t.amount)}</strong></div>)}</div>
    </section>
  );
}
