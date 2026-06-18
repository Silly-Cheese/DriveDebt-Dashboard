import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const APP_VERSION = '0.2.0';

const defaultUserProfile = (user) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || 'Owner',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  appVersion: APP_VERSION,
});

const defaultSettings = {
  currency: 'USD',
  budgetingMode: 'paycheck-based',
  incomeMode: 'variable',
  safeToSpendMethod: 'checking-minus-upcoming-obligations',
  carPayoffStrategy: 'extra-after-required-bills',
  emergencyFundTarget: 1000,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

const starterAccounts = [
  {
    id: 'checking',
    name: 'Checking',
    type: 'checking',
    balance: 0,
    startingBalance: 0,
    institution: '',
    includeInSafeToSpend: true,
    isPrimarySpendingAccount: true,
    sortOrder: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: 'savings',
    name: 'Savings',
    type: 'savings',
    balance: 0,
    startingBalance: 0,
    institution: '',
    includeInSafeToSpend: false,
    isPrimarySpendingAccount: false,
    sortOrder: 2,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const starterBudgetRules = [
  { id: 'required-bills', name: 'Required Bills', priority: 1, type: 'required', percentOfPaycheck: null },
  { id: 'emergency-fund', name: 'Emergency Fund', priority: 2, type: 'protection', percentOfPaycheck: 10 },
  { id: 'car-payoff', name: 'Car Payoff Attack', priority: 3, type: 'debt', percentOfPaycheck: 25 },
  { id: 'goals', name: 'Savings Goals', priority: 4, type: 'goals', percentOfPaycheck: 10 },
  { id: 'spending-money', name: 'Spending Money', priority: 5, type: 'spending', percentOfPaycheck: null },
];

const starterGoals = [
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    targetAmount: 1000,
    currentAmount: 0,
    priority: 1,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    id: 'car-maintenance',
    name: 'Car Maintenance Fund',
    targetAmount: 500,
    currentAmount: 0,
    priority: 2,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
];

const starterCarLoan = {
  originalBalance: 0,
  currentBalance: 0,
  interestRate: 0,
  minimumPayment: 0,
  dueDay: null,
  lenderName: '',
  targetPayoffDate: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

const collectionMarker = (name) => ({
  collection: name,
  purpose: 'Keeps this Firestore collection visible and documents app schema expectations.',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

async function ensureCoreAccounts(user, batch) {
  starterAccounts.forEach((account) => {
    batch.set(doc(db, 'users', user.uid, 'accounts', account.id), account, { merge: true });
  });
}

export async function ensureUserDatabase(user) {
  if (!user?.uid) throw new Error('Cannot initialize database without an authenticated user.');

  const userRef = doc(db, 'users', user.uid);
  const profileRef = doc(db, 'users', user.uid, 'profile', 'main');
  const settingsRef = doc(db, 'users', user.uid, 'settings', 'main');
  const carLoanRef = doc(db, 'users', user.uid, 'carLoan', 'main');
  const bootstrapRef = doc(db, 'users', user.uid, '_system', 'bootstrap');

  const batch = writeBatch(db);
  await ensureCoreAccounts(user, batch);

  const bootstrapSnap = await getDoc(bootstrapRef);
  if (bootstrapSnap.exists()) {
    batch.set(bootstrapRef, { lastCheckedAt: serverTimestamp(), appVersion: APP_VERSION }, { merge: true });
    await batch.commit();
    return { created: false };
  }

  batch.set(userRef, {
    uid: user.uid,
    email: user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  batch.set(profileRef, defaultUserProfile(user), { merge: true });
  batch.set(settingsRef, defaultSettings, { merge: true });
  batch.set(carLoanRef, starterCarLoan, { merge: true });

  starterBudgetRules.forEach((rule) => {
    batch.set(doc(db, 'users', user.uid, 'budgetRules', rule.id), {
      ...rule,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });

  starterGoals.forEach((goal) => {
    batch.set(doc(db, 'users', user.uid, 'goals', goal.id), goal, { merge: true });
  });

  ['paychecks', 'transactions', 'bills', 'carPayments', 'paycheckPlans', 'reports'].forEach((collectionName) => {
    batch.set(
      doc(db, 'users', user.uid, collectionName, '_collection'),
      collectionMarker(collectionName),
      { merge: true },
    );
  });

  batch.set(bootstrapRef, {
    initialized: true,
    initializedAt: serverTimestamp(),
    lastCheckedAt: serverTimestamp(),
    appVersion: APP_VERSION,
    collections: [
      'profile',
      'settings',
      'accounts',
      'paychecks',
      'transactions',
      'bills',
      'budgetRules',
      'goals',
      'carLoan',
      'carPayments',
      'paycheckPlans',
      'reports',
    ],
  }, { merge: true });

  await batch.commit();
  return { created: true };
}
