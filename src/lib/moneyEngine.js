import { createRecord, saveKnownRecord, transferBetweenAccounts, writeTransactionAndAccount } from './firestoreService';
import { logActivity } from './activityLog';
import { toNumber } from './money';

function accountById(accounts, id) {
  return accounts.find((account) => account.id === id);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function addIncome(uid, data, payload) {
  const account = accountById(data.accounts, payload.accountId || 'checking');
  if (!account) throw new Error('Deposit account not found.');
  const amount = toNumber(payload.amount);
  await writeTransactionAndAccount(uid, {
    date: payload.date || today(),
    type: 'income',
    category: payload.category || 'Income',
    description: payload.description || 'Income',
    amount,
    accountId: account.id,
  }, account, toNumber(account.balance) + amount);
  await logActivity(uid, 'income_added', { amount, accountId: account.id });
}

export async function addExpense(uid, data, payload) {
  const account = accountById(data.accounts, payload.accountId || 'checking');
  if (!account) throw new Error('Expense account not found.');
  const amount = toNumber(payload.amount);
  await writeTransactionAndAccount(uid, {
    date: payload.date || today(),
    type: payload.type || 'expense',
    category: payload.category || 'Other',
    description: payload.description || 'Expense',
    amount,
    accountId: account.id,
  }, account, toNumber(account.balance) - amount);
  await logActivity(uid, 'expense_added', { amount, accountId: account.id, category: payload.category });
}

export async function moveMoney(uid, data, payload) {
  const from = accountById(data.accounts, payload.fromAccountId);
  const to = accountById(data.accounts, payload.toAccountId);
  if (!from || !to) throw new Error('Transfer accounts were not found.');
  const amount = toNumber(payload.amount);
  await transferBetweenAccounts(uid, from, to, amount, payload.description || 'Transfer');
  await logActivity(uid, 'transfer_created', { amount, fromAccountId: from.id, toAccountId: to.id });
}

export async function payBill(uid, data, bill, accountId = 'checking') {
  const account = accountById(data.accounts, accountId);
  if (!account) throw new Error('Payment account not found.');
  const amount = toNumber(bill.amount);
  await writeTransactionAndAccount(uid, {
    date: today(),
    type: 'expense',
    category: bill.category || 'Bill',
    description: `Paid bill: ${bill.name}`,
    amount,
    accountId,
    billId: bill.id,
  }, account, toNumber(account.balance) - amount);
  await saveKnownRecord(uid, 'bills', bill.id, { status: 'paid', paidAt: today(), paidFromAccountId: accountId });
  await logActivity(uid, 'bill_paid', { billId: bill.id, amount, accountId });
}

export async function fundGoal(uid, data, goal, payload) {
  const account = accountById(data.accounts, payload.accountId || 'checking');
  if (!account) throw new Error('Funding account not found.');
  const amount = toNumber(payload.amount);
  await writeTransactionAndAccount(uid, {
    date: payload.date || today(),
    type: 'goal-contribution',
    category: 'Savings',
    description: `Goal contribution: ${goal.name}`,
    amount,
    accountId: account.id,
    goalId: goal.id,
  }, account, toNumber(account.balance) - amount);
  await saveKnownRecord(uid, 'goals', goal.id, { currentAmount: toNumber(goal.currentAmount) + amount });
  await logActivity(uid, 'goal_funded', { goalId: goal.id, amount, accountId: account.id });
}

export async function payCar(uid, data, payload) {
  const account = accountById(data.accounts, payload.accountId || 'checking');
  if (!account) throw new Error('Payment account not found.');
  const amount = toNumber(payload.amount);
  const newCarBalance = Math.max(0, toNumber(data.carLoan?.currentBalance) - amount);
  await writeTransactionAndAccount(uid, {
    date: payload.date || today(),
    type: 'car-payment',
    category: 'Car Payment',
    description: payload.description || 'Car payment',
    amount,
    accountId: account.id,
  }, account, toNumber(account.balance) - amount);
  await createRecord(uid, 'carPayments', {
    paymentDate: payload.date || today(),
    amount,
    extraAmount: toNumber(payload.extraAmount),
    notes: payload.description || '',
    balanceAfterPayment: newCarBalance,
  });
  await saveKnownRecord(uid, 'carLoan', 'main', { currentBalance: newCarBalance });
  await logActivity(uid, 'car_payment_added', { amount, accountId: account.id });
}
