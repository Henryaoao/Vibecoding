import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import TrainingDetailScreen from "../../../app/training/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import type { ApiRequest, ApiTransportResponse } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

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

describe("TrainingDetailScreen", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: "course_1002" });
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

  it("shows loading while course detail is requested", () => {
    renderWithQuery(<TrainingDetailScreen />);

    expect(screen.getByText("正在加载课程详情...")).toBeTruthy();
  });

  it("renders metadata, resource link, current progress, and incomplete state", async () => {
    renderWithQuery(<TrainingDetailScreen />);

    expect(await screen.findByText("新人产品业务导览")).toBeTruthy();
    expect(screen.getByText("必修课程")).toBeTruthy();
    expect(screen.getByText("课程资源：https://mock.projectm.local/courses/course_1002")).toBeTruthy();
    expect(screen.getByText("当前进度 45%")).toBeTruthy();
    expect(screen.getByText("尚未完成")).toBeTruthy();
  });

  it("updates progress, marks complete, and shows persisted completion timestamp", async () => {
    renderWithQuery(<TrainingDetailScreen />);

    expect(await screen.findByText("当前进度 45%")).toBeTruthy();

    fireEvent.press(screen.getByText("更新到 75%"));
    expect(await screen.findByText("当前进度 75%")).toBeTruthy();

    fireEvent.press(screen.getByText("标记完成"));
    expect(await screen.findByText("已完成")).toBeTruthy();
    expect(await screen.findByText("完成时间 2026-05-27T10:30:00+08:00")).toBeTruthy();
    expect(screen.getByText("当前进度 100%")).toBeTruthy();
  });



  it("does not downgrade an in-progress course that is already above the quick update target", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "course_1001" });

    renderWithQuery(<TrainingDetailScreen />);

    expect(await screen.findByText("当前进度 80%")).toBeTruthy();
    expect(screen.getByText("保持当前进度")).toBeTruthy();
    expect(screen.queryByText("当前进度 75%")).toBeNull();
  });

  it("shows retry feedback when detail loading fails and recovers", async () => {
    let detailRequests = 0;
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path === "/api/v1/mobile/courses/course_1002") {
        detailRequests += 1;

        if (detailRequests === 1) {
          return {
            status: 500,
            envelope: {
              code: "COURSE_DETAIL_UNAVAILABLE",
              message: "temporary course detail outage",
              data: null as T,
              request_id: "req_course_detail_retry"
            }
          };
        }
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<TrainingDetailScreen />);

    expect(await screen.findByText("课程详情加载失败，请稍后重试")).toBeTruthy();

    fireEvent.press(screen.getByText("重试"));

    expect(await screen.findByText("新人产品业务导览")).toBeTruthy();
    expect(detailRequests).toBe(2);
  });

  it("shows a not-found state for missing courses", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "missing_course" });

    renderWithQuery(<TrainingDetailScreen />);

    expect(await screen.findByText("课程不存在")).toBeTruthy();
    expect(screen.getByText("该课程可能已下架或你没有访问权限。")).toBeTruthy();
  });
});
