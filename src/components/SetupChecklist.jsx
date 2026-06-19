export default function SetupChecklist({ data, goToPage }) {
  const checking = data.accounts.find((account) => account.id === 'checking');
  const savings = data.accounts.find((account) => account.id === 'savings');
  const items = [
    { label: 'Set checking balance', done: Number(checking?.balance || 0) !== 0, page: 'money' },
    { label: 'Set savings balance', done: Number(savings?.balance || 0) !== 0, page: 'money' },
    { label: 'Add your car loan', done: Number(data.carLoan?.currentBalance || 0) > 0, page: 'car' },
    { label: 'Add upcoming bills', done: data.bills.length > 0, page: 'bills' },
    { label: 'Add a paycheck', done: data.paychecks.length > 0, page: 'money' },
    { label: 'Create a budget envelope', done: data.budgetRules.some((rule) => rule.kind === 'envelope'), page: 'money' },
  ];
  const remaining = items.filter((item) => !item.done);
  if (remaining.length === 0) return null;

  return (
    <div className="panel setup-panel">
      <div className="panel-title-row"><div><h3>Setup Checklist</h3><p className="muted">Finish these steps to make DriveDebt accurate.</p></div><span className="status-pill warning">{remaining.length} left</span></div>
      <div className="checklist">
        {items.map((item) => (
          <button key={item.label} className={item.done ? 'check-row done' : 'check-row'} onClick={() => goToPage(item.page)}>
            <span>{item.done ? '✓' : '○'}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
