export function ServiceSelect({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string; durationMinutes: number }>;
}) {
  return (
    <label>
      Service
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select service</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name} ({option.durationMinutes} min)
          </option>
        ))}
      </select>
    </label>
  );
}

