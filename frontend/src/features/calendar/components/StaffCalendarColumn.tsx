import { AppointmentCard } from "./AppointmentCard";

export function StaffCalendarColumn({
  label,
  appointments,
  timezone
}: {
  label: string;
  appointments: Array<{
    id: string;
    startTimeUtc: string;
    endTimeUtc: string;
    service: { name: string };
    customer: { firstName: string; lastName: string };
  }>;
  timezone: string;
}) {
  return (
    <div className="stack">
      <div className="calendar-cell"><strong>{label}</strong></div>
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} timezone={timezone} />
      ))}
    </div>
  );
}

