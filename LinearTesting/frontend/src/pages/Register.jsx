import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../auth/authStore.js";

export function Register() {
  const { error, isLoading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email || !form.username || !form.password) {
      setValidationError("Email, username, and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }

    setValidationError("");
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch {
      // Error is shown from auth state.
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="register-title">
        <p className="eyebrow">User MVP</p>
        <h1 id="register-title">Create account</h1>
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
            Username
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              autoComplete="new-password"
            />
          </label>
          {(validationError || error) && (
            <p className="error-message" role="alert">
              {validationError || error}
            </p>
          )}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="helper-text">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

