import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import NewcomerScreen from "../../../app/modules/newcomer";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe("NewcomerScreen", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("renders newcomer content, enabled personal tasks, search, and route wiring", async () => {
    renderWithQuery(<NewcomerScreen />);

    expect(await screen.findByText("入职第一周必读清单")).toBeTruthy();
    expect(screen.getByText("新人专区 · 4 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部新人资料与任务")).toBeTruthy();
    expect(screen.getByText("提交入职资料")).toBeTruthy();
    expect(screen.getByText("完成信息安全确认")).toBeTruthy();
    expect(screen.queryByText("预约导师一对一")).toBeNull();

    fireEvent.changeText(
      screen.getByPlaceholderText("搜索新人资料标题、摘要或正文"),
      "导师",
    );
    expect(await screen.findByText("导师沟通准备指南")).toBeTruthy();
    expect(screen.getByText("新人专区 · 3 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：新人资料关键词：导师")).toBeTruthy();
    expect(screen.queryByText("入职第一周必读清单")).toBeNull();

    fireEvent.press(screen.getByLabelText("清除新人专区筛选"));
    expect(await screen.findByText("入职第一周必读清单")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("查看新人资料 导师沟通准备指南"));
    expect(router.push).toHaveBeenCalledWith("/newcomer/newcomer_content_1002");

    fireEvent.press(screen.getByLabelText("查看新人任务 提交入职资料"));
    expect(router.push).toHaveBeenCalledWith(
      "/me/newcomer-tasks/admin_newcomer_task_1001",
    );
  });

  it("adds unified task filters sorting summaries empty copy and reset controls", async () => {
    renderWithQuery(<NewcomerScreen />);

    expect(await screen.findByText("入职第一周必读清单")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部新人资料和任务 / 资料排序：最新优先 / 任务排序：任务顺序")).toBeTruthy();
    expect(screen.getAllByLabelText("新人资料按最新优先排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("新人资料按分类名称排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("筛选未完成新人任务")).toHaveLength(1);
    expect(screen.getAllByLabelText("筛选已完成新人任务")).toHaveLength(1);
    expect(screen.getAllByLabelText("新人任务按任务顺序排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("新人任务按未完成优先排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("重置新人专区筛选和排序")).toHaveLength(1);

    fireEvent.press(screen.getByLabelText("筛选未完成新人任务"));
    expect(screen.getByText("当前筛选：未完成任务 / 资料排序：最新优先 / 任务排序：任务顺序")).toBeTruthy();
    expect(await screen.findByText("提交入职资料")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("新人任务按未完成优先排序"));
    expect(screen.getByText("当前筛选：未完成任务 / 资料排序：最新优先 / 任务排序：未完成优先")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("搜索新人资料标题、摘要或正文"), "不存在的资料");
    expect(await screen.findByText("没有匹配的新人资料")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("重置新人专区筛选和排序"));
    expect(await screen.findByText("入职第一周必读清单")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部新人资料和任务 / 资料排序：最新优先 / 任务排序：任务顺序")).toBeTruthy();
  });

  it("completes a newcomer task without parked favorites or read tracking", async () => {
    renderWithQuery(<NewcomerScreen />);

    expect(await screen.findByText("入职第一周必读清单")).toBeTruthy();
    expect(screen.queryByLabelText(/收藏/)).toBeNull();
    expect(screen.queryByText(/收藏|已收藏/)).toBeNull();

    fireEvent.press(screen.getByLabelText("完成任务 提交入职资料"));
    expect(await screen.findByText("已完成")).toBeTruthy();
    expect(
      screen.queryByText(/收藏|已收藏|最近浏览|浏览历史|已读|阅读记录/),
    ).toBeNull();
  });
});
