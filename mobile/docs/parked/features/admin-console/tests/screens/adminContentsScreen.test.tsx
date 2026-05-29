import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminContentsScreen from "../../../app/admin/contents/index";
import AdminContentDetailScreen from "../../../app/admin/contents/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn(() => ({ id: "content_1001" }));

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    push: jest.fn(),
    replace: jest.fn()
  },
  useLocalSearchParams: () => mockUseLocalSearchParams()
}));

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity }
    }
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(ui, { wrapper: Wrapper });
}

describe("Admin content management screens", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-super-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("lists content records and links to create/detail screens", async () => {
    renderWithQuery(<AdminContentsScreen />);

    expect(await screen.findByText("内容管理")).toBeTruthy();
    expect(screen.getByText("今日公司简报：网络维护提醒")).toBeTruthy();

    fireEvent.press(screen.getByText("新建内容"));
    expect(router.push).toHaveBeenCalledWith("/admin/contents/new");

    fireEvent.press(screen.getByText("今日公司简报：网络维护提醒"));
    expect(router.push).toHaveBeenCalledWith("/admin/contents/content_1001");
  });

  it("creates a draft and supports publish, archive, and soft-delete for one record", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminContentDetailScreen />);

    expect(await screen.findByText("新建内容")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("标题"), "端午节值班安排");
    fireEvent.changeText(screen.getByPlaceholderText("摘要"), "值班表与办公区开放时间");
    fireEvent.changeText(screen.getByPlaceholderText("正文"), "端午节期间办公区开放时间为 09:00-18:00。");
    fireEvent.press(screen.getByText("保存草稿"));

    expect(await screen.findByText("草稿已保存"));
    expect(screen.getByText("状态：draft")).toBeTruthy();

    fireEvent.press(screen.getByText("发布"));
    expect(screen.getByText("确认发布内容")).toBeTruthy();
    expect(screen.getByText("状态：draft")).toBeTruthy();
    fireEvent.press(screen.getByText("取消"));
    expect(screen.queryByText("确认发布内容")).toBeNull();
    expect(screen.getByText("状态：draft")).toBeTruthy();

    fireEvent.press(screen.getByText("发布"));
    fireEvent.press(screen.getByText("确认发布"));
    await waitFor(() => expect(screen.getByText("状态：published")).toBeTruthy());

    fireEvent.press(screen.getByText("归档"));
    expect(screen.getByText("确认归档内容")).toBeTruthy();
    expect(screen.getByText("状态：published")).toBeTruthy();
    fireEvent.press(screen.getByText("确认归档"));
    await waitFor(() => expect(screen.getByText("状态：archived")).toBeTruthy());

    fireEvent.press(screen.getByText("软删除"));
    expect(screen.getByText("确认软删除内容")).toBeTruthy();
    expect(screen.getByText("状态：archived")).toBeTruthy();
    fireEvent.press(screen.getByText("确认软删除"));
    await waitFor(() => expect(screen.getByText("已软删除")).toBeTruthy());
  });
});
