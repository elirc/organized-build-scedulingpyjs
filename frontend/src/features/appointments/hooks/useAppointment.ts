import { useQuery } from "@tanstack/react-query";
import { fetchAppointmentById } from "../../../api/appointments.api";

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: () => fetchAppointmentById(id),
    enabled: Boolean(id)
  });
}

