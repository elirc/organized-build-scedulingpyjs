export function ConfirmDialog({
  title,
  description,
  onConfirm
}: {
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <div className="card stack">
      <strong>{title}</strong>
      <p>{description}</p>
      <button type="button" onClick={onConfirm}>
        Confirm
      </button>
    </div>
  );
}

