import type { Role, User } from "@/types/domain";

export const APPLICATION_ROLES = ["user", "super_user"] as const satisfies readonly Role[];

export function isApplicationRole(role: unknown): role is Role {
  return typeof role === "string" && APPLICATION_ROLES.includes(role as Role);
}

export function hasAnyRole(user: User | null | undefined, roles: Role[]) {
  return Boolean(user?.roles.some((role) => roles.includes(role)));
}
