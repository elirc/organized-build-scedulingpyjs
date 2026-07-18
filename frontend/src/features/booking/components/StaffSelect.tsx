export function StaffSelect({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; displayName: string }>;
}) {
  return (
    <label>
      Staff
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select staff</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}

