import { Car, Home, Landmark, Lock, LogOut, PiggyBank, ReceiptText, Settings } from 'lucide-react';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'money', label: 'Money', icon: Landmark },
  { id: 'bills', label: 'Bills', icon: ReceiptText },
  { id: 'car', label: 'Car', icon: Car },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ user, activePage, setActivePage, logout, lockDashboard, openQuickAdd, children }) {
  const userLabel = user?.email || user?.displayName || user?.uid || 'Signed in';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><PiggyBank size={24} /></div>
          <div>
            <h1>DriveDebt</h1>
            <p>Paycheck-based command center</p>
          </div>
        </div>

        <button className="primary-button wide sidebar-add" onClick={openQuickAdd}>+ Quick Add</button>

        <nav className="nav-list clean-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activePage === item.id ? 'nav-item active' : 'nav-item'}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>{String(userLabel)}</p>
          <button className="ghost-button" onClick={lockDashboard}><Lock size={16} /> Lock</button>
          <button className="ghost-button" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
