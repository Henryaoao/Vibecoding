import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../auth/authStore.js";

export function Login() {
  const { error, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email || !form.password) {
      setValidationError("Email and password are required.");
      return;
    }

    setValidationError("");
    try {
      await login(form);
      const redirectTo = location.state?.from?.startsWith("/") ? location.state.from : "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch {
      // Error is shown from auth state.
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">User MVP</p>
        <h1 id="login-title">Log in</h1>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="current-password"
            />
          </label>
          {(validationError || error) && (
            <p className="error-message" role="alert">
              {validationError || error}
            </p>
          )}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="helper-text">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}

