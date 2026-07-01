export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function riskLevelLabel(level: number): string {
  switch (level) {
    case 0:
      return 'Safe';
    case 1:
      return 'Low risk';
    case 2:
      return 'Moderate risk';
    case 3:
      return 'High risk';
    default:
      return 'Unknown';
  }
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
