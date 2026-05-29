import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { Linking } from "react-native";

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///cache/",
  documentDirectory: "file:///documents/",
  createDownloadResumable: jest.fn(),
  downloadAsync: jest.fn()
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn()
}));

const FileSystem = jest.requireMock("expo-file-system/legacy") as {
  cacheDirectory: string | null;
  documentDirectory: string | null;
  createDownloadResumable: jest.MockedFunction<(
    url: string,
    destination: string,
    options: Record<string, never>,
    onProgress?: (event: { totalBytesWritten: number; totalBytesExpectedToWrite?: number }) => void
  ) => { downloadAsync: jest.MockedFunction<() => Promise<{ uri: string; status: number; headers: Record<string, string> }>> }>;
  downloadAsync: jest.MockedFunction<() => Promise<{ uri: string; status: number; headers: Record<string, string> }>>;
};

const Sharing = jest.requireMock("expo-sharing") as {
  isAvailableAsync: jest.MockedFunction<() => Promise<boolean>>;
  shareAsync: jest.MockedFunction<() => Promise<void>>;
};
import {
  configureFileCapabilities,
  downloadFileFallback,
  openPreviewUrl,
  resetFileCapabilities,
  UnsupportedPreviewError
} from "../preview";

describe("file preview capabilities", () => {
  afterEach(() => {
    resetFileCapabilities();
    FileSystem.cacheDirectory = "file:///cache/";
    FileSystem.documentDirectory = "file:///documents/";
    FileSystem.createDownloadResumable.mockReset();
    FileSystem.downloadAsync.mockReset();
    Sharing.isAvailableAsync.mockReset();
    Sharing.shareAsync.mockReset();
    jest.restoreAllMocks();
  });

  it("opens supported short-lived preview URLs with the system URL handler", async () => {
    const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    await openPreviewUrl({
      previewUrl: "https://mock.projectm.local/previews/doc_1001?expires=900",
      mimeType: "application/pdf"
    });

    expect(openUrl).toHaveBeenCalledWith("https://mock.projectm.local/previews/doc_1001?expires=900");
  });



  it.each(["http://mock.projectm.local/previews/doc_1001", "projectm://documents/doc_1001"])(
    "rejects unsafe preview URL schemes before opening %s",
    async (previewUrl) => {
      const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

      await expect(
        openPreviewUrl({
          previewUrl,
          mimeType: "application/pdf"
        })
      ).rejects.toThrow("Only HTTPS file URLs are supported");

      expect(openUrl).not.toHaveBeenCalled();
    }
  );

  it("rejects unsupported preview types before opening raw URLs", async () => {
    const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    await expect(
      openPreviewUrl({
        previewUrl: "https://mock.projectm.local/previews/doc_1002?expires=900",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
    ).rejects.toBeInstanceOf(UnsupportedPreviewError);

    expect(openUrl).not.toHaveBeenCalled();
  });


  it("passes typed progress updates from injectable download handlers", async () => {
    const events: unknown[] = [];
    const file = {
      downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    };
    const download = jest.fn(
      async (
        _file: typeof file,
        context?: {
          onProgress?: (event: { status: "progress"; loadedBytes: number; totalBytes?: number }) => void;
        }
      ) => {
        context?.onProgress?.({ status: "progress", loadedBytes: 512, totalBytes: 1024 });
      }
    );
    configureFileCapabilities({ download });

    await downloadFileFallback(file, {
      onProgress: (event) => events.push(event)
    });

    expect(download).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        onProgress: expect.any(Function)
      })
    );
    expect(events).toEqual([
      { status: "starting", fileName: "employee-handbook-2026.pdf", mimeType: "application/pdf" },
      {
        status: "progress",
        fileName: "employee-handbook-2026.pdf",
        mimeType: "application/pdf",
        loadedBytes: 512,
        totalBytes: 1024,
        progress: 0.5
      },
      { status: "completed", fileName: "employee-handbook-2026.pdf", mimeType: "application/pdf" }
    ]);
  });

  it("reports failed downloads before rethrowing", async () => {
    const error = new Error("download unavailable");
    const events: unknown[] = [];
    const file = {
      downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    };
    const download = jest.fn(async () => {
      throw error;
    });
    configureFileCapabilities({ download });

    await expect(
      downloadFileFallback(file, {
        onProgress: (event) => events.push(event)
      })
    ).rejects.toThrow("download unavailable");

    expect(events).toEqual([
      { status: "starting", fileName: "employee-handbook-2026.pdf", mimeType: "application/pdf" },
      { status: "failed", fileName: "employee-handbook-2026.pdf", mimeType: "application/pdf", error }
    ]);
  });

  it("downloads files to Expo cache and offers the local file through system sharing", async () => {
    const events: unknown[] = [];
    const downloadAsync = jest.fn(async () => ({ uri: "file:///cache/employee-handbook-2026.pdf", status: 200, headers: {} }));
    FileSystem.createDownloadResumable.mockImplementation((_url, _destination, _options, onProgress) => {
      onProgress?.({ totalBytesWritten: 256, totalBytesExpectedToWrite: 1024 });
      return { downloadAsync };
    });
    Sharing.isAvailableAsync.mockResolvedValue(true);
    Sharing.shareAsync.mockResolvedValue(undefined);

    await downloadFileFallback(
      {
        downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
        fileName: "employee handbook 2026.pdf",
        mimeType: "application/pdf"
      },
      { onProgress: (event) => events.push(event) }
    );

    expect(FileSystem.createDownloadResumable).toHaveBeenCalledWith(
      "https://mock.projectm.local/downloads/doc_1001?expires=900",
      "file:///cache/employee-handbook-2026.pdf",
      {},
      expect.any(Function)
    );
    expect(downloadAsync).toHaveBeenCalledTimes(1);
    expect(Sharing.isAvailableAsync).toHaveBeenCalledTimes(1);
    expect(Sharing.shareAsync).toHaveBeenCalledWith("file:///cache/employee-handbook-2026.pdf", {
      dialogTitle: "Open employee handbook 2026.pdf",
      mimeType: "application/pdf"
    });
    expect(events).toEqual([
      { status: "starting", fileName: "employee handbook 2026.pdf", mimeType: "application/pdf" },
      {
        status: "progress",
        fileName: "employee handbook 2026.pdf",
        mimeType: "application/pdf",
        loadedBytes: 256,
        totalBytes: 1024,
        progress: 0.25
      },
      { status: "completed", fileName: "employee handbook 2026.pdf", mimeType: "application/pdf" }
    ]);
  });

  it.each([404, 500])("fails closed when Expo file download resolves with non-success status %i", async (status) => {
    const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    const errorEvents: unknown[] = [];
    const downloadAsync = jest.fn(async () => ({ uri: "file:///cache/employee-handbook-2026.pdf", status, headers: {} }));
    FileSystem.createDownloadResumable.mockImplementation((_url, _destination, _options, onProgress) => {
      onProgress?.({ totalBytesWritten: 256, totalBytesExpectedToWrite: 1024 });
      return { downloadAsync };
    });
    Sharing.isAvailableAsync.mockResolvedValue(true);

    await expect(
      downloadFileFallback(
        {
          downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
          fileName: "employee-handbook-2026.pdf",
          mimeType: "application/pdf"
        },
        { onProgress: (event) => errorEvents.push(event) }
      )
    ).rejects.toThrow(`Download failed with status ${status}`);

    expect(Sharing.isAvailableAsync).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    expect(openUrl).not.toHaveBeenCalled();
    expect(errorEvents).toEqual([
      { status: "starting", fileName: "employee-handbook-2026.pdf", mimeType: "application/pdf" },
      {
        status: "progress",
        fileName: "employee-handbook-2026.pdf",
        mimeType: "application/pdf",
        loadedBytes: 256,
        totalBytes: 1024,
        progress: 0.25
      },
      expect.objectContaining({
        status: "failed",
        fileName: "employee-handbook-2026.pdf",
        mimeType: "application/pdf",
        error: expect.any(Error)
      })
    ]);
  });



  it("rejects unsafe download URLs before using Expo or Linking fallbacks", async () => {
    const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    await expect(
      downloadFileFallback({
        downloadUrl: "projectm://downloads/doc_1001",
        fileName: "employee-handbook-2026.pdf",
        mimeType: "application/pdf"
      })
    ).rejects.toThrow("Only HTTPS file URLs are supported");

    expect(FileSystem.createDownloadResumable).not.toHaveBeenCalled();
    expect(openUrl).not.toHaveBeenCalled();
  });

  it("falls back to opening the remote URL when Expo file storage is unavailable", async () => {
    const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    FileSystem.cacheDirectory = null;
    FileSystem.documentDirectory = null;

    await downloadFileFallback({
      downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    });

    expect(FileSystem.createDownloadResumable).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    expect(openUrl).toHaveBeenCalledWith("https://mock.projectm.local/downloads/doc_1001?expires=900");
  });

  it("falls back to opening the remote URL when system sharing is unavailable after download", async () => {
    const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    FileSystem.createDownloadResumable.mockReturnValue({
      downloadAsync: jest.fn(async () => ({ uri: "file:///cache/employee-handbook-2026.pdf", status: 200, headers: {} }))
    });
    Sharing.isAvailableAsync.mockResolvedValue(false);

    await downloadFileFallback({
      downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    });

    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    expect(openUrl).toHaveBeenCalledWith("https://mock.projectm.local/downloads/doc_1001?expires=900");
  });

  it("uses an injectable download fallback handler without native file dependencies", async () => {
    const download = jest.fn<(file: { downloadUrl: string; fileName: string; mimeType: string }) => Promise<void>>().mockResolvedValue(undefined);
    configureFileCapabilities({ download });

    await downloadFileFallback({
      downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    });

    expect(download).toHaveBeenCalledWith({
      downloadUrl: "https://mock.projectm.local/downloads/doc_1001?expires=900",
      fileName: "employee-handbook-2026.pdf",
      mimeType: "application/pdf"
    });
  });
});
