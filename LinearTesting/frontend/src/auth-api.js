const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "auth_token";

export class AjaxError extends Error {
  constructor(message, status, code, details = []) {
    super(details.length > 0 ? `${message}: ${details.join(", ")}` : message);
    this.name = "AjaxError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

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
    throw new AjaxError(message, response.status, body.error?.code, details);
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

export function fetchCurrentPet() {
  return ajax("/api/pet");
}

export function fetchPetEvents() {
  return ajax("/api/pet/events");
}

export function fetchPetSkins() {
  return ajax("/api/pet/skins");
}

export function fetchTeamSummary() {
  return ajax("/api/pet/team-summary");
}

export function fetchWallet() {
  return ajax("/api/wallet/me");
}

export function fetchAdminReportSummary() {
  return ajax("/api/admin/reports/summary");
}

export function fetchTaskTemplates() {
  return ajax("/api/task-templates");
}

export function claimTaskReward(taskId) {
  return ajax(`/api/tasks/${encodeURIComponent(taskId)}/claim`, {
    method: "POST",
    headers: {
      "Idempotency-Key": `claim-${taskId}-${new Date().toISOString().slice(0, 10)}`,
    },
  });
}

export function createPet(payload) {
  return ajax("/api/pet", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function feedPet(amount = 1) {
  return ajax("/api/pet/feed", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
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
