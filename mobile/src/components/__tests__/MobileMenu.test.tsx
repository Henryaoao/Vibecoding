import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileMenu } from "../MobileMenu";

const mockUsePathname = jest.fn(() => "/");

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
  usePathname: () => mockUsePathname(),
}));

describe("MobileMenu", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    jest.clearAllMocks();
  });

  function renderMenu() {
    return render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 44, right: 0, bottom: 34, left: 0 },
        }}
      >
        <MobileMenu />
      </SafeAreaProvider>,
    );
  }

  it("opens the left menu list with only navigation buttons and routes to former tab screens", () => {
    renderMenu();

    fireEvent.press(screen.getByLabelText("打开菜单"));

    expect(screen.queryByText("PROJECTM MENU")).toBeNull();
    expect(screen.queryByText("模块列表")).toBeNull();
    expect(screen.getByLabelText("打开首页")).toBeTruthy();
    expect(screen.getByLabelText("打开文档中心")).toBeTruthy();
    expect(screen.getByLabelText("打开培训中心")).toBeTruthy();
    expect(screen.getByLabelText("打开个人中心")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("打开文档中心"));
    expect(router.push).toHaveBeenCalledWith("/(tabs)/documents");
  });

  it("keeps the menu button in normal content flow instead of fixed viewport positioning", () => {
    renderMenu();

    const menuButtonStyle = StyleSheet.flatten(screen.getByLabelText("打开菜单").props.style);
    expect(menuButtonStyle.position).not.toBe("absolute");
  });

  it("does not push a duplicate route when the current page is selected", () => {
    mockUsePathname.mockReturnValue("/documents");
    renderMenu();

    fireEvent.press(screen.getByLabelText("打开菜单"));
    fireEvent.press(screen.getByLabelText("打开文档中心"));

    expect(router.push).not.toHaveBeenCalled();
    expect(screen.queryByText("模块列表")).toBeNull();
    expect(screen.queryByText("PROJECTM MENU")).toBeNull();
  });

  it("marks parent module entries active on nested detail routes while still allowing parent navigation", () => {
    mockUsePathname.mockReturnValue("/documents/doc_1001");
    renderMenu();

    fireEvent.press(screen.getByLabelText("打开菜单"));
    fireEvent.press(screen.getByLabelText("打开文档中心"));

    expect(router.push).toHaveBeenCalledWith("/(tabs)/documents");
    expect(screen.queryByText("模块列表")).toBeNull();
    expect(screen.queryByText("PROJECTM MENU")).toBeNull();
  });

  it("omits parked feature entries from the mobile menu", () => {
    renderMenu();

    fireEvent.press(screen.getByLabelText("打开菜单"));

    expect(screen.queryByText("Admin Console")).toBeNull();
    expect(screen.queryByText("通知偏好")).toBeNull();
    expect(screen.queryByText("我的收藏")).toBeNull();
    expect(screen.queryByText("下载记录")).toBeNull();
    expect(screen.queryByText("浏览历史")).toBeNull();
  });

  it("routes to user portal modules from the menu list", () => {
    renderMenu();

    fireEvent.press(screen.getByLabelText("打开菜单"));
    fireEvent.press(screen.getByLabelText("打开公司公告墙"));

    expect(router.push).toHaveBeenCalledWith("/modules/announcements");
  });

  it("marks parent module entries active while viewing detail pages", () => {
    mockUsePathname.mockReturnValue("/announcements/announcement_1002");
    renderMenu();

    fireEvent.press(screen.getByLabelText("打开菜单"));

    expect(screen.getByLabelText("打开公司公告墙").props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it("marks former tab entries active while viewing their detail pages", () => {
    mockUsePathname.mockReturnValue("/documents/doc_1001");
    renderMenu();

    fireEvent.press(screen.getByLabelText("打开菜单"));

    expect(screen.getByLabelText("打开文档中心").props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
