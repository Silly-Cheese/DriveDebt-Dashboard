import { percent } from '../lib/money';

export default function ProgressBar({ value }) {
  const safeValue = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div className="progress-wrap">
      <div className="progress-label"><span>Progress</span><span>{percent(safeValue)}</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${safeValue}%` }} /></div>
    </div>
  );
}
