import { apiClient } from "./client";

export async function fetchServices() {
  const response = await apiClient.get("/services");
  return response.data.services as Array<{ id: string; name: string; durationMinutes: number }>;
}
