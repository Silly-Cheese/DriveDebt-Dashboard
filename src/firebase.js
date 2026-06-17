import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyByngJfJb51d079pE-OE8QNbm7XQgm35UQ',
  authDomain: 'drivedebt-dashboard.firebaseapp.com',
  projectId: 'drivedebt-dashboard',
  storageBucket: 'drivedebt-dashboard.firebasestorage.app',
  messagingSenderId: '160314875193',
  appId: '1:160314875193:web:e404f2171636981ebcdce8',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
