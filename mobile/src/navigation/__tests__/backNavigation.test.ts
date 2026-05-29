import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { router } from "expo-router";
import { goBackOrDocuments, goBackOrHome, goBackOrProfile, goBackOrTraining } from "../backNavigation";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(),
    replace: jest.fn()
  }
}));

describe("goBackOrHome", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pops the current route when a previous page exists", () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);

    goBackOrHome();

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to the tabs home route for direct entry", () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);

    goBackOrHome();

    expect(router.replace).toHaveBeenCalledWith("/(tabs)");
    expect(router.back).not.toHaveBeenCalled();
  });
});

describe("goBackOrDocuments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pops the current route when returning to the document list from navigation history", () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);

    goBackOrDocuments();

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to the document tab for direct document detail entry", () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);

    goBackOrDocuments();

    expect(router.replace).toHaveBeenCalledWith("/(tabs)/documents");
    expect(router.back).not.toHaveBeenCalled();
  });
});

describe("remaining mobile back-navigation fallbacks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("falls back to the profile tab for direct profile workflow entry", () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);

    goBackOrProfile();

    expect(router.replace).toHaveBeenCalledWith("/(tabs)/me");
    expect(router.back).not.toHaveBeenCalled();
  });

  it("falls back to the training tab for direct training detail entry", () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);

    goBackOrTraining();

    expect(router.replace).toHaveBeenCalledWith("/(tabs)/training");
    expect(router.back).not.toHaveBeenCalled();
  });
});
