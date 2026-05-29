import { describe, expect, it } from "@jest/globals";
import { APPLICATION_ROLES, hasAnyRole, isApplicationRole } from "../roles";
import type { User } from "@/types/domain";

const regularUser: User = {
  id: "u_1",
  name: "普通用户",
  email: "user@example.com",
  department: "产品运营部",
  roles: ["user"]
};

const superUser: User = {
  ...regularUser,
  id: "u_2",
  name: "超级用户",
  roles: ["user", "super_user"]
};

describe("hasAnyRole", () => {
  it("defines the complete application role allow-list as user and super_user only", () => {
    expect(APPLICATION_ROLES).toEqual(["user", "super_user"]);
    expect(isApplicationRole("user")).toBe(true);
    expect(isApplicationRole("super_user")).toBe(true);
    expect(isApplicationRole("admin")).toBe(false);
  });

  it("keeps legacy admin role names outside the application role model", () => {
    const legacyAdminRoles = ["content", "department", "system"].map((scope) => `${scope}_admin`);

    for (const role of legacyAdminRoles) {
      expect(isApplicationRole(role)).toBe(false);
    }
  });

  it("does not grant admin role to regular users", () => {
    expect(hasAnyRole(regularUser, ["super_user"])).toBe(false);
  });

  it("grants admin role to super users", () => {
    expect(hasAnyRole(superUser, ["super_user"])).toBe(true);
  });

  it("returns false without a current user", () => {
    expect(hasAnyRole(null, ["user"])).toBe(false);
  });
});
