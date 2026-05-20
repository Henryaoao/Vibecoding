const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "auth_token";

export function token() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(value) {
  window.localStorage.setItem(TOKEN_KEY, value);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function ajax(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token()) {
    headers.Authorization = `Bearer ${token()}`;
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

export function registerUser(payload) {
  return ajax("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return ajax("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser() {
  return ajax("/api/users/me");
}

export function logoutUser() {
  return ajax("/api/sessions/current", {
    method: "DELETE",
  });
}

export function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function showError(message) {
  const error = document.querySelector("[data-error]");
  if (!error) {
    return;
  }

  error.hidden = message === "";
  error.textContent = message;
}

export function setLoading(loading) {
  document.querySelectorAll("[data-loading-button]").forEach((button) => {
    button.disabled = loading;
  });
}
