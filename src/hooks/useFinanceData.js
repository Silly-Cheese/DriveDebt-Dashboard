import { useEffect, useState } from 'react';
import { subscribeToCollection, subscribeToDoc } from '../lib/firestoreService';

function safeText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value?.toDate) return value.toDate().toLocaleDateString();
  if (typeof value === 'object') {
    if (typeof value.name === 'string') return value.name;
    if (typeof value.label === 'string') return value.label;
    if (typeof value.id === 'string') return value.id;
    return fallback || 'Unknown';
  }
  return fallback;
}

function safeDate(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return safeText(value, fallback);
}

function sanitizeRecord(record) {
  const safe = { ...record };
  ['name', 'description', 'category', 'source', 'status', 'frequency', 'action', 'accountId', 'goalId', 'billId', 'transferId', 'notes', 'lenderName'].forEach((key) => {
    if (key in safe) safe[key] = safeText(safe[key]);
  });
  ['date', 'payDate', 'dueDate', 'paymentDate', 'paidAt', 'deadline', 'targetPayoffDate', 'at'].forEach((key) => {
    if (key in safe) safe[key] = safeDate(safe[key]);
  });
  return safe;
}

function sanitizeRows(rows) {
  return rows.map(sanitizeRecord);
}

export function useFinanceData(uid) {
  const [data, setData] = useState({
    accounts: [],
    paychecks: [],
    transactions: [],
    bills: [],
    budgetRules: [],
    goals: [],
    carPayments: [],
    activity: [],
    carLoan: null,
    loading: true,
  });

  useEffect(() => {
    if (!uid) return undefined;

    const unsubscribers = [
      subscribeToCollection(uid, 'accounts', (accounts) => setData((d) => ({ ...d, accounts: sanitizeRows(accounts) })), 'createdAt'),
      subscribeToCollection(uid, 'paychecks', (paychecks) => setData((d) => ({ ...d, paychecks: sanitizeRows(paychecks) })), 'payDate'),
      subscribeToCollection(uid, 'transactions', (transactions) => setData((d) => ({ ...d, transactions: sanitizeRows(transactions) })), 'date'),
      subscribeToCollection(uid, 'bills', (bills) => setData((d) => ({ ...d, bills: sanitizeRows(bills) })), 'dueDate'),
      subscribeToCollection(uid, 'budgetRules', (budgetRules) => setData((d) => ({ ...d, budgetRules: sanitizeRows(budgetRules) })), 'priority'),
      subscribeToCollection(uid, 'goals', (goals) => setData((d) => ({ ...d, goals: sanitizeRows(goals) })), 'priority'),
      subscribeToCollection(uid, 'carPayments', (carPayments) => setData((d) => ({ ...d, carPayments: sanitizeRows(carPayments) })), 'paymentDate'),
      subscribeToCollection(uid, 'activity', (activity) => setData((d) => ({ ...d, activity: sanitizeRows(activity) })), 'at'),
      subscribeToDoc(uid, 'carLoan', 'main', (carLoan) => setData((d) => ({ ...d, carLoan: carLoan ? sanitizeRecord(carLoan) : null, loading: false }))),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [uid]);

  return data;
}
