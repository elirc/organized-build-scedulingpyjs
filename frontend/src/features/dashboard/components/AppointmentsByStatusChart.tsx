export function AppointmentsByStatusChart({
  items
}: {
  items: Array<{ status: string; _count: number }>;
}) {
  return (
    <div className="card-grid">
      {items.map((item) => (
        <div key={item.status} className="card">
          <strong>{item.status}</strong>
          <div>{item._count}</div>
        </div>
      ))}
    </div>
  );
}

