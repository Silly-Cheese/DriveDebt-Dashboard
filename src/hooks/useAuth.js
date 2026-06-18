import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import { ensureUserDatabase } from '../lib/firestoreBootstrap';

const ALLOWED_EMAIL = 'christophershelley257@gmail.com';

function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code === 'auth/popup-blocked') return 'The browser blocked the Google sign-in popup. Use the redirect sign-in button instead.';
  if (code === 'auth/popup-closed-by-user') return 'The Google sign-in window was closed before finishing.';
  if (code === 'auth/unauthorized-domain') return 'This domain is not authorized in Firebase Authentication. Add this site domain in Firebase Console → Authentication → Settings → Authorized domains.';
  if (code === 'auth/operation-not-allowed') return 'Google sign-in is not enabled yet. Enable it in Firebase Console → Authentication → Sign-in method.';
  return err?.message || 'Unable to sign in.';
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRedirectResult(auth).catch((err) => setError(friendlyAuthError(err)));

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (firebaseUser.email !== ALLOWED_EMAIL) {
        await signOut(auth);
        setUser(null);
        setError('This dashboard is locked to the owner account only. Sign in with christophershelley257@gmail.com.');
        setLoading(false);
        return;
      }

      try {
        await ensureUserDatabase(firebaseUser);
        setUser(firebaseUser);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to initialize Firestore.');
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function loginWithPopup() {
    setError('');
    setLoading(false);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  }

  async function loginWithRedirect() {
    setError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithRedirect(auth, provider);
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, loading, error, login: loginWithPopup, loginWithRedirect, logout };
}
