import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import AdminDocumentsScreen from "../../../app/admin/documents/index";
import AdminDocumentDetailScreen from "../../../app/admin/documents/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn(() => ({ id: "admin_doc_1001" }));

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

describe("Admin document management screens", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-super-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
    mockUseLocalSearchParams.mockReturnValue({ id: "admin_doc_1001" });
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("shows a document management entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("进入文档管理"));
    expect(router.push).toHaveBeenCalledWith("/admin/documents");
  });

  it("lists document records and links to create/detail screens", async () => {
    renderWithQuery(<AdminDocumentsScreen />);

    expect(await screen.findByText("文档管理")).toBeTruthy();
    expect(screen.getByText("员工手册 2026")).toBeTruthy();

    fireEvent.press(screen.getByText("新建文档"));
    expect(router.push).toHaveBeenCalledWith("/admin/documents/new");

    fireEvent.press(screen.getByText("员工手册 2026"));
    expect(router.push).toHaveBeenCalledWith("/admin/documents/admin_doc_1001");
  });


  it("surfaces unsupported file type validation without reporting save success", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminDocumentDetailScreen />);

    expect(await screen.findByText("新建文档")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("标题"), "移动端安装程序");
    fireEvent.changeText(screen.getByLabelText("分类"), "制度规范");
    fireEvent.changeText(screen.getByLabelText("文件类型"), "exe");
    fireEvent.changeText(screen.getByLabelText("文件大小"), "51 MB");
    fireEvent.press(screen.getByText("保存草稿"));

    expect(await screen.findByText(/仅支持 pdf、docx、xlsx、pptx 文件/)).toBeTruthy();
    expect(screen.queryByText("文档草稿已保存")).toBeNull();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("surfaces over-limit file size validation without reporting save success", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminDocumentDetailScreen />);

    expect(await screen.findByText("新建文档")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("标题"), "移动端培训资料");
    fireEvent.changeText(screen.getByLabelText("分类"), "制度规范");
    fireEvent.changeText(screen.getByLabelText("文件类型"), "pdf");
    fireEvent.changeText(screen.getByLabelText("文件大小"), "50.1 MB");
    fireEvent.press(screen.getByText("保存草稿"));

    expect(await screen.findByText("单个文件大小不能超过 50 MB")).toBeTruthy();
    expect(screen.queryByText("文档草稿已保存")).toBeNull();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("creates a draft and supports publish, archive, and soft-delete for one document", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminDocumentDetailScreen />);

    expect(await screen.findByText("新建文档")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("标题"), "移动端报销材料模板");
    fireEvent.changeText(screen.getByLabelText("分类"), "财务流程");
    fireEvent.changeText(screen.getByLabelText("文件类型"), "pdf");
    fireEvent.changeText(screen.getByLabelText("文件大小"), "420 KB");
    fireEvent.press(screen.getByText("保存草稿"));

    expect(await screen.findByText("文档草稿已保存"));
    expect(screen.getByText("状态：draft")).toBeTruthy();

    fireEvent.press(screen.getByText("发布"));
    expect(screen.getByText("确认发布文档")).toBeTruthy();
    expect(screen.getByText("状态：draft")).toBeTruthy();
    fireEvent.press(screen.getByText("取消"));
    expect(screen.queryByText("确认发布文档")).toBeNull();
    expect(screen.getByText("状态：draft")).toBeTruthy();

    fireEvent.press(screen.getByText("发布"));
    fireEvent.press(screen.getByText("确认发布"));
    await waitFor(() => expect(screen.getByText("状态：published")).toBeTruthy());

    fireEvent.press(screen.getByText("归档"));
    expect(screen.getByText("确认归档文档")).toBeTruthy();
    expect(screen.getByText("状态：published")).toBeTruthy();
    fireEvent.press(screen.getByText("确认归档"));
    await waitFor(() => expect(screen.getByText("状态：archived")).toBeTruthy());

    fireEvent.press(screen.getByText("软删除"));
    expect(screen.getByText("确认软删除文档")).toBeTruthy();
    expect(screen.getByText("状态：archived")).toBeTruthy();
    fireEvent.press(screen.getByText("确认软删除"));
    await waitFor(() => expect(screen.getByText("已软删除")).toBeTruthy());
  });

});
