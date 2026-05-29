import { afterEach, describe, expect, it } from "@jest/globals";
import {
  createAdminContent,
  createAdminUser,
  disableAdminUser,
  getAdminAuditLogs,
  updateAdminUserRole
} from "../admin";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const forbiddenWords = /password|token|jwt|database_url|db_password|request_body|file_content/i;
const sensitiveFields = ["request_body", "password", "authorization", "access_token", "db_password", "file_content", "before", "after", "metadata"];

describe("admin audit log API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin audit logs", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminAuditLogs()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("returns actor, action, resource, IP, User-Agent, and time fields", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    const response = await getAdminAuditLogs();

    expect(response).toEqual(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            actor_name: "陈思远",
            action: "publish",
            resource_type: "content",
            resource_id: "content_1001",
            ip_address: "203.0.113.10",
            user_agent: "ProjectM-Mobile/1.0 (iOS 18.0)",
            created_at: "2026-05-27T09:20:00+08:00"
          })
        ]),
        total: expect.any(Number)
      })
    );
    expect(response.total).toBe(response.items.length);
    expect(JSON.stringify(response)).not.toMatch(forbiddenWords);
    for (const field of sensitiveFields) {
      expect(response.items[0]).not.toHaveProperty(field);
    }
  });

  it("appends a sanitized audit log after a successful super_user content create", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    const created = await createAdminContent({
      type: "announcement",
      title: "移动端安全提示更新",
      summary: "更新移动端安全提醒文案。",
      body: "仅用于内部展示，不包含敏感信息。",
      category: "安全"
    });

    const response = await getAdminAuditLogs({
      action: "create",
      resourceType: "content"
    });

    expect(response.total).toBe(1);
    expect(response.items[0]).toMatchObject({
      actor_name: "陈思远",
      action: "create",
      resource_type: "content",
      resource_id: created.id,
      summary: "创建内容：移动端安全提示更新"
    });
    expect(JSON.stringify(response.items[0])).not.toMatch(forbiddenWords);
    for (const field of sensitiveFields) {
      expect(response.items[0]).not.toHaveProperty(field);
    }
  });

  it("appends role_change and disable audit logs for successful user writes", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    const created = await createAdminUser({
      name: "王测试",
      email: "wangceshi@example.com",
      department: "安全运营",
      role: "user"
    });

    await updateAdminUserRole(created.id, { role: "super_user" });
    await disableAdminUser(created.id);

    await expect(getAdminAuditLogs({ action: "role_change", resourceType: "user" })).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({
          action: "role_change",
          resource_type: "user",
          resource_id: created.id,
          summary: "修改用户角色：王测试 -> super_user"
        })
      ])
    });
    await expect(getAdminAuditLogs({ action: "disable", resourceType: "user" })).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({
          action: "disable",
          resource_type: "user",
          resource_id: created.id,
          summary: "禁用用户：王测试"
        })
      ])
    });
  });

  it("does not append audit logs after a forbidden normal-user admin write", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(
      createAdminContent({
        type: "announcement",
        title: "普通用户不应创建",
        summary: "普通用户写入必须被拒绝。",
        body: "这段请求体不应出现在审计日志中。",
        category: "权限"
      })
    ).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });

    setAccessTokenProvider(() => "mock-token-super-user");
    await expect(getAdminAuditLogs({ action: "create", resourceType: "content" })).resolves.toMatchObject({
      items: [],
      total: 0
    });
  });
});
