import { useQuery } from "@tanstack/react-query";
import { fetchStaff } from "../../../api/staff.api";
import { DataTable } from "../../../components/DataTable";
import { LoadingState } from "../../../components/LoadingState";

export function StaffListPage() {
  const query = useQuery({ queryKey: ["staff"], queryFn: fetchStaff });
  if (query.isLoading) {
    return <LoadingState label="Loading staff..." />;
  }

  return (
    <div className="stack">
      <div className="page-header"><h2>Staff</h2></div>
      <section className="card">
        <DataTable
          items={query.data ?? []}
          columns={[
            { header: "Name", cell: (item) => item.displayName },
            { header: "Timezone", cell: (item) => item.timezone }
          ]}
        />
      </section>
    </div>
  );
}

