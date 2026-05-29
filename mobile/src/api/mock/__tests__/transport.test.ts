import { describe, expect, it } from "@jest/globals";
import { mockTransport } from "../transport";
import { endpoints } from "../../endpoints";
import type { AdminNewcomerTaskItem, AdminUserItem } from "@/types/domain";

describe("mockTransport", () => {
  it("keeps login responses in the real API envelope shape", async () => {
    const response = await mockTransport<{ access_token: string; token_type: "Bearer" }>({
      path: endpoints.auth.login,
      method: "POST",
      body: { username: "user", password: "mock-password", roleHint: "user" },
      headers: {}
    });

    expect(response.status).toBe(200);
    expect(response.envelope).toMatchObject({
      code: "OK",
      message: "success",
      data: {
        access_token: "mock-token-user",
        token_type: "Bearer"
      }
    });
    expect(response.envelope.request_id).toMatch(/^req_mock_/);
  });

  it("returns 403 for user access to admin endpoints", async () => {
    const response = await mockTransport({
      path: endpoints.admin.dashboard,
      method: "GET",
      headers: { Authorization: "Bearer mock-token-user" }
    });

    expect(response.status).toBe(403);
    expect(response.envelope.code).toBe("FORBIDDEN");
  });

  it("allows super_user access to admin dashboard", async () => {
    const response = await mockTransport({
      path: endpoints.admin.dashboard,
      method: "GET",
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(response.status).toBe(200);
    expect(response.envelope.data).toMatchObject({
      contentCount: expect.any(Number),
      pendingPublishCount: expect.any(Number),
      readCount: expect.any(Number),
      documentDownloadCount: expect.any(Number),
      trainingCompletionRate: expect.any(Number),
      recentActions: expect.any(Array)
    });
  });

  it("persists super_user newcomer task enable and disable state transitions", async () => {
    const createResponse = await mockTransport<AdminNewcomerTaskItem>({
      path: endpoints.admin.newcomerTasks,
      method: "POST",
      body: {
        title: "完成移动端入职材料阅读",
        description: "阅读员工手册并确认信息安全要求。",
        sort_order: 15
      },
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(createResponse.status).toBe(200);
    expect(createResponse.envelope.data).toMatchObject({
      enabled: false,
      title: "完成移动端入职材料阅读"
    });

    const enableResponse = await mockTransport<AdminNewcomerTaskItem>({
      path: endpoints.admin.enableNewcomerTask(createResponse.envelope.data.id),
      method: "POST",
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(enableResponse.envelope.data.enabled).toBe(true);

    const disableResponse = await mockTransport<AdminNewcomerTaskItem>({
      path: endpoints.admin.disableNewcomerTask(createResponse.envelope.data.id),
      method: "POST",
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(disableResponse.envelope.data).toMatchObject({
      id: createResponse.envelope.data.id,
      enabled: false,
      disabled_at: expect.any(String)
    });
  });

  it("persists super_user user role assignment and disable transitions", async () => {
    const createResponse = await mockTransport<AdminUserItem>({
      path: endpoints.admin.users,
      method: "POST",
      body: {
        name: "周明",
        email: "zhou.ming@example.com",
        department: "移动研发部",
        role: "user"
      },
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(createResponse.status).toBe(200);
    expect(createResponse.envelope.data).toMatchObject({
      enabled: true,
      role: "user"
    });
    const roleResponse = await mockTransport<AdminUserItem>({
      path: endpoints.admin.userRole(createResponse.envelope.data.id),
      method: "POST",
      body: { role: "super_user" },
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(roleResponse.envelope.data.role).toBe("super_user");

    const disableResponse = await mockTransport<AdminUserItem>({
      path: endpoints.admin.disableUser(createResponse.envelope.data.id),
      method: "POST",
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(disableResponse.envelope.data).toMatchObject({
      id: createResponse.envelope.data.id,
      enabled: false,
      disabled_at: expect.any(String)
    });
  });

});
