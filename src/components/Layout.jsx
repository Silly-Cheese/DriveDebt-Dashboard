import { Car, CreditCard, Gauge, Home, Landmark, LogOut, PiggyBank, ReceiptText, Target, WalletCards } from 'lucide-react';

const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'accounts', label: 'Accounts', icon: Landmark },
  { id: 'paychecks', label: 'Paychecks', icon: WalletCards },
  { id: 'bills', label: 'Bills', icon: ReceiptText },
  { id: 'car', label: 'Car Payoff', icon: Car },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'transactions', label: 'Ledger', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: Gauge },
];

export default function Layout({ user, activePage, setActivePage, logout, children }) {
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

        <nav className="nav-list">
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
          <p>{user.email}</p>
          <button className="ghost-button" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
