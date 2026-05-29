import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import DocumentDetailScreen from "../../../app/documents/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import type { ApiRequest, ApiTransportResponse } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";
import { configureFileCapabilities, resetFileCapabilities } from "@/files/preview";

const mockUseLocalSearchParams = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(),
    replace: jest.fn()
  }
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

describe("DocumentDetailScreen", () => {
  beforeEach(() => {
    resetMockTransportState();
    mockUseLocalSearchParams.mockReturnValue({ id: "doc_1001" });
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(mockTransport);
    resetFileCapabilities();
  });

  afterEach(() => {
    resetMockTransportState();
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetFileCapabilities();
  });

  it("renders document metadata and generates a preview without exposing the raw URL", async () => {
    renderWithQuery(<DocumentDetailScreen />);

    expect(await screen.findByText("员工手册 2026")).toBeTruthy();
    expect(screen.getByText("制度规范 · PDF · 2.4 MB")).toBeTruthy();

    fireEvent.press(screen.getByText("生成预览"));

    expect(await screen.findByText(/预览链接已生成/)).toBeTruthy();
    expect(screen.queryByText(/https:\/\/mock\.projectm\.local/)).toBeNull();
  });


  it("shows retry feedback when preview generation fails and then succeeds", async () => {
    let previewRequests = 0;
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path === "/api/v1/documents/doc_1001/preview-url") {
        previewRequests += 1;

        if (previewRequests === 1) {
          return {
            status: 503,
            envelope: {
              code: "PREVIEW_UNAVAILABLE",
              message: "preview service unavailable",
              data: null as T,
              request_id: "req_preview_retry"
            }
          };
        }
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<DocumentDetailScreen />);

    expect(await screen.findByText("员工手册 2026")).toBeTruthy();

    fireEvent.press(screen.getByText("生成预览"));

    expect(await screen.findByText("preview service unavailable")).toBeTruthy();

    expect(screen.getByText("下载文件")).toBeTruthy();

    fireEvent.press(screen.getByText("重试生成预览"));

    expect(await screen.findByText(/预览链接已生成/)).toBeTruthy();
    expect(previewRequests).toBe(2);
  });

  it("renders resource unavailable without metadata/actions for unauthorized direct-open documents", async () => {
    const sensitiveRequests: string[] = [];
    mockUseLocalSearchParams.mockReturnValue({ id: "doc_1003" });
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path.includes("/preview-url") || request.path.includes("/download")) {
        sensitiveRequests.push(request.path);
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<DocumentDetailScreen />);

    expect(await screen.findByText("文档不存在")).toBeTruthy();
    expect(screen.queryByText("信息安全入门指南")).toBeNull();
    expect(screen.queryByText("安全合规")).toBeNull();
    expect(screen.queryByText("入职必读")).toBeNull();
    expect(screen.queryByText("DOCX")).toBeNull();
    expect(screen.queryByText("1.1 MB")).toBeNull();
    expect(screen.queryByText("2026-05-16")).toBeNull();
    expect(screen.queryByText("生成预览")).toBeNull();
    expect(screen.queryByText("下载文件")).toBeNull();
    expect(sensitiveRequests).toHaveLength(0);
  });

  it("opens authorized previews through the injected handler and offers download fallback", async () => {
    const open = jest.fn<(file: { previewUrl: string; fileName: string; mimeType: string }) => Promise<void>>().mockRejectedValue(new Error("system preview unavailable"));
    const download = jest.fn<(file: { downloadUrl: string; fileName: string; mimeType: string }) => Promise<void>>().mockResolvedValue(undefined);
    configureFileCapabilities({ open, download });

    renderWithQuery(<DocumentDetailScreen />);

    expect(await screen.findByText("员工手册 2026")).toBeTruthy();
    fireEvent.press(screen.getByText("生成预览"));
    expect(await screen.findByText(/预览链接已生成/)).toBeTruthy();

    fireEvent.press(screen.getByText("打开预览"));
    expect(await screen.findByText("系统预览打开失败，请重试或使用下载。")).toBeTruthy();
    expect(screen.getByText("下载文件")).toBeTruthy();

    fireEvent.press(screen.getByText("下载文件"));
    expect(await screen.findByText("下载链接已准备，将通过系统能力保存或打开。")).toBeTruthy();
    expect(open).toHaveBeenCalledWith({
      previewUrl: expect.stringContaining("/previews/doc_1001"),
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    });
    expect(download).toHaveBeenCalledWith({
      downloadUrl: expect.stringContaining("/downloads/doc_1001"),
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    }, expect.objectContaining({ onProgress: expect.any(Function) }));
  });

  it("shows download progress while the fallback is preparing", async () => {
    let resolveDownload: (() => void) | undefined;
    const download = jest
      .fn<
        (
          file: { downloadUrl: string; fileName: string; mimeType: string },
          context?: { onProgress?: (event: { status: "progress"; loadedBytes: number; totalBytes?: number }) => void }
        ) => Promise<void>
      >()
      .mockImplementation((_file, context) => new Promise<void>((resolve) => {
        context?.onProgress?.({ status: "progress", loadedBytes: 512, totalBytes: 1024 });
        resolveDownload = resolve;
      }));
    configureFileCapabilities({ download });

    renderWithQuery(<DocumentDetailScreen />);

    expect(await screen.findByText("员工手册 2026")).toBeTruthy();
    fireEvent.press(screen.getByText("生成预览"));
    expect(await screen.findByText(/预览链接已生成/)).toBeTruthy();

    fireEvent.press(screen.getByText("下载文件"));

    expect(await screen.findByText("正在准备下载链接...")).toBeTruthy();
    expect(await screen.findByText("下载进度：50%")).toBeTruthy();
    expect(screen.getByText("下载过程较大或耗时较长时，请保持本页打开。")).toBeTruthy();

    await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
    await act(async () => {
      resolveDownload?.();
    });
    expect(await screen.findByText("下载链接已准备，将通过系统能力保存或打开。")).toBeTruthy();
    expect(screen.queryByText("正在准备下载链接...")).toBeNull();
  });

  it("shows a retry action after a failed download and succeeds on retry", async () => {
    const download = jest
      .fn<(file: { downloadUrl: string; fileName: string; mimeType: string }) => Promise<void>>()
      .mockRejectedValueOnce(new Error("file service timeout"))
      .mockResolvedValueOnce(undefined);
    configureFileCapabilities({ download });

    renderWithQuery(<DocumentDetailScreen />);

    expect(await screen.findByText("员工手册 2026")).toBeTruthy();
    fireEvent.press(screen.getByText("生成预览"));
    expect(await screen.findByText(/预览链接已生成/)).toBeTruthy();

    fireEvent.press(screen.getByText("下载文件"));

    expect(await screen.findByText("下载准备失败，请稍后重试。")).toBeTruthy();
    expect(screen.getByText("重试下载文件")).toBeTruthy();
    expect(screen.queryByText("正在准备下载链接...")).toBeNull();

    fireEvent.press(screen.getByText("重试下载文件"));

    await waitFor(() => expect(download).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("下载链接已准备，将通过系统能力保存或打开。")).toBeTruthy();
  });

  it("does not request or expose file metadata for unauthorized documents", async () => {
    const sensitiveRequests: string[] = [];
    mockUseLocalSearchParams.mockReturnValue({ id: "doc_1003" });
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path.includes("/preview-url") || request.path.includes("/download")) {
        sensitiveRequests.push(request.path);
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<DocumentDetailScreen />);

    expect(await screen.findByText("文档不存在")).toBeTruthy();
    expect(screen.queryByText("信息安全入门指南")).toBeNull();
    expect(screen.queryByText("安全合规")).toBeNull();
    expect(screen.queryByText("入职必读")).toBeNull();
    expect(screen.queryByText("DOCX")).toBeNull();
    expect(screen.queryByText("1.1 MB")).toBeNull();
    expect(screen.queryByText("2026-05-16")).toBeNull();
    expect(screen.queryByText("生成预览")).toBeNull();
    expect(screen.queryByText("下载文件")).toBeNull();
    expect(screen.queryByText(/security-onboarding-guide|employee-handbook|\.pdf|application\//)).toBeNull();
    expect(sensitiveRequests).toHaveLength(0);
  });

});
