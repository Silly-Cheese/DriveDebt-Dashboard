import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { getLocalPin } from '../lib/localSecurity';

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    if (pin === getLocalPin()) {
      onUnlock();
      setPin('');
      setError('');
      return;
    }
    setError('Incorrect lock PIN.');
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark large"><LockKeyhole size={34} /></div>
        <h1>Dashboard Locked</h1>
        <p>Enter your local dashboard PIN to continue.</p>
        {error && <div className="error-box">{error}</div>}
        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" autoFocus />
        <button className="primary-button wide">Unlock</button>
      </form>
    </div>
  );
}
