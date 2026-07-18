import { apiClient } from "./client";

export async function fetchAvailableSlots(params: {
  serviceId: string;
  staffId: string;
  date: string;
  timezone: string;
}) {
  const response = await apiClient.get("/availability/slots", { params });
  return response.data.slots as Array<{
    startTimeUtc: string;
    endTimeUtc: string;
    startTimeLocal: string;
    endTimeLocal: string;
    timezone: string;
  }>;
}
