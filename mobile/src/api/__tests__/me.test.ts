import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { updateCourseProgress } from "../courses";
import {
  getProfileSummary,
  listMyTrainingProgress,
  updateProfilePreferences
} from "../me";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("me API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("lists current user's training progress records", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const progress = await listMyTrainingProgress();

    expect(progress.map((item) => item.courseId)).toEqual(["course_1001", "course_1002", "course_1003"]);
    expect(progress[0]).toMatchObject({
      courseId: "course_1001",
      title: "信息安全与账号保护",
      progressPercent: 80,
      completed: false,
      lastLearnedAt: "2026-05-27T08:50:00+08:00"
    });
    await expect(getProfileSummary()).resolves.toMatchObject({ trainingProgressPercent: 48 });
  });

  it("reflects course progress changes in the personal training progress contract", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await updateCourseProgress("course_1002", { progressPercent: 65 });

    await expect(listMyTrainingProgress()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          courseId: "course_1002",
          progressPercent: 65,
          completed: false
        })
      ])
    );
  });

  it("updates and persists the current user's home newcomer preference for this mock session", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getProfileSummary()).resolves.toMatchObject({
      preferences: { showNewcomerOnHome: true }
    });

    await expect(updateProfilePreferences({ showNewcomerOnHome: false })).resolves.toMatchObject({
      preferences: { showNewcomerOnHome: false }
    });
    await expect(getProfileSummary()).resolves.toMatchObject({
      preferences: { showNewcomerOnHome: false }
    });

    setAccessTokenProvider(() => "mock-token-super-user");
    await expect(getProfileSummary()).resolves.toMatchObject({
      preferences: { showNewcomerOnHome: true }
    });

    resetMockTransportState();
    setAccessTokenProvider(() => "mock-token-user");
    await expect(getProfileSummary()).resolves.toMatchObject({
      preferences: { showNewcomerOnHome: true }
    });
  });

  it("requires a valid session for personal center detail contracts", async () => {
    await expect(getProfileSummary()).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    await expect(listMyTrainingProgress()).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    await expect(updateProfilePreferences({ showNewcomerOnHome: false })).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED"
    });
  });
});
