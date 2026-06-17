export default function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {hint && <span>{hint}</span>}
    </div>
  );
}
