import { useState } from 'react';
import { X } from 'lucide-react';
import { addExpense, addIncome, fundGoal, moveMoney, payBill, payCar } from '../lib/moneyEngine';
import { transactionCategories } from '../lib/categories';
import { toNumber } from '../lib/money';

const modes = [
  { id: 'expense', label: 'Expense' },
  { id: 'income', label: 'Income' },
  { id: 'transfer', label: 'Transfer' },
  { id: 'bill', label: 'Pay Bill' },
  { id: 'car', label: 'Car Payment' },
  { id: 'goal', label: 'Goal Funding' },
];

export default function QuickAddModal({ uid, data, open, onClose }) {
  const [mode, setMode] = useState('expense');
  const [form, setForm] = useState({ accountId: 'checking', fromAccountId: 'checking', toAccountId: 'savings', category: 'Other' });
  const [error, setError] = useState('');

  if (!open) return null;

  function setValue(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'income') await addIncome(uid, data, { ...form, amount: toNumber(form.amount) });
      if (mode === 'expense') await addExpense(uid, data, { ...form, amount: toNumber(form.amount) });
      if (mode === 'transfer') await moveMoney(uid, data, { ...form, amount: toNumber(form.amount) });
      if (mode === 'bill') {
        const bill = data.bills.find((item) => item.id === form.billId);
        if (!bill) throw new Error('Choose a bill first.');
        await payBill(uid, data, bill, form.accountId || 'checking');
      }
      if (mode === 'car') await payCar(uid, data, { ...form, amount: toNumber(form.amount), date: form.date, description: form.description });
      if (mode === 'goal') {
        const goal = data.goals.find((item) => item.id === form.goalId);
        if (!goal) throw new Error('Choose a goal first.');
        await fundGoal(uid, data, goal, { ...form, amount: toNumber(form.amount) });
      }
      setForm({ accountId: 'checking', fromAccountId: 'checking', toAccountId: 'savings', category: 'Other' });
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to save.');
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-header">
          <div><p className="eyebrow">Quick Add</p><h2>Add Money Movement</h2></div>
          <button type="button" className="mini-button" onClick={onClose}><X size={16} /></button>
        </div>
        {error && <div className="error-box">{error}</div>}
        <div className="mode-grid">
          {modes.map((item) => <button type="button" key={item.id} className={mode === item.id ? 'mode-button active' : 'mode-button'} onClick={() => setMode(item.id)}>{item.label}</button>)}
        </div>

        <div className="form-grid">
          {mode !== 'bill' && mode !== 'transfer' && mode !== 'goal' && (
            <label><span>Amount</span><input type="number" step="0.01" value={form.amount || ''} onChange={(e) => setValue('amount', e.target.value)} required /></label>
          )}
          {(mode === 'expense' || mode === 'income' || mode === 'car') && (
            <label><span>Account</span><select value={form.accountId || 'checking'} onChange={(e) => setValue('accountId', e.target.value)}>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          )}
          {(mode === 'expense' || mode === 'income') && (
            <label><span>Category</span><select value={form.category || 'Other'} onChange={(e) => setValue('category', e.target.value)}>{transactionCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          )}
          {mode === 'transfer' && (
            <>
              <label><span>Amount</span><input type="number" step="0.01" value={form.amount || ''} onChange={(e) => setValue('amount', e.target.value)} required /></label>
              <label><span>From</span><select value={form.fromAccountId || 'checking'} onChange={(e) => setValue('fromAccountId', e.target.value)}>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
              <label><span>To</span><select value={form.toAccountId || 'savings'} onChange={(e) => setValue('toAccountId', e.target.value)}>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            </>
          )}
          {mode === 'bill' && (
            <>
              <label><span>Bill</span><select value={form.billId || ''} onChange={(e) => setValue('billId', e.target.value)}><option value="">Choose bill</option>{data.bills.filter((b) => b.status !== 'paid').map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
              <label><span>Pay From</span><select value={form.accountId || 'checking'} onChange={(e) => setValue('accountId', e.target.value)}>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            </>
          )}
          {mode === 'goal' && (
            <>
              <label><span>Goal</span><select value={form.goalId || ''} onChange={(e) => setValue('goalId', e.target.value)}><option value="">Choose goal</option>{data.goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
              <label><span>Amount</span><input type="number" step="0.01" value={form.amount || ''} onChange={(e) => setValue('amount', e.target.value)} required /></label>
              <label><span>From Account</span><select value={form.accountId || 'checking'} onChange={(e) => setValue('accountId', e.target.value)}>{data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            </>
          )}
          <label><span>Date</span><input type="date" value={form.date || new Date().toISOString().slice(0, 10)} onChange={(e) => setValue('date', e.target.value)} /></label>
          <label><span>Description</span><input value={form.description || ''} onChange={(e) => setValue('description', e.target.value)} placeholder="Optional note" /></label>
        </div>
        <button className="primary-button wide">Save</button>
      </form>
    </div>
  );
}
