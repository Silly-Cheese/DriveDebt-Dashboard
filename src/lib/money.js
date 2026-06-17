export function cents(value) {
  const n = Number(value || 0);
  return Math.round(n * 100);
}

export function dollars(value) {
  return Number((Number(value || 0) / 100).toFixed(2));
}

export function formatMoney(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(number);
}

export function percent(value) {
  return `${Math.round(Number(value || 0))}%`;
}

export function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
