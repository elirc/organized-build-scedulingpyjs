import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "../../../api/services.api";
import { DataTable } from "../../../components/DataTable";
import { LoadingState } from "../../../components/LoadingState";

export function ServiceListPage() {
  const query = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  if (query.isLoading) {
    return <LoadingState label="Loading services..." />;
  }
  return (
    <div className="stack">
      <div className="page-header"><h2>Services</h2></div>
      <section className="card">
        <DataTable
          items={query.data ?? []}
          columns={[
            { header: "Name", cell: (item) => item.name },
            { header: "Duration", cell: (item) => `${item.durationMinutes} min` }
          ]}
        />
      </section>
    </div>
  );
}

