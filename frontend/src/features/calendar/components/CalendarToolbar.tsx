export function CalendarToolbar({
  date,
  onDateChange
}: {
  date: string;
  onDateChange: (date: string) => void;
}) {
  return (
    <div className="filter-bar">
      <label>
        Start date
        <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
      </label>
    </div>
  );
}

