import { DataTable } from "../../../components/DataTable";
import { formatUtcInTimezone } from "../../../lib/formatDate";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

export function AppointmentTable({
  items
}: {
  items: Array<{
    id: string;
    timezone: string;
    status: string;
    startTimeUtc: string;
    service: { name: string };
    staff: { displayName: string };
    customer: { firstName: string; lastName: string };
  }>;
}) {
  return (
    <DataTable
      items={items}
      columns={[
        { header: "Service", cell: (item) => item.service.name },
        { header: "Customer", cell: (item) => `${item.customer.firstName} ${item.customer.lastName}` },
        { header: "Staff", cell: (item) => item.staff.displayName },
        { header: "When", cell: (item) => formatUtcInTimezone(item.startTimeUtc, item.timezone) },
        { header: "Status", cell: (item) => <AppointmentStatusBadge status={item.status} /> }
      ]}
    />
  );
}

