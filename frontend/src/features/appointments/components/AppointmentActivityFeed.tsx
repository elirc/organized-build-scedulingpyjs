export function AppointmentActivityFeed({
  items
}: {
  items: Array<{ id: string; action: string; createdAt: string; oldValue?: string | null; newValue?: string | null }>;
}) {
  return (
    <div className="stack">
      {items.map((item) => (
        <div key={item.id} className="card">
          <strong>{item.action}</strong>
          <div>{item.createdAt}</div>
          {item.oldValue ? <div>From: {item.oldValue}</div> : null}
          {item.newValue ? <div>To: {item.newValue}</div> : null}
        </div>
      ))}
    </div>
  );
}

