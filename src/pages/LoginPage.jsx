import { ShieldCheck } from 'lucide-react';

export default function LoginPage({ login, loginWithRedirect, error }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-mark large"><ShieldCheck size={34} /></div>
        <h1>DriveDebt Dashboard</h1>
        <p>Owner-only finance command center for fluctuating income, car payoff, bills, and savings goals.</p>
        {error && <div className="error-box">{error}</div>}
        <button className="primary-button wide" onClick={login}>Sign in with Google</button>
        <button className="secondary-button wide" onClick={loginWithRedirect}>Use alternate sign in</button>
        <p className="muted small-note">If the first button does not open, use the alternate button.</p>
      </div>
    </div>
  );
}
