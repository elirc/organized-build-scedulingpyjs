import { apiClient } from "./client";

export async function fetchDashboardSummary() {
  const response = await apiClient.get("/dashboard/summary");
  return response.data;
}

export async function fetchAppointmentsByStatus() {
  const response = await apiClient.get("/dashboard/appointments-by-status");
  return response.data;
}

export async function fetchStaffUtilization() {
  const response = await apiClient.get("/dashboard/staff-utilization");
  return response.data;
}

export async function fetchUpcomingAppointments() {
  const response = await apiClient.get("/dashboard/upcoming-appointments");
  return response.data;
}

