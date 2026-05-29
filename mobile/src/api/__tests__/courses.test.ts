import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { completeCourse, getCourse, listCourses, updateCourseProgress } from "../courses";
import { getProfileSummary } from "../me";
import { resetMockTransportState, mockTransport } from "../mock/transport";

describe("course API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("fetches course detail metadata for authorized users", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getCourse("course_1001")).resolves.toMatchObject({
      id: "course_1001",
      title: "信息安全与账号保护",
      summary: "保护账号、设备和内部系统的安全基础课。",
      description: expect.stringContaining("多因素认证"),
      required: true,
      resourceUrl: "https://mock.projectm.local/courses/course_1001",
      progressPercent: 80,
      completed: false,
      completedAt: null
    });
  });

  it("persists progress updates only for the signed-in user's own course progress", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(updateCourseProgress("course_1002", { progressPercent: 65 })).resolves.toMatchObject({
      id: "course_1002",
      progressPercent: 65,
      completed: false,
      completedAt: null
    });
    await expect(getCourse("course_1002")).resolves.toMatchObject({ progressPercent: 65 });

    setAccessTokenProvider(() => "mock-token-super-user");
    await expect(getCourse("course_1002")).resolves.toMatchObject({ progressPercent: 45 });
  });

  it("marks a course complete and reflects it in the list contract", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(completeCourse("course_1003")).resolves.toMatchObject({
      id: "course_1003",
      progressPercent: 100,
      completed: true,
      completedAt: "2026-05-27T10:30:00+08:00"
    });

    await expect(listCourses()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "course_1003", progressPercent: 100, completed: true })
      ])
    );
  });

  it("syncs profile training progress after completing a course", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getProfileSummary()).resolves.toMatchObject({ trainingProgressPercent: 48 });

    await completeCourse("course_1003");

    await expect(getProfileSummary()).resolves.toMatchObject({ trainingProgressPercent: 75 });
  });

  it("returns not found for missing courses and rejects invalid progress", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getCourse("missing_course")).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
    await expect(updateCourseProgress("course_1001", { progressPercent: 101 })).rejects.toMatchObject({
      status: 400,
      code: "INVALID_PROGRESS"
    });
  });
});
