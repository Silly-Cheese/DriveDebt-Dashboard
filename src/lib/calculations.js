import { differenceInCalendarDays, parseISO, isValid } from 'date-fns';

function asDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  const parsed = parseISO(String(value));
  return isValid(parsed) ? parsed : null;
}

export function sumBy(items, selector) {
  return items.reduce((total, item) => total + Number(selector(item) || 0), 0);
}

export function getAccountCash(accounts) {
  return sumBy(accounts.filter((a) => a.includeInSafeToSpend !== false), (a) => a.balance);
}

export function getUpcomingBills(bills, days = 31) {
  const now = new Date();
  return bills
    .filter((bill) => bill.status !== 'paid')
    .map((bill) => ({ ...bill, dueDateObj: asDate(bill.dueDate) }))
    .filter((bill) => bill.dueDateObj && differenceInCalendarDays(bill.dueDateObj, now) <= days)
    .filter((bill) => differenceInCalendarDays(bill.dueDateObj, now) >= 0)
    .sort((a, b) => a.dueDateObj - b.dueDateObj);
}

export function getNextPaycheck(paychecks) {
  const now = new Date();
  return paychecks
    .map((p) => ({ ...p, payDateObj: asDate(p.payDate) }))
    .filter((p) => p.payDateObj && p.status === 'expected' && p.payDateObj >= now)
    .sort((a, b) => a.payDateObj - b.payDateObj)[0] || null;
}

export function getIncomeStats(paychecks) {
  const now = new Date();
  const received = paychecks
    .map((p) => ({ ...p, payDateObj: asDate(p.payDate), netAmount: Number(p.netAmount || 0) }))
    .filter((p) => p.status !== 'expected' && p.payDateObj);

  const inLast = (days) => received.filter((p) => differenceInCalendarDays(now, p.payDateObj) <= days);
  const last30 = inLast(30);
  const last90 = inLast(90);
  const amounts = received.map((p) => p.netAmount).filter((n) => n > 0);
  const average = amounts.length ? sumBy(received, (p) => p.netAmount) / amounts.length : 0;
  const lowest = amounts.length ? Math.min(...amounts) : 0;
  const highest = amounts.length ? Math.max(...amounts) : 0;
  const volatility = average > 0 ? ((highest - lowest) / average) * 100 : 0;

  return {
    last30: sumBy(last30, (p) => p.netAmount),
    last90: sumBy(last90, (p) => p.netAmount),
    average,
    lowest,
    highest,
    volatility,
  };
}

export function getCarProgress(carLoan) {
  const original = Number(carLoan?.originalBalance || 0);
  const current = Number(carLoan?.currentBalance || 0);
  if (!original) return 0;
  return Math.min(100, Math.max(0, ((original - current) / original) * 100));
}

export function estimateCarPayoffMonths(carLoan, extraMonthly = 0) {
  const balance = Number(carLoan?.currentBalance || 0);
  const annualRate = Number(carLoan?.interestRate || 0) / 100;
  const monthlyRate = annualRate / 12;
  const payment = Number(carLoan?.minimumPayment || 0) + Number(extraMonthly || 0);

  if (!balance || !payment) return null;
  if (!monthlyRate) return Math.ceil(balance / payment);
  if (payment <= balance * monthlyRate) return Infinity;

  const months = -Math.log(1 - (monthlyRate * balance) / payment) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
}

export function getSafeToSpend({ accounts, bills, goals, carLoan }) {
  const cash = getAccountCash(accounts);
  const upcomingBills = getUpcomingBills(bills, 31);
  const billReserve = sumBy(upcomingBills, (b) => b.amount);
  const goalReserve = sumBy(goals.filter((g) => g.priority <= 2), (g) => g.monthlyTarget || 0);
  const carReserve = Number(carLoan?.minimumPayment || 0);
  const safe = cash - billReserve - goalReserve - carReserve;

  return {
    cash,
    upcomingBills,
    billReserve,
    goalReserve,
    carReserve,
    safeToSpend: Math.max(0, safe),
    pressure: safe < 0 ? 'danger' : safe < 50 ? 'warning' : 'stable',
  };
}

export function suggestPaycheckPlan({ paycheckAmount, bills, goals, carLoan }) {
  let remaining = Number(paycheckAmount || 0);
  const plan = [];

  const upcomingBills = getUpcomingBills(bills, 21);
  for (const bill of upcomingBills) {
    const amount = Math.min(remaining, Number(bill.amount || 0));
    if (amount > 0) {
      plan.push({ label: `Bill: ${bill.name}`, amount, priority: 1 });
      remaining -= amount;
    }
  }

  const emergency = goals.find((g) => g.id === 'emergency-fund');
  if (emergency && remaining > 0 && Number(emergency.currentAmount || 0) < Number(emergency.targetAmount || 0)) {
    const amount = Math.min(remaining, Math.max(10, paycheckAmount * 0.1));
    plan.push({ label: 'Emergency Fund', amount, priority: 2 });
    remaining -= amount;
  }

  if (carLoan && remaining > 0) {
    const amount = Math.min(remaining, Math.max(25, paycheckAmount * 0.25));
    plan.push({ label: 'Car Payoff Attack', amount, priority: 3 });
    remaining -= amount;
  }

  if (remaining > 0) {
    const goalsAmount = Math.min(remaining, paycheckAmount * 0.1);
    if (goalsAmount > 0) {
      plan.push({ label: 'Savings Goals', amount: goalsAmount, priority: 4 });
      remaining -= goalsAmount;
    }
  }

  if (remaining > 0) {
    plan.push({ label: 'Safe Spending / Buffer', amount: remaining, priority: 5 });
  }

  return plan;
}
