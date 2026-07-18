import { useAuthStore } from "../auth/auth.store";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <header className="topbar">
      <div>
        <strong>{user?.email ?? "Guest"}</strong>
        <div>{user?.role ?? "Unauthenticated"}</div>
      </div>
      {user ? (
        <button type="button" onClick={clearSession}>
          Sign Out
        </button>
      ) : null}
    </header>
  );
}

