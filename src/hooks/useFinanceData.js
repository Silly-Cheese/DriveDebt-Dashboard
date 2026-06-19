import { useEffect, useState } from 'react';
import { subscribeToCollection, subscribeToDoc } from '../lib/firestoreService';

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
      subscribeToCollection(uid, 'accounts', (accounts) => setData((d) => ({ ...d, accounts })), 'createdAt'),
      subscribeToCollection(uid, 'paychecks', (paychecks) => setData((d) => ({ ...d, paychecks })), 'payDate'),
      subscribeToCollection(uid, 'transactions', (transactions) => setData((d) => ({ ...d, transactions })), 'date'),
      subscribeToCollection(uid, 'bills', (bills) => setData((d) => ({ ...d, bills })), 'dueDate'),
      subscribeToCollection(uid, 'budgetRules', (budgetRules) => setData((d) => ({ ...d, budgetRules })), 'priority'),
      subscribeToCollection(uid, 'goals', (goals) => setData((d) => ({ ...d, goals })), 'priority'),
      subscribeToCollection(uid, 'carPayments', (carPayments) => setData((d) => ({ ...d, carPayments })), 'paymentDate'),
      subscribeToCollection(uid, 'activity', (activity) => setData((d) => ({ ...d, activity })), 'at'),
      subscribeToDoc(uid, 'carLoan', 'main', (carLoan) => setData((d) => ({ ...d, carLoan, loading: false }))),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [uid]);

  return data;
}
