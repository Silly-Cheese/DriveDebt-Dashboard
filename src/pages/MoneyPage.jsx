import { useState } from 'react';
import AccountsPage from './AccountsPage';
import PaychecksPage from './PaychecksPage';
import BudgetPage from './BudgetPage';
import GoalsPage from './GoalsPage';
import TransactionsPage from './TransactionsPage';
import ReportsPage from './ReportsPage';

const tabs = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'paychecks', label: 'Paychecks' },
  { id: 'budget', label: 'Budget' },
  { id: 'goals', label: 'Goals' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'reports', label: 'Reports' },
];

export default function MoneyPage({ uid, data }) {
  const [tab, setTab] = useState('accounts');
  const props = { uid, data };
  const pages = {
    accounts: <AccountsPage {...props} compact />,
    paychecks: <PaychecksPage {...props} compact />,
    budget: <BudgetPage {...props} compact />,
    goals: <GoalsPage {...props} compact />,
    ledger: <TransactionsPage {...props} compact />,
    reports: <ReportsPage data={data} compact />,
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <div><p className="eyebrow">Money</p><h2>Money Center</h2></div>
      </header>
      <div className="tab-bar">
        {tabs.map((item) => <button key={item.id} className={tab === item.id ? 'tab-button active' : 'tab-button'} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </div>
      {pages[tab]}
    </section>
  );
}
