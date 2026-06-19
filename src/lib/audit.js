export function signedTransactionAmount(transaction) {
  const amount = Number(transaction.amount || 0);
  if (transaction.type === 'income' || transaction.type === 'transfer-in') return amount;
  if (
    transaction.type === 'expense' ||
    transaction.type === 'car-payment' ||
    transaction.type === 'goal-contribution' ||
    transaction.type === 'transfer-out'
  ) return -amount;
  if (transaction.type === 'adjustment') return Number(transaction.amount || 0);
  return 0;
}

export function calculatedAccountBalance(account, transactions) {
  const related = transactions.filter((transaction) => transaction.accountId === account.id);
  const movement = related.reduce((total, transaction) => total + signedTransactionAmount(transaction), 0);
  return Number(account.startingBalance || 0) + movement;
}

export function accountBalanceWarnings(accounts, transactions) {
  return accounts.map((account) => {
    const calculated = calculatedAccountBalance(account, transactions);
    const actual = Number(account.balance || 0);
    const difference = Number((actual - calculated).toFixed(2));
    return {
      accountId: account.id,
      accountName: account.name,
      actual,
      calculated,
      difference,
      inSync: Math.abs(difference) < 0.01,
    };
  });
}

export function buildWarnings({ accounts, bills, goals, carLoan }) {
  const warnings = [];
  const today = new Date();
  const checking = accounts.find((account) => account.id === 'checking');

  if (checking && Number(checking.balance || 0) < 0) {
    warnings.push({ type: 'danger', title: 'Checking is negative', message: 'Your checking balance is below $0.' });
  }

  bills.filter((bill) => bill.status !== 'paid' && bill.dueDate).forEach((bill) => {
    const due = new Date(`${bill.dueDate}T00:00:00`);
    const days = Math.ceil((due - today) / 86400000);
    if (days < 0) warnings.push({ type: 'danger', title: `${bill.name} is overdue`, message: `Overdue by ${Math.abs(days)} day(s).` });
    else if (days <= 3) warnings.push({ type: 'warning', title: `${bill.name} is due soon`, message: `Due in ${days} day(s).` });
  });

  goals.filter((goal) => goal.status !== 'archived' && goal.deadline).forEach((goal) => {
    const due = new Date(`${goal.deadline}T00:00:00`);
    const days = Math.ceil((due - today) / 86400000);
    const remaining = Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0);
    if (days <= 14 && remaining > 0) warnings.push({ type: 'warning', title: `${goal.name} deadline approaching`, message: `${days} day(s) left and ${remaining.toFixed(2)} remaining.` });
  });

  if (carLoan?.targetPayoffDate && Number(carLoan.currentBalance || 0) > 0) {
    const target = new Date(`${carLoan.targetPayoffDate}T00:00:00`);
    const days = Math.ceil((target - today) / 86400000);
    if (days <= 60) warnings.push({ type: 'warning', title: 'Car payoff target is close', message: `${days} day(s) until your target payoff date.` });
  }

  return warnings;
}
