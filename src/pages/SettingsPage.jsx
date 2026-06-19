import { useState } from 'react';
import { saveKnownRecord } from '../lib/firestoreService';
import { exportJson, exportTransactionsCsv } from '../lib/exportData';
import { getLocalPin, isValidPin, setLocalPin } from '../lib/localSecurity';
import { toNumber } from '../lib/money';

export default function SettingsPage({ uid, data, user, reverifyOwner }) {
  const [emergencyFundTarget, setEmergencyFundTarget] = useState('1000');
  const [defaultCarPercent, setDefaultCarPercent] = useState('25');
  const [defaultGoalPercent, setDefaultGoalPercent] = useState('10');
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinStatus, setPinStatus] = useState('');
  const [saved, setSaved] = useState(false);

  async function saveSettings(event) {
    event.preventDefault();
    await saveKnownRecord(uid, 'settings', 'main', {
      emergencyFundTarget: toNumber(emergencyFundTarget),
      defaultCarPercent: toNumber(defaultCarPercent),
      defaultGoalPercent: toNumber(defaultGoalPercent),
      sessionTimeoutMinutes: toNumber(sessionTimeoutMinutes),
      userEmail: user?.email || '',
      userUid: uid,
      currency: 'USD',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function changePin(event) {
    event.preventDefault();
    setPinStatus('');
    if (currentPin !== getLocalPin()) {
      setPinStatus('Current PIN is incorrect.');
      return;
    }
    if (!isValidPin(newPin)) {
      setPinStatus('New PIN must be 4 to 8 digits.');
      return;
    }
    try {
      await reverifyOwner();
      setLocalPin(newPin);
      setCurrentPin('');
      setNewPin('');
      setPinStatus('PIN changed after Google verification.');
    } catch (err) {
      setPinStatus(err.message || 'Google verification failed.');
    }
  }

  async function copyUid() {
    await navigator.clipboard.writeText(uid);
  }

  return (
    <section className="page-stack">
      <header className="page-header"><div><p className="eyebrow">Settings</p><h2>Dashboard Settings</h2></div></header>
      <form className="panel" onSubmit={saveSettings}>
        <h3>Planning Defaults</h3>
        <div className="form-grid">
          <label><span>Emergency Fund Target</span><input type="number" step="0.01" value={emergencyFundTarget} onChange={(e) => setEmergencyFundTarget(e.target.value)} /></label>
          <label><span>Default Car Payoff %</span><input type="number" step="1" value={defaultCarPercent} onChange={(e) => setDefaultCarPercent(e.target.value)} /></label>
          <label><span>Default Goal Funding %</span><input type="number" step="1" value={defaultGoalPercent} onChange={(e) => setDefaultGoalPercent(e.target.value)} /></label>
          <label><span>Session Timeout Minutes</span><input type="number" step="1" value={sessionTimeoutMinutes} onChange={(e) => setSessionTimeoutMinutes(e.target.value)} /></label>
        </div>
        <button className="primary-button">Save Settings</button>
        {saved && <p className="success-note">Settings saved.</p>}
      </form>

      <form className="panel" onSubmit={changePin}>
        <h3>Change Lock PIN</h3>
        <p className="muted">Changing the local lock PIN requires your current PIN and a fresh Google verification popup for the signed-in account.</p>
        <div className="form-grid">
          <label><span>Current PIN</span><input type="password" value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} /></label>
          <label><span>New PIN</span><input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="4 to 8 digits" /></label>
        </div>
        <button className="primary-button">Verify with Google & Change PIN</button>
        {pinStatus && <p className="success-note">{pinStatus}</p>}
      </form>

      <div className="panel">
        <h3>Security</h3>
        <p className="muted">Each signed-in Google account has a private DriveDebt workspace. Firestore rules should allow each user to access only their own /users/{{uid}} data.</p>
        <div className="security-list">
          <span>Signed-in Email: {user?.email || 'Unknown'}</span>
          <span>Your Firebase UID: <code>{uid}</code></span>
          <span>Authentication: Google Firebase Auth</span>
          <span>Database: Per-user Firestore workspace</span>
        </div>
        <button className="secondary-button" onClick={copyUid}>Copy Firebase UID</button>
      </div>
      <div className="panel button-row">
        <button className="secondary-button" onClick={() => exportJson(data)}>Download Full JSON Backup</button>
        <button className="secondary-button" onClick={() => exportTransactionsCsv(data.transactions)}>Download Transaction CSV</button>
      </div>
    </section>
  );
}
