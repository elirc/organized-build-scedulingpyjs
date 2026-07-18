import { formatUtcInTimezone } from "../../../lib/formatDate";
import { DataTable } from "../../../components/DataTable";

export function UpcomingAppointmentsTable({
  items
}: {
  items: Array<{
    id: string;
    timezone: string;
    startTimeUtc: string;
    customer: { firstName: string; lastName: string };
    staff: { displayName: string };
    service: { name: string };
  }>;
}) {
  return (
    <DataTable
      items={items}
      columns={[
        { header: "Service", cell: (item) => item.service.name },
        { header: "Customer", cell: (item) => `${item.customer.firstName} ${item.customer.lastName}` },
        { header: "Staff", cell: (item) => item.staff.displayName },
        { header: "When", cell: (item) => formatUtcInTimezone(item.startTimeUtc, item.timezone) }
      ]}
    />
  );
}

