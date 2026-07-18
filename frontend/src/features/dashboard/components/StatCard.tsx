export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <section className="card">
      <strong>{label}</strong>
      <div className="metric">{value}</div>
    </section>
  );
}

