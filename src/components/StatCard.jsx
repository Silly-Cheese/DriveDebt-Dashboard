function safeText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value?.toDate) return value.toDate().toLocaleDateString();
  if (typeof value === 'object') return value.email || value.displayName || value.name || value.label || value.id || value.uid || fallback || 'Unknown';
  return fallback;
}

export default function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className={`stat-card ${safeText(tone, 'default')}`}>
      <p>{safeText(label)}</p>
      <strong>{safeText(value)}</strong>
      {hint && <span>{safeText(hint)}</span>}
    </div>
  );
}
