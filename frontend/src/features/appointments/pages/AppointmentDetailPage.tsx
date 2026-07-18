import { useParams } from "react-router-dom";
import { LoadingState } from "../../../components/LoadingState";
import { AppointmentActivityFeed } from "../components/AppointmentActivityFeed";
import { CancelAppointmentDialog } from "../components/CancelAppointmentDialog";
import { RescheduleAppointmentDialog } from "../components/RescheduleAppointmentDialog";
import { useAppointment } from "../hooks/useAppointment";
import { useCancelAppointment } from "../hooks/useCancelAppointment";
import { useRescheduleAppointment } from "../hooks/useRescheduleAppointment";

export function AppointmentDetailPage() {
  const params = useParams();
  const query = useAppointment(params.id ?? "");
  const cancelMutation = useCancelAppointment();
  const rescheduleMutation = useRescheduleAppointment();

  if (query.isLoading || !query.data) {
    return <LoadingState label="Loading appointment detail..." />;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>{query.data.service.name}</h2>
          <p>{query.data.customer.firstName} {query.data.customer.lastName}</p>
        </div>
      </div>
      <div className="card-grid">
        <div className="card">
          <strong>Staff</strong>
          <div>{query.data.staff.displayName}</div>
        </div>
        <div className="card">
          <strong>Status</strong>
          <div>{query.data.status}</div>
        </div>
        <div className="card">
          <strong>Timezone</strong>
          <div>{query.data.timezone}</div>
        </div>
      </div>
      <CancelAppointmentDialog onConfirm={() => cancelMutation.mutate({ id: query.data.id, reason: "Customer requested cancellation" })} />
      <RescheduleAppointmentDialog onSubmit={(startTimeLocal, timezone) => rescheduleMutation.mutate({ id: query.data.id, startTimeLocal, timezone })} />
      <section className="card stack">
        <strong>Activity Feed</strong>
        <AppointmentActivityFeed items={query.data.activities ?? []} />
      </section>
    </div>
  );
}

