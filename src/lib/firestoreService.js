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
