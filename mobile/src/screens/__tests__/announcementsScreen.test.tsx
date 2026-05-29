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
import AnnouncementsScreen from "../../../app/modules/announcements";
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

describe("AnnouncementsScreen", () => {
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

  it("renders announcement cards with pinned important category department validity and read count", async () => {
    renderWithQuery(<AnnouncementsScreen />);

    expect(await screen.findByText("端午节办公区开放安排")).toBeTruthy();
    expect(screen.getByText("公司公告墙 · 3 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部公告")).toBeTruthy();
    expect(screen.getByText("置顶 · 重要")).toBeTruthy();
    expect(screen.getByText("办公通知 · 行政部")).toBeTruthy();
    expect(
      screen.getByText("有效期 2026-05-27 至 2026-06-10 · 阅读 128"),
    ).toBeTruthy();
    expect(screen.queryByText("草稿：办公区施工提醒")).toBeNull();
  });

  it("searches and filters by category while expired published announcements remain visible", async () => {
    renderWithQuery(<AnnouncementsScreen />);

    expect(await screen.findByText("端午节办公区开放安排")).toBeTruthy();

    fireEvent.changeText(
      screen.getByPlaceholderText("搜索标题、摘要、正文或部门"),
      "财务共享中心",
    );

    expect(await screen.findByText("报销材料提交提醒")).toBeTruthy();
    expect(screen.getByText("当前筛选：关键词：财务共享中心")).toBeTruthy();
    expect(screen.getByText("已过期，仍可查询")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("按制度提醒筛选公告"));

    expect(await screen.findByText("报销材料提交提醒")).toBeTruthy();
    expect(screen.getByText("公司公告墙 · 1 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：关键词：财务共享中心 / 分类：制度提醒")).toBeTruthy();
    expect(screen.queryByText("端午节办公区开放安排")).toBeNull();

    fireEvent.press(screen.getByLabelText("清除公司公告墙筛选"));
    expect(await screen.findByText("端午节办公区开放安排")).toBeTruthy();
  });

  it("unifies active summary sorting empty copy and reset controls", async () => {
    renderWithQuery(<AnnouncementsScreen />);

    expect(await screen.findByText("端午节办公区开放安排")).toBeTruthy();
    expect(screen.getAllByText("当前筛选：全部公告 / 排序：最新优先")).toHaveLength(1);
    expect(screen.getAllByLabelText("公告按最新优先排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("公告按阅读最多排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("重置公告筛选和排序")).toHaveLength(1);

    fireEvent.press(screen.getByLabelText("公告按阅读最多排序"));
    expect(screen.getAllByText("当前筛选：全部公告 / 排序：阅读最多")).toHaveLength(1);

    fireEvent.changeText(screen.getByPlaceholderText("搜索标题、摘要、正文或部门"), "不存在的公告");
    expect(await screen.findByText("没有匹配的公告")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("重置公告筛选和排序"));
    expect(await screen.findByText("端午节办公区开放安排")).toBeTruthy();
    expect(screen.getAllByText("当前筛选：全部公告 / 排序：最新优先")).toHaveLength(1);
  });

  it("opens detail without exposing parked favorite controls", async () => {
    renderWithQuery(<AnnouncementsScreen />);

    expect(await screen.findByText("福利体检预约通知")).toBeTruthy();

    expect(screen.queryByLabelText(/收藏/)).toBeNull();
    expect(screen.queryByText(/收藏|已收藏/)).toBeNull();

    fireEvent.press(screen.getByLabelText("查看公告 福利体检预约通知"));
    expect(router.push).toHaveBeenCalledWith(
      "/announcements/announcement_1002",
    );
  });
});
