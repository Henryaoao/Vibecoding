import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { Role, User } from "@/types/domain";

export type LoginRequest = {
  username: string;
  password: string;
  roleHint?: Role;
};

export type LoginResponse = {
  access_token: string;
  token_type: "Bearer";
};

export function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>({
    path: endpoints.auth.login,
    method: "POST",
    body: payload,
    auth: false
  });
}

export function getCurrentUser() {
  return apiRequest<User>({
    path: endpoints.auth.me
  });
}

export function logout() {
  return apiRequest<{ ok: true }>({
    path: endpoints.auth.logout,
    method: "POST"
  });
}
