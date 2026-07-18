import { useQuery } from "@tanstack/react-query";
import { fetchAppointments } from "../../../api/appointments.api";

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments
  });
}

