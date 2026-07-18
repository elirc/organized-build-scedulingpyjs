export function BookingSummary({
  serviceName,
  staffName,
  selectedSlot,
  timezone
}: {
  serviceName?: string;
  staffName?: string;
  selectedSlot?: string;
  timezone: string;
}) {
  return (
    <div className="card stack">
      <strong>Booking Summary</strong>
      <div>Service: {serviceName ?? "Select a service"}</div>
      <div>Staff: {staffName ?? "Select staff"}</div>
      <div>Local time: {selectedSlot ?? "Choose a slot"}</div>
      <div>Timezone: {timezone}</div>
    </div>
  );
}

