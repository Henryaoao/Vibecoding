export function StatePanel({ text, tone }: { text: string; tone?: 'error' }) {
  return <div className={`empty ${tone === 'error' ? 'error' : ''}`}>{text}</div>;
}
