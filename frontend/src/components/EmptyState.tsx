export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="card">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

