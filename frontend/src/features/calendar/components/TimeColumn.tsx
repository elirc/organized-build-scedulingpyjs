export function TimeColumn() {
  const hours = Array.from({ length: 12 }, (_, index) => `${index + 8}:00`);
  return (
    <div className="stack">
      {hours.map((hour) => (
        <div key={hour} className="calendar-cell">{hour}</div>
      ))}
    </div>
  );
}

