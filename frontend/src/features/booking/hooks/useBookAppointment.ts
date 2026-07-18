import { useMutation } from "@tanstack/react-query";
import { bookAppointment } from "../../../api/appointments.api";

export function useBookAppointment() {
  return useMutation({
    mutationFn: bookAppointment
  });
}

