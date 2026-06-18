export function downloadTextFile(filename, content, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportJson(data) {
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(`drivedebt-backup-${timestamp}.json`, JSON.stringify(data, null, 2));
}

export function exportTransactionsCsv(transactions) {
  const header = ['date', 'type', 'accountId', 'category', 'description', 'amount'];
  const rows = transactions.map((transaction) => header.map((key) => `"${String(transaction[key] ?? '').replaceAll('"', '""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(`drivedebt-transactions-${timestamp}.csv`, csv, 'text/csv');
}
