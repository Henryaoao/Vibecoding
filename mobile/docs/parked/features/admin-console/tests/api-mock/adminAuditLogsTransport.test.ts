import { describe, expect, it } from "@jest/globals";
import { endpoints } from "../../endpoints";
import { mockTransport } from "../transport";
import type { AdminAuditLogList } from "@/types/domain";

const forbiddenWords = /password|token|jwt|database_url|db_password|request_body|file_content/i;
const sensitiveFields = ["request_body", "password", "authorization", "access_token", "db_password", "file_content", "before", "after", "metadata"];

describe("mockTransport admin audit logs", () => {
  it("returns 403 for user access to any admin audit log request", async () => {
    const response = await mockTransport({
      path: endpoints.admin.auditLogs,
      method: "GET",
      headers: { Authorization: "Bearer mock-token-user" }
    });

    expect(response.status).toBe(403);
    expect(response.envelope.code).toBe("FORBIDDEN");
  });

  it("filters audit logs without exposing sensitive request or credential fields", async () => {
    const response = await mockTransport<AdminAuditLogList>({
      path: `${endpoints.admin.auditLogs}?query=${encodeURIComponent("林一鸣")}&action=disable`,
      method: "GET",
      headers: { Authorization: "Bearer mock-token-super-user" }
    });

    expect(response.status).toBe(200);
    expect(response.envelope.data.items).toHaveLength(1);
    expect(response.envelope.data.items[0]).toMatchObject({
      actor_name: "林一鸣",
      action: "disable"
    });
    expect(JSON.stringify(response.envelope.data)).not.toMatch(forbiddenWords);
    for (const field of sensitiveFields) {
      expect(response.envelope.data.items[0]).not.toHaveProperty(field);
    }
  });
});
