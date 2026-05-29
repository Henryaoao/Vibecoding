import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  createAdminUser,
  disableAdminUser,
  getAdminRoles,
  getAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole
} from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const draftPayload = {
  name: "周明",
  email: "zhou.ming@example.com",
  department: "移动研发部",
  role: "user" as const
};

describe("admin user API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin user endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminUsers()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("rejects normal user access to admin role metadata", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminRoles()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("returns exactly the supported application roles for super_user role metadata", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    const roles = await getAdminRoles();
    const inactiveAdminRoles = ["content", "department", "system"].map((scope) => `${scope}_admin`);

    expect(roles).toEqual(["user", "super_user"]);
    expect(roles).toHaveLength(2);
    expect(roles).not.toEqual(expect.arrayContaining(inactiveAdminRoles));
  });

  it("supports super_user single-record create, detail, update, role assignment and disable", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminRoles()).resolves.toEqual(["user", "super_user"]);
    await expect(getAdminUsers()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "admin_user_1001", role: "user", enabled: true })])
    );

    const created = await createAdminUser(draftPayload);
    expect(created).toMatchObject({
      id: expect.stringMatching(/^admin_user_mock_/),
      enabled: true,
      name: draftPayload.name,
      email: draftPayload.email,
      department: draftPayload.department,
      role: "user",
      deleted_at: null
    });

    await expect(getAdminUser(created.id)).resolves.toMatchObject({
      id: created.id,
      name: draftPayload.name,
      role: "user"
    });

    await expect(updateAdminUser(created.id, { name: "周明（更新）", department: "平台体验部" })).resolves.toMatchObject({
      id: created.id,
      name: "周明（更新）",
      department: "平台体验部",
      role: "user"
    });

    await expect(updateAdminUserRole(created.id, { role: "super_user" })).resolves.toMatchObject({
      id: created.id,
      role: "super_user"
    });

    await expect(disableAdminUser(created.id)).resolves.toMatchObject({
      id: created.id,
      enabled: false,
      disabled_at: expect.any(String)
    });
  });

  it("allows demoting a super_user when another enabled super_user remains", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    const created = await createAdminUser({
      ...draftPayload,
      email: "backup.super@example.com",
      role: "super_user"
    });

    await expect(updateAdminUserRole(created.id, { role: "user" })).resolves.toMatchObject({
      id: created.id,
      role: "user",
      enabled: true
    });
  });

  it("rejects disabling the last enabled super_user and leaves the record unchanged", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(disableAdminUser("admin_user_1002")).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "系统必须保留至少一名启用的超级用户"
    });

    await expect(getAdminUser("admin_user_1002")).resolves.toMatchObject({
      id: "admin_user_1002",
      role: "super_user",
      enabled: true,
      disabled_at: null
    });
  });

  it("rejects demoting the last enabled super_user and leaves the record unchanged", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(updateAdminUserRole("admin_user_1002", { role: "user" })).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "系统必须保留至少一名启用的超级用户"
    });

    await expect(getAdminUser("admin_user_1002")).resolves.toMatchObject({
      id: "admin_user_1002",
      role: "super_user",
      enabled: true,
      disabled_at: null
    });
  });

  it("rejects legacy admin role names", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");
    const legacyAdminRoles = ["content", "department", "system"].map((scope) => `${scope}_admin`);

    for (const role of legacyAdminRoles) {
      await expect(createAdminUser({ ...draftPayload, role: role as never })).rejects.toMatchObject({
        status: 400,
        code: "VALIDATION_ERROR"
      });
      await expect(updateAdminUserRole("admin_user_1001", { role: role as never })).rejects.toMatchObject({
        status: 400,
        code: "VALIDATION_ERROR"
      });
    }
  });
});
