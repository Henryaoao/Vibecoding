import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  archiveAdminContent,
  createAdminContent,
  deleteAdminContent,
  getAdminContent,
  publishAdminContent,
  updateAdminContent
} from "@/api/admin";
import { AdminActionConfirmation } from "@/components/AdminActionConfirmation";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import type { AdminContentItem, AdminContentType, AdminContentUpsertInput } from "@/types/domain";

const defaultDraft: AdminContentUpsertInput = {
  type: "announcement",
  title: "",
  summary: "",
  body: "",
  category: "公司公告"
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
    title: "确认发布内容",
    message: "发布后该内容将按权限对用户可见。请确认当前单条内容信息无误。",
    confirmLabel: "确认发布"
  },
  archive: {
    title: "确认归档内容",
    message: "归档后该内容将从普通用户发布列表中移除，后续可继续在 Admin 中查看。",
    confirmLabel: "确认归档"
  },
  delete: {
    title: "确认软删除内容",
    message: "软删除后该内容不再对普通用户可见，并保留审计所需记录。",
    confirmLabel: "确认软删除",
    confirmVariant: "danger"
  }
};

export default function AdminContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const contentId = Array.isArray(id) ? id[0] : id;
  const isNew = !contentId || contentId === "new";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminContentUpsertInput>(defaultDraft);
  const [record, setRecord] = useState<AdminContentItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<ConfirmationAction | null>(null);

  const query = useQuery({
    queryKey: ["mobile", "admin", "contents", contentId],
    queryFn: () => getAdminContent(contentId ?? ""),
    enabled: !isNew && Boolean(contentId)
  });

  useEffect(() => {
    if (query.data) {
      setRecord(query.data);
      setForm({
        type: query.data.type,
        title: query.data.title,
        summary: query.data.summary,
        body: query.data.body,
        category: query.data.category
      });
    }
  }, [query.data]);

  const savedRecord = record ?? query.data ?? null;
  const canMutateExisting = Boolean(savedRecord?.id && !savedRecord.deleted_at);
  const title = useMemo(() => (isNew ? "新建内容" : "编辑内容"), [isNew]);

  function updateForm(key: keyof AdminContentUpsertInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function afterMutation(nextRecord: AdminContentItem, nextNotice: string) {
    setRecord(nextRecord);
    setNotice(nextNotice);
    setConfirmationAction(null);
    queryClient.invalidateQueries({ queryKey: ["mobile", "admin", "contents"] });
    queryClient.setQueryData(["mobile", "admin", "contents", nextRecord.id], nextRecord);
  }

  const saveMutation = useMutation({
    mutationFn: () => (savedRecord ? updateAdminContent(savedRecord.id, form) : createAdminContent(form)),
    onSuccess: (nextRecord) => {
      afterMutation(nextRecord, savedRecord ? "内容已更新" : "草稿已保存");
      if (isNew) {
        router.replace(`/admin/contents/${nextRecord.id}` as Href);
      }
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => publishAdminContent(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "内容已发布")
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveAdminContent(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "内容已归档")
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminContent(savedRecord?.id ?? ""),
    onSuccess: (nextRecord) => afterMutation(nextRecord, "内容已软删除")
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
    return <LoadingState label="正在加载内容详情..." />;
  }

  if (query.error) {
    return <ErrorState message="内容详情加载失败" retrying={query.isFetching} onRetry={() => query.refetch()} />;
  }

  return (
    <Screen>
      <PageHeader title={title} subtitle="移动端 Admin 第一版只支持单条内容操作。" />
      <Card>
        <Text style={styles.label}>内容类型</Text>
        <TextInput
          accessibilityLabel="内容类型"
          style={styles.input}
          value={form.type}
          onChangeText={(value) => updateForm("type", value as AdminContentType)}
        />
        <Text style={styles.label}>标题</Text>
        <TextInput placeholder="标题" style={styles.input} value={form.title} onChangeText={(value) => updateForm("title", value)} />
        <Text style={styles.label}>摘要</Text>
        <TextInput placeholder="摘要" style={styles.input} value={form.summary} onChangeText={(value) => updateForm("summary", value)} />
        <Text style={styles.label}>正文</Text>
        <TextInput
          placeholder="正文"
          multiline
          style={[styles.input, styles.textarea]}
          value={form.body}
          onChangeText={(value) => updateForm("body", value)}
        />
        <Text style={styles.label}>分类</Text>
        <TextInput
          accessibilityLabel="分类"
          style={styles.input}
          value={form.category}
          onChangeText={(value) => updateForm("category", value)}
        />
      </Card>

      <Card>
        <Text style={styles.status}>状态：{savedRecord?.status ?? "draft"}</Text>
        {savedRecord?.deleted_at ? <Text style={styles.danger}>已软删除</Text> : null}
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
  textarea: {
    minHeight: 96,
    paddingTop: spacing.md,
    textAlignVertical: "top"
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
