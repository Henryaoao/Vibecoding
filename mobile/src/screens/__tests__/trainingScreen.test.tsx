import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import TrainingScreen from "../../../app/(tabs)/training";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import type { ApiRequest, ApiTransportResponse } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn()
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

describe("TrainingScreen", () => {
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

  it("shows loading while courses are requested", () => {
    renderWithQuery(<TrainingScreen />);

    expect(screen.getByText("正在加载培训...")).toBeTruthy();
  });

  it("shows an empty state when no courses are available", async () => {
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path === "/api/v1/mobile/courses") {
        return {
          status: 200,
          envelope: {
            code: "OK",
            message: "success",
            data: [] as T,
            request_id: "req_empty_courses"
          }
        };
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<TrainingScreen />);

    expect(await screen.findByText("暂无课程")).toBeTruthy();
  });

  it("opens course detail when a course card is pressed", async () => {
    renderWithQuery(<TrainingScreen />);

    expect(await screen.findByText("培训中心 · 3 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部课程 · 进度高优先")).toBeTruthy();
    fireEvent.press(await screen.findByLabelText("查看课程 信息安全与账号保护"));

    expect(router.push).toHaveBeenCalledWith("/training/course_1001");
  });

  it("filters, sorts, and resets course list state", async () => {
    renderWithQuery(<TrainingScreen />);

    expect(await screen.findByText("信息安全与账号保护")).toBeTruthy();

    fireEvent.press(screen.getByText("未完成"));
    expect(await screen.findByText("培训中心 · 3 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：未完成")).toBeTruthy();

    fireEvent.press(screen.getByText("进度低优先"));
    expect(screen.getByText("当前筛选：未完成 / 进度从低到高")).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText("搜索课程"), "业务");
    expect(await screen.findByText("新人产品业务导览")).toBeTruthy();
    expect(screen.getByText("培训中心 · 1 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：关键词：业务 / 未完成 / 进度从低到高")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("清除培训中心筛选"));
    expect(await screen.findByText("信息安全与账号保护")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部课程 · 进度高优先")).toBeTruthy();
  });

  it("shows a retry action when course loading fails and recovers", async () => {
    let courseRequests = 0;
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path === "/api/v1/mobile/courses") {
        courseRequests += 1;

        if (courseRequests === 1) {
          return {
            status: 503,
            envelope: {
              code: "COURSES_UNAVAILABLE",
              message: "temporary course outage",
              data: null as T,
              request_id: "req_courses_retry"
            }
          };
        }
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<TrainingScreen />);

    expect(await screen.findByText("培训中心加载失败，请稍后重试")).toBeTruthy();

    fireEvent.press(screen.getByText("重试"));

    expect(await screen.findByText("信息安全与账号保护")).toBeTruthy();
    expect(courseRequests).toBe(2);
  });
});
