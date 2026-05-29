import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import ForbiddenScreen from "../../../app/forbidden";

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn()
  }
}));

describe("ForbiddenScreen", () => {
  it("explains that unauthorized pages are blocked", () => {
    render(<ForbiddenScreen />);

    expect(screen.getByText("403")).toBeTruthy();
    expect(screen.getByText(/当前页面需要更高权限或暂未开放/)).toBeTruthy();
    expect(screen.getByText("返回首页")).toBeTruthy();
  });

  it("returns direct forbidden entries to the mobile home route", () => {
    render(<ForbiddenScreen />);

    fireEvent.press(screen.getByText("返回首页"));

    expect(router.replace).toHaveBeenCalledWith("/(tabs)");
  });
});
