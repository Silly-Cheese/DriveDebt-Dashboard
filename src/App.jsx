import { useState } from 'react';
import Layout from './components/Layout';
import LockScreen from './components/LockScreen';
import QuickAddModal from './components/QuickAddModal';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MoneyPage from './pages/MoneyPage';
import BillsPage from './pages/BillsPage';
import CarPayoffPage from './pages/CarPayoffPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';
import { useFinanceData } from './hooks/useFinanceData';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [locked, setLocked] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { user, loading, error, login, loginWithRedirect, reverifyOwner, logout } = useAuth();
  const data = useFinanceData(user?.uid);

  if (loading) return <div className="loading-screen">Loading DriveDebt...</div>;
  if (!user) return <LoginPage login={login} loginWithRedirect={loginWithRedirect} error={error} />;
  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;
  if (data.loading) return <div className="loading-screen">Preparing your finance command center...</div>;

  const props = { uid: user.uid, data };
  const pages = {
    dashboard: <DashboardPage data={data} goToPage={setActivePage} openQuickAdd={() => setQuickAddOpen(true)} />,
    money: <MoneyPage {...props} />,
    bills: <BillsPage {...props} />,
    car: <CarPayoffPage {...props} />,
    settings: <SettingsPage {...props} user={user} reverifyOwner={reverifyOwner} />,
  };

  return (
    <>
      <Layout
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        logout={logout}
        lockDashboard={() => setLocked(true)}
        openQuickAdd={() => setQuickAddOpen(true)}
      >
        {pages[activePage] || pages.dashboard}
      </Layout>
      <QuickAddModal uid={user.uid} data={data} open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
