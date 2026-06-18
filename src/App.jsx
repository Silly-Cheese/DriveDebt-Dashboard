import { useState } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PaychecksPage from './pages/PaychecksPage';
import BillsPage from './pages/BillsPage';
import CarPayoffPage from './pages/CarPayoffPage';
import GoalsPage from './pages/GoalsPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import { useAuth } from './hooks/useAuth';
import { useFinanceData } from './hooks/useFinanceData';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const { user, loading, error, login, loginWithRedirect, logout } = useAuth();
  const data = useFinanceData(user?.uid);

  if (loading) return <div className="loading-screen">Loading DriveDebt...</div>;
  if (!user) return <LoginPage login={login} loginWithRedirect={loginWithRedirect} error={error} />;
  if (data.loading) return <div className="loading-screen">Preparing your finance command center...</div>;

  const props = { uid: user.uid, data };
  const pages = {
    dashboard: <DashboardPage data={data} />,
    paychecks: <PaychecksPage {...props} />,
    bills: <BillsPage {...props} />,
    car: <CarPayoffPage {...props} />,
    goals: <GoalsPage {...props} />,
    transactions: <TransactionsPage {...props} />,
    reports: <ReportsPage data={data} />,
  };

  return (
    <Layout user={user} activePage={activePage} setActivePage={setActivePage} logout={logout}>
      {pages[activePage] || pages.dashboard}
    </Layout>
  );
}
