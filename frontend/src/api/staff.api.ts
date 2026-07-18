import { apiClient } from "./client";

export async function fetchStaff() {
  const response = await apiClient.get("/staff");
  return response.data.staff as Array<{ id: string; displayName: string; timezone: string }>;
}
