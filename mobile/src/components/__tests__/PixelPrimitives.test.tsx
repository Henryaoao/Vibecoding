import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ScrollView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppButton } from "../AppButton";
import { Card } from "../Card";
import { PageHeader } from "../PageHeader";
import { Screen } from "../Screen";
import { colors } from "@/theme/tokens";
import { router } from "expo-router";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(),
    replace: jest.fn()
  }
}));

function withSafeArea(children: React.ReactElement) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 44, right: 0, bottom: 34, left: 0 }
      }}
    >
      {children}
    </SafeAreaProvider>
  );
}

describe("pink pixel shared primitives", () => {
  it("renders the active-page hero language and visual motif", () => {
    render(<PageHeader title="今日公司简报" subtitle="查看已发布内容。" />);

    expect(screen.getByText("PROJECTM / EMPLOYEE DASHBOARD")).toBeTruthy();
    expect(screen.getByText("今日公司简报")).toBeTruthy();
    expect(screen.getByText("Cloud")).toBeTruthy();
  });

  it("keeps cards and buttons on the pink pixel token set", () => {
    const noop = jest.fn();
    render(
      <>
        <Card>
          <Text>像素任务面板</Text>
        </Card>
        <AppButton label="查看详情" onPress={noop} />
      </>
    );

    expect(screen.getByText("像素任务面板")).toBeTruthy();
    expect(screen.getByText("查看详情")).toBeTruthy();
    expect(colors.primary).toBe("#f6c96f");
    expect(colors.background).toBe("#f7efe8");
    expect(colors.border).toBe("#75647f");
  });

  it("wraps scrolling pages in the shared pixel backdrop without adding parked feature text", () => {
    render(withSafeArea(<Screen><Text>员工门户内容</Text></Screen>));

    expect(screen.getByText("员工门户内容")).toBeTruthy();
    expect(screen.queryByText(/Admin Console|通知偏好|下载历史|浏览历史/)).toBeNull();
  });

  it("renders the protected back button inside non-home scrolling content flow", () => {
    const rendered = render(withSafeArea(<Screen><Text>菜单避让内容</Text></Screen>));
    const scrollView = rendered.UNSAFE_getByType(ScrollView);

    expect(scrollView.props.contentContainerStyle).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingTop: 16 })]),
    );
    expect(screen.getByLabelText("返回上一页")).toBeTruthy();
    expect(screen.queryByLabelText("打开菜单")).toBeNull();
  });

  it("returns to the previous page from the shared non-home back button", () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);
    render(withSafeArea(<Screen><Text>返回内容</Text></Screen>));

    fireEvent.press(screen.getByLabelText("返回上一页"));

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("allows auth screens to opt out of the protected page control", () => {
    const rendered = render(withSafeArea(<Screen reserveMenuSpace={false}><Text>登录内容</Text></Screen>));
    const scrollView = rendered.UNSAFE_getByType(ScrollView);

    expect(screen.queryByLabelText("打开菜单")).toBeNull();
    expect(screen.queryByLabelText("返回上一页")).toBeNull();
    expect(scrollView.props.contentContainerStyle).toEqual(expect.arrayContaining([expect.objectContaining({ paddingTop: 16 })]));
  });
});
