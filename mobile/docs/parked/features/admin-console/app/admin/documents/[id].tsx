import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  archiveAdminDocument,
  createAdminDocument,
  deleteAdminDocument,
  getAdminDocument,
  publishAdminDocument,
  updateAdminDocument
} from "@/api/admin";
import { isApiError } from "@/api/errors";
import { AdminActionConfirmation } from "@/components/AdminActionConfirmation";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AdminDocumentItem, AdminDocumentUpsertInput, DocumentItem } from "@/types/domain";

const defaultDraft: AdminDocumentUpsertInput = {
  title: "",
  category: "制度规范",
  file_type: "pdf",
  size_label: ""
};

type ConfirmationAction = "publish" | "archive" | "delete";

const confirmationCopy: Record<
  ConfirmationAction,
  {
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant?: "primary" | "danger";
  }
> = {
  publish: {
    title: "确认发布文档",
    message: "发布后有权限的用户可查看、预览或下载该文档。请确认当前单条文档信息无误。",
    confirmLabel: "确认发布"
  },
  archive: {
    title: "确认归档文档",
    message: "归档后该文档将从普通用户文档中心发布列表中移除。",
    confirmLabel: "确认归档"
  },
  delete: {
    title: "确认软删除文档",
    message: "软删除后该文档不再对普通用户可见，并保留审计所需记录。",
    confirmLabel: "确认软删除",
    confirmVariant: "danger"
  }
};

export default function AdminDocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const documentId = Array.isArray(id) ? id[0] : id;
  const isNew = !documentId || documentId === "new";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminDocumentUpsertInput>(defaultDraft);
  const [record, setRecord] = useState<AdminDocumentItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);

  const query = useQuery({
    queryKey: ["mobile", "admin", "documents", documentId],
    queryFn: () => getAdminDocument(documentId ?? ""),
    enabled: !isNew && Boolean(documentId)
  });

  useEffect(() => {
    if (query.data) {
      setRecord(query.data);
      setForm({
        title: query.data.title,
        category: query.data.category,
        file_type: query.data.file_type,
        size_label: query.data.size_label
      });
    }
  }, [query.data]);

  const savedRecord = record ?? query.data ?? null;
  const canMutateExisting = Boolean(savedRecord?.id && !savedRecord.deleted_at);
  const title = useMemo(() => (isNew ? "新建文档" : "编辑文档"), [isNew]);

  function updateForm(key: keyof AdminDocumentUpsertInput, value: string) {
    setErrorNotice(null);
    setForm((current) => ({ ...current, [key]: key === "file_type" ? (value as DocumentItem["fileType"]) : value }));
  }

  function afterMutation(nextRecord: AdminDocumentItem, nextNotice: string) {
    setRecord(nextRecord);
    setNotice(nextNotice);
    setErrorNotice(null);
    setConfirmationAction(null);
    queryClient.invalidateQueries({ queryKey: ["mobile", "admin", "documents"] });
    queryClient.setQueryData(["mobile", "admin", "documents", nextRecord.id], nextRecord);
  }

  const saveMutation = useMutation({
    mutationFn: () => (savedRecord ? updateAdminDocument(savedRecord.id, form) : createAdminDocument(form)),
    onMutate: () => {
      setNotice(null);
      setErrorNotice(null);
    },
    onSuccess: (nextRecord) => {
      afterMutation(nextRecord, savedRecord ? "文档已更新" : "文档草稿已保存");
      if (isNew) {
        router.replace(`/admin/documents/${nextRecord.id}` as Href);
      }
    },
    onError: (error) => {
      setNotice(null);
      setErrorNotice(isApiError(error) ? error.message : "文档保存失败，请检查文件信息后重试");
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => publishAdminDocument(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "文档已发布")
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveAdminDocument(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "文档已归档")
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminDocument(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "文档已软删除")
  });

  const activeConfirmation = confirmationAction ? confirmationCopy[confirmationAction] : null;
  const confirmationLoading = publishMutation.isPending || archiveMutation.isPending || deleteMutation.isPending;

  function confirmProtectedAction() {
    if (confirmationAction === "publish") {
      publishMutation.mutate();
      return;
    }
    if (confirmationAction === "archive") {
      archiveMutation.mutate();
      return;
    }
    if (confirmationAction === "delete") {
      deleteMutation.mutate();
    }
  }

  if (query.isLoading) {
    return <LoadingState label="正在加载文档详情..." />;
  }

  if (query.error) {
    return <ErrorState message="文档详情加载失败" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title={title} subtitle="移动端 Admin 第一版只支持单条文档操作，不支持批量操作。" />
      <Card>
        <Text style={styles.label}>标题</Text>
        <TextInput placeholder="标题" style={styles.input} value={form.title} onChangeText={(value) => updateForm("title", value)} />
        <Text style={styles.label}>分类</Text>
        <TextInput
          accessibilityLabel="分类"
          style={styles.input}
          value={form.category}
          onChangeText={(value) => updateForm("category", value)}
        />
        <Text style={styles.label}>文件类型</Text>
        <TextInput
          accessibilityLabel="文件类型"
          style={styles.input}
          value={form.file_type}
          onChangeText={(value) => updateForm("file_type", value)}
        />
        <Text style={styles.label}>文件大小</Text>
        <TextInput
          accessibilityLabel="文件大小"
          style={styles.input}
          value={form.size_label}
          onChangeText={(value) => updateForm("size_label", value)}
        />
      </Card>

      <Card>
        <Text style={styles.status}>状态：{savedRecord?.status ?? "draft"}</Text>
        {savedRecord?.deleted_at ? <Text style={styles.danger}>已软删除</Text> : null}
        {errorNotice ? <Text style={styles.danger}>{errorNotice}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </Card>

      {activeConfirmation ? (
        <AdminActionConfirmation
          title={activeConfirmation.title}
          message={activeConfirmation.message}
          confirmLabel={activeConfirmation.confirmLabel}
          confirmVariant={activeConfirmation.confirmVariant}
          loading={confirmationLoading}
          onCancel={() => setConfirmationAction(null)}
          onConfirm={confirmProtectedAction}
        />
      ) : null}

      <View style={styles.actions}>
        <AppButton label="保存草稿" onPress={() => saveMutation.mutate()} loading={saveMutation.isPending} />
        <AppButton
          label="发布"
          disabled={!canMutateExisting}
          onPress={() => setConfirmationAction("publish")}
          loading={publishMutation.isPending}
        />
        <AppButton
          label="归档"
          variant="secondary"
          disabled={!canMutateExisting}
          onPress={() => setConfirmationAction("archive")}
          loading={archiveMutation.isPending}
        />
        <AppButton
          label="软删除"
          variant="danger"
          disabled={!canMutateExisting}
          onPress={() => setConfirmationAction("delete")}
          loading={deleteMutation.isPending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    backgroundColor: colors.background
  },
  status: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: "800"
  },
  notice: {
    color: colors.success,
    fontSize: typography.body,
    fontWeight: "700"
  },
  danger: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: "800"
  },
  actions: {
    gap: spacing.sm
  }
});
