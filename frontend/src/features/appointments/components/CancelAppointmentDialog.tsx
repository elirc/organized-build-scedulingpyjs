import { ConfirmDialog } from "../../../components/ConfirmDialog";

export function CancelAppointmentDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <ConfirmDialog
      title="Cancel appointment"
      description="This marks the appointment as cancelled and cancels future reminders."
      onConfirm={onConfirm}
    />
  );
}

