export function StaffUtilizationChart({
  items
}: {
  items: Array<{ staffId: string; displayName: string; appointmentCount: number }>;
}) {
  return (
    <div className="stack">
      {items.map((item) => (
        <div key={item.staffId} className="card">
          <strong>{item.displayName}</strong>
          <div>{item.appointmentCount} appointments</div>
        </div>
      ))}
    </div>
  );
}

