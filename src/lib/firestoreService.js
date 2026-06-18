import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

export function userCollection(uid, name) {
  return collection(db, 'users', uid, name);
}

export function userDoc(uid, collectionName, docId) {
  return doc(db, 'users', uid, collectionName, docId);
}

export function subscribeToCollection(uid, collectionName, callback, sortField = 'createdAt') {
  const q = query(userCollection(uid, collectionName), orderBy(sortField, 'desc'));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter((item) => item.id !== '_collection');
    callback(rows);
  });
}

export function subscribeToDoc(uid, collectionName, docId, callback) {
  return onSnapshot(userDoc(uid, collectionName, docId), (snapshot) => {
    callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
}

export async function createRecord(uid, collectionName, data) {
  return addDoc(userCollection(uid, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function saveKnownRecord(uid, collectionName, id, data) {
  return setDoc(userDoc(uid, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateRecord(uid, collectionName, id, data) {
  return updateDoc(userDoc(uid, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRecord(uid, collectionName, id) {
  return deleteDoc(userDoc(uid, collectionName, id));
}

export async function writeTransactionAndAccount(uid, transaction, account, newBalance) {
  const batch = writeBatch(db);
  const transactionRef = doc(userCollection(uid, 'transactions'));
  batch.set(transactionRef, {
    ...transaction,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(userDoc(uid, 'accounts', account.id), {
    balance: newBalance,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  await batch.commit();
  return transactionRef;
}

export async function transferBetweenAccounts(uid, fromAccount, toAccount, amount, description = 'Transfer') {
  const batch = writeBatch(db);
  const transferId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  const now = serverTimestamp();
  const fromBalance = Number(fromAccount.balance || 0) - Number(amount || 0);
  const toBalance = Number(toAccount.balance || 0) + Number(amount || 0);

  batch.set(userDoc(uid, 'accounts', fromAccount.id), { balance: fromBalance, updatedAt: now }, { merge: true });
  batch.set(userDoc(uid, 'accounts', toAccount.id), { balance: toBalance, updatedAt: now }, { merge: true });
  batch.set(doc(userCollection(uid, 'transactions')), {
    date: new Date().toISOString().slice(0, 10),
    type: 'transfer-out',
    category: 'Transfer',
    description,
    amount: Number(amount || 0),
    accountId: fromAccount.id,
    transferId,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(doc(userCollection(uid, 'transactions')), {
    date: new Date().toISOString().slice(0, 10),
    type: 'transfer-in',
    category: 'Transfer',
    description,
    amount: Number(amount || 0),
    accountId: toAccount.id,
    transferId,
    createdAt: now,
    updatedAt: now,
  });

  await batch.commit();
}
