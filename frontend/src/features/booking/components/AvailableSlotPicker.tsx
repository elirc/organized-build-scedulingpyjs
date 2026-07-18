export function AvailableSlotPicker({
  slots,
  value,
  onChange
}: {
  slots: Array<{ startTimeLocal: string; startTimeUtc: string; timezone: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="card-grid">
      {slots.map((slot) => (
        <button
          key={slot.startTimeUtc}
          type="button"
          className={value === slot.startTimeLocal ? "card selected-card" : "card"}
          onClick={() => onChange(slot.startTimeLocal.replace(" ", "T"))}
        >
          <div>{slot.startTimeLocal}</div>
          <small>{slot.timezone}</small>
        </button>
      ))}
    </div>
  );
}

