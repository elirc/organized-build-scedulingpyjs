import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "../../../api/customers.api";
import { DataTable } from "../../../components/DataTable";
import { LoadingState } from "../../../components/LoadingState";

export function CustomerListPage() {
  const query = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  if (query.isLoading) {
    return <LoadingState label="Loading customers..." />;
  }

  return (
    <div className="stack">
      <div className="page-header"><h2>Customers</h2></div>
      <section className="card">
        <DataTable
          items={query.data ?? []}
          columns={[
            { header: "First Name", cell: (item) => item.firstName },
            { header: "Last Name", cell: (item) => item.lastName },
            { header: "Email", cell: (item) => item.email }
          ]}
        />
      </section>
    </div>
  );
}

