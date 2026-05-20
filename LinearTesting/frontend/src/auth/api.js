import { apiRequest } from "../lib/apiClient.js";

export function registerUser(payload) {
  return apiRequest("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return apiRequest("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser() {
  return apiRequest("/api/users/me");
}

export function logoutUser() {
  return apiRequest("/api/sessions/current", {
    method: "DELETE",
  });
}
