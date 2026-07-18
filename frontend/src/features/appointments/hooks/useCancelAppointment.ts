import { useMutation } from "@tanstack/react-query";
import { cancelAppointment } from "../../../api/appointments.api";

export function useCancelAppointment() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelAppointment(id, reason)
  });
}

