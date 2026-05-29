import { Linking } from "react-native";
import type * as ExpoFileSystem from "expo-file-system/legacy";
import type * as ExpoSharing from "expo-sharing";

export type PreviewFile = {
  previewUrl: string;
  fileName?: string;
  mimeType: string;
};

export type DownloadFile = {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
};

export type DownloadProgressEvent =
  | {
      status: "starting" | "completed";
      fileName: string;
      mimeType: string;
    }
  | {
      status: "progress";
      fileName: string;
      mimeType: string;
      loadedBytes: number;
      totalBytes?: number;
      progress?: number;
    }
  | {
      status: "failed";
      fileName: string;
      mimeType: string;
      error: unknown;
    };

export type DownloadProgressCallback = (event: DownloadProgressEvent) => void;

export type DownloadProgressInput =
  | { status: "progress"; loadedBytes: number; totalBytes?: number; progress?: number }
  | DownloadProgressEvent;

export type DownloadContext = {
  onProgress?: (event: DownloadProgressInput) => void;
};

export type DownloadOptions = {
  onProgress?: DownloadProgressCallback;
};

type ResolvedPreviewFile = PreviewFile & { fileName: string };

type FileCapabilities = {
  open: (file: ResolvedPreviewFile) => Promise<void>;
  download: (file: DownloadFile, context?: DownloadContext) => Promise<void>;
};

type ExpoDownloadProgress = {
  totalBytesWritten: number;
  totalBytesExpectedToWrite?: number;
};

export class UnsupportedPreviewError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported preview type: ${mimeType}`);
    this.name = "UnsupportedPreviewError";
  }
}

const supportedPreviewMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

function sanitizeFileName(fileName: string) {
  const sanitized = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return sanitized || "download";
}

function fileSystemModule(): typeof ExpoFileSystem {
  return require("expo-file-system/legacy") as typeof ExpoFileSystem;
}

function sharingModule(): typeof ExpoSharing {
  return require("expo-sharing") as typeof ExpoSharing;
}

function isSafeRemoteUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function assertSafeRemoteUrl(url: string) {
  if (!isSafeRemoteUrl(url)) {
    throw new Error("Only HTTPS file URLs are supported");
  }
}

function localDownloadUri(FileSystem: typeof ExpoFileSystem, fileName: string) {
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    return undefined;
  }

  return `${baseDirectory}${sanitizeFileName(fileName)}`;
}

async function shareLocalFile(file: DownloadFile, localUri: string) {
  const Sharing = sharingModule();
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    assertSafeRemoteUrl(file.downloadUrl);
    await Linking.openURL(file.downloadUrl);
    return;
  }

  await Sharing.shareAsync(localUri, {
    dialogTitle: `Open ${file.fileName}`,
    mimeType: file.mimeType
  });
}

async function downloadWithExpoFileSystem(file: DownloadFile, context?: DownloadContext) {
  assertSafeRemoteUrl(file.downloadUrl);
  let FileSystem: typeof ExpoFileSystem;

  try {
    FileSystem = fileSystemModule();
  } catch {
    assertSafeRemoteUrl(file.downloadUrl);
    await Linking.openURL(file.downloadUrl);
    return;
  }

  const destination = localDownloadUri(FileSystem, file.fileName);
  if (!destination) {
    assertSafeRemoteUrl(file.downloadUrl);
    await Linking.openURL(file.downloadUrl);
    return;
  }

  const task = FileSystem.createDownloadResumable(file.downloadUrl, destination, {}, (event: ExpoDownloadProgress) => {
    context?.onProgress?.({
      status: "progress",
      loadedBytes: event.totalBytesWritten,
      totalBytes: event.totalBytesExpectedToWrite
    });
  });
  const result = await task.downloadAsync();
  if (!result) {
    throw new Error("Download failed with status unknown");
  }

  const status = result.status;

  if (typeof status !== "number" || status < 200 || status >= 300) {
    throw new Error(`Download failed with status ${status ?? "unknown"}`);
  }

  const localUri = result.uri ?? destination;

  await shareLocalFile(file, localUri);
}

const defaultCapabilities: FileCapabilities = {
  open: async ({ previewUrl }) => {
    assertSafeRemoteUrl(previewUrl);
    await Linking.openURL(previewUrl);
  },
  download: downloadWithExpoFileSystem
};

let capabilities: FileCapabilities = { ...defaultCapabilities };

export function configureFileCapabilities(nextCapabilities: Partial<FileCapabilities>) {
  capabilities = {
    ...capabilities,
    ...nextCapabilities
  };
}

export function resetFileCapabilities() {
  const maybeMock = Linking.openURL as typeof Linking.openURL & { mockClear?: () => void };
  maybeMock.mockClear?.();
  capabilities = { ...defaultCapabilities };
}

export function canOpenPreviewMimeType(mimeType: string) {
  return supportedPreviewMimeTypes.has(mimeType);
}

export function openPreviewUrl(fileOrUrl: PreviewFile | string) {
  const file = typeof fileOrUrl === "string" ? { previewUrl: fileOrUrl, fileName: "preview.pdf", mimeType: "application/pdf" } : fileOrUrl;

  if (!canOpenPreviewMimeType(file.mimeType)) {
    return Promise.reject(new UnsupportedPreviewError(file.mimeType));
  }

  return capabilities.open({ ...file, fileName: file.fileName ?? "preview" });
}

function withDownloadFile(file: DownloadFile, event: DownloadProgressInput): DownloadProgressEvent {
  if (event.status === "progress") {
    const progress = event.progress ?? (event.totalBytes && event.totalBytes > 0 ? event.loadedBytes / event.totalBytes : undefined);

    return {
      status: "progress",
      fileName: file.fileName,
      mimeType: file.mimeType,
      loadedBytes: event.loadedBytes,
      totalBytes: event.totalBytes,
      ...(progress === undefined ? {} : { progress })
    };
  }

  return {
    ...event,
    fileName: file.fileName,
    mimeType: file.mimeType
  };
}

export async function downloadFileFallback(file: DownloadFile, options?: DownloadOptions) {
  const onProgress = options?.onProgress;

  if (!onProgress) {
    return capabilities.download(file);
  }

  onProgress({ status: "starting", fileName: file.fileName, mimeType: file.mimeType });

  try {
    await capabilities.download(file, {
      onProgress: (event) => onProgress(withDownloadFile(file, event))
    });
    onProgress({ status: "completed", fileName: file.fileName, mimeType: file.mimeType });
  } catch (error) {
    onProgress({ status: "failed", fileName: file.fileName, mimeType: file.mimeType, error });
    throw error;
  }
}
