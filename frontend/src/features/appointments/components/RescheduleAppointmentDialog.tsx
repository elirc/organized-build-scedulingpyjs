export function RescheduleAppointmentDialog({
  onSubmit
}: {
  onSubmit: (startTimeLocal: string, timezone: string) => void;
}) {
  return (
    <div className="card stack">
      <strong>Reschedule Appointment</strong>
      <button type="button" onClick={() => onSubmit("2026-06-20T11:00:00", "America/Chicago")}>
        Use sample reschedule
      </button>
    </div>
  );
}

