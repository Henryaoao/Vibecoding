import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./authStore.js";

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <main className="page-shell">Loading account...</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

