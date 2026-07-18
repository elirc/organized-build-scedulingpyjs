import { formatUtcInTimezone } from "../../../lib/formatDate";

export function AppointmentCard({
  appointment,
  timezone
}: {
  appointment: {
    id: string;
    startTimeUtc: string;
    endTimeUtc: string;
    service: { name: string };
    customer: { firstName: string; lastName: string };
  };
  timezone: string;
}) {
  return (
    <div className="appointment-card">
      <strong>{appointment.service.name}</strong>
      <div>{appointment.customer.firstName} {appointment.customer.lastName}</div>
      <div>{formatUtcInTimezone(appointment.startTimeUtc, timezone, "t")} - {formatUtcInTimezone(appointment.endTimeUtc, timezone, "t")}</div>
    </div>
  );
}

