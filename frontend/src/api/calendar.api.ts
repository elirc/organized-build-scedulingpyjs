import { apiClient } from "./client";

export async function fetchCalendarWeek(params: {
  staffId?: string;
  startDate: string;
  timezone: string;
}) {
  const response = await apiClient.get("/calendar/week", { params });
  return response.data as {
    timezone: string;
    appointments: Array<{
      id: string;
      startTimeUtc: string;
      endTimeUtc: string;
      timezone: string;
      service: { name: string };
      customer: { firstName: string; lastName: string };
      staff: { displayName: string };
    }>;
  };
}

