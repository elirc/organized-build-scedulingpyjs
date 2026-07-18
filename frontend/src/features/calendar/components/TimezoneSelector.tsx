import { commonTimezones } from "../../../lib/timezones";

export function TimezoneSelector({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      Timezone
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {commonTimezones.map((timezone) => (
          <option key={timezone} value={timezone}>
            {timezone}
          </option>
        ))}
      </select>
    </label>
  );
}

