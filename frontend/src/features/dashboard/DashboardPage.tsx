import { useQuery } from "@tanstack/react-query";
import { fetchAppointmentsByStatus, fetchDashboardSummary, fetchStaffUtilization, fetchUpcomingAppointments } from "../../api/dashboard.api";
import { LoadingState } from "../../components/LoadingState";
import { StatCard } from "./components/StatCard";
import { UpcomingAppointmentsTable } from "./components/UpcomingAppointmentsTable";
import { StaffUtilizationChart } from "./components/StaffUtilizationChart";
import { AppointmentsByStatusChart } from "./components/AppointmentsByStatusChart";

export function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["dashboard", "summary"], queryFn: fetchDashboardSummary });
  const statusQuery = useQuery({ queryKey: ["dashboard", "status"], queryFn: fetchAppointmentsByStatus });
  const utilizationQuery = useQuery({ queryKey: ["dashboard", "utilization"], queryFn: fetchStaffUtilization });
  const upcomingQuery = useQuery({ queryKey: ["dashboard", "upcoming"], queryFn: fetchUpcomingAppointments });

  if (summaryQuery.isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>Operations Dashboard</h2>
          <p>High-level scheduling health and throughput.</p>
        </div>
      </div>
      <div className="card-grid">
        <StatCard label="Today’s Appointments" value={summaryQuery.data?.todayAppointments ?? 0} />
        <StatCard label="Total Appointments" value={summaryQuery.data?.totalAppointments ?? 0} />
        <StatCard label="Active Staff" value={summaryQuery.data?.activeStaff ?? 0} />
      </div>
      <section className="card stack">
        <strong>Appointments by Status</strong>
        <AppointmentsByStatusChart items={statusQuery.data ?? []} />
      </section>
      <section className="card stack">
        <strong>Upcoming Appointments</strong>
        <UpcomingAppointmentsTable items={upcomingQuery.data ?? []} />
      </section>
      <section className="card stack">
        <strong>Staff Utilization</strong>
        <StaffUtilizationChart items={utilizationQuery.data ?? []} />
      </section>
    </div>
  );
}
