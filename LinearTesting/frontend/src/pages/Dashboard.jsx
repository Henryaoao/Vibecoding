import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/authStore.js";

export function Dashboard() {
  const { isLoading, logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="page-shell">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome, {user?.username}</h1>
        </div>
        <button type="button" onClick={handleLogout} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Log out"}
        </button>
      </section>

      <section className="summary-panel" aria-label="Current user">
        <dl>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user?.role}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

