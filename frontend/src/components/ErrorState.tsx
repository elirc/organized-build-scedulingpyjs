export function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return <div className="card">{message}</div>;
}

