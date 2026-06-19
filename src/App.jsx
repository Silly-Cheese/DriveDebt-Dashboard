import { useState } from 'react';
import Layout from './components/Layout';
import LockScreen from './components/LockScreen';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import PaychecksPage from './pages/PaychecksPage';
import BudgetPage from './pages/BudgetPage';
import BillsPage from './pages/BillsPage';
import CarPayoffPage from './pages/CarPayoffPage';
import GoalsPage from './pages/GoalsPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';
import { useFinanceData } from './hooks/useFinanceData';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [locked, setLocked] = useState(false);
  const { user, loading, error, login, loginWithRedirect, reverifyOwner, logout } = useAuth();
  const data = useFinanceData(user?.uid);

  if (loading) return <div className="loading-screen">Loading DriveDebt...</div>;
  if (!user) return <LoginPage login={login} loginWithRedirect={loginWithRedirect} error={error} />;
  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;
  if (data.loading) return <div className="loading-screen">Preparing your finance command center...</div>;

  const props = { uid: user.uid, data };
  const pages = {
    dashboard: <DashboardPage data={data} goToPage={setActivePage} />,
    accounts: <AccountsPage {...props} />,
    paychecks: <PaychecksPage {...props} />,
    budget: <BudgetPage {...props} />,
    bills: <BillsPage {...props} />,
    car: <CarPayoffPage {...props} />,
    goals: <GoalsPage {...props} />,
    transactions: <TransactionsPage {...props} />,
    reports: <ReportsPage data={data} />,
    settings: <SettingsPage {...props} user={user} reverifyOwner={reverifyOwner} />,
  };

  return (
    <Layout user={user} activePage={activePage} setActivePage={setActivePage} logout={logout} lockDashboard={() => setLocked(true)}>
      {pages[activePage] || pages.dashboard}
    </Layout>
  );
}
