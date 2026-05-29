import type { ApiEnvelope } from "./envelope";

export type ApiErrorShape = {
  status: number;
  code: string;
  message: string;
  requestId?: string;
};

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code: string;
  requestId?: string;

  constructor(error: ApiErrorShape) {
    super(error.message);
    this.name = "ApiError";
    this.status = error.status;
    this.code = error.code;
    this.requestId = error.requestId;
  }
}

export function apiErrorFromEnvelope<T>(status: number, envelope: ApiEnvelope<T>) {
  return new ApiError({
    status,
    code: envelope.code,
    message: envelope.message,
    requestId: envelope.request_id
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
