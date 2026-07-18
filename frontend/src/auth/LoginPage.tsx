import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";
import { useAuthStore } from "./auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("scheduler@example.com");
  const [password, setPassword] = useState("Password123!");

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      setSession(result.accessToken, result.user);
      navigate("/");
    }
  });

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Scheduling Platform</h1>
        <p>Use a seeded account to explore the scheduling workflows.</p>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button type="button" onClick={() => mutation.mutate({ email, password })}>
          Sign In
        </button>
        {mutation.isError ? <p>Login failed.</p> : null}
      </div>
    </div>
  );
}

