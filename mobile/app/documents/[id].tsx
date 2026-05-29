import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { getDocument, getDocumentDownload, getDocumentPreviewUrl } from "@/api/documents";
import { ApiError } from "@/api/errors";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { canRequestPreview } from "@/features/documents/documentDetail";
import { downloadFileFallback, openPreviewUrl, UnsupportedPreviewError } from "@/files/preview";
import { goBackOrDocuments } from "@/navigation/backNavigation";
import { colors, spacing, typography } from "@/theme/tokens";

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "登录状态已失效，请重新登录后再预览。";
    }

    if (error.status === 403) {
      return "当前账号无权预览此文档。";
    }

    return error.message;
  }

  return "预览链接生成失败，请稍后重试。";
}

function openErrorMessage(error: unknown) {
  if (error instanceof UnsupportedPreviewError) {
    return "当前文件类型不支持直接预览，请使用下载。";
  }

  return "系统预览打开失败，请重试或使用下载。";
}

function canOfferDownloadAfterPreviewError(error: unknown) {
  return !(error instanceof ApiError && (error.status === 401 || error.status === 403));
}

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const { data: document, error, isFetching, isLoading, refetch } = useQuery({
    enabled: Boolean(documentId),
    queryKey: ["mobile", "documents", documentId],
    queryFn: () => getDocument(documentId ?? "")
  });
  const previewMutation = useMutation({
    mutationFn: () => {
      if (!document) {
        throw new Error("Document not found");
      }

      return getDocumentPreviewUrl(document.id);
    }
  });
  const openPreviewMutation = useMutation({
    mutationFn: () => {
      if (!previewMutation.data) {
        throw new Error("Preview URL not ready");
      }

      return openPreviewUrl({
        previewUrl: previewMutation.data.preview_url,
        fileName: previewMutation.data.file_name,
        mimeType: previewMutation.data.mime_type
      });
    }
  });
  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!document) {
        throw new Error("Document not found");
      }

      setDownloadProgress("正在准备下载链接...");
      const download = await getDocumentDownload(document.id);
      try {
        await downloadFileFallback({
          downloadUrl: download.download_url,
          fileName: download.file_name,
          mimeType: download.mime_type
        }, {
          onProgress: (event) => {
            if (event.status === "starting") {
              setDownloadProgress("正在准备下载链接...");
              return;
            }

            if (event.status === "progress" && typeof event.progress === "number") {
              setDownloadProgress(`下载进度：${Math.round(event.progress * 100)}%`);
              return;
            }

            if (event.status === "failed") {
              setDownloadProgress(null);
            }
          }
        });
        return download;
      } finally {
        setDownloadProgress(null);
      }
    }
  });

  if (isLoading) {
    return <LoadingState label="正在加载文档详情..." />;
  }

  if (error instanceof ApiError && error.status === 404) {
    return <EmptyState title="文档不存在" description="该文档可能已下架或你没有访问权限。" />;
  }

  if (error) {
    return <ErrorState message="文档详情加载失败，请稍后重试" retrying={isFetching} onRetry={() => refetch()} />;
  }

  if (!document) {
    return <EmptyState title="文档不存在" description="该文档可能已下架或你没有访问权限。" />;
  }

  const canPreview = canRequestPreview(document);
  const showDownloadFallback =
    canPreview &&
    (previewMutation.isSuccess ||
      (previewMutation.isError && canOfferDownloadAfterPreviewError(previewMutation.error)) ||
      openPreviewMutation.isError ||
      downloadMutation.isError);

  return (
    <Screen>
      <PageHeader title="文档详情" subtitle="预览链接由后端按权限短期生成，本页不展示原始下载地址。" />

      <Card>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.meta}>
          {document.category} · {document.fileType.toUpperCase()} · {document.sizeLabel}
        </Text>
        <Text style={styles.meta}>更新于 {document.updatedAt}</Text>
        <Text style={canPreview ? styles.allowed : styles.denied}>
          {canPreview ? "当前账号可申请短期预览链接" : "当前账号无权预览此文档"}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>文件操作</Text>
        {canPreview ? (
          <AppButton
            label="生成预览"
            loading={previewMutation.isPending}
            onPress={() => {
              openPreviewMutation.reset();
              downloadMutation.reset();
              setDownloadProgress(null);
              previewMutation.mutate();
            }}
          />
        ) : null}
        {previewMutation.isSuccess ? (
          <View style={styles.notice}>
            <Text style={styles.allowed}>预览链接已生成</Text>
            <Text style={styles.meta}>有效期至 {previewMutation.data.expires_at}</Text>
            <AppButton
              label="打开预览"
              variant="secondary"
              loading={openPreviewMutation.isPending}
              onPress={() => openPreviewMutation.mutate()}
            />
            <Text style={styles.meta}>将使用系统浏览器或文件预览能力打开短期链接。</Text>
          </View>
        ) : null}
        {openPreviewMutation.isError ? (
          <View style={styles.notice}>
            <Text style={styles.denied}>{openErrorMessage(openPreviewMutation.error)}</Text>
          </View>
        ) : null}
        {showDownloadFallback ? (
          <View style={styles.notice}>
            <AppButton
              label={downloadMutation.isError ? "重试下载文件" : "下载文件"}
              variant="secondary"
              loading={downloadMutation.isPending}
              onPress={() => downloadMutation.mutate()}
            />
            <Text style={styles.meta}>下载降级使用短期链接，不在页面展示文件名、下载地址或 mime type。</Text>
            {downloadMutation.isPending && downloadProgress ? (
              <Text style={styles.meta}>{downloadProgress}</Text>
            ) : null}
            {downloadMutation.isPending ? (
              <Text style={styles.meta}>下载过程较大或耗时较长时，请保持本页打开。</Text>
            ) : null}
          </View>
        ) : null}
        {downloadMutation.isSuccess ? (
          <View style={styles.notice}>
            <Text style={styles.allowed}>下载链接已准备，将通过系统能力保存或打开。</Text>
          </View>
        ) : null}
        {downloadMutation.isError ? (
          <View style={styles.notice}>
            <Text style={styles.denied}>下载准备失败，请稍后重试。</Text>
          </View>
        ) : null}
        {previewMutation.isError ? (
          <View style={styles.notice}>
            <Text style={styles.denied}>{errorMessage(previewMutation.error)}</Text>
            <AppButton
              label="重试生成预览"
              variant="secondary"
              loading={previewMutation.isPending}
              onPress={() => previewMutation.mutate()}
            />
          </View>
        ) : null}
        {!canPreview ? <Text style={styles.meta}>无权限文档不会申请预览或下载链接。</Text> : null}
      </Card>

      <AppButton label="返回文档列表" variant="secondary" onPress={goBackOrDocuments} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: "800"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  allowed: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700"
  },
  denied: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "700"
  },
  notice: {
    gap: spacing.xs
  }
});
