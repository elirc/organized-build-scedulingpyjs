import { useAppointments } from "../hooks/useAppointments";
import { AppointmentTable } from "../components/AppointmentTable";
import { LoadingState } from "../../../components/LoadingState";

export function AppointmentListPage() {
  const query = useAppointments();

  if (query.isLoading) {
    return <LoadingState label="Loading appointments..." />;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>Appointment List</h2>
          <p>Operational list view for front desk and staff.</p>
        </div>
      </div>
      <section className="card">
        <AppointmentTable items={query.data ?? []} />
      </section>
    </div>
  );
}

