import { apiClient } from "./client";

export async function fetchAppointments() {
  const response = await apiClient.get("/appointments");
  return response.data.appointments as Array<{
    id: string;
    timezone: string;
    status: string;
    startTimeUtc: string;
    endTimeUtc: string;
    service: { name: string };
    staff: { displayName: string };
    customer: { firstName: string; lastName: string };
  }>;
}

export async function fetchAppointmentById(id: string) {
  const response = await apiClient.get(`/appointments/${id}`);
  return response.data.appointment as {
    id: string;
    status: string;
    timezone: string;
    startTimeUtc: string;
    endTimeUtc: string;
    customer: { firstName: string; lastName: string; email: string };
    staff: { displayName: string };
    service: { name: string };
    activities: Array<{ id: string; action: string; createdAt: string; oldValue?: string | null; newValue?: string | null }>;
  };
}

export async function bookAppointment(payload: {
  customerId: string;
  staffId: string;
  serviceId: string;
  startTimeLocal: string;
  timezone: string;
  source: "CUSTOMER_PORTAL" | "ADMIN_BOOKING" | "STAFF_BOOKING" | "SYSTEM_GENERATED";
}) {
  const response = await apiClient.post("/appointments", payload);
  return response.data.appointment;
}

export async function cancelAppointment(id: string, reason: string) {
  const response = await apiClient.post(`/appointments/${id}/cancel`, { reason });
  return response.data.appointment;
}

export async function rescheduleAppointment(id: string, startTimeLocal: string, timezone: string) {
  const response = await apiClient.post(`/appointments/${id}/reschedule`, { startTimeLocal, timezone });
  return response.data.appointment;
}
