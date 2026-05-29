export function Meta({ values }: { values: string[] }) {
  return (
    <div className="meta">
      {values.filter(Boolean).slice(0, 5).map((value) => (
        <span key={value}>{value}</span>
      ))}
    </div>
  );
}
