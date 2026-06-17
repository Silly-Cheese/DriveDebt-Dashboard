import { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { ensureUserDatabase } from '../lib/firestoreBootstrap';

const ALLOWED_EMAIL = 'christophershelley257@gmail.com';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setError('');
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (firebaseUser.email !== ALLOWED_EMAIL) {
        await signOut(auth);
        setUser(null);
        setError('This dashboard is locked to the owner account only.');
        setLoading(false);
        return;
      }

      try {
        await ensureUserDatabase(firebaseUser);
        setUser(firebaseUser);
      } catch (err) {
        setError(err.message || 'Unable to initialize Firestore.');
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function login() {
    setError('');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, loading, error, login, logout };
}
