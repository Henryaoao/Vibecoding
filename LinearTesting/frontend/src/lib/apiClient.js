const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest(path, options = {}) {
  const token = window.localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const body = await response.json();

  if (!response.ok || body.success === false) {
    const message = body.error?.message || "Request failed";
    const details = body.error?.details || [];
    throw new Error(details.length > 0 ? `${message}: ${details.join(", ")}` : message);
  }

  return body.data;
}

