import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import AdminCoursesScreen from "../../../app/admin/courses/index";
import AdminCourseDetailScreen from "../../../app/admin/courses/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn(() => ({ id: "admin_course_1001" }));

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

describe("Admin course management screens", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-super-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
    mockUseLocalSearchParams.mockReturnValue({ id: "admin_course_1001" });
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("shows a course management entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("进入课程管理"));
    expect(router.push).toHaveBeenCalledWith("/admin/courses");
  });

  it("lists course records and links to create/detail screens without batch controls", async () => {
    renderWithQuery(<AdminCoursesScreen />);

    expect(await screen.findByText("课程管理")).toBeTruthy();
    expect(screen.getByText("信息安全与账号保护")).toBeTruthy();
    expect(screen.queryByText("批量发布")).toBeNull();
    expect(screen.queryByText("批量归档")).toBeNull();
    expect(screen.queryByText("批量删除")).toBeNull();

    fireEvent.press(screen.getByText("新建课程"));
    expect(router.push).toHaveBeenCalledWith("/admin/courses/new");

    fireEvent.press(screen.getByText("信息安全与账号保护"));
    expect(router.push).toHaveBeenCalledWith("/admin/courses/admin_course_1001");
  });

  it("creates a draft and supports publish, archive, and soft-delete for one course", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminCourseDetailScreen />);

    expect(await screen.findByText("新建课程")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("标题"), "移动端信息安全必修课");
    fireEvent.changeText(screen.getByPlaceholderText("简介"), "账号、设备和文档访问安全基础。");
    fireEvent.changeText(screen.getByLabelText("必修"), "true");
    fireEvent.changeText(screen.getByLabelText("关联文档 ID"), "admin_doc_1001");
    fireEvent.changeText(screen.getByLabelText("外部课程链接"), "https://learn.projectm.local/security");
    fireEvent.press(screen.getByText("保存草稿"));

    expect(await screen.findByText("课程草稿已保存"));
    expect(screen.getByText("状态：draft")).toBeTruthy();

    fireEvent.press(screen.getByText("发布"));
    expect(screen.getByText("确认发布课程")).toBeTruthy();
    expect(screen.getByText("状态：draft")).toBeTruthy();
    fireEvent.press(screen.getByText("取消"));
    expect(screen.queryByText("确认发布课程")).toBeNull();
    expect(screen.getByText("状态：draft")).toBeTruthy();

    fireEvent.press(screen.getByText("发布"));
    fireEvent.press(screen.getByText("确认发布"));
    await waitFor(() => expect(screen.getByText("状态：published")).toBeTruthy());

    fireEvent.press(screen.getByText("归档"));
    expect(screen.getByText("确认归档课程")).toBeTruthy();
    expect(screen.getByText("状态：published")).toBeTruthy();
    fireEvent.press(screen.getByText("确认归档"));
    await waitFor(() => expect(screen.getByText("状态：archived")).toBeTruthy());

    fireEvent.press(screen.getByText("软删除"));
    expect(screen.getByText("确认软删除课程")).toBeTruthy();
    expect(screen.getByText("状态：archived")).toBeTruthy();
    fireEvent.press(screen.getByText("确认软删除"));
    await waitFor(() => expect(screen.getByText("已软删除")).toBeTruthy());
  });
});
