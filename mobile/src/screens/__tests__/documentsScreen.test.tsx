import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import DocumentsScreen from "../../../app/(tabs)/documents";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import type { ApiRequest, ApiTransportResponse } from "@/api/client";
import { mockTransport } from "@/api/mock/transport";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn()
  }
}));

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity }
    }
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(ui, { wrapper: Wrapper });
}

describe("DocumentsScreen", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(mockTransport);
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
  });


  it("shows a retry action when document loading fails and recovers", async () => {
    let documentRequests = 0;
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path === "/api/v1/mobile/documents") {
        documentRequests += 1;

        if (documentRequests === 1) {
          return {
            status: 500,
            envelope: {
              code: "INTERNAL_ERROR",
              message: "temporary document outage",
              data: null as T,
              request_id: "req_documents_retry"
            }
          };
        }
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<DocumentsScreen />);

    expect(await screen.findByText("文档中心加载失败，请稍后重试")).toBeTruthy();

    fireEvent.press(screen.getByText("重试"));

    expect(await screen.findByText("员工手册 2026")).toBeTruthy();
    expect(documentRequests).toBe(2);
  });


  it("filters documents by backend-aligned search category tag and file type controls", async () => {
    renderWithQuery(<DocumentsScreen />);

    expect(await screen.findByText("员工手册 2026")).toBeTruthy();
    expect(screen.getByText("文档中心 · 2 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部文档")).toBeTruthy();
    expect(screen.getByText("报销材料模板")).toBeTruthy();
    expect(screen.queryByText("信息安全入门指南")).toBeNull();
    expect(screen.queryByText("无预览权限")).toBeNull();
    expect(screen.queryByLabelText("按安全合规筛选文档")).toBeNull();
    expect(screen.queryByLabelText("按安全合规筛选文档标签")).toBeNull();
    expect(screen.queryByLabelText("按DOCX筛选文档类型")).toBeNull();

    fireEvent.changeText(screen.getByLabelText("搜索文档"), "模板");
    expect(await screen.findByText("报销材料模板")).toBeTruthy();
    expect(screen.getByText("当前筛选：关键词：模板")).toBeTruthy();
    expect(screen.queryByText("员工手册 2026")).toBeNull();

    fireEvent.press(screen.getByLabelText("按财务流程筛选文档"));
    expect(await screen.findByText("报销材料模板")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("按报销筛选文档标签"));
    expect(await screen.findByText("报销材料模板")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("按XLSX筛选文档类型"));
    expect(await screen.findByText("报销材料模板")).toBeTruthy();
    expect(screen.getByText("标签：报销 / 模板")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("按PDF筛选文档类型"));
    expect(await screen.findByText("没有匹配的文档")).toBeTruthy();
    expect(screen.getByText("文档中心 · 0 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：关键词：模板 / 财务流程 / 报销 / PDF")).toBeTruthy();
    expect(screen.getByText("换个关键词、分类、标签或文件类型再试试。")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("清除文档中心筛选"));
    expect(await screen.findByText("员工手册 2026")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部文档")).toBeTruthy();
  });
  it("opens document detail when a document card is pressed", async () => {
    renderWithQuery(<DocumentsScreen />);

    fireEvent.press(await screen.findByLabelText("查看文档 员工手册 2026"));

    expect(router.push).toHaveBeenCalledWith("/documents/doc_1001");
  });
});
