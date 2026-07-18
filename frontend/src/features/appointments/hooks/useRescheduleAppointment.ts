import { useMutation } from "@tanstack/react-query";
import { rescheduleAppointment } from "../../../api/appointments.api";

export function useRescheduleAppointment() {
  return useMutation({
    mutationFn: ({ id, startTimeLocal, timezone }: { id: string; startTimeLocal: string; timezone: string }) =>
      rescheduleAppointment(id, startTimeLocal, timezone)
  });
}

