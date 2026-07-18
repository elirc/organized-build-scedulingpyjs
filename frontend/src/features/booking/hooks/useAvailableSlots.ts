import { useQuery } from "@tanstack/react-query";
import { fetchAvailableSlots } from "../../../api/availability.api";

export function useAvailableSlots(params: {
  serviceId: string;
  staffId: string;
  date: string;
  timezone: string;
}) {
  return useQuery({
    queryKey: ["slots", params],
    queryFn: () => fetchAvailableSlots(params),
    enabled: Boolean(params.serviceId && params.staffId && params.date && params.timezone)
  });
}

